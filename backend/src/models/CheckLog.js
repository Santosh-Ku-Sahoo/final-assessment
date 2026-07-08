const mongoose = require('mongoose');

const CheckLogSchema = new mongoose.Schema(
  {
    pass: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pass',
      required: true,
    },
    action: {
      type: String,
      enum: ['check_in', 'check_out'],
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    gate: {
      type: String,
      default: 'Main Entrance',
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('CheckLog', CheckLogSchema);
