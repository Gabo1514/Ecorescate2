/**
 * Operación EcoRescate - Clase Base de Minijuegos (MinijuegoBase)
 * Implementa ciclo a 60 fps (requestAnimationFrame + delta time), canvas responsivo
 * de coordenadas virtuales (1000x640), combo con palabras animadas, sacudida de pantalla,
 * partículas de confeti, controles táctiles y de teclado, HUD educativo, modales
 * interactivos de aprendizaje y cálculo de impacto social.
 */
class MinijuegoBase {
    constructor(canvas, tipoJuegoId) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.tipoId = tipoJuegoId;
        this.tipo = JUEGOS[tipoJuegoId];

        // Dimensiones lógicas virtuales
        this.ANCHO = 1000;
        this.ALTO = 640;
        this.ESC_X = 22;
        this.ESC_Y = 110;
        this.ESC_W = 956;
        this.ESC_H = 464;
        this.ESC_DER = this.ESC_X + this.ESC_W;
        this.ESC_ABA = this.ESC_Y + this.ESC_H;

        // Estados: INTRO, JUGANDO, PAUSA, PREGUNTA, FIN
        this.estado = 'INTRO';
        this.nivelNumero = 1;
        this.def = this.tipo.niveles[0];

        // Puntuación y progreso
        this.puntaje = 0;
        this.aciertos = 0;
        this.errores = 0;
        this.racha = 0;
        this.mejorCombo = 1;
        this.medidor = 1.0; // 0.0 a 1.0
        this.tiempoJuego = 0;
        this.relojTotal = 0;
        this.tiempoLimite = 120;
        this.progresoRetos = {};

        // Efectos visuales y jugosidad (Game Juice)
        this.sacudida = 0;
        this.confetiParticulas = [];
        this.chispasParticulas = [];
        this.textosFlotantes = [];
        this.palabraCombo = null; // { texto, tiempo, duracion, x, y }

        // Mecánicas de enganche infantil (Eco-Frenesí, Burbujas y Mascota)
        this.frenesiActivo = false;
        this.frenesiTiempo = 0;
        this.ecoBurbujas = [];
        this.siguienteBurbuja = 12 + Math.random() * 8;
        this.mascotaMensaje = null;
        this.tiempoEnVictoria = 0;
        this.estrellasSonadas = [false, false, false];
        this._avisoPocoTiempo = false;

        // Mensaje y pistas educativas
        this.mensajeToast = null; // { texto, esError, tiempo }
        this.datoCurioso = null;
        this.datoPendiente = 25; // aparece a mitad de nivel
        this.datoMostrado = false;
        this.modalDatoActivo = false;

        // Desafío del Saber (preguntas para niveles 3, 6, 9, 10)
        this.preguntaActiva = null;
        this.respuestaSeleccionada = -1;
        this.mostrarExplicacionPregunta = false;

        // Resultados finales
        this.gano = false;
        this.motivoFin = '';
        this.estrellasNivel = 0;
        this.recompensa = null;
        this.animacionEstrellas = 0;

        // Controles de entrada
        this.ratonX = -100;
        this.ratonY = -100;
        this.teclasPresionadas = {};
        this.esDispositivoTactil = false;
        this.dpadActivo = { up: false, down: false, left: false, right: false, action: false };

        // Animación loop
        this.animId = null;
        this.ultimoTick = 0;

