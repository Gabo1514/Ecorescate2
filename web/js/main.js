/**
 * Operación EcoRescate - Controlador Principal de la Aplicación Web
 * Interfaz limpia, diseño humano con gráficos vectoriales SVG y sin emojis.
 */

class AppEcoRescate {
    constructor() {
        this.juegoActualId = null;
        this.instanciaJuego = null;
        this.canvas = document.getElementById('lienzoJuego');

        this.inicializarElementos();
        this.vincularEventos();
        this.comprobarEstudiante();
        if (window.location.hash === '#tienda') {
            this.abrirTienda();
        }
    }

    // Generadores de íconos SVG reutilizables
    static svgEstrella(llena = true) {
        const color = llena ? '#EAB308' : '#CBD5E1';
        return `<svg class="icono-svg" viewBox="0 0 24 24" style="color: ${color}; width: 16px; height: 16px;">
            <polygon points="12,2 15.1,8.3 22,9.3 17,14.1 18.2,21 12,17.7 5.8,21 7,14.1 2,9.3 8.9,8.3" fill="currentColor" stroke="#2A2340" stroke-width="1.5" stroke-linejoin="round"/>
        </svg>`;
    }

    static svgCandado() {
        return `<svg class="icono-svg" viewBox="0 0 24 24" style="color: #64748B; width: 16px; height: 16px;">
            <path d="M18 8h-1V6c0-2.8-2.2-5-5-5S7 3.2 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.7 1.4-3.1 3.1-3.1s3.1 1.4 3.1 3.1v2z"/>
        </svg>`;
    }

    inicializarElementos() {
        this.vistaMenu = document.getElementById('vistaMenu');
        this.vistaMapa = document.getElementById('vistaMapa');
        this.vistaJuego = document.getElementById('vistaJuego');
        this.vistaDocente = document.getElementById('vistaDocente');

        this.headerNombre = document.getElementById('headerNombre');
        this.headerGrado = document.getElementById('headerGrado');
        this.headerMonedas = document.getElementById('headerMonedas');
        this.headerEstrellas = document.getElementById('headerEstrellas');
        this.btnSonidoToggle = document.getElementById('btnSonidoToggle');
        this.avatarIcono = document.getElementById('avatarIcono');

        this.btnAccesoDocente = document.getElementById('btnAccesoDocente');
        this.btnCerrarSesion = document.getElementById('btnCerrarSesion');
        this.textoBotonDocente = document.getElementById('textoBotonDocente');

        this.modalRegistro = document.getElementById('modalRegistro');
        this.modalTienda = document.getElementById('modalTienda');
        this.modalMedallas = document.getElementById('modalMedallas');
        this.modalRanking = document.getElementById('modalRanking');
        this.modalImpacto = document.getElementById('modalImpacto');
        this.modalFichaAlumno = document.getElementById('modalFichaAlumno');

        // Elementos de Login y Registro
        this.tabBtnEstudiante = document.getElementById('tabBtnEstudiante');
        this.tabBtnDocente = document.getElementById('tabBtnDocente');
        this.panelLoginEstudiante = document.getElementById('panelLoginEstudiante');
        this.panelLoginDocente = document.getElementById('panelLoginDocente');
        this.inputCodigoEstudiante = document.getElementById('inputCodigoEstudiante');
        this.inputNombre = document.getElementById('inputNombre');
        this.selectGrado = document.getElementById('selectGrado');
        this.selectSeccion = document.getElementById('selectSeccion');
        this.alertaAlumnoReconocido = document.getElementById('alertaAlumnoReconocido');
        this.textoAlumnoReconocido = document.getElementById('textoAlumnoReconocido');
        this.contenedorChipsAlumnos = document.getElementById('contenedorChipsAlumnos');

        this.formLoginDocente = document.getElementById('formLoginDocente');
        this.inputUsuarioDocente = document.getElementById('inputUsuarioDocente');
        this.inputClaveDocente = document.getElementById('inputClaveDocente');
        this.errorLoginDocente = document.getElementById('errorLoginDocente');

        // Elementos del Panel Docente
        this.btnDescargarReporteDocente = document.getElementById('btnDescargarReporteDocente');
        this.btnProbarModoAlumno = document.getElementById('btnProbarModoAlumno');
        this.btnCerrarSesionDocente = document.getElementById('btnCerrarSesionDocente');
        this.buscarAlumnoDocente = document.getElementById('buscarAlumnoDocente');
        this.filtroDocenteGrado = document.getElementById('filtroDocenteGrado');
        this.filtroDocenteSeccion = document.getElementById('filtroDocenteSeccion');
        this.cuerpoTablaDocente = document.getElementById('cuerpoTablaDocente');
        this.docenteNumAlumnos = document.getElementById('docenteNumAlumnos');
        this.docenteTotalAgua = document.getElementById('docenteTotalAgua');
        this.docenteTotalResiduos = document.getElementById('docenteTotalResiduos');
        this.docenteTotalEnergiaBio = document.getElementById('docenteTotalEnergiaBio');
        this.docentePromedioNotas = document.getElementById('docentePromedioNotas');

        // Elementos de Ficha Alumno
        this.fichaAlumnoTitulo = document.getElementById('fichaAlumnoTitulo');
        this.cuerpoFichaAlumno = document.getElementById('cuerpoFichaAlumno');
        this.btnCerrarFichaAlumno = document.getElementById('btnCerrarFichaAlumno');
    }

