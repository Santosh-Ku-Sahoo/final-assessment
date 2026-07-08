const CheckLog = require('../models/CheckLog');
const Pass = require('../models/Pass');
const Appointment = require('../models/Appointment');
const Visitor = require('../models/Visitor');
const User = require('../models/User');
exports.getLogs = async (req, res) => {
  const { gate, action, startDate, endDate, search, limit = 50, page = 1 } = req.query;

  try {
    const filter = {};

    if (gate) filter.gate = gate;
    if (action) filter.action = action;


    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }


    if (search) {
      const visitors = await Visitor.find({
        name: { $regex: search, $options: 'i' },
      }).select('_id');
      const visitorIds = visitors.map(v => v._id);

      const appointments = await Appointment.find({
        visitor: { $in: visitorIds },
      }).select('_id');
      const appointmentIds = appointments.map(a => a._id);

      const passes = await Pass.find({
        appointment: { $in: appointmentIds },
      }).select('_id');
      const passIds = passes.map(p => p._id);

      filter.pass = { $in: passIds };
    }

    const count = await CheckLog.countDocuments(filter);
    const skip = (page - 1) * limit;

    const logs = await CheckLog.find(filter)
      .populate({
        path: 'pass',
        populate: {
          path: 'appointment',
          populate: [
            { path: 'visitor' },
            { path: 'host', select: 'name email department' }
          ]
        }
      })
      .populate('performedBy', 'name role')
      .sort('-timestamp')
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count,
      page: parseInt(page),
      pages: Math.ceil(count / limit),
      data: logs,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
exports.exportLogsCSV = async (req, res) => {
  try {
    const logs = await CheckLog.find()
      .populate({
        path: 'pass',
        populate: {
          path: 'appointment',
          populate: [
            { path: 'visitor' },
            { path: 'host', select: 'name email department' }
          ]
        }
      })
      .populate('performedBy', 'name role')
      .sort('-timestamp');


    let csv = 'Timestamp,Log ID,Pass Code,Visitor Name,Visitor Email,Visitor Phone,Visitor Company,Host Name,Host Dept,Action,Gate,Verified By\n';

    logs.forEach(log => {
      const timestamp = log.timestamp.toISOString();
      const logId = log._id.toString();
      const passCode = log.pass?.passCode || 'N/A';
      const visitorName = log.pass?.appointment?.visitor?.name?.replace(/"/g, '""') || 'N/A';
      const visitorEmail = log.pass?.appointment?.visitor?.email || 'N/A';
      const visitorPhone = log.pass?.appointment?.visitor?.phone || 'N/A';
      const visitorCompany = log.pass?.appointment?.visitor?.company?.replace(/"/g, '""') || 'N/A';
      const hostName = log.pass?.appointment?.host?.name?.replace(/"/g, '""') || 'N/A';
      const hostDept = log.pass?.appointment?.host?.department || 'N/A';
      const action = log.action === 'check_in' ? 'Check In' : 'Check Out';
      const gate = log.gate;
      const verifiedBy = log.performedBy?.name || 'N/A';

      csv += `"${timestamp}","${logId}","${passCode}","${visitorName}","${visitorEmail}","${visitorPhone}","${visitorCompany}","${hostName}","${hostDept}","${action}","${gate}","${verifiedBy}"\n`;
    });

    res.header('Content-Type', 'text/csv');
    res.attachment('visitor_logs_export.csv');
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
exports.getDashboardStats = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);


    let hostQuery = {};
    if (req.user.role === 'host') {
      hostQuery.host = req.user._id;
    }


    const totalAppointmentsToday = await Appointment.countDocuments({
      ...hostQuery,
      scheduledTime: { $gte: todayStart, $lte: todayEnd }
    });

    const pendingAppointments = await Appointment.countDocuments({
      ...hostQuery,
      status: 'pending'
    });

    const approvedAppointments = await Appointment.countDocuments({
      ...hostQuery,
      status: 'approved'
    });



    const activePasses = await Pass.find().populate('appointment');
    let insideCount = 0;


    const lastCheckLogs = await Promise.all(
      activePasses.map(async (pass) => {

        if (req.user.role === 'host' && pass.appointment?.host.toString() !== req.user._id.toString()) {
          return null;
        }
        const log = await CheckLog.findOne({ pass: pass._id }).sort('-timestamp');
        return { passId: pass._id, log };
      })
    );

    lastCheckLogs.forEach(entry => {
      if (entry && entry.log && entry.log.action === 'check_in') {
        insideCount++;
      }
    });


    const gateVolume = await CheckLog.aggregate([
      {
        $group: {
          _id: '$gate',
          checkIns: { $sum: { $cond: [{ $eq: ['$action', 'check_in'] }, 1, 0] } },
          checkOuts: { $sum: { $cond: [{ $eq: ['$action', 'check_out'] }, 1, 0] } },
        }
      }
    ]);


    const hourlyLogs = await CheckLog.find({
      timestamp: { $gte: todayStart, $lte: todayEnd }
    });

    const hourlyTraffic = Array(12).fill(0).map((_, i) => ({
      hour: `${(i * 2).toString().padStart(2, '0')}:00`,
      checkIns: 0,
      checkOuts: 0
    }));

    hourlyLogs.forEach(log => {
      const hour = log.timestamp.getHours();
      const index = Math.floor(hour / 2);
      if (index >= 0 && index < 12) {
        if (log.action === 'check_in') hourlyTraffic[index].checkIns++;
        if (log.action === 'check_out') hourlyTraffic[index].checkOuts++;
      }
    });


    let logFeedQuery = {};
    if (req.user.role === 'host') {
      const hostApps = await Appointment.find({ host: req.user._id }).select('_id');
      const hostPasses = await Pass.find({ appointment: { $in: hostApps.map(a => a._id) } }).select('_id');
      logFeedQuery.pass = { $in: hostPasses.map(p => p._id) };
    }

    const recentLogs = await CheckLog.find(logFeedQuery)
      .populate({
        path: 'pass',
        populate: {
          path: 'appointment',
          populate: { path: 'visitor' }
        }
      })
      .populate('performedBy', 'name')
      .sort('-timestamp')
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        todayAppointments: totalAppointmentsToday,
        pendingApprovals: pendingAppointments,
        approvedVisits: approvedAppointments,
        currentlyInside: insideCount
      },
      gateVolume,
      hourlyTraffic,
      recentLogs
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
