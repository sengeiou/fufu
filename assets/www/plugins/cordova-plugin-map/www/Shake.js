cordova.define("cordova-plugin-shake.Shake", function(require, exports, module) { 
               var exec = require("cordova/exec");
               
               function Shake() {};
               
               Shake.prototype.shake = function (getversion) {
               exec(getversion, null, 'Shake', 'shake', []);
               };
               
               var gcapp = new Shake();
               module.exports = gcapp;

function Shake() {};

Shake.prototype.stop = function (getversion) {
    exec(getversion, null, 'Shake', 'stop', []);
};

var stop = new Shake();
module.exports = stop;



});
