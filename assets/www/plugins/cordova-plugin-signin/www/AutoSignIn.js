
cordova.define('cordova-plugin-signin.AutoSignIn', function(require, exports, module) {
               var exec = require("cordova/exec");
               
               function AutoSignIn() {};

               AutoSignIn.prototype.receiveBleSN = {}

               AutoSignIn.prototype.call_native = function(action, args, callback){
               ret = cordova.exec(callback, null, 'AutoSignIn', action, args)
               return ret
               }
               
               // 暂停打卡
               AutoSignIn.prototype.pauseSignIn = function () {
               exec(null, null, 'AutoSignIn', 'pauseSignIn', []);
               };

               // 重开打卡
               AutoSignIn.prototype.reopenSignIn = function () {
               exec(null, null, 'AutoSignIn', 'reopenSignIn', []);
               };

               // 设置sn列表
               AutoSignIn.prototype.setSnList = function (opt) {
               exec(null, null, 'AutoSignIn', 'setSnList', [opt]);
               };

               // 原生代码调用的js接口
               AutoSignIn.prototype.autoSignInInAndroidCallback = function (data) {
                    data = JSON.stringify(data)
                    console.log('AutoSignIn:autoSignInInAndroidCallback' + data) // 打印日志
                    this.receiveBleSN = JSON.parse(data)
                    cordova.fireDocumentEvent('signin.autoSignIn', this.receiveBleSN) // 回调指定的接口
                    if (device.platform == 'Android') {
                        this.call_native("signIn", [], null) // 调用原生的接口
                    }
               }

               // 登录成功
               AutoSignIn.prototype.loginSuccess = function () {
               exec(null, null, 'AutoSignIn', 'loginSuccess', []);
               };

               // 插件初始化接口
               AutoSignIn.prototype.initBlePlugin = function () {
               exec(null, null, 'AutoSignIn', 'initBlePlugin', []);
               };

               if(!window.plugins){
                    window.plugins = {}
               }

               if(!window.plugins.autoSignIn){
                    window.plugins.autoSignIn = new AutoSignIn();
               }


               module.exports = new AutoSignIn();
               
               });

