import OneSignal from "react-onesignal";

let isInitialized = false;
let initPromise = null;

/**
 * Initialize OneSignal Web SDK (Singleton)
 */
export const initOneSignal = async () => {
  if (isInitialized) {
    return;
  }

  if (initPromise) {
    return initPromise;
  }

  const appId = import.meta.env.VITE_ONESIGNAL_APP_ID;
  if (!appId) {
    console.warn("OneSignal App ID (VITE_ONESIGNAL_APP_ID) is not defined in environment.");
    return;
  }

  initPromise = (async () => {
    try {
      await OneSignal.init({
        appId,
        allowLocalhostAsSecureOrigin: true,
        notifyButton: {
          enable: false,
        },
      });
      isInitialized = true;
    } catch (error) {
      console.error("Failed to initialize OneSignal:", error);
    } finally {
      initPromise = null;
    }
  })();

  return initPromise;
};

/**
 * Get current browser notification permission status ('default' | 'granted' | 'denied')
 * @returns {NotificationPermission|string}
 */
export const getNotificationPermission = () => {
  if (typeof window !== "undefined" && "Notification" in window) {
    return window.Notification.permission;
  }
  return OneSignal.Notifications?.permission ? "granted" : "default";
};

/**
 * Request notification permission from browser before/after login
 * Only prompts if permission is not already granted or denied
 * @returns {Promise<boolean>}
 */
export const requestNotificationPermission = async () => {
  try {
    await initOneSignal();

    if (typeof window !== "undefined" && "Notification" in window) {
      if (window.Notification.permission === "granted") return true;
      if (window.Notification.permission === "denied") return false;
    }

    if (typeof OneSignal.Notifications?.requestPermission === "function") {
      await OneSignal.Notifications.requestPermission();
      return OneSignal.Notifications.permission;
    }
    return false;
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return false;
  }
};

/**
 * Associate the logged-in Django user with OneSignal.
 *
 * NOTE: OneSignal.login(externalId) is intentionally NOT called.
 * Our backend sends push notifications using the subscription_id
 * (via include_subscription_ids), not the external_id. Calling
 * OneSignal.login() causes 409 "alias claimed by another User"
 * errors when the same user logs in across sessions/devices.
 *
 * This function is kept as a no-op so callers don't need to change.
 * @param {string|number} userId
 */
export const loginOneSignalUser = async (userId) => {
  if (!userId) return;
  // No-op: external_id association is not needed for subscription_id based push
};

/**
 * Get current OneSignal push subscription ID (player identifier)
 * @returns {string|null}
 */
export const getOneSignalSubscriptionId = () => {
  try {
    return OneSignal.User?.PushSubscription?.id || null;
  } catch (error) {
    console.error("Error getting OneSignal subscription ID:", error);
    return null;
  }
};

/**
 * Get complete push subscription details (id, token, optedIn)
 * @returns {object|null}
 */
export const getOneSignalSubscriptionData = () => {
  try {
    const pushSub = OneSignal.User?.PushSubscription;
    if (!pushSub) return null;
    return {
      subscription_id: pushSub.id || null,
      token: pushSub.token || null,
      opted_in: Boolean(pushSub.optedIn),
    };
  } catch (error) {
    console.error("Error getting OneSignal subscription details:", error);
    return null;
  }
};

/**
 * Listen for OneSignal push subscription changes
 * @param {Function} callback
 */
export const addSubscriptionChangeListener = (callback) => {
  try {
    if (typeof OneSignal.User?.PushSubscription?.addEventListener === "function") {
      OneSignal.User.PushSubscription.addEventListener("change", callback);
    }
  } catch (error) {
    console.error("Error adding subscription change listener:", error);
  }
};

/**
 * Logout and clear OneSignal user association.
 * No-op since we no longer call OneSignal.login().
 */
export const logoutOneSignalUser = async () => {
  // No-op: we don't use OneSignal.login(), so nothing to logout
};

export default {
  initOneSignal,
  getNotificationPermission,
  requestNotificationPermission,
  loginOneSignalUser,
  getOneSignalSubscriptionId,
  getOneSignalSubscriptionData,
  addSubscriptionChangeListener,
  logoutOneSignalUser,
};
