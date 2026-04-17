import React, { useState, useEffect, useCallback } from 'react';
import {
    Building2, MapPin, Layers, BedDouble, Wrench,
    ChevronRight, ChevronDown, Edit2, Plus, AlertCircle,
    Loader2, MoreHorizontal
} from 'lucide-react';
import Button from '../../components/common/Button';

// ── Shared Components ────────────────────────────────────────────────────────

const ToggleSwitch = ({ checked, onChange, disabled, size = "md", activeLabel, inactiveLabel }) => {
    const height = size === "sm" ? "h-5" : "h-6";
    const width = size === "sm" ? "w-9" : "w-11";
    const circleSize = size === "sm" ? "h-3 w-3" : "h-4 w-4";
    // Centering calculation:
    // Container height: h-5 (20px) or h-6 (24px)
    // Circle height: h-3 (12px) or h-4 (16px)
    // Vertical gap: (20-12)/2 = 4px or (24-16)/2 = 4px.
    // Border is 2px. So inner gap is 2px.
    // translate-x for ON state: width (36 or 44) - circle (12 or 16) - 2*gap (4) - borders (4) ? 
    // Let's use flexbox for easier centering or absolute with precise values.
    
    // Using flex + padding/gap approach for cleaner CSS
    // But absolute is standard for switches.
    const translate = size === "sm" ? "translate-x-4" : "translate-x-5";

    return (
        <div className="flex items-center gap-2">
            {(activeLabel || inactiveLabel) && (
                <span className={`text-[10px] font-bold tracking-wider uppercase ${checked ? 'text-emerald-500' : 'text-zinc-500'}`}>
                    {checked ? activeLabel : inactiveLabel}
                </span>
            )}
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                disabled={disabled}
                onClick={() => !disabled && onChange(!checked)}
                className={`
                    relative inline-flex flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none
                    ${height} ${width}
                    ${checked ? 'bg-[var(--color-primary)]' : 'bg-zinc-700'}
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
            >
                <span
                    aria-hidden="true"
                    className={`
                        pointer-events-none inline-block rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out absolute top-1/2 left-[2px] -translate-y-1/2
                        ${circleSize}
                        ${checked ? translate : 'translate-x-0'}
                    `}
                />
            </button>
        </div>
    );
};

const StatCard = ({ icon: Icon, label, value, subtext, colorClass, bgClass }) => (
    <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl p-3 flex items-start justify-between shadow-sm hover:border-[var(--color-border-hover)] transition-colors">
        <div>
            <p className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">{label}</p>
            <h4 className="text-xl font-bold text-[var(--color-text-primary)] mt-0.5">{value}</h4>
            {subtext && <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5 font-medium">{subtext}</p>}
        </div>
        <div className={`p-2 rounded-lg ${bgClass}`}>
            <Icon className={`w-4 h-4 ${colorClass}`} />
        </div>
    </div>
);

// ── Room Card (Level 3) ──────────────────────────────────────────────────────

const RoomCard = ({ room, onToggle }) => {
    const isActive = room.status === 'active';
    
    // Estilos para estado Inactivo (Oscuro/Apagado) vs Activo
    const containerClasses = isActive
        ? "bg-[var(--color-bg-secondary)] border-[var(--color-border)] hover:border-[var(--color-primary)]/50 shadow-sm"
        : "bg-black/40 border-red-900/20"; // Fondo muy oscuro para inactivos
    
    const textNumberClasses = isActive
        ? "text-[var(--color-text-primary)]"
        : "text-zinc-600 line-through decoration-red-900/50 decoration-2";

    const iconColor = isActive 
        ? "text-[var(--color-primary)]" 
        : "text-red-900/40";

    return (
        <div className={`relative flex flex-col p-2 rounded-lg border transition-all duration-200 ${containerClasses}`}>
            {/* Header: Icono + Switch */}
            <div className="flex justify-between items-start mb-2">
                <div className={`flex items-center gap-2 ${isActive ? '' : 'opacity-50'}`}>
                    <BedDouble className={`w-3.5 h-3.5 ${iconColor}`} />
                </div>
                <ToggleSwitch 
                    checked={isActive} 
                    onChange={() => onToggle(room.id, isActive ? 'inactive' : 'active')} 
                    size="sm" 
                />
            </div>
            
            {/* Body: Numero + Tipo */}
            <div className="mt-0.5">
                <span className={`text-sm font-bold block ${textNumberClasses}`}>
                    {room.room_number}
                </span>
                <span className={`text-[9px] uppercase font-bold tracking-wider px-1 py-0.5 rounded-md inline-block mt-1 ${isActive ? 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] border border-[var(--color-border)]' : 'bg-red-950/20 text-red-900 border border-red-900/10'}`}>
                   {isActive ? (room.type || 'Standard') : 'Mantenimiento'}
                </span>
            </div>

            {/* Inactive Overlay Text */}
            {!isActive && (
                <div className="absolute bottom-2 right-2 flex items-center gap-1 text-red-900/60">
                    <span className="text-[9px] font-black tracking-tighter">O.O.O</span>
                    <AlertCircle className="w-2.5 h-2.5" />
                </div>
            )}
        </div>
    );
};

// ── Floor Section (Level 2) ──────────────────────────────────────────────────

const FloorSection = ({ floor, onToggleFloor, onToggleRoom }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const activeRooms = floor.rooms.filter(r => r.status === 'active').length;
    
    return (
        <div className="relative pl-5 pb-2">
             {/* Línea conectora vertical */}
            <div className="absolute left-[10px] top-0 bottom-0 w-px bg-[var(--color-border)] opacity-50"></div>
            
            <div className="bg-[var(--color-bg-tertiary)]/30 border border-[var(--color-border)] rounded-xl overflow-hidden hover:border-[var(--color-border-hover)] transition-colors">
                {/* Floor Header */}
                <div className="flex items-center gap-2 p-2 bg-[var(--color-bg-tertiary)]/10 border-b border-[var(--color-border)]/50">
                    <button 
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-1 hover:bg-[var(--color-bg-tertiary)] rounded text-[var(--color-text-muted)]"
                    >
                         {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    </button>
                    
                    <div className="flex items-center gap-2">
                        <Layers className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="font-semibold text-xs text-[var(--color-text-primary)]">
                            {floor.name || `Piso ${floor.code}`}
                        </span>
                    </div>

                    <div className="h-3 w-px bg-[var(--color-border)] mx-1"></div>
                    
                    <span className="text-[10px] text-[var(--color-text-muted)]">
                        {floor.rooms.length} habitaciones
                    </span>

                    <div className="ml-auto flex items-center gap-3">
                        <ToggleSwitch 
                            checked={floor.is_active} 
                            onChange={(val) => onToggleFloor(floor.id, val)}
                            size="sm"
                        />
                    </div>
                </div>

                {/* Floor Content: Room Grid */}
                {isExpanded && (
                    <div className="p-2 bg-[var(--color-bg-primary)]/50">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2">
                            {floor.rooms.map(room => (
                                <RoomCard 
                                    key={room.id} 
                                    room={room} 
                                    onToggle={onToggleRoom} 
                                />
                            ))}
                            
                            {/* Botón Añadir Habitación Compacto */}
                            <button className="group flex flex-col items-center justify-center p-2 rounded-lg border border-dashed border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-bg-tertiary)] transition-all gap-1 min-h-[80px]">
                                <div className="p-1.5 rounded-full bg-[var(--color-bg-tertiary)] group-hover:bg-[var(--color-primary)]/10 transition-colors">
                                    <Plus className="w-3.5 h-3.5 centered" />
                                </div>
                                <span className="text-[9px] font-medium uppercase tracking-wide">Añadir Hab.</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// ── Building Card (Level 1) ──────────────────────────────────────────────────

const BuildingCard = ({ module, onToggleModule, onToggleFloor, onToggleRoom }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    
    // Calcular estadísticas locales
    const totalFloors = module.floors.length;
    const totalRooms = module.floors.reduce((acc, f) => acc + f.rooms.length, 0);

    return (
        <div className={`group bg-[var(--color-bg-secondary)] border rounded-xl transition-all duration-300 shadow-sm ${module.is_active ? 'border-[var(--color-border)]' : 'border-red-900/30 bg-red-950/10'}`}>
            {/* Header del Edificio */}
            <div className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 gap-3 ${module.is_active ? 'bg-[var(--color-bg-tertiary)]/30' : 'bg-transparent'} rounded-t-xl`}>
                
                {/* Left: Controls & Title */}
                <div className="flex items-center gap-3">
                    <button 
                         onClick={() => setIsExpanded(!isExpanded)}
                         className="p-1.5 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-md hover:border-[var(--color-text-muted)] transition-colors text-[var(--color-text-secondary)]"
                    >
                        {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </button>

                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                             <div className={`p-1 rounded-md ${module.is_active ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : 'bg-red-900/20 text-red-700'}`}>
                                <Building2 className="w-3.5 h-3.5" />
                            </div>
                            <h3 className={`text-base font-bold ${module.is_active ? 'text-[var(--color-text-primary)]' : 'text-zinc-500 line-through'}`}>
                                {module.name || `Edificio ${module.number}`}
                            </h3>
                            <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)] border border-[var(--color-border)] rounded">
                                {module.category === 'owner' ? 'Villa' : 'Edificio'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-[var(--color-text-muted)] mt-0.5 ml-0.5">
                            <span>Niveles: <strong className="text-[var(--color-text-secondary)]">{totalFloors}</strong></span>
                            <span className="w-0.5 h-0.5 rounded-full bg-zinc-600"></span>
                            <span>Unidades: <strong className="text-[var(--color-text-secondary)]">{totalRooms}</strong></span>
                        </div>
                    </div>
                </div>

                {/* Right: Actions & Toggle */}
                <div className="flex items-center gap-3 pl-10 sm:pl-0">
                    <button className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] p-1.5 hover:bg-[var(--color-bg-tertiary)] rounded-full transition-colors">
                        <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    
                    <ToggleSwitch 
                        checked={module.is_active} 
                        onChange={(val) => onToggleModule(module.id, val)}
                        activeLabel="Operativo"
                        inactiveLabel="Clausurado"
                    />
                </div>
            </div>

            {/* Contenido Colapsable (Pisos) */}
            {isExpanded && (
                <div className={`p-3 space-y-3 ${!module.is_active && 'opacity-40 grayscale pointer-events-none'}`}>
                    <div className="space-y-3 pt-0.5">
                         {module.floors.map(floor => (
                            <FloorSection 
                                key={floor.id} 
                                floor={floor} 
                                onToggleFloor={onToggleFloor}
                                onToggleRoom={onToggleRoom}
                            />
                        ))}
                    </div>
                    
                    {/* Botón Añadir Nivel Footer */}
                    <button className="w-full py-2 flex items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--color-border)] text-[var(--color-text-muted)] bg-[var(--color-bg-tertiary)]/20 hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-text-muted)] transition-all">
                        <Plus className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium">Añadir Nivel</span>
                    </button>
                </div>
            )}
        </div>
    );
};

// ── Main Component ───────────────────────────────────────────────────────────

export default function HotelStructureTab() {
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchTree = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/structure/tree', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('Error al cargar la estructura');
            const data = await res.json();
            setProperty(data.property);
        } catch (err) {
            setError(err.message);
            console.warn("API Error, using mock data may fail if not structured correctly.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchTree(); }, [fetchTree]);

    // Mock functions (replace with real API calls if needed)
    const patchEntity = async (entity, id, body) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`/api/structure/${entity}/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(body),
            });
            await fetchTree(); // Refresh
        } catch (e) { console.error(e); }
    };

    const handleToggleModule = (id, newActive) => patchEntity('modules', id, { is_active: newActive });
    const handleToggleFloor = (id, newActive) => patchEntity('floors', id, { is_active: newActive });
    const handleToggleRoom = (id, newStatus) => patchEntity('rooms', id, { status: newStatus });

    // Loading & Metrics
    if (loading && !property) {
        return <div className="flex h-96 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" /></div>;
    }

    const totalBuildings = property?.modules?.length || 0;
    const totalFloors = property?.modules?.reduce((acc, m) => acc + m.floors.length, 0) || 0;
    const totalRooms = property?.modules?.reduce((acc, m) => acc + m.floors.reduce((accF, f) => accF + f.rooms.length, 0), 0) || 0;
    const activeRooms = property?.modules?.reduce((acc, m) => acc + m.floors.reduce((accF, f) => accF + f.rooms.filter(r => r.status === 'active').length, 0), 0) || 0;
    const maintenanceRooms = totalRooms - activeRooms;

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                   <div className="flex items-center gap-2 text-[var(--color-primary)] mb-1">
                        <MapPin className="w-5 h-5" />
                        <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
                            Estructura Física del Complejo
                        </h2>
                   </div>
                </div>
                <Button variant="register" icon={Plus}>
                    Añadir Edificio o Zona
                </Button>
            </div>

            {/* Metrics */}
            {property && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard 
                        icon={Building2} label="Edificios / Zonas" value={totalBuildings} 
                        bgClass="bg-blue-500/10" colorClass="text-blue-500" 
                    />
                    <StatCard 
                        icon={Layers} label="Niveles / Pisos" value={totalFloors} 
                        bgClass="bg-amber-500/10" colorClass="text-amber-500" 
                    />
                    <StatCard 
                        icon={BedDouble} label="Hab. Activas" value={activeRooms} 
                        subtext={`${activeRooms}/${totalRooms}`}
                        bgClass="bg-emerald-500/10" colorClass="text-emerald-500" 
                    />
                    <StatCard 
                        icon={Wrench} label="Mantenimiento" value={maintenanceRooms} 
                        bgClass="bg-rose-500/10" colorClass="text-rose-500" 
                    />
                </div>
            )}

            {/* Tree */}
            <div className="space-y-6">
                {property?.modules?.map(module => (
                    <BuildingCard 
                        key={module.id} module={module} 
                        onToggleModule={handleToggleModule}
                        onToggleFloor={handleToggleFloor}
                        onToggleRoom={handleToggleRoom}
                    />
                ))}
                
                {/* Empty State */}
                {(!property?.modules || property?.modules.length === 0) && (
                     <div className="text-center py-16 bg-[var(--color-bg-secondary)] rounded-2xl border border-dashed border-[var(--color-border)] opacity-60">
                        <Building2 className="w-16 h-16 text-[var(--color-text-muted)] mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-[var(--color-text-primary)]">Sin Estructura</h3>
                        <p className="text-[var(--color-text-secondary)]">Añade tu primer edificio para comenzar.</p>
                     </div>
                )}
            </div>
        </div>
    );
}
