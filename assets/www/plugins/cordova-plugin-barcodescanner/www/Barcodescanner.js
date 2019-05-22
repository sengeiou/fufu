
cordova.define('cordova-plugin-barcodescanner.BarcodeScanner', function(require, exports, module) {
        var exec = cordova.require("cordova/exec");

        function BarcodeScanner() {};

        // 扫描二维码
        BarcodeScanner.prototype.scan = function (getversion) {
        exec(getversion, null, 'BarcodeScanner', 'scan', []);
        };

        // 关闭二维码扫描
        BarcodeScanner.prototype.close = function () {
        exec(null, null, 'BarcodeScanner', 'close', []);
        };

        // 相机权限检测
        BarcodeScanner.prototype.checkCameraPermission = function (success) {
        exec(success, null, 'BarcodeScanner', 'checkCameraPermission', []);
        };

        module.exports = new BarcodeScanner();
});
