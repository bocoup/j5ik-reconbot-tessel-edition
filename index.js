"use strict";

// Built-in Dependencies
const cp = require("child_process");
const os = require("os");
const path = require("path");

// Third Party Dependencies
const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);

// Internal/Application Dependencies
const five = require("johnny-five");
const Tessel = require("tessel-io");
const Rover = require("./lib/rover");

// Configure express application server:
app.use(express.static(path.join(__dirname, "app")));
app.get("/video", (req, res) => {
  res.redirect(`http://${req.hostname}:8080/?action=stream`);
});

// Spawn the video stream
const mjpeg = cp.spawn(path.join(__dirname, "video.sh"));

// Start the HTTP Server
const port = process.env.PORT || 3000;
const server = new Promise(resolve => {
  http.listen(port, () => {
    resolve();
  });
});

// Initialize the Board
const board = new five.Board({
  sigint: false,
  repl: false,
  io: new Tessel()
});

board.on("ready", () => {
  const rover = new Rover([
    // Left Motor
    { pwm: "a5", dir: "a4", cdir: "a3" },
    // Right Motor
    { pwm: "b5", dir: "b4", cdir: "b3" },
  ]);

  console.log("Reconbot(T2): Initialized");
  io.on("connection", socket => {
    console.log("Reconbot(T2): Controller Connected");
    socket.on("remote-control", data => {
      rover.update(data.axis);
    });
  });

  server.then(() => {
    console.log(`http://${os.hostname()}:${port}`);
    console.log(`http://${os.networkInterfaces().wlan0[0].address}:${port}`);
  });
});
