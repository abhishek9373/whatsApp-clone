const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    sid:{
        type:String,
        required:true
    },
    rid:{
        type:String,
        required:true
    },
    gid:{
        type:String
    },
    message:{
        type:String,
        required:true
    },
    isgroupmsg:{
        type:Boolean,
        default:false,
    }
},{timestamps:true})

module.exports = MessageSchema;