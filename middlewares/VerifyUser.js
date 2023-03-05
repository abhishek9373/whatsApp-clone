const jwt = require("jsonwebtoken");

const Middle = (req, res, next) => {
  const token = req.body.token;
  //  console.log("middleware");

  if (token) {
    try {
      const result = jwt.verify(token, "asdfghjklqwertyuiopzxcvbnm");
      if (result) {
        req.body.userid = result;
        req.body.verified = true;
        next();
      } else {
        req.body.verified = false;
        next();
      }
    } catch (err) {
      next(err);
    }
  } else {
    res.send({ verified: false });
  }
};

module.exports = Middle;
