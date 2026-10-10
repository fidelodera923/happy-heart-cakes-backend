const AfricasTalking = require('africastalking');

const africastalking = AfricasTalking({
  apiKey: process.env.AT_API_KEY,
  username: process.env.AT_USERNAME
});

const sms = africastalking.SMS;

async function sendAdminOrderSms(order) {
  const to = process.env.ADMIN_SMS_TO || '254713773913';

  const message =
    `New HHC Order ${order.ref || ''}\n` +
    `Customer: ${order.customer || '-'}\n` +
    `Phone: ${order.phone || '-'}\n` +
    `Amount: ${order.amount || '-'}\n` +
    `Payment: ${order.payment || '-'}\n` +
    `Delivery: ${order.deliveryDate || ''} ${order.deliveryTime || ''}\n` +
    `Place: ${order.place || '-'}`;

  try {
    const result = await sms.send({
      to: [to],
      message
    });
    console.log('Admin SMS sent:', JSON.stringify(result));
    return result;
  } catch (err) {
    console.error('Admin SMS failed:', err.message || err);
    // Do not throw — order should still succeed even if SMS fails
    return null;
  }
}

module.exports = { sendAdminOrderSms };