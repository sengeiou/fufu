package org.apache.cordova.map;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.location.LocationManager;
import android.os.Binder;
import android.os.Build;
import android.support.v4.content.ContextCompat;
import android.text.TextUtils;

import com.amap.api.location.AMapLocation;
import com.amap.api.location.AMapLocationClient;
import com.amap.api.location.AMapLocationClientOption;
import com.amap.api.location.AMapLocationListener;
import com.citymobi.fufu.R;
import com.citymobi.fufu.application.FuFuApplication;
import com.citymobi.fufu.utils.AMapUtil;
import com.citymobi.fufu.utils.PermissionManage;
import com.citymobi.fufu.widgets.CustomDialog;
import com.socks.library.KLog;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaArgs;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.map.activity.SearchMapActivity;
import org.apache.cordova.map.activity.ShowMapActivity;
import org.apache.cordova.map.activity.ShowMapWithCoordinatActivity;
import org.apache.cordova.map.activity.SingCountMapActivity;
import org.json.JSONException;
import org.json.JSONObject;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

/**
 * Created by Zhongquan on 16/5/10.
 * <p>
 * 地图插件
 */
public class GetLocation extends CordovaPlugin implements AMapLocationListener {

    //定位
    private AMapLocationClient locationClient = null;
    private AMapLocationClientOption locationOption = null;

    private JSONObject locStr = null;
    private CallbackContext locCallback;

    private String selectedTitle = "";
    private String selectedLongitude = "";
    private String selectedLatitude = "";

    private CordovaPlugin cordovaPlugin;

    private CustomDialog myDialog;

    public static final int REQUEST_CODE_SET_LOCK_PATTERN = 10001;

    @Override
    public boolean execute(String action, CordovaArgs args, final CallbackContext callbackContext) throws JSONException {
        locCallback = callbackContext;
        cordovaPlugin = this;
        KLog.d(action);
        if ("location".equals(action)) {
            this.getLocation();
        } else if ("showMap".equals(action)) {
            JSONObject obj = args.getJSONObject(0);
            KLog.json(obj.toString());
            Intent i = new Intent(this.cordova.getActivity(), ShowMapActivity.class);
            i.putExtra("latitude", obj.getString("latitude"));
            i.putExtra("longitude", obj.getString("longitude"));
            i.putExtra("addressTitle", obj.getString("address"));
            i.putExtra("addressDetail", obj.getString("city"));
            this.cordova.startActivityForResult(this, i, 1001);
        } else if ("showMapWithCoordinate".equals(action)) {
            JSONObject info = args.getJSONObject(0);
            Intent a = new Intent(this.cordova.getActivity(), ShowMapWithCoordinatActivity.class);
            a.putExtra("latitude", info.getDouble("latitude"));
            a.putExtra("longitude", info.getDouble("longitude"));
            a.putExtra("address", info.getString("address"));
            //启动activity
            this.cordova.startActivityForResult(this, a, 0);
        } else if ("searchMap".equals(action)) {
            JSONObject searinfo = args.getJSONObject(0);
            KLog.json(searinfo.toString());
            Intent search = new Intent(this.cordova.getActivity(), SearchMapActivity.class);
            if (searinfo.getString("latitude").length() > 0 && searinfo.getString("longitude").length() > 0 && searinfo.getString("anotherName").length() > 0) {
                search.putExtra("latitude", searinfo.getDouble("latitude"));
                search.putExtra("longitude", searinfo.getDouble("longitude"));
                search.putExtra("anotherName", searinfo.getString("anotherName"));
            } else {
                search.putExtra("latitude", "");
                search.putExtra("longitude", "");
                search.putExtra("anotherName", "");
            }
            this.cordova.startActivityForResult(this, search, 0);
        } else if ("singCountMap".equals(action)) {
            JSONObject info = args.getJSONObject(0);
            Intent countMap = new Intent(this.cordova.getActivity(), SingCountMapActivity.class);
            countMap.putExtra("url", info.getString("url"));
            countMap.putExtra("target_date", info.getString("target_date"));

            this.cordova.startActivityForResult(this, countMap, 0);
        } else if ("checkCanLocation".equals(action)) {
            if (rightManagement()) {
                locCallback.success(1);
            } else {
                locCallback.success(0);
            }
        }
        return true;
    }

