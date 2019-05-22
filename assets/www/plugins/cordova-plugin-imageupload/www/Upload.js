
cordova.define('cordova-plugin-imageupload.ImageUpload', function(require, exports, module) {
               var exec = require("cordova/exec");
               
               function ImageUpload() {};

               ImageUpload.prototype.getAssetImage = function (getversion) {
               exec(getversion, '', 'ImageUpload', 'getAssetImage', []);
               };

               ImageUpload.prototype.upload = function (getversion,popoverOptions) {
                   exec(getversion, '', 'ImageUpload', 'upload', [popoverOptions]);
               };
               
               var loc = new ImageUpload();
               module.exports = loc;
               
               });

