const BrandMark = ({ compact = false }) => {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-cyan-200/70 bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 dark:border-cyan-300/20 dark:from-cyan-300 dark:via-sky-500 dark:to-blue-700">
        <span className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.45),transparent_45%)]" />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.7"
          stroke="currentColor"
          className="relative h-5 w-5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6.5h16M4 12h16M7 17.5h10" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.25 4.75h11.5v14.5H6.25z" opacity="0.65" />
        </svg>
      </div>
      {!compact && (
        <div>
          <p className="text-[10px] uppercase tracking-[0.32em] text-slate-500 dark:text-slate-400">
            Inventory Management
          </p>
          <p className="text-xl font-semibold leading-tight text-slate-900 dark:text-white">Nova IMS</p>
        </div>
      )}
    </div>
  );
};

export default BrandMark;
