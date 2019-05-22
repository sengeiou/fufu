package com.citymobi.fufu.service;

import android.app.Service;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCallback;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattDescriptor;
import android.bluetooth.BluetoothGattService;
import android.bluetooth.BluetoothManager;
import android.bluetooth.BluetoothProfile;
import android.content.Context;
import android.content.Intent;
import android.os.Binder;
import android.os.IBinder;
import android.text.TextUtils;

import com.citymobi.fufu.application.FuFuApplication;
import com.citymobi.fufu.bluetooth.BleAttribute;
import com.socks.library.KLog;

import java.lang.reflect.Method;
import java.util.List;
import java.util.UUID;

import static com.citymobi.fufu.bluetooth.BleAttribute.BLE_CONNECT_COUNT;
import static com.citymobi.fufu.bluetooth.BleAttribute.BLE_RECONNECT_TIMEOUT;
import static java.util.Arrays.copyOfRange;

/**
 * <pre>
 *     author : ZhongQuan
 *     e-mail : xxx@xx
 *     time   : 2017/08/28
 *     desc   : 蓝牙服务，蓝牙第二阶段
 *     version: 3.3
 * </pre>
 */
public class BluetoothLeService extends Service {

    private BluetoothManager mBluetoothManager;
    private BluetoothAdapter mBluetoothAdapter;
    private String mBluetoothDeviceAddress;
    private BluetoothGatt mBluetoothGatt;
    private int mConnectionState = STATE_DISCONNECTED;
    private int connectCount = 0;// 连续建立连接次数(最大连续连接次数控制在3次)
    private boolean isBuildConnect = true;// 是否建立蓝牙连接

    private static final int STATE_DISCONNECTED = 0;
    private static final int STATE_CONNECTING = 1;
    private static final int STATE_CONNECTED = 2;

    public final static String PACKAGENAME = FuFuApplication.getmInstance().getPackageName();
    //    public final static String ACTION_GATT_CONNECTING = PACKAGENAME + ".le.ACTION_GATT_CONNECTING";
    public final static String ACTION_GATT_CONNECTED = PACKAGENAME + ".le.ACTION_GATT_CONNECTED";
    public final static String ACTION_GATT_DISCONNECTED = PACKAGENAME + ".le.ACTION_GATT_DISCONNECTED";
    public final static String ACTION_GATT_CONNECT_FAIL = PACKAGENAME + ".le.ACTION_GATT_CONNECT_FAIL";
    public final static String ACTION_GATT_SERVICES_DISCOVERED = PACKAGENAME + ".le.ACTION_GATT_SERVICES_DISCOVERED";
    public final static String ACTION_DATA_AVAILABLE = PACKAGENAME + ".le.ACTION_DATA_AVAILABLE";
    public final static String ACTION_BEGIN_SEND_DATA = PACKAGENAME + ".le.ACTION_BEGIN_SEND_DATA";
    public final static String EXTRA_DATA = PACKAGENAME + ".le.EXTRA_DATA";

    private long reconnectTime = System.currentTimeMillis(); // 蓝牙连接失败重连时间

