const schedule = require('node-schedule');
const mailer = require('./mailer');
const customerSchema = require("../app/models/Customer")

// Hàm gửi email nhắc nhở
const sendReminderEmail = async (contract) => {
  const { khachhang } = contract;
  const customer = await customerSchema.findById(khachhang, "name email")

  const dateObj = new Date(contract.ngayketthuc);
  const day = dateObj.getUTCDate();
  const month = dateObj.getUTCMonth() + 1;
  const year = dateObj.getUTCFullYear();
  const formattedString = `${day}-${month}-${year}`;

  if (customer.email) {
    const emailContent = `<p>Xin chào ${customer.name},</p><p>Đây là email nhắc nhở về hợp đồng của bạn sẻ đến hạng vào ngày ${formattedString}.</p>`;
    mailer.sendMail(customer.email, 'Nhắc nhở hợp đồng hết hạn', emailContent)
      .then(() => {
        console.log('Email nhắc nhở đã được gửi thành công');
      })
      .catch((error) => {
        console.error('Lỗi khi gửi email nhắc nhở:', error);
      });
  }
};

// Lên lịch công việc
const scheduleReminder = (contract) => {
  const { ngayketthuc } = contract;

  // Xác định thời điểm nhắc nhở (trước 3 ngày)
  const reminderDate = new Date(ngayketthuc);
  reminderDate.setDate(reminderDate.getDate() - 3);

  // Lên lịch công việc gửi email
  schedule.scheduleJob(reminderDate, () => {
    sendReminderEmail(contract);
  });

  console.log('Công việc gửi email nhắc nhở đã được lên lịch');
};

module.exports = scheduleReminder