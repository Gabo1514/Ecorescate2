/**
 * Operación EcoRescate - Minijuego 2: Guardián del Agua
 * Misión en los lavaderos del colegio: cerrar caños que quedaron abiertos, los que gotean
 * y los de niños que se cepillan o se enjabonan con el agua corriendo.
 * ¡Dejar abierto el caño de quien se está enjuagando!
 * Incluye tanque de agua animado con olas, espejos con destellos, niños con animaciones
 * de cepillado, enjabonado (burbujas) y enjuague, gotas de agua y partículas de salpicadura.
 */

class GuardianAgua extends MinijuegoBase {
    constructor(canvas, tipoJuegoId = 'AGUA') {
        super(canvas, tipoJuegoId);

        this.MESA_Y = 418;
        this.PISO_NINO_Y = 556;
        this.ESCALA_NINO = 1.9;

        // 4 lavaderos en línea
        this.lavaderos = [
            this.crearLavadero(150),
            this.crearLavadero(336),
            this.crearLavadero(522),
            this.crearLavadero(708)
        ];

        this.gotas = [];
        this.proximoEvento = 1.0;
        this.litrosAhorrados = 0;

        // Novedades mostradas una sola vez
        this.vioEnjabona = false;
        this.vioGoteo = false;
        this.vioEnjuaga = false;
    }

    crearLavadero(cx) {
        return {
            cx,
            zona: { x: cx - 85, y: 320, w: 170, h: 240 },
            abierto: false,
            goteo: false,
            avisado: false,
            interrumpido: false,
            actividad: 'NADA', // 'NADA', 'CEPILLA', 'ENJABONA', 'ENJUAGA'
            tiempoActividad: 0,
            tiempoAbierto: 0,
            aparicion: 0,
            salida: 0,
            gracias: 0,
            cerroSolo: 0,
            giroManija: 0,
            aguaNivel: 0,
            proximaGota: 0,
            ninoColorPolo: '#EB5757',
            ninoColorPelo: '#5B3A1E',
            ninoColorPiel: '#F5C9A0'
        };
    }

    usaCorazones() {
        return false; // usa el tanque de agua
    }

    motivoDerrota() {
        return '¡El tanque de agua del colegio se quedó vacío!';
    }

    pista() {
        for (const l of this.lavaderos) {
            if (l.actividad === 'ENJUAGA' && l.abierto) {
                return ['¡Alguien se está enjuagando!', 'Para enjuagarse sí necesita el agua. ¡Espera a que termine!'];
            }
        }
        if (this.nivelNumero === 1) {
            return ['¡Cierra el agua que nadie aprovecha!', 'Haz clic en el caño. Si alguien se cepilla, el caño también debe cerrarse.'];
        }
        return ['Observa qué hace cada niño', 'Cepillarse o enjabonarse no necesita el caño abierto. Ciérralo a tiempo.'];
    }

    resumenPie() {
        return ['AHORRADO', `${Math.round(this.litrosAhorrados)} Litros`];
    }

    reiniciar() {
        this.lavaderos = [
            this.crearLavadero(150),
            this.crearLavadero(336),
            this.crearLavadero(522),
            this.crearLavadero(708)
        ];
        this.gotas = [];
        this.proximoEvento = 1.0;
        this.litrosAhorrados = 0;
        this.medidor = 1.0; // tanque lleno al 100%
        this.vioEnjabona = false;
        this.vioGoteo = false;
        this.vioEnjuaga = false;
    }

