import { NavLink } from 'react-router-dom';
import { Home, FileSignature, Settings } from 'lucide-react';

export default function Sidebar() {
    return (
        <aside className="w-64 bg-[var(--color-bg-secondary)] border-r border-[var(--color-border)] hidden md:block h-full flex-shrink-0">
            <div className="p-4 border-b border-[var(--color-border)] h-16 flex items-center">
                <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
                    HMR<span className="text-[var(--color-primary)]"> System</span>
                </h2>
            </div>
            <nav className="p-4 space-y-2">
                <NavLink to="/" end className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-[var(--shadow-none)] text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]'}`}>
                    <Home className="w-5 h-5" />
                    <span>Dashboard</span>
                </NavLink>
                <NavLink to="/signatures" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-[var(--shadow-none)] text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]'}`}>
                    <FileSignature className="w-5 h-5" />
                    <span>Firmas</span>
                </NavLink>
                <NavLink to="/settings" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-[var(--shadow-none)] text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]'}`}>
                    <Settings className="w-5 h-5" />
                    <span>Configuración</span>
                </NavLink>
                
            </nav>
        </aside>
    );
}
