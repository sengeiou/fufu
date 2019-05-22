
window.addDataFlag = true;
if(current_app_version == '1.1'){
  local_resource = _cdn_url;
}
var fufu_register_timeout;
var add_finger_timeout;

var fufu_message_box_counter = 0;
var fufu_message_box_timeout;
var fufu_message_box_duration = 2;

var fufu_success_message_box_counter = 0;
var fufu_success_message_box_timeout;
var fufu_success_message_box_duration = 0.7;

var fufu_show_loading_counter = 0;
var loading_process_timeout;
var fufu_show_loading = false;

var login_init_flag = 0;
var login_flag = 0;
var fufu_processing = false;

var fufu_network_error_msg = '网络链接超时';

var _cur_sn_no = '';

function getQueryString(url,name) {

   var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)","i");

   var r = url.substr(1).match(reg);

   if (r!=null) return (r[2]); return null;

}

function fufuMobclickAgent(key){
  try	{
    MobclickAgent.onEvent(key);
  } catch(e) {

  }
}

function splitSignDate(signDate){
  var curDate = (new Date().getFullYear()).toString();
  if(typeof(signDate)!='undefined'&&signDate.length>=10){
    return curDate.substr(0,2)+signDate.substr(0,2)+"-"+signDate.substr(2,2)+"-"+signDate.substr(4,2)+" "+signDate.substr(6,2)+":"+signDate.substr(8,2);
  }else{
    return '';
  }
}


function get_two_place_differ_meter(longitude_begin,latitude_begin,longitude_end,latitude_end) {
  var Distance;
  var EARTH_RADIUS = 6378.137;
  var RadLatBegin,RadLatEnd,RadLatDiff,RadLngDiff;
  RadLatBegin = latitude_begin * Math.PI / 180.0;
  RadLatEnd = latitude_end * Math.PI /180.0;
  RadLatDiff = RadLatBegin - RadLatEnd;
  RadLngDiff = longitude_begin * Math.PI / 180.0 - longitude_end * Math.PI / 180.0;
  Distance = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(RadLatDiff/2), 2)+Math.cos(RadLatBegin)*Math.cos(RadLatEnd)*Math.pow(Math.sin(RadLngDiff/2), 2)));
  Distance = Distance * EARTH_RADIUS;
  return Distance*1000.0;
}

function getNowFormatDate() {
  var date = new Date();
  var seperator1 = "-";
  var seperator2 = ":";
  var month = date.getMonth() + 1;
  var strDate = date.getDate();
  if (month >= 1 && month <= 9) {
    month = "0" + month;
  }
  if (strDate >= 0 && strDate <= 9) {
    strDate = "0" + strDate;
  }
  var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
    + " " + (date.getHours()<10?'0'+date.getHours():date.getHours()) + seperator2 + (date.getMinutes()<10?'0'+date.getMinutes():date.getMinutes());
  return currentdate;
}

function downloadFiles(bu,vip_resource_version,resource_array, $rootScope, data_version, $ionicPopup,_url, $ionicLoading, $location,totalCounter) {
  var filePath = '';
  var uri = '';
  var fileTransfer = new FileTransfer();
  var _count = 0;

  filePath = cordova.file.dataDirectory + 'www/' + resource_array[0];
  uri = encodeURI(_cdn_url + resource_array[0])+"?_dc="+new Date().getTime();
  fileTransfer.download(uri, filePath, function(entry) {
    if (resource_array.length > 0) {
      var value = parseInt((totalCounter-resource_array.length+1)/totalCounter*100);
      $ionicLoading.show({
        template: '正在加载 '+value+'%'
      });
    }
    resource_array.splice(0, 1);
    if (resource_array.length > 0) {
		 downloadFiles(bu,vip_resource_version, resource_array, $rootScope, data_version, $ionicPopup, _url, $ionicLoading, $location, totalCounter);
	 } else {
		 $rootScope.hideLoading();
		 if ((angular.isDefined(data_version) && data_version != '') || (angular.isDefined(vip_resource_version) && vip_resource_version != '')) {
			 if (angular.isDefined(vip_resource_version) && vip_resource_version != ''&&bu!="") {
				 setLocalStorageVar("_vip_resource_version",vip_resource_version);
				 setLocalStorageVar("_vip_bu",bu);
			 }
			 if (angular.isDefined(data_version) && data_version != '') {
				 setLocalStorageVar("_resource_version",data_version);
			 }
			 setLocalStorageVar("local_resource",cordova.file.dataDirectory + 'www/');
			 local_resource = window.localStorage.local_resource;
			 $ionicPopup.alert({
				 title: '版本信息',
				 template: '<div style="text-align: center;">服服有新版本，请点击确定按钮开始更新</div>',
				 okText: '确定'
			 }).then(function(res) {
				 if (angular.isDefined(window.localStorage['_is_login']) && window.localStorage['_is_login'] == 1) {
					 window.location.href = '#/home_page/home_default';
				 } else {
					 window.location.href = '#/';
				 }
				 window.location.reload();
			 });
		 }
	 }
  }, function(error) {
    $rootScope.hideLoading();
    $ionicPopup.alert({
      title : '版本信息',
      template : '<div style="text-align: center;">网络不稳定或已断开,请重试连接</div>',
      okText : '确定'
    }).then(function(res) {
      $rootScope.showLoading();
      downloadFiles(bu,vip_resource_version,resource_array, $rootScope, data_version, $ionicPopup,_url, $ionicLoading, $location,totalCounter);
    });
  }, true, {});
}

function reSendJpushData(){
  if(angular.isDefined(localStorage._user_name)&&localStorage._user_name!=""&&angular.isDefined(localStorage._pass_word)&&localStorage._pass_word!=""&&angular.isDefined(localStorage._notification_token)&&localStorage._notification_token!=''){
    $.ajax({
      type : 'POST',
      url: window.localStorage['_remote_server_addr']+'?event=ionicAction.ionicAction.resendJushData&_date='+new Date().getTime(),
      data:{
        _user_name:localStorage._user_name,
        _pass_word:localStorage._pass_word,
        _notification_token:localStorage._notification_token,
        _is_login:1,
        _device_type:localStorage._device_type
      },
      timeout:_var_timeout,
      success : function(data, status, headers, config) {
      },
      error : function(data, status, headers, config) {
      }
    });
  }
}

function downloadAdsFile(_ads_version,resource_list) {
  var filePath = '';
  var uri = '';
  var fileTransfer = new FileTransfer();
  var _count = 0;

  filePath = cordova.file.dataDirectory + 'www/' + resource_list;
  uri = encodeURI(_cdn_url + resource_list)+"?_dc="+new Date().getTime();
  fileTransfer.download(uri, filePath, function(entry) {
     setLocalStorageVar("_ads_version",_ads_version);
	 setLocalStorageVar("_ads_url",resource_list);
	 setLocalStorageVar("_ads_local_resource",cordova.file.dataDirectory + 'www/');
  }, function(error) {
   
  }, true, {});
}

function checkAdsVersion(_url){
  var _str = '&_user_name=' + window.localStorage['_user_name'] + '&_pass_word=' + window.localStorage['_pass_word'] + '&_is_login=' + window.localStorage['_is_login'] + '&_notification_token=' + window.localStorage['_notification_token'] + '&_device_type=' + window.localStorage['_device_type'];
  $.ajax({
    type : 'POST',
    url : _url + '?event=ionicAction.ionicAction.checkAdsVersion&_date='+new Date().getTime()+_str,
    timeout:_var_timeout,
    data : {
      _ads_version: angular.isDefined(localStorage._ads_version)?localStorage._ads_version:'1.0'
    },
    success : function(data, status, headers, config) {
      try {
        var _data = $.parseJSON(data);
		if(_data.resource_list != ''){
		  downloadAdsFile(_data._ads_version,_data.resource_list);
		}
      } catch (e) {
		console.log(e);
      }
    },
    error : function(data, status, headers, config) {
    }
  });
}


function checkMbAppVersion(_url,$ionicPopup,$ionicLoading,$rootScope,$location){
  var _str = '&_user_name=' + window.localStorage['_user_name'] + '&_pass_word=' + window.localStorage['_pass_word'] + '&_is_login=' + window.localStorage['_is_login'] + '&_notification_token=' + window.localStorage['_notification_token'] + '&_device_type=' + window.localStorage['_device_type'];
  $.ajax({
    type : 'POST',
    url : _url + '?event=ionicAction.ionicAction.checkAppVersion&_date='+new Date().getTime()+_str,
    timeout:_var_timeout,
    data : {
      _app_version : current_app_version,
      _device_type:ionic.Platform.platform(),
	  _vip_resource_version:angular.isDefined(localStorage._vip_resource_version)?localStorage._vip_resource_version:'1.0',
      _resource_version: angular.isDefined(localStorage._resource_version)?localStorage._resource_version:'1.0'
    },
    success : function(data, status, headers, config) {
      try {
        var _data = $.parseJSON(data);
		if(_data.flag == '-1'){
			$ionicPopup.alert({
				title : '提醒',
				template : '<div style="text-align: center;">'
				+ _data.message + '</div>',
				okText : '确定'
			  }).then(function(res) {
				setLocalStorageVar("_pass_word","");
				setLocalStorageVar("_is_login","0");
				setLocalStorageVar("_remote_server_addr","");
				localStorage._remote_server_addr="";
				login_init_flag=0;
				$location.path('/');
			  });
			  return;
		}

        if(angular.isDefined(_data.roster_data)&&_data.roster_data!=""&&_data.roster_data.flag==1){
		  setLocalStorageVar("roster_card_data",JSON.stringify(_data.roster_data.card_date));
          if(_data.roster_data.sn!=""){
            autosignin.setSnList(_data.roster_data.sn);
          }else{
			autosignin.setSnList("");
		  }
      
          //autosignin.setSnList("3368170600001,4059165200016");
        }else{
		  setLocalStorageVar("roster_card_data",'{"flag": 0,"card_date": [],"sn": ""}');
        }

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
              window.open(_data.android_app_download_url+'?_dc='+new Date().getTime(), '_system');
            }
          });
        }else{

          if(localStorage._resource_version=='1.2.001'){
            if(angular.isDefined(_data.resource_version)&&_data.resource_version!=''){
              window.localStorage._resource_version = _data.resource_version;
              window.localStorage.local_resource = cordova.file.dataDirectory+'www/';
              local_resource = window.localStorage.local_resource;
            }
            return;
          }else{
            if(_data.resource_list != ''){
              downloadFiles(_data.bu,_data.vip_resource_version,(_data.resource_list).split(','), $rootScope, _data.resource_version, $ionicPopup,_url, $ionicLoading, $location,((_data.resource_list).split(',')).length);
            }
          }
        }
      } catch (e) {

      }
    },
    error : function(data, status, headers, config) {
    }
  });
}

