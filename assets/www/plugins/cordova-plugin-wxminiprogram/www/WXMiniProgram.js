
cordova.define('cordova-plugin-wxminiprogram.WXMiniProgram', function(require, exports, module) {
               var exec = require("cordova/exec");
               
               function WXMiniPorgram() {};
               
               // 打开小程序
               WXMiniPorgram.prototype.launchMiniProgram = function (opt) {
               exec(null, null, 'WXMiniProgram', 'launchMiniProgram', [opt]);
               };


               module.exports = new WXMiniPorgram();
               
               });

