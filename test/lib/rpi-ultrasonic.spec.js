
var RpiUltrasonic = require("../../lib/rpi-ultrasonic");
var chai = require("chai");
chai.should();

describe("#rpi-ultrasonic", function(){
  var upData = null;
  var app = {
    createClient: function(id){
      return {
        updatePredicate: function(pred, groundings, data){
          upData = {pred:pred, groundings:groundings, data:data};
        }
      }
    }
  };

  afterEach(function(){
    upData = null;
  });

  it("should create RpiUltrasonic", function(){
    var rpiU = new RpiUltrasonic({id:"test", echoPin:24, triggerPin:23});
    rpiU.id.should.equal("test");
  });

  it("should addTo application", function(){
    var rpiU = new RpiUltrasonic({id:"test", echoPin:24, triggerPin:23});
    rpiU.addTo(app);
    upData.pred.should.equal("initialized(Type)");
  });

  it("should sense", function(done){
    var rpiU = new RpiUltrasonic({id:"test", echoPin:24, triggerPin:23});
    rpiU.addTo(app);
    setTimeout(function(){
      console.log(upData);
      done();
    }, 1000)

  });
})
