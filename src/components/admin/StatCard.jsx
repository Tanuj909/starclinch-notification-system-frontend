const StatCard = ({ title, value, subtitle }) => {
  return (
    <div className="bg-white border border-gray-200/80 rounded-3xl p-6 shadow-xs hover:shadow-md transition-shadow">
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
        {title}
      </span>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
          {value}
        </span>
      </div>
      {subtitle && (
        <p className="text-xs text-gray-400 mt-2 font-medium">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default StatCard;
