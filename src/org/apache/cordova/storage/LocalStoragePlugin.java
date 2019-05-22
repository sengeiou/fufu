package org.apache.cordova.storage;

import android.text.TextUtils;

import com.citymobi.fufu.application.FuFuApplication;
import com.citymobi.fufu.utils.UserConfigPreference;
import com.socks.library.KLog;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaWebView;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * <pre>
 *     author : Administrator
 *     e-mail : xxx@xx
 *     time   : 2017/10/30
 *     desc   : 数据存储插件
 *     version: 1.0
 * </pre>
 */
public class LocalStoragePlugin extends CordovaPlugin {
    private UserConfigPreference mUserConfig = FuFuApplication.globalObject.getmUserConfig();
    private final String H5LOCALSTORAGE = "h5_local_storage";

    @Override
    public void initialize(CordovaInterface cordova, CordovaWebView webView) {
        super.initialize(cordova, webView);
    }

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        if ("setLocalStorageVal".equals(action)) {
            KLog.d("key :" + args.getString(0) + " 值 :" + args.getString(1));
            setLocalStorageVal(args.getString(0), args.getString(1));
        } else if ("getLocalStorageVal".equals(action)) {
            JSONObject value = getLocalStorageVal();
            callbackContext.success(value);
            KLog.i(value);
        }
        return true;
    }

    private void setLocalStorageVal(final String key, final String value) {
        if (key == null || key.isEmpty()) {
            return;
        }
        new Thread(new Runnable() {
            @Override
            public void run() {
                String jsonData = mUserConfig.getLocalData(H5LOCALSTORAGE);
                if (!TextUtils.isEmpty(jsonData)) {
                    try {
                        JSONObject object = new JSONObject(jsonData);
                        object.put(key, value);
                        mUserConfig.saveData(H5LOCALSTORAGE, object.toString()).apply();
                    } catch (JSONException e) {
                        e.printStackTrace();
                    }
                } else {
                    try {
                        JSONObject object = new JSONObject();
                        object.put(key, value);
                        mUserConfig.saveData(H5LOCALSTORAGE, object.toString()).apply();
                    } catch (JSONException e) {
                        e.printStackTrace();
                    }
                }
            }
        }).start();
    }

    private JSONObject getLocalStorageVal() {
        String jsonStr = mUserConfig.getLocalData(H5LOCALSTORAGE);
        if (!jsonStr.isEmpty()) {
            try {
                return new JSONObject(jsonStr);
            } catch (JSONException e) {
                e.printStackTrace();
            }
        }
        return new JSONObject();
    }
}
