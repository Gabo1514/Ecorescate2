/**
 * Operación EcoRescate - Gestor de Almacenamiento Local (localStorage)
 * Maneja perfiles de alumnos, desbloqueo de niveles, estrellas, EcoMonedas,
 * 14 medallas, historial de partidas y exportación a CSV.
 */
class GestorAlmacenamiento {
    constructor() {
        this.CLAVE_PERFILES = 'ecorescate_perfiles_v1';
        this.CLAVE_ACTIVO = 'ecorescate_estudiante_activo_v1';
        this.CLAVE_DOCENTE = 'ecorescate_docente_sesion_v1';
        this.perfiles = this.cargarPerfiles();
        this.inicializarDatosReferencia();
        this.estudianteActivo = this.cargarEstudianteActivo();
        this.sesionDocente = this.cargarSesionDocente();
    }

    cargarPerfiles() {
        try {
            const raw = localStorage.getItem(this.CLAVE_PERFILES);
            if (raw) return JSON.parse(raw);
        } catch (e) {
            console.error('Error al leer perfiles de localStorage:', e);
        }
        return {};
    }

    guardarPerfiles() {
        try {
            localStorage.setItem(this.CLAVE_PERFILES, JSON.stringify(this.perfiles));
        } catch (e) {
            console.error('Error al guardar perfiles:', e);
        }
    }

    inicializarDatosReferencia() {
        // Sembrar alumnos de ejemplo para que el docente y las aulas tengan datos iniciales
        if (Object.keys(this.perfiles).length > 1) return;

        const base = [
            { dni: '74839201', nombre: 'Mateo Quispe', grado: 5, seccion: 'A', monedas: 248, accesorio: 'GORRA', polo: 1, calificacionDocente: 18, observacionDocente: 'Muy buen desempeño en el cuidado de recursos hídricos en Ica.', estrellas: { LIMPIEZA: [3,3,3,3,2,3,2,3,2,0], AGUA: [3,3,3,2,3,2,0,0,0,0], ENERGIA: [3,3,2,2,0,0,0,0,0,0], VERDE: [3,3,2,0,0,0,0,0,0,0] } },
            { dni: '71234567', nombre: 'Camila Huamán', grado: 5, seccion: 'A', monedas: 310, accesorio: 'CORONA', polo: 2, calificacionDocente: 19, observacionDocente: 'Liderazgo ecológico ejemplar y excelente respuesta en biohuerto.', estrellas: { LIMPIEZA: [3,3,3,3,3,3,3,3,2,2], AGUA: [3,3,3,3,3,2,2,0,0,0], ENERGIA: [3,3,3,2,2,0,0,0,0,0], VERDE: [3,3,3,2,0,0,0,0,0,0] } },
            { dni: '72345678', nombre: 'Luciana Flores', grado: 5, seccion: 'A', monedas: 180, accesorio: 'LENTES', polo: 0, calificacionDocente: 17, observacionDocente: 'Buen avance en reciclaje de residuos sólidos.', estrellas: { LIMPIEZA: [3,3,3,2,2,2,0,0,0,0], AGUA: [3,3,3,3,2,0,0,0,0,0], ENERGIA: [3,2,2,0,0,0,0,0,0,0], VERDE: [3,2,0,0,0,0,0,0,0,0] } },
            { dni: '73456789', nombre: 'Diego Mendoza', grado: 5, seccion: 'B', monedas: 140, accesorio: 'VISERA', polo: 3, calificacionDocente: 16, observacionDocente: 'Participa activamente en brigada escolar del agua.', estrellas: { LIMPIEZA: [3,3,2,2,0,0,0,0,0,0], AGUA: [3,3,2,0,0,0,0,0,0,0], ENERGIA: [3,2,0,0,0,0,0,0,0,0], VERDE: [2,2,0,0,0,0,0,0,0,0] } },
            { dni: '75678901', nombre: 'Valeria Ramos', grado: 5, seccion: 'B', monedas: 120, accesorio: 'NINGUNO', polo: 4, calificacionDocente: 15, observacionDocente: 'Requiere reforzar conocimientos de consumo fantasma.', estrellas: { LIMPIEZA: [3,3,2,0,0,0,0,0,0,0], AGUA: [3,2,0,0,0,0,0,0,0,0], ENERGIA: [2,2,0,0,0,0,0,0,0,0], VERDE: [2,0,0,0,0,0,0,0,0,0] } },
            { dni: '76789012', nombre: 'Sebastián Rojas', grado: 6, seccion: 'A', monedas: 195, accesorio: 'SOMBRERO', polo: 0, calificacionDocente: 17, observacionDocente: 'Constante y comprometido con el biohuerto escolar.', estrellas: { LIMPIEZA: [3,3,3,3,2,0,0,0,0,0], AGUA: [3,3,3,2,0,0,0,0,0,0], ENERGIA: [3,3,0,0,0,0,0,0,0,0], VERDE: [3,2,0,0,0,0,0,0,0,0] } },
            { dni: '77890123', nombre: 'Andrea Gutiérrez', grado: 4, seccion: 'A', monedas: 90, accesorio: 'NINGUNO', polo: 1, calificacionDocente: 14, observacionDocente: 'Progreso favorable en la clasificación de residuos.', estrellas: { LIMPIEZA: [3,2,2,0,0,0,0,0,0,0], AGUA: [2,2,0,0,0,0,0,0,0,0], ENERGIA: [2,0,0,0,0,0,0,0,0,0], VERDE: [2,0,0,0,0,0,0,0,0,0] } }
        ];

        base.forEach(b => {
            const clave = `cod_${b.dni}`;
            if (!this.perfiles[clave]) {
                this.perfiles[clave] = {
                    dni: b.dni,
                    codigo: b.dni,
                    nombre: b.nombre,
                    grado: b.grado,
                    seccion: b.seccion,
                    monedas: b.monedas,
                    accesorio: b.accesorio,
                    polo: b.polo,
                    calificacionDocente: b.calificacionDocente,
                    observacionDocente: b.observacionDocente,
                    fechaCalificacionDocente: '2026-11-14',
                    polosComprados: [0, b.polo],
                    comprados: ['NINGUNO', b.accesorio],
                    estrellas: b.estrellas,
                    medallas: ['PRIMERA_ESTRELLA'],
                    partidas: [
                        { fecha: '2026-11-14 09:30:15', juegoId: 'LIMPIEZA', minijuego: 'Limpieza Monstruosa', puntaje: 420, nivel: 1, superado: true, aciertos: 14, errores: 1, precisionPct: 93, duracionSeg: 48, impacto: 7.0, unidadImpacto: 'kg residuos', preguntaCorrecta: true, estrellas: 3, nota: 19, escala: 'AD' },
                        { fecha: '2026-11-14 09:42:10', juegoId: 'AGUA', minijuego: 'Guardián del Agua', puntaje: 380, nivel: 1, superado: true, aciertos: 12, errores: 0, precisionPct: 100, duracionSeg: 52, impacto: 45.0, unidadImpacto: 'litros agua', preguntaCorrecta: true, estrellas: 3, nota: 20, escala: 'AD' }
                    ]
                };
            }
        });
        this.guardarPerfiles();
    }

