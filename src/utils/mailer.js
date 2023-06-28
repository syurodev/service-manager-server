const nodeMailer = require('nodemailer');

exports.sendMail = (to, subject, htmlContent) => {
  const transport = nodeMailer.createTransport({
    service: "gmail",
    auth: {
      user: "z0093394@gmail.com",
      pass: "eijlgwjptcgnnqzj",
    }
  })

  const options = {
    from: "z0093394@gmail.com",
    to: to,
    subject: subject,
    html: htmlContent
  }
  return transport.sendMail(options);
}