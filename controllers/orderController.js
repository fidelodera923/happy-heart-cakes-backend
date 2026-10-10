const Order = require('../models/Order');
const { sendAdminOrderSms } = require('../utils/sms');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const {
      customer,
      phone,
      place,
      notes,
      cakeMessage,
      cakeTheme,
      cakeColours,
      deliveryDate,
      deliveryTime,
      rushFee,
      items,
      amount,
      payment
    } = req.body;

    if (!customer || !phone || !place || !deliveryDate || !deliveryTime || !items || !amount) {
      return res.status(400).json({ message: 'Please fill in all required fields' });
    }

    const orderRef = 'HHC-' + Date.now().toString().slice(-6);

    const order = await Order.create({
      user: req.user._id,
      customer,
      phone,
      place,
      notes: notes || '',
      cakeMessage: cakeMessage || '',
      cakeTheme: cakeTheme || '',
      cakeColours: cakeColours || '',
      deliveryDate,
      deliveryTime,
      rushFee: rushFee || 0,
      items,
      amount,
      payment: payment || 'Pay on Delivery',
      ref: orderRef,
      status: 'Pending'
    });

    // Notify admin by SMS (order still succeeds if SMS fails)
    sendAdminOrderSms(order).catch(() => {});

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user's orders
// @route   GET /api/orders/myorders
// @access  Private
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = req.body.status || order.status;
    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete order (Admin)
// @route   DELETE /api/orders/:id
// @access  Private/Admin
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    await order.deleteOne();
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};