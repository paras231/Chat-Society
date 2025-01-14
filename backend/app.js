var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(logger("dev"));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

const { sendMsg } = require("./controllers/MessageController.js");
// creating io
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const frontendURL = process.env.FRONTEND_URL;

const io = new Server(server, {
  cors: {
    origin: frontendURL,
    methods: ["GET", "POST"],
  },
});
const { messageData } = require("./controllers/MessageController.js");
io.on("connection", (socket) => {
  console.log(`user with ${socket.id} socketID connected :)`);
  socket.on("send_message", async (data) => {
    await sendMsg(data);
    // module.exports = data;
    console.log("message received!!!");
    socket.broadcast.emit("received_message", {
      data: "message received!!!",
      channelId: data.channelId,
    });
    // socket.emit();
    // console.log(
    //   `author : ${data.author} | message : ${data.message} | channel Name: ${data.channelName} | time: ${data.timestamp}`
    // );
  });
});

var serverRouter = require("./routes/serverRoute");
let channelRouter = require("./routes/channelRoute");
let messageRouter = require("./routes/messageRoute");
let userRouter = require("./routes/userRoute");
const prisma = require("./prisma/index.js");

app.use("/api", serverRouter);
app.use("/channelapi", channelRouter);
app.use("/msgapi", messageRouter);
app.use("/userapi", userRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

// app.listen(5000, () => {
//   console.log(`server started on port 5000..`);
// });
// const deletekarde = async () => {
//   // await prisma.message.deleteMany({});
//   // await prisma.server.deleteMany({});
//   // await prisma.channel.deleteMany({});
//   console.log("Deleted!");
// };
// deletekarde();
server.listen(process.env.PORT || 5000);
module.exports = app;
