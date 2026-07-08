const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema(
  {
    visitor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Visitor',
      required: true,
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    purpose: {
      type: String,
      required: [true, 'Please specify the purpose of the visit'],
      enum: ['Meeting', 'Interview', 'Delivery', 'Maintenance', 'Personal', 'Other'],
      default: 'Meeting',
    },
    scheduledTime: {
      type: Date,
      required: [true, 'Please specify the scheduled date and time'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled'],
      default: 'pending',
    },
    location: {
      type: String,
      default: 'Main Office',
    },
    otpCode: {
      type: String,
      select: false,
    },
    otpExpiry: {
      type: Date,
      select: false,
    },
    otpVerified: {
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Appointment', AppointmentSchema);