    private final BluetoothGattCallback mGattCallback = new BluetoothGattCallback() {

        // 当连接上设备或者失去连接时会回调该函数
        @Override
        public void onConnectionStateChange(BluetoothGatt gatt, int status, int newState) {
            KLog.i("onConnectionStateChange status= " + status + " newState=" + newState);
            if (status == BluetoothGatt.GATT_SUCCESS) {
                connectCount = 0;
                // 蓝牙已建立连接
                if (newState == BluetoothProfile.STATE_CONNECTED) {
                    mConnectionState = STATE_CONNECTED;
                    broadcastUpdate(ACTION_GATT_CONNECTED);
                    boolean isFind = mBluetoothGatt.discoverServices();// 连接成功，搜索设备的服务
                    KLog.i("连接 GATT 成功，status: " + status);
                    KLog.i("发现设备的服务: " + isFind);
                }
                // 蓝牙断开连接
                else if (newState == BluetoothProfile.STATE_DISCONNECTED) {
                    mConnectionState = STATE_DISCONNECTED;
                    realCloseBleConnect();
                    broadcastUpdate(ACTION_GATT_DISCONNECTED);
                    KLog.i("断开 GATT，status: " + status);
                }
            }
            // GATT 连接超时（蓝牙连接成功时，把蓝牙设备断电，会导致此现象）
            else if (status == 8) {
                KLog.i("GATT 连接超时 status = 8（蓝牙连接成功时，把蓝牙设备断电，会导致此现象）");
                realCloseBleConnect();
                broadcastUpdate(ACTION_GATT_DISCONNECTED);
            }
            // 其他情况，进行蓝牙重新连接
            else {
                mConnectionState = STATE_DISCONNECTED;
                close(); // 防止出现status 133
                if (isBuildConnect) {
                    if (System.currentTimeMillis() - reconnectTime < BLE_RECONNECT_TIMEOUT) {   // 蓝牙连接失败，重连超时时间判断(目前120秒)
                        if (connectCount < BLE_CONNECT_COUNT) {// 蓝牙连接失败，重连次数判断
                            KLog.w("蓝牙连接出现 status=" + status + "，重新建立连接，重连时间：" + (System.currentTimeMillis() - reconnectTime) + " 重连次数 ：" + connectCount);
                            boolean isCnt = connect(mBluetoothDeviceAddress);// 再次建立连接
                            if (!isCnt) {
                                close();
                                broadcastUpdate(ACTION_GATT_CONNECT_FAIL);
                                KLog.d("连接失败");
                            }
                            connectCount++;
                        } else {
                            KLog.d("连接失败");
                            broadcastUpdate(ACTION_GATT_CONNECT_FAIL);
                            realCloseBleConnect();
                        }
                    } else {
                        KLog.d("连接失败");
                        broadcastUpdate(ACTION_GATT_CONNECT_FAIL);
                        realCloseBleConnect();
                    }
                } else {
                    realCloseBleConnect();
                }
            }
        }

        // 当设备是否找到服务时，会回调该函数
        @Override
        public void onServicesDiscovered(BluetoothGatt gatt, int status) {
            if (status == BluetoothGatt.GATT_SUCCESS) {
                KLog.i("发现蓝牙服务");
                broadcastUpdate(ACTION_GATT_SERVICES_DISCOVERED);
            } else {
                KLog.w("onServicesDiscovered received: " + status);
            }
        }

        // 当读取设备时会回调该函数
        @Override
        public void onCharacteristicRead(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic, int status) {
            KLog.d("onCharacteristicRead");
            if (status == BluetoothGatt.GATT_SUCCESS) {
                broadcastUpdate(ACTION_DATA_AVAILABLE, characteristic);
            }
        }

        // 当向设备Descriptor中写数据时，会回调该函数
        @Override
        public void onDescriptorWrite(BluetoothGatt gatt, BluetoothGattDescriptor descriptor, int status) {
            KLog.d("onDescriptorWrite = " + status + ", descriptor =" + descriptor.getUuid().toString());
            if (status == BluetoothGatt.GATT_SUCCESS) {
                broadcastUpdate(ACTION_BEGIN_SEND_DATA);
            }
        }

        // 设备发出通知时会调用到该接口
        @Override
        public void onCharacteristicChanged(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic) {
            KLog.i("onCharacteristicChanged");
            broadcastUpdate(ACTION_DATA_AVAILABLE, characteristic);
        }

        @Override
        public void onReadRemoteRssi(BluetoothGatt gatt, int rssi, int status) {
            KLog.d("rssi = " + rssi);
        }

        // 当向Characteristic写数据时会回调该函数
        @Override
        public void onCharacteristicWrite(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic, int status) {
            KLog.d(characteristic.getUuid());
            KLog.d(new String(characteristic.getValue()));
            KLog.d("--------write success----- status:" + status);
        }
    };

