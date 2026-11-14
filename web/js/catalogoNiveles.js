/**
 * Operación EcoRescate - Catálogo Completo de Niveles y Datos Educativos
 * Contiene los 40 niveles (10 por minijuego), retos, criterios de evaluación,
 * datos curiosos de Ica y Perú (14 por juego) y preguntas del Desafío del Saber.
 */

const JUEGOS = {
    LIMPIEZA: {
        id: 'LIMPIEZA',
        nombre: 'Limpieza Monstruosa',
        lugar: 'La Plaza de Armas',
        color: '#23786A',
        colorSecundario: '#1B5E53',
        colorFondo: '#E0F2F1',
        medidor: 'Vidas',
        iconoId: 'reciclaje',
        descripcion: 'Clasifica los residuos en los tachos de plástico, papel y metal.',
        concepto: 'Cada residuo tiene su tacho correspondiente. Al separar plástico, papel y metal, facilitamos el reciclaje y mantenemos limpia nuestra ciudad.',
        instrucciones: [
            'Camina con las flechas o teclas W/A/S/D (o controles táctiles en celular) para recoger los residuos.',
            'Llévalos a su tacho y permanece un momento frente a él. Fíjate bien en el material de cada uno.',
            'Evita el lodo tóxico y no permitas que la plaza se llene de basura.'
        ],
        consejo: 'Separa la basura antes de botarla: el plástico, el papel y el metal van en tachos distintos según su letrero.',
        unidadImpacto: 'kg de residuos reciclados',
        impactoPorAcierto: 0.05,
        impactoPorNivel: 0.25,
        datos: [
            'Una botella de plástico puede tardar más de 400 años en descomponerse.',
            'El papel y el cartón pueden reciclarse hasta siete veces consecutivas.',
            'Un vaso descartable es de plástico: debe ir al tacho de plástico.',
            'Las latas de metal pueden reciclarse de forma indefinida sin perder calidad.',
            'Al mezclar residuos con restos orgánicos, se dificulta su reciclaje posterior.',
            'Reciclar una tonelada de papel evita la tala de aproximadamente 17 árboles.',
            'Un periódico es papel: va junto con las cajas de cartón y las hojas usadas.',
            'Una lata de atún es de metal, exactamente igual que una lata de bebida.',
            'Enjuagar los envases antes de reciclarlos evita malos olores y contaminación cruzada.',
            'Con 20 botellas plásticas recicladas es posible elaborar el relleno térmico de una casaca.',
            'Una lata reciclada puede retornar al mercado como envase nuevo en unos 60 días.',
            'En el Perú, cada persona genera en promedio casi un kilogramo de residuos al día.',
            'A partir del papel reciclado se producen cuadernos, cajas y empaques escolares.',
            'Los restos de cáscaras y frutas pueden transformarse en abono natural para las plantas.'
        ],
        preguntas: [
            {
                pregunta: '¿En qué tacho debe depositarse una botella de plástico?',
                opciones: ['En el tacho de plástico', 'En el tacho de papel', 'En el tacho de metal'],
                correcta: 0,
                explicacion: 'Las botellas, vasos y envoltorios limpios van en el contenedor de plástico.'
            },
            {
                pregunta: '¿Dónde debe desecharse una caja de cartón?',
                opciones: ['En el tacho de metal', 'En el tacho de papel y cartón', 'En el tacho de plástico'],
                correcta: 1,
                explicacion: 'El cartón y el papel comparten el mismo canal de acopio para su reciclaje.'
            },
            {
                pregunta: '¿Cuál es el beneficio de separar los residuos en casa o el colegio?',
                opciones: ['Permite recuperarlos y reciclarlos', 'Reduce el peso del contenedor', 'Es solo una actividad decorativa'],
                correcta: 0,
                explicacion: 'La separación en origen permite reutilizar materiales y evita contaminar ríos y desiertos.'
            },
            {
                pregunta: '¿En qué contenedor debe ir una lata de atún?',
                opciones: ['En el de papel', 'En el de metal', 'En el de plástico'],
                correcta: 1,
                explicacion: 'Las latas de conservas y conservas de pescado están fabricadas de metal reciclable.'
            },
            {
                pregunta: '¿Qué tipo de residuo es un vaso descartable?',
                opciones: ['Es de papel', 'Es de metal', 'Es de plástico'],
                correcta: 2,
                explicacion: 'La mayoría de vasos descartables están hechos de polipropileno o poliestireno (plástico).'
            },
            {
                pregunta: '¿Qué paso previo se recomienda antes de depositar una botella?',
                opciones: ['Enjuagarla y compactarla', 'Romperla en trozos', 'Pintar la superficie'],
                correcta: 0,
                explicacion: 'Enjuagar los envases evita que queden restos que fermenten y dañen otros materiales reciclables.'
            }
        ],
        niveles: [
            {
                numero: 1,
                titulo: 'Primeros pasos',
                tiempo: 120,
                err2: 3, err3: 1,
                novedad: null,
                retos: [{ clave: 'BOTELLIN', meta: 3, corto: 'Botellín', desc: 'Recicla 3 botellines en el tacho de plástico' }]
            },
            {
                numero: 2,
                titulo: 'Papel y metal',
                tiempo: 120,
                err2: 3, err3: 1,
                novedad: 'Atención: aparece lodo tóxico en la plaza. Evita tocarlo.',
                retos: [
                    { clave: 'CAJETON', meta: 3, corto: 'Cajetón', desc: 'Recicla 3 cajetones en el tacho de papel' },
                    { clave: 'LATOX', meta: 2, corto: 'Latox', desc: 'Recicla 2 latox en el tacho de metal' }
                ]
            },
            {
                numero: 3,
                titulo: 'Nuevos vecinos',
                tiempo: 130,
                err2: 3, err3: 1,
                novedad: 'Vasito es un vaso descartable (plástico) y Periodicón es un periódico (papel).',
                retos: [
                    { clave: 'VASITO', meta: 3, corto: 'Vasito', desc: 'Recicla 3 vasitos descartables' },
                    { clave: 'PERIODICON', meta: 3, corto: 'Periodicón', desc: 'Recicla 3 periódicos' }
                ]
            },
            {
                numero: 4,
                titulo: 'Separación total',
                tiempo: 140,
                err2: 3, err3: 1,
                novedad: null,
                retos: [
                    { clave: 'PLASTICO', meta: 5, corto: 'Plástico', desc: 'Lleva 5 residuos al tacho de plástico' },
                    { clave: 'PAPEL', meta: 4, corto: 'Papel', desc: 'Lleva 4 residuos al tacho de papel' },
                    { clave: 'METAL', meta: 3, corto: 'Metal', desc: 'Lleva 3 residuos al tacho de metal' }
                ]
            },
            {
                numero: 5,
                titulo: 'La lata de atún',
                tiempo: 130,
                err2: 2, err3: 1,
                novedad: 'Atunín es una lata de conserva: también corresponde al tacho de metal.',
                retos: [
                    { clave: 'ATUNIN', meta: 3, corto: 'Atunín', desc: 'Recicla 3 latas Atunín' },
                    { clave: 'METAL', meta: 6, corto: 'Metal', desc: 'Lleva 6 residuos al tacho de metal' }
                ]
            },
            {
                numero: 6,
                titulo: 'Racha recicladora',
                tiempo: 120,
                err2: 2, err3: 0,
                novedad: 'Recicla de manera constante y sin equivocaciones para elevar tu multiplicador.',
                retos: [
                    { clave: 'ACIERTOS', meta: 12, corto: 'Reciclados', desc: 'Recicla 12 residuos en total' },
                    { clave: 'COMBO', meta: 3, corto: 'Combo 3x', desc: 'Alcanza una racha de combo 3x' }
                ]
            },
            {
                numero: 7,
                titulo: 'Estrella de energía',
                tiempo: 120,
                err2: 2, err3: 0,
                novedad: 'Aparece una insignia dorada: otorga mayor velocidad e inmunidad temporal.',
                retos: [
                    { clave: 'ESTRELLA', meta: 1, corto: 'Insignia', desc: 'Consigue la insignia de poder' },
                    { clave: 'PLASTICO', meta: 8, corto: 'Plástico', desc: 'Lleva 8 residuos al tacho de plástico' }
                ]
            },
            {
                numero: 8,
                titulo: 'Plaza transitada',
                tiempo: 120,
                err2: 2, err3: 0,
                novedad: 'Los residuos se acumulan con mayor rapidez y aumentan los focos de lodo.',
                retos: [
                    { clave: 'PAPEL', meta: 7, corto: 'Papel', desc: 'Lleva 7 residuos al tacho de papel' },
                    { clave: 'METAL', meta: 6, corto: 'Metal', desc: 'Lleva 6 residuos al tacho de metal' }
                ]
            },
            {
                numero: 9,
                titulo: 'Coordinación avanzada',
                tiempo: 130,
                err2: 2, err3: 0,
                novedad: null,
                retos: [
                    { clave: 'COMBO', meta: 4, corto: 'Combo 4x', desc: 'Alcanza una racha de combo 4x' },
                    { clave: 'ACIERTOS', meta: 18, corto: 'Reciclados', desc: 'Recicla 18 residuos en total' }
                ]
            },
            {
                numero: 10,
                titulo: 'La gran jornada',
                tiempo: 160,
                err2: 2, err3: 0,
                novedad: 'Misión final de la plaza: mantén limpia toda la zona.',
                retos: [
                    { clave: 'PLASTICO', meta: 10, corto: 'Plástico', desc: 'Lleva 10 residuos al tacho de plástico' },
                    { clave: 'PAPEL', meta: 8, corto: 'Papel', desc: 'Lleva 8 residuos al tacho de papel' },
                    { clave: 'METAL', meta: 7, corto: 'Metal', desc: 'Lleva 7 residuos al tacho de metal' }
                ]
            }
        ]
    },

    AGUA: {
        id: 'AGUA',
        nombre: 'Guardián del Agua',
        lugar: 'Los Lavaderos Escolares',
        color: '#2E80A8',
        colorSecundario: '#1E5874',
        colorFondo: '#E1F5FE',
        medidor: 'Tanque',
        iconoId: 'agua',
        descripcion: 'Cierra caños abiertos y fugas; respeta el turno de quien se enjuaga.',
        concepto: 'El agua potable es un recurso escaso, especialmente en los valles costeros de Ica. Mantén el grifo cerrado mientras te cepillas o te enjabonas las manos.',
        instrucciones: [
            'Observa la acción de cada estudiante en los lavaderos del colegio.',
            'Si alguien se cepilla o enjabona con el grifo abierto, o si detectas una fuga: pulsa para cerrarlo.',
            'Si el estudiante se está enjuagando, espera pacientemente: en ese momento sí necesita el agua.'
        ],
        consejo: 'Un caño abierto sin uso vierte cerca de seis litros de agua potable por cada minuto transcurrido.',
        unidadImpacto: 'litros de agua ahorrados',
        impactoPorAcierto: 6.0,
        impactoPorNivel: 10.0,
        datos: [
            'Un caño abierto vierte aproximadamente 6 litros de agua potable cada minuto.',
            'Cerrar el caño durante el cepillado dental ahorra hasta 12 litros por sesión.',
            'Un caño con fuga constante puede desperdiciar más de 30 litros en 24 horas.',
            'Ica se sitúa sobre un desierto costero: aquí el agua subterránea es sumamente valiosa.',
            'Enjabónate siempre con el grifo cerrado y ábrelo solo al momento del enjuague.',
            'Si observas una fuga en las instalaciones escolares, infórmalo a los docentes o conserjes.',
            'Utilizar un vaso con agua para el enjuague bucal optimiza notablemente el consumo.',
            'El agua que protegemos hoy garantiza el suministro continuo para la comunidad escolar.',
            'Asegurar un cierre completo de la llave toma un segundo y previene filtraciones.',
            'Menos del tres por ciento del agua del planeta es dulce y apta para consumo humano.',
            'Una ducha breve de 5 minutos requiere sustancialmente menos agua que un baño de tina.',
            'El agua utilizada para lavar verduras puede emplearse para el riego de áreas verdes.',
            'El cuerpo humano está compuesto en más de un 60% por agua.',
            'Los ríos que alimentan el valle de Ica provienen del deshielo y lluvias en las zonas altas andinas.'
        ],
        preguntas: [
            {
                pregunta: '¿Cuál es la práctica adecuada mientras te cepillas los dientes?',
                opciones: ['Dejar el caño abierto', 'Mantener el caño cerrado', 'Abrir la llave al máximo'],
                correcta: 1,
                explicacion: 'Cerrar la llave mientras nos cepillamos ahorra entre 10 y 12 litros de agua potable.'
            },
            {
                pregunta: '¿Qué consecuencia produce un caño que gotea continuamente?',
                opciones: ['No causa pérdidas relevantes', 'Desperdicia decenas de litros al día', 'Limpia el lavadero'],
                correcta: 1,
                explicacion: 'Una fuga gota a gota genera una pérdida de más de 30 litros diarios sin ningún beneficio.'
            },
            {
                pregunta: '¿En qué instante resulta necesario abrir el caño?',
                opciones: ['Únicamente al enjuagarse', 'Durante todo el enjabonado', 'Antes de acercarse al lavadero'],
                correcta: 0,
                explicacion: 'El agua debe correr únicamente durante el enjuague efectivo de manos o rostro.'
            },
            {
                pregunta: 'Si detectas un caño con fuga en el colegio, ¿qué acción corresponde?',
                opciones: ['Ignorar la situación', 'Avisar a un docente o personal auxiliar', 'Intentar forzar la manija'],
                correcta: 1,
                explicacion: 'Comunicar oportunamente la fuga permite al personal de mantenimiento reparar la válvula.'
            },
            {
                pregunta: '¿Aproximadamente cuánta agua sale de un caño promedio por minuto?',
                opciones: ['Menos de medio litro', 'Cerca de 6 litros', 'No es medible'],
                correcta: 1,
                explicacion: 'Un grifo estándar con presión normal descarga unos 6 litros por minuto continuo.'
            }
        ],
        niveles: [
            {
                numero: 1,
                titulo: 'Primer día',
                tiempo: 90,
                err2: 3, err3: 1,
                novedad: null,
                retos: [
                    { clave: 'ABANDONADO', meta: 3, corto: 'Abandonados', desc: 'Cierra 3 caños desatendidos' },
                    { clave: 'CEPILLA', meta: 2, corto: 'Cepillado', desc: 'Cierra el caño a 2 alumnos que se cepillan' }
                ]
            },
            {
                numero: 2,
                titulo: 'Higiene responsable',
                tiempo: 90,
                err2: 3, err3: 1,
                novedad: 'Observa a los alumnos que se enjabonan con el agua corriendo.',
                retos: [
                    { clave: 'ENJABONA', meta: 3, corto: 'Enjabonado', desc: 'Cierra el caño a 3 alumnos que se enjabonan' },
                    { clave: 'CERRADOS', meta: 7, corto: 'Grifos', desc: 'Cierra 7 grifos en total' }
                ]
            },
            {
                numero: 3,
                titulo: 'Gota a gota',
                tiempo: 100,
                err2: 3, err3: 1,
                novedad: 'Aparecen caños con goteo constante. Cada gota suma pérdida.',
                retos: [
                    { clave: 'GOTEO', meta: 3, corto: 'Goteos', desc: 'Detén 3 caños con goteo' },
                    { clave: 'CERRADOS', meta: 9, corto: 'Grifos', desc: 'Cierra 9 grifos en total' }
                ]
            },
            {
                numero: 4,
                titulo: 'Uso oportuno',
                tiempo: 100,
                err2: 3, err3: 1,
                novedad: 'Alumnos que se enjuagan: en ese momento sí requieren agua, no los interrumpas.',
                retos: [
                    { clave: 'RESPETA', meta: 2, corto: 'Enjuagues', desc: 'Permite concluir a 2 alumnos en enjuague' },
                    { clave: 'CERRADOS', meta: 9, corto: 'Grifos', desc: 'Cierra 9 grifos en total' }
                ]
            },
            {
                numero: 5,
                titulo: 'Reacción oportuna',
                tiempo: 80,
                err2: 2, err3: 1,
                novedad: 'Menor tiempo disponible: vigila atentamente los cuatro puntos.',
                retos: [
                    { clave: 'CERRADOS', meta: 14, corto: 'Grifos', desc: 'Cierra 14 grifos en total' }
                ]
            },
            {
                numero: 6,
                titulo: 'Control de fugas',
                tiempo: 110,
                err2: 2, err3: 0,
                novedad: 'Pueden activarse dos lavaderos de forma simultánea.',
                retos: [
                    { clave: 'GOTEO', meta: 4, corto: 'Goteos', desc: 'Detén 4 caños con goteo' },
                    { clave: 'CEPILLA', meta: 4, corto: 'Cepillado', desc: 'Cierra el caño a 4 alumnos en cepillado' },
                    { clave: 'RESPETA', meta: 3, corto: 'Enjuagues', desc: 'Permite concluir a 3 alumnos en enjuague' }
                ]
            },
            {
                numero: 7,
                titulo: 'Ritmo continuo',
                tiempo: 110,
                err2: 2, err3: 0,
                novedad: null,
                retos: [
                    { clave: 'COMBO', meta: 5, corto: 'Combo 5x', desc: 'Alcanza una racha de combo 5x' },
                    { clave: 'CERRADOS', meta: 16, corto: 'Grifos', desc: 'Cierra 16 grifos en total' }
                ]
            },
            {
                numero: 8,
                titulo: 'Hora de recreo',
                tiempo: 110,
                err2: 2, err3: 0,
                novedad: 'Afluencia alta en los lavaderos tras el recreo escolar.',
                retos: [
                    { clave: 'CERRADOS', meta: 20, corto: 'Grifos', desc: 'Cierra 20 grifos en total' },
                    { clave: 'RESPETA', meta: 3, corto: 'Enjuagues', desc: 'Permite concluir a 3 alumnos en enjuague' }
                ]
            },
            {
                numero: 9,
                titulo: 'Preservación total',
                tiempo: 120,
                err2: 2, err3: 0,
                novedad: null,
                retos: [
                    { clave: 'LITROS', meta: 150, corto: 'Litros', desc: 'Ahorra 150 litros de agua potable' }
                ]
            },
            {
                numero: 10,
                titulo: 'Custodio del recurso',
                tiempo: 140,
                err2: 2, err3: 0,
                novedad: 'Desafío final: controla el gasto hídrico de toda la instalación.',
                retos: [
                    { clave: 'CERRADOS', meta: 28, corto: 'Grifos', desc: 'Cierra 28 grifos en total' },
                    { clave: 'RESPETA', meta: 4, corto: 'Enjuagues', desc: 'Permite concluir a 4 alumnos en enjuague' },
                    { clave: 'COMBO', meta: 5, corto: 'Combo 5x', desc: 'Alcanza una racha de combo 5x' }
                ]
            }
        ]
    },

    ENERGIA: {
        id: 'ENERGIA',
        nombre: 'Apaga y Ahorra',
        lugar: 'Pabellones del Colegio',
        color: '#DFA855',
        colorSecundario: '#B57A22',
        colorFondo: '#FFF8E1',
        medidor: 'Energía',
        iconoId: 'energia',
        descripcion: 'Apaga luces y equipos en aulas vacías; desenchufa cargadores sin uso.',
        concepto: 'La energía eléctrica consumida sin uso útil representa un gasto innecesario de recursos. Desconecta luminarias, pantallas y transformadores en espacios desocupados.',
        instrucciones: [
            'Observa qué aulas se encuentran desocupadas y cuáles tienen clase presencial.',
            'Haz clic en focos, televisores, computadoras y cargadores encendidos dentro de aulas vacías.',
            'No apagues los equipos de salones donde los alumnos se encuentren trabajando.'
        ],
        consejo: 'Al retirarse de cualquier ambiente, el último en salir debe apagar la iluminación y equipos auxiliares.',
        unidadImpacto: 'kWh de energía ahorrados',
        impactoPorAcierto: 0.05,
        impactoPorNivel: 0.2,
        datos: [
            'Una luminaria encendida en un aula vacía consume energía sin prestar ninguna utilidad.',
            'La iluminación LED consume hasta un 85% menos energía que los focos incandescentes tradicionales.',
            'Aprovechar la luz diurna abriendo cortinas evita encender luminarias de forma prematura.',
            'Un cargador conectado a la toma sin dispositivo sigue registrando un consumo pasivo constante.',
            'Los equipos en modo de espera o reposo continúan demandando suministro eléctrico.',
            'El ahorro de electricidad reduce costos operativos en colegios y en los hogares familiares.',
            'Fomentar el hábito de apagar la luz al retirarse beneficia a toda la comunidad escolar.',
            'Gran parte de la generación eléctrica convencional requiere combustibles que emiten carbono.',
            'Apagar las computadoras al finalizar las labores previene el desgaste térmico de componentes.',
            'En el Perú, una porción mayoritaria de la electricidad proviene de centrales hidroeléctricas.',
            'La radiación solar de Ica es una de las más altas del país, ideal para sistemas fotovoltaicos.',
            'Los paneles solares transforman directamente la luz natural en energía limpia y renovable.',
            'Abrir con frecuencia la puerta de refrigeradores incrementa drásticamente su consumo eléctrico.',
            'Un ventilador consume considerablemente menor potencia que un sistema de aire acondicionado.'
        ],
        preguntas: [
            {
                pregunta: 'Al concluir las clases y quedar el aula vacía, ¿qué medida corresponde?',
                opciones: ['Dejar luces encendidas para limpieza', 'Apagar luminarias y equipos', 'Dejar la pantalla encendida'],
                correcta: 1,
                explicacion: 'En ausencia de personas, cualquier consumo activo constituye un desperdicio de energía.'
            },
            {
                pregunta: '¿Es correcto apagar las luces de un salón donde hay alumnos leyendo?',
                opciones: ['Sí, para ahorrar siempre', 'No, porque están utilizando la iluminación', 'Depende de la hora'],
                correcta: 1,
                explicacion: 'El uso eficiente de la energía busca evitar el desperdicio, no privar de las condiciones adecuadas de estudio.'
            },
            {
                pregunta: 'Un cargador de celular que permanece enchufado sin teléfono conectado...',
                opciones: ['No consume nada', 'Sigue registrando consumo pasivo', 'Se desconecta internamente'],
                correcta: 1,
                explicacion: 'Los circuitos transformadores de los cargadores disipan energía continua aun sin carga útil conectada.'
            },
            {
                pregunta: 'Durante una mañana soleada, ¿qué conviene hacer antes de prender focos?',
                opciones: ['Abrir cortinas y persianas', 'Cerrar ventanas', 'Encender todos los interruptores'],
                correcta: 0,
                explicacion: 'Aprovechar la luz solar directa o difusa sustituye de manera natural a la iluminación artificial.'
            },
            {
                pregunta: '¿Qué tecnología de iluminación es la más eficiente para salones y pasadizos?',
                opciones: ['Focos LED de bajo consumo', 'Focos incandescentes antiguos', 'Ambos consumen igual'],
                correcta: 0,
                explicacion: 'Las lámparas LED ofrecen mayor luminosidad por vatio consumido y presentan vida útil extendida.'
            }
        ],
        niveles: [
            {
                numero: 1,
                titulo: 'Luces fuera',
                tiempo: 75,
                err2: 3, err3: 1,
                novedad: null,
                retos: [{ clave: 'FOCO', meta: 6, corto: 'Luces', desc: 'Apaga 6 luces en salones vacíos' }]
            },
            {
                numero: 2,
                titulo: 'Pantallas en reposo',
                tiempo: 90,
                err2: 3, err3: 1,
                novedad: null,
                retos: [
                    { clave: 'TV', meta: 3, corto: 'Televisor', desc: 'Apaga 3 televisores sin alumnos' },
                    { clave: 'COMPUTADORA', meta: 3, corto: 'Computadora', desc: 'Apaga 3 computadoras desatendidas' },
                    { clave: 'FOCO', meta: 5, corto: 'Luces', desc: 'Apaga 5 luces' }
                ]
            },
            {
                numero: 3,
                titulo: 'Consumo pasivo',
                tiempo: 90,
                err2: 3, err3: 1,
                novedad: 'Cargadores enchufados sin dispositivo: desconéctalos para detener el consumo residual.',
                retos: [
                    { clave: 'CARGADOR', meta: 3, corto: 'Cargadores', desc: 'Desenchufa 3 cargadores solos' },
                    { clave: 'APAGADOS', meta: 14, corto: 'Desactivados', desc: 'Apaga o desconecta 14 elementos' }
                ]
            },
            {
                numero: 4,
                titulo: 'Ventilación responsable',
                tiempo: 90,
                err2: 3, err3: 1,
                novedad: null,
                retos: [
                    { clave: 'VENTILADOR', meta: 4, corto: 'Ventiladores', desc: 'Apaga 4 ventiladores en aulas vacías' },
                    { clave: 'APAGADOS', meta: 16, corto: 'Desactivados', desc: 'Apaga o desconecta 16 elementos' }
                ]
            },
            {
                numero: 5,
                titulo: 'Inspección autónoma',
                tiempo: 90,
                err2: 2, err3: 1,
                novedad: 'A partir de aquí no habrá indicadores de asistencia: identifica tú qué aula está desocupada.',
                retos: [{ clave: 'APAGADOS', meta: 20, corto: 'Desactivados', desc: 'Apaga o desconecta 20 elementos' }]
            },
            {
                numero: 6,
                titulo: 'Secuencia eficiente',
                tiempo: 90,
                err2: 2, err3: 0,
                novedad: null,
                retos: [
                    { clave: 'COMBO', meta: 5, corto: 'Combo 5x', desc: 'Alcanza una racha de combo 5x' },
                    { clave: 'FOCO', meta: 10, corto: 'Luces', desc: 'Apaga 10 luces desatendidas' }
                ]
            },
            {
                numero: 7,
                titulo: 'Término de turno',
                tiempo: 90,
                err2: 2, err3: 0,
                novedad: 'Aulas desalojadas con mayor frecuencia por cambio de horario.',
                retos: [{ clave: 'APAGADOS', meta: 26, corto: 'Desactivados', desc: 'Apaga o desconecta 26 elementos' }]
            },
            {
                numero: 8,
                titulo: 'Eficiencia energética',
                tiempo: 100,
                err2: 2, err3: 0,
                novedad: null,
                retos: [
                    { clave: 'CARGADOR', meta: 5, corto: 'Cargadores', desc: 'Desenchufa 5 cargadores solos' },
                    { clave: 'COMPUTADORA', meta: 6, corto: 'Computadoras', desc: 'Apaga 6 computadoras' },
                    { clave: 'APAGADOS', meta: 24, corto: 'Desactivados', desc: 'Apaga o desconecta 24 elementos' }
                ]
            },
            {
                numero: 9,
                titulo: 'Jornada nocturna',
                tiempo: 100,
                err2: 2, err3: 0,
                novedad: 'Iluminación nocturna exterior: cada foco cuenta para la preservación.',
                retos: [
                    { clave: 'APAGADOS', meta: 32, corto: 'Desactivados', desc: 'Apaga o desconecta 32 elementos' },
                    { clave: 'COMBO', meta: 5, corto: 'Combo 5x', desc: 'Alcanza una racha de combo 5x' }
                ]
            },
            {
                numero: 10,
                titulo: 'Colegio sostenible',
                tiempo: 110,
                err2: 2, err3: 0,
                novedad: 'Desafío integral de eficiencia eléctrica en todo el plantel.',
                retos: [
                    { clave: 'APAGADOS', meta: 38, corto: 'Desactivados', desc: 'Apaga o desconecta 38 elementos' },
                    { clave: 'CARGADOR', meta: 6, corto: 'Cargadores', desc: 'Desenchufa 6 cargadores' },
                    { clave: 'FOCO', meta: 14, corto: 'Luces', desc: 'Apaga 14 luces' }
                ]
            }
        ]
    },

    VERDE: {
        id: 'VERDE',
        nombre: 'Sembradores del Verde',
        lugar: 'El Biohuerto Escolar',
        color: '#4E9A45',
        colorSecundario: '#35722E',
        colorFondo: '#E8F5E9',
        medidor: 'Biohuerto',
        iconoId: 'planta',
        descripcion: 'Siembra semillas, riega la tierra seca y retira malezas y desechos.',
        concepto: 'Las plantas son seres vivos que requieren riego medido y suelo limpio. Regar en exceso asfixia las raíces y desperdicia recursos hídricos.',
        instrucciones: [
            'Elige la herramienta adecuada en la barra inferior (Semilla, Regadera, Limpieza) o teclas 1, 2 y 3.',
            'Siembra en parcelas libres y riega exclusivamente cuando el indicador muestre tierra seca.',
            'Retira la basura acumulada y las plantas marchitas para brindar espacio a nuevos brotes.'
        ],
        consejo: 'Comprueba la humedad del suelo antes de regar: el riego debe efectuarse en horas tempranas o al atardecer.',
        unidadImpacto: 'm² de área verde cuidada',
        impactoPorAcierto: 0.5,
        impactoPorNivel: 1.0,
        datos: [
            'La vegetación urbana genera sombra y disminuye la sensación térmica en patios escolares.',
            'El riego excesivo satura el sustrato y pudre las raíces de las plantas jóvenes.',
            'Los residuos sólidos abandonados en jardines degradan la fertilidad del suelo.',
            'Regar temprano o al final de la tarde reduce la pérdida de agua por evaporación solar.',
            'Las áreas verdes proporcionan refugio a aves, abejas e insectos polinizadores.',
            'Las plantas fijan dióxido de carbono y liberan oxígeno al ambiente mediante la fotosíntesis.',
            'Un biohuerto educativo aporta alimentos frescos y permite aprender biología aplicada.',
            'Tocar la tierra ayuda a constatar la humedad real antes de suministrar más agua.',
            'Retirar partes secas previene la aparición de hongos y renueva el vigor del cultivo.',
            'El huarango es una especie nativa de Ica con raíces profundas que resiste sequías extremas.',
            'Las abejas y mariposas son fundamentales para la fecundación y producción de frutos.',
            'La cobertura vegetal amortigua la radiación solar y refresca el microclima circundante.',
            'El entramado de raíces retiene la tierra y combate la erosión causada por el viento.',
            'Las semillas necesitan humedad equilibrada, aireación y temperatura templada para brotar.'
        ],
        preguntas: [
            {
                pregunta: '¿En qué condición es correcto aplicar agua de riego a una planta?',
                opciones: ['Cuando la tierra superficial esté seca', 'De manera continua cada hora', 'Nunca en exteriores'],
                correcta: 0,
                explicacion: 'El riego debe realizarse cuando la planta y el sustrato lo demanden, evitando encharcamientos.'
            },
            {
                pregunta: '¿Qué impacto produce arrojar plásticos o papeles en un jardín?',
                opciones: ['Facilita la absorción de abono', 'Contamina el suelo y debilita la planta', 'No genera efectos'],
                correcta: 1,
                explicacion: 'Los desechos obstruyen el crecimiento de las raíces y alteran los nutrientes de la tierra.'
            },
            {
                pregunta: '¿Cuál es la función principal de las áreas verdes en las escuelas?',
                opciones: ['Brindar sombra, aire limpio y biodiversidad', 'Servir de depósito temporal', 'Cumplir un fin netamente decorativo'],
                correcta: 0,
                explicacion: 'Los jardines y biohuertos mejoran la calidad del aire, brindan confort térmico y albergan fauna útil.'
            },
            {
                pregunta: '¿Qué ocurre si se satura de agua una planta cuya tierra aún está húmeda?',
                opciones: ['Florece con mayor velocidad', 'Las raíces carecen de oxígeno y pueden pudrirse', 'No sufre ningún cambio'],
                correcta: 1,
                explicacion: 'El exceso continuado de humedad satura los poros del sustrato y provoca la asfixia del sistema radicular.'
            },
            {
                pregunta: '¿Qué organismos colaboran directamente en la polinización de flores?',
                opciones: ['Abejas, mariposas y colibríes', 'Insectos de basura', 'Ningún ser vivo'],
                correcta: 0,
                explicacion: 'Los polinizadores trasladan el polen entre flores, haciendo posible la formación de semillas y frutos.'
            }
        ],
        niveles: [
            {
                numero: 1,
                titulo: 'Primera semilla',
                tiempo: 100,
                err2: 3, err3: 1,
                novedad: null,
                retos: [
                    { clave: 'SIEMBRA', meta: 4, corto: 'Siembra', desc: 'Siembra 4 semillas en parcelas libres' },
                    { clave: 'FLORES', meta: 3, corto: 'Floración', desc: 'Cuida 3 plantas hasta su floración' }
                ]
            },
            {
                numero: 2,
                titulo: 'Riego medido',
                tiempo: 110,
                err2: 3, err3: 1,
                novedad: null,
                retos: [
                    { clave: 'RIEGO', meta: 6, corto: 'Riego', desc: 'Riega 6 veces solo ante tierra seca' },
                    { clave: 'FLORES', meta: 4, corto: 'Floración', desc: 'Consigue 4 plantas en flor' }
                ]
            },
            {
                numero: 3,
                titulo: 'Suelo limpio',
                tiempo: 110,
                err2: 3, err3: 1,
                novedad: 'Llegan residuos con el viento: retíralos para que la tierra respire.',
                retos: [
                    { clave: 'BASURA', meta: 5, corto: 'Limpieza', desc: 'Recoge 5 desechos del biohuerto' },
                    { clave: 'FLORES', meta: 4, corto: 'Floración', desc: 'Consigue 4 plantas en flor' }
                ]
            },
            {
                numero: 4,
                titulo: 'Precisión botánica',
                tiempo: 110,
                err2: 2, err3: 0,
                novedad: 'Recuerda: regar una planta con tierra húmeda se computa como error.',
                retos: [{ clave: 'FLORES', meta: 6, corto: 'Floración', desc: 'Consigue 6 plantas en flor' }]
            },
            {
                numero: 5,
                titulo: 'Sol del mediodía',
                tiempo: 120,
                err2: 2, err3: 1,
                novedad: 'Temperatura elevada: la humedad superficial desciende más rápido.',
                retos: [
                    { clave: 'FLORES', meta: 6, corto: 'Floración', desc: 'Consigue 6 plantas en flor' },
                    { clave: 'RIEGO', meta: 8, corto: 'Riego', desc: 'Aplica 8 riegos oportunos' }
                ]
            },
            {
                numero: 6,
                titulo: 'Crecimiento armónico',
                tiempo: 120,
                err2: 2, err3: 0,
                novedad: null,
                retos: [
                    { clave: 'COMBO', meta: 3, corto: 'Combo 3x', desc: 'Alcanza una racha de combo 3x' },
                    { clave: 'FLORES', meta: 6, corto: 'Floración', desc: 'Consigue 6 plantas en flor' }
                ]
            },
            {
                numero: 7,
                titulo: 'Viento costero',
                tiempo: 120,
                err2: 2, err3: 0,
                novedad: 'Las ráfagas traen hojas secas y envoltorios con mayor frecuencia.',
                retos: [
                    { clave: 'BASURA', meta: 8, corto: 'Limpieza', desc: 'Recoge 8 desechos' },
                    { clave: 'FLORES', meta: 6, corto: 'Floración', desc: 'Consigue 6 plantas en flor' }
                ]
            },
            {
                numero: 8,
                titulo: 'Huerto en producción',
                tiempo: 130,
                err2: 2, err3: 0,
                novedad: null,
                retos: [{ clave: 'FLORES', meta: 9, corto: 'Floración', desc: 'Consigue 9 plantas en flor' }]
            },
            {
                numero: 9,
                titulo: 'Horticultor dedicado',
                tiempo: 140,
                err2: 2, err3: 0,
                novedad: null,
                retos: [
                    { clave: 'FLORES', meta: 10, corto: 'Floración', desc: 'Consigue 10 plantas en flor' },
                    { clave: 'BASURA', meta: 6, corto: 'Limpieza', desc: 'Recoge 6 desechos' },
                    { clave: 'COMBO', meta: 4, corto: 'Combo 4x', desc: 'Alcanza una racha de combo 4x' }
                ]
            },
            {
                numero: 10,
                titulo: 'El gran jardín',
                tiempo: 170,
                err2: 2, err3: 0,
                novedad: 'Misión final del biohuerto: cultiva y protege todas las parcelas.',
                retos: [
                    { clave: 'FLORES', meta: 14, corto: 'Floración', desc: 'Consigue 14 plantas en flor' },
                    { clave: 'RIEGO', meta: 12, corto: 'Riego', desc: 'Aplica 12 riegos oportunos' }
                ]
            }
        ]
    }
};

