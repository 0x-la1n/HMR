import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, FileSignature, Settings, Wrench, ChevronDown } from 'lucide-react';

export default function Sidebar() {
    const location = useLocation();
    const isMaintenanceActive = location.pathname.startsWith('/maintenance');
    const [isMaintenanceOpen, setIsMaintenanceOpen] = useState(isMaintenanceActive);

    useEffect(() => {
        if (isMaintenanceActive) {
            setIsMaintenanceOpen(true);
        }
    }, [isMaintenanceActive]);
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
                {/* Dropdown Mantenimiento */}
                <div>
                    <button 
                        onClick={() => setIsMaintenanceOpen(!isMaintenanceOpen)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                            isMaintenanceActive
                                ? 'bg-[var(--color-bg-tertiary)] text-[var(--color-primary)]' 
                                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <Wrench className="w-5 h-5" />
                            <span>Mantenimiento</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isMaintenanceOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isMaintenanceOpen ? 'max-h-40 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                        <div className="flex flex-col gap-1 py-1">
                            {/* Cerraduras (Historial) */}
                            <NavLink to="/maintenance" end className={({ isActive }) => `group flex items-center gap-3 py-2 pl-11 pr-3 text-sm rounded-lg transition-colors ${isActive ? 'text-[var(--color-text-primary)] font-medium bg-[var(--color-bg-tertiary)]/50' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]/30'}`}>
                                {({ isActive }) => (
                                    <>
                                        <div className={`w-1.5 h-1.5 rounded-full transition-colors ${isActive ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-text-muted)] group-hover:bg-[var(--color-text-secondary)]'}`} />
                                        <span>Cerraduras</span>
                                    </>
                                )}
                            </NavLink>

                        </div>
                    </div>
                </div>
                <NavLink to="/settings" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-[var(--shadow-none)] text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]'}`}>
                    <Settings className="w-5 h-5" />
                    <span>Configuración</span>
                </NavLink>

            </nav>
        </aside>
    );
}