    private void broadcastUpdate(final String action) {
        final Intent intent = new Intent(action);
        sendBroadcast(intent);
    }

    private void broadcastUpdate(final String action, final BluetoothGattCharacteristic characteristic) {
        // For all other profiles, writes the data formatted in HEX.（对于所有其他配置文件，用十六进制格式编写数据）
        final Intent intent = new Intent(action);
        byte[] data = characteristic.getValue();
        if (data != null && data.length > 0) {
            StringBuilder stringBuilder = new StringBuilder(data.length);
            for (byte byteChar : data) {
                stringBuilder.append(String.format("%02X ", byteChar));// X 表示以十六进制形式输出,02 表示不足两位，前面补0输出；出过两位，不影响
            }
            KLog.i(new String(data));
            intent.putExtra(EXTRA_DATA, new String(data));
            sendBroadcast(intent);
        }
    }

    public class LocalBinder extends Binder {

        public BluetoothLeService getService() {
            return BluetoothLeService.this;
        }
    }

    @Override
    public IBinder onBind(Intent intent) {
        return mBinder;
    }

    @Override
    public boolean onUnbind(Intent intent) {
        KLog.d("服务解除绑定");
        realCloseBleConnect();
        return super.onUnbind(intent);
    }

    private final IBinder mBinder = new LocalBinder();

    /**
     * Initializes a reference to the local Bluetooth adapter.
     *
     * @return Return true if the initialization is successful.
     */
    public boolean initialize() {
        if (mBluetoothManager == null) {
            mBluetoothManager = (BluetoothManager) getSystemService(Context.BLUETOOTH_SERVICE);
            if (mBluetoothManager == null) {
                KLog.e("Unable to initialize BluetoothManager.");
                return false;
            }
        }
        mBluetoothAdapter = mBluetoothManager.getAdapter();
        if (mBluetoothAdapter == null) {
            KLog.e("Unable to obtain a BluetoothAdapter.");
            return false;
        }
        return true;
    }

    /**
     * Connects to the GATT server hosted on the Bluetooth LE device.
     *
     * @param address The device address of the destination device.
     * @return Return true if the connection is initiated successfully. The
     * connection result is reported asynchronously through the
     * {@code BluetoothGattCallback#onConnectionStateChange(android.bluetooth.BluetoothGatt, int, int)}
     * callback.
     */
    public boolean connect(final String address) {
        if (mBluetoothAdapter == null || TextUtils.isEmpty(address)) {
            KLog.w("BluetoothAdapter not initialized or unspecified address.");
            return false;
        }
        // Previously connected device. Try to reconnect. (先前连接的设备。 尝试重新连接)
        if (!TextUtils.isEmpty(mBluetoothDeviceAddress) && address.equals(mBluetoothDeviceAddress) && mBluetoothGatt != null) {
            boolean connect = mBluetoothGatt.connect();
            KLog.d("尝试使用现有的mBluetoothGatt来连接");
            KLog.d("之前的蓝牙是否连接：" + connect);
            if (connect) {
                mConnectionState = STATE_CONNECTING;
                return true;
            } else {
                realCloseBleConnect();
                return false;
            }
        }

        final BluetoothDevice device = mBluetoothAdapter.getRemoteDevice(address);
        if (device == null) {
            KLog.w("Device not found.  Unable to connect.");
            return false;
        }
        // We want to directly connect to the device, so we are setting the
        // autoConnect
        // parameter to false.
        mBluetoothGatt = device.connectGatt(this, false, mGattCallback);// 该函数才是真正的去进行连接
        KLog.d("尝试创建一个新的蓝牙连接");
        mBluetoothDeviceAddress = address;
        mConnectionState = STATE_CONNECTING;
        return true;
    }

