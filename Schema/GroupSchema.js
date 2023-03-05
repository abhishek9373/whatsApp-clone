const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
  gid: {
    type: Number,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
  },
  members: [
    {
      name: {
        type: String,
        required: true,
      },
      dateAdded: {
        type: Date,
        required: true,
      },
      isAdmin:{
        type:Boolean,
        default:false,
        required:true
      }
    },
  ], 
},{timestamps:true});


module.exports = groupSchema;