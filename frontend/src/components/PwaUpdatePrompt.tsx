import { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

export default function PwaUpdatePrompt() {
  const {
    needRefresh,
    updateServiceWorker,
  } = useRegisterSW();

  const autoUpdateOnRefresh = true;

  useEffect(() => {
    if (autoUpdateOnRefresh && needRefresh[0]) {
      updateServiceWorker(true);
    }
  }, [autoUpdateOnRefresh, needRefresh, updateServiceWorker]);

  if (autoUpdateOnRefresh) return null;
  if (!needRefresh[0]) return null;

  return (
    <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-800 shadow-lg">
      <div className="flex items-center gap-3">
        <span>Update tersedia</span>
        <button
          type="button"
          className="rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-semibold text-white hover:bg-emerald-700"
          onClick={() => updateServiceWorker(true)}
        >
          Update
        </button>
      </div>
    </div>
  );
}
