var RpiUltrasonic = require("./lib/rpi-ultrasonic");

module.exports = function(config){
  return new RpiUltrasonic(config);
};
