import { config } from './config/environment';
import { buscarPorEmail, crearUsuario } from './models/Usuario';
import { hashPassword, generateRandomPassword } from './utils/passwords';
import { validateEmail, validatePassword } from './utils/validators';
import pool from './config/database';

async function seed() {
  const { nombre, email } = config.superadmin;
  let { password } = config.superadmin;

  if (!validateEmail(email)) {
    console.error('[Seed] SUPERADMIN_EMAIL inválido en .env');
    process.exit(1);
  }

  const existente = await buscarPorEmail(email.toLowerCase().trim());
  if (existente) {
    console.log(`[Seed] Ya existe un usuario con el email ${email}. No se crea de nuevo.`);
    await pool.end();
    return;
  }

  let generada = false;
  if (!password) {
    password = generateRandomPassword();
    generada = true;
  }

  const passwordHash = await hashPassword(password);

  const usuario = await crearUsuario({
    nombre,
    email: email.toLowerCase().trim(),
    passwordHash,
    rol: 'superadmin',
  });

  console.log('[Seed] SuperAdmin creado exitosamente:');
  console.log(`  Email: ${usuario.email}`);
  if (generada) {
    console.log(`  Contraseña temporal generada: ${password}`);
    console.log('  ⚠️  Guarda esta contraseña, no se mostrará de nuevo. Cámbiala en tu primer login.');
  } else {
    console.log('  Contraseña: la definida en SUPERADMIN_PASSWORD (.env)');
    if (!validatePassword(password)) {
      console.log('  ⚠️  Esta contraseña NO cumple la política de seguridad (mayúscula/minúscula/número/especial). Úsala solo para pruebas.');
    }
  }

  await pool.end();
}

seed().catch((err) => {
  console.error('[Seed] Error al crear el SuperAdmin inicial:', err);
  process.exit(1);
});
