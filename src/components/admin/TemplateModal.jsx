import { useState, useEffect } from "react";
import {
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from "../../services/adminService";
import VariableMappingEditor from "./VariableMappingEditor";

const TemplateModal = ({
  isOpen,
  onClose,
  template,
  trigger,
  channel,
  onSaveSuccess,
  onDeleteSuccess,
}) => {
  const isEditing = Boolean(template && template.id);
  const channelCode = channel?.code?.toUpperCase() || "EMAIL";

  // Form State
  const [isEnabled, setIsEnabled] = useState(true);
  const [variableMapping, setVariableMapping] = useState({});

  // Email state
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");

  // Web Push state
  const [webPushTitle, setWebPushTitle] = useState("");
  const [webPushBody, setWebPushBody] = useState("");

  // WhatsApp state
  const [waTemplateName, setWaTemplateName] = useState("");
  const [waLanguage, setWaLanguage] = useState("en_US");
  const [waParameters, setWaParameters] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Populate state when modal opens or template changes
  useEffect(() => {
    if (isOpen) {
      setError("");
      setShowDeleteConfirm(false);

      if (template) {
        setIsEnabled(template.is_enabled ?? true);
        setVariableMapping(template.variable_mapping || {});

        const content = template.content || {};

        if (channelCode === "EMAIL") {
          setEmailSubject(content.subject || "");
          setEmailBody(content.body || "");
        } else if (channelCode === "WEB_PUSH") {
          setWebPushTitle(content.title || "");
          setWebPushBody(content.body || "");
        } else if (channelCode === "WHATSAPP") {
          setWaTemplateName(content.template_name || "");
          setWaLanguage(content.language || "en_US");
          const params = Array.isArray(content.parameters)
            ? content.parameters.join(", ")
            : typeof content.parameters === "string"
            ? content.parameters
            : "";
          setWaParameters(params);
        }
      } else {
        // Defaults for new template
        setIsEnabled(true);
        setVariableMapping({});
        setEmailSubject("");
        setEmailBody("");
        setWebPushTitle("");
        setWebPushBody("");
        setWaTemplateName("");
        setWaLanguage("en_US");
        setWaParameters("");
      }
    }
  }, [isOpen, template, channelCode]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let contentPayload = {};

      if (channelCode === "EMAIL") {
        if (!emailSubject.trim()) {
          setError("Subject is required for Email template.");
          setLoading(false);
          return;
        }
        if (!emailBody.trim()) {
          setError("Body is required for Email template.");
          setLoading(false);
          return;
        }
        contentPayload = {
          subject: emailSubject.trim(),
          body: emailBody.trim(),
        };
      } else if (channelCode === "WEB_PUSH") {
        if (!webPushTitle.trim()) {
          setError("Title is required for Web Push template.");
          setLoading(false);
          return;
        }
        if (!webPushBody.trim()) {
          setError("Body is required for Web Push template.");
          setLoading(false);
          return;
        }
        contentPayload = {
          title: webPushTitle.trim(),
          body: webPushBody.trim(),
        };
      } else if (channelCode === "WHATSAPP") {
        if (!waTemplateName.trim()) {
          setError("WhatsApp Template Name is required.");
          setLoading(false);
          return;
        }
        // Parse parameters array
        const paramsArray = waParameters
          ? waParameters
              .split(",")
              .map((p) => p.trim())
              .filter(Boolean)
          : [];

        contentPayload = {
          template_name: waTemplateName.trim(),
          language: waLanguage.trim() || "en_US",
          parameters: paramsArray,
        };
      }

      const payload = {
        trigger: trigger.id,
        channel: channel.id,
        is_enabled: isEnabled,
        content: contentPayload,
        variable_mapping: variableMapping,
      };

      let result;
      if (isEditing) {
        result = await updateTemplate(template.id, payload);
      } else {
        result = await createTemplate(payload);
      }

      onSaveSuccess(result);
      onClose();
    } catch (err) {
      console.error(err);
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else if (typeof err.response?.data === "string") {
        setError(err.response.data);
      } else if (err.response?.data && typeof err.response.data === "object") {
        // Field error messages formatting
        const messages = Object.entries(err.response.data)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(" ") : v}`)
          .join(" | ");
        setError(messages || "Failed to save template.");
      } else {
        setError("Failed to save template. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!template?.id) return;
    setError("");
    setDeleting(true);

    try {
      await deleteTemplate(template.id);
      onDeleteSuccess(template.id);
      onClose();
    } catch (err) {
      console.error(err);
      setError("Failed to delete template. Please try again.");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden my-8 animate-fade-in">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-white">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              {isEditing ? "Edit Template" : "New Template"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {channel?.name || channelCode} • Trigger: {trigger?.name}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">
                {isEnabled ? "Active" : "Inactive"}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={isEnabled}
                onClick={() => setIsEnabled(!isEnabled)}
                className={`relative inline-flex h-6 w-11 items-center flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                  isEnabled ? "bg-purple-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm rounded-2xl flex items-start gap-2.5">
              <svg className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Delete Confirmation Banner */}
          {showDeleteConfirm && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-red-800 font-semibold text-sm">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete this notification template?
              </div>
              <p className="text-xs text-red-700">
                This will permanently remove the template for <strong>{trigger?.name}</strong> on channel <strong>{channel?.name}</strong>.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  {deleting ? "Deleting..." : "Yes, Delete Permanently"}
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



          {/* Channel Specific Fields */}

          {/* 1. EMAIL */}
          {channelCode === "EMAIL" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="e.g. Welcome {{user_name}}"
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Body <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={5}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder="Hello {{user_name}},&#10;&#10;You have successfully logged in."
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-3xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors font-sans"
                />
              </div>
            </div>
          )}

          {/* 2. WEB PUSH */}
          {channelCode === "WEB_PUSH" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Push Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={webPushTitle}
                  onChange={(e) => setWebPushTitle(e.target.value)}
                  placeholder="e.g. Security Alert: New Login"
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Push Message Body <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={webPushBody}
                  onChange={(e) => setWebPushBody(e.target.value)}
                  placeholder="e.g. Hi {{user_name}}, a login event was recorded."
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-3xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors"
                />
              </div>
            </div>
          )}

          {/* 3. WHATSAPP */}
          {channelCode === "WHATSAPP" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    WhatsApp Template Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={waTemplateName}
                    onChange={(e) => setWaTemplateName(e.target.value)}
                    placeholder="e.g. login_notification"
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Language Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={waLanguage}
                    onChange={(e) => setWaLanguage(e.target.value)}
                    placeholder="en_US"
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parameters (Comma-separated)
                </label>
                <input
                  type="text"
                  value={waParameters}
                  onChange={(e) => setWaParameters(e.target.value)}
                  placeholder="e.g. {{user_name}}, {{login_time}}"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors"
                />
              </div>
            </div>
          )}

          {/* Variable Mapping Editor */}
          <div className="pt-2 border-t border-gray-100">
            <VariableMappingEditor
              value={variableMapping}
              onChange={setVariableMapping}
            />
          </div>

          {/* Modal Footer Actions */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-100 mt-2">
            <div>
              {isEditing && !showDeleteConfirm && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded-xl transition-all cursor-pointer"
                >
                  Delete Template
                </button>
              )}
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs sm:text-sm font-semibold rounded-xl border border-gray-200 transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 active:scale-[0.99] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md shadow-purple-500/25 transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>{isEditing ? "Save Changes" : "Create Template"}</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TemplateModal;
