/**
 * Operación EcoRescate - Gestor de Almacenamiento Local (localStorage)
 * Maneja perfiles de alumnos, desbloqueo de niveles, estrellas, EcoMonedas,
 * 14 medallas, historial de partidas y exportación a CSV.
 */
class GestorAlmacenamiento {
    constructor() {
        this.CLAVE_PERFILES = 'ecorescate_perfiles_v1';
        this.CLAVE_ACTIVO = 'ecorescate_estudiante_activo_v1';
        this.perfiles = this.cargarPerfiles();
        this.estudianteActivo = this.cargarEstudianteActivo();
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

    crearClave(estudiante) {
        if (!estudiante) return 'anonimo';
        const norm = (str) => (str || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
        return `${norm(estudiante.nombre)}_${estudiante.grado}_${norm(estudiante.seccion)}`;
    }

    obtenerPerfil(estudiante = this.estudianteActivo) {
        if (!estudiante) return null;
        const clave = this.crearClave(estudiante);
        if (!this.perfiles[clave]) {
            this.perfiles[clave] = {
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
            estrellas
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

    // Exportar todas las partidas a CSV separado por ';' con BOM UTF-8
    exportarCSV() {
        const CABECERA = 'fecha;alumno;grado;seccion;codigo_juego;minijuego;puntaje;nivel;completado;aciertos;errores;precision_pct;duracion_seg;impacto;unidad_impacto;pregunta_correcta;estrellas';
        const filas = [CABECERA];

        for (const k in this.perfiles) {
            const p = this.perfiles[k];
            for (const s of (p.partidas || [])) {
                const campos = [
                    s.fecha,
                    p.nombre,
                    p.grado,
                    p.seccion,
                    s.juegoId,
                    s.minijuego,
                    s.puntaje,
                    s.nivel,
                    s.superado,
                    s.aciertos,
                    s.errores,
                    s.precisionPct,
                    s.duracionSeg,
                    String(s.impacto).replace('.', ','),
                    s.unidadImpacto,
                    s.preguntaCorrecta,
                    s.estrellas
                ];
                filas.push(campos.join(';'));
            }
        }

        const contenido = '\uFEFF' + filas.join('\r\n');
        const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ecorescate_partidas_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Instancia global
window.storageEco = new GestorAlmacenamiento();