    vincularEventos() {
        // Logo clic vuelve al menú
        document.getElementById('btnLogoInicio').addEventListener('click', () => {
            window.audioEco.clic();
            this.mostrarMenuPrincipal();
        });

        // Cambiar perfil o login
        document.getElementById('btnCambiarPerfil').addEventListener('click', () => {
            window.audioEco.clic();
            if (window.storageEco.esSesionDocente()) {
                this.mostrarPanelDocente();
            } else {
                this.abrirModalRegistro('ESTUDIANTE');
            }
        });

        // Botón cerrar sesión / cambiar alumno
        if (this.btnCerrarSesion) {
            this.btnCerrarSesion.addEventListener('click', () => {
                window.audioEco.clic();
                window.storageEco.cerrarSesionEstudiante();
                window.storageEco.cerrarSesionDocente();
                this.abrirModalRegistro('ESTUDIANTE');
            });
        }

        // Acceso Docente desde el header
        if (this.btnAccesoDocente) {
            this.btnAccesoDocente.addEventListener('click', () => {
                window.audioEco.clic();
                if (window.storageEco.esSesionDocente()) {
                    this.mostrarPanelDocente();
                } else {
                    this.abrirModalRegistro('DOCENTE');
                }
            });
        }

        // Toggle sonido
        this.btnSonidoToggle.addEventListener('click', () => {
            const activo = window.audioEco.alternar();
            this.actualizarBotonSonido(activo);
            if (activo) window.audioEco.clic();
        });

        // Pestañas del modal de login
        if (this.tabBtnEstudiante) {
            this.tabBtnEstudiante.addEventListener('click', () => {
                window.audioEco.clic();
                this.activarTabLogin('ESTUDIANTE');
            });
        }
        if (this.tabBtnDocente) {
            this.tabBtnDocente.addEventListener('click', () => {
                window.audioEco.clic();
                this.activarTabLogin('DOCENTE');
            });
        }

        // Reconocimiento inteligente al ingresar DNI o Código de Estudiante (máx. 8 cifras)
        if (this.inputCodigoEstudiante) {
            const manejarReconocimiento = () => {
                // Forzar solo dígitos numéricos y máximo 8 cifras
                this.inputCodigoEstudiante.value = this.inputCodigoEstudiante.value.replace(/\D/g, '').slice(0, 8);
                const codigo = this.inputCodigoEstudiante.value.trim();
                if (!codigo) {
                    if (this.alertaAlumnoReconocido) this.alertaAlumnoReconocido.style.display = 'none';
                    return;
                }
                const hallado = window.storageEco.buscarEstudiante(codigo);
                if (hallado) {
                    const p = hallado.perfil;
                    if (this.inputNombre) this.inputNombre.value = p.nombre;
                    if (this.selectGrado) this.selectGrado.value = String(p.grado);
                    if (this.selectSeccion) this.selectSeccion.value = p.seccion;
                    if (this.alertaAlumnoReconocido && this.textoAlumnoReconocido) {
                        const totalEst = window.storageEco.totalEstrellasGeneral(p);
                        this.textoAlumnoReconocido.textContent = `¡Hola de nuevo, ${p.nombre}! Tienes ${totalEst} estrellas guardadas.`;
                        this.alertaAlumnoReconocido.style.display = 'flex';
                    }
                } else {
                    if (this.alertaAlumnoReconocido) this.alertaAlumnoReconocido.style.display = 'none';
                }
            };
            this.inputCodigoEstudiante.addEventListener('input', manejarReconocimiento);
            this.inputCodigoEstudiante.addEventListener('change', manejarReconocimiento);
        }

        // Restringir usuario/DNI de docente a máx. 8 cifras o letras
        if (this.inputUsuarioDocente) {
            this.inputUsuarioDocente.addEventListener('input', (e) => {
                if (e.target.value.length > 8) {
                    e.target.value = e.target.value.slice(0, 8);
                }
            });
        }

        // Restringir contraseña de docente a máx. 12 dígitos o letras
        if (this.inputClaveDocente) {
            this.inputClaveDocente.addEventListener('input', (e) => {
                if (e.target.value.length > 12) {
                    e.target.value = e.target.value.slice(0, 12);
                }
            });
        }

        // Formulario de registro/login de estudiante
        document.getElementById('formRegistroEstudiante').addEventListener('submit', (e) => {
            e.preventDefault();
            this.guardarRegistroEstudiante();
        });

        // Formulario de login de docente
        if (this.formLoginDocente) {
            this.formLoginDocente.addEventListener('submit', (e) => {
                e.preventDefault();
                this.procesarLoginDocente();
            });
        }

        // Botones del Panel Docente
        if (this.btnDescargarReporteDocente) {
            this.btnDescargarReporteDocente.addEventListener('click', () => {
                window.audioEco.moneda();
                window.storageEco.exportarExcel();
            });
        }
        const btnDescargarCSV = document.getElementById('btnDescargarCSV');
        if (btnDescargarCSV) {
            btnDescargarCSV.addEventListener('click', () => {
                window.audioEco.moneda();
                window.storageEco.exportarCSV();
            });
        }
        if (this.btnProbarModoAlumno) {
            this.btnProbarModoAlumno.addEventListener('click', () => {
                window.audioEco.clic();
                this.mostrarMenuPrincipal();
            });
        }
        if (this.btnCerrarSesionDocente) {
            this.btnCerrarSesionDocente.addEventListener('click', () => {
                window.audioEco.clic();
                window.storageEco.cerrarSesionDocente();
                this.abrirModalRegistro('DOCENTE');
            });
        }

        // Filtros del Panel Docente
        if (this.buscarAlumnoDocente) {
            this.buscarAlumnoDocente.addEventListener('input', () => this.renderizarPanelDocente());
        }
        if (this.filtroDocenteGrado) {
            this.filtroDocenteGrado.addEventListener('change', () => this.renderizarPanelDocente());
        }
        if (this.filtroDocenteSeccion) {
            this.filtroDocenteSeccion.addEventListener('change', () => this.renderizarPanelDocente());
        }

        // Cerrar Ficha Alumno
        if (this.btnCerrarFichaAlumno) {
            this.btnCerrarFichaAlumno.addEventListener('click', () => {
                window.audioEco.clic();
                this.cerrarModal(this.modalFichaAlumno);
            });
        }

        // Clic en tarjetas de minijuegos
        document.querySelectorAll('.tarjeta-juego').forEach(tarjeta => {
            tarjeta.addEventListener('click', () => {
                const juegoId = tarjeta.getAttribute('data-juego');
                window.audioEco.clic();
                this.mostrarMapaNiveles(juegoId);
            });
        });

        // Volver al menú desde el mapa
        document.getElementById('btnVolverAlMenu').addEventListener('click', () => {
            window.audioEco.clic();
            this.mostrarMenuPrincipal();
        });

        // Accesos rápidos
        document.getElementById('btnAbrirTienda').addEventListener('click', () => {
            window.audioEco.clic();
            this.abrirTienda();
        });
        document.getElementById('btnCerrarTienda').addEventListener('click', () => {
            window.audioEco.clic();
            this.cerrarModal(this.modalTienda);
        });

        // Pestañas de la Tienda
        const btnTabAcc = document.getElementById('btnTabAccesorios');
        const btnTabPol = document.getElementById('btnTabPolos');
        const contAcc = document.getElementById('tiendaContenedorAccesorios');
        const contPol = document.getElementById('tiendaContenedorPolos');

        if (btnTabAcc && btnTabPol) {
            btnTabAcc.addEventListener('click', () => {
                window.audioEco.clic();
                btnTabAcc.style.background = '#7C4DFF';
                btnTabAcc.style.color = '#FFFFFF';
                btnTabPol.style.background = '#F1F5F9';
                btnTabPol.style.color = 'var(--color-trazo)';
                if (contAcc) contAcc.style.display = 'grid';
                if (contPol) contPol.style.display = 'none';
            });

            btnTabPol.addEventListener('click', () => {
                window.audioEco.clic();
                btnTabPol.style.background = '#7C4DFF';
                btnTabPol.style.color = '#FFFFFF';
                btnTabAcc.style.background = '#F1F5F9';
                btnTabAcc.style.color = 'var(--color-trazo)';
                if (contPol) contPol.style.display = 'grid';
                if (contAcc) contAcc.style.display = 'none';
            });
        }

        document.getElementById('btnAbrirMedallas').addEventListener('click', () => {
            window.audioEco.clic();
            this.abrirMedallas();
        });
        document.getElementById('btnCerrarMedallas').addEventListener('click', () => {
            window.audioEco.clic();
            this.cerrarModal(this.modalMedallas);
        });

        document.getElementById('btnAbrirRanking').addEventListener('click', () => {
            window.audioEco.clic();
            this.abrirRanking();
        });
        document.getElementById('btnCerrarRanking').addEventListener('click', () => {
            window.audioEco.clic();
            this.cerrarModal(this.modalRanking);
        });

        // Filtros del ranking
        const fGrado = document.getElementById('filtroRankingGrado');
        const fSecc = document.getElementById('filtroRankingSeccion');
        if (fGrado) fGrado.addEventListener('change', () => this.renderizarTablaRanking());
        if (fSecc) fSecc.addEventListener('change', () => this.renderizarTablaRanking());

        document.getElementById('btnAbrirImpacto').addEventListener('click', () => {
            window.audioEco.clic();
            this.abrirImpacto();
        });
        document.getElementById('btnCerrarImpacto').addEventListener('click', () => {
            window.audioEco.clic();
            this.cerrarModal(this.modalImpacto);
        });
    }

    comprobarEstudiante() {
        if (window.storageEco.esSesionDocente()) {
            this.actualizarHeader();
            this.mostrarPanelDocente();
            this.actualizarBotonSonido(window.audioEco.activo);
            return;
        }

        const activo = window.storageEco.cargarEstudianteActivo();
        if (!activo || !activo.nombre) {
            this.abrirModalRegistro('ESTUDIANTE');
        } else {
            this.actualizarHeader();
            this.mostrarMenuPrincipal();
        }
        this.actualizarBotonSonido(window.audioEco.activo);
    }

    actualizarBotonSonido(activo) {
        this.btnSonidoToggle.innerHTML = activo ? `
            <svg class="icono-svg" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.8-1-3.3-2.5-4v8c1.5-.7 2.5-2.2 2.5-4zM14 3.2v2.1c2.9.9 5 3.5 5 6.7s-2.1 5.8-5 6.7v2.1c4-.9 7-4.5 7-8.8s-3-7.9-7-8.8z"/>
            </svg>
        ` : `
            <svg class="icono-svg" viewBox="0 0 24 24" style="color: #94A3B8;">
                <path d="M16.5 12c0-1.8-1-3.3-2.5-4v2.2l2.5 2.5v-.7zm2.5 0c0 .9-.2 1.8-.5 2.6l1.5 1.5c.7-1.3 1-2.7 1-4.1 0-4.3-3-7.9-7-8.8v2.1c2.9.9 5 3.5 5 6.7zM4.3 3L3 4.3 7.7 9H3v6h4l5 5v-6.7l4.3 4.3c-.7.5-1.5.9-2.3 1.1v2.1c1.4-.3 2.6-.9 3.7-1.8l2 2 1.3-1.3L4.3 3zM12 4L9.9 6.1 12 8.2V4z"/>
            </svg>
        `;
    }

    activarTabLogin(tab = 'ESTUDIANTE') {
        const esEst = tab === 'ESTUDIANTE';
        if (this.tabBtnEstudiante) this.tabBtnEstudiante.classList.toggle('activo', esEst);
        if (this.tabBtnDocente) this.tabBtnDocente.classList.toggle('activo', !esEst);
        if (this.panelLoginEstudiante) this.panelLoginEstudiante.style.display = esEst ? 'block' : 'none';
        if (this.panelLoginDocente) this.panelLoginDocente.style.display = esEst ? 'none' : 'block';
        if (this.errorLoginDocente) this.errorLoginDocente.style.display = 'none';
    }

    abrirModalRegistro(tabInicial = 'ESTUDIANTE') {
        this.activarTabLogin(tabInicial);

        const activo = window.storageEco.cargarEstudianteActivo();
        if (activo) {
            if (this.inputCodigoEstudiante) this.inputCodigoEstudiante.value = activo.dni || activo.codigo || '';
            if (this.inputNombre) this.inputNombre.value = activo.nombre || '';
            if (this.selectGrado) this.selectGrado.value = String(activo.grado || '5');
            if (this.selectSeccion) this.selectSeccion.value = activo.seccion || 'A';
            if (this.alertaAlumnoReconocido) this.alertaAlumnoReconocido.style.display = 'none';
        }

        // Renderizar lista rápida de alumnos guardados en este equipo
        if (this.contenedorChipsAlumnos) {
            const recientes = window.storageEco.listarAlumnosRecientes();
            this.contenedorChipsAlumnos.innerHTML = '';
            if (recientes.length === 0) {
                this.contenedorChipsAlumnos.innerHTML = '<span style="font-size: 11.5px; color: #94A3B8;">No hay perfiles previos en este equipo.</span>';
            } else {
                recientes.forEach(al => {
                    const chip = document.createElement('div');
                    chip.className = 'chip-alumno';
                    chip.title = `DNI: ${al.dni || al.codigo || 'S/DNI'} - ${al.estrellas} estrellas`;
                    chip.innerHTML = `
                        <span style="background: #E2E8F0; width: 18px; height: 18px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 900;">
                            ${al.nombre.charAt(0)}
                        </span>
                        <span>${al.nombre} (${al.grado}° ${al.seccion})</span>
                        <span style="color: #EAB308; font-weight: 800; font-size: 10.5px;">★${al.estrellas}</span>
                    `;
                    chip.addEventListener('click', () => {
                        window.audioEco.clic();
                        if (this.inputCodigoEstudiante) this.inputCodigoEstudiante.value = al.dni || al.codigo || '';
                        if (this.inputNombre) this.inputNombre.value = al.nombre;
                        if (this.selectGrado) this.selectGrado.value = String(al.grado);
                        if (this.selectSeccion) this.selectSeccion.value = al.seccion;
                        if (this.alertaAlumnoReconocido && this.textoAlumnoReconocido) {
                            this.textoAlumnoReconocido.textContent = `¡Hola, ${al.nombre}! Tienes ${al.estrellas} estrellas guardadas.`;
                            this.alertaAlumnoReconocido.style.display = 'flex';
                        }
                    });
                    this.contenedorChipsAlumnos.appendChild(chip);
                });
            }
        }

        this.modalRegistro.classList.add('activo');
    }

