const jwt = require('jsonwebtoken');
const BikeRecord = require('../models/bikeRecordModel');

exports.createBikeRecord = async (req, res, next) => {
  try {
    const body = req.body;
    const token = req.cookies.jwt;
    let userData;

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(200).json({ loggedIn: false });
      }
      userData = decoded;
    });
    const currentTime = new Date();
    const endTime = new Date(
      currentTime.getFullYear(),
      currentTime.getMonth(),
      currentTime.getDate(),
      currentTime.getHours(),
      currentTime.getMinutes() + body?.duration,
      currentTime.getSeconds(),
      currentTime.getMilliseconds()
    );
    console.log(body);
    console.log(userData);
    console.log(currentTime.toISOString(), endTime.toISOString());
    const record = await BikeRecord.create({
      bikeType: body?.bikeType,
      bikeName: body?.bikeName,
      duration: body?.duration,
      startedAt: currentTime,
      endsAt: endTime,
      username: userData?.username,
      isCancelled: false,
    });

    res.status(200).json({ status: 'success', savedRecord: record });
  } catch (error) {
    res
      .status(500)
      .json({ status: 'FAILED', message: 'Unable to build bike', error });
  }
};
