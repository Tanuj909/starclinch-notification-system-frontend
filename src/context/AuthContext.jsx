import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import {
  getUser,
  clearAuthData,
} from "../utils/storage";
import { loginUser, logoutUser } from "../services/authService";
import {
  initOneSignal,
  loginOneSignalUser,
  logoutOneSignalUser,
  requestNotificationPermission,
  getNotificationPermission,
  getOneSignalSubscriptionId,
  getOneSignalSubscriptionData,
  addSubscriptionChangeListener,
} from "../services/oneSignalService";
import {
  subscribeWebPush,
  unsubscribeWebPush,
} from "../services/notificationService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getUser());
  const lastSyncedSubIdRef = useRef(null);

  // Helper to sync device subscription with Django backend (public, no JWT needed)
  const syncSubscriptionWithBackend = useCallback(async (subscriptionId, email) => {
    if (!subscriptionId || !email) return;
    if (lastSyncedSubIdRef.current === subscriptionId) return;

    try {
      const subData = getOneSignalSubscriptionData();
      await subscribeWebPush({
        subscription_id: subscriptionId,
        email: email,
        endpoint: subData?.token || `https://onesignal.com/push/${subscriptionId}`,
        subscription_data: subData || {},
      });
      lastSyncedSubIdRef.current = subscriptionId;
    } catch (err) {
      console.error("Failed to sync Web Push subscription with backend:", err);
    }
  }, []);

  // Associate authenticated user with OneSignal and sync subscription
  const associateUserWithOneSignal = useCallback(async (userData) => {
    if (!userData?.id) return;
    try {
      await loginOneSignalUser(userData.id);
      const subId = getOneSignalSubscriptionId();
      if (subId && userData.email) {
        await syncSubscriptionWithBackend(subId, userData.email);
      }
    } catch (err) {
      console.error("Error associating user with OneSignal:", err);
    }
  }, [syncSubscriptionWithBackend]);

  // 1. Application startup: Initialize OneSignal & request permission BEFORE login
  useEffect(() => {
    const initializeAndPrompt = async () => {
      await initOneSignal();

      // Request browser notification permission before login if not already decided
      const currentPerm = getNotificationPermission();
      if (currentPerm === "default") {
        await requestNotificationPermission();
      }

      // If user is already authenticated on app launch, associate and sync
      const currentUser = getUser();
      if (currentUser?.id) {
        await associateUserWithOneSignal(currentUser);
      }

      // Listen for subscription creation/changes (e.g. user allowed permission)
      addSubscriptionChangeListener((event) => {
        const newSubId = event?.current?.id;
        const loggedInUser = getUser();
        if (newSubId && loggedInUser?.email) {
          syncSubscriptionWithBackend(newSubId, loggedInUser.email);
        }
      });
    };

    initializeAndPrompt();
  }, [associateUserWithOneSignal, syncSubscriptionWithBackend]);

  // 2. Login Flow: Sync subscription BEFORE login so backend has it when firing notification
  const login = async (email, password) => {
    // Sync OneSignal subscription with backend BEFORE login
    // so the LOGIN trigger can find it and send the Web Push
    try {
      await initOneSignal();
      const subId = getOneSignalSubscriptionId();
      console.log("[WebPush Debug] OneSignal subscription ID:", subId);
      console.log("[WebPush Debug] Browser notification permission:", window.Notification?.permission);
      if (subId) {
        console.log("[WebPush Debug] Syncing subscription with backend for email:", email);
        await syncSubscriptionWithBackend(subId, email);
        console.log("[WebPush Debug] Subscription synced successfully");
      } else {
        console.warn("[WebPush Debug] No subscription ID found — push will not work");
      }
    } catch (err) {
      console.error("Pre-login subscription sync failed (non-blocking):", err);
    }

    const data = await loginUser(email, password);
    setUser(data.user);

    if (data.user?.id) {
      await associateUserWithOneSignal(data.user);
    }

    return data;
  };

  // 3. Logout Flow: Unsubscribe on backend, logout OneSignal, logout Django
  const logout = async () => {
    try {
      // 1. Call backend logout FIRST so the LOGOUT trigger fires while the push subscription is still active
      await logoutUser();

      // 2. Now unsubscribe the Web Push on the backend
      const currentSubId = getOneSignalSubscriptionId() || lastSyncedSubIdRef.current;
      if (currentSubId) {
        try {
          await unsubscribeWebPush(currentSubId);
        } catch (subErr) {
          console.warn("Failed to deactivate subscription on backend during logout:", subErr);
        }
      }

      // 3. Clear OneSignal state
      await logoutOneSignalUser();
      lastSyncedSubIdRef.current = null;
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      clearAuthData();
      setUser(null);
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        logout,
        syncSubscriptionWithBackend,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};