    cargarEstudianteActivo() {
        try {
            const raw = localStorage.getItem(this.CLAVE_ACTIVO);
            if (raw) return JSON.parse(raw);
        } catch (e) {}
        return null;
    }

    establecerEstudianteActivo(estudiante) {
        this.estudianteActivo = estudiante;
        try {
            localStorage.setItem(this.CLAVE_ACTIVO, JSON.stringify(estudiante));
        } catch (e) {}
        this.obtenerPerfil(estudiante); // asegura que exista
    }

    cerrarSesionEstudiante() {
        this.estudianteActivo = null;
        try {
            localStorage.removeItem(this.CLAVE_ACTIVO);
        } catch (e) {}
    }

    // Sesión de docente
    cargarSesionDocente() {
        try {
            const raw = localStorage.getItem(this.CLAVE_DOCENTE);
            if (raw) return JSON.parse(raw);
        } catch (e) {}
        return null;
    }

    iniciarSesionDocente(usuario = 'Docente', clave = '') {
        const pass = String(clave).trim().toLowerCase();
        const clavesValidas = ['docente2026', 'profesor123', 'docente', 'admin', 'profesor', 'ica2026'];
        if (!clavesValidas.includes(pass)) {
            return false;
        }
        const sesion = {
            usuario: usuario.trim() || 'Profesor de Primaria',
            rol: 'DOCENTE',
            fecha: new Date().toISOString()
        };
        this.sesionDocente = sesion;
        try {
            localStorage.setItem(this.CLAVE_DOCENTE, JSON.stringify(sesion));
        } catch (e) {}
        return true;
    }

    cerrarSesionDocente() {
        this.sesionDocente = null;
        try {
            localStorage.removeItem(this.CLAVE_DOCENTE);
        } catch (e) {}
    }

    esSesionDocente() {
        return !!(this.sesionDocente && this.sesionDocente.rol === 'DOCENTE');
    }

