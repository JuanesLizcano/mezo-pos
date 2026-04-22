import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ titulo, onClose, children, ancho = 'max-w-lg' }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-mezo-ink/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className={`relative bg-mezo-ink-raised border border-mezo-ink-line rounded-mezo-xl w-full ${ancho} max-h-[90vh] overflow-y-auto shadow-mezo-lg`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-mezo-ink-line">
          <h3 className="font-semibold text-mezo-cream">{titulo}</h3>
          <button
            onClick={onClose}
            className="text-mezo-stone hover:text-mezo-cream transition p-1 rounded-mezo-sm hover:bg-mezo-ink-muted"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
