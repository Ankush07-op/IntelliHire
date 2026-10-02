export default function Footer() {
    return (
        <footer className="border-t border-slate-200 mt-12">
            <div className="max-w-6xl mx-auto px-4 py-6 text-sm text-slate-500">
                © {new Date().getFullYear()} Careers Portal. All rights reserved.
            </div>
        </footer>
    );
  }