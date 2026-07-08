const Appointment = require('../models/Appointment');
const Visitor = require('../models/Visitor');
const User = require('../models/User');
const Pass = require('../models/Pass');
const { generateOTP, generatePassCode } = require('../utils/helpers');
const { sendMail } = require('../config/mailer');
const QRCode = require('qrcode');
exports.getHosts = async (req, res) => {
  try {
    const hosts = await User.find({ role: 'host', status: 'active' }).select('name department email');
    res.status(200).json({ success: true, data: hosts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
exports.preRegister = async (req, res) => {
  const { name, email, phone, company, idType, idNumber, photo, hostId, purpose, scheduledTime, location } = req.body;

  try {
    if (!name || !email || !phone || !hostId || !purpose || !scheduledTime) {
      return res.status(400).json({ success: false, error: 'Please provide all required fields' });
    }


    const host = await User.findById(hostId);
    if (!host || host.role !== 'host') {
      return res.status(404).json({ success: false, error: 'Selected host not found' });
    }


    let visitor = await Visitor.findOne({ email });
    if (visitor) {
      visitor.name = name;
      visitor.phone = phone;
      visitor.company = company || visitor.company;
      visitor.photo = photo || visitor.photo;
      visitor.idType = idType || visitor.idType;
      visitor.idNumber = idNumber || visitor.idNumber;
      await visitor.save();
    } else {
      visitor = await Visitor.create({
        name,
        email,
        phone,
        company,
        photo,
        idType,
        idNumber,
      });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);


    const appointment = await Appointment.create({
      visitor: visitor._id,
      host: host._id,
      purpose,
      scheduledTime: new Date(scheduledTime),
      location: location || 'Main Office',
      otpCode: otp,
      otpExpiry,
      otpVerified: false,
      status: 'pending',
    });


    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #4f46e5; text-align: center;">Verify Your Identity</h2>
        <p>Dear ${name},</p>
        <p>Thank you for pre-registering at our office. To verify your email address and request approval from your host <strong>${host.name}</strong>, please use the following One-Time Password (OTP):</p>
        <div style="background: #f3f4f6; text-align: center; padding: 15px; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #1e1b4b; border-radius: 5px; margin: 20px 0;">
          ${otp}
        </div>
        <p style="color: #6b7280; font-size: 14px; text-align: center;">This code is valid for 10 minutes.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #9ca3af; text-align: center;">This is an automated message. Please do not reply.</p>
      </div>
    `;


    try {
      await sendMail({
        to: email,
        subject: 'Visitor Registration OTP Verification',
        text: `Your OTP is: ${otp}`,
        html: emailHtml,
      });
      console.log(`[OTP Sent] Visitor: ${email}, OTP: ${otp}`);
    } catch (mailErr) {
      console.error('SMTP error, logging OTP to console:', mailErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'OTP sent to your email. Please verify to submit your request.',
      appointmentId: appointment._id,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
exports.verifyOTP = async (req, res) => {
  const { appointmentId, otp } = req.body;

  try {
    if (!appointmentId || !otp) {
      return res.status(400).json({ success: false, error: 'Please provide appointment ID and OTP code' });
    }


    const appointment = await Appointment.findById(appointmentId)
      .select('+otpCode +otpExpiry')
      .populate('visitor')
      .populate('host');

    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Appointment request not found' });
    }

    if (appointment.otpVerified) {
      return res.status(400).json({ success: false, error: 'OTP has already been verified' });
    }


    if (appointment.otpCode !== otp) {
      return res.status(400).json({ success: false, error: 'Invalid OTP code' });
    }

    if (new Date() > appointment.otpExpiry) {
      return res.status(400).json({ success: false, error: 'OTP has expired. Please register again.' });
    }


    appointment.otpVerified = true;
    appointment.otpCode = undefined;
    appointment.otpExpiry = undefined;
    await appointment.save();


    const hostEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #4f46e5;">New Visitor Request</h2>
        <p>Dear ${appointment.host.name},</p>
        <p>A visitor has pre-registered to meet you. Please review the details below:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Visitor Name:</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${appointment.visitor.name}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Company:</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${appointment.visitor.company || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Purpose:</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${appointment.purpose}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Scheduled Time:</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${appointment.scheduledTime.toLocaleString()}</td>
          </tr>
        </table>
        <p>Please log in to your Host Dashboard to approve or reject this request.</p>
        <div style="text-align: center; margin: 25px 0;">
          <a href="${process.env.FRONTEND_URL}/login" style="background-color: #4f46e5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Host Console</a>
        </div>
      </div>
    `;

    try {
      await sendMail({
        to: appointment.host.email,
        subject: `New Visitor Request - ${appointment.visitor.name}`,
        text: `Visitor ${appointment.visitor.name} has requested an appointment on ${appointment.scheduledTime.toLocaleString()}`,
        html: hostEmailHtml,
      });
    } catch (err) {
      console.error('Failed to email host:', err.message);
    }

    res.status(200).json({
      success: true,
      message: 'Email OTP verified successfully. Your request has been sent to the host.',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
exports.getAppointments = async (req, res) => {
  try {
    let query = {};


    if (req.user.role === 'host') {
      query.host = req.user._id;
    }

    const appointments = await Appointment.find(query)
      .populate('visitor')
      .populate('host', 'name email department phone')
      .sort('-createdAt');

    res.status(200).json({ success: true, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
exports.approveAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('visitor')
      .populate('host');

    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }


    if (appointment.host._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'You are not authorized to approve this appointment' });
    }

    if (appointment.status !== 'pending') {
      return res.status(400).json({ success: false, error: `Appointment is already ${appointment.status}` });
    }


    const passCode = generatePassCode();
    const validUntil = new Date(appointment.scheduledTime.getTime() + 8 * 60 * 60 * 1000);


    const qrCode = await QRCode.toDataURL(passCode);


    const pass = await Pass.create({
      passCode,
      appointment: appointment._id,
      qrCode,
      validUntil,
      status: 'active',
    });


    appointment.status = 'approved';
    await appointment.save();


    const passUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/pass/${passCode}`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #10b981; text-align: center;">Appointment Approved!</h2>
        <p>Dear ${appointment.visitor.name},</p>
        <p>Your appointment request with host <strong>${appointment.host.name}</strong> has been approved.</p>

        <div style="border: 2px dashed #10b981; padding: 20px; text-align: center; background-color: #f0fdf4; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #065f46;">DIGITAL VISITOR PASS</h3>
          <p><strong>Pass Code:</strong> ${passCode}</p>
          <p><strong>Scheduled:</strong> ${appointment.scheduledTime.toLocaleString()}</p>
          <p><strong>Valid Until:</strong> ${validUntil.toLocaleString()}</p>
          <div style="margin: 15px 0;">
            <img src="${qrCode}" alt="Pass QR Code" style="width: 150px; height: 150px; border: 1px solid #ddd; background: white; padding: 5px;" />
          </div>
          <p style="font-size: 13px; color: #047857;">Please present this QR code at the Security Checkpoint upon arrival.</p>
        </div>

        <div style="text-align: center; margin: 25px 0;">
          <a href="${passUrl}" style="background-color: #10b981; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">View Digital Pass</a>
        </div>
      </div>
    `;

    try {
      await sendMail({
        to: appointment.visitor.email,
        subject: `Your Visitor Pass is Ready - ${passCode}`,
        text: `Your visitor pass code is ${passCode}. Access link: ${passUrl}`,
        html: emailHtml,
      });
    } catch (mailErr) {
      console.error('Failed to send pass email:', mailErr.message);
    }

    res.status(200).json({
      success: true,
      message: 'Appointment approved and visitor pass issued successfully.',
      pass,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
exports.rejectAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('visitor')
      .populate('host');

    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }

    if (appointment.host._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'You are not authorized' });
    }

    if (appointment.status !== 'pending') {
      return res.status(400).json({ success: false, error: `Appointment is already ${appointment.status}` });
    }

    appointment.status = 'rejected';
    await appointment.save();


    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #ef4444;">Visitor Request Update</h2>
        <p>Dear ${appointment.visitor.name},</p>
        <p>We regret to inform you that your request to visit <strong>${appointment.host.name}</strong> on ${appointment.scheduledTime.toLocaleString()} has been declined.</p>
        <p>If you believe this was an error, please get in touch with your host or reception.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #9ca3af;">Visitor Pass Management System</p>
      </div>
    `;

    try {
      await sendMail({
        to: appointment.visitor.email,
        subject: `Visitor Request Declined`,
        text: `Your visitor request to meet ${appointment.host.name} was declined.`,
        html: emailHtml,
      });
    } catch (err) {
      console.error('Rejection email error:', err.message);
    }

    res.status(200).json({ success: true, message: 'Appointment rejected successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
exports.createHostInvite = async (req, res) => {
  const { name, email, phone, company, purpose, scheduledTime, location } = req.body;

  try {
    if (!name || !email || !phone || !purpose || !scheduledTime) {
      return res.status(400).json({ success: false, error: 'Please fill in name, email, phone, purpose, scheduledTime' });
    }


    let visitor = await Visitor.findOne({ email });
    if (visitor) {
      visitor.name = name;
      visitor.phone = phone;
      visitor.company = company || visitor.company;
      await visitor.save();
    } else {
      visitor = await Visitor.create({
        name,
        email,
        phone,
        company,
      });
    }

    const appointment = await Appointment.create({
      visitor: visitor._id,
      host: req.user._id,
      purpose,
      scheduledTime: new Date(scheduledTime),
      location: location || 'Main Office',
      otpVerified: true,
      status: 'approved',
    });


    const passCode = generatePassCode();
    const validUntil = new Date(appointment.scheduledTime.getTime() + 8 * 60 * 60 * 1000);


    const qrCode = await QRCode.toDataURL(passCode);


    const pass = await Pass.create({
      passCode,
      appointment: appointment._id,
      qrCode,
      validUntil,
      status: 'active',
    });


    const passUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/pass/${passCode}`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #4f46e5; text-align: center;">Invitation to Visit</h2>
        <p>Dear ${visitor.name},</p>
        <p><strong>${req.user.name}</strong> has invited you to visit our office.</p>

        <div style="border: 2px dashed #4f46e5; padding: 20px; text-align: center; background-color: #f5f3ff; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #4338ca;">OFFICIAL INVITATION PASS</h3>
          <p><strong>Pass Code:</strong> ${passCode}</p>
          <p><strong>Host:</strong> ${req.user.name} (${req.user.department} Department)</p>
          <p><strong>Scheduled:</strong> ${appointment.scheduledTime.toLocaleString()}</p>
          <p><strong>Valid Until:</strong> ${validUntil.toLocaleString()}</p>
          <div style="margin: 15px 0;">
            <img src="${qrCode}" alt="Pass QR Code" style="width: 150px; height: 150px; border: 1px solid #ddd; background: white; padding: 5px;" />
          </div>
          <p style="font-size: 13px; color: #5b21b6;">Show this QR code to Security upon arrival.</p>
        </div>

        <div style="text-align: center; margin: 25px 0;">
          <a href="${passUrl}" style="background-color: #4f46e5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">View Digital Pass</a>
        </div>
      </div>
    `;

    try {
      await sendMail({
        to: visitor.email,
        subject: `Invitation to Visit - ${passCode}`,
        text: `Invitation from ${req.user.name}. Pass Code: ${passCode}. View link: ${passUrl}`,
        html: emailHtml,
      });
    } catch (mailErr) {
      console.error('Failed to send invite email:', mailErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Invitation issued successfully and pass sent to visitor.',
      appointment,
      pass,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
