/**
 * Operación EcoRescate - Minijuego 1: Limpieza Monstruosa
 * Misión en la plaza: el jugador camina con flechas, WASD o controles táctiles,
 * atrapa monstruos de basura en su mochila (máx. 5) y los lleva al tacho de su material
 * (plástico, papel o metal). Incluye lodo tóxico, barra de invasión, estrella de poder,
 * cielo dinámico (mañana, tarde, atardecer y noche), árboles que se mecen, nubes y pájaros.
 */

class LimpiezaMonstruosa extends MinijuegoBase {
    constructor(canvas, tipoJuegoId = 'LIMPIEZA') {
        super(canvas, tipoJuegoId);

        // Constantes del mapa de la plaza
        this.MIN_X = 84;
        this.MAX_X = 916;
        this.MIN_Y = 258;
        this.MAX_Y = 552;
        this.MON_MIN_X = 92;
        this.MON_MAX_X = 908;
        this.MON_MIN_Y = 272;
        this.MON_MAX_Y = 550;

        this.CAPACIDAD_MOCHILA = 5;
        this.MAX_INVASION = 10;
        this.ESPERA_TACHO = 0.35; // Segundos que debe quedarse frente al tacho

        // Materiales y tachos
        this.MATERIALES = {
            PLASTICO: { id: 'PLASTICO', titulo: 'PLÁSTICO', nombre: 'plástico', ejemplos: 'botellas · vasos', color: '#4DA3E8' },
            PAPEL: { id: 'PAPEL', titulo: 'PAPEL', nombre: 'papel', ejemplos: 'cajas · periódicos', color: '#A8775A' },
            METAL: { id: 'METAL', titulo: 'METAL', nombre: 'metal', ejemplos: 'latas de atún y gaseosa', color: '#FFD54F' }
        };

        // Tipos de monstruos
        this.TIPOS_MONSTRUO = {
            BOTELLIN: { id: 'BOTELLIN', nombre: 'Botellín', desc: 'una botella de plástico', material: 'PLASTICO', nivelMin: 1, color: '#4C7C9B', frases: ['GRRRR...', '¡GLUP GLUP!'] },
            CAJETON: { id: 'CAJETON', nombre: 'Cajetón', desc: 'una caja de cartón', material: 'PAPEL', nivelMin: 1, color: '#8B6542', frases: ['CRAAACK...', '¡CRUNCH!'] },
            LATOX: { id: 'LATOX', nombre: 'Latox', desc: 'una lata de gaseosa', material: 'METAL', nivelMin: 1, color: '#C0453F', frases: ['¡CLANK!', 'CLONK...'] },
            VASITO: { id: 'VASITO', nombre: 'Vasito', desc: 'un vaso descartable', material: 'PLASTICO', nivelMin: 3, color: '#F4F4F0', frases: ['¡SLURP!', 'GRRR...'] },
            PERIODICON: { id: 'PERIODICON', nombre: 'Periodicón', desc: 'un periódico', material: 'PAPEL', nivelMin: 3, color: '#E6E3D8', frases: ['¡RAAASS!', '¡NOTICIA!'] },
            ATUNIN: { id: 'ATUNIN', nombre: 'Atunín', desc: 'una lata de atún', material: 'METAL', nivelMin: 5, color: '#9FB3C8', frases: ['¡CLINK!', 'GLUB...'] }
        };

        // Posiciones de los 3 tachos en la plataforma superior
        this.tachos = [
            { material: this.MATERIALES.PLASTICO, x: 311, y: 226, w: 118, h: 86, brillo: 0, temblor: 0 },
            { material: this.MATERIALES.PAPEL, x: 441, y: 226, w: 118, h: 86, brillo: 0, temblor: 0 },
            { material: this.MATERIALES.METAL, x: 571, y: 226, w: 118, h: 86, brillo: 0, temblor: 0 }
        ];

        // Estado del jugador
        this.jx = 500;
        this.jy = 430;
        this.animPaso = 0;
        this.mirandoDerecha = true;
        this.caminando = false;
        this.destinoRaton = null;
        this.vidas = 3;
        this.invulnerable = 0;
        this.tiempoPoder = 0;

        // Mochila de monstruos
        this.mochila = [];
        this.tachoFrente = null;
        this.esperaTacho = 0;
        this.entregaHecha = false;

        // Entidades activas
        this.monstruos = [];
        this.lodos = [];
        this.estallidos = [];
        this.pajaros = [];
        this.proximoMonstruo = 1.5;

        // Estrella de poder
        this.estrellaPos = null;
        this.tiempoProximaEstrella = 14;
        this.vidaEstrella = 0;
        this.puntosEstrella = [
            { x: 870, y: 300 }, { x: 130, y: 300 },
            { x: 500, y: 500 }, { x: 220, y: 470 }, { x: 780, y: 470 }
        ];
    }

    usaCorazones() {
        return true;
    }

    motivoDerrota() {
        return '¡Los monstruos de basura llenaron la plaza!';
    }

    pista() {
        if (this.tiempoPoder > 0) return ['¡Poder de estrella!', 'Corres más rápido y los monstruos son atraídos hacia ti.'];
        if (this.mochila.length >= this.CAPACIDAD_MOCHILA) return ['¡Mochila llena!', 'Lleva cada monstruo al tacho de su material.'];
        if (this.mochila.length === 0) return ['¡Atrapa a los monstruos!', 'Camina hacia ellos para guardarlos en tu mochila (máximo 5).'];
        if (this.nivelNumero <= 2) return ['Ahora llévalos a su tacho', 'Botellín → plástico · Cajetón → papel · Latox → metal'];
        return ['Ahora llévalos a su tacho', 'Quédate un momento frente al tacho correspondiente para depositarlos.'];
    }

    reiniciar() {
        this.jx = 500;
        this.jy = 430;
        this.animPaso = 0;
        this.mirandoDerecha = true;
        this.caminando = false;
        this.destinoRaton = null;
        this.vidas = 3;
        this.medidor = 1.0;
        this.invulnerable = 0;
        this.tiempoPoder = 0;

        this.mochila = [];
        this.tachoFrente = null;
        this.esperaTacho = 0;
        this.entregaHecha = false;

        this.monstruos = [];
        this.lodos = [];
        this.estallidos = [];
        this.estrellaPos = null;
        this.tiempoProximaEstrella = 14;
        this.vidaEstrella = 0;
        this.proximoMonstruo = 1.5;

        // Crear 3 monstruos iniciales
        for (let i = 0; i < 3; i++) {
            this.crearMonstruo(true);
        }

        // Lodos tóxicos según nivel (0 en niv 1, 1 en niv 2-7, 2 en niv 8+)
        const cantLodos = this.nivelNumero >= 8 ? 2 : (this.nivelNumero >= 2 ? 1 : 0);
        for (let i = 0; i < cantLodos; i++) {
            this.crearLodo();
        }

        // Pájaros en el cielo
        this.pajaros = [];
        for (let i = 0; i < 3; i++) {
            this.pajaros.push({
                x: Math.random() * this.ANCHO,
                y: 135 + Math.random() * 35,
                vel: 25 + Math.random() * 20
            });
        }
    }

    crearMonstruo(adentro = false) {
        // Monstruos desbloqueados según el nivel actual
        const disponibles = Object.values(this.TIPOS_MONSTRUO).filter(m => m.nivelMin <= this.nivelNumero);
        if (disponibles.length === 0) return;

        // Priorizar monstruos requeridos por los retos del nivel
        const necesarios = disponibles.filter(m => {
            const retoEsp = this.def.retos.find(r => r.clave === m.id);
            const retoMat = this.def.retos.find(r => r.clave === m.material);
            const faltaEsp = retoEsp ? (this.progresoRetos[m.id] || 0) < retoEsp.meta : false;
            const faltaMat = retoMat ? (this.progresoRetos[m.material] || 0) < retoMat.meta : false;
            return faltaEsp || faltaMat;
        });

        const fuente = (necesarios.length > 0 && Math.random() < 0.65) ? necesarios : disponibles;
        const tipoElegido = fuente[Math.floor(Math.random() * fuente.length)];

        let x, y;
        if (adentro) {
            x = this.MON_MIN_X + 40 + Math.random() * (this.MON_MAX_X - this.MON_MIN_X - 80);
            y = 380 + Math.random() * (this.MON_MAX_Y - 380);
            if (Math.hypot(x - this.jx, y - this.jy) < 140) {
                x = x < 500 ? this.MON_MIN_X + 40 : this.MON_MAX_X - 40;
            }
        } else {
            const lado = Math.floor(Math.random() * 3);
            if (lado === 0) { x = this.MON_MIN_X; y = 380 + Math.random() * (this.MON_MAX_Y - 380); }
            else if (lado === 1) { x = this.MON_MAX_X; y = 380 + Math.random() * (this.MON_MAX_Y - 380); }
            else { x = this.MON_MIN_X + Math.random() * (this.MON_MAX_X - this.MON_MIN_X); y = this.MON_MAX_Y; }
        }

        const velBase = 32 + (this.nivelNumero - 1) * 4.5;
        this.monstruos.push({
            tipo: tipoElegido,
            x, y,
            angulo: Math.random() * Math.PI * 2,
            vel: velBase * (0.85 + Math.random() * 0.3),
            cambioDir: 1 + Math.random() * 1.5,
            anim: Math.random() * 6,
            aparicion: 0,
            fraseActiva: '',
            tiempoFrase: 0
        });
    }