    guardarRegistroEstudiante() {
        const codigo = this.inputCodigoEstudiante ? this.inputCodigoEstudiante.value.trim() : '';
        const nombre = this.inputNombre.value.trim();
        const grado = parseInt(this.selectGrado.value, 10);
        const seccion = this.selectSeccion.value;

        if (!nombre) {
            alert('Por favor ingresa el nombre del alumno.');
            if (this.inputNombre) this.inputNombre.focus();
            return;
        }

        // Validar DNI de 8 cifras
        if (codigo.length !== 8 || !/^\d{8}$/.test(codigo)) {
            alert('El DNI debe tener exactamente 8 cifras numéricas.');
            if (this.inputCodigoEstudiante) this.inputCodigoEstudiante.focus();
            return;
        }

        const estudiante = {
            dni: codigo,
            codigo: codigo,
            nombre,
            grado,
            seccion
        };

        window.storageEco.cerrarSesionDocente();
        window.storageEco.establecerEstudianteActivo(estudiante);
        this.modalRegistro.classList.remove('activo');
        window.audioEco.nivel();

        this.actualizarHeader();
        this.mostrarMenuPrincipal();
    }

    procesarLoginDocente() {
        const usuario = this.inputUsuarioDocente ? this.inputUsuarioDocente.value.trim() : 'Docente';
        const clave = this.inputClaveDocente ? this.inputClaveDocente.value.trim() : '';

        const exito = window.storageEco.iniciarSesionDocente(usuario, clave);
        if (exito) {
            window.audioEco.nivel();
            this.modalRegistro.classList.remove('activo');
            if (this.errorLoginDocente) this.errorLoginDocente.style.display = 'none';
            this.mostrarPanelDocente();
        } else {
            window.audioEco.error();
            if (this.errorLoginDocente) this.errorLoginDocente.style.display = 'block';
        }
    }

    actualizarHeader() {
        if (window.storageEco.esSesionDocente()) {
            this.headerNombre.textContent = window.storageEco.sesionDocente.usuario;
            this.headerGrado.textContent = 'Docente / Administrador';
            if (this.textoBotonDocente) this.textoBotonDocente.textContent = 'Panel Docente';
            if (this.btnAccesoDocente) this.btnAccesoDocente.classList.add('activo');
            return;
        }

        if (this.textoBotonDocente) this.textoBotonDocente.textContent = 'Docente';
        if (this.btnAccesoDocente) this.btnAccesoDocente.classList.remove('activo');

        const perfil = window.storageEco.obtenerPerfil();
        if (!perfil) return;

        this.headerNombre.textContent = perfil.nombre;
        const dniTexto = (perfil.dni || perfil.codigo) ? ` • DNI: ${perfil.dni || perfil.codigo}` : '';
        this.headerGrado.textContent = `${perfil.grado}° "${perfil.seccion}" Primaria${dniTexto}`;
        this.headerMonedas.textContent = perfil.monedas || 0;

        const totalEstrellas = window.storageEco.totalEstrellasGeneral(perfil);
        this.headerEstrellas.textContent = `${totalEstrellas}/120`;

        this.actualizarBarrasMenu(perfil);
    }

    actualizarBarrasMenu(perfil) {
        ['LIMPIEZA', 'AGUA', 'ENERGIA', 'VERDE'].forEach(juegoId => {
            const superados = window.storageEco.nivelesSuperadosJuego(juegoId, perfil);
            const estrellas = window.storageEco.totalEstrellasJuego(juegoId, perfil);
            const pct = Math.round((superados / 10) * 100);

            const textoEl = document.getElementById(`progresoTexto${this.capitalizar(juegoId)}`);
            const barraEl = document.getElementById(`barra${this.capitalizar(juegoId)}`);

            if (textoEl) textoEl.textContent = `${superados}/10 niveles (${estrellas} estrellas)`;
            if (barraEl) barraEl.style.width = `${pct}%`;
        });
    }

    capitalizar(str) {
        const lower = str.toLowerCase();
        return lower.charAt(0).toUpperCase() + lower.slice(1);
    }

    // Navegación de Vistas
    mostrarMenuPrincipal() {
        if (this.instanciaJuego) {
            this.instanciaJuego.detener();
            this.instanciaJuego = null;
        }
        this.vistaMenu.style.display = 'flex';
        this.vistaMapa.style.display = 'none';
        this.vistaJuego.style.display = 'none';
        if (this.vistaDocente) this.vistaDocente.style.display = 'none';
        this.actualizarHeader();
    }

    mostrarMapaNiveles(juegoId) {
        if (this.instanciaJuego) {
            this.instanciaJuego.detener();
            this.instanciaJuego = null;
        }

        this.juegoActualId = juegoId;
        const info = JUEGOS[juegoId];

        document.getElementById('mapaTitulo').textContent = info.nombre;
        document.getElementById('mapaSubtitulo').textContent = `${info.lugar} • ${info.descripcion}`;

        this.construirGridNiveles(juegoId);

        this.vistaMenu.style.display = 'none';
        this.vistaMapa.style.display = 'flex';
        this.vistaJuego.style.display = 'none';
        if (this.vistaDocente) this.vistaDocente.style.display = 'none';
    }

    mostrarPanelDocente() {
        if (this.instanciaJuego) {
            this.instanciaJuego.detener();
            this.instanciaJuego = null;
        }
        this.cerrarModal(this.modalRegistro);
        this.vistaMenu.style.display = 'none';
        this.vistaMapa.style.display = 'none';
        this.vistaJuego.style.display = 'none';
        if (this.vistaDocente) this.vistaDocente.style.display = 'flex';
        this.renderizarPanelDocente();
        this.actualizarHeader();
    }

    renderizarPanelDocente() {
        const grado = this.filtroDocenteGrado ? this.filtroDocenteGrado.value : '';
        const seccion = this.filtroDocenteSeccion ? this.filtroDocenteSeccion.value : '';
        const busqueda = this.buscarAlumnoDocente ? this.buscarAlumnoDocente.value : '';

        const reporte = window.storageEco.obtenerReporteDocente(grado, seccion, busqueda);

        if (this.docenteNumAlumnos) this.docenteNumAlumnos.textContent = `${reporte.metricas.totalAlumnos} Alumnos`;
        if (this.docenteTotalAgua) this.docenteTotalAgua.textContent = `${reporte.metricas.totalLitrosAgua.toLocaleString()} L`;
        if (this.docenteTotalResiduos) this.docenteTotalResiduos.textContent = `${reporte.metricas.totalResiduos.toLocaleString()} kg`;
        if (this.docenteTotalEnergiaBio) this.docenteTotalEnergiaBio.textContent = `${reporte.metricas.totalKwhEnergia} kWh / ${reporte.metricas.totalAreaVerde} m²`;
        if (this.docentePromedioNotas && reporte.metricas.escalaPromedio) {
            const esc = reporte.metricas.escalaPromedio;
            this.docentePromedioNotas.innerHTML = `${reporte.metricas.promedioCalificacion} / 20 <span class="badge-mini-escala" style="background: ${esc.bg}; color: ${esc.color}; border: 1.5px solid ${esc.borde}; padding: 2px 7px; border-radius: 6px; font-size: 11px; margin-left: 4px;">${esc.literal}</span>`;
        }

        if (!this.cuerpoTablaDocente) return;
        this.cuerpoTablaDocente.innerHTML = '';

        if (reporte.alumnos.length === 0) {
            this.cuerpoTablaDocente.innerHTML = `
                <tr>
                    <td colspan="12" style="text-align: center; padding: 24px; color: #64748B;">
                        No se encontraron estudiantes para los filtros seleccionados.
                    </td>
                </tr>
            `;
            return;
        }

        reporte.alumnos.forEach((a) => {
            const tr = document.createElement('tr');
            const esc = a.escala || { literal: 'A', bg: '#DBEAFE', color: '#1D4ED8', borde: '#93C5FD' };
            const origenTexto = a.esDocente ? 'Docente' : 'Misiones';

            tr.innerHTML = `
                <td style="font-weight: 800; font-family: monospace; color: #475569;">${a.dni}</td>
                <td>
                    <div style="font-weight: 800; color: #1E1B2E;">${a.nombre}</div>
                    <div style="font-size: 11px; color: #64748B;">${a.totalPartidas} partidas registradas</div>
                </td>
                <td><span class="puesto-badge puesto-otro">${a.grado}° "${a.seccion}"</span></td>
                <td>
                    <span>${a.nivelesLimpieza}/10</span>
                    <span style="color: #EAB308; font-weight: 800; font-size: 11.5px; margin-left: 3px;">★${a.estrellasLimpieza}</span>
                </td>
                <td>
                    <span>${a.nivelesAgua}/10</span>
                    <span style="color: #EAB308; font-weight: 800; font-size: 11.5px; margin-left: 3px;">★${a.estrellasAgua}</span>
                </td>
                <td>
                    <span>${a.nivelesEnergia}/10</span>
                    <span style="color: #EAB308; font-weight: 800; font-size: 11.5px; margin-left: 3px;">★${a.estrellasEnergia}</span>
                </td>
                <td>
                    <span>${a.nivelesVerde}/10</span>
                    <span style="color: #EAB308; font-weight: 800; font-size: 11.5px; margin-left: 3px;">★${a.estrellasVerde}</span>
                </td>
                <td style="font-weight: 900; color: #B45309;">
                    ★ ${a.totalEstrellas} / 120
                </td>
                <td style="text-align: center; min-width: 140px; background: #FAF5FF;">
                    <div class="caja-nota-editable" style="display: inline-flex; align-items: center; justify-content: center; gap: 4px;">
                        <input 
                            type="number" 
                            class="input-nota-tabla" 
                            data-clave="${a.clave}" 
                            min="1" 
                            max="20" 
                            step="1" 
                            value="${a.calificacion}" 
                            title="Haz clic para escribir o cambiar la nota (1 al 20)"
                            style="width: 48px; padding: 4px 2px; font-size: 15px; font-weight: 900; text-align: center; border: 2px solid var(--color-trazo); border-radius: 8px; background: #FFFFFF; color: var(--color-trazo); cursor: pointer;"
                        >
                        <span style="font-weight: 800; font-size: 12px; color: #64748B;">/20</span>
                        <span class="badge-mini-escala" style="background: ${esc.bg}; color: ${esc.color}; border: 1.5px solid ${esc.borde}; padding: 2px 6px; border-radius: 6px; font-weight: 900; font-size: 11px;">
                            ${esc.literal}
                        </span>
                    </div>
                    <span class="estado-guardado-nota" style="display: block; font-size: 10px; font-weight: 700; color: ${a.esDocente ? '#7C3AED' : '#64748B'}; min-height: 14px; margin-top: 2px;">
                        ${a.esDocente ? 'Nota Docente' : 'Nota Juego'}
                    </span>
                </td>
                <td style="font-weight: 800; color: #6B21A8;">
                    ${a.medallas} / 14
                </td>
                <td>
                    <div style="display: flex; align-items: center; gap: 6px;">
                        <span style="font-weight: 800; width: 34px;">${a.avancePct}%</span>
                        <div class="barra-mini-tabla">
                            <div class="barra-mini-fill" style="width: ${a.avancePct}%;"></div>
                        </div>
                    </div>
                </td>
                <td>
                    <button class="btn-tabla-ver" data-clave="${a.clave}">Ficha</button>
                </td>
            `;

            const btnVer = tr.querySelector('.btn-tabla-ver');
            btnVer.addEventListener('click', () => {
                window.audioEco.clic();
                this.abrirFichaAlumno(a.clave);
            });

            // Eventos para editar la nota directamente en la fila de la tabla
            const inputNota = tr.querySelector('.input-nota-tabla');
            const badgeEscala = tr.querySelector('.badge-mini-escala');
            const estadoGuardado = tr.querySelector('.estado-guardado-nota');

            if (inputNota) {
                inputNota.addEventListener('input', () => {
                    let val = parseInt(inputNota.value, 10);
                    if (isNaN(val)) return;
                    val = Math.max(1, Math.min(20, val));
                    const nuevaEscala = (typeof obtenerEscalaMINEDU === 'function')
                        ? obtenerEscalaMINEDU(val)
                        : { literal: 'A', bg: '#DBEAFE', color: '#1D4ED8', borde: '#93C5FD' };
                    if (badgeEscala) {
                        badgeEscala.textContent = nuevaEscala.literal;
                        badgeEscala.style.background = nuevaEscala.bg;
                        badgeEscala.style.color = nuevaEscala.color;
                        badgeEscala.style.borderColor = nuevaEscala.borde;
                    }
                });

                const guardarNotaFila = () => {
                    let val = parseInt(inputNota.value, 10);
                    if (isNaN(val) || val < 1) val = 1;
                    if (val > 20) val = 20;
                    inputNota.value = val;

                    const clave = inputNota.getAttribute('data-clave');
                    const guardado = window.storageEco.guardarCalificacionDocente(clave, val, a.observacionDocente || '');
                    if (guardado) {
                        window.audioEco.clic();
                        if (estadoGuardado) {
                            estadoGuardado.textContent = '¡Guardado ✓!';
                            estadoGuardado.style.color = '#16A34A';
                            setTimeout(() => {
                                estadoGuardado.textContent = 'Nota Docente';
                                estadoGuardado.style.color = '#7C3AED';
                            }, 1800);
                        }
                        // Recalcular métricas de la cabecera
                        const g = this.filtroDocenteGrado ? this.filtroDocenteGrado.value : '';
                        const s = this.filtroDocenteSeccion ? this.filtroDocenteSeccion.value : '';
                        const b = this.buscarAlumnoDocente ? this.buscarAlumnoDocente.value : '';
                        const nuevoReporte = window.storageEco.obtenerReporteDocente(g, s, b);
                        if (this.docentePromedioNotas && nuevoReporte.metricas.escalaPromedio) {
                            const escP = nuevoReporte.metricas.escalaPromedio;
                            this.docentePromedioNotas.innerHTML = `${nuevoReporte.metricas.promedioCalificacion} / 20 <span class="badge-mini-escala" style="background: ${escP.bg}; color: ${escP.color}; border: 1.5px solid ${escP.borde}; padding: 2px 7px; border-radius: 6px; font-size: 11px; margin-left: 4px;">${escP.literal}</span>`;
                        }
                    }
                };

                inputNota.addEventListener('change', guardarNotaFila);
                inputNota.addEventListener('blur', guardarNotaFila);
                inputNota.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        inputNota.blur();
                    }
                });
            }