    nuevoEvento() {
        const libres = this.lavaderos.filter(l => !l.abierto && l.actividad === 'NADA' && l.salida <= 0);
        if (libres.length === 0) return;

        const l = libres[Math.floor(Math.random() * libres.length)];
        const opciones = ['abandonado', 'cepilla'];

        if (this.nivelNumero >= 2) opciones.push('enjabona');
        if (this.nivelNumero >= 3) opciones.push('goteo');
        if (this.nivelNumero >= 4) {
            opciones.push('enjuaga', 'enjuaga');
        }

        // Frecuencia según los retos del nivel
        if (this.progresoRetos['ABANDONADO'] !== undefined) opciones.push('abandonado');
        if (this.progresoRetos['CEPILLA'] !== undefined) opciones.push('cepilla');
        if (this.progresoRetos['ENJABONA'] !== undefined) opciones.push('enjabona');
        if (this.progresoRetos['GOTEO'] !== undefined) opciones.push('goteo');
        if (this.progresoRetos['RESPETA'] !== undefined) opciones.push('enjuaga');

        const evento = opciones[Math.floor(Math.random() * opciones.length)];

        l.abierto = true;
        l.goteo = false;
        l.tiempoAbierto = 0;
        l.avisado = false;
        l.interrumpido = false;

        const duracion = Math.max(4.5, 8.5 - (this.nivelNumero - 1) * 0.35);

        if (evento === 'cepilla') {
            this.ponerNino(l, 'CEPILLA', duracion);
        } else if (evento === 'enjabona') {
            this.ponerNino(l, 'ENJABONA', duracion);
            if (!this.vioEnjabona) {
                this.vioEnjabona = true;
                this.mensajeToast = { texto: 'Nuevo: ¡alguien se enjabona con el caño abierto! Ciérralo.', esError: false, tiempo: 3.5 };
            }
        } else if (evento === 'goteo') {
            l.goteo = true;
            if (!this.vioGoteo) {
                this.vioGoteo = true;
                this.mensajeToast = { texto: 'Nuevo: ¡un caño gotea! Gota a gota se pierde agua.', esError: false, tiempo: 3.5 };
            }
        } else if (evento === 'enjuaga') {
            this.ponerNino(l, 'ENJUAGA', 3.0 + Math.random() * 1.2);
            if (!this.vioEnjuaga) {
                this.vioEnjuaga = true;
                this.mensajeToast = { texto: 'Nuevo: alguien se enjuaga las manos. ¡Ahí sí necesita el agua!', esError: false, tiempo: 3.5 };
            }
        }
    }

    ponerNino(l, actividad, duracion) {
        l.actividad = actividad;
        l.tiempoActividad = duracion;
        l.aparicion = 0;
        l.salida = 0;
        l.gracias = 0;
        l.interrumpido = false;

        const polos = ['#EB5757', '#56CCF2', '#6FCF97', '#FFD84D', '#BB6BD9', '#F2994A'];
        const pelos = ['#5B3A1E', '#2A2340', '#7A4A24', '#1E1E1E'];
        const pieles = ['#F5C9A0', '#E0AC7E', '#C68A5E', '#F2D0B0'];

        l.ninoColorPolo = polos[Math.floor(Math.random() * polos.length)];
        l.ninoColorPelo = pelos[Math.floor(Math.random() * pelos.length)];
        l.ninoColorPiel = pieles[Math.floor(Math.random() * pieles.length)];
    }

    retirarNino(l) {
        l.actividad = 'NADA';
        l.salida = 0.45;
    }

    actualizar(dt) {
        this.proximoEvento -= dt;
        if (this.proximoEvento <= 0) {
            this.nuevoEvento();
            if (this.nivelNumero >= 6 && Math.random() < 0.45) {
                this.nuevoEvento(); // Hora punta: dos caños activos
            }
            const intervalo = Math.max(1.3, 3.4 - (this.nivelNumero - 1) * 0.22);
            this.proximoEvento = intervalo * (0.85 + Math.random() * 0.3);
        }

        const ritmo = 0.9 + (this.nivelNumero - 1) * 0.08;

        for (const l of this.lavaderos) {
            if (l.giroManija > 0) l.giroManija = Math.max(0, l.giroManija - dt * 3.5);
            l.aparicion = Math.min(1, l.aparicion + dt * 3.2);
            if (l.salida > 0) l.salida = Math.max(0, l.salida - dt);
            if (l.cerroSolo > 0) l.cerroSolo = Math.max(0, l.cerroSolo - dt);

            if (l.gracias > 0) {
                l.gracias -= dt;
                if (l.gracias <= 0) this.retirarNino(l);
            }

            if (l.actividad !== 'NADA' && l.gracias <= 0) {
                l.tiempoActividad -= dt;
                if (l.tiempoActividad <= 0) {
                    this.terminarActividadNino(l);
                }
            }

            // Consumo y desperdicio de agua del tanque
            if (l.abierto) {
                l.tiempoAbierto += dt;
                const desperdicia = l.actividad !== 'ENJUAGA';

                if (desperdicia) {
                    const drenaje = (l.goteo ? 0.007 : 0.022) * ritmo * dt;
                    this.medidor = Math.max(0, this.medidor - drenaje);
                } else {
                    // Uso legítimo de enjuague
                    this.medidor = Math.max(0, this.medidor - 0.0035 * dt);
                }

                l.aguaNivel = Math.min(1, l.aguaNivel + dt * (l.goteo ? 0.06 : 0.22));

                if (l.goteo) {
                    l.proximaGota -= dt;
                    if (l.proximaGota <= 0) {
                        this.gotas.push({ x: l.cx, y: 380, vy: 40, limite: this.MESA_Y });
                        l.proximaGota = 0.45;
                    }
                }

                // Aviso si lleva demasiado tiempo abierto sin nadie
                if (!l.avisado && l.actividad === 'NADA' && l.tiempoAbierto > 6.0) {
                    l.avisado = true;
                    this.registrarError('¡Caño abandonado! Se está perdiendo mucha agua potable.', 0.08);
                }
            } else {
                l.aguaNivel = Math.max(0, l.aguaNivel - dt * 0.35);
            }
        }

        // Simulación física de gotas de goteo
        for (let i = this.gotas.length - 1; i >= 0; i--) {
            const g = this.gotas[i];
            g.vy += 800 * dt;
            g.y += g.vy * dt;
            if (g.y >= g.limite) {
                this.crearChispas(g.x, g.limite, '#56CCF2', 3);
                this.gotas.splice(i, 1);
            }
        }
    }

