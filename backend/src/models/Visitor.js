const mongoose = require('mongoose');

const VisitorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    phone: {
      type: String,
      required: [true, 'Please add a phone number'],
    },
    company: {
      type: String,
      default: '',
    },
    photo: {
      type: String,
      default: '',
    },
    idType: {
      type: String,
      enum: ['National ID', 'Passport', 'Driver License', 'Other', 'None'],
      default: 'None',
    },
    idNumber: {
      type: String,
      default: '',
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Visitor', VisitorSchema);
