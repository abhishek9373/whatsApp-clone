const mongoose = require("mongoose");

const connectionsSchema = new mongoose.Schema({
  ownerid: {
    type: String,
    required: true,
  },
  users: [
    {
      username: {
        type: String,
        required: true,
      },
      lastmsg: {
        type: Date,
        required: true,
        default: Date(),
      },
      userid: {
        type: String,
        required: true,
        // unique: true,
      },
    },
  ],
});

module.exports = connectionsSchema;
