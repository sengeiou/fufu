package com.citymobi.fufu.utils;

import android.content.Intent;
import android.os.CountDownTimer;

import com.citymobi.fufu.application.FuFuApplication;
import com.citymobi.fufu.bluetooth.BleAttribute;
import com.socks.library.KLog;

import org.chromium.base.CollectionUtil;

/**
 * <pre>
 *     author : ZhongQuan
 *     e-mail : xxx@xx
 *     time   : 2017/09/07
 *     desc   : 倒计时工具类
 *     version: 1.0
 * </pre>
 */
public class CountDownUtil {

    private static CountDownUtil mCountDownUtil;
    private static CountDownTimer mCountDownTimer;
    private String flag;
    private static final long cTime = 35 * 1000;// 倒计时时间，默认35秒

    public CountDownUtil(long millisInFuture) {
        mCountDownTimer = new CountDownTimer(millisInFuture, 1000) {
            @Override
            public void onTick(long millisUntilFinished) {
                KLog.d("CountDownTimer 运行 " + flag);
            }

            @Override
            public void onFinish() {
                KLog.d("CountDownTimer 结束 " + flag);
                if (BleAttribute.REQ_CONNECT.equals(flag)) {// 设备一对一连接超时
                    sendBroadcast(BleAttribute.ACTION_BLE_CONNECT_TIMEOUT);
                } else if (BleAttribute.REQ_WIFI.equals(flag)) {// 设备wifi、有线网络连接超时
                    sendBroadcast(BleAttribute.ACTION_BLE_NET_SET_TIMEOUT);
                } else if (BleAttribute.REQ_DISCONNECT.equals(flag)) {// 设备断开超时
                    sendBroadcast(BleAttribute.ACTION_BLE_DISCONNECT_TIMEOUT);
                } else if (BleAttribute.ACTION_BLE_DISCOVERSERVICES_TIMEOUT.equals(flag)) {// 蓝牙设备发现服务超时
                    sendBroadcast(BleAttribute.ACTION_BLE_DISCOVERSERVICES_TIMEOUT);
                } else if (BleAttribute.ACTION_BLE_DEVICE_BIND_TIMEOUT.equals(flag)) {// 蓝牙设备绑定超时
                    sendBroadcast(BleAttribute.ACTION_BLE_DEVICE_BIND_TIMEOUT);
                } else if (BleAttribute.REQ_RESTORE_STATUS.equals(flag)) {// 蓝牙设备查询物理解绑超时
                    sendBroadcast(BleAttribute.ACTION_BLE_QUERY_PHYSICS_UNBIND_TIMEOUT);
                } else if (BleAttribute.REQ_NETWORK_TYPE.equals(flag)) {// 蓝牙设备查询网络连接方式超时
                    sendBroadcast(BleAttribute.ACTION_BLE_QUERY_NETWORK_TYPE_TIMEOUT);
                }
            }
        };
    }

    public static CountDownUtil getInstance() {
        return getInstance(cTime);
    }

    public static CountDownUtil getInstance(long time) {
        cancelCountDown();
        if (mCountDownUtil == null) {
            synchronized (CollectionUtil.class) {
                if (mCountDownUtil == null) {
                    mCountDownUtil = new CountDownUtil(time);
                }
            }
        }
        return mCountDownUtil;
    }

    private void sendBroadcast(String action) {
        final Intent intent = new Intent(action);
        FuFuApplication.getmInstance().sendBroadcast(intent);
    }

    public CountDownUtil setFlag(String action) {
        flag = action;
        return this;
    }

    public CountDownUtil startCountDown() {
        if (mCountDownTimer != null) {
            mCountDownTimer.cancel();
            mCountDownTimer.start();
        }
        return this;
    }

    public static void cancelCountDown() {
        if (mCountDownTimer != null) {
            KLog.d("CountDownTimer 取消");
            mCountDownTimer.cancel();
        }
        mCountDownUtil = null;
        mCountDownTimer = null;
    }
}