            this.cuerpoTablaDocente.appendChild(tr);
        });
    }

    abrirFichaAlumno(clave) {
        const perfil = window.storageEco.perfiles[clave];
        if (!perfil) return;

        if (this.fichaAlumnoTitulo) this.fichaAlumnoTitulo.textContent = `Ficha Pedagógica: ${perfil.nombre}`;
        const impacto = window.storageEco.obtenerImpacto(perfil);
        const totalEstrellas = window.storageEco.totalEstrellasGeneral(perfil);
        const totalNiveles = window.storageEco.totalNivelesSuperados(perfil);
        const calif = window.storageEco.obtenerCalificacionEstudiante(perfil);

        let partidasHtml = '';
        const partidasRecientes = (perfil.partidas || []).slice(-8).reverse();
        if (partidasRecientes.length === 0) {
            partidasHtml = '<p style="color: #64748B; font-size: 13px; text-align: center; padding: 12px;">No hay partidas registradas aún.</p>';
        } else {
            partidasHtml = `
                <table style="width: 100%; font-size: 12px; border-collapse: collapse; margin-top: 8px;">
                    <thead>
                        <tr style="background: #F1F5F9; text-align: left;">
                            <th style="padding: 6px 8px;">Fecha</th>
                            <th style="padding: 6px 8px;">Misión</th>
                            <th style="padding: 6px 8px;">Nivel</th>
                            <th style="padding: 6px 8px;">Puntaje</th>
                            <th style="padding: 6px 8px;">Nota (1-20)</th>
                            <th style="padding: 6px 8px;">Aciertos</th>
                            <th style="padding: 6px 8px;">Pregunta Ica</th>
                            <th style="padding: 6px 8px;">★</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${partidasRecientes.map(p => {
                            const notaItem = p.nota || 18;
                            const escItem = (typeof obtenerEscalaMINEDU === 'function')
                                ? obtenerEscalaMINEDU(notaItem)
                                : { literal: 'A', bg: '#DBEAFE', color: '#1D4ED8', borde: '#93C5FD' };
                            return `
                                <tr style="border-bottom: 1px solid #E2E8F0;">
                                    <td style="padding: 6px 8px;">${p.fecha.slice(5, 16)}</td>
                                    <td style="padding: 6px 8px; font-weight: 700;">${p.minijuego || p.juegoId}</td>
                                    <td style="padding: 6px 8px;">Nivel ${p.nivel}</td>
                                    <td style="padding: 6px 8px; font-weight: 800;">${p.puntaje}</td>
                                    <td style="padding: 6px 8px;">
                                        <span class="badge-mini-escala" style="background: ${escItem.bg}; color: ${escItem.color}; border: 1px solid ${escItem.borde}; padding: 2px 6px; border-radius: 6px; font-weight: 800;">
                                            ${notaItem}/20 (${escItem.literal})
                                        </span>
                                    </td>
                                    <td style="padding: 6px 8px;">${p.aciertos}/${p.aciertos + (p.errores || 0)}</td>
                                    <td style="padding: 6px 8px; color: ${p.preguntaCorrecta ? '#15803D' : '#DC2626'}; font-weight: 800;">
                                        ${p.preguntaCorrecta ? 'Correcta (+30)' : 'Incorrecta'}
                                    </td>
                                    <td style="padding: 6px 8px; color: #EAB308; font-weight: 800;">★${p.estrellas}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            `;
        }

        if (this.cuerpoFichaAlumno) {
            this.cuerpoFichaAlumno.innerHTML = `
                <div style="display: flex; gap: 16px; align-items: center; background: #F8FAFC; border: 2px solid #E2E8F0; border-radius: 14px; padding: 14px 18px; margin-bottom: 16px;">
                    <div style="background: var(--color-morado); color: white; width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 900;">
                        ${perfil.nombre.charAt(0)}
                    </div>
                    <div>
                        <h4 style="font-size: 17px; font-weight: 900; color: #1E1B2E; margin: 0;">${perfil.nombre}</h4>
                        <div style="font-size: 13px; color: #64748B; font-weight: 700; margin-top: 2px;">
                            DNI/Código: <strong>${perfil.dni || perfil.codigo || 'S/DNI'}</strong> • ${perfil.grado}° "${perfil.seccion}" Primaria
                        </div>
                    </div>
                    <div style="margin-left: auto; text-align: right;">
                        <div style="font-size: 18px; font-weight: 900; color: #B45309;">★ ${totalEstrellas} / 120</div>
                        <div style="font-size: 12px; color: #15803D; font-weight: 800;">${totalNiveles} de 40 niveles superados</div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 16px;">
                    <div style="background: #EFF6FF; border: 1.5px solid #BFDBFE; border-radius: 10px; padding: 10px; text-align: center;">
                        <div style="font-size: 11px; font-weight: 800; color: #1E40AF;">LIMPIEZA</div>
                        <div style="font-size: 14px; font-weight: 900; color: #1E3A8A; margin-top: 2px;">${impacto.LIMPIEZA} kg</div>
                    </div>
                    <div style="background: #F0FDF4; border: 1.5px solid #BBF7D0; border-radius: 10px; padding: 10px; text-align: center;">
                        <div style="font-size: 11px; font-weight: 800; color: #166534;">AGUA</div>
                        <div style="font-size: 14px; font-weight: 900; color: #14532D; margin-top: 2px;">${impacto.AGUA} L</div>
                    </div>
                    <div style="background: #FEF3C7; border: 1.5px solid #FDE68A; border-radius: 10px; padding: 10px; text-align: center;">
                        <div style="font-size: 11px; font-weight: 800; color: #92400E;">ENERGÍA</div>
                        <div style="font-size: 14px; font-weight: 900; color: #78350F; margin-top: 2px;">${impacto.ENERGIA} kWh</div>
                    </div>
                    <div style="background: #FAF5FF; border: 1.5px solid #E9D5FF; border-radius: 10px; padding: 10px; text-align: center;">
                        <div style="font-size: 11px; font-weight: 800; color: #6B21A8;">BIOHUERTO</div>
                        <div style="font-size: 14px; font-weight: 900; color: #581C87; margin-top: 2px;">${impacto.VERDE} m²</div>
                    </div>
                </div>

                <!-- SECCIÓN DE CALIFICACIÓN DOCENTE (1 AL 20) -->
                <div class="caja-calificacion-docente" style="background: #F8FAFC; border: 2.5px solid #CBD5E1; border-radius: 14px; padding: 16px; margin-bottom: 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <span style="font-size: 14px; font-weight: 900; color: #1E293B;">
                            Calificación del Docente (Escala Escolar 1 al 20)
                        </span>
                        <span id="badgeFichaEscala" style="background: ${calif.escala.bg}; color: ${calif.escala.color}; border: 1.5px solid ${calif.escala.borde}; padding: 4px 10px; border-radius: 8px; font-size: 12px; font-weight: 800;">
                            ${calif.escala.literal} • ${calif.escala.descripcion}
                        </span>
                    </div>

                    <div style="display: flex; gap: 14px; align-items: center; margin-bottom: 12px; flex-wrap: wrap;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <label for="inputNotaDocente" style="font-size: 13px; font-weight: 800; color: #334155;">Nota (1 a 20):</label>
                            <input type="number" id="inputNotaDocente" min="1" max="20" step="1" value="${calif.nota}" style="width: 72px; padding: 6px 10px; font-size: 18px; font-weight: 900; border: 2.5px solid var(--color-trazo); border-radius: 10px; text-align: center; color: var(--color-trazo);">
                            <span style="font-weight: 900; font-size: 14px; color: #64748B;">/ 20</span>
                        </div>
                        <div style="font-size: 11.5px; color: #64748B; font-weight: 700;">
                            MINEDU: <b>18-20 AD</b> | <b>14-17 A</b> | <b>11-13 B</b> | <b>01-10 C</b>
                        </div>
                    </div>

                    <div style="margin-bottom: 12px;">
                        <label for="inputObsDocente" style="font-size: 12px; font-weight: 800; color: #334155; display: block; margin-bottom: 4px;">Observación / Retroalimentación Pedagógica:</label>
                        <input type="text" id="inputObsDocente" placeholder="Ej: Demuestra alto dominio en el cuidado del agua en Ica y clasificación de residuos." value="${perfil.observacionDocente || ''}" style="width: 100%; padding: 8px 12px; font-size: 13px; border: 2px solid #CBD5E1; border-radius: 10px; box-sizing: border-box; font-family: inherit;">
                    </div>

                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span id="msgCalificacionGuardada" style="font-size: 12px; font-weight: 800; color: #16A34A; display: none;">¡Calificación guardada correctamente!</span>
                        <button type="button" id="btnGuardarNotaDocente" class="btn-principal" style="padding: 8px 20px; font-size: 13px; background: #16A34A; color: white; margin-left: auto;">
                            Guardar Calificación
                        </button>
                    </div>
                </div>

                <h5 style="font-size: 14px; font-weight: 800; color: #334155; margin-bottom: 6px;">Historial Reciente de Misiones Evaluadas</h5>
                ${partidasHtml}
            `;

            // Vincular cambio en vivo de nota para actualizar escala MINEDU
            const inputNota = this.cuerpoFichaAlumno.querySelector('#inputNotaDocente');
            const badgeEscala = this.cuerpoFichaAlumno.querySelector('#badgeFichaEscala');
            const inputObs = this.cuerpoFichaAlumno.querySelector('#inputObsDocente');
            const btnGuardar = this.cuerpoFichaAlumno.querySelector('#btnGuardarNotaDocente');
            const msgGuardada = this.cuerpoFichaAlumno.querySelector('#msgCalificacionGuardada');

            if (inputNota && badgeEscala) {
                const actualizarBadgeEscala = () => {
                    const n = Math.max(1, Math.min(20, Math.round(Number(inputNota.value) || 1)));
                    const esc = (typeof obtenerEscalaMINEDU === 'function')
                        ? obtenerEscalaMINEDU(n)
                        : { literal: 'A', descripcion: 'Logro Esperado', bg: '#DBEAFE', color: '#1D4ED8', borde: '#93C5FD' };
                    badgeEscala.textContent = `${esc.literal} • ${esc.descripcion}`;
                    badgeEscala.style.background = esc.bg;
                    badgeEscala.style.color = esc.color;
                    badgeEscala.style.borderColor = esc.borde;
                };
                inputNota.addEventListener('input', actualizarBadgeEscala);
                inputNota.addEventListener('change', actualizarBadgeEscala);
            }

            if (btnGuardar) {
                btnGuardar.addEventListener('click', () => {
                    const notaFinal = Math.max(1, Math.min(20, Math.round(Number(inputNota.value) || 1)));
                    const obsFinal = inputObs ? inputObs.value : '';
                    window.storageEco.guardarCalificacionDocente(clave, notaFinal, obsFinal);
                    window.audioEco.moneda();

                    if (msgGuardada) {
                        msgGuardada.style.display = 'inline';
                        setTimeout(() => { msgGuardada.style.display = 'none'; }, 2600);
                    }

                    // Actualizar panel docente en segundo plano
                    this.renderizarPanelDocente();
                });
            }
        }

        if (this.modalFichaAlumno) this.modalFichaAlumno.classList.add('activo');
    }

    construirGridNiveles(juegoId) {
        const contenedor = document.getElementById('contenedorBotonesNiveles');
        contenedor.innerHTML = '';

        const info = JUEGOS[juegoId];
        const perfil = window.storageEco.obtenerPerfil();

        for (let num = 1; num <= 10; num++) {
            const defNivel = info.niveles[num - 1];
            const desbloqueado = window.storageEco.estaDesbloqueado(juegoId, num, perfil);
            const estrellas = window.storageEco.obtenerEstrellasNivel(juegoId, num, perfil);

            const btn = document.createElement('div');
            btn.className = `boton-nivel ${desbloqueado ? '' : 'bloqueado'}`;

            let estrellasHtml = '';
            if (desbloqueado) {
                estrellasHtml = `
                    <div class="nivel-estrellas-contenedor">
                        ${AppEcoRescate.svgEstrella(estrellas >= 1)}
                        ${AppEcoRescate.svgEstrella(estrellas >= 2)}
                        ${AppEcoRescate.svgEstrella(estrellas >= 3)}
                    </div>
                `;
            } else {
                estrellasHtml = AppEcoRescate.svgCandado();
            }

            btn.innerHTML = `
                <div class="nivel-num">${num}</div>
                <div class="nivel-titulo">${defNivel.titulo}</div>
                ${estrellasHtml}
                ${!desbloqueado ? `<span class="candado-bloqueo">${AppEcoRescate.svgCandado()}</span>` : ''}
            `;

            if (desbloqueado) {
                btn.addEventListener('click', () => {
                    window.audioEco.clic();
                    this.lanzarNivel(juegoId, num);
                });
            }

            contenedor.appendChild(btn);
        }
    }

    lanzarNivel(juegoId, nivelNumero) {
        this.cerrarModal(this.modalRegistro);
        this.vistaMenu.style.display = 'none';
        this.vistaMapa.style.display = 'none';
        this.vistaJuego.style.display = 'flex';
        if (this.vistaDocente) this.vistaDocente.style.display = 'none';

        // Detener instancia previa
        if (this.instanciaJuego) {
            this.instanciaJuego.detener();
        }

        // Fábrica polimórfica de minijuegos
        let ClaseJuego = MinijuegoBase;
        if (juegoId === 'LIMPIEZA' && window.LimpiezaMonstruosa) {
            ClaseJuego = window.LimpiezaMonstruosa;
        } else if (juegoId === 'AGUA' && window.GuardianAgua) {
            ClaseJuego = window.GuardianAgua;
        } else if (juegoId === 'ENERGIA' && window.ApagaAhorra) {
            ClaseJuego = window.ApagaAhorra;
        } else if (juegoId === 'VERDE' && window.SembradoresVerde) {
            ClaseJuego = window.SembradoresVerde;
        }

        this.instanciaJuego = new ClaseJuego(this.canvas, juegoId);
        this.instanciaJuego.cargarNivel(nivelNumero);
        this.instanciaJuego.arrancar();
    }

    // Modales de la Suite (Etapa 6)
    abrirTienda() {
        const perfil = window.storageEco.obtenerPerfil();
        document.getElementById('tiendaMonedas').textContent = perfil.monedas || 0;

        // Vista previa del avatar
        const canvasAvatar = document.getElementById('canvasAvatarTienda');
        this.dibujarAvatarPreview(canvasAvatar, perfil);

        this.renderizarTiendaAccesorios(perfil);
        this.renderizarTiendaPolos(perfil);

        this.modalTienda.classList.add('activo');
    }

    renderizarTiendaAccesorios(perfil) {
        const contenedor = document.getElementById('tiendaContenedorAccesorios');
        if (!contenedor) return;
        contenedor.innerHTML = '';

        const canvasAvatar = document.getElementById('canvasAvatarTienda');
        const lblAvatar = document.getElementById('lblAvatarTienda');
        const catalogo = window.CATALOGO_ACCESORIOS || [];

        catalogo.forEach(acc => {
            const tiene = (perfil.comprados || []).includes(acc.id) || acc.precio === 0;
            const equipado = perfil.accesorio === acc.id;

            const item = document.createElement('div');
            item.className = `tarjeta-tienda-item ${equipado ? 'equipada' : ''}`;
            item.setAttribute('data-id', acc.id);

            let btnTxt = equipado ? 'En uso' : (tiene ? 'Equipar' : `${acc.precio} Monedas`);
            let btnColor = equipado ? '#E2E8F0' : (tiene ? '#6EE7B7' : '#FFD84D');

            let badgeHtml = '';
            if (equipado) {
                badgeHtml = '<span class="badge-item-tienda en-uso">En uso</span>';
            } else if (tiene) {
                badgeHtml = '<span class="badge-item-tienda adquirido">Comprado</span>';
            }

            item.innerHTML = `
                ${badgeHtml}
                <div class="caja-canvas-preview">
                    <canvas class="canvas-item-preview" width="76" height="76" style="display: block; border-radius: 10px;"></canvas>
                </div>
                <div style="font-weight: 900; font-size: 12.5px; color: var(--color-morado); min-height: 32px; display: flex; align-items: center; justify-content: center; line-height: 1.25;">
                    ${acc.nombre}
                </div>
                <button class="btn-principal btn-tienda-accion" style="padding: 7px 10px; font-size: 11.5px; background: ${btnColor}; width: 100%;">
                    ${btnTxt}
                </button>
            `;

            // Dibujar la vista previa del avatar usando este accesorio
            const miniCanvas = item.querySelector('.canvas-item-preview');
            this.dibujarAvatarPreview(miniCanvas, perfil, acc.id, perfil.polo);

            // Al hacer hover o clic en la tarjeta, previsualizar en el avatar grande superior
            item.addEventListener('mouseenter', () => {
                this.dibujarAvatarPreview(canvasAvatar, perfil, acc.id, perfil.polo);
                if (lblAvatar) {
                    lblAvatar.textContent = equipado ? 'TU ECO-HÉROE (En uso)' : `TU ECO-HÉROE: ${acc.nombre}`;
                    lblAvatar.style.color = equipado ? '#10B981' : '#7C4DFF';
                }
            });

            item.addEventListener('mouseleave', () => {
                this.dibujarAvatarPreview(canvasAvatar, perfil, perfil.accesorio, perfil.polo);
                if (lblAvatar) {
                    lblAvatar.textContent = 'TU ECO-HÉROE';
                    lblAvatar.style.color = '#64748B';
                }
            });

            item.addEventListener('click', (e) => {
                if (e.target.closest('button')) return;
                this.dibujarAvatarPreview(canvasAvatar, perfil, acc.id, perfil.polo);
                if (lblAvatar) {
                    lblAvatar.textContent = equipado ? 'TU ECO-HÉROE (En uso)' : `TU ECO-HÉROE: ${acc.nombre}`;
                    lblAvatar.style.color = equipado ? '#10B981' : '#7C4DFF';
                }
                contenedor.querySelectorAll('.tarjeta-tienda-item').forEach(el => el.classList.remove('activa-preview'));
                item.classList.add('activa-preview');
            });

            const btn = item.querySelector('button');
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (equipado) return;
                if (tiene) {
                    perfil.accesorio = acc.id;
                    window.storageEco.guardarPerfiles();
                    window.audioEco.clic();
                    this.abrirTienda();
                    this.actualizarHeader();
                } else if (perfil.monedas >= acc.precio) {
                    perfil.monedas -= acc.precio;
                    if (!perfil.comprados) perfil.comprados = [];
                    perfil.comprados.push(acc.id);
                    perfil.accesorio = acc.id;
                    window.storageEco.guardarPerfiles();
                    window.audioEco.moneda();
                    this.abrirTienda();
                    this.actualizarHeader();
                } else {
                    window.audioEco.error();
                    const faltan = acc.precio - (perfil.monedas || 0);
                    alert(`EcoMonedas insuficientes. Necesitas ${acc.precio} Monedas (te faltan ${faltan}). ¡Supera más niveles y desafíos del saber en Ica para ganarlas!`);
                }
            });

            contenedor.appendChild(item);
        });
    }

    renderizarTiendaPolos(perfil) {
        const contenedor = document.getElementById('tiendaContenedorPolos');
        if (!contenedor) return;
        contenedor.innerHTML = '';

        const canvasAvatar = document.getElementById('canvasAvatarTienda');
        const lblAvatar = document.getElementById('lblAvatarTienda');
        const polos = window.COLORES_POLO || [];
        const polosComprados = perfil.polosComprados || [0];
        const poloActual = perfil.polo || 0;

        polos.forEach(col => {
            const tiene = polosComprados.includes(col.id) || col.precio === 0;
            const equipado = poloActual === col.id;

            const item = document.createElement('div');
            item.className = `tarjeta-tienda-item ${equipado ? 'equipada' : ''}`;
            item.setAttribute('data-id', col.id);

            let btnTxt = equipado ? 'En uso' : (tiene ? 'Equipar' : `${col.precio} Monedas`);
            let btnColor = equipado ? '#E2E8F0' : (tiene ? '#6EE7B7' : '#FFD84D');

            let badgeHtml = '';
            if (equipado) {
                badgeHtml = '<span class="badge-item-tienda en-uso">En uso</span>';
            } else if (tiene) {
                badgeHtml = '<span class="badge-item-tienda adquirido">Comprado</span>';
            }

            item.innerHTML = `
                ${badgeHtml}
                <div class="caja-canvas-preview">
                    <canvas class="canvas-item-preview" width="76" height="76" style="display: block; border-radius: 10px;"></canvas>
                </div>
                <div style="display: flex; align-items: center; gap: 6px; justify-content: center; min-height: 32px;">
                    <span style="width: 14px; height: 14px; border-radius: 50%; background: ${col.color}; border: 1.8px solid var(--color-trazo); flex-shrink: 0; box-shadow: 0 1px 3px rgba(0,0,0,0.15);"></span>
                    <span style="font-weight: 900; font-size: 11.5px; color: var(--color-morado); line-height: 1.25;">${col.nombre}</span>
                </div>
                <button class="btn-principal btn-tienda-accion" style="padding: 7px 10px; font-size: 11.5px; background: ${btnColor}; width: 100%;">
                    ${btnTxt}
                </button>
            `;

            // Dibujar la vista previa del avatar usando este polo y el accesorio actual
            const miniCanvas = item.querySelector('.canvas-item-preview');
            this.dibujarAvatarPreview(miniCanvas, perfil, perfil.accesorio, col.id);

            item.addEventListener('mouseenter', () => {
                this.dibujarAvatarPreview(canvasAvatar, perfil, perfil.accesorio, col.id);
                if (lblAvatar) {
                    lblAvatar.textContent = equipado ? 'TU ECO-HÉROE (En uso)' : `TU ECO-HÉROE: ${col.nombre}`;
                    lblAvatar.style.color = equipado ? '#10B981' : '#7C4DFF';
                }
            });

            item.addEventListener('mouseleave', () => {
                this.dibujarAvatarPreview(canvasAvatar, perfil, perfil.accesorio, perfil.polo);
                if (lblAvatar) {
                    lblAvatar.textContent = 'TU ECO-HÉROE';
                    lblAvatar.style.color = '#64748B';
                }
            });

            item.addEventListener('click', (e) => {
                if (e.target.closest('button')) return;
                this.dibujarAvatarPreview(canvasAvatar, perfil, perfil.accesorio, col.id);
                if (lblAvatar) {
                    lblAvatar.textContent = equipado ? 'TU ECO-HÉROE (En uso)' : `TU ECO-HÉROE: ${col.nombre}`;
                    lblAvatar.style.color = equipado ? '#10B981' : '#7C4DFF';
                }
                contenedor.querySelectorAll('.tarjeta-tienda-item').forEach(el => el.classList.remove('activa-preview'));
                item.classList.add('activa-preview');
            });

            const btn = item.querySelector('button');
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (equipado) return;
                if (tiene) {
                    perfil.polo = col.id;
                    window.storageEco.guardarPerfiles();
                    window.audioEco.clic();
                    this.abrirTienda();
                    this.actualizarHeader();
                } else if (perfil.monedas >= col.precio) {
                    perfil.monedas -= col.precio;
                    if (!perfil.polosComprados) perfil.polosComprados = [0];
                    perfil.polosComprados.push(col.id);
                    perfil.polo = col.id;
                    window.storageEco.guardarPerfiles();
                    window.audioEco.moneda();
                    this.abrirTienda();
                    this.actualizarHeader();
                } else {
                    window.audioEco.error();
                    const faltan = col.precio - (perfil.monedas || 0);
                    alert(`EcoMonedas insuficientes. Necesitas ${col.precio} Monedas (te faltan ${faltan}).`);
                }
            });

            contenedor.appendChild(item);
        });
    }

    dibujarAvatarPreview(canvas, perfil, accesorioForzado = null, poloForzado = null) {
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0, 0, w, h);
        
        ctx.save();
        const escala = Math.min(w / 120, h / 120);
        ctx.scale(escala, escala);
        
        const cx = 60;

        const acc = accesorioForzado !== null ? accesorioForzado : (perfil ? (perfil.accesorio || 'NINGUNO') : 'NINGUNO');
        const poloId = poloForzado !== null ? poloForzado : (perfil ? (perfil.polo || 0) : 0);

        // Sombra
        ctx.fillStyle = 'rgba(42, 35, 64, 0.12)';
        ctx.beginPath();
        ctx.ellipse(cx, 108, 32, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Capa detrás
        if (acc === 'CAPA') {
            ctx.fillStyle = '#10B981';
            ctx.strokeStyle = '#2A2340';
            ctx.lineWidth = 2.8;
            ctx.beginPath();
            ctx.moveTo(cx - 18, 68);
            ctx.quadraticCurveTo(cx - 38, 88, cx - 34, 112);
            ctx.quadraticCurveTo(cx, 118, cx + 34, 112);
            ctx.quadraticCurveTo(cx + 38, 88, cx + 18, 68);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Pliegues
            ctx.strokeStyle = '#059669';
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.moveTo(cx - 18, 76);
            ctx.quadraticCurveTo(cx - 24, 94, cx - 20, 111);
            ctx.moveTo(cx + 18, 76);
            ctx.quadraticCurveTo(cx + 24, 94, cx + 20, 111);
            ctx.stroke();
        }

        // Color del polo
        const polos = window.COLORES_POLO || [];
        const poloObj = polos.find(c => c.id === poloId) || { color: '#FFFFFF' };
        const colorPolo = poloObj.color;

        // Torso / Polo
        ctx.fillStyle = colorPolo;
        ctx.strokeStyle = '#2A2340';
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.moveTo(cx - 22, 70);
        ctx.quadraticCurveTo(cx - 26, 86, cx - 20, 104);
        ctx.lineTo(cx + 20, 104);
        ctx.quadraticCurveTo(cx + 26, 86, cx + 22, 70);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Sombra suave en el torso
        ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.beginPath();
        ctx.moveTo(cx - 22, 70);
        ctx.quadraticCurveTo(cx - 26, 86, cx - 20, 104);
        ctx.lineTo(cx - 10, 104);
        ctx.lineTo(cx - 14, 70);
        ctx.closePath();
        ctx.fill();

        // Mangas
        ctx.fillStyle = colorPolo;
        ctx.strokeStyle = '#2A2340';
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.ellipse(cx - 24, 78, 7, 10, -0.4, 0, Math.PI * 2);
        ctx.ellipse(cx + 24, 78, 7, 10, 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Cuello
        ctx.fillStyle = '#FFE2BF';
        ctx.strokeStyle = '#2A2340';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.rect(cx - 6, 56, 12, 12);
        ctx.fill();
        ctx.stroke();

        // Broche frontal de la capa
        if (acc === 'CAPA') {
            ctx.fillStyle = '#F59E0B';
            ctx.strokeStyle = '#2A2340';
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.arc(cx, 68, 5.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#10B981';
            ctx.beginPath();
            ctx.arc(cx, 68, 2.6, 0, Math.PI * 2);
            ctx.fill();
        }

        // Cabeza
        ctx.fillStyle = '#FFE2BF';
        ctx.strokeStyle = '#2A2340';
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.arc(cx, 46, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Orejas
        ctx.beginPath();
        ctx.arc(cx - 20, 48, 4.5, 0, Math.PI * 2);
        ctx.arc(cx + 20, 48, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Cabello base
        ctx.fillStyle = '#4A2810';
        ctx.strokeStyle = '#2A2340';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(cx, 42, 21, Math.PI * 0.85, Math.PI * 2.15);
        ctx.quadraticCurveTo(cx + 8, 34, cx, 36);
        ctx.quadraticCurveTo(cx - 8, 34, cx - 20, 42);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Mechón frontal
        ctx.beginPath();
        ctx.moveTo(cx - 6, 36);
        ctx.quadraticCurveTo(cx - 1, 42, cx + 5, 38);
        ctx.quadraticCurveTo(cx + 2, 34, cx - 6, 36);
        ctx.fill();

        // Ojos
        ctx.fillStyle = '#2A2340';
        ctx.beginPath();
        ctx.arc(cx - 7, 46, 3.2, 0, Math.PI * 2);
        ctx.arc(cx + 7, 46, 3.2, 0, Math.PI * 2);
        ctx.fill();

        // Brillo ojos
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(cx - 6, 45, 1.2, 0, Math.PI * 2);
        ctx.arc(cx + 8, 45, 1.2, 0, Math.PI * 2);
        ctx.arc(cx - 8, 47, 0.6, 0, Math.PI * 2);
        ctx.arc(cx + 6, 47, 0.6, 0, Math.PI * 2);
        ctx.fill();

        // Mejillas sonrosadas
        ctx.fillStyle = 'rgba(255, 107, 107, 0.45)';
        ctx.beginPath();
        ctx.arc(cx - 12, 51, 3.5, 0, Math.PI * 2);
        ctx.arc(cx + 12, 51, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Sonrisa
        ctx.strokeStyle = '#2A2340';
        ctx.lineWidth = 2.2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(cx, 51, 5, 0.2, Math.PI - 0.2);
        ctx.stroke();

        // Accesorios
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#2A2340';

        if (acc === 'GORRA') {
            ctx.fillStyle = '#EB5757';
            ctx.beginPath();
            ctx.arc(cx, 34, 16.5, Math.PI, 0);
            ctx.fill();
            ctx.stroke();
            ctx.beginPath();
            ctx.ellipse(cx + 12, 35, 14, 5.5, 0.15, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#FFE066';
            ctx.beginPath();
            ctx.arc(cx, 25, 2.8, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            // Emblema deportivo
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(cx, 31, 2.5, 0, Math.PI * 2);
            ctx.fill();
        } else if (acc === 'VISERA') {
            ctx.fillStyle = '#2563EB';
            ctx.beginPath();
            if (ctx.roundRect) ctx.roundRect(cx - 17, 34, 34, 6.5, 2);
            else ctx.rect(cx - 17, 34, 34, 6.5);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#3B82F6';
            ctx.beginPath();
            ctx.ellipse(cx + 11, 37, 16, 5.5, 0.14, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            // Franja deportiva
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.ellipse(cx + 8, 36.5, 8, 1.5, 0.14, 0, Math.PI * 2);
            ctx.fill();
        } else if (acc === 'LENTES') {
            ctx.fillStyle = '#0F172A';
            ctx.strokeStyle = '#F59E0B';
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            if (ctx.roundRect) {
                ctx.roundRect(cx - 16, 41, 13, 10, 3);
                ctx.roundRect(cx + 3, 41, 13, 10, 3);
            } else {
                ctx.rect(cx - 16, 41, 13, 10);
                ctx.rect(cx + 3, 41, 13, 10);
            }
            ctx.fill();
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(cx - 3, 45);
            ctx.lineTo(cx + 3, 45);
            ctx.stroke();
            // Destello reflejo
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.moveTo(cx - 13, 43);
            ctx.lineTo(cx - 9, 48);
            ctx.moveTo(cx + 6, 43);
            ctx.lineTo(cx + 10, 48);
            ctx.stroke();
        } else if (acc === 'AUDIFONOS') {
            ctx.strokeStyle = '#334155';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(cx, 42, 23, Math.PI, 0);
            ctx.stroke();
            // Almohadilla superior
            ctx.strokeStyle = '#7C3AED';
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.arc(cx, 42, 23, Math.PI * 1.25, Math.PI * 1.75);
            ctx.stroke();
            // Almohadillas laterales
            ctx.fillStyle = '#EF4444';
            ctx.strokeStyle = '#2A2340';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.ellipse(cx - 21, 46, 5.5, 10, 0, 0, Math.PI * 2);
            ctx.ellipse(cx + 21, 46, 5.5, 10, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            // Detalle interior
            ctx.fillStyle = '#7C3AED';
            ctx.beginPath();
            ctx.ellipse(cx - 21, 46, 3, 6, 0, 0, Math.PI * 2);
            ctx.ellipse(cx + 21, 46, 3, 6, 0, 0, Math.PI * 2);
            ctx.fill();
        } else if (acc === 'SOMBRERO') {
            ctx.fillStyle = '#FDE68A';
            ctx.strokeStyle = '#2A2340';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            if (ctx.roundRect) ctx.roundRect(cx - 12, 18, 24, 15, [6, 6, 0, 0]);
            else ctx.rect(cx - 12, 18, 24, 15);
            ctx.fill();
            ctx.stroke();
            // Cinta morada del Señor de Luren
            ctx.fillStyle = '#7C3AED';
            ctx.beginPath();
            ctx.rect(cx - 12, 28, 24, 5);
            ctx.fill();
            ctx.stroke();
            // Hebilla dorada
            ctx.fillStyle = '#F59E0B';
            ctx.fillRect(cx - 3, 28, 6, 5);
            // Ala ancha protectora solar
            ctx.fillStyle = '#FBBF24';
            ctx.beginPath();
            ctx.ellipse(cx, 33, 29, 7.5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        } else if (acc === 'CORONA') {
            ctx.fillStyle = '#FBBF24';
            ctx.strokeStyle = '#2A2340';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(cx - 17, 33);
            ctx.lineTo(cx - 15, 18);
            ctx.lineTo(cx - 8, 25);
            ctx.lineTo(cx, 13);
            ctx.lineTo(cx + 8, 25);
            ctx.lineTo(cx + 15, 18);
            ctx.lineTo(cx + 17, 33);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            // Joya central esmeralda
            ctx.fillStyle = '#10B981';
            ctx.beginPath();
            ctx.arc(cx, 24, 2.8, 0, Math.PI * 2);
            ctx.fill();
            // Joyas laterales rubí
            ctx.fillStyle = '#EF4444';
            ctx.beginPath();
            ctx.arc(cx - 10, 26, 2, 0, Math.PI * 2);
            ctx.arc(cx + 10, 26, 2, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    abrirMedallas() {
        const perfil = window.storageEco.obtenerPerfil();
        const contenedor = document.getElementById('medallasContenedorGrid');
        if (!contenedor) return;
        contenedor.innerHTML = '';

        const medallasCatalogo = window.CATALOGO_MEDALLAS || [];
        const historial = perfil.partidas || [];
        const totalSuperados = window.storageEco.totalNivelesSuperados(perfil);
        const totalEstrellas = window.storageEco.totalEstrellasGeneral(perfil);

        medallasCatalogo.forEach((med, idx) => {
            const desbloqueada = (perfil.medallas || []).includes(med.id);

            // Calcular avance
            let progresoTexto = '';
            if (med.id === 'PRIMERA_MISION') progresoTexto = `${Math.min(1, totalSuperados)} / 1 nivel`;
            else if (med.id === 'EXPLORADOR') progresoTexto = `${new Set(historial.map(s => s.juegoId)).size} / 4 minijuegos`;
            else if (med.id === 'RECICLADOR') progresoTexto = `${window.storageEco.nivelesSuperadosJuego('LIMPIEZA', perfil)} / 10 niveles`;
            else if (med.id === 'GUARDIAN') progresoTexto = `${window.storageEco.nivelesSuperadosJuego('AGUA', perfil)} / 10 niveles`;
            else if (med.id === 'CAZAVATIOS') progresoTexto = `${window.storageEco.nivelesSuperadosJuego('ENERGIA', perfil)} / 10 niveles`;
            else if (med.id === 'MANO_VERDE') progresoTexto = `${window.storageEco.nivelesSuperadosJuego('VERDE', perfil)} / 10 niveles`;
            else if (med.id === 'CIEN_LITROS') {
                const litros = historial.filter(s => s.juegoId === 'AGUA').reduce((a, b) => a + (b.impacto || 0), 0);
                progresoTexto = `${Math.round(litros)} / 100 Litros`;
            } else if (med.id === 'CONSTANTE') progresoTexto = `${historial.length} / 20 partidas`;
            else if (med.id === 'COLECCIONISTA') progresoTexto = `${totalEstrellas} / 60 estrellas`;
            else if (med.id === 'ECO_HEROE') progresoTexto = `${totalSuperados} / 40 niveles`;
            else if (med.id === 'SABIO') {
                const bien = historial.filter(s => s.preguntaCorrecta === 'SI').length;
                progresoTexto = `${bien} / 5 desafíos`;
            }

            const card = document.createElement('div');
            card.style.cssText = `
                background: ${desbloqueada ? '#FFFFFF' : '#F8FAFC'};
                border: 2.5px solid ${desbloqueada ? med.color : '#CBD5E1'};
                border-radius: 16px; padding: 14px; text-align: center;
                box-shadow: ${desbloqueada ? `0 5px 0 ${med.color}` : 'none'};
                opacity: ${desbloqueada ? '1' : '0.75'};
                display: flex; flex-direction: column; justify-content: space-between;
            `;

            card.innerHTML = `
                <div>
                    <div style="font-size: 11px; font-weight: 900; color: #64748B; margin-bottom: 4px;">MEDALLA ${idx + 1} DE 14</div>
                    <div style="font-weight: 900; font-size: 14px; color: ${desbloqueada ? med.color : '#475569'}; margin-bottom: 6px;">${med.nombre}</div>
                    <div style="font-size: 12px; color: #475569; line-height: 1.35;">${med.desc}</div>
                </div>
                <div style="margin-top: 10px;">
                    ${progresoTexto ? `<div style="font-size: 11px; font-weight: 700; color: #64748B; margin-bottom: 4px;">Avance: ${progresoTexto}</div>` : ''}
                    <div style="font-size: 11px; font-weight: 900; padding: 4px 8px; border-radius: 8px; display: inline-block; background: ${desbloqueada ? '#DCFCE7' : '#F1F5F9'}; color: ${desbloqueada ? '#15803D' : '#94A3B8'};">
                        ${desbloqueada ? 'DESBLOQUEADA' : 'BLOQUEADA'}
                    </div>
                </div>
            `;
            contenedor.appendChild(card);
        });

        this.modalMedallas.classList.add('activo');
    }

    abrirRanking() {
        this.renderizarTablaRanking();
        this.modalRanking.classList.add('activo');
    }

    renderizarTablaRanking() {
        const contenedor = document.getElementById('rankingContenedorTabla');
        if (!contenedor) return;

        const fGrado = document.getElementById('filtroRankingGrado');
        const fSecc = document.getElementById('filtroRankingSeccion');
        const grado = fGrado ? fGrado.value : null;
        const seccion = fSecc ? fSecc.value : null;

        const ranking = window.storageEco.obtenerRanking(grado, seccion);

        if (ranking.length === 0) {
            contenedor.innerHTML = '<p style="text-align: center; color: #64748B; padding: 24px;">No hay registros para este grado y sección.</p>';
            return;
        }

        let html = `
            <table style="width: 100%; border-collapse: collapse; font-size: 13.5px;">
                <thead>
                    <tr style="background: var(--color-morado); color: #FFFFFF; text-align: left;">
                        <th style="padding: 10px 12px; border-radius: 10px 0 0 0;">Puesto</th>
                        <th style="padding: 10px 12px;">Estudiante</th>
                        <th style="padding: 10px 12px;">Aula</th>
                        <th style="padding: 10px 12px;">Estrellas</th>
                        <th style="padding: 10px 12px; border-radius: 0 10px 0 0;">Puntaje</th>
                    </tr>
                </thead>
                <tbody>
        `;

        ranking.forEach((r, idx) => {
            let badgeClass = 'puesto-otro';
            if (idx === 0) badgeClass = 'puesto-1';
            else if (idx === 1) badgeClass = 'puesto-2';
            else if (idx === 2) badgeClass = 'puesto-3';

            const esTuFila = r.esUsuarioActual;
            const bgRow = esTuFila ? '#FEF9C3' : (idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC');

            html += `
                <tr style="border-bottom: 1.5px solid #E2E8F0; background: ${bgRow};">
                    <td style="padding: 10px 12px;"><span class="puesto-badge ${badgeClass}">${idx + 1}°</span></td>
                    <td style="padding: 10px 12px; font-weight: 800; color: var(--color-trazo);">
                        ${r.nombre} ${esTuFila ? '<span style="background: #EAB308; color: #FFFFFF; font-size: 10px; font-weight: 900; padding: 2px 6px; border-radius: 6px; margin-left: 6px;">(TÚ)</span>' : ''}
                    </td>
                    <td style="padding: 10px 12px; font-weight: 700; color: #64748B;">${r.grado}° "${r.seccion}"</td>
                    <td style="padding: 10px 12px; font-weight: 800; color: #D97706;">★ ${r.estrellas}</td>
                    <td style="padding: 10px 12px; font-weight: 900; color: var(--color-morado);">${r.puntaje.toLocaleString()} pts</td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        contenedor.innerHTML = html;
    }

    abrirImpacto() {
        const impacto = window.storageEco.obtenerImpacto();
        const contenedor = document.getElementById('impactoContenedorCards');
        if (!contenedor) return;

        // Equivalencias concretas para primaria en Ica
        const botellas = Math.round(impacto.LIMPIEZA / 0.05);
        const bidones = Math.max(1, Math.round(impacto.AGUA / 3));
        const horasLuz = Math.round(impacto.ENERGIA * 20);
        const plantulas = Math.round(impacto.VERDE / 0.5);

        contenedor.innerHTML = `
            <div style="background: #E0F2F1; border: 2.5px solid var(--color-trazo); border-radius: 16px; padding: 16px; text-align: center; box-shadow: 0 4px 0 var(--color-trazo);">
                <div style="font-size: 11px; font-weight: 800; color: #23786A; text-transform: uppercase;">Residuos Reciclados</div>
                <div style="font-size: 26px; font-weight: 900; color: #1B5E53; margin: 4px 0;">${impacto.LIMPIEZA} kg</div>
                <div style="font-size: 12.5px; font-weight: 600; color: #334155;">Plástico, papel y metal acopiados en la plaza</div>
                <div style="font-size: 11.5px; font-weight: 700; color: #23786A; margin-top: 6px;">Aprox. ${botellas} botellas o envases recuperados</div>
            </div>
            <div style="background: #E1F5FE; border: 2.5px solid var(--color-trazo); border-radius: 16px; padding: 16px; text-align: center; box-shadow: 0 4px 0 var(--color-trazo);">
                <div style="font-size: 11px; font-weight: 800; color: #2E80A8; text-transform: uppercase;">Agua Preservada</div>
                <div style="font-size: 26px; font-weight: 900; color: #1E5874; margin: 4px 0;">${impacto.AGUA} Litros</div>
                <div style="font-size: 12.5px; font-weight: 600; color: #334155;">Ahorro por cierre oportuno en lavaderos</div>
                <div style="font-size: 11.5px; font-weight: 700; color: #2E80A8; margin-top: 6px;">Equivalente a ${bidones} bidones escolares de agua potable</div>
            </div>
            <div style="background: #FFF8E1; border: 2.5px solid var(--color-trazo); border-radius: 16px; padding: 16px; text-align: center; box-shadow: 0 4px 0 var(--color-trazo);">
                <div style="font-size: 11px; font-weight: 800; color: #DFA855; text-transform: uppercase;">Energía Conservada</div>
                <div style="font-size: 26px; font-weight: 900; color: #B57A22; margin: 4px 0;">${impacto.ENERGIA} kWh</div>
                <div style="font-size: 12.5px; font-weight: 600; color: #334155;">Luces y equipos apagados en aulas vacías</div>
                <div style="font-size: 11.5px; font-weight: 700; color: #B57A22; margin-top: 6px;">Equivale a ${horasLuz} horas de iluminación escolar LED</div>
            </div>
            <div style="background: #E8F5E9; border: 2.5px solid var(--color-trazo); border-radius: 16px; padding: 16px; text-align: center; box-shadow: 0 4px 0 var(--color-trazo);">
                <div style="font-size: 11px; font-weight: 800; color: #4E9A45; text-transform: uppercase;">Área Verde Cuidada</div>
                <div style="font-size: 26px; font-weight: 900; color: #35722E; margin: 4px 0;">${impacto.VERDE} m²</div>
                <div style="font-size: 12.5px; font-weight: 600; color: #334155;">Superficie cultivada en el biohuerto escolar</div>
                <div style="font-size: 11.5px; font-weight: 700; color: #35722E; margin-top: 6px;">Aprox. ${plantulas} plántulas u hortalizas sembradas</div>
            </div>
        `;

        this.modalImpacto.classList.add('activo');
    }

    cerrarModal(modal) {
        if (modal) modal.classList.remove('activo');
    }
}

