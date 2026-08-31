const nodemailer = require('nodemailer')

const isLocalDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV === 'development'

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
  tls: isLocalDevelopment ? { rejectUnauthorized: false } : undefined,
})

async function sendEmail({ to, subject, text }) {
  return transporter.sendMail({
    from: process.env.EMAIL,
    to,
    subject,
    text,
  })
}

sendEmail.getTransportOptions = () => transporter.options

module.exports = sendEmail