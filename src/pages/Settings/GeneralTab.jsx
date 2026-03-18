import React, { useState } from 'react';
import { Globe, Building2, UploadCloud, Save } from 'lucide-react';

/**
 * Subcomponent to render form fields with a label.
 * Reduces code repetition and maintains consistent styling.
 */
function InputGroup({ label, defaultValue, type = "text", placeholder, className = "", colSpan = "", icon: Icon }) {
    return (
        <div className={`flex flex-col gap-1.5 ${colSpan} ${className}`}>
            <label className="text-sm font-medium text-[var(--color-text-primary)]">
                {label}
            </label>
            <div className="relative">
                {Icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
                        <Icon size={16} />
                    </div>
                )}
                <input
                    type={type}
                    defaultValue={defaultValue}
                    placeholder={placeholder}
                    className={`
                        w-full bg-[var(--color-bg-primary)] border border-[var(--color-border)]
                        text-sm rounded-lg px-3 py-2 text-[var(--color-text-primary)]
                        placeholder-[var(--color-text-muted)]
                        focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]
                        transition-all
                        ${Icon ? 'pl-9' : ''}
                    `}
                />
            </div>
        </div>
    );
}

/**
 * Component for the "General" tab in Settings.
 * Handles Hotel Corporate Profile: Branding, Fiscal Data, and Contact Info.
 */
export default function GeneralTab() {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        // Handle file drop logic here (not implemented for UI demo)
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300 pb-10">
            
            {/* ── Header ───────────────────────────────────────────────────────── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
                        Perfil Corporativo del Hotel
                    </h2>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                        Gestiona la identidad visual, información fiscal y datos de contacto públicos.
                    </p>
                </div>
                <button className="flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white px-4 py-2 rounded-full font-medium shadow-sm transition-colors active:scale-95">
                    <Save size={18} />
                    <span>Guardar Cambios</span>
                </button>
            </div>

            {/* ── Bloque 1: Identidad Visual (Branding) ────────────────────────── */}
            <div className="bg-[var(--color-bg-secondary)] rounded-xl border border-[var(--color-border)] overflow-hidden shadow-sm">
                <div className="p-4 border-b border-[var(--color-border)] flex items-center gap-3 bg-[var(--color-bg-tertiary)]/30">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-600">
                        <Globe size={20} />
                    </div>
                    <h3 className="font-semibold text-[var(--color-text-primary)]">
                        Identidad Visual
                    </h3>
                </div>
                
                <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Logo Upload Area */}
                    <div className="lg:col-span-1">
                        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                            Logotipo del Hotel
                        </label>
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`
                                border-2 border-dashed rounded-xl h-48 flex flex-col items-center justify-center gap-3 p-4 text-center transition-colors cursor-pointer
                                ${isDragging 
                                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5' 
                                    : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-bg-tertiary)]'
                                }
                            `}
                        >
                            <div className="p-3 bg-[var(--color-bg-tertiary)] rounded-full">
                                <UploadCloud className="w-6 h-6 text-[var(--color-text-muted)]" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-[var(--color-text-primary)]">
                                    Haz clic o arrastra tu logo aquí
                                </p>
                                <p className="text-xs text-[var(--color-text-muted)]">
                                    PNG, JPG o SVG (máx. 2MB)
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Inputs */}
                    <div className="lg:col-span-2 space-y-5">
                        <InputGroup 
                            label="Nombre Comercial" 
                            defaultValue="Hotel Horizonte" 
                            placeholder="Ej. Grand Hotel Central"
                        />
                        
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-[var(--color-text-primary)]">
                                Categoría Oficial
                            </label>
                            <select className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-sm rounded-lg px-3 py-2 text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]">
                                <option value="5">5 Estrellas</option>
                                <option value="4">4 Estrellas</option>
                                <option value="3">3 Estrellas</option>
                                <option value="boutique">Hotel Boutique</option>
                                <option value="resort">Resort</option>
                                <option value="posada">Posada</option>
                            </select>
                        </div>

                        <InputGroup 
                            label="Eslogan Comercial" 
                            defaultValue="Donde el descanso encuentra el horizonte." 
                            placeholder="Frase corta que define tu marca"
                        />
                    </div>
                </div>
            </div>

            {/* ── Bloque 2: Datos Fiscales y Contacto ──────────────────────────── */}
            <div className="bg-[var(--color-bg-secondary)] rounded-xl border border-[var(--color-border)] overflow-hidden shadow-sm">
                <div className="p-4 border-b border-[var(--color-border)] flex items-center gap-3 bg-[var(--color-bg-tertiary)]/30">
                    <div className="p-2 bg-purple-500/10 rounded-lg text-purple-600">
                        <Building2 size={20} />
                    </div>
                    <h3 className="font-semibold text-[var(--color-text-primary)]">
                        Datos Fiscales y Contacto
                    </h3>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                    <InputGroup 
                        label="Razón Social (Empresa)" 
                        defaultValue="Inversiones Horizonte C.A." 
                        placeholder="Nombre legal completo"
                    />
                    
                    <InputGroup 
                        label="Registro de Información Fiscal (RIF)" 
                        defaultValue="J-12345678-9" 
                        placeholder="Ej. J-00000000-0"
                    />

                    <div className="flex flex-col gap-1.5 md:col-span-2">
                        <label className="text-sm font-medium text-[var(--color-text-primary)]">
                            Dirección Fiscal Completa
                        </label>
                        <textarea 
                            rows="3"
                            className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-sm rounded-lg px-3 py-2 text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] transition-all resize-none"
                            defaultValue="Av. Principal de Lechería, Edificio Costa, Piso 1, Estado Anzoátegui, Venezuela."
                        ></textarea>
                    </div>

                    <InputGroup 
                        label="Teléfono de Recepción" 
                        defaultValue="+58 (281) 555-0199" 
                        type="tel"
                    />
                    
                    <InputGroup 
                        label="Correo Electrónico Oficial" 
                        defaultValue="contacto@hotelhorizonte.com" 
                        type="email"
                    />

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-[var(--color-text-primary)]">
                            Zona Horaria Predeterminada
                        </label>
                        <select className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-sm rounded-lg px-3 py-2 text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]">
                            <option value="America/Caracas">America/Caracas (GMT-4)</option>
                            <option value="America/Bogota">America/Bogota (GMT-5)</option>
                            <option value="America/New_York">America/New_York (GMT-5)</option>
                            <option value="Europe/Madrid">Europe/Madrid (GMT+1)</option>
                        </select>
                    </div>

                    <InputGroup 
                        label="Sitio Web" 
                        defaultValue="https://www.hotelhorizonte.com" 
                        placeholder="https://"
                    />
                </div>
            </div>

        </div>
    );
}