    terminarActividadNino(l) {
        if (l.actividad === 'ENJUAGA') {
            if (!l.interrumpido) {
                // El alumno respetó el enjuague
                if (this.progresoRetos['RESPETA'] !== undefined) {
                    this.progresoRetos['RESPETA']++;
                }
                this.puntaje += 10;
                window.audioEco.estrella();
                this.mensajeToast = { texto: '¡Bien! Esperaste a que terminara de enjuagarse.', esError: false, tiempo: 2.2 };
            }

            // El niño puede cerrar el caño al terminar (60% de las veces)
            if (Math.random() < 0.6) {
                l.abierto = false;
                l.giroManija = 1;
                l.cerroSolo = 1.8;
                window.audioEco.clic();
            }
            l.tiempoAbierto = 0;
            this.retirarNino(l);
        } else {
            // El niño terminó de cepillarse o enjabonarse con el caño abierto todo el tiempo
            this.registrarError(
                `¡Desperdicio! Se ${l.actividad === 'CEPILLA' ? 'cepilló' : 'enjabonó'} con el caño abierto todo el tiempo. ¡Ciérralo mientras lo hace!`,
                0.12
            );
            l.tiempoAbierto = 0;
            l.avisado = true;
            this.retirarNino(l);
        }
    }

    lavaderoEn(x, y) {
        for (const l of this.lavaderos) {
            const z = l.zona;
            if (x >= z.x && x <= z.x + z.w && y >= z.y && y <= z.y + z.h) {
                return l;
            }
        }
        return null;
    }

    alPresionar(x, y) {
        const l = this.lavaderoEn(x, y);
        if (!l) return;

        if (!l.abierto) {
            this.mensajeToast = { texto: 'Este caño ya está bien cerrado.', esError: false, tiempo: 1.5 };
            return;
        }

        // Si se está enjuagando, cerrarlo es un error educativo
        if (l.actividad === 'ENJUAGA' && l.gracias <= 0) {
            l.interrumpido = true;
            this.registrarError('¡Se está enjuagando! Para enjuagarse sí necesita agua. Espera a que termine.', 0.15);
            return;
        }

        // Acierto al cerrar caño que desperdicia
        const situacion = l.actividad === 'CEPILLA' ? 'CEPILLA' :
            (l.actividad === 'ENJABONA' ? 'ENJABONA' : (l.goteo ? 'GOTEO' : 'ABANDONADO'));

        if (this.progresoRetos[situacion] !== undefined) this.progresoRetos[situacion]++;
        if (this.progresoRetos['CERRADOS'] !== undefined) this.progresoRetos['CERRADOS']++;
        if (this.progresoRetos['LITROS'] !== undefined) this.progresoRetos['LITROS'] += 6;

        l.abierto = false;
        l.goteo = false;
        l.giroManija = 1;
        this.medidor = Math.min(1.0, this.medidor + 0.04);
        this.litrosAhorrados += 6;

        this.registrarAcierto(null, 1, 10, l.cx, 340, '¡AGUA SALVADA!');
        this.crearChispas(l.cx, 370, '#56CCF2', 16);

        if (l.actividad === 'CEPILLA') {
            l.gracias = 1.2;
            this.mensajeToast = { texto: '¡Excelente! Cerraste el caño mientras se cepillaba los dientes (+6 L).', esError: false, tiempo: 2.5 };
        } else if (l.actividad === 'ENJABONA') {
            l.gracias = 1.2;
            this.mensajeToast = { texto: '¡Muy bien! Mientras se enjabona no necesita agua corriendo (+6 L).', esError: false, tiempo: 2.5 };
        } else if (situacion === 'GOTEO') {
            this.mensajeToast = { texto: '¡Goteo detenido! Evitaste que se pierdan hasta 30 litros al día.', esError: false, tiempo: 2.5 };
        } else {
            this.mensajeToast = { texto: '¡Caño cerrado! Salvaste 6 litros de agua que se iban por el desagüe.', esError: false, tiempo: 2.5 };
        }
    }

