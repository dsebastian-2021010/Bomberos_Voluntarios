interface ConfirmModalProps {
  titulo: string;
  mensaje: string;
  onConfirmar: () => void;
  onCancelar: () => void;
}

export default function ConfirmModal({ titulo, mensaje, onConfirmar, onCancelar }: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
        <h3 className="text-lg font-bold text-ink-900">{titulo}</h3>
        <p className="mt-2 text-sm text-ink-500">{mensaje}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onCancelar} className="btn-secondary">
            Cancelar
          </button>
          <button onClick={onConfirmar} className="btn-primary">
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