// Iniciar aplicación al cargar el DOM
window.addEventListener('DOMContentLoaded', () => {
    if (window.location.hash === '#tienda' || window.location.hash.startsWith('#juego-')) {
        let activo = window.storageEco.cargarEstudianteActivo();
        if (!activo || !activo.nombre) {
            window.storageEco.establecerEstudianteActivo({
                nombre: 'Mateo Quispe',
                grado: 5,
                seccion: 'A'
            });
            const p = window.storageEco.obtenerPerfil();
            if (p) {
                p.monedas = 248;
                window.storageEco.guardarPerfiles();
            }
        }
    }
    window.appEco = new AppEcoRescate();
    if (window.location.hash === '#tienda') {
        window.appEco.abrirTienda();
    } else if (window.location.hash.startsWith('#juego-')) {
        const tipoId = window.location.hash.replace('#juego-', '');
        window.appEco.lanzarNivel(tipoId, 1);
        if (window.appEco.instanciaJuego) {
            window.appEco.instanciaJuego.iniciarPartida();
            window.appEco.instanciaJuego.spawnEcoBurbuja();
            window.appEco.instanciaJuego.crearTextoFlotante('+30 ¡PLÁSTICO!', 480, 290, '#38BDF8', 1.3);
            window.appEco.instanciaJuego.hablarMascota('¡Excelente inicio! ¡A limpiar Ica!');
        }
    }
});