    /**
     * 断开本次连接，还可以通过BluetoothGatt建立重复连接
     */
    public void disconnect() {
        if (mBluetoothAdapter == null || mBluetoothGatt == null) {
            KLog.w("BluetoothAdapter not initialized");
            return;
        }
        mBluetoothGatt.disconnect();
        KLog.d("Bluetooth disconnect");
    }

    /**
     * 释放 BluetoothGatt 资源，利于下次进行连接
     */
    public void close() {
        if (mBluetoothGatt == null) {
            return;
        }
        disconnect();
        if (mBluetoothGatt != null) {
            mBluetoothGatt.close();// 释放资源
        }
        mBluetoothGatt = null;
    }

    /**
     * 真正断开连接并释放资源
     */
    public void realCloseBleConnect() {
        close();
        refreshDeviceCache();
        isBuildConnect = false;
        connectCount = 0;
        mBluetoothDeviceAddress = null;
        KLog.d("蓝牙完全断开，资源释放");
    }

    public void wirteCharacteristic(BluetoothGattCharacteristic characteristic) {
        if (mBluetoothAdapter == null || mBluetoothGatt == null) {
            KLog.w("BluetoothAdapter not initialized");
            return;
        }
        mBluetoothGatt.writeCharacteristic(characteristic);
    }

    /**
     * Request a read on a given {@code BluetoothGattCharacteristic}. The read
     * result is reported asynchronously through the
     * {@code BluetoothGattCallback#onCharacteristicRead(android.bluetooth.BluetoothGatt, android.bluetooth.BluetoothGattCharacteristic, int)}
     * callback.
     *
     * @param characteristic The characteristic to read from.
     */
    public void readCharacteristic(BluetoothGattCharacteristic characteristic) {
        if (mBluetoothAdapter == null || mBluetoothGatt == null) {
            KLog.w("BluetoothAdapter not initialized");
            return;
        }
        mBluetoothGatt.readCharacteristic(characteristic);
    }

    /**
     * Enables or disables notification on a give characteristic.
     *
     * @param characteristic Characteristic to act on.
     * @param enabled        If true, enable notification. False otherwise.
     */
    public boolean setCharacteristicNotification(BluetoothGattCharacteristic characteristic, boolean enabled) {
        if (mBluetoothAdapter == null || mBluetoothGatt == null || characteristic == null) {
            KLog.w("BluetoothAdapter not initialized");
            return false;
        }
        return mBluetoothGatt.setCharacteristicNotification(characteristic, enabled) && enableNotification(characteristic, enabled);
    }

    public boolean enableNotification(BluetoothGattCharacteristic characteristic, boolean enabled) {
        if (mBluetoothAdapter == null || mBluetoothGatt == null || characteristic == null) {
            return false;
        }
        final int properties = characteristic.getProperties();
        // 把characteristic 的properties(属性)， 跟已知的通知属性进行“与运算”，结果等于0，则characteristic的属性中不包含通知属性，反之则包含。
        if ((properties & BluetoothGattCharacteristic.PROPERTY_NOTIFY) == 0) {
            return false;
        }

//        List<BluetoothGattDescriptor> descriptors = characteristic.getDescriptors();
//        for (BluetoothGattDescriptor descriptor : descriptors) {
//            if (enabled) {
//                KLog.d("设置通知");
//                descriptor.setValue(BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE);
//            } else {
//                descriptor.setValue(BluetoothGattDescriptor.DISABLE_NOTIFICATION_VALUE);
//            }
//            mBluetoothGatt.writeDescriptor(descriptor);
//        }
//        return true;

        BluetoothGattDescriptor clientConfig = characteristic.getDescriptor(BleAttribute.UUID_DESCRIPTOR_2902);
        if (clientConfig != null) {
            if (enabled) {
                clientConfig.setValue(BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE);
            } else {
                clientConfig.setValue(BluetoothGattDescriptor.DISABLE_NOTIFICATION_VALUE);
            }
            return mBluetoothGatt.writeDescriptor(clientConfig);
        }
        return false;
    }