    // Dibujar escena completa de los Lavaderos
    dibujarEscena(ctx) {
        // Pared de mayólicas de baño escolar con gradiente e iluminación
        const gradPared = ctx.createLinearGradient(0, this.ESC_Y, 0, 500);
        gradPared.addColorStop(0, '#E0F2FE');
        gradPared.addColorStop(0.5, '#BAE6FD');
        gradPared.addColorStop(1, '#7DD3FC');
        ctx.fillStyle = gradPared;
        ctx.fillRect(this.ESC_X, this.ESC_Y, this.ESC_W, this.ESC_H);

        // Cuadrícula de azulejos cerámicos con reflejo especular
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1.6;
        for (let x = this.ESC_X; x < 812; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, this.ESC_Y);
            ctx.lineTo(x, 500);
            ctx.stroke();
        }
        for (let y = this.ESC_Y + 10; y < 500; y += 40) {
            ctx.beginPath();
            ctx.moveTo(this.ESC_X, y);
            ctx.lineTo(812, y);
            ctx.stroke();
        }

        // Franja de azulejos de acento azul marino
        ctx.fillStyle = '#0284C7';
        ctx.fillRect(this.ESC_X, 160, 790, 8);

        // Suelo de baldosas con perspectiva
        const gradPiso = ctx.createLinearGradient(0, 500, 0, this.ESC_ABA);
        gradPiso.addColorStop(0, '#94A3B8');
        gradPiso.addColorStop(1, '#64748B');
        ctx.fillStyle = gradPiso;
        ctx.fillRect(this.ESC_X, 500, this.ESC_W, this.ESC_ABA - 500);

        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.8;
        for (let x = this.ESC_X; x < this.ESC_DER; x += 70) {
            ctx.beginPath();
            ctx.moveTo(x, 500);
            ctx.lineTo(x - 30, this.ESC_ABA);
            ctx.stroke();
        }

        // Espejos sobre los lavaderos con destellos
        for (let i = 0; i < 4; i++) {
            const cx = 150 + i * 186;
            this.dibujarEspejo(ctx, cx, 192);

            // Dispensadores de jabón líquido entre lavaderos
            if (cx < 700) {
                this.dibujarDispensador(ctx, cx + 93, 300);
            }
        }

        // Letrero educativo en la pared
        this.dibujarLetrero(ctx, 300, 136, 236, 34);

        // Mueble inferior de mayólica y mesada
        this.dibujarMesada(ctx);

        // Maceta con planta verde que se mece
        this.dibujarPlantita(ctx, 792, this.MESA_Y);

        // Tanque de agua a la derecha
        this.dibujarTanque(ctx);

        // Lavaderos, caños, chorro de agua y gotas
        this.lavaderos.forEach(l => this.dibujarLavadero(ctx, l));

        // Gotas en el aire
        ctx.fillStyle = '#3BA3D9';
        for (const g of this.gotas) {
            this.dibujarFormaGota(ctx, g.x, g.y, 6);
        }

