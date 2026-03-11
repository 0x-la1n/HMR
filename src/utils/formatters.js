export function formatDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('es-VE', {
        day: '2-digit', 
        month: 'short', 
        year: 'numeric'
    });
}