/** Formatea segundos en mm:ss */
function formatearTiempo(segundos) {
    const s = Math.max(0, Math.ceil(segundos));
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

/** Calcula estrellas obtenidas */
function calcularEstrellas(defNivel, superado, errores, segundos) {
    if (!superado) return 0;
    const tiempo3 = Math.round(defNivel.tiempo * 0.6);
    if (errores <= defNivel.err3 && segundos <= tiempo3) return 3;
    if (errores <= defNivel.err2) return 2;
    return 1;
}

/**
 * Calcula la calificación escolar en la escala vigesimal peruana (1 al 20)
 * según criterios pedagógicos de MINEDU para educación primaria.
 */
function calcularNotaVigesimal(defNivel, superado, aciertos = 0, totalRetos = 0, errores = 0, segundos = 0, preguntaCorrecta = null) {
    if (!superado) {
        // En inicio (C): calificación de 01 a 10 según avance alcanzado
        const total = totalRetos > 0 ? totalRetos : Math.max(1, aciertos + errores);
        const ratio = Math.min(1, Math.max(0, aciertos / total));
        return Math.max(1, Math.min(10, Math.round(ratio * 10)));
    }

    // Nivel superado: nota base aprobatoria 14 (Logro Esperado - A)
    let nota = 14;

    // 1. Criterio de precisión (errores cometidos)
    const err3 = (defNivel && typeof defNivel.err3 === 'number') ? defNivel.err3 : 0;
    const err2 = (defNivel && typeof defNivel.err2 === 'number') ? defNivel.err2 : 2;
    if (errores === 0) {
        nota += 3; // Impecable (+3)
    } else if (errores <= err3) {
        nota += 2; // Muy alta precisión (+2)
    } else if (errores <= err2) {
        nota += 1; // Precisión esperada (+1)
    } else {
        nota -= 1; // Muchos errores (-1)
    }

    // 2. Criterio de agilidad y tiempo
    const tiempoRef = (defNivel && defNivel.tiempo) ? defNivel.tiempo : 60;
    if (segundos <= Math.round(tiempoRef * 0.6)) {
        nota += 2; // Rápido (+2)
    } else if (segundos <= Math.round(tiempoRef * 0.85)) {
        nota += 1; // Adecuado (+1)
    }

    // 3. Desafío del Saber (pregunta contextualizada de Ica)
    if (preguntaCorrecta === true) {
        nota += 1; // Acertó (+1)
    } else if (preguntaCorrecta === false) {
        nota -= 1; // Erró (-1)
    }

    // Acotar rigurosamente entre 11 y 20 para niveles superados
    return Math.max(11, Math.min(20, Math.round(nota)));
}

/**
 * Escala Cualitativa MINEDU (Perú) para notas de 1 al 20:
 * - 18 a 20: AD (Logro Destacado)
 * - 14 a 17: A  (Logro Esperado)
 * - 11 a 13: B  (En Proceso)
 * - 01 a 10: C  (En Inicio)
 */
function obtenerEscalaMINEDU(nota) {
    const n = Math.max(1, Math.min(20, Math.round(Number(nota) || 1)));
    if (n >= 18) {
        return { literal: 'AD', descripcion: 'Logro Destacado', color: '#16A34A', bg: '#DCFCE7', borde: '#86EFAC' };
    }
    if (n >= 14) {
        return { literal: 'A', descripcion: 'Logro Esperado', color: '#2563EB', bg: '#DBEAFE', borde: '#93C5FD' };
    }
    if (n >= 11) {
        return { literal: 'B', descripcion: 'En Proceso', color: '#D97706', bg: '#FEF3C7', borde: '#FDE68A' };
    }
    return { literal: 'C', descripcion: 'En Inicio', color: '#DC2626', bg: '#FEE2E2', borde: '#FCA5A5' };
}

/** Criterios explicados para la vista previa del nivel */
function obtenerCriteriosNivel(defNivel) {
    const tiempo3 = Math.round(defNivel.tiempo * 0.6);
    return [
        'Nivel 1: Completar todos los retos de la misión',
        `Nivel 2: Máximo ${defNivel.err2} ${defNivel.err2 === 1 ? 'error' : 'errores'}`,
        `Nivel 3: ${defNivel.err3 === 0 ? 'Sin errores' : `Máx. ${defNivel.err3} error`} y en menos de ${formatearTiempo(tiempo3)}`
    ];
}

// Medallas disponibles (14 en total con id vector)
const CATALOGO_MEDALLAS = [
    { id: 'PRIMERA_MISION', nombre: 'Primera Misión', desc: 'Supera con éxito tu primer nivel.', color: '#23786A', iconoId: 'meta' },
    { id: 'EXPLORADOR', nombre: 'Explorador', desc: 'Participa en los 4 minijuegos ambientales.', color: '#7C4DFF', iconoId: 'brujula' },
    { id: 'TRES_ESTRELLAS', nombre: 'Desempeño Óptimo', desc: 'Alcanza 3 estrellas en cualquier nivel.', color: '#FFB300', iconoId: 'estrella' },
    { id: 'COMBO', nombre: 'Máxima Precisión', desc: 'Alcanza un combo consecutivo de 5x.', color: '#F2A93B', iconoId: 'fuego' },
    { id: 'PERFECTO', nombre: 'Ronda Impecable', desc: 'Supera un nivel sin cometer ningún error.', color: '#2E9455', iconoId: 'destello' },
    { id: 'SABIO', nombre: 'Conocedor Ambiental', desc: 'Responde correctamente 5 preguntas de desafío.', color: '#3C8DC5', iconoId: 'libro' },
    { id: 'RECICLADOR', nombre: 'Reciclador Ejemplar', desc: 'Supera los 10 niveles de Limpieza Monstruosa.', color: '#23786A', iconoId: 'reciclaje' },
    { id: 'GUARDIAN', nombre: 'Protector del Agua', desc: 'Supera los 10 niveles de Guardián del Agua.', color: '#2E80A8', iconoId: 'agua' },
    { id: 'CAZAVATIOS', nombre: 'Eficiencia Eléctrica', desc: 'Supera los 10 niveles de Apaga y Ahorra.', color: '#DFA855', iconoId: 'energia' },
    { id: 'MANO_VERDE', nombre: 'Cuidador Botánico', desc: 'Supera los 10 niveles de Sembradores del Verde.', color: '#4E9A45', iconoId: 'planta' },
    { id: 'CIEN_LITROS', nombre: '100 Litros Preservados', desc: 'Acumula un ahorro hídrico de 100 litros.', color: '#2479A8', iconoId: 'gota' },
    { id: 'CONSTANTE', nombre: 'Constancia Escolar', desc: 'Completa 20 partidas registradas.', color: '#C0453F', iconoId: 'medalla' },
    { id: 'COLECCIONISTA', nombre: 'Gran Coleccionista', desc: 'Acumula 60 estrellas en tu perfil.', color: '#E0A800', iconoId: 'estrellas' },
    { id: 'ECO_HEROE', nombre: 'Eco-Líder Regional', desc: 'Supera los 40 niveles de la suite completa.', color: '#FF7043', iconoId: 'corona' }
];

// Accesorios de personalización
const CATALOGO_ACCESORIOS = [
    { id: 'NINGUNO', nombre: 'Estándar', precio: 0, iconoId: 'persona' },
    { id: 'GORRA', nombre: 'Gorra deportiva roja', precio: 80, iconoId: 'gorra' },
    { id: 'LENTES', nombre: 'Lentes de protección solar', precio: 120, iconoId: 'lentes' },
    { id: 'AUDIFONOS', nombre: 'Audífonos de diadema', precio: 160, iconoId: 'audifonos' },
    { id: 'SOMBRERO', nombre: 'Sombrero de ala ancha', precio: 220, iconoId: 'sombrero' },
    { id: 'CAPA', nombre: 'Capa protectora', precio: 320, iconoId: 'capa' },
    { id: 'CORONA', nombre: 'Corona de hojas de laurel', precio: 500, iconoId: 'corona' },
    { id: 'VISERA', nombre: 'Visera atlética', precio: 90, iconoId: 'visera' }
];

const COLORES_POLO = [
    { id: 0, nombre: 'Blanco Colegio', color: '#FFFFFF', precio: 0 },
    { id: 1, nombre: 'Amarillo Sol de Ica', color: '#FFD84D', precio: 40 },
    { id: 2, nombre: 'Verde Menta Huacachina', color: '#6FCF97', precio: 40 },
    { id: 3, nombre: 'Rojo Granate Pisco', color: '#EB5757', precio: 40 },
    { id: 4, nombre: 'Celeste Océano Pacífico', color: '#56CCF2', precio: 40 },
    { id: 5, nombre: 'Violeta Festivo San Juan', color: '#BB6BD9', precio: 40 }
];

// Exportar al ámbito global para navegadores
window.JUEGOS = JUEGOS;
window.CATALOGO_MEDALLAS = CATALOGO_MEDALLAS;
window.CATALOGO_ACCESORIOS = CATALOGO_ACCESORIOS;
window.COLORES_POLO = COLORES_POLO;
window.formatearTiempo = formatearTiempo;
window.calcularEstrellas = calcularEstrellas;
window.calcularNotaVigesimal = calcularNotaVigesimal;
window.obtenerEscalaMINEDU = obtenerEscalaMINEDU;
window.obtenerCriteriosNivel = obtenerCriteriosNivel;
