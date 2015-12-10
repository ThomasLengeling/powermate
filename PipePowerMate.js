var HID = require('node-hid');
var PowerMate = require('node-powermate');

var PipePowerMate = function(index, midiOut, oscOut, oscIn, oscMin, oscMax){
  this.channel = index;
  this.midiOut = midiOut;
  this.oscOut = oscOut;
  this.oscIn  = oscIn;
  this.oscMin = oscMin || 0;
  this.oscMax = oscMax || 127;
  this.powerMate = new PowerMate(index);
  this.curMidiValue = 0;
  this.curOscValue = 0;

  var self = this;

  this.powerMate.on('wheelTurn', function(wheelDelta){
    if(self.midiOut) self.midiWheelOut(wheelDelta);
    if(self.oscOut) self.oscWheelOut(wheelDelta);
  });

  this.powerMate.on('buttonDown', function(){
    if(self.midiOut) self.midiButtonDown();
    if(self.oscOut) self.oscButtonDown();
  });

  this.powerMate.on('buttonUp', function(){
    if(self.midiOut) self.midiButtonUp();
    if(self.oscOut) self.oscButtonUp();
  });

  this.powerMate.on('buttonUp', function(){
    if(self.midiOut) self.midiButtonUp();
    if(self.oscOut) self.oscButtonUp();
  });

  this.oscIn.on("message", function (msg, rinfo) {
      var inMsg = new String(msg[0]);
      var compare = new String("/brightness");
      if(inMsg.valueOf() === compare.valueOf()){
        console.log(msg[0]);
        console.log(msg[1]);
        self.powerMate.setBrightness( parseInt( msg[1] ) );
      }
  });

};

PipePowerMate.countPowerMate = function(){
  var devices = HID.devices();
  var count = 0;
  for(var i=0,len=devices.length;i<len;i++){
    if(devices[i].product === 'Griffin PowerMate') count++;
  }

  return count;
};


PipePowerMate.prototype.midiWheelOut = function(value){
  this.curMidiValue += value;
  if(this.curMidiValue>127) this.curMidiValue=127;
  if(this.curMidiValue<0) this.curMidiValue=0;

  //Send control change message
  this.midiOut.sendMessage([176,this.channel,this.curMidiValue]);
};

PipePowerMate.prototype.oscWheelOut = function(value){
  this.curOscValue += value;
  if(this.curOscValue>this.oscMax) this.curOscValue=this.oscMax;
  if(this.curOscValue<this.oscMin) this.curOscValue=this.oscMin;
  this.oscOut.send('/pmWheelTurn', this.channel, this.curOscValue);
};

PipePowerMate.prototype.midiButtonDown = function(){
  this.midiOut.sendMessage([176, this.channel, 127]);
};

PipePowerMate.prototype.oscButtonDown = function(){
  this.oscOut.send('/pmButtonDown', this.channel);
};

PipePowerMate.prototype.midiButtonUp = function(){
  this.midiOut.sendMessage([176, this.channel, 0]);
};

PipePowerMate.prototype.oscButtonUp = function(){
  this.oscOut.send('/pmButtonUp', this.channel);
};

PipePowerMate.prototype.message = function(msg, rinfo){
  this.oscOut.send('/pmButtonUp', this.channel);
};

PipePowerMate.prototype.close = function(value){
  this.powerMate.close();
};

module.exports = PipePowerMate;