angular.module('citymobi', ['ionic', 'citymobi.services', 'citymobi.controllers','citymobi.directives','citymobi.filters'])
  .run(function($ionicPlatform,$rootScope,$ionicLoading,$ionicPopup,$location,$ionicHistory,$ionicScrollDelegate,$ionicViewSwitcher,atMbIndoorSettingDetailSev,
                LvBalanceTeamRecordSev,atSignInSev,homemessageSev,sideSelect,timeSelect,zoomSlider,$timeout,LvTeamRecordSev,essMyApplyDSev,essMyOtApplyDSev,
                essMyOutApplyDSev,essMyApprovalDSev,essMyApprovalDOTSev,essMyApprovalDFSev,essMyApprovalDOSev,homeMessageDetailSev,OtTeamRecordSev,
                cardAdjTeamRecordSev,OutdoorTeamRecordSev,homeMessageContentSev,atSignInNewSev,userHomeService,essMyCardAdjApplyDSev,essMyApprovalDCardAdjSev,
                cardAdjTeamRecordDetailByTypeSev,homeMessageSecretarySev,homeMessageSystemSev,atTeamRecordSev,atTeamRecordByTypeDetailSev,$ionicScrollDelegate,employeeContractSev,sysUserSev,
                menulistService,payrollCalSev,atAnalySev,autoRosSev,attendanceDeviceSev,attendanceMemberSev,essMyTravelingSev,essMyApprovalTravelingSev,TravelingTeamRecordSev,homeMessageVisitorNoticeSev,screenSev,homeMessageOpendoorNoticeSev,leaveBatchApprovalSev,overtimeBatchApprovalSev,businessBatchApprovalSev,workoutBatchApprovalSev,outBatchApprovalSev,supplementBatchApprovalSev,fieldworkBatchApprovalSev, homeMessageContentBatchSev) {

    window.navbarBackClick = function(){
      $ionicHistory.goBack();
    }
    $rootScope.get_utc_time_zone=function(){
        var time_zone_str;
        var new_time_z=new Date().getTimezoneOffset();
        //var new_time_z=480;
        var new_time_z_abs= Math.abs(new_time_z);

        if(new_time_z_abs%60==0){
            if(parseInt(new_time_z_abs/60)>=10){
                time_zone_str= parseInt(new_time_z_abs/60)+":00";
            }
            else{
                time_zone_str= "0"+parseInt(new_time_z_abs/60)+":00";
            }

        }
        else{
            if(parseInt(new_time_z_abs/60)>10){
                if(new_time_z_abs%60>=10){
                    time_zone_str=parseInt(new_time_z_abs/60)+":"+new_time_z_abs%60
                }
                else{
                    time_zone_str=parseInt(new_time_z_abs/60)+":0"+new_time_z_abs%60
                }

            }
            else{
                if(new_time_z_abs%60>=10){
                    time_zone_str="0"+parseInt(new_time_z_abs/60)+":"+new_time_z_abs%60
                }
                else{
                    time_zone_str="0"+parseInt(new_time_z_abs/60)+":0"+new_time_z_abs%60
                }
            }

        }

        if(new_time_z>0){
            time_zone_str="-"+time_zone_str;
        }
        else{
            time_zone_str="+"+time_zone_str;
        }
        return time_zone_str;
    }
    $rootScope.showSystemMaintPopup = function(popup_str){
      var vpCallback = function(res){
      }
      function callback(pCallback){
        if(pCallback && typeof pCallback == 'function'){
          vpCallback = pCallback
        }
      }
      $ionicPopup.alert({
        title:'',
        template: '<div style="overflow:hidden;border-radius:10px 10px 0 0;padding-left:0px !important;padding-right:0px !important;"><div style="width:7.2rem;height:4.66666666666rem;"><img src='+local_resource + "img/icon/system_update_img.png"+' alt="" style="width:100%;height:4.66666667rem;"/></div> <div style="padding:20px;color:#333;font-size:14px;padding-bottom:25px;line-height:21px; background:white;">'+ popup_str +'</div></div>',
        okType: 'button-dark',
        cssClass:'system_maint_popup',
        okText: '确定'
      }).then(function (res) {
        vpCallback(res)
      });
      return {
        then : callback
      }
    }
    $rootScope.showPayConfirm = function(){
      $ionicPopup.alert({
          title:'',
          template: '<div style="overflow:hidden;border-top-left-radius: 10px;border-top-right-radius: 10px;padding-left:0px !important;padding-right:0px !important;"><div style="width:7.2rem;height:4.66666666666rem;"><img src=' + local_resource + "img/icon/pay_tip_bgimg.png" + ' alt="" style="width:100%;height:4.66666667rem;"/></div> <div style="padding:20px;color:#000;font-size:0.4266666667rem;line-height:150%;background-color:#fff;">贵司服服版本不支持该版本，如需使用请前往服服web端付费开通或升级服服系统版本。</div></div>',
          okType: 'button-dark',
          cssClass:'system_maint_popup',
          okText: '我知道了'
      }).then(function (res) {
          $ionicHistory.goBack();
      });
    }
    window.navbarSearchClearValue=function(current_id){
      var sev_name = $("#"+current_id).attr("sev_name");
      document.getElementById(sev_name+'CloseIonic').style.display='none';
      document.getElementById(sev_name+'SearchInput').value='';
      $timeout(function(){
		 if (sev_name == 'essMyTrave'){
          essMyTravelingSev.setSearchValue(document.getElementById(sev_name+'SearchInput').value);
        }
        if (sev_name == 'essMyApprovalTraveling'){
          essMyApprovalTravelingSev.setSearchValue(document.getElementById(sev_name+'SearchInput').value);
        }

        /* add at 2019-01-17 by kevin begin */ 
        /* 批量审批搜索模块 */ 
        if (sev_name == 'leaveBatchApproval'){
            leaveBatchApprovalSev.setSearchValue(document.getElementById(sev_name+'SearchInput').value);
        }
        if (sev_name == 'overtimeBatchApproval'){
          overtimeBatchApprovalSev.setSearchValue(document.getElementById(sev_name+'SearchInput').value);
        }
        if (sev_name == 'businessBatchApproval'){
          businessBatchApprovalSev.setSearchValue(document.getElementById(sev_name+'SearchInput').value);
        }
        if (sev_name == 'workoutBatchApproval'){
          workoutBatchApprovalSev.setSearchValue(document.getElementById(sev_name+'SearchInput').value);
        }
        if (sev_name == 'outBatchApproval'){
          outBatchApprovalSev.setSearchValue(document.getElementById(sev_name+'SearchInput').value);
        }
        if (sev_name == 'supplementBatchApproval'){
          supplementBatchApprovalSev.setSearchValue(document.getElementById(sev_name+'SearchInput').value);
        }
        if (sev_name == 'fieldworkBatchApproval'){
            fieldworkBatchApprovalSev.setSearchValue(document.getElementById(sev_name+'SearchInput').value);
        }
        /* add at 2019-01-17 by kevin end */ 

        if (sev_name == 'TravelingTeamRecord'){
          TravelingTeamRecordSev.setSearchValue(document.getElementById(sev_name+'SearchInput').value);
        }
        /* add by kevin at 2018-12-05 begin */
        // 访客动态
        if(sev_name == "homeMessageVisitorNotice"){
            homeMessageVisitorNoticeSev.setSearchValue(document.getElementById(sev_name+'SearchInput').value);
            homeMessageVisitorNoticeSev.setSearchState(false);
            homeMessageVisitorNoticeSev.setIsShowWrap(false);
            homeMessageVisitorNoticeSev.setSearchNodata(true);
            //document.getElementById("homeMessageVisitorNoticeHeadBar").style.display="none";
            $ionicScrollDelegate.scrollTop();
            var content_top='';
            if (ionic.Platform.isIOS()) {
              content_top='64';
            }
            else{
              content_top='44';
            }
            $('#homeMessageVisitorNoticeContent').attr("style","top:"+content_top+"px");
          }
        /* add by kevin at 2018-12-05 end */

        if (sev_name == 'essMyApplyD'||sev_name == 'essMyApplyDF'||sev_name == 'essMyApplyDO' ){
          essMyApplyDSev.setSearchValue(document.getElementById(sev_name+'SearchInput').value);
        }
        if (sev_name == 'essMyOtApplyD'){
          essMyOtApplyDSev.setSearchValue(document.getElementById(sev_name+'SearchInput').value);
        }
        if (sev_name == 'cardAdjTeamRecordDetailByType'){
          cardAdjTeamRecordDetailByTypeSev.setSearchValue(document.getElementById(sev_name+'SearchInput').value);
        }
        if (sev_name == 'essMyCardAdjApplyD'){
          essMyCardAdjApplyDSev.setSearchValue(document.getElementById(sev_name+'SearchInput').value);
        }
        if (sev_name == 'essMyOutApplyD'){
          essMyOutApplyDSev.setSearchValue(document.getElementById(sev_name+'SearchInput').value);
        }
        if (sev_name == 'essMyApprovalD'){
          essMyApprovalDSev.setSearchValue(document.getElementById(sev_name+'SearchInput').value);
        }
        if (sev_name == 'essMyApprovalDOT'){
          essMyApprovalDOTSev.setSearchValue(document.getElementById(sev_name+'SearchInput').value);
        }
        if (sev_name == 'essMyApprovalDCardAdj'){
          essMyApprovalDCardAdjSev.setSearchValue(document.getElementById(sev_name+'SearchInput').value);
        }
        if (sev_name == 'essMyApprovalDF'|| sev_name == 'essMyApprovalDOF'){
          essMyApprovalDFSev.setSearchValue(document.getElementById(sev_name+'SearchInput').value);
        }
        if (sev_name == 'essMyApprovalDO'){
          essMyApprovalDOSev.setSearchValue(document.getElementById(sev_name+'SearchInput').value);
        }
        if (sev_name == 'LvTeamRecord'){
          LvTeamRecordSev.setSearchValue(document.getElementById(sev_name+'SearchInput').value);
        }
        if (sev_name == 'LvBalanceTeamRecord'){
          document.getElementById('statistics_content_div').style.display='none';
          LvBalanceTeamRecordSev.setSearchValue(document.getElementById(sev_name+'SearchInput').value);
          LvBalanceTeamRecordSev.setSearchState(false);
          LvBalanceTeamRecordSev.setIsShowWrap(false);
          LvBalanceTeamRecordSev.setSearchNodata(true);
          //document.getElementById("homeMessageDetailHeadBar").style.display="none";

          $ionicScrollDelegate.scrollTop();
          var content_top='';
          if (ionic.Platform.isIOS()) {
            content_top='64';
          }
          else{
            content_top='44';
          }
          $('#LeaveBalanceTeamRecordContent').attr("style","top:"+content_top+"px");


          LvBalanceTeamRecordSev.setSearchValue(document.getElementById(sev_name+'SearchInput').value);


        }
        if (sev_name == 'homeMessageContent'){
          homeMessageContentSev.setSearchValue(document.getElementById(sev_name+'SearchInput').value);
        }
        if (sev_name == 'homeMessageContentBatch'){
          homeMessageContentBatchSev.setSearchValue(document.getElementById(sev_name+'SearchInput').value);
        }
        if (sev_name == 'homeMessageSecretary'){
          homeMessageSecretarySev.setSearchValue(document.getElementById(sev_name+'SearchInput').value);
        }
        if (sev_name == 'homeMessageSystem'){
          homeMessageSystemSev.setSearchValue(document.getElementById(sev_name+'SearchInput').value);
        }
        if(sev_name == "homeMessageDetail"){
          homeMessageDetailSev.setSearchValue(document.getElementById(sev_name+'SearchInput').value);
          homeMessageDetailSev.setSearchState(false);
          homeMessageDetailSev.setIsShowWrap(false);
          homeMessageDetailSev.setSearchNodata(true);
          //document.getElementById("homeMessageDetailHeadBar").style.display="none";
          $ionicScrollDelegate.scrollTop();
          var content_top='';
          if (ionic.Platform.isIOS()) {
            content_top='64';
          }
          else{
            content_top='44';
          }
          $('#homeMessageDetailContent').attr("style","top:"+content_top+"px");
        }
        if(sev_name == "employeeContract"){
          employeeContractSev.setSearchValue(document.getElementById(sev_name+'SearchInput').value);
          employeeContractSev.setSearchState(false);
          employeeContractSev.setIsShowWrap(false);
          employeeContractSev.setSearchNodata(true);
          //document.getElementById("homeMessageDetailHeadBar").style.display="none";
          $ionicScrollDelegate.scrollTop();
          var content_top='';
          if (ionic.Platform.isIOS()) {
            content_top='64';
          }
          else{
            content_top='44';
          }
          $('#employeeContractContent').attr("style","top:"+content_top+"px");
        }



        if(sev_name == "atTeamRecordByTypeD"){
          atTeamRecordByTypeDetailSev.clearSearchValue();


          atTeamRecordByTypeDetailSev.setSearchState(false);
          atTeamRecordByTypeDetailSev.setIsShowWrap(false);
          atTeamRecordByTypeDetailSev.setSearchNodata(true);
          //document.getElementById("homeMessageDetailHeadBar").style.display="none";

          $ionicScrollDelegate.scrollTop();
          var content_top='';
          if (ionic.Platform.isIOS()) {
            content_top='64';
          }
          else{
            content_top='44';
          }
          $('#AtTeamRecordByTypeDetailContent').attr("style","top:"+content_top+"px");
        }

        if(sev_name == "atTeamRecord"){
          atTeamRecordSev.clearSearchValue();
          atTeamRecordSev.setSearchState(false);
          atTeamRecordSev.setIsShowWrap(false);
          atTeamRecordSev.setSearchNodata(true);
          document.getElementById("at_team_record_statistics_content_div").style.display="none";

          $ionicScrollDelegate.scrollTop();
          var content_top='';
          if (ionic.Platform.isIOS()) {
            content_top='64';
          }
          else{
            content_top='44';
          }
          $('#atTeamRecordContent').attr("style","top:"+content_top+"px");
        }

      })
    }
    window.navbarShowSearch=function(current_id){

      if(current_id=='homeMessageDetailSearch'){
        $ionicScrollDelegate.scrollTop();
        homeMessageDetailSev.setIsShowWrap(false);
        homeMessageDetailSev.setSearchNodata(true);
        var sev_name = $("#"+current_id).attr("sev_name");
        document.getElementById(sev_name+"SearchDiv").style.display='block';
        document.getElementById(sev_name+"SearchDiv").style.opacity='1';
        document.getElementById(sev_name+"Back").style.display='none';

        $timeout(function(){document.getElementById(sev_name+'SearchInput').focus();})

      }
      else if(current_id=='LvBalanceTeamRecordSearch'){
    
        var content_top='';
        if (ionic.Platform.isIOS()) {
          content_top='64';
        }
        else{
          content_top='44';
        }
        $('#LeaveBalanceTeamRecordContent').attr("style","top:"+content_top+"px");

        document.getElementById('statistics_content_div').style.display='none';
        $ionicScrollDelegate.scrollTop();
        LvBalanceTeamRecordSev.setIsShowWrap(false);
        LvBalanceTeamRecordSev.setSearchNodata(true);
        var sev_name = $("#"+current_id).attr("sev_name");


        document.getElementById(sev_name+"SearchDiv").style.opacity='1';
        document.getElementById(sev_name+"SearchDiv").style.display='block';
        document.getElementById(sev_name+"Back").style.display='none';

        $timeout(function(){$('.'+sev_name+'SearchInput').focus();})
      }
      else  if(current_id=='atTeamRecordByTypeDSearch'){
        $ionicScrollDelegate.scrollTop();
        atTeamRecordByTypeDetailSev.setIsShowWrap(false);
        atTeamRecordByTypeDetailSev.setSearchNodata(true);
        var sev_name = $("#"+current_id).attr("sev_name");
        document.getElementById(sev_name+"SearchDiv").style.display='block';
        document.getElementById(sev_name+"SearchDiv").style.opacity='1';
        document.getElementById(sev_name+"Back").style.display='none';
        $timeout(function(){$("."+sev_name+'SearchInput').focus();})
      }
      else  if(current_id=='atTeamRecordSearch'){


        document.getElementById('at_team_record_statistics_content_div').style.display='none';
        $ionicScrollDelegate.scrollTop();
        atTeamRecordSev.setIsShowWrap(false);
        atTeamRecordSev.setSearchNodata(true);
        var sev_name = $("#"+current_id).attr("sev_name");
        document.getElementById(sev_name+"SearchDiv").style.display='block';
        document.getElementById(sev_name+"SearchDiv").style.opacity='1';
        document.getElementById(sev_name+"Back").style.display='none';
        $timeout(function(){$("."+sev_name+'SearchInput').focus();})
      }
      else 	if(current_id=='employeeContractSearch'){
        $ionicScrollDelegate.scrollTop();
        employeeContractSev.setIsShowWrap(false);
        employeeContractSev.setSearchNodata(true);
        var sev_name = $("#"+current_id).attr("sev_name");
        document.getElementById(sev_name+"SearchDiv").style.display='block';
        document.getElementById(sev_name+"SearchDiv").style.opacity='1';
        document.getElementById(sev_name+"Back").style.display='none';

        $timeout(function(){document.getElementById(sev_name+'SearchInput').focus();})

      }
      else if(current_id=='homeMessageVisitorNoticeSearch'){
        /* add by kevin at 2018-12-05 begin */
        $ionicScrollDelegate.scrollTop();
        homeMessageVisitorNoticeSev.setIsShowWrap(false);
        homeMessageVisitorNoticeSev.setSearchNodata(true);
        var sev_name = $("#"+current_id).attr("sev_name");
        document.getElementById(sev_name+"SearchDiv").style.display='block';
        document.getElementById(sev_name+"SearchDiv").style.opacity='1';
        document.getElementById(sev_name+"Back").style.display='none';

        $timeout(function(){document.getElementById(sev_name+'SearchInput').focus();})
        /* add by kevin at 2018-12-05 end */
      }else{
        var sev_name = $("#"+current_id).attr("sev_name");
        document.getElementById(sev_name+"SearchDiv").style.display='block';

        $timeout(function(){
          document.getElementById(sev_name+"SearchDiv").style.opacity='1';
          $timeout(function(){
            document.getElementById(sev_name+"Back").style.display='none';
          },200)

        },300);
        $timeout(function(){$("."+sev_name+'SearchInput').focus();})

      }

    }
    window.navbarSearchCancel=function(current_id){
      var sev_name = $("#"+current_id).attr("sev_name");

      document.getElementById(sev_name+'CloseIonic').style.display='none';
      document.getElementById(sev_name+"Back").style.display='block';
      $timeout(function(){

        /* add at 2019-01-17 by kevin begin */ 
        /* 批量审批搜索模块 */ 
        if (sev_name == 'leaveBatchApproval'){
            leaveBatchApprovalSev.clearSearchValue();
        }
        if (sev_name == 'overtimeBatchApproval'){
            overtimeBatchApprovalSev.clearSearchValue();
        }
        if (sev_name == 'businessBatchApproval'){
            businessBatchApprovalSev.clearSearchValue();
        }
        if (sev_name == 'workoutBatchApproval'){
            workoutBatchApprovalSev.clearSearchValue();
        }
        if (sev_name == 'outBatchApproval'){
            outBatchApprovalSev.clearSearchValue();
        }
        if (sev_name == 'supplementBatchApproval'){
            supplementBatchApprovalSev.clearSearchValue();
        }
        if (sev_name == 'fieldworkBatchApproval'){
            fieldworkBatchApprovalSev.clearSearchValue();
        }
        /* add at 2019-01-17 by kevin end */ 

		/* add by kevin at 2018-06-05 begin */ 
        if (sev_name == 'essMyTrave'){
          essMyTravelingSev.clearSearchValue();
        }
        if (sev_name == 'essMyApprovalTraveling'){
          essMyApprovalTravelingSev.clearSearchValue();
        }
        
        if (sev_name == 'TravelingTeamRecord'){
          TravelingTeamRecordSev.clearSearchValue();
        }
        /* add by kevin at 2018-06-05 end */

        /* add by kevin at 2018-12-05 begin */  
        // 访客动态
        if (sev_name == 'homeMessageVisitorNotice'){

            var  homeMessageVisitorNoticeSearchControl=homeMessageVisitorNoticeSev.getSearchValue();
          homeMessageVisitorNoticeSev.setIsShowWrap(true);
          homeMessageVisitorNoticeSev.setSearchNodata(false);
          //homeMessageVisitorNoticeSev.setSearchState(false);
          var content_top='';
          if (ionic.Platform.isIOS()) {
            content_top='64';
          }
          else{
            content_top='44';
          }
          $('#homeMessageVisitorNoticeContent').attr("style","top:"+content_top+"px");
          if(homeMessageVisitorNoticeSearchControl.search_val==''){
            //		  $("#homeMessageVisitorNoticeWrap").css("display","block");
            $timeout(function(){
              $ionicScrollDelegate.scrollTop();
              homeMessageVisitorNoticeSev.setIsShowWrap(true);
              homeMessageVisitorNoticeSev.loadData(homeMessageVisitorNoticeSearchControl.search_val);
            })

          }
          else{
            $ionicScrollDelegate.scrollTop();
            homeMessageVisitorNoticeSev.clearSearchValue();
            homeMessageVisitorNoticeSev.loadData(homeMessageVisitorNoticeSearchControl.search_val);
          }

        }
        /* add by kevin at 2018-12-05 end */ 
        if (sev_name == 'essMyApplyD'||sev_name == 'essMyApplyDF'||sev_name == 'essMyApplyDO' ){
          essMyApplyDSev.clearSearchValue();
        }
        if (sev_name == 'essMyOtApplyD'){
          essMyOtApplyDSev.clearSearchValue();
        }
        if (sev_name == 'cardAdjTeamRecordDetailByType'){
          cardAdjTeamRecordDetailByTypeSev.clearSearchValue();
        }
        if (sev_name == 'essMyCardAdjApplyD'){

          essMyCardAdjApplyDSev.clearSearchValue();
        }
        if (sev_name == 'essMyOutApplyD'){
          essMyOutApplyDSev.clearSearchValue();
        }
        if (sev_name == 'essMyApprovalD'){
          essMyApprovalDSev.clearSearchValue();
        }
        if (sev_name == 'essMyApprovalDOT'){
          essMyApprovalDOTSev.clearSearchValue();
        }
        if (sev_name == 'essMyApprovalDCardAdj'){

          essMyApprovalDCardAdjSev.clearSearchValue();
        }
        if (sev_name == 'essMyApprovalDF' || sev_name == 'essMyApprovalDOF'){
          essMyApprovalDFSev.clearSearchValue();
        }
        if (sev_name == 'essMyApprovalDO'){
          essMyApprovalDOSev.clearSearchValue();
        }
        if (sev_name == 'LvTeamRecord'){
          LvTeamRecordSev.clearSearchValue();
        }
        if (sev_name == 'LvBalanceTeamRecord'){
          document.getElementById('statistics_content_div').style.display='block';
          var dept_id= $("#LeaveBalanceTeamRecordDeptId").html();
          var  LvBalanceTeamRecordSearchControl=LvBalanceTeamRecordSev.getSearchValue();
          LvBalanceTeamRecordSev.setIsShowWrap(true);
          LvBalanceTeamRecordSev.setSearchNodata(false);
          //homeMessageDetailSev.setSearchState(false);
          var content_top='';
          if (ionic.Platform.isIOS()) {
            content_top='104';
          }
          else{
            content_top='84';
          }
          $('#LeaveBalanceTeamRecordContent').attr("style","top:"+content_top+"px");
          if(LvBalanceTeamRecordSearchControl.search_val==''){
            //		  $("#homeMessageDetailWrap").css("display","block");
            $timeout(function(){
              $ionicScrollDelegate.scrollTop();
              LvBalanceTeamRecordSev.setIsShowWrap(true);
              LvBalanceTeamRecordSev.loadData(dept_id,LvBalanceTeamRecordSearchControl.search_val);
            })
          }
          else{
            $ionicScrollDelegate.scrollTop();
            LvBalanceTeamRecordSev.clearSearchValue();
            LvBalanceTeamRecordSev.loadData(dept_id,LvBalanceTeamRecordSearchControl.search_val);
          }
          /*
           $ionicScrollDelegate.scrollTop();
           LvBalanceTeamRecordSev.clearSearchValue();
           LvBalanceTeamRecordSev.loadData(dept_id,LvBalanceTeamRecordSearchControl.search_val);
           */
        }

        if (sev_name == 'atTeamRecord'){
          document.getElementById('at_team_record_statistics_content_div').style.display='block';
          var dept_id= $("#atTeamRecordDeptId").html();
          var current_date_str= $("#atTeamRecordCurrentDateStr").html();
          var  atTeamRecordSearchControl=atTeamRecordSev.getSearchValue();
          atTeamRecordSev.setIsShowWrap(true);
          atTeamRecordSev.setSearchNodata(false);
          //homeMessageDetailSev.setSearchState(false);
          var content_top='';
          if (ionic.Platform.isIOS()) {
            content_top='104';
          }
          else{
            content_top='84';
          }
          $('#atTeamRecordContent').attr("style","top:"+content_top+"px");
          if(atTeamRecordSearchControl.search_val==''){
            //		  $("#homeMessageDetailWrap").css("display","block");
            $timeout(function(){
              $ionicScrollDelegate.scrollTop();
              atTeamRecordSev.setIsShowWrap(true);
              atTeamRecordSev.loadData(current_date_str,dept_id);
            })
          }
          else{
            $ionicScrollDelegate.scrollTop();
            atTeamRecordSev.clearSearchValue();
            atTeamRecordSev.loadData(current_date_str,dept_id);
          }

        }

        if (sev_name == 'homeMessageContent'){
          homeMessageContentSev.clearSearchValue();
        }
        if (sev_name == 'homeMessageContentBatch'){
          homeMessageContentBatchSev.clearSearchValue();
        }
        if (sev_name == 'homeMessageSecretary'){
          homeMessageSecretarySev.clearSearchValue();
        }
        if (sev_name == 'homeMessageSystem'){
          homeMessageSystemSev.clearSearchValue();
        }


        if (sev_name == 'homeMessageDetail'){
          var  homeMessageDetailSearchControl=homeMessageDetailSev.getSearchValue();
          homeMessageDetailSev.setIsShowWrap(true);
          homeMessageDetailSev.setSearchNodata(false);
          //homeMessageDetailSev.setSearchState(false);
          var content_top='';
          if (ionic.Platform.isIOS()) {
            content_top='64';
          }
          else{
            content_top='44';
          }
          $('#homeMessageDetailContent').attr("style","top:"+content_top+"px");



          if(homeMessageDetailSearchControl.search_val==''){
            //		  $("#homeMessageDetailWrap").css("display","block");
            $timeout(function(){
              $ionicScrollDelegate.scrollTop();
              homeMessageDetailSev.setIsShowWrap(true);
              homeMessageDetailSev.loadData('process_notice',homeMessageDetailSearchControl.search_val);
            })

            //alert("123");
          }
          else{
            $ionicScrollDelegate.scrollTop();
            homeMessageDetailSev.clearSearchValue();
            homeMessageDetailSev.loadData('process_notice',homeMessageDetailSearchControl.search_val);
          }
        }

        if (sev_name == 'employeeContract'){
          var  employeeContractSearchControl=employeeContractSev.getSearchValue();
          employeeContractSev.setIsShowWrap(true);
          employeeContractSev.setSearchNodata(false);
          var content_top='';
          if (ionic.Platform.isIOS()) {
            content_top='64';
          }
          else{
            content_top='44';
          }
          $('#employeeContractContent').attr("style","top:"+content_top+"px");



          if(employeeContractSearchControl.search_val==''){
            //		  $("#homeMessageDetailWrap").css("display","block");
            $timeout(function(){
              $ionicScrollDelegate.scrollTop();
              employeeContractSev.setIsShowWrap(true);
              employeeContractSev.loadData(employeeContractSearchControl.search_val);
            })

            //alert("123");
          }
          else{
            $ionicScrollDelegate.scrollTop();
            employeeContractSev.clearSearchValue();
            employeeContractSev.loadData(employeeContractSearchControl.search_val);
          }
        }

        if(sev_name == 'atTeamRecordByTypeD'){

          var dept_id= $("#"+sev_name+"SearchInput").attr("dept_id");
          var type= $("#"+current_id).attr("type_name");
          var date_text =$("#"+current_id).attr("date_text");
          //atTeamRecordByTypeDetailSev.clearSearchValue();
          //atTeamRecordByTypeDetailSev.loadData(type,date_text,dept_id);

          var  atTeamRecordByTypeDetailSearchControl=atTeamRecordByTypeDetailSev.getSearchValue();
          atTeamRecordByTypeDetailSev.setIsShowWrap(true);
          atTeamRecordByTypeDetailSev.setSearchNodata(false);
          //homeMessageDetailSev.setSearchState(false);
          var content_top='';
          if (ionic.Platform.isIOS()) {
            content_top='64';
          }
          else{
            content_top='44';
          }
          $('#AtTeamRecordByTypeDetailContent').attr("style","top:"+content_top+"px");



          if(atTeamRecordByTypeDetailSearchControl.search_val==''){
//		  $("#homeMessageDetailWrap").css("display","block");
            $timeout(function(){
              $ionicScrollDelegate.scrollTop();
              atTeamRecordByTypeDetailSev.setIsShowWrap(true);
              atTeamRecordByTypeDetailSev.loadData(type,date_text,dept_id);
            })

            //alert("123");
          }
          else{
            $ionicScrollDelegate.scrollTop();
            atTeamRecordByTypeDetailSev.clearSearchValue();
            atTeamRecordByTypeDetailSev.loadData(type,date_text,dept_id);
          }




        }



      })
      document.getElementById(sev_name+'SearchInput').value='';
      document.getElementById(sev_name+"SearchDiv").style.opacity='0';
      $timeout(function(){
        document.getElementById(sev_name+"SearchDiv").style.display='none';
      },300);
    }
    window.navbarSearchInput=function(current_id){

      var sev_name = $("#"+current_id).attr("sev_name");
      if(document.getElementById(sev_name+'SearchInput').value==''){
        document.getElementById(sev_name+'CloseIonic').style.display='none';
      }
      else{
        document.getElementById(sev_name+'CloseIonic').style.display='block';
      }
      $timeout(function(){

        /* add at 2019-01-17 by kevin begin */ 
        /* 批量审批搜索模块 */ 
        if (sev_name == 'leaveBatchApproval'){
            leaveBatchApprovalSev.setSearchValue(document.getElementById(sev_name+'SearchInput').value);
          }
        if (sev_name == 'overtimeBatchApproval'){
            overtimeBatchApprovalSev.setSearchValue(document.getElementById(sev_name+'SearchInput').value);
        }
        if (sev_name == 'businessBatchApproval'){
            businessBatchApprovalSev.setSearchValue(document.getElementById(sev_name+'SearchInput').value);
          }
        if (sev_name == 'workoutBatchApproval'){
            workoutBatchApprovalSev.setSearchValue(document.getElementById(sev_name+'SearchInput').value);
        }
        if (sev_name == 'outBatchApproval'){
            outBatchApprovalSev.setSearchValue(document.getElementById(sev_name+'SearchInput').value);
          }
        if (sev_name == 'supplementBatchApproval'){
            supplementBatchApprovalSev.setSearchValue(document.getElementById(sev_name+'SearchInput').value);
        }
        if (sev_name == 'fieldworkBatchApproval'){
            fieldworkBatchApprovalSev.setSearchValue(document.getElementById(sev_name+'SearchInput').value);
        }
        /* add at 2019-01-17 by kevin end */ 

		/* add by kevin at 2018-06-05 begin */ 
        if (sev_name == 'essMyTrave'){
          essMyTravelingSev.setSearchValue(document.getElementById(sev_name+'SearchInput').value);
        }
        if (sev_name == 'essMyApprovalTraveling'){
          essMyApprovalTravelingSev.setSearchValue(document.getElementById(sev_name+'SearchInput').value);
        }
        if (sev_name == 'TravelingTeamRecord'){
          TravelingTeamRecordSev.setSearchValue(document.getElementById(sev_name+'SearchInput').value);
        }
        /* add by kevin at 2018-06-05 end */ 

        if (sev_name == 'essMyApplyD'||sev_name == 'essMyApplyDF'||sev_name == 'essMyApplyDO' ){
          essMyApplyDSev.setSearchValue(document.getElementById(sev_name+'SearchInput').value);
        }
        if (sev_name == 'essMyOtApplyD'){
          essMyOtApplyDSev.setSearchValue(document.getElementById(sev_name+'SearchInput').value);
        }
        if (sev_name == 'cardAdjTeamRecordDetailByType'){
          cardAdjTeamRecordDetailByTypeSev.setSearchValue(document.getElementById(sev_name+'SearchInput').value);
        }
        if (sev_name == 'essMyCardAdjApplyD'){
          essMyCardAdjApplyDSev.setSearchValue(document.getElementById(sev_name+'SearchInput').value);
        }
        if (sev_name == 'essMyOutApplyD'){
          essMyOutApplyDSev.setSearchValue(document.getElementById(sev_name+'SearchInput').value);
        }
        if (sev_name == 'essMyApprovalD'){
          essMyApprovalDSev.setSearchValue(document.getElementById(sev_name+'SearchInput').value);
        }
        if (sev_name == 'essMyApprovalDOT'){
          essMyApprovalDOTSev.setSearchValue(document.getElementById(sev_name+'SearchInput').value);
        }
        if (sev_name == 'essMyApprovalDCardAdj'){
          essMyApprovalDCardAdjSev.setSearchValue(document.getElementById(sev_name+'SearchInput').value);
        }
        if (sev_name == 'essMyApprovalDF' || sev_name == 'essMyApprovalDOF'){
          essMyApprovalDFSev.setSearchValue(document.getElementById(sev_name+'SearchInput').value);
        }
        if (sev_name == 'essMyApprovalDO'){
          essMyApprovalDOSev.setSearchValue(document.getElementById(sev_name+'SearchInput').value);
        }
        if (sev_name == 'LvTeamRecord'){
          LvTeamRecordSev.setSearchValue(document.getElementById(sev_name+'SearchInput').value);
        }
        if (sev_name == 'LvBalanceTeamRecord'){
          LvBalanceTeamRecordSev.setSearchValue(document.getElementById(sev_name+'SearchInput').value);
        }
        if (sev_name == 'homeMessageContent'){
          homeMessageContentSev.setSearchValue(document.getElementById(sev_name+'SearchInput').value);
        }
        if (sev_name == 'homeMessageContentBatch'){
          homeMessageContentBatchSev.setSearchValue(document.getElementById(sev_name+'SearchInput').value);
        }
        if (sev_name == 'homeMessageSecretary'){
          homeMessageSecretarySev.setSearchValue(document.getElementById(sev_name+'SearchInput').value);
        }
        if (sev_name == 'homeMessageSystem'){
          homeMessageSystemSev.setSearchValue(document.getElementById(sev_name+'SearchInput').value);
        }


      })
    }
    window.navbarSearchfocus=function(current_id){
      var sev_name = $("#"+current_id).attr("sev_name");
      if(document.getElementById(sev_name+'SearchInput').value==''){
        document.getElementById(sev_name+'CloseIonic').style.display='none';
      }
      else{
        document.getElementById(sev_name+'CloseIonic').style.display='block';
      }
    }

    window.navbarSearchblur=function(current_id){
      var sev_name = $("#"+current_id).attr("sev_name");
      document.getElementById(sev_name+'CloseIonic').style.display='none';
    }
    /* add by kevin at 2018-12-05 begin */ 
    window.homeMessageVisitorNoticeInpKeydown=function(event){
        var  homeMessageVisitorNoticeSearchControl=homeMessageVisitorNoticeSev.getSearchValue();
  
        var e = event || window.event || arguments.callee.caller.arguments[0];
        var keycode= e.KeyCode;
        setTimeout(function(){
          if(document.getElementById('homeMessageVisitorNoticeSearchInput').value==''){
            document.getElementById('homeMessageVisitorNoticeCloseIonic').style.display='none';
            homeMessageVisitorNoticeSev.setIsShowWrap(false);
            homeMessageVisitorNoticeSev.setSearchState(false);
            homeMessageVisitorNoticeSev.setSearchNodata(true);
            var content_top='';
            if (ionic.Platform.isIOS()) {
              content_top='64';
            }
            else{
              content_top='44';
            }
            $('#homeMessageVisitorNoticeContent').attr("style","top:"+content_top+"px");
  
          }
          else{
            homeMessageVisitorNoticeSev.setSearchNodata(false);
            document.getElementById('homeMessageVisitorNoticeCloseIonic').style.display='block';
            var content_top='';
            if (ionic.Platform.isIOS()) {
              content_top='132';
            }
            else{
              content_top='112';
            }
            $('#homeMessageVisitorNoticeContent').attr("style","top:"+content_top+"px");
  
  
          }
  
          $timeout(function(){
            homeMessageVisitorNoticeSearchControl.search_val=document.getElementById('homeMessageVisitorNoticeSearchInput').value;
          });
          //homeMessageVisitorNoticeSev.setSearchValue(document.getElementById('homeMessageVisitorNoticeSearchInput').value);
          //homeMessageVisitorNoticeSearchControl.search_val=document.getElementById('homeMessageVisitorNoticeSearchInput').value;
          //console.log(document.getElementById('homeMessageVisitorNoticeSearchInput').value);
          //console.log(homeMessageVisitorNoticeSev.getSearchValue().search_val);
        },100);
  
        if(e.keyCode=='13'){
          $timeout(function(){
  
            if(homeMessageVisitorNoticeSearchControl.search_val!=''){
              $ionicScrollDelegate.scrollTop();
              homeMessageVisitorNoticeSearchControl.search_val=document.getElementById('homeMessageVisitorNoticeSearchInput').value;
              homeMessageVisitorNoticeSev.loadData(homeMessageVisitorNoticeSearchControl.search_val);
            }
  
  
          })
        }
      }
      /* add by kevin at 2018-12-05 end */ 

    window.homeMessageDetailInpKeydown=function(event){
      var  homeMessageDetailSearchControl=homeMessageDetailSev.getSearchValue();

      var e = event || window.event || arguments.callee.caller.arguments[0];
      var keycode= e.KeyCode;
      setTimeout(function(){
        if(document.getElementById('homeMessageDetailSearchInput').value==''){
          document.getElementById('homeMessageDetailCloseIonic').style.display='none';
          homeMessageDetailSev.setIsShowWrap(false);
          homeMessageDetailSev.setSearchState(false);
          homeMessageDetailSev.setSearchNodata(true);
          var content_top='';
          if (ionic.Platform.isIOS()) {
            content_top='64';
          }
          else{
            content_top='44';
          }
          $('#homeMessageDetailContent').attr("style","top:"+content_top+"px");

        }
        else{
          homeMessageDetailSev.setSearchNodata(false);
          document.getElementById('homeMessageDetailCloseIonic').style.display='block';
          var content_top='';
          if (ionic.Platform.isIOS()) {
            content_top='132';
          }
          else{
            content_top='112';
          }
          $('#homeMessageDetailContent').attr("style","top:"+content_top+"px");


        }

        $timeout(function(){
          homeMessageDetailSearchControl.search_val=document.getElementById('homeMessageDetailSearchInput').value;
        });
        //homeMessageDetailSev.setSearchValue(document.getElementById('homeMessageDetailSearchInput').value);
        //homeMessageDetailSearchControl.search_val=document.getElementById('homeMessageDetailSearchInput').value;
        //console.log(document.getElementById('homeMessageDetailSearchInput').value);
        //console.log(homeMessageDetailSev.getSearchValue().search_val);
      },100);

      if(e.keyCode=='13'){
        $timeout(function(){

          if(homeMessageDetailSearchControl.search_val!=''){
            $ionicScrollDelegate.scrollTop();
            homeMessageDetailSearchControl.search_val=document.getElementById('homeMessageDetailSearchInput').value;
            homeMessageDetailSev.loadData('process_notice',homeMessageDetailSearchControl.search_val);
          }


        })
      }
    }

    window.employeeContractInpKeydown=function(event){

      var  employeeContractSearchControl=employeeContractSev.getSearchValue();

      var e = event || window.event || arguments.callee.caller.arguments[0];
      var keycode= e.KeyCode;
      setTimeout(function(){
        if(document.getElementById('employeeContractSearchInput').value==''){
          document.getElementById('employeeContractCloseIonic').style.display='none';
          employeeContractSev.setIsShowWrap(false);
          employeeContractSev.setSearchState(false);
          employeeContractSev.setSearchNodata(true);

          var content_top='';
          if (ionic.Platform.isIOS()) {
            content_top='64';
          }
          else{
            content_top='44';
          }
          $('#employeeContractContent').attr("style","top:"+content_top+"px");

        }
        else{
          employeeContractSev.setSearchNodata(false);

          document.getElementById('employeeContractCloseIonic').style.display='block';
          var content_top='';
          if (ionic.Platform.isIOS()) {
            content_top='132';
          }
          else{
            content_top='112';
          }
          $('#employeeContractContent').attr("style","top:"+content_top+"px");


        }

        $timeout(function(){
          employeeContractSearchControl.search_val=document.getElementById('employeeContractSearchInput').value;
        });
        //homeMessageDetailSev.setSearchValue(document.getElementById('homeMessageDetailSearchInput').value);
        //homeMessageDetailSearchControl.search_val=document.getElementById('homeMessageDetailSearchInput').value;
        //console.log(document.getElementById('homeMessageDetailSearchInput').value);
        //console.log(homeMessageDetailSev.getSearchValue().search_val);
      },100);

      if(e.keyCode=='13'){
        $timeout(function(){

          if(employeeContractSearchControl.search_val!=''){
            $ionicScrollDelegate.scrollTop();
            employeeContractSearchControl.search_val=document.getElementById('employeeContractSearchInput').value;
            employeeContractSev.loadData(employeeContractSearchControl.search_val);
          }


        })
      }
    }


    window.leaveBalanceTeamRecordInpKeydown=function(current_id,event){
      var dept_id= $("#"+current_id).attr("dept_id");
      var  leaveBalanceTeamRecordSearchControl=LvBalanceTeamRecordSev.getSearchValue();
      var e = event || window.event || arguments.callee.caller.arguments[0];
      var keycode= e.KeyCode;
      setTimeout(function(){
        if(document.getElementById('LvBalanceTeamRecordSearchInput').value==''){
          document.getElementById('LvBalanceTeamRecordCloseIonic').style.display='none';
          LvBalanceTeamRecordSev.setIsShowWrap(false);
          LvBalanceTeamRecordSev.setSearchState(false);
          LvBalanceTeamRecordSev.setSearchNodata(true);
          var content_top='';
          if (ionic.Platform.isIOS()) {
            content_top='64';
          }
          else{
            content_top='44';
          }
          $('#LeaveBalanceTeamRecordContent').attr("style","top:"+content_top+"px");


        }
        else{

          document.getElementById('LvBalanceTeamRecordCloseIonic').style.display='block';

          LvBalanceTeamRecordSev.setSearchNodata(false);

          var content_top='';
          if (ionic.Platform.isIOS()) {
            content_top='180';
          }
          else{
            content_top='160';
          }
          $('#LeaveBalanceTeamRecordContent').attr("style","top:"+content_top+"px");
        }

        $timeout(function(){
          leaveBalanceTeamRecordSearchControl.search_val=document.getElementById('LvBalanceTeamRecordSearchInput').value;
        });

      },100)

      if(e.keyCode=='13'){
        $timeout(function(){
          $ionicScrollDelegate.scrollTop();
          leaveBalanceTeamRecordSearchControl.search_val=document.getElementById('LvBalanceTeamRecordSearchInput').value;
          if(leaveBalanceTeamRecordSearchControl.search_val!=''){
            LvBalanceTeamRecordSev.loadData(dept_id,leaveBalanceTeamRecordSearchControl.search_val);
          }


        })
      }
    }

    window.atTeamRecordByTypeDInpKeydown=function(current_id,event){
      var type= $("#"+current_id).attr("type_name");
      var date_text =$("#"+current_id).attr("date_text");
      var dept_id= $("#"+current_id).attr("dept_id");
      var  atTeamRecordByTypeDetailSearchControl=atTeamRecordByTypeDetailSev.getSearchValue();
      var e = event || window.event || arguments.callee.caller.arguments[0];
      var keycode= e.KeyCode;
      setTimeout(function(){
        if(document.getElementById('atTeamRecordByTypeDSearchInput').value==''){
          document.getElementById('atTeamRecordByTypeDCloseIonic').style.display='none';
          atTeamRecordByTypeDetailSev.setIsShowWrap(false);
          atTeamRecordByTypeDetailSev.setSearchState(false);
          atTeamRecordByTypeDetailSev.setSearchNodata(true);
          var content_top='';
          if (ionic.Platform.isIOS()) {
            content_top='64';
          }
          else{
            content_top='44';
          }
          $('#AtTeamRecordByTypeDetailContent').attr("style","top:"+content_top+"px");
        }
        else{
          document.getElementById('atTeamRecordByTypeDCloseIonic').style.display='block';
          atTeamRecordByTypeDetailSev.setSearchNodata(false);
          var content_top='';
          if (ionic.Platform.isIOS()) {
            content_top='132';
          }
          else{
            content_top='112';
          }
          $('#AtTeamRecordByTypeDetailContent').attr("style","top:"+content_top+"px");
        }
        $timeout(function(){
          atTeamRecordByTypeDetailSearchControl.search_val=document.getElementById('atTeamRecordByTypeDSearchInput').value;
        });
      },100)
      if(e.keyCode=='13'){
        $timeout(function(){
          $ionicScrollDelegate.scrollTop();
          atTeamRecordByTypeDetailSearchControl.search_val=document.getElementById('atTeamRecordByTypeDSearchInput').value;
          if(atTeamRecordByTypeDetailSearchControl.search_val!='')
          {
            atTeamRecordByTypeDetailSev.loadData(type,date_text,dept_id);
          }
        })
      }
    }

    window.atTeamRecordInpKeydown=function(current_id,event){

      var dept_id= $("#atTeamRecordDeptId").html();
      var current_date_str= $("#atTeamRecordCurrentDateStr").html();



      var  atTeamRecordByTypeDetailSearchControl=atTeamRecordSev.getSearchValue();

      var e = event || window.event || arguments.callee.caller.arguments[0];
      var keycode= e.KeyCode;
      setTimeout(function(){
        if(document.getElementById('atTeamRecordSearchInput').value==''){
          document.getElementById('atTeamRecordCloseIonic').style.display='none';
          atTeamRecordSev.setIsShowWrap(false);
          atTeamRecordSev.setSearchState(false);
          atTeamRecordSev.setSearchNodata(true);
          var content_top='';
          if (ionic.Platform.isIOS()) {
            content_top='64';
          }
          else{
            content_top='44';
          }
          $('#atTeamRecordContent').attr("style","top:"+content_top+"px");
        }
        else{

          document.getElementById('atTeamRecordCloseIonic').style.display='block';
          atTeamRecordSev.setSearchNodata(false);
          var content_top='';
          if (ionic.Platform.isIOS()) {
            content_top='182';
          }
          else{
            content_top='162';
          }
          $('#atTeamRecordContent').attr("style","top:"+content_top+"px");
        }
        $timeout(function(){
          atTeamRecordByTypeDetailSearchControl.search_val=$('#atTeamRecordSearchInput').val();

        });
      },100)
      if(e.keyCode=='13'){
        $timeout(function(){
          $ionicScrollDelegate.scrollTop();
          atTeamRecordByTypeDetailSearchControl.search_val=document.getElementById('atTeamRecordSearchInput').value;
          if(atTeamRecordByTypeDetailSearchControl.search_val!='')
          {
            atTeamRecordSev.loadData(current_date_str,dept_id);
          }
        })
      }
    }
    window.onerror = function(message, url, lineNumber) {

      if (lineNumber == 167){
        return;
      }

      //alert(message + ' /// ' + url + ' /// ' + lineNumber);

      //alert('系统异常，请与管理员联系.');
      $('.backdrop').removeClass('visible').removeClass('active').removeClass('backdrop-loading');
      $('.loading-container').removeClass('visible').removeClass('active');
      fufu_processing = false;
      fufu_show_loading = false;

      var device_cordova = '';
      var device_model = '';
      var device_platform = '';
      var device_uuid = '';
      var device_version = '';
      if (typeof(device) != 'undefined'){
        device_cordova = device.cordova;
        device_model = device.model;
        device_platform = device.cordova;
        device_uuid = device.platform;
        device_version = device.version;
      }
      $.ajax({
        type: "POST",
        url: window.localStorage['_remote_server_addr']+'?event=ionicAction.ionicAction.saveErrorLog',
        timeout: _var_timeout,
        data: {
          device_cordova:device_cordova,
          device_model:device_model,
          device_platform:device_platform,
          device_uuid:device_uuid,
          device_version:device_version,
          error_msg_key:'ajax_error',
          error_detail: message + ' /// ' + url + ' /// ' + lineNumber,
          _user_name: window.localStorage['_user_name'],
          _pass_word: window.localStorage['_pass_word'],
          _is_login: window.localStorage['_is_login'],
          _notification_token: window.localStorage['_notification_token'],
          _device_type: window.localStorage['_device_type']
        },
        success: function (data) {
        },
        error:function(data){
        }
      });


      return true;
    }


    
    var back_button = 0;
    $rootScope.globalBackFunc = function (e) {
     
      e.preventDefault();

      if (fufu_show_loading_counter != 0){
     
        return;
      }

      if(back_button == 1){
        back_button = 0;
        return;
      }
      function exitApp() {
        ionic.Platform.exitApp();
      }

      function exitLogin() {
        $ionicPopup.confirm({
          title: '退出登录',
          template: '<div style="text-align: center;">是否退出系统?</div>',
          cancelType:'button-dark',
          cancelText: '取消',
          okText: '确定'
        }).then(function (res) {
          if (res) {
            $rootScope.showLoading();
            $.ajax({
              type: "GET",
              url: window.localStorage['_remote_server_addr']+'?event=ionicAction.ionicAction.doLogout',
              timeout: _var_timeout,
              success: function (data) {
                $rootScope.hideLoading();
                $ionicHistory.clearCache();
                $ionicHistory.clearHistory();
				setLocalStorageVar("_pass_word","");
				setLocalStorageVar("_is_login","0");
                $location.path('/');
              },
              error:function(data){
                $rootScope.hideLoading();
                $ionicPopup.alert({
                  title : '提醒',
                  template : '<div style="text-align: center;">服务器请求异常或网络超时</div>',
                  okText : '确定'
                })
              }
            });
          }
        });
      }

      if(zoomSlider.isOpen()) {
        zoomSlider.close();
      }else  if(sideSelect.isOpen()) {
        sideSelect.close();
      }else if(timeSelect.isOpen()){
        timeSelect.close();
      }else if ($location.path() == '/') {
        try{
          exitApp();
        }catch(e){}

      } else if ($location.path() == '/home_page/home_default') {
        //exitApp();
        //exitLogin();
        try{
          if(document.getElementById("fufu_message_container").style.display == "none"){
            window.fufuMessageBox('再按一次退出', fufu_message_box_duration, function() {});
          }
          else{
            exitApp();
          }
        }
        catch(e){

        }
      } else if ($location.path() == '/login_home_navigation') {
        //exitApp();
        //exitLogin();
        try{
          exitApp();
        }catch(e){}
      } else {
        if ($ionicHistory.currentView().stateName == 'home_page.leave_team_record') {
          if (LvTeamRecordSev.clearStatusBar()){
            $ionicHistory.goBack();
          }
          else{
            //alert('leave_team_record');
            //$ionicHistory.goBack();
          }
        }

         /* add at 2019-01-17 by kevin begin */ 
        /* 批量审批搜索模块 */ 
        else 	if ($ionicHistory.currentView().stateName == 'home_page.leave_batch_approval') {
            if (leaveBatchApprovalSev.clearStatusBar()){
              $ionicHistory.goBack();
            }
            else{
              //$ionicHistory.goBack();
            }
          }
          else 	if ($ionicHistory.currentView().stateName == 'home_page.overtime_batch_approval') {
            if (overtimeBatchApprovalSev.clearStatusBar()){
              $ionicHistory.goBack();
            }
            else{
              //$ionicHistory.goBack();
            }
          }
          else 	if ($ionicHistory.currentView().stateName == 'home_page.business_batch_approval') {
            if (businessBatchApprovalSev.clearStatusBar()){
              $ionicHistory.goBack();
            }
            else{
              //$ionicHistory.goBack();
            }
          }
          else 	if ($ionicHistory.currentView().stateName == 'home_page.workout_batch_approval') {
            if (workoutBatchApprovalSev.clearStatusBar()){
              $ionicHistory.goBack();
            }
            else{
              //$ionicHistory.goBack();
            }
          }
          else 	if ($ionicHistory.currentView().stateName == 'home_page.out_batch_approval') {
            if (outBatchApprovalSev.clearStatusBar()){
              $ionicHistory.goBack();
            }
            else{
              //$ionicHistory.goBack();
            }
          }
          else 	if ($ionicHistory.currentView().stateName == 'home_page.supplement_batch_approval') {
            if (supplementBatchApprovalSev.clearStatusBar()){
              $ionicHistory.goBack();
            }
            else{
              //$ionicHistory.goBack();
            }
          }
          else 	if ($ionicHistory.currentView().stateName == 'home_page.fieldwork_batch_approval') {
            if (fieldworkBatchApprovalSev.clearStatusBar()){
              $ionicHistory.goBack();
            }
            else{
              //$ionicHistory.goBack();
            }
          }
          /* add at 2019-01-17 by kevin end */ 

        else 	if ($ionicHistory.currentView().stateName == 'home_page.ot_team_record') {
          if (OtTeamRecordSev.clearStatusBar()){
            $ionicHistory.goBack();
          }
          else{
            //alert('leave_team_record');
            $ionicHistory.goBack();
          }
        }
        else 	if ($ionicHistory.currentView().stateName == 'home_page.card_adj_team_record') {
          if (cardAdjTeamRecordSev.clearStatusBar()){
            $ionicHistory.goBack();
          }
          else{
            //alert('leave_team_record');
            $ionicHistory.goBack();
          }
        }
        else 	if ($ionicHistory.currentView().stateName == 'home_page.at_team_record') {
          if (atTeamRecordSev.clearStatusBar()){
            $ionicHistory.goBack();
          }
          else{
            //alert('leave_team_record');
            $ionicHistory.goBack();
          }
        }
        else 	if ($ionicHistory.currentView().stateName == 'home_page.outdoor_team_record') {
          if (OutdoorTeamRecordSev.clearStatusBar()){
            $ionicHistory.goBack();
          }
          else{
            $ionicHistory.goBack();
          }
        }
        else 	if ($ionicHistory.currentView().stateName == 'home_page.ess_my_apply_details') {
          if (essMyApplyDSev.clearStatusBar()){
            $ionicHistory.goBack();
          }
          else{
            //$ionicHistory.goBack();
          }
        }
        else 	if ($ionicHistory.currentView().stateName == 'home_page.ess_my_ot_apply_details') {
          if (essMyOtApplyDSev.clearStatusBar()){
            $ionicHistory.goBack();
          }
          else{
            //$ionicHistory.goBack();
          }
        }
        else if ($ionicHistory.currentView().stateName == 'home_page.card_adj_team_record_detail_by_type') {
          if (cardAdjTeamRecordDetailByTypeSev.clearStatusBar()){
            $ionicHistory.goBack();
          }
          else{
            //$ionicHistory.goBack();
          }
        }
        else 	if ($ionicHistory.currentView().stateName == 'home_page.ess_my_card_adj_apply_details') {
          if (essMyCardAdjApplyDSev.clearStatusBar()){
            $ionicHistory.goBack();
          }
          else{
            //$ionicHistory.goBack();
          }
        }
        else 	if ($ionicHistory.currentView().stateName == 'home_page.ess_my_apply_details_fieldwork') {
          if (essMyApplyDSev.clearFieldworkStatusBar()){
            $ionicHistory.goBack();
          }
          else{
            //$ionicHistory.goBack();
          }
        }
        else 	if ($ionicHistory.currentView().stateName == 'home_page.ess_my_out_apply_details') {
          if (essMyOutApplyDSev.clearStatusBar()){
            $ionicHistory.goBack();
          }
          else{
            //$ionicHistory.goBack();
          }
        }
        else 	if ($ionicHistory.currentView().stateName == 'home_page.ess_my_apply_details_offic_work_out') {
          if (essMyApplyDSev.clearFieldworkOutStatusBar()){
            $ionicHistory.goBack();
          }
          else{
            //$ionicHistory.goBack();
          }
        }
        else 	if ($ionicHistory.currentView().stateName == 'home_page.ess_my_approval_details_overtime') {
          if (essMyApprovalDOTSev.clearStatusBar()){
            $ionicHistory.goBack();
          }
          else{
            //$ionicHistory.goBack();
          }
        }
        else 	if ($ionicHistory.currentView().stateName == 'home_page.ess_my_approval_details_card_adj') {
          if (essMyApprovalDCardAdjSev.clearStatusBar()){
            $ionicHistory.goBack();
          }
          else{
            //$ionicHistory.goBack();
          }
        }
        else 	if ($ionicHistory.currentView().stateName == 'home_page.ess_my_approval_details') {
          if (essMyApprovalDSev.clearStatusBar()){
            $ionicHistory.goBack();
          }
          else{
            //$ionicHistory.goBack();
          }
        }
        else 	if ($ionicHistory.currentView().stateName == 'home_page.ess_my_approval_details_fieldwork') {
          if (essMyApprovalDFSev.clearStatusBar()){
            $ionicHistory.goBack();
          }
          else{
            //$ionicHistory.goBack();
          }
        }
        else 	if ($ionicHistory.currentView().stateName == 'home_page.ess_my_approval_details_offic_work_out') {
          if (essMyApprovalDFSev.clearWorkOutStatusBar()){
            $ionicHistory.goBack();
          }
          else{
            //$ionicHistory.goBack();
          }
        }
        else 	if ($ionicHistory.currentView().stateName == 'home_page.ess_my_approval_details_out') {
          if (essMyApprovalDOSev.clearStatusBar()){
            $ionicHistory.goBack();
          }
          else{
            //$ionicHistory.goBack();
          }
        }
        else 	if ($ionicHistory.currentView().stateName == 'home_page.leave_balance_team_record') {
          if (LvBalanceTeamRecordSev.clearStatusBar()){
            $ionicHistory.goBack();
          }
          else{
            //alert('leave_team_record');
            //$ionicHistory.goBack();
          }
        }

        else if ($ionicHistory.currentView().stateName == 'home_page.at_sign_in_history') {
          $ionicViewSwitcher.nextDirection('forward');
          $ionicHistory.goBack();
        }

        else if ($ionicHistory.currentView().stateName == 'home_page.at_sign_in_new') {
          try{
            if(document.getElementById("fufu_message_container").style.display == "none"){
              window.fufuMessageBox('再按一次退出', fufu_message_box_duration, function() {});
            }
            else{
              exitApp();
            }
          }
          catch(e){

          }

        }

        else if ($ionicHistory.currentView().stateName == 'home_page.home_message') {
          try{
            if(document.getElementById("fufu_message_container").style.display == "none"){
              window.fufuMessageBox('再按一次退出', fufu_message_box_duration, function() {});
            }
            else{
              exitApp();
            }
          }
          catch(e){

          }


        }

        else if ($ionicHistory.currentView().stateName == 'home_page.home_at') {
          try{
            if(document.getElementById("fufu_message_container").style.display == "none"){
              window.fufuMessageBox('再按一次退出', fufu_message_box_duration, function() {});
            }
            else{
              exitApp();
            }
          }
          catch(e){

          }

        }

        else if ($ionicHistory.currentView().stateName == 'home_page.home_person') {
          try{
            if(document.getElementById("fufu_message_container").style.display == "none"){
              window.fufuMessageBox('再按一次退出', fufu_message_box_duration, function() {});
            }
            else{
              exitApp();
            }
          }
          catch(e){

          }

        }

        else {
         
          $ionicHistory.goBack();
         
        }
      }
      return false;
    }

    $rootScope.addEventGlobalBack = function(){
        
        $rootScope.removeEventGlobalBack = $ionicPlatform.registerBackButtonAction($rootScope.globalBackFunc, 101);
       
    }
 
    $rootScope.addEventGlobalBack();

    function showFufuLoading(){
      loading_process_timeout = setTimeout(showFufuLoading, 100);
      fufu_show_loading_counter ++;
      if ((fufu_show_loading_counter > 7 && !fufu_show_loading)) {
        fufu_show_loading_counter = 0;
        clearTimeout(loading_process_timeout);
        if (typeof(document.getElementById("fufu_spinner_container")) != 'undefined' && document.getElementById("fufu_spinner_container") != null){
          document.getElementById("fufu_spinner_container").style.display = "none";
          document.getElementById('fufu_spinner_div').style.display = "block";
          document.getElementById("fufu_spinner").className = "fufu_spinner";
        }
      }
      else {
        return;
      }
    }

    $rootScope.showLoading = function() {
      if (typeof(document.getElementById("fufu_spinner_container")) != 'undefined' && document.getElementById("fufu_spinner_container") != null){
        document.getElementById("fufu_spinner_container").style.display = "block";
        document.getElementById("fufu_spinner").className = "fufu_spinner fufu_spinner_animation";
      }
      fufu_show_loading = true;
      fufu_show_loading_counter = 0;
      clearTimeout(loading_process_timeout);
      showFufuLoading();
    };
    $rootScope.hideLoading = function(){
      fufu_processing = false;
      fufu_show_loading = false;
      $ionicLoading.hide();
    };

    $rootScope.current_datetime = new Date().getTime();

    $ionicPlatform.ready(function() {
        if(typeof(getLocalStorageVar("_vip_resource_version"))=='undefined'||getLocalStorageVar("_vip_resource_version")==''||getLocalStorageVar("_vip_resource_version")==null){
            setLocalStorageVar("_vip_resource_version","3.3.001");
        }
        function runObject(){
            try {
                navigator.connection.getInfo(function(msg){
                    $timeout(function(){
                        if (msg == '2g' || msg == '3g' || msg == '4g' || msg == 'wifi'){
                            userHomeService.setWifiObj(true);
                        }
                        else {
                            userHomeService.setWifiObj(false);
                        }
                    })
                },function(error){
                });

            } catch(e){
                console.log("navigator.connection.getInfo: " + e.message);
            }

            try{
                var fufu_spinner_html = '<div id="fufu_spinner_container" style="display:none; position: absolute; top: 0; right: 0; bottom: 0; left: 0; z-index: 11;"><div style="position:relative;width:100%;height:100%"><div id="fufu_spinner_div" style="position:absolute;width:60px;height:60px;position:absolute;top:50%;left:50%;margin:0px;margin-left:-30px;margin-top:-30px;"><div id="fufu_spinner" class="fufu_spinner" style="margin:0px;"></div><img src="' + local_resource + 'img/icon/loading_fufu.png"  style="width: 32px; height: 32px; position:absolute;top:15px;left:15px;"/></div></div></div>';
                document.body.insertAdjacentHTML('afterbegin', fufu_spinner_html );
            } catch (e) {

            }

            try{
                var fufu_message_html = '<div id="fufu_message_container" style="display: none" onclick="window.hideFufuMessageBox();"><div id="fufu_message_inner_container" class="loading-container visible active" style="visibility:visible !important"><div style="margin-top: 0px;padding-top: 5px;padding-bottom: 5px;background-color:black;border-radius: 15px;padding-right: 18px;padding-left: 18px;font-size:0.373333rem;max-width: 270px;opacity: 0.55;color: white" id="fufu_message_div"></div></div></div>';
                document.body.insertAdjacentHTML('afterbegin', fufu_message_html );
            } catch (e) {

            }

            try{
                var fufu_message_success_html = '<div id="fufu_message_success_container" style="display: none;"><div id="fufu_message_success_inner_container" class="loading-container visible active" style="visibility:visible !important"><div style="margin-top: 0px;padding-top: 20px;padding-bottom: 20px;background-color:black;font-size: 12px;width: 120px;height: 100px;border-radius: 10px; opacity: 0.55;color: white;text-align: center;"><img src="' + local_resource + 'img/icon/done.png' + '" alt="" style="width: 0.88rem;height: 0.88rem;"/><p style="text-align: center;font-size: 0.426666rem;font-weight: bold;margin-top: 4px;" id="fufu_message_success_div"></p></div></div></div>';
                document.body.insertAdjacentHTML('afterbegin', fufu_message_success_html );
            } catch (e) {

            }
            try{
                var at_sign_in_success_html = '<div style="display: none;" id="signinsucessbox"> <div class="loading-container visible active" style="visibility:visible !important"> <div style="width: 100%;height: 100%;position:absolute;top: 0px;background-color: #333;left: 0px;opacity: 0.5; "></div> <div style="margin-top: 0px;background-color:white;font-size: 12px;width: 7.2rem;height:8.533333rem;border-radius: 10px;text-align: center;overflow: hidden;z-index: 14;-webkit-transition: all 0.4s ease-in;transform: scale(0.1,0.1);" id="signinsucessdiv" ><div style="height:5.466666rem;margin-top:-2px;"> <img src='+local_resource + "img/icon/sign_in_success.png"+' alt="" style="width:100%;height:5.466666rem;"/> </div><div style="height:3.066666667rem;padding-top:0.746666666666rem"> <div > <p style="text-align: center;font-size: 0.53333rem;margin-top: 4px;color: #ffba5d;font-weight: bold;"> 签到成功</p> <p id="at_sign_in_sucess_box_text" style="margin-top: 0.4rem;font-size: 0.4rem;color: #999;"></p> </div> </div> </div> </div></div>';
                document.body.insertAdjacentHTML('afterbegin', at_sign_in_success_html);
            } catch (e) {

            }
			
            try{
                var device_popup_html = '<div id="device_popup" class="loading-container visible active" style="display:none"> <div style="width: 100%;height: 100%;position:absolute;top: 0px;background-color: #333;left: 0px;opacity: 0.5; "></div> <div  class="popup-container edit_access_group_popup popup-showing active" ><div class="popup"><div class="popup-head"><h3 class="popup-title ng-binding" ng-bind-html="title">请勾选功能</h3></div><div class="popup-body"><div style="padding:0px !important;"><div style="overflow:hidden;"><label class="checkbox" style="padding: 22px 15px;float:left;"><input id="select_punch" checked="true" type="checkbox" class="ng-pristine ng-untouched ng-valid" value="on"></label><div style="position:relative;top:12px;margin-left: 42px;"><div><div style=" color:#333; font-size:14px; margin-bottom:2px;" class="ng-binding"><span class="ng-binding">考勤功能</span></div></div><div style="color: #666;font-size:12px;margin-top:0px;"><div class="ng-binding" style="padding-right:12px;line-height:140%">员工可通过该设备记录考勤</div></div></div></div><div style="clear:both;overflow:hidden;"><label class="checkbox" style="padding: 10px 15px 34px 15px;float:left;"><input id="select_access" type="checkbox" checked="true" class="ng-pristine ng-untouched ng-valid" value="on"></label><div style="position:relative;top:0px;margin-left: 42px;"><div><div style=" color:#333; font-size:14px; margin-bottom:2px;" class="ng-binding"><span class="ng-binding">门禁功能</span></div></div><div style="color: #666;font-size:12px;margin-top:0px;"><div class="ng-binding" style="padding-right:12px;line-height:140%">员工在该设备下具有开门以及邀请访客的权限</div></div></div></div></div></div><div class="popup-buttons" ng-show="buttons.length"><button id="device_popup_cancel"  class="button ng-binding button-dark"  style="">取消</button><button id="device_popup_sbumit"   class="button ng-binding " style="color:#53afff;background-color: rgba(68, 68, 68, 0);"><span>开始添加</span></button></div></div></div> </div>';
                document.body.insertAdjacentHTML('afterbegin', device_popup_html);
            } catch (e) {

            }
			
            try{
                var is_sure_to_delete_all_html = '<div style="display:none" id="is_sure_to_delete_all" class="popover-backdrop active loading-container visible active" style="display:none"> <div style="width: 100%;height: 100%;position:absolute;top: 0px;background-color: #333;left: 0px;opacity: 0.5; "></div>  <div  class=" popup-container new_attendace_emp_popup popup-showing active" ng-class="cssClass"><div class="popup"><div class="popup-head"><h3 class="popup-title ng-binding" ng-bind-html="title"></h3></div><div class="popup-body"><div style="text-align: center;">是否确认清空</div></div><div class="popup-buttons" ng-show="buttons.length"><button id="is_sure_to_delete_all_cancel" class="button ng-binding button-dark"  style="">我再想想</button><button id="is_sure_to_delete_all_submit"  class="button ng-binding button-positive" style=""><span>确认</span></button></div></div></div></div>';
                document.body.insertAdjacentHTML('afterbegin', is_sure_to_delete_all_html);
            } catch (e) {

            }
			
            try{
                var is_sure_to_delete_html = '<div style="display:none" id="is_sure_to_delete" class="popover-backdrop active loading-container visible active" style="display:none"> <div style="width: 100%;height: 100%;position:absolute;top: 0px;background-color: #333;left: 0px;opacity: 0.5; "></div>  <div  class=" popup-container new_attendace_emp_popup popup-showing active" ng-class="cssClass"><div class="popup"><div class="popup-head"><h3 class="popup-title ng-binding" ng-bind-html="title"></h3></div><div class="popup-body"><div style="text-align: center;">是否确认删除</div></div><div class="popup-buttons" ng-show="buttons.length"><button id="is_sure_to_delete_cancel" class="button ng-binding button-dark"  style="">我再想想</button><button id="is_sure_to_delete_submit"  class="button ng-binding button-positive" style=""><span>确认</span></button></div></div></div></div>';
                document.body.insertAdjacentHTML('afterbegin', is_sure_to_delete_html);
            } catch (e) {

            }




            window.fufuMessageBox = function(message,duration,func){
                clearTimeout(fufu_message_box_timeout);
                fufu_message_box_timeout = setTimeout(function (){ window.fufuMessageBox(message,duration,func); } , 200);
                fufu_message_box_counter ++;
                if (fufu_message_box_counter > 10 || ((fufu_show_loading_counter > 7 || fufu_show_loading_counter == 0) && !fufu_show_loading)) {
                    fufu_message_box_counter = 0;
                    clearTimeout(fufu_message_box_timeout);
                    document.getElementById("fufu_spinner_container").style.display = "none";
                    document.getElementById("fufu_message_div").innerHTML = message;
                    document.getElementById("fufu_message_container").style.display = "block";
                    document.getElementById("fufu_message_inner_container").style.opacity = "1";
                    TweenMax.to(document.getElementById('fufu_message_inner_container'),0.3,{
                        opacity:0,
                        delay:duration,
                        onComplete: function(){
                            document.getElementById("fufu_message_container").style.display = "none";
                            func();
                        }
                    });
                }
                else {
                    return;
                }
            }

            window.hideFufuMessageBox = function(){
                clearTimeout(fufu_message_box_timeout);
                fufu_message_box_counter = 0;
                document.getElementById("fufu_spinner_container").style.display = "none";
                document.getElementById("fufu_message_div").innerHTML = '';
                document.getElementById("fufu_message_container").style.display = "none";
                document.getElementById("fufu_message_inner_container").style.opacity = "0";
                TweenMax.killAll();
            }

            window.fufuSuccessBox = function(message,duration,func){
                clearTimeout(fufu_success_message_box_timeout);
                fufu_success_message_box_timeout = setTimeout(function (){ window.fufuSuccessBox(message,duration,func); } , 200);
                fufu_success_message_box_counter ++;
                if (fufu_success_message_box_counter > 10 || ((fufu_show_loading_counter > 7 || fufu_show_loading_counter == 0) && !fufu_show_loading)) {
                    fufu_success_message_box_counter = 0;
                    clearTimeout(fufu_success_message_box_timeout);
                    document.getElementById("fufu_spinner_container").style.display = "none";
                    document.getElementById("fufu_message_success_div").innerHTML = message;
                    document.getElementById("fufu_message_success_container").style.display = "block";
                    document.getElementById("fufu_message_success_inner_container").style.opacity = "1";

                    TweenMax.to(document.getElementById('fufu_message_success_inner_container'),0.3,{
                        opacity:0,
                        delay:duration,
                        onComplete: function(){
                            document.getElementById("fufu_message_success_container").style.display = "none";
                            func();
                        }
                    });
                }
                else {
                    return;
                }
            }

            if(typeof(localStorage._remote_server_addr)!='undefined'&&localStorage._remote_server_addr!=''){
                checkMbAppVersion(window.localStorage['_remote_server_addr'],$ionicPopup,$ionicLoading,$rootScope,$location);
				checkAdsVersion(window.localStorage['_remote_server_addr']);
            }else{
                login_flag = 1;
            }

            if(current_app_version == '1.1'){
                local_resource = _cdn_url;
            }
            $rootScope.current_datetime = new Date().getTime();

            try {
                document.addEventListener("resume", function () {

                    reSendJpushData();

                    back_button=1;
                    $timeout(function(){
                        back_button=0;
                    },1000);
                    if ($ionicHistory.currentView().stateName == 'home_page.at_sign_in_new') {
                        var current_date = new Date();
                        current_date.setMinutes(current_date.getMinutes() - current_date.getTimezoneOffset());
                        current_date = current_date.toJSON().slice(0,10);
                        atSignInNewSev.loadData(current_date,false);
                    }
                    if ($ionicHistory.currentView().stateName == 'home_page.at_mb_indoor_setting_detail_edit') {
                        atMbIndoorSettingDetailSev.refreshCurrentWifi();
                    }
                  /*
                   if ($ionicHistory.currentView().stateName == 'home_page.at_sign_in') {
                   atSignInSev.refreshCurrentWifi();
                   homemessageSev.loadMessageCount();
                   }
                   */
                    if ($ionicHistory.currentView().stateName == 'home_page.home_default' || $ionicHistory.currentView().stateName == 'home_page.home_at' || $ionicHistory.currentView().stateName == 'home_page.home_person') {
                        homemessageSev.loadMessageCount();
                    }
                    if(typeof(localStorage._remote_server_addr)!='undefined'&&localStorage._remote_server_addr!=''){
                        checkMbAppVersion(window.localStorage['_remote_server_addr'],$ionicPopup,$ionicLoading,$rootScope,$location);
                    }
                }, false);
            }catch(e){
            }

            setLocalStorageVar("_device_type",ionic.Platform.platform());
            if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);
                navigator.splashscreen.hide();
                window.plugins.jPushPlugin.init()
                window.plugins.jPushPlugin.getRegistrationID(function(data){
                    setLocalStorageVar("_notification_token",data);
                });

                try{
                    autosignin.initBlePlugin();
                }catch(e){

                }

                document.addEventListener("signin.autoSignIn", function(message){
                    //alert("autoSignIn: " + message.sn + " ,离开："+ message.range);
                    try{
                        if(window.localStorage['_user_name']!=""&&window.localStorage['_pass_word']!=""&&angular.isDefined(localStorage.roster_card_data)&&localStorage.roster_card_data!=""){
                            var _str = '_user_name=' + window.localStorage['_user_name'] + '&_pass_word=' + window.localStorage['_pass_word'] + '&_is_login=' + window.localStorage['_is_login'] + '&_notification_token=' + window.localStorage['_notification_token'] + '&_device_type=' + window.localStorage['_device_type'];
                            var cur_time = splitSignDate(message.time);
                            if(cur_time=="")return;
                            var _flag = 0;
                            var roster_card_data = JSON.parse(window.localStorage.roster_card_data);
                            for(var i=0;i<roster_card_data.length;i++){
                                if(cur_time>roster_card_data[i].from&&cur_time<roster_card_data[i].to){
                                    _flag = 1;
                                    $.ajax({
                                        type: 'POST',
                                        url: window.localStorage['_remote_server_addr'] + '?event=ionicAction.ionicAction.atRecordByBluetooth&'+_str,
                                        timeout: _var_timeout,
                                        data: {
                                            check_time:cur_time,
                                            sn:message.sn
                                        },
                                        success: function(data, status, headers, config) {
                                        },
                                        error: function(data, status, headers, config) {
                                        }
                                    });
                                    break;
                                }
                            }
                            if(_flag == 0){
                                try{
                                    $timeout(function(){
                                        autosignin.loginSuccess();
                                    },5000);
                                }catch(e){

                                }
                            }
                        }
                    }catch(e){

                    }
                }, false)

                document.addEventListener("jpush.openNotification", function(data) {
                    //alert("openNotification");
					$timeout(function(){
						$rootScope.hideLoading();
					},2000)
                    if (angular.isDefined(window.localStorage['_is_login']) && window.localStorage['_is_login'] == true) {

                    }
                    else {
                        return;
                    }

                    var receive_extra;
                    var _data;

                    if (ionic.Platform.isIOS()){
                        if (typeof(data.fufu_ext) == 'undefined' || data.fufu_ext == ''){
                            $location.path('home_page/home_message');
                            return;
                        }
                        receive_extra = data.fufu_ext;
                    }else{
                        if (typeof(data.extras.fufu_ext) == 'undefined' || data.extras.fufu_ext == ''){
                            $location.path('home_page/home_message');
                            return;
                        }
                        receive_extra = data.extras.fufu_ext;
                    }
                    _data = $.parseJSON(receive_extra);
                    if (typeof(_data.action_type) == 'undefined'){
                        return;
                    }else if (_data.action_type == 'card_reminder'){
                        $location.path('home_page/at_sign_in_new');
                    }



                }, false)

                document.addEventListener("jpush.receiveNotification", function(data) {
                    //alert("receiveNotification");
                }, false)


                document.addEventListener("jpush.receiveMessage", function(data) {
                    var receive_message;
                    var _data;
                    var temp_obj = {};
                    if (ionic.Platform.isIOS()){
                        if (typeof(data.content) == 'undefined'){
                            return;
                        }
                        receive_message = data.content;
                    }else{
                        if (typeof(data.message) == 'undefined'){
                            return;
                        }
                        receive_message = data.message;
                    }
                    _data = $.parseJSON(receive_message);
                

                    // AttendanceDevice 录入指纹逻辑 Start

                    var
                        attendanceDeviceURL = "/home_page/home_default/attendance_device", //flag : 1
                        attendanceMemberURL = "/home_page/home_default/attendance_member", //flag : 2
                        newAttendanceMemberURL = "/home_page/home_default/new_attendance_device",
                        newAttendaceEmpListURL = "/home_page/home_default/new_attendace_emp_list"
                        isActiveView = null;
                    
                    if($ionicHistory.currentView().url.indexOf(attendanceDeviceURL) == 0){
                        isActiveView = 1;
                    }else if($ionicHistory.currentView().url.indexOf(attendanceMemberURL) == 0){
                        isActiveView = 2;
                    }else if($ionicHistory.currentView().url.indexOf(newAttendanceMemberURL) == 0){
                        isActiveView = 3;
                    }else if($ionicHistory.currentView().url.indexOf(newAttendaceEmpListURL) == 0){
                        isActiveView = 4;
                    }else{
                        isActiveView = null;
                    }
                  
                    if(isActiveView && angular.isDefined(_data.payload)&&_data.payload!=null){

                        // alert("_data.payload" + _data.payload);
                        // alert("_data.payload.params" + _data.payload.params);
                        // alert(_data.payload.params.num);
                        // alert(_data.payload.params.code);
                        var
                            params = _data.payload.params,
                            error_state = {
                                "-1" : "咦，系统查无此人诶",
                                "-2" : "指纹容量满了呢，不能再录入啦～～",
                                "-3" : "啊哦，指纹已存在了",
                                "-4" : "啊哦，超时了，请再试一次",
                                "-5" : "咦，指纹匹配失败，请再试一次",
                                "-6" : "获取数据异常",
                                "-7" : "添加到内存失败",
                                "-10" : "模版提取异常【位置不对】",
                                "-12" : "其他异常",
                            }

                        if(params.code == 0){
                            switch(params.num){
                                case "1":
                                    $timeout(function(){
                                        if(isActiveView == 1){
                                            attendanceDeviceSev.setFingerStep(2);
                                        }else if(isActiveView == 2){
                                            attendanceMemberSev.setFingerStep(2);
                                        }else if (isActiveView == 3 || isActiveView == 4) {
                                            attendanceDeviceSev.setFingerStep(2);
                                        };

                                    },0);
                                    break;
                                case "2":
                                    $timeout(function(){
                                        if(isActiveView == 1){
                                            attendanceDeviceSev.setFingerStep(3);
                                        }else if(isActiveView == 2){
                                            attendanceMemberSev.setFingerStep(3);
                                        }else if (isActiveView == 3 || isActiveView == 4) {
                                            attendanceDeviceSev.setFingerStep(3);
                                        };

                                    },0);
                                    break;
                                case "3":
                                    $timeout(function(){
                                        if(isActiveView == 1){
                                            attendanceDeviceSev.setFingerStep(4);
                                        }else if(isActiveView == 2){
                                            attendanceMemberSev.setFingerStep(4);
                                        }else if (isActiveView == 3 || isActiveView == 4) {
                                            attendanceDeviceSev.setFingerStep(4);
                                        };


                                    },0);

                                    break;
                                default:
                                    alert("意外num：" + params.num);
                            }
                        }else{
                            // alert(params.code + "  :" + error_state[params.code]);
                            $timeout(function(){
                                if(isActiveView == 1){
                                    attendanceDeviceSev.updataInputFingerError(error_state[params.code]);
                                }else if(isActiveView == 2){
                                    attendanceMemberSev.updataInputFingerError(error_state[params.code]);
                                }else if (isActiveView == 3 || isActiveView == 4) {
                                    attendanceDeviceSev.updataInputFingerError(error_state[params.code]);
                                };


                            },0);
                        }

                    }
                    // AttendanceDevice 录入指纹逻辑 End

                    try {
                        if(angular.isDefined(_data.task_id)){
                            switch (_data.task_id) {
                                //修改菜单信息之后更新菜单缓存
                                case "1":
                                    // 刷新主菜单
                                    userHomeService.loadMenuList();

                                    // 刷新子菜单
                                    if (window.localStorage["menu_list"] != null && angular.isDefined(window.localStorage["menu_list"]) && window.localStorage["menu_list"] != '') {
                                        var model_list = window.localStorage["menu_list"].split(',');
                                        for (var i = 0; i < model_list.length; i++) {
                                            if (model_list[i] != '') {
                                                setLocalStorageVar(model_list[i],"");
                                            }
                                        }
                                    }
                                    setLocalStorageVar("menu_list","");
                                    setLocalStorageVar("menu_home","");
                                    setLocalStorageVar("menu_message","");
                                    setLocalStorageVar("menu_organization_management","");
                                    setLocalStorageVar("menu_time","");
                                    setLocalStorageVar("menu_payroll","");
                                    setLocalStorageVar("menu_ess","");
                                    setLocalStorageVar("menu_My_Team","");
                                    setLocalStorageVar("menu_setting","");
                                    setLocalStorageVar("personnal_data","");
                                    setLocalStorageVar("is_free_trial_login","");

                                    break;

                                // 修改个人的role之后需要登出然后更新菜单缓存
                                case "2":
                                    $.ajax({
                                        type: "GET",
                                        url: window.localStorage['_remote_server_addr'] + '?event=ionicAction.ionicAction.doLogout',
                                        timeout: _var_timeout,
                                        success: function(data) {
                                            // 刷新主菜单
                                            userHomeService.loadMenuList();

                                            // 刷新子菜单
                                            if (window.localStorage["menu_list"] != null && angular.isDefined(window.localStorage["menu_list"]) && window.localStorage["menu_list"] != '') {
                                                var model_list = window.localStorage["menu_list"].split(',');
                                                for (var i = 0; i < model_list.length; i++) {
                                                    if (model_list[i] != '') {
                                                        setLocalStorageVar(model_list[i],"");
                                                    }
                                                }
                                                setLocalStorageVar("menu_list","");
                                            }
                                        },
                                        error: function(data) {

                                        }
                                    });

                                    break;

                                // 更新消息模块缓存
                                case "3":
                                    if (_data.notify_message.type == '待办消息'){
                                        homemessageSev.setApprovalMessageData(_data.notify_message);
                                    }
                                    if (_data.notify_message.type == '知会消息'){
                                        homemessageSev.setProcessNoticeMessageData(_data.notify_message);
                                    }
                                    if (_data.notify_message.type == '系统提醒'){
                                        homemessageSev.setSystemMessageData(_data.notify_message);
                                    }
                                    if (_data.notify_message.type == '公司公告'){
                                        homemessageSev.setNoticeMessageData(_data.notify_message);
                                    }
                                    if (_data.notify_message.type == '服服小秘书提醒'){
                                        homemessageSev.setSecretaryMessageData(_data.notify_message);
                                    }

                                    //homemessageSev.loadData();
                                    break;

                                // 服服升级提示
                                case "4":
                                    $ionicPopup.alert({
                                        title: '更新提示',
                                        template: '<div style="text-align: center;">服服版本升级,维护时间12:00-06:00,请耐心等侯!</div>',
                                        okText: '确定'
                                    })
                                        .then(function(res) {
                                            $.ajax({
                                                type: "GET",
                                                url: window.localStorage['_remote_server_addr'] + '?event=ionicAction.ionicAction.doLogout',
                                                timeout: _var_timeout,
                                                success: function(data) {
                                                    $rootScope.hideLoading();
                                                },
                                                error: function(data) {
                                                    $rootScope.hideLoading();
                                                }
                                            });
                                            $ionicHistory.clearCache();
                                            $ionicHistory.clearHistory();
                                            setLocalStorageVar("_pass_word","");
                                            setLocalStorageVar("_is_login","0");
                                            if (window.localStorage["menu_list"] != null && typeof(window.localStorage["menu_list"]) != 'undefined' && window.localStorage["menu_list"] != '') {
                                                var model_list = window.localStorage["menu_list"].split(',');
                                                for (var i = 0; i < model_list.length; i++) {
                                                    if (model_list[i] != '') {
                                                        setLocalStorageVar(model_list[i],"");
                                                    }
                                                }
                                            }
                                            setLocalStorageVar("menu_list","");
                                            setLocalStorageVar("menu_home","");
                                            setLocalStorageVar("menu_message","");
                                            setLocalStorageVar("menu_organization_management","");
                                            setLocalStorageVar("menu_time","");
                                            setLocalStorageVar("menu_payroll","");
                                            setLocalStorageVar("menu_ess","");
                                            setLocalStorageVar("menu_My_Team","");
                                            setLocalStorageVar("menu_setting","");
                                            setLocalStorageVar("personnal_data","");
                                            setLocalStorageVar("is_free_trial_login","");
                                            service.disconnect();
                                            login_init_flag = 0;
                                            $location.path('/');
                                        });
                                    break;

                                // websocket刷新个人personnal页面数据
                                case "5":
                                    setLocalStorageVar("personnal_data","");
                                    sysUserSev.loadData();
                                    break;

                                // websocket刷新工资计算页面状态栏
                                case "6":
                                    payrollCalSev.setProcessStatus('2');
                                    break;

                                // websocket刷新工资计算页面状态栏
                                case "7":
                                    atAnalySev.setProcessStatus('2');
                                    break;

                                // websocket刷新页面状态自动对班栏
                                case "8":
                                    autoRosSev.setProcessStatus('2');
                                    break;
                            }
                        }


						if(_data.action_type=="visit_message"){
							_data.photo_name=window.localStorage['_remote_server_addr'].substring(0,window.localStorage['_remote_server_addr'].lastIndexOf('index.cfm'))+'views/photos/'+_data.photo_name;
							if((new Date().getTime()-new Date(_data.date_time.replace(new RegExp(/(-)/g),'/')).getTime())/1000>60){
								_data.opendoor_status=3;
								homemessageSev.setOpenDoorNoticeMessageData(_data);
							}else{
								homemessageSev.setOpenDoorNoticeMessageData(_data);
								screenSev.setData(_data);
								screenSev.showOpendoorModal();
								screenSev.countDown();
							}

                            if (window.localStorage["message_opendoor_notice_detail_data" + window.localStorage['_user_name']] != null && typeof(window.localStorage["message_opendoor_notice_detail_data" + window.localStorage['_user_name']]) != 'undefined' && window.localStorage["message_opendoor_notice_detail_data" + window.localStorage['_user_name']] != ''){
                                setLocalStorageVar("message_opendoor_notice_detail_data" + getLocalStorageVar('_user_name'),getLocalStorageVar("message_opendoor_notice_detail_data" + getLocalStorageVar('_user_name'))+ ',' + JSON.stringify(_data));
                            }
                            else {
                                setLocalStorageVar("message_opendoor_notice_detail_data" + getLocalStorageVar('_user_name'),JSON.stringify(_data));
                            }
						}

                        if(_data.action_type=='patch_release'){
                            $rootScope.showSystemMaintPopup(_data.message).then(function(res){
                                $ionicHistory.clearCache();
                                $ionicHistory.clearHistory();
                                setLocalStorageVar("_pass_word","");
                                setLocalStorageVar("_is_login","0");
                                if (window.localStorage["menu_list"] != null && typeof(window.localStorage["menu_list"]) != 'undefined' && window.localStorage["menu_list"] != '') {
                                    var model_list = window.localStorage["menu_list"].split(',');
                                    for (var i = 0; i < model_list.length; i++) {
                                        if (model_list[i] != '') {
                                            setLocalStorageVar(model_list[i],"");
                                        }
                                    }
                                }
                                setLocalStorageVar("menu_list","");
                                setLocalStorageVar("menu_home","");
                                setLocalStorageVar("menu_message","");
                                setLocalStorageVar("menu_organization_management","");
                                setLocalStorageVar("menu_time","");
                                setLocalStorageVar("menu_payroll","");
                                setLocalStorageVar("menu_ess","");
                                setLocalStorageVar("menu_My_Team","");
                                setLocalStorageVar("menu_setting","");
                                setLocalStorageVar("personnal_data","");
                                setLocalStorageVar("is_free_trial_login","");

                                login_init_flag = 0;
                                $location.path('/');
                            });
                            return;
                        }
                        if (_data.action_type == 'card_reminder'||_data.biz_type == 'mb_card_remide'){
                            temp_obj.content = _data.content;
                            temp_obj.date = _data.date_str;
                            homemessageSev.setCardNoticeMessageData(temp_obj);
                            if (window.localStorage["message_card_notice_detail_data" + window.localStorage['_user_name']] != null && typeof(window.localStorage["message_card_notice_detail_data" + window.localStorage['_user_name']]) != 'undefined' && window.localStorage["message_card_notice_detail_data" + window.localStorage['_user_name']] != ''){
                                setLocalStorageVar("message_card_notice_detail_data" + getLocalStorageVar('_user_name'),getLocalStorageVar("message_card_notice_detail_data" + getLocalStorageVar('_user_name'))+ ',' + receive_message);
                            }
                            else {
                                setLocalStorageVar("message_card_notice_detail_data" + getLocalStorageVar('_user_name'),receive_message);
                            }
                        }

                        if (_data.action_type == 'bluetoothcard'){
                            temp_obj.content = _data.notify_message;
                            temp_obj.date = _data.date_str;
                            temp_obj.type = "蓝牙签到提醒";
                            homemessageSev.setSystemMessageData(temp_obj);
                        }


                    } catch (e){
                        console.log(e.message);
                    }
                }, false);



            }else{
                setLocalStorageVar("_notification_token","");
            }


				 if (angular.isDefined(getLocalStorageVar("_is_login")) && getLocalStorageVar("_is_login") == 1) {
                    reSendJpushData();
                    $location.path('/home_page/home_default');
                } else {
                    $location.path('/advertising');
                }

        }

		try{
			setLocalStorageVar("local_resource",cordova.file.dataDirectory + 'www/');
			nativeDataStorage.getLocalStorageVal(function(msg){
			if(typeof(msg) == 'object'){
                for(var p in msg){
                    window.localStorage[p]=msg[p];
                }
			}
                runObject();
			});
		
		}catch(e){
            runObject();
		}

      
    });
  })

  .config(function($stateProvider,$urlRouterProvider,$ionicConfigProvider,$httpProvider) {
    $httpProvider.interceptors.push('httpRequestInterceptor');
    $ionicConfigProvider.platform.ios.tabs.style('standard');
    $ionicConfigProvider.platform.ios.tabs.position('bottom');
    $ionicConfigProvider.platform.android.tabs.style('standard');
    $ionicConfigProvider.platform.android.tabs.position('bottom');

    $ionicConfigProvider.platform.ios.navBar.alignTitle('center');
    $ionicConfigProvider.platform.android.navBar.alignTitle('center');
    $ionicConfigProvider.backButton.text('');
    $ionicConfigProvider.backButton.previousTitleText(false);

    $ionicConfigProvider.views.maxCache(4);
    $ionicConfigProvider.templates.maxPrefetch(2);
    $ionicConfigProvider.views.swipeBackEnabled(false);

    $ionicConfigProvider.platform.android.views.transition('android');
    $ionicConfigProvider.scrolling.jsScrolling(true);

    window.parallaxViewObj = {
      'homeMessageContentCtrl' : {
        controllerName : 'homeMessageContentCtrl',
        title : undefined
      },
      'homeMessageDetailCtrl' : {
        controllerName : 'homeMessageDetailCtrl',
        title : undefined
      },
      'essMyApprovalTravelingCtrl' : {
        controllerName : 'essMyApprovalTravelingCtrl',
        title : undefined
      },
      'essMyTravelingCtrl' : {
        controllerName : 'essMyTravelingCtrl',
        title : undefined
      },
      '组织人事' : {
        controllerName : 'menulistCtrl',
        title : '组织人事'
      },
      '时间管理' : {
        controllerName : 'menulistCtrl',
        title : '时间管理'
      },
      '薪酬福利' : {
        controllerName : 'menulistCtrl',
        title : '薪酬福利'
      },
      '协同办公' : {
        controllerName : 'menulistCtrl',
        title : '协同办公'
      },
      '我的团队' : {
        controllerName : 'menulistCtrl',
        title : '我的团队'
      },
      '系统设置' : {
        controllerName : 'menulistCtrl',
        title : '系统设置'
      },
      '门禁管理' : {
        controllerName : 'menulistCtrl',
        title : '门禁管理'
      },
      '休假申请' : {
        controllerName : 'essLvApplyCtrl',
        title : '休假申请'
      },
      '加班申请' : {
        controllerName : 'essOtApplyCtrl',
        title : '加班申请'
      },
      '外出申请' : {
        controllerName : 'OutdoorApplyCtrl',
        title : '外出申请'
      },
      '我的申请' : {
        controllerName : 'essMyApplyCtrl',
        title : '我的申请'
      },
      '我的审批' : {
        controllerName : 'essMyApprovalCtrl',
        title : '我的审批'
      },
      '假期结余' : {
        controllerName : 'MyLvBalanceCtrl',
        title : '假期结余'
      },
      '工资单' : {
        controllerName : 'payrollSlipCtrl',
        title : '工资单'
      },
      '个人信息' : {
        controllerName : 'perDetailCtrl',
        title : '个人信息'
      },
      '证件信息' : {
        controllerName : 'EditIdDetailsCtrl',
        title : '证件信息'
      },
      '联系方式' : {
        controllerName : 'EditContactDetailsCtrl',
        title : '联系方式'
      },

      '我的' : {
        controllerName : 'sysUserCtrl',
        title : '我的'
      },

      '找回密码' : {
        controllerName : 'regetPwdCtrl',
        title : '找回密码'
      },
      'FF128智能前台' : {
        controllerName : 'bannerDetailCtrl',
        title : 'FF128智能前台'
      },
      '服服三大版本，更精准匹配企业需求' : {
        controllerName : 'bannerDetailCtrl',
        title : '服服三大版本，更精准匹配企业需求'
      },
      '服服出差业务全新上线' : {
        controllerName : 'bannerDetailCtrl',
        title : '服服出差业务全新上线'
      }
    }

    $stateProvider
      .state('home_page.emplComponentCtrlDefault', {
        url: '/emplComponentCtrlDefault/:pid',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/empl_list_component.html'
          }
        }
      })
      .state('home_page.emplComponentCtrlMessage', {
        url: '/emplComponentCtrlMessage/:pid',
        views: {
          'home-message-nav': {
            templateUrl: local_resource+'templates/empl_list_component.html'
          }
        }
      })
      .state('home_page.emplComponentCtrlAt', {
        url: '/emplComponentCtrlAt/:pid',
        views: {
          'home-at-nav': {
            templateUrl: local_resource+'templates/empl_list_component.html'
          }
        }
      })
      .state('home_page.emplComponentCtrlSign', {
        url: '/emplComponentCtrlSign/:pid',
        views: {
          'home-at-sign-in-nav': {
            templateUrl: local_resource+'templates/empl_list_component.html'
          }
        }
      })
      .state('home_page.emplComponentCtrlPerson', {
        url: '/emplComponentCtrlPerson/:pid',
        views: {
          'home-person-nav': {
            templateUrl: local_resource+'templates/empl_list_component.html'
          }
        }
      })
      .state('home_page.deptComponentCtrlDefault', {
        url: '/deptComponentCtrlDefault/:pid',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/dept_list_component.html'
          }
        }
      })
      .state('home_page.deptComponentCtrlMessage', {
        url: '/deptComponentCtrlMessage/:pid',
        views: {
          'home-message-nav': {
            templateUrl: local_resource+'templates/dept_list_component.html'
          }
        }
      })
      .state('home_page.deptComponentCtrlAt', {
        url: '/deptComponentCtrlAt/:pid',
        views: {
          'home-at-nav': {
            templateUrl: local_resource+'templates/dept_list_component.html'
          }
        }
      })
      .state('home_page.deptComponentCtrlSign', {
        url: '/deptComponentCtrlSign/:pid',
        views: {
          'home-at-sign-in-nav': {
            templateUrl: local_resource+'templates/dept_list_component.html'
          }
        }
      })
      .state('home_page.deptComponentCtrlPerson', {
        url: '/deptComponentCtrlPerson/:pid',
        views: {
          'home-person-nav': {
            templateUrl: local_resource+'templates/dept_list_component.html'
          }
        }
      })

      .state('lgoinCtrl', {
        url: '/',
        templateUrl: local_resource+'templates/login_home.html'
      })
	  .state('advertising', {
			url: '/advertising',
			templateUrl: local_resource + 'templates/advertising.html'
		})
          
      .state('login_home_navigation', {
        url: '/login_home_navigation',
        templateUrl: local_resource+'templates/login_home_navigation.html'
      })
      .state('forget_pwd', {
        url: '/forget_pwd/:tel_no/:valid_code',
        templateUrl: local_resource+'templates/forget_password.html'
      })
      .state('comp_reg', {
        url: '/comp_reg',
        templateUrl: local_resource+'templates/comp_reg.html'
      })
      .state('comp_reg_content', {
        url: '/comp_reg_content/:tel_no/:valid_code',
        templateUrl: local_resource+'templates/comp_reg_content.html'
      })

      .state('rerget_pwd', {
        url: '/reget_pwd',
        templateUrl: local_resource+'templates/reget_password.html'
      })

      .state('register_index', {
        url: '/register_index',
        templateUrl: local_resource+'templates/register_index.html'
      })
      .state('register_al', {
        url: '/register_al',
        templateUrl: local_resource+'templates/register_al.html'
      })
      .state('register_at', {
        url: '/register_at',
        templateUrl: local_resource+'templates/register_at.html'
      })
      .state('register_at2', {
        url: '/register_at2',
        templateUrl: local_resource+'templates/register_at2.html'
      })
      .state('home_page', {
        url: '/home_page',
        abstract:true,
        templateUrl: local_resource+'templates/home_page.html'
      })
      .state('home_page.home_default', {
        url: '/home_default',
        cache:true,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/home_default.html'
          }
        }
      })
      .state('home_page.home_message', {
        url: '/home_message',
        cache:true,
        views: {
          'home-message-nav': {
            templateUrl: local_resource+'templates/home_message.html'
          }
        }
      })
      .state('home_page.home_menulist', {
        url: '/home_default/:menu_key/:menu_name',
        cache:false,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/home_menulist.html'
          }
        }
      })
      .state('home_page.search_device', {
        url: '/home_default/search_device',
        cache:false,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/search_device.html'
          }
        }
      })
      .state('home_page.ai_device', {
        url: '/home_menulist/ai_device/:is_region',
        cache:false,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/ai_device.html'
          }
        }
      })

      .state('home_page.time_devision', {
        url: '/home_menulist/time_devision',
        cache:false,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/def_open_door_time.html'
          }
        }
      })
      .state('home_page.add_open_door_time', {
        url: '/home_menulist/add_open_door_time',
        cache:false,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/add_open_door_time.html'
          }
        }
      })
      .state('home_page.edit_open_door_time', {
        url: '/home_menulist/edit_open_door_time',
        cache:false,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/edit_open_door_time.html'
          }
        }
      })
      .state('home_page.holiday', {
        url: '/home_menulist/holiday',
        cache:false,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/holiday.html'
          }
        }
      })

      

      .state('home_page.holiday_detail', {
        url: '/home_menulist/holiday_detail',
        cache:false,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/holiday_detail.html'
          }
        }
      })

      .state('home_page.edit_holiday_name', {
        url: '/home_menulist/edit_holiday_name/:hid',
        cache:false,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/edit_holiday_name.html'
          }
        }
      })

      .state('home_page.holidays_type', {
        url: '/home_menulist/holidays_type/:hid/:opentype',
        cache:false,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/holidays_type.html'
          }
        }
      })

      .state('home_page.add_holidays', {
        url: '/home_menulist/add_holidays',
        cache:false,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/add_holidays.html'
          }
        }
      })

      .state('home_page.add_holiday2', {
        url: '/home_menulist/add_holiday2/:hid',
        cache:false,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/add_holiday2.html'
          }
        }
      })

      .state('home_page.edit_holidays', {
        url: '/home_menulist/edit_holidays/:hid',
        cache:false,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/edit_holidays.html'
          }
        }
      })
      
      .state('home_page.region_list', {
        url: '/home_default/region_list',
        cache:false,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/region_list.html'
          }
        }
      })
      .state('home_page.add_region', {
        url: '/home_default/add_region',
        cache:false,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/add_region.html'
          }
        }
      })
      .state('home_page.edit_region', {
        url: '/home_default/edit_region',
        cache:false,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/edit_region.html'
          }
        }
      })
      .state('home_page.device_list', {
        url: '/home_default/device_list',
        cache:false,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/device_list.html'
          }
        }
      })
      .state('home_page.have_device_list', {
        url: '/home_default/have_device_list/:z_id/:is_state',
        cache:false,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/have_device_list.html'
          }
        }
      })
      .state('home_page.add_device', {
        url: '/home_default/add_device',
        cache:false,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/add_device.html'
          }
        }
      })
      
      .state('home_page.region_name', {
        url: '/home_default/region_name/:zid/:status',
        cache:false,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/region_name.html'
          }
        }
      })
      .state('home_page.device_state', {
        url: '/home_default/device_state/:is_wlan/:null',
        cache:false,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/device_state.html'
          }
        }
      })
      .state('home_page.attendance_device', {
        url: '/home_default/attendance_device/:device_sn/:device_name/:zone_id',
        cache:true,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/attendance_device.html'
          }
        }
      })
	  
      .state('home_page.new_attendance_device', {
        url: '/home_default/new_attendance_device/:device_sn/:device_name/:zone_id/:is_remote_open/:device_function',
        //cache:false,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/new_attendance_device.html'
          }
        }
      })
	  
      .state('home_page.punch_record', {
        url: '/punch_record/:device_sn',
        cache:false,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/punch_record.html'
          }
        }
      })
	  
      .state('home_page.visitor_record', {
        url: '/visitor_record/:device_sn',
        cache:false,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/visitor_record.html'
          }
        }
      })
      .state('home_page.employee_record', {
        url: '/employee_record/:device_sn',
        cache:false,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/employee_record.html'
          }
        }
      })
      .state('home_page.visitor_list', {
        url: '/visitor_list/:device_sn',
        cache:false,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/visitor_list.html'
          }
        }
      })
      .state('home_page.device_emp_detail', {
        url: '/home_default/device_emp_detail/:employee_no/:device_sn/:device_function/:is_at/:is_acc',
        
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/device_emp_detail.html'
          }
        }
      })
	  
      .state('home_page.device_action', {
        url: '/device_action/:device_sn',
        		
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/device_action.html'
          }
        }
      })
	  
	  
	  
	  
      .state('home_page.new_attendace_emp_list', {
        url: '/home_default/new_attendace_emp_list/:device_sn/:device_function/:is_face/:is_fig',
        cache:false,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/new_attendace_emp_list.html'
          }
        }
      })
	  

	  
      .state('home_page.attendance_member', {
        url: '/home_default/attendance_member',
        cache:false,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/attendance_member.html'
          }
        }
      })

      .state('home_page.attendance_device_setting', {
        url: '/home_default/attendance_device_setting/:device_sn/:device_name/:zone_id',
        cache:false,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/attendance_device_setting.html'
          }
        }
      })

      .state('home_page.attendance_device_more_setting', {
        url: '/home_default/attendance_device_more_setting/:device_sn/:device_name/:zone_id',
        cache:false,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/attendance_device_more_setting.html'
          }
        }
      })
      // 设备员工的路由
      .state('home_page.device_employee', {
        url: '/device_employee/:empl_list/:device_sn/:is_acc/:is_at/:is_online_face/:is_online_fig/:total_num/:device_function',
        cache:false,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/device_employee.html'
          }
        }
      })
      // 设备管理员的路由
      .state('home_page.device_admin_list', {
        url: '/device_admin_list/:device_sn/:admin_ct',
        cache:false,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/device_admin_list.html'
          }
        }
      })
      // 批量删除
      .state('home_page.delete_employee', {
        url: '/delete_employee/:page_name/:device_sn/:total_num',
        cache:false,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/delete_employee.html'
          }
        }
      })
      // 设备员工添加前选择考勤机功能
      .state('home_page.selectFunction', {
        url: '/selectFunction/:selectEmplList/:page_name/:device_sn',
        cache:false,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/selectFunction.html'
          }
        }
      })
      .state('home_page.attendance_device_name', {
        url: '/home_default/attendance_device_name/:device_name/:device_sn',
        cache:false,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/attendance_device_name.html'
          }
        }
      })

      .state('home_page.time_zone', {
        url: '/home_default/time_zone/:device_name/:device_sn',
        cache:false,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/time_zone.html'
          }
        }
      })

      .state('home_page.attendance_net_state', {
        url: '/home_default/attendance_net_state',
        cache:false,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/attendance_net_state.html'
          }
        }
      })


      
      .state('home_page.config_wifi', {
        url: '/home_default/config_wifi',
        cache:false,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/config_wifi.html'
          }
        }
      })

      .state('home_page.set_config_net', {
        url: '/home_default/set_config_net',
        cache:false,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/set_config_net.html'
          }
        }
      })

      .state('home_page.config_ip_address', {
        url: '/home_default/config_ip_address',
        cache:false,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/config_ip_address.html'
          }
        }
      })

      .state('home_page.staff_master', {
        url: '/home_menulist/staff_master',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/staff_master.html'
          }
        }
      })
      .state('home_page.staff_master_details', {
        url: '/home_menulist/staff_master/:employee_no',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/staff_master_details.html'
          }
        }
      })
      .state('home_page.empl_at_roster', {
        url: '/staff_master/empl_at_roster/:employee_no/:curr_date',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/empl_at_roster.html'
          }
        }
      })
      .state('home_page.empl_payroll_adjust', {
        url: '/staff_master/empl_payroll_adjust/:employee_no',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/empl_payroll_adjust.html'
          }
        }
      })
      .state('home_page.empl_payroll_master', {
        url: '/staff_master/empl_payroll_master/:employee_no',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/empl_payroll_master.html'
          }
        }
      })
      .state('home_page.auto_roster', {
        url: '/home_menulist/auto_roster',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/auto_roster.html'
          }
        }
      })
      .state('home_page.modal_empl_list', {
        url: '/auto_roster/modal_empl_list/:source_id/:hidden_id',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/modal_empl_list.html'
          }
        }
      })
      .state('home_page.at_roster', {
        url: '/auto_roster/at_roster',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/at_roster.html'
          }
        }
      })
      .state('home_page.roster_manager', {
        url: '/home_menulist/roster_manager',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/at_roster.html'
          }
        }
      })
      .state('home_page.at_cal', {
        url: '/home_menulist/at_cal',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/at_analysis.html'
          }
        }
      })
      .state('home_page.at_result', {
        url: '/home_menulist/at_result',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/at_result.html'
          }
        }
      })
      .state('home_page.at_empl_detail', {
        url: '/at_empl_detail/:empl_no/:curr_date',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/at_empl_detail.html'
          }
        }
      })
      .state('home_page.payroll_cal', {
        url: '/home_menulist/payroll_cal',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/payroll_cal.html'
          }
        }
      })





      .state('home_page.open_payslip', {
        url: '/home_menulist/open_payslip',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/payroll_send.html'
          }
        }
      })
      .state('home_page.pay_slip', {
        url: '/home_menulist/pay_slip',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/payroll_slip.html'
          }
        }
      })
      .state('home_page.payroll_result_slip', {
        url: '/payroll_result_slip/:empl_no/:start_date/:end_date/:pay_terms_id',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/payroll_result_slip.html'
          }
        }
      })
      .state('home_page.payroll_result', {
        url: '/home_menulist/payroll_result/:start_date/:end_date',
        cache:false,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/payroll_result.html'
          }
        }
      })
      .state('home_page.payrollresult', {
        url: '/home_menulist/payroll_result',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/payroll_result.html'
          }
        }
      })
      .state('home_page.empl_pay_slip', {
        url: '/pay_slip/:empl_no',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/payroll_slip.html'
          }
        }
      })
      .state('home_page.user_admin', {
        url: '/home_menulist/user_admin',
        cache:false,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/setting_user_admin.html'
          }
        }
      })
      .state('home_page.leave_apply', {
        url: '/home_menulist/leave_apply',
        cache: true,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/ess_leave_apply.html'
          }
        }
      })
      .state('home_page.leave_approve', {
        url: '/home_menulist/leave_approve',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/ess_leave_approve.html'
          }
        }
      })
      .state('home_page.leave_approve_details', {
        url: '/leave_approve_details/:p_inst/:show_type/:my_result_status/:task_id',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/ess_leave_approve_details.html'
          }
        }
      })
      .state('home_page.my_apply', {
        url: '/home_menulist/my_apply',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/ess_my_apply.html'
          }
        }
      })
      .state('home_page.my_approval', {
        url: '/home_menulist/my_approval',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/ess_my_approval.html'
          }
        }
      })
      .state('home_page.ess_my_apply_details', {
        url: '/ess_my_apply_details/:name/:type',

        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/ess_my_apply_details.html'
          }
        }
      })
      .state('home_page.ess_my_apply_details_fieldwork', {
        url: '/ess_my_apply_details_fieldwork/:name/:type',

        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/ess_my_apply_details_fieldwork.html'
          }
        }
      })

      .state('home_page.ess_my_apply_details_offic_work_out', {
        url: '/ess_my_apply_details_offic_work_out/:name/:type',

        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/ess_my_apply_details_offic_work_out.html'
          }
        }
      })
      .state('home_page.ess_my_apply_details_content_offic_work_out', {
        url: '/ess_my_apply_details_content_offic_work_out/:p_inst/:show_type/:task_id/:s_t/:is_process/:rec_id/:from_source',
        cache:false,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/ess_my_apply_details_content_offic_work_out.html'
          }
        }
      })
      .state('home_page.ess_my_apply_details_content', {
        url: '/ess_my_apply_details_content/:p_inst/:show_type/:task_id/:s_t/:is_process/:app_id/:from_source',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/ess_my_apply_details_content.html'
          }
        }
      })
      .state('home_page.ess_my_apply_details_content_Modify', {
        url: '/ess_my_apply_details_content_Modify/:p_inst/:show_type/:task_id',
        cache:true,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/ess_my_apply_details_content_Modify.html'
          }
        }
      })
      .state('home_page.ess_my_apply_details_content_fieldwork', {
        url: '/ess_my_apply_details_content_fieldwork/:p_inst/:show_type/:task_id/:s_t/:is_process/:rec_id/:from_source',
        cache:false,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/ess_my_apply_details_content_fieldwork.html'
          }
        }
      })
      .state('home_page.ess_my_apply_details_content_fieldwork_from_sign_in', {
        url: '/ess_my_apply_details_content_fieldwork_from_sign_in/:p_inst/:show_type/:task_id',
        views: {
          'home-at-sign-in-nav': {
            templateUrl: local_resource+'templates/ess_my_apply_details_content_fieldwork_from_sign_in.html'
          }
        }
      })
      .state('home_page.modify_password', {
        url: '/modify_password',
        views: {
          'home-person-nav': {
            templateUrl: local_resource+'templates/modify_password.html'
          }
        }
      })

      .state('home_page.about_app', {
        url: '/about_app',
        views: {
          'home-person-nav': {
            templateUrl: local_resource+'templates/about_app.html'
          }
        }
      })
      .state('home_page.personnal_details', {
        url: '/personnal_details',
        views: {
          'home-person-nav': {
            templateUrl: local_resource+'templates/personnal_details.html'
          }
        }
      })
      .state('home_page.edit_id_detail', {
        url: '/edit_id_detail',
        cache:false,
        views: {
          'home-person-nav': {
            templateUrl: local_resource+'templates/edit_id_detail.html'
          }
        }
      })
      .state('home_page.edit_contact_detail', {
        url: '/edit_contact_detail',
        views: {
          'home-person-nav': {
            templateUrl: local_resource+'templates/edit_contact_detail.html'
          }
        }
      })

      .state('home_page.personnal_data_details', {
        url: '/personnal_data_details',
        views: {
          'home-person-nav': {
            templateUrl: local_resource+'templates/personnal_data_details.html'
          }
        }
      })

      .state('home_page.edit_detail', {
        url: '/edit_detail/:e_data',
        views: {
          'home-person-nav': {
            templateUrl: local_resource+'templates/edit_detail.html'
          }
        }
      })

      .state('home_page.at_zk_loc_set', {
        url: '/home_menulist/at_zk_loc_set',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/region_list.html'
          }
        }
      })
      .state('home_page.at_zk_loc_set_detail', {
        url: '/at_zk_loc_set_detail/:z_id',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/at_zk_loc_set_detail.html'
          }
        }
      })
      .state('home_page.at_zk_loc_add', {
        url: '/at_zk_loc_add',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/at_zk_loc_add.html'
          }
        }
      })
      .state('home_page.home_at', {
        url: '/home_at',
        cache:false,
        views: {
          'home-at-nav': {
            templateUrl: local_resource+'templates/home_at.html'
          }
        }
      })
      .state('home_page.home_payroll', {
        url: '/home_payroll',
        views: {
          'home-payroll-nav': {
            templateUrl: local_resource+'templates/home_payroll.html'
          }
        }
      })
      .state('home_page.home_person', {
        url: '/home_person',
        cache:true,
        views: {
          'home-person-nav': {
            templateUrl: local_resource+'templates/home_person.html'
          }
        }
      })


      .state('home_page.shift_group', {
        url: '/home_menulist/shift_group',
        cache: false,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/shift_group.html'
          }
        }
      })
      .state('home_page.shift_group_add', {
        url: '/home_menulist/shift_group_add',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/shift_group_add.html'
          }
        }
      })
      .state('home_page.shift_group_add_policy_picker', {
        url: '/home_menulist/shift_group_add_policy_picker',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/shift_group_add_policy_picker.html'
          }
        }
      })
      .state('home_page.shift_group_add_employee_select', {
        url: '/home_menulist/shift_group_add_employee_select',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/shift_group_add_employee_select.html'
          }
        }
      })
      .state('home_page.shift_group_edit', {
        url: '/home_menulist/shift_group_edit/:shift_group_id',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/shift_group_edit.html'
          }
        }
      })
      .state('home_page.shift_group_edit_employee_select', {
        url: '/home_menulist/shift_group_edit_employee_select',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/shift_group_edit_employee_select.html'
          }
        }
      })
      .state('home_page.holiday_policy', {
        url: '/home_menulist/holiday_policy',
        cache: false,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/holiday_policy.html'
          }
        }
      })
      .state('home_page.shift_policy', {
        url: '/home_menulist/shift_policy',
        cache: false,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/shift_policy.html'
          }
        }
      })
      .state('home_page.shift_policy_add', {
        url: '/home_menulist/shift_policy_add',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/shift_policy_add.html'
          }
        }
      })
      .state('home_page.shift_policy_edit', {
        url: '/home_menulist/shift_policy_edit/:shift_policy_id',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/shift_policy_edit.html'
          }
        }
      })
      .state('home_page.holiday_policy_add', {
        url: '/home_menulist/holiday_policy_add',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/holiday_policy_add.html'
          }
        }
      })
      .state('home_page.holiday_policy_edit', {
        url: '/home_menulist/holiday_policy_edit/:holiday_policy_id/:holiday_policy_name',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/holiday_policy_edit.html'
          }
        }
      })

      .state('home_page.holiday_policy_add_employee_select', {
        url: '/home_menulist/holiday_policy_add_employee_select',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/holiday_policy_add_employee_select.html'
          }
        }
      })

      .state('home_page.holiday_policy_edit_employee_select', {
        url: '/home_menulist/holiday_policy_edit_employee_select/:holiday_policy_id',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/holiday_policy_edit_employee_select.html'
          }
        }
      })

      .state('home_page.holiday_setting', {
        url: '/home_menulist/holiday_setting',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/holiday_setting.html'
          }
        }
      })
      .state('home_page.attendance_setting', {
        url: '/home_menulist/attendance_setting',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/attendance_setting.html'
          }
        }
      })
      .state('home_page.ot_to_leave', {
        url: '/home_menulist/ot_to_leave',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/ot_to_leave.html'
          }
        }
      })
      .state('home_page.ot_to_leave_setting', {
        url: '/home_menulist/ot_to_leave_setting',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/ot_to_leave_setting.html'
          }
        }
      })
      .state('home_page.lv_code_setting', {
        cache: false,
        url: '/home_menulist/lv_code_setting',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/lv_code_setting.html'
          }
        }
      })
      .state('home_page.lv_code_setting_detail', {
        url: '/home_menulist/lv_code_setting_detail/:lv_code_id/:lv_code_name/:has_balance',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/lv_code_setting_detail.html'
          }
        }
      })

      .state('home_page.picklist_template', {
        url: '/home_menulist/picklist_template/:picklist_key_list/:picklist_value_list/:checked_key/:checked_value/:picklist_title/:return_key_field_id/:return_value_field_id',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/picklist_template.html'
          }
        }
      })

      .state('home_page.picklist_sign_in_reason', {
        url: '/home_menulist/picklist_sign_in_reason/:picklist_key_list/:picklist_value_list/:checked_key/:checked_value/:picklist_title/:return_key_field_id/:return_value_field_id/:hidden_fields',
        views: {
          'home-at-sign-in-nav': {
            templateUrl: local_resource+'templates/picklist_sign_in_reason.html'
          }
        }
      })

      .state('home_page.modify_picklist_sign_in_reason', {
        url: '/home_menulist/modify_picklist_sign_in_reason/:picklist_key_list/:picklist_value_list/:checked_key/:checked_value/:picklist_title/:return_key_field_id/:return_value_field_id/:hidden_fields',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/modify_picklist_sign_in_reason.html'
          }
        }
      })
      .state('home_page.picklist_employee_contract_detail_contract_term', {
        url: '/home_menulist/picklist_employee_contract_detail_contract_term/:picklist_key_list/:picklist_value_list/:checked_key/:checked_value/:picklist_title/:return_key_field_id/:return_value_field_id/:hidden_fields',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/picklist_employee_contract_detail_contract_term.html'
          }
        }
      })

      .state('home_page.employee_delete', {
        url: '/home_menulist/employee_delete',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/employee_delete.html'
          }
        }
      })
      .state('home_page.employee_resign', {
        cache: false,
        url: '/home_menulist/employee_resign',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/employee_resign.html'
          }
        }
      })
      .state('home_page.employee_resign_detail', {
        url: '/home_menulist/employee_resign_detail/:employee_no/:flag',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/employee_resign_detail.html'
          }
        }
      })
      .state('home_page.employee_contract', {

        url: '/home_menulist/employee_contract',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/employee_contract.html'
          }
        }
      })
      .state('home_page.employee_contract_detail', {

        url: '/home_menulist/employee_contract_detail/:employee_no/:flag',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/employee_contract_detail.html'
          }
        }
      })
      .state('home_page.employee_contract_detail_history', {
        url: '/home_menulist/employee_contract_detail_history/:employee_no',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/employee_contract_detail_history.html'
          }
        }
      })
      .state('home_page.at_empl_card_rec', {
        url: '/home_menulist/at_empl_card_rec',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/at_empl_card_rec.html'
          }
        }
      })

      .state('home_page.web_import', {
        cache: false,
        url: '/home_menulist/web_import',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/web_import.html'
          }
        }
      })

      .state('home_page.web_import_result', {
        cache: false,
        url: '/home_menulist/web_import_result/:success_employee_no_list/:failure_employee_no_list/:current_datetime',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/web_import_result.html'
          }
        }
      })

      .state('home_page.web_import_result_user_admin', {
        cache: false,
        url: '/home_menulist/web_import_result_user_admin/:current_datetime',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/web_import_result_user_admin.html'
          }
        }
      })

      .state('home_page.at_sign_in', {
        url: '/at_sign_in',
        cache: false,
        views: {
          'home-at-sign-in-nav': {
            templateUrl: local_resource+'templates/at_sign_in.html'
          }
        }
      })

      .state('home_page.use_help', {
        url: '/use_help',
        cache: false,
        views: {
          'home-at-sign-in-nav': {
            templateUrl: local_resource+'templates/use_help.html'
          }
        }
      })


      .state('home_page.use_help_details', {
        url: '/use_help_details/:help_title_id/:title',
        cache: false,
        views: {
          'home-at-sign-in-nav': {
            templateUrl: local_resource+'templates/use_help_details.html'
          }
        }
      })

      .state('home_page.at_sign_in_new', {
        url: '/at_sign_in_new',
        cache: false,
        views: {
          'home-at-sign-in-nav': {
            templateUrl: local_resource+'templates/at_sign_in_new.html'
          }
        }
      })



      .state('home_page.at_sign_in_history', {
        url: '/at_sign_in_history',
        cache: false,
        views: {
          'home-at-sign-in-nav': {
            templateUrl: local_resource+'templates/at_sign_in_history.html'
          }
        }
      })

      .state('home_page.change_username', {
        url: '/change_username',
        cache:false,
        views: {
          'home-person-nav': {
            templateUrl: local_resource+'templates/change_username.html'
          }
        }
      })

      .state('home_page.my_business', {
        url: '/my_business',
        cache:false,
        views: {
          'home-person-nav': {
            templateUrl: local_resource+'templates/my_business.html'
          }
        }
      })
      .state('home_page.personnal_setting', {
        url: '/personnal_setting',
        cache:false,
        views: {
          'home-person-nav': {
            templateUrl: local_resource+'templates/personnal_setting.html'
          }
        }
      })
      .state('home_page.message_setting', {
        url: '/message_setting',
        cache:false,
        views: {
          'home-person-nav': {
            templateUrl: local_resource+'templates/message_setting.html'
          }
        }
      })
      .state('home_page.business_trip_apply', {
        url: '/home_menulist/business_trip_apply',
        cache:true,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/trip_apply_for.html'
          }
        }
      })
      // .state('home_page.business_trip_apply', {
      //   url: '/home_menulist/business_trip_apply/:type/:p_inst/:show_type/:task_id',
      //   cache:true,
      //   views: {
      //     'home-default-nav': {
      //       templateUrl: local_resource+'templates/trip_apply_for.html'
      //     }
      //   }
      // })
      .state('home_page.select_city', {
        url: '/home_menulist/select_city/:state',
        cache:false,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/select_city.html'
          }
        }
      })

      .state('home_page.trip_setting', {
        url: '/home_menulist/trip_setting',
        cache:false,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/trip_setting.html'
          }
        }
      })

      .state('home_page.edit_city', {
        url: '/home_menulist/edit_city/:cid/:cname',
        cache:false,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/edit_city.html'
          }
        }
      })
      .state('home_page.add_city', {
        url: '/add_city',
        cache:false,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/add_city.html'
          }
        }
      })

      .state('home_page.setting_repeat', {
        url: '/setting_repeat',
        cache:false,
        views: {
          'home-person-nav': {
            templateUrl: local_resource+'templates/setting_repeat.html'
          }
        }
      })

      .state('home_page.setting_repeat_diy', {
        url: '/setting_repeat_diy',
        cache:false,
        views: {
          'home-person-nav': {
            templateUrl: local_resource+'templates/setting_repeat_diy.html'
          }
        }
      })

      .state('home_page.message_setting_msg', {
        url: '/message_setting_msg',
        cache:false,
        views: {
          'home-message-nav': {
            templateUrl: local_resource+'templates/message_setting.html'
          }
        }
      })

      .state('home_page.setting_repeat_msg', {
        url: '/setting_repeat_msg',
        cache:false,
        views: {
          'home-message-nav': {
            templateUrl: local_resource+'templates/setting_repeat.html'
          }
        }
      })

      .state('home_page.setting_repeat_diy_msg', {
        url: '/setting_repeat_diy_msg',
        cache:false,
        views: {
          'home-message-nav': {
            templateUrl: local_resource+'templates/setting_repeat_diy.html'
          }
        }
      })

      .state('home_page.resign_user', {
        url: '/resign_user',
        views: {
          'home-person-nav': {
            templateUrl: local_resource+'templates/resign_user.html'
          }
        }
      })

      .state('home_page.customer_info', {
        url: '/home_menulist/customer_info',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/company_info.html'
          }
        }
      })

      .state('home_page.benefit_setting', {
        url: '/home_menulist/benefit_setting',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/benefit_setting.html'
          }
        }
      })

      .state('home_page.staff_master_position_tree_picklist', {
        url: '/home_menulist/staff_master_position_tree_picklist/:o_i/:o_n/:p_i/:p_n/:page_name',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/staff_master_position_tree_picklist.html'
          }
        }
      })

      .state('home_page.staff_master_position_picklist', {
        url: '/home_menulist/staff_master_position_picklist/:o_i/:o_n/:p_i/:p_n',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/staff_master_position_picklist.html'
          }
        }
      })

      .state('home_page.personnal_details_position_tree_picklist', {
        url: '/home_menulist/personnal_details_position_tree_picklist/:o_i/:o_n/:p_i/:p_n/:page_name',
        views: {
          'home-person-nav': {
            templateUrl: local_resource+'templates/staff_master_position_tree_picklist.html'
          }
        }
      })


      .state('home_page.personnal_details_position_picklist', {
        url: '/home_menulist/personnal_details_position_picklist/:o_i/:o_n/:p_i/:p_n',
        views: {
          'home-person-nav': {
            templateUrl: local_resource+'templates/staff_master_position_picklist.html'
          }
        }
      })

      .state('home_page.temp_staff_master_position_picklist', {
        cache: false,
        url: '/home_menulist/temp_staff_master_position_picklist/:o_i/:o_n/:p_i/:p_n',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/temp_staff_master_position_picklist.html'
          }
        }
      })

      .state('home_page.temp_personnal_details_position_picklist', {
        cache: false,
        url: '/home_menulist/temp_personnal_details_position_picklist/:o_i/:o_n/:p_i/:p_n',
        views: {
          'home-person-nav': {
            templateUrl: local_resource+'templates/temp_personnal_details_position_picklist.html'
          }
        }
      })
      .state('home_page.user_import_result', {
        cache: false,
        url: '/home_menulist/user_import_result/:operate_date',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/user_import_result.html'
          }
        }
      })

      .state('home_page.at_sign_in_outdoor', {
        url: '/at_sign_in_outdoor',
        views: {
          'home-at-sign-in-nav': {
            templateUrl: local_resource+'templates/at_sign_in_outdoor.html'
          }
        }
      })
      .state('home_page.at_sign_in_outdoor_modify', {
        url: '/home_menulist/at_sign_in_outdoor_modify/:p_inst/:show_type/:task_id',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/at_sign_in_outdoor_modify.html'
          }
        }
      })

      .state('home_page.remote_clock', {
        url: '/remote_clock',
        views: {
          'home-at-sign-in-nav': {
            templateUrl: local_resource+'templates/remote_clock.html'
          }
        }
      })


      .state('home_page.at_mb_indoor_setting', {
        url: '/home_menulist/at_mb_indoor_setting',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/at_mb_indoor_setting.html'
          }
        }
      })

      .state('home_page.at_mb_outdoor_setting', {
        url: '/home_menulist/at_mb_outdoor_setting',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/at_mb_outdoor_setting.html'
          }
        }
      })
      .state('home_page.at_mb_indoor_setting_detail', {
        url: '/home_menulist/at_mb_indoor_setting_detail/:shift_group_id/:shift_group_name',

        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/at_mb_indoor_setting_detail.html'
          }
        }
      })

      .state('home_page.at_mb_indoor_setting_detail_edit', {
        url: '/home_menulist/at_mb_indoor_setting_detail_edit/:setting_detail_id/:form_title/:shift_group_id',

        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/at_mb_indoor_setting_detail_edit.html'
          }
        }
      })

      .state('home_page.picklist_min_unit', {
        url: '/home_menulist/picklist_min_unit/:picklist_key_list/:picklist_value_list/:checked_key/:checked_value/:picklist_title/:return_key_field_id/:return_value_field_id',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/picklist_min_unit.html'
          }
        }
      })

      .state('home_page.at_team_record', {
        url: '/home_menulist/at_team_record',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/at_team_record.html'
          }
        }
      })
      .state('home_page.at_team_record_by_type_detail', {
        url: '/home_menulist/at_team_record_by_type_detail/:type/:date/:dept_id',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/at_team_record_by_type_detail.html'
          }
        }
      })

      .state('home_page.at_team_record_content', {
        url: '/home_menulist/at_team_record_content/:date/:name/:employee_no',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/at_team_record_content.html'
          }
        }
      })

      .state('home_page.at_team_record_search', {
        url: '/home_menulist/at_team_record_search',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/at_team_record_search.html'
          }
        }
      })

      .state('home_page.at_team_record_detail', {
        url: '/home_menulist/at_team_record_detail/:current_date/:user_name/:staff_no/:employee_no',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/at_team_record_detail.html'
          }
        }
      })

      .state('home_page.ess_my_approval_details', {
        url: '/ess_my_approval_details/:name/:type',

        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/ess_my_approval_details.html'
          }
        }
      })

      .state('home_page.ess_my_approval_details_content', {
        url: '/ess_my_approval_details_content/:p_inst/:show_type/:task_id/:my_app_result/:is_normal_path/:from_source',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/ess_my_approval_details_content.html'
          }
        }
      })

      .state('home_page.ess_my_approval_details_content_fieldwork', {
        url: '/ess_my_approval_details_content_fieldwork/:p_inst/:show_type/:task_id/:my_app_result/:is_normal_path/:from_source',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/ess_my_approval_details_content_fieldwork.html'
          }
        }
      })
      .state('home_page.ess_my_approval_details_content_offic_work_out', {
        url: '/ess_my_approval_details_content_offic_work_out/:p_inst/:show_type/:task_id/:my_app_result/:is_normal_path/:from_source',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/ess_my_approval_details_content_offic_work_out.html'
          }
        }
      })

      .state('home_page.ess_my_approval_details_fieldwork', {
        url: '/ess_my_approval_details_fieldwork/:name/:type',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/ess_my_approval_details_fieldwork.html'
          }
        }
      })
      .state('home_page.ess_my_approval_details_offic_work_out', {
        url: '/ess_my_approval_details_offic_work_out/:name/:type',

        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/ess_my_approval_details_offic_work_out.html'
          }
        }
      })
      .state('home_page.ot_apply', {
        url: '/home_menulist/ot_apply',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/ot_apply.html'
          }
        }
      })
      .state('home_page.add_time', {
        url: '/home_menulist/add_time',
        cache:false,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/add_time.html'
          }
        }
      })
      .state('home_page.add_time_modify', {
        url: '/home_menulist/add_time_modify',
        cache:false,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/add_time_modify.html'
          }
        }
      })

      .state('home_page.ess_my_ot_apply_details', {
        url: '/ess_my_ot_apply_details/:name/:type',

        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/ess_my_ot_apply_details.html'
          }
        }
      })
      .state('home_page.ess_my_ot_approval_details', {
        url: '/ess_my_ot_approval_details/:name/:type',
        cache:false,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/ess_my_ot_approval_details.html'
          }
        }
      })

      .state('home_page.ess_my_ot_apply_details_content', {
        url: '/ess_my_ot_apply_details_content/:p_inst/:show_type/:task_id/:ot_code_n/:s_t/:is_process/:it_date/:from_source',
        cache:false,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/ess_my_ot_apply_details_content.html'
          }
        }
      })

      .state('home_page.ess_my_ot_apply_details_content_modify', {
        url: '/ess_my_ot_apply_details_content_modify/:p_inst/:show_type/:task_id',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/ot_apply.html'
          }
        }
      })

      .state('home_page.ess_my_approval_details_overtime', {
        url: '/ess_my_approval_details_overtime/:name/:type',

        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/ess_my_approval_details_overtime.html'
          }
        }
      })

      .state('home_page.ess_my_approval_details_content_overtime', {
        url: '/ess_my_approval_details_content_overtime/:p_inst/:show_type/:task_id/:app_status/:ot_code_n/:is_normal_path/:from_source',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/ess_my_approval_details_content_overtime.html'
          }
        }
      })


      .state('home_page.ot_team_record', {
        url: '/home_menulist/ot_team_record',

        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/ot_team_record.html'
          }
        }
      })
      .state('home_page.leave_team_record', {
        url: '/home_menulist/leave_team_record',
        cache:true,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/leave_team_record.html'
          }
        }
      })
      .state('home_page.leave_team_details_content', {
        url: '/home_menulist/leave_team_details_content/:process_instance/:app_id/:is_pc/:employee_name',
        cache:false,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/leave_team_details_content.html'
          }
        }
      })

      .state('home_page.leave_team_details_pc_content', {
        url: '/home_menulist/leave_team_details_pc_content/:process_instance/:app_id/:is_pc/:employee_name',
        cache:false,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/leave_team_details_pc_content.html'
          }
        }
      })
      .state('home_page.ot_team_details_content', {
        url: '/home_menulist/ot_team_details_content/:process_instance/:shift_date/:is_pc/:employee_name/:ot_code_name/:employee_no',
        cache:false,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/ot_team_details_content.html'
          }
        }
      })

      .state('home_page.ot_team_details_pc_content', {
        url: '/home_menulist/ot_team_details_pc_content/:process_instance/:shift_date/:is_pc/:employee_name/:ot_code_name/:employee_no',
        cache:false,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/ot_team_details_pc_content.html'
          }
        }
      })

      .state('home_page.my_leave_balance', {
        url: '/home_menulist/my_leave_balance',
        cache:false,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/my_leave_balance.html'
          }
        }
      })
      .state('home_page.outdoor_apply', {
        url: '/home_menulist/outdoor_apply',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/outdoor_apply.html'
          }
        }
      })
      .state('home_page.picklist_outdoor_reason', {
        url: '/home_menulist/picklist_outdoor_reason/:picklist_key_list/:picklist_value_list/:checked_key/:checked_value/:picklist_title/:return_key_field_id/:return_value_field_id/:hidden_fields',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/picklist_outdoor_reason.html'
          }
        }
      })

      .state('home_page.ess_my_out_apply_details', {
        url: '/ess_my_out_apply_details/:name/:type',

        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/ess_my_out_apply_details.html'
          }
        }
      })
      .state('home_page.ess_my_out_apply_details_content', {
        url: '/ess_my_out_apply_details_content/:p_inst/:show_type/:task_id/:s_t/:is_process/:app_id/:from_source',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/ess_my_out_apply_details_content.html'
          }
        }
      })

      .state('home_page.ess_my_approval_details_out', {
        url: '/ess_my_approval_details_out/:name/:type',

        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/ess_my_approval_details_out.html'
          }
        }
      })

      .state('home_page.ess_my_approval_details_content_out', {
        url: '/ess_my_approval_details_content_out/:p_inst/:show_type/:task_id/:app_status/:is_normal_path/:from_source',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/ess_my_approval_details_content_out.html'
          }
        }
      })

      .state('home_page.team_at_exception', {
        url: '/home_menulist/team_at_exception/:start_date/:is_normal_path',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/team_at_exception.html'
          }
        }
      })

      .state('home_page.outdoor_team_record', {
        url: '/home_menulist/outdoor_team_record',

        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/outdoor_team_record.html'
          }
        }
      })
      .state('home_page.outdoor_team_details_content', {
        url: '/home_menulist/outdoor_team_details_content/:process_instance/:app_id',
        cache:false,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/outdoor_team_details_content.html'
          }
        }
      })




      .state('home_page.ess_my_approval_details_content_out_home_message', {
        url: '/ess_my_approval_details_content_out_home_message/:message_type',
        views: {
          'home-message-nav': {
            templateUrl: local_resource+'templates/ess_my_approval_details_content_out_home_message.html'
          }
        }
      })

      .state('home_page.ess_my_apply_details_content_out_home_message', {
        url: '/ess_my_apply_details_content_out_home_message/:message_type',
        cache:true,
        views: {
          'home-message-nav': {
            templateUrl: local_resource+'templates/ess_my_apply_details_content_out_home_message.html'
          }
        }
      })
      .state('home_page.ess_my_approval_details_content_out_msg', {
        url: '/ess_my_approval_details_content_out_msg/:p_inst/:show_type/:task_id/:app_status/:is_normal_path/:from_source',
        views: {
          'home-message-nav': {
            templateUrl: local_resource+'templates/ess_my_approval_details_content_out.html'
          }
        }
      })
      .state('home_page.ess_my_approval_details_content_msg', {
        url: '/ess_my_approval_details_content_msg/:p_inst/:show_type/:task_id/:my_app_result/:is_normal_path/:from_source',
        views: {
          'home-message-nav': {
            templateUrl: local_resource+'templates/ess_my_approval_details_content.html'
          }
        }
      })
      .state('home_page.ess_my_approval_details_content_overtime_msg', {
        url: '/ess_my_approval_details_content_overtime_msg/:p_inst/:show_type/:task_id/:app_status/:ot_code_n/:is_normal_path/:from_source',
        views: {
          'home-message-nav': {
            templateUrl: local_resource+'templates/ess_my_approval_details_content_overtime.html'
          }
        }
      })

      .state('home_page.ess_my_approval_details_content_fieldwork_msg', {
        url: '/ess_my_approval_details_content_fieldwork_msg/:p_inst/:show_type/:task_id/:my_app_result/:is_normal_path/:from_source',
        views: {
          'home-message-nav': {
            templateUrl: local_resource+'templates/ess_my_approval_details_content_fieldwork.html'
          }
        }
      })
      .state('home_page.ess_my_approval_details_content_offic_work_out_msg', {
        url: '/ess_my_approval_details_content_offic_work_out_msg/:p_inst/:show_type/:task_id/:my_app_result/:is_normal_path/:from_source',
        views: {
          'home-message-nav': {
            templateUrl: local_resource+'templates/ess_my_approval_details_content_offic_work_out.html'
          }
        }
      })


      .state('home_page.ess_my_apply_details_content_fieldwork_atsignin', {
        url: '/ess_my_apply_details_content_fieldwork_atsignin/:p_inst/:show_type/:task_id/:s_t/:is_process/:from_source',
        cache:false,
        views: {
          'home-at-sign-in-nav': {
            templateUrl: local_resource+'templates/ess_my_apply_details_content_fieldwork.html'
          }
        }
      })
      .state('home_page.ess_my_apply_details_content_offic_work_out_atsignin', {
        url: '/ess_my_apply_details_content_offic_work_out_atsignin/:p_inst/:show_type/:task_id/:s_t/:is_process/:from_source',
        cache:false,
        views: {
          'home-at-sign-in-nav': {
            templateUrl: local_resource+'templates/ess_my_apply_details_content_offic_work_out.html'
          }
        }
      })
      .state('home_page.team_at_exception_employee_select', {
        url: '/home_menulist/team_at_exception_employee_select/:is_show_leave/:is_show_attendance/:target_date',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/team_at_exception_employee_select.html'
          }
        }
      })
      .state('home_page.leave_balance_team_record', {
        url: '/home_menulist/leave_balance_team_record',
        cache:true,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/leave_balance_team_record.html'
          }
        }
      })

      .state('home_page.team_record_my_leave_balance', {
        url: '/home_menulist/team_record_my_leave_balance/:employee_no/:employee_name',
        cache:false,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/my_leave_balance.html'
          }
        }
      })

      .state('home_page.add_time_my_approval', {
        url: '/home_menulist/add_time_my_approval',
        cache:false,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/add_time_my_approval.html'
          }
        }
      })
      .state('home_page.add_time_my_approval_home_message', {
        url: '/add_time_my_approval_home_message',
        cache:false,
        views: {
          'home-message-nav': {
            templateUrl: local_resource+'templates/add_time_my_approval.html'
          }
        }
      })

      .state('home_page.team_at_exception_msg', {
        url: '/home_menulist/team_at_exception_msg/:start_date/:is_normal_path',

        views: {
          'home-message-nav': {
            templateUrl: local_resource+'templates/team_at_exception.html'
          }
        }
      })
      .state('home_page.team_at_exception_employee_select_msg', {
        url: '/home_menulist/team_at_exception_employee_select_msg/:is_show_leave/:is_show_attendance/:target_date',
        views: {
          'home-message-nav': {
            templateUrl: local_resource+'templates/team_at_exception_employee_select.html'
          }
        }
      })
      .state('home_page.card_record_adj_apply', {
        url: '/home_menulist/card_record_adj_apply/:shift_date',
        cache: true,
        views: {
          'home-at-nav': {
            templateUrl: local_resource+'templates/card_record_adj_apply.html'
          }
        }
      })
      .state('home_page.at_month_report', {
        url: '/home_menulist/at_month_report',
        views: {
          'home-at-nav': {
            templateUrl: local_resource+'templates/at_month_report.html'
          }
        }
      })
      .state('home_page.ess_my_card_adj_apply_details', {
        url: '/ess_my_card_adj_apply_details/:name/:type',

        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/ess_my_card_adj_apply_details.html'
          }
        }
      })
      .state('home_page.ess_my_approval_details_card_adj', {
        url: '/ess_my_approval_details_card_adj/:name/:type',

        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/ess_my_approval_details_card_adj.html'
          }
        }
      })

      .state('home_page.ess_my_card_adj_apply_details_content', {
        url: '/ess_my_card_adj_apply_details_content/:p_inst/:show_type/:task_id/:s_t/:from_source',
        cache:false,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/ess_my_card_adj_apply_details_content.html'
          }
        }
      })

      .state('home_page.ess_my_approval_details_card_adj_content', {
        url: '/ess_my_approval_details_card_adj_content/:p_inst/:show_type/:task_id/:my_app_result/:is_normal_path/:from_source',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/ess_my_approval_details_card_adj_content.html'
          }
        }
      })

      .state('home_page.card_adj_month', {
        url: '/card_adj_month/:target_date/:employee_no/:employee_name/:from_source',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/card_adj_month.html'
          }
        }
      })

      .state('home_page.card_adj_month_msg', {
        url: '/card_adj_month_msg/:target_date/:employee_no/:employee_name/:from_source',
        views: {
          'home-message-nav': {
            templateUrl: local_resource+'templates/card_adj_month.html'
          }
        }
      })

      .state('home_page.ess_my_card_adj_apply_details_content_from_at', {
        url: '/ess_my_card_adj_apply_details_content_from_at/:p_inst/:show_type/:task_id/:s_t/:from_source',
        cache:false,
        views: {
          'home-at-nav': {
            templateUrl: local_resource+'templates/ess_my_card_adj_apply_details_content.html'
          }
        }
      })

      .state('home_page.ess_my_approval_details_card_adj_content_msg', {
        url: '/ess_my_approval_details_card_adj_content_msg/:p_inst/:show_type/:task_id/:my_app_result/:is_normal_path/:from_source',
        views: {
          'home-message-nav': {
            templateUrl: local_resource+'templates/ess_my_approval_details_card_adj_content.html'
          }
        }
      })

      .state('home_page.ess_my_card_adj_apply_details_content_msg', {
        url: '/ess_my_card_adj_apply_details_content_msg/:p_inst/:show_type/:task_id/:s_t/:is_normal_path/:from_source',
        cache:false,
        views: {
          'home-message-nav': {
            templateUrl: local_resource+'templates/ess_my_card_adj_apply_details_content.html'
          }
        }
      })

      .state('home_page.card_adj_team_record', {
        url: '/home_menulist/card_adj_team_record',
        cache:true,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/card_adj_team_record.html'
          }
        }
      })

      .state('home_page.card_adj_team_record_detail_by_type', {
        url: '/card_adj_team_record_detail_by_type/:target_date/:type/:type_name/:dept_id',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/card_adj_team_record_detail_by_type.html'
          }
        }
      })

      .state('home_page.card_adj_month_by_type', {
        url: '/card_adj_month_by_type/:target_date/:employee_no/:type/:type_name/:employee_name',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/card_adj_month_by_type.html'
          }
        }
      })

      .state('home_page.home_message_card_notice', {
        url: '/home_message_card_notice',
        views: {
          'home-message-nav': {
            templateUrl: local_resource+'templates/home_message_card_notice.html'
          }
        }
      })

        /* add by kevin at 2018-11-29 begin */ 
        // 消息模块访客动态
      .state('home_page.home_message_visitor_notice', {
        url: '/home_message_visitor_notice',
        views: {
          'home-message-nav': {
            templateUrl: local_resource+'templates/home_message_visitor_notice.html'
          }
        }
      })

        // 消息模块开门提醒
      .state('home_page.home_message_opendoor_notice', {
        url: '/home_message_opendoor_notice',
        views: {
          'home-message-nav': {
            templateUrl: local_resource+'templates/home_message_opendoor_notice.html'
          }
        }
      })
      /* add by kevin at 2018-11-29 end */ 

      .state('home_page.home_message_secretary', {
        url: '/home_message_secretary',
        views: {
          'home-message-nav': {
            templateUrl: local_resource+'templates/home_message_secretary.html'
          }
        }
      })

      .state('home_page.home_message_secretary_detail', {
        url: '/home_message_secretary_detail/:notice_id/:title',
        views: {
          'home-message-nav': {
            templateUrl: local_resource+'templates/home_message_secretary_detail.html'
          }
        }
      })

      .state('home_page.home_message_notice', {
        url: '/home_message_notice',
        views: {
          'home-message-nav': {
            templateUrl: local_resource+'templates/home_message_notice.html'
          }
        }
      })
      .state('home_page.home_message_system', {
        url: '/home_message_system',
        views: {
          'home-message-nav': {
            templateUrl: local_resource+'templates/home_message_system.html'
          }
        }
      })

      .state('home_page.home_message_notice_detail', {
        url: '/home_message_notice_detail/:notice_id/:toolbar_title',
        views: {
          'home-message-nav': {
            templateUrl: local_resource+'templates/home_message_notice_detail.html'
          }
        }
      })

      .state('home_page.home_message_notice_draft', {
        url: '/home_message_notice_draft/:notice_id/:toolbar_title',
        cache: true,
        views: {
          'home-message-nav': {
            templateUrl: local_resource+'templates/home_message_notice_draft.html'
          }
        }
      })
      .state('home_page.home_message_notice_create', {
        url: '/home_message_notice_create',
        cache: true,
        views: {
          'home-message-nav': {
            templateUrl: local_resource+'templates/home_message_notice_create.html'
          }
        }
      })

      .state('home_page.payroll_cal_employee_select', {
        url: '/home_menulist/payroll_cal_employee_select',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/payroll_cal_employee_select.html'
          }
        }
      })

      .state('home_page.banner_details', {
        cache: false,
        url: '/banner_details/:title/:help_title_id',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/banner_details.html'
          }
        }
      })

	  
      .state('home_page.my_visitor', {
        url: '/home_menulist/my_visitor/:is_share_link',
		cache:true,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/my_visitor.html'
          }
        }
      })
	  
      .state('home_page.add_visitor', {
        url: '/home_menulist/add_visitor',		
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/add_visitor.html'
          }
        }
      })
	  
      .state('home_page.add_visitor_device_list', {
        url: '/home_menulist/add_visitor_device_list/:device_list',
		cache:false,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/add_visitor_device_list.html'
          }
        }
      })
	  
      .state('home_page.picklist_valid_rule', {
        url: '/home_menulist/picklist_valid_rule/:picklist_key_list/:picklist_value_list/:checked_key/:checked_value/:picklist_title/:return_key_field_id/:return_value_field_id/:hidden_fields',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/picklist_valid_rule.html'
          }
        }
      })
	  
      .state('home_page.picklist_visitor_reason', {
        url: '/home_menulist/picklist_visitor_reason/:picklist_key_list/:picklist_value_list/:checked_key/:checked_value/:picklist_title/:return_key_field_id/:return_value_field_id/:hidden_fields',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/picklist_visitor_reason.html'
          }
        }
      })
	  
      .state('home_page.visitor_detail', {
        url: '/visitor_detail/:my_visitor_id/:bgColor/:readonly',
		cache:false,		
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/visitor_detail.html'
          }
        }
      })
      .state('home_page.visitor_detail_modify', {
        url: '/visitor_detail_modify/:my_visitor_id/:bgColor',
		//cache:false,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/visitor_detail_modify.html'
          }
        }
      })
	  
	  
      .state('home_page.sharing_links', {
        url: '/sharing_links/:phone/:name/:date_from/:date_to/:time_from/:time_to/:reason/:address/:sn_list/:valid_mode',		
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/sharing_links.html'
          }
        }
      })
	  
      .state('home_page.entrance_guard_group', {
        url: '/home_menulist/entrance_guard_group',
		cache:false,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/access_shift_group.html'
          }
        }
      })
	  
	  
      .state('home_page.add_access_group', {
        url: '/add_access_group',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/add_access_group.html'
          }
        }
      })
	  
	  
      .state('home_page.edit_access_group', {
        url: '/edit_access_group/:shift_group_id',
		
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/edit_access_group.html'
          }
        }
      })
	  
      .state('home_page.picklist_time_division', {
        url: '/home_menulist/picklist_time_division/:picklist_key_list/:picklist_value_list/:checked_key/:checked_value/:picklist_title/:return_key_field_id/:return_value_field_id/:hidden_fields/:is_add_load',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/picklist_time_division.html'
          }
        }
      })
	  
      .state('home_page.picklist_device_emp_time_division', {
        url: '/home_menulist/picklist_device_emp_time_division/:picklist_key_list/:picklist_value_list/:checked_key/:checked_value/:picklist_title/:return_key_field_id/:return_value_field_id/:hidden_fields/:is_add_load',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/picklist_device_emp_time_division.html'
          }
        }
      })
	  
      .state('home_page.picklist_device_emp_access_group', {
        url: '/home_menulist/picklist_device_emp_access_group/:picklist_key_list/:picklist_value_list/:checked_key/:checked_value/:picklist_title/:return_key_field_id/:return_value_field_id/:hidden_fields/:is_add_load',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/picklist_device_emp_access_group.html'
          }
        }
      })
	  
	  
      .state('home_page.picklist_access_valid_rule', {
        url: '/home_menulist/picklist_access_valid_rule/:picklist_key_list/:shift_group_id/:checked_key/:checked_value/:picklist_title/:return_key_field_id/:return_value_field_id/:hidden_fields',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/picklist_access_valid_rule.html'
          }
        }
      })
	  
      .state('home_page.picklist_device_emp_detail_rule', {
        url: '/home_menulist/picklist_device_emp_detail_rule/:picklist_key_list/:shift_group_id/:checked_key/:checked_value/:picklist_title/:return_key_field_id/:return_value_field_id/:hidden_fields',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/picklist_device_emp_detail_rule.html'
          }
        }
      })
	  
	  
      .state('home_page.holiday_type', {
        url: '/home_default/holiday_type/:device_name/:device_sn',
        cache:false,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/holiday_type.html'
          }
        }
      })
	  
      .state('home_page.remote_user_list', {
        url: '/home_default/remote_user_list/:device_name/:device_sn',
        //cache:false,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/remote_user_list.html'
          }
        }
      })

      .state('home_page.lock_setting', {
        url: '/home_default/lock_setting/:device_name/:device_sn',
        cache:false,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/lock_setting.html'
          }
        }
      })
	  
      .state('home_page.advert_list', {
        url: '/home_menulist/advert_list',
        cache:false,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/advert_list.html'
          }
        }
      })

      .state('home_page.advert_content', {
        url: '/home_menulist/advert_content/:id',
        cache:false,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/advert_content.html'
          }
        }
      })	 

      .state('home_page.add_advert', {
        url: '/home_menulist/add_advert',
        cache:false,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/add_advert.html'
          }
        }
      })
	  
      .state('home_page.add_advert_device_list', {
        url: '/home_menulist/add_advert_device_list/:device_list',
		cache:false,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/add_advert_device_list.html'
          }
        }
      })
	  
      .state('home_page.add_advert_modify', {
        url: '/home_menulist/add_advert_modify/:id',
		
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/add_advert_modify.html'
          }
        }
      })
	  /* 团队出差列表 */
      .state('home_page.team_business_trip', {
        url: '/home_menulist/team_business_trip',
        cache:true,
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/traveling_team_record.html'
          }
        }
      })
      // .state('home_page.traveling_team_record', {
      //   url: '/home_menulist/traveling_team_record',
      //   cache:true,
      //   views: {
      //     'home-default-nav': {
      //       templateUrl: local_resource+'templates/traveling_team_record.html'
      //     }
      //   }
      // })
      
      /* 团队出差详情*/ 
      .state('home_page.team_business', {
        url: '/team_business/:p_inst/:obj_id/:is_pc/:employee_name/:from_source',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/team_business.html'
          }
        }
      })

	/* 我的出差申请列表 */
  .state('home_page.business_trip_apply_new', {
    url: '/business_trip_apply_new/:name/:type',

    views: {
      'home-default-nav': {
        templateUrl: local_resource+'templates/ess_my_traveling_details.html'
      }
    }
  })
  /* 我的出差审批列表 */ 
