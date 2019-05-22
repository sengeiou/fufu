
cordova.define('cordova-plugin-networkinfo.Network', function(require, exports, module) {
               var exec = require("cordova/exec");
               
               function Network() {};
               
               Network.prototype.wifiInfo = function (getversion,error) {
               exec(getversion, error, 'Network', 'wifiInfo', []);
               };

               Network.prototype.wifiList = function (getversion) {
               exec(getversion, null, 'Network', 'wifiList', []);
               };

               var loc = new Network();
               module.exports = loc;
               
               });

