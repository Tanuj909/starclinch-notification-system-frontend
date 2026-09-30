import axios from "axios";
import api from "../api/axios";

/**
 * Register or update Web Push subscription with Django backend.
 * This is a PUBLIC endpoint (no JWT required).
 * Must include email so the backend can link the subscription to the user.
 * @param {Object} data - { subscription_id, email, endpoint, subscription_data }
 */
export const subscribeWebPush = async (data) => {
  const response = await axios.post(
    `${import.meta.env.VITE_API_BASE_URL}/notifications/web-push/subscribe/`,
    data,
    {
      headers: { "Content-Type": "application/json" },
      timeout: 10000,
    }
  );
  return response.data;
};

/**
 * Unsubscribe Web Push subscription on Django backend (authenticated)
 * @param {string} subscriptionId
 */
export const unsubscribeWebPush = async (subscriptionId) => {
  const response = await api.delete("/notifications/web-push/unsubscribe/", {
    data: { subscription_id: subscriptionId },
  });
  return response.data;
};
