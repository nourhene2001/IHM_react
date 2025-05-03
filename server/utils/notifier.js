// utils/notifier.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendNotification = async (to, subject, text, date = new Date()) => {
  const formattedDate = date.toLocaleString('en-US', {
    timeZone: 'UTC',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).replace(',', '');
  const notificationText = `${text}\nDate: ${formattedDate}`;
  
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    text: notificationText,
  });
};

module.exports = { sendNotification };