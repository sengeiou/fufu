
cordova.define('cordova-plugin-bluetooth.Bluetooth', function(require, exports, module) {
        var exec = cordova.require("cordova/exec");

        function Bluetooth() {};

        Bluetooth.prototype.receiveStatus = {}

        // 蓝牙检测
        Bluetooth.prototype.checkBluetooth = function (success) {
        exec(success, null, 'Bluetooth', 'checkBluetooth', []);
        };

        // 蓝牙扫描
        Bluetooth.prototype.bleScan = function (success) {
        exec(success, null, 'Bluetooth', 'bleScan', []);
        };

        // 蓝牙扫描, 指定SN码
        Bluetooth.prototype.bleScanWithSn = function (success, opt) {
        exec(success, null, 'Bluetooth', 'bleScanWithSn', [opt]);
        };

        // 设置wifi配置
        Bluetooth.prototype.setWifiConfig = function (success, opt) {
        exec(success, null, 'Bluetooth', 'setWifiConfig', [opt]);
        };

        // 设置sn
        Bluetooth.prototype.setSnList = function (opt) {
        exec(null, null, 'Bluetooth', 'setSnList', [opt]);
        };

        // 取消配置
        Bluetooth.prototype.cancelBleConfig = function () {
        exec(null, null, 'Bluetooth', 'cancelBleConfig', []);
        };

        // 蓝牙检测
        Bluetooth.prototype.checkOneToOneConnect = function (success) {
        exec(success, null, 'Bluetooth', 'checkOneToOneConnect', []);
        };

        // 序列号删除成功
        Bluetooth.prototype.deleteSnSuccess = function () {
        exec(null, null, 'Bluetooth', 'deleteSnSuccess', []);
        };

        // 设置有线网络配置
        Bluetooth.prototype.setWiredNetworkConfig = function (opt) {
        exec(null, null, 'Bluetooth', 'setWiredNetworkConfig', [opt]);
        };

        // 原生代码调用的js接口
        Bluetooth.prototype.bluetoothPluginInAndroidCallback = function (data) {
             data = JSON.stringify(data)
             console.log('Bluetooth:bluetoothPluginInAndroidCallback' + data) // 打印日志
             this.receiveStatus = JSON.parse(data)
             cordova.fireDocumentEvent('bluetooth.receiveStatus', this.receiveStatus) // 回调指定的接口
        }

        if(!window.plugins){
             window.plugins = {}
        }

        if(!window.plugins.bluetoothPlugin){
             window.plugins.bluetoothPlugin = new Bluetooth();
        }

        module.exports = new Bluetooth();
});
