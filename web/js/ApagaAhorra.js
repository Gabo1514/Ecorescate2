/**
 * Operación EcoRescate - Minijuego 3: Apaga y Ahorra
 *
 * Escuela de Ica al atardecer y anochecer. Los alumnos se retiran de las aulas
 * y olvidan luces y aparatos encendidos.
 *
 * Reglas pedagógicas:
 * - Apagar luces y equipos ÚNICAMENTE en aulas vacías (si hay alumnos se necesita la luz/equipo).
 * - Desenchufar cargadores sin celular en cualquier momento (consumo vampiro/fantasma).
 * - Ayuda visual: en niveles 1 a 4 se muestran botones circulares rojos de asistencia;
 *   desde el nivel 5 desaparecen para fomentar la autonomía del estudiante.
 * - Ciclo de atardecer a noche nivel a nivel con estrellas y luna.
 */

class ApagaAhorra extends MinijuegoBase {
    constructor(canvas, tipoId) {
        super(canvas, tipoId);

        // Constantes de dimensiones de aulas
        this.W_AULA = 296;
        this.H_AULA = 178;

        // Lista de los 6 ambientes del colegio
        this.ambientes = [];

        // Temporizadores de eventos
        this.proximaClase = 0;
        this.proximoOlvido = 0;
        this.proximoCargador = 0;
        this.apagadosTotales = 0;
        this.vioCargador = false;

        // Estrellas parpadeantes para el cielo nocturno
        this.estrellasCielo = [];
        for (let i = 0; i < 40; i++) {
            this.estrellasCielo.push({
                x: 20 + Math.random() * 960,
                y: 12 + Math.random() * 140,
                r: 1 + Math.random() * 2,
                fase: Math.random() * Math.PI * 2,
                vel: 1.5 + Math.random() * 2.5
            });
        }
    }

    motivoDerrota() {
        return 'Se agotó la reserva de energía del colegio';
    }

    textoControles() {
        return 'Toca o haz clic sobre luces y equipos en aulas vacías';
    }

    resumenPie() {
        return ['APAGADOS', String(this.apagadosTotales)];
    }

    pista() {
        if (this.nivelNumero <= 4) {
            return [
                'Apaga lo que nadie usa',
                'Los botones rojos marcan lo que gasta energía sin que nadie lo use.'
            ];
        }
        return [
            'Observa bien cada ambiente',
            'Si está "Vacío", apaga todo. Si dice "En clase", deja lo que están usando.'
        ];
    }

    reiniciar() {
        this.apagadosTotales = 0;
        this.vioCargador = false;
        this.proximaClase = 2.0;
        this.proximoOlvido = 1.8;
        this.proximoCargador = 4.5;

        const nombres = [
            'Aula 1.° A', 'Biblioteca', 'Sala de Cómputo',
            'Aula 5.° B', 'Dirección', 'Comedor'
        ];
        const aparatos = ['TV', 'VENTILADOR', 'COMPUTADORA', 'VENTILADOR', 'COMPUTADORA', 'TV'];
        const paredes = ['#FBE7C6', '#DDF0D5', '#D7E7F7', '#F7DCD3', '#E7DDF4', '#F6EDC9'];
        const zocalos = ['#E2CCA9', '#C2D9BA', '#BDCDE0', '#DFC2B9', '#CFBEDE', '#DFD5AD'];

        this.ambientes = [];
        for (let i = 0; i < 6; i++) {
            const fila = i < 3 ? 0 : 1;
            const col = i % 3;
            const rx = 52 + col * 300;
            const ry = fila === 0 ? 174 : 360;

            const foco = {
                tipo: 'FOCO',
                nombre: 'la luz',
                zona: { x: rx + 120, y: ry + 16, w: 56, h: 56 },
                encendido: false,
                desperdicio: 0,
                consumo: 0.007
            };

            const aparatoZona = this.obtenerZonaAparato(aparatos[i], rx, ry);
            const aparato = {
                tipo: aparatos[i],
                nombre: aparatos[i] === 'TV' ? 'el televisor' : (aparatos[i] === 'COMPUTADORA' ? 'la computadora' : 'el ventilador'),
                zona: aparatoZona,
                encendido: false,
                desperdicio: 0,
                giro: 0,
                consumo: aparatos[i] === 'VENTILADOR' ? 0.009 : 0.012
            };

            const cargador = {
                tipo: 'CARGADOR',
                nombre: 'el cargador sin celular',
                zona: { x: rx + 14, y: ry + 112, w: 42, h: 48 },
                encendido: false,
                desperdicio: 0,
                consumo: 0.005
            };

            this.ambientes.push({
                indice: i,
                nombre: nombres[i],
                rect: { x: rx, y: ry, w: this.W_AULA, h: this.H_AULA },
                pared: paredes[i],
                zocalo: zocalos[i],
                foco,
                aparato,
                cargador,
                ocupado: 0,
                alumnos: []
            });
        }

        // Iniciar con dos aulas ocupadas con clases
        this.entrarAlumnos(this.ambientes[0]);
        this.entrarAlumnos(this.ambientes[4]);

        // Y en un aula vacía se olvidaron la luz encendida para empezar con un acierto
        const aulaVacia = this.ambientes[1];
        aulaVacia.foco.encendido = true;
    }

    obtenerZonaAparato(tipo, rx, ry) {
        if (tipo === 'TV') {
            return { x: rx + 200, y: ry + 52, w: 86, h: 112 };
        } else if (tipo === 'COMPUTADORA') {
            return { x: rx + 194, y: ry + 70, w: 92, h: 94 };
        } else {
            // VENTILADOR
            return { x: rx + 210, y: ry + 40, w: 76, h: 124 };
        }
    }

