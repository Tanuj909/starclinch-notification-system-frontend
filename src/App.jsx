import { useEffect } from "react";
import AppRoutes from "./routes/AppRoutes";
import OneSignal from "react-onesignal";
import { toast } from "react-toastify";
import { initOneSignal } from "./services/oneSignalService";

function App() {
  useEffect(() => {
    let isListenerAdded = false;

    const handleForegroundNotification = (event) => {
      // Prevent native browser notification
      event.preventDefault();

      const notification = event.notification;
      
      toast.info(
        <div>
          <strong className="block text-gray-900">{notification.title}</strong>
          <span className="text-sm text-gray-600">{notification.body}</span>
        </div>,
        {
          position: "top-right",
          autoClose: 5000,
          icon: "🔔"
        }
      );
    };

    const setupOneSignalListener = async () => {
      await initOneSignal();
      
      if (OneSignal.Notifications && !isListenerAdded) {
        OneSignal.Notifications.addEventListener("foregroundWillDisplay", handleForegroundNotification);
        isListenerAdded = true;
      }
    };

    setupOneSignalListener();

    return () => {
      // Cleanup listener on unmount to prevent double triggers in StrictMode
      if (OneSignal.Notifications && isListenerAdded) {
        OneSignal.Notifications.removeEventListener("foregroundWillDisplay", handleForegroundNotification);
      }
    };
  }, []);

  return <AppRoutes />;
}

export default App;