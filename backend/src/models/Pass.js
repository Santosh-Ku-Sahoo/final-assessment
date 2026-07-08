const mongoose = require('mongoose');

const PassSchema = new mongoose.Schema(
  {
    passCode: {
      type: String,
      required: true,
      unique: true,
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
    },
    qrCode: {
      type: String,
      required: true,
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
    validUntil: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'revoked'],
      default: 'active',
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Pass', PassSchema);
