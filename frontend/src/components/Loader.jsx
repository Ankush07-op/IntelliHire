export default function Loader({ label = "Loading..." }) {
    return (
      <div className="flex items-center justify-center py-12 text-slate-500 text-sm">
        {label}
      </div>
    );
  }