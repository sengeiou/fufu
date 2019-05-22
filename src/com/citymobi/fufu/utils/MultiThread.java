package com.citymobi.fufu.utils;

import com.socks.library.KLog;

import org.apache.cordova.signin.AutoSignIn;

/**
 * <pre>
 *     author : ZhongQuan
 *     e-mail : xxx@xx
 *     time   : 2017/06/28
 *     desc   :
 *     version: 1.0
 * </pre>
 */
public class MultiThread extends Thread {

    private static MultiThread mThread;

    private boolean isClose = false;
    private byte[] data;

    public static MultiThread getInstance() {
        if (mThread == null) {
            synchronized (MultiThread.class) {
                mThread = new MultiThread();
            }
        }
        return mThread;
    }

    @Override
    public void run() {
        synchronized (this) {
            while (!isClose) {
                if (data != null) {
                    KLog.d(StringUtil.getBandAndConnectStatusFlagStr(data));
                    KLog.d(StringUtil.getZKDevicesFlagStr(data));
                    String[] temp = StringUtil.getSNStr(data);
                    String sn = temp[0];// sn码
                    String time = temp[1];// time码
                    KLog.i(sn);
                    KLog.i(time);
                    boolean isMatching = StringUtil.isMatchingSN(sn);
                    AutoSignIn.executeJs(isMatching, sn, time);
                }
                onThreadWait();
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

    public synchronized void setData(byte[] data) {
        this.data = data;
        this.notify();
    }
}
