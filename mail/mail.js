const nodemailer =require("nodemailer");
const transporter = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    secure: false,
    auth: {
      user: "7c69842f0fc58f",
      pass: "f0dfe7910c4d64"
    },
    logger: true
  });
 const sendMail = () => {
    let mainOptions = {
      from: 'from_address@example.com',
      to: 'saurabh_rathore@inclusionsoft.com',
      subject: 'Test Email Subject',
      html: '<h1>Order Successful!!!</h1>'
    }
    transporter.sendMail(mainOptions, (err, info) => {
      if (err) {
        console.log(err);
      } else {
        console.log(`mail send ${info.response}`);
      }
    })
  }
  module.exports={sendMail}