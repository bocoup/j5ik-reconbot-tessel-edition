"use strict";

// Built-in Dependencies
const cp = require("child_process");
const Server = require("http").Server;
const os = require("os");
const path = require("path");

// Third Party Dependencies
const av = require("tessel-av");
const express = require("express");
const five = require("johnny-five");
const Socket = require("socket.io");
const Tessel = require("tessel-io");

// Internal/Application Dependencies
const Rover = require("./lib/rover");

// Application, Server, Socket and video
const app = express();
const server = new Server(app);
const socket = new Socket(server);
const video = new av.Camera({
  fps: 15,
  dimensions: "320x240",
  quality: 50,
});

// Configure express application server:
app.use(express.static(path.join(__dirname, "app")));
app.get("/video", (request, response) => {
  response.redirect(`${video.url}`);
});

// Start the HTTP Server
const port = process.env.PORT || 80;
const listen = new Promise(resolve => {
  server.listen(port, resolve);
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
  socket.on("connection", connection => {
    console.log("Reconbot(T2): Controller Connected");
    connection.on("remote-control", data => {
      rover.update(data.axis);
    });
  });

  listen.then(() => {
    console.log(`http://${os.hostname()}.local`);
    console.log(`http://${os.networkInterfaces().wlan0[0].address}`);

    process.on("SIGINT", () => {
      video.stop();
      server.close();
      process.exit();
    });
  });
});