        // Niños en los lavaderos
        this.lavaderos.forEach(l => this.dibujarNino(ctx, l));
    }

    dibujarEspejo(ctx, cx, cy) {
        ctx.save();
        // Marco de madera/cromo elegante con bisel
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#1E293B';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(cx - 46, cy - 2, 92, 112, 14);
        ctx.fill();
        ctx.stroke();

        // Vidrio con reflejo cielo
        const gradEspejo = ctx.createLinearGradient(cx - 42, cy, cx + 42, cy + 108);
        gradEspejo.addColorStop(0, '#F0F9FF');
        gradEspejo.addColorStop(0.5, '#E0F2FE');
        gradEspejo.addColorStop(1, '#BAE6FD');
        ctx.fillStyle = gradEspejo;
        ctx.beginPath();
        ctx.roundRect(cx - 42, cy + 2, 84, 104, 10);
        ctx.fill();

        // Reflejos blancos diagonales
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(cx - 26, cy + 34);
        ctx.lineTo(cx - 8, cy + 16);
        ctx.moveTo(cx - 26, cy + 56);
        ctx.lineTo(cx + 8, cy + 22);
        ctx.stroke();

        // Destello brillante móvil en el espejo
        const brillo = (this.relojTotal * 0.45 + cx * 0.01) % 3;
        if (brillo < 1) {
            const bx = cx - 30 + brillo * 60;
            const by = cy + 18 + brillo * 70;
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.sin(brillo * Math.PI) * 0.9})`;
            this.dibujarEstrellaForma(ctx, bx, by, 7, '#FFFFFF');
        }
        ctx.restore();
    }

    dibujarDispensador(ctx, x, y) {
        ctx.fillStyle = '#F472B6';
        ctx.strokeStyle = '#1E293B';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(x - 12, y, 24, 36, 8);
        ctx.fill();
        ctx.stroke();

        // Cabezal dosificador cromado
        ctx.fillStyle = '#E2E8F0';
        ctx.beginPath();
        ctx.roundRect(x - 4, y - 10, 8, 12, 3);
        ctx.fill();
        ctx.stroke();
    }

    dibujarLetrero(ctx, x, y, w, h) {
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#1E293B';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, 17);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#0284C7';
        this.dibujarFormaGota(ctx, x + 26, y + 17, 8);

        ctx.fillStyle = '#0F172A';
        ctx.font = '900 14px "Segoe UI", system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText('¡CADA GOTA CUENTA!', x + 44, y + 17);
    }

    dibujarMesada(ctx) {
        // Mueble bajo de lavabos con relieve
        const gradMueble = ctx.createLinearGradient(0, 436, 0, 502);
        gradMueble.addColorStop(0, '#94A3B8');
        gradMueble.addColorStop(1, '#64748B');
        ctx.fillStyle = gradMueble;
        ctx.strokeStyle = '#1E293B';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(36, 436, 772, 66, 8);
        ctx.fill();
        ctx.stroke();

        // Puertas del mueble con relieves
        for (let i = 0; i < 4; i++) {
            const cx = 150 + i * 186;
            ctx.fillStyle = '#CBD5E1';
            ctx.beginPath();
            ctx.roundRect(cx - 40, 446, 80, 48, 6);
            ctx.fill();
            ctx.stroke();

            // Tirador cromado
            ctx.fillStyle = '#0284C7';
            ctx.beginPath();
            ctx.arc(cx - 4, 470, 4, 0, Math.PI * 2);
            ctx.fill();
        }

        // Tablero blanco superior de la mesada con brillo
        const gradTablero = ctx.createLinearGradient(0, this.MESA_Y, 0, this.MESA_Y + 20);
        gradTablero.addColorStop(0, '#FFFFFF');
        gradTablero.addColorStop(1, '#E2E8F0');
        ctx.fillStyle = gradTablero;
        ctx.beginPath();
        ctx.roundRect(28, this.MESA_Y, 788, 20, 8);
        ctx.fill();
        ctx.stroke();
    }

    dibujarPlantita(ctx, x, y) {
        const viento = Math.sin(this.relojTotal * 2) * 2;
        // Maceta terracota
        ctx.fillStyle = '#EA580C';
        ctx.strokeStyle = '#1E293B';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x - 14, y - 24);
        ctx.lineTo(x + 14, y - 24);
        ctx.lineTo(x + 10, y);
        ctx.lineTo(x - 10, y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Hojas verdes
        ctx.fillStyle = '#16A34A';
        ctx.beginPath();
        ctx.ellipse(x - 8 + viento, y - 32, 10, 6, -0.4, 0, Math.PI * 2);
        ctx.ellipse(x + 8 + viento, y - 32, 10, 6, 0.4, 0, Math.PI * 2);
        ctx.ellipse(x + viento, y - 40, 6, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }

    dibujarLavadero(ctx, l) {
        const cx = l.cx;

        // Cuenco / poza del lavadero de porcelana
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#1E293B';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.ellipse(cx, this.MESA_Y + 3, 50, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Interior con profundidad radial
        const gradPoza = ctx.createRadialGradient(cx, this.MESA_Y + 3, 5, cx, this.MESA_Y + 3, 44);
        gradPoza.addColorStop(0, '#CBD5E1');
        gradPoza.addColorStop(0.7, '#E2E8F0');
        gradPoza.addColorStop(1, '#FFFFFF');
        ctx.fillStyle = gradPoza;
        ctx.beginPath();
        ctx.ellipse(cx, this.MESA_Y + 3, 42, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Desagüe cromado en el fondo
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.ellipse(cx, this.MESA_Y + 4, 6, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Agua acumulada en la poza
        if (l.aguaNivel > 0.02) {
            ctx.fillStyle = 'rgba(56, 189, 248, 0.75)';
            ctx.beginPath();
            ctx.ellipse(cx, this.MESA_Y + 3, 38 * l.aguaNivel, 6 * l.aguaNivel, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        // Grifo de metal cromado con gradiente metálico
        const gradCromo = ctx.createLinearGradient(cx + 18, 0, cx + 32, 0);
        gradCromo.addColorStop(0, '#94A3B8');
        gradCromo.addColorStop(0.35, '#FFFFFF');
        gradCromo.addColorStop(1, '#475569');

        ctx.fillStyle = gradCromo;
        ctx.strokeStyle = '#1E293B';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.roundRect(cx + 18, 358, 14, 64, 5);
        ctx.fill();
        ctx.stroke();

        // Brazo curvado del caño
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 10;
        ctx.lineCap = 'butt';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(cx + 25, 364);
        ctx.quadraticCurveTo(cx + 25, 350, cx + 12, 350);
        ctx.lineTo(cx + 6, 350);
        ctx.quadraticCurveTo(cx, 350, cx, 362);
        ctx.lineTo(cx, 374);
        ctx.stroke();

        // Contorno oscuro del caño
        ctx.strokeStyle = '#1E293B';
        ctx.lineWidth = 2.2;
        ctx.stroke();

        // Manija en cruz (roja si está abierta, azul si está cerrada)
        const mx = cx + 25, my = 344;
        ctx.save();
        ctx.translate(mx, my);
        ctx.rotate(l.giroManija * Math.PI * 0.75 + (l.abierto ? 0.6 : 0));

        const colorManija = l.abierto ? '#EF5A5A' : '#4C9BC9';
        ctx.strokeStyle = '#2A2340';
        ctx.lineWidth = 10;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-16, 0); ctx.lineTo(16, 0);
        ctx.moveTo(0, -10); ctx.lineTo(0, 10);
        ctx.stroke();

        ctx.strokeStyle = colorManija;
        ctx.lineWidth = 6;
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Chorro de agua que cae si el caño está abierto y no goteando
        if (l.abierto && !l.goteo) {
            const fondoY = l.actividad === 'ENJUAGA' ? 404 : this.MESA_Y + 2;
            ctx.fillStyle = 'rgba(59, 163, 217, 0.85)';
            ctx.strokeStyle = 'rgba(154, 218, 246, 0.9)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(cx - 5, 376);
            for (let yy = 376; yy <= fondoY; yy += 6) {
                ctx.lineTo(cx - 5 + Math.sin(this.relojTotal * 18 + yy * 0.25) * 1.5, yy);
            }
            for (let yy = fondoY; yy >= 376; yy -= 6) {
                ctx.lineTo(cx + 5 + Math.sin(this.relojTotal * 18 + yy * 0.25 + 1) * 1.5, yy);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Salpicaduras de agua en la base del chorro
            ctx.fillStyle = 'rgba(59, 163, 217, 0.9)';
            for (let i = 0; i < 5; i++) {
                const f = (this.relojTotal * 3 + i * 0.2) % 1;
                const sx = cx + Math.cos(i * 1.7) * 20 * f;
                const sy = fondoY - Math.sin(f * Math.PI) * 10;
                ctx.beginPath();
                ctx.arc(sx, sy, 2.5, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Aviso visual si el caño está abandonado o goteando
        if (l.abierto && l.actividad === 'NADA' && l.salida <= 0) {
            const pulso = 1 + Math.sin(this.relojTotal * 8) * 0.1;
            const bx = cx - 36, by = 336;

            ctx.fillStyle = l.tiempoAbierto > 4 ? '#FF6B6B' : '#FFD84D';
            ctx.strokeStyle = '#2A2340';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(bx, by, 15 * pulso, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#2A2340';
            ctx.font = 'bold 18px "Segoe UI", system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('!', bx, by);

            if (l.goteo) {
                this.dibujarPildora(ctx, 'GOTEA', cx, 302, '#1E5874', '#FFFFFF');
            }
        }

        if (l.cerroSolo > 0) {
            this.dibujarPildora(ctx, '✓ ¡Cerró el caño!', cx, 302, '#16A34A', '#FFFFFF');
        }
    }

    dibujarNino(ctx, l) {
        if (l.actividad === 'NADA' && l.salida <= 0) return;

        ctx.save();
        const alfa = l.actividad !== 'NADA' ? l.aparicion : l.salida / 0.45;
        ctx.globalAlpha = Math.max(0, Math.min(1, alfa));

        // Entran caminando desde la izquierda
        const recorrido = l.actividad !== 'NADA' ? 1 - l.aparicion : 1 - l.salida / 0.45;
        const nx = (l.cx - 46) - recorrido * 70;
        const paso = recorrido > 0.02 ? Math.sin(this.relojTotal * 14) * 6 : 0;
        const s = this.ESCALA_NINO;

        ctx.translate(nx, this.PISO_NINO_Y);

        // Movimiento de brazos según la actividad
        const mueve = Math.sin(this.relojTotal * 14);
        let bdx = 6, bdy = 13;
        if (l.actividad === 'CEPILLA') { bdx = 8 + mueve * 1.5; bdy = -15; }
        else if (l.actividad === 'ENJABONA') { bdx = 13 + mueve * 2; bdy = -1; }
        else if (l.actividad === 'ENJUAGA') { bdx = 17; bdy = -28 + mueve; }

        // Sombra
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(0, 0, 16 * s * 0.5, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Piernas
        ctx.fillStyle = '#2E3A59';
        ctx.strokeStyle = '#2A2340';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(-7, -24, 6, 24 + paso * 0.3, 3);
        ctx.roundRect(2, -24, 6, 24 - paso * 0.3, 3);
        ctx.fill();
        ctx.stroke();

        // Torso / Polo del niño
        ctx.fillStyle = l.ninoColorPolo;
        ctx.beginPath();
        ctx.roundRect(-9, -54, 20, 32, 6);
        ctx.fill();
        ctx.stroke();

        // Brazo trasero
        ctx.fillStyle = l.ninoColorPiel;
        ctx.beginPath();
        ctx.roundRect(-4, -50, 7, 20, 4);
        ctx.fill();
        ctx.stroke();

        // Cabeza
        ctx.fillStyle = l.ninoColorPiel;
        ctx.beginPath();
        ctx.arc(2, -70, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Pelo
        ctx.fillStyle = l.ninoColorPelo;
        ctx.beginPath();
        ctx.arc(2, -74, 15, Math.PI, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Ojo
        ctx.fillStyle = '#2A2340';
        ctx.beginPath();
        ctx.arc(8, -70, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Brazo delantero en acción
        ctx.fillStyle = l.ninoColorPiel;
        ctx.beginPath();
        ctx.roundRect(bdx - 2, -50 + bdy, 8, 20, 4);
        ctx.fill();
        ctx.stroke();

        // Accesorios de acción: Cepillo, Jabón o Espuma
        const manoX = bdx + 2, manoY = -40 + bdy;

        if (l.actividad === 'CEPILLA') {
            // Cepillo de dientes en mano
            ctx.save();
            ctx.translate(manoX, manoY);
            ctx.rotate(-0.5);
            ctx.fillStyle = '#4FC3F7';
            ctx.strokeStyle = '#2A2340';
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.roundRect(-3, -4, 24, 6, 3);
            ctx.fill();
            ctx.stroke();

            // Cerdas blancas con espuma
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.roundRect(16, -8, 8, 8, 2);
            ctx.fill();
            ctx.stroke();
            ctx.restore();

            // Espuma en la boca del niño
            ctx.fillStyle = '#FFFFFF';
            ctx.strokeStyle = '#2A2340';
            ctx.lineWidth = 1.2;
            for (let i = 0; i < 3; i++) {
                const r = 3 + i * 0.8;
                ctx.beginPath();
                ctx.arc(10 + i * 4, -62 + Math.sin(this.relojTotal * 6 + i) * 1.5, r, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            }
        } else if (l.actividad === 'ENJABONA') {
            // Burbujas de jabón flotando alrededor de las manos
            ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
            ctx.strokeStyle = '#2A2340';
            ctx.lineWidth = 1.2;
            for (let i = 0; i < 4; i++) {
                const ang = this.relojTotal * 2.5 + i * 1.5;
                const r = 3 + (i % 2) * 2;
                const bx = manoX + Math.cos(ang) * 12;
                const by = manoY + Math.sin(ang) * 8;
                ctx.beginPath();
                ctx.arc(bx, by, r, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            }
        }

        // Globo de diálogo sobre la cabeza del niño
        if (l.actividad !== 'NADA') {
            const bx = 4, by = -105;
            this.dibujarBurbujaAccion(ctx, bx, by, l.actividad, l.gracias > 0);
        }

        ctx.restore();
    }

    dibujarBurbujaAccion(ctx, x, y, actividad, gracias) {
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#2A2340';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        if (gracias) {
            // Corazón vectorial de agradecimiento
            this.dibujarCorazonForma(ctx, x, y - 2, 7, '#FF4D6D', '#2A2340');
        } else if (actividad === 'CEPILLA') {
            // Cepillo vectorial
            ctx.save();
            ctx.translate(x - 2, y + 2);
            ctx.rotate(-0.6);
            ctx.fillStyle = '#4FC3F7';
            ctx.strokeStyle = '#2A2340';
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.roundRect(-8, -2, 16, 4, 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.roundRect(4, -5, 5, 4, 1);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        } else if (actividad === 'ENJABONA') {
            // Pastilla de jabón con burbujas
            ctx.fillStyle = '#F8BBD0';
            ctx.strokeStyle = '#2A2340';
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.roundRect(x - 8, y - 4, 16, 9, 3);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(x + 2, y - 7, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        } else {
            // Gota de agua vectorial
            ctx.fillStyle = '#3BA3D9';
            this.dibujarFormaGota(ctx, x, y + 2, 6);
        }
    }

    dibujarTanque(ctx) {
        const x = 838, y = 200, w = 116, h = 290;

        // Estructura del tanque
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#2A2340';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, 28);
        ctx.fill();
        ctx.stroke();

        // Agua dentro del tanque con olas animadas
        const pct = Math.max(0, Math.min(1, this.medidor));
        const superficie = y + h - (h * pct);

        ctx.save();
        ctx.beginPath();
        ctx.roundRect(x + 3, y + 3, w - 6, h - 6, 26);
        ctx.clip();

        ctx.fillStyle = pct < 0.25 ? '#FF6B6B' : (pct < 0.5 ? '#FFA726' : '#3BA3D9');
        ctx.beginPath();
        ctx.moveTo(x, y + h);
        for (let xx = x; xx <= x + w; xx += 6) {
            ctx.lineTo(xx, superficie + Math.sin(this.relojTotal * 3.5 + xx * 0.08) * 4);
        }
        ctx.lineTo(x + w, y + h);
        ctx.closePath();
        ctx.fill();

        // Líneas de medida en el tanque
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 2;
        for (let i = 1; i <= 4; i++) {
            const my = y + (h / 5) * i;
            ctx.beginPath();
            ctx.moveTo(x + 10, my);
            ctx.lineTo(x + 30, my);
            ctx.stroke();
        }

        ctx.restore();

        // Letrero del tanque
        ctx.fillStyle = '#2A2340';
        ctx.font = 'bold 15px "Segoe UI", system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('TANQUE', x + w / 2, y - 14);

        // Porcentaje digital en el centro
        const pctTexto = `${Math.round(pct * 100)}%`;
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#2A2340';
        ctx.lineWidth = 4;
        ctx.font = 'bold 24px "Segoe UI", system-ui, sans-serif';
        const ty = Math.max(y + 35, Math.min(y + h - 25, superficie + 30));
        ctx.strokeText(pctTexto, x + w / 2, ty);
        ctx.fillText(pctTexto, x + w / 2, ty);
    }

    dibujarPildora(ctx, texto, x, y, colorFondo, colorTexto) {
        ctx.save();
        ctx.font = 'bold 12px "Segoe UI", system-ui, sans-serif';
        const w = ctx.measureText(texto).width + 16;
        ctx.fillStyle = colorFondo;
        ctx.strokeStyle = '#2A2340';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(x - w / 2, y - 10, w, 20, 10);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = colorTexto;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(texto, x, y);
        ctx.restore();
    }

    dibujarFormaGota(ctx, cx, cy, radio) {
        ctx.beginPath();
        ctx.moveTo(cx, cy - radio * 1.4);
        ctx.quadraticCurveTo(cx + radio * 1.1, cy, cx, cy + radio);
        ctx.quadraticCurveTo(cx - radio * 1.1, cy, cx, cy - radio * 1.4);
        ctx.fill();
    }

    dibujarEstrellaForma(ctx, cx, cy, radio, color) {
        ctx.save();
        ctx.fillStyle = color;
        ctx.strokeStyle = '#2A2340';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
            const r = i % 2 === 0 ? radio : radio * 0.4;
            const a = -Math.PI / 2 + (i * Math.PI) / 4;
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

// Registrar en el objeto global
window.GuardianAgua = GuardianAgua;

