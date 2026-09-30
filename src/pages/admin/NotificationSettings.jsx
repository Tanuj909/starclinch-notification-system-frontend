import { useState, useEffect, useCallback } from "react";
import {
  getTriggers,
  getChannels,
  getTemplates,
  updateTemplate,
} from "../../services/adminService";
import NotificationMatrix from "../../components/admin/NotificationMatrix";
import TemplateModal from "../../components/admin/TemplateModal";
import TriggerModal from "../../components/admin/TriggerModal";
import ChannelModal from "../../components/admin/ChannelModal";

const NotificationSettings = () => {
  const [triggers, setTriggers] = useState([]);
  const [channels, setChannels] = useState([]);
  const [templates, setTemplates] = useState([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', message: string }
  const [togglingId, setTogglingId] = useState(null);

  // Template Modal State
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedTrigger, setSelectedTrigger] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState(null);

  // Trigger Modal State
  const [triggerModalOpen, setTriggerModalOpen] = useState(false);
  const [triggerToEdit, setTriggerToEdit] = useState(null);

  // Channel Modal State
  const [channelModalOpen, setChannelModalOpen] = useState(false);
  const [channelToEdit, setChannelToEdit] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [triggersRes, channelsRes, templatesRes] = await Promise.all([
        getTriggers(),
        getChannels(),
        getTemplates(),
      ]);

      setTriggers(Array.isArray(triggersRes) ? triggersRes : []);
      setChannels(Array.isArray(channelsRes) ? channelsRes : []);
      setTemplates(Array.isArray(templatesRes) ? templatesRes : []);
    } catch (err) {
      console.error("Failed to load notification settings:", err);
      setError("Unable to load notification settings. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Template Actions
  const handleCreateTemplate = (trigger, channel) => {
    setSelectedTemplate(null);
    setSelectedTrigger(trigger);
    setSelectedChannel(channel);
    setTemplateModalOpen(true);
  };

  const handleEditTemplate = (template, trigger, channel) => {
    setSelectedTemplate(template);
    setSelectedTrigger(trigger);
    setSelectedChannel(channel);
    setTemplateModalOpen(true);
  };

  const handleToggleTemplate = async (template) => {
    if (!template?.id) return;
    setTogglingId(template.id);

    try {
      const updated = await updateTemplate(template.id, {
        trigger: template.trigger,
        channel: template.channel,
        content: template.content,
        variable_mapping: template.variable_mapping,
        is_enabled: !template.is_enabled,
      });

      setTemplates((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t))
      );

      showToast(
        "success",
        `Template ${updated.is_enabled ? "enabled" : "disabled"} successfully.`
      );
    } catch (err) {
      console.error("Toggle template error:", err);
      showToast("error", "Failed to update template status.");
    } finally {
      setTogglingId(null);
    }
  };

  const handleSaveTemplateSuccess = (savedTemplate) => {
    setTemplates((prev) => {
      const exists = prev.some((t) => t.id === savedTemplate.id);
      if (exists) {
        return prev.map((t) => (t.id === savedTemplate.id ? savedTemplate : t));
      }
      return [...prev, savedTemplate];
    });
    showToast("success", "Template configuration saved successfully!");
  };

  const handleDeleteTemplateSuccess = (deletedTemplateId) => {
    setTemplates((prev) => prev.filter((t) => t.id !== deletedTemplateId));
    showToast("success", "Template deleted successfully.");
  };

  // Trigger Actions
  const handleOpenCreateTrigger = () => {
    setTriggerToEdit(null);
    setTriggerModalOpen(true);
  };

  const handleOpenEditTrigger = (trigger) => {
    setTriggerToEdit(trigger);
    setTriggerModalOpen(true);
  };

  const handleSaveTriggerSuccess = (savedTrigger) => {
    setTriggers((prev) => {
      const exists = prev.some((t) => t.id === savedTrigger.id);
      if (exists) {
        return prev.map((t) => (t.id === savedTrigger.id ? savedTrigger : t));
      }
      return [...prev, savedTrigger];
    });
    showToast("success", `Trigger "${savedTrigger.name}" saved successfully!`);
  };

  const handleDeleteTriggerSuccess = (deletedTriggerId) => {
    setTriggers((prev) => prev.filter((t) => t.id !== deletedTriggerId));
    setTemplates((prev) =>
      prev.filter((t) => Number(t.trigger) !== Number(deletedTriggerId))
    );
    showToast("success", "Trigger deleted successfully.");
  };

  // Channel Actions
  const handleOpenCreateChannel = () => {
    setChannelToEdit(null);
    setChannelModalOpen(true);
  };

  const handleOpenEditChannel = (channel) => {
    setChannelToEdit(channel);
    setChannelModalOpen(true);
  };

  const handleSaveChannelSuccess = (savedChannel) => {
    setChannels((prev) => {
      const exists = prev.some((c) => c.id === savedChannel.id);
      if (exists) {
        return prev.map((c) => (c.id === savedChannel.id ? savedChannel : c));
      }
      return [...prev, savedChannel];
    });
    showToast("success", `Channel "${savedChannel.name}" saved successfully!`);
  };

  const handleDeleteChannelSuccess = (deletedChannelId) => {
    setChannels((prev) => prev.filter((c) => c.id !== deletedChannelId));
    setTemplates((prev) =>
      prev.filter((t) => Number(t.channel) !== Number(deletedChannelId))
    );
    showToast("success", "Channel deleted successfully.");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast Banner */}
      {toast && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between shadow-lg transition-all animate-fade-in ${
            toast.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {toast.type === "success" ? (
              <svg className="w-5 h-5 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span className="text-sm font-semibold">{toast.message}</span>
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-xs font-bold text-gray-500 hover:text-gray-900 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header & CRUD Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-2 border-b border-gray-200/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Notification Settings
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage notification triggers, channels, and multi-channel delivery templates.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center flex-wrap gap-2.5">
          <button
            type="button"
            onClick={handleOpenCreateTrigger}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-semibold rounded-2xl shadow-sm transition-all active:scale-[0.98] cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Trigger</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreateChannel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold rounded-2xl shadow-sm transition-all active:scale-[0.98] cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Channel</span>
          </button>

          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white hover:bg-gray-50 text-gray-700 text-xs sm:text-sm font-semibold rounded-2xl border border-gray-200 shadow-2xs transition-all active:scale-[0.98] cursor-pointer disabled:opacity-60"
            title="Reload data"
          >
            <svg
              className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="bg-white border border-gray-200 rounded-3xl p-8 space-y-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded-md w-1/4" />
          <div className="h-12 bg-gray-100 rounded-2xl w-full" />
          <div className="h-28 bg-gray-100 rounded-2xl w-full" />
          <div className="h-28 bg-gray-100 rounded-2xl w-full" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center text-red-700 space-y-4">
          <svg className="w-10 h-10 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <h3 className="text-base font-bold">{error}</h3>
            <p className="text-xs text-red-600 mt-1">
              Check if the backend server is running and your admin credentials are valid.
            </p>
          </div>
          <button
            onClick={loadData}
            type="button"
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-semibold rounded-2xl shadow-sm transition-colors cursor-pointer"
          >
            Retry Loading
          </button>
        </div>
      ) : (
        <NotificationMatrix
          triggers={triggers}
          channels={channels}
          templates={templates}
          onEdit={handleEditTemplate}
          onCreate={handleCreateTemplate}
          onToggle={handleToggleTemplate}
          onEditTrigger={handleOpenEditTrigger}
          onEditChannel={handleOpenEditChannel}
          togglingId={togglingId}
        />
      )}

      {/* Template Modal */}
      <TemplateModal
        isOpen={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        template={selectedTemplate}
        trigger={selectedTrigger}
        channel={selectedChannel}
        onSaveSuccess={handleSaveTemplateSuccess}
        onDeleteSuccess={handleDeleteTemplateSuccess}
      />

      {/* Trigger Modal */}
      <TriggerModal
        isOpen={triggerModalOpen}
        onClose={() => setTriggerModalOpen(false)}
        trigger={triggerToEdit}
        onSaveSuccess={handleSaveTriggerSuccess}
        onDeleteSuccess={handleDeleteTriggerSuccess}
      />

      {/* Channel Modal */}
      <ChannelModal
        isOpen={channelModalOpen}
        onClose={() => setChannelModalOpen(false)}
        channel={channelToEdit}
        onSaveSuccess={handleSaveChannelSuccess}
        onDeleteSuccess={handleDeleteChannelSuccess}
      />
    </div>
  );
};

export default NotificationSettings;
