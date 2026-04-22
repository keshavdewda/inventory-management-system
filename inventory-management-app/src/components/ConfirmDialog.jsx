const ConfirmDialog = ({
  open,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Yes",
  cancelText = "Cancel",
  loading = false,
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Deleting..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