        // Enlace de eventos
        this.vincularEventos();
        this.ajustarTamano();
    }

    ajustarTamano() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        const displayWidth = rect.width > 0 ? rect.width : (this.canvas.parentElement ? this.canvas.parentElement.clientWidth : 1000) || 1000;
        const displayHeight = rect.height > 0 ? rect.height : Math.round((displayWidth * 640) / 1000);

        const targetW = Math.max(300, Math.round(displayWidth * dpr));
        const targetH = Math.max(200, Math.round(displayHeight * dpr));

        if (this.canvas.width !== targetW || this.canvas.height !== targetH) {
            this.canvas.width = targetW;
            this.canvas.height = targetH;
        }

        this.escala = Math.max(0.1, Math.min(this.canvas.width / this.ANCHO, this.canvas.height / this.ALTO));
        this.despX = (this.canvas.width - this.ANCHO * this.escala) / 2;
        this.despY = (this.canvas.height - this.ALTO * this.escala) / 2;
    }

    pantallaALienzo(clientX, clientY) {
        const rect = this.canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        const canvasX = (clientX - rect.left) * dpr;
        const canvasY = (clientY - rect.top) * dpr;
        const x = (canvasX - this.despX) / this.escala;
        const y = (canvasY - this.despY) / this.escala;
        return { x, y };
    }

    vincularEventos() {
        this._onResize = () => this.ajustarTamano();
        window.addEventListener('resize', this._onResize);

        const canvas = this.canvas;
        this._onPointerDown = (e) => {
            if (this.estado === 'DETENIDO') return;
            this.esDispositivoTactil = e.pointerType === 'touch';
            const { x, y } = this.pantallaALienzo(e.clientX, e.clientY);
            this.manejarPresionar(x, y);
        };
        canvas.addEventListener('pointerdown', this._onPointerDown);

        this._onPointerMove = (e) => {
            if (this.estado === 'DETENIDO') return;
            const { x, y } = this.pantallaALienzo(e.clientX, e.clientY);
            this.ratonX = x;
            this.ratonY = y;
            if (this.estado === 'JUGANDO') {
                this.alMover(x, y);
            }
        };
        canvas.addEventListener('pointermove', this._onPointerMove);

        this._onPointerUp = (e) => {
            if (this.estado === 'DETENIDO') return;
            const { x, y } = this.pantallaALienzo(e.clientX, e.clientY);
            this.manejarSoltar(x, y);
        };
        canvas.addEventListener('pointerup', this._onPointerUp);

        this._onKeyDown = (e) => {
            if (this.estado === 'DETENIDO') return;
            this.teclasPresionadas[e.code] = true;
            if (e.code === 'KeyP') {
                this.alternarPausa();
                return;
            }
            if (this.estado === 'JUGANDO') {
                this.alTeclaPresionada(e.code);
            }
        };
        window.addEventListener('keydown', this._onKeyDown);

        this._onKeyUp = (e) => {
            if (this.estado === 'DETENIDO') return;
            this.teclasPresionadas[e.code] = false;
            if (this.estado === 'JUGANDO') {
                this.alTeclaSoltada(e.code);
            }
        };
        window.addEventListener('keyup', this._onKeyUp);
    }

    desvincularEventos() {
        if (this._onResize) window.removeEventListener('resize', this._onResize);
        if (this._onKeyDown) window.removeEventListener('keydown', this._onKeyDown);
        if (this._onKeyUp) window.removeEventListener('keyup', this._onKeyUp);
        if (this.canvas) {
            if (this._onPointerDown) this.canvas.removeEventListener('pointerdown', this._onPointerDown);
            if (this._onPointerMove) this.canvas.removeEventListener('pointermove', this._onPointerMove);
            if (this._onPointerUp) this.canvas.removeEventListener('pointerup', this._onPointerUp);
        }
    }

    cargarNivel(numero) {
        this.nivelNumero = Math.max(1, Math.min(10, numero));
        this.def = this.tipo.niveles[this.nivelNumero - 1];
        this.tiempoLimite = this.def.tiempo;
        this.tiempoJuego = 0;
        this.progresoRetos = {};
        this.def.retos.forEach(r => {
            this.progresoRetos[r.clave] = 0;
        });

        // Configurar dato curioso para este nivel
        const datos = this.tipo.datos;
        this.datoCurioso = datos[(this.nivelNumero - 1) % datos.length];
        this.datoPendiente = Math.round(this.tiempoLimite * 0.45);
        this.datoMostrado = false;
        this.modalDatoActivo = false;

        this.puntaje = 0;
        this.aciertos = 0;
        this.errores = 0;
        this.racha = 0;
        this.mejorCombo = 1;
        this.medidor = 1.0;
        this.gano = false;
        this.motivoFin = '';
        this.estrellasNivel = 0;
        this.recompensa = null;
        this.mensajeToast = null;
        this.palabraCombo = null;
        this.confetiParticulas = [];
        this.chispasParticulas = [];
        this.textosFlotantes = [];
        this.frenesiActivo = false;
        this.frenesiTiempo = 0;
        this.ecoBurbujas = [];
        this.siguienteBurbuja = 12 + Math.random() * 8;
        this.mascotaMensaje = { texto: `¡Nivel ${this.nivelNumero}! ¡Tú puedes, Eco-Héroe!`, tiempo: 3.5 };
        this.tiempoEnVictoria = 0;
        this.estrellasSonadas = [false, false, false];
        this._avisoPocoTiempo = false;
        this.preguntaActiva = null;
        this.respuestaSeleccionada = -1;
        this.mostrarExplicacionPregunta = false;

        this.reiniciar();
        this.estado = 'INTRO';
        window.audioEco.nivel();
    }

    iniciarPartida() {
        this.estado = 'JUGANDO';
        this.tiempoJuego = 0;
        this.ultimoTick = performance.now();
        window.audioEco.nivel();
        window.audioEco.iniciarMusica();
    }

    alternarPausa() {
        if (this.estado === 'JUGANDO') {
            this.estado = 'PAUSA';
            window.audioEco.detenerMusica();
        } else if (this.estado === 'PAUSA') {
            this.estado = 'JUGANDO';
            this.ultimoTick = performance.now();
            window.audioEco.iniciarMusica();
        }
    }

    // Loop a 60 fps con protección contra congelamiento
    arrancar() {
        if (this.animId) cancelAnimationFrame(this.animId);
        this.ultimoTick = performance.now();
        const bucle = (ahora) => {
            try {
                const dt = Math.min(0.1, (ahora - this.ultimoTick) / 1000);
                this.ultimoTick = ahora;
                this.actualizarComun(dt);
                this.dibujarTodo();
            } catch (err) {
                console.error('Error en loop de juego prevenido:', err);
            }
            this.animId = requestAnimationFrame(bucle);
        };
        this.animId = requestAnimationFrame(bucle);
    }

    detener() {
        this.estado = 'DETENIDO';
        if (this.animId) {
            cancelAnimationFrame(this.animId);
            this.animId = null;
        }
        this.desvincularEventos();
        window.audioEco.detenerMusica();
    }

    // Actualizaciones de lógica común
    actualizarComun(dt) {
        this.relojTotal += dt;

        // Disminución de sacudida
        if (this.sacudida > 0) {
            this.sacudida = Math.max(0, this.sacudida - dt * 2.5);
        }

        // Actualizar partículas y textos flotantes
        this.actualizarParticulas(dt);

        // Actualizar palabras de combo
        if (this.palabraCombo) {
            this.palabraCombo.tiempo += dt;
            if (this.palabraCombo.tiempo >= this.palabraCombo.duracion) {
                this.palabraCombo = null;
            }
        }

        // Actualizar mensaje toast
        if (this.mensajeToast) {
            this.mensajeToast.tiempo -= dt;
            if (this.mensajeToast.tiempo <= 0) {
                this.mensajeToast = null;
            }
        }

        // Actualizar mensaje de la mascota Chaski
        if (this.mascotaMensaje) {
            this.mascotaMensaje.tiempo -= dt;
            if (this.mascotaMensaje.tiempo <= 0) {
                this.mascotaMensaje = null;
            }
        }

        // Si estamos en pantalla de FIN, contar tiempo para celebración de estrellas
        if (this.estado === 'FIN') {
            this.tiempoEnVictoria += dt;
            if (this.gano) {
                if (this.tiempoEnVictoria >= 0.35 && !this.estrellasSonadas[0] && this.estrellasNivel >= 1) {
                    this.estrellasSonadas[0] = true;
                    if (window.audioEco.estrellaImpacto) window.audioEco.estrellaImpacto(0);
                }
                if (this.tiempoEnVictoria >= 0.75 && !this.estrellasSonadas[1] && this.estrellasNivel >= 2) {
                    this.estrellasSonadas[1] = true;
                    if (window.audioEco.estrellaImpacto) window.audioEco.estrellaImpacto(1);
                }
                if (this.tiempoEnVictoria >= 1.15 && !this.estrellasSonadas[2] && this.estrellasNivel >= 3) {
                    this.estrellasSonadas[2] = true;
                    if (window.audioEco.estrellaImpacto) window.audioEco.estrellaImpacto(2);
                    this.crearConfeti(60);
                }
            }
        }

        // Si estamos jugando, correr tiempo y reglas
        if (this.estado === 'JUGANDO') {
            this.tiempoJuego += dt;

            // Actualizar modo Eco-Frenesí
            if (this.frenesiActivo) {
                this.frenesiTiempo -= dt;
                if (this.frenesiTiempo <= 0) {
                    this.frenesiActivo = false;
                    this.frenesiTiempo = 0;
                } else if (Math.random() < 0.28) {
                    this.crearChispas(this.ESC_X + Math.random() * this.ESC_W, this.ESC_Y + Math.random() * this.ESC_H, '#F59E0B', 2);
                }
            }

            // Generar Eco-Burbujas flotantes de recompensa periódicas
            this.siguienteBurbuja -= dt;
            if (this.siguienteBurbuja <= 0 && this.ecoBurbujas.length < 2) {
                this.spawnEcoBurbuja();
                this.siguienteBurbuja = 14 + Math.random() * 8;
            }

            // Mover y actualizar Eco-Burbujas
            for (let i = this.ecoBurbujas.length - 1; i >= 0; i--) {
                const b = this.ecoBurbujas[i];
                b.tiempo += dt;
                b.x += b.vx * dt;
                b.y += b.vy * dt + Math.sin(b.tiempo * 3) * 0.45;
                b.rotacion += dt * 1.5;
                b.vida -= dt;
                if (b.vida <= 0 || b.x < this.ESC_X - 40 || b.x > this.ESC_DER + 40 || b.y < this.ESC_Y - 40 || b.y > this.ESC_ABA + 40) {
                    this.ecoBurbujas.splice(i, 1);
                }
            }

            // Aviso oportuno de poco tiempo restante
            if (this.tiempoLimite - this.tiempoJuego <= 16 && !this._avisoPocoTiempo) {
                this._avisoPocoTiempo = true;
                this.hablarMascota('¡Quedan pocos segundos! ¡Rápido!');
            }

            // Revisar tiempo agotado
            if (this.tiempoJuego >= this.tiempoLimite) {
                this.terminarNivel(false, '¡Se agotó el tiempo!');
                return;
            }

            // Revisar medidor agotado
            if (this.medidor <= 0.001) {
                this.terminarNivel(false, this.motivoDerrota());
                return;
            }

            // Revisar dato curioso a mitad de nivel
            if (!this.datoMostrado && this.tiempoJuego >= this.datoPendiente) {
                this.datoMostrado = true;
                this.mostrarDatoCurioso();
            }

            // Revisar cumplimiento de retos
            if (this.verificarRetosCompletados()) {
                this.terminarNivel(true, '¡Retos completados!');
                return;
            }

            // Actualización específica de cada minijuego
            this.actualizar(dt);
        }
    }

    crearTextoFlotante(texto, x, y, color = '#10B981', escala = 1.0) {
        this.textosFlotantes.push({
            texto,
            x: Math.max(this.ESC_X + 50, Math.min(this.ESC_DER - 50, x)),
            y: Math.max(this.ESC_Y + 40, Math.min(this.ESC_ABA - 40, y)),
            color,
            vy: -55,
            alfa: 1.0,
            escala,
            tiempo: 0,
            duracion: 1.15
        });
    }

    activarFrenesi(duracion = 7.0) {
        this.frenesiActivo = true;
        this.frenesiTiempo = duracion;
        if (window.audioEco.frenesi) window.audioEco.frenesi();
        else window.audioEco.poder();
        this.crearChispas(this.ANCHO / 2, 240, '#F59E0B', 35);
        this.crearTextoFlotante('¡ECO-FRENESÍ! PUNTOS ×2', this.ANCHO / 2, 230, '#F59E0B', 1.45);
        this.hablarMascota('¡ECO-FRENESÍ! ¡Puntos dobles!');
    }

    spawnEcoBurbuja() {
        const tipos = ['TIEMPO', 'MONEDAS', 'FRENESI'];
        const tipo = tipos[Math.floor(Math.random() * tipos.length)];
        const radio = 25;
        const ladoIzquierdo = Math.random() < 0.5;
        const x = ladoIzquierdo ? this.ESC_X + 24 : this.ESC_DER - 24;
        const y = this.ESC_Y + 70 + Math.random() * (this.ESC_H - 140);
        const vx = (ladoIzquierdo ? 1 : -1) * (26 + Math.random() * 22);
        const vy = (Math.random() - 0.5) * 16;

        this.ecoBurbujas.push({
            tipo,
            x,
            y,
            radio,
            vx,
            vy,
            rotacion: 0,
            tiempo: 0,
            vida: 14.0
        });
    }

    explotarEcoBurbuja(b, indice) {
        this.ecoBurbujas.splice(indice, 1);
        if (window.audioEco.burbuja) window.audioEco.burbuja();
        else window.audioEco.estrella();

        const col = b.tipo === 'TIEMPO' ? '#38BDF8' : (b.tipo === 'MONEDAS' ? '#F59E0B' : '#A855F7');
        this.crearChispas(b.x, b.y, col, 24);

        if (b.tipo === 'TIEMPO') {
            this.tiempoLimite += 7;
            this.crearTextoFlotante('+7s TIEMPO EXTRA', b.x, b.y, '#38BDF8', 1.3);
            this.hablarMascota('¡+7 segundos de tiempo extra!');
        } else if (b.tipo === 'MONEDAS') {
            this.puntaje += 40;
            const perfil = window.storageEco.obtenerPerfil();
            if (perfil) {
                perfil.monedas = (perfil.monedas || 0) + 15;
                window.storageEco.guardarPerfiles();
            }
            if (window.audioEco.moneda) window.audioEco.moneda();
            this.crearTextoFlotante('+15 EcoMonedas', b.x, b.y, '#F59E0B', 1.3);
            this.hablarMascota('¡Bonus: +15 EcoMonedas!');
        } else if (b.tipo === 'FRENESI') {
            this.activarFrenesi(8.0);
        }
    }

    hablarMascota(texto, duracion = 3.2) {
        this.mascotaMensaje = { texto, tiempo: duracion };
    }

    mostrarDatoCurioso() {
        this.modalDatoActivo = true;
        this.estado = 'PAUSA';
        window.audioEco.estrella();
    }

    cerrarDatoCurioso() {
        this.modalDatoActivo = false;
        this.estado = 'JUGANDO';
        this.ultimoTick = performance.now();
    }

    // Aciertos, errores y combos
    acierto(ptsBase = 10, x = null, y = null, claveReto = null, textoEspecial = null) {
        let clave = claveReto;
        let pts = ptsBase;
        if (typeof ptsBase === 'string') {
            clave = ptsBase;
            pts = 10;
        }
        this.registrarAcierto(clave, 1, pts, x, y, textoEspecial);
        if (typeof x === 'number' && typeof y === 'number') {
            this.crearChispas(x, y, this.frenesiActivo ? '#F59E0B' : '#FFD84D', 14);
        }
    }

    registrarAcierto(claveReto = null, cantidad = 1, ptsBase = 10, x = null, y = null, textoEspecial = null) {
        this.racha++;
        if (this.racha > this.mejorCombo) {
            this.mejorCombo = this.racha;
        }

        let multiplicador = Math.min(5, Math.floor((this.racha - 1) / 2) + 1);
        if (this.frenesiActivo) {
            multiplicador *= 2;
        }
        const puntosGanados = ptsBase * multiplicador;
        this.puntaje += puntosGanados;
        this.aciertos += cantidad;

        // Avanzar reto si corresponde
        if (claveReto && this.progresoRetos[claveReto] !== undefined) {
            this.progresoRetos[claveReto] += cantidad;
        }
        if (this.progresoRetos['ACIERTOS'] !== undefined) {
            this.progresoRetos['ACIERTOS'] += cantidad;
        }
        if (this.progresoRetos['COMBO'] !== undefined && this.racha >= this.progresoRetos['COMBO']) {
            this.progresoRetos['COMBO'] = this.racha;
        }

        // Sonido y palabras de racha
        window.audioEco.acierto(multiplicador);

        // Texto flotante de gratificación instantánea
        const posX = x !== null ? x : (this.ANCHO / 2 + (Math.random() - 0.5) * 80);
        const posY = y !== null ? y : (this.ALTO / 2 - 30);
        const txtAcierto = textoEspecial ? `+${puntosGanados} ${textoEspecial}` : (this.frenesiActivo ? `+${puntosGanados} ¡FRENESÍ!` : (this.racha >= 2 ? `+${puntosGanados} ¡COMBO ×${multiplicador}!` : `+${puntosGanados}`));
        const colAcierto = this.frenesiActivo ? '#F59E0B' : (this.racha >= 3 ? '#A855F7' : '#10B981');
        this.crearTextoFlotante(txtAcierto, posX, posY, colAcierto, this.racha >= 3 ? 1.25 : 1.1);

        // Disparar Eco-Frenesí al llegar a racha 4
        if (this.racha === 4 && !this.frenesiActivo) {
            this.activarFrenesi(7.0);
        }

        if (this.racha >= 2) {
            let texto = '¡BIEN!';
            if (this.racha >= 8) texto = '¡LEGENDARIO!';
            else if (this.racha >= 6) texto = '¡ECO-HÉROE!';
            else if (this.racha >= 4) texto = '¡IMPARABLE!';
            else if (this.racha >= 3) texto = '¡GENIAL!';

            this.palabraCombo = {
                texto: `${texto} ×${multiplicador}`,
                tiempo: 0,
                duracion: 0.95,
                x: this.ANCHO / 2,
                y: 280
            };
            if (this.racha === 3 || this.racha === 5 || this.racha === 7) {
                window.audioEco.combo();
                this.crearChispas(this.ANCHO / 2, 280, '#FFD84D', 22);
                this.hablarMascota(this.racha >= 6 ? '¡Racha asombrosa, eres un maestro!' : '¡Genial combo! ¡No te detengas!');
            }
        }
    }

    registrarError(explicacion = null, penalizacionMedidor = 0.25) {
        this.racha = 0;
        this.frenesiActivo = false;
        this.frenesiTiempo = 0;
        this.errores++;
        this.medidor = Math.max(0, this.medidor - penalizacionMedidor);
        this.sacudida = 0.4;
        window.audioEco.error();

        if (explicacion) {
            this.mensajeToast = {
                texto: explicacion,
                esError: true,
                tiempo: 3.5
            };
            this.hablarMascota('¡Cuidado! ' + explicacion);
        } else {
            this.hablarMascota('¡Concéntrate! ¡Tú puedes hacerlo bien!');
        }
    }

    verificarRetosCompletados() {
        for (const r of this.def.retos) {
            const actual = this.progresoRetos[r.clave] || 0;
            if (actual < r.meta) return false;
        }
        return true;
    }

    terminarNivel(ganado, motivo) {
        this.gano = ganado;
        this.motivoFin = motivo;
        window.audioEco.detenerMusica();

        if (ganado) {
            this.estrellasNivel = calcularEstrellas(this.def, true, this.errores, this.tiempoJuego);
            window.audioEco.victoria();
            this.crearConfeti(90);

            // Pregunta del Desafío del Saber para niveles 3, 6, 9 y 10
            if (this.nivelNumero === 3 || this.nivelNumero === 6 || this.nivelNumero === 9 || this.nivelNumero === 10) {
                const listaP = this.tipo.preguntas;
                this.preguntaActiva = listaP[Math.floor(Math.random() * listaP.length)];
                this.respuestaSeleccionada = -1;
                this.mostrarExplicacionPregunta = false;
                this.estado = 'PREGUNTA';
                return;
            }
        } else {
            this.estrellasNivel = 0;
            window.audioEco.derrota();
        }

        this.finalizarPartida(null);
    }

    responderPregunta(indice) {
        if (this.respuestaSeleccionada >= 0) return;
        this.respuestaSeleccionada = indice;
        this.mostrarExplicacionPregunta = true;

        const esCorrecta = indice === this.preguntaActiva.correcta;
        if (esCorrecta) {
            this.puntaje += 30;
            window.audioEco.combo();
            this.crearChispas(this.ANCHO / 2, 330, '#6EE7B7', 30);
        } else {
            window.audioEco.error();
        }
    }

    continuarDespuesDePregunta() {
        const esCorrecta = this.respuestaSeleccionada === this.preguntaActiva.correcta;
        this.finalizarPartida(esCorrecta);
    }

    finalizarPartida(preguntaCorrecta = null) {
        this.estado = 'FIN';

        // Calcular impacto social
        const factorAcierto = this.tipo.impactoPorAcierto || 0;
        const factorNivel = this.tipo.impactoPorNivel || 0;
        const impactoTotal = (this.aciertos * factorAcierto) + (this.gano ? factorNivel : 0);

        // Guardar en Storage
        this.recompensa = window.storageEco.registrarPartida({
            juegoId: this.tipoId,
            nivelNumero: this.nivelNumero,
            superado: this.gano,
            puntaje: this.puntaje,
            aciertos: this.aciertos,
            errores: this.errores,
            duracionSegundos: this.tiempoJuego,
            impacto: impactoTotal,
            preguntaCorrecta,
            estrellas: this.estrellasNivel,
            mejorCombo: this.mejorCombo
        });

        // Notificar medallas ganadas
        if (this.recompensa && this.recompensa.medallasGanadas.length > 0) {
            setTimeout(() => window.audioEco.medalla(), 600);
        }
    }

    // Partículas y efectos
    crearConfeti(cantidad = 80) {
        const colores = ['#FFD84D', '#FF6B6B', '#6EE7B7', '#56CCF2', '#BB6BD9', '#FFA726'];
        for (let i = 0; i < cantidad; i++) {
            this.confetiParticulas.push({
                x: Math.random() * this.ANCHO,
                y: -10 - Math.random() * 80,
                vx: (Math.random() - 0.5) * 4,
                vy: 2 + Math.random() * 4,
                rot: Math.random() * Math.PI * 2,
                vrot: (Math.random() - 0.5) * 0.15,
                tamX: 8 + Math.random() * 8,
                tamY: 5 + Math.random() * 6,
                color: colores[Math.floor(Math.random() * colores.length)],
                vida: 1.0
            });
        }
    }

    crearChispas(cx, cy, color, cantidad = 20) {
        for (let i = 0; i < cantidad; i++) {
            const angulo = Math.random() * Math.PI * 2;
            const vel = 2 + Math.random() * 5;
            this.chispasParticulas.push({
                x: cx,
                y: cy,
                vx: Math.cos(angulo) * vel,
                vy: Math.sin(angulo) * vel,
                color,
                radio: 2 + Math.random() * 4,
                vida: 1.0,
                decaimiento: 1.5 + Math.random() * 1.5
            });
        }
    }

    actualizarParticulas(dt) {
        // Confeti
        for (let i = this.confetiParticulas.length - 1; i >= 0; i--) {
            const p = this.confetiParticulas[i];
            p.x += p.vx;
            p.y += p.vy;
            p.rot += p.vrot;
            if (p.y > this.ALTO + 20) {
                this.confetiParticulas.splice(i, 1);
            }
        }

        // Chispas
        for (let i = this.chispasParticulas.length - 1; i >= 0; i--) {
            const p = this.chispasParticulas[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vida -= dt * p.decaimiento;
            if (p.vida <= 0) {
                this.chispasParticulas.splice(i, 1);
            }
        }

        // Textos flotantes jugosos
        for (let i = this.textosFlotantes.length - 1; i >= 0; i--) {
            const t = this.textosFlotantes[i];
            t.y += t.vy * dt;
            t.tiempo += dt;
            t.alfa = Math.max(0, 1 - (t.tiempo / t.duracion));
            if (t.tiempo >= t.duracion) {
                this.textosFlotantes.splice(i, 1);
            }
        }
    }

    // Renderizado general
    dibujarTodo() {
        const ctx = this.ctx;
        ctx.save();

        // Limpiar lienzo
        ctx.fillStyle = '#1E1B2E';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Escalar y centrar con espacio virtual de 1000x640
        ctx.translate(this.despX, this.despY);
        ctx.scale(this.escala, this.escala);

        // Efecto de sacudida en pantalla si hubo error
        if (this.sacudida > 0) {
            const amp = this.sacudida * 14;
            const sx = (Math.sin(this.relojTotal * 50) * amp);
            const sy = (Math.cos(this.relojTotal * 40) * amp);
            ctx.translate(sx, sy);
        }

        // Fondo del marco del juego
        ctx.fillStyle = '#EFEEFC';
        ctx.fillRect(0, 0, this.ANCHO, this.ALTO);

        // 1. HUD Superior (Fila superior de estado)
        this.dibujarHUD(ctx);

        // 2. Recuadro de la escena del juego
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(this.ESC_X, this.ESC_Y, this.ESC_W, this.ESC_H, 16);
        ctx.clip();

        // Llamar a dibujar la escena propia de cada minijuego
        this.dibujarEscena(ctx);

        // Partículas en la escena
        this.dibujarParticulas(ctx);

        // Eco-Burbujas flotantes de bonus
        if (this.estado === 'JUGANDO') {
            this.dibujarEcoBurbujas(ctx);
        }

        // Textos flotantes de gratificación instantánea
        this.dibujarTextosFlotantes(ctx);

        // Chaski el Huerequeque (Mascota animada de Ica)
        this.dibujarMascota(ctx);

        ctx.restore();

        // Borde estilizado del lienzo de juego (estilo caricatura)
        if (this.frenesiActivo) {
            const tono = (this.relojTotal * 220) % 360;
            ctx.save();
            ctx.shadowColor = `hsl(${tono}, 100%, 55%)`;
            ctx.shadowBlur = 18;
            ctx.strokeStyle = `hsl(${tono}, 100%, 65%)`;
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.roundRect(this.ESC_X, this.ESC_Y, this.ESC_W, this.ESC_H, 16);
            ctx.stroke();

            // Banner superior de Frenesí
            const pulsoF = 1.0 + Math.sin(this.relojTotal * 9) * 0.05;
            ctx.translate(this.ANCHO / 2, this.ESC_Y + 22);
            ctx.scale(pulsoF, pulsoF);
            ctx.fillStyle = 'rgba(245, 158, 11, 0.95)';
            ctx.beginPath();
            ctx.roundRect(-140, -14, 280, 28, 14);
            ctx.fill();
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2.5;
            ctx.stroke();

            ctx.fillStyle = '#FFFFFF';
            ctx.font = '900 13px "Segoe UI", system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`¡ECO-FRENESÍ: ×2 PUNTOS! (${Math.ceil(this.frenesiTiempo)}s)`, 0, 0);
            ctx.restore();
        } else {
            ctx.strokeStyle = '#2A2340';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.roundRect(this.ESC_X, this.ESC_Y, this.ESC_W, this.ESC_H, 16);
            ctx.stroke();
        }

        // 3. Barra inferior de pistas / resumen
        this.dibujarPie(ctx);

        // 4. Palabra de combo flotante
        if (this.palabraCombo) {
            this.dibujarPalabraCombo(ctx);
        }

        // 5. Toast explicativo de error o consejo
        if (this.mensajeToast) {
            this.dibujarToast(ctx);
        }

        // 6. Controles táctiles virtuales para celular
        if (this.esDispositivoTactil || window.innerWidth < 850) {
            this.dibujarControlesTactiles(ctx);
        }

        // 7. Modales de pantalla (Intro, Pausa, Dato Curioso, Desafío del Saber, Fin)
        if (this.estado === 'INTRO') {
            this.dibujarModalIntro(ctx);
        } else if (this.estado === 'PAUSA' && !this.modalDatoActivo) {
            this.dibujarModalPausa(ctx);
        } else if (this.modalDatoActivo) {
            this.dibujarModalDatoCurioso(ctx);
        } else if (this.estado === 'PREGUNTA') {
            this.dibujarModalPregunta(ctx);
        } else if (this.estado === 'FIN') {
            this.dibujarModalFin(ctx);
        }

        ctx.restore();
    }

    dibujarEcoBurbujas(ctx) {
        for (const b of this.ecoBurbujas) {
            ctx.save();
            const wX = Math.sin(b.tiempo * 4) * 2;
            const wY = Math.cos(b.tiempo * 3) * 2;
            const cx = b.x + wX;
            const cy = b.y + wY;
            const r = b.radio;

            const colBorde = b.tipo === 'TIEMPO' ? '#38BDF8' : (b.tipo === 'MONEDAS' ? '#F59E0B' : '#A855F7');
            const colBrillo = b.tipo === 'TIEMPO' ? 'rgba(56, 189, 248, 0.4)' : (b.tipo === 'MONEDAS' ? 'rgba(245, 158, 11, 0.4)' : 'rgba(168, 85, 247, 0.4)');

            // Brillo exterior de la burbuja
            ctx.shadowColor = colBorde;
            ctx.shadowBlur = 12;

            // Cuerpo esférico translúcido con gradiente
            const grad = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.35, 3, cx, cy, r);
            grad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
            grad.addColorStop(0.4, colBrillo);
            grad.addColorStop(0.85, 'rgba(255, 255, 255, 0.2)');
            grad.addColorStop(1, colBorde);

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Reflejo especular brillante de burbuja
            ctx.shadowColor = 'transparent';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.beginPath();
            ctx.ellipse(cx - r * 0.38, cy - r * 0.38, r * 0.3, r * 0.16, -0.65, 0, Math.PI * 2);
            ctx.fill();

            // Ícono vectorial centrado según el tipo de bonus
            ctx.save();
            ctx.translate(cx, cy);
            if (b.tipo === 'TIEMPO') {
                // Reloj / cronómetro cyan
                ctx.fillStyle = '#0284C7';
                ctx.beginPath();
                ctx.arc(0, 0, 11, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(0, -6);
                ctx.moveTo(0, 0);
                ctx.lineTo(4, 0);
                ctx.stroke();
            } else if (b.tipo === 'MONEDAS') {
                // Moneda dorada con brillo
                ctx.fillStyle = '#D97706';
                ctx.beginPath();
                ctx.arc(0, 0, 11, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#FDE047';
                ctx.beginPath();
                ctx.arc(0, 0, 8, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#92400E';
                ctx.font = 'bold 10px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('$', 0, 0);
            } else if (b.tipo === 'FRENESI') {
                // Rayo reluciente púrpura
                ctx.fillStyle = '#7E22CE';
                ctx.beginPath();
                ctx.arc(0, 0, 11, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#FDE047';
                ctx.beginPath();
                ctx.moveTo(1, -7);
                ctx.lineTo(-4, 0);
                ctx.lineTo(0, 0);
                ctx.lineTo(-2, 7);
                ctx.lineTo(5, -1);
                ctx.lineTo(1, -1);
                ctx.closePath();
                ctx.fill();
            }
            ctx.restore();

            ctx.restore();
        }
    }

    dibujarTextosFlotantes(ctx) {
        for (const t of this.textosFlotantes) {
            ctx.save();
            const progreso = t.tiempo / t.duracion;
            const alfa = Math.max(0, 1 - progreso);
            const escala = t.escala * (1.0 + Math.sin(Math.min(1, t.tiempo * 6) * Math.PI * 0.5) * 0.25);

            ctx.globalAlpha = alfa;
            ctx.translate(t.x, t.y);
            ctx.scale(escala, escala);

            ctx.font = '900 16px "Segoe UI", system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            const metrics = ctx.measureText(t.texto);
            const pw = metrics.width + 22;
            const ph = 26;

            // Pastilla estilizada tipo sticker de videojuego
            ctx.fillStyle = '#0F172A';
            ctx.beginPath();
            ctx.roundRect(-pw / 2, -ph / 2, pw, ph, 13);
            ctx.fill();

            ctx.strokeStyle = t.color;
            ctx.lineWidth = 2.5;
            ctx.stroke();

            // Texto con color vibrante
            ctx.fillStyle = t.color;
            ctx.fillText(t.texto, 0, 0);

            ctx.restore();
        }
    }

    dibujarMascota(ctx) {
        // Chaski el Huerequeque (Mascota de la fauna de Ica)
        const mx = this.ESC_DER - 58;
        const my = this.ESC_ABA - 46;
        const respiracion = Math.sin(this.relojTotal * 4.5) * 2;
        const cy = my + respiracion;

        ctx.save();

        // Sombrilla / sombra en el suelo
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.beginPath();
        ctx.ellipse(mx, my + 38, 18, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Patitas de ave (largas y ágiles)
        ctx.strokeStyle = '#D97706';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(mx - 5, cy + 18);
        ctx.lineTo(mx - 7, my + 38);
        ctx.moveTo(mx + 5, cy + 18);
        ctx.lineTo(mx + 7, my + 38);
        ctx.stroke();

        // Cuerpo esponjoso del huerequeque (color tierra / beige costeño)
        ctx.fillStyle = '#D6C7A1';
        ctx.beginPath();
        ctx.ellipse(mx, cy + 6, 17, 15, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#2A2340';
        ctx.lineWidth = 2.2;
        ctx.stroke();

        // Pecho crema
        ctx.fillStyle = '#FBF8EE';
        ctx.beginPath();
        ctx.ellipse(mx - 4, cy + 8, 9, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Ala jaspeada con plumas
        ctx.fillStyle = '#9C8861';
        ctx.beginPath();
        ctx.ellipse(mx + 6, cy + 5, 8, 11, 0.25, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#2A2340';
        ctx.lineWidth = 1.6;
        ctx.stroke();

        // Cabeza redonda
        ctx.fillStyle = '#E5D8B8';
        ctx.beginPath();
        ctx.arc(mx - 4, cy - 12, 13, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#2A2340';
        ctx.lineWidth = 2.2;
        ctx.stroke();

        // Pañuelo ecológico verde scout al cuello
        ctx.fillStyle = '#10B981';
        ctx.beginPath();
        ctx.moveTo(mx - 10, cy - 2);
        ctx.lineTo(mx + 3, cy - 2);
        ctx.lineTo(mx - 3, cy + 6);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#065F46';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Ojo grande expresivo característico del huerequeque
        ctx.fillStyle = '#F59E0B'; // Amarillo intenso
        ctx.beginPath();
        ctx.arc(mx - 9, cy - 13, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#1E1B2E'; // Pupila
        ctx.beginPath();
        ctx.arc(mx - 10, cy - 13, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF'; // Brillo
        ctx.beginPath();
        ctx.arc(mx - 11, cy - 15, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Pico puntiagudo
        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.moveTo(mx - 15, cy - 14);
        ctx.lineTo(mx - 24, cy - 11);
        ctx.lineTo(mx - 15, cy - 9);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#B45309';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Nombre de la mascota en etiqueta debajo
        ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
        ctx.beginPath();
        ctx.roundRect(mx - 24, my + 41, 48, 14, 6);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 9px "Segoe UI", system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('CHASKI', mx, my + 48);

        // Globo de diálogo si la mascota tiene un mensaje activo
        if (this.mascotaMensaje) {
            const txt = this.mascotaMensaje.texto;
            ctx.font = 'bold 12.5px "Segoe UI", system-ui, sans-serif';
            const m = ctx.measureText(txt);
            const bw = Math.min(230, m.width + 24);
            const bh = 38;
            const bx = mx - bw - 10;
            const by = cy - 36;

            // Sombra del globo
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.beginPath();
            ctx.roundRect(bx, by + 2, bw, bh, 12);
            ctx.fill();

            // Fondo blanco del globo
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.roundRect(bx, by, bw, bh, 12);
            ctx.fill();
            ctx.strokeStyle = '#2A2340';
            ctx.lineWidth = 2.5;
            ctx.stroke();

            // Rabillo del globo apuntando al pico de Chaski
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.moveTo(bx + bw - 2, by + bh - 12);
            ctx.lineTo(bx + bw + 10, cy - 10);
            ctx.lineTo(bx + bw - 6, by + bh - 4);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#2A2340';
            ctx.lineWidth = 2.2;
            ctx.stroke();

            // Texto dentro del globo
            ctx.fillStyle = '#1E293B';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(txt, bx + bw / 2, by + bh / 2, bw - 16);
        }

        ctx.restore();
    }

    dibujarHUD(ctx) {
        // Franja superior de encabezado estilo consola acrílica
        const gradHUD = ctx.createLinearGradient(0, 10, 0, 98);
        gradHUD.addColorStop(0, '#1E293B');
        gradHUD.addColorStop(1, '#0F172A');

        ctx.fillStyle = gradHUD;
        ctx.beginPath();
        ctx.roundRect(this.ESC_X, 10, this.ESC_W, 88, 16);
        ctx.fill();

        // Borde superior brillante
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Línea de acento temático del juego en la base
        const gradAcento = ctx.createLinearGradient(this.ESC_X, 0, this.ESC_DER, 0);
        gradAcento.addColorStop(0, this.tipo.color);
        gradAcento.addColorStop(0.5, '#38BDF8');
        gradAcento.addColorStop(1, this.tipo.color);
        ctx.strokeStyle = gradAcento;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(this.ESC_X + 16, 96);
        ctx.lineTo(this.ESC_DER - 16, 96);
        ctx.stroke();

        // Botón Menú / Niveles
        this.dibujarBoton(ctx, this.ESC_X + 14, 24, 108, 42, '← Niveles', '#334155', '#FFFFFF', 13.5);

        // Botón Pausa
        this.dibujarBoton(ctx, this.ESC_X + 130, 24, 76, 42, this.estado === 'PAUSA' ? '▶ Seguir' : '⏸ Pausa', '#334155', '#FFFFFF', 13);

        // Título del juego y Nivel
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '900 19px "Segoe UI", system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${this.tipo.nombre}`, this.ESC_X + 222, 38);

        ctx.font = '800 13px "Segoe UI", system-ui, sans-serif';
        ctx.fillStyle = '#38BDF8';
        ctx.fillText(`NIVEL ${this.nivelNumero}: ${this.def.titulo.toUpperCase()}`, this.ESC_X + 222, 60);

        // Medidor de Tiempo (Reloj animado)
        const restante = Math.max(0, this.tiempoLimite - this.tiempoJuego);
        const pctTiempo = Math.max(0, restante / this.tiempoLimite);
        const xReloj = this.ESC_X + 540;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
        ctx.beginPath();
        ctx.roundRect(xReloj, 22, 148, 46, 12);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Barra de tiempo
        const colorTiempo = restante < 20 ? '#EF4444' : (restante < 40 ? '#F59E0B' : '#10B981');
        ctx.fillStyle = colorTiempo;
        ctx.beginPath();
        ctx.roundRect(xReloj + 6, 46, 136 * pctTiempo, 14, 5);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '900 12.5px "Segoe UI", system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`TIEMPO: ${formatearTiempo(restante)}`, xReloj + 74, 34);

        // Medidor de Recurso (Corazones, Tanque, Energía, Biohuerto)
        const xMedidor = this.ESC_X + 706;
        this.dibujarMedidorEspecifico(ctx, xMedidor, 22, 114, 48);

        // Puntaje y Combo
        const xPuntaje = this.ESC_X + 834;
        ctx.fillStyle = '#0F172A';
        ctx.beginPath();
        ctx.roundRect(xPuntaje, 18, 108, 54, 12);
        ctx.fill();
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '900 17px "Segoe UI", system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${this.puntaje} pts`, xPuntaje + 54, 35);

        ctx.font = '800 11.5px "Segoe UI", system-ui, sans-serif';
        ctx.fillStyle = this.racha >= 2 ? '#FBBF24' : '#94A3B8';
        ctx.fillText(this.racha >= 2 ? `COMBO ×${Math.min(5, Math.floor((this.racha - 1) / 2) + 1)}` : 'Racha: ' + this.racha, xPuntaje + 54, 56);
    }

    dibujarMedidorEspecifico(ctx, x, y, w, h) {
        if (this.usaCorazones()) {
            // 3 corazones dibujados vectorialmente para Limpieza Monstruosa
            const vidas = Math.ceil(this.medidor * 3);
            const espaciado = w / 3;
            for (let i = 0; i < 3; i++) {
                const cx = x + espaciado * i + espaciado / 2;
                const cy = y + h / 2;
                const activa = i < vidas;
                this.dibujarCorazonForma(ctx, cx, cy, 14, activa ? '#FF4D6D' : '#475569', '#2A2340');
            }
        } else {
            // Barra de medidor temático (Agua, Energía o Biohuerto)
            ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
            ctx.beginPath();
            ctx.roundRect(x, y, w, h, 10);
            ctx.fill();

            const pct = Math.max(0, Math.min(1, this.medidor));
            let colorBarra = this.tipo.color;
            if (this.tipoId === 'AGUA') colorBarra = '#56CCF2';
            else if (this.tipoId === 'ENERGIA') colorBarra = '#FFD84D';
            else if (this.tipoId === 'VERDE') colorBarra = '#6EE7B7';

            if (pct < 0.25) colorBarra = '#FF6B6B';

            ctx.fillStyle = colorBarra;
            ctx.beginPath();
            ctx.roundRect(x + 4, y + 24, (w - 8) * pct, 18, 6);
            ctx.fill();

            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 12px "Segoe UI", system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`${this.tipo.medidor}: ${Math.round(pct * 100)}%`, x + w / 2, y + 14);
        }
    }

    dibujarCorazonForma(ctx, cx, cy, s, colorRelleno, colorBorde = '#1E293B') {
        ctx.save();
        const estaActivo = colorRelleno !== '#475569' && colorRelleno !== '#CBD5E1';

        // Sombra de gota suave
        if (estaActivo) {
            ctx.shadowColor = 'rgba(239, 68, 68, 0.45)';
            ctx.shadowBlur = 8;
            ctx.shadowOffsetY = 2;
        }

        // Relleno con gradiente de rubí brillante
        let relleno = colorRelleno;
        if (estaActivo) {
            const grad = ctx.createLinearGradient(cx - s, cy - s, cx + s, cy + s);
            grad.addColorStop(0, '#FDA4AF');
            grad.addColorStop(0.3, '#F43F5E');
            grad.addColorStop(1, '#9F1239');
            relleno = grad;
        }

        ctx.fillStyle = relleno;
        ctx.strokeStyle = estaActivo ? '#881337' : '#334155';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(cx, cy + s * 0.55);
        ctx.bezierCurveTo(cx - s * 1.1, cy - s * 0.1, cx - s * 0.55, cy - s * 0.85, cx, cy - s * 0.3);
        ctx.bezierCurveTo(cx + s * 0.55, cy - s * 0.85, cx + s * 1.1, cy - s * 0.1, cx, cy + s * 0.55);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Destello especular curvado en el lóbulo superior izquierdo
        if (estaActivo) {
            ctx.shadowColor = 'transparent';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
            ctx.beginPath();
            ctx.ellipse(cx - s * 0.38, cy - s * 0.38, s * 0.28, s * 0.15, -0.6, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    dibujarEstrellaForma(ctx, cx, cy, radio, colorRelleno, colorBorde = '#1E293B', puntas = 5) {
        ctx.save();
        const estaActiva = colorRelleno !== '#CBD5E1' && colorRelleno !== '#475569';

        if (estaActiva) {
            ctx.shadowColor = 'rgba(245, 158, 11, 0.55)';
            ctx.shadowBlur = 12;
            ctx.shadowOffsetY = 2;
        }

        // Gradiente dorado volumétrico
        let relleno = colorRelleno;
        if (estaActiva) {
            const grad = ctx.createRadialGradient(cx, cy - radio * 0.2, 2, cx, cy, radio);
            grad.addColorStop(0, '#FEF9C3');
            grad.addColorStop(0.35, '#FBBF24');
            grad.addColorStop(1, '#B45309');
            relleno = grad;
        }

        ctx.fillStyle = relleno;
        ctx.strokeStyle = estaActiva ? '#78350F' : '#334155';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        for (let i = 0; i < puntas * 2; i++) {
            const r = i % 2 === 0 ? radio : radio * 0.45;
            const a = -Math.PI / 2 + (i * Math.PI) / puntas;
            const x = cx + Math.cos(a) * r;
            const y = cy + Math.sin(a) * r;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Facetas 3D doradas (aristas internas como estrella de videojuego de consola)
        if (estaActiva) {
            ctx.shadowColor = 'transparent';
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.lineWidth = 1.2;
            for (let i = 0; i < puntas; i++) {
                const a = -Math.PI / 2 + (i * 2 * Math.PI) / puntas;
                ctx.beginPath();
                ctx.moveTo(cx, cy);
                ctx.lineTo(cx + Math.cos(a) * radio, cy + Math.sin(a) * radio);
                ctx.stroke();
            }

            // Destello de diamante en el centro
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(cx, cy - radio * 0.2, radio * 0.12, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    dibujarPie(ctx) {
        const y = this.ESC_ABA + 10;
        const h = 46;

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.roundRect(this.ESC_X, y, this.ESC_W, h, 12);
        ctx.fill();
        ctx.strokeStyle = '#2A2340';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // 1. Mostrar progreso de los retos
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        let xOffset = this.ESC_X + 16;

        ctx.font = 'bold 13px "Segoe UI", system-ui, sans-serif';
        ctx.fillStyle = '#2A2340';
        ctx.fillText('RETOS:', xOffset, y + h / 2);
        xOffset += 55;

        for (const reto of this.def.retos) {
            const actual = this.progresoRetos[reto.clave] || 0;
            const cumplido = actual >= reto.meta;

            ctx.fillStyle = cumplido ? '#E8F5E9' : '#F3F4F6';
            ctx.strokeStyle = cumplido ? '#2E7D32' : '#CBD5E1';
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.roundRect(xOffset, y + 8, 140, 30, 8);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = cumplido ? '#2E7D32' : '#334155';
            ctx.font = 'bold 12px "Segoe UI", system-ui, sans-serif';
            ctx.fillText(`${cumplido ? '[OK]' : '•'} ${reto.corto}: ${actual}/${reto.meta}`, xOffset + 10, y + h / 2);

            xOffset += 150;
        }

        // 2. Consejo / pista a la derecha
        const consejo = this.pista() || [this.tipo.consejo];
        ctx.fillStyle = '#64748B';
        ctx.font = 'italic 12px "Segoe UI", system-ui, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(`${consejo[0].slice(0, 60)}...`, this.ESC_DER - 16, y + h / 2);
    }

    dibujarPalabraCombo(ctx) {
        const p = this.palabraCombo;
        const progreso = p.tiempo / p.duracion;
        const escala = 1.0 + Math.sin(progreso * Math.PI) * 0.4;
        const alfa = Math.max(0, 1.0 - progreso);
        const yOffset = p.y - progreso * 45;

        ctx.save();
        ctx.globalAlpha = alfa;
        ctx.translate(p.x, yOffset);
        ctx.scale(escala, escala);

        ctx.font = '900 42px "Segoe UI", system-ui, cursive, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Contorno grueso oscuro
        ctx.strokeStyle = '#2A2340';
        ctx.lineWidth = 8;
        ctx.strokeText(p.texto, 0, 0);

        // Relleno degradado amarillo-naranja
        const grad = ctx.createLinearGradient(0, -20, 0, 20);
        grad.addColorStop(0, '#FFF59D');
        grad.addColorStop(1, '#FF9800');
        ctx.fillStyle = grad;
        ctx.fillText(p.texto, 0, 0);

        ctx.restore();
    }

    dibujarToast(ctx) {
        const m = this.mensajeToast;
        const x = this.ANCHO / 2;
        const y = this.ESC_ABA - 30;

        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 15px "Segoe UI", system-ui, sans-serif';

        const txt = m.texto;
        const metrics = ctx.measureText(txt);
        const w = metrics.width + 48;
        const h = 42;

        ctx.fillStyle = m.esError ? '#FF6B6B' : '#4E9A45';
        ctx.beginPath();
        ctx.roundRect(x - w / 2, y - h / 2, w, h, 20);
        ctx.fill();
        ctx.strokeStyle = '#2A2340';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(txt, x, y);
        ctx.restore();
    }

    dibujarParticulas(ctx) {
        // Confeti
        for (const p of this.confetiParticulas) {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.tamX / 2, -p.tamY / 2, p.tamX, p.tamY);
            ctx.restore();
        }

        // Chispas
        for (const p of this.chispasParticulas) {
            ctx.save();
            ctx.globalAlpha = Math.max(0, p.vida);
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radio, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    dibujarControlesTactiles(ctx) {
        // D-Pad a la izquierda
        const dpadX = 90;
        const dpadY = this.ESC_ABA - 80;
        const btnTam = 48;

        const dibujarBotonDir = (x, y, icono, activa) => {
            ctx.fillStyle = activa ? '#FFD84D' : 'rgba(45, 27, 105, 0.65)';
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.roundRect(x - btnTam / 2, y - btnTam / 2, btnTam, btnTam, 12);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = activa ? '#2D1B69' : '#FFFFFF';
            ctx.font = 'bold 22px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(icono, x, y);
        };

        dibujarBotonDir(dpadX, dpadY - btnTam - 4, '▲', this.dpadActivo.up);
        dibujarBotonDir(dpadX, dpadY + btnTam + 4, '▼', this.dpadActivo.down);
        dibujarBotonDir(dpadX - btnTam - 4, dpadY, '◀', this.dpadActivo.left);
        dibujarBotonDir(dpadX + btnTam + 4, dpadY, '▶', this.dpadActivo.right);

        // Botón de acción a la derecha
        const actX = this.ANCHO - 90;
        const actY = this.ESC_ABA - 80;
        ctx.fillStyle = this.dpadActivo.action ? '#FF6B6B' : 'rgba(235, 87, 87, 0.75)';
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(actX, actY, 36, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('ACCIÓN', actX, actY);
    }

    // Modal de Introducción al Nivel
    dibujarModalIntro(ctx) {
        this.dibujarVeloOscuro(ctx);

        const w = 680;
        const h = 460;
        const x = (this.ANCHO - w) / 2;
        const y = (this.ALTO - h) / 2;

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, 24);
        ctx.fill();
        ctx.strokeStyle = '#2A2340';
        ctx.lineWidth = 4;
        ctx.stroke();

        // Cabecera del modal
        ctx.fillStyle = this.tipo.color;
        ctx.beginPath();
        ctx.roundRect(x, y, w, 75, [24, 24, 0, 0]);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 24px "Segoe UI", system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`Nivel ${this.nivelNumero}: ${this.def.titulo}`, x + w / 2, y + 38);

        // ¿Qué vas a aprender? (Tarjeta educativa especial para Nivel 1)
        let curY = y + 95;
        if (this.nivelNumero === 1) {
            ctx.fillStyle = '#F0FDF4';
            ctx.strokeStyle = '#86EFAC';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(x + 35, curY, w - 70, 75, 12);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#166534';
            ctx.font = 'bold 15px "Segoe UI", system-ui, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText('OBJETIVO DE APRENDIZAJE:', x + 50, curY + 22);

            ctx.font = '13px "Segoe UI", system-ui, sans-serif';
            ctx.fillStyle = '#1E293B';
            this.dibujarTextoAjustado(ctx, this.tipo.concepto, x + 50, curY + 45, w - 100, 18);
            curY += 90;
        }

        // Novedad del nivel si existe
        if (this.def.novedad) {
            ctx.fillStyle = '#FFFBEB';
            ctx.strokeStyle = '#FCD34D';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(x + 35, curY, w - 70, 50, 12);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#B45309';
            ctx.font = 'bold 13px "Segoe UI", system-ui, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText('NOVEDAD EN ESTE NIVEL: ' + this.def.novedad, x + 50, curY + 25);
            curY += 60;
        }

        // Retos requeridos
        ctx.fillStyle = '#2A2340';
        ctx.font = 'bold 16px "Segoe UI", system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('RETOS DE LA MISIÓN:', x + 40, curY + 15);
        curY += 32;

        for (const reto of this.def.retos) {
            ctx.fillStyle = '#334155';
            ctx.font = '14px "Segoe UI", system-ui, sans-serif';
            ctx.fillText(`• ${reto.desc}`, x + 55, curY);
            curY += 24;
        }

        // Criterios de estrellas
        curY += 8;
        ctx.fillStyle = '#64748B';
        ctx.font = 'bold 13px "Segoe UI", system-ui, sans-serif';
        ctx.fillText('CRITERIOS DE ESTRELLAS:', x + 40, curY);
        curY += 22;

        const criterios = obtenerCriteriosNivel(this.def);
        ctx.font = '12px "Segoe UI", system-ui, sans-serif';
        criterios.forEach(crit => {
            ctx.fillText(crit, x + 55, curY);
            curY += 18;
        });

        // Botón ¡A JUGAR!
        this.dibujarBoton(ctx, x + (w - 220) / 2, y + h - 68, 220, 48, 'Comenzar Misión ▶', this.tipo.color, '#FFFFFF', 17);
    }

    // Modal de Dato Curioso a mitad de nivel
    dibujarModalDatoCurioso(ctx) {
        this.dibujarVeloOscuro(ctx);

        const w = 600;
        const h = 340;
        const x = (this.ANCHO - w) / 2;
        const y = (this.ALTO - h) / 2;

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, 24);
        ctx.fill();
        ctx.strokeStyle = '#2A2340';
        ctx.lineWidth = 4;
        ctx.stroke();

        // Cabecera
        ctx.fillStyle = '#7C4DFF';
        ctx.beginPath();
        ctx.roundRect(x, y, w, 70, [24, 24, 0, 0]);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 22px "Segoe UI", system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('¿SABÍAS QUE...?', x + w / 2, y + 35);

        // Contenido educativo sobre Ica y Perú
        ctx.fillStyle = '#2A2340';
        ctx.font = 'bold 18px "Segoe UI", system-ui, sans-serif';
        ctx.textAlign = 'center';
        this.dibujarTextoAjustado(ctx, `"${this.datoCurioso}"`, x + w / 2, y + 125, w - 80, 26, true);

        ctx.fillStyle = '#64748B';
        ctx.font = 'italic 14px "Segoe UI", system-ui, sans-serif';
        ctx.fillText('El cuidado del medio ambiente en Ica depende de cada uno de nosotros.', x + w / 2, y + 215);

        // Botón ¡Entendido, continuar!
        this.dibujarBoton(ctx, x + (w - 220) / 2, y + h - 65, 220, 46, 'Continuar Jugando ▶', '#7C4DFF', '#FFFFFF', 16);
    }

    // Modal de Pausa
    dibujarModalPausa(ctx) {
        this.dibujarVeloOscuro(ctx);

        const w = 420;
        const h = 280;
        const x = (this.ANCHO - w) / 2;
        const y = (this.ALTO - h) / 2;

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, 20);
        ctx.fill();
        ctx.strokeStyle = '#2A2340';
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.fillStyle = '#2D1B69';
        ctx.font = 'bold 26px "Segoe UI", system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('JUEGO EN PAUSA', x + w / 2, y + 55);

        this.dibujarBoton(ctx, x + 60, y + 110, 300, 46, 'Reanudar Juego', '#2E9455', '#FFFFFF', 16);
        this.dibujarBoton(ctx, x + 60, y + 175, 300, 46, 'Salir a Niveles', '#64748B', '#FFFFFF', 16);
    }

    // Modal de Desafío del Saber (Niveles 3, 6, 9, 10)
    dibujarModalPregunta(ctx) {
        this.dibujarVeloOscuro(ctx);

        const p = this.preguntaActiva;
        const w = 720;
        const h = 480;
        const x = (this.ANCHO - w) / 2;
        const y = (this.ALTO - h) / 2;

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, 24);
        ctx.fill();
        ctx.strokeStyle = '#2A2340';
        ctx.lineWidth = 4;
        ctx.stroke();

        // Cabecera
        ctx.fillStyle = '#3C8DC5';
        ctx.beginPath();
        ctx.roundRect(x, y, w, 70, [24, 24, 0, 0]);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 21px "Segoe UI", system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('DESAFÍO DEL SABER (+30 pts)', x + w / 2, y + 35);

        // Pregunta
        ctx.fillStyle = '#2A2340';
        ctx.font = 'bold 19px "Segoe UI", system-ui, sans-serif';
        ctx.fillText(p.pregunta, x + w / 2, y + 110);

        // Opciones
        let curY = y + 155;
        p.opciones.forEach((opc, idx) => {
            let colorFondo = '#F8FAFC';
            let colorBorde = '#CBD5E1';
            let colorTexto = '#1E293B';

            if (this.respuestaSeleccionada >= 0) {
                if (idx === p.correcta) {
                    colorFondo = '#DCFCE7';
                    colorBorde = '#22C55E';
                    colorTexto = '#15803D';
                } else if (idx === this.respuestaSeleccionada) {
                    colorFondo = '#FEE2E2';
                    colorBorde = '#EF4444';
                    colorTexto = '#B91C1C';
                }
            }

            ctx.fillStyle = colorFondo;
            ctx.strokeStyle = colorBorde;
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.roundRect(x + 50, curY, w - 100, 52, 14);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = colorTexto;
            ctx.font = 'bold 16px "Segoe UI", system-ui, sans-serif';
            ctx.textAlign = 'left';
            const letra = String.fromCharCode(65 + idx);
            ctx.fillText(`${letra})  ${opc}`, x + 75, curY + 26);

            curY += 66;
        });

        // Explicación educativa
        if (this.mostrarExplicacionPregunta) {
            ctx.fillStyle = '#475569';
            ctx.font = 'italic 14px "Segoe UI", system-ui, sans-serif';
            ctx.textAlign = 'center';
            this.dibujarTextoAjustado(ctx, p.explicacion, x + w / 2, curY + 15, w - 100, 20, true);

            this.dibujarBoton(ctx, x + (w - 220) / 2, y + h - 60, 220, 44, 'Ver Resultados ▶', '#3C8DC5', '#FFFFFF', 16);
        }
    }

    // Modal de Resultados Finales
    dibujarModalFin(ctx) {
        this.dibujarVeloOscuro(ctx);

        const w = 680;
        const h = 500;
        const x = (this.ANCHO - w) / 2;
        const y = (this.ALTO - h) / 2;

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, 24);
        ctx.fill();
        ctx.strokeStyle = '#2A2340';
        ctx.lineWidth = 4;
        ctx.stroke();

        // Cabecera
        ctx.fillStyle = this.gano ? '#2E9455' : '#C0453F';
        ctx.beginPath();
        ctx.roundRect(x, y, w, 80, [24, 24, 0, 0]);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 26px "Segoe UI", system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.gano ? '¡MISIÓN CUMPLIDA!' : 'MISIÓN NO COMPLETADA', x + w / 2, y + 42);

        // Estrellas animadas dibujadas vectorialmente con impacto escalonado
        const yEstrellas = y + 125;
        for (let i = 1; i <= 3; i++) {
            const xStar = x + w / 2 + (i - 2) * 65;
            const tiene = i <= this.estrellasNivel;
            const delay = (i - 1) * 0.38 + 0.15;
            let scaleStar = 1.0;
            let activa = false;

            if (this.gano && tiene) {
                if (this.tiempoEnVictoria >= delay) {
                    activa = true;
                    const t = Math.min(1, (this.tiempoEnVictoria - delay) * 4);
                    scaleStar = t < 1 ? (1.5 - 0.5 * t + Math.sin(t * Math.PI) * 0.35) : 1.0;
                }
            }

            ctx.save();
            ctx.translate(xStar, yEstrellas);
            ctx.scale(scaleStar, scaleStar);
            this.dibujarEstrellaForma(ctx, 0, 0, 24, activa ? '#FFD84D' : '#CBD5E1', '#2A2340');
            ctx.restore();
        }

        // Estadísticas
        const yStats = y + 175;
        ctx.fillStyle = '#F8FAFC';
        ctx.beginPath();
        ctx.roundRect(x + 40, yStats, w - 80, 150, 16);
        ctx.fill();
        ctx.strokeStyle = '#E2E8F0';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#1E293B';
        ctx.font = 'bold 16px "Segoe UI", system-ui, sans-serif';
        ctx.textAlign = 'left';

        ctx.fillText(`• Puntaje Total: ${this.puntaje} puntos`, x + 65, yStats + 30);
        ctx.fillText(`• Tiempo empleado: ${formatearTiempo(this.tiempoJuego)}`, x + 65, yStats + 60);
        ctx.fillText(`• Aciertos: ${this.aciertos}   |   Errores: ${this.errores}`, x + 65, yStats + 90);

        // Impacto social y monedas ganadas con contador animado
        const factorAcierto = this.tipo.impactoPorAcierto || 0;
        const factorNivel = this.tipo.impactoPorNivel || 0;
        const imp = (this.aciertos * factorAcierto) + (this.gano ? factorNivel : 0);

        ctx.fillStyle = '#059669';
        ctx.fillText(`Impacto Ambiental: ${imp.toFixed(2)} ${this.tipo.unidadImpacto}`, x + 65, yStats + 125);

        ctx.fillStyle = '#D97706';
        ctx.textAlign = 'right';
        const totalMonedas = this.recompensa ? this.recompensa.monedasGanadas : 0;
        const rollMon = Math.min(1, this.tiempoEnVictoria / 1.1);
        const mon = Math.round(totalMonedas * rollMon);
        ctx.fillText(`+${mon} EcoMonedas`, x + w - 65, yStats + 30);

        // Medallas desbloqueadas si hubo
        if (this.recompensa && this.recompensa.medallasGanadas.length > 0) {
            ctx.fillStyle = '#7C4DFF';
            ctx.font = 'bold 14px "Segoe UI", system-ui, sans-serif';
            ctx.textAlign = 'center';
            const nomMed = this.recompensa.medallasGanadas.map(m => m.nombre).join(', ');
            ctx.fillText(`¡Medalla Desbloqueada: ${nomMed}!`, x + w / 2, y + 355);
        }

        // Botones de acción
        const yBtns = y + h - 70;
        this.dibujarBoton(ctx, x + 40, yBtns, 180, 48, 'Reintentar', '#64748B', '#FFFFFF', 16);
        this.dibujarBoton(ctx, x + 250, yBtns, 180, 48, 'Niveles', '#2D1B69', '#FFFFFF', 16);

        if (this.gano && this.nivelNumero < 10) {
            const pulsoBtn = 1.0 + Math.sin(this.relojTotal * 6) * 0.035;
            ctx.save();
            ctx.translate(x + 550, yBtns + 24);
            ctx.scale(pulsoBtn, pulsoBtn);
            this.dibujarBoton(ctx, -90, -24, 180, 48, 'Siguiente Misión ▶', '#2E9455', '#FFFFFF', 16);
            ctx.restore();
        }
    }

    dibujarVeloOscuro(ctx) {
        ctx.fillStyle = 'rgba(42, 35, 64, 0.72)';
        ctx.fillRect(0, 0, this.ANCHO, this.ALTO);
    }

    dibujarBoton(ctx, x, y, w, h, texto, fondo, colorTexto, tamFuente = 16) {
        ctx.save();

        // Sombra / Bisel 3D inferior del botón
        ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
        ctx.beginPath();
        ctx.roundRect(x, y + 4, w, h, 12);
        ctx.fill();

        // Cara del botón con gradiente vertical (luz cenital)
        const gradBtn = ctx.createLinearGradient(0, y, 0, y + h);
        gradBtn.addColorStop(0, this.aclararColor(fondo, 0.25));
        gradBtn.addColorStop(1, this.oscurecerColor(fondo, 0.2));

        ctx.fillStyle = gradBtn;
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, 12);
        ctx.fill();

        // Borde superior brillante (reflejo especular)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(x + 1, y + 1, w - 2, h / 2, [11, 11, 0, 0]);
        ctx.stroke();

        // Contorno general limpio
        ctx.strokeStyle = 'rgba(15, 23, 42, 0.5)';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, 12);
        ctx.stroke();

        // Texto con relieve y sombra suave
        ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 1.5;
        ctx.shadowBlur = 3;

        ctx.fillStyle = colorTexto;
        ctx.font = `900 ${tamFuente}px "Segoe UI", system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(texto, x + w / 2, y + h / 2);

        ctx.restore();
    }

    aclararColor(colorHex, factor) {
        if (!colorHex || !colorHex.startsWith('#') || colorHex.length < 7) return colorHex;
        const c = parseInt(colorHex.replace('#', ''), 16);
        const r = Math.min(255, Math.round(((c >> 16) & 255) + (255 - ((c >> 16) & 255)) * factor));
        const g = Math.min(255, Math.round(((c >> 8) & 255) + (255 - ((c >> 8) & 255)) * factor));
        const b = Math.min(255, Math.round((c & 255) + (255 - (c & 255)) * factor));
        return `rgb(${r}, ${g}, ${bl(b)})`;
        function bl(val) { return Math.min(255, Math.max(0, val)); }
    }

    oscurecerColor(colorHex, factor) {
        if (!colorHex || !colorHex.startsWith('#') || colorHex.length < 7) return colorHex;
        const c = parseInt(colorHex.replace('#', ''), 16);
        const r = Math.max(0, Math.round(((c >> 16) & 255) * (1 - factor)));
        const g = Math.max(0, Math.round(((c >> 8) & 255) * (1 - factor)));
        const b = Math.max(0, Math.round((c & 255) * (1 - factor)));
        return `rgb(${r}, ${g}, ${b})`;
    }

    dibujarTextoAjustado(ctx, texto, x, y, maxAncho, interlineado, centrado = false) {
        const palabras = texto.split(' ');
        let linea = '';
        let curY = y;

        for (let n = 0; n < palabras.length; n++) {
            const testLinea = linea + palabras[n] + ' ';
            const metrics = ctx.measureText(testLinea);
            if (metrics.width > maxAncho && n > 0) {
                if (centrado) ctx.textAlign = 'center';
                ctx.fillText(linea, x, curY);
                linea = palabras[n] + ' ';
                curY += interlineado;
            } else {
                linea = testLinea;
            }
        }
        if (centrado) ctx.textAlign = 'center';
        ctx.fillText(linea, x, curY);
    }

    // Gestión de clics y toques
    manejarPresionar(x, y) {
        window.audioEco.clic();

        // 1. Si estamos en INTRO
        if (this.estado === 'INTRO') {
            const w = 680, h = 460;
            const mx = (this.ANCHO - w) / 2, my = (this.ALTO - h) / 2;
            const btnX = mx + (w - 220) / 2, btnY = my + h - 68;
            if (x >= btnX && x <= btnX + 220 && y >= btnY && y <= btnY + 48) {
                this.iniciarPartida();
            }
            return;
        }

        // 2. Si estamos en Dato Curioso
        if (this.modalDatoActivo) {
            const w = 600, h = 340;
            const mx = (this.ANCHO - w) / 2, my = (this.ALTO - h) / 2;
            const btnX = mx + (w - 220) / 2, btnY = my + h - 65;
            if (x >= btnX && x <= btnX + 220 && y >= btnY && y <= btnY + 46) {
                this.cerrarDatoCurioso();
            }
            return;
        }

        // 3. Si estamos en PAUSA
        if (this.estado === 'PAUSA') {
            const w = 420, h = 280;
            const mx = (this.ANCHO - w) / 2, my = (this.ALTO - h) / 2;
            if (x >= mx + 60 && x <= mx + 360) {
                if (y >= my + 110 && y <= my + 156) {
                    this.alternarPausa(); // Reanudar
                } else if (y >= my + 175 && y <= my + 221) {
                    this.salirANiveles();
                }
            }
            return;
        }

        // 4. Si estamos en PREGUNTA
        if (this.estado === 'PREGUNTA') {
            const w = 720, h = 480;
            const mx = (this.ANCHO - w) / 2, my = (this.ALTO - h) / 2;

            if (!this.mostrarExplicacionPregunta) {
                let curY = my + 155;
                for (let i = 0; i < 3; i++) {
                    if (x >= mx + 50 && x <= mx + w - 50 && y >= curY && y <= curY + 52) {
                        this.responderPregunta(i);
                        return;
                    }
                    curY += 66;
                }
            } else {
                const btnX = mx + (w - 220) / 2, btnY = my + h - 60;
                if (x >= btnX && x <= btnX + 220 && y >= btnY && y <= btnY + 44) {
                    this.continuarDespuesDePregunta();
                }
            }
            return;
        }

        // 5. Si estamos en FIN
        if (this.estado === 'FIN') {
            const w = 680, h = 500;
            const mx = (this.ANCHO - w) / 2, my = (this.ALTO - h) / 2;
            const yBtns = my + h - 70;

            if (y >= yBtns && y <= yBtns + 48) {
                if (x >= mx + 40 && x <= mx + 220) {
                    this.cargarNivel(this.nivelNumero); // Repetir
                    this.iniciarPartida();
                } else if (x >= mx + 250 && x <= mx + 430) {
                    this.salirANiveles(); // Salir a mapa
                } else if (this.gano && this.nivelNumero < 10 && x >= mx + 460 && x <= mx + 640) {
                    this.cargarNivel(this.nivelNumero + 1); // Siguiente nivel
                    this.iniciarPartida();
                }
            }
            return;
        }

        // 6. Botones del HUD
        if (x >= this.ESC_X + 14 && x <= this.ESC_X + 124 && y >= 26 && y <= 66) {
            this.salirANiveles();
            return;
        }
        if (x >= this.ESC_X + 134 && x <= this.ESC_X + 209 && y >= 26 && y <= 66) {
            this.alternarPausa();
            return;
        }

        // 7. Clics en la escena de juego
        if (this.estado === 'JUGANDO') {
            // Revisar si se tocó alguna Eco-Burbuja flotante de bonificación
            for (let i = this.ecoBurbujas.length - 1; i >= 0; i--) {
                const b = this.ecoBurbujas[i];
                if (Math.hypot(x - b.x, y - b.y) <= b.radio + 14) {
                    this.explotarEcoBurbuja(b, i);
                    return;
                }
            }
            this.alPresionar(x, y);
        }
    }

    manejarSoltar(x, y) {
        if (this.estado === 'JUGANDO') {
            this.alSoltar(x, y);
        }
    }

    salirANiveles() {
        this.detener();
        if (window.appEco) {
            window.appEco.mostrarMapaNiveles(this.tipoId);
        }
    }

    // Métodos a sobreescribir por los 4 minijuegos
    reiniciar() {}
    actualizar(dt) {}
    dibujarEscena(ctx) {}
    motivoDerrota() { return '¡Se agotaron los recursos!'; }
    pista() { return [this.tipo.consejo]; }
    usaCorazones() { return false; }
    alPresionar(x, y) {}
    alMover(x, y) {}
    alSoltar(x, y) {}
    alTeclaPresionada(codigo) {}
    alTeclaSoltada(codigo) {}
}

window.MinijuegoBase = MinijuegoBase;

