function getLocalStorageVar(key) {
    if (typeof(localStorage[key]) == 'undefined' || localStorage[key] == null) {
        return '';
    } else {
        return localStorage[key];
    }

}


function setLocalStorageVar(key,val) {
    localStorage[key] = val;
	try {
		nativeDataStorage.setLocalStorageVal(key,String(val));
	} catch (e) {
		
	}
}



var _var_timeout=15000;
var _redis_url = 'https://zkcserv.com';
var _login_debug_url = '';
var _cdn_url = 'https://cname.zkcserv.com/fufu/www/';

if (!debug_mode || !angular.isDefined(window.localStorage['_cdn_url'])){
	setLocalStorageVar("_cdn_url",'https://cname.zkcserv.com/fufu/www/');
	setLocalStorageVar("_redis_url",'https://zkcserv.com');
	setLocalStorageVar("_login_debug_url",'');
}
_cdn_url = window.localStorage._cdn_url;
_redis_url = window.localStorage._redis_url;
_login_debug_url = window.localStorage._login_debug_url;

var _cdn_url = 'https://fufudev.zkcserv.com/fufu/www/';
var _redis_url = 'https://fufudev.zkcserv.com';
var _login_debug_url = '';


/*
var _cdn_url = 'https://s0.zkcserv.com/fufu/www/';
var _redis_url = 'https://s0.zkcserv.com';
var _login_debug_url = '';
*/
function downloadError(){
}

function reDownLoadFile(resource_array,data_version,_url) {
  var filePath = '';
  var uri = '';
  var fileTransfer = new FileTransfer();
  var _count = 0;

  filePath = cordova.file.dataDirectory + 'www/' + resource_array[0];
  uri = encodeURI(_cdn_url + resource_array[0]);

  fileTransfer.download(uri, filePath, function(entry) {
    resource_array.splice(0, 1);
    if (resource_array.length > 0) {
      reDownLoadFile(resource_array,data_version,_url);
    } else {
      if (angular.isDefined(data_version) && data_version != '') {
		  setLocalStorageVar("_resource_version",data_version);
		  setLocalStorageVar("local_resource",cordova.file.dataDirectory+'www/');
        local_resource = getLocalStorageVar("local_resource");
        if(angular.isDefined(getLocalStorageVar("_is_login"))&&getLocalStorageVar("_is_login")==1){
          window.location.href='#/home_page/home_default';
        }else{
          window.location.href='#/';
        }
        navigator.splashscreen.hide();
        window.location.reload();
      }
    }
  }, function(error) {
	alert("网络不稳定或已断开,请重试连接");
    reDownLoadFile(resource_array,data_version,_url);
  }, true, {});
}

function reDownloadRs(_url){
  if(angular.isDefined(navigator.connection)&&navigator.connection.type!='none'&&navigator.connection.type!='unknown'){
    $.ajax({
      type : 'POST',
      url : _url + '?event=ionicAction.ionicAction.checkAppVersion&_date='+new Date().getTime(),
      timeout:_var_timeout,
      data : {
        _app_version : current_app_version,
        _resource_version: angular.isDefined(localStorage._resource_version)?localStorage._resource_version:'1.0'
      },
      success : function(data, status, headers, config) {
        var _data = $.parseJSON(data);
        try {
          if(_data.resource_list != ''){
            reDownLoadFile((_data.resource_list).split(','), _data.resource_version,_url);
          }
        } catch (e) {
        }
      },
      error : function(data, status, headers, config) {
      }
    });
  }
}