    public boolean enableIndications(BluetoothGattCharacteristic characteristic) {
        if (mBluetoothAdapter == null || mBluetoothGatt == null || characteristic == null) {
            return false;
        }
        final int properties = characteristic.getProperties();
        if ((properties & BluetoothGattCharacteristic.PROPERTY_INDICATE) == 0) {
            return false;
        }
        BluetoothGattDescriptor clientConfig = characteristic.getDescriptor(BleAttribute.UUID_DESCRIPTOR_2902);
        if (clientConfig != null) {
            clientConfig.setValue(BluetoothGattDescriptor.ENABLE_INDICATION_VALUE);
            return mBluetoothGatt.writeDescriptor(clientConfig);
        }
        return false;
    }

    /**
     * Retrieves a list of supported GATT services on the connected device. This
     * should be invoked only after {@code BluetoothGatt#discoverServices()}
     * completes successfully.
     *
     * @return A {@code List} of supported services.
     */
    public List<BluetoothGattService> getSupportedGattServices() {
        if (mBluetoothGatt == null) {
            return null;
        }
        return mBluetoothGatt.getServices();
    }

    public BluetoothGattService getSupportedGattService(UUID uuid) {
        if (mBluetoothGatt == null) {
            return null;
        }
        return mBluetoothGatt.getService(uuid);
    }

    /**
     * Read the RSSI for a connected remote device.
     */
    public boolean getRssiVal() {
        if (mBluetoothGatt == null)
            return false;

        return mBluetoothGatt.readRemoteRssi();
    }

    /**
     * BLE通讯，数据分包发送，每次20字节，不足20字节按实际数据发送
     *
     * @param gattCharacteristic
     * @param b
     */
    public void subpackageWrite(BluetoothGattCharacteristic gattCharacteristic, byte[] b) {
        if (gattCharacteristic == null || b == null) {
            return;
        }
        int len = b.length;
        int x, count = len / 20;
        if (20 * count < len) {
            x = count + 1;
        } else {
            x = count;
        }
        KLog.i("写入源数据：" + new String(b) + " --byte[] 长度：" + b.length + " --循环次数：" + x);
        for (int i = 0; i < x; i++) {
            byte[] data;
            if ((i + 1) * 20 <= len) {
                data = copyOfRange(b, i * 20, (i + 1) * 20);
            } else {
                data = copyOfRange(b, i * 20, len);
            }
            KLog.d("我在写入：" + new String(data));
            gattCharacteristic.setValue(data);
            wirteCharacteristic(gattCharacteristic);
            // 休眠30毫秒
            try {
                Thread.sleep(30);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }

    public void setConnectCount(int connectCount) {
        this.connectCount = connectCount;
    }

    public void setBuildConnect(boolean buildConnect) {
        isBuildConnect = buildConnect;
    }

    public void setReconnectTime(long reconnectTime) {
        this.reconnectTime = reconnectTime;
    }

    /**
     * 清理本地的BluetoothGatt 的缓存，以保证在蓝牙连接设备的时候，设备的服务、特征是最新的
     *
     * @return
     */
    public boolean refreshDeviceCache() {
        if (mBluetoothGatt != null) {
            try {
                BluetoothGatt localBluetoothGatt = mBluetoothGatt;
                Method localMethod = localBluetoothGatt.getClass().getMethod("refresh", new Class[0]);
                if (localMethod != null) {
                    KLog.d("刷新蓝牙设备的缓存");
                    boolean bool = ((Boolean) localMethod.invoke(localBluetoothGatt, new Object[0])).booleanValue();
                    return bool;
                }
            } catch (Exception e) {
                e.printStackTrace();
                KLog.w("An exception occured while refreshing device");
            }
        }
        return false;
    }
}
