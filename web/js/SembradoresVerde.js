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
        const y0 = 224;

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

        // 3 botones interactivos de herramientas visibles en la parte superior
        const boxX = 175;
        const boxY = 114;
        const anchoBtn = 200;
        const altoBtn = 54;
        const yBtn = boxY + 30;

        this.botonesHerramientas = [
            { id: 'SEMILLA', x: boxX + 16, y: yBtn, w: anchoBtn, h: altoBtn, nombre: '1. Sembrar', subtitulo: 'Planta semillas', tecla: '1', color: '#16A34A' },
            { id: 'REGADERA', x: boxX + 16 + anchoBtn + 14, y: yBtn, w: anchoBtn, h: altoBtn, nombre: '2. Regar', subtitulo: 'Solo tierra seca', tecla: '2', color: '#0284C7' },
            { id: 'RECOGER', x: boxX + 16 + (anchoBtn + 14) * 2, y: yBtn, w: anchoBtn, h: altoBtn, nombre: '3. Limpiar', subtitulo: 'Recoge basura', tecla: '3', color: '#D97706' }
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
        this.hablarMascota('¡Usa [1] Sembrar, [2] Regar y [3] Limpiar arriba!', 4.5);

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
        // 1. Revisar si pulsó un botón de herramienta en la barra inferior
        for (const btn of this.botonesHerramientas) {
            if (x >= btn.x && x <= btn.x + btn.w && y >= btn.y && y <= btn.y + btn.h) {
                this.seleccionarHerramienta(btn.id);
                return;
            }
        }

        // 2. Revisar si pulsó sobre alguna de las 12 parcelas
        const parcela = this.parcelas.find(p => x >= p.x && x <= p.x + p.w && y >= p.y && y <= p.y + p.h);
        if (!parcela) return;

        const cx = parcela.x + parcela.w / 2;
        const cy = parcela.y + parcela.h / 2;

        // Asistencia pedagógica: si hay basura y el niño toca la parcela, recogerla de inmediato
        if (parcela.basura) {
            parcela.basura = false;
            this.acierto(8, cx, cy, 'BASURA', '¡BASURA RECOGIDA!');
            this.crearChispas(cx, cy, '#10B981', 18);
            window.audioEco.recoger();
            this.mostrarToastInfo('¡Residuo recogido! Tierra lista para sembrar.');
            return;
        }

        // Si la planta está marchita y el niño la toca, limpiarla para acondicionar el suelo
        if (parcela.estado === 'SECA') {
            parcela.estado = 'VACIA';
            parcela.agua = 0;
            parcela.crecimiento = 0;
            parcela.sinAgua = 0;
            this.acierto(5, cx, cy, 'BASURA', '¡SUELO LIMPIO!');
            this.crearChispas(cx, cy, '#D97706', 14);
            this.mostrarToastInfo('Tierra acondicionada: ¡Siembra con Semilla [1]!');
            return;
        }

        switch (this.herramientaActual) {
            case 'SEMILLA': {
                if (parcela.estado !== 'VACIA') {
                    if (parcela.agua < this.LIMITE_HUMEDA) {
                        this.mostrarToastInfo('Esta planta necesita agua. Usa la Regadera (Tecla 2)');
                    } else {
                        this.mostrarToastInfo('Esta parcela ya tiene un cultivo creciendo bien');
                    }
                    this.crearChispas(cx, cy, '#CBD5E1', 6);
                } else {
                    // Sembrar con éxito
                    parcela.estado = 'CRECIENDO';
                    parcela.agua = 0.75;
                    parcela.crecimiento = 0;
                    parcela.sinAgua = 0;

                    this.acierto(6, cx, cy - 8, 'SIEMBRA', '¡SEMBRADO!');
                    this.crearChispas(cx, cy - 8, '#4ADE80', 16);
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

                        this.acierto(bonoSed, cx, cy - 14, 'RIEGO', '¡RIEGO ÓPTIMO!');
                        this.crearChispas(cx, cy - 10, '#38BDF8', 22);
                    } else {
                        // ¡ERROR PEDAGÓGICO DE RIEGO EN EXCESO!
                        this.registrarError('¡Demasiada agua! La tierra aún está húmeda. Regar de más asfixia las raíces.', 0.06);
                    }
                } else if (parcela.estado === 'VACIA') {
                    this.mostrarToastInfo('La parcela está vacía. Siembra primero con Semilla (Tecla 1)');
                }
                break;
            }
            case 'RECOGER':
            default: {
                if (parcela.estado === 'VACIA') {
                    this.mostrarToastInfo('La parcela ya está limpia. Siembra con Semilla (Tecla 1)');
                } else {
                    this.mostrarToastInfo('El cultivo está sano, no hay residuos que retirar');
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
        // Cielo degradado
        const gradCielo = ctx.createLinearGradient(0, this.ESC_Y, 0, 260);
        if (esNivelCalor) {
            gradCielo.addColorStop(0, '#7DD3FC');
            gradCielo.addColorStop(1, '#FED7AA');
        } else {
            gradCielo.addColorStop(0, '#BAE6FD');
            gradCielo.addColorStop(1, '#E0F2FE');
        }
        ctx.fillStyle = gradCielo;
        ctx.fillRect(this.ESC_X, this.ESC_Y, this.ESC_W, 140);

        // Colinas verdes en el horizonte
        ctx.fillStyle = '#86EFAC';
        ctx.strokeStyle = '#2A2340';
        ctx.lineWidth = 2.5;

        ctx.beginPath();
        ctx.ellipse(140, 226, 260, 65, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(820, 226, 280, 68, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Prado verde del biohuerto
        ctx.fillStyle = '#4ADE80';
        ctx.fillRect(this.ESC_X, 226, this.ESC_W, this.ESC_ABA - 226);

        ctx.strokeStyle = '#2A2340';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(this.ESC_X, 226);
        ctx.lineTo(this.ESC_DER, 226);
        ctx.stroke();

        // Briznas de hierba decorativas
        ctx.strokeStyle = '#22C55E';
        ctx.lineWidth = 2;
        for (let i = 0; i < 28; i++) {
            const hx = 40 + (i * 93) % 920;
            const hy = 238 + (i * 51) % 320;
            if (hy < 560) {
                ctx.beginPath();
                ctx.moveTo(hx, hy);
                ctx.lineTo(hx - 3, hy - 7);
                ctx.moveTo(hx + 3, hy);
                ctx.lineTo(hx + 6, hy - 8);
                ctx.stroke();
            }
        }
    }

    dibujarSolYNubes(ctx, esNivelCalor) {
        const sx = 905, sy = 160;
        const radioSol = esNivelCalor ? 38 : 28;
        const colorSol = esNivelCalor ? '#FB923C' : '#FDE047';

        // Rayos giratorios del sol
        ctx.strokeStyle = colorSol;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        for (let i = 0; i < 10; i++) {
            const angulo = (i * Math.PI) / 5 + this.relojTotal * 0.4;
            const r1 = radioSol + 8;
            const r2 = radioSol + (esNivelCalor ? 22 : 16);
            ctx.beginPath();
            ctx.moveTo(sx + Math.cos(angulo) * r1, sy + Math.sin(angulo) * r1);
            ctx.lineTo(sx + Math.cos(angulo) * r2, sy + Math.sin(angulo) * r2);
            ctx.stroke();
        }

        // Cuerpo del sol
        ctx.fillStyle = colorSol;
        ctx.strokeStyle = '#2A2340';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(sx, sy, radioSol, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Rostro amigable del sol
        ctx.fillStyle = '#2A2340';
        ctx.beginPath();
        ctx.arc(sx - 8, sy - 4, 3, 0, Math.PI * 2);
        ctx.arc(sx + 8, sy - 4, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#2A2340';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(sx, sy + 3, 11, 0.2, Math.PI - 0.2);
        ctx.stroke();

        // Nubes (solo si no es sol ardiente extremo)
        if (!esNivelCalor) {
            this.nubes.forEach(n => {
                ctx.fillStyle = '#FFFFFF';
                ctx.beginPath();
                ctx.arc(n.x, n.y, 20 * n.escala, 0, Math.PI * 2);
                ctx.arc(n.x + 22 * n.escala, n.y - 8 * n.escala, 24 * n.escala, 0, Math.PI * 2);
                ctx.arc(n.x + 46 * n.escala, n.y, 18 * n.escala, 0, Math.PI * 2);
                ctx.fill();
            });
        }
    }

    dibujarLetreroBiohuerto(ctx) {
        // Poste de madera
        ctx.fillStyle = '#78350F';
        ctx.fillRect(78, 186, 10, 42);

        // Tablón rústico
        ctx.fillStyle = '#B45309';
        ctx.strokeStyle = '#2A2340';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(32, 156, 104, 34, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '900 13px "Segoe UI", system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('BIOHUERTO', 84, 173);
    }

    dibujarParcela(ctx, p) {
        const hover = this.puntoEnRect(this.ratonX, this.ratonY, p);
        const { x, y, w, h } = p;

        // Marco exterior de madera de cedro (cama de cultivo elevada)
        ctx.fillStyle = '#78350F';
        ctx.beginPath();
        ctx.roundRect(x - 4, y - 2, w + 8, h + 8, 14);
        ctx.fill();

        // Relieve y bisel de madera
        ctx.strokeStyle = '#451A03';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Esquineras metálicas de latón con remaches
        ctx.fillStyle = '#F59E0B';
        const dibujarRemache = (rx, ry) => {
            ctx.beginPath();
            ctx.arc(rx, ry, 2, 0, Math.PI * 2);
            ctx.fill();
        };
        dibujarRemache(x, y + 2);
        dibujarRemache(x + w, y + 2);
        dibujarRemache(x, y + h + 2);
        dibujarRemache(x + w, y + h + 2);

        // Sustrato de tierra fértil según humedad
        const factorHumedad = p.estado === 'CRECIENDO' ? p.agua : (p.estado === 'FLORECIDA' ? 0.8 : 0.15);
        const gradTierra = ctx.createLinearGradient(0, y, 0, y + h);
        if (factorHumedad >= this.LIMITE_HUMEDA) {
            // Tierra muy nutrida y oscura (húmeda)
            gradTierra.addColorStop(0, '#5A3618');
            gradTierra.addColorStop(1, '#381D08');
        } else if (factorHumedad >= this.LIMITE_SED) {
            // Humedad equilibrada
            gradTierra.addColorStop(0, '#8C5A2B');
            gradTierra.addColorStop(1, '#5C3817');
        } else {
            // Tierra seca agrietada y sedienta
            gradTierra.addColorStop(0, '#D4A373');
            gradTierra.addColorStop(1, '#A97445');
        }

        ctx.fillStyle = hover ? this.mezclarColor('#E2D4BC', '#5A3618', 0.8) : gradTierra;
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, 10);
        ctx.fill();

        ctx.strokeStyle = '#1E293B';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Textura orgánica de tierra y surcos
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.lineWidth = 2;
        for (let i = 1; i <= 2; i++) {
            const ly = y + (h * i) / 3;
            ctx.beginPath();
            ctx.moveTo(x + 12, ly);
            ctx.lineTo(x + w - 12, ly);
            ctx.stroke();
        }

        // Grietas en la tierra si está muy seca
        if (factorHumedad < this.LIMITE_SED) {
            ctx.strokeStyle = '#5A3618';
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.moveTo(x + 22, y + 14);
            ctx.lineTo(x + 32, y + 24);
            ctx.lineTo(x + 28, y + 36);
            ctx.moveTo(x + w - 28, y + h - 16);
            ctx.lineTo(x + w - 38, y + h - 26);
            ctx.lineTo(x + w - 32, y + h - 36);
            ctx.stroke();
        }

        // Dibujar el vegetal o cultivo según su estado
        const cx = x + w / 2;
        const baseY = y + h * 0.7;

        if (p.estado === 'CRECIENDO') {
            this.dibujarPlanta(ctx, cx, baseY, p.crecimiento, false, null);
        } else if (p.estado === 'FLORECIDA') {
            this.dibujarPlanta(ctx, cx, baseY, 1.0, false, p.colorFlor);
        } else if (p.estado === 'SECA') {
            this.dibujarPlanta(ctx, cx, baseY, 0.7, true, null);
        }

        // Dibujar basura si está presente
        if (p.basura) {
            const bx = cx + (p.estado === 'VACIA' ? 0 : 38);
            const by = y + h - 20;
            this.dibujarBasura(ctx, bx, by, p.tipoBasura);
        }

        // Alerta pulsante de sed (gota roja de agua)
        if (p.estado === 'CRECIENDO' && p.agua < this.LIMITE_SED) {
            const pulso = 1 + Math.sin(this.relojTotal * 8) * 0.12;
            const gotaX = cx + 46;
            const gotaY = y + 22;

            // Burbuja circular blanca con sombra
            ctx.fillStyle = '#FFFFFF';
            ctx.strokeStyle = '#1E293B';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(gotaX, gotaY, 15 * pulso, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Gota roja
            this.dibujarFormaGota(ctx, gotaX, gotaY + 2, 7 * pulso, '#EF4444', '#1E293B');
        }

        // Animación de riego (regadera inclinada y gotas de agua cayendo)
        if (p.riegoAnim > 0) {
            ctx.save();
            ctx.translate(cx - 30, y - 6);
            ctx.rotate(0.38);
            this.dibujarIconoRegadera(ctx, 0, 0, 0.7);
            ctx.restore();

            // Gotitas de agua cayendo sobre la tierra
            ctx.fillStyle = '#38BDF8';
            ctx.strokeStyle = '#0284C7';
            ctx.lineWidth = 1.2;
            for (let i = 0; i < 5; i++) {
                const avance = (p.riegoAnim * 3.5 + i * 0.22) % 1;
                const gx = cx - 14 + i * 8;
                const gy = y + 10 + avance * 38;
                ctx.beginPath();
                ctx.arc(gx, gy, 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            }
        }
    }

    dibujarPlanta(ctx, cx, base, crecimiento, esSeca, colorFlor) {
        ctx.save();
        const colorTallo = esSeca ? '#78350F' : '#15803D';
        const colorHoja = esSeca ? '#A16207' : '#22C55E';

        // Montículo de tierra en la raíz
        ctx.fillStyle = '#451A03';
        ctx.beginPath();
        ctx.ellipse(cx, base, 16, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Semilla inicial recién germinada
        if (crecimiento < 0.2 && !esSeca) {
            ctx.fillStyle = '#4ADE80';
            ctx.strokeStyle = '#2A2340';
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.arc(cx, base - 6, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
            return;
        }

        // Tallo principal
        const altura = 16 + 40 * Math.min(1, crecimiento);
        const caida = esSeca ? 15 : 0;

        ctx.strokeStyle = '#2A2340';
        ctx.lineWidth = 5.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(cx, base);
        ctx.quadraticCurveTo(cx + caida * 0.3, base - altura * 0.6, cx + caida, base - altura);
        ctx.stroke();

        ctx.strokeStyle = colorTallo;
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(cx, base);
        ctx.quadraticCurveTo(cx + caida * 0.3, base - altura * 0.6, cx + caida, base - altura);
        ctx.stroke();

        // Hojas laterales
        const tamHoja = 8 + 8 * Math.min(1, crecimiento);
        this.dibujarHoja(ctx, cx, base - altura * 0.4, -tamHoja, colorHoja, esSeca);
        this.dibujarHoja(ctx, cx, base - altura * 0.5, tamHoja, colorHoja, esSeca);

        if (crecimiento > 0.6) {
            this.dibujarHoja(ctx, cx + caida * 0.4, base - altura * 0.78, -tamHoja * 0.85, colorHoja, esSeca);
            this.dibujarHoja(ctx, cx + caida * 0.4, base - altura * 0.82, tamHoja * 0.85, colorHoja, esSeca);
        }

        // Flor en la cúspide si está florecida
        if (colorFlor) {
            const fx = cx + caida;
            const fy = base - altura - 4;

            // 6 pétalos circulares
            ctx.fillStyle = colorFlor;
            ctx.strokeStyle = '#2A2340';
            ctx.lineWidth = 1.6;

            for (let i = 0; i < 6; i++) {
                const ang = (i * Math.PI) / 3 + this.relojTotal * 0.5;
                const px = fx + Math.cos(ang) * 9;
                const py = fy + Math.sin(ang) * 9;
                ctx.beginPath();
                ctx.arc(px, py, 6, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            }

            // Centro / pistilo dorado
            ctx.fillStyle = '#F59E0B';
            ctx.beginPath();
            ctx.arc(fx, fy, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }

        ctx.restore();
    }

    dibujarHoja(ctx, x, y, direccion, color, esSeca) {
        ctx.save();
        ctx.translate(x, y);
        ctx.fillStyle = color;
        ctx.strokeStyle = '#2A2340';
        ctx.lineWidth = 1.6;

        ctx.beginPath();
        const inclinacion = esSeca ? 8 : -6;
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(direccion * 0.6, inclinacion, direccion, 0);
        ctx.quadraticCurveTo(direccion * 0.6, -inclinacion * 0.5, 0, 0);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }

    dibujarBasura(ctx, x, y, tipo) {
        ctx.save();
        if (tipo === 0) {
            // Botella de plástico transparente/azul
            ctx.translate(x, y);
            ctx.rotate(0.5);
            ctx.fillStyle = '#BAE6FD';
            ctx.strokeStyle = '#2A2340';
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.roundRect(-7, -14, 14, 28, 4);
            ctx.fill();
            ctx.stroke();
            // Tapa azul
            ctx.fillStyle = '#0284C7';
            ctx.fillRect(-4, -18, 8, 4);
        } else if (tipo === 1) {
            // Papel arrugado blanco
            ctx.fillStyle = '#F8FAFC';
            ctx.strokeStyle = '#2A2340';
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.arc(x, y, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.strokeStyle = '#94A3B8';
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.moveTo(x - 5, y - 4);
            ctx.lineTo(x + 5, y + 4);
            ctx.moveTo(x - 2, y + 5);
            ctx.lineTo(x + 3, y - 5);
            ctx.stroke();
        } else {
            // Bolsa plástica
            ctx.fillStyle = '#E2E8F0';
            ctx.strokeStyle = '#2A2340';
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.roundRect(x - 11, y - 9, 22, 18, 5);
            ctx.fill();
            ctx.stroke();
            // Asas
            ctx.beginPath();
            ctx.arc(x - 5, y - 11, 4, Math.PI, 0);
            ctx.arc(x + 5, y - 11, 4, Math.PI, 0);
            ctx.stroke();
        }
        ctx.restore();
    }

    dibujarFaunaBiohuerto(ctx) {
        // 1. Mariposas revoloteando
        this.mariposas.forEach(m => {
            ctx.save();
            ctx.translate(m.x, m.y);
            const aleteo = Math.abs(Math.sin(this.relojTotal * 12 + m.fase));
            ctx.scale(0.35 + aleteo * 0.65, 1);

            // Alas coloridas
            ctx.fillStyle = m.color;
            ctx.strokeStyle = '#2A2340';
            ctx.lineWidth = 1.5;

            ctx.beginPath();
            ctx.ellipse(-10, -8, 11, 9, 0, 0, Math.PI * 2);
            ctx.ellipse(10, -8, 11, 9, 0, 0, Math.PI * 2);
            ctx.ellipse(-8, 3, 8, 6, 0, 0, Math.PI * 2);
            ctx.ellipse(8, 3, 8, 6, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Cuerpo negro
            ctx.fillStyle = '#2A2340';
            ctx.beginPath();
            ctx.roundRect(-2, -10, 4, 18, 2);
            ctx.fill();
            ctx.restore();
        });

        // 2. Abejita zumbando sobre parcelas florecidas
        this.parcelas.forEach(p => {
            if (p.estado === 'FLORECIDA') {
                const ax = p.x + p.w / 2 + Math.cos(this.relojTotal * 4 + p.indice) * 22;
                const ay = p.y + 12 + Math.sin(this.relojTotal * 6 + p.indice) * 7;

                // Cuerpo amarillo con rayas negras
                ctx.fillStyle = '#FBBF24';
                ctx.strokeStyle = '#2A2340';
                ctx.lineWidth = 1.4;
                ctx.beginPath();
                ctx.ellipse(ax, ay, 7, 5, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                // Rayitas negras
                ctx.fillStyle = '#2A2340';
                ctx.fillRect(ax - 2, ay - 4, 2, 8);
                ctx.fillRect(ax + 2, ay - 4, 2, 8);

                // Alitas blancas transparentes
                ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
                ctx.beginPath();
                ctx.ellipse(ax - 2, ay - 7, 4, 3, 0, 0, Math.PI * 2);
                ctx.ellipse(ax + 2, ay - 7, 4, 3, 0, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    }

    dibujarBarraHerramientas(ctx) {
        const boxX = 175;
        const boxY = 114;
        const boxW = 650;
        const boxH = 96;

        ctx.save();
        // Contenedor general superior con estilo tablero de madera y cartel escolar
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxW, boxH, 16);
        ctx.fill();
        ctx.strokeStyle = '#2A2340';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Franja de encabezado superior con instrucciones claras
        ctx.fillStyle = '#2A2340';
        ctx.font = '900 11.5px "Segoe UI", system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('HERRAMIENTAS: HAZ CLIC EN EL BOTÓN O USA LAS TECLAS [1], [2] O [3]', boxX + boxW / 2, boxY + 16);

        this.botonesHerramientas.forEach(btn => {
            const activa = btn.id === this.herramientaActual;
            const hover = this.puntoEnRect(this.ratonX, this.ratonY, btn);

            ctx.save();
            if (activa) {
                ctx.shadowColor = btn.color;
                ctx.shadowBlur = 10;
            }

            let fondoBtn = '#F8FAFC';
            let bordeBtn = '#CBD5E1';
            let textoBtn = '#334155';

            if (activa) {
                if (btn.id === 'SEMILLA') { fondoBtn = '#DCFCE7'; bordeBtn = '#16A34A'; textoBtn = '#14532D'; }
                else if (btn.id === 'REGADERA') { fondoBtn = '#E0F2FE'; bordeBtn = '#0284C7'; textoBtn = '#0C4A6E'; }
                else { fondoBtn = '#FEF3C7'; bordeBtn = '#D97706'; textoBtn = '#78350F'; }
            } else if (hover) {
                fondoBtn = '#F1F5F9';
                bordeBtn = '#94A3B8';
            }

            // Cuerpo del botón
            ctx.fillStyle = fondoBtn;
            ctx.beginPath();
            ctx.roundRect(btn.x, btn.y, btn.w, btn.h, 12);
            ctx.fill();

            ctx.strokeStyle = bordeBtn;
            ctx.lineWidth = activa ? 3.5 : 2;
            ctx.stroke();

            // Etiqueta de la tecla de atajo rápida
            ctx.fillStyle = activa ? bordeBtn : '#64748B';
            ctx.beginPath();
            ctx.roundRect(btn.x + 8, btn.y + 11, 32, 32, 8);
            ctx.fill();

            ctx.fillStyle = '#FFFFFF';
            ctx.font = '900 15px "Segoe UI", system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(btn.tecla, btn.x + 24, btn.y + 27);

            // Icono vectorial de la herramienta
            const icX = btn.x + 58;
            const icY = btn.y + btn.h / 2;
            if (btn.id === 'SEMILLA') {
                this.dibujarIconoSemilla(ctx, icX, icY, 0.65);
            } else if (btn.id === 'REGADERA') {
                this.dibujarIconoRegadera(ctx, icX, icY, 0.65);
            } else {
                this.dibujarIconoRecoger(ctx, icX, icY, 0.65);
            }

            // Textos informativos dentro del botón
            ctx.fillStyle = textoBtn;
            ctx.font = '900 14px "Segoe UI", system-ui, sans-serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(btn.nombre, btn.x + 82, btn.y + 20);

            ctx.font = '700 11px "Segoe UI", system-ui, sans-serif';
            ctx.fillStyle = activa ? textoBtn : '#64748B';
            ctx.fillText(btn.subtitulo || btn.desc, btn.x + 82, btn.y + 36);

            // Badge de "ACTIVA" si está seleccionada
            if (activa) {
                ctx.fillStyle = bordeBtn;
                ctx.beginPath();
                ctx.roundRect(btn.x + btn.w - 22, btn.y + 6, 16, 16, 8);
                ctx.fill();
                ctx.fillStyle = '#FFFFFF';
                ctx.font = '900 10px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('✓', btn.x + btn.w - 14, btn.y + 14);
            }

            ctx.restore();
        });

        ctx.restore();
    }

    dibujarCursorHerramienta(ctx) {
        if (this.estado !== 'JUGANDO') return;
        const sobreParcela = this.parcelas.some(p => this.puntoEnRect(this.ratonX, this.ratonY, p));
        if (!sobreParcela) return;

        const cx = this.ratonX + 18;
        const cy = this.ratonY + 18;

        // Círculo blanco de fondo
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#2A2340';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(cx, cy, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Icono de la herramienta actual
        if (this.herramientaActual === 'SEMILLA') {
            this.dibujarIconoSemilla(ctx, cx, cy, 0.55);
        } else if (this.herramientaActual === 'REGADERA') {
            this.dibujarIconoRegadera(ctx, cx, cy, 0.55);
        } else {
            this.dibujarIconoRecoger(ctx, cx, cy, 0.55);
        }
    }

    dibujarIconoSemilla(ctx, cx, cy, s) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(s, s);

        // Bolsa de semillas marrón
        ctx.fillStyle = '#D97706';
        ctx.strokeStyle = '#2A2340';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(-16, -18, 32, 36, 6);
        ctx.fill();
        ctx.stroke();

        // Brote verde en la bolsa
        ctx.fillStyle = '#4ADE80';
        ctx.beginPath();
        ctx.ellipse(0, 0, 7, 10, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    dibujarIconoRegadera(ctx, cx, cy, s) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(s, s);

        // Pico vertedor
        ctx.fillStyle = '#0284C7';
        ctx.strokeStyle = '#2A2340';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(8, -2);
        ctx.lineTo(24, -14);
        ctx.lineTo(26, -10);
        ctx.lineTo(10, 6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Cuerpo de la regadera
        ctx.beginPath();
        ctx.roundRect(-16, -8, 26, 24, 6);
        ctx.fill();
        ctx.stroke();

        // Asa
        ctx.strokeStyle = '#2A2340';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(-16, 4, 12, Math.PI * 0.5, Math.PI * 1.5);
        ctx.stroke();

        ctx.restore();
    }

    dibujarIconoRecoger(ctx, cx, cy, s) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(s, s);

        // Bolsa ecológica verde
        ctx.fillStyle = '#15803D';
        ctx.strokeStyle = '#2A2340';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(-14, -10, 28, 28, 6);
        ctx.fill();
        ctx.stroke();

        // Asas
        ctx.beginPath();
        ctx.arc(0, -10, 8, Math.PI, 0);
        ctx.stroke();

        // Símbolo de reciclaje o brote blanco
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(0, 4, 5, 0, Math.PI * 2);
        ctx.fill();

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