    entrarAlumnos(ambiente) {
        // Duración de la clase entre 9 y 14 segundos
        ambiente.ocupado = 10 + Math.random() * 4;
        ambiente.alumnos = [];

        // Generar 1 o 2 alumnos
        const cantidad = 1 + (Math.random() < 0.65 ? 1 : 0);
        const coloresPiel = ['#FAD4B2', '#F1BE96', '#D69465', '#B86F3E', '#FCE2C4'];
        const coloresPelo = ['#2B2320', '#4A3728', '#8A4A25', '#1E1B18', '#63391A'];
        const coloresPolo = ['#FFFFFF', '#E0F2FE', '#FEF3C7', '#FEE2E2', '#E0E7FF'];

        for (let i = 0; i < cantidad; i++) {
            ambiente.alumnos.push({
                colorPiel: coloresPiel[Math.floor(Math.random() * coloresPiel.length)],
                colorPelo: coloresPelo[Math.floor(Math.random() * coloresPelo.length)],
                colorPolo: coloresPolo[Math.floor(Math.random() * coloresPolo.length)],
                estiloPelo: Math.floor(Math.random() * 3),
                parpadeo: Math.random() * 5
            });
        }

        // Al entrar los alumnos, encienden la luz de inmediato
        ambiente.foco.encendido = true;
        ambiente.foco.desperdicio = 0;

        // 75% de probabilidad de que también usen el aparato
        if (Math.random() < 0.75) {
            ambiente.aparato.encendido = true;
            ambiente.aparato.desperdicio = 0;
        }
    }

    actualizar(dt) {
        // 1. Temporizador de nueva clase en salón desocupado
        this.proximaClase -= dt;
        if (this.proximaClase <= 0) {
            const desocupados = this.ambientes.filter(a => a.ocupado <= 0);
            if (desocupados.length > 0) {
                const elegido = desocupados[Math.floor(Math.random() * desocupados.length)];
                this.entrarAlumnos(elegido);
            }
            this.proximaClase = 4.0 + Math.random() * 3.5;
        }

        // 2. Temporizador de olvidos de equipos en salones vacíos
        this.proximoOlvido -= dt;
        if (this.proximoOlvido <= 0) {
            const candidatos = [];
            this.ambientes.forEach(a => {
                if (a.ocupado <= 0) {
                    if (!a.foco.encendido) candidatos.push(a.foco);
                    if (!a.aparato.encendido) candidatos.push(a.aparato);
                }
            });

            if (candidatos.length > 0) {
                // Priorizar los que el jugador todavía necesita para completar el reto actual
                const necesarios = candidatos.filter(e => {
                    const actual = this.progresoRetos[e.tipo] || 0;
                    const reto = this.def.retos.find(r => r.clave === e.tipo);
                    return reto && actual < reto.meta;
                });

                const listaFinal = necesarios.length > 0 && Math.random() < 0.7 ? necesarios : candidatos;
                const equipoEncendido = listaFinal[Math.floor(Math.random() * listaFinal.length)];
                equipoEncendido.encendido = true;
                equipoEncendido.desperdicio = 0;
            }

            // A mayor nivel, la frecuencia de olvido sube
            const ritmoNivel = Math.max(1.2, 3.2 - (this.nivelNumero - 1) * 0.18);
            this.proximoOlvido = ritmoNivel * (0.8 + Math.random() * 0.4);
        }

        // 3. Temporizador de cargador sin celular (desde nivel 3 o si hay reto de CARGADOR)
        const tieneRetoCargador = this.def.retos.some(r => r.clave === 'CARGADOR');
        if (this.nivelNumero >= 3 || tieneRetoCargador) {
            this.proximoCargador -= dt;
            if (this.proximoCargador <= 0) {
                const aulasSinCargador = this.ambientes.filter(a => !a.cargador.encendido);
                if (aulasSinCargador.length > 0) {
                    const aElegida = aulasSinCargador[Math.floor(Math.random() * aulasSinCargador.length)];
                    aElegida.cargador.encendido = true;
                    aElegida.cargador.desperdicio = 0;

                    if (!this.vioCargador) {
                        this.vioCargador = true;
                        this.mensajeToast = {
                            texto: '¡Nuevo: cargador enchufado sin celular! Aunque nadie lo use, sigue gastando energía.',
                            esError: false,
                            tiempo: 4.5
                        };
                    }
                }
                const intervaloCargador = Math.max(4.0, 7.5 - (this.nivelNumero - 1) * 0.25);
                this.proximoCargador = intervaloCargador * (0.8 + Math.random() * 0.4);
            }
        }

        // 4. Actualizar estado interno de cada ambiente y consumo del medidor
        const multiplicadorConsumo = 0.8 + (this.nivelNumero - 1) * 0.05;

        this.ambientes.forEach(a => {
            // Descontar tiempo de permanencia de los alumnos
            if (a.ocupado > 0) {
                a.ocupado -= dt;
                // Si la clase terminó justo en este fotograma, los alumnos se van y dejan todo prendido
                if (a.ocupado <= 0) {
                    a.ocupado = 0;
                    a.alumnos = [];
                }
            }

            // Giro del ventilador si está encendido
            if (a.aparato.encendido && a.aparato.tipo === 'VENTILADOR') {
                a.aparato.giro += dt * 16;
            }

            // Calcular consumo inútil que vacía el medidor de energía del colegio
            const equipos = [a.foco, a.aparato, a.cargador];
            equipos.forEach(e => {
                // Desperdicio ocurre si está encendido en aula vacía,
                // O si es un cargador sin celular (desperdicio incluso con gente)
                const gastaInutilmente = e.encendido && (a.ocupado <= 0 || e.tipo === 'CARGADOR');
                if (gastaInutilmente) {
                    e.desperdicio += dt;
                    // Reducir la barra de energía del colegio
                    const drenaje = dt * e.consumo * multiplicadorConsumo;
                    this.medidor = Math.max(0, this.medidor - drenaje);
                }
            });
        });
    }

