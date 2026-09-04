import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface PrivateRouteProps {
  rolesPermitidos?: Array<'superadmin' | 'admin' | 'usuario'>;
}

export default function PrivateRoute({ rolesPermitidos }: PrivateRouteProps) {
  const { usuario, cargando } = useAuth();

  if (cargando) {
    return (
      <div className="flex h-screen items-center justify-center bg-ink-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (rolesPermitidos && !rolesPermitidos.includes(usuario.rol)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
