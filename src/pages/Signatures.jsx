import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Settings as SettingsIcon, User, Mail, PhoneCall, Download, CheckCircle, Smartphone, Globe, Loader2, FileSignature, Monitor, Eraser, ArrowLeft, Save } from 'lucide-react';
import html2canvas from 'html2canvas';

export default function Signatures() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // ==== ESTADO DEL FORMULARIO ====
    // Pre-cargar desde URL si viene de editar
    const [formData, setFormData] = useState({
        fullName: searchParams.get('fullName') || '',
        jobTitle: searchParams.get('jobTitle') || '',
        email: searchParams.get('email') || '',
        extension: searchParams.get('extension') || '',
        mobilePhone: searchParams.get('mobilePhone') || '',
    });

    const editingId = searchParams.get('id') || null;
    const [saveStatus, setSaveStatus] = useState(null); // null | 'saving' | 'saved' | 'error'

    // Placeholders para la vista previa
    const placeholders = {
        fullName: 'NOMBRE APELLIDO',
        jobTitle: 'CARGO',
        email: 'correo@margaritareal.com.ve',
        extension: '0000',
        mobilePhone: '+58 414-0000000',
    };

    // Estilos para el texto guía (placeholder) en la vista previa
    const previewPlaceholderStyle = { color: '#c0c0c0' };

    const [isDownloading, setIsDownloading] = useState(false);
    const signatureRef = useRef(null);

    const fixedData = {
        officePhone: 'Ofic: +58 0295-5001300',
        website: 'www.hotelmargaritareal.com',
        address: 'Av. Aldonza Manrique, Final Calle Camarón, Hotel Margarita Real. Ofc. Admin. Pampatar, Edo. Nueva Esparta. Venezuela 6316'
    };

    const handleDownload = async () => {
        if (!signatureRef.current) return;
        setIsDownloading(true);

        try {
            const element = signatureRef.current;
            const outerTable = element.querySelector('table');
            const dataTd = outerTable.querySelectorAll('tr > td')[2];

            const origHeight = outerTable.style.height;
            const origMaxHeight = outerTable.style.maxHeight;
            const origPadding = dataTd ? dataTd.style.padding : '';

            outerTable.style.height = 'auto';
            outerTable.style.maxHeight = 'none';
            if (dataTd) dataTd.style.padding = '8px 0 0 10px';

            const canvas = await html2canvas(element, {
                width: 567,
                height: 128,
                scale: 1,
                backgroundColor: '#ffffff',
                logging: false,
                useCORS: true
            });

            outerTable.style.height = origHeight;
            outerTable.style.maxHeight = origMaxHeight;
            if (dataTd) dataTd.style.padding = origPadding;

            const image = canvas.toDataURL('image/jpeg', 0.9);
            const link = document.createElement('a');
            link.href = image;
            link.download = `firma_${formData.fullName.replace(/\s+/g, '_').toLowerCase() || 'colaborador'}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Guardar en DB (solo si hay nombre y cargo)
            if (formData.fullName && formData.jobTitle) {
                setSaveStatus('saving');
                try {
                    const token = localStorage.getItem('token');
                    const method = 'POST';
                    const url = '/api/signatures';
                    await fetch(url, {
                        method,
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            full_name: formData.fullName,
                            job_title: formData.jobTitle,
                            email: formData.email,
                            mobile_phone: formData.mobilePhone || null,
                            extension: formData.extension || null,
                        }),
                    });
                    setSaveStatus('saved');
                    setTimeout(() => setSaveStatus(null), 3000);
                } catch {
                    setSaveStatus('error');
                    setTimeout(() => setSaveStatus(null), 3000);
                }
            }

            setIsDownloading(false);
        } catch (err) {
            console.error('Failed to download image', err);
            setIsDownloading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Validación específica para Nombre y Apellido y Cargo/Departamento
        if (name === 'fullName' || name === 'jobTitle') {
            // Solo permite letras (incluyendo acentos y ñ) y espacios.
            const regex = /[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g;
            const sanitizedValue = value.replace(regex, '');

            setFormData(prev => ({
                ...prev,
                [name]: sanitizedValue
            }));
            return;
        }

        // Validación para Extensión Telefónica
        if (name === 'extension') {
            // Solo permite números, guiones y símbolos de mayor/menor (< >)
            const regex = /[^0-9\-<>]/g;
            const sanitizedValue = value.replace(regex, '');

            setFormData(prev => ({
                ...prev,
                [name]: sanitizedValue
            }));
            return;
        }

        // Validación simple para correo electrónico (elimina espacios y caracteres inválidos básicos al vuelo)
        if (name === 'email') {
            // Permite caracteres alfanuméricos y símbolos comunes de email.
            const regex = /[^a-zA-Z0-9@._-]/g;
            const sanitizedValue = value.replace(regex, '');

            setFormData(prev => ({
                ...prev,
                [name]: sanitizedValue
            }));
            return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleClear = () => {
        setFormData({
            fullName: '',
            jobTitle: '',
            email: '',
            extension: '',
            mobilePhone: ''
        });
    };

    return (
        <div className="py-6 w-full px-4 lg:px-8" >
            <div className="mx-auto max-w-auto">
                {/* Header */}
                <div className="mb-4">
                    <button
                        onClick={() => navigate('/signatures')}
                        className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] mb-3 transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                        Volver al historial
                    </button>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 rounded-xl bg-[var(--color-primary)]/10">
                            <FileSignature className="w-6 h-6 text-[var(--color-primary)]" />
                        </div>
                        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">
                            {editingId ? 'Editar Firma' : 'Nueva Firma'}
                        </h1>
                    </div>
                    <p className="text-[var(--color-text-secondary)]">
                        Genera y personaliza la firma de correo electrónico oficial del Hotel Margarita Real.
                    </p>
                </div>

                {/* Toast de guardado */}
                {saveStatus && (
                    <div className={`mb-4 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${saveStatus === 'saving' ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20' :
                        saveStatus === 'saved' ? 'bg-green-500/10 text-green-600 border border-green-500/20' :
                            'bg-red-500/10 text-red-500 border border-red-500/20'
                        }`}>
                        {saveStatus === 'saving' && <Loader2 className="w-4 h-4 animate-spin" />}
                        {saveStatus === 'saved' && <CheckCircle className="w-4 h-4" />}
                        {saveStatus === 'saving' && 'Guardando firma en el historial…'}
                        {saveStatus === 'saved' && 'Firma guardada en el historial correctamente'}
                        {saveStatus === 'error' && 'No se pudo guardar en el historial (la descarga sí funcionó)'}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* COLUMNA IZQUIERDA: Formulario */}
                    <div className="lg:col-span-1 bg-[var(--color-bg-secondary)] rounded-xl border border-[var(--color-border)] shadow-sm p-6 overflow-y-auto">
                        <div className="flex justify-between items-center pb-4">
                            <h2 className="text-lg font-medium text-[var(--color-text-primary)] flex items-center gap-2 m-0">
                                <User className="w-7 h-7 text-[var(--color-primary)]" />
                                Datos del Colaborador
                            </h2>
                            <button
                                onClick={handleClear}
                                className="flex items-center justify-center p-2 rounded-lg bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)] hover:text-red-500 transition-colors border border-[var(--color-border)] hover:border-red-500/50"
                                title="Limpiar campos"
                            >
                                <Eraser className="w-4 h-4" />
                            </button>
                        </div>

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
                                        maxLength={18}
                                    />
                                </div>
                            </div>

                            {/* Cargo */}
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
                                    Cargo / Departamento
                                </label>
                                <div className="relative">
                                    <SettingsIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                                    <input
                                        type="text"
                                        name="jobTitle"
                                        value={formData.jobTitle}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-3 py-2 text-sm bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                                        placeholder="CARGO / DEPARTAMENTO"
                                        maxLength={18}
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
                                        maxLength={40}
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
                                        placeholder="+58 414-7860568"
                                        maxLength={15}
                                    />

                                </div>
                            </div>

                            {/* Extensión (Editable) */}
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
                                    Extensión Telefónica
                                </label>
                                <div className="relative">
                                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                                    <input
                                        type="text"
                                        name="extension"
                                        value={formData.extension}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-3 py-2 text-sm bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                                        placeholder="0000"
                                        maxLength={10}
                                    />

                                </div>
                            </div>

                            <div className="lg:col-span-1">
                                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
                                    Teléfono Oficina
                                </label>
                                {/* Fixed Fields Preview */}
                                <div className="grid grid-cols-1 gap-3 mb-3">
                                    <div className="p-3 bg-[var(--color-bg-tertiary)] bg-opacity-50 rounded-lg border border-[var(--color-border)] flex items-start gap-3">
                                        <PhoneCall className="w-4 h-4 text-[var(--color-text-muted)] shrink-0" />
                                        <div>
                                            <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">{fixedData.officePhone}</p>
                                        </div>
                                    </div>
                                </div>
                                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
                                    Sitio Web
                                </label>
                                <div className="grid grid-cols-1 gap-3">
                                    <div className="p-3 bg-[var(--color-bg-tertiary)] bg-opacity-50 rounded-lg border border-[var(--color-border)] flex items-start gap-3">
                                        <Globe className="w-4 h-4 text-[var(--color-text-muted)] shrink-0" />
                                        <div>
                                            <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">{fixedData.website}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* COLUMNA DERECHA: Vista Previa */}
                    <div className="lg:col-span-2 flex flex-col gap-4">
                        <div className="bg-[var(--color-bg-secondary)] rounded-xl border border-[var(--color-border)] shadow-sm p-6">
                            <div className="flex justify-between items-center mb-5">
                                <h2 className="text-lg font-medium text-[var(--color-text-primary)] flex items-center gap-2">
                                    <Monitor className="w-7 h-7 text-[var(--color-primary)]" />
                                    Vista Previa
                                </h2>
                                <button
                                    onClick={handleDownload}
                                    disabled={isDownloading}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isDownloading
                                        ? 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)] cursor-not-allowed'
                                        : 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-light)]'
                                        }`}
                                >
                                    {isDownloading ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" /> Descargando...</>
                                    ) : (
                                        <><Download className="w-4 h-4" /> Descargar</>
                                    )}
                                </button>
                            </div>

                            {/* Contenedor de la vista previa real (Con fondo oscuro para separar la firma blanca del resto) */}
                            <div className="bg-[var(--color-bg-primary)] rounded-lg p-6 border border-[var(--color-border)] overflow-x-auto flex justify-center items-center">

                                {/* Contenedor específico de la firma (Blanco para el texto) que se copia al portapapeles */}
                                <div ref={signatureRef} data-signature style={{ width: '567px', height: '128px', overflow: 'hidden' }}>
                                    <table cellPadding="0" cellSpacing="0" border="0" style={{ margin: 0, padding: 0, fontFamily: 'Arial, sans-serif', width: '567px', height: '128px', maxHeight: '128px', backgroundColor: '#ffffff', tableLayout: 'fixed' }}>
                                        <tbody>
                                            <tr>
                                                {/* COLUMNA LOGO */}
                                                <td width="200" style={{ width: '180px', backgroundColor: 'var(--color-primary)', padding: '0', textAlign: 'center', verticalAlign: 'middle', height: '128px' }}>
                                                    <img
                                                        src="/img/logo-hmr-main-white-.png"
                                                        alt="Hotel Margarita Real"
                                                        width="170"
                                                        style={{ display: 'block', margin: 'auto', maxWidth: '100%', height: 'auto' }}
                                                    />
                                                </td>

                                                {/* ESPACIADOR VERTICAL */}
                                                <td width="15" style={{ width: '5px' }}>&nbsp;</td>

                                                {/* COLUMNA DATOS PERSONALES */}
                                                <td style={{ verticalAlign: 'top', padding: '15px 0 0 10px', backgroundColor: '#ffffff', overflow: 'hidden' }}>
                                                    {/* Nombre y Cargo */}
                                                    <table cellPadding="0" cellSpacing="0" border="0" style={{ margin: 0, padding: 0, borderCollapse: 'collapse' }}>
                                                        <tbody>
                                                            <tr>
                                                                <td style={{ margin: 0, padding: '0 0 2px 0', fontFamily: 'Arial', lineHeight: '1' }}>
                                                                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: formData.fullName ? '#009098' : '#c0c0c0', textTransform: 'uppercase', lineHeight: '1' }}>
                                                                        {formData.fullName || placeholders.fullName}
                                                                    </span>
                                                                    <span style={{ color: '#009098', margin: '6px' }}>|</span>
                                                                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: formData.jobTitle ? '#555555' : '#c0c0c0', textTransform: 'uppercase', lineHeight: '1' }}>
                                                                        {formData.jobTitle || placeholders.jobTitle}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                            {/* Correo Electrónico */}
                                                            <tr>
                                                                <td style={{ margin: 0, padding: '2px 0', fontFamily: 'Arial', lineHeight: '0.5' }}>
                                                                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: formData.email ? '#555555' : '#c0c0c0', textDecoration: 'none', lineHeight: '1' }}>
                                                                        {formData.email || placeholders.email}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                            {/* Telefonos */}
                                                            <tr>
                                                                <td style={{ margin: 0, padding: '0', fontFamily: 'Arial', lineHeight: '1' }}>
                                                                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#009098', lineHeight: '1' }}>
                                                                        {fixedData.officePhone}
                                                                        {' '}
                                                                        <span style={formData.extension ? {} : previewPlaceholderStyle}>
                                                                            {`Ext: ${formData.extension || placeholders.extension}`}
                                                                        </span>
                                                                        {' '}
                                                                        <span style={formData.mobilePhone ? {} : previewPlaceholderStyle}>
                                                                            {`Teléf: ${formData.mobilePhone || placeholders.mobilePhone}`}
                                                                        </span>
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                            {/* Web */}
                                                            <tr>
                                                                <td style={{ margin: 0, padding: '2px 0', fontFamily: 'Arial', lineHeight: '1' }}>
                                                                    <a href={`https://${fixedData.website}`} style={{ fontSize: '11px', fontWeight: 'bold', color: '#009098', textDecoration: 'none', lineHeight: '1' }}>
                                                                        {fixedData.website}
                                                                    </a>
                                                                </td>
                                                            </tr>
                                                            {/* Direccion */}
                                                            <tr>
                                                                <td style={{ margin: 0, padding: '2px 0 0 0', fontFamily: 'Arial', lineHeight: '1' }}>
                                                                    <span style={{ fontSize: '10px', color: '#555555', lineHeight: '1.1', display: 'block' }}>
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
                            </div>
                        </div>

                        {/* Information card */}
                        <div className="bg-[#0f7681]/10 border border-[#0f7681]/20 rounded-xl p-4 flex gap-3">
                            <SettingsIcon className="w-5 h-5 text-[#0f7681] shrink-0 mt-0.5" />
                            <div className="text-sm text-[var(--color-text-secondary)]">
                                <p className="font-medium text-[#0f7681] mb-1">Instrucciones de uso:</p>
                                <ol className="list-decimal pl-4 space-y-1">
                                    <li>Completa tus datos personales en el formulario de la izquierda.</li>
                                    <li>Haz clic en <strong>Descargar</strong> para guardar la imagen de la firma en tu dispositivo.</li>
                                    <li>Abre la configuración de firmas de tu cliente de correo (Outlook, Gmail).</li>
                                    <li>Inserta la imagen descargada en el espacio de la firma.</li>
                                    <li>Guarda los cambios.</li>
                                </ol>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div >
    );
}