    alPresionar(x, y) {
        // Buscar qué equipo fue tocado
        let equipoTocado = null;
        let aulaTocada = null;

        for (const a of this.ambientes) {
            // Revisar cargador (prioridad alta al clic por tamaño)
            if (a.cargador.encendido && this.puntoEnRect(x, y, a.cargador.zona, 8)) {
                equipoTocado = a.cargador;
                aulaTocada = a;
                break;
            }
            // Revisar foco
            if (this.puntoEnRect(x, y, a.foco.zona, 10)) {
                equipoTocado = a.foco;
                aulaTocada = a;
                break;
            }
            // Revisar aparato principal
            if (this.puntoEnRect(x, y, a.aparato.zona, 8)) {
                equipoTocado = a.aparato;
                aulaTocada = a;
                break;
            }
        }

        if (!equipoTocado) return;

        const tx = equipoTocado.zona.x + equipoTocado.zona.w / 2;
        const ty = equipoTocado.zona.y;

        // Caso 1: Ya está apagado
        if (!equipoTocado.encendido) {
            this.crearChispas(tx, ty + 10, '#CBD5E1', 6);
            return;
        }

        // Caso 2: Es un CARGADOR enchufado sin celular
        if (equipoTocado.tipo === 'CARGADOR') {
            equipoTocado.encendido = false;
            this.apagadosTotales++;
            this.medidor = Math.min(1.0, this.medidor + 0.035);

            this.acierto(14, tx, ty, 'CARGADOR');
            if (this.progresoRetos['APAGADOS'] !== undefined) {
                this.progresoRetos['APAGADOS']++;
            }

            this.crearChispas(tx, ty + 10, '#38BDF8', 22);
            return;
        }

        // Caso 3: Es FOCO o APARATO, pero en el aula hay estudiantes en clase
        if (aulaTocada.ocupado > 0) {
            // ¡Error pedagógico!
            const explicacion = `¡En ${aulaTocada.nombre} hay alumnos! Ellos necesitan ${equipoTocado.nombre}. Apaga solo en salones vacíos.`;
            this.registrarError(explicacion, 0.07);
            return;
        }

        // Caso 4: Es FOCO o APARATO en aula vacía -> ¡Acierto legítimo!
        equipoTocado.encendido = false;
        this.apagadosTotales++;

        // Bono de rapidez según cuánto tiempo estuvo encendido
        const bonoRapidez = Math.max(0, Math.round(6 - equipoTocado.desperdicio * 1.1));
        const puntosAcierto = 10 + bonoRapidez;

        this.acierto(puntosAcierto, tx, ty, equipoTocado.tipo);
        if (this.progresoRetos['APAGADOS'] !== undefined) {
            this.progresoRetos['APAGADOS']++;
        }

        // Recuperar un pequeño porcentaje de reserva de energía
        this.medidor = Math.min(1.0, this.medidor + 0.025);

        // Chispas de ahorro en el punto de contacto
        const colorChispa = equipoTocado.tipo === 'FOCO' ? '#FACC15' : '#38BDF8';
        this.crearChispas(tx, ty + 10, colorChispa, 20);
    }

    puntoEnRect(px, py, r, margen = 0) {
        return (
            px >= r.x - margen &&
            px <= r.x + r.w + margen &&
            py >= r.y - margen &&
            py <= r.y + r.h + margen
        );
    }

    dibujarEscena(ctx) {
        // Progreso del anochecer (0 = tarde soleada, 1 = noche cerrada)
        const factorNoche = Math.min(1, Math.max(0, (this.nivelNumero - 1) / 9));

        // 1. Cielo exterior de fondo
        this.dibujarCieloExterior(ctx, factorNoche);

        // 2. Estructura exterior del colegio (techo, paredes y césped)
        this.dibujarEstructuraColegio(ctx);

        // 3. Dibujar cada uno de los 6 ambientes
        this.ambientes.forEach(a => this.dibujarAmbiente(ctx, a, factorNoche));

        // 4. Baranda / Viga horizontal divisoria entre pisos
        ctx.fillStyle = '#B9A27D';
        ctx.fillRect(46, 352, 908, 8);
        ctx.strokeStyle = '#2A2340';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(44, 352);
        ctx.lineTo(956, 352);
        ctx.moveTo(44, 360);
        ctx.lineTo(956, 360);
        ctx.stroke();
    }

