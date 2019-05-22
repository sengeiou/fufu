var _var_timeout=15000;
var _cdn_url = 'https://s0.zkcserv.com/fufu/www/';
var _redis_url = 'https://s0.zkcserv.com';
var _login_debug_url = '';

//var _cdn_url = 'https://cname.zkcserv.com/fufu/www/';
function downloadError(){
}

window.error = function(){
}

function checkAppVersion(_url,$ionicPopup,$ionicLoading){
    $.ajax({
      type : 'POST',
      url : _url + '?event=ionicAction.ionicAction.checkAppVersion&_date='+new Date().getTime(),
      timeout:_var_timeout,
      data : {
        _app_version : current_app_version
      },
      success : function(data, status, headers, config) {
        var _data = $.parseJSON(data);
        try {
          if (_data.flag == '1') {
            $ionicPopup.alert({
              title : '运行结果',
              template : '<div style="text-align: center;">'
              + _data.message + '</div>',
              okText : '确定'
            }).then(function(res) {
              if (ionic.Platform.isIOS()) {
		 window.open(_data.ios_app_download_url, '_system', 'enableViewportScale=yes');
              } else {
                try {
                  var remoteFile = encodeURI(_data.android_app_download_url);
                  $ionicLoading.show({
                    template : "服服已下载：0%"
                  });
                  var ft = new FileTransfer();
                  ft.onprogress = function(
                    progressEvent) {
                    if (progressEvent.lengthComputable) {
                      var value = Math
                        .round(100 * (progressEvent.loaded / progressEvent.total));
                      $ionicLoading
                        .show(
                        {
                          template : "服服已下载："
                          + value
                          + "%"
                        });
                    }
                  };
                  ft.download(
                    remoteFile,
                    'file:///storage/sdcard0/Download/fufu.apk',
                    function(entry) {
                      $ionicLoading.hide();
                      $ionicPopup
                        .alert(
                        {
                          title : '服服更新',
                          template : '<div style="text-align: center;">服服下载完成,请确认安装</div>',
                          okText : '确定'
                        })
                        .then(
                        function(
                          res) {
                          window.plugins.webintent
                            .startActivity(
                            {
                              action : window.plugins.webintent.ACTION_VIEW,
                              url : entry
                                .toURL(),
                              type : 'application/vnd.android.package-archive'
                            },
                            function() {
                            },
                            function() {
                            });
                        })
                    },downloadError);
                } catch (e) {
                }
              }
            });
          }
        } catch (e) {
        }
      },
      error : function(data, status, headers, config) {
      }
    });
}
