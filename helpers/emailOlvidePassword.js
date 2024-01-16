
import nodemailer from 'nodemailer';

const emailOlvideContraseña = async (datos) => {

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
        subject: 'Reestablecer contraseña',
        text: 'Reestablecer contraseña',
        html: `<p> Hola ${nombre}, has solicitado reestablecer tu contraseña en APV.</p>

          <p>Haz click en el siguiente enlace para reestablecer tu constraseña:
          <a href="${process.env.FRONTEND_URL}/olvide-password/${token}">Reestablecer contraseña</a> </p>

          <p>Si tu no creaste esta cuenta por favor destima este mensaje</p>
    `
    });

    console.log("mensaje enviado: %s", info.messageId);

}

export default emailOlvideContraseña;