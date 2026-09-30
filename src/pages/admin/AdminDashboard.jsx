import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getTriggers,
  getChannels,
  getTemplates,
} from "../../services/adminService";
import StatCard from "../../components/admin/StatCard";
import TriggerModal from "../../components/admin/TriggerModal";
import ChannelModal from "../../components/admin/ChannelModal";

const AdminDashboard = () => {
  const [triggers, setTriggers] = useState([]);
  const [channels, setChannels] = useState([]);
  const [templates, setTemplates] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Trigger Modal
  const [triggerModalOpen, setTriggerModalOpen] = useState(false);
  const [triggerToEdit, setTriggerToEdit] = useState(null);

  // Channel Modal
  const [channelModalOpen, setChannelModalOpen] = useState(false);
  const [channelToEdit, setChannelToEdit] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError("");

    try {
      const [triggersData, channelsData, templatesData] = await Promise.all([
        getTriggers(),
        getChannels(),
        getTemplates(),
      ]);

      setTriggers(Array.isArray(triggersData) ? triggersData : []);
      setChannels(Array.isArray(channelsData) ? channelsData : []);
      setTemplates(Array.isArray(templatesData) ? templatesData : []);
    } catch (err) {
      console.error("Dashboard data fetch error:", err);
      setError("Unable to load dashboard metrics. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const enabledTemplatesCount = templates.filter((t) => t.is_enabled).length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Notification System
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Overview and summary of triggers, channels, and active notification templates.
          </p>
        </div>

        <Link
          to="/admin/notifications"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold text-xs sm:text-sm rounded-2xl shadow-md shadow-purple-500/20 transition-all active:scale-[0.98] whitespace-nowrap self-start sm:self-auto cursor-pointer"
        >
          <span>Notification Settings</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>

      {/* Loading Skeleton / Error State */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-32 bg-white border border-gray-100 rounded-3xl p-6 animate-pulse flex flex-col justify-between"
            >
              <div className="h-4 bg-gray-200 rounded-md w-1/2" />
              <div className="h-8 bg-gray-200 rounded-md w-1/3" />
              <div className="h-3 bg-gray-100 rounded-md w-3/4" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-3xl p-6 text-center text-red-700 space-y-3">
          <p className="text-sm font-semibold">{error}</p>
          <button
            onClick={fetchData}
            type="button"
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Retry Loading
          </button>
        </div>
      ) : (
        <>
          {/* Metrics / Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              title="System Triggers"
              value={triggers.length}
              subtitle="Trigger events defined"
            />

            <StatCard
              title="Available Channels"
              value={channels.length}
              subtitle="Active notification channels"
            />

            <StatCard
              title="Total Templates"
              value={templates.length}
              subtitle="Configured trigger templates"
            />

            <StatCard
              title="Enabled Templates"
              value={enabledTemplatesCount}
              subtitle={`${templates.length - enabledTemplatesCount} disabled templates`}
            />
          </div>

          {/* Breakdown Section with CRUD Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Triggers Breakdown */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Triggers</h3>
                  <p className="text-xs text-gray-400">Events that trigger notifications</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setTriggerToEdit(null);
                    setTriggerModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold rounded-xl border border-purple-200 transition-colors cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>New Trigger</span>
                </button>
              </div>

              <div className="mt-4 divide-y divide-gray-100 max-h-72 overflow-y-auto">
                {triggers.length === 0 ? (
                  <p className="text-xs text-gray-400 py-4 text-center">No triggers configured</p>
                ) : (
                  triggers.map((t) => (
                    <div key={t.id} className="py-3 flex items-center justify-between group">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                          {t.is_active === false && (
                            <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.2 rounded">Inactive</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400">{t.description || "System event"}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                          {t.code}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setTriggerToEdit(t);
                            setTriggerModalOpen(true);
                          }}
                          className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit trigger"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Channels Breakdown */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Channels</h3>
                  <p className="text-xs text-gray-400">Delivery endpoints (Email, WhatsApp, Push)</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setChannelToEdit(null);
                    setChannelModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-xl border border-indigo-200 transition-colors cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>New Channel</span>
                </button>
              </div>

              <div className="mt-4 divide-y divide-gray-100 max-h-72 overflow-y-auto">
                {channels.length === 0 ? (
                  <p className="text-xs text-gray-400 py-4 text-center">No channels configured</p>
                ) : (
                  channels.map((c) => (
                    <div key={c.id} className="py-3 flex items-center justify-between group">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-900">{c.name}</p>
                          <span className="text-[10px] font-mono text-gray-400">({c.code})</span>
                        </div>
                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {c.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setChannelToEdit(c);
                            setChannelModalOpen(true);
                          }}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit channel"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Trigger Modal */}
      <TriggerModal
        isOpen={triggerModalOpen}
        onClose={() => setTriggerModalOpen(false)}
        trigger={triggerToEdit}
        onSaveSuccess={(savedTrigger) => {
          setTriggers((prev) => {
            const exists = prev.some((t) => t.id === savedTrigger.id);
            if (exists) {
              return prev.map((t) => (t.id === savedTrigger.id ? savedTrigger : t));
            }
            return [...prev, savedTrigger];
          });
        }}
        onDeleteSuccess={(deletedId) => {
          setTriggers((prev) => prev.filter((t) => t.id !== deletedId));
          setTemplates((prev) => prev.filter((t) => Number(t.trigger) !== Number(deletedId)));
        }}
      />

      {/* Channel Modal */}
      <ChannelModal
        isOpen={channelModalOpen}
        onClose={() => setChannelModalOpen(false)}
        channel={channelToEdit}
        onSaveSuccess={(savedChannel) => {
          setChannels((prev) => {
            const exists = prev.some((c) => c.id === savedChannel.id);
            if (exists) {
              return prev.map((c) => (c.id === savedChannel.id ? savedChannel : c));
            }
            return [...prev, savedChannel];
          });
        }}
        onDeleteSuccess={(deletedId) => {
          setChannels((prev) => prev.filter((c) => c.id !== deletedId));
          setTemplates((prev) => prev.filter((t) => Number(t.channel) !== Number(deletedId)));
        }}
      />
    </div>
  );
};

export default AdminDashboard;