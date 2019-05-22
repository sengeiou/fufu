package org.apache.cordova.signin;

import android.app.Activity;
import android.bluetooth.BluetoothAdapter;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.net.wifi.WifiManager;
import android.os.Build;
import android.text.TextUtils;

import com.citymobi.fufu.application.FuFuApplication;
import com.citymobi.fufu.bluetooth.BlueToothTool;
import com.citymobi.fufu.bluetooth.MyScanCallback;
import com.citymobi.fufu.utils.DateUtil;
import com.citymobi.fufu.utils.MultiThread;
import com.citymobi.fufu.utils.PermissionManage;
import com.citymobi.fufu.utils.UserConfigPreference;
import com.socks.library.KLog;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaWebView;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import static com.citymobi.fufu.application.FuFuApplication.globalObject;

/**
 * <pre>
 *     author : ZhongQuan
 *     e-mail : xxx@xx
 *     time   : 2017/06/20
 *     desc   : 自动签到插件
 *     version: 1.0
 * </pre>
 */
public class AutoSignIn extends CordovaPlugin {

    private UserConfigPreference mUserConfig = globalObject.getmUserConfig();

    private static AutoSignIn mInstance;
    private static Activity mActivity;

    private static boolean isRunning = false;
    private boolean isPauseSignin = false;// 是否暂停蓝牙打卡
    private static long time = System.currentTimeMillis();
    // SN 码匹配，最大超时时间
    private static final long MAX_LEAVE_INTERVAL = 1000 * 60;

    @Override
    public void initialize(CordovaInterface cordova, CordovaWebView webView) {
        super.initialize(cordova, webView);
        KLog.d("AutoSignIn initialize");
        mInstance = this;
        mActivity = this.cordova.getActivity();
        isRunning = true;
        isPauseSignin = false;
        initBleOriginStatus();
        registerBluetoothReceiver();
        registerNetReceiver();
        MultiThread.getInstance().start();
        startBleScan();
    }

    @Override
    public void onStart() {
        super.onStart();
        KLog.d("onStart");
        startBleScan();
    }

