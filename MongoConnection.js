const mongoose = require('mongoose')
require('dotenv').config();

const ConString = "mongodb+srv://Abhishek:abhi0023@cluster0.nxevonu.mongodb.net/whatsapp-clone";

function DbConnect() {
    mongoose.connect(ConString).then((e)=>{
        console.log("Connected To whatsapp-clone database");
    }).catch((error)=>{
        console.log(error);
    })
}

module.exports = DbConnect;


