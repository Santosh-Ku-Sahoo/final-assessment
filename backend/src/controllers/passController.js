const Pass = require('../models/Pass');
const Appointment = require('../models/Appointment');
const CheckLog = require('../models/CheckLog');
exports.getPassDetails = async (req, res) => {
  try {
    const pass = await Pass.findOne({ passCode: req.params.passCode }).populate({
      path: 'appointment',
      populate: [
        { path: 'visitor' },
        { path: 'host', select: 'name email department phone organization' }
      ]
    });

    if (!pass) {
      return res.status(404).json({ success: false, error: 'Visitor pass not found' });
    }

    res.status(200).json({ success: true, data: pass });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
exports.verifyPass = async (req, res) => {
  try {
    const pass = await Pass.findOne({ passCode: req.params.passCode }).populate({
      path: 'appointment',
      populate: [
        { path: 'visitor' },
        { path: 'host', select: 'name email department phone organization' }
      ]
    });

    if (!pass) {
      return res.status(404).json({ success: false, error: 'Pass code is invalid' });
    }


    let warning = null;
    const now = new Date();
    if (now > pass.validUntil) {
      pass.status = 'expired';
      await pass.save();
    }


    const lastLog = await CheckLog.findOne({ pass: pass._id }).sort('-timestamp');
    const isInside = lastLog ? lastLog.action === 'check_in' : false;

    res.status(200).json({
      success: true,
      data: pass,
      isInside,
      lastLog,
      status: pass.status,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
exports.checkIn = async (req, res) => {
  const { gate } = req.body;

  try {
    const pass = await Pass.findOne({ passCode: req.params.passCode }).populate('appointment');

    if (!pass) {
      return res.status(404).json({ success: false, error: 'Pass not found' });
    }

    if (pass.status === 'revoked') {
      return res.status(400).json({ success: false, error: 'This pass has been revoked by the administration' });
    }


    const now = new Date();
    if (now > pass.validUntil || pass.status === 'expired') {
      pass.status = 'expired';
      await pass.save();
      return res.status(400).json({ success: false, error: 'This pass has expired' });
    }


    const lastLog = await CheckLog.findOne({ pass: pass._id }).sort('-timestamp');
    if (lastLog && lastLog.action === 'check_in') {
      return res.status(400).json({ success: false, error: 'Visitor is already checked in' });
    }


    const checkLog = await CheckLog.create({
      pass: pass._id,
      action: 'check_in',
      gate: gate || 'Main Entrance',
      performedBy: req.user._id,
    });

    res.status(200).json({
      success: true,
      message: 'Check-In logged successfully',
      data: checkLog,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
exports.checkOut = async (req, res) => {
  const { gate } = req.body;

  try {
    const pass = await Pass.findOne({ passCode: req.params.passCode }).populate('appointment');

    if (!pass) {
      return res.status(404).json({ success: false, error: 'Pass not found' });
    }


    const lastLog = await CheckLog.findOne({ pass: pass._id }).sort('-timestamp');
    if (!lastLog || lastLog.action === 'check_out') {
      return res.status(400).json({ success: false, error: 'Visitor is not checked in or already checked out' });
    }


    const checkLog = await CheckLog.create({
      pass: pass._id,
      action: 'check_out',
      gate: gate || 'Main Entrance',
      performedBy: req.user._id,
    });


    await Appointment.findByIdAndUpdate(pass.appointment._id, { status: 'completed' });

    res.status(200).json({
      success: true,
      message: 'Check-Out logged successfully',
      data: checkLog,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