    private void startBleScan() {
        if (isPauseSignin) {
            KLog.d("蓝牙打卡已暂停");
//            BlueToothTool.stopScanning();
            return;
        }
        if (mActivity != null) {
            mActivity.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    if (BlueToothTool.isSupportBle()) {
                        KLog.d("支持 BLE ");
                        if (mActivity != null && BlueToothTool.checkSelfPermission(mActivity)) {
                            BlueToothTool.scanBleDevice();
                        }
                    } else {
                        KLog.d("不支持 BLE ");
                    }
                }
            });
        } else {
            KLog.d("插件未初始化");
        }
    }

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        if ("initBlePlugin".equals(action)) {
            KLog.d("插件初始化");
        } else if ("loginSuccess".equals(action)) {
            KLog.d("登录成功，或者重置签到状态");
            initBleOriginStatus();
        } else if ("setSnList".equals(action)) {
            if (!TextUtils.isEmpty(args.getString(0))) {
                mUserConfig.saveSNList(args.getString(0)).apply();
            } else {
                mUserConfig.saveSNList("").apply();
            }
            KLog.d("SN 码：" + mUserConfig.getSNList());
        } else if ("pauseSignIn".equals(action)) {
            KLog.d("暂停打卡");
            isPauseSignin = true;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                // 将蓝牙扫描接收器设置为空闲模式
                MyScanCallback.getInstance().setType(MyScanCallback.BLUETOOTH_NOTHING);
                BlueToothTool.cancelCountDown();// 停止广播扫描超时的60秒倒计时器
            } else {
                BlueToothTool.stopScanning();
            }
        } else if ("reopenSignIn".equals(action)) {
            KLog.d("重开打卡");
            isPauseSignin = false;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                // 将蓝牙扫描接收器设置为蓝牙打卡模式
                MyScanCallback.getInstance().setType(MyScanCallback.BLUETOOTH_SIGNIN);
            }
            startBleScan();
        }
        return true;
    }

    public static void executeJs(boolean isMatching, String sn, String timeStr) {
        if (isRunning && mInstance != null && mActivity != null) {
            UserConfigPreference mUserConfig = FuFuApplication.globalObject.getmUserConfig();
            if (isMatching) {// 匹配
                time = System.currentTimeMillis();// 更新匹配时间

                if (mUserConfig.getIsLeave() && isNetworkConnected()) {// 之前是离开状态, 且有网络
                    // 保存匹配的 BLE 设备的 sn 码和time码
                    mUserConfig.saveSNBle(sn).saveSNTimeBle(timeStr).apply();
                    // 执行打卡操作
                    realExecuteJs(sn, timeStr);
                    // 保存进入状态
                    mUserConfig.saveIsLeave(false).apply();

                    KLog.d("进入范围，打卡");
                }
            } else {// 不匹配
                if (!mUserConfig.getIsLeave()) {// 之前是进入状态
                    if (isTimeOut()) {// 没有匹配上超过固定时间视为离开状态
                        // 保存离开的标志
                        mUserConfig.saveIsLeave(true).apply();
                        // 离开状态，真正上传的是，进入状态匹配的 SN 码和当前设备的时间(时间格式：170825100955)
                        realExecuteJs(mUserConfig.getSNBle(), DateUtil.getShortFormatDate());
                        // 将本地 SN 码和time码置空
                        mUserConfig.saveSNBle("").saveSNTimeBle("").apply();

                        KLog.d("离开范围，打卡");
                    }
                }
            }
        } else {
            KLog.d("插件未初始化");
        }
    }

    public static void realExecuteJs(String sn, String time) {
        final String format = "javascript:window.plugins.autoSignIn.autoSignInInAndroidCallback(%1$s);";
        final String jsStr = String.format(format, getParamObj(sn, time).toString());
//        KLog.d(jsStr);
        if (!TextUtils.isEmpty(jsStr)) {
            mActivity.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    mInstance.webView.loadUrl(jsStr);
                }
            });
        }
    }

    private static JSONObject getParamObj(String sn, String time) {
        JSONObject param = new JSONObject();
        try {
            param.put("sn", sn);
            param.put("time", time);
        } catch (JSONException e) {
            e.printStackTrace();
        }
        return param;
    }

    /**
     * 初始化 BLE 设备不在范围内状态，即离开状态
     */
    private void initBleOriginStatus() {
        // 每次重开app时，默认为离开状态
        FuFuApplication.globalObject.getmUserConfig().saveIsLeave(true).apply();
        // 重置 SN 码
        FuFuApplication.globalObject.getmUserConfig().saveSNBle("").saveSNTimeBle("").apply();
    }

    /**
     * 注册监听蓝牙开关的状态
     */
    private void registerBluetoothReceiver() {
        if (mActivity != null) {
            IntentFilter filter = new IntentFilter();
            filter.addAction(BluetoothAdapter.ACTION_STATE_CHANGED);
            mActivity.registerReceiver(mBluetoothReceiver, filter);
        }
    }

    private void registerNetReceiver() {
        if (mActivity != null) {
            IntentFilter filter = new IntentFilter();
            filter.addAction(ConnectivityManager.CONNECTIVITY_ACTION);
            filter.addAction(WifiManager.WIFI_STATE_CHANGED_ACTION);
            filter.addAction(WifiManager.NETWORK_STATE_CHANGED_ACTION);
            mActivity.registerReceiver(mNetReceiver, filter);
        }
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        KLog.d("AutoSignIn onDestroy");
        if (mActivity != null && mBluetoothReceiver != null) {
            mActivity.unregisterReceiver(mBluetoothReceiver);
        }
        if (mActivity != null && mNetReceiver != null) {
            mActivity.unregisterReceiver(mNetReceiver);
        }
        MultiThread.getInstance().closeThread();
        BlueToothTool.stopScanning();
        PermissionManage.dissmissDialog();// 由于判断手机权限有Dialog出现，所以在Acitivity销毁时需要销毁Dialog
        isRunning = false;
        mActivity = null;
        mInstance = null;
    }

    /**
     * 蓝牙监听广播
     */
    private BroadcastReceiver mBluetoothReceiver = new BroadcastReceiver() {

        @Override
        public void onReceive(Context context, Intent intent) {
            if (BluetoothAdapter.ACTION_STATE_CHANGED.equals(intent.getAction())) {
                int blueState = intent.getIntExtra(BluetoothAdapter.EXTRA_STATE, 0);
                switch (blueState) {
                    case BluetoothAdapter.STATE_TURNING_ON:
                        KLog.e("onReceive---------STATE_TURNING_ON");
                        break;
                    case BluetoothAdapter.STATE_ON:
                        if (isResetEnterState()) {
                            initBleOriginStatus();
                        }
                        time = System.currentTimeMillis();
                        startBleScan();
                        KLog.e("onReceive---------STATE_ON");
                        break;
                    case BluetoothAdapter.STATE_TURNING_OFF:
                        KLog.e("onReceive---------STATE_TURNING_OFF");
                        break;
                    case BluetoothAdapter.STATE_OFF:
                        BlueToothTool.stopScanning();
                        KLog.e("onReceive---------STATE_OFF");
                        break;
                }
            }
        }
    };

    private BroadcastReceiver mNetReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            // 监听wifi的打开与关闭，与wifi的连接无关
            if (WifiManager.WIFI_STATE_CHANGED_ACTION.equals(intent.getAction())) {
                int wifiState = intent.getIntExtra(WifiManager.EXTRA_WIFI_STATE, 0);
                switch (wifiState) {
                    case WifiManager.WIFI_STATE_ENABLED:
                        //已打开
                        break;
                    case WifiManager.WIFI_STATE_ENABLING:
                        //打开中
                        break;
                    case WifiManager.WIFI_STATE_DISABLED:
                        //已关闭
                        break;
                    case WifiManager.WIFI_STATE_DISABLING:
                        //关闭中
                        break;
                    case WifiManager.WIFI_STATE_UNKNOWN:
                        //未知
                        break;
                }
            }

            if (ConnectivityManager.CONNECTIVITY_ACTION.equals(intent.getAction())) {
                NetworkInfo info = intent.getParcelableExtra(ConnectivityManager.EXTRA_NETWORK_INFO);
                if (info != null) {
                    if (NetworkInfo.State.CONNECTED == info.getState()) {
                        int netType = info.getType();
                        switch (netType) {
                            case ConnectivityManager.TYPE_WIFI:
                                KLog.d("wifi 开关打开");
                                if (isResetEnterState()) {
                                    initBleOriginStatus();
                                }
                                break;
                            case ConnectivityManager.TYPE_MOBILE:
                                KLog.d("移动数据 开关打开");
                                if (isResetEnterState()) {
                                    initBleOriginStatus();
                                }
                                break;
                        }
                    } else {
                        KLog.d("网络断开");
                    }
                }
            }
        }
    };

    /**
     * 判断是否有网络连接
     */
    private synchronized static boolean isNetworkConnected() {
        ConnectivityManager mConnectivityManager = (ConnectivityManager) FuFuApplication.getmInstance().getSystemService(Context.CONNECTIVITY_SERVICE);
        NetworkInfo mNetworkInfo = mConnectivityManager.getActiveNetworkInfo();
        if (mNetworkInfo != null) {
            return mNetworkInfo.isAvailable();
        }
        return false;
    }

    /**
     * 判断是否超时
     *
     * @return
     */
    private synchronized static boolean isTimeOut() {
//        long nowTime = System.currentTimeMillis();
//        if (nowTime > time) {
//            KLog.i("Timeout", "超时：" + (nowTime - time) / 1000);
//        } else {
//            KLog.i("Timeout", "超时：-" + (time - nowTime) / 1000);
//        }
        return Math.abs(System.currentTimeMillis() - time) > MAX_LEAVE_INTERVAL;
    }

    /**
     * 是否重置初始化(进入)状态
     * <p>
     * 判断之前是 进入状态 且 超时
     *
     * @return
     */
    private static boolean isResetEnterState() {
        return !FuFuApplication.globalObject.getmUserConfig().getIsLeave() && isTimeOut();
    }
}
