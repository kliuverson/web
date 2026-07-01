const nodemailer = require('nodemailer');

// Transportador de correo usando Gmail.
// EMAIL_USER y EMAIL_PASS se configuran en el archivo .env
// EMAIL_PASS debe ser una "contraseña de aplicación" de Gmail, NO la contraseña normal de la cuenta.
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Envía el correo de recuperación de contraseña con el enlace para restablecerla
const enviarCorreoRecuperacion = async (correoDestino, nombre, enlace) => {
  const html = `
    <div style="font-family: Arial, sans-serif; background:#111009; padding:32px; color:#f0ece0;">
      <div style="max-width:480px; margin:0 auto; background:#1a1710; border:1px solid #2e2a20; border-radius:10px; padding:32px;">
        <h2 style="color:#F47B20; margin-top:0;">FERREMATERIALES</h2>
        <p>Hola ${nombre || ''},</p>
        <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta. Si fuiste tú, haz clic en el siguiente botón:</p>
        <p style="text-align:center; margin:28px 0;">
          <a href="${enlace}" style="background:#F47B20; color:#fff; text-decoration:none; padding:14px 28px; border-radius:8px; font-weight:bold; display:inline-block;">
            Restablecer contraseña
          </a>
        </p>
        <p>O copia y pega este enlace en tu navegador:</p>
        <p style="word-break:break-all; color:#888070; font-size:13px;">${enlace}</p>
        <p style="color:#888070; font-size:13px;">Este enlace vencerá en 1 hora. Si no solicitaste este cambio, puedes ignorar este correo; tu contraseña seguirá siendo la misma.</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || `"Ferremateriales" <${process.env.EMAIL_USER}>`,
    to: correoDestino,
    subject: 'Recupera tu contraseña — Ferremateriales',
    html,
  });
};

// Envía el correo de verificación de cuenta
const enviarCorreoVerificacion = async (
  correoDestino,
  nombre,
  enlace
) => {
  const html = `
    <div style="font-family: Arial, sans-serif; background:#111009; padding:32px; color:#f0ece0;">
      <div style="max-width:480px; margin:0 auto; background:#1a1710; border:1px solid #2e2a20; border-radius:10px; padding:32px;">
        <h2 style="color:#F47B20; margin-top:0;">FERREMATERIALES</h2>

        <p>Hola ${nombre || ''},</p>

        <p>
          Gracias por registrarte en Ferremateriales.
          Para activar tu cuenta debes verificar tu correo electrónico.
        </p>

        <p style="text-align:center; margin:28px 0;">
          <a href="${enlace}"
             style="background:#F47B20; color:#fff; text-decoration:none; padding:14px 28px; border-radius:8px; font-weight:bold; display:inline-block;">
            Verificar correo
          </a>
        </p>

        <p>O copia y pega este enlace en tu navegador:</p>

        <p style="word-break:break-all; color:#888070; font-size:13px;">
          ${enlace}
        </p>

        <p style="color:#888070; font-size:13px;">
          Este enlace vencerá en 24 horas.
        </p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || `"Ferremateriales" <${process.env.EMAIL_USER}>`,
    to: correoDestino,
    subject: 'Verifica tu cuenta — Ferremateriales',
    html,
  });
};

// Envía una notificación cuando cambia el estado del pedido
const enviarCorreoEstadoPedido = async (
  correoDestino,
  nombre,
  idPedido,
  estado
) => {

  const estados = {
    pendiente: {
      titulo: '📝 Pedido recibido',
      asunto: 'Tu pedido ha sido recibido',
      mensaje: 'Hemos recibido tu pedido y pronto comenzaremos a procesarlo.'
    },
    procesando: {
      titulo: '⚙️ Pedido en preparación',
      asunto: 'Estamos preparando tu pedido',
      mensaje: 'Nuestro equipo ya está preparando tu pedido.'
    },
    enviado: {
      titulo: '🚚 Pedido enviado',
      asunto: 'Tu pedido fue enviado',
      mensaje: 'Tu pedido ya fue despachado y se encuentra en camino.'
    },
    entregado: {
      titulo: '✅ Pedido entregado',
      asunto: 'Tu pedido fue entregado',
      mensaje: 'El pedido fue marcado como entregado. ¡Esperamos que disfrutes tu compra!'
    },
    cancelado: {
      titulo: '❌ Pedido cancelado',
      asunto: 'Tu pedido fue cancelado',
      mensaje: 'Lamentamos informarte que tu pedido fue cancelado.'
    }
  };

  const info = estados[estado];

  const html = `
    <div style="font-family:Arial,sans-serif;background:#111009;padding:32px;color:#f0ece0;">
      <div style="max-width:520px;margin:auto;background:#1a1710;border:1px solid #2e2a20;border-radius:10px;padding:32px;">

        <h2 style="margin-top:0;color:#F47B20;">
          FERREMATERIALES
        </h2>

        <p>Hola <strong>${nombre}</strong>,</p>

        <h3 style="color:#F47B20;">
          ${info.titulo}
        </h3>

        <p>
          ${info.mensaje}
        </p>

        <div style="
          background:#242018;
          padding:18px;
          border-radius:8px;
          margin:24px 0;
        ">

          <p style="margin:0;">
            <strong>Pedido:</strong>
            #${idPedido}
          </p>

          <p style="margin-top:10px;">
            <strong>Nuevo estado:</strong>

            <span style="
              color:#F47B20;
              font-weight:bold;
            ">
              ${estado.toUpperCase()}
            </span>
          </p>

        </div>

        <p>
          Puedes ingresar a tu cuenta para consultar el estado actualizado.
        </p>

        <hr style="border:none;border-top:1px solid #333;margin:28px 0;">

        <p style="color:#888070;font-size:13px;">
          Gracias por confiar en Ferremateriales.
        </p>

      </div>
    </div>
  `;

  await transporter.sendMail({
    from:
      process.env.EMAIL_FROM ||
      `"Ferremateriales" <${process.env.EMAIL_USER}>`,
    to: correoDestino,
    subject: `${info.asunto} (#${idPedido})`,
    html
  });

};

module.exports = { enviarCorreoRecuperacion, enviarCorreoVerificacion, enviarCorreoEstadoPedido };

