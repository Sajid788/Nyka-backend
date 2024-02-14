const jwt = require('jsonwebtoken')
const {JWT_SECRET} = require('../Config/db')

const authenticateUser = (req, res, next) => {
    if (!req.headers.authorization) {
        return res.send({ msg: 'Login first' });
    }
    const token = req.headers.authorization.split("Bearer ")[1];
    jwt.verify(token,JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      req.userId = decoded.userId;
      next();
    });
  };

  module.exports = authenticateUser