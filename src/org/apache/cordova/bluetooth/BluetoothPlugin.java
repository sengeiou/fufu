package org.apache.cordova.bluetooth;

import android.app.Activity;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattService;
import android.content.BroadcastReceiver;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.ServiceConnection;
import android.os.Bundle;
import android.os.CountDownTimer;
import android.os.Handler;
import android.os.IBinder;
import android.os.Message;
import android.support.annotation.Nullable;
import android.text.TextUtils;
import android.util.Base64;

import com.citymobi.fufu.R;
import com.citymobi.fufu.bluetooth.BleAttribute;
import com.citymobi.fufu.bluetooth.BluetoothConfigTool;
import com.citymobi.fufu.service.BluetoothLeService;
import com.citymobi.fufu.utils.BluetoothThread;
import com.citymobi.fufu.utils.CountDownUtil;
import com.citymobi.fufu.utils.DateUtil;
import com.citymobi.fufu.utils.PermissionManage;
import com.citymobi.fufu.widgets.CustomDialog;
import com.socks.library.KLog;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaWebView;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import static android.content.Context.BIND_AUTO_CREATE;
import static com.citymobi.fufu.bluetooth.BleAttribute.BLE_CONNECTED;
import static com.citymobi.fufu.bluetooth.BleAttribute.BLE_CONNECTING;
import static com.citymobi.fufu.bluetooth.BleAttribute.BLE_CONNECT_FAIL;
import static com.citymobi.fufu.bluetooth.BleAttribute.BLE_DELETE_SN;
import static com.citymobi.fufu.bluetooth.BleAttribute.BLE_DEVICE_BIND_FAIL;
import static com.citymobi.fufu.bluetooth.BleAttribute.BLE_DEVICE_BIND_SUCCESS;
import static com.citymobi.fufu.bluetooth.BleAttribute.BLE_DISCONNECTED;
import static com.citymobi.fufu.bluetooth.BleAttribute.BLE_NETWORK_TYPE_TIME_OUT;
import static com.citymobi.fufu.bluetooth.BleAttribute.BLE_NETWORK_TYPE_WIFI;
import static com.citymobi.fufu.bluetooth.BleAttribute.BLE_NETWORK_TYPE_WIFI_AND_CABLE;
import static com.citymobi.fufu.bluetooth.BleAttribute.BLE_NET_CONFIG_FAIL;
import static com.citymobi.fufu.bluetooth.BleAttribute.BLE_NET_CONNECT_TIMEOUT;
import static com.citymobi.fufu.bluetooth.BleAttribute.BLE_PHYSICS_UNBIND_TIME_OUT;
import static com.citymobi.fufu.bluetooth.BleAttribute.BLE_SCAN_COUNTDOWN_TIME;
import static com.citymobi.fufu.bluetooth.BleAttribute.BLE_STET_SN;
import static com.citymobi.fufu.bluetooth.BleAttribute.REQ_DHCP_ON;
import static com.citymobi.fufu.bluetooth.BleAttribute.REQ_DISCONNECT;
import static com.citymobi.fufu.bluetooth.BleAttribute.REQ_NETWORK_TYPE;
import static com.citymobi.fufu.bluetooth.BleAttribute.REQ_RESTORE_STATUS;
import static com.citymobi.fufu.bluetooth.BleAttribute.REQ_TIME;
import static com.citymobi.fufu.bluetooth.BleAttribute.REQ_UNBIND_UPDATE;

/**
 * <pre>
 *     author : ZhongQuan
 *     e-mail : xxx@xx
 *     time   : 2017/08/25
 *     desc   : 蓝牙考勤机配置插件，蓝牙第二阶段
 *     version: 3.3
 * </pre>
 */
public class BluetoothPlugin extends CordovaPlugin {
    private Activity mActivity;
    private BluetoothPlugin mInstance;
    private CallbackContext mCallback;
    private CustomDialog mDialog;

    private int devicesStatus = BleAttribute.BLE_CONNECT_TIME_OUT;
    private boolean isAbnormal = false;// 是否是异常情况，默认否; 异常情况有：没发现蓝牙服务、一对一建立超时、断开指令超时
    private boolean isOneToOneConnect = false;// 是否与蓝牙设备建立了一对一连接，通过发送一对一指令判断
    private boolean isConnecting = false;// 是否正在建立蓝牙连接，避免重复连接
    private boolean isExcuteJs = true;// 是否执行js，默认true，当设备wifi连接成功时，不执行js
    private String connectSn; // 指定SN码进行蓝牙设备连接