.state('home_page.business_trip_approve_new', {
    url: '/business_trip_approve_new/:name/:type',
    views: {
      'home-default-nav': {
        templateUrl: local_resource+'templates/ess_my_approval_traveling_record.html'
      }
    }
  })
/* 出差申请详情*/
.state('home_page.business_apply', {
    url: '/business_apply/:p_inst/:show_type/:task_id/:is_process',
    cache:false,
    views: {
      'home-default-nav': {
        templateUrl: local_resource+'templates/business_apply.html'
      }
    }
  })
  /* 出差审批详情*/ 
  .state('home_page.business_approval', {
    url: '/business_approval/:p_inst/:task_id/:show_type/:approval',
    cache:false,
    views: {
      'home-default-nav': {
        templateUrl: local_resource+'templates/business_approval.html'
      }
    }
  })
  .state('home_page.business_approval_message', {
    url: '/business_approval_message/:p_inst/:task_id/:show_type/:approval',
    cache:false,
    views: {
      'home-message-nav': {
        templateUrl: local_resource+'templates/business_approval.html'
      }
    }
  })

  /* 待办消息批量审批*/
  .state('home_page.my_batch_approval_home_message', {
    url: '/my_batch_approval_home_message/:message_type',
    views: {
      'home-message-nav': {
        templateUrl: local_resource+'templates/my_batch_approval_home_message.html'
      }
    }
  })

  /* add at 2019-01-17 by kevin begin */
      // 批量审批模块路由
      .state('home_page.leave_batch_approval', {
        url: '/leave_batch_approval/:name/:type',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/leave_batch_approval.html'
          }
        }
      })
      .state('home_page.overtime_batch_approval', {
        url: '/overtime_batch_approval/:name/:type',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/overtime_batch_approval.html'
          }
        }
      })
      .state('home_page.business_batch_approval', {
        url: '/business_batch_approval/:name/:type',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/business_batch_approval.html'
          }
        }
      })
      .state('home_page.workout_batch_approval', {
        url: '/workout_batch_approval/:name/:type',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/workout_batch_approval.html'
          }
        }
      })
      .state('home_page.out_batch_approval', {
        url: '/out_batch_approval/:name/:type',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/out_batch_approval.html'
          }
        }
      })
      .state('home_page.supplement_batch_approval', {
        url: '/supplement_batch_approval/:name/:type',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/supplement_batch_approval.html'
          }
        }
      })
      .state('home_page.fieldwork_batch_approval', {
        url: '/fieldwork_batch_approval/:name/:type',
        views: {
          'home-default-nav': {
            templateUrl: local_resource+'templates/fieldwork_batch_approval.html'
          }
        }
      })
     /* add at 2019-01-17 by kevin end */  

});

