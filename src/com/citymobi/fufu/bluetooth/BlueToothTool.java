package com.citymobi.fufu.bluetooth;

import android.Manifest;
import android.annotation.TargetApi;
import android.app.Activity;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothManager;
import android.bluetooth.le.BluetoothLeScanner;
import android.content.Context;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.CountDownTimer;
import android.os.Handler;
import android.os.Message;
import android.support.v4.content.ContextCompat;

import com.citymobi.fufu.R;
import com.citymobi.fufu.application.FuFuApplication;
import com.citymobi.fufu.utils.MultiThread;
import com.citymobi.fufu.utils.PermissionManage;
import com.citymobi.fufu.utils.StringUtil;
import com.socks.library.KLog;

import org.apache.cordova.signin.AutoSignIn;

import static android.content.Context.BLUETOOTH_SERVICE;

/**
 * <pre>
 *     author : ZhongQuan
 *     e-mail : xxx@xx
 *     time   : 2017/06/20
 *     desc   : 自动打卡蓝牙工具类
 *     version: 3.2
 * </pre>
 */
@TargetApi(Build.VERSION_CODES.LOLLIPOP)
public class BlueToothTool {

    private static BluetoothAdapter mBluetoothAdapter;
    // Android 5.0 以上
    private static BluetoothLeScanner mBluetoothLeScanner;
    // Android 5.0 以下，4.3 以上
    // 再次重启BLE扫描时间间隔
    private static final long AGAIN_SCAN_INTERVAL = 1000 * 10;
    // 倒计时器的时长
    private static final long COUNTDOWN_TIME = 1000 * 60;

    /**
     * Device scan callback
     * Android 5.0 之前
     */
    private static BluetoothAdapter.LeScanCallback mLeScanCallback = new BluetoothAdapter.LeScanCallback() {

        @Override
        public void onLeScan(final BluetoothDevice device, int rssi, byte[] scanRecord) {
//            KLog.d(device.getAddress());
            processingBleData(scanRecord);
        }
    };

    /**
     * 检测手机是否支持 BLE 设备
     *
     * @return
     */
    public static boolean isSupportBle() {
        Context mContext = FuFuApplication.getmInstance();
        // 检查当前手机是否支持ble 蓝牙
        if (!mContext.getPackageManager().hasSystemFeature(PackageManager.FEATURE_BLUETOOTH_LE)) {
            return false;
        }

        final BluetoothManager mBluetoothManager = (BluetoothManager) FuFuApplication.getmInstance().getSystemService(BLUETOOTH_SERVICE);
        mBluetoothAdapter = mBluetoothManager.getAdapter();

        if (mBluetoothAdapter == null) {
            return false;
        }
        // 打开蓝牙开关是否打开
        return mBluetoothAdapter.isEnabled();
    }

    /**
     * 扫描 BLE 设备, 延迟一秒
     */
    public static void scanBleDevice() {
        if (mBluetoothAdapter.isEnabled()) {
            startCountDown();
            // 延时1秒再执行蓝牙扫描是考虑到手机蓝牙开关打开需要时间
            mHandler.postDelayed(mDelayedRunnable, 1000);
        }
    }

    /**
     * 真正扫描方法
     */
    private static void realScanBleDevice() {
        if (!mBluetoothAdapter.isEnabled() || mBluetoothAdapter == null || mBluetoothAdapter.getState() != BluetoothAdapter.STATE_ON) {
            return;
        }
        // Android 5.0 及以上
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            mBluetoothLeScanner = mBluetoothAdapter.getBluetoothLeScanner();
            if (mBluetoothLeScanner != null) {
                // 将蓝牙扫描接收器设置为蓝牙打卡模式
                MyScanCallback.getInstance().setType(MyScanCallback.BLUETOOTH_SIGNIN);
                mBluetoothLeScanner.startScan(MyScanCallback.getInstance());
            }
        } else {
            if (mBluetoothAdapter != null) {
                // 没间隔固定时间，重新开始扫描
                mHandler.postDelayed(mRunnable, AGAIN_SCAN_INTERVAL);
                mBluetoothAdapter.startLeScan(mLeScanCallback);
                KLog.i("Android 5.0 以下的蓝牙扫描");
            }
        }
    }

    /**
     * 停止BLE 设备扫描
     */
    public static void stopScanning() {
        cancelCountDown();
        if (mHandler != null && mDelayedRunnable != null) {
            mHandler.removeCallbacks(mDelayedRunnable);
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            if (mBluetoothLeScanner != null && mBluetoothAdapter != null && mBluetoothAdapter.isEnabled()) {// && mBleScanCallback != null
                mBluetoothLeScanner.stopScan(MyScanCallback.getInstance());
                KLog.i("停止扫描");
            }
        } else {
            if (mBluetoothAdapter != null) {
                mBluetoothAdapter.stopLeScan(mLeScanCallback);
                if (mHandler != null && mRunnable != null) {
                    mHandler.removeCallbacks(mRunnable);
                }
                KLog.i("停止扫描");
            }
        }
    }

    /**
     * 定位权限检测，android 6.0 蓝牙 BLE 扫描必备条件
     *
     * @param activity
     * @return
     */
    public static boolean checkSelfPermission(Activity activity) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            if (ContextCompat.checkSelfPermission(FuFuApplication.getmInstance(), Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
                PermissionManage.openAppLocationHint(activity, R.string.dialog_title_gps, R.string.request_gps_permission);
                return false;
            }
        }
        return true;
    }

    private static Handler mHandler = new Handler() {

        @Override
        public void handleMessage(Message msg) {
            switch (msg.what) {
                case 1:
                    KLog.i("开始扫描");
                    realScanBleDevice();
                    break;
            }
        }
    };

    private static Runnable mRunnable = new Runnable() {
        @Override
        public void run() {
            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.LOLLIPOP) {
                if (mBluetoothAdapter != null && mLeScanCallback != null) {
                    mBluetoothAdapter.stopLeScan(mLeScanCallback);
                    if (mHandler != null && mRunnable != null) {
                        mHandler.removeCallbacks(mRunnable);
                    }
                }
            }
            realScanBleDevice();
            KLog.d("Android 4.4.4 重开扫描");
        }
    };

    private static Runnable mDelayedRunnable = new Runnable() {
        @Override
        public void run() {
            mHandler.sendEmptyMessage(1);
        }
    };


    /**
     * 处理广播包数据，只根据SN码进行匹配
     *
     * @param b
     */
    public static void processingBleData(byte[] b) {
        if (b != null) {
            // 广播包十六进制字符串
            KLog.d(StringUtil.byte2HexStr(b));
            // 重新倒计时
            restartCountDown();
            // 数据设置进线程中处理
            MultiThread.getInstance().setData(b);
        }
    }

    /**
     * 蓝牙广播扫描超时倒计时器，60S
     */
    private static CountDownTimer mCountDownTimer = new CountDownTimer(COUNTDOWN_TIME, 10000) {
        @Override
        public void onTick(long millisUntilFinished) {
            KLog.d("倒计时正在运行");
        }

        @Override
        public void onFinish() {
            AutoSignIn.executeJs(false, "", "");
            KLog.d("倒计时结束");
        }
    };

    private static void startCountDown() {
        mCountDownTimer.cancel();
        mCountDownTimer.start();
    }

    private static void restartCountDown() {
        startCountDown();
    }

    public static void cancelCountDown() {
        mCountDownTimer.cancel();
        KLog.d("取消倒计时");
    }
}
