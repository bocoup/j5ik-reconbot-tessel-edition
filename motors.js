"use strict";
const five = require("johnny-five");
const Tessel = require("tessel-io");
const board = new five.Board({
  io: new Tessel()
});

board.on("ready", () => {
  // Johnny-Five's `Motors` collection class allows
  // us to control multiple motors at once.
  const motors = new five.Motors([
    // Left Motor
    { pins: { pwm: "a5", dir: "a4", cdir: "a3" } },
    // Right Motor
    { pins: { pwm: "b5", dir: "b4", cdir: "b3" } },
  ]);
  let direction = "forward"
  let speed = 0;

  function accelerate() {
    if (speed <= 255) {
      speed += 5;
      motors[direction](speed);
      board.wait(200, accelerate);
    } else {
      flipMotorDirection();
    }
  }

  function flipMotorDirection() {
    motors.stop();
    board.wait(1000, () => {
      speed = 0;
      direction = direction === "reverse" ? "forward" : "reverse";
      console.log(`Running motors in ${direction} direction`);
      accelerate();
    });
  }
  flipMotorDirection();
});
