/**
 * Operación EcoRescate - Sistema de Audio Procedural
 * Generado 100% con Web Audio API (sin archivos de audio externos ni dependencias).
 */
class SistemaAudio {
    constructor() {
        this.ctx = null;
        this.activo = true;
        this.musicaActiva = false;
        this.volumenEfectos = 0.35;
        this.volumenMusica = 0.15;
        this.musicaTimer = null;
        this.pasoMusica = 0;
        this.nodoMusicaGain = null;

        // Cargar preferencia guardada
        try {
            const guardado = localStorage.getItem('ecorescate_sonido');
            if (guardado !== null) {
                this.activo = guardado === 'true';
            }
        } catch (e) {}

        // Desbloquear AudioContext en la primera interacción
        const desbloquear = () => {
            this.obtenerContexto();
            window.removeEventListener('pointerdown', desbloquear);
            window.removeEventListener('keydown', desbloquear);
        };
        window.addEventListener('pointerdown', desbloquear);
        window.addEventListener('keydown', desbloquear);
    }

    obtenerContexto() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
        }
        return this.ctx;
    }

    alternar() {
        this.activo = !this.activo;
        try {
            localStorage.setItem('ecorescate_sonido', String(this.activo));
        } catch (e) {}

        if (!this.activo) {
            this.detenerMusica();
        } else if (this.musicaActiva) {
            this.iniciarMusica();
        }
        return this.activo;
    }

    midiAFrec(nota) {
        return 440 * Math.pow(2, (nota - 69) / 12);
    }

    tocarTono(frecInicio, frecFin, duracion, tipo = 'sine', vol = 0.3, retraso = 0) {
        if (!this.activo) return;
        try {
            const ctx = this.obtenerContexto();
            if (!ctx) return;

            const t0 = ctx.currentTime + retraso;
            const t1 = t0 + duracion;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = tipo;
            osc.frequency.setValueAtTime(Math.max(20, frecInicio), t0);
            if (frecFin && frecFin !== frecInicio) {
                osc.frequency.exponentialRampToValueAtTime(Math.max(20, frecFin), t1);
            }

            gain.gain.setValueAtTime(0.0001, t0);
            gain.gain.linearRampToValueAtTime(vol * this.volumenEfectos, t0 + Math.min(0.015, duracion * 0.1));
            gain.gain.exponentialRampToValueAtTime(0.0001, t1);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(t0);
            osc.stop(t1);
        } catch (e) {
            // Protección contra políticas de audio restrictivas del navegador
        }
    }

    tocarArpegio(notas, durPaso, durNota, tipo = 'triangle', vol = 0.25) {
        if (!this.activo) return;
        notas.forEach((nota, i) => {
            const frec = this.midiAFrec(nota);
            this.tocarTono(frec, frec, durNota, tipo, vol, i * durPaso);
        });
    }

    // Efectos de sonido de EcoRescate
    clic() {
        this.tocarTono(900, 650, 0.04, 'sine', 0.22);
    }

    recoger() {
        this.tocarTono(500, 1100, 0.08, 'sine', 0.3);
        this.tocarTono(1250, 1250, 0.07, 'triangle', 0.2, 0.06);
    }

    acierto(combo = 1) {
        const c = Math.max(1, Math.min(8, combo));
        // Escala pentatónica mayor alegre: Do, Re, Mi, Sol, La, Do alto, Re alto, Mi alto
        const pentatonica = [72, 74, 76, 79, 81, 84, 86, 88];
        const nota = pentatonica[(c - 1) % pentatonica.length];
        this.tocarTono(this.midiAFrec(nota), this.midiAFrec(nota), 0.1, 'triangle', 0.28);
        this.tocarTono(this.midiAFrec(nota + 12), this.midiAFrec(nota + 12), 0.16, 'sine', 0.18, 0.04);
    }

    error() {
        this.tocarTono(230, 170, 0.12, 'sawtooth', 0.18);
        this.tocarTono(170, 110, 0.16, 'square', 0.15, 0.12);
    }

    nivel() {
        this.tocarArpegio([72, 76, 79, 84], 0.08, 0.25, 'triangle', 0.25);
    }

    combo() {
        this.tocarArpegio([79, 84, 88], 0.06, 0.16, 'triangle', 0.25);
    }

    victoria() {
        this.tocarArpegio([72, 76, 79], 0.12, 0.15, 'triangle', 0.28);
        setTimeout(() => {
            if (!this.activo) return;
            this.tocarTono(this.midiAFrec(84), this.midiAFrec(84), 0.55, 'triangle', 0.3);
            this.tocarTono(this.midiAFrec(79), this.midiAFrec(79), 0.55, 'sine', 0.2);
            this.tocarTono(this.midiAFrec(76), this.midiAFrec(76), 0.55, 'sine', 0.15);
        }, 360);
    }

    derrota() {
        this.tocarArpegio([72, 70, 67, 64], 0.16, 0.28, 'sawtooth', 0.18);
    }

    moneda() {
        this.tocarTono(this.midiAFrec(83), this.midiAFrec(83), 0.06, 'square', 0.12);
        this.tocarTono(this.midiAFrec(88), this.midiAFrec(88), 0.2, 'square', 0.12, 0.06);
    }

    medalla() {
        this.tocarArpegio([84, 88, 91, 96], 0.07, 0.35, 'triangle', 0.22);
        this.tocarTono(this.midiAFrec(91), this.midiAFrec(91), 0.4, 'sine', 0.15, 0.28);
    }

    poder() {
        this.tocarTono(300, 1200, 0.32, 'sawtooth', 0.14);
        setTimeout(() => {
            this.tocarArpegio([84, 88, 91], 0.05, 0.15, 'triangle', 0.22);
        }, 280);
    }

    burbuja() {
        this.tocarTono(420, 1150, 0.09, 'sine', 0.32);
        this.tocarTono(1300, 1750, 0.14, 'triangle', 0.22, 0.05);
    }

    frenesi() {
        this.tocarArpegio([72, 76, 79, 84, 88, 91], 0.05, 0.18, 'triangle', 0.3);
        setTimeout(() => {
            if (!this.activo) return;
            this.tocarTono(this.midiAFrec(96), this.midiAFrec(96), 0.4, 'sine', 0.25);
        }, 300);
    }

    estrellaImpacto(indice = 0) {
        const notas = [76, 81, 88];
        const n = notas[Math.min(2, indice)];
        this.tocarTono(this.midiAFrec(n), this.midiAFrec(n), 0.18, 'triangle', 0.32);
        this.tocarTono(this.midiAFrec(n + 12), this.midiAFrec(n + 12), 0.28, 'sine', 0.22, 0.05);
    }

    estrella() {
        this.tocarTono(this.midiAFrec(88), this.midiAFrec(88), 0.05, 'triangle', 0.28);
        this.tocarTono(this.midiAFrec(95), this.midiAFrec(95), 0.24, 'sine', 0.22, 0.05);
    }

    // Música alegre y optimista de fondo (canción de Operación EcoRescate)
    iniciarMusica() {
        this.musicaActiva = true;
        if (!this.activo) return;
        const ctx = this.obtenerContexto();
        if (!ctx) return;
        if (this.musicaTimer) return;

        // Patrón melódico alegre en Do Mayor / Sol Mayor
        const melodia = [
            72, 76, 79, 76, 84, 79, 76, 72,
            74, 77, 81, 77, 83, 79, 74, 71,
            72, 76, 79, 84, 86, 84, 79, 76,
            77, 79, 81, 79, 76, 74, 72, 72
        ];
        const bajo = [
            48, 48, 55, 55, 53, 53, 48, 48,
            50, 50, 55, 55, 50, 50, 47, 47,
            48, 48, 52, 52, 55, 55, 52, 52,
            53, 53, 55, 55, 48, 48, 48, 48
        ];

        const pasoDuracion = 0.24; // ~125 BPM
        this.pasoMusica = 0;

        const programarPaso = () => {
            if (!this.musicaActiva || !this.activo) return;
            const t = ctx.currentTime;
            const idx = this.pasoMusica % melodia.length;

            // Nota melodía
            const notaM = melodia[idx];
            if (notaM) {
                const frecM = this.midiAFrec(notaM);
                const oscM = ctx.createOscillator();
                const gainM = ctx.createGain();
                oscM.type = 'triangle';
                oscM.frequency.setValueAtTime(frecM, t);

                gainM.gain.setValueAtTime(0.0001, t);
                gainM.gain.linearRampToValueAtTime(this.volumenMusica * 0.35, t + 0.02);
                gainM.gain.exponentialRampToValueAtTime(0.0001, t + pasoDuracion * 0.85);

                oscM.connect(gainM);
                gainM.connect(ctx.destination);
                oscM.start(t);
                oscM.stop(t + pasoDuracion);
            }

            // Nota bajo (cada 2 pasos)
            if (idx % 2 === 0) {
                const notaB = bajo[idx];
                const frecB = this.midiAFrec(notaB);
                const oscB = ctx.createOscillator();
                const gainB = ctx.createGain();
                oscB.type = 'sine';
                oscB.frequency.setValueAtTime(frecB, t);

                gainB.gain.setValueAtTime(0.0001, t);
                gainB.gain.linearRampToValueAtTime(this.volumenMusica * 0.45, t + 0.03);
                gainB.gain.exponentialRampToValueAtTime(0.0001, t + pasoDuracion * 1.8);

                oscB.connect(gainB);
                gainB.connect(ctx.destination);
                oscB.start(t);
                oscB.stop(t + pasoDuracion * 2);
            }

            this.pasoMusica++;
            this.musicaTimer = setTimeout(programarPaso, pasoDuracion * 1000);
        };

        programarPaso();
    }

    detenerMusica() {
        this.musicaActiva = false;
        if (this.musicaTimer) {
            clearTimeout(this.musicaTimer);
            this.musicaTimer = null;
        }
    }
}

// Instancia global
window.audioEco = new SistemaAudio();