    private BluetoothLeService mBluetoothLeService;

    private ServiceConnection mServiceConnection = new ServiceConnection() {
        @Override
        public void onServiceConnected(ComponentName name, IBinder service) {
            mBluetoothLeService = ((BluetoothLeService.LocalBinder) service).getService();
            if (!mBluetoothLeService.initialize()) {
                KLog.e("Unable to initialize Bluetooth");
            }
            KLog.d("服务连接成功");
        }

        @Override
        public void onServiceDisconnected(ComponentName name) {
            mBluetoothLeService = null;
            KLog.d("服务连接失败");
        }
    };

    @Override
    public void initialize(CordovaInterface cordova, CordovaWebView webView) {
        super.initialize(cordova, webView);
        mInstance = this;
        mActivity = cordova.getActivity();
        BluetoothThread.getInstance().start();

        Intent gattServiceIntent = new Intent(mActivity, BluetoothLeService.class);
        mActivity.bindService(gattServiceIntent, mServiceConnection, BIND_AUTO_CREATE);

        mActivity.registerReceiver(mGattUpdateReceiver, makeGattUpdateIntentFilter());
        devicesStatus = BleAttribute.BLE_CONNECT_TIME_OUT;
        registerBluetoothReceiver();
        KLog.d("initialize");
    }

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        mCallback = callbackContext;
        if ("checkBluetooth".equals(action)) {
            KLog.d("检查蓝牙权限");
            checkBluetooth();
        } else if ("bleScan".equals(action)) {
            KLog.d("开启BLE扫描");
            connectSn = "";
            startBleScan();
        } else if ("bleScanWithSn".equals(action)) {
            KLog.d("指定SN码，并开启BLE扫描");
            JSONObject snObj = args.getJSONObject(0);
            if (snObj != null) {
                connectSn = snObj.getString("sn");
            }
            startBleScan();
        } else if ("setWifiConfig".equals(action)) {
            JSONObject wifi = args.getJSONObject(0);
            KLog.json(wifi.toString());
            setWifiConfig(wifi);
        } else if ("setSnList".equals(action)) {
            KLog.d(args.getString(0));
        } else if ("cancelBleConfig".equals(action)) {
            KLog.w("取消设备配置流程");
            cancelBleConfig();
        } else if ("checkOneToOneConnect".equals(action)) {
            KLog.d("检测蓝牙是否一对一连接");
            if (isOneToOneConnect) {
                mCallback.success(1);
            } else {
                mCallback.success(0);
            }
        } else if ("deleteSnSuccess".equals(action)) {
            KLog.d("考勤机SN码删除成功");
            deleteSnSuccess();
        } else if ("setWiredNetworkConfig".equals(action)) {
            KLog.d("设置有线网络配置");
            KLog.json(args.getJSONObject(0).toString());
            setWiredNetworkConfig(args.getJSONObject(0));
        }
        return true;
    }

    /**
     * 权限检测
     */
    private void checkBluetooth() {
        if (!PermissionManage.isLocationAvailable2()) {
            PermissionManage.openAppLocationHint(mActivity, R.string.dialog_title_gps, R.string.request_gps_permission);
            callbackSuccess(0);
        } else {
            checkBluetoothEnable();
        }
    }

    /**
     * 蓝牙开关检测
     */
    private void checkBluetoothEnable() {
        if (BluetoothConfigTool.isSupportBle() && !BluetoothConfigTool.isBluetoothEnabled()) {
            mDialog = PermissionManage.openBluetoothSettingHint(mActivity, R.string.title_dialog_bluetooth, R.string.msg_dialog_bluetooth);
            callbackSuccess(0);
        } else {
            callbackSuccess(1);
        }
    }

    /**
     * 开启扫描
     */
    private void startBleScan() {
        isAbnormal = false;
        isOneToOneConnect = false;
        isConnecting = false;
        isExcuteJs = true;
        devicesStatus = BleAttribute.BLE_CONNECT_TIME_OUT;
        CountDownUtil.cancelCountDown();// 停止倒计时
        mHandler.removeCallbacks(mRunnable);
        mHandler.removeMessages(1);
        if (mActivity != null) {
            mActivity.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    if (BluetoothConfigTool.isSupportBle()) {
                        if (BluetoothConfigTool.scanBleDevice()) {
                            startCountDown();// 开始倒计时
                        }
                    }
                }
            });
        }
    }

    /**
     * 给设备配置wifi信息
     *
     * @param object
     */
    private void setWifiConfig(JSONObject object) {
        if (object == null) {
            return;
        }
        try {
            // Base64编码
            String ssid = object.getString("ssid");
            String passWord = object.getString("passWord");
            String base64SSID = "", base64PassWord = "";
            if (!TextUtils.isEmpty(ssid)) {
                base64SSID = Base64.encodeToString(ssid.getBytes(), Base64.DEFAULT);
            }
            if (!TextUtils.isEmpty(passWord)) {
                base64PassWord = Base64.encodeToString(passWord.getBytes(), Base64.DEFAULT);
            }
            KLog.d(base64SSID);
            KLog.d(base64PassWord);
            String wifi = String.format(BleAttribute.REQ_WIFI, base64SSID, object.getString("bssid"), base64PassWord);

            CountDownUtil.getInstance(BLE_NET_CONNECT_TIMEOUT).setFlag(BleAttribute.REQ_WIFI).startCountDown();
            String data = String.format(BleAttribute.REQ_HEAD, wifi.length(), wifi);
            writeCharacteristic(data.getBytes());
        } catch (JSONException e) {
            e.printStackTrace();
            KLog.w("Wifi 信息异常");
        }

    }

    /**
     * 设置有线网络配置
     *
     * @param object
     */
    private void setWiredNetworkConfig(JSONObject object) {
        if (object == null) {
            return;
        }
        try {
            if (!object.getBoolean("DHCP")) {
                // 有线网络设置和wifi设置倒计时相同
                CountDownUtil.getInstance(BLE_NET_CONNECT_TIMEOUT).setFlag(BleAttribute.REQ_WIFI).startCountDown();
                String wired = String.format(BleAttribute.REQ_WIRED_NETWORK, "OFF", object.getString("IP"), object.getString("MASK"), object.getString("GW"), object.getString("DNS"));
                String data = String.format(BleAttribute.REQ_HEAD, wired.length(), wired);
                writeCharacteristic(data.getBytes());
            } else {
                CountDownUtil.getInstance(BLE_NET_CONNECT_TIMEOUT).setFlag(BleAttribute.REQ_WIFI).startCountDown();
                String data = String.format(BleAttribute.REQ_HEAD, REQ_DHCP_ON.length(), REQ_DHCP_ON);
                writeCharacteristic(data.getBytes());
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    /**
     * 告诉设备，序列号删除成功
     */
    private void deleteSnSuccess() {
        mHandler.sendMessage(mHandler.obtainMessage(1, REQ_UNBIND_UPDATE));
        mHandler.sendMessageDelayed(mHandler.obtainMessage(1, REQ_NETWORK_TYPE), 500);
    }

    private void cancelBleConfig() {
        BluetoothConfigTool.stopScanning();
        writeDifferentContent(REQ_DISCONNECT);
        CountDownUtil.cancelCountDown();
        cancelCountDown();
//        if (mBluetoothLeService != null) {
//            mBluetoothLeService.realCloseBleConnect();
//        }
        mHandler.postDelayed(mRunnable, 2000);
        mHandler.removeMessages(1);
    }

    private Runnable mRunnable = new Runnable() {
        @Override
        public void run() {
            if (mBluetoothLeService != null) {
//                mBluetoothLeService.disconnect();
                mBluetoothLeService.realCloseBleConnect();
            }
        }
    };

    private static IntentFilter makeGattUpdateIntentFilter() {
        final IntentFilter intentFilter = new IntentFilter();
        intentFilter.addAction(BluetoothThread.ACTION_BLE_BAND_CONNECT);
        intentFilter.addAction(BluetoothLeService.ACTION_GATT_CONNECTED);
        intentFilter.addAction(BluetoothLeService.ACTION_GATT_DISCONNECTED);
        intentFilter.addAction(BluetoothLeService.ACTION_GATT_SERVICES_DISCOVERED);
        intentFilter.addAction(BluetoothLeService.ACTION_BEGIN_SEND_DATA);
        intentFilter.addAction(BluetoothLeService.ACTION_DATA_AVAILABLE);
        intentFilter.addAction(BluetoothLeService.ACTION_GATT_CONNECT_FAIL);
        intentFilter.addAction(BleAttribute.ACTION_BLE_CONNECT_TIMEOUT);
        intentFilter.addAction(BleAttribute.ACTION_BLE_NET_SET_TIMEOUT);
        intentFilter.addAction(BleAttribute.ACTION_BLE_DISCONNECT_TIMEOUT);
        intentFilter.addAction(BleAttribute.ACTION_BLE_DISCOVERSERVICES_TIMEOUT);
        intentFilter.addAction(BleAttribute.ACTION_BLE_DEVICE_BIND_TIMEOUT);
        intentFilter.addAction(BleAttribute.ACTION_BLE_QUERY_PHYSICS_UNBIND_TIMEOUT);
        intentFilter.addAction(BleAttribute.ACTION_BLE_QUERY_NETWORK_TYPE_TIMEOUT);
        return intentFilter;
    }

    /**
     * 自定义蓝牙广播接收器
     */
    private final BroadcastReceiver mGattUpdateReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            final String action = intent.getAction();
            // 蓝牙广播处理
            if (BluetoothThread.ACTION_BLE_BAND_CONNECT.equals(action)) {
                fliterDevices(intent);
            }
            // 蓝牙发现服务超时
            else if (BleAttribute.ACTION_BLE_DISCOVERSERVICES_TIMEOUT.equals(action)) {
                KLog.d("蓝牙发现服务超时");
                isAbnormal = true;
                executeJs(BLE_CONNECT_FAIL);
                disconnectBle();
            }
            // 蓝牙一对一连接超时
            else if (BleAttribute.ACTION_BLE_CONNECT_TIMEOUT.equals(action)) {
                KLog.d("蓝牙一对一连接超时");
                isAbnormal = true;
                executeJs(BLE_CONNECT_FAIL);
                disconnectBle();
            }
            // 查询设备物理解绑超时
            else if (BleAttribute.ACTION_BLE_QUERY_PHYSICS_UNBIND_TIMEOUT.equals(action)) {
                KLog.d("查询设备物理解绑超时");
                executeJs(BLE_PHYSICS_UNBIND_TIME_OUT);
            }
            // 查询设备网络连接方式超时
            else if (BleAttribute.ACTION_BLE_QUERY_NETWORK_TYPE_TIMEOUT.equals(action)) {
                KLog.d("查询设备网络连接方式超时");
                executeJs(BLE_NETWORK_TYPE_TIME_OUT);
            }
            // 设备设置Wifi/有线网络超时
            else if (BleAttribute.ACTION_BLE_NET_SET_TIMEOUT.equals(action)) {
                KLog.d("设备设置Wifi/有线网络超时");
                executeJs(BLE_NET_CONFIG_FAIL);
            }
            // 设备绑定databus超时
            else if (BleAttribute.ACTION_BLE_DEVICE_BIND_TIMEOUT.equals(action)) {
                KLog.d("设备绑定databus超时");
                executeJs(BLE_DEVICE_BIND_FAIL);
                breakOneToOneConnect();
            }
            // 设备断开超时
            else if (BleAttribute.ACTION_BLE_DISCONNECT_TIMEOUT.equals(action)) {
                KLog.d("设备断开超时");
                isAbnormal = true;
                executeJs(BLE_DISCONNECTED);
                disconnectBle();
            }
            // 蓝牙连接成功回调
            else if (BluetoothLeService.ACTION_GATT_CONNECTED.equals(action)) {
                KLog.d("蓝牙连接成功");
                // 开启蓝牙发现服务倒计时10s
                CountDownUtil.getInstance(BleAttribute.BLE_DISCOVERSERVICES_TIMEOUT).setFlag(BleAttribute.ACTION_BLE_DISCOVERSERVICES_TIMEOUT).startCountDown();
            }
            // 蓝牙断开连接回调
            else if (BluetoothLeService.ACTION_GATT_DISCONNECTED.equals(action)) {
                KLog.d("蓝牙断开连接");
                CountDownUtil.cancelCountDown();
                // 异常情况则不执行
                if (!isAbnormal) {
                    // 一对一连接建立成功之前，返回状态12； 一对一连接建立成功之后，返回状态6
                    if (isOneToOneConnect) {
                        executeJs(BLE_DISCONNECTED);
                    } else {
                        executeJs(BLE_CONNECT_FAIL);
                    }
                }
                isOneToOneConnect = false;
            }
            // 蓝牙连接失败
            else if (BluetoothLeService.ACTION_GATT_CONNECT_FAIL.equals(action)) {
                KLog.d("蓝牙连接失败");
                executeJs(BLE_CONNECT_FAIL);
            }
            // 发现蓝牙服务
            else if (BluetoothLeService.ACTION_GATT_SERVICES_DISCOVERED.equals(action)) {
                KLog.d("发现蓝牙服务");
                setCharacteristicNotification();
            }
            // 开始发送数据
            else if (BluetoothLeService.ACTION_BEGIN_SEND_DATA.equals(action)) {
                KLog.d("开始发送数据");
                // 关闭蓝牙发现服务倒计时
                CountDownUtil.cancelCountDown();
                writeDifferentContent(BleAttribute.REQ_CONNECT);
            }
            // 蓝牙响应的数据
            else if (BluetoothLeService.ACTION_DATA_AVAILABLE.equals(action)) {
                String result = intent.getStringExtra(BluetoothLeService.EXTRA_DATA);
                KLog.i(result);
                dealResultMsg(result);
            }
        }
    };

    /**
     * 筛选周围BLE设备
     *
     * @param intent
     */
    private synchronized void fliterDevices(Intent intent) {
        if (intent == null) {
            return;
        }
        Bundle bundle = intent.getExtras();
        devicesStatus = bundle.getInt(BluetoothThread.EXTRA_DATA_DEVICES_STATUS, -1);
        String sn = bundle.getString(BluetoothThread.EXTRA_DATA_DEVICES_SN);
        String deviceAddress = bundle.getString(BluetoothThread.EXTRA_DATA_BLE_DEVICES_ADDRESS);
        KLog.d("蓝牙 MAC: " + deviceAddress + " SN：" + sn + " 状态值：" + devicesStatus);
        // 是否指定SN码，若SN被指定，则连接指定的SN设备
        if (!TextUtils.isEmpty(connectSn)) {
            if (connectSn.equals(sn) && !isConnecting) {
                connectBluetooth(deviceAddress, sn, devicesStatus);
            }
        } else {
            // 当设备的广播标志位为“无绑定智能设备”（即状态值为1），才进行连接
            if (devicesStatus == BleAttribute.NOT_BAND_WISDOM && !TextUtils.isEmpty(sn) && !isConnecting) {
                connectBluetooth(deviceAddress, sn, devicesStatus);
            }
        }
    }

    /**
     * 建立蓝牙连接
     *
     * @param deviceAddress
     * @param sn
     * @param devicesStatus
     */
    private synchronized void connectBluetooth(String deviceAddress, String sn, int devicesStatus) {
        // 停止扫描
        BluetoothConfigTool.stopScanning();
        // 停止倒计时
        cancelCountDown();
        // 连接蓝牙
        if (mBluetoothLeService != null && !TextUtils.isEmpty(deviceAddress)) {
            // 执行JS
            executeJs(devicesStatus, sn);
            isConnecting = true;
            mBluetoothLeService.setBuildConnect(true);
            mBluetoothLeService.setConnectCount(0);
            mBluetoothLeService.setReconnectTime(System.currentTimeMillis());
            executeJs(BLE_CONNECTING);// 蓝牙正在连接
            KLog.i("连接蓝牙中... MAC: " + deviceAddress + " SN：" + sn);
            boolean isCnt = mBluetoothLeService.connect(deviceAddress);
            if (!isCnt) {
                executeJs(BLE_CONNECT_FAIL);
            }
        } else {
            executeJs(BLE_CONNECT_FAIL);
            KLog.w("蓝牙连接异常");
        }
    }

    /**
     * 设置Characteristic Notification, (若不设置则无法接收设备的数据)
     */
    private void setCharacteristicNotification() {
        if (mBluetoothLeService == null) {
            KLog.w("gatt服务为空");
            return;
        }
        BluetoothGattService gattService = mBluetoothLeService.getSupportedGattService(BleAttribute.UUID_SERVICE_4458);
        if (gattService != null) {
            BluetoothGattCharacteristic gattCharacteristic = gattService.getCharacteristic(BleAttribute.UUID_CHARACTERISTIC_4459);
            if (gattCharacteristic != null) {
                KLog.d(gattCharacteristic.getProperties());
                // 设置 Characteristic Notification
                // 此代码，会使BluetoothGattCallback 中 onDescriptorWrite 回调
                mBluetoothLeService.setCharacteristicNotification(gattCharacteristic, true);
            }
        } else {
            KLog.w("service is null");
        }
    }

    /**
     * 根据指令写入不同的内容
     *
     * @param action
     */
    private void writeDifferentContent(String action) {
        // 一对一连接指令
        if (BleAttribute.REQ_CONNECT.equals(action)) {
            String data = String.format(BleAttribute.REQ_HEAD, BleAttribute.REQ_CONNECT.length(), BleAttribute.REQ_CONNECT);
            CountDownUtil.getInstance().setFlag(BleAttribute.REQ_CONNECT).startCountDown();
            writeCharacteristic(data.getBytes());
        }
        // 设置时间指令
        else if (REQ_TIME.equals(action)) {
            String time = String.format(REQ_TIME, DateUtil.getCurrentDate());
            String data = String.format(BleAttribute.REQ_HEAD, time.length(), time);
            writeCharacteristic(data.getBytes());
        }
        // app 主动断开指令
        else if (REQ_DISCONNECT.equals(action)) {
            String data = String.format(BleAttribute.REQ_HEAD, REQ_DISCONNECT.length(), REQ_DISCONNECT);
            CountDownUtil.getInstance(BleAttribute.BLE_DISCONNECT_TIMEOUT).setFlag(REQ_DISCONNECT).startCountDown();
            writeCharacteristic(data.getBytes());
        }
        // 物理解绑查询指令
        else if (REQ_RESTORE_STATUS.equals(action)) {
            String data = String.format(BleAttribute.REQ_HEAD, REQ_RESTORE_STATUS.length(), REQ_RESTORE_STATUS);
            CountDownUtil.getInstance(BleAttribute.BLE_PHYSICS_UNBIND_TIMEOUT).setFlag(REQ_RESTORE_STATUS).startCountDown();
            writeCharacteristic(data.getBytes());
        }
        // 设备序列号删除成功指令
        else if (REQ_UNBIND_UPDATE.equals(action)) {
            String data = String.format(BleAttribute.REQ_HEAD, REQ_UNBIND_UPDATE.length(), REQ_UNBIND_UPDATE);
            writeCharacteristic(data.getBytes());
        }
        // 设备网络连接方式查询指令
        else if (REQ_NETWORK_TYPE.equals(action)) {
            String data = String.format(BleAttribute.REQ_HEAD, REQ_NETWORK_TYPE.length(), REQ_NETWORK_TYPE);
            CountDownUtil.getInstance(BleAttribute.BLE_NETWORK_TYPE_TIMEOUT).setFlag(REQ_NETWORK_TYPE).startCountDown();
            writeCharacteristic(data.getBytes());
        }
    }

    /**
     * 处理蓝牙设备响应指令
     *
     * @param result
     */
    private void dealResultMsg(String result) {
        // 一对一连接成功
        if (BleAttribute.RESP_CON_OK.equals(result)) {
            KLog.d("蓝牙一对一连接成功");
            isOneToOneConnect = true;
            CountDownUtil.cancelCountDown();
            executeJs(BLE_CONNECTED);
            // 延时500毫秒, 避免两指令发送间隔太短，导致写入不成功（此处延时需特别注意，部分手机蓝牙数据发送不稳定）
            mHandler.sendMessageDelayed(mHandler.obtainMessage(1, REQ_TIME), 500);
            mHandler.sendMessageDelayed(mHandler.obtainMessage(1, REQ_RESTORE_STATUS), 1000);
        }
        // 时间设置成功
        else if (BleAttribute.RESP_TIME_OK.equals(result)) {
            KLog.d("时间设置成功");
        }
        // 设备之前有物理解绑操作，需要删除SN
        else if (BleAttribute.RESP_BIND_RESTORE.equals(result)) {
            KLog.d("设备之前有物理解绑操作，需要删除SN");
            executeJs(BLE_DELETE_SN);
            CountDownUtil.cancelCountDown();
        }
        // 设备无物理解绑操作
        else if (BleAttribute.RESP_BIND_NORMAL.equals(result)) {
            KLog.d("设备没有物理解绑操作");
            CountDownUtil.cancelCountDown();
            executeJs(BLE_STET_SN);
            writeDifferentContent(REQ_NETWORK_TYPE);// 查询设备网络连接方式
        }
        // 设备只支持无线网络
        else if (BleAttribute.RESP_WIFI_ONLY.equals(result)) {
            KLog.d("设备只支持无线网络");
            CountDownUtil.cancelCountDown();
            executeJs(BLE_NETWORK_TYPE_WIFI);
        }
        // 设备支持有线和无线网络
        else if (BleAttribute.RESP_WIFI_AND_CABLE.equals(result)) {
            KLog.d("设备支持有线和无线网络");
            CountDownUtil.cancelCountDown();
            executeJs(BLE_NETWORK_TYPE_WIFI_AND_CABLE);
        }
        // wifi信息设置成功
        else if (BleAttribute.RESP_WIFI_INRO_OK.equals(result)) {
            KLog.d("wifi信息设置成功");
        }
        // 有线网络信息设置成功
        else if (BleAttribute.RESP_NETWORK_SET_OK.equals(result)) {
            KLog.d("有线网络信息设置成功");
        }
        // 设备wifi连接成功
        else if (BleAttribute.RESP_WIFI_CONNECT.equals(result)) {
            executeJs(BleAttribute.BLE_NET_CONFIG_SUCCESS);
            CountDownUtil.cancelCountDown();
            KLog.d("设备wifi连接成功");
            // 等待考勤机绑定的指令，设置绑定倒计时
            CountDownUtil.getInstance(BleAttribute.BLE_DEVICE_BIND_TIMEOUT).setFlag(BleAttribute.ACTION_BLE_DEVICE_BIND_TIMEOUT).startCountDown();
        }
        // 设备有线网络连接成功
        else if (BleAttribute.RESP_NETWORK_CON_OK.equals(result)) {
            executeJs(BleAttribute.BLE_NET_CONFIG_SUCCESS);
            CountDownUtil.cancelCountDown();
            KLog.d("设备有线网络连接成功");
            // 等待考勤机绑定的指令，设置绑定倒计时
            CountDownUtil.getInstance(BleAttribute.BLE_DEVICE_BIND_TIMEOUT).setFlag(BleAttribute.ACTION_BLE_DEVICE_BIND_TIMEOUT).startCountDown();
        }
        // 设备绑定databus成功
        else if (BleAttribute.RESP_BIND_OK.equals(result)) {
            KLog.d("设备绑定databus成功");
            CountDownUtil.cancelCountDown();
            executeJs(BLE_DEVICE_BIND_SUCCESS);
            breakOneToOneConnect();
        }
        // 设备绑定databus失败
        else if (BleAttribute.RESP_BIND_FAIL.equals(result)) {
            KLog.d("设备绑定databus失败");
            CountDownUtil.cancelCountDown();
            executeJs(BLE_DEVICE_BIND_FAIL);
            breakOneToOneConnect();
        }
        // APP 主动断开成功
        else if (BleAttribute.RESP_DISCON_OK.equals(result)) {
            CountDownUtil.cancelCountDown();
            disconnectBle();
            KLog.d("蓝牙断开指令响应");
        } else {
            KLog.w("异常指令：" + result);
        }
    }


    /**
     * 写数据
     */
    private void writeCharacteristic(byte[] data) {
        if (mBluetoothLeService == null) {
            return;
        }
        BluetoothGattService gattService = mBluetoothLeService.getSupportedGattService(BleAttribute.UUID_SERVICE_4458);
        if (gattService != null) {
            BluetoothGattCharacteristic gattCharacteristic = gattService.getCharacteristic(BleAttribute.UUID_CHARACTERISTIC_4459);
            if (gattCharacteristic != null) {
                if ((gattCharacteristic.getProperties() & BluetoothGattCharacteristic.PROPERTY_WRITE) == 0) {
                    return;
                }
                mBluetoothLeService.subpackageWrite(gattCharacteristic, data);
            }
        }
    }

    /**
     * 执行JS
     *
     * @param status
     */
    public void executeJs(int status) {
        KLog.d("是否执行JS : " + isExcuteJs + " 状态值：" + status);
        if (!isExcuteJs) {
            return;
        }
        final String format = "javascript:window.plugins.bluetoothPlugin.bluetoothPluginInAndroidCallback(%1$s);";
        final String jsStr = String.format(format, getParamObj(status, null).toString());
        if (!TextUtils.isEmpty(jsStr)) {
            mActivity.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    mInstance.webView.loadUrl(jsStr);
                }
            });
        }
    }

    public void executeJs(int status, String sn) {
        KLog.d("是否执行JS : " + isExcuteJs + " 状态值：" + status + " SN码：" + sn);
        if (!isExcuteJs) {
            return;
        }
        final String format = "javascript:window.plugins.bluetoothPlugin.bluetoothPluginInAndroidCallback(%1$s);";
        final String jsStr = String.format(format, getParamObj(status, sn).toString());
        if (!TextUtils.isEmpty(jsStr)) {
            mActivity.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    mInstance.webView.loadUrl(jsStr);
                }
            });
        }
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent intent) {
        super.onActivityResult(requestCode, resultCode, intent);
        KLog.d(resultCode);
    }

    private void callbackSuccess(int status) {
        if (mCallback != null) {
            mCallback.success(status);
        }
    }

    private static JSONObject getParamObj(int status, @Nullable String sn) {
        JSONObject param = new JSONObject();
        try {
            param.put("status", status);
            if (TextUtils.isEmpty(sn)) {
                param.put("sn", "");
            } else {
                param.put("sn", sn);
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }
        return param;
    }

    /**
     * 倒计时
     */
    private CountDownTimer mCountDownTimer = new CountDownTimer(BLE_SCAN_COUNTDOWN_TIME, 5000) {
        @Override
        public void onTick(long millisUntilFinished) {
            KLog.d("扫描超时倒计时正在运行");
        }

        @Override
        public void onFinish() {
            BluetoothConfigTool.stopScanning();
            // 当指定SN时(不为空)，扫描超时后，应返回状态7
            if (!TextUtils.isEmpty(connectSn)) {
                executeJs(BleAttribute.BLE_CONNECT_TIME_OUT);
            } else {
                executeJs(devicesStatus);
            }
            KLog.d("扫描超时倒计时正常结束");
        }
    };

    private void startCountDown() {
        mCountDownTimer.cancel();
        mCountDownTimer.start();
    }

    private void cancelCountDown() {
        mCountDownTimer.cancel();
        KLog.d("取消倒计时");
    }

    @Override
    public void onResume(boolean multitasking) {
        super.onResume(multitasking);
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        BluetoothThread.getInstance().closeThread();
        BluetoothConfigTool.stopScanning();
        cancelCountDown();
        CountDownUtil.cancelCountDown();
        if (mBluetoothLeService != null) {
            mBluetoothLeService.realCloseBleConnect();
        }
        if (mActivity != null) {
            mActivity.unregisterReceiver(mGattUpdateReceiver);
            mActivity.unregisterReceiver(mBluetoothReceiver);
            mActivity.unbindService(mServiceConnection);
        }
        KLog.d("BluetoothPlugin onDestroy");
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
                        break;
                    case BluetoothAdapter.STATE_ON:
                        executeJs(BleAttribute.BLUETOOTH_ON);
                        if (mDialog != null) {
                            mDialog.hideDialog();
                        }
                        KLog.e("onReceive---------STATE_ON");
                        break;
                    case BluetoothAdapter.STATE_TURNING_OFF:
                        KLog.e("onReceive---------STATE_TURNING_OFF");
                        break;
                    case BluetoothAdapter.STATE_OFF:
                        KLog.e("onReceive---------STATE_OFF");
                        CountDownUtil.cancelCountDown();
                        cancelCountDown();
                        executeJs(BleAttribute.BLUETOOTH_OFF);
                        break;
                }
            }
        }
    };

    /**
     * 代码控制，断开蓝牙连接
     */
    private void disconnectBle() {
        if (mBluetoothLeService != null) {
            mBluetoothLeService.disconnect();
        }
    }

    /**
     * 断开设备一对一连接
     */
    private void breakOneToOneConnect() {
        isExcuteJs = false;
        mHandler.sendMessageDelayed(mHandler.obtainMessage(1, REQ_DISCONNECT), 500);
    }

    private Handler mHandler = new Handler() {
        @Override
        public void handleMessage(Message msg) {
            String flag = (String) msg.obj;
            if (REQ_TIME.equals(flag)) {
                writeDifferentContent(BleAttribute.REQ_TIME);
            } else if (REQ_RESTORE_STATUS.equals(flag)) {
                writeDifferentContent(BleAttribute.REQ_RESTORE_STATUS);
            } else if (REQ_DISCONNECT.equals(flag)) {
                writeDifferentContent(BleAttribute.REQ_DISCONNECT);
            } else if (REQ_UNBIND_UPDATE.equals(flag)) {
                writeDifferentContent(BleAttribute.REQ_UNBIND_UPDATE);
            } else if (REQ_NETWORK_TYPE.equals(flag)) {
                writeDifferentContent(BleAttribute.REQ_NETWORK_TYPE);
            }
        }
    };
}
