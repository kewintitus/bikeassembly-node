const jwt = require('jsonwebtoken');
const BikeTypes = require('../models/bikeTypeModel');
exports.getBikeTypes = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    let userData;

    if (!token) {
      return res.status(200).json({ loggedIn: false });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(200).json({ loggedIn: false });
      }
      userData = decoded;
    });
    console.log(userData);
    const bikeTypes = await BikeTypes.find({});
    console.log(bikeTypes);

    res.status(200).json({ status: 'SUCCESS', data: bikeTypes });
  } catch (error) {
    res
      .status(500)
      .json({ status: 'FAILED', message: 'Unable to fetch bike types' });
  }
};
