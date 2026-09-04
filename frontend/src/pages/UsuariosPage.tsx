import GestionUsuarios from '../components/GestionUsuarios';

export default function UsuariosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Gestión de Usuarios</h1>
        <p className="text-sm text-ink-400">Solo el SuperAdmin puede crear, editar y eliminar usuarios.</p>
      </div>
      <GestionUsuarios />
    </div>
  );
}
