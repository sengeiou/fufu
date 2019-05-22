package com.citymobi.fufu.bluetooth;

import android.annotation.TargetApi;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothManager;
import android.bluetooth.le.BluetoothLeScanner;
import android.content.Context;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Handler;
import android.os.Message;

import com.citymobi.fufu.application.FuFuApplication;
import com.citymobi.fufu.utils.BluetoothThread;
import com.citymobi.fufu.utils.StringUtil;
import com.socks.library.KLog;

import static android.content.Context.BLUETOOTH_SERVICE;

/**
 * <pre>
 *     author : ZhongQuan
 *     e-mail : xxx@xx
 *     time   : 2017/08/25
 *     desc   : 蓝牙配置工具类，蓝牙第二阶段
 *     version: 3.3
 * </pre>
 */
@TargetApi(Build.VERSION_CODES.LOLLIPOP)
public class BluetoothConfigTool {

    private static BluetoothAdapter mBluetoothAdapter;
    // Android 5.0 以上
    private static BluetoothLeScanner mBluetoothLeScanner;
    // Android 5.0 以下，4.3 以上
    // 再次重启BLE扫描时间间隔
    private static final long AGAIN_SCAN_INTERVAL = 1000 * 10;

    /**
     * Device scan callback
     * Android 5.0 之前
     */
    private static BluetoothAdapter.LeScanCallback mLeScanCallback = new BluetoothAdapter.LeScanCallback() {

        @Override
        public void onLeScan(final BluetoothDevice device, int rssi, byte[] scanRecord) {
            processingBleData(device, scanRecord);
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
        return true;
    }

    /**
     * 检测蓝牙开关是否打开
     *
     * @return
     */
    public static boolean isBluetoothEnabled() {
        BluetoothAdapter bluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
        if (bluetoothAdapter != null) {
            return bluetoothAdapter.isEnabled();
        }
        return false;
    }


    /**
     * 扫描 BLE 设备, 延迟一秒
     */
    public static boolean scanBleDevice() {
        if (mBluetoothAdapter.isEnabled()) {
            realScanBleDevice();
            return true;
        } else {
            return false;
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
                KLog.d("开始蓝牙广播包扫描");
                // 将蓝牙扫描接收器设置为配置考勤机模式
                MyScanCallback.getInstance().setType(MyScanCallback.BLUETOOTH_CONFIG);
                mBluetoothLeScanner.startScan(MyScanCallback.getInstance());
            } else {
                KLog.w("mBluetoothLeScanner is null");
            }
        } else {
            if (mBluetoothAdapter != null) {
                // 间隔固定时间重新开始扫描
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
        if (mHandler != null && mDelayedRunnable != null) {
            mHandler.removeCallbacks(mDelayedRunnable);
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            MyScanCallback.getInstance().setType(MyScanCallback.BLUETOOTH_NOTHING);
            if (mBluetoothLeScanner != null && mBluetoothAdapter != null && mBluetoothAdapter.isEnabled()) {// && mBleScanCallback != null
                mBluetoothLeScanner.stopScan(MyScanCallback.getInstance());
                KLog.d("停止BLE扫描");
            }
        } else {
            if (mBluetoothAdapter != null) {
                mBluetoothAdapter.stopLeScan(mLeScanCallback);
                if (mHandler != null && mRunnable != null) {
                    mHandler.removeCallbacks(mRunnable);
                }
                KLog.d("停止BLE扫描");
            }
        }
    }

    private static Handler mHandler = new Handler() {

        @Override
        public void handleMessage(Message msg) {
            switch (msg.what) {
                case 1:
                    KLog.d("开始扫描");
                    realScanBleDevice();
                    break;
            }
        }
    };

    private static Runnable mRunnable = new Runnable() {
        @Override
        public void run() {
            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.LOLLIPOP) {
                if (mBluetoothAdapter != null && mLeScanCallback != null && mBluetoothAdapter.isEnabled()) {
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
     * 处理蓝牙广播包数据
     *
     * @param device
     * @param b
     */
    public static void processingBleData(BluetoothDevice device, byte[] b) {
        if (device != null && b != null) {
            // 广播包十六进制字符串
            KLog.i(StringUtil.byte2HexStr(b));
            // 数据设置进线程中处理
            BluetoothThread.getInstance().setDataAndDevice(b, device.getAddress());
        }
    }
}
