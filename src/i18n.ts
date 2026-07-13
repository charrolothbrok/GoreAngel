export type Lang = 'es' | 'en'

export type Dict = Record<string, string>

// Textos fijos de la interfaz (los que escriben los novios en el admin
// se quedan como los pusieron; esto traduce solo las etiquetas del sitio).
export const translations: Record<Lang, Dict> = {
  es: {
    welcome_open: 'Abrir invitación',
    welcome_hint: 'Toca para abrir',
    fecha: '22 de Agosto, 2026',

    hero_eyebrow: 'Nuestra boda',

    intro_eyebrow: 'Comienza la cuenta',
    intro_texto_default:
      'Después de un camino juntos, hemos decidido unir nuestras vidas. Nos encantaría que seas parte de este día.',

    cd_dias: 'Días',
    cd_horas: 'Horas',
    cd_min: 'Minutos',
    cd_seg: 'Segundos',

    gallery_eyebrow: 'Nosotros',
    gallery_title: 'Nuestra historia en imágenes',
    gallery_empty_eyebrow: 'Galería',
    gallery_empty_text: 'Pronto compartiremos aquí nuestras fotografías favoritas.',

    detalles_eyebrow: 'El gran día',
    detalles_title: 'Detalles del evento',
    ceremonia: 'Ceremonia',
    recepcion: 'Recepción',
    como_llegar: 'Cómo llegar →',
    lugar_ph: 'Por confirmar',
    foto_lugar_ph: 'Imagen del lugar',

    itin_eyebrow: 'Cronograma',
    itin_title: 'Itinerario del día',

    dress_eyebrow: 'Código de vestimenta',

    gifts_eyebrow: 'Con cariño',
    gifts_title: 'Mesa de regalos',
    gifts_listas_title: 'Listas de regalo',
    gifts_listas_sub: 'Ver tiendas',
    gifts_enviar_title: 'Enviar un regalo',
    gifts_enviar_sub: 'Datos para depósito',
    gifts_intro_default:
      'Tu presencia es nuestro mejor regalo. Pero si deseas tener un detalle con nosotros, aquí te dejamos algunas opciones con todo el cariño.',
    gifts_empty: 'Pronto compartiremos aquí los detalles.',
    gifts_tab_listas: 'Listas',
    gifts_tab_deposito: 'Depósito',
    gifts_copiar: 'Copiar',
    gifts_copiado: '✓ Copiado',
    gifts_ver_lista: 'Ver lista',
    gift_banco: 'Banco',
    gift_titular: 'Titular',
    gift_cuenta: 'Cuenta',
    gift_clabe: 'CLABE',
    gift_concepto: 'Concepto',
    gifts_aviso_label: '¿Nos avisas de tu regalo? (opcional)',
    gifts_aviso_nombre: 'Tu nombre *',
    gifts_aviso_metodo: 'Método',
    gifts_aviso_monto: 'Monto (opcional)',
    gifts_aviso_msg: 'Un mensaje para los novios…',
    gifts_aviso_btn: 'Avisar de mi regalo',
    gifts_aviso_enviando: 'Enviando…',
    gifts_aviso_ok: '¡Gracias por avisarnos! Lo recibimos con mucho cariño. 💚',
    gifts_aviso_err_nombre: 'Por favor escribe tu nombre.',
    gifts_aviso_err_envio: 'No se pudo enviar. Inténtalo de nuevo.',

    rsvp_eyebrow: 'Confirma tu lugar',
    rsvp_title: '¿Nos acompañas?',
    rsvp_sub: 'Te pedimos confirmar tu asistencia antes del 1.º de Agosto.',
    rsvp_nombre: 'Nombre o familia *',
    rsvp_nombre_ph: 'Ej. Familia Torres',
    rsvp_lado: '¿Invitado de…?',
    rsvp_tel: 'WhatsApp / Teléfono',
    rsvp_asistir: '¿Asistirás?',
    rsvp_si: 'Sí, con gusto',
    rsvp_no: 'No podré',
    rsvp_personas: 'Número de personas',
    rsvp_restriccion: 'Restricción alimentaria',
    rsvp_restriccion_ph: 'Vegetariano, alergias, ninguna…',
    rsvp_mensaje: 'Mensaje para los novios',
    rsvp_mensaje_ph: 'Un mensaje con cariño…',
    rsvp_btn: 'Confirmar asistencia',
    rsvp_enviando: 'Enviando…',
    rsvp_gracias: '¡Gracias',
    rsvp_ok_si: 'Hemos recibido tu confirmación. ¡No podemos esperar a celebrar contigo!',
    rsvp_ok_no: 'Lamentamos que no puedas acompañarnos. Gracias por avisarnos con cariño.',
    rsvp_err_nombre: 'Por favor escribe tu nombre o el de tu familia.',
    rsvp_err_envio: 'Ocurrió un error al enviar. Inténtalo de nuevo.',

    music_play: 'Reproducir música',
    music_pause: 'Pausar música',
  },
  en: {
    welcome_open: 'Open invitation',
    welcome_hint: 'Tap to open',
    fecha: 'August 22, 2026',

    hero_eyebrow: 'Our wedding',

    intro_eyebrow: 'The countdown begins',
    intro_texto_default:
      'After a journey together, we have decided to unite our lives. We would love for you to be part of this day.',

    cd_dias: 'Days',
    cd_horas: 'Hours',
    cd_min: 'Minutes',
    cd_seg: 'Seconds',

    gallery_eyebrow: 'Us',
    gallery_title: 'Our story in pictures',
    gallery_empty_eyebrow: 'Gallery',
    gallery_empty_text: 'We will soon share our favorite photographs here.',

    detalles_eyebrow: 'The big day',
    detalles_title: 'Event details',
    ceremonia: 'Ceremony',
    recepcion: 'Reception',
    como_llegar: 'Get directions →',
    lugar_ph: 'To be confirmed',
    foto_lugar_ph: 'Venue photo',

    itin_eyebrow: 'Schedule',
    itin_title: 'Itinerary of the day',

    dress_eyebrow: 'Dress code',

    gifts_eyebrow: 'With love',
    gifts_title: 'Gift registry',
    gifts_listas_title: 'Gift registries',
    gifts_listas_sub: 'View stores',
    gifts_enviar_title: 'Send a gift',
    gifts_enviar_sub: 'Deposit details',
    gifts_intro_default:
      'Your presence is our greatest gift. But if you wish to give us something, here are a few options, with all our love.',
    gifts_empty: 'We will share the details here soon.',
    gifts_tab_listas: 'Registries',
    gifts_tab_deposito: 'Deposit',
    gifts_copiar: 'Copy',
    gifts_copiado: '✓ Copied',
    gifts_ver_lista: 'View list',
    gift_banco: 'Bank',
    gift_titular: 'Account holder',
    gift_cuenta: 'Account',
    gift_clabe: 'CLABE',
    gift_concepto: 'Reference',
    gifts_aviso_label: 'Let us know about your gift? (optional)',
    gifts_aviso_nombre: 'Your name *',
    gifts_aviso_metodo: 'Method',
    gifts_aviso_monto: 'Amount (optional)',
    gifts_aviso_msg: 'A message for the couple…',
    gifts_aviso_btn: 'Notify my gift',
    gifts_aviso_enviando: 'Sending…',
    gifts_aviso_ok: 'Thank you for letting us know! We receive it with much love. 💚',
    gifts_aviso_err_nombre: 'Please enter your name.',
    gifts_aviso_err_envio: 'Could not send. Please try again.',

    rsvp_eyebrow: 'Confirm your place',
    rsvp_title: 'Will you join us?',
    rsvp_sub: 'Please confirm your attendance before August 1st.',
    rsvp_nombre: 'Name or family *',
    rsvp_nombre_ph: 'E.g. The Torres Family',
    rsvp_lado: 'Guest of…?',
    rsvp_tel: 'WhatsApp / Phone',
    rsvp_asistir: 'Will you attend?',
    rsvp_si: 'Yes, gladly',
    rsvp_no: "I can't make it",
    rsvp_personas: 'Number of guests',
    rsvp_restriccion: 'Dietary restriction',
    rsvp_restriccion_ph: 'Vegetarian, allergies, none…',
    rsvp_mensaje: 'Message for the couple',
    rsvp_mensaje_ph: 'A heartfelt message…',
    rsvp_btn: 'Confirm attendance',
    rsvp_enviando: 'Sending…',
    rsvp_gracias: 'Thank you',
    rsvp_ok_si: "We've received your confirmation. We can't wait to celebrate with you!",
    rsvp_ok_no: "We're sorry you can't join us. Thank you for kindly letting us know.",
    rsvp_err_nombre: 'Please enter your name or your family name.',
    rsvp_err_envio: 'Something went wrong. Please try again.',

    music_play: 'Play music',
    music_pause: 'Pause music',
  },
}

export function getLang(url: URL): Lang {
  return url.searchParams.get('lang') === 'en' ? 'en' : 'es'
}
