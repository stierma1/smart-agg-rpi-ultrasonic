var Bluebird = require("bluebird");
var statistics = require('math-statistics');
var usonic = require('r-pi-usonic');
var initCalled = false;

function RpiUltrasonic(config){
  this.id = config.id;
  this.intervalTime = config.interval || 1000;
  this.client = null;
  this.interval = null;
  this.rate = config.rate || 5;
  this.delay = config.delay || 10;
  var self = this;
  if(initCalled){
    self.sensor = usonic.createSensor(config.echoPin, config.triggerPin, config.timeout || 750);
  } else {
    initCalled = true;
    usonic.init(function(err){
      self.sensor = usonic.createSensor(config.echoPin, config.triggerPin, config.timeout || 750);
    });
  }
}

RpiUltrasonic.prototype.addTo = function(app){
  var self = this;
  this.client = app.createClient(this.id);
  this.client.updatePredicate("initialized(Type)", ["UltraSonic"], this.id);
  //this.performSense();
  this.interval = setInterval(function(){
    self.performSense();
  }, this.intervalTime)
}

RpiUltrasonic.prototype.performSense = function(){
  var self = this;
  this.sense()
    .then(function(data){
      var distance = parseFloat(data);
      self.client.updatePredicate("action(ActionId, TimeStamp)", ["DistanceSense", Date.now()], data);
      if(distance <= 5){
        self.client.updatePredicate("distance(Low, High, TimeStamp)", ["0","5", Date.now()], data);
      } else if(distance > 5 && distance <= 10){
        self.client.updatePredicate("distance(Low, High, TimeStamp)", ["5","10", Date.now()], data);
      } else if(distance > 10 && distance <= 20){
        self.client.updatePredicate("distance(Low, High, TimeStamp)", ["10","20", Date.now()], data);
      } else if(distance > 20 && distance <= 40){
        self.client.updatePredicate("distance(Low, High, TimeStamp)", ["20","40", Date.now()], data);
      } else if(distance > 40 && distance <= 80){
        self.client.updatePredicate("distance(Low, High, TimeStamp)", ["40","80", Date.now()], data);
      } else {
        self.client.updatePredicate("distance(Low, High, TimeStamp)", ["80","120", Date.now()], data);
      }
    })
    .catch(function(err){
      self.client.updatePredicate("error(ActionId, TimeStamp)", ["DistanceSense", Date.now()], err);
    });
}

RpiUltrasonic.prototype.sense = function(){
  var defer = Bluebird.defer();
  var self = this;
  var distances = [];
  var print = function(distances) {
      var distance = statistics.median(distances);

      if (distance < 0) {
          defer.reject(new Error("Measurement Fails"))
      } else {
          defer.resolve(distance.toFixed(5));
      }
  };

  (function measure() {
      if (!distances || distances.length === self.rate) {
          if (distances) {
              print(distances);
              return;
          }

          distances = [];
      }

      setTimeout(function() {
          distances.push(self.sensor());
          measure();
      }, self.delay);
  }())

  return defer.promise;
}

module.exports = RpiUltrasonic;
