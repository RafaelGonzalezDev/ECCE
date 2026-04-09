import ColorPicker from '@/components/ColorPicker';
import PermissionGuard from '@/components/PermissionGuard';

export const metadata = {
    title: 'Ajustes de Tema - Personalizador',
    description: 'Personaliza la apariencia de tu aplicación',
};

function SettingsPageContent() {
    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-8">
                <h1 className="text-4xl font-extrabold tracking-tight mb-2">Apariencia</h1>
                <p className="text-lg opacity-70">
                    Personaliza el aspecto visual de todo el sistema.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <section>
                    <ColorPicker />
                </section>

                <section className="space-y-6">
                    <div className="bg-white/5 dark:bg-black/5 backdrop-blur-lg rounded-2xl p-8 border border-primary/10">
                        <h3 className="text-xl font-bold mb-4">Vista Previa</h3>
                        <p className="opacity-80 mb-6">
                            Los cambios aplicados aquí se reflejarán instantáneamente en todas las páginas y componentes. Intenta interactuar con estos elementos de prueba.
                        </p>

                        <div className="space-y-4">
                            <button className="w-full bg-primary text-white py-3 rounded-xl font-medium shadow-lg shadow-primary/30 transition-transform active:scale-95">
                                Botón Principal
                            </button>

                            <button className="w-full border-2 border-primary text-primary py-3 rounded-xl font-medium hover:bg-primary/5 transition-colors active:scale-95">
                                Botón Secundario
                            </button>

                            <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-center space-x-4">
                                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                                    i
                                </div>
                                <div>
                                    <h4 className="font-semibold">Alerta de Información</h4>
                                    <p className="text-sm opacity-70">Esta alerta adopta el tono del color principal.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

export default function SettingsPage() {
    return (
        <PermissionGuard require="settings:read" moduleName="Ajustes">
            <SettingsPageContent />
        </PermissionGuard>
    );
}
