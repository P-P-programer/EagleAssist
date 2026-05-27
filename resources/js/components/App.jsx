import React from 'react';
import { ToastProvider, useToast } from './ToastProvider';

function StatCard({ label, value, note }) {
    return (
        <div className="rounded-[24px] border border-brand-100 bg-white/80 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-600">{label}</p>
            <p className="mt-2 text-3xl font-bold text-ink">{value}</p>
            <p className="mt-2 text-sm text-muted">{note}</p>
        </div>
    );
}

function PrototypeCard({ title, eyebrow, description, actionLabel, accent, onAction }) {
    return (
        <section className="glass-panel flex h-full flex-col justify-between p-6 md:p-7">
            <div>
                <span className="field-chip">{eyebrow}</span>
                <h2 className="mt-4 text-2xl font-semibold text-ink">{title}</h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-muted">{description}</p>
            </div>

            <div className="mt-6 flex items-center justify-between gap-4 rounded-[22px] border border-brand-100 bg-brand-50/70 p-4">
                <div>
                    <p className="text-sm font-semibold text-ink">{accent}</p>
                    <p className="mt-1 text-xs leading-5 text-muted">Diseñado para conectarse luego con la API de asistencia y el flujo de biometría.</p>
                </div>

                <button type="button" className="soft-button-primary shrink-0" onClick={onAction}>
                    {actionLabel}
                </button>
            </div>
        </section>
    );
}

function Dashboard() {
    const { pushToast } = useToast();

    const handleToast = (message) => {
        pushToast({
            title: 'Listo',
            message,
            tone: 'success',
        });
    };

    return (
        <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 md:px-6 md:py-8 lg:px-8">
            <header className="glass-panel flex flex-col gap-6 px-6 py-6 md:px-8 md:py-7 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-2xl">
                    <span className="field-chip">EagleAssist · ESP32 + Laravel</span>
                    <h1 className="mt-4 text-4xl font-black tracking-tight text-ink md:text-5xl">
                        Reconocimiento facial y asistencia con una interfaz clara y reutilizable.
                    </h1>
                    <p className="mt-4 text-base leading-7 text-muted">
                        Frontend en React, estilos con Vite y Tailwind, rutas de API separadas y una base pensada para crecer sin perder orden.
                    </p>
                </div>

                <div className="grid w-full gap-4 sm:grid-cols-3 lg:w-[420px]">
                    <StatCard label="Componente" value="2" note="Registro facial y validación de asistencia" />
                    <StatCard label="Base de datos" value="MySQL" note="Suficiente para prototipo y datos biométricos iniciales" />
                    <StatCard label="Estado" value="Local" note="Compatible con localhost y listo para túnel HTTPS en despliegue" />
                </div>
            </header>

            <section className="mt-6 grid gap-6 lg:grid-cols-2">
                <PrototypeCard
                    eyebrow="Módulo 01"
                    title="Registrar rostro"
                    description="Captura, validación inicial y persistencia del registro facial para asociarlo a un usuario, ID interno o credencial del sistema."
                    actionLabel="Simular registro"
                    accent="Alta seguridad de captura"
                    onAction={() => handleToast('Se preparó el flujo para registrar un nuevo rostro.')}
                />
                <PrototypeCard
                    eyebrow="Módulo 02"
                    title="Validar asistencia"
                    description="Consulta los rostros ya registrados y genera el evento de asistencia con marca de tiempo, estado y trazabilidad."
                    actionLabel="Simular asistencia"
                    accent="Control en tiempo real"
                    onAction={() => handleToast('Se preparó el flujo para validar la asistencia.')}
                />
            </section>

            <section className="mt-6 glass-panel p-6 md:p-7">
                <div className="grid gap-4 md:grid-cols-3">
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">Notas de arquitectura</h3>
                        <p className="mt-2 text-sm leading-6 text-muted">
                            MySQL es una buena elección para prototipo. Si más adelante guardas embeddings faciales y haces búsqueda por similitud a gran escala, ahí sí convendría evaluar una base vectorial o PostgreSQL con pgvector.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">API de reconocimiento</h3>
                        <p className="mt-2 text-sm leading-6 text-muted">
                            Sí conviene una API backend para persistir y comparar resultados. La inferencia puede vivir en el cliente, en una API propia o en un servicio aparte; para prototipo basta con Laravel como orquestador.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">Cámara y HTTPS</h3>
                        <p className="mt-2 text-sm leading-6 text-muted">
                            En localhost normalmente no tendrás el bloqueo por cámara porque el navegador lo trata como contexto seguro. En hosting sí necesitarás HTTPS o un túnel como Cloudflare para acceso a webcam.
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
}

export default function App() {
    return (
        <ToastProvider>
            <Dashboard />
        </ToastProvider>
    );
}