/**
 * Operación EcoRescate - Minijuego 4: Sembradores del Verde
 *
 * Biohuerto escolar en Ica: 12 parcelas de cultivo donde los estudiantes
 * aprenden agricultura sostenible y uso medido del agua.
 *
 * Reglas pedagógicas:
 * - 3 herramientas: 1 = Semilla, 2 = Regadera, 3 = Recoger (limpieza).
 * - Sembrar semillas en parcelas libres y limpias.
 * - Regar ÚNICAMENTE cuando la tierra esté seca (indicador de gota roja y tierra clara).
 *   Regar con tierra húmeda se sanciona como error por asfixia de raíces y desperdicio de agua.
 * - Recoger basura arrojada por el viento y retirar plantas secas para recuperar el suelo.
 * - Mariposas, abejas polinizadoras y sol de mediodía desde nivel 5 (mayor evaporación).
 */

class SembradoresVerde extends MinijuegoBase {
    constructor(canvas, tipoId) {
        super(canvas, tipoId);

        // Constantes del Biohuerto
        this.ANCHO_PARCELA = 150;
        this.ALTO_PARCELA = 88;
        this.SEP_X = 22;
        this.SEP_Y = 18;
        this.LIMITE_SED = 0.35; // Nivel de agua por debajo del cual tiene sed
        this.LIMITE_HUMEDA = 0.60; // Nivel de agua por encima del cual está húmeda (no regar)

        // Colores de flores botánicas (fucsia, oro, violeta, naranja, blanco)
        this.COLORES_FLORES = ['#F43F5E', '#FBBF24', '#A855F7', '#FB923C', '#FFFFFF'];

        // Herramientas disponibles
        this.HERRAMIENTAS = {
            SEMILLA: { id: 'SEMILLA', nombre: 'Semilla', tecla: '1', desc: 'Siembra en tierra libre' },
            REGADERA: { id: 'REGADERA', nombre: 'Regadera', tecla: '2', desc: 'Riega solo tierra seca' },
            RECOGER: { id: 'RECOGER', nombre: 'Recoger', tecla: '3', desc: 'Retira basura y malezas' }
        };
        this.herramientaActual = 'SEMILLA';

        // 12 parcelas distribuidas en 3 filas de 4
        this.parcelas = [];
        this.botonesHerramientas = [];

        // Estado del biohuerto
        this.plantasFlorecidasTotales = 0;
        this.proximaBasura = 0;

        // Bichitos polinizadores y nubes decorativas
        this.mariposas = [
            { x: 200, y: 300, color: '#FB923C', fase: 0, vel: 1.2 },
            { x: 500, y: 350, color: '#38BDF8', fase: 2.1, vel: 1.5 },
            { x: 800, y: 280, color: '#F43F5E', fase: 4.2, vel: 1.0 }
        ];

        this.nubes = [
            { x: 50, y: 135, vel: 14, escala: 0.9 },
            { x: 380, y: 120, vel: 18, escala: 1.1 },
            { x: 720, y: 142, vel: 12, escala: 0.85 }
        ];

        this.configurarParcelasYBotones();
    }

    configurarParcelasYBotones() {
        const totalW = 4 * this.ANCHO_PARCELA + 3 * this.SEP_X;
        const x0 = (this.ANCHO - totalW) / 2;
        const y0 = 236;

        this.parcelas = [];
        for (let i = 0; i < 12; i++) {
            const fila = Math.floor(i / 4);
            const col = i % 4;
            const px = x0 + col * (this.ANCHO_PARCELA + this.SEP_X);
            const py = y0 + fila * (this.ALTO_PARCELA + this.SEP_Y);

            this.parcelas.push({
                indice: i,
                x: px,
                y: py,
                w: this.ANCHO_PARCELA,
                h: this.ALTO_PARCELA,
                estado: 'VACIA', // 'VACIA', 'CRECIENDO', 'FLORECIDA', 'SECA'
                agua: 0, // 0.0 (seca) a 1.0 (saturada)
                crecimiento: 0, // 0.0 a 1.0
                sinAgua: 0, // tiempo acumulado sin agua
                florTiempo: 0, // tiempo restante florecida
                colorFlor: '#F43F5E',
                riegoAnim: 0, // temporizador de gotas cayendo
                basura: false,
                tipoBasura: 0 // 0=botella, 1=papel, 2=bolsa
            });
        }

        // 3 ranuras compactas de herramientas estilo videojuego (Hotbar clásica)
        const anchoSlot = 48;
        const altoSlot = 48;
        const gapSlot = 10;
        const xHotbar0 = 418;
        const yHotbar = 130;

        this.botonesHerramientas = [
            { id: 'SEMILLA', x: xHotbar0, y: yHotbar, w: anchoSlot, h: altoSlot, nombre: 'Sembrar', tecla: '1' },
            { id: 'REGADERA', x: xHotbar0 + anchoSlot + gapSlot, y: yHotbar, w: anchoSlot, h: altoSlot, nombre: 'Regar', tecla: '2' },
            { id: 'RECOGER', x: xHotbar0 + (anchoSlot + gapSlot) * 2, y: yHotbar, w: anchoSlot, h: altoSlot, nombre: 'Limpiar', tecla: '3' }
        ];
    }

    motivoDerrota() {
        return 'El biohuerto se deterioró por falta de cuidado';
    }

    textoControles() {
        return 'Herramientas: Teclas 1, 2, 3 o pulsa los botones inferiores';
    }

    resumenPie() {
        return ['COSECHA', String(this.plantasFlorecidasTotales)];
    }

    pista() {
        let conSed = 0;
        let conBasura = 0;
        let vacias = 0;

        this.parcelas.forEach(p => {
            if (p.estado === 'CRECIENDO' && p.agua < this.LIMITE_SED) conSed++;
            if (p.basura) conBasura++;
            if (p.estado === 'VACIA' && !p.basura) vacias++;
        });

        if (conSed > 0) {
            return ['¡Hay plantas con sed!', 'La gota roja y la tierra clara te avisan: usa la Regadera (tecla 2).'];
        }
        if (conBasura > 1) {
            return ['Hay residuos en el huerto', 'La basura obstruye el crecimiento de las raíces: usa Recoger (tecla 3).'];
        }
        if (vacias > 5) {
            return ['Hay parcelas libres', 'Siembra nuevas semillas (tecla 1) para aprovechar el área cultivable.'];
        }
        return ['Tierra oscura = húmeda', 'Riega únicamente cuando la tierra esté clara y agrietada.'];
    }

    reiniciar() {
        this.herramientaActual = 'SEMILLA';
        this.plantasFlorecidasTotales = 0;
        this.proximaBasura = 6.0;

        this.parcelas.forEach(p => {
            p.estado = 'VACIA';
            p.agua = 0;
            p.crecimiento = 0;
            p.sinAgua = 0;
            p.florTiempo = 0;
            p.riegoAnim = 0;
            p.basura = false;
        });

        // Colocar 2 basuras iniciales para enseñar la limpieza
        this.generarBasuraAleatoria();
        this.generarBasuraAleatoria();

        // Sembrar 1 planta brotando para empezar
        const inicial = this.parcelas[1];
        inicial.estado = 'CRECIENDO';
        inicial.agua = 0.8;
        inicial.crecimiento = 0.25;
    }

    generarBasuraAleatoria() {
        const disponibles = this.parcelas.filter(p => !p.basura && p.estado !== 'FLORECIDA');
        if (disponibles.length > 0) {
            const p = disponibles[Math.floor(Math.random() * disponibles.length)];
            p.basura = true;
            p.tipoBasura = Math.floor(Math.random() * 3);
        }
    }