    crearClave(estudiante) {
        if (!estudiante) return 'anonimo';
        if (estudiante.dni || estudiante.codigo) {
            const cod = String(estudiante.dni || estudiante.codigo).trim().replace(/[^a-z0-9]/gi, '').toLowerCase();
            if (cod) return `cod_${cod}`;
        }
        const norm = (str) => (str || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
        return `${norm(estudiante.nombre)}_${estudiante.grado}_${norm(estudiante.seccion)}`;
    }

    buscarEstudiante(termino) {
        if (!termino) return null;
        const clean = String(termino).trim().toLowerCase();
        const codClean = clean.replace(/[^a-z0-9]/g, '');

        // 1. Por DNI o código exacto
        for (const k in this.perfiles) {
            const p = this.perfiles[k];
            const pDni = String(p.dni || p.codigo || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            if (pDni && (pDni === codClean || pDni === clean)) {
                return { clave: k, perfil: p };
            }
            if (k === `cod_${codClean}`) {
                return { clave: k, perfil: p };
            }
        }

        // 2. Por nombre exacto
        for (const k in this.perfiles) {
            const p = this.perfiles[k];
            if ((p.nombre || '').toLowerCase().trim() === clean) {
                return { clave: k, perfil: p };
            }
        }
        return null;
    }

    listarAlumnosRecientes() {
        const lista = [];
        for (const k in this.perfiles) {
            const p = this.perfiles[k];
            lista.push({
                clave: k,
                dni: p.dni || p.codigo || '',
                codigo: p.codigo || p.dni || '',
                nombre: p.nombre,
                grado: p.grado,
                seccion: p.seccion,
                estrellas: this.totalEstrellasGeneral(p),
                monedas: p.monedas || 0,
                polo: p.polo || 0,
                accesorio: p.accesorio || 'NINGUNO'
            });
        }
        lista.sort((a, b) => b.estrellas - a.estrellas);
        return lista.slice(0, 10);
    }

    obtenerPerfil(estudiante = this.estudianteActivo) {
        if (!estudiante) return null;
        const clave = this.crearClave(estudiante);
        if (!this.perfiles[clave]) {
            // Revisar si ya existía bajo la clave antigua por nombre
            const norm = (str) => (str || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
            const claveNombre = `${norm(estudiante.nombre)}_${estudiante.grado}_${norm(estudiante.seccion)}`;
            if (this.perfiles[claveNombre]) {
                this.perfiles[clave] = this.perfiles[claveNombre];
                delete this.perfiles[claveNombre];
            } else {
                this.perfiles[clave] = {
                    dni: estudiante.dni || estudiante.codigo || '',
                    codigo: estudiante.codigo || estudiante.dni || '',
                    nombre: estudiante.nombre.trim(),
                    grado: parseInt(estudiante.grado, 10) || 1,
                    seccion: (estudiante.seccion || 'A').toUpperCase().trim(),
                    monedas: 0,
                    accesorio: 'NINGUNO',
                    polo: 0,
                    polosComprados: [0],
                    comprados: ['NINGUNO'],
                    estrellas: {
                        LIMPIEZA: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                        AGUA: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                        ENERGIA: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                        VERDE: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                    },
                    medallas: [],
                    partidas: []
                };
            }
            this.guardarPerfiles();
        }

        // Si el estudiante tiene DNI y el perfil no lo tenía registrado, actualizarlo
        if (estudiante.dni && !this.perfiles[clave].dni) {
            this.perfiles[clave].dni = estudiante.dni;
            this.perfiles[clave].codigo = estudiante.dni;
            this.guardarPerfiles();
        }

        if (!this.perfiles[clave].polosComprados) {
            this.perfiles[clave].polosComprados = [0];
        }
        return this.perfiles[clave];
    }

    // Regla de desbloqueo: nivel 1 libre, nivel N se abre al superar N-1 (>0 estrellas)
    estaDesbloqueado(juegoId, nivelNumero, perfil = this.obtenerPerfil()) {
        if (nivelNumero === 1) return true;
        if (!perfil) return false;
        const arr = perfil.estrellas[juegoId] || [];
        return (arr[nivelNumero - 2] || 0) > 0;
    }

    obtenerEstrellasNivel(juegoId, nivelNumero, perfil = this.obtenerPerfil()) {
        if (!perfil) return 0;
        const arr = perfil.estrellas[juegoId] || [];
        return arr[nivelNumero - 1] || 0;
    }

    totalEstrellasJuego(juegoId, perfil = this.obtenerPerfil()) {
        if (!perfil) return 0;
        const arr = perfil.estrellas[juegoId] || [];
        return arr.reduce((a, b) => a + b, 0);
    }

    totalEstrellasGeneral(perfil = this.obtenerPerfil()) {
        if (!perfil) return 0;
        let sum = 0;
        for (const k in perfil.estrellas) {
            sum += perfil.estrellas[k].reduce((a, b) => a + b, 0);
        }
        return sum;
    }

    nivelesSuperadosJuego(juegoId, perfil = this.obtenerPerfil()) {
        if (!perfil) return 0;
        const arr = perfil.estrellas[juegoId] || [];
        return arr.filter(s => s > 0).length;
    }

    totalNivelesSuperados(perfil = this.obtenerPerfil()) {
        if (!perfil) return 0;
        let c = 0;
        for (const k in perfil.estrellas) {
            c += perfil.estrellas[k].filter(s => s > 0).length;
        }
        return c;
    }

    // Registra una partida y entrega recompensas (estrellas, monedas y medallas)
    registrarPartida(datosPartida) {
        const perfil = this.obtenerPerfil();
        if (!perfil) return null;

        const {
            juegoId,
            nivelNumero,
            superado,
            puntaje,
            aciertos,
            errores,
            duracionSegundos,
            impacto,
            preguntaCorrecta,
            estrellas,
            mejorCombo
        } = datosPartida;

        // Registrar estrellas
        const arrEstrellas = perfil.estrellas[juegoId];
        const anterior = arrEstrellas[nivelNumero - 1] || 0;
        let nuevasEstrellas = 0;
        if (estrellas > anterior) {
            arrEstrellas[nivelNumero - 1] = Math.min(3, estrellas);
            nuevasEstrellas = Math.min(3, estrellas) - anterior;
        }

        // Cálculo de EcoMonedas (fórmula original):
        // puntaje/25 + estrellas*5 + nuevasEstrellas*15 + (preguntaCorrecta ? 10 : 0)
        let monedasGanadas = 0;
        if (superado) {
            monedasGanadas = Math.floor(puntaje / 25) + (estrellas * 5) + (nuevasEstrellas * 15) + (preguntaCorrecta === true ? 10 : 0);
        } else {
            monedasGanadas = Math.floor(puntaje / 50); // pequeño consuelo
        }
        perfil.monedas = (perfil.monedas || 0) + monedasGanadas;

        // Determinar calificación escolar en escala vigesimal (1 al 20) y nivel MINEDU
        let notaVigesimal = datosPartida.nota;
        if (typeof notaVigesimal !== 'number') {
            const defNivel = (JUEGOS[juegoId] && JUEGOS[juegoId].niveles) ? JUEGOS[juegoId].niveles[nivelNumero - 1] : { tiempo: 60, err2: 2, err3: 1 };
            notaVigesimal = (typeof calcularNotaVigesimal === 'function')
                ? calcularNotaVigesimal(defNivel, superado, aciertos, datosPartida.totalRetos || aciertos, errores, duracionSegundos, preguntaCorrecta)
                : (superado ? 18 : 8);
        }
        const escalaInfo = (typeof obtenerEscalaMINEDU === 'function')
            ? obtenerEscalaMINEDU(notaVigesimal)
            : { literal: 'A', descripcion: 'Logro Esperado' };

        // Guardar sesión en historial
        const fechaStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
        const sesion = {
            fecha: fechaStr,
            juegoId,
            minijuego: JUEGOS[juegoId] ? JUEGOS[juegoId].nombre : juegoId,
            nivel: nivelNumero,
            superado: superado ? 'SI' : 'NO',
            puntaje,
            aciertos,
            errores,
            precisionPct: Math.round((aciertos / Math.max(1, aciertos + errores)) * 100),
            duracionSeg: Math.round(duracionSegundos),
            impacto: Number(impacto.toFixed(2)),
            unidadImpacto: JUEGOS[juegoId] ? JUEGOS[juegoId].unidadImpacto : '',
            preguntaCorrecta: preguntaCorrecta === true ? 'SI' : (preguntaCorrecta === false ? 'NO' : ''),
            estrellas,
            nota: notaVigesimal,
            escala: escalaInfo.literal,
            escalaDesc: escalaInfo.descripcion
        };
        perfil.partidas.push(sesion);

        // Revisar y otorgar medallas
        const medallasGanadas = [];
        for (const med of CATALOGO_MEDALLAS) {
            if (!perfil.medallas.includes(med.id)) {
                if (this.evaluarMedalla(med.id, perfil, datosPartida, mejorCombo)) {
                    perfil.medallas.push(med.id);
                    medallasGanadas.push(med);
                }
            }
        }

        this.guardarPerfiles();

        return {
            monedasGanadas,
            estrellas,
            nuevasEstrellas,
            medallasGanadas,
            totalMonedas: perfil.monedas
        };
    }

    evaluarMedalla(medallaId, perfil, datos, mejorCombo) {
        const historial = perfil.partidas;
        switch (medallaId) {
            case 'PRIMERA_MISION':
                return this.totalNivelesSuperados(perfil) >= 1;
            case 'EXPLORADOR': {
                const jugados = new Set(historial.map(s => s.juegoId));
                return jugados.size >= 4;
            }
            case 'TRES_ESTRELLAS':
                return datos.estrellas === 3;
            case 'COMBO':
                return (mejorCombo || 0) >= 5;
            case 'PERFECTO':
                return datos.superado && datos.errores === 0;
            case 'SABIO': {
                const bien = historial.filter(s => s.preguntaCorrecta === 'SI').length;
                return bien >= 5;
            }
            case 'RECICLADOR':
                return this.nivelesSuperadosJuego('LIMPIEZA', perfil) >= 10;
            case 'GUARDIAN':
                return this.nivelesSuperadosJuego('AGUA', perfil) >= 10;
            case 'CAZAVATIOS':
                return this.nivelesSuperadosJuego('ENERGIA', perfil) >= 10;
            case 'MANO_VERDE':
                return this.nivelesSuperadosJuego('VERDE', perfil) >= 10;
            case 'CIEN_LITROS': {
                const litros = historial
                    .filter(s => s.juegoId === 'AGUA')
                    .reduce((acc, s) => acc + (s.impacto || 0), 0);
                return litros >= 100;
            }
            case 'CONSTANTE':
                return historial.length >= 20;
            case 'COLECCIONISTA':
                return this.totalEstrellasGeneral(perfil) >= 60;
            case 'ECO_HEROE':
                return this.totalNivelesSuperados(perfil) >= 40;
            default:
                return false;
        }
    }

    // Impacto social acumulado del estudiante o global
    obtenerImpacto(perfil = this.obtenerPerfil()) {
        const impacto = {
            LIMPIEZA: 0,
            AGUA: 0,
            ENERGIA: 0,
            VERDE: 0
        };
        if (!perfil) return impacto;
        for (const p of perfil.partidas) {
            if (impacto[p.juegoId] !== undefined) {
                impacto[p.juegoId] += (p.impacto || 0);
            }
        }
        return {
            LIMPIEZA: Number(impacto.LIMPIEZA.toFixed(2)),
            AGUA: Number(impacto.AGUA.toFixed(1)),
            ENERGIA: Number(impacto.ENERGIA.toFixed(2)),
            VERDE: Number(impacto.VERDE.toFixed(1))
        };
    }

    // Ranking de alumnos por grado y sección
    obtenerRanking(gradoFiltro = null, seccionFiltro = null) {
        const perfilActivo = this.obtenerPerfil();
        const lista = [];

        for (const k in this.perfiles) {
            const p = this.perfiles[k];
            if (gradoFiltro && p.grado !== parseInt(gradoFiltro, 10)) continue;
            if (seccionFiltro && p.seccion !== seccionFiltro.toUpperCase()) continue;

            const estrellasTotales = this.totalEstrellasGeneral(p);
            // Puntaje ranking: suma de mejores puntajes de cada nivel
            const mejoresPuntajes = {};
            for (const partida of (p.partidas || [])) {
                const key = `${partida.juegoId}_${partida.nivel}`;
                if (!mejoresPuntajes[key] || partida.puntaje > mejoresPuntajes[key]) {
                    mejoresPuntajes[key] = partida.puntaje;
                }
            }
            const puntajeTotal = Object.values(mejoresPuntajes).reduce((a, b) => a + b, 0);

            lista.push({
                nombre: p.nombre,
                grado: p.grado,
                seccion: p.seccion,
                estrellas: estrellasTotales,
                puntaje: puntajeTotal,
                medallas: (p.medallas || []).length,
                monedas: p.monedas || 0,
                polo: p.polo || 0,
                accesorio: p.accesorio || 'NINGUNO',
                esUsuarioActual: perfilActivo && p.nombre === perfilActivo.nombre && p.grado === perfilActivo.grado && p.seccion === perfilActivo.seccion
            });
        }

        // Si la lista de la clase tiene pocos registros, incorporar compañeros de aula de referencia
        const g = gradoFiltro ? parseInt(gradoFiltro, 10) : (perfilActivo ? perfilActivo.grado : 5);
        const s = seccionFiltro ? seccionFiltro.toUpperCase() : (perfilActivo ? perfilActivo.seccion : 'A');

        const COMPANEROS_BASE = [
            { nombre: 'Camila Huamán', estrellas: 28, puntaje: 3120, medallas: 5 },
            { nombre: 'Mateo Quispe', estrellas: 24, puntaje: 2680, medallas: 4 },
            { nombre: 'Luciana Flores', estrellas: 21, puntaje: 2350, medallas: 4 },
            { nombre: 'Diego Mendoza', estrellas: 17, puntaje: 1940, medallas: 3 },
            { nombre: 'Valeria Ramos', estrellas: 14, puntaje: 1560, medallas: 2 },
            { nombre: 'Sebastián Rojas', estrellas: 11, puntaje: 1210, medallas: 2 },
            { nombre: 'Andrea Gutiérrez', estrellas: 8, puntaje: 920, medallas: 1 },
            { nombre: 'Joaquín Palomino', estrellas: 5, puntaje: 610, medallas: 1 }
        ];

        COMPANEROS_BASE.forEach(comp => {
            const yaExiste = lista.some(item => item.nombre.toLowerCase() === comp.nombre.toLowerCase());
            if (!yaExiste) {
                lista.push({
                    nombre: comp.nombre,
                    grado: g,
                    seccion: s,
                    estrellas: comp.estrellas,
                    puntaje: comp.puntaje,
                    medallas: comp.medallas,
                    monedas: Math.floor(comp.puntaje / 10),
                    polo: 0,
                    accesorio: 'NINGUNO',
                    esUsuarioActual: false
                });
            }
        });

        // Orden: Estrellas descendente, luego puntaje descendente
        lista.sort((a, b) => {
            if (b.estrellas !== a.estrellas) return b.estrellas - a.estrellas;
            return b.puntaje - a.puntaje;
        });

        return lista;
    }

    // Guardar calificación manual (1 al 20) asignada por el docente
    guardarCalificacionDocente(claveEstudiante, nota, observacion = '') {
        const perfil = this.perfiles[claveEstudiante];
        if (!perfil) return false;
        const notaNum = Math.max(1, Math.min(20, Math.round(Number(nota) || 1)));
        perfil.calificacionDocente = notaNum;
        perfil.observacionDocente = (observacion || '').trim();
        perfil.fechaCalificacionDocente = new Date().toISOString().slice(0, 10);
        this.guardarPerfiles();
        return true;
    }

    // Obtener calificación integral del estudiante (oficial del docente o promedio del juego)
    obtenerCalificacionEstudiante(perfil) {
        if (!perfil) {
            const esc = (typeof obtenerEscalaMINEDU === 'function') ? obtenerEscalaMINEDU(14) : { literal: 'A', descripcion: 'Logro Esperado', color: '#2563EB', bg: '#DBEAFE', borde: '#93C5FD' };
            return { nota: 14, escala: esc, esDocente: false, observacion: '' };
        }
        if (typeof perfil.calificacionDocente === 'number' && perfil.calificacionDocente >= 1 && perfil.calificacionDocente <= 20) {
            const esc = (typeof obtenerEscalaMINEDU === 'function') ? obtenerEscalaMINEDU(perfil.calificacionDocente) : { literal: 'A', descripcion: 'Logro Esperado' };
            return {
                nota: perfil.calificacionDocente,
                escala: esc,
                esDocente: true,
                observacion: perfil.observacionDocente || ''
            };
        }
        const partidasConNota = (perfil.partidas || []).filter(p => typeof p.nota === 'number');
        if (partidasConNota.length > 0) {
            const sum = partidasConNota.reduce((a, b) => a + b.nota, 0);
            const prom = Math.round((sum / partidasConNota.length) * 10) / 10;
            const esc = (typeof obtenerEscalaMINEDU === 'function') ? obtenerEscalaMINEDU(Math.round(prom)) : { literal: 'A', descripcion: 'Logro Esperado' };
            return {
                nota: prom,
                escala: esc,
                esDocente: false,
                observacion: ''
            };
        }
        // Estimación a partir de estrellas obtenidas
        const totEst = this.totalEstrellasGeneral(perfil);
        const totNiv = this.totalNivelesSuperados(perfil);
        let estimado = 14;
        if (totNiv > 0) {
            estimado = Math.min(20, Math.round(12 + (totEst / (totNiv * 3)) * 8));
        }
        const esc = (typeof obtenerEscalaMINEDU === 'function') ? obtenerEscalaMINEDU(estimado) : { literal: 'A', descripcion: 'Logro Esperado' };
        return {
            nota: estimado,
            escala: esc,
            esDocente: false,
            observacion: ''
        };
    }

    // Métricas y reporte pedagógico para el portal docente
    obtenerReporteDocente(gradoFiltro = null, seccionFiltro = null, busqueda = '') {
        const alumnos = [];
        let totalLitrosAgua = 0;
        let totalResiduos = 0;
        let totalKwhEnergia = 0;
        let totalAreaVerde = 0;
        let totalEstrellasColegio = 0;
        let totalNivelesCompletados = 0;

        const term = (busqueda || '').toLowerCase().trim();

        for (const k in this.perfiles) {
            const p = this.perfiles[k];
            const dni = p.dni || p.codigo || 'S/DNI';
            const nombre = p.nombre || 'Alumno';
            const grado = p.grado || 1;
            const seccion = p.seccion || 'A';

            if (gradoFiltro && grado !== parseInt(gradoFiltro, 10)) continue;
            if (seccionFiltro && seccion !== seccionFiltro.toUpperCase()) continue;
            if (term) {
                const coincideDni = dni.toLowerCase().includes(term);
                const coincideNombre = nombre.toLowerCase().includes(term);
                if (!coincideDni && !coincideNombre) continue;
            }

            const estrellasLimpieza = (p.estrellas.LIMPIEZA || []).reduce((a, b) => a + b, 0);
            const estrellasAgua = (p.estrellas.AGUA || []).reduce((a, b) => a + b, 0);
            const estrellasEnergia = (p.estrellas.ENERGIA || []).reduce((a, b) => a + b, 0);
            const estrellasVerde = (p.estrellas.VERDE || []).reduce((a, b) => a + b, 0);

            const nivelesLimpieza = (p.estrellas.LIMPIEZA || []).filter(s => s > 0).length;
            const nivelesAgua = (p.estrellas.AGUA || []).filter(s => s > 0).length;
            const nivelesEnergia = (p.estrellas.ENERGIA || []).filter(s => s > 0).length;
            const nivelesVerde = (p.estrellas.VERDE || []).filter(s => s > 0).length;

            const totalEstrellas = estrellasLimpieza + estrellasAgua + estrellasEnergia + estrellasVerde;
            const totalNiveles = nivelesLimpieza + nivelesAgua + nivelesEnergia + nivelesVerde;
            const avancePct = Math.min(100, Math.round((totalNiveles / 40) * 100));

            const impacto = this.obtenerImpacto(p);
            totalLitrosAgua += impacto.AGUA;
            totalResiduos += impacto.LIMPIEZA;
            totalKwhEnergia += impacto.ENERGIA;
            totalAreaVerde += impacto.VERDE;
            totalEstrellasColegio += totalEstrellas;
            totalNivelesCompletados += totalNiveles;

            const preguntasAcertadas = (p.partidas || []).filter(s => s.preguntaCorrecta === true).length;
            const calif = this.obtenerCalificacionEstudiante(p);

            alumnos.push({
                clave: k,
                dni,
                codigo: dni,
                nombre,
                grado,
                seccion,
                polo: p.polo || 0,
                accesorio: p.accesorio || 'NINGUNO',
                totalEstrellas,
                totalNiveles,
                avancePct,
                estrellasLimpieza,
                nivelesLimpieza,
                estrellasAgua,
                nivelesAgua,
                estrellasEnergia,
                nivelesEnergia,
                estrellasVerde,
                nivelesVerde,
                medallas: (p.medallas || []).length,
                impacto,
                preguntasAcertadas,
                totalPartidas: (p.partidas || []).length,
                ultimaPartida: (p.partidas && p.partidas.length > 0) ? p.partidas[p.partidas.length - 1].fecha : 'Sin partidas',
                calificacion: calif.nota,
                escala: calif.escala,
                esDocente: calif.esDocente,
                calificacionDocente: p.calificacionDocente || null,
                observacionDocente: p.observacionDocente || ''
            });
        }

        // Ordenar por total de estrellas descendente
        alumnos.sort((a, b) => {
            if (b.totalEstrellas !== a.totalEstrellas) return b.totalEstrellas - a.totalEstrellas;
            return b.avancePct - a.avancePct;
        });

        const sumaCalificaciones = alumnos.reduce((acc, a) => acc + (Number(a.calificacion) || 14), 0);
        const promedioNotas = alumnos.length > 0 ? (Math.round((sumaCalificaciones / alumnos.length) * 10) / 10) : 0;
        const escalaPromedio = (typeof obtenerEscalaMINEDU === 'function') ? obtenerEscalaMINEDU(Math.round(promedioNotas)) : { literal: 'A', descripcion: 'Logro Esperado' };

        return {
            alumnos,
            metricas: {
                totalAlumnos: alumnos.length,
                totalEstrellas: totalEstrellasColegio,
                totalLitrosAgua: Number(totalLitrosAgua.toFixed(1)),
                totalResiduos: Number(totalResiduos.toFixed(1)),
                totalKwhEnergia: Number(totalKwhEnergia.toFixed(2)),
                totalAreaVerde: Number(totalAreaVerde.toFixed(1)),
                promedioAvance: alumnos.length > 0 ? Math.round(alumnos.reduce((acc, a) => acc + a.avancePct, 0) / alumnos.length) : 0,
                promedioCalificacion: promedioNotas,
                escalaPromedio: escalaPromedio
            }
        };
    }

    // Exportar informe pedagógico docente con formato enriquecido para Microsoft Excel (.xls)
    exportarExcel() {
        const escapeXml = (unsafe) => {
            if (unsafe === undefined || unsafe === null) return '';
            return String(unsafe)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&apos;');
        };

        const formatearFecha = (fStr) => {
            if (!fStr) return '-';
            try {
                const f = new Date(String(fStr).replace(' ', 'T'));
                if (isNaN(f.getTime())) return String(fStr);
                const d = String(f.getDate()).padStart(2, '0');
                const m = String(f.getMonth() + 1).padStart(2, '0');
                const y = f.getFullYear();
                const hh = String(f.getHours()).padStart(2, '0');
                const mm = String(f.getMinutes()).padStart(2, '0');
                return `${d}/${m}/${y} ${hh}:${mm}`;
            } catch (e) {
                return String(fStr);
            }
        };

        let totalPartidas = 0;
        let sumaNotas = 0;
        let sumaPuntaje = 0;
        let sumaAciertos = 0;
        let sumaErrores = 0;
        let aguaAhorrada = 0;
        let residuosReciclados = 0;
        let energiaAhorrada = 0;
        let areaVerde = 0;
        const filasPartidas = [];

        for (const k in this.perfiles) {
            const p = this.perfiles[k];
            for (const s of (p.partidas || [])) {
                totalPartidas++;
                const notaPartida = Number(s.nota) || (s.superado === 'SI' || s.superado === true ? 18 : 8);
                sumaNotas += notaPartida;
                sumaPuntaje += (Number(s.puntaje) || 0);
                sumaAciertos += (Number(s.aciertos) || 0);
                sumaErrores += (Number(s.errores) || 0);

                const impactoVal = Number(s.impacto) || 0;
                if (s.juegoId === 'AGUA') aguaAhorrada += impactoVal;
                else if (s.juegoId === 'LIMPIEZA') residuosReciclados += impactoVal;
                else if (s.juegoId === 'ENERGIA') energiaAhorrada += impactoVal;
                else if (s.juegoId === 'VERDE') areaVerde += impactoVal;

                const superado = (s.superado === 'SI' || s.superado === true);
                const pregunta = (s.preguntaCorrecta === true || s.preguntaCorrecta === 'SI')
                    ? 'CORRECTA'
                    : ((s.preguntaCorrecta === false || s.preguntaCorrecta === 'NO') ? 'INCORRECTA' : 'N/A');

                let escalaLiteral = s.escala;
                let escalaDesc = s.escalaDesc;
                if (!escalaLiteral) {
                    const esc = (typeof obtenerEscalaMINEDU === 'function') ? obtenerEscalaMINEDU(notaPartida) : { literal: 'A', descripcion: 'Logro Esperado' };
                    escalaLiteral = esc.literal;
                    escalaDesc = esc.descripcion;
                }

                filasPartidas.push({
                    dni: p.dni || p.codigo || 'S/DNI',
                    nombre: p.nombre || 'Estudiante',
                    grado: p.grado ? `${p.grado}°` : '-',
                    seccion: p.seccion || '-',
                    fecha: formatearFecha(s.fecha),
                    minijuego: s.minijuego || s.juegoId || '-',
                    nivel: `Nivel ${s.nivel || 1}`,
                    superado,
                    puntaje: Number(s.puntaje) || 0,
                    estrellas: Number(s.estrellas) || 0,
                    nota: notaPartida,
                    escalaLiteral: escalaLiteral || 'A',
                    escalaDesc: escalaDesc || '',
                    precision: s.precisionPct !== undefined ? `${s.precisionPct}%` : '100%',
                    duracion: `${Math.floor((s.duracionSeg || 0) / 60)}:${String((s.duracionSeg || 0) % 60).padStart(2, '0')} min`,
                    aciertos: Number(s.aciertos) || 0,
                    errores: Number(s.errores) || 0,
                    impacto: `${impactoVal.toFixed(2)} ${s.unidadImpacto || ''}`.trim(),
                    pregunta,
                    califDocente: p.calificacionDocente ? `${p.calificacionDocente} / 20` : 'Sin calificar',
                    obsDocente: p.observacionDocente || 'Sin observación registrada'
                });
            }
        }

        const totalAlumnos = Object.keys(this.perfiles).length;
        const promedioNotas = totalPartidas > 0 ? (sumaNotas / totalPartidas).toFixed(1) : '0.0';
        const promedioPuntaje = totalPartidas > 0 ? Math.round(sumaPuntaje / totalPartidas) : 0;
        const fechaActual = formatearFecha(new Date().toISOString());

        let filasHtml = '';
        filasPartidas.forEach((f, idx) => {
            const claseFila = idx % 2 === 0 ? 'fila-par' : 'fila-impar';
            const claseSuperado = f.superado ? 'superado-si' : 'superado-no';
            let claseEscala = 'badge-a';
            if (f.escalaLiteral === 'AD') claseEscala = 'badge-ad';
            else if (f.escalaLiteral === 'B') claseEscala = 'badge-b';
            else if (f.escalaLiteral === 'C') claseEscala = 'badge-c';

            const estrellasStr = '★'.repeat(f.estrellas) + (f.estrellas > 0 ? ` (${f.estrellas})` : '0');

            filasHtml += `
            <tr class="${claseFila}">
                <td class="celda txt-centro mso-texto">${escapeXml(f.dni)}</td>
                <td class="celda txt-izq" style="font-weight: bold;">${escapeXml(f.nombre)}</td>
                <td class="celda txt-centro">${escapeXml(f.grado)}</td>
                <td class="celda txt-centro">${escapeXml(f.seccion)}</td>
                <td class="celda txt-centro">${escapeXml(f.fecha)}</td>
                <td class="celda txt-izq">${escapeXml(f.minijuego)}</td>
                <td class="celda txt-centro">${escapeXml(f.nivel)}</td>
                <td class="celda ${claseSuperado}">${f.superado ? 'SÍ' : 'NO'}</td>
                <td class="celda txt-der mso-numero">${f.puntaje}</td>
                <td class="celda txt-centro" style="color: #D97706; font-weight: bold;">${escapeXml(estrellasStr)}</td>
                <td class="celda txt-centro" style="font-weight: bold; font-size: 11pt;">${f.nota}</td>
                <td class="celda ${claseEscala}">${escapeXml(f.escalaLiteral + ' • ' + f.escalaDesc)}</td>
                <td class="celda txt-der">${escapeXml(f.precision)}</td>
                <td class="celda txt-centro">${escapeXml(f.duracion)}</td>
                <td class="celda txt-der mso-numero" style="color: #15803D;">${f.aciertos}</td>
                <td class="celda txt-der mso-numero" style="color: ${f.errores > 0 ? '#B91C1C' : '#64748B'};">${f.errores}</td>
                <td class="celda txt-izq">${escapeXml(f.impacto)}</td>
                <td class="celda txt-centro" style="font-weight: 700; color: ${f.pregunta === 'CORRECTA' ? '#15803D' : (f.pregunta === 'INCORRECTA' ? '#B91C1C' : '#64748B')};">${escapeXml(f.pregunta)}</td>
                <td class="celda txt-centro" style="font-weight: 700; color: #1E293B;">${escapeXml(f.califDocente)}</td>
                <td class="celda txt-izq" style="color: #475569;">${escapeXml(f.obsDocente)}</td>
            </tr>`;
        });

        const htmlCompleto = `
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:x="urn:schemas-microsoft-com:office:excel"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <!--[if gte mso 9]>
    <xml>
        <x:ExcelWorkbook>
            <x:ExcelWorksheets>
                <x:ExcelWorksheet>
                    <x:Name>Informe Pedagógico EcoRescate</x:Name>
                    <x:WorksheetOptions>
                        <x:DisplayGridlines/>
                    </x:WorksheetOptions>
                </x:ExcelWorksheet>
            </x:ExcelWorksheets>
        </x:ExcelWorkbook>
    </xml>
    <![endif]-->
    <style>
        body, table, td, th {
            font-family: 'Segoe UI', Calibri, Arial, sans-serif;
            font-size: 10pt;
            color: #1E293B;
        }
        table {
            border-collapse: collapse;
        }
        .banner-principal {
            background-color: #15803D;
            color: #FFFFFF;
            font-size: 15pt;
            font-weight: bold;
            text-align: center;
            height: 42px;
            vertical-align: middle;
            border: 2px solid #166534;
        }
        .banner-sub {
            background-color: #DCFCE7;
            color: #14532D;
            font-size: 10.5pt;
            font-weight: bold;
            text-align: center;
            height: 26px;
            vertical-align: middle;
            border: 1px solid #BBF7D0;
        }
        .meta-etiqueta {
            background-color: #F1F5F9;
            color: #475569;
            font-weight: bold;
            font-size: 9.5pt;
            border: 1px solid #CBD5E1;
            padding: 6px 10px;
        }
        .meta-valor {
            background-color: #FFFFFF;
            color: #0F172A;
            font-weight: bold;
            font-size: 10pt;
            border: 1px solid #CBD5E1;
            padding: 6px 10px;
        }
        th.col-header {
            background-color: #1E293B;
            color: #FFFFFF;
            font-weight: bold;
            font-size: 10pt;
            text-align: center;
            vertical-align: middle;
            border: 1px solid #0F172A;
            height: 34px;
            padding: 6px 8px;
        }
        td.celda {
            border: 1px solid #CBD5E1;
            padding: 6px 8px;
            vertical-align: middle;
            font-size: 9.5pt;
        }
        .fila-par { background-color: #FFFFFF; }
        .fila-impar { background-color: #F8FAFC; }
        .badge-ad { background-color: #DCFCE7; color: #15803D; font-weight: bold; text-align: center; }
        .badge-a  { background-color: #EFF6FF; color: #1D4ED8; font-weight: bold; text-align: center; }
        .badge-b  { background-color: #FEF9C3; color: #A16207; font-weight: bold; text-align: center; }
        .badge-c  { background-color: #FEE2E2; color: #B91C1C; font-weight: bold; text-align: center; }
        .superado-si { background-color: #DCFCE7; color: #166534; font-weight: bold; text-align: center; }
        .superado-no { background-color: #FEE2E2; color: #991B1B; font-weight: bold; text-align: center; }
        .fila-total {
            background-color: #E2E8F0;
            color: #0F172A;
            font-weight: bold;
            font-size: 10pt;
            border-top: 3px double #475569;
            border-bottom: 2px solid #475569;
            height: 32px;
        }
        .txt-centro { text-align: center; }
        .txt-izq { text-align: left; }
        .txt-der { text-align: right; }
        .mso-texto { mso-number-format: "\\@"; }
        .mso-numero { mso-number-format: "\\#\\,\\#\\#0"; }
    </style>
</head>
<body>
    <table>
        <colgroup>
            <col width="110"> <!-- DNI -->
            <col width="220"> <!-- Estudiante -->
            <col width="65">  <!-- Grado -->
            <col width="65">  <!-- Sección -->
            <col width="135"> <!-- Fecha y Hora -->
            <col width="175"> <!-- Minijuego -->
            <col width="75">  <!-- Nivel -->
            <col width="95">  <!-- Superado -->
            <col width="90">  <!-- Puntaje -->
            <col width="95">  <!-- Estrellas -->
            <col width="85">  <!-- Nota (1-20) -->
            <col width="170"> <!-- Nivel MINEDU -->
            <col width="90">  <!-- Precisión -->
            <col width="95">  <!-- Duración -->
            <col width="75">  <!-- Aciertos -->
            <col width="75">  <!-- Errores -->
            <col width="180"> <!-- Impacto Ambiental -->
            <col width="125"> <!-- Desafío del Saber -->
            <col width="115"> <!-- Calif. Docente -->
            <col width="320"> <!-- Observación Pedagógica -->
        </colgroup>
        <thead>
            <tr>
                <th colspan="20" class="banner-principal">OPERACIÓN ECORESCATE • INFORME PEDAGÓGICO DE DESEMPEÑO AMBIENTAL</th>
            </tr>
            <tr>
                <th colspan="20" class="banner-sub">Monitoreo de Competencias Escolares y Métricas de Preservación del Medio Ambiente • Ica, Perú</th>
            </tr>
            <tr>
                <td colspan="3" class="meta-etiqueta">Fecha de Emisión:</td>
                <td colspan="4" class="meta-valor">${escapeXml(fechaActual)}</td>
                <td colspan="3" class="meta-etiqueta">Total Estudiantes:</td>
                <td colspan="3" class="meta-valor">${totalAlumnos} registrados</td>
                <td colspan="3" class="meta-etiqueta">Partidas Evaluadas:</td>
                <td colspan="4" class="meta-valor">${totalPartidas} registros</td>
            </tr>
            <tr>
                <td colspan="3" class="meta-etiqueta">Promedio General del Salón:</td>
                <td colspan="4" class="meta-valor" style="color: #15803D;">${promedioNotas} / 20 (${promedioNotas >= 17 ? 'AD - Logro Destacado' : (promedioNotas >= 14 ? 'A - Logro Esperado' : 'B - En Proceso')})</td>
                <td colspan="3" class="meta-etiqueta">Puntaje Promedio:</td>
                <td colspan="3" class="meta-valor">${promedioPuntaje.toLocaleString()} pts</td>
                <td colspan="3" class="meta-etiqueta">Impacto Ecológico Total:</td>
                <td colspan="4" class="meta-valor" style="font-size: 9.5pt;">${residuosReciclados.toFixed(1)} kg reciclados • ${aguaAhorrada.toFixed(1)} L agua • ${energiaAhorrada.toFixed(1)} kWh</td>
            </tr>
            <tr>
                <td colspan="20" style="height: 12px; border: none; background: transparent;"></td>
            </tr>
            <tr>
                <th class="col-header">DNI / Código</th>
                <th class="col-header">Estudiante</th>
                <th class="col-header">Grado</th>
                <th class="col-header">Sección</th>
                <th class="col-header">Fecha y Hora</th>
                <th class="col-header">Minijuego Ambiental</th>
                <th class="col-header">Nivel</th>
                <th class="col-header">Superado</th>
                <th class="col-header">Puntaje</th>
                <th class="col-header">Estrellas</th>
                <th class="col-header">Nota (1-20)</th>
                <th class="col-header">Escala MINEDU</th>
                <th class="col-header">Precisión</th>
                <th class="col-header">Duración</th>
                <th class="col-header">Aciertos</th>
                <th class="col-header">Errores</th>
                <th class="col-header">Impacto Ambiental</th>
                <th class="col-header">Desafío del Saber</th>
                <th class="col-header">Calif. Docente</th>
                <th class="col-header">Observación Pedagógica del Docente</th>
            </tr>
        </thead>
        <tbody>
            ${filasHtml}
        </tbody>
        <tfoot>
            <tr class="fila-total">
                <td class="celda txt-centro" colspan="4">PROMEDIOS Y TOTALES:</td>
                <td class="celda txt-centro" colspan="4">${totalPartidas} partidas analizadas</td>
                <td class="celda txt-der mso-numero">${promedioPuntaje}</td>
                <td class="celda txt-centro">-</td>
                <td class="celda txt-centro">${promedioNotas}</td>
                <td class="celda txt-centro">${promedioNotas >= 17 ? 'AD' : (promedioNotas >= 14 ? 'A' : 'B')}</td>
                <td class="celda txt-der">${totalPartidas > 0 ? Math.round((sumaAciertos / Math.max(1, sumaAciertos + sumaErrores)) * 100) : 0}%</td>
                <td class="celda txt-centro">-</td>
                <td class="celda txt-der mso-numero" style="color: #15803D;">${sumaAciertos}</td>
                <td class="celda txt-der mso-numero" style="color: ${sumaErrores > 0 ? '#B91C1C' : '#64748B'};">${sumaErrores}</td>
                <td class="celda txt-izq" colspan="4">Impacto ambiental registrado en Ica</td>
            </tr>
        </tfoot>
    </table>
</body>
</html>`;

        const blob = new Blob(['\uFEFF' + htmlCompleto], { type: 'application/vnd.ms-excel;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ecorescate_informe_docente_${new Date().toISOString().slice(0, 10)}.xls`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Exportar datos planos docentes a CSV con encabezados legibles en español
    exportarCSV() {
        const CABECERA = [
            'DNI / Código',
            'Estudiante',
            'Grado',
            'Sección',
            'Fecha y Hora',
            'Minijuego',
            'Nivel',
            'Misión Superada',
            'Puntaje (pts)',
            'Estrellas',
            'Nota Vigesimal (1 al 20)',
            'Escala MINEDU',
            'Precisión (%)',
            'Duración (seg)',
            'Aciertos',
            'Errores',
            'Impacto Cuantificado',
            'Unidad de Impacto',
            'Desafío del Saber',
            'Calificación Docente',
            'Observación Pedagógica'
        ].join(';');

        const formatearFecha = (fStr) => {
            if (!fStr) return '-';
            try {
                const f = new Date(String(fStr).replace(' ', 'T'));
                if (isNaN(f.getTime())) return String(fStr);
                const d = String(f.getDate()).padStart(2, '0');
                const m = String(f.getMonth() + 1).padStart(2, '0');
                const y = f.getFullYear();
                const hh = String(f.getHours()).padStart(2, '0');
                const mm = String(f.getMinutes()).padStart(2, '0');
                return `${d}/${m}/${y} ${hh}:${mm}`;
            } catch (e) {
                return String(fStr);
            }
        };

        const filas = [CABECERA];

        for (const k in this.perfiles) {
            const p = this.perfiles[k];
            for (const s of (p.partidas || [])) {
                const notaPartida = Number(s.nota) || (s.superado === 'SI' || s.superado === true ? 18 : 8);
                const escalaPartida = s.escala || ((typeof obtenerEscalaMINEDU === 'function') ? obtenerEscalaMINEDU(notaPartida).literal : 'A');
                const superado = (s.superado === 'SI' || s.superado === true) ? 'SÍ' : 'NO';
                const pregunta = (s.preguntaCorrecta === true || s.preguntaCorrecta === 'SI')
                    ? 'CORRECTA'
                    : ((s.preguntaCorrecta === false || s.preguntaCorrecta === 'NO') ? 'INCORRECTA' : 'N/A');

                const obsLimpia = (p.observacionDocente || '').replace(/"/g, '""');

                const campos = [
                    p.dni || p.codigo || 'S/DNI',
                    `"${(p.nombre || '').replace(/"/g, '""')}"`,
                    p.grado || '-',
                    p.seccion || '-',
                    formatearFecha(s.fecha),
                    `"${(s.minijuego || s.juegoId || '').replace(/"/g, '""')}"`,
                    s.nivel || 1,
                    superado,
                    s.puntaje || 0,
                    s.estrellas || 0,
                    notaPartida,
                    escalaPartida,
                    s.precisionPct !== undefined ? `${s.precisionPct}%` : '100%',
                    s.duracionSeg || 0,
                    s.aciertos || 0,
                    s.errores || 0,
                    String(s.impacto || 0).replace('.', ','),
                    `"${(s.unidadImpacto || '').replace(/"/g, '""')}"`,
                    pregunta,
                    p.calificacionDocente ? `${p.calificacionDocente} / 20` : 'Sin calificar',
                    `"${obsLimpia}"`
                ];
                filas.push(campos.join(';'));
            }
        }

        const contenido = '\uFEFF' + filas.join('\r\n');
        const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ecorescate_datos_docente_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Instancia global
window.storageEco = new GestorAlmacenamiento();

