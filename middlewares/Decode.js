const jwt = require("jsonwebtoken")

const Decode = (req,res,next) =>{
    const token = req.body.token;
  //  console.log("middleware");
 
   if (token) {
     try {
       const result = jwt.verify(token, "asdfghjklqwertyuiopzxcvbnm");
       if (result) {
         req.body.userid = result; 
         next();
       } else {
         next();
       }
     } catch (err) {
       next(err);
     }
    }
}
 module.exports = Decode;