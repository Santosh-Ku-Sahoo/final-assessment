const User = require('../models/User');

exports.getUsers = async (req, res) => {
  try {
    const filters = {};
    if (req.query.role) {
      filters.role = req.query.role;
    }


    const users = await User.find({ ...filters, _id: { $ne: req.user._id } }).sort('-createdAt');
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createUser = async (req, res) => {
  const { name, email, password, role, department, phone, organization } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, error: 'User already exists with this email' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      department,
      phone,
      organization: organization || req.user.organization,
    });

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        phone: user.phone,
        organization: user.organization,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const { name, email, role, department, phone, status, organization, password } = req.body;

    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;
    user.department = department || user.department;
    user.phone = phone !== undefined ? phone : user.phone;
    user.status = status || user.status;
    user.organization = organization || user.organization;

    if (password) {
      user.password = password;
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        phone: user.phone,
        status: user.status,
        organization: user.organization,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'User removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
