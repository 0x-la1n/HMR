import React, { useState, useEffect, useCallback } from 'react';
import {
    Building2, ChevronRight, ChevronDown, Layers, DoorOpen,
    Plus, Loader2, AlertCircle, ToggleLeft, ToggleRight,
    Hash, Users as UsersIcon
} from 'lucide-react';

// ── Helpers ──────────────────────────────────────────────────────────────────

function Badge({ text, variant }) {
    const styles = {
        hotel: 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] border-[var(--color-primary)]/20',
        owner: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
        active: 'bg-green-500/10 text-green-600 border-green-500/20',
        inactive: 'bg-red-500/10 text-red-500 border-red-500/20',
    };
    return (
        <span className={`text-xs font-medium px-2 py-0.5 rounded-md border ${styles[variant] || styles.hotel}`}>
            {text}
        </span>
    );
}

// ── Room pill ────────────────────────────────────────────────────────────────

function RoomPill({ room, onToggle }) {
    const isActive = room.status === 'active';
    return (
        <button
            onClick={() => onToggle(room.id, isActive ? 'inactive' : 'active')}
            className={`
                px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer
                ${isActive
                    ? 'bg-[var(--color-bg-tertiary)] border-[var(--color-border)] text-[var(--color-text-primary)] hover:border-red-500/40 hover:text-red-500'
                    : 'bg-red-500/5 border-red-500/20 text-red-400 hover:border-green-500/40 hover:text-green-500'
                }
            `}
            title={`${room.room_number} — Click para ${isActive ? 'desactivar' : 'activar'}`}
        >
            {room.room_number}
        </button>
    );
}

// ── Floor row ────────────────────────────────────────────────────────────────

function FloorRow({ floor, onToggleRoom, onToggleFloor }) {
    const [expanded, setExpanded] = useState(false);
    const activeCount = floor.rooms.filter(r => r.status === 'active').length;
    const totalCount = floor.rooms.length;

    return (
        <div className="ml-6">
            <div
                className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-[var(--color-bg-tertiary)] transition-colors cursor-pointer group"
                onClick={() => setExpanded(!expanded)}
            >
                {expanded
                    ? <ChevronDown className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                    : <ChevronRight className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                }
                <Layers className="w-4 h-4 text-[var(--color-primary)]" />
                <span className="text-sm font-medium text-[var(--color-text-primary)]">{floor.name || floor.code}</span>
                <span className="text-xs text-[var(--color-text-muted)]">({floor.code})</span>

                <span className="ml-auto flex items-center gap-2">
                    <span className="text-xs text-[var(--color-text-muted)]">
                        {activeCount}/{totalCount} hab.
                    </span>
                    <button
                        onClick={(e) => { e.stopPropagation(); onToggleFloor(floor.id, !floor.is_active); }}
                        className="p-1 rounded-md hover:bg-[var(--color-bg-secondary)] transition-colors"
                        title={floor.is_active ? 'Desactivar piso' : 'Activar piso'}
                    >
                        {floor.is_active
                            ? <ToggleRight className="w-5 h-5 text-green-500" />
                            : <ToggleLeft className="w-5 h-5 text-[var(--color-text-muted)]" />
                        }
                    </button>
                </span>
            </div>

            {expanded && (
                <div className="ml-8 py-2 flex flex-wrap gap-1.5">
                    {floor.rooms.map(room => (
                        <RoomPill key={room.id} room={room} onToggle={onToggleRoom} />
                    ))}
                    {floor.rooms.length === 0 && (
                        <span className="text-xs text-[var(--color-text-muted)] italic">Sin habitaciones</span>
                    )}
                </div>
            )}
        </div>
    );
}

// ── Module card ──────────────────────────────────────────────────────────────

