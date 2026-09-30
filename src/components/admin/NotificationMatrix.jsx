import NotificationCell from "./NotificationCell";

const NotificationMatrix = ({
  triggers = [],
  channels = [],
  templates = [],
  onEdit,
  onCreate,
  onToggle,
  onEditTrigger,
  onEditChannel,
  togglingId,
}) => {
  // Helper to find channel icon
  const getChannelIcon = (code) => {
    switch (code?.toUpperCase()) {
      case "EMAIL":
        return (
          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case "WHATSAPP":
        return (
          <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
      case "WEB_PUSH":
        return (
          <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
    }
  };

  if (triggers.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 mx-auto flex items-center justify-center mb-3">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h3 className="text-base font-bold text-gray-900">No triggers configured</h3>
        <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
          No system triggers found. Click "+ Add Trigger" above to create your first trigger event.
        </p>
      </div>
    );
  }

  if (channels.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center mb-3">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h3 className="text-base font-bold text-gray-900">No channels configured</h3>
        <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
          No notification channels found. Click "+ Add Channel" to create a new delivery channel.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-gradient-to-r from-purple-50/70 via-gray-50/50 to-purple-50/30 border-b border-gray-200">
              {/* Trigger Column Header */}
              <th className="py-4 px-6 text-xs font-bold text-gray-700 uppercase tracking-wider w-64">
                Trigger Event
              </th>

              {/* Dynamic Channel Column Headers */}
              {channels.map((channel) => (
                <th
                  key={channel.id}
                  className="py-4 px-6 text-xs font-bold text-gray-700 uppercase tracking-wider"
                >
                  <div className="flex items-center justify-between gap-2 group">
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded-lg bg-white border border-gray-200 shadow-2xs">
                        {getChannelIcon(channel.code)}
                      </span>
                      <span>{channel.name}</span>
                      <span className="text-[10px] text-gray-400 font-mono font-normal">
                        ({channel.code})
                      </span>
                    </div>

                    {onEditChannel && (
                      <button
                        type="button"
                        onClick={() => onEditChannel(channel)}
                        className="opacity-60 hover:opacity-100 p-1 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-md transition-all cursor-pointer"
                        title={`Edit ${channel.name} channel`}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {triggers.map((trigger) => (
              <tr
                key={trigger.id}
                className="hover:bg-purple-50/20 transition-colors align-top group"
              >
                {/* Trigger Name & Details */}
                <td className="py-5 px-6">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900">
                          {trigger.name}
                        </span>
                        {trigger.is_active === false && (
                          <span className="px-2 py-0.5 text-[10px] font-semibold bg-gray-100 text-gray-500 rounded-full">
                            Inactive
                          </span>
                        )}
                      </div>

                      {onEditTrigger && (
                        <button
                          type="button"
                          onClick={() => onEditTrigger(trigger)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all cursor-pointer"
                          title="Edit or delete trigger"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {trigger.description || "System trigger event"}
                    </p>
                    <span className="inline-block text-[10px] font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                      CODE: {trigger.code}
                    </span>
                  </div>
                </td>

                {/* Dynamic Channel Cells */}
                {channels.map((channel) => {
                  const template = templates.find(
                    (t) =>
                      Number(t.trigger) === Number(trigger.id) &&
                      Number(t.channel) === Number(channel.id)
                  );

                  return (
                    <td key={`${trigger.id}-${channel.id}`} className="py-5 px-4 sm:px-6">
                      <NotificationCell
                        trigger={trigger}
                        channel={channel}
                        template={template}
                        onEdit={onEdit}
                        onCreate={onCreate}
                        onToggle={onToggle}
                        isToggling={template && togglingId === template.id}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NotificationMatrix;