    actualizar(dt) {
        // Nivel de calor: desde nivel 5 el sol calienta más y el suelo se evapora más rápido
        const esNivelCalor = this.nivelNumero >= 5;
        const tasaSecado = (esNivelCalor ? 0.065 : 0.045) * (1 + (this.nivelNumero - 1) * 0.04);

        // 1. Temporizador de basura arrastrada por el viento
        this.proximaBasura -= dt;
        if (this.proximaBasura <= 0) {
            this.generarBasuraAleatoria();
            const cadenciaBasura = Math.max(3.5, 7.5 - (this.nivelNumero - 1) * 0.3);
            this.proximaBasura = cadenciaBasura * (0.8 + Math.random() * 0.4);
        }

        // 2. Mover nubes decorativas
        this.nubes.forEach(n => {
            n.x += n.vel * dt;
            if (n.x > this.ANCHO + 80) n.x = -120;
        });

        // 3. Mover mariposas polinizadoras
        this.mariposas.forEach(m => {
            m.fase += dt * m.vel;
            m.x = 500 + Math.sin(this.relojTotal * 0.4 * m.vel + m.fase) * 420;
            m.y = 310 + Math.sin(this.relojTotal * 0.9 + m.fase * 1.5) * 110;
        });

        // 4. Actualizar lógica biológica de cada parcela
        this.parcelas.forEach(p => {
            // Animación de riego
            if (p.riegoAnim > 0) {
                p.riegoAnim = Math.max(0, p.riegoAnim - dt);
            }

            // Basura deteriora la salud del biohuerto con el tiempo
            if (p.basura) {
                this.medidor = Math.max(0, this.medidor - dt * 0.006);
            }

            switch (p.estado) {
                case 'CRECIENDO': {
                    // El agua se evapora gradualmente
                    p.agua = Math.max(0, p.agua - dt * tasaSecado);

                    // Si tiene agua y NO tiene basura encima, la planta crece
                    if (p.agua > 0 && !p.basura) {
                        p.crecimiento += dt * 0.048;

                        // Si completó su crecimiento: ¡FLORECE!
                        if (p.crecimiento >= 1.0) {
                            p.estado = 'FLORECIDA';
                            p.crecimiento = 1.0;
                            p.florTiempo = 3.8;
                            p.colorFlor = this.COLORES_FLORES[Math.floor(Math.random() * this.COLORES_FLORES.length)];
                            this.plantasFlorecidasTotales++;

                            // Recompensa por cosecha exitosa
                            this.medidor = Math.min(1.0, this.medidor + 0.06);
                            this.acierto(20, p.x + p.w / 2, p.y + 12, 'FLORES');

                            // Chispas de polen y alegría
                            this.crearChispas(p.x + p.w / 2, p.y + 20, p.colorFlor, 25);
                        }
                    } else if (p.agua <= 0) {
                        // Se quedó sin agua: acumular tiempo de sequía
                        p.sinAgua += dt;
                        if (p.sinAgua > 3.4) {
                            // La planta se marchita
                            p.estado = 'SECA';
                            this.registrarError('¡Una planta se marchitó por falta de agua! Riega cuando la gota roja palpite.', 0.08);
                        }
                    }
                    break;
                }
                case 'FLORECIDA': {
                    // Permanece florecida unos segundos antes de auto-cosecharse
                    p.florTiempo -= dt;
                    if (p.florTiempo <= 0) {
                        p.estado = 'VACIA';
                        p.agua = 0;
                        p.crecimiento = 0;
                        p.sinAgua = 0;
                        this.crearChispas(p.x + p.w / 2, p.y + 20, '#6EE7B7', 14);
                    }
                    break;
                }
                case 'SECA': {
                    // Las plantas marchitas drenan un poco la salud del biohuerto
                    this.medidor = Math.max(0, this.medidor - dt * 0.005);
                    break;
                }
                default:
                    break;
            }
        });
    }

    alTeclaPresionada(codigo) {
        if (codigo === 'Digit1' || codigo === 'Numpad1') {
            this.seleccionarHerramienta('SEMILLA');
        } else if (codigo === 'Digit2' || codigo === 'Numpad2') {
            this.seleccionarHerramienta('REGADERA');
        } else if (codigo === 'Digit3' || codigo === 'Numpad3') {
            this.seleccionarHerramienta('RECOGER');
        }
    }

    seleccionarHerramienta(herramientaId) {
        this.herramientaActual = herramientaId;
        window.audioEco.clic();
    }

    alPresionar(x, y) {
        // 1. Revisar si pulsó un botón de herramienta en la hotbar superior
        for (const btn of this.botonesHerramientas) {
            if (x >= btn.x && x <= btn.x + btn.w && y >= btn.y && y <= btn.y + btn.h + 16) {
                this.seleccionarHerramienta(btn.id);
                return;
            }
        }

        // 2. Revisar si pulsó sobre alguna de las 12 parcelas
        const parcela = this.parcelas.find(p => x >= p.x && x <= p.x + p.w && y >= p.y && y <= p.y + p.h);
        if (!parcela) return;

        const cx = parcela.x + parcela.w / 2;
        const cy = parcela.y + parcela.h / 2;

        // Asistencia pedagógica inmediata: si hay basura, se recoge al pulsar sobre ella
        if (parcela.basura) {
            parcela.basura = false;
            this.acierto(8, cx, cy, 'BASURA', '¡LIMPIO!');
            this.crearChispas(cx, cy, '#10B981', 18);
            window.audioEco.recoger();
            this.mostrarToastInfo('¡Residuo retirado! Tierra limpia.');
            return;
        }

        // Si la planta está seca/marchita, retirarla para reacondicionar el suelo
        if (parcela.estado === 'SECA') {
            parcela.estado = 'VACIA';
            parcela.agua = 0;
            parcela.crecimiento = 0;
            parcela.sinAgua = 0;
            this.acierto(5, cx, cy, 'BASURA', '¡SUELO LISTO!');
            this.crearChispas(cx, cy, '#D97706', 14);
            this.mostrarToastInfo('Tierra acondicionada: ¡Lista para sembrar [1]!');
            return;
        }

        switch (this.herramientaActual) {
            case 'SEMILLA': {
                if (parcela.estado === 'VACIA') {
                    // Sembrar con éxito
                    parcela.estado = 'CRECIENDO';
                    parcela.agua = 0.75;
                    parcela.crecimiento = 0;
                    parcela.sinAgua = 0;

                    this.acierto(6, cx, cy - 8, 'SIEMBRA');
                    this.crearChispas(cx, cy - 8, '#4ADE80', 16);
                } else if (parcela.estado === 'CRECIENDO' && parcela.agua < this.LIMITE_HUMEDA) {
                    this.mostrarToastInfo('Esta planta necesita agua: usa Regar [2]');
                } else {
                    this.mostrarToastInfo('Esta parcela ya tiene un cultivo activo');
                    this.crearChispas(cx, cy, '#CBD5E1', 6);
                }
                break;
            }
            case 'REGADERA': {
                if (parcela.estado === 'CRECIENDO') {
                    parcela.riegoAnim = 0.85;

                    // REGLA CLAVE: Solo regar si la tierra está seca (agua < LIMITE_HUMEDA)
                    if (parcela.agua < this.LIMITE_HUMEDA) {
                        const bonoSed = parcela.agua < this.LIMITE_SED ? 10 : 6;
                        parcela.agua = 1.0;
                        parcela.sinAgua = 0;

                        this.acierto(bonoSed, cx, cy - 14, 'RIEGO');
                        this.crearChispas(cx, cy - 10, '#38BDF8', 22);
                    } else {
                        // ERROR PEDAGÓGICO DE RIEGO EN EXCESO
                        this.registrarError('¡Demasiada agua! La tierra aún está húmeda. Regar de más asfixia las raíces.', 0.06);
                    }
                } else if (parcela.estado === 'VACIA') {
                    this.mostrarToastInfo('Siembra una semilla primero con [1]');
                } else {
                    this.mostrarToastInfo('Esta planta ya está florecida');
                }
                break;
            }
            case 'RECOGER':
            default: {
                if (parcela.estado === 'VACIA') {
                    this.mostrarToastInfo('La tierra está limpia. Siembra con Semilla [1]');
                } else {
                    this.mostrarToastInfo('No hay residuos que recoger en esta parcela');
                }
                break;
            }
        }
    }

    mostrarToastInfo(texto) {
        this.mensajeToast = {
            texto,
            esError: false,
            tiempo: 2.2
        };
    }

    dibujarEscena(ctx) {
        const esNivelCalor = this.nivelNumero >= 5;

        // 1. Cielo y fondo natural del biohuerto
        this.dibujarFondoNaturaleza(ctx, esNivelCalor);

        // 2. Sol dinámico y nubes
        this.dibujarSolYNubes(ctx, esNivelCalor);

        // 3. Letrero de madera del biohuerto
        this.dibujarLetreroBiohuerto(ctx);

        // 4. Dibujar las 12 parcelas agrícolas
        this.parcelas.forEach(p => this.dibujarParcela(ctx, p));

        // 5. Bichitos polinizadores (mariposas y abejas en flores)
        this.dibujarFaunaBiohuerto(ctx);

        // 6. Barra inferior con las 3 herramientas
        this.dibujarBarraHerramientas(ctx);

        // 7. Cursor flotante con la herramienta activa
        this.dibujarCursorHerramienta(ctx);
    }

