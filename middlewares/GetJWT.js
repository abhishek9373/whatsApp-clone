require('dotenv').config();
const {Usermodel} = require('../Models.js')
const jwt = require('jsonwebtoken')
const secretkey = "asdfghjklqwertyuiopzxcvbnm";

// const GetJWT = (email,password) =>{
//     Usermodel.findOne({email:email}).then((e)=>{
//         console.log(e)
//         const token = GenJWT(e._id.toString());
//         return token;
//     }).catch((error)=>{
//         console.log(error);
//     })
// }

const GenJWT = (payload) =>{
    const token = jwt.sign(payload,secretkey);
    return token;
}

module.exports = {GenJWT};