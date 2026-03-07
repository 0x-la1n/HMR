import React, { useState, useRef } from 'react';
import { Settings as SettingsIcon, User, Mail, PhoneCall, Copy, CheckCircle, Smartphone, Globe } from 'lucide-react';

export default function Signatures() {
    // ==== ESTADO DEL FORMULARIO ====
    // Campos editables
    const [formData, setFormData] = useState({
        fullName: 'JOSÉ HERNÁNDEZ',
        jobTitle: 'ING DE SISTEMAS',
        email: 'sistemas@margaritareal.com.ve',
        mobilePhone: '+58 414-7860568',
    });

    const [isCopied, setIsCopied] = useState(false);
    const signatureRef = useRef(null);

    // Campos fijos (Configurables a futuro desde la BD/Context)
    const fixedData = {
        officePhone: '+58 0295-5001300 Ext. 0000',
        website: 'www.hotelmargaritareal.com',
        address: 'Av. Aldonza Manrique, Final Calle Camarón, Hotel Margarita Real. Ofc. Admin. Pampatar, Edo. Nueva Esparta. Venezuela 6316'
    };

    const handleCopy = () => {
        if (!signatureRef.current) return;

        // Copiar HTML renderizado para Outlook/Gmail
        const range = document.createRange();
        range.selectNode(signatureRef.current);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);

        try {
            document.execCommand('copy');
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2500);
        } catch (err) {
            console.error('Failed to copy', err);
        }

        window.getSelection().removeAllRanges();
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="py-6 w-full px-4 lg:px-8">
            <div className="mx-auto max-w-auto">
                {/* Header */}
                <div className="mb-4">
                    <div className="flex items-center gap-3 mb-2">
                        <SettingsIcon className="w-8 h-8 text-[var(--color-primary)]" />
                        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">Firmas Corporativas</h1>
                    </div>
                    <p className="text-[var(--color-text-secondary)]">
                        Genera y personaliza la firma de correo electrónico oficial del Hotel Margarita Real.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* COLUMNA IZQUIERDA: Formulario */}
                    <div className="bg-[var(--color-bg-secondary)] rounded-xl border border-[var(--color-border)] shadow-sm p-6 overflow-y-auto">
                        <h2 className="text-lg font-medium text-[var(--color-text-primary)] mb-5">
                            Datos del Colaborador
                        </h2>

                        <div className="space-y-4">
                            {/* Nombre y Apellido */}
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
                                    Nombre y Apellido
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-3 py-2 text-sm bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                                        placeholder="NOMBRE Y APELLIDO"
                                    />
                                </div>
                            </div>

                            {/* Cargo */}
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
                                    Cargo o Departamento
                                </label>
                                <div className="relative">
                                    <SettingsIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                                    <input
                                        type="text"
                                        name="jobTitle"
                                        value={formData.jobTitle}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-3 py-2 text-sm bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                                        placeholder="CARGO/DEPARTAMENTO"
                                    />
                                </div>
                            </div>

                            {/* Correo */}
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
                                    Correo Electrónico
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-3 py-2 text-sm bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                                        placeholder="CORREO ELECTRÓNICO"
                                    />
                                </div>
                            </div>

                            {/* Celular (Editable) */}
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
                                    Teléfono Móvil
                                </label>
                                <div className="relative">
                                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                                    <input
                                        type="text"
                                        name="mobilePhone"
                                        value={formData.mobilePhone}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-3 py-2 text-sm bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                                        placeholder="TELÉFONO MÓVIL"
                                    />
                                </div>
                            </div>

                            <hr className="my-6 border-[var(--color-border)]" />

                            <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">
                                Datos de Empresa
                            </h3>

                            {/* Fixed Fields Preview */}
                            <div className="grid grid-cols-1 gap-3">
                                <div className="p-3 bg-[var(--color-bg-tertiary)] bg-opacity-50 rounded-lg border border-[var(--color-border)] flex items-start gap-3">
                                    <PhoneCall className="w-4 h-4 text-[var(--color-text-muted)] shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">Telf. Oficina / Ext</p>
                                        <p className="text-sm text-[var(--color-text-primary)]">{fixedData.officePhone}</p>
                                    </div>
                                </div>
                                <div className="p-3 bg-[var(--color-bg-tertiary)] bg-opacity-50 rounded-lg border border-[var(--color-border)] flex items-start gap-3">
                                    <Globe className="w-4 h-4 text-[var(--color-text-muted)] shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">Sitio Web</p>
                                        <p className="text-sm text-[var(--color-text-primary)]">{fixedData.website}</p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* COLUMNA DERECHA: Vista Previa */}
                    <div className="flex flex-col gap-4">
                        <div className="bg-[var(--color-bg-secondary)] rounded-xl border border-[var(--color-border)] shadow-sm p-6">
                            <div className="flex justify-between items-center mb-5">
                                <h2 className="text-lg font-medium text-[var(--color-text-primary)]">
                                    Vista Previa en Vivo
                                </h2>
                                <button
                                    onClick={handleCopy}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isCopied
                                        ? 'bg-[var(--color-success)]/10 text-[var(--color-success)] border border-[var(--color-success)]/30'
                                        : 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-light)]'
                                        }`}
                                >
                                    {isCopied ? (
                                        <><CheckCircle className="w-4 h-4" /> Copiada con éxito</>
                                    ) : (
                                        <><Copy className="w-4 h-4" /> Copiar Firma</>
                                    )}
                                </button>
                            </div>

                            {/* Contenedor de la vista previa real (Con fondo oscuro para separar la firma blanca del resto) */}
                            <div className="bg-[var(--color-bg-primary)] rounded-lg p-6 border border-[var(--color-border)] overflow-x-auto flex justify-center items-center">

                                {/* Contenedor específico de la firma (Blanco para el texto) que se copia al portapapeles */}
                                <div ref={signatureRef} style={{ width: '567px' }}>
                                    <table cellPadding="0" cellSpacing="0" border="0" style={{ margin: 0, padding: 0, fontFamily: 'Arial, sans-serif', width: '567px', backgroundColor: '#ffffff' }}>
                                        <tbody>
                                            <tr>
                                                {/* COLUMNA LOGO */}
                                                <td width="200" style={{ width: '200px', backgroundColor: '#0f7681', padding: '0', textAlign: 'center', verticalAlign: 'middle', height: '128px' }}>
                                                    <img
                                                        src="/img/logo-hmr-main-white-.png"
                                                        alt="Hotel Margarita Real"
                                                        width="170"
                                                        style={{ display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto' }}
                                                    />
                                                </td>

                                                {/* ESPACIADOR VERTICAL */}
                                                <td width="15" style={{ width: '15px' }}>&nbsp;</td>

                                                {/* COLUMNA DATOS PERSONALES */}
                                                <td style={{ verticalAlign: 'middle', padding: '8px 0 8px 12px', backgroundColor: '#ffffff' }}>
                                                    {/* Nombre y Cargo */}
                                                    <table cellPadding="0" cellSpacing="0" border="0" style={{ margin: 0, padding: 0 }}>
                                                        <tbody>
                                                            <tr>
                                                                <td style={{ margin: 0, padding: 0, fontFamily: 'Arial, sans-serif' }}>
                                                                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#0f7681', textTransform: 'uppercase' }}>
                                                                        {formData.fullName || 'NOMBRE APELLIDO'}
                                                                    </span>
                                                                    <span style={{ color: '#ababab', margin: '0 8px' }}>|</span>
                                                                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#7a7a7a', textTransform: 'uppercase' }}>
                                                                        {formData.jobTitle || 'CARGO'}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                            {/* Correo Electrónico */}
                                                            <tr>
                                                                <td style={{ margin: 0, paddingTop: '4px', paddingBottom: '4px', fontFamily: 'Arial, sans-serif' }}>
                                                                    <a href={`mailto:${formData.email}`} style={{ fontSize: '12px', fontWeight: 'bold', color: '#555555', textDecoration: 'none' }}>
                                                                        {formData.email || 'correo@margaritareal.com.ve'}
                                                                    </a>
                                                                </td>
                                                            </tr>
                                                            {/* Telefonos */}
                                                            <tr>
                                                                <td style={{ margin: 0, paddingBottom: '4px', fontFamily: 'Arial, sans-serif' }}>
                                                                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#0f7681' }}>
                                                                        {fixedData.officePhone} {formData.mobilePhone && `Teléf: ${formData.mobilePhone}`}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                            {/* Web */}
                                                            <tr>
                                                                <td style={{ margin: 0, paddingBottom: '3px', fontFamily: 'Arial, sans-serif' }}>
                                                                    <a href={`https://${fixedData.website}`} style={{ fontSize: '11px', fontWeight: 'bold', color: '#0f7681', textDecoration: 'none' }}>
                                                                        {fixedData.website}
                                                                    </a>
                                                                </td>
                                                            </tr>
                                                            {/* Direccion */}
                                                            <tr>
                                                                <td style={{ margin: 0, padding: 0, fontFamily: 'Arial, sans-serif' }}>
                                                                    <span style={{ fontSize: '10px', color: '#555555', lineHeight: '1.2', display: 'block' }}>
                                                                        Av. Aldonza Manrique, Final Calle Camarón, Hotel Margarita Real. Ofc. Admin.<br />
                                                                        Pampatar, Edo. Nueva Esparta. Venezuela 6316
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                {/* FIN DE LA FIRMA */}

                            </div>
                        </div>

                        {/* Information card */}
                        <div className="bg-[#0f7681]/10 border border-[#0f7681]/20 rounded-xl p-4 flex gap-3">
                            <SettingsIcon className="w-5 h-5 text-[#0f7681] shrink-0 mt-0.5" />
                            <div className="text-sm text-[var(--color-text-secondary)]">
                                <p className="font-medium text-[#0f7681] mb-1">Instrucciones de uso:</p>
                                <ol className="list-decimal pl-4 space-y-1">
                                    <li>Completa tus datos personales en el formulario de la izquierda.</li>
                                    <li>Haz clic en <strong>Copiar Firma</strong> para guardar el código en el portapapeles.</li>
                                    <li>Abre la configuración de firmas de tu cliente de correo (Outlook, Gmail).</li>
                                    <li>Pega el contenido usando <kbd className="px-1.5 py-0.5 bg-white/20 border border-black/10 rounded text-xs text-black">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-white/20 border border-black/10 rounded text-xs text-black">V</kbd> en el campo correspondiente.</li>
                                    <li>Guarda los cambios en tu correo.</li>
                                </ol>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