function ModuleCard({ module, onToggleModule, onToggleFloor, onToggleRoom }) {
    const [expanded, setExpanded] = useState(false);
    const totalRooms = module.floors.reduce((sum, f) => sum + f.rooms.length, 0);
    const activeRooms = module.floors.reduce((sum, f) => sum + f.rooms.filter(r => r.status === 'active').length, 0);

    return (
        <div className={`bg-[var(--color-bg-secondary)] border rounded-xl overflow-hidden transition-all ${module.is_active ? 'border-[var(--color-border)]' : 'border-red-500/20 opacity-60'}`}>
            {/* Module header */}
            <div
                className="flex items-center gap-3 p-4 cursor-pointer hover:bg-[var(--color-bg-tertiary)] transition-colors"
                onClick={() => setExpanded(!expanded)}
            >
                {expanded
                    ? <ChevronDown className="w-4 h-4 text-[var(--color-text-muted)]" />
                    : <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)]" />
                }
                <div className="p-2 rounded-lg bg-[var(--color-primary)]/10">
                    <Building2 className="w-4 h-4 text-[var(--color-primary)]" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                            {module.name || `Módulo ${module.number}`}
                        </span>
                        <Badge text={module.category === 'owner' ? 'Propietario' : 'Hotel'} variant={module.category} />
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
                            <Hash className="w-3 h-3" /> {module.number}
                        </span>
                        <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
                            <Layers className="w-3 h-3" /> {module.floors.length} pisos
                        </span>
                        <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
                            <DoorOpen className="w-3 h-3" /> {activeRooms}/{totalRooms} hab.
                        </span>
                    </div>
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); onToggleModule(module.id, !module.is_active); }}
                    className="p-1.5 rounded-lg hover:bg-[var(--color-bg-secondary)] transition-colors"
                    title={module.is_active ? 'Desactivar módulo' : 'Activar módulo'}
                >
                    {module.is_active
                        ? <ToggleRight className="w-6 h-6 text-green-500" />
                        : <ToggleLeft className="w-6 h-6 text-[var(--color-text-muted)]" />
                    }
                </button>
            </div>

            {/* Floors */}
            {expanded && (
                <div className="border-t border-[var(--color-border)] pb-3">
                    {module.floors.map(floor => (
                        <FloorRow
                            key={floor.id}
                            floor={floor}
                            onToggleRoom={onToggleRoom}
                            onToggleFloor={onToggleFloor}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// ── Main component ───────────────────────────────────────────────────────────

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
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchTree(); }, [fetchTree]);

    const patchEntity = async (entity, id, body) => {
        const token = localStorage.getItem('token');
        await fetch(`/api/structure/${entity}/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(body),
        });
        await fetchTree();
    };

    const handleToggleModule = (id, newActive) => patchEntity('modules', id, { is_active: newActive });
    const handleToggleFloor = (id, newActive) => patchEntity('floors', id, { is_active: newActive });
    const handleToggleRoom = (id, newStatus) => patchEntity('rooms', id, { status: newStatus });

    // Stats
    const totalModules = property?.modules?.length || 0;
    const activeModules = property?.modules?.filter(m => m.is_active).length || 0;
    const totalRooms = property?.modules?.reduce((s, m) => s + m.floors.reduce((s2, f) => s2 + f.rooms.length, 0), 0) || 0;
    const activeRooms = property?.modules?.reduce((s, m) => s + m.floors.reduce((s2, f) => s2 + f.rooms.filter(r => r.status === 'active').length, 0), 0) || 0;

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="w-7 h-7 animate-spin text-[var(--color-primary)]" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
                <AlertCircle className="w-8 h-8 text-red-400" />
                <p className="text-sm text-[var(--color-text-secondary)]">{error}</p>
                <button onClick={fetchTree} className="text-sm text-[var(--color-primary)] hover:underline">Reintentar</button>
            </div>
        );
    }

    if (!property) {
        return <p className="text-center text-[var(--color-text-muted)] py-12">No hay un hotel configurado aún.</p>;
    }

    return (
        <div className="space-y-6">
            {/* Property info */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">{property.name}</h3>
                    <p className="text-sm text-[var(--color-text-secondary)]">{property.address}</p>
                </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[var(--color-bg-tertiary)] rounded-xl p-3 border border-[var(--color-border)]">
                    <p className="text-xs text-[var(--color-text-muted)] mb-0.5">Módulos activos</p>
                    <p className="text-xl font-bold text-[var(--color-text-primary)]">{activeModules}/{totalModules}</p>
                </div>
                <div className="bg-[var(--color-bg-tertiary)] rounded-xl p-3 border border-[var(--color-border)]">
                    <p className="text-xs text-[var(--color-text-muted)] mb-0.5">Pisos</p>
                    <p className="text-xl font-bold text-[var(--color-text-primary)]">{property.modules.reduce((s, m) => s + m.floors.length, 0)}</p>
                </div>
                <div className="bg-[var(--color-bg-tertiary)] rounded-xl p-3 border border-[var(--color-border)]">
                    <p className="text-xs text-[var(--color-text-muted)] mb-0.5">Habitaciones activas</p>
                    <p className="text-xl font-bold text-[var(--color-text-primary)]">{activeRooms}</p>
                </div>
                <div className="bg-[var(--color-bg-tertiary)] rounded-xl p-3 border border-[var(--color-border)]">
                    <p className="text-xs text-[var(--color-text-muted)] mb-0.5">Total habitaciones</p>
                    <p className="text-xl font-bold text-[var(--color-text-primary)]">{totalRooms}</p>
                </div>
            </div>

            {/* Info */}
            <div className="text-xs text-[var(--color-text-muted)] flex items-center gap-1.5">
                <DoorOpen className="w-3.5 h-3.5" />
                Haz click en un módulo para expandir sus pisos y habitaciones. Usa los switches para activar/desactivar niveles.
            </div>

            {/* Module tree */}
            <div className="space-y-3">
                {property.modules.map(mod => (
                    <ModuleCard
                        key={mod.id}
                        module={mod}
                        onToggleModule={handleToggleModule}
                        onToggleFloor={handleToggleFloor}
                        onToggleRoom={handleToggleRoom}
                    />
                ))}
            </div>
        </div>
    );
}
