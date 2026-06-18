const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/user.model');
const { enviarCorreoRecuperacion, enviarCorreoVerificacion } = require('../config/email');

const registro = async (req, res) => {
  try {
    const { nombre, correo, contrasena, telefono, documento } = req.body;

    if (!nombre || !correo || !contrasena) {
      return res.status(400).json({
        error: 'Nombre, correo y contraseña son obligatorios'
      });
    }

    const existe = await User.findByEmail(correo);

    if (existe) {
      return res.status(409).json({
        error: 'El correo ya está registrado'
      });
    }

    const hash = await bcrypt.hash(contrasena, 10);

    const usuario = await User.create({
      nombre,
      correo,
      contrasena: hash,
      telefono,
      documento
    });

    console.log(usuario);

    // Token que recibirá el usuario
    const tokenPlano = crypto.randomBytes(32).toString('hex');

    // Hash que se guarda en BD
    const tokenHash = crypto
      .createHash('sha256')
      .update(tokenPlano)
      .digest('hex');

    // Expira en 24 horas
    const expira = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    );

    await User.setVerificationToken(
      usuario.id,
      tokenHash,
      expira
    );

    const frontendUrl =
      process.env.FRONTEND_URL ||
      'http://localhost:3000';

    const enlace =
      `${frontendUrl}/api/auth/verificar-email?token=${tokenPlano}`;

    await enviarCorreoVerificacion(
      correo,
      nombre,
      enlace
    );

    const token = jwt.sign(
      {
        id: usuario.id,
        correo: usuario.correo,
        rol: 'cliente'
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      mensaje:
        'Usuario registrado correctamente. Revisa tu correo para activar la cuenta.',
      token,
      usuario
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

const login = async (req, res) => {
  try {
    const { correo, contrasena } = req.body;
    if (!correo || !contrasena) {
      return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
    }
    const usuario = await User.findByEmail(correo);
    if (!usuario) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }
    const valido = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!valido) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }

    if (!usuario.email_verificado && usuario.rol !== 'admin') {
      return res.status(403).json({
        error: 'Debes verificar tu correo electrónico antes de iniciar sesión.'
      });
    }

    const token = jwt.sign(
      {
        id: usuario.id_usuario,
        correo: usuario.correo,
        rol: usuario.rol
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    const { contrasena: _, ...datos } = usuario;
    res.json({ mensaje: 'Login exitoso', token, usuario: datos });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const perfil = async (req, res) => {
  try {
    const usuario = await User.findById(req.userId);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(usuario);
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const actualizar = async (req, res) => {
  try {
    const usuario = await User.update(req.userId, req.body);
    res.json({ mensaje: 'Perfil actualizado', usuario });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
};

// ── Solicitar recuperación de contraseña ──
// Recibe el correo, genera un token temporal y envía el enlace por email.
// Siempre responde con el mismo mensaje exista o no el correo, para no revelar
// si una dirección está registrada (medida de seguridad estándar).
const olvidoContrasena = async (req, res) => {
  try {
    const { correo } = req.body;
    if (!correo) {
      return res.status(400).json({ error: 'El correo es obligatorio' });
    }

    const mensajeGenerico = {
      mensaje: 'Si el correo está registrado, te enviamos un enlace para restablecer tu contraseña.',
    };

    const usuario = await User.findByEmail(correo);
    if (!usuario) {
      // No revelamos que el correo no existe
      return res.json(mensajeGenerico);
    }

    // Token aleatorio que se envía al usuario (no se guarda en texto plano)
    const tokenPlano = crypto.randomBytes(32).toString('hex');
    // Hash del token, esto es lo que se guarda en la base de datos
    const tokenHash = crypto.createHash('sha256').update(tokenPlano).digest('hex');
    // Expira en 1 hora
    const expira = new Date(Date.now() + 60 * 60 * 1000);

    await User.setResetToken(correo, tokenHash, expira);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const enlace = `${frontendUrl}/pages/restablecer-contrasena.html?token=${tokenPlano}`;

    await enviarCorreoRecuperacion(usuario.correo, usuario.nombre, enlace);

    res.json(mensajeGenerico);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// ── Restablecer contraseña con el token recibido por correo ──
const restablecerContrasena = async (req, res) => {
  try {
    const { token, nuevaContrasena } = req.body;

    if (!token || !nuevaContrasena) {
      return res.status(400).json({ error: 'Token y nueva contraseña son obligatorios' });
    }
    if (nuevaContrasena.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const usuario = await User.findByResetToken(tokenHash);

    if (!usuario) {
      return res.status(400).json({ error: 'El enlace es inválido o ya expiró. Solicita uno nuevo.' });
    }

    const hash = await bcrypt.hash(nuevaContrasena, 10);
    await User.updatePassword(usuario.id_usuario, hash);

    res.json({ mensaje: 'Contraseña actualizada correctamente. Ya puedes iniciar sesión.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const verificarEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).send('Token inválido');
    }

    const tokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const usuario = await User.findByVerificationToken(tokenHash);

    if (!usuario) {
      return res.status(400).send('El enlace es inválido o ha expirado.');
    }

    await User.verifyEmail(usuario.id_usuario);

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

res.send(`
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>Correo verificado</title>

<style>
*{
    margin:0;
    padding:0;
    box-sizing:border-box;
    font-family:Arial, Helvetica, sans-serif;
}

body{
    background:linear-gradient(135deg,#111,#1b1b1b,#0d0d0d);
    display:flex;
    justify-content:center;
    align-items:center;
    height:100vh;
    overflow:hidden;
}

.card{
    background:#fff;
    width:420px;
    max-width:90%;
    border-radius:20px;
    padding:40px;
    text-align:center;
    box-shadow:0 20px 60px rgba(0,0,0,.35);
    animation:mostrar .6s ease;
}

.icono{
    width:100px;
    height:100px;
    margin:auto;
    background:#27ae60;
    border-radius:50%;
    display:flex;
    justify-content:center;
    align-items:center;
    font-size:55px;
    color:white;
    animation:pop .5s ease;
}

h1{
    margin-top:25px;
    color:#222;
    font-size:28px;
}

p{
    margin-top:15px;
    color:#666;
    line-height:1.6;
    font-size:16px;
}

.contador{
    margin-top:25px;
    color:#ff6b00;
    font-weight:bold;
    font-size:18px;
}

.loader{
    width:100%;
    height:6px;
    background:#eee;
    border-radius:20px;
    overflow:hidden;
    margin-top:25px;
}

.loader span{
    display:block;
    height:100%;
    background:#ff6b00;
    animation:carga 2s linear forwards;
}

@keyframes carga{
    from{width:0%;}
    to{width:100%;}
}

@keyframes mostrar{
    from{
        opacity:0;
        transform:translateY(25px);
    }
    to{
        opacity:1;
        transform:translateY(0);
    }
}

@keyframes pop{
    0%{
        transform:scale(.2);
    }
    70%{
        transform:scale(1.15);
    }
    100%{
        transform:scale(1);
    }
}
</style>

</head>

<body>

<div class="card">

    <div class="icono">
        ✓
    </div>

    <h1>¡Correo verificado!</h1>

    <p>
        Tu cuenta de <strong>Ferremateriales</strong> ha sido activada correctamente.
        Ya puedes iniciar sesión.
    </p>

    <div class="loader">
        <span></span>
    </div>

    <div class="contador">
        Redirigiendo al inicio de sesión en
        <span id="segundos">2</span>s...
    </div>

</div>

<script>

let segundos = 2;

const contador = document.getElementById("segundos");

const intervalo = setInterval(() => {
    segundos--;
    contador.textContent = segundos;

    if(segundos <= 0){
        clearInterval(intervalo);
        window.location.href = "${frontendUrl}/pages/login.html";
    }

},1000);

</script>

</body>
</html>
`);

  } catch (err) {
    console.error(err);
    res.status(500).send('Error interno del servidor');
  }
};

module.exports = {
  registro,
  login,
  perfil,
  actualizar,
  olvidoContrasena,
  restablecerContrasena,
  verificarEmail
};

