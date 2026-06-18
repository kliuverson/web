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

module.exports = { enviarCorreoRecuperacion };

