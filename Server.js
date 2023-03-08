const express = require("express");
const app = express();
require("dotenv").config();
const DbConnect = require("./MongoConnection");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const token_auth = require("./middlewares/VerifyUser");
const bodyparser = require("body-parser");
const { ObjectId } = require("mongodb");
const { createServer } = require("http");
const { Server } = require("socket.io");

// socket server
const httpServer = createServer(app);
const io = new Server(httpServer, {
   cors: {
    origin: "https://chat-whatsapp-clone.netlify.app",
   }
});

const PORT = 5000;
app.use(cors());
app.use(express.json());
app.use(bodyparser.json());

// all models
const { Usermodel, ConnectionModel, MessageModel } = require("./Models");
const bcryptjs = require("bcryptjs");
const { GenJWT } = require("./middlewares/GetJWT");
const Decode = require("./middlewares/Decode");

// Connect with database;
DbConnect();

// base endpoint
app.get("/", (req, res) => {
  console.log("Requested");
  res.send("Working fine");
});

// register endpoint
app.post("/register", (req, res) => {
  const { email, password, name } = req.body;

  if (email != null && password != null && name != null) {
    bcryptjs.genSalt(10, (err, salt) => {
      if (err) {
        console.error(err);
        return;
      }

      // Hash the password using the generated salt
      bcryptjs.hash(password, salt, (err, hash) => {
        if (err) {
          console.error(err);
          return;
        }
        const UserModel = new Usermodel({
          name: name,
          email: email,
          password: hash,
        });

        UserModel.save()
          .then(() => {
            console.log("New user addedd");
            res.send({ inserted: true });
          })
          .catch((error) => {
            console.log(error.code);
            if (error.code == 11000) {
              res.send({ user_already_present: true });
            } else {
              res.status(500).send({ server_error: true });
            }
            //   console.log(error)
          });
      });
    });
  } else {
    res.send({
      invalid_passand_email: true,
    });
  }
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  Usermodel.findOne({
    email: email,
  })
    .then((user) => {
      if (user) {
        bcryptjs.compare(password, user.password, (err, result) => {
          if (err) {
            console.log("invalid password");
            res.send({
              invalid_pass: true,
            });
          } else {
            if (result) {
              const token = GenJWT(user._id.toString());
              res.send({ authToken: token, invalid_pass: false });
            } else {
              res.send({
                invalid_pass: true,
              });
            }
          }
        });
      } else {
        res.send({
          Nouser: true,
        });
      }
    })
    .catch((error) => {
      res.send({ Nouser: true });
    });
});

// app.use();

app.post("/getusers", token_auth, (req, res) => {
  if (req.body.verified && req.body.userid) {
    const { userid } = req.body;
    ConnectionModel.find({ ownerid: userid })
      .then(async (data, err) => {
        if (data) {
          // console.log(data[0].users[1].username);
          const finalusers = data[0].users.sort(
            (a, b) => b.lastmsg - a.lastmsg
          );
          res.send({ verified: true, users: finalusers, ownerid: userid });
        } else {
          res.send({
            nousers: true,
          });
        }
      })
      .catch((error) => {
        res.send({ verified: true, users: [] });
      });
  } else {
    res.status(404).send({ verified: false });
  }
});

app.post("/findbyemailid", Decode, async (req, res) => {
  if (req.body.email && req.body.userid) {
    const { email, userid } = req.body;

    Usermodel.findOne({
      email: email,
    }).then((e) => {
      if (e) {
        // have to add verfy that useconnection present

        Usermodel.findOne({
          _id: new ObjectId(userid),
        }).then(async (ef) => {
          console.log(ef.name);

          if (ef.email != email) {
            try {
              // console.log()
              const con = await ConnectionModel.findOneAndUpdate(
                { ownerid: userid },
                {
                  $push: {
                    users: {
                      username: e.name,
                      lastmsg: Date(),
                      userid: e._id.toString(),
                    },
                  },
                },
                { new: true, upsert: true }
              );
              console.log(con);

              if (con) {
                try {
                  const con2 = await ConnectionModel.findOneAndUpdate(
                    { ownerid: e._id.toString() },
                    {
                      $push: {
                        users: {
                          username: ef.name,
                          lastmsg: Date(),
                          userid: ef._id.toString(),
                        },
                      },
                    },
                    { new: true, upsert: true }
                  );
                  if (con2) {
                    res.send({
                      username: e.name,
                      userid: e._id.toString(),
                    });
                  }
                } catch (err) {
                  res.status(404).send("user already present");
                }
              }
            } catch (err) {
              console.log(err);
              res.status(404).send("user already present");
            }
          }
        });
      }
    });
  }
});

// -----load userchat----->'

app.post("/getuserchatting", Decode, (req, res) => {
  if (req.body.userid && req.body.anotheruid) {
    const { userid, anotheruid } = req.body;

    MessageModel.find({
      $or: [{ sid: userid, rid: anotheruid },{sid:anotheruid,rid:userid}],
    })
      .sort({
        insertedAt: -1,
      })
      .then(async (data, err) => {
        if (data) {
          // console.log(data);
          res.send({ messages: data, ownerid: userid });
        } else {
          res.send({ error: true });
        }
      })
      .catch((error) => {
        res.status(404).send({ error: true });
      });
  }
});

//  ------- all socket connection code ------------->

const socks = {};

io.on("connection", (socket) => {
  socket.on("sendmyid", (data) => {
    socks[data.userid] = socket.id;
    console.log(socks);
  });

  socket.on("msgfromfrontToback", (data, cb) => {
    const { rid, sid, message } = data;
    const MessageDraft = new MessageModel({
      rid: rid,
      sid: sid,
      message: message,
    });
    console.log(rid);
    if (socks[rid]) {
      console.log("User online");
      // now both users are online and also roomid
      MessageDraft.save()
        .then((e) => {
          if (e) {
            // -------send chat to the reciever by room------->
            console.log("message saved");
            io.to(socks[rid]).emit("messagefromuser", {
              sid: sid,
              message: message,
              rid:rid
            });
            // -------update connection last msg  to change the order of the recently messaged user----->
            ConnectionModel.updateOne(
              { 
                ownerid: sid,
                userid: rid,
              },
              {
                set: {
                  lastmsg: Date(),
                },
              }
            )
              .then((e) => {
                console.log(e);
                ConnectionModel.updateOne(
                  {
                    ownerid: rid,
                    userid: sid,
                  },
                  {
                    set: {
                      lastmsg: Date(),
                    },
                  }
                ).then((e) => {
                  console.log("both connections update");
                  cb("message send");
                });
              })
              .catch((error) => {
                console.log(error);
              });
          }
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      // console.log(socketids)
      console.log("user Not Online saving message to database..");
      MessageDraft.save()
        .then((e) => {
          if (e) {
            // -------send chat to the reciever by room------->
            console.log("message saved");
            cb("user not online message saved");
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  });

  socket.on("disconnect", () => {
    console.log("user gone");
    socket.disconnect();
  });
});

httpServer.listen(PORT, (e) => {
  console.log("Project is listening On Port: " + PORT);
});

// module.exports = { app };