    crearLodo() {
        let x, y;
        let intentos = 0;
        do {
            x = this.MON_MIN_X + 60 + Math.random() * (this.MON_MAX_X - this.MON_MIN_X - 120);
            y = 400 + Math.random() * (this.MON_MAX_Y - 400);
            intentos++;
        } while (Math.hypot(x - this.jx, y - this.jy) < 220 && intentos < 20);

        this.lodos.push({
            x, y,
            angulo: Math.random() * Math.PI * 2,
            cambioDir: 2 + Math.random() * 2,
            anim: Math.random() * 6
        });
    }

    enPlataforma(x, y) {
        return x > 288 && x < 712 && y < 346;
    }

    prohibidoMonstruos(x, y) {
        return x > 270 && x < 730 && y < 368;
    }

    actualizar(dt) {
        this.moverJugador(dt);
        this.moverMonstruos(dt);
        this.moverLodos(dt);
        this.actualizarEstrella(dt);
        this.revisarTachos(dt);

        // Generación periódica de monstruos
        this.proximoMonstruo -= dt;
        if (this.proximoMonstruo <= 0) {
            this.crearMonstruo(false);
            const intervalo = Math.max(1.3, 3.4 - (this.nivelNumero - 1) * 0.22);
            this.proximoMonstruo = intervalo * (0.85 + Math.random() * 0.3);
        }

        // Barra de Invasión: Si hay 10 monstruos en plaza
        if (this.monstruos.length >= this.MAX_INVASION) {
            for (let i = 0; i < 4 && this.monstruos.length > 0; i++) {
                this.monstruos.shift();
            }
            this.perderVida('¡Invasión de Basura!', 'La plaza se llenó de monstruos. Atrapa a los residuos antes de que sean demasiados.');
        }

        // Tiempos de invulnerabilidad y poder
        if (this.invulnerable > 0) this.invulnerable = Math.max(0, this.invulnerable - dt);
        if (this.tiempoPoder > 0) this.tiempoPoder = Math.max(0, this.tiempoPoder - dt);

        // Estallidos de puntos (+10)
        for (let i = this.estallidos.length - 1; i >= 0; i--) {
            const e = this.estallidos[i];
            e.vida -= dt;
            e.y -= dt * 25;
            if (e.vida <= 0) this.estallidos.splice(i, 1);
        }

        // Brillo y temblor de tachos
        this.tachos.forEach(t => {
            if (t.brillo > 0) t.brillo = Math.max(0, t.brillo - dt);
            if (t.temblor > 0) t.temblor = Math.max(0, t.temblor - dt);
        });

        // Pájaros en el cielo
        this.pajaros.forEach(p => {
            p.x += p.vel * dt;
            if (p.x > this.ANCHO + 40) {
                p.x = -40;
                p.y = 135 + Math.random() * 35;
            }
        });

        // Sincronizar medidor con vidas (3 vidas = 1.0, 2 = 0.66, 1 = 0.33)
        this.medidor = this.vidas / 3;
    }

    moverJugador(dt) {
        let dx = 0, dy = 0;

        // Teclado
        if (this.teclasPresionadas['ArrowLeft'] || this.teclasPresionadas['KeyA'] || this.dpadActivo.left) dx -= 1;
        if (this.teclasPresionadas['ArrowRight'] || this.teclasPresionadas['KeyD'] || this.dpadActivo.right) dx += 1;
        if (this.teclasPresionadas['ArrowUp'] || this.teclasPresionadas['KeyW'] || this.dpadActivo.up) dy -= 1;
        if (this.teclasPresionadas['ArrowDown'] || this.teclasPresionadas['KeyS'] || this.dpadActivo.down) dy += 1;

        if (dx !== 0 || dy !== 0) {
            this.destinoRaton = null;
        } else if (this.destinoRaton) {
            const ddx = this.destinoRaton.x - this.jx;
            const ddy = this.destinoRaton.y - this.jy;
            const dist = Math.hypot(ddx, ddy);
            if (dist < 8) {
                this.destinoRaton = null;
            } else {
                dx = ddx / dist;
                dy = ddy / dist;
            }
        }

        const len = Math.hypot(dx, dy);
        this.caminando = len > 0;
        if (!this.caminando) return;

        const vel = (this.tiempoPoder > 0 || this.frenesiActivo) ? 310 : 230;
        let nx = Math.max(this.MIN_X, Math.min(this.MAX_X, this.jx + (dx / len) * vel * dt));
        let ny = Math.max(this.MIN_Y, Math.min(this.MAX_Y, this.jy + (dy / len) * vel * dt));

        // Partículas de estela de velocidad en modo frenesí
        if (this.frenesiActivo && Math.random() < 0.28) {
            this.crearChispas(this.jx, this.jy - 15, '#F59E0B', 2);
        }

        // Colisión con la plataforma de tachos
        if (this.enPlataforma(nx, ny)) {
            if (!this.enPlataforma(nx, this.jy)) ny = this.jy;
            else if (!this.enPlataforma(this.jx, ny)) nx = this.jx;
            else { nx = this.jx; ny = this.jy; this.destinoRaton = null; }
        }

        this.jx = nx;
        this.jy = ny;
        if (dx !== 0) this.mirandoDerecha = dx > 0;
        this.animPaso += dt * 14;
    }

    moverMonstruos(dt) {
        for (let i = this.monstruos.length - 1; i >= 0; i--) {
            const m = this.monstruos[i];
            m.aparicion = Math.min(1, m.aparicion + dt * 2.5);
            m.anim += dt * 10;
            m.cambioDir -= dt;
            if (m.cambioDir <= 0) {
                m.angulo = Math.random() * Math.PI * 2;
                m.cambioDir = 1.2 + Math.random() * 1.6;
            }

            let vel = m.vel;
            // Efecto imán si el jugador tiene la estrella de poder
            if (this.tiempoPoder > 0 && Math.hypot(this.jx - m.x, this.jy - m.y) < 220) {
                m.angulo = Math.atan2(this.jy - m.y, this.jx - m.x);
                vel *= 1.8;
            }

            let nx = m.x + Math.cos(m.angulo) * vel * dt;
            let ny = m.y + Math.sin(m.angulo) * vel * dt;

            if (this.prohibidoMonstruos(nx, ny)) {
                m.angulo += Math.PI;
            } else {
                m.x = nx;
                m.y = ny;
            }

            if (m.x < this.MON_MIN_X || m.x > this.MON_MAX_X) m.angulo = Math.PI - m.angulo;
            if (m.y < this.MON_MIN_Y || m.y > this.MON_MAX_Y) m.angulo = -m.angulo;

            m.x = Math.max(this.MON_MIN_X, Math.min(this.MON_MAX_X, m.x));
            m.y = Math.max(this.MON_MIN_Y, Math.min(this.MON_MAX_Y, m.y));

            // Frases aleatorias de los monstruos
            if (m.tiempoFrase > 0) m.tiempoFrase -= dt;
            else if (Math.random() < dt * 0.08) {
                m.fraseActiva = m.tipo.frases[Math.floor(Math.random() * m.tipo.frases.length)];
                m.tiempoFrase = 1.8;
            }

            // Recoger monstruo si colisiona con el jugador
            if (m.aparicion >= 1 && Math.hypot(m.x - this.jx, (m.y - 25) - (this.jy - 35)) < 42) {
                if (this.mochila.length < this.CAPACIDAD_MOCHILA) {
                    this.mochila.push(m.tipo);
                    this.monstruos.splice(i, 1);
                    this.crearChispas(m.x, m.y - 30, m.tipo.color, 12);
                    this.crearTextoFlotante('+' + m.tipo.nombre.toUpperCase(), m.x, m.y - 30, m.tipo.color, 1.1);
                    window.audioEco.recoger();

                    if (this.mochila.length === this.CAPACIDAD_MOCHILA) {
                        this.mensajeToast = { texto: '¡Mochila llena! Llévalos a sus tachos.', esError: false, tiempo: 2.5 };
                    }
                } else {
                    this.mensajeToast = { texto: '¡Mochila llena (máx. 5)! Vacíala en los tachos.', esError: true, tiempo: 2.0 };
                }
            }
        }
    }

    moverLodos(dt) {
        const vel = 16 + (this.nivelNumero - 1) * 2;
        for (const l of this.lodos) {
            l.anim += dt * 4;
            l.cambioDir -= dt;
            if (l.cambioDir <= 0) {
                l.angulo = Math.random() * Math.PI * 2;
                l.cambioDir = 2 + Math.random() * 2;
            }

            let nx = l.x + Math.cos(l.angulo) * vel * dt;
            let ny = l.y + Math.sin(l.angulo) * vel * dt;

            if (this.prohibidoMonstruos(nx - 35, ny) || this.prohibidoMonstruos(nx + 35, ny)) {
                l.angulo += Math.PI;
            } else {
                l.x = nx;
                l.y = ny;
            }

            if (l.x < this.MON_MIN_X + 40 || l.x > this.MON_MAX_X - 40) l.angulo = Math.PI - l.angulo;
            if (l.y < this.MON_MIN_Y + 30 || l.y > this.MON_MAX_Y) l.angulo = -l.angulo;

            l.x = Math.max(this.MON_MIN_X + 40, Math.min(this.MON_MAX_X - 40, l.x));
            l.y = Math.max(this.MON_MIN_Y + 30, Math.min(this.MON_MAX_Y, l.y));

            // Colisión de daño con el jugador
            if (this.invulnerable <= 0 && this.tiempoPoder <= 0 && Math.hypot(l.x - this.jx, (l.y - 20) - (this.jy - 30)) < 40) {
                const ang = Math.atan2(this.jy - l.y, this.jx - l.x);
                this.jx = Math.max(this.MIN_X, Math.min(this.MAX_X, this.jx + Math.cos(ang) * 55));
                this.jy = Math.max(this.MIN_Y, Math.min(this.MAX_Y, this.jy + Math.sin(ang) * 55));
                if (this.enPlataforma(this.jx, this.jy)) this.jy = 348;

                this.perderVida('¡Lodo Tóxico!', 'El lodo tóxico es peligroso y contamina. ¡Rodéalo y no lo toques!');
            }
        }
    }

