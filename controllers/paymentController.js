const axios = require('axios');
const Order = require('../models/Order');

const getMpesaBaseUrl = () => {
  return process.env.MPESA_ENV === 'production'
    ? 'https://api.safaricom.co.ke'
    : 'https://sandbox.safaricom.co.ke';
};

// Get OAuth access token
async function getAccessToken() {
  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

  const url = `${getMpesaBaseUrl()}/oauth/v1/generate?grant_type=client_credentials`;

  const response = await axios.get(url, {
    headers: {
      Authorization: `Basic ${auth}`
    }
  });

  return response.data.access_token;
}

// Generate password for STK Push
function generatePassword() {
  const shortcode = process.env.MPESA_SHORTCODE;
  const passkey = process.env.MPESA_PASSKEY;
  const timestamp = new Date()
    .toISOString()
    .replace(/[^0-9]/g, '')
    .slice(0, 14); // YYYYMMDDHHmmss

  const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');
  return { password, timestamp };
}

// Format phone to 2547XXXXXXXX
function formatPhone(phone) {
  let p = String(phone).replace(/\D/g, '');
  if (p.startsWith('0')) p = '254' + p.slice(1);
  if (p.startsWith('7')) p = '254' + p;
  if (p.startsWith('+')) p = p.slice(1);
  return p;
}

// @desc    Initiate STK Push
// @route   POST /api/payments/mpesa/stkpush
// @access  Private
exports.stkPush = async (req, res) => {
  try {
    const { phone, amount, orderId, accountReference, description } = req.body;

    if (!phone || !amount) {
      return res.status(400).json({ message: 'Phone and amount are required' });
    }

    const accessToken = await getAccessToken();
    const { password, timestamp } = generatePassword();
    const formattedPhone = formatPhone(phone);

    // Amount must be integer for M-Pesa
    const amountInt = Math.ceil(Number(String(amount).replace(/[^\d.]/g, '')));

    if (!amountInt || amountInt < 1) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const payload = {
      BusinessShortCode: process.env.MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amountInt,
      PartyA: formattedPhone,
      PartyB: process.env.MPESA_SHORTCODE,
      PhoneNumber: formattedPhone,
      CallBackURL: process.env.MPESA_CALLBACK_URL,
      AccountReference: accountReference || 'HappyHeartCakes',
      TransactionDesc: description || 'Cake order payment'
    };

    const url = `${getMpesaBaseUrl()}/mpesa/stkpush/v1/processrequest`;

    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    // Optionally link CheckoutRequestID to order
    if (orderId && response.data.CheckoutRequestID) {
      await Order.findByIdAndUpdate(orderId, {
        mpesaCheckoutId: response.data.CheckoutRequestID,
        payment: 'Pending (M-Pesa)'
      }).catch(() => {});
    }

    res.json({
      message: 'STK push sent. Check your phone to enter M-Pesa PIN.',
      data: response.data
    });
  } catch (error) {
    console.error('STK Push error:', error.response?.data || error.message);
    res.status(500).json({
      message: error.response?.data?.errorMessage || error.message || 'STK Push failed'
    });
  }
};

// @desc    M-Pesa callback
// @route   POST /api/payments/mpesa/callback
// @access  Public (Safaricom calls this)
exports.mpesaCallback = async (req, res) => {
  try {
    console.log('M-Pesa Callback:', JSON.stringify(req.body, null, 2));

    const body = req.body?.Body?.stkCallback;
    if (!body) {
      return res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }

    const resultCode = body.ResultCode;
    const checkoutId = body.CheckoutRequestID;

    if (resultCode === 0) {
      // Payment successful
      const items = body.CallbackMetadata?.Item || [];
      const getItem = (name) => items.find(i => i.Name === name)?.Value;

      const amount = getItem('Amount');
      const mpesaReceipt = getItem('MpesaReceiptNumber');
      const phone = getItem('PhoneNumber');

      // Update order if we stored checkout id
      if (checkoutId) {
        await Order.findOneAndUpdate(
          { mpesaCheckoutId: checkoutId },
          {
            payment: 'Paid (M-Pesa)',
            mpesaReceipt: mpesaReceipt || '',
            status: 'Pending'
          }
        ).catch(() => {});
      }

      console.log('Payment success:', { amount, mpesaReceipt, phone, checkoutId });
    } else {
      console.log('Payment failed/cancelled:', body.ResultDesc);
      if (checkoutId) {
        await Order.findOneAndUpdate(
          { mpesaCheckoutId: checkoutId },
          { payment: 'Pay on Delivery' }
        ).catch(() => {});
      }
    }

    // Always respond 200 to Safaricom
    res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (error) {
    console.error('Callback error:', error.message);
    res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
  }
};