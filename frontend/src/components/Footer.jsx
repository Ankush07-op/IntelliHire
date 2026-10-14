export default function Footer() {
    return (
        <footer className="border-t border-slate-200/80 bg-white/50 backdrop-blur-xs mt-16 py-8">
            <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-700">IntelliHire</span>
                    <span>·</span>
                    <span>AI-Powered Intelligent Recruitment Platform</span>
                </div>
                <div className="flex items-center gap-4 text-slate-400">
                    <span>© {new Date().getFullYear()} IntelliHire Inc.</span>
                </div>
            </div>
        </footer>
    );
}