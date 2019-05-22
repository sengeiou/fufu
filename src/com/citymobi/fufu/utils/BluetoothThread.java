package com.citymobi.fufu.utils;

import android.bluetooth.BluetoothDevice;
import android.content.Intent;
import android.os.Bundle;
import android.text.TextUtils;

import com.citymobi.fufu.application.FuFuApplication;
import com.socks.library.KLog;

import static com.citymobi.fufu.bluetooth.BleAttribute.BANDED_TRADITION;
import static com.citymobi.fufu.bluetooth.BleAttribute.BANDED_WISDOM;
import static com.citymobi.fufu.bluetooth.BleAttribute.NOT_BAND_TRADITION;
import static com.citymobi.fufu.bluetooth.BleAttribute.NOT_BAND_WISDOM;

/**
 * <pre>
 *     author : ZhongQuan
 *     e-mail : xxx@xx
 *     time   : 2017/08/25
 *     desc   : 蓝牙配置线程
 *     version: 1.0
 * </pre>
 */
public class BluetoothThread extends Thread {
    public static final String ZK_FLAG = "5A4B";
    public static final String ACTION_BLE_BAND_CONNECT = "action_ble_band_connect";

    public static final String EXTRA_DATA_BLE_DEVICES_ADDRESS = "extra_data_ble_devices_address";
    public static final String EXTRA_DATA_DEVICES_STATUS = "extra_data_devices_status";
    public static final String EXTRA_DATA_DEVICES_SN = "extra_data_devices_sn";

    private static BluetoothThread mThread;

    private boolean isClose = false;

    private byte[] data;
    private String bleDeviceAddress;

    private BluetoothDevice mBluetoothDevice;

    public static BluetoothThread getInstance() {
        if (mThread == null) {
            synchronized (BluetoothThread.class) {
                mThread = new BluetoothThread();
            }
        }
        return mThread;
    }

    @Override
    public void run() {
        synchronized (this) {
            while (!isClose) {
                handleData();
                onThreadWait();
            }
        }
    }

    private synchronized void handleData() {
        if (data != null) {
            String hex = StringUtil.byte2HexStr(data);
            if (ZK_FLAG.equalsIgnoreCase(StringUtil.getZKDevicesFlagStr(hex))) {// 是否是中控设备
                // 十六进制的标志位
                String bCFlag = StringUtil.getBandAndConnectStatusFlagStr(hex);
                // 标志位的第一和第二bit位（二进制字符串）
                String lowBinary = StringUtil.getBandAndConnectBinaryFlag(bCFlag);

                String[] temp = StringUtil.getSNStr(hex);
                if (temp != null && !TextUtils.isEmpty(temp[0])) {
                    KLog.i(temp[0]);
                    KLog.i(lowBinary);
                    if ("00".equals(lowBinary)) {
                        broadcastUpdate(ACTION_BLE_BAND_CONNECT, bleDeviceAddress, NOT_BAND_TRADITION, temp[0]);
                    } else if ("01".equals(lowBinary)) {
                        broadcastUpdate(ACTION_BLE_BAND_CONNECT, bleDeviceAddress, NOT_BAND_WISDOM, temp[0]);
                    } else if ("10".equals(lowBinary)) {
                        broadcastUpdate(ACTION_BLE_BAND_CONNECT, bleDeviceAddress, BANDED_TRADITION, temp[0]);
                    } else if ("11".equals(lowBinary)) {
                        broadcastUpdate(ACTION_BLE_BAND_CONNECT, bleDeviceAddress, BANDED_WISDOM, temp[0]);
                    }
                }
            }
        }
    }

    /**
     * 线程等待,不提供给外部调用
     */
    private void onThreadWait() {
        KLog.d("线程等待");
        try {
            synchronized (this) {
                this.wait();
            }
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }

    /**
     * 关闭线程
     */
    public synchronized void closeThread() {
        try {
            KLog.d("关闭线程");
            notify();
            setClose(true);
            interrupt();
            mThread = null;
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public boolean isClose() {
        return isClose;
    }

    public void setClose(boolean close) {
        isClose = close;
    }

//    public synchronized void setData(byte[] data) {
//        this.data = data;
//        this.notify();
//    }
//
//    public synchronized void setBluetoothDevice(BluetoothDevice mBluetoothDevice) {
//        this.mBluetoothDevice = mBluetoothDevice;
//    }

    public synchronized void setDataAndDevice(byte[] data, BluetoothDevice mBluetoothDevice) {
        if (data != null && mBluetoothDevice != null) {
            this.data = data;
            this.mBluetoothDevice = mBluetoothDevice;
            this.notify();
        }
    }

    public synchronized void setDataAndDevice(byte[] data, String bleDeviceAddress) {
        if (data != null && !TextUtils.isEmpty(bleDeviceAddress)) {
            this.data = data;
            this.bleDeviceAddress = bleDeviceAddress;
            this.notify();
        }
    }

    private synchronized void broadcastUpdate(String action, int status) {
        Intent intent = new Intent(action);
        intent.putExtra(EXTRA_DATA_DEVICES_STATUS, status);
        FuFuApplication.getmInstance().sendBroadcast(intent);
    }

    private synchronized void broadcastUpdate(String action, String deviceAddress, int status, String sn) {
        Intent intent = new Intent(action);
        Bundle bundle = new Bundle();
        bundle.putInt(EXTRA_DATA_DEVICES_STATUS, status);
        bundle.putString(EXTRA_DATA_DEVICES_SN, sn);
        bundle.putString(EXTRA_DATA_BLE_DEVICES_ADDRESS, deviceAddress);
        intent.putExtras(bundle);
        FuFuApplication.getmInstance().sendBroadcast(intent);
    }
}
