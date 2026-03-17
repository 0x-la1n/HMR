import { Shield } from 'lucide-react';

export default function VehicleControl() {
    return (
        <div className="py-6 w-full px-4 lg:px-8">
            <div className="mx-auto max-w-auto">
                <div className="mb-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 rounded-xl bg-[var(--color-primary)]/10">
                            <Shield className="w-6 h-6 text-[var(--color-primary)]" />
                        </div>
                        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">Seguridad</h1>
                    </div>
                    <p className="text-[var(--color-text-secondary)]">Control de Vehiculos</p>
                </div>

                <div className="bg-[var(--color-bg-secondary)] rounded-xl border border-[var(--color-border)] shadow-sm overflow-hidden">
                    <div className="p-6 bg-[var(--color-bg-primary)]">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-[var(--color-bg-tertiary)] rounded-lg">
                                <div className="w-2 h-2 rounded-full bg-[var(--color-text-muted)]" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-[var(--color-text-primary)]">Módulo en construcción</p>
                                <p className="text-sm text-[var(--color-text-muted)]">
                                    Aquí irá el registro y control de accesos de vehículos.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

