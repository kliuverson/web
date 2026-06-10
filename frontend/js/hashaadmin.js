// hashAdmin.js
// Ejecuta con: node hashAdmin.js
const bcrypt = require('bcrypt');

const contrasena = '051304f@#'; // tu contraseña actual

bcrypt.hash(contrasena, 10).then(hash => {
  console.log('Hash generado:');
  console.log(hash);
  console.log('\nEjecuta este SQL en phpMyAdmin:');
  console.log(`UPDATE usuarios SET contrasena = '${hash}' WHERE correo = 'admin@ferremateriales.com';`);
});