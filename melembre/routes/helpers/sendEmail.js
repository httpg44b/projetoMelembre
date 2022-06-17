const nodemailer = require('nodemailer');
const SMTP_CONFIG = require('./smtp');

const transporter = nodemailer.createTransport({
    host: SMTP_CONFIG.host,
    port: SMTP_CONFIG.port,
    secure: false,
    auth: {
        user: SMTP_CONFIG.user,
        pass: SMTP_CONFIG.pass,
    },
    tls: {
        rejectUnauthorized:false,
    },
});

function sendEmail(email, name, password) {
    transporter.sendMail({
        subject: 'Password Me Lembre',
        from:    'Suporte Me lembre <suportemelembre@gmail.com>',
        to:      email,
        html: `
        <html>
           <body>
              <p>Olá, ${name}. Tudo bem?</p>
              <p>Sua senha de acesso ao me lembre é: <strong>${password}</strong></p>
              <img src="https://yt3.ggpht.com/bXovdjHUP8TopZ8yonazTU5zD03-exQKCNRjnjhP7adnwh3SQr3284ldEfRRINTH0JUFO2uA_tQ=s600-c-k-c0x00ffffff-no-rj-rp-mo" 
              style = "border-radius: 50px"
              height="300px" width="300px"/>
           </body>
        </html>
        `
    });
}

module.exports = sendEmail;