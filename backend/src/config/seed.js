require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Visitor = require('../models/Visitor');
const Appointment = require('../models/Appointment');
const Pass = require('../models/Pass');
const CheckLog = require('../models/CheckLog');
const { generatePassCode } = require('../utils/helpers');
const QRCode = require('qrcode');

const seedDatabase = async () => {
  try {

    const dbUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/visitor_db';
    console.log(`Connecting to database: ${dbUri}`);
    await mongoose.connect(dbUri);
    console.log('Connected to MongoDB.');


    console.log('Clearing existing collections...');
    await User.deleteMany({});
    await Visitor.deleteMany({});
    await Appointment.deleteMany({});
    await Pass.deleteMany({});
    await CheckLog.deleteMany({});
    console.log('Database cleared.');


    console.log('Seeding staff accounts...');


    const admin = await User.create({
      name: 'Sarah Connor',
      email: 'admin@visipass.com',
      password: 'admin123',
      role: 'admin',
      department: 'Administration',
      phone: '+1 (555) 100-2000',
      organization: 'VisiPass HQ'
    });


    const host1 = await User.create({
      name: 'John Connor',
      email: 'host1@visipass.com',
      password: 'host123',
      role: 'host',
      department: 'Engineering',
      phone: '+1 (555) 100-3000',
      organization: 'VisiPass HQ'
    });

    const host2 = await User.create({
      name: 'Ellen Ripley',
      email: 'host2@visipass.com',
      password: 'host123',
      role: 'host',
      department: 'Human Resources',
      phone: '+1 (555) 100-4000',
      organization: 'VisiPass HQ'
    });


    const security = await User.create({
      name: 'Marcus Wright',
      email: 'security@visipass.com',
      password: 'security123',
      role: 'security',
      department: 'Front Desk Security',
      phone: '+1 (555) 100-5000',
      organization: 'VisiPass HQ'
    });

    console.log('Staff accounts created:');
    console.log(`- Admin: admin@visipass.com (pwd: admin123)`);
    console.log(`- Host 1 (Engineering): host1@visipass.com (pwd: host123)`);
    console.log(`- Host 2 (HR): host2@visipass.com (pwd: host123)`);
    console.log(`- Security Officer: security@visipass.com (pwd: security123)`);


    console.log('Seeding sample visitors...');
    const visitor1 = await Visitor.create({
      name: 'Peter Parker',
      email: 'peter.parker@dailybugle.com',
      phone: '+1 (555) 200-9000',
      company: 'Daily Bugle',
      idType: 'Driver License',
      idNumber: 'DL-NY-9821-X'
    });

    const visitor2 = await Visitor.create({
      name: 'Tony Stark',
      email: 'tony@starkindustries.com',
      phone: '+1 (555) 999-0000',
      company: 'Stark Industries',
      idType: 'Passport',
      idNumber: 'PP-US-1002-Y'
    });

    const visitor3 = await Visitor.create({
      name: 'Bruce Banner',
      email: 'banner@shield.gov',
      phone: '+1 (555) 444-1234',
      company: 'S.H.I.E.L.D.',
      idType: 'National ID',
      idNumber: 'NID-7721'
    });


    console.log('Seeding visitor appointments and passes...');


    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(10, 0, 0, 0);

    const app1 = await Appointment.create({
      visitor: visitor1._id,
      host: host1._id,
      purpose: 'Interview',
      scheduledTime: yesterday,
      status: 'completed',
      location: 'Main Office',
      otpVerified: true
    });

    const passCode1 = generatePassCode();
    const qr1 = await QRCode.toDataURL(passCode1);
    const pass1 = await Pass.create({
      passCode: passCode1,
      appointment: app1._id,
      qrCode: qr1,
      issuedAt: yesterday,
      validUntil: new Date(yesterday.getTime() + 8 * 60 * 60 * 1000),
      status: 'expired'
    });


    await CheckLog.create({
      pass: pass1._id,
      action: 'check_in',
      timestamp: yesterday,
      gate: 'Main Gate',
      performedBy: security._id
    });

    const yesterdayOut = new Date(yesterday);
    yesterdayOut.setHours(yesterday.getHours() + 2);
    await CheckLog.create({
      pass: pass1._id,
      action: 'check_out',
      timestamp: yesterdayOut,
      gate: 'Main Gate',
      performedBy: security._id
    });


    const today = new Date();
    today.setHours(9, 30, 0, 0);

    const app2 = await Appointment.create({
      visitor: visitor2._id,
      host: host1._id,
      purpose: 'Meeting',
      scheduledTime: today,
      status: 'approved',
      location: 'Conference Room Alpha',
      otpVerified: true
    });

    const passCode2 = generatePassCode();
    const qr2 = await QRCode.toDataURL(passCode2);
    const pass2 = await Pass.create({
      passCode: passCode2,
      appointment: app2._id,
      qrCode: qr2,
      issuedAt: today,
      validUntil: new Date(today.getTime() + 8 * 60 * 60 * 1000),
      status: 'active'
    });


    await CheckLog.create({
      pass: pass2._id,
      action: 'check_in',
      timestamp: new Date(today.getTime() + 10 * 60 * 1000),
      gate: 'Main Gate',
      performedBy: security._id
    });


    const laterToday = new Date();
    laterToday.setHours(laterToday.getHours() + 2);

    const app3 = await Appointment.create({
      visitor: visitor3._id,
      host: host2._id,
      purpose: 'Maintenance',
      scheduledTime: laterToday,
      status: 'approved',
      location: 'Lab Room 4',
      otpVerified: true
    });

    const passCode3 = generatePassCode();
    const qr3 = await QRCode.toDataURL(passCode3);
    await Pass.create({
      passCode: passCode3,
      appointment: app3._id,
      qrCode: qr3,
      issuedAt: new Date(),
      validUntil: new Date(laterToday.getTime() + 8 * 60 * 60 * 1000),
      status: 'active'
    });

    console.log('Database seeded successfully.');
    console.log('Demo entries logged to audit logs.');
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    mongoose.connection.close();
    process.exit(1);
  }
};

seedDatabase();