    /**
     * 高德定位
     */
    public void getLocation() {
        // 初始化定位
        locationClient = new AMapLocationClient(FuFuApplication.getmInstance());
        locationOption = AMapUtil.getDefaultOption();
        // 设置定位参数
        locationClient.setLocationOption(locationOption);
        // 设置定位监听
        locationClient.setLocationListener(this);
//        locationClient.stopLocation();
        // 启动定位
        locationClient.startLocation();
    }

    /**
     * 高德定位回调
     *
     * @param loc
     */
    @Override
    public void onLocationChanged(AMapLocation loc) {
        if (loc != null) {
            if (loc.getErrorCode() == 0) {// 当定位错误码类型为0时定位成功
                KLog.d(loc.toString());
                if (loc.getLatitude() == 0 || loc.getLongitude() == 0 || TextUtils.isEmpty(loc.getAddress())) {
                    callbackError();
                } else {
                    try {
                        locStr = MapUtil.getLocation(loc);
                        KLog.json(locStr.toString());
                        callbackSuccess(locStr);
                    } catch (JSONException e) {
                        e.printStackTrace();
                    }
                }
            } else {
                callbackError();
            }
        } else {
            callbackError();
            KLog.e("定位对象为空");
        }
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent intent) {
        if (resultCode == Activity.RESULT_OK) {
            JSONObject jsonObject = new JSONObject();
            try {
                if (requestCode == 1001) {// ShowMapActivity
                    jsonObject.put("latitude", intent.getStringExtra("latitude"));
                    jsonObject.put("longitude", intent.getStringExtra("longitude"));
                    jsonObject.put("address", intent.getStringExtra("addressTitle"));
                    jsonObject.put("detailAddress", intent.getStringExtra("addressDetail"));
                    jsonObject.put("city", intent.getStringExtra("city"));
                } else {
                    selectedLongitude = intent.getStringExtra("longitude");
                    selectedLatitude = intent.getStringExtra("latitude");
                    jsonObject.put("longitude", selectedLongitude);
                    jsonObject.put("latitude", selectedLatitude);
                    jsonObject.put("address", intent.getStringExtra("address"));
                    jsonObject.put("anotherName", intent.getStringExtra("anotherName"));
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
            KLog.json(jsonObject.toString());
            callbackSuccess(jsonObject);
        }
    }

    private boolean rightManagement() {

        boolean falg = false;
        if (Build.VERSION.SDK_INT >= 23) {
            if (ContextCompat.checkSelfPermission(this.cordova.getActivity(),
                    android.Manifest.permission.ACCESS_COARSE_LOCATION)
                    != PackageManager.PERMISSION_GRANTED) {
                PermissionManage.openPermissionHint(cordovaPlugin, R.string.dialog_title_gps, R.string.allow_gps_permission_please);

                falg = false;
            } else {
                falg = true;
            }
        } else {
            Object object = this.cordova.getActivity().getSystemService(Context.APP_OPS_SERVICE);
            if (object != null) {
                Class c = object.getClass();
                try {
                    Class[] cArg = new Class[3];
                    cArg[0] = int.class;
                    cArg[1] = int.class;
                    cArg[2] = String.class;
                    Method lMethod = c.getDeclaredMethod("checkOp", cArg);
                    int result = (Integer) lMethod.invoke(object, 1, Binder.getCallingUid(), this.cordova.getActivity().getPackageName());
                    if (result == 0) {
                        falg = true;
                        return falg;
                    } else {
                        PermissionManage.openAppSettingHint(cordovaPlugin, R.string.dialog_hint, R.string.allow_gps_permission_please);

                        falg = false;
                    }
                } catch (NoSuchMethodException e) {
                    e.printStackTrace();
                } catch (IllegalAccessException e) {
                    e.printStackTrace();
                } catch (IllegalArgumentException e) {
                    e.printStackTrace();
                } catch (InvocationTargetException e) {
                    e.printStackTrace();
                }
            } else {
                LocationManager locationManager = (LocationManager) this.cordova.getActivity().getSystemService(Context.LOCATION_SERVICE);
                // 通过GPS卫星定位
                boolean gps = locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER);
                if (gps) {
                    falg = true;
                } else {
                    PermissionManage.openAppSettingHint(cordovaPlugin, R.string.dialog_hint, R.string.open_gps_please);

                    falg = false;
                }
            }
        }
        return falg;
    }

    private void callbackSuccess(JSONObject object) {
        if (locCallback != null) {
            locCallback.success(object);
        }
    }

    private void callbackError() {
        if (locCallback != null) {
            locCallback.error("fail");
        }
    }

    @Override
    public void onDestroy() {
        if (locationClient != null) {
            locationClient.onDestroy();
        }
    }
}
