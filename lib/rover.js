"use strict";

const five = require("johnny-five");
const Fn = five.Fn;
const priv = new WeakMap();

const RAD_TO_DEG = Fn.RAD_TO_DEG;
const SPEED_MIN = 50;
const SPEED_MAX = 200;

class Rover {
  constructor(pinDefs) {
    let pins = pinDefs.map(pinDef => ({
      pins: pinDef,
      threshold: pinDef.threshold || 0
    }));

    priv.set(this, new five.Motors(pins));

    this.stop();
  }
  get left() {
    return priv.get(this)[0];
  }
  get right() {
    return priv.get(this)[1];
  }
  stop() {
    priv.get(this).stop();
  }
  update(axis) {
    let x = axis.x;
    let y = axis.y;

    let absX = Math.abs(x);
    let absY = Math.abs(y);

    // Compute angle of joystick
    let angle = Math.acos(absX / Math.hypot(x, y)) * RAD_TO_DEG;

    // Compute "turn coefficient"
    let coeff = -1 + (angle / 90) * 2;
    let turn = coeff * Math.abs(absY - absX);

    turn = Math.round(turn * 100) / 100;

    let move = Math.max(absY, absX);

    let direction = {
      left: "forward",
      right: "forward",
    };

    let speed = {
      left: 0,
      right: 0,
    };

    // Determine quadrant...
    if ((x >= 0 && y >= 0) || (x < 0 && y < 0)) {
      speed.left = move;
      speed.right = turn;
    } else {
      speed.right = move;
      speed.left = turn;
    }

    // Invert when reversing...
    if (y < 0) {
      speed.left *= -1;
      speed.right *= -1;
    }

    speed.left = Math.round(Number.isNaN(speed.left) ? 0 : speed.left);
    speed.right = Math.round(Number.isNaN(speed.right) ? 0 : speed.right);

    if (speed.left < 0) {
      direction.left = "reverse";
      speed.left *= -1;
    }

    if (speed.right < 0) {
      direction.right = "reverse";
      speed.right *= -1;
    }

    // When they are both 0, just stop everything.
    if (speed.left === 0 && speed.right === 0) {
      this.stop();
    } else {
      let left = Fn.scale(speed.left, 0, 100, SPEED_MIN, SPEED_MAX);
      let right = Fn.scale(speed.right, 0, 100, SPEED_MIN, SPEED_MAX);

      this.left[direction.left](left);
      this.right[direction.right](right);
    }

    return this;
  }
}

module.exports = Rover;
