import nodemailer, { Transporter } from 'nodemailer';
import { config } from '../config/environment';

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (!config.smtp.host || !config.smtp.user || !config.smtp.password) {
    console.warn('[EmailService] SMTP no configurado. Los correos no se enviarán.');
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.password,
      },
    });
  }

  return transporter;
}

interface EnvioEmail {
  destinatarios: string[];
  asunto: string;
  html: string;
}

const REINTENTOS_MS = [0, 5 * 60 * 1000, 30 * 60 * 1000, 2 * 60 * 60 * 1000];

async function enviarConReintentos(mensaje: EnvioEmail, intento = 0): Promise<void> {
  const transport = getTransporter();
  if (!transport) return;

  try {
    await transport.sendMail({
      from: `"${config.smtp.fromName}" <${config.smtp.fromEmail}>`,
      to: mensaje.destinatarios.join(', '),
      subject: mensaje.asunto,
      html: mensaje.html,
    });
  } catch (error) {
    console.error(`[EmailService] Fallo al enviar correo (intento ${intento + 1}):`, error);

    if (intento + 1 < REINTENTOS_MS.length) {
      const espera = REINTENTOS_MS[intento + 1];
      setTimeout(() => {
        enviarConReintentos(mensaje, intento + 1);
      }, espera);
    } else {
      console.error('[EmailService] Todos los reintentos fallaron para:', mensaje.asunto);
      if (config.smtp.adminEmails.length > 0) {
        transport
          .sendMail({
            from: `"${config.smtp.fromName}" <${config.smtp.fromEmail}>`,
            to: config.smtp.adminEmails.join(', '),
            subject: '[ALERTA] Fallo de envío de correo',
            html: `<p>El envío del correo "${mensaje.asunto}" falló tras 4 intentos.</p>`,
          })
          .catch(() => undefined);
      }
    }
  }
}

export function notificarBloqueoRegistrado(data: {
  numeroTelefono: string;
  razon: string;
  reportadoPor: string;
  fechaBloqueo: Date;
  fechaExpiracion: Date;
}): void {
  if (config.smtp.adminEmails.length === 0) return;

  const zonaHoraria = { timeZone: 'America/Guatemala' } as const;
  const fechaBloqueo = data.fechaBloqueo.toLocaleString('es-GT', zonaHoraria);
  const fechaExpiracion = data.fechaExpiracion.toLocaleString('es-GT', zonaHoraria);

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
      <div style="background:#111111; padding:16px; text-align:center;">
        <span style="color:#F4B400; font-weight:bold; font-size:18px;">Bomberos Voluntarios</span>
      </div>
      <div style="border:1px solid #eee; border-top:4px solid #C8102E; padding:24px;">
        <h2 style="color:#C8102E; margin-top:0;">Número Bloqueado por 48 Horas</h2>
        <p>Un bombero registró un número como llamada falsa/broma y se solicitó su bloqueo:</p>
        <table style="width:100%; border-collapse: collapse;">
          <tr><td style="padding:6px 0; vertical-align:top;"><strong>📞 Número:</strong></td><td>${data.numeroTelefono}</td></tr>
          <tr><td style="padding:6px 0; vertical-align:top;"><strong>📝 Razón:</strong></td><td>${data.razon}</td></tr>
          <tr><td style="padding:6px 0; vertical-align:top;"><strong>👤 Reportado por:</strong></td><td>${data.reportadoPor}</td></tr>
          <tr><td style="padding:6px 0; vertical-align:top;"><strong>📅 Fecha de bloqueo:</strong></td><td>${fechaBloqueo}</td></tr>
          <tr><td style="padding:6px 0; vertical-align:top;"><strong>⏳ Bloqueado hasta:</strong></td><td>${fechaExpiracion}</td></tr>
        </table>
        <p style="margin-top:16px;">El bloqueo vence automáticamente 48 horas después de haberse registrado.</p>
      </div>
      <p style="text-align:center; color:#888; font-size:12px; margin-top:16px;">Sistema de Bomberos Voluntarios</p>
    </div>
  `;

  enviarConReintentos({
    destinatarios: config.smtp.adminEmails,
    asunto: `[Bomberos Voluntarios] Número bloqueado 48h: ${data.numeroTelefono}`,
    html,
  });
}

export function enviarCredencialesIniciales(data: {
  email: string;
  nombre: string;
  passwordTemporal: string;
}): void {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
      <div style="background:#111111; padding:16px; text-align:center;">
        <span style="color:#F4B400; font-weight:bold; font-size:18px;">Bomberos Voluntarios</span>
      </div>
      <div style="border:1px solid #eee; border-top:4px solid #C8102E; padding:24px;">
        <h2 style="color:#C8102E; margin-top:0;">Bienvenido(a), ${data.nombre}</h2>
        <p>Se ha creado una cuenta para ti en el Sistema de Registro de Llamadas Falsas.</p>
        <p><strong>Correo:</strong> ${data.email}<br/>
           <strong>Contraseña temporal:</strong> ${data.passwordTemporal}</p>
        <p>Por seguridad, cambia tu contraseña en tu primer inicio de sesión.</p>
      </div>
    </div>
  `;

  enviarConReintentos({
    destinatarios: [data.email],
    asunto: '[Bomberos Voluntarios] Tu cuenta ha sido creada',
    html,
  });
}
