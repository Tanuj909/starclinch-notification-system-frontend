import { useState, useEffect } from "react";
import {
  createChannel,
  updateChannel,
  deleteChannel,
} from "../../services/adminService";

const PRESET_CHANNEL_CODES = [
  { label: "EMAIL (Email Delivery)", value: "EMAIL" },
  { label: "WHATSAPP (WhatsApp Business API)", value: "WHATSAPP" },
  { label: "WEB_PUSH (Web Browser Push)", value: "WEB_PUSH" },
  { label: "SMS (Text Message SMS)", value: "SMS" },
  { label: "CUSTOM (Other / Custom Channel)", value: "CUSTOM" },
];

const ChannelModal = ({
  isOpen,
  onClose,
  channel,
  onSaveSuccess,
  onDeleteSuccess,
}) => {
  const isEditing = Boolean(channel && channel.id);

  const [name, setName] = useState("");
  const [selectedPreset, setSelectedPreset] = useState("EMAIL");
  const [customCode, setCustomCode] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setError("");
      setShowDeleteConfirm(false);
      if (channel) {
        setName(channel.name || "");
        const existingCode = (channel.code || "").toUpperCase();
        setIsActive(channel.is_active ?? true);

        const isKnown = PRESET_CHANNEL_CODES.some(
          (p) => p.value !== "CUSTOM" && p.value === existingCode
        );

        if (isKnown) {
          setSelectedPreset(existingCode);
          setCustomCode("");
        } else {
          setSelectedPreset("CUSTOM");
          setCustomCode(existingCode);
        }
      } else {
        setName("");
        setSelectedPreset("EMAIL");
        setCustomCode("");
        setIsActive(true);
      }
    }
  }, [isOpen, channel]);

  if (!isOpen) return null;

  const handlePresetChange = (e) => {
    const val = e.target.value;
    setSelectedPreset(val);
    if (val !== "CUSTOM") {
      setCustomCode("");
    }
  };

  const handleCustomCodeChange = (e) => {
    const formatted = e.target.value.toUpperCase().replace(/\s+/g, "_");
    setCustomCode(formatted);
  };

  const getEffectiveCode = () => {
    if (selectedPreset === "CUSTOM") {
      return customCode.trim().toUpperCase();
    }
    return selectedPreset.trim().toUpperCase();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const effectiveCode = getEffectiveCode();

    if (!name.trim()) {
      setError("Channel Name is required.");
      return;
    }
    if (!effectiveCode) {
      setError("Channel Code is required.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: name.trim(),
        code: effectiveCode,
        is_active: isActive,
      };

      let result;
      if (isEditing) {
        result = await updateChannel(channel.id, payload);
      } else {
        result = await createChannel(payload);
      }

      onSaveSuccess(result);
      onClose();
    } catch (err) {
      console.error("Channel save error:", err);
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else if (typeof err.response?.data === "object") {
        const messages = Object.entries(err.response.data)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(" ") : v}`)
          .join(" | ");
        setError(messages || "Failed to save channel.");
      } else {
        setError("Failed to save channel. Please check inputs.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!channel?.id) return;
    setError("");
    setDeleting(true);

    try {
      await deleteChannel(channel.id);
      onDeleteSuccess(channel.id);
      onClose();
    } catch (err) {
      console.error("Channel delete error:", err);
      setError("Failed to delete channel. It might have active templates.");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden my-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-indigo-50/70 via-white to-purple-50/30">
          <div>
            <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">
              Channel Management
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mt-0.5">
              {isEditing ? `Edit Channel: ${channel.name}` : "Create New Channel"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm rounded-2xl flex items-start gap-2.5">
              <svg className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Delete Confirm */}
          {showDeleteConfirm && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl space-y-3">
              <p className="text-xs font-semibold text-red-800">
                Are you sure you want to permanently delete this notification channel?
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {deleting ? "Deleting..." : "Yes, Delete Channel"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3.5 py-1.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Channel Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. WhatsApp"
              required
              className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition-all"
            />
          </div>

          {/* Code Dropdown + Custom Input */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Channel Code <span className="text-red-500">*</span>
            </label>
            
            <div className="relative">
              <select
                value={selectedPreset}
                onChange={handlePresetChange}
                className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition-all appearance-none cursor-pointer"
              >
                {PRESET_CHANNEL_CODES.map((opt) => (
                  <option key={opt.value} value={opt.value} className="font-mono">
                    {opt.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Custom Input if 'CUSTOM' selected */}
            {selectedPreset === "CUSTOM" && (
              <div className="pt-1 animate-fade-in">
                <input
                  type="text"
                  value={customCode}
                  onChange={handleCustomCodeChange}
                  placeholder="ENTER_CUSTOM_CHANNEL (AUTO UPPERCASE)"
                  required
                  className="w-full px-3.5 py-2.5 bg-indigo-50/30 border border-indigo-200 rounded-xl text-sm font-mono font-semibold text-indigo-900 placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition-all"
                />
                <span className="text-[11px] text-indigo-600 mt-1 block">
                  Custom channel code automatically converts to UPPERCASE.
                </span>
              </div>
            )}
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between p-3.5 bg-indigo-50/40 border border-indigo-100 rounded-2xl">
            <div>
              <label className="text-sm font-semibold text-gray-900 block">
                Channel Active
              </label>
              <span className="text-xs text-gray-500">
                {isActive ? "Channel is active for delivery." : "Channel is disabled."}
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isActive}
              onClick={() => setIsActive(!isActive)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isActive ? "bg-indigo-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isActive ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-gray-100">
            <div>
              {isEditing && !showDeleteConfirm && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-3.5 py-2 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded-xl transition-all cursor-pointer"
                >
                  Delete Channel
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs sm:text-sm font-semibold rounded-xl border border-gray-200 transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md shadow-indigo-500/25 transition-all cursor-pointer disabled:opacity-60 flex items-center gap-2"
              >
                {loading ? "Saving..." : isEditing ? "Save Changes" : "Create Channel"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChannelModal;
