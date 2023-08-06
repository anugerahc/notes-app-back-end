const nodemailer = require('nodemailer');

class MailSender {
    constructor() {
        this._transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            auth: {
                user: process.env.SMTP_USERNAME,
                pass: process.env.SMTP_PASSWORD,
            },
        }); 
    }

    sendEmail(targetEmail, content) {
        const message = {
            from: 'Notes Apps',
            to: targetEmail,
            subject: 'Export Catatan',
            text: 'Terlampir hasil data Catatan',
            attachments: [
                {
                    filename: 'notes.json',
                    content,
                },
            ],
        };

        return this._transporter.sendMail(message);
    };

    
}

module.exports = MailSender;
