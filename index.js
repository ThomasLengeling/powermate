var midi = require('midi');
var osc = require('node-osc');

var midiOut = new midi.output();
midiOut.openVirtualPort('PowerMate');
var oscOut = new osc.Client('127.0.0.1', 13210);

var oscIn = new osc.Server(12110, '0.0.0.0');

var PipePowerMate = require('./PipePowerMate');

//Count powermates
var powerMates = [];
var deviceCount = PipePowerMate.countPowerMate();
console.log(deviceCount);
for(var i=0;i<deviceCount;i++){
  powerMates.push(new PipePowerMate(i, midiOut, oscOut, oscIn, 0, 1000));
}

process.on('SIGINT', function() {
  for(var i=0, len = powerMates.length;i<len;i++){
    powerMates[i].close();
  }
    if(midiOut) midiOut.closePort();
    if(oscOut) oscOut.kill();
    if(oscIn) oscIn.kill();

    console.log("Closing powerMate");
    process.exit(0);
});
