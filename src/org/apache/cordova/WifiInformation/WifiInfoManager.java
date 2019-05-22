package org.apache.cordova.WifiInformation;

import android.content.Context;
import android.net.wifi.ScanResult;
import android.net.wifi.WifiInfo;
import android.net.wifi.WifiManager;
import android.text.TextUtils;

import com.citymobi.fufu.application.FuFuApplication;
import com.citymobi.fufu.utils.WifiUtil;
import com.socks.library.KLog;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaArgs;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.List;

/**
 * 获取wifi信息插件
 * Created by shangzh on 16/6/22.
 */
public class WifiInfoManager extends CordovaPlugin {
    private CallbackContext mCallback;

    @Override
    public boolean execute(String action, CordovaArgs args, final CallbackContext callbackContext) throws JSONException {
        mCallback = callbackContext;
        if (action.equals("wifiInfo")) {
            callbackContext.success(getWifiInfo());
            KLog.json(getWifiInfo().toString());
        } else if ("wifiList".equals(action)) {
            getWifiList();
        }
        return true;
    }

    private JSONObject getWifiInfo() {
        WifiManager wm = (WifiManager) FuFuApplication.getmInstance().getSystemService(Context.WIFI_SERVICE);
        if (wm != null) {
            wm.getWifiState();
            WifiInfo wi = wm.getConnectionInfo();
            if (wm.getWifiState() == WifiManager.WIFI_STATE_ENABLED && wi != null) {
                try {
                    if (!TextUtils.isEmpty(wi.getSSID()) && !TextUtils.isEmpty(wi.getBSSID())) {
                        return getWifiInfoObj(wi.getSSID(), wi.getBSSID(), "1");
                    } else {
                        return getWifiInfoObj("", "", "-1");
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                    return getWifiInfoObj("", "", "-1");
                }
            }
        }
        return getWifiInfoObj("", "", "0");
    }

    private JSONObject getWifiInfoObj(String wifiName, String mac, String state) {
        JSONObject jObj = new JSONObject();
        try {
            jObj.put("wifiName", wifiName);
            jObj.put("mac", mac);
            jObj.put("state", state);
        } catch (JSONException e) {
            e.printStackTrace();
        }
        return jObj;
    }

    private void getWifiList() {
        WifiUtil wifiUtil = new WifiUtil(FuFuApplication.getmInstance());
        wifiUtil.startScan(FuFuApplication.getmInstance());
        List<ScanResult> wifiList = wifiUtil.getWifiList();
        JSONObject object = getWifiListObj(wifiList);
        callbackSuccess(object);
        if (object != null) {
            KLog.json(object.toString());
        }
    }

    private JSONObject getWifiListObj(List<ScanResult> wifiList) {
        try {
            JSONArray array = new JSONArray();
            if (wifiList != null && !wifiList.isEmpty()) {
                for (ScanResult scanResult : wifiList) {
                    if (!TextUtils.isEmpty(scanResult.SSID) && !TextUtils.isEmpty(scanResult.BSSID)) {
                        KLog.i(scanResult.SSID + "-" + scanResult.BSSID + "-" + scanResult.capabilities);
                        JSONObject obj = new JSONObject();
                        obj.put("ssid", scanResult.SSID);
                        obj.put("bssid", scanResult.BSSID);
                        obj.put("level", 4);
//                        obj.put("isPassWord", scanResult.capabilities.trim().equals("[ESS]") ? 0 : 1);
                        if (!TextUtils.isEmpty(scanResult.capabilities) && (scanResult.capabilities.equals("[ESS]") || scanResult.capabilities.equals("[WPS][ESS]") || scanResult.capabilities.equals("[ESS][WPS]"))) {
                            obj.put("isPassWord", 0);
                        } else {
                            obj.put("isPassWord", 1);
                        }
                        array.put(obj);
                    }
                }
            }
            JSONObject list = new JSONObject();
            list.put("list", array);
            return list;
        } catch (JSONException e) {
            e.printStackTrace();
        }
        return null;
    }

    private void callbackSuccess(JSONObject object) {
        if (mCallback != null) {
            mCallback.success(object);
        }
    }
}
