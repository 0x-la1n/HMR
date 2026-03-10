import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Wrench, Battery, Cog, Plus, Search, Trash2, Calendar,
    Loader2, AlertCircle, X, ChevronRight, ChevronDown, User,
    BarChart3
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('es-VE', {
        day: '2-digit', month: 'short', year: 'numeric',
    });
}

function TypeBadge({ type }) {
    const isBattery = type === 'battery';
    return (
        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md border ${isBattery
            ? 'bg-green-500/10 text-green-600 border-green-500/20'
            : 'bg-orange-500/10 text-orange-600 border-orange-500/20'
            }`}>
            {isBattery ? <Battery className="w-3 h-3" /> : <Cog className="w-3 h-3" />}
            {isBattery ? 'Batería' : 'Mecánico'}
        </span>
    );
}

// ── Delete modal ─────────────────────────────────────────────────────────────

function DeleteModal({ log, onConfirm, onCancel, loading }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
            <div className="relative bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl shadow-2xl p-6 w-full max-w-sm z-10">
                <button onClick={onCancel} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]">
                    <X className="w-4 h-4" />
                </button>
                <div className="flex items-start gap-4 mb-5">
                    <div className="p-3 bg-red-500/10 rounded-xl shrink-0">
                        <Trash2 className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-[var(--color-text-primary)] mb-1">Eliminar registro</h3>
                        <p className="text-sm text-[var(--color-text-secondary)]">
                            ¿Eliminar el mantenimiento de la habitación <strong>{log?.room_number}</strong>? Esta acción no se puede deshacer.
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button onClick={onCancel} className="flex-1 py-2 text-sm rounded-xl border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] transition-colors">
                        Cancelar
                    </button>
                    <button onClick={onConfirm} disabled={loading} className="flex-1 py-2 text-sm rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        Eliminar
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Create modal ─────────────────────────────────────────────────────────────

function CreateModal({ onSave, onCancel, saving }) {
    const [rooms, setRooms] = useState([]);
    const [partTypes, setPartTypes] = useState([]);
    const [form, setForm] = useState({
        room_id: '', type: 'battery', part_type_id: '', description: '',
        performed_at: new Date().toISOString().split('T')[0],
    });

    // Room autocomplete state
    const [roomQuery, setRoomQuery] = useState('');
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [activeIdx, setActiveIdx] = useState(-1);
    const inputRef = useRef(null);

    // Part select state
    const [showPartDropdown, setShowPartDropdown] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        fetch('/api/structure/rooms?status=active', { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json()).then(d => setRooms(d.rooms || []));
        fetch('/api/maintenance/part-types', { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json()).then(d => setPartTypes(d.part_types || []));
    }, []);

    const filteredParts = partTypes.filter(p => p.category === form.type);

    // Live suggestions: exact prefix first, then contains, max 8
    const suggestions = roomQuery.length > 0
        ? rooms
            .filter(r => r.room_number.includes(roomQuery))
            .sort((a, b) => {
                const aS = a.room_number.startsWith(roomQuery);
                const bS = b.room_number.startsWith(roomQuery);
                if (aS && !bS) return -1;
                if (!aS && bS) return 1;
                return a.room_number.localeCompare(b.room_number);
            })
            .slice(0, 8)
        : [];

    const handleRoomInput = (e) => {
        const val = e.target.value.replace(/\D/g, ''); // digits only
        setRoomQuery(val);
        setSelectedRoom(null);
        setForm(f => ({ ...f, room_id: '' }));
        setShowSuggestions(true);
        setActiveIdx(-1);
    };

    const selectRoom = (room) => {
        setSelectedRoom(room);
        setForm(f => ({ ...f, room_id: room.id }));
        setRoomQuery('');
        setShowSuggestions(false);
        setActiveIdx(-1);
    };

    const clearRoom = () => {
        setSelectedRoom(null);
        setForm(f => ({ ...f, room_id: '' }));
        setRoomQuery('');
        setTimeout(() => inputRef.current?.focus(), 0);
    };

    const handleKeyDown = (e) => {
        if (!showSuggestions || suggestions.length === 0) return;
        if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, suggestions.length - 1)); }
        if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); }
        if (e.key === 'Enter') { e.preventDefault(); if (activeIdx >= 0) selectRoom(suggestions[activeIdx]); }
        if (e.key === 'Escape') { setShowSuggestions(false); }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
            <div className="relative bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl shadow-2xl p-6 w-full max-w-md z-10">
                <button onClick={onCancel} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]">
                    <X className="w-4 h-4" />
                </button>
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2  py-2">
                    <Wrench className="w-5 h-5 text-[var(--color-primary)]" />
                    Registrar Mantenimiento
                </h3>

                <div className="space-y-4">

                    {/* ── Room autocomplete ── */}
                    <div>
                        <label className="text-xs font-medium text-[var(--color-text-secondary)] mb-1 block">Habitación</label>

                        {selectedRoom ? (
                            /* Selected chip */
                            <div className="flex items-center justify-between px-3 py-2 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 rounded-lg">
                                <div>
                                    <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                                        Hab. {selectedRoom.room_number}
                                    </span>
                                    <span className="text-xs text-[var(--color-text-muted)] ml-2">
                                        {selectedRoom.module_name} · {selectedRoom.floor_code}
                                    </span>
                                </div>
                                <button
                                    onClick={clearRoom}
                                    className="p-1 rounded hover:bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ) : (
                            /* Search input + dropdown */
                            <div
                                className="relative"
                                onBlur={(e) => {
                                    if (!e.currentTarget.contains(e.relatedTarget)) setShowSuggestions(false);
                                }}
                            >
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        inputMode="numeric"
                                        value={roomQuery}
                                        onChange={handleRoomInput}
                                        onKeyDown={handleKeyDown}
                                        onFocus={() => roomQuery && setShowSuggestions(true)}
                                        placeholder="Escribe el número de habitación…"
                                        className="w-full pl-9 pr-3 py-2 text-sm bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:outline-none"
                                    />
                                </div>
                                {showSuggestions && roomQuery.length > 0 && (
                                    <div className="absolute z-20 mt-1 w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg shadow-xl overflow-hidden">
                                        {suggestions.length > 0 ? (
                                            <ul>
                                                {suggestions.map((r, i) => (
                                                    <li key={r.id}>
                                                        <button
                                                            tabIndex={0}
                                                            onMouseDown={(e) => { e.preventDefault(); selectRoom(r); }}
                                                            className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between transition-colors ${i === activeIdx
                                                                ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                                                                : 'hover:bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)]'
                                                                }`}
                                                        >
                                                            <span className="font-medium">Hab. {r.room_number}</span>
                                                            <span className="text-xs text-[var(--color-text-muted)]">
                                                                {r.module_name} · {r.floor_code}
                                                            </span>
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="px-3 py-2.5 text-sm text-[var(--color-text-muted)]">
                                                Sin coincidencias para "{roomQuery}"
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ── Type ── */}
                    <div>
                        <label className="text-xs font-medium text-[var(--color-text-secondary)] mb-1 block">Tipo</label>
                        <div className="flex gap-2">
                            {[
                                { value: 'battery', label: 'Batería', icon: Battery },
                                { value: 'mechanical', label: 'Mecánico', icon: Cog },
                            ].map(opt => {
                                const Icon = opt.icon;
                                const active = form.type === opt.value;
                                return (
                                    <button key={opt.value}
                                        onClick={() => setForm(f => ({ ...f, type: opt.value, part_type_id: '' }))}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm rounded-lg border transition-colors ${active
                                            ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)]/30 text-[var(--color-primary)] font-medium'
                                            : 'bg-[var(--color-bg-tertiary)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {opt.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* ── Part type (mechanical only) ── */}
                    {form.type === 'mechanical' && (
                        <div>
                            <label className="text-xs font-medium text-[var(--color-text-secondary)] mb-1 block">Pieza</label>
                            <div 
                                className="relative"
                                onBlur={(e) => {
                                    if (!e.currentTarget.contains(e.relatedTarget)) setShowPartDropdown(false);
                                }}
                            >
                                <button
                                    type="button"
                                    onClick={() => setShowPartDropdown(prev => !prev)}
                                    className="w-full px-3 py-2 text-sm text-left bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:outline-none flex items-center justify-between"
                                >
                                    <span className={!form.part_type_id ? "text-[var(--color-text-muted)]" : ""}>
                                        {form.part_type_id 
                                            ? filteredParts.find(p => p.id == form.part_type_id)?.name || 'Seleccionar pieza'
                                            : 'Seleccionar pieza'
                                        }
                                    </span>
                                    <ChevronDown className={`w-4 h-4 text-[var(--color-text-muted)] transition-transform ${showPartDropdown ? 'rotate-180' : ''}`} />
                                </button>
                                
                                {showPartDropdown && (
                                    <div className="absolute z-20 mt-1 w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg shadow-xl overflow-hidden max-h-48 overflow-y-auto">
                                        <ul className="py-1">
                                            {filteredParts.length > 0 ? (
                                                filteredParts.map(p => (
                                                    <li key={p.id}>
                                                        <button
                                                            type="button"
                                                            onMouseDown={(e) => { 
                                                                e.preventDefault(); 
                                                                setForm(f => ({ ...f, part_type_id: p.id }));
                                                                setShowPartDropdown(false);
                                                            }}
                                                            className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                                                                form.part_type_id == p.id
                                                                    ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-medium'
                                                                    : 'hover:bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)]'
                                                            }`}
                                                        >
                                                            {p.name}
                                                        </button>
                                                    </li>
                                                ))
                                            ) : (
                                                <li className="px-3 py-2.5 text-sm text-[var(--color-text-muted)]">No hay piezas disponibles</li>
                                            )}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── Date ── */}
                    <div>
                        <label className="text-xs font-medium text-[var(--color-text-secondary)] mb-1 block">Fecha</label>
                        <input
                            type="date"
                            value={form.performed_at}
                            onChange={e => setForm(f => ({ ...f, performed_at: e.target.value }))}
                            className="w-full px-3 py-2 text-sm bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:outline-none [color-scheme:dark]"
                        />
                    </div>

                    {/* ── Description ── */}
                    <div>
                        <label className="text-xs font-medium text-[var(--color-text-secondary)] mb-1 block">Descripción (opcional)</label>
                        <textarea
                            value={form.description}
                            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                            rows={2}
                            placeholder="Detalles del mantenimiento..."
                            className="w-full px-3 py-2 text-sm bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:outline-none resize-none"
                        />
                    </div>
                </div>

                <div className="flex gap-3 mt-5">
                    <button onClick={onCancel} className="flex-1 py-2 text-sm rounded-xl border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] transition-colors">
                        Cancelar
                    </button>
                    <button
                        onClick={() => onSave({
                            ...form,
                            room_id: parseInt(form.room_id),
                            part_type_id: form.part_type_id ? parseInt(form.part_type_id) : null,
                        })}
                        disabled={saving || !form.room_id}
                        className="flex-1 py-2 text-sm rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        Registrar
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Log row (compact table design) ───────────────────────────────────────────

function LogRow({ log, onDelete, onViewRoom }) {
    const isBattery = log.type === 'battery';
    return (
        <tr className="group border-b border-[var(--color-border)] hover:bg-[var(--color-bg-tertiary)]/50 transition-colors">
            {/* Type icon */}
            <td className="py-2 pl-3 pr-2 w-8">
                <div className={`p-1.5 rounded-md inline-flex ${isBattery ? 'bg-green-500/10' : 'bg-orange-500/10'}`}>
                    {isBattery
                        ? <Battery className="w-3.5 h-3.5 text-green-500" />
                        : <Cog className="w-3.5 h-3.5 text-orange-500" />}
                </div>
            </td>
            {/* Room + badge */}
            <td className="py-2 px-2 whitespace-nowrap">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[var(--color-text-primary)]">Hab. {log.room_number}</span>
                    <TypeBadge type={log.type} />
                </div>
            </td>
            {/* Location */}
            <td className="py-2 px-2">
                <span className="text-xs text-[var(--color-text-muted)]">
                    {log.module_name}{log.floor_code ? ` · ${log.floor_code}` : ''}
                    {log.part_name ? <span className="text-[var(--color-text-secondary)]" > · {log.part_name}</span> : ''}
                </span>
            </td>
            {/* Description */}
            <td className="py-2 px-2 max-w-[220px]">
                {log.description
                    ? <span className="text-xs text-[var(--color-text-secondary)] truncate block" title={log.description}>{log.description}</span>
                    : <span className="text-xs text-[var(--color-text-muted)]">—</span>}
            </td>
            {/* Date */}
            <td className="py-2 px-2 whitespace-nowrap">
                <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
                    <Calendar className="w-3 h-3 shrink-0" />{formatDate(log.performed_at)}
                </span>
            </td>
            {/* User */}
            <td className="py-2 px-2 whitespace-nowrap">
                {log.user_name
                    ? <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
                        <User className="w-3 h-3 shrink-0" />{log.user_name}
                    </span>
                    : <span className="text-xs text-[var(--color-text-muted)]">—</span>}
            </td>
            {/* Actions */}
            <td className="py-2 pl-2 pr-3 w-16">
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                    <button onClick={() => onViewRoom(log.room_id)} title="Ver habitación"
                        className="p-1.5 rounded-md hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)] text-[var(--color-text-muted)] transition-colors">
                        <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => onDelete(log)} title="Eliminar"
                        className="p-1.5 rounded-md hover:bg-red-500/10 hover:text-red-500 text-[var(--color-text-muted)] transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </td>
        </tr>
    );
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function MaintenanceHistory() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [toDelete, setToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const [saving, setSaving] = useState(false);
    const [stats, setStats] = useState(null);

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams();
            if (typeFilter !== 'all') params.set('type', typeFilter);

            const [logsRes, statsRes] = await Promise.all([
                fetch(`/api/maintenance?${params}`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch('/api/maintenance/stats', { headers: { Authorization: `Bearer ${token}` } }),
            ]);
            const logsData = await logsRes.json();
            const statsData = await statsRes.json();
            setLogs(logsData.logs || []);
            setStats(statsData.stats || null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [typeFilter]);

    useEffect(() => { fetchLogs(); }, [fetchLogs]);

    const handleDelete = async () => {
        if (!toDelete) return;
        setDeleting(true);
        try {
            const token = localStorage.getItem('token');
            await fetch(`/api/maintenance/${toDelete.id}`, {
                method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
            });
            setLogs(prev => prev.filter(l => l.id !== toDelete.id));
            setToDelete(null);
        } catch { } finally { setDeleting(false); }
    };

    const handleCreate = async (data) => {
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            await fetch('/api/maintenance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(data),
            });
            setShowCreate(false);
            fetchLogs();
        } catch { } finally { setSaving(false); }
    };

    // Filter by search
    const filtered = logs.filter(l => {
        const q = search.toLowerCase();
        return l.room_number.toLowerCase().includes(q) ||
            (l.module_name || '').toLowerCase().includes(q) ||
            (l.part_name || '').toLowerCase().includes(q) ||
            (l.description || '').toLowerCase().includes(q);
    });

    return (
        <div className="py-6 px-4 lg:px-8 w-full">
            <div className="mx-auto max-w-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div className="mb-0">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="p-2.5 rounded-xl bg-[var(--color-primary)]/10">
                                <Wrench className="w-6 h-6 text-[var(--color-primary)]" />
                            </div>
                            <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">
                                Mantenimiento
                            </h1>
                        </div>
                        <p className="text-[var(--color-text-secondary)] ml-1">
                            Control de cerraduras electrónicas y mantenimiento preventivo
                        </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={() => navigate('/maintenance/dashboard')}
                            className="flex items-center gap-2 px-4 py-2.5 border border-[var(--color-border)] text-sm font-medium rounded-xl text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] transition-colors"
                        >
                            <BarChart3 className="w-4 h-4" />
                            Dashboard
                        </button>
                        <button
                            onClick={() => setShowCreate(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Registrar
                        </button>
                    </div>
                </div>

                {/* Stats */}
                {stats && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                        <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl p-4 shadow-sm">
                            <p className="text-xs text-[var(--color-text-muted)] mb-0.5">Total registros</p>
                            <p className="text-2xl font-bold text-[var(--color-text-primary)]">{stats.total}</p>
                        </div>
                        <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl p-4 shadow-sm">
                            <p className="text-xs text-[var(--color-text-muted)] mb-0.5">Este mes</p>
                            <p className="text-2xl font-bold text-[var(--color-text-primary)]">{stats.this_month}</p>
                        </div>
                        <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl p-4 shadow-sm">
                            <p className="text-xs text-[var(--color-text-muted)] mb-0.5 flex items-center gap-1"><Battery className="w-3 h-3" /> Baterías</p>
                            <p className="text-2xl font-bold text-green-500">{stats.battery_changes}</p>
                        </div>
                        <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl p-4 shadow-sm">
                            <p className="text-xs text-[var(--color-text-muted)] mb-0.5 flex items-center gap-1"><Cog className="w-3 h-3" /> Mecánicos</p>
                            <p className="text-2xl font-bold text-orange-500">{stats.mechanical_repairs}</p>
                        </div>
                    </div>
                )}

                {/* Search + filter */}
                <div className="flex flex-col sm:flex-row gap-3 mb-5">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                        <input
                            type="text" value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Buscar por habitación, módulo o pieza…"
                            className="w-full pl-10 pr-10 py-2.5 text-sm bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:outline-none"
                        />
                        {search && (
                            <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    <div className="flex gap-1.5">
                        {[
                            { value: 'all', label: 'Todos' },
                            { value: 'battery', label: 'Batería', icon: Battery },
                            { value: 'mechanical', label: 'Mecánico', icon: Cog },
                        ].map(f => {
                            const Icon = f.icon;
                            return (
                                <button key={f.value}
                                    onClick={() => setTypeFilter(f.value)}
                                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${typeFilter === f.value
                                        ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)]/30 text-[var(--color-primary)]'
                                        : 'bg-[var(--color-bg-secondary)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]'
                                        }`}
                                >
                                    {Icon && <Icon className="w-3.5 h-3.5" />}
                                    {f.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex items-center justify-center py-24">
                        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center gap-3 py-16 text-center">
                        <AlertCircle className="w-10 h-10 text-red-400" />
                        <p className="text-sm text-[var(--color-text-secondary)]">{error}</p>
                        <button onClick={fetchLogs} className="text-sm text-[var(--color-primary)] hover:underline">Reintentar</button>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-5">
                        <div className="w-20 h-20 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] flex items-center justify-center shadow-inner">
                            <Wrench className="w-10 h-10 text-[var(--color-text-muted)]" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-1">Sin registros de mantenimiento</h3>
                            <p className="text-sm text-[var(--color-text-secondary)] max-w-xs">Registra el primer mantenimiento para comenzar a trackear el estado de las cerraduras.</p>
                        </div>
                        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white text-sm font-medium rounded-xl transition-colors">
                            <Plus className="w-4 h-4" /> Primer registro
                        </button>
                    </div>
                ) : (
                    <>
                        <p className="text-xs text-[var(--color-text-muted)] mb-2">
                            {filtered.length} {filtered.length === 1 ? 'registro' : 'registros'}
                            {search ? ` encontrados para "${search}"` : ''}
                        </p>
                        <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl overflow-hidden">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-tertiary)]">
                                        <th className="py-2 pl-3 pr-2 w-8"></th>
                                        <th className="py-2 px-2 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">Habitación</th>
                                        <th className="py-2 px-2 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">Ubicación</th>
                                        <th className="py-2 px-2 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">Descripción</th>
                                        <th className="py-2 px-2 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">Fecha</th>
                                        <th className="py-2 px-2 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">Técnico</th>
                                        <th className="py-2 pl-2 pr-3 w-16"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map(log => (
                                        <LogRow
                                            key={log.id}
                                            log={log}
                                            onDelete={setToDelete}
                                            onViewRoom={(roomId) => navigate(`/maintenance/room/${roomId}`)}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>

            {/* Modals */}
            {toDelete && <DeleteModal log={toDelete} onConfirm={handleDelete} onCancel={() => setToDelete(null)} loading={deleting} />}
            {showCreate && <CreateModal onSave={handleCreate} onCancel={() => setShowCreate(false)} saving={saving} />}
        </div>
    );
}
