cordova.define("cordova-plugin-shake.Location", function(require, exports, module) { 
               var exec = require("cordova/exec");
               
               function Location() {};
               
               Location.prototype.location = function (getversion) {
               exec(getversion, null, 'Location', 'location', []);
               };
               
               var loc = new Location();
               module.exports = loc;
               

});
