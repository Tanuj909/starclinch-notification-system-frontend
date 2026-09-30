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
          <label className="block text-sm font-medium text-gray-700">
            Variable Mapping
          </label>
        </div>
        <button
          type="button"
          onClick={handleAddRow}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Variable
        </button>
      </div>

      {pairs.length === 0 ? (
        <p className="text-xs text-gray-400 italic">
          No variables mapped.
        </p>
      ) : (
        <div className="space-y-2">
          {pairs.map((pair, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-5 relative">
                <input
                  type="text"
                  value={pair.key}
                  onChange={(e) => handleChangeKey(index, e.target.value)}
                  placeholder="Key (e.g. user_name)"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors"
                />
              </div>

              <div className="col-span-6">
                <input
                  type="text"
                  value={pair.path}
                  onChange={(e) => handleChangePath(index, e.target.value)}
                  placeholder="Path (e.g. user.name)"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors"
                />
              </div>

              <div className="col-span-1 flex justify-center">
                <button
                  type="button"
                  onClick={() => handleRemoveRow(index)}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  title="Remove mapping"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VariableMappingEditor;