    perderVida(titulo, explicacion) {
        this.vidas--;
        this.invulnerable = 1.6;
        this.destinoRaton = null;
        this.registrarError(`${titulo}: ${explicacion}`, 1 / 3);
        this.medidor = this.vidas / 3;
    }

    actualizarEstrella(dt) {
        if (!this.estrellaPos) {
            if (this.tiempoPoder > 0) return;
            this.tiempoProximaEstrella -= dt;
            if (this.tiempoProximaEstrella <= 0) {
                const p = this.puntosEstrella[Math.floor(Math.random() * this.puntosEstrella.length)];
                this.estrellaPos = { x: p.x, y: p.y };
                this.vidaEstrella = 8;
            }
            return;
        }

        this.vidaEstrella -= dt;
        if (Math.hypot(this.estrellaPos.x - this.jx, this.estrellaPos.y - (this.jy - 30)) < 42) {
            this.tiempoPoder = 6;
            this.crearChispas(this.estrellaPos.x, this.estrellaPos.y, '#FFD84D', 24);
            window.audioEco.poder();

            if (this.vidas < 3) this.vidas++;
            this.medidor = this.vidas / 3;

            // Reto 'ESTRELLA'
            if (this.progresoRetos['ESTRELLA'] !== undefined) {
                this.progresoRetos['ESTRELLA']++;
            }

            this.estallidos.push({ x: this.estrellaPos.x, y: this.estrellaPos.y - 30, texto: '+15 ¡PODER!', vida: 1.0 });
            this.puntaje += 15;
            this.mensajeToast = { texto: '¡Poder de Estrella! Eres veloz, inmune y atraes monstruos.', esError: false, tiempo: 3.0 };

            this.estrellaPos = null;
            this.tiempoProximaEstrella = 20;
        } else if (this.vidaEstrella <= 0) {
            this.estrellaPos = null;
            this.tiempoProximaEstrella = 15;
        }
    }

    revisarTachos(dt) {
        let actual = null;
        if (this.jy < 362) {
            for (const t of this.tachos) {
                if (this.jx >= t.x - 8 && this.jx <= t.x + t.w + 8) {
                    actual = t;
                    break;
                }
            }
        }

        if (actual !== this.tachoFrente) {
            this.tachoFrente = actual;
            this.esperaTacho = 0;
            this.entregaHecha = false;
        }

        if (!this.tachoFrente || this.entregaHecha || this.mochila.length === 0) return;

        this.esperaTacho += dt;
        if (this.esperaTacho < this.ESPERA_TACHO) return;

        this.entregaHecha = true;
        const t = this.tachoFrente;
        let depositados = 0;
        let ultimo = null;

        for (let i = this.mochila.length - 1; i >= 0; i--) {
            const m = this.mochila[i];
            if (m.material === t.material.id) {
                this.mochila.splice(i, 1);
                depositados++;
                ultimo = m;

                // Retos
                if (this.progresoRetos[m.id] !== undefined) this.progresoRetos[m.id]++;
                if (this.progresoRetos[m.material] !== undefined) this.progresoRetos[m.material]++;

                this.registrarAcierto(null, 1, 10, t.x + t.w / 2, t.y - 15, `¡${ultimo.nombre.toUpperCase()}!`);
                this.estallidos.push({
                    x: t.x + t.w / 2 + (depositados * 20 - 15),
                    y: t.y - 10,
                    texto: `+${10 * Math.min(5, Math.floor((this.racha - 1) / 2) + 1)}`,
                    vida: 0.9
                });
            }
        }

        if (depositados > 0) {
            t.brillo = 0.6;
            this.crearChispas(t.x + t.w / 2, t.y + 20, t.material.color, 16);
            this.mensajeToast = {
                texto: `¡Bien! ${ultimo.nombre} es ${ultimo.desc} y va en ${t.material.titulo}.`,
                esError: false,
                tiempo: 2.8
            };
        } else {
            // Tacho equivocado
            t.temblor = 0.5;
            const m = this.mochila[0];
            const matCorrecto = this.MATERIALES[m.material];
            this.registrarError(
                `¡Tacho equivocado! ${m.nombre} es ${m.desc}: va en ${matCorrecto.titulo}, no en ${t.material.titulo}.`,
                0.2
            );
        }
    }

