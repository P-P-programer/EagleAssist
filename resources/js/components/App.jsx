import React, { useEffect, useMemo, useState } from 'react';
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

function SwitchButton({ active, label, onClick }) {
    return (
        <button
            type="button"
            className={`soft-button flex-1 border ${active ? 'border-brand-500 bg-brand-500 text-white shadow-[0_14px_30px_rgba(236,75,133,0.22)]' : 'soft-button-secondary'}`}
            onClick={onClick}
        >
            {label}
        </button>
    );
}

function TableRow({ faceId, person, action, time, date, status }) {
    return (
        <tr className="border-t border-brand-100/80">
            <td className="px-4 py-4 text-muted">#{faceId}</td>
            <td className="px-4 py-4 font-semibold text-ink">{person}</td>
            <td className="px-4 py-4 text-muted">{action}</td>
            <td className="px-4 py-4 text-muted">{time}</td>
            <td className="px-4 py-4 text-muted">{date}</td>
            <td className="px-4 py-4">
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${status === 'Entrada' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                    {status}
                </span>
            </td>
        </tr>
    );
}

function Dashboard() {
    const { pushToast } = useToast();
    const [fullName, setFullName] = useState('');
    const [selectedFaceId, setSelectedFaceId] = useState('');
    const [attendanceMode, setAttendanceMode] = useState('Entrada');
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoadingDemoData, setIsLoadingDemoData] = useState(true);
    const [registeredFaces, setRegisteredFaces] = useState([
        { id: 1, name: 'Test User', registeredAt: '08:00', isActive: true },
        { id: 2, name: 'Maria Lopez', registeredAt: '08:15', isActive: true },
        { id: 3, name: 'Carlos Perez', registeredAt: '08:32', isActive: true },
    ]);
    const [attendanceRecords, setAttendanceRecords] = useState([
        { id: 1, faceId: 1, person: 'Test User', action: 'Entrada', time: '08:05', date: '2026-05-27', status: 'Entrada' },
        { id: 2, faceId: 1, person: 'Test User', action: 'Salida', time: '12:02', date: '2026-05-27', status: 'Salida' },
        { id: 3, faceId: 2, person: 'Maria Lopez', action: 'Entrada', time: '08:11', date: '2026-05-27', status: 'Entrada' },
    ]);

    useEffect(() => {
        let isActive = true;

        const initializeDashboard = async () => {
            try {
                await loadDashboardData();

                if (!isActive) {
                    return;
                }
            } catch (error) {
                if (isActive) {
                    pushToast({
                        title: 'Demo local activo',
                        message: 'No se pudo leer el backend, así que se mantiene la información de ejemplo en memoria.',
                        tone: 'warning',
                    });
                }
            } finally {
                if (isActive) {
                    setIsLoadingDemoData(false);
                }
            }
        };

        initializeDashboard();

        return () => {
            isActive = false;
        };
    }, [pushToast]);

    const activeFaces = useMemo(() => registeredFaces.filter((face) => face.isActive), [registeredFaces]);
    const selectedFace = useMemo(
        () => registeredFaces.find((face) => String(face.id) === String(selectedFaceId)) || null,
        [registeredFaces, selectedFaceId],
    );
    const filteredAttendanceRecords = useMemo(() => {
        const normalizedQuery = searchQuery.trim().toLowerCase();

        if (normalizedQuery.length < 3) {
            return attendanceRecords;
        }

        return attendanceRecords.filter((record) => {
            const haystack = [record.faceId, record.person, record.action, record.time, record.date, record.status].join(' ').toLowerCase();

            return haystack.includes(normalizedQuery);
        });
    }, [attendanceRecords, searchQuery]);

    const loadDashboardData = async () => {
        const response = await fetch('/api/v1/dashboard', {
            headers: {
                Accept: 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('No se pudo cargar el dashboard desde la API.');
        }

        const payload = await response.json();

        if (Array.isArray(payload.faces) && payload.faces.length > 0) {
            setRegisteredFaces(payload.faces);
            const activeFace = payload.faces.find((face) => face.isActive) || payload.faces[0];
            setSelectedFaceId((currentFaceId) => currentFaceId || String(activeFace.id));
        }

        if (Array.isArray(payload.attendanceRecords) && payload.attendanceRecords.length > 0) {
            setAttendanceRecords(payload.attendanceRecords);
        }

        return payload;
    };

    const handleToast = (message) => {
        pushToast({
            title: 'Listo',
            message,
            tone: 'success',
        });
    };

    const registerFace = (event) => {
        event.preventDefault();

        const trimmedName = fullName.trim();

        if (!trimmedName) {
            pushToast({
                title: 'Nombre requerido',
                message: 'Escribe un nombre antes de registrar el rostro.',
                tone: 'warning',
            });
            return;
        }

        fetch('/api/v1/faces/enroll', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: trimmedName,
            }),
        })
            .then(async (response) => {
                const payload = await response.json();

                if (!response.ok) {
                    const message = payload?.message || 'No se pudo registrar el rostro.';
                    throw new Error(message);
                }

                return payload;
            })
            .then(async (payload) => {
                setFullName('');
                setSelectedFaceId(String(payload.face?.id || ''));
                await loadDashboardData();
                handleToast(`Rostro de ${trimmedName} guardado en la base de datos.`);
            })
            .catch((error) => {
                pushToast({
                    title: 'No se pudo guardar',
                    message: error.message,
                    tone: 'error',
                });
            });
    };

    const recordAttendance = (event) => {
        event.preventDefault();

        if (!selectedFace) {
            pushToast({
                title: 'Selecciona un rostro',
                message: 'Elige un rostro registrado antes de validar asistencia.',
                tone: 'warning',
            });
            return;
        }

        fetch('/api/v1/attendance/validate', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                face_id: Number(selectedFace.id),
                action: attendanceMode,
            }),
        })
            .then(async (response) => {
                const payload = await response.json();

                if (!response.ok) {
                    const message = payload?.message || 'No se pudo registrar la asistencia.';
                    throw new Error(message);
                }

                return payload;
            })
            .then(async () => {
                await loadDashboardData();
                handleToast(`Se registró ${attendanceMode.toLowerCase()} para ${selectedFace.name}.`);
            })
            .catch((error) => {
                pushToast({
                    title: 'No se pudo registrar',
                    message: error.message,
                    tone: 'error',
                });
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
                    <StatCard label="Personas" value={isLoadingDemoData ? '...' : String(registeredFaces.length)} note="Rostros listos para validación" />
                    <StatCard label="Eventos" value={isLoadingDemoData ? '...' : String(attendanceRecords.length)} note="Marcas de entrada y salida" />
                    <StatCard label="Base de datos" value="MySQL" note="Suficiente para prototipo y datos biométricos iniciales" />
                </div>
            </header>

            <section className="mt-6 grid gap-6 lg:grid-cols-2">
                <PrototypeCard
                    eyebrow="Módulo 01"
                    title="Registrar rostro"
                    description="Captura el rostro, pide un nombre identificable y deja el registro preparado para persistirlo como usuario autorizado en la base de datos."
                    actionLabel="Abrir registro"
                    accent="Nombre asignado al rostro"
                    onAction={() => handleToast('El panel de registro facial está listo para capturar el nombre.')}
                />
                <PrototypeCard
                    eyebrow="Módulo 02"
                    title="Validar asistencia"
                    description="Selecciona un rostro registrado, cambia entre entrada y salida y genera el evento con marca de tiempo y trazabilidad."
                    actionLabel="Abrir control"
                    accent="Entrada o salida"
                    onAction={() => handleToast('El panel de asistencia quedó listo para alternar entrada y salida.')}
                />
            </section>

            <section className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <div className="glass-panel p-6 md:p-7">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h3 className="text-2xl font-semibold text-ink">Registrar rostro con nombre</h3>
                            <p className="mt-2 text-sm leading-6 text-muted">
                                El nombre queda asociado al rostro para usarlo después en la validación de asistencia.
                            </p>
                        </div>
                        <span className="field-chip">Persistencia futura en base de datos</span>
                    </div>
                    <form className="mt-6 grid gap-4 md:grid-cols-[1fr_auto]" onSubmit={registerFace}>
                        <label className="grid gap-2">
                            <span className="text-sm font-semibold text-ink">Nombre completo</span>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(event) => setFullName(event.target.value)}
                                placeholder="Ej. Andrea Ramos"
                                className="rounded-2xl border border-brand-200 bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-muted focus:border-brand-400"
                            />
                        </label>

                        <div className="flex items-end">
                            <button type="submit" className="soft-button-primary w-full md:w-auto">
                                Guardar rostro
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 rounded-[24px] border border-brand-100 bg-brand-50/70 p-4">
                        <p className="text-sm font-semibold text-ink">Rostros registrados</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                            {registeredFaces.map((face) => (
                                <div key={face.id} className="flex items-center gap-2 rounded-full border border-brand-100 bg-white px-2 py-1">
                                    <button
                                        type="button"
                                        className={`field-chip transition ${String(selectedFaceId) === String(face.id) ? 'border-brand-500 bg-brand-500 text-white' : ''}`}
                                        onClick={() => setSelectedFaceId(String(face.id))}
                                    >
                                        {face.name}{face.isActive ? '' : ' · Inactivo'}
                                    </button>

                                    <button
                                        type="button"
                                        className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${face.isActive ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100' : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
                                        onClick={async () => {
                                            const endpoint = face.isActive ? `/api/v1/faces/${face.id}/deactivate` : `/api/v1/faces/${face.id}/reactivate`;
                                            const actionLabel = face.isActive ? 'desactivar' : 'reactivar';

                                            try {
                                                const response = await fetch(endpoint, {
                                                    method: 'PATCH',
                                                    headers: {
                                                        Accept: 'application/json',
                                                        'Content-Type': 'application/json',
                                                    },
                                                });
                                                const payload = await response.json();

                                                if (!response.ok) {
                                                    throw new Error(payload?.message || `No se pudo ${actionLabel} el rostro.`);
                                                }

                                                await loadDashboardData();
                                                pushToast({
                                                    title: face.isActive ? 'Rostro desactivado' : 'Rostro reactivado',
                                                    message: `${payload.face?.name || face.name} quedó ${face.isActive ? 'inactivo' : 'activo'} sin borrar su historial.`,
                                                    tone: 'success',
                                                });
                                            } catch (error) {
                                                pushToast({
                                                    title: `No se pudo ${actionLabel}`,
                                                    message: error.message,
                                                    tone: 'error',
                                                });
                                            }
                                        }}
                                    >
                                        {face.isActive ? 'Desactivar' : 'Reactivar'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="glass-panel p-6 md:p-7">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h3 className="text-2xl font-semibold text-ink">Validar asistencia</h3>
                            <p className="mt-2 text-sm leading-6 text-muted">
                                Cambia entre entrada y salida antes de registrar el evento para el rostro seleccionado.
                            </p>
                        </div>
                        <span className="field-chip">Switch de evento</span>
                    </div>

                    <form className="mt-6 grid gap-4" onSubmit={recordAttendance}>
                        <div className="grid gap-2">
                            <span className="text-sm font-semibold text-ink">Rostro a validar</span>
                            <select
                                value={selectedFaceId}
                                onChange={(event) => setSelectedFaceId(event.target.value)}
                                className="rounded-2xl border border-brand-200 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-brand-400"
                            >
                                <option value="">Selecciona un rostro activo</option>
                                {activeFaces.map((face) => (
                                    <option key={face.id} value={face.id}>
                                        {face.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-3 rounded-[24px] border border-brand-100 bg-brand-50/70 p-3">
                            <SwitchButton active={attendanceMode === 'Entrada'} label="Entrada" onClick={() => setAttendanceMode('Entrada')} />
                            <SwitchButton active={attendanceMode === 'Salida'} label="Salida" onClick={() => setAttendanceMode('Salida')} />
                        </div>

                        <button type="submit" className="soft-button-primary w-full">
                            Registrar {attendanceMode.toLowerCase()}
                        </button>
                    </form>

                    <div className="mt-6 grid gap-4 sm:grid-cols-3">
                        <StatCard label="Modo activo" value={attendanceMode} note="Alterna entre entrada y salida" />
                        <StatCard label="Seleccionado" value={selectedFace?.name || 'Ninguno'} note="Rostro usado en el registro" />
                        <StatCard label="Registrados" value={String(registeredFaces.length)} note="Rostros disponibles para validar" />
                    </div>
                </div>
            </section>

            <section className="mt-6 glass-panel p-6 md:p-7">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h3 className="text-2xl font-semibold text-ink">Tabla global de asistencia</h3>
                        <p className="mt-2 text-sm leading-6 text-muted">
                            Aquí se ven todas las entradas y salidas registradas con hora y fecha.
                        </p>
                    </div>
                    <span className="field-chip">Historial global</span>
                </div>

                <div className="mt-6 grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
                    <label className="grid gap-2">
                        <span className="text-sm font-semibold text-ink">Buscar en el historial</span>
                        <input
                            type="search"
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            placeholder="Busca por nombre, evento, fecha u hora"
                            className="rounded-2xl border border-brand-200 bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-muted focus:border-brand-400"
                        />
                    </label>

                    <div className="rounded-[20px] border border-brand-100 bg-brand-50/70 px-4 py-3 text-sm text-muted">
                        {searchQuery.trim().length < 3 ? 'La búsqueda se activa a partir de 3 caracteres.' : `Mostrando resultados para "${searchQuery.trim()}".`}
                    </div>
                </div>

                <div className="mt-6 overflow-hidden rounded-[24px] border border-brand-100 bg-white">
                    <table className="min-w-full text-left text-sm">
                        <thead className="bg-brand-50/80 text-xs uppercase tracking-[0.2em] text-brand-700">
                            <tr>
                                <th className="px-4 py-3">Face ID</th>
                                <th className="px-4 py-3">Nombre</th>
                                <th className="px-4 py-3">Evento</th>
                                <th className="px-4 py-3">Hora</th>
                                <th className="px-4 py-3">Fecha</th>
                                <th className="px-4 py-3">Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAttendanceRecords.length > 0 ? (
                                filteredAttendanceRecords.map((record) => <TableRow key={record.id} {...record} />)
                            ) : (
                                <tr>
                                    <td className="px-4 py-6 text-sm text-muted" colSpan="6">
                                        No hay coincidencias con tu búsqueda.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            <section className="mt-6 glass-panel p-6 md:p-7">
                <div className="grid gap-4 md:grid-cols-3">
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">Notas de arquitectura</h3>
                        <p className="mt-2 text-sm leading-6 text-muted">
                            MySQL sigue siendo suficiente para prototipo. Si luego quieres búsqueda por similitud de embeddings, conviene evaluar otra capa de almacenamiento.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">API de reconocimiento</h3>
                        <p className="mt-2 text-sm leading-6 text-muted">
                            El flujo ideal es registrar en Laravel y dejar que la API sirva como orquestador del reconocimiento, validación y persistencia.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">Cámara y HTTPS</h3>
                        <p className="mt-2 text-sm leading-6 text-muted">
                            En local no deberías tener bloqueo de cámara; en hosting sí necesitarás HTTPS o un túnel para contexto seguro.
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