    dibujarCieloExterior(ctx, factorNoche) {
        ctx.save();
        // 1. Cielo atmosférico según la hora del día escolar
        const gradCielo = ctx.createLinearGradient(0, this.ESC_Y, 0, 480);
        if (factorNoche < 0.4) {
            // Tarde luminosa (Ica soleada con horizonte cálido)
            gradCielo.addColorStop(0, '#0284C7');
            gradCielo.addColorStop(0.35, '#38BDF8');
            gradCielo.addColorStop(0.75, '#BAE6FD');
            gradCielo.addColorStop(1, '#FFEDD5');
        } else if (factorNoche < 0.75) {
            // Atardecer crepuscular en el desierto
            gradCielo.addColorStop(0, '#1E1B4B');
            gradCielo.addColorStop(0.35, '#4338CA');
            gradCielo.addColorStop(0.7, '#C026D3');
            gradCielo.addColorStop(1, '#F97316');
        } else {
            // Noche profunda estrellada
            gradCielo.addColorStop(0, '#020617');
            gradCielo.addColorStop(0.4, '#0F172A');
            gradCielo.addColorStop(0.8, '#1E1B4B');
            gradCielo.addColorStop(1, '#312E81');
        }

        ctx.fillStyle = gradCielo;
        ctx.fillRect(this.ESC_X, this.ESC_Y, this.ESC_W, this.ESC_H);

        // 2. Sol o Luna en el cielo exterior derecho
        if (factorNoche < 0.5) {
            // Sol radiante poniéndose sobre el desierto de Ica
            const solY = 140 + factorNoche * 60;
            const sx = 892;

            // Halo envolvente
            const gradSol = ctx.createRadialGradient(sx, solY, 8, sx, solY, 44);
            gradSol.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
            gradSol.addColorStop(0.4, 'rgba(251, 191, 36, 0.35)');
            gradSol.addColorStop(1, 'rgba(245, 158, 11, 0)');
            ctx.fillStyle = gradSol;
            ctx.beginPath();
            ctx.arc(sx, solY, 44, 0, Math.PI * 2);
            ctx.fill();

            // Disco solar
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(sx, solY, 18, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#FDE047';
            ctx.beginPath();
            ctx.arc(sx, solY, 14, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Luna creciente dorada
            const lunaX = 890, lunaY = 145;

            // Resplandor lunar
            const gradLuna = ctx.createRadialGradient(lunaX, lunaY, 4, lunaX, lunaY, 36);
            gradLuna.addColorStop(0, 'rgba(254, 240, 138, 0.35)');
            gradLuna.addColorStop(1, 'rgba(254, 240, 138, 0)');
            ctx.fillStyle = gradLuna;
            ctx.beginPath();
            ctx.arc(lunaX, lunaY, 36, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#FEF08A';
            ctx.beginPath();
            ctx.arc(lunaX, lunaY, 20, 0, Math.PI * 2);
            ctx.fill();

            // Muesca lunar
            ctx.fillStyle = factorNoche < 0.75 ? '#4338CA' : '#0F172A';
            ctx.beginPath();
            ctx.arc(lunaX + 9, lunaY - 4, 18, 0, Math.PI * 2);
            ctx.fill();

            // Estrellas titilantes
            this.estrellasCielo.forEach(e => {
                if (e.y < 165 || e.x < 44 || e.x > 956) {
                    const brillo = 0.35 + 0.65 * (Math.sin(this.relojTotal * e.vel + e.fase) * 0.5 + 0.5);
                    ctx.fillStyle = `rgba(255, 255, 255, ${brillo})`;
                    ctx.beginPath();
                    ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
                    ctx.fill();
                }
            });
        }

        // 3. Césped escolar en la base del edificio
        const gradCesped = ctx.createLinearGradient(0, 544, 0, this.ESC_ABA);
        gradCesped.addColorStop(0, '#4ADE80');
        gradCesped.addColorStop(0.5, '#22C55E');
        gradCesped.addColorStop(1, '#15803D');
        ctx.fillStyle = gradCesped;
        ctx.fillRect(this.ESC_X, 544, this.ESC_W, this.ESC_ABA - 544);

        ctx.strokeStyle = '#14532D';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(this.ESC_X, 544);
        ctx.lineTo(this.ESC_DER, 544);
        ctx.stroke();

        ctx.restore();
    }

    dibujarEstructuraColegio(ctx) {
        ctx.save();
        // Fachada moderna de pabellón escolar bicentenario
        ctx.fillStyle = '#CBD5E1';
        ctx.strokeStyle = '#1E293B';
        ctx.lineWidth = 2.4;

        // Cornisa superior del pabellón
        const gradCornisa = ctx.createLinearGradient(0, 168, 0, 182);
        gradCornisa.addColorStop(0, '#FFFFFF');
        gradCornisa.addColorStop(1, '#94A3B8');
        ctx.fillStyle = gradCornisa;
        ctx.beginPath();
        ctx.roundRect(40, 168, 920, 14, 4);
        ctx.fill();
        ctx.stroke();

        // Friso rojo institucional del colegio
        ctx.fillStyle = '#B91C1C';
        ctx.fillRect(44, 182, 912, 6);

        // Columnas maestras de soporte estructural
        const columnas = [42, 498, 954];
        columnas.forEach(cx => {
            const gradCol = ctx.createLinearGradient(cx - 7, 0, cx + 7, 0);
            gradCol.addColorStop(0, '#E2E8F0');
            gradCol.addColorStop(0.4, '#FFFFFF');
            gradCol.addColorStop(1, '#94A3B8');

            ctx.fillStyle = gradCol;
            ctx.beginPath();
            ctx.roundRect(cx - 6, 188, 12, 356, 3);
            ctx.fill();
            ctx.stroke();
        });

        // Losa intermedia entre pisos (Piso 1 y Piso 2)
        const gradLosa = ctx.createLinearGradient(0, 360, 0, 374);
        gradLosa.addColorStop(0, '#F1F5F9');
        gradLosa.addColorStop(0.5, '#CBD5E1');
        gradLosa.addColorStop(1, '#64748B');
        ctx.fillStyle = gradLosa;
        ctx.beginPath();
        ctx.roundRect(40, 360, 920, 14, 3);
        ctx.fill();
        ctx.stroke();

        ctx.restore();
    }

    dibujarAmbiente(ctx, a, factorNoche) {
        const { x, y, w, h } = a.rect;
        const hayAlumnos = a.ocupado > 0;
        const luzEncendida = a.foco.encendido;

        ctx.save();
        // 1. Recortar estrictamente al marco del aula
        ctx.beginPath();
        ctx.rect(x, y, w, h);
        ctx.clip();

        // 2. Color de la pared (luminoso si la luz está encendida, penumbra si está apagada)
        if (luzEncendida) {
            ctx.fillStyle = a.pared;
            ctx.fillRect(x, y, w, h);

            // Resplandor cálido radial del foco
            const gradHalo = ctx.createRadialGradient(x + w / 2, y + 48, 10, x + w / 2, y + 54, 180);
            gradHalo.addColorStop(0, 'rgba(254, 240, 138, 0.48)');
            gradHalo.addColorStop(0.5, 'rgba(253, 224, 71, 0.18)');
            gradHalo.addColorStop(1, 'rgba(250, 204, 21, 0)');
            ctx.fillStyle = gradHalo;
            ctx.fillRect(x, y, w, h);
        } else {
            // Penumbra en aula que apaga la luz para ahorrar energía
            ctx.fillStyle = this.mezclarColor(a.pared, '#0F172A', 0.65);
            ctx.fillRect(x, y, w, h);
        }

        // 3. Zócalo inferior del aula
        ctx.fillStyle = luzEncendida ? a.zocalo : this.mezclarColor(a.zocalo, '#1E1B4B', 0.65);
        ctx.fillRect(x, y + h - 16, w, 16);

        // Moldura del zócalo
        ctx.strokeStyle = '#1E293B';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x, y + h - 16);
        ctx.lineTo(x + w, y + h - 16);
        ctx.stroke();

        // 4. Ventana del aula que mira hacia afuera
        this.dibujarVentanaAula(ctx, x + 16, y + 42, 58, 52, factorNoche);

        // 5. Carpetas escolares y alumnos presentes
        this.dibujarCarpetasYAlumnos(ctx, a, luzEncendida);

        // 6. Foco colgante del techo
        this.dibujarFoco(ctx, a.foco, x + w / 2, y);

        // 7. Aparato electrónico si tiene (TV o PC)
        if (a.aparato) {
            this.dibujarAparato(ctx, a.aparato, luzEncendida);
        }

        // 8. Cargador de celular vampiro en tomacorriente de pared
        if (a.cargador) {
            this.dibujarCargador(ctx, a.cargador);
        }

        // 9. Cartel identificador del aula
        this.dibujarCartelAula(ctx, a, x, y, w);

        // 10. Marco perimetral del aula
        ctx.strokeStyle = '#1E293B';
        ctx.lineWidth = 2.4;
        ctx.strokeRect(x, y, w, h);

        ctx.restore();
    }

    dibujarVentanaAula(ctx, vx, vy, vw, vh, factorNoche) {
        ctx.save();
        // Marco de aluminio blanco de la ventana
        ctx.fillStyle = '#F8FAFC';
        ctx.strokeStyle = '#1E293B';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(vx, vy, vw, vh, 4);
        ctx.fill();
        ctx.stroke();

        // Cristal con vista al exterior según la hora
        const gradCristal = ctx.createLinearGradient(0, vy, 0, vy + vh);
        if (factorNoche < 0.4) {
            gradCristal.addColorStop(0, '#38BDF8');
            gradCristal.addColorStop(1, '#FED7AA');
        } else if (factorNoche < 0.75) {
            gradCristal.addColorStop(0, '#4338CA');
            gradCristal.addColorStop(1, '#FB923C');
        } else {
            gradCristal.addColorStop(0, '#0F172A');
            gradCristal.addColorStop(1, '#1E1B4B');
        }
        ctx.fillStyle = gradCristal;
        ctx.beginPath();
        ctx.roundRect(vx + 4, vy + 4, vw - 8, vh - 8, 3);
        ctx.fill();

        // Travesaño y montante de la ventana
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(vx + vw / 2, vy + 4);
        ctx.lineTo(vx + vw / 2, vy + vh - 4);
        ctx.moveTo(vx + 4, vy + vh / 2);
        ctx.lineTo(vx + vw - 4, vy + vh / 2);
        ctx.stroke();

        // Reflejos diagonales en el vidrio
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(vx + 10, vy + 30);
        ctx.lineTo(vx + 26, vy + 12);
        ctx.stroke();

        ctx.restore();
    }

    dibujarCarpetasYAlumnos(ctx, a, luzEncendida) {
        const { x, y, h } = a.rect;
        const colorMadera = luzEncendida ? '#A16207' : '#57370D';

        for (let i = 0; i < 2; i++) {
            const px = x + 92 + i * 58;
            const py = y + 130;

            // Si hay alumnos en clase, dibujarlos detrás de la mesa
            if (a.ocupado > 0 && i < a.alumnos.length) {
                this.dibujarEstudianteSentado(ctx, px + 22, y + h - 14, a.alumnos[i], luzEncendida);
            }

            // Tablero de la carpeta escolar
            ctx.fillStyle = colorMadera;
            ctx.strokeStyle = '#2A2340';
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.roundRect(px, py, 46, 10, 3);
            ctx.fill();
            ctx.stroke();

            // Patas metálicas de la carpeta
            ctx.fillStyle = '#475569';
            ctx.fillRect(px + 4, py + 10, 5, 24);
            ctx.fillRect(px + 37, py + 10, 5, 24);

            // Cuaderno abierto sobre la carpeta si hay alumnos
            if (a.ocupado > 0 && i < a.alumnos.length) {
                ctx.fillStyle = '#FFFFFF';
                ctx.strokeStyle = '#2A2340';
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.roundRect(px + 12, py - 4, 18, 8, 2);
                ctx.fill();
                ctx.stroke();
            }
        }
    }

    dibujarEstudianteSentado(ctx, cx, basePisoY, alumno, luzEncendida) {
        ctx.save();
        ctx.translate(cx, basePisoY);

        // Respiración suave
        const respiracion = Math.sin(this.relojTotal * 4 + cx) * 1.5;

        // Torso / Polo escolar con sombreado
        const colorBasePolo = luzEncendida ? alumno.colorPolo : this.mezclarColor(alumno.colorPolo, '#0F172A', 0.5);
        ctx.fillStyle = colorBasePolo;
        ctx.strokeStyle = '#1E293B';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(-10, -42 + respiracion, 20, 26, 5);
        ctx.fill();
        ctx.stroke();

        // Cuello
        ctx.fillStyle = alumno.colorPiel;
        ctx.beginPath();
        ctx.roundRect(-3, -46 + respiracion, 6, 6, 2);
        ctx.fill();

        // Cabeza con volumen y rubor
        const gradPiel = ctx.createRadialGradient(1, -58 + respiracion, 2, 0, -56 + respiracion, 14);
        gradPiel.addColorStop(0, '#FFE8D6');
        gradPiel.addColorStop(0.8, alumno.colorPiel);
        gradPiel.addColorStop(1, this.mezclarColor(alumno.colorPiel, '#78350F', 0.3));

        ctx.fillStyle = gradPiel;
        ctx.beginPath();
        ctx.arc(0, -56 + respiracion, 13, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Rubor en mejillas
        ctx.fillStyle = 'rgba(244, 63, 94, 0.28)';
        ctx.beginPath();
        ctx.arc(-6, -53 + respiracion, 3, 0, Math.PI * 2);
        ctx.arc(6, -53 + respiracion, 3, 0, Math.PI * 2);
        ctx.fill();

        // Cabello estilizado
        ctx.fillStyle = alumno.colorPelo;
        ctx.strokeStyle = '#1E293B';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        if (alumno.estiloPelo === 0) {
            // Cabello corto redondeado con mechones
            ctx.arc(0, -60 + respiracion, 13, Math.PI, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        } else if (alumno.estiloPelo === 1) {
            // Coleta con lazo
            ctx.arc(0, -60 + respiracion, 13, Math.PI * 0.9, Math.PI * 2.1);
            ctx.fill();
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(10, -52 + respiracion, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        } else {
            // Rizado
            ctx.arc(-5, -62 + respiracion, 8, 0, Math.PI * 2);
            ctx.arc(5, -62 + respiracion, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }

        // Ojos expresivos con destello de luz
        const dibujarOjoEstudiante = (ox) => {
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.ellipse(ox, -56 + respiracion, 2.5, 3.2, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#1E293B';
            ctx.beginPath();
            ctx.arc(ox + 0.5, -56 + respiracion, 1.8, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(ox, -57 + respiracion, 0.8, 0, Math.PI * 2);
            ctx.fill();
        };

        dibujarOjoEstudiante(-4);
        dibujarOjoEstudiante(4);

        // Sonrisa atenta
        ctx.strokeStyle = '#1E293B';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, -51 + respiracion, 3, 0.2, Math.PI - 0.2);
        ctx.stroke();

        // Brazos sobre la mesa con cuaderno
        ctx.fillStyle = alumno.colorPiel;
        ctx.beginPath();
        ctx.roundRect(-12, -30 + respiracion, 6, 12, 3);
        ctx.roundRect(6, -30 + respiracion, 6, 12, 3);
        ctx.fill();
        ctx.stroke();

        ctx.restore();
    }

    dibujarFoco(ctx, foco, cx, techoY) {
        ctx.save();
        const cy = techoY + 48;
        const hover = foco.encendido && this.puntoEnRect(this.ratonX, this.ratonY, foco.zona, 6);

        // Cable negro colgante desde el techo
        ctx.strokeStyle = '#0F172A';
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(cx, techoY);
        ctx.lineTo(cx, cy - 18);
        ctx.stroke();

        // Roseta / portalámparas de baquelita / bronce
        const gradRoseta = ctx.createLinearGradient(cx - 7, cy - 22, cx + 7, cy - 14);
        gradRoseta.addColorStop(0, '#94A3B8');
        gradRoseta.addColorStop(0.5, '#64748B');
        gradRoseta.addColorStop(1, '#334155');
        ctx.fillStyle = gradRoseta;
        ctx.strokeStyle = '#0F172A';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.roundRect(cx - 7, cy - 22, 14, 8, 2);
        ctx.fill();
        ctx.stroke();

        // Corona de resplandor activo si está encendido
        if (foco.encendido) {
            const gradGlow = ctx.createRadialGradient(cx, cy, 6, cx, cy, 32);
            gradGlow.addColorStop(0, 'rgba(254, 240, 138, 0.9)');
            gradGlow.addColorStop(0.5, 'rgba(250, 204, 21, 0.45)');
            gradGlow.addColorStop(1, 'rgba(250, 204, 21, 0)');
            ctx.fillStyle = gradGlow;
            ctx.beginPath();
            ctx.arc(cx, cy, 32, 0, Math.PI * 2);
            ctx.fill();
        }

        // Bombilla de vidrio con volumen esférico
        const gradFoco = ctx.createRadialGradient(cx - 4, cy - 4, 2, cx, cy, 14);
        if (foco.encendido) {
            gradFoco.addColorStop(0, '#FFFFFF');
            gradFoco.addColorStop(0.4, '#FEF08A');
            gradFoco.addColorStop(0.85, '#FACC15');
            gradFoco.addColorStop(1, '#EAB308');
        } else {
            gradFoco.addColorStop(0, '#F1F5F9');
            gradFoco.addColorStop(0.5, '#CBD5E1');
            gradFoco.addColorStop(1, '#94A3B8');
        }

        ctx.fillStyle = gradFoco;
        ctx.strokeStyle = '#0F172A';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(cx, cy, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Filamento de tungsteno visible si está apagado
        if (!foco.encendido) {
            ctx.strokeStyle = '#64748B';
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.moveTo(cx - 5, cy - 3);
            ctx.lineTo(cx, cy - 8);
            ctx.lineTo(cx + 5, cy - 3);
            ctx.stroke();
        }

        // Aura interactiva al pasar el cursor (hover)
        if (hover) {
            ctx.strokeStyle = '#38BDF8';
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.arc(cx, cy, 22, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.restore();
    }

    dibujarAparato(ctx, aparato, luzEncendida) {
        const { x, y, w, h } = aparato.zona;
        const hover = aparato.encendido && this.puntoEnRect(this.ratonX, this.ratonY, aparato.zona, 6);
        const colorMueble = luzEncendida ? '#854D0E' : '#452A07';

        if (aparato.tipo === 'TV') {
            // Mesa de soporte del televisor
            ctx.fillStyle = colorMueble;
            ctx.strokeStyle = '#2A2340';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(x + 6, y + 74, 76, 38, 4);
            ctx.fill();
            ctx.stroke();

            // Pedestal del televisor
            ctx.fillStyle = '#1E293B';
            ctx.fillRect(x + 36, y + 58, 14, 16);

            // Carcasa del televisor
            ctx.fillStyle = '#1E293B';
            ctx.beginPath();
            ctx.roundRect(x, y, 86, 60, 6);
            ctx.fill();
            ctx.stroke();

            // Pantalla
            const pantX = x + 6, pantY = y + 6, pantW = 74, pantH = 48;
            if (aparato.encendido) {
                // Barras de prueba de colores dinámicas
                const barras = ['#EF4444', '#F59E0B', '#10B981', '#06B6D4', '#8B5CF6'];
                const desplazamiento = (this.relojTotal * 24) % 15;
                ctx.save();
                ctx.beginPath();
                ctx.rect(pantX, pantY, pantW, pantH);
                ctx.clip();
                for (let i = -1; i < 6; i++) {
                    ctx.fillStyle = barras[(i + 5) % barras.length];
                    ctx.fillRect(pantX + i * 15 + desplazamiento, pantY, 15, pantH);
                }
                ctx.restore();
            } else {
                ctx.fillStyle = '#0F172A';
                ctx.fillRect(pantX, pantY, pantW, pantH);
            }
            ctx.strokeStyle = '#2A2340';
            ctx.strokeRect(pantX, pantY, pantW, pantH);
        } else if (aparato.tipo === 'COMPUTADORA') {
            // Mesa de cómputo
            ctx.fillStyle = colorMueble;
            ctx.strokeStyle = '#2A2340';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(x, y + 58, 92, 9, 3);
            ctx.fill();
            ctx.stroke();

            // Patas de la mesa
            ctx.fillStyle = '#475569';
            ctx.fillRect(x + 6, y + 67, 5, 27);
            ctx.fillRect(x + 81, y + 67, 5, 27);

            // CPU Torre en el suelo/estante
            ctx.fillStyle = '#334155';
            ctx.strokeStyle = '#2A2340';
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.roundRect(x + 62, y + 66, 20, 28, 3);
            ctx.fill();
            ctx.stroke();

            // LED de encendido en el CPU
            ctx.fillStyle = aparato.encendido ? '#22C55E' : '#64748B';
            ctx.beginPath();
            ctx.arc(x + 72, y + 72, 2.5, 0, Math.PI * 2);
            ctx.fill();

            // Monitor
            ctx.fillStyle = '#1E293B';
            ctx.fillRect(x + 40, y + 44, 12, 14);
            ctx.beginPath();
            ctx.roundRect(x + 28, y + 54, 36, 5, 2);
            ctx.fill();
            ctx.stroke();

            ctx.beginPath();
            ctx.roundRect(x + 12, y, 68, 46, 5);
            ctx.fill();
            ctx.stroke();

            // Pantalla del monitor
            const scX = x + 16, scY = y + 4, scW = 60, scH = 38;
            if (aparato.encendido) {
                // Escritorio del sistema operativo con ventanas
                const gradOS = ctx.createLinearGradient(scX, scY, scX, scY + scH);
                gradOS.addColorStop(0, '#0284C7');
                gradOS.addColorStop(1, '#0369A1');
                ctx.fillStyle = gradOS;
                ctx.fillRect(scX, scY, scW, scH);

                // Ventanas y líneas blancas de código escolar
                ctx.fillStyle = '#FFFFFF';
                for (let i = 0; i < 3; i++) {
                    ctx.fillRect(scX + 6, scY + 8 + i * 8, 32 - i * 6, 4);
                }
            } else {
                ctx.fillStyle = '#0F172A';
                ctx.fillRect(scX, scY, scW, scH);
            }
            ctx.strokeStyle = '#2A2340';
            ctx.strokeRect(scX, scY, scW, scH);
        } else {
            // VENTILADOR DE PIE
            const cx = x + 38, cy = y + 36;

            // Pedestal y barra vertical
            ctx.fillStyle = '#64748B';
            ctx.fillRect(cx - 3, cy, 6, 84);

            // Base circular en el piso
            ctx.fillStyle = '#475569';
            ctx.strokeStyle = '#2A2340';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(cx, y + 118, 24, 7, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Rejilla circular protectora
            ctx.fillStyle = 'rgba(241, 245, 249, 0.4)';
            ctx.strokeStyle = '#2A2340';
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.arc(cx, cy, 32, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Aspas giratorias
            ctx.save();
            ctx.translate(cx, cy);
            if (aparato.encendido) {
                ctx.rotate(aparato.giro);
            }
            ctx.fillStyle = '#38BDF8';
            ctx.strokeStyle = '#2A2340';
            ctx.lineWidth = 1.4;

            for (let i = 0; i < 3; i++) {
                ctx.rotate((Math.PI * 2) / 3);
                ctx.beginPath();
                ctx.ellipse(0, -16, 8, 14, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            }
            ctx.restore();

            // Núcleo central del ventilador
            ctx.fillStyle = '#334155';
            ctx.beginPath();
            ctx.arc(cx, cy, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }

        // Resplandor de selección si el mouse pasa por encima
        if (hover) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.roundRect(x - 4, y - 4, w + 8, h + 8, 8);
            ctx.stroke();
        }
    }

    dibujarCargador(ctx, cargador) {
        ctx.save();
        const { x, y, w, h } = cargador.zona;
        const hover = cargador.encendido && this.puntoEnRect(this.ratonX, this.ratonY, cargador.zona, 6);

        // Placa del tomacorriente de pared con relieve y tornillos
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#1E293B';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.roundRect(x + 5, y, 28, 32, 4);
        ctx.fill();
        ctx.stroke();

        // Tornillitos de fijación
        ctx.fillStyle = '#94A3B8';
        ctx.beginPath();
        ctx.arc(x + 19, y + 4, 1.2, 0, Math.PI * 2);
        ctx.arc(x + 19, y + 28, 1.2, 0, Math.PI * 2);
        ctx.fill();

        // Ranuras universales del tomacorriente
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(x + 12, y + 10, 3, 7);
        ctx.fillRect(x + 23, y + 10, 3, 7);

        // Si el cargador NO está conectado (ya se desconectó), solo se muestra la toma libre
        if (!cargador.encendido) {
            ctx.restore();
            return;
        }

        // Sombra del cargador en la pared
        ctx.fillStyle = 'rgba(15, 23, 42, 0.25)';
        ctx.beginPath();
        ctx.roundRect(x + 10, y + 6, 22, 22, 4);
        ctx.fill();

        // Transformador / cuerpo del cargador blanco con bisel
        const gradCarg = ctx.createLinearGradient(x + 8, y + 4, x + 30, y + 26);
        gradCarg.addColorStop(0, '#FFFFFF');
        gradCarg.addColorStop(0.7, '#F1F5F9');
        gradCarg.addColorStop(1, '#CBD5E1');

        ctx.fillStyle = gradCarg;
        ctx.strokeStyle = '#0F172A';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(x + 8, y + 4, 22, 22, 4);
        ctx.fill();
        ctx.stroke();

        // Luz LED piloto parpadeante de "consumo fantasma"
        const pulsoLED = Math.sin(this.relojTotal * 8) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(239, 68, 68, ${pulsoLED})`;
        ctx.beginPath();
        ctx.arc(x + 19, y + 13, 3, 0, Math.PI * 2);
        ctx.fill();

        // Chispitas de energía desperdiciada (vampiro eléctrico)
        for (let ch = 0; ch < 3; ch++) {
            const ang = (ch * Math.PI * 2) / 3 + this.relojTotal * 5;
            const cxp = x + 19 + Math.cos(ang) * 9;
            const cyp = y + 13 + Math.sin(ang) * 9;
            ctx.fillStyle = '#FBBF24';
            ctx.beginPath();
            ctx.arc(cxp, cyp, 1.4, 0, Math.PI * 2);
            ctx.fill();
        }

        // Cable negro colgante suelto en el suelo sin celular
        ctx.strokeStyle = '#0F172A';
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(x + 19, y + 26);
        ctx.quadraticCurveTo(x + 32, y + 42, x + 12, y + 48);
        ctx.stroke();

        // Conector USB libre en la punta
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.roundRect(x + 6, y + 44, 11, 7, 2);
        ctx.fill();
        ctx.strokeStyle = '#0F172A';
        ctx.lineWidth = 1.4;
        ctx.stroke();

        // Anillo interactivo de hover
        if (hover) {
            ctx.strokeStyle = '#38BDF8';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.roundRect(x - 2, y - 4, w + 6, h + 10, 8);
            ctx.stroke();
        }

        ctx.restore();
    }

    dibujarCartelAula(ctx, a, x, y, w) {
        ctx.font = 'bold 13px "Segoe UI", system-ui, sans-serif';

        // Píldora izquierda: Nombre del aula
        const textoNombre = a.nombre;
        const anchoNombre = ctx.measureText(textoNombre).width + 16;
        ctx.fillStyle = 'rgba(23, 20, 50, 0.88)';
        ctx.beginPath();
        ctx.roundRect(x + 10, y + 8, anchoNombre, 22, 11);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(textoNombre, x + 18, y + 19);

        // Píldora derecha: Estado ("En clase" o "Vacío")
        const hayGente = a.ocupado > 0;
        const textoEstado = hayGente ? 'En clase' : 'Vacío';
        const anchoEstado = ctx.measureText(textoEstado).width + 18;
        const estadoX = x + w - anchoEstado - 10;

        ctx.fillStyle = hayGente ? '#16A34A' : '#64748B';
        ctx.beginPath();
        ctx.roundRect(estadoX, y + 8, anchoEstado, 22, 11);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.fillText(textoEstado, estadoX + anchoEstado / 2, y + 19);
    }

    dibujarBotonAvisoApagar(ctx, cx, cy) {
        // Círculo rojo pulsante que guía a los niños en niveles 1 a 4
        const pulso = 1 + Math.sin(this.relojTotal * 8) * 0.12;
        const radio = 13 * pulso;

        ctx.save();
        ctx.fillStyle = '#EF4444';
        ctx.strokeStyle = '#2A2340';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(cx, cy, radio, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Ícono blanco de botón de apagado (arco circular y barra vertical)
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2.2;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.arc(cx, cy + 1, 5.5, -Math.PI * 0.7, Math.PI * 0.2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(cx, cy - 6);
        ctx.lineTo(cx, cy - 1);
        ctx.stroke();

        ctx.restore();
    }

    mezclarColor(colorA, colorB, proporcion) {
        // Utilidad rápida para oscurecer colores en Canvas
        const parse = (hex) => {
            const h = hex.replace('#', '');
            return [
                parseInt(h.substring(0, 2), 16),
                parseInt(h.substring(2, 4), 16),
                parseInt(h.substring(4, 6), 16)
            ];
        };
        const a = parse(colorA);
        const b = parse(colorB);
        const r = Math.round(a[0] + (b[0] - a[0]) * proporcion);
        const g = Math.round(a[1] + (b[1] - a[1]) * proporcion);
        const bl = Math.round(a[2] + (b[2] - a[2]) * proporcion);
        return `rgb(${r}, ${g}, ${bl})`;
    }

    // Estrella clásica de 5 puntas idéntica a Limpieza Monstruosa
    dibujarEstrellaForma(ctx, cx, cy, radio, color) {
        ctx.save();
        ctx.fillStyle = color;
        ctx.strokeStyle = '#2A2340';
        ctx.lineWidth = 3;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.beginPath();
        for (let i = 0; i < 10; i++) {
            const r = i % 2 === 0 ? radio : radio * 0.45;
            const a = -Math.PI / 2 + (i * Math.PI) / 5;
            const x = cx + Math.cos(a) * r;
            const y = cy + Math.sin(a) * r;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }
}

// Exponer la clase globalmente para el orquestador
window.ApagaAhorra = ApagaAhorra;

