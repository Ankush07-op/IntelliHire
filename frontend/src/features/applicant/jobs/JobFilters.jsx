const LOCATIONS = ["Bengaluru", "Mumbai", "Remote"];
const TYPES = ["Full-time", "Part-time", "Contract", "Internship"];

export default function JobFilters({ location, type, onLocationChange, onTypeChange }) {
    return (
        <div className="flex flex-wrap gap-3">
            <select
                value={location}
                onChange={(e) => onLocationChange(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <option value="">All locations</option>
                {LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                        {loc}
                    </option>
                ))}
            </select>

            <select
                value={type}
                onChange={(e) => onTypeChange(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <option value="">All types</option>
                {TYPES.map((t) => (
                    <option key={t} value={t}>
                        {t}
                    </option>
                ))}
            </select>
        </div>
    );
}