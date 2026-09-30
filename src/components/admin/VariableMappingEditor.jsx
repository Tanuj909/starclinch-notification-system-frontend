import { useState, useEffect, useRef } from "react";

const VariableMappingEditor = ({ value = {}, onChange }) => {
  // Convert object { "name": "user.name" } to array [{ key: "name", path: "user.name" }]
  const [pairs, setPairs] = useState(() => {
    if (!value || typeof value !== "object") return [];
    return Object.entries(value).map(([k, v]) => ({
      key: k,
      path: typeof v === "string" ? v : JSON.stringify(v),
    }));
  });

  const isInternalUpdate = useRef(false);

  // Sync state if `value` changes from parent (e.g. modal open / template switch),
  // but avoid resetting state when the change was initiated by this editor itself.
  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }

    if (!value || typeof value !== "object") {
      setPairs([]);
      return;
    }

    const currentKeys = Object.entries(value).map(([k, v]) => ({
      key: k,
      path: typeof v === "string" ? v : JSON.stringify(v),
    }));
    setPairs(currentKeys);
  }, [value]);

  const updateParent = (newPairs) => {
    setPairs(newPairs);
    const obj = {};
    newPairs.forEach((pair) => {
      const trimmedKey = pair.key.trim().replace(/^\{\{|\}\}$/g, "").trim();
      if (trimmedKey) {
        obj[trimmedKey] = pair.path.trim();
      }
    });
    isInternalUpdate.current = true;
    onChange(obj);
  };

  const handleAddRow = () => {
    const updated = [...pairs, { key: "", path: "" }];
    updateParent(updated);
  };

  const handleRemoveRow = (index) => {
    const updated = pairs.filter((_, i) => i !== index);
    updateParent(updated);
  };

  const handleChangeKey = (index, newKey) => {
    const updated = pairs.map((pair, i) =>
      i === index ? { ...pair, key: newKey } : pair
    );
    updateParent(updated);
  };

  const handleChangePath = (index, newPath) => {
    const updated = pairs.map((pair, i) =>
      i === index ? { ...pair, path: newPath } : pair
    );
    updateParent(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-semibold text-gray-700">
            Variable Mapping
          </label>
          <p className="text-xs text-gray-500 mt-0.5">
            Map template placeholders (e.g. <code className="bg-gray-100 px-1 py-0.5 rounded text-purple-600 font-mono">{"{{user_name}}"}</code>) to payload context paths.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddRow}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl transition-all cursor-pointer active:scale-95 shadow-sm"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Variable
        </button>
      </div>

      {pairs.length === 0 ? (
        <div className="p-4 bg-gray-50/70 border border-dashed border-gray-200 rounded-2xl text-center">
          <p className="text-xs text-gray-400">No variable mappings defined.</p>
          <button
            type="button"
            onClick={handleAddRow}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-600 hover:text-purple-700 bg-white hover:bg-purple-50 border border-purple-200 rounded-xl mt-2.5 transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add first variable mapping
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="grid grid-cols-12 gap-2 text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-1">
            <div className="col-span-5">Variable Key</div>
            <div className="col-span-6">Context Path</div>
            <div className="col-span-1 text-center"></div>
          </div>

          {pairs.map((pair, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-5 relative">
                <input
                  type="text"
                  value={pair.key}
                  onChange={(e) => handleChangeKey(index, e.target.value)}
                  placeholder="e.g. user_name"
                  className="w-full px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-xs font-mono text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 focus:bg-white transition-all"
                />
              </div>

              <div className="col-span-6">
                <input
                  type="text"
                  value={pair.path}
                  onChange={(e) => handleChangePath(index, e.target.value)}
                  placeholder="e.g. user.name"
                  className="w-full px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-xs font-mono text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 focus:bg-white transition-all"
                />
              </div>

              <div className="col-span-1 flex justify-center">
                <button
                  type="button"
                  onClick={() => handleRemoveRow(index)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  title="Remove mapping"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}

          <div className="pt-1">
            <button
              type="button"
              onClick={handleAddRow}
              className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 hover:text-purple-700 hover:underline cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add another variable
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VariableMappingEditor;
