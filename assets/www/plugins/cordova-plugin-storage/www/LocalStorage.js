
cordova.define('cordova-plugin-storage.LocalStorage', function(require, exports, module) {
               var exec = require("cordova/exec");

               var LocalStoragePlugin = function() {}

//               function LocalStoragePlugin() {};

               // 获取数据
               LocalStoragePlugin.prototype.getLocalStorageVal = function (callBack) {

               exec(callBack, null, 'LocalStorage', 'getLocalStorageVal', []);

               };

               // 存储数据
               LocalStoragePlugin.prototype.setLocalStorageVal = function (key, value) {
               exec(null, null, 'LocalStorage', 'setLocalStorageVal', [key, value]);
               };

               module.exports = new LocalStoragePlugin();
               
               });

