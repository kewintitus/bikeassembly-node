const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const BikeTypes = require('../models/bikeTypeModel');

const createToken = (user) => {
  return jwt.sign(
    { username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    console.log(username, password);
    const hashedpassword = await bcrypt.hash(password, 10);
    console.log(hashedpassword);
    const users = await User.find({ username });
    // const bikeTypes = await BikeTypes.find({});
    const userData = users[0];

    const isPasswdValid = await bcrypt.compare(password, users[0].password);
    console.log(isPasswdValid);
    // console.log(bikeTypes);
    if (isPasswdValid) {
      const token = createToken(userData);
      console.log('token', token);

      const cookieOptions = {
        expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        sameSite: 'strict',
        userCredentials: true,
        secure: false,
      };
      userData.password = null;
      res.cookie('jwt', token, cookieOptions);
      res.status(200).json({ status: 'SUCCESS', token, data: { userData } });
    } else {
      res.status(401).json({
        status: 'UNAUTHORISED',
        message: 'username or password does not match',
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'FAILED',
      message: 'something went wrong',
      error,
    });
    console.log(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    res.cookie('jwt', 'loggedOut', {
      expires: new Date(Date.now() * 1000),
      httpOnly: true,
      sameSite: 'strict',
      userCredentials: true,
      secure: false,
    });
    console.log('logout success');
    res.status(200).json({
      status: 'success',
    });
  } catch (error) {
    res.status(500).json({
      status: 'FAILED',
      message: 'something went wrong',
      error,
    });
    console.log(error);
  }
};

exports.verifyToken = async (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Failed to authenticate token' });
    }
    console.log(decoded);
    req.user = decoded;
    next();
  });
};

exports.isLoggedIn = async (req, res, next) => {
  const token = req.cookies.jwt;

  console.log('isLoggedIn', token);

  if (!token) {
    return res.status(200).json({ loggedIn: false });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(200).json({ loggedIn: false });
    }

    res.status(200).json({ loggedIn: true, user: decoded });
  });
};
