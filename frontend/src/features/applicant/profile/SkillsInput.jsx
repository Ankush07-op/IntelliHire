import { useState } from "react";

// Props: skills (string[]), onChange (string[])=>void
export default function SkillsInput({ skills, onChange }) {
    const [draft, setDraft] = useState("");

    const addSkill = () => {
        const value = draft.trim();
        if (!value) return;
        if (skills.some((s) => s.toLowerCase() === value.toLowerCase())) {
            setDraft("");
            return;
        }
        onChange([...skills, value]);
        setDraft("");
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addSkill();
        }
    };

    const removeSkill = (skill) => {
        onChange(skills.filter((s) => s !== skill));
    };

    return (
        <div>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="e.g. React, SQL, Project Management"
                    className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    type="button"
                    onClick={addSkill}
                    className="px-4 py-2 text-sm font-semibold border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                    Add
                </button>
            </div>

            {skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                    {skills.map((skill) => (
                        <span
                            key={skill}
                            className="flex items-center gap-1.5 text-xs font-medium bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full"
                        >
                            {skill}
                            <button
                                type="button"
                                onClick={() => removeSkill(skill)}
                                className="text-slate-400 hover:text-red-600 leading-none"
                                aria-label={`Remove ${skill}`}
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}