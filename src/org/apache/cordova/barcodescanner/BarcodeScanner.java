package org.apache.cordova.barcodescanner;

import android.app.Activity;
import android.content.Intent;
import android.os.Build;

import com.citymobi.fufu.R;
import com.citymobi.fufu.utils.ActivityManagerUtils;
import com.citymobi.fufu.utils.PermissionManage;
import com.google.zxing.activity.CaptureActivity;
import com.socks.library.KLog;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaWebView;
import org.json.JSONArray;
import org.json.JSONException;

/**
 * 二维码扫描插件
 */
public class BarcodeScanner extends CordovaPlugin {
    private static Activity mActivity;
    private static CallbackContext mCallback;

    // 打开扫描界面请求码
    private int REQUEST_CODE = 2001;

    @Override
    public void initialize(CordovaInterface cordova, CordovaWebView webView) {
        super.initialize(cordova, webView);
        mActivity = cordova.getActivity();
    }

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        mCallback = callbackContext;
        KLog.d(action);
        if ("checkCameraPermission".equals(action)) {
            checkCameraPermission();
        } else if ("scan".equals(action)) {
            KLog.d("开启二维码扫描");
            Intent scanIntent = new Intent(mActivity, CaptureActivity.class);
            this.cordova.startActivityForResult(this, scanIntent, REQUEST_CODE);
        } else if ("close".equals(action)) {
            KLog.d("关闭二维码扫描界面");
            ActivityManagerUtils.getInstance().finishActivityclass(CaptureActivity.class);
        }
        return true;
    }

    private void checkCameraPermission() {
        if (Build.VERSION.SDK_INT >= 23) {
            if (PermissionManage.isCameraAvailable()) {
                callbackSuccess(1);
            } else {
                PermissionManage.openPermissionHint(BarcodeScanner.this, R.string.dialog_title_camera, R.string.request_camera_permission);
                callbackSuccess(0);
                KLog.d();
            }
        } else {
            callbackSuccess(1);
        }
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent intent) {
//        if (requestCode == REQUEST_CODE && resultCode == CaptureActivity.RESULT_CODE_QR_SCAN) {
//            String resultStr = intent.getExtras().getString(CaptureActivity.INTENT_EXTRA_KEY_QR_SCAN);
//            KLog.d(resultStr);
//            callbackSuccess(resultStr);
//            KLog.d(resultStr);
//        }
    }

    public static void resultBarcodeString(String qrCode) {
        if (mActivity != null) {
            if (mCallback != null) {
                KLog.d(qrCode);
                mCallback.success(qrCode);
            }
        }
    }

    private void callbackSuccess(String msg) {
        if (mCallback != null) {
            mCallback.success(msg);
        }
    }

    private void callbackSuccess(int i) {
        if (mCallback != null) {
            mCallback.success(i);
        }
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        mActivity = null;
        mCallback = null;
    }
}
