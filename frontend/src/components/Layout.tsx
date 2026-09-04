import { Outlet } from 'react-router-dom';
import NavBar from './NavBar';

export default function Layout() {
  return (
    <div className="min-h-screen bg-ink-50">
      <NavBar />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
