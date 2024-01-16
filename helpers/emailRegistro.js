
import nodemailer from 'nodemailer';

const emailRegistro = async (datos) => {

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  // Enviar email
  const { email, nombre, token } = datos;
  const info = await transporter.sendMail({
    from: 'APV-admin',
    to: email,
    subject: 'Confirmacion de cuenta - APV',
    text: 'Confirmacion de cuenta - APV',
    html: `<p> Hola ${nombre}, confirma tu cuenta en APV.</p>
          <p>Tu cuenta se encuentra lista, solo falta confirmarla, puedes hacerlo en el siguiente enlace:
          <a href="${process.env.FRONTEND_URL}/confirmar/${token}">Activar Cuenta</a> </p>

          <p>Si tu no creaste esta cuenta por favor destima este mensaje</p>
    `
  });

  console.log("mensaje enviado: %s", info.messageId);

}

export default emailRegistro