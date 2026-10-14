const LOCATIONS = ["Bengaluru", "Mumbai", "Delhi NCR", "Hyderabad", "Pune", "Remote"];
const TYPES = ["Full-time", "Part-time", "Contract", "Internship"];

export default function JobFilters({ location, type, onLocationChange, onTypeChange }) {
  const hasActiveFilters = Boolean(location || type);

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <div className="relative">
        <select
          value={location}
          onChange={(e) => onLocationChange(e.target.value)}
          className="appearance-none bg-white border border-slate-200/90 rounded-xl pl-3.5 pr-8 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer shadow-xs"
        >
          <option value="">📍 All Locations</option>
          {LOCATIONS.map((loc) => (
            <option key={loc} value={loc}>
              📍 {loc}
            </option>
          ))}
        </select>
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
          ▼
        </span>
      </div>

      <div className="relative">
        <select
          value={type}
          onChange={(e) => onTypeChange(e.target.value)}
          className="appearance-none bg-white border border-slate-200/90 rounded-xl pl-3.5 pr-8 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer shadow-xs"
        >
          <option value="">💼 All Employment Types</option>
          {TYPES.map((t) => (
            <option key={t} value={t}>
              💼 {t}
            </option>
          ))}
        </select>
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
          ▼
        </span>
      </div>

      {hasActiveFilters && (
        <button
          onClick={() => {
            onLocationChange("");
            onTypeChange("");
          }}
          className="text-xs font-semibold text-slate-500 hover:text-rose-600 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          Reset filters ✕
        </button>
      )}
    </div>
  );
}