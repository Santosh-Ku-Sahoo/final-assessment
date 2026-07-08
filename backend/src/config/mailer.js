const nodemailer = require('nodemailer');

let transporter;

const initMailer = async () => {

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: parseInt(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    console.log('Nodemailer configured with environment SMTP server');
  } else {

    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log('----------------------------------------------------');
      console.log('Nodemailer Ethereal mock SMTP account generated:');
      console.log(`User: ${testAccount.user}`);
      console.log(`Pass: ${testAccount.pass}`);
      console.log('All sent emails will output a preview URL to the server console.');
      console.log('----------------------------------------------------');
    } catch (err) {
      console.error('Failed to create Nodemailer test account, emails will be logged to console only:', err.message);

      transporter = {
        sendMail: async (mailOptions) => {
          console.log('\n--- MOCK EMAIL ---');
          console.log(`To: ${mailOptions.to}`);
          console.log(`Subject: ${mailOptions.subject}`);
          console.log(`Body: ${mailOptions.text || mailOptions.html}`);
          console.log('------------------\n');
          return { messageId: 'console-mock-' + Date.now() };
        }
      };
    }
  }
};

const sendMail = async ({ to, subject, text, html }) => {
  if (!transporter) {
    await initMailer();
  }

  try {
    const info = await transporter.sendMail({
      from: '"Visitor Pass System" <no-reply@visitorpass.com>',
      to,
      subject,
      text,
      html,
    });


    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`Email sent: ${info.messageId}`);
      console.log(`Preview URL: ${previewUrl}`);
    }
    return info;
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error.message);
    throw error;
  }
};

module.exports = { initMailer, sendMail };
