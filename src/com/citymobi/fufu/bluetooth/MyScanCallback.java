package com.citymobi.fufu.bluetooth;

import android.annotation.TargetApi;
import android.bluetooth.le.ScanCallback;
import android.bluetooth.le.ScanRecord;
import android.bluetooth.le.ScanResult;
import android.os.Build;

import com.socks.library.KLog;

import java.util.List;

/**
 * <pre>
 *     author : ZhongQuan
 *     e-mail : xxx@xx
 *     time   : 2017/11/21
 *     desc   :
 *     version: 1.0
 * </pre>
 */
@TargetApi(Build.VERSION_CODES.LOLLIPOP)
public class MyScanCallback extends ScanCallback {

    public static final int BLUETOOTH_NOTHING = -1;     // 空闲模式
    public static final int BLUETOOTH_SIGNIN = 0;       // 蓝牙打卡模式
    public static final int BLUETOOTH_CONFIG = 1;       // 蓝牙考勤机配置模式

    private static MyScanCallback mScanCallback;
    private int type = -1;

    public static MyScanCallback getInstance() {
        if (mScanCallback == null) {
            synchronized (MyScanCallback.class) {
                if (mScanCallback == null) {
                    mScanCallback = new MyScanCallback();
                }
            }
        }
        return mScanCallback;
    }

    @Override
    public void onScanResult(int callbackType, ScanResult result) {
        super.onScanResult(callbackType, result);
        ScanRecord record = result.getScanRecord();
        if (record == null) {
            return;
        }
        switch (type) {
            case BLUETOOTH_SIGNIN:
                KLog.d("蓝牙打卡" + result.getDevice().getAddress());
                BlueToothTool.processingBleData(record.getBytes());
                break;
            case BLUETOOTH_CONFIG:
                KLog.i("蓝牙考勤机配置" + result.getDevice().getAddress());
                BluetoothConfigTool.processingBleData(result.getDevice(), record.getBytes());
                break;
            default:
                KLog.w("无操作" + result.getDevice().getAddress());
                break;
        }
    }

    @Override
    public void onBatchScanResults(List<ScanResult> results) {
        super.onBatchScanResults(results);
    }

    @Override
    public void onScanFailed(int errorCode) {
        super.onScanFailed(errorCode);
    }

    public void setType(int type) {
        this.type = type;
        KLog.e("类型： " + type);
    }
}
