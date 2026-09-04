import { useEffect } from 'react';

interface ToastProps {
  mensaje: string;
  tipo: 'exito' | 'error';
  onCerrar: () => void;
}

export default function Toast({ mensaje, tipo, onCerrar }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onCerrar, 4000);
    return () => clearTimeout(timer);
  }, [onCerrar]);

  const estilos =
    tipo === 'exito' ? 'bg-emerald-600 border-emerald-700' : 'bg-brand-500 border-brand-600';

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-md border-l-4 ${estilos} px-4 py-3 text-sm font-medium text-white shadow-lg`}
      role="alert"
    >
      <span>{mensaje}</span>
      <button onClick={onCerrar} className="text-white/80 hover:text-white" aria-label="Cerrar">
        ✕
      </button>
    </div>
  );
}
