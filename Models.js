const mongoose = require('mongoose');


// user
const UserSchema = require('./Schema/UserSchema')
const Usermodel = new mongoose.model('users',UserSchema);

// userconnections
const ConnectionSchema = require('./Schema/ConnectionsSchema');
const ConnectionModel = new mongoose.model('connections',ConnectionSchema);

// userchattings
const MessageSchema = require('./Schema/MessageSchema');
const MessageModel = new mongoose.model('messages',MessageSchema);

module.exports = {
    Usermodel:Usermodel,
    ConnectionModel:ConnectionModel,
    MessageModel:MessageModel
};





// if (con) {
//     // console.log(e._id.toString +"    " +  ef._id.toString())
//     try {
//       const con2 = await ConnectionModel.findOneAndUpdate(
//         { ownerid: e.userid },
//         {
//           $push: {
//             users: {
//               username: ef.name,
//               lastmsg: Date(),
//               userid: userid,
//             },
//           },
//         },
//         { new: true, upsert: true }
//       );
//       if(con2){
                //  res.send({ username: e.name, userid: e._id.toString() });

//       }
//     } catch (err) {
//       console.log(err)
//     }
//   }