const NotificationCell = ({
  trigger,
  channel,
  template,
  onEdit,
  onCreate,
  onToggle,
  isToggling,
}) => {
  const channelCode = channel?.code?.toUpperCase() || "";

  // Helper to get preview snippet
  const getContentSnippet = () => {
    if (!template || !template.content) return null;
    const content = template.content;

    if (channelCode === "EMAIL") {
      return content.subject ? `Subject: "${content.subject}"` : null;
    }
    if (channelCode === "WEB_PUSH") {
      return content.title ? `Title: "${content.title}"` : null;
    }
    if (channelCode === "WHATSAPP") {
      return content.template_name ? `Template: "${content.template_name}"` : null;
    }
    return null;
  };

  const snippet = getContentSnippet();

  if (!template) {
    return (
      <div className="p-4 bg-gray-50/40 rounded-2xl border border-dashed border-gray-200 flex flex-col items-start justify-between min-h-[110px] transition-all hover:bg-purple-50/30 hover:border-purple-200">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-500 border border-gray-200">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
            Not configured
          </span>
          <p className="text-xs text-gray-400 mt-2">
            No template for this channel.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onCreate(trigger, channel)}
          className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-purple-600 hover:text-purple-700 hover:underline cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Configure Template
        </button>
      </div>
    );
  }

  const isEnabled = Boolean(template.is_enabled);

  return (
    <div
      className={`p-4 rounded-2xl border transition-all min-h-[110px] flex flex-col justify-between ${
        isEnabled
          ? "bg-white border-purple-100/80 shadow-xs hover:shadow-md hover:border-purple-200"
          : "bg-gray-50/60 border-gray-200/80 opacity-80 hover:opacity-100"
      }`}
    >
      <div>
        {/* Status Badge + Channel Tag */}
        <div className="flex items-center justify-between gap-2">
          {isEnabled ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Enabled
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-600 border border-gray-200">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
              Disabled
            </span>
          )}

        </div>

        {/* Content Snippet */}
        {snippet && (
          <p className="text-xs text-gray-600 mt-2 font-medium line-clamp-1" title={snippet}>
            {snippet}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-4 pt-2 border-t border-gray-100/80 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onEdit(template, trigger, channel)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-purple-700 hover:text-purple-800 bg-purple-50 hover:bg-purple-100/80 px-2.5 py-1 rounded-lg border border-purple-200/60 transition-colors cursor-pointer"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          Edit
        </button>

        <button
          type="button"
          disabled={isToggling}
          onClick={() => onToggle(template)}
          className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg transition-colors cursor-pointer disabled:opacity-50 ${
            isEnabled
              ? "text-gray-500 hover:text-amber-700 hover:bg-amber-50"
              : "text-emerald-700 hover:bg-emerald-50 font-semibold"
          }`}
          title={isEnabled ? "Click to disable template" : "Click to enable template"}
        >
          {isToggling ? (
            <span className="text-[11px]">Updating...</span>
          ) : isEnabled ? (
            <span>Disable</span>
          ) : (
            <span>Enable</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default NotificationCell;
