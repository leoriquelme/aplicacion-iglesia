// Novedades de la app: salen primero en el cuadro de Inicio, durante DIAS_NOVEDAD días desde su fecha.
// Para anunciar un cambio nuevo, agrega una entrada ARRIBA (la más nueva primero) con un id que no se repita.
// fecha = 'AAAA-MM-DD'. to y boton son opcionales (a dónde lleva el botón).

export const NOVEDADES = [
  {
    id: 'n-2026-11-28-orden-derecha', fecha: '2026-11-28', icono: 'music',
    titulo: 'Orden de la canción a la derecha',
    texto: 'Al editar el orden de una canción (lápiz junto a los círculos), el orden sale a la derecha de la letra y ya no queda tapado. Toca una parte (Verso, Coro…) para sumarla al final.',
  },
  {
    id: 'n-2026-11-27-directorio', fecha: '2026-11-27', icono: 'users', to: '/congrega/mificha', boton: 'Ir a Mi ficha',
    titulo: 'Directorio de hermanos',
    texto: 'Si quieres, en Mi ficha puedes aparecer en el directorio con tu celular, para que los hermanos te llamen o escriban. Es voluntario.',
  },
  {
    id: 'n-2026-11-27-saludar', fecha: '2026-11-27', icono: 'heart',
    titulo: 'Saludar por WhatsApp',
    texto: 'En Inicio ahora salen también los aniversarios de matrimonio, y con el botón Saludar mandas el mensaje por WhatsApp.',
  },
  {
    id: 'n-2026-11-27-oracion', fecha: '2026-11-27', icono: 'pray', to: '/congrega/oracion', boton: 'Ir a Oración',
    titulo: 'Peticiones de oración',
    texto: 'En Congrega → Oración puedes pedir oración. Tú eliges si la ven solo los pastores o toda la iglesia, y los hermanos tocan "Voy a orar".',
  },
  {
    id: 'n-2026-11-27-agenda', fecha: '2026-11-27', icono: 'calendar', to: '/congrega/agenda', boton: 'Ver agenda',
    titulo: 'Agenda de la iglesia',
    texto: 'Cultos, oración, jóvenes y escuela dominical de los próximos 3 meses. Con un toque los agregas a tu calendario y te avisa antes.',
  },
  {
    id: 'n-2026-11-27-avisos', fecha: '2026-11-27', icono: 'sparkle',
    titulo: 'Avisos de la iglesia',
    texto: 'El Pastor y el Administrador pueden publicar avisos con fecha de término. Salen en el Inicio de Congrega y se comparten por WhatsApp con un toque.',
  },
  {
    id: 'n-2026-11-27-musica', fecha: '2026-11-27', icono: 'music', to: '/musica', boton: 'Escuchar',
    titulo: 'Música de la iglesia',
    texto: 'Escucha durante la semana las canciones del próximo culto, las del último y las que más cantamos, en Spotify o YouTube. También hay un link para mandarlo por WhatsApp a quien no tiene la app.',
  },
  {
    id: 'n-2026-11-27-qr', fecha: '2026-11-27', icono: 'users', to: '/mi-iglesia', boton: 'Ver el QR',
    titulo: 'Invitar con un código QR',
    texto: 'El Administrador puede imprimir un afiche con un QR: los hermanos lo escanean, entran con su cuenta y quedan dentro de la iglesia.',
  },
  {
    id: 'n-2026-11-23-editar-guardar', fecha: '2026-11-23', icono: 'music', to: '/canciones', boton: 'Ver canciones',
    titulo: 'Editar canciones sin miedo',
    texto: 'Al editar una canción, los cambios solo se guardan cuando tocas Listo. Si vuelves atrás, la app te pregunta si quieres descartarlos y la canción queda como estaba.',
  },
  {
    id: 'n-2026-11-23-cumple', fecha: '2026-11-23', icono: 'user', to: '/ajustes/perfil', boton: 'Poner mi fecha',
    titulo: 'Cumpleaños de los hermanos',
    texto: 'Ahora puedes poner tu fecha de nacimiento en tu perfil, y en Inicio aparece quién está de cumpleaños esta semana.',
  },
  {
    id: 'n-2026-11-23-proponer', fecha: '2026-11-23', icono: 'hand', to: '/eventos', boton: 'Ver eventos',
    titulo: 'Te pueden proponer servir',
    texto: 'Los líderes pueden proponerte servir en un evento. Te llega aquí en Inicio y tú aceptas o dices que no puedes.',
  },
  {
    id: 'n-2026-11-23-buscar', fecha: '2026-11-23', icono: 'music', to: '/canciones', boton: 'Probar',
    titulo: 'Buscar por la letra',
    texto: 'El buscador de Canciones ahora también encuentra canciones por una frase de la letra.',
  },
  {
    id: 'n-2026-11-23-oscuro', fecha: '2026-11-23', icono: 'moon', to: '/ajustes', boton: 'Ir a Ajustes',
    titulo: 'Modo oscuro automático',
    texto: 'La app se pone oscura sola cuando tu teléfono está en modo oscuro. En Ajustes puedes elegir Siempre o Nunca.',
  },
  {
    id: 'n-2026-11-23-miembros', fecha: '2026-11-23', icono: 'users', to: '/mi-iglesia/miembros', boton: 'Ver miembros',
    titulo: 'Miembros más fáciles de ver',
    texto: 'La lista de miembros, la participación y el Top repertorio ahora se ven como tarjetas, más cómodas en el celular.',
  },
  {
    id: 'n-2026-11-23-rapida', fecha: '2026-11-23', icono: 'fast',
    titulo: 'La app abre más rápido',
    texto: 'Ahora carga más rápido y, si hay poca señal, muestra la última copia guardada de las canciones.',
  },
  {
    id: 'n-2026-11-23-nombre', fecha: '2026-11-23', icono: 'sparkle',
    titulo: 'Nuevo nombre: Adora',
    texto: 'La app ahora se llama Adora (Beta), con su logo nuevo en la entrada y en el ícono del teléfono.',
  },
];
