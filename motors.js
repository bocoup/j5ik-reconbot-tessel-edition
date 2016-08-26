const five = require('johnny-five');
const Tessel = require('tessel-io');

const board = new five.Board({ io: new Tessel() });

board.on('ready', () => {
  // Johnny-Five's `Motors` collection class allows us to control
  // multiple motors at once.
  const motors = new five.Motors([
    { pins: { pwm: 'a5', dir: 'a4', cdir: 'a3' } },     // Left Motor
    { pins: { pwm: 'b5', dir: 'b4', cdir: 'b3' } },     // Right Motor
  ]);
  var currentDirection, currentSpeed;
  function accelerate () {
    if (currentSpeed <= 255) {
      currentSpeed += 5;
      motors.start(currentSpeed);
      setTimeout(accelerate, 200);
    } else {
      flipMotorDirection();
    }
  }
  function flipMotorDirection () {
    motors.stop();
    board.wait(1000, () => {
      currentSpeed = 0;
      if (currentDirection === 'forward') {
        currentDirection = 'reverse';
        motors.reverse(currentSpeed); // Set direction of motor, but speed 0
      } else {
        currentDirection = 'forward';
        motors.forward(currentSpeed); // Set direction of motor, but speed 0
      }
      console.log(`Running motors in ${currentDirection} direction`);
      console.log('Accelerating...');
      accelerate();
    });
  }
  flipMotorDirection();
});