    dibujarFondoNaturaleza(ctx, esNivelCalor) {
        ctx.save();

        // 1. Cielo atmosférico con degradado multicapa
        const gradCielo = ctx.createLinearGradient(0, this.ESC_Y, 0, 235);
        if (esNivelCalor) {
            gradCielo.addColorStop(0, '#0284C7');
            gradCielo.addColorStop(0.35, '#38BDF8');
            gradCielo.addColorStop(0.70, '#FDE68A');
            gradCielo.addColorStop(1, '#FFEDD5');
        } else {
            gradCielo.addColorStop(0, '#0284C7');
            gradCielo.addColorStop(0.30, '#38BDF8');
            gradCielo.addColorStop(0.75, '#BAE6FD');
            gradCielo.addColorStop(1, '#E0F2FE');
        }
        ctx.fillStyle = gradCielo;
        ctx.fillRect(this.ESC_X, this.ESC_Y, this.ESC_W, 126);

        // 2. Dunas doradas de Huacachina / Ica en el horizonte lejano
        // Capa lejana de dunas (tonos cálidos suaves y crestas de viento)
        ctx.fillStyle = esNivelCalor ? '#D97706' : '#E6C280';
        ctx.globalAlpha = 0.55;
        ctx.beginPath();
        ctx.moveTo(this.ESC_X, 226);
        ctx.bezierCurveTo(120, 175, 260, 205, 380, 185);
        ctx.bezierCurveTo(480, 170, 600, 195, 740, 178);
        ctx.bezierCurveTo(840, 165, 920, 185, this.ESC_DER, 190);
        ctx.lineTo(this.ESC_DER, 226);
        ctx.lineTo(this.ESC_X, 226);
        ctx.closePath();
        ctx.fill();

        // Capa intermedia de dunas doradas con relieve de sombra y arista
        ctx.fillStyle = esNivelCalor ? '#B45309' : '#D4A373';
        ctx.globalAlpha = 0.75;
        ctx.beginPath();
        ctx.moveTo(this.ESC_X, 226);
        ctx.bezierCurveTo(180, 195, 320, 180, 460, 205);
        ctx.bezierCurveTo(580, 220, 680, 190, 810, 182);
        ctx.bezierCurveTo(890, 175, 940, 192, this.ESC_DER, 210);
        ctx.lineTo(this.ESC_DER, 226);
        ctx.lineTo(this.ESC_X, 226);
        ctx.closePath();
        ctx.fill();

        // Siluetas lejanas de palmeras datileras y huarangos típicos de Ica
        ctx.fillStyle = '#78350F';
        ctx.globalAlpha = 0.6;
        const dibujarPalmeraLejana = (px, py, escala) => {
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.quadraticCurveTo(px + 3 * escala, py - 18 * escala, px + 5 * escala, py - 32 * escala);
            ctx.lineWidth = 2 * escala;
            ctx.strokeStyle = '#78350F';
            ctx.stroke();

            // Penachos de palmera
            ctx.fillStyle = '#166534';
            for (let a = 0; a < 6; a++) {
                const ang = (a * Math.PI) / 3;
                const fx = px + 5 * escala + Math.cos(ang) * 11 * escala;
                const fy = py - 32 * escala + Math.sin(ang) * 7 * escala;
                ctx.beginPath();
                ctx.ellipse(fx, fy, 8 * escala, 3 * escala, ang, 0, Math.PI * 2);
                ctx.fill();
            }
        };
        dibujarPalmeraLejana(860, 184, 0.7);
        dibujarPalmeraLejana(880, 188, 0.85);
        dibujarPalmeraLejana(110, 202, 0.75);

        ctx.globalAlpha = 1.0;

        // 3. Arboleda de huertos frutales detrás de la cerca (limoneros, higueras, paltos)
        ctx.fillStyle = '#16A34A';
        const copasArboles = [
            { x: 70, y: 216, r: 24, c: '#15803D' },
            { x: 96, y: 210, r: 28, c: '#16A34A' },
            { x: 230, y: 218, r: 22, c: '#15803D' },
            { x: 255, y: 212, r: 26, c: '#22C55E' },
            { x: 740, y: 215, r: 25, c: '#15803D' },
            { x: 770, y: 208, r: 30, c: '#16A34A' },
            { x: 925, y: 215, r: 24, c: '#15803D' }
        ];
        copasArboles.forEach(a => {
            ctx.fillStyle = a.c;
            ctx.beginPath();
            ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
            ctx.fill();
            // Brillo superior de sol
            ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
            ctx.beginPath();
            ctx.arc(a.x - a.r * 0.25, a.y - a.r * 0.25, a.r * 0.55, 0, Math.PI * 2);
            ctx.fill();
        });

        // 4. Cerco rústico de estacas de madera de biohuerto con travesaños
        const cercaY1 = 208;
        const cercaY2 = 222;
        // Travesaños horizontales
        ctx.fillStyle = '#78350F';
        ctx.fillRect(this.ESC_X, cercaY1, this.ESC_W, 5);
        ctx.fillStyle = '#92400E';
        ctx.fillRect(this.ESC_X, cercaY1 + 1, this.ESC_W, 2);

        ctx.fillStyle = '#78350F';
        ctx.fillRect(this.ESC_X, cercaY2, this.ESC_W, 5);
        ctx.fillStyle = '#92400E';
        ctx.fillRect(this.ESC_X, cercaY2 + 1, this.ESC_W, 2);

        // Estacas verticales de madera con punta achaflanada
        for (let x = this.ESC_X + 10; x <= this.ESC_DER - 10; x += 24) {
            // Sombra de estaca
            ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
            ctx.fillRect(x + 8, cercaY1 - 8, 3, 34);

            // Cuerpo de la estaca
            ctx.fillStyle = '#B45309';
            ctx.beginPath();
            ctx.moveTo(x, cercaY1 + 24);
            ctx.lineTo(x, cercaY1 - 6);
            ctx.lineTo(x + 4, cercaY1 - 12); // Punta
            ctx.lineTo(x + 8, cercaY1 - 6);
            ctx.lineTo(x + 8, cercaY1 + 24);
            ctx.closePath();
            ctx.fill();

            // Bisel iluminado en el borde izquierdo
            ctx.fillStyle = '#D97706';
            ctx.fillRect(x, cercaY1 - 5, 2, 28);
            // Remache
            ctx.fillStyle = '#451A03';
            ctx.fillRect(x + 3, cercaY1 + 1, 2, 2);
            ctx.fillRect(x + 3, cercaY2 + 1, 2, 2);
        }

        // 5. Prado verde del biohuerto con degradado de profundidad
        const gradCesped = ctx.createLinearGradient(0, 226, 0, this.ESC_ABA);
        gradCesped.addColorStop(0, '#4ADE80');
        gradCesped.addColorStop(0.35, '#22C55E');
        gradCesped.addColorStop(0.85, '#16A34A');
        gradCesped.addColorStop(1, '#15803D');
        ctx.fillStyle = gradCesped;
        ctx.fillRect(this.ESC_X, 226, this.ESC_W, this.ESC_ABA - 226);

        // Línea divisoria nítida del suelo
        ctx.strokeStyle = '#166534';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.ESC_X, 226);
        ctx.lineTo(this.ESC_DER, 226);
        ctx.stroke();

        // 6. Senderos de adoquines / lajas de piedra entre los bancales
        // Pasillos entre bancales (x = 328, x = 500, x = 672)
        const pasillosX = [328, 500, 672];
        const pasillosY = [333, 439];

        ctx.fillStyle = '#CBD5E1';
        ctx.strokeStyle = '#94A3B8';
        ctx.lineWidth = 1;

