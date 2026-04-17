import React, { useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FileSignature, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';

import SignatureForm from '../components/Signatures/SignatureForm';
import SignaturePreview from '../components/Signatures/SignaturePreview';
import SignatureInstructions from '../components/Signatures/SignatureInstructions';

export default function Signatures() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // ==== ESTADO DEL FORMULARIO ====
    const [formData, setFormData] = useState({
        fullName: searchParams.get('fullName') || '',
        jobTitle: searchParams.get('jobTitle') || '',
        email: searchParams.get('email') || '',
        extension: searchParams.get('extension') || '',
        mobilePhone: searchParams.get('mobilePhone') || '',
    });

    const [currentId, setCurrentId] = useState(searchParams.get('id') || null);
    const [saveStatus, setSaveStatus] = useState(null); // null | 'saving' | 'saved' | 'error'

    const placeholders = {
        fullName: 'NOMBRE APELLIDO',
        jobTitle: 'CARGO',
        email: 'correo@margaritareal.com.ve',
        extension: '0000',
        mobilePhone: '+58 414-0000000',
    };

    const [isDownloading, setIsDownloading] = useState(false);
    const signatureRef = useRef(null);

    const fixedData = {
        officePhone: 'Ofic: +58 0295-5001300',
        website: 'www.hotelmargaritareal.com',
        address: 'Av. Aldonza Manrique, Final Calle Camarón, Hotel Margarita Real. Ofc. Admin. Pampatar, Edo. Nueva Esparta. Venezuela 6316'
    };

    const isFormValid = formData.fullName.trim() !== '' && 
                        formData.jobTitle.trim() !== '' && 
                        formData.email.trim() !== '' && 
                        formData.extension.trim() !== '';

    const handleDownload = async () => {
        if (!signatureRef.current || !isFormValid) return;
        setIsDownloading(true);

        try {
            const element = signatureRef.current;
            const outerTable = element.querySelector('table');
            const dataTd = outerTable.querySelectorAll('tr > td')[2];

            const origHeight = outerTable.style.height;
            const origMaxHeight = outerTable.style.maxHeight;
            const origPadding = dataTd ? dataTd.style.padding : '';

            // Ocultar placeholders de exportación
            const placeholdersToHide = element.querySelectorAll('.export-hide');
            const originalDisplays = [];
            placeholdersToHide.forEach(el => {
                originalDisplays.push(el.style.display);
                el.style.display = 'none';
            });

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

            // Restaurar placeholders
            placeholdersToHide.forEach((el, index) => {
                el.style.display = originalDisplays[index];
            });

            const image = canvas.toDataURL('image/jpeg', 0.9);
            const link = document.createElement('a');
            link.href = image;
            link.download = `firma_${formData.fullName.replace(/\s+/g, '_').toLowerCase() || 'colaborador'}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Guardar en DB
            if (formData.fullName && formData.jobTitle) {
                setSaveStatus('saving');
                try {
                    const token = localStorage.getItem('token');
                    const endpoint = currentId ? `/api/signatures/${currentId}` : '/api/signatures';
                    const method = currentId ? 'PUT' : 'POST';

                    const res = await fetch(endpoint, {
                        method: method,
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

                    if (!res.ok) throw new Error('Error saving signature');
                    const data = await res.json();

                    // Si era nuevo, actualizamos el ID actual para futuras descargas
                    if (!currentId && data.signature?.id) {
                        setCurrentId(data.signature.id);
                        setSearchParams(prev => {
                            prev.set('id', data.signature.id);
                            return prev;
                        }, { replace: true });
                    }

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

    const handleClear = () => {
        setFormData({
            fullName: '',
            jobTitle: '',
            email: '',
            extension: '',
            mobilePhone: ''
        });
        setCurrentId(null);
        setSearchParams(new URLSearchParams(), { replace: true });
    };

    return (
        <div className="py-6 w-full px-4 lg:px-8">
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
                            {currentId ? 'Editar Firma' : 'Nueva Firma'}
                        </h1>
                    </div>
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
                    <SignatureForm 
                        formData={formData} 
                        setFormData={setFormData} 
                        handleClear={handleClear} 
                        fixedData={fixedData} 
                    />

                    {/* COLUMNA DERECHA: Vista Previa e Instrucciones */}
                    <div className="lg:col-span-2 flex flex-col gap-4">
                        <SignaturePreview 
                            formData={formData} 
                            fixedData={fixedData} 
                            placeholders={placeholders} 
                            isFormValid={isFormValid} 
                            isDownloading={isDownloading} 
                            handleDownload={handleDownload}
                            signatureRef={signatureRef} 
                        />
                        <SignatureInstructions />
                    </div>
                </div>
            </div>
        </div>
    );
}
