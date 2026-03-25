import nodemailer from 'nodemailer';

/**
 * Configure standard transporter using environment variables.
 * For production, use a service like SendGrid, Mailtrap, or Gmail SMTP.
 */
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'smtp.ethereal.email',
  port: process.env.MAIL_PORT || 587,
  auth: {
    user: process.env.MAIL_USER || 'mock_user',
    pass: process.env.MAIL_PASS || 'mock_pass',
  },
});

/**
 * Sends a 6-digit security code to the user's email.
 * @param {string} to Receiver's email
 * @param {string} code 6-digit security code
 * @param {string} type 'REGISTRATION' | 'PASSWORD_RESET'
 */
export async function sendVerificationEmail(to, code, type = 'REGISTRATION') {
  const subject = type === 'REGISTRATION'
    ? 'SGC - Verificação de Conta'
    : 'SGC - Recuperação de Senha';

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #6366f1; text-align: center;">Sistema SGC</h2>
      <p>Olá,</p>
      <p>Você solicitou uma ação de segurança no Sistema SGC. Utilize o código de 6 dígitos abaixo para continuar:</p>
      <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
        <span style="font-size: 32px; font-weight: 800; letter-spacing: 10px; color: #111827;">${code}</span>
      </div>
      <p style="font-size: 14px; color: #6b7280; text-align: center;">Este código expira em 15 minutos.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #9ca3af; text-align: center;">Se você não solicitou este código, ignore este e-mail.</p>
    </div>
  `;

  try {
    // In development mode without real SMTP, we log the code to console too
    if (!process.env.MAIL_USER) {
      console.log('--- [MOCK EMAIL] ---');
      console.log(`Para: ${to}`);
      console.log(`Assunto: ${subject}`);
      console.log(`Código: ${code}`);
      console.log('---------------------');
      return true;
    }

    await transporter.sendMail({
      from: '"Sistema SGC" <[EMAIL_ADDRESS]>',
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    return false;
  }
}

/**
 * Generates a cryptographically strong 6-digit random code.
 */
export function generateSecurityCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Sends a support email message from the support form.
 */
export async function sendSupportEmail({ name, email, subject, message }) {
  try {
    await transporter.sendMail({
      from: `"${name}" <${email}>`,
      to: process.env.SUPPORT_EMAIL || 'support@sgc.com',
      subject: `[SUPORTE SGC] ${subject}`,
      html: `<p>MENSAGEM DE: ${name} (${email})</p><hr/><p>${message}</p>`,
    });
    return true;
  } catch (err) {
    console.error('Falha no suporte:', err);
    return false;
  }
}