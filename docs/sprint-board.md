# EagleAssist Sprint Board

## Objetivo
Construir una base para un sistema de reconocimiento facial y control de asistencia con ESP32, dejando claras las tareas técnicas, el avance y lo que no debe versionarse.

## Hecho
- [x] Inicialización del repositorio
- [x] Enlace con el remoto de GitHub
- [ ] Definición del alcance inicial
- [x] Frontend React enlazado con Blade
- [x] Estilos visuales separados en CSS dedicado
- [x] Refresh de Vite explícito para cambios en caliente
- [x] Flujo visual para registrar rostro con nombre
- [x] Switch visual para entrada y salida
- [x] Tabla global de asistencia en la interfaz
- [x] Buscador dinámico para la tabla global desde 3 caracteres
- [x] Frontend consumiendo datos del backend
- [x] Registro de rostro contra API y base de datos
- [x] Marcación de asistencia contra API y base de datos

## Area de trabajo
- Backend Laravel: API, autenticación, asistencia y administración.
- Firmware ESP32: captura, enrolamiento y sincronización.
- Biometria y seguridad: almacenamiento sensible, cifrado y retención.
- Datos y migraciones: usuarios, rostros, registros y auditoria.
- Documentacion y pruebas: avance del sprint, validacion y checklist.

## Pendiente
- [ ] Elegir arquitectura entre ESP32, API Laravel y almacenamiento de biometría
- [ ] Definir flujo de enrolamiento facial
- [ ] Definir flujo de marcación de asistencia
- [ ] Diseñar modelo de datos para usuarios, rostros y asistencias
- [ ] Definir integración con hardware y comunicación segura
- [ ] Preparar pruebas y validación básica
- [ ] Definir contrato de API para biometría

## Ignorado por `.gitignore`
- `.env`
- `vendor/`
- `node_modules/`
- `storage/`
- `bootstrap/cache/`
- Archivos temporales de editor y sistema

## Decisiones
- Laravel será la base del backend web y API.
- El ESP32 se conectará al backend para sincronizar datos y eventos.
- La biometría debe tratarse como dato sensible y quedar documentada antes de implementar.

## Notas del sprint
- Actualiza esta página al cerrar cada tarea.
- Si una tarea cambia de alcance, anota la razón antes de moverla a hecho.