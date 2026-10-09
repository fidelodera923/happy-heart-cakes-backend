const CustomRequest = require('../models/CustomRequest');

// @desc    Create custom request
// @route   POST /api/custom-requests
// @access  Private
exports.createCustomRequest = async (req, res) => {
  try {
    const { name, phone, occasion, dateNeeded, servings, description, budget } = req.body;

    if (!name || !phone || !description) {
      return res.status(400).json({ message: 'Name, phone and description are required' });
    }

    const request = await CustomRequest.create({
      user: req.user._id,
      name,
      phone,
      occasion: occasion || '',
      dateNeeded: dateNeeded || '',
      servings: servings || '',
      description,
      budget: budget || '',
      status: 'New'
    });

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all custom requests (Admin)
// @route   GET /api/custom-requests
// @access  Private/Admin
exports.getAllCustomRequests = async (req, res) => {
  try {
    const requests = await CustomRequest.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete custom request (Admin)
// @route   DELETE /api/custom-requests/:id
// @access  Private/Admin
exports.deleteCustomRequest = async (req, res) => {
  try {
    const request = await CustomRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    await request.deleteOne();
    res.json({ message: 'Custom request deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};