        // Piedras en pasillos verticales
        pasillosX.forEach(px => {
            for (let y = 245; y < 530; y += 22) {
                const ox = ((y * 17) % 7) - 3;
                ctx.fillStyle = '#E2E8F0';
                ctx.beginPath();
                ctx.ellipse(px + ox, y, 7, 5, 0.2, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                // Detalle de sombra y textura de piedra
                ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
                ctx.beginPath();
                ctx.arc(px + ox + 2, y + 2, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        });

        // Piedras en pasillos horizontales
        pasillosY.forEach(py => {
            for (let x = 185; x < 815; x += 28) {
                const oy = ((x * 13) % 5) - 2;
                ctx.fillStyle = '#E2E8F0';
                ctx.beginPath();
                ctx.ellipse(x, py + oy, 8, 4.5, -0.1, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            }
        });

        // 7. Briznas de césped y flores silvestres (margaritas y campanillas)
        // Briznas de hierba en pequeños manojos
        for (let i = 0; i < 35; i++) {
            const hx = this.ESC_X + 15 + ((i * 107) % (this.ESC_W - 30));
            const hy = 232 + ((i * 61) % (this.ESC_ABA - 250));

            // Evitar dibujar hierba dentro de las parcelas
            const dentroParcela = this.parcelas.some(p =>
                hx >= p.x - 6 && hx <= p.x + p.w + 6 && hy >= p.y - 4 && hy <= p.y + p.h + 4
            );

            if (!dentroParcela) {
                ctx.strokeStyle = i % 2 === 0 ? '#15803D' : '#86EFAC';
                ctx.lineWidth = 1.6;
                ctx.beginPath();
                ctx.moveTo(hx, hy);
                ctx.quadraticCurveTo(hx - 3, hy - 6, hx - 4, hy - 9);
                ctx.moveTo(hx + 1, hy);
                ctx.quadraticCurveTo(hx + 3, hy - 7, hx + 5, hy - 10);
                ctx.stroke();

                // Flor silvestre en algunos manojos
                if (i % 5 === 0) {
                    ctx.fillStyle = i % 10 === 0 ? '#F43F5E' : '#FFFFFF';
                    ctx.beginPath();
                    ctx.arc(hx, hy - 11, 2.8, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = '#F59E0B';
                    ctx.beginPath();
                    ctx.arc(hx, hy - 11, 1.2, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }

        ctx.restore();
    }

    dibujarSolYNubes(ctx, esNivelCalor) {
        ctx.save();
        const sx = 910, sy = 152;
        const radioSol = esNivelCalor ? 36 : 28;

        // 1. Resplandor solar envolvente con gradiente radial
        const gradResplandor = ctx.createRadialGradient(sx, sy, radioSol * 0.4, sx, sy, radioSol * 2.8);
        if (esNivelCalor) {
            gradResplandor.addColorStop(0, 'rgba(251, 146, 60, 0.45)');
            gradResplandor.addColorStop(0.5, 'rgba(245, 158, 11, 0.22)');
            gradResplandor.addColorStop(1, 'rgba(245, 158, 11, 0)');
        } else {
            gradResplandor.addColorStop(0, 'rgba(253, 224, 71, 0.45)');
            gradResplandor.addColorStop(0.6, 'rgba(250, 204, 21, 0.18)');
            gradResplandor.addColorStop(1, 'rgba(250, 204, 21, 0)');
        }
        ctx.fillStyle = gradResplandor;
        ctx.beginPath();
        ctx.arc(sx, sy, radioSol * 2.8, 0, Math.PI * 2);
        ctx.fill();

        // 2. Rayos solares estilizados con puntas ahusadas y giro suave
        const numRayos = 12;
        const angBase = this.relojTotal * (esNivelCalor ? 0.35 : 0.18);
        ctx.fillStyle = esNivelCalor ? '#FB923C' : '#FDE047';
        for (let i = 0; i < numRayos; i++) {
            const ang = angBase + (i * Math.PI * 2) / numRayos;
            const largo = radioSol + (i % 2 === 0 ? (esNivelCalor ? 24 : 16) : (esNivelCalor ? 16 : 10));
            const ancho = 0.11;

            ctx.beginPath();
            ctx.moveTo(sx + Math.cos(ang - ancho) * (radioSol + 2), sy + Math.sin(ang - ancho) * (radioSol + 2));
            ctx.lineTo(sx + Math.cos(ang) * (largo + 2), sy + Math.sin(ang) * (largo + 2));
            ctx.lineTo(sx + Math.cos(ang + ancho) * (radioSol + 2), sy + Math.sin(ang + ancho) * (radioSol + 2));
            ctx.closePath();
            ctx.fill();
        }

        // 3. Disco del sol con gradiente interno y relieve brillante
        const gradSol = ctx.createRadialGradient(sx - radioSol * 0.3, sy - radioSol * 0.3, 2, sx, sy, radioSol);
        if (esNivelCalor) {
            gradSol.addColorStop(0, '#FEF08A');
            gradSol.addColorStop(0.4, '#F59E0B');
            gradSol.addColorStop(1, '#EA580C');
        } else {
            gradSol.addColorStop(0, '#FFFFFF');
            gradSol.addColorStop(0.35, '#FEF08A');
            gradSol.addColorStop(0.85, '#FACC15');
            gradSol.addColorStop(1, '#EAB308');
        }
        ctx.fillStyle = gradSol;
        ctx.beginPath();
        ctx.arc(sx, sy, radioSol, 0, Math.PI * 2);
        ctx.fill();

        // Anillo de brillo perimetral
        ctx.strokeStyle = esNivelCalor ? '#C2410C' : '#CA8A04';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Destello de lente especular
        ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.beginPath();
        ctx.ellipse(sx - radioSol * 0.4, sy - radioSol * 0.4, radioSol * 0.28, radioSol * 0.16, -0.6, 0, Math.PI * 2);
        ctx.fill();

        // 4. Nubes volumétricas 3D con sombreado y bordes iluminados
        if (!esNivelCalor) {
            this.nubes.forEach(n => {
                const nx = n.x;
                const ny = n.y;
                const esc = n.escala;

                // Base / sombra inferior de la nube
                ctx.fillStyle = '#CBD5E1';
                ctx.beginPath();
                ctx.arc(nx, ny + 3 * esc, 20 * esc, 0, Math.PI * 2);
                ctx.arc(nx + 22 * esc, ny - 5 * esc, 24 * esc, 0, Math.PI * 2);
                ctx.arc(nx + 46 * esc, ny + 3 * esc, 18 * esc, 0, Math.PI * 2);
                ctx.fill();

                // Cuerpo blanco puro con luz solar
                ctx.fillStyle = '#FFFFFF';
                ctx.beginPath();
                ctx.arc(nx, ny, 20 * esc, 0, Math.PI * 2);
                ctx.arc(nx + 22 * esc, ny - 8 * esc, 24 * esc, 0, Math.PI * 2);
                ctx.arc(nx + 46 * esc, ny, 18 * esc, 0, Math.PI * 2);
                ctx.fill();

                // Reflejo cálido en la cresta superior mirando al sol
                ctx.fillStyle = 'rgba(254, 240, 138, 0.4)';
                ctx.beginPath();
                ctx.arc(nx + 24 * esc, ny - 10 * esc, 14 * esc, 0, Math.PI * 2);
                ctx.fill();
            });
        }

        ctx.restore();
    }

    dibujarLetreroBiohuerto(ctx) {
        ctx.save();
        const lx = 32, ly = 152, lw = 112, lh = 36;

        // Postes de madera hincados en la tierra
        const dibujarPoste = (px) => {
            // Sombra en el suelo
            ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
            ctx.beginPath();
            ctx.ellipse(px + 4, 228, 7, 3, 0, 0, Math.PI * 2);
            ctx.fill();

            // Poste de madera de cedro
            const gradPoste = ctx.createLinearGradient(px, 0, px + 8, 0);
            gradPoste.addColorStop(0, '#5C2D0C');
            gradPoste.addColorStop(0.4, '#92400E');
            gradPoste.addColorStop(1, '#451A03');
            ctx.fillStyle = gradPoste;
            ctx.fillRect(px, 184, 8, 44);

            // Anillos de madera
            ctx.fillStyle = '#451A03';
            ctx.fillRect(px, 196, 8, 1.5);
            ctx.fillRect(px, 212, 8, 1.5);
        };
        dibujarPoste(48);
        dibujarPoste(120);

        // Soporte metálico y cadenillas de hierro forjado
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(52, 172);
        ctx.lineTo(52, 184);
        ctx.moveTo(124, 172);
        ctx.lineTo(124, 184);
        ctx.stroke();

        // Sombra suave proyectada por el letrero
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.roundRect(lx + 3, ly + 4, lw, lh, 8);
        ctx.fill();

        // Tablón de madera principal con relieve y textura
        const gradMadera = ctx.createLinearGradient(0, ly, 0, ly + lh);
        gradMadera.addColorStop(0, '#D97706');
        gradMadera.addColorStop(0.5, '#B45309');
        gradMadera.addColorStop(1, '#78350F');
        ctx.fillStyle = gradMadera;
        ctx.beginPath();
        ctx.roundRect(lx, ly, lw, lh, 8);
        ctx.fill();

        // Bisel superior iluminado
        ctx.strokeStyle = '#FDE68A';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.roundRect(lx + 1, ly + 1, lw - 2, lh - 2, 7);
        ctx.stroke();

        // Marco exterior tallado
        ctx.strokeStyle = '#451A03';
        ctx.lineWidth = 2.2;
        ctx.stroke();

        // Vetas de madera talladas
        ctx.strokeStyle = 'rgba(69, 26, 3, 0.35)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(lx + 12, ly + 12);
        ctx.lineTo(lx + lw - 14, ly + 12);
        ctx.moveTo(lx + 8, ly + 24);
        ctx.lineTo(lx + lw - 10, ly + 24);
        ctx.stroke();

        // Remaches dorados en las 4 esquinas del letrero
        const dibujarRemacheDorado = (rx, ry) => {
            ctx.fillStyle = '#FBBF24';
            ctx.beginPath();
            ctx.arc(rx, ry, 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#451A03';
            ctx.beginPath();
            ctx.arc(rx, ry, 1, 0, Math.PI * 2);
            ctx.fill();
        };
        dibujarRemacheDorado(lx + 6, ly + 6);
        dibujarRemacheDorado(lx + lw - 6, ly + 6);
        dibujarRemacheDorado(lx + 6, ly + lh - 6);
        dibujarRemacheDorado(lx + lw - 6, ly + lh - 6);

        // Texto tallado en madera: "BIOHUERTO"
        ctx.font = '900 13px "Segoe UI", system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Sombra de relieve en el grabado
        ctx.fillStyle = '#451A03';
        ctx.fillText('BIOHUERTO', lx + lw / 2, ly + lh / 2 + 1);

        // Frontal blanco marfil nítido
        ctx.fillStyle = '#FEF3C7';
        ctx.fillText('BIOHUERTO', lx + lw / 2, ly + lh / 2);

        // Pequeño brote verde ornamental en la esquina superior del cartel
        ctx.fillStyle = '#4ADE80';
        ctx.beginPath();
        ctx.ellipse(lx + lw - 3, ly + 1, 4, 2, -0.4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    dibujarParcela(ctx, p) {
        ctx.save();
        const hover = this.puntoEnRect(this.ratonX, this.ratonY, p);
        const { x, y, w, h } = p;

        // 1. Sombra de contacto difusa proyectada sobre el césped
        ctx.fillStyle = 'rgba(15, 23, 42, 0.24)';
        ctx.beginPath();
        ctx.roundRect(x - 2, y + 4, w + 12, h + 10, 16);
        ctx.fill();

        // 2. Cama de cultivo elevada (bancal de madera de cedro en 2.5D)
        // Cara exterior de madera con degradado de volumen
        const gradMarco = ctx.createLinearGradient(x, y, x, y + h);
        gradMarco.addColorStop(0, '#92400E');
        gradMarco.addColorStop(0.3, '#78350F');
        gradMarco.addColorStop(0.85, '#5A2A0C');
        gradMarco.addColorStop(1, '#451A03');

        ctx.fillStyle = gradMarco;
        ctx.beginPath();
        ctx.roundRect(x - 5, y - 4, w + 10, h + 12, 14);
        ctx.fill();

        // Borde superior iluminado del marco de madera (efecto bisel 3D)
        ctx.strokeStyle = '#B45309';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(x - 4, y - 3, w + 8, h + 10, 13);
        ctx.stroke();

        // Vetas de madera grabadas en los laterales del bancal
        ctx.strokeStyle = 'rgba(69, 26, 3, 0.4)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(x - 2, y + h + 2);
        ctx.lineTo(x + w + 2, y + h + 2);
        ctx.stroke();

        // Esquineras de latón dorado con remaches oscuros
        const dibujarEsquinera = (ex, ey, flipX, flipY) => {
            ctx.fillStyle = '#F59E0B';
            ctx.beginPath();
            ctx.arc(ex, ey, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#451A03';
            ctx.beginPath();
            ctx.arc(ex, ey, 1.8, 0, Math.PI * 2);
            ctx.fill();
        };
        dibujarEsquinera(x - 1, y, false, false);
        dibujarEsquinera(x + w + 1, y, true, false);
        dibujarEsquinera(x - 1, y + h + 4, false, true);
        dibujarEsquinera(x + w + 1, y + h + 4, true, true);

        // 3. Sustrato de tierra fértil según nivel de humedad
        const factorHumedad = p.estado === 'CRECIENDO' ? p.agua : (p.estado === 'FLORECIDA' ? 0.85 : 0.15);
        const gradTierra = ctx.createLinearGradient(0, y, 0, y + h);

        if (factorHumedad >= this.LIMITE_HUMEDA) {
            // Tierra muy húmeda / humus negro cargado de nutrientes
            gradTierra.addColorStop(0, '#3E2723');
            gradTierra.addColorStop(0.6, '#2E1C12');
            gradTierra.addColorStop(1, '#1A0F0A');
        } else if (factorHumedad >= this.LIMITE_SED) {
            // Tierra óptima balanceada: marrón chocolate fértil
            gradTierra.addColorStop(0, '#5D4037');
            gradTierra.addColorStop(0.5, '#4E342E');
            gradTierra.addColorStop(1, '#3E2723');
        } else {
            // Tierra seca agrietada y sedienta: arena arcillosa deshidratada
            gradTierra.addColorStop(0, '#BCAAA4');
            gradTierra.addColorStop(0.4, '#A1887F');
            gradTierra.addColorStop(1, '#8D6E63');
        }

        ctx.fillStyle = gradTierra;
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, 8);
        ctx.fill();

        // Sombra interior de profundidad (ambient occlusion dentro del cajón)
        const sombraInterna = ctx.createLinearGradient(0, y, 0, y + 16);
        sombraInterna.addColorStop(0, 'rgba(0, 0, 0, 0.42)');
        sombraInterna.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = sombraInterna;
        ctx.beginPath();
        ctx.roundRect(x, y, w, 16, 8);
        ctx.fill();

        // Surcos orgánicos de cultivo labrado
        ctx.strokeStyle = factorHumedad >= this.LIMITE_SED ? 'rgba(0, 0, 0, 0.18)' : 'rgba(93, 64, 55, 0.28)';
        ctx.lineWidth = 1.8;
        for (let i = 1; i <= 2; i++) {
            const ly = y + (h * i) / 3;
            ctx.beginPath();
            ctx.moveTo(x + 10, ly);
            ctx.quadraticCurveTo(x + w * 0.5, ly + 2, x + w - 10, ly);
            ctx.stroke();
        }

        // Destellos de humedad si la tierra está mojada
        if (factorHumedad >= this.LIMITE_HUMEDA) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.14)';
            for (let k = 0; k < 4; k++) {
                const gx = x + 18 + ((k * 37) % (w - 36));
                const gy = y + 14 + ((k * 23) % (h - 28));
                ctx.beginPath();
                ctx.ellipse(gx, gy, 4, 2, 0.3, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Grietas orgánicas detalladas si la tierra está en sequía
        if (factorHumedad < this.LIMITE_SED) {
            ctx.strokeStyle = '#4E342E';
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            // Grieta izquierda
            ctx.moveTo(x + 20, y + 16);
            ctx.lineTo(x + 32, y + 26);
            ctx.lineTo(x + 26, y + 42);
            ctx.moveTo(x + 32, y + 26);
            ctx.lineTo(x + 44, y + 32);

            // Grieta derecha
            ctx.moveTo(x + w - 24, y + h - 16);
            ctx.lineTo(x + w - 38, y + h - 28);
            ctx.lineTo(x + w - 32, y + h - 42);
            ctx.moveTo(x + w - 38, y + h - 28);
            ctx.lineTo(x + w - 50, y + h - 22);
            ctx.stroke();
        }

        // Borde interactivo con aura luminosa al pasar el ratón (hover)
        if (hover) {
            ctx.strokeStyle = '#34D399';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.roundRect(x - 1, y - 1, w + 2, h + 2, 9);
            ctx.stroke();

            ctx.strokeStyle = 'rgba(52, 211, 153, 0.4)';
            ctx.lineWidth = 6;
            ctx.stroke();
        } else {
            ctx.strokeStyle = '#2A1B0E';
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.roundRect(x, y, w, h, 8);
            ctx.stroke();
        }

        // 4. Dibujar el vegetal / cultivo botánico según su estado
        const cx = x + w / 2;
        const baseY = y + h * 0.76;

        if (p.estado === 'CRECIENDO') {
            this.dibujarPlanta(ctx, cx, baseY, p.crecimiento, false, null);
        } else if (p.estado === 'FLORECIDA') {
            this.dibujarPlanta(ctx, cx, baseY, 1.0, false, p.colorFlor);
        } else if (p.estado === 'SECA') {
            this.dibujarPlanta(ctx, cx, baseY, 0.72, true, null);
        }

        // 5. Dibujar residuo / basura si está presente en la parcela
        if (p.basura) {
            const bx = cx + (p.estado === 'VACIA' ? 0 : 38);
            const by = y + h - 22;
            this.dibujarBasura(ctx, bx, by, p.tipoBasura);
        }

        // 6. Alerta flotante de sed (burbuja translúcida con gota roja y pulso)
        if (p.estado === 'CRECIENDO' && p.agua < this.LIMITE_SED) {
            const pulso = 1 + Math.sin(this.relojTotal * 7) * 0.12;
            const gotaX = cx + 46;
            const gotaY = y + 20 + Math.sin(this.relojTotal * 4) * 3;

            // Sombra suave de la burbuja
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.beginPath();
            ctx.arc(gotaX + 2, gotaY + 3, 14 * pulso, 0, Math.PI * 2);
            ctx.fill();

            // Burbuja circular de cristal blanco
            const gradBurbuja = ctx.createRadialGradient(gotaX - 4, gotaY - 4, 2, gotaX, gotaY, 14 * pulso);
            gradBurbuja.addColorStop(0, '#FFFFFF');
            gradBurbuja.addColorStop(0.7, '#FEF2F2');
            gradBurbuja.addColorStop(1, '#FEE2E2');
            ctx.fillStyle = gradBurbuja;
            ctx.beginPath();
            ctx.arc(gotaX, gotaY, 14 * pulso, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#EF4444';
            ctx.lineWidth = 2.2;
            ctx.stroke();

            // Gota roja de sed intensa con destello
            this.dibujarFormaGota(ctx, gotaX, gotaY + 1, 7 * pulso, '#EF4444', '#B91C1C');

            // Destello de reflejo en la burbuja
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(gotaX - 5 * pulso, gotaY - 5 * pulso, 2.5 * pulso, 0, Math.PI * 2);
            ctx.fill();
        }

        // 7. Animación fluida de riego (regadera inclinada vertiendo agua)
        if (p.riegoAnim > 0) {
            ctx.save();
            ctx.translate(cx - 32, y - 10);
            ctx.rotate(0.35);
            this.dibujarIconoRegadera(ctx, 0, 0, 0.75);
            ctx.restore();

            // Chorro y salpicaduras de gotitas celestes sobre la tierra
            for (let i = 0; i < 6; i++) {
                const avance = (p.riegoAnim * 3.8 + i * 0.18) % 1;
                const gx = cx - 18 + i * 7 + Math.sin(avance * 5) * 3;
                const gy = y + 8 + avance * 42;

                const gradGota = ctx.createRadialGradient(gx - 1, gy - 1, 0.5, gx, gy, 3.5);
                gradGota.addColorStop(0, '#BAE6FD');
                gradGota.addColorStop(1, '#0284C7');
                ctx.fillStyle = gradGota;
                ctx.beginPath();
                ctx.arc(gx, gy, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        ctx.restore();
    }

    dibujarPlanta(ctx, cx, base, crecimiento, esSeca, colorFlor) {
        ctx.save();
        const colorTallo = esSeca ? '#78350F' : '#15803D';
        const colorHoja = esSeca ? '#A16207' : '#22C55E';
        const colorHojaLuz = esSeca ? '#CA8A04' : '#86EFAC';

        // 1. Montículo de tierra orgánica fértil en la raíz
        const gradRaiz = ctx.createRadialGradient(cx, base, 2, cx, base, 18);
        gradRaiz.addColorStop(0, '#2D180B');
        gradRaiz.addColorStop(1, '#451A03');
        ctx.fillStyle = gradRaiz;
        ctx.beginPath();
        ctx.ellipse(cx, base, 18, 7, 0, 0, Math.PI * 2);
        ctx.fill();

        // 2. Etapa de brote temprano (germinación < 0.2)
        if (crecimiento < 0.2 && !esSeca) {
            // Estaca marcadora de madera con etiqueta
            ctx.fillStyle = '#B45309';
            ctx.fillRect(cx - 16, base - 18, 3, 18);
            ctx.fillStyle = '#FDE68A';
            ctx.strokeStyle = '#78350F';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.roundRect(cx - 24, base - 25, 14, 9, 2);
            ctx.fill();
            ctx.stroke();

            // Pequeño brote tierno germinando con rocío
            ctx.strokeStyle = '#15803D';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(cx, base);
            ctx.quadraticCurveTo(cx - 2, base - 7, cx - 1, base - 12);
            ctx.stroke();

            // Dos cotiledones verdes
            ctx.fillStyle = '#4ADE80';
            ctx.strokeStyle = '#166534';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.ellipse(cx - 4, base - 12, 5, 3, -0.4, 0, Math.PI * 2);
            ctx.ellipse(cx + 3, base - 11, 4.5, 2.8, 0.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Gotita de rocío brillante
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(cx - 3, base - 14, 1.3, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
            return;
        }

        // 3. Tallo principal con curvatura orgánica y vaivén del viento
        const altura = 18 + 44 * Math.min(1, crecimiento);
        const oscilacionViento = esSeca ? 16 : Math.sin(this.relojTotal * 2.8 + cx * 0.04) * (3 + crecimiento * 2);
        const caida = esSeca ? 18 : oscilacionViento;

        // Sombra / contorno grueso del tallo
        ctx.strokeStyle = '#14532D';
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(cx, base);
        ctx.quadraticCurveTo(cx + caida * 0.35, base - altura * 0.55, cx + caida, base - altura);
        ctx.stroke();

        // Tallo iluminado
        ctx.strokeStyle = colorTallo;
        ctx.lineWidth = 3.2;
        ctx.beginPath();
        ctx.moveTo(cx, base);
        ctx.quadraticCurveTo(cx + caida * 0.35, base - altura * 0.55, cx + caida, base - altura);
        ctx.stroke();

        // Franja de luz en el tallo
        if (!esSeca) {
            ctx.strokeStyle = '#4ADE80';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(cx - 1, base);
            ctx.quadraticCurveTo(cx + caida * 0.35 - 1, base - altura * 0.55, cx + caida - 0.8, base - altura);
            ctx.stroke();
        }

        // 4. Hojas laterales botánicas con nervaduras
        const tamHoja = 10 + 10 * Math.min(1, crecimiento);

        // Par de hojas inferiores
        this.dibujarHojaBotanica(ctx, cx, base - altura * 0.38, -tamHoja, colorHoja, colorHojaLuz, esSeca);
        this.dibujarHojaBotanica(ctx, cx, base - altura * 0.44, tamHoja, colorHoja, colorHojaLuz, esSeca);

        // Par de hojas intermedias si ha crecido más del 50%
        if (crecimiento > 0.5) {
            const hxMid = cx + caida * 0.42;
            this.dibujarHojaBotanica(ctx, hxMid, base - altura * 0.72, -tamHoja * 0.85, colorHoja, colorHojaLuz, esSeca);
            this.dibujarHojaBotanica(ctx, hxMid, base - altura * 0.76, tamHoja * 0.85, colorHoja, colorHojaLuz, esSeca);
        }

        // 5. Cúspide: Flor aterciopelada o cultivo cosechable si está florecida
        if (colorFlor) {
            const fx = cx + caida;
            const fy = base - altura - 6;

            // Sombra suave bajo la flor
            ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
            ctx.beginPath();
            ctx.ellipse(fx, fy + 4, 12, 5, 0, 0, Math.PI * 2);
            ctx.fill();

            // 6 pétalos aterciopelados con gradiente radial y borde
            const numPetalos = 6;
            for (let i = 0; i < numPetalos; i++) {
                const ang = (i * Math.PI * 2) / numPetalos + this.relojTotal * 0.35;
                const px = fx + Math.cos(ang) * 11;
                const py = fy + Math.sin(ang) * 11;

                const gradPetalo = ctx.createRadialGradient(px, py, 1, px, py, 9);
                gradPetalo.addColorStop(0, '#FFFFFF');
                gradPetalo.addColorStop(0.35, colorFlor);
                gradPetalo.addColorStop(1, '#9F1239');

                ctx.fillStyle = gradPetalo;
                ctx.beginPath();
                ctx.arc(px, py, 7.5, 0, Math.PI * 2);
                ctx.fill();

                ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
                ctx.lineWidth = 1.2;
                ctx.stroke();
            }

            // Corona interior de pétalos menores
            for (let i = 0; i < numPetalos; i++) {
                const ang = ((i + 0.5) * Math.PI * 2) / numPetalos + this.relojTotal * 0.35;
                const px = fx + Math.cos(ang) * 6;
                const py = fy + Math.sin(ang) * 6;
                ctx.fillStyle = colorFlor;
                ctx.beginPath();
                ctx.arc(px, py, 4.5, 0, Math.PI * 2);
                ctx.fill();
            }

            // Pistilo central dorado radiante con polen brillante
            const gradPistilo = ctx.createRadialGradient(fx - 2, fy - 2, 1, fx, fy, 7);
            gradPistilo.addColorStop(0, '#FEF08A');
            gradPistilo.addColorStop(0.6, '#F59E0B');
            gradPistilo.addColorStop(1, '#D97706');
            ctx.fillStyle = gradPistilo;
            ctx.beginPath();
            ctx.arc(fx, fy, 6.8, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#B45309';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Puntos de polen destellante
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(fx - 2, fy - 2, 1.6, 0, Math.PI * 2);
            ctx.arc(fx + 2.5, fy + 1.5, 1.2, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    dibujarHojaBotanica(ctx, x, y, direccion, colorBase, colorLuz, esSeca) {
        ctx.save();
        ctx.translate(x, y);

        const largo = direccion;
        const ancho = Math.abs(direccion) * 0.55;
        const inclinacion = esSeca ? 10 : -7;

        // Cuerpo superior iluminado de la hoja
        ctx.fillStyle = colorLuz;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(largo * 0.5, inclinacion - ancho * 0.5, largo, inclinacion * 0.4);
        ctx.quadraticCurveTo(largo * 0.5, 0, 0, 0);
        ctx.fill();

        // Cuerpo inferior sombreado de la hoja
        ctx.fillStyle = colorBase;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(largo * 0.5, 0, largo, inclinacion * 0.4);
        ctx.quadraticCurveTo(largo * 0.5, inclinacion + ancho * 0.6, 0, 0);
        ctx.fill();

        // Contorno nítido de la hoja
        ctx.strokeStyle = esSeca ? '#451A03' : '#14532D';
        ctx.lineWidth = 1.4;
        ctx.stroke();

        // Nervadura central
        ctx.strokeStyle = esSeca ? '#78350F' : '#15803D';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(largo * 0.5, inclinacion * 0.2, largo * 0.85, inclinacion * 0.35);
        ctx.stroke();

        ctx.restore();
    }

    dibujarHoja(ctx, x, y, direccion, color, esSeca) {
        // Redirigir a la versión botánica de alta resolución
        this.dibujarHojaBotanica(ctx, x, y, direccion, color, esSeca ? '#CA8A04' : '#86EFAC', esSeca);
    }

    dibujarBasura(ctx, x, y, tipo) {
        ctx.save();

        // Sombra de contacto del residuo
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.beginPath();
        ctx.ellipse(x, y + 6, 12, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        if (tipo === 0) {
            // Botella de plástico transparente / celeste reciclable
            ctx.translate(x, y);
            ctx.rotate(0.42);

            // Cuerpo transparente con reflejo
            const gradBotella = ctx.createLinearGradient(-8, 0, 8, 0);
            gradBotella.addColorStop(0, '#BAE6FD');
            gradBotella.addColorStop(0.35, '#E0F2FE');
            gradBotella.addColorStop(0.7, '#7DD3FC');
            gradBotella.addColorStop(1, '#0284C7');

            ctx.fillStyle = gradBotella;
            ctx.strokeStyle = '#1E293B';
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.roundRect(-8, -14, 16, 28, 4);
            ctx.fill();
            ctx.stroke();

            // Etiqueta de plástico en el centro
            ctx.fillStyle = '#22C55E';
            ctx.fillRect(-7, -4, 14, 8);

            // Cuello y tapa azul roscada
            ctx.fillStyle = '#0284C7';
            ctx.fillRect(-4, -18, 8, 4);
            ctx.strokeStyle = '#0F172A';
            ctx.lineWidth = 1.2;
            ctx.strokeRect(-4, -18, 8, 4);

            // Reflejo brillante de luz
            ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
            ctx.fillRect(-5, -12, 2.5, 20);
        } else if (tipo === 1) {
            // Papel arrugado con facetas geométricas en 3D
            const gradPapel = ctx.createRadialGradient(x - 3, y - 3, 2, x, y, 11);
            gradPapel.addColorStop(0, '#FFFFFF');
            gradPapel.addColorStop(0.65, '#E2E8F0');
            gradPapel.addColorStop(1, '#94A3B8');

            ctx.fillStyle = gradPapel;
            ctx.strokeStyle = '#334155';
            ctx.lineWidth = 1.6;

            // Silueta poligonal arrugada
            ctx.beginPath();
            ctx.moveTo(x - 10, y - 4);
            ctx.lineTo(x - 4, y - 11);
            ctx.lineTo(x + 6, y - 9);
            ctx.lineTo(x + 11, y - 2);
            ctx.lineTo(x + 8, y + 8);
            ctx.lineTo(x - 3, y + 10);
            ctx.lineTo(x - 9, y + 5);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Pliegues y arrugas internas
            ctx.strokeStyle = '#64748B';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(x - 4, y - 11);
            ctx.lineTo(x, y);
            ctx.lineTo(x + 8, y + 8);
            ctx.moveTo(x + 6, y - 9);
            ctx.lineTo(x, y);
            ctx.lineTo(x - 9, y + 5);
            ctx.stroke();
        } else {
            // Bolsa plástica arrugada con asas dobladas
            const gradBolsa = ctx.createLinearGradient(x - 12, y - 10, x + 12, y + 10);
            gradBolsa.addColorStop(0, '#F1F5F9');
            gradBolsa.addColorStop(0.5, '#CBD5E1');
            gradBolsa.addColorStop(1, '#94A3B8');

            ctx.fillStyle = gradBolsa;
            ctx.strokeStyle = '#1E293B';
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.roundRect(x - 12, -9 + y, 24, 18, 5);
            ctx.fill();
            ctx.stroke();

            // Asas de la bolsa con agujero
            ctx.beginPath();
            ctx.ellipse(x - 6, y - 11, 4, 3, 0, 0, Math.PI * 2);
            ctx.ellipse(x + 6, y - 11, 4, 3, 0, 0, Math.PI * 2);
            ctx.stroke();

            // Arrugas de plástico
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(x - 8, y - 4);
            ctx.lineTo(x + 6, y + 4);
            ctx.stroke();
        }

        ctx.restore();
    }

    dibujarFaunaBiohuerto(ctx) {
        ctx.save();

        // 1. Mariposas revoloteando con aleteo 3D y estela de polen
        this.mariposas.forEach(m => {
            ctx.save();
            ctx.translate(m.x, m.y);

            const aleteo = Math.sin(this.relojTotal * 14 + m.fase);
            const factorAla = Math.abs(aleteo);

            // Estela tenue de partículas de polen tras la mariposa
            ctx.fillStyle = 'rgba(254, 240, 138, 0.55)';
            for (let p = 1; p <= 3; p++) {
                ctx.beginPath();
                ctx.arc(-p * 8, p * 3 + Math.sin(this.relojTotal * 5 + p) * 2, 1.8 - p * 0.4, 0, Math.PI * 2);
                ctx.fill();
            }

            // Alas con perspectiva 3D
            ctx.scale(0.3 + factorAla * 0.7, 1);

            // Ala delantera izquierda
            const gradAla = ctx.createRadialGradient(0, 0, 2, 0, 0, 16);
            gradAla.addColorStop(0, '#FEF08A');
            gradAla.addColorStop(0.4, m.color);
            gradAla.addColorStop(1, '#1E293B');

            ctx.fillStyle = gradAla;
            ctx.strokeStyle = '#0F172A';
            ctx.lineWidth = 1.5;

            // Alas superiores
            ctx.beginPath();
            ctx.ellipse(-11, -9, 13, 9, -0.2, 0, Math.PI * 2);
            ctx.ellipse(11, -9, 13, 9, 0.2, 0, Math.PI * 2);
            // Alas inferiores
            ctx.ellipse(-9, 5, 9, 6.5, 0.3, 0, Math.PI * 2);
            ctx.ellipse(9, 5, 9, 6.5, -0.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Puntos blancos en las orillas de las alas (estilo monarca)
            ctx.fillStyle = '#FFFFFF';
            [-18, 18].forEach(px => {
                ctx.beginPath();
                ctx.arc(px, -10, 1.2, 0, Math.PI * 2);
                ctx.arc(px * 0.8, -14, 1.2, 0, Math.PI * 2);
                ctx.fill();
            });

            // Cuerpo aterciopelado de la mariposa
            ctx.fillStyle = '#0F172A';
            ctx.beginPath();
            ctx.roundRect(-2.5, -11, 5, 20, 2.5);
            ctx.fill();

            // Antenas finas
            ctx.strokeStyle = '#0F172A';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(-1, -11);
            ctx.lineTo(-6, -18);
            ctx.moveTo(1, -11);
            ctx.lineTo(6, -18);
            ctx.stroke();

            ctx.restore();
        });

        // 2. Abejitas melíferas polinizando sobre bancales con flores abiertas
        this.parcelas.forEach(p => {
            if (p.estado === 'FLORECIDA') {
                const ax = p.x + p.w / 2 + Math.cos(this.relojTotal * 4.5 + p.indice) * 26;
                const ay = p.y + 8 + Math.sin(this.relojTotal * 6.2 + p.indice) * 8;

                // Sombra de la abejita en el bancal
                ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
                ctx.beginPath();
                ctx.ellipse(ax, p.y + 24, 5, 2, 0, 0, Math.PI * 2);
                ctx.fill();

                // Alitas transparentes vibrando a alta velocidad
                const aleteoAbeja = Math.sin(this.relojTotal * 28);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
                ctx.strokeStyle = '#94A3B8';
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                ctx.ellipse(ax - 3, ay - 6 + aleteoAbeja * 2, 4.5, 2.8, -0.3, 0, Math.PI * 2);
                ctx.ellipse(ax + 3, ay - 6 - aleteoAbeja * 2, 4.5, 2.8, 0.3, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                // Cuerpo rayado amarillo y negro
                ctx.fillStyle = '#F59E0B';
                ctx.strokeStyle = '#0F172A';
                ctx.lineWidth = 1.3;
                ctx.beginPath();
                ctx.ellipse(ax, ay, 7.5, 5.2, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                // Rayas negras de la abeja
                ctx.fillStyle = '#0F172A';
                ctx.fillRect(ax - 2.5, ay - 4.5, 2.2, 9);
                ctx.fillRect(ax + 1.5, ay - 4.5, 2.2, 9);

                // Aguijón y ojito
                ctx.fillStyle = '#0F172A';
                ctx.beginPath();
                ctx.arc(ax + 6, ay - 1, 1.2, 0, Math.PI * 2);
                ctx.fill();
            }
        });

        ctx.restore();
    }

    dibujarBarraHerramientas(ctx) {
        ctx.save();
        const dockX = 406, dockY = 122, dockW = 188, dockH = 80;

        // 1. Sombra suave del dock sobre el césped
        ctx.fillStyle = 'rgba(15, 23, 42, 0.32)';
        ctx.beginPath();
        ctx.roundRect(dockX - 2, dockY + 4, dockW + 4, dockH + 6, 16);
        ctx.fill();

        // 2. Chasis del Dock estilo inventario de aventura / RPG
        const gradDock = ctx.createLinearGradient(dockX, dockY, dockX, dockY + dockH);
        gradDock.addColorStop(0, '#1E293B');
        gradDock.addColorStop(0.5, '#0F172A');
        gradDock.addColorStop(1, '#090D16');

        ctx.fillStyle = gradDock;
        ctx.beginPath();
        ctx.roundRect(dockX, dockY, dockW, dockH, 14);
        ctx.fill();

        // Bisel exterior metálico
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2.2;
        ctx.stroke();

        // Línea superior de brillo especular
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(dockX + 2, dockY + 2, dockW - 4, dockH - 4, 12);
        ctx.stroke();

        // 3. Renderizado de las 3 casillas de herramientas
        this.botonesHerramientas.forEach(btn => {
            const activa = btn.id === this.herramientaActual;
            const hover = this.puntoEnRect(this.ratonX, this.ratonY, btn);

            // Casilla / Slot de inventario
            const gradSlot = ctx.createLinearGradient(btn.x, btn.y, btn.x, btn.y + btn.h);
            if (activa) {
                gradSlot.addColorStop(0, '#1E3A8A');
                gradSlot.addColorStop(0.6, '#172554');
                gradSlot.addColorStop(1, '#0F172A');
            } else if (hover) {
                gradSlot.addColorStop(0, '#334155');
                gradSlot.addColorStop(1, '#1E293B');
            } else {
                gradSlot.addColorStop(0, '#1E293B');
                gradSlot.addColorStop(1, '#0F172A');
            }

            ctx.fillStyle = gradSlot;
            ctx.beginPath();
            ctx.roundRect(btn.x, btn.y, btn.w, btn.h, 10);
            ctx.fill();

            // Borde del slot con aura dorada si está activa
            if (activa) {
                // Aura externa
                ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
                ctx.lineWidth = 5;
                ctx.beginPath();
                ctx.roundRect(btn.x, btn.y, btn.w, btn.h, 10);
                ctx.stroke();

                // Borde dorado principal
                ctx.strokeStyle = '#FBBF24';
                ctx.lineWidth = 2.4;
                ctx.beginPath();
                ctx.roundRect(btn.x, btn.y, btn.w, btn.h, 10);
                ctx.stroke();

                // Gema en esquina superior derecha
                ctx.fillStyle = '#F59E0B';
                ctx.beginPath();
                ctx.arc(btn.x + btn.w - 5, btn.y + 5, 2.8, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.strokeStyle = hover ? '#64748B' : '#334155';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.roundRect(btn.x, btn.y, btn.w, btn.h, 10);
                ctx.stroke();
            }

            // Tecla numérica estilizada estilo keycap [1], [2], [3]
            const bX = btn.x + 3.5;
            const bY = btn.y + 3.5;
            // Cara del botón
            ctx.fillStyle = activa ? '#F59E0B' : '#1E293B';
            ctx.beginPath();
            ctx.roundRect(bX, bY, 15, 13, 3);
            ctx.fill();
            ctx.strokeStyle = activa ? '#FEF08A' : '#475569';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Número de la tecla
            ctx.fillStyle = activa ? '#000000' : '#E2E8F0';
            ctx.font = '900 10px "Segoe UI", system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(btn.tecla, bX + 7.5, bY + 6.5);

            // Icono vectorial centrado en el slot
            const icX = btn.x + btn.w / 2;
            const icY = btn.y + btn.h / 2 + 1;
            if (btn.id === 'SEMILLA') {
                this.dibujarIconoSemilla(ctx, icX, icY, 0.82);
            } else if (btn.id === 'REGADERA') {
                this.dibujarIconoRegadera(ctx, icX - 2, icY, 0.84);
            } else {
                this.dibujarIconoRecoger(ctx, icX, icY, 0.86);
            }

            // Etiqueta tipográfica clara bajo cada slot
            ctx.fillStyle = activa ? '#FDE047' : '#94A3B8';
            ctx.font = 'bold 10px "Segoe UI", system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(btn.nombre, btn.x + btn.w / 2, 192);
        });

        ctx.restore();
    }

    dibujarCursorHerramienta(ctx) {
        if (this.estado !== 'JUGANDO') return;
        const sobreParcela = this.parcelas.some(p => this.puntoEnRect(this.ratonX, this.ratonY, p));
        if (!sobreParcela) return;

        ctx.save();
        const cx = this.ratonX + 20;
        const cy = this.ratonY + 20;

        // Sombra suave del cursor badge
        ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
        ctx.beginPath();
        ctx.arc(cx + 2, cy + 3, 19, 0, Math.PI * 2);
        ctx.fill();

        // Fondo blanco esmaltado
        const gradCursor = ctx.createRadialGradient(cx - 5, cy - 5, 2, cx, cy, 19);
        gradCursor.addColorStop(0, '#FFFFFF');
        gradCursor.addColorStop(0.8, '#F8FAFC');
        gradCursor.addColorStop(1, '#E2E8F0');

        ctx.fillStyle = gradCursor;
        ctx.beginPath();
        ctx.arc(cx, cy, 19, 0, Math.PI * 2);
        ctx.fill();

        // Borde circular nítido
        ctx.strokeStyle = '#0F172A';
        ctx.lineWidth = 2.2;
        ctx.stroke();

        // Icono de la herramienta activa
        if (this.herramientaActual === 'SEMILLA') {
            this.dibujarIconoSemilla(ctx, cx, cy, 0.58);
        } else if (this.herramientaActual === 'REGADERA') {
            this.dibujarIconoRegadera(ctx, cx, cy, 0.58);
        } else {
            this.dibujarIconoRecoger(ctx, cx, cy, 0.58);
        }

        ctx.restore();
    }

    dibujarIconoSemilla(ctx, cx, cy, s) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(s, s);

        // Saquito de arpillera / yute con degradado y costura
        const gradSaco = ctx.createLinearGradient(-13, -10, 13, 16);
        gradSaco.addColorStop(0, '#F59E0B');
        gradSaco.addColorStop(0.5, '#D97706');
        gradSaco.addColorStop(1, '#92400E');

        ctx.fillStyle = gradSaco;
        ctx.strokeStyle = '#451A03';
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.roundRect(-13, -10, 26, 26, 7);
        ctx.fill();
        ctx.stroke();

        // Cuerda atada en el cuello del saquito
        ctx.fillStyle = '#78350F';
        ctx.beginPath();
        ctx.roundRect(-10, -15, 20, 6, 3);
        ctx.fill();
        ctx.stroke();

        // Parche bordado en el saco
        ctx.fillStyle = 'rgba(254, 243, 199, 0.35)';
        ctx.fillRect(-6, -2, 12, 12);
        ctx.strokeStyle = '#78350F';
        ctx.lineWidth = 1;
        ctx.strokeRect(-6, -2, 12, 12);

        // Brote esmeralda germinando radiante del saquito
        ctx.fillStyle = '#22C55E';
        ctx.strokeStyle = '#14532D';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.ellipse(0, 3, 5, 8, 0.25, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Hoja tierna secundaria
        ctx.fillStyle = '#4ADE80';
        ctx.beginPath();
        ctx.ellipse(-3, 1, 3.5, 5, -0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.restore();
    }

    dibujarIconoRegadera(ctx, cx, cy, s) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(s, s);

        // Pico vertedor metálico
        const gradPico = ctx.createLinearGradient(5, -2, 21, -10);
        gradPico.addColorStop(0, '#0284C7');
        gradPico.addColorStop(1, '#38BDF8');
        ctx.fillStyle = gradPico;
        ctx.strokeStyle = '#0F172A';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(5, -2);
        ctx.lineTo(19, -12);
        ctx.lineTo(21, -8);
        ctx.lineTo(7, 6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Roseta rociadora con orificios en el extremo del pico
        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.ellipse(21, -10, 3.5, 6, 0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Cuerpo cilíndrico de la regadera con reflejo metálico
        const gradCuerpo = ctx.createLinearGradient(-13, -7, 7, 13);
        gradCuerpo.addColorStop(0, '#38BDF8');
        gradCuerpo.addColorStop(0.4, '#0284C7');
        gradCuerpo.addColorStop(1, '#0369A1');

        ctx.fillStyle = gradCuerpo;
        ctx.beginPath();
        ctx.roundRect(-13, -7, 20, 20, 5);
        ctx.fill();
        ctx.stroke();

        // Reflejo curvo de luz en el cuerpo
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.beginPath();
        ctx.roundRect(-11, -5, 4, 16, 2);
        ctx.fill();

        // Asa arqueada
        ctx.strokeStyle = '#0F172A';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(-13, 3, 9, Math.PI * 0.5, Math.PI * 1.5);
        ctx.stroke();

        // Asa superior de transporte
        ctx.beginPath();
        ctx.arc(-3, -7, 7, Math.PI, 0);
        ctx.stroke();

        // Gotita de agua pura cayendo
        ctx.fillStyle = '#BAE6FD';
        ctx.beginPath();
        ctx.arc(24, -14, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    dibujarIconoRecoger(ctx, cx, cy, s) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(s, s);

        // Mango torneado de madera de fresno
        ctx.strokeStyle = '#D97706';
        ctx.lineWidth = 4.2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-11, -12);
        ctx.lineTo(2, 2);
        ctx.stroke();

        // Abrazadera metálica dorada
        ctx.strokeStyle = '#FBBF24';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(1, 1);
        ctx.lineTo(3, 3);
        ctx.stroke();

        // Cepillo de cerdas limpiadoras ecológicas
        const gradCerdas = ctx.createLinearGradient(1, 1, 17, 13);
        gradCerdas.addColorStop(0, '#34D399');
        gradCerdas.addColorStop(0.5, '#10B981');
        gradCerdas.addColorStop(1, '#059669');

        ctx.fillStyle = gradCerdas;
        ctx.strokeStyle = '#064E3B';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(1, 1);
        ctx.lineTo(15, -6);
        ctx.lineTo(17, 13);
        ctx.lineTo(4, 9);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Cerdas finas grabadas
        ctx.strokeStyle = '#047857';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(7, 3);
        ctx.lineTo(13, 10);
        ctx.moveTo(10, -1);
        ctx.lineTo(15, 6);
        ctx.stroke();

        ctx.restore();
    }

    dibujarFormaGota(ctx, cx, cy, r, colorRelleno, colorBorde) {
        ctx.save();
        ctx.fillStyle = colorRelleno;
        ctx.strokeStyle = colorBorde;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(cx, cy - r * 1.6);
        ctx.bezierCurveTo(cx + r, cy - r * 0.4, cx + r, cy + r, cx, cy + r);
        ctx.bezierCurveTo(cx - r, cy + r, cx - r, cy - r * 0.4, cx, cy - r * 1.6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Brillo interior de la gota
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.beginPath();
        ctx.arc(cx - r * 0.35, cy - r * 0.2, r * 0.35, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    puntoEnRect(px, py, r) {
        return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
    }

    mezclarColor(hexA, hexB, proporcion) {
        const parse = (hex) => {
            const h = hex.replace('#', '');
            return [
                parseInt(h.substring(0, 2), 16),
                parseInt(h.substring(2, 4), 16),
                parseInt(h.substring(4, 6), 16)
            ];
        };
        const a = parse(hexA);
        const b = parse(hexB);
        const r = Math.round(a[0] + (b[0] - a[0]) * proporcion);
        const g = Math.round(a[1] + (b[1] - a[1]) * proporcion);
        const bl = Math.round(a[2] + (b[2] - a[2]) * proporcion);
        return `rgb(${r}, ${g}, ${bl})`;
    }
}

// Exponer la clase globalmente para el orquestador
window.SembradoresVerde = SembradoresVerde;

