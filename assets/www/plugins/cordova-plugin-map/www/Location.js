
cordova.define('cordova-plugin-map.Location', function(require, exports, module) {
               var exec = require("cordova/exec");

               function Location() {};

               //当前地点
               Location.prototype.location = function (getversion,error) {
               exec(getversion, error, 'Location', 'location', []);
               };

               //显示地图及附近地点
               Location.prototype.showMap = function (getversion, opt) {
               exec(getversion, null, 'Location', 'showMap', [opt]);
               };

               //显示地图可以搜索地点
               Location.prototype.searchMap = function (popoverOptions,getversion) {
               exec(getversion, null, 'Location', 'searchMap', [popoverOptions]);
               };

               //将地点在地图上显示出来
               Location.prototype.showMapWithCoordinate = function (popoverOptions) {
               var args = [popoverOptions];
               exec(null, null, 'Location', 'showMapWithCoordinate', args);
               };

               //上报地点汇总
               Location.prototype.singCountMap = function (popoverOptions,getversion) {
               exec(getversion, null, 'Location', 'singCountMap', [popoverOptions]);
               };

               //判断定位功能是否可用
               Location.prototype.checkCanLocation = function (getversion) {
               exec(getversion, null, 'Location', 'checkCanLocation', []);
               };

               var loc = new Location();
               module.exports = loc;

               });