    // Dibujar la escena completa de la Plaza
    dibujarEscena(ctx) {
        // Fase del cielo según el nivel:
        // 1-3 Mañana, 4-6 Tarde, 7-9 Atardecer, 10 Noche
        const fase = this.nivelNumero <= 3 ? 0 : (this.nivelNumero <= 6 ? 1 : (this.nivelNumero <= 9 ? 2 : 3));
        this.dibujarCielo(ctx, fase);

        // Nubes
        for (let i = 0; i < 4; i++) {
            const nx = ((i * 280 + this.relojTotal * 12) % 1160) - 80;
            this.dibujarNube(ctx, nx, 136 + (i % 2) * 14, 0.65 + (i % 3) * 0.1);
        }

        // Pájaros volando
        ctx.strokeStyle = '#2A2340';
        ctx.lineWidth = 2.2;
        for (const p of this.pajaros) {
            const aleteo = Math.sin(this.relojTotal * 12 + p.x * 0.1) * 3;
            ctx.beginPath();
            ctx.moveTo(p.x - 7, p.y);
            ctx.quadraticCurveTo(p.x - 3, p.y - 5 - aleteo, p.x, p.y);
            ctx.quadraticCurveTo(p.x + 3, p.y - 5 - aleteo, p.x + 7, p.y);
            ctx.stroke();
        }

        // Casas coloniales en el fondo
        const coloresCasas = ['#EE8FC4', '#FFD86B', '#93C0EE', '#F5A86B', '#93C0EE', '#EE8FC4', '#FFD86B'];
        for (let i = 0; i < 7; i++) {
            this.dibujarCasa(ctx, 118 + i * 127, coloresCasas[i]);
        }

        // Suelo de la plaza (adoquines de arena)
        this.dibujarPlaza(ctx);

        // Árboles que se mecen con el viento
        this.dibujarArbol(ctx, 50, 310);
        this.dibujarArbol(ctx, 950, 310);

        // Tachos de reciclaje en la plataforma superior
        this.tachos.forEach(t => this.dibujarTacho(ctx, t));

        // Estrella de poder
        if (this.estrellaPos) {
            const pulso = 1 + Math.sin(this.relojTotal * 6) * 0.1;
            const parpadea = this.vidaEstrella < 2 && Math.floor(this.relojTotal * 8) % 2 === 0;
            if (!parpadea) {
                this.dibujarEstrellaForma(ctx, this.estrellaPos.x, this.estrellaPos.y, 24 * pulso, '#FFD84D');
                ctx.fillStyle = '#2A2340';
                ctx.font = 'bold 13px "Segoe UI", system-ui, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('¡PODER!', this.estrellaPos.x, this.estrellaPos.y + 40);
            }
        }

        // Ordenamiento por profundidad Y (efecto 2.5D caricatura)
        const entidades = [];
        this.lodos.forEach(l => entidades.push({ tipo: 'lodo', y: l.y, obj: l }));
        this.monstruos.forEach(m => entidades.push({ tipo: 'monstruo', y: m.y, obj: m }));
        entidades.push({ tipo: 'jugador', y: this.jy });

        entidades.sort((a, b) => a.y - b.y);

        entidades.forEach(e => {
            if (e.tipo === 'lodo') this.dibujarLodo(ctx, e.obj);
            else if (e.tipo === 'monstruo') this.dibujarMonstruo(ctx, e.obj);
            else this.dibujarJugador(ctx);
        });

        // Bocadillos de diálogo de los monstruos
        for (const m of this.monstruos) {
            if (m.tiempoFrase > 0 && m.fraseActiva) {
                this.dibujarBocadillo(ctx, m.fraseActiva, m.x, m.y - 74);
            } else if (Math.hypot(m.x - this.jx, m.y - this.jy) < 130) {
                this.dibujarEtiquetaMonstruo(ctx, m.tipo.nombre, m.x, m.y - 85);
            }
        }

        // Estallidos de puntuación (+10, +20)
        for (const e of this.estallidos) {
            ctx.save();
            ctx.globalAlpha = Math.max(0, e.vida);
            ctx.fillStyle = '#FFD84D';
            ctx.strokeStyle = '#2A2340';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(e.x, e.y, 18, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#2A2340';
            ctx.font = 'bold 15px "Segoe UI", system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(e.texto, e.x, e.y);
            ctx.restore();
        }

        // Indicador de Invasión y Mochila en el lateral inferior
        this.dibujarBarraInvasion(ctx);
        this.dibujarRanurasMochila(ctx);
    }

    dibujarCielo(ctx, fase) {
        const cielos = [
            ['#38BDF8', '#BAE6FD', '#E0F2FE'], // Mañana
            ['#F59E0B', '#FDE68A', '#FFFBEB'], // Tarde
            ['#4338CA', '#C026D3', '#F97316'], // Atardecer en el desierto de Ica
            ['#0F172A', '#1E1B4B', '#312E81']  // Noche estrellada
        ];
        const colores = cielos[fase] || cielos[0];
        const grad = ctx.createLinearGradient(0, this.ESC_Y, 0, 220);
        grad.addColorStop(0, colores[0]);
        grad.addColorStop(0.55, colores[1]);
        grad.addColorStop(1, colores[2]);
        ctx.fillStyle = grad;
        ctx.fillRect(this.ESC_X, this.ESC_Y, this.ESC_W, 115);

        // Dunas doradas lejanas de Huacachina en el horizonte
        const colorDuna1 = fase === 3 ? '#1E1B4B' : (fase === 2 ? '#C2410C' : '#D97706');
        const colorDuna2 = fase === 3 ? '#0F172A' : (fase === 2 ? '#9A3412' : '#B45309');

        ctx.fillStyle = colorDuna1;
        ctx.beginPath();
        ctx.moveTo(this.ESC_X, 214);
        ctx.quadraticCurveTo(240, 155, 480, 185);
        ctx.quadraticCurveTo(720, 215, this.ESC_DER, 170);
        ctx.lineTo(this.ESC_DER, 214);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = colorDuna2;
        ctx.beginPath();
        ctx.moveTo(this.ESC_X, 214);
        ctx.quadraticCurveTo(320, 180, 640, 165);
        ctx.quadraticCurveTo(840, 155, this.ESC_DER, 195);
        ctx.lineTo(this.ESC_DER, 214);
        ctx.closePath();
        ctx.fill();

        // Sol o Luna con resplandor
        if (fase === 3) {
            // Luna creciente brillante
            ctx.fillStyle = '#FEF08A';
            ctx.beginPath();
            ctx.arc(880, 148, 22, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = colores[1];
            ctx.beginPath();
            ctx.arc(888, 144, 20, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Sol radiante con corona
            const solColor = fase === 2 ? '#EA580C' : '#FBBF24';
            const gradSol = ctx.createRadialGradient(880, 148, 10, 880, 148, 38);
            gradSol.addColorStop(0, '#FFFFFF');
            gradSol.addColorStop(0.4, solColor);
            gradSol.addColorStop(1, 'rgba(251, 191, 36, 0)');
            ctx.fillStyle = gradSol;
            ctx.beginPath();
            ctx.arc(880, 148, 38, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(880, 148, 16, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    dibujarCasa(ctx, cx, color) {
        // Fachada colonial iqueña con textura y profundidad
        ctx.save();
        ctx.fillStyle = color;
        ctx.strokeStyle = '#1E293B';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(cx - 52, 160, 104, 54, 4);
        ctx.fill();
        ctx.stroke();

        // Tejado colonial de tejas curvas de arcilla
        ctx.fillStyle = '#B91C1C';
        ctx.beginPath();
        ctx.moveTo(cx - 60, 162);
        ctx.lineTo(cx, 132);
        ctx.lineTo(cx + 60, 162);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Detalle de tejas
        ctx.strokeStyle = '#991B1B';
        ctx.lineWidth = 1.5;
        for (let i = -40; i <= 40; i += 16) {
            ctx.beginPath();
            ctx.moveTo(cx + i * 0.8, 146);
            ctx.lineTo(cx + i, 162);
            ctx.stroke();
        }

        // Balcón colonial de madera
        ctx.fillStyle = '#78350F';
        ctx.strokeStyle = '#1E293B';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.roundRect(cx - 24, 172, 48, 14, 2);
        ctx.fill();
        ctx.stroke();

        // Ventanal con luz cálida
        ctx.fillStyle = '#FEF08A';
        ctx.beginPath();
        ctx.arc(cx, 170, 10, Math.PI, 0);
        ctx.fill();
        ctx.stroke();

        ctx.restore();
    }

    dibujarNube(ctx, x, y, s) {
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
        ctx.beginPath();
        ctx.arc(x, y + 10 * s, 16 * s, 0, Math.PI * 2);
        ctx.arc(x + 22 * s, y, 22 * s, 0, Math.PI * 2);
        ctx.arc(x + 48 * s, y + 8 * s, 18 * s, 0, Math.PI * 2);
        ctx.fill();
        // Sombra suave en la base de la nube
        ctx.fillStyle = 'rgba(226, 232, 240, 0.6)';
        ctx.beginPath();
        ctx.ellipse(x + 24 * s, y + 14 * s, 32 * s, 6 * s, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    dibujarArbol(ctx, x, y) {
        // Palmera datilera de Ica elegante y con movimiento orgánico
        ctx.save();
        const viento = Math.sin(this.relojTotal * 2.2 + x) * 4;

        // Tronco curvado con anillos de corteza
        ctx.strokeStyle = '#78350F';
        ctx.lineWidth = 11;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(x + 4, y - 45, x + viento * 0.5, y - 88);
        ctx.stroke();

        ctx.strokeStyle = '#92400E';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(x + 4, y - 45, x + viento * 0.5, y - 88);
        ctx.stroke();

        // Anillos del tronco
        ctx.strokeStyle = '#451A03';
        ctx.lineWidth = 1.6;
        for (let i = 1; i <= 6; i++) {
            const ty = y - i * 13;
            ctx.beginPath();
            ctx.moveTo(x - 5, ty);
            ctx.lineTo(x + 5, ty);
            ctx.stroke();
        }

        // Racimo de dátiles/cocos
        const copX = x + viento * 0.5;
        const copY = y - 88;
        ctx.fillStyle = '#78350F';
        ctx.beginPath();
        ctx.arc(copX - 4, copY + 3, 5, 0, Math.PI * 2);
        ctx.arc(copX + 4, copY + 3, 5, 0, Math.PI * 2);
        ctx.arc(copX, copY + 6, 5, 0, Math.PI * 2);
        ctx.fill();

        // Frondas de palmera en abanico que se mecen con el viento
        const coloresFronda = ['#15803D', '#16A34A', '#22C55E', '#4ADE80'];
        const angulos = [-2.4, -1.8, -1.2, -0.6, 0.0, 0.6, 1.2, 1.8, 2.4];

        angulos.forEach((ang, idx) => {
            const rad = ang + viento * 0.04;
            const len = 42 + (idx % 2) * 8;
            const destX = copX + Math.sin(rad) * len;
            const destY = copY - Math.cos(rad) * len * 0.55 + 6;

            ctx.strokeStyle = coloresFronda[idx % coloresFronda.length];
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.moveTo(copX, copY);
            ctx.quadraticCurveTo(copX + Math.sin(rad) * len * 0.5, copY - 14, destX, destY);
            ctx.stroke();
        });

        ctx.restore();
    }

    dibujarPlaza(ctx) {
        // Pavimento colonial con degradado y calidez
        const gradPlaza = ctx.createLinearGradient(0, 214, 0, 564);
        gradPlaza.addColorStop(0, '#E2D4BC');
        gradPlaza.addColorStop(1, '#D4BFA0');
        ctx.fillStyle = gradPlaza;
        ctx.beginPath();
        ctx.roundRect(64, 214, 872, 350, 28);
        ctx.fill();

        // Borde de piedra labrada
        ctx.strokeStyle = '#1E293B';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Patrón ornamental de adoquines
        ctx.strokeStyle = 'rgba(168, 142, 108, 0.35)';
        ctx.lineWidth = 1.8;
        for (let y = 260; y <= 530; y += 46) {
            ctx.beginPath();
            ctx.moveTo(80, y);
            ctx.lineTo(920, y);
            ctx.stroke();
        }

        // Plataforma central de los tachos con moldura
        const gradPlat = ctx.createLinearGradient(0, 216, 0, 320);
        gradPlat.addColorStop(0, '#CBD5E1');
        gradPlat.addColorStop(1, '#94A3B8');
        ctx.fillStyle = gradPlat;
        ctx.beginPath();
        ctx.roundRect(288, 216, 424, 108, 18);
        ctx.fill();

        ctx.strokeStyle = '#1E293B';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Línea reflectiva superior
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(292, 218, 416, 10, 5);
        ctx.stroke();
    }

    dibujarTacho(ctx, t) {
        ctx.save();
        if (t.temblor > 0) {
            ctx.translate(Math.sin(t.temblor * 60) * 5, 0);
        }

        // Brillo aureolar al depositar residuos correctamente
        if (t.brillo > 0) {
            const resplandor = ctx.createRadialGradient(t.x + t.w / 2, t.y + t.h / 2, 10, t.x + t.w / 2, t.y + t.h / 2, 80);
            resplandor.addColorStop(0, 'rgba(255, 215, 0, 0.7)');
            resplandor.addColorStop(1, 'rgba(255, 215, 0, 0)');
            ctx.fillStyle = resplandor;
            ctx.beginPath();
            ctx.arc(t.x + t.w / 2, t.y + t.h / 2, 80, 0, Math.PI * 2);
            ctx.fill();
        }

        // Anillo de progreso cuando el alumno espera frente al tacho
        if (t === this.tachoFrente && this.mochila.length > 0 && !this.entregaHecha) {
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 5;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.arc(t.x + t.w / 2, t.y + t.h + 14, 16, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, this.esperaTacho / this.ESPERA_TACHO));
            ctx.stroke();
        }

        // Sombra suave en la base del tacho
        ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
        ctx.beginPath();
        ctx.ellipse(t.x + t.w / 2, t.y + t.h + 2, t.w / 2 + 4, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Cuerpo cilíndrico del tacho con gradiente volumétrico
        const gradCuerpo = ctx.createLinearGradient(t.x, 0, t.x + t.w, 0);
        gradCuerpo.addColorStop(0, this.aclararHex(t.material.color, 0.25));
        gradCuerpo.addColorStop(0.35, t.material.color);
        gradCuerpo.addColorStop(1, this.oscurecerHex(t.material.color, 0.3));

        ctx.fillStyle = gradCuerpo;
        ctx.beginPath();
        ctx.roundRect(t.x, t.y + 12, t.w, t.h - 12, 14);
        ctx.fill();

        ctx.strokeStyle = '#1E293B';
        ctx.lineWidth = 2.8;
        ctx.stroke();

        // Tapa abovedada moderna con ranura de entrada
        const gradTapa = ctx.createLinearGradient(t.x, 0, t.x + t.w, 0);
        gradTapa.addColorStop(0, '#475569');
        gradTapa.addColorStop(0.5, '#1E293B');
        gradTapa.addColorStop(1, '#0F172A');

        ctx.fillStyle = gradTapa;
        ctx.beginPath();
        ctx.roundRect(t.x - 4, t.y, t.w + 8, 16, 8);
        ctx.fill();
        ctx.stroke();

        // Ranura oscura para tirar basura
        ctx.fillStyle = '#0F172A';
        ctx.beginPath();
        ctx.roundRect(t.x + 14, t.y + 5, t.w - 28, 6, 3);
        ctx.fill();

        // Placa blanca con logotipo de reciclaje y nombre
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.roundRect(t.x + 8, t.y + 24, t.w - 16, 34, 8);
        ctx.fill();
        ctx.strokeStyle = '#1E293B';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Título del material
        ctx.fillStyle = '#0F172A';
        ctx.font = '900 15px "Segoe UI", system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(t.material.titulo, t.x + t.w / 2, t.y + 41);

        // Subtítulo con ejemplos
        ctx.fillStyle = '#64748B';
        ctx.font = '800 10px "Segoe UI", system-ui, sans-serif';
        ctx.fillText(t.material.ejemplos.toUpperCase(), t.x + t.w / 2, t.y + 70);

        ctx.restore();
    }

    dibujarJugador(ctx) {
        if (this.invulnerable > 0 && Math.floor(this.relojTotal * 12) % 2 === 0) return;

        // Aura dorada pulsante cuando tiene la estrella de poder
        if (this.tiempoPoder > 0) {
            const rad = 48 + Math.sin(this.relojTotal * 10) * 5;
            const gradPoder = ctx.createRadialGradient(this.jx, this.jy - 40, 10, this.jx, this.jy - 40, rad);
            gradPoder.addColorStop(0, 'rgba(254, 240, 138, 0.8)');
            gradPoder.addColorStop(0.6, 'rgba(251, 191, 36, 0.4)');
            gradPoder.addColorStop(1, 'rgba(251, 191, 36, 0)');
            ctx.fillStyle = gradPoder;
            ctx.beginPath();
            ctx.arc(this.jx, this.jy - 40, rad, 0, Math.PI * 2);
            ctx.fill();
        }

        // Sombra de contacto suave en el piso
        ctx.fillStyle = 'rgba(15, 23, 42, 0.3)';
        ctx.beginPath();
        ctx.ellipse(this.jx, this.jy, 20, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.save();
        ctx.translate(this.jx, this.jy);
        if (!this.mirandoDerecha) ctx.scale(-1, 1);

        const paso = this.caminando ? Math.sin(this.animPaso) * 7 : 0;
        const bob = this.caminando ? Math.abs(Math.sin(this.animPaso * 2)) * 3 : 0;

        // Piernas con jeans azul oscuro
        ctx.strokeStyle = '#1E293B';
        ctx.lineWidth = 2.8;
        ctx.fillStyle = '#1E3A8A';

        // Pierna izquierda
        ctx.beginPath();
        ctx.roundRect(-8, -26 - bob, 7, 22 + paso * 0.4, 3);
        ctx.fill();
        ctx.stroke();

        // Pierna derecha
        ctx.beginPath();
        ctx.roundRect(2, -26 - bob, 7, 22 - paso * 0.4, 3);
        ctx.fill();
        ctx.stroke();

        // Zapatillas deportivas con suela blanca y cuerpo colorido
        const dibujarZapato = (zx, zy) => {
            // Suela de goma blanca
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.roundRect(zx - 2, zy + 2, 14, 5, 2);
            ctx.fill();
            ctx.stroke();
            // Empeine azul
            ctx.fillStyle = '#2563EB';
            ctx.beginPath();
            ctx.roundRect(zx - 2, zy - 4, 13, 7, 3);
            ctx.fill();
            ctx.stroke();
        };

        dibujarZapato(-9, -6 - bob + paso * 0.4);
        dibujarZapato(2, -6 - bob - paso * 0.4);

        const perfil = window.storageEco ? window.storageEco.obtenerPerfil() : null;

        // Capa de héroe ondeando en la espalda (si está equipada)
        if (perfil && perfil.accesorio === 'CAPA') {
            const flutter = Math.sin((this.tiempoJuego || 0) * 8) * 3.5;
            ctx.fillStyle = '#10B981';
            ctx.strokeStyle = '#1E293B';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(-6, -54 - bob);
            ctx.quadraticCurveTo(-26 + flutter, -38 - bob, -28 + flutter * 1.5, -12 - bob);
            ctx.quadraticCurveTo(-14, -18 - bob, -2, -22 - bob);
            ctx.quadraticCurveTo(-2, -45 - bob, -2, -54 - bob);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Pliegue sombreado
            ctx.strokeStyle = '#059669';
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.moveTo(-10, -48 - bob);
            ctx.quadraticCurveTo(-20 + flutter, -30 - bob, -22 + flutter, -14 - bob);
            ctx.stroke();
        }

        // Mochila de reciclaje en la espalda (volumétrica con bolsillo)
        ctx.fillStyle = '#059669';
        ctx.strokeStyle = '#1E293B';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(-24, -58 - bob, 16, 32, 6);
        ctx.fill();
        ctx.stroke();

        // Bolsillo con cremallera
        ctx.fillStyle = '#047857';
        ctx.beginPath();
        ctx.roundRect(-22, -44 - bob, 12, 14, 3);
        ctx.fill();
        ctx.stroke();

        // Tirante de la mochila
        ctx.strokeStyle = '#047857';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(-10, -54 - bob);
        ctx.lineTo(-4, -32 - bob);
        ctx.stroke();

        // Monstruos atrapados asomándose por la mochila
        if (this.mochila.length > 0) {
            ctx.fillStyle = '#F43F5E';
            ctx.beginPath();
            ctx.arc(-16, -64 - bob, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            // Ojitos curiosos
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(-18, -65 - bob, 2, 0, Math.PI * 2);
            ctx.arc(-14, -65 - bob, 2, 0, Math.PI * 2);
            ctx.fill();
        }

        // Torso / Polo del estudiante
        const poloInfo = COLORES_POLO[perfil ? (perfil.polo || 0) : 0] || COLORES_POLO[0];

        const gradPolo = ctx.createLinearGradient(0, -60, 0, -26);
        gradPolo.addColorStop(0, poloInfo.color);
        gradPolo.addColorStop(1, this.oscurecerHex(poloInfo.color, 0.25));

        ctx.fillStyle = gradPolo;
        ctx.strokeStyle = '#1E293B';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(-10, -58 - bob, 22, 34, 6);
        ctx.fill();
        ctx.stroke();

        // Cuello de polo
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.moveTo(-4, -58 - bob);
        ctx.lineTo(0, -50 - bob);
        ctx.lineTo(4, -58 - bob);
        ctx.stroke();

        // Brazo balanceándose
        ctx.fillStyle = '#FAD4B2';
        ctx.beginPath();
        ctx.roundRect(4, -52 - bob, 6, 18, 3);
        ctx.fill();
        ctx.stroke();

        // Cabeza con volumen y mejillas sonrosadas
        const gradPiel = ctx.createRadialGradient(2, -76 - bob, 4, 1, -74 - bob, 18);
        gradPiel.addColorStop(0, '#FFE8D6');
        gradPiel.addColorStop(0.8, '#FAD4B2');
        gradPiel.addColorStop(1, '#F3B892');

        ctx.fillStyle = gradPiel;
        ctx.beginPath();
        ctx.arc(1, -74 - bob, 17, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Rubor en las mejillas
        ctx.fillStyle = 'rgba(244, 63, 94, 0.28)';
        ctx.beginPath();
        ctx.arc(8, -70 - bob, 4, 0, Math.PI * 2);
        ctx.fill();

        // Cabello con mechones y volumen 3D
        ctx.fillStyle = '#451A03';
        ctx.beginPath();
        ctx.arc(1, -78 - bob, 18, Math.PI * 0.9, Math.PI * 2.1);
        ctx.fill();
        ctx.stroke();

        // Mechón frontal
        ctx.beginPath();
        ctx.moveTo(4, -84 - bob);
        ctx.quadraticCurveTo(14, -86 - bob, 15, -77 - bob);
        ctx.quadraticCurveTo(8, -76 - bob, 4, -84 - bob);
        ctx.fill();

        // Ojo anime grande y expresivo
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.ellipse(8, -74 - bob, 4, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Iris castaño y pupila
        ctx.fillStyle = '#78350F';
        ctx.beginPath();
        ctx.arc(9, -74 - bob, 2.8, 0, Math.PI * 2);
        ctx.fill();

        // Doble destello de luz en el ojo
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(8, -76 - bob, 1.4, 0, Math.PI * 2);
        ctx.arc(10, -73 - bob, 0.7, 0, Math.PI * 2);
        ctx.fill();

        // Ceja alegre
        ctx.strokeStyle = '#451A03';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(8, -80 - bob, 4, Math.PI * 1.1, Math.PI * 1.9);
        ctx.stroke();

        // Sonrisa
        ctx.strokeStyle = '#1E293B';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(7, -67 - bob, 3.5, 0.2, Math.PI - 0.2);
        ctx.stroke();

        // Accesorio equipado
        this.dibujarAccesorio(ctx, perfil ? perfil.accesorio : 'NINGUNO', bob);

        ctx.restore();
    }

    dibujarAccesorio(ctx, idAccesorio, bob = 0) {
        if (!idAccesorio || idAccesorio === 'NINGUNO') return;

        if (idAccesorio === 'GORRA') {
            ctx.fillStyle = '#DC2626';
            ctx.strokeStyle = '#1E293B';
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.arc(1, -86 - bob, 17, Math.PI * 0.9, Math.PI * 2.1);
            ctx.fill();
            ctx.stroke();
            // Visera deportiva
            ctx.beginPath();
            ctx.roundRect(8, -83 - bob, 17, 5, 2);
            ctx.fill();
            ctx.stroke();
            // Emblema deportivo blanco
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(5, -84 - bob, 2.2, 0, Math.PI * 2);
            ctx.fill();
        } else if (idAccesorio === 'LENTES') {
            ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
            ctx.strokeStyle = '#FBBF24';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(3, -79 - bob, 14, 10, 3);
            ctx.fill();
            ctx.stroke();
            // Destello reflejo en el lente
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.moveTo(6, -77 - bob);
            ctx.lineTo(10, -73 - bob);
            ctx.stroke();
        } else if (idAccesorio === 'AUDIFONOS') {
            ctx.strokeStyle = '#334155';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(1, -78 - bob, 19, Math.PI, Math.PI * 2);
            ctx.stroke();
            // Almohadilla superior
            ctx.strokeStyle = '#7C3AED';
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.arc(1, -78 - bob, 19, Math.PI * 1.25, Math.PI * 1.75);
            ctx.stroke();
            // Almohadilla lateral
            ctx.fillStyle = '#EF4444';
            ctx.strokeStyle = '#1E293B';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(-3, -76 - bob, 10, 14, 4);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#7C3AED';
            ctx.beginPath();
            ctx.roundRect(-1, -74 - bob, 6, 10, 2);
            ctx.fill();
        } else if (idAccesorio === 'SOMBRERO') {
            // Copa del sombrero tradicional de ala ancha de Ica
            ctx.fillStyle = '#FDE68A';
            ctx.strokeStyle = '#1E293B';
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.roundRect(-8, -98 - bob, 18, 14, [6, 6, 0, 0]);
            ctx.fill();
            ctx.stroke();
            // Cinta morada del Señor de Luren
            ctx.fillStyle = '#7C3AED';
            ctx.beginPath();
            ctx.roundRect(-8, -88 - bob, 18, 4, 1);
            ctx.fill();
            ctx.stroke();
            // Ala ancha protectora solar
            ctx.fillStyle = '#FBBF24';
            ctx.beginPath();
            ctx.ellipse(1, -84 - bob, 24, 6.5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        } else if (idAccesorio === 'VISERA') {
            // Banda frontal
            ctx.fillStyle = '#2563EB';
            ctx.strokeStyle = '#1E293B';
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.roundRect(-7, -82 - bob, 17, 5, 2);
            ctx.fill();
            ctx.stroke();
            // Ala curvada hacia adelante
            ctx.fillStyle = '#3B82F6';
            ctx.beginPath();
            ctx.ellipse(12, -80 - bob, 14, 4.5, 0.15, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            // Franja blanca deportiva
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(3, -79.5 - bob, 1.8, 0, Math.PI * 2);
            ctx.fill();
        } else if (idAccesorio === 'CAPA') {
            // Broche pectoral con gema verde
            ctx.fillStyle = '#F59E0B';
            ctx.strokeStyle = '#1E293B';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, -54 - bob, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#10B981';
            ctx.beginPath();
            ctx.arc(0, -54 - bob, 2, 0, Math.PI * 2);
            ctx.fill();
        } else if (idAccesorio === 'CORONA') {
            ctx.fillStyle = '#FBBF24';
            ctx.strokeStyle = '#1E293B';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-10, -90 - bob);
            ctx.lineTo(-12, -102 - bob);
            ctx.lineTo(-5, -96 - bob);
            ctx.lineTo(1, -106 - bob);
            ctx.lineTo(7, -96 - bob);
            ctx.lineTo(14, -102 - bob);
            ctx.lineTo(12, -90 - bob);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            // Gemas esmeralda y rubí
            ctx.fillStyle = '#10B981';
            ctx.beginPath();
            ctx.arc(1, -98 - bob, 2.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#EF4444';
            ctx.beginPath();
            ctx.arc(-5, -94 - bob, 1.6, 0, Math.PI * 2);
            ctx.arc(7, -94 - bob, 1.6, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    dibujarMonstruo(ctx, m) {
        ctx.save();
        ctx.translate(m.x, m.y);

        // Sombra de contacto
        ctx.fillStyle = 'rgba(15, 23, 42, 0.25)';
        ctx.beginPath();
        ctx.ellipse(0, 0, 18, 7, 0, 0, Math.PI * 2);
        ctx.fill();

        const s = m.aparicion;
        ctx.scale(s, s);

        const paso = Math.sin(m.anim) * 5;
        ctx.strokeStyle = '#1E293B';
        ctx.lineWidth = 2.5;

        // Patitas animadas con zapatillas cómicas
        ctx.beginPath();
        ctx.moveTo(-8, -8);
        ctx.lineTo(-11 + paso, 0);
        ctx.moveTo(8, -8);
        ctx.lineTo(11 - paso, 0);
        ctx.stroke();

        ctx.fillStyle = '#1E293B';
        ctx.beginPath();
        ctx.ellipse(-12 + paso, 0, 5, 3, 0, 0, Math.PI * 2);
        ctx.ellipse(12 - paso, 0, 5, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Renderizado volumétrico según la especie del monstruo
        if (m.tipo.id === 'BOTELLIN') {
            // Botellín de plástico PET translúcido con brillo curvo
            const gradBotella = ctx.createLinearGradient(-14, 0, 14, 0);
            gradBotella.addColorStop(0, '#7DD3FC');
            gradBotella.addColorStop(0.3, '#38BDF8');
            gradBotella.addColorStop(1, '#0284C7');

            ctx.fillStyle = gradBotella;
            ctx.beginPath();
            ctx.roundRect(-13, -50, 26, 42, 8);
            ctx.fill();
            ctx.stroke();

            // Reflejo blanco curvo de plástico
            ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
            ctx.beginPath();
            ctx.roundRect(-10, -46, 4, 34, 2);
            ctx.fill();

            // Tapa de botella
            ctx.fillStyle = '#EF4444';
            ctx.beginPath();
            ctx.roundRect(-7, -60, 14, 11, 3);
            ctx.fill();
            ctx.stroke();
        } else if (m.tipo.id === 'CAJETON') {
            // Caja de cartón corrugado kraft con textura y solapas
            const gradCaja = ctx.createLinearGradient(-18, 0, 18, 0);
            gradCaja.addColorStop(0, '#D97706');
            gradCaja.addColorStop(0.5, '#B45309');
            gradCaja.addColorStop(1, '#78350F');

            ctx.fillStyle = gradCaja;
            ctx.beginPath();
            ctx.roundRect(-18, -44, 36, 36, 4);
            ctx.fill();
            ctx.stroke();

            // Cinta de embalaje
            ctx.fillStyle = 'rgba(254, 243, 199, 0.7)';
            ctx.fillRect(-6, -44, 12, 36);

            // Símbolo de reciclaje impreso
            ctx.strokeStyle = '#15803D';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, -18, 6, 0, Math.PI * 2);
            ctx.stroke();
        } else if (m.tipo.id === 'LATOX') {
            // Lata de aluminio metálica brillante
            const gradLata = ctx.createLinearGradient(-14, 0, 14, 0);
            gradLata.addColorStop(0, '#FCA5A5');
            gradLata.addColorStop(0.3, '#FFFFFF');
            gradLata.addColorStop(0.6, '#EF4444');
            gradLata.addColorStop(1, '#991B1B');

            ctx.fillStyle = gradLata;
            ctx.beginPath();
            ctx.roundRect(-14, -46, 28, 38, 7);
            ctx.fill();
            ctx.stroke();

            // Anillo pull-tab en la cabeza
            ctx.strokeStyle = '#CBD5E1';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, -52, 6, 0, Math.PI * 2);
            ctx.stroke();
        } else if (m.tipo.id === 'VASITO') {
            // Vaso descartable estriado
            ctx.fillStyle = '#F8FAFC';
            ctx.beginPath();
            ctx.moveTo(-16, -48);
            ctx.lineTo(16, -48);
            ctx.lineTo(11, -10);
            ctx.lineTo(-11, -10);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Pajilla / sorbete de colores
            ctx.strokeStyle = '#F43F5E';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(3, -48);
            ctx.lineTo(10, -62);
            ctx.stroke();
        } else if (m.tipo.id === 'PERIODICON') {
            // Periódico doblado
            ctx.fillStyle = '#F1F5F9';
            ctx.beginPath();
            ctx.roundRect(-17, -48, 34, 40, 4);
            ctx.fill();
            ctx.stroke();

            // Líneas de texto del periódico
            ctx.strokeStyle = '#94A3B8';
            ctx.lineWidth = 1.5;
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.moveTo(-11, -22 + i * 5);
                ctx.lineTo(11, -22 + i * 5);
                ctx.stroke();
            }
        } else {
            // Atunín (Lata de atún aplastada con colita de pez)
            const gradAtun = ctx.createLinearGradient(-18, 0, 18, 0);
            gradAtun.addColorStop(0, '#E2E8F0');
            gradAtun.addColorStop(0.4, '#FFFFFF');
            gradAtun.addColorStop(1, '#64748B');

            ctx.fillStyle = gradAtun;
            ctx.beginPath();
            ctx.roundRect(-19, -32, 38, 24, 6);
            ctx.fill();
            ctx.stroke();

            // Aleta de pez
            ctx.fillStyle = '#38BDF8';
            ctx.beginPath();
            ctx.moveTo(18, -20);
            ctx.lineTo(26, -26);
            ctx.lineTo(26, -14);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }

        // Ojos de monstruo cómicos y expresivos
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(-6, -30, 6, 0, Math.PI * 2);
        ctx.arc(6, -30, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#1E293B';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Pupilas verdes radioactivas con brillo
        ctx.fillStyle = '#10B981';
        ctx.beginPath();
        ctx.arc(-5, -30, 3, 0, Math.PI * 2);
        ctx.arc(7, -30, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(-6, -31, 1.2, 0, Math.PI * 2);
        ctx.arc(6, -31, 1.2, 0, Math.PI * 2);
        ctx.fill();

        // Boquita traviesa con colmillitos
        ctx.fillStyle = '#1E293B';
        ctx.beginPath();
        ctx.roundRect(-8, -20, 16, 7, 3);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.moveTo(-5, -20); ctx.lineTo(-3, -16); ctx.lineTo(-1, -20);
        ctx.moveTo(1, -20); ctx.lineTo(3, -16); ctx.lineTo(5, -20);
        ctx.fill();

        ctx.restore();
    }

    aclararHex(hex, factor) {
        const c = parseInt(hex.replace('#', ''), 16);
        const r = Math.min(255, Math.round(((c >> 16) & 255) + (255 - ((c >> 16) & 255)) * factor));
        const g = Math.min(255, Math.round(((c >> 8) & 255) + (255 - ((c >> 8) & 255)) * factor));
        const b = Math.min(255, Math.round((c & 255) + (255 - (c & 255)) * factor));
        return `rgb(${r}, ${g}, ${b})`;
    }

    oscurecerHex(hex, factor) {
        const c = parseInt(hex.replace('#', ''), 16);
        const r = Math.max(0, Math.round(((c >> 16) & 255) * (1 - factor)));
        const g = Math.max(0, Math.round(((c >> 8) & 255) * (1 - factor)));
        const b = Math.max(0, Math.round((c & 255) * (1 - factor)));
        return `rgb(${r}, ${g}, ${b})`;
    }

    dibujarLodo(ctx, l) {
        ctx.save();
        ctx.translate(l.x, l.y);

        // Sombra
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.beginPath();
        ctx.ellipse(0, 0, 42, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        const pulso = Math.sin(l.anim) * 0.06;
        ctx.scale(1 + pulso, 1 - pulso);

        // Masa viscosa morada
        ctx.fillStyle = '#8E6BB5';
        ctx.strokeStyle = '#2A2340';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-40, 0);
        ctx.quadraticCurveTo(-48, -18, -32, -26);
        ctx.lineTo(-24, -42);
        ctx.lineTo(-14, -28);
        ctx.lineTo(0, -52);
        ctx.lineTo(12, -30);
        ctx.lineTo(24, -44);
        ctx.quadraticCurveTo(44, -26, 42, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 3 ojos malévolos
        const ojos = [[-14, -18], [2, -22], [18, -16]];
        ojos.forEach(([ox, oy]) => {
            ctx.fillStyle = '#1B1530';
            ctx.beginPath();
            ctx.arc(ox, oy, 4.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#7CFF8A';
            ctx.beginPath();
            ctx.arc(ox + 1, oy, 2, 0, Math.PI * 2);
            ctx.fill();
        });

        // Boca en zigzag
        ctx.strokeStyle = '#1B1530';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-14, -8);
        for (let i = 1; i <= 6; i++) {
            ctx.lineTo(-14 + i * 4.5, i % 2 === 0 ? -8 : -3);
        }
        ctx.stroke();

        ctx.restore();
    }

    dibujarBocadillo(ctx, texto, x, y) {
        ctx.save();
        ctx.font = 'bold 12px "Segoe UI", system-ui, sans-serif';
        const w = ctx.measureText(texto).width + 16;
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#2A2340';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(x - w / 2, y - 20, w, 22, 8);
        ctx.fill();
        ctx.stroke();

        // Pico del bocadillo
        ctx.beginPath();
        ctx.moveTo(x - 4, y + 2);
        ctx.lineTo(x, y + 8);
        ctx.lineTo(x + 4, y + 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#2A2340';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(texto, x, y - 9);
        ctx.restore();
    }

    dibujarEtiquetaMonstruo(ctx, nombre, x, y) {
        ctx.save();
        ctx.font = 'bold 11px "Segoe UI", system-ui, sans-serif';
        const w = ctx.measureText(nombre).width + 14;
        ctx.fillStyle = 'rgba(45, 27, 105, 0.85)';
        ctx.beginPath();
        ctx.roundRect(x - w / 2, y, w, 18, 6);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(nombre, x, y + 9);
        ctx.restore();
    }

    dibujarEstrellaForma(ctx, cx, cy, radio, color) {
        ctx.save();
        ctx.fillStyle = color;
        ctx.strokeStyle = '#2A2340';
        ctx.lineWidth = 3;
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

    dibujarBarraInvasion(ctx) {
        const x = this.ESC_DER - 280;
        const y = this.ESC_ABA - 38;
        const w = 175;
        const h = 24;

        ctx.fillStyle = 'rgba(42, 35, 64, 0.85)';
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, 10);
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.8;
        ctx.stroke();

        const pct = Math.min(1, this.monstruos.length / this.MAX_INVASION);
        ctx.fillStyle = pct > 0.7 ? '#FF6B6B' : (pct > 0.4 ? '#FFA726' : '#6EE7B7');
        ctx.beginPath();
        ctx.roundRect(x + 3, y + 3, (w - 6) * pct, h - 6, 8);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 11px "Segoe UI", system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`INVASIÓN: ${this.monstruos.length}/${this.MAX_INVASION}`, x + w / 2, y + h / 2);
    }

    dibujarRanurasMochila(ctx) {
        const x = this.ESC_X + 14;
        const y = this.ESC_ABA - 46;
        const h = 42;
        const slotTam = 32;
        const slotGap = 6;
        const totalRanurasW = this.CAPACIDAD_MOCHILA * slotTam + (this.CAPACIDAD_MOCHILA - 1) * slotGap;
        const boxW = 122 + totalRanurasW + 12;

        ctx.save();
        // Contenedor blanco con contorno de caricatura
        ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
        ctx.strokeStyle = '#2A2340';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(x, y, boxW, h, 14);
        ctx.fill();
        ctx.stroke();

        // Texto del encabezado de la mochila
        ctx.fillStyle = '#2A2340';
        ctx.font = '900 12px "Segoe UI", system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(`MOCHILA (${this.mochila.length}/${this.CAPACIDAD_MOCHILA}):`, x + 12, y + h / 2);

        let tooltipInfo = null;

        for (let i = 0; i < this.CAPACIDAD_MOCHILA; i++) {
            const sx = x + 122 + i * (slotTam + slotGap);
            const sy = y + (h - slotTam) / 2;
            const m = this.mochila[i];

            // Comprobar si el cursor está sobre la ranura
            const hovered = m && (this.ratonX >= sx && this.ratonX <= sx + slotTam && this.ratonY >= sy && this.ratonY <= sy + slotTam);

            if (!m) {
                // Ranura vacía (líneas discontinuas sutiles)
                ctx.fillStyle = 'rgba(241, 245, 249, 0.75)';
                ctx.strokeStyle = '#94A3B8';
                ctx.lineWidth = 1.8;
                ctx.setLineDash([3, 3]);
                ctx.beginPath();
                ctx.roundRect(sx, sy, slotTam, slotTam, 8);
                ctx.fill();
                ctx.stroke();
                ctx.setLineDash([]);
            } else {
                const mat = this.MATERIALES[m.material] || { color: '#64748B', titulo: m.material };

                // Ranura ocupada con contorno y fondo limpio
                ctx.fillStyle = hovered ? '#FEF9C3' : '#FFFFFF';
                ctx.strokeStyle = hovered ? '#EAB308' : '#2A2340';
                ctx.lineWidth = hovered ? 3 : 2.2;
                ctx.beginPath();
                ctx.roundRect(sx, sy - (hovered ? 2 : 0), slotTam, slotTam, 8);
                ctx.fill();
                ctx.stroke();

                // Banda inferior del color del material correspondiente (Plástico, Papel, Metal)
                ctx.fillStyle = mat.color;
                ctx.fillRect(sx + 2, sy + slotTam - 5 - (hovered ? 2 : 0), slotTam - 4, 3.5);

                // Dibujar el icono gráfico representativo del residuo
                const cx = sx + slotTam / 2;
                const cy = sy + (slotTam - 4) / 2 - (hovered ? 2 : 0);
                this.dibujarMiniIconoResiduo(ctx, m.id, cx, cy);

                if (hovered) {
                    tooltipInfo = {
                        texto: `${m.nombre} → ${mat.titulo}`,
                        x: cx,
                        y: sy - 10,
                        color: mat.color
                    };
                }
            }
        }

        // Si hay una ranura en hover, dibujar un globito con el nombre del residuo y tacho
        if (tooltipInfo) {
            ctx.font = 'bold 11px "Segoe UI", system-ui, sans-serif';
            const tw = ctx.measureText(tooltipInfo.texto).width + 16;
            ctx.fillStyle = '#2A2340';
            ctx.strokeStyle = tooltipInfo.color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(tooltipInfo.x - tw / 2, tooltipInfo.y - 20, tw, 20, 6);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#FFFFFF';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(tooltipInfo.texto, tooltipInfo.x, tooltipInfo.y - 10);
        }

        ctx.restore();
    }

    dibujarMiniIconoResiduo(ctx, tipoId, cx, cy) {
        ctx.save();
        ctx.strokeStyle = '#2A2340';
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        switch (tipoId) {
            case 'BOTELLIN': {
                // Botellita de plástico PET celeste con tapa roja
                ctx.lineWidth = 1.6;
                // Cuerpo
                ctx.fillStyle = '#38BDF8';
                ctx.beginPath();
                ctx.roundRect(cx - 5.5, cy - 5, 11, 14, 3);
                ctx.fill();
                ctx.stroke();

                // Cuello
                ctx.fillStyle = '#7DD3FC';
                ctx.beginPath();
                ctx.rect(cx - 2.5, cy - 9, 5, 4);
                ctx.fill();
                ctx.stroke();

                // Tapa roja
                ctx.fillStyle = '#EF4444';
                ctx.beginPath();
                ctx.roundRect(cx - 4, cy - 12, 8, 3.5, 1.5);
                ctx.fill();
                ctx.stroke();

                // Brillo vertical blanco
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 1.4;
                ctx.beginPath();
                ctx.moveTo(cx - 2.5, cy - 3);
                ctx.lineTo(cx - 2.5, cy + 6);
                ctx.stroke();
                break;
            }

            case 'CAJETON': {
                // Caja de cartón marrón con cinta adhesiva y solapa
                ctx.lineWidth = 1.6;
                ctx.fillStyle = '#D97706';
                ctx.beginPath();
                ctx.roundRect(cx - 8, cy - 7, 16, 15, 2.5);
                ctx.fill();
                ctx.stroke();

                // Cinta de embalaje beige central
                ctx.fillStyle = '#FEF3C7';
                ctx.fillRect(cx - 2.5, cy - 7, 5, 15);

                // Línea de pliegue de las solapas
                ctx.strokeStyle = '#92400E';
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.moveTo(cx - 8, cy - 3);
                ctx.lineTo(cx, cy - 1);
                ctx.lineTo(cx + 8, cy - 3);
                ctx.stroke();

                // Mini símbolo de reciclaje verde en la caja
                ctx.strokeStyle = '#15803D';
                ctx.lineWidth = 1.4;
                ctx.beginPath();
                ctx.arc(cx, cy + 3.5, 3, 0, Math.PI * 1.5);
                ctx.stroke();
                break;
            }

            case 'LATOX': {
                // Lata de gaseosa roja con brillo y anilla
                ctx.lineWidth = 1.6;
                ctx.fillStyle = '#EF4444';
                ctx.beginPath();
                ctx.roundRect(cx - 6, cy - 6, 12, 16, 3);
                ctx.fill();
                ctx.stroke();

                // Tapa metálica gris
                ctx.fillStyle = '#E2E8F0';
                ctx.beginPath();
                ctx.ellipse(cx, cy - 6, 6, 2.5, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                // Anilla pull-tab
                ctx.strokeStyle = '#94A3B8';
                ctx.lineWidth = 1.4;
                ctx.beginPath();
                ctx.arc(cx, cy - 8.5, 2, 0, Math.PI * 2);
                ctx.stroke();

                // Franja blanca ondulada (estilo refresco)
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(cx - 5, cy);
                ctx.quadraticCurveTo(cx, cy + 3, cx + 5, cy - 1);
                ctx.stroke();
                break;
            }

            case 'VASITO': {
                // Vaso descartable blanco con sorbete rojo
                // Sorbete saliendo inclinado
                ctx.strokeStyle = '#F43F5E';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(cx + 1, cy - 6);
                ctx.lineTo(cx + 5, cy - 12);
                ctx.stroke();

                // Cuerpo cónico del vaso
                ctx.lineWidth = 1.6;
                ctx.fillStyle = '#F8FAFC';
                ctx.beginPath();
                ctx.moveTo(cx - 7, cy - 6);
                ctx.lineTo(cx + 7, cy - 6);
                ctx.lineTo(cx + 4.5, cy + 9);
                ctx.lineTo(cx - 4.5, cy + 9);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                // Borde / reborde superior
                ctx.fillStyle = '#E2E8F0';
                ctx.beginPath();
                ctx.ellipse(cx, cy - 6, 7, 2, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                // Estrías horizontales del vaso
                ctx.strokeStyle = '#CBD5E1';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(cx - 5.5, cy - 1);
                ctx.lineTo(cx + 5.5, cy - 1);
                ctx.moveTo(cx - 4.5, cy + 4);
                ctx.lineTo(cx + 4.5, cy + 4);
                ctx.stroke();
                break;
            }

            case 'PERIODICON': {
                // Periódico doblado con líneas de noticias
                ctx.lineWidth = 1.6;
                ctx.fillStyle = '#F1F5F9';
                ctx.beginPath();
                ctx.roundRect(cx - 7.5, cy - 8, 15, 17, 2);
                ctx.fill();
                ctx.stroke();

                // Esquina doblada
                ctx.fillStyle = '#CBD5E1';
                ctx.beginPath();
                ctx.moveTo(cx + 3.5, cy - 8);
                ctx.lineTo(cx + 7.5, cy - 4);
                ctx.lineTo(cx + 3.5, cy - 4);
                ctx.closePath();
                ctx.fill();

                // Cabecera del diario
                ctx.fillStyle = '#334155';
                ctx.fillRect(cx - 5.5, cy - 5.5, 7, 2.5);

                // Líneas de texto simuladas
                ctx.strokeStyle = '#94A3B8';
                ctx.lineWidth = 1.2;
                for (let i = 0; i < 3; i++) {
                    ctx.beginPath();
                    ctx.moveTo(cx - 5.5, cy - 0.5 + i * 3.2);
                    ctx.lineTo(cx + 5.5, cy - 0.5 + i * 3.2);
                    ctx.stroke();
                }
                break;
            }

            case 'ATUNIN': {
                // Lata de atún ovalada baja con aleta
                ctx.lineWidth = 1.6;
                // Cuerpo de la lata
                ctx.fillStyle = '#94A3B8';
                ctx.beginPath();
                ctx.roundRect(cx - 8, cy - 3, 16, 11, 2.5);
                ctx.fill();
                ctx.stroke();

                // Tapa ovalada
                ctx.fillStyle = '#E2E8F0';
                ctx.beginPath();
                ctx.ellipse(cx, cy - 3, 8, 3, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                // Etiqueta azul de atún
                ctx.fillStyle = '#0284C7';
                ctx.fillRect(cx - 7.5, cy + 1, 15, 5);

                // Silueta de pececito amarillo
                ctx.fillStyle = '#FBBF24';
                ctx.beginPath();
                ctx.ellipse(cx, cy + 3.5, 3, 1.5, 0, 0, Math.PI * 2);
                ctx.fill();

                // Anillita de apertura en la tapa
                ctx.strokeStyle = '#64748B';
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.arc(cx - 2, cy - 3.5, 1.8, 0, Math.PI * 2);
                ctx.stroke();
                break;
            }

            default: {
                // Fallback: esfera genérica con signo ?
                ctx.fillStyle = '#FFD84D';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.arc(cx, cy, 6, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                break;
            }
        }

        ctx.restore();
    }

    // Interacción por clic o toque en el suelo o tachos
    alPresionar(x, y) {
        // Clic en un tacho para caminar automáticamente frente a él
        for (const t of this.tachos) {
            if (x >= t.x && x <= t.x + t.w && y >= t.y && y <= t.y + t.h) {
                this.destinoRaton = { x: t.x + t.w / 2, y: 352 };
                return;
            }
        }

        // Clic en el suelo de la plaza
        if (x >= this.MIN_X && x <= this.MAX_X && y >= this.MIN_Y && y <= this.MAX_Y) {
            this.destinoRaton = { x, y };
        }
    }
}

// Registrar en el objeto global de la ventana
window.LimpiezaMonstruosa = LimpiezaMonstruosa;

