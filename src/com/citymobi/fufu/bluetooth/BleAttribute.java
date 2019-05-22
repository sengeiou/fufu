package com.citymobi.fufu.bluetooth;

import java.util.UUID;

/**
 * <pre>
 *     author : ZhongQuan
 *     e-mail : xxx@xx
 *     time   : 2017/08/30
 *     desc   : 蓝牙属性类
 *     version: 1.0
 * </pre>
 */
public class BleAttribute {
    // Service
    public static final UUID UUID_SERVICE_FEE8 = UUID.fromString("0000fee8-0000-1000-8000-00805f9b34fb");
    public static final UUID UUID_SERVICE_1800 = UUID.fromString("00001800-0000-1000-8000-00805f9b34fb");
    public static final UUID UUID_SERVICE_4458 = UUID.fromString("00004458-0000-1000-8000-00805f9b34fb");

    // Characteristic
    public static final UUID UUID_CHARACTERISTIC_4454 = UUID.fromString("00004454-0000-1000-8000-00805f9b34fb");
    public static final UUID UUID_CHARACTERISTIC_4455 = UUID.fromString("00004455-0000-1000-8000-00805f9b34fb");
    public static final UUID UUID_CHARACTERISTIC_4456 = UUID.fromString("00004456-0000-1000-8000-00805f9b34fb");
    public static final UUID UUID_CHARACTERISTIC_4457 = UUID.fromString("00004457-0000-1000-8000-00805f9b34fb");
    public static final UUID UUID_CHARACTERISTIC_4458 = UUID.fromString("00004458-0000-1000-8000-00805f9b34fb");
    public static final UUID UUID_CHARACTERISTIC_4459 = UUID.fromString("00004459-0000-1000-8000-00805f9b34fb");
    public static final UUID UUID_CHARACTERISTIC_4460 = UUID.fromString("00004460-0000-1000-8000-00805f9b34fb");

    public static final UUID UUID_CHARACTERISTIC_2A00 = UUID.fromString("00002a00-0000-1000-8000-00805f9b34fb");
    public static final UUID UUID_CHARACTERISTIC_84CF = UUID.fromString("003784cf-f7e3-55b4-6c4c-9fd140100a16");

    // Descriptor
    public static final UUID UUID_DESCRIPTOR_2901 = UUID.fromString("00002901-0000-1000-8000-00805f9b34fb");
    public static final UUID UUID_DESCRIPTOR_2902 = UUID.fromString("00002902-0000-1000-8000-00805f9b34fb");

    /* 属性*/
    public static final long BLE_SCAN_COUNTDOWN_TIME = 30 * 1000;               // 蓝牙扫描超时时间
    public static final long BLE_DISCONNECT_TIMEOUT = 3 * 1000;                 // 蓝牙断开连接超时时间
    public static final long BLE_DISCOVERSERVICES_TIMEOUT = 10 * 1000;          // 蓝牙发现服务超时时间
    public static final long BLE_NET_CONNECT_TIMEOUT = 30 * 1000;               // 蓝牙设备网络连接超时时间
    public static final long BLE_DEVICE_BIND_TIMEOUT = 30 * 1000;               // 蓝牙绑定超时时间
    public static final long BLE_PHYSICS_UNBIND_TIMEOUT = 10 * 1000;            // 蓝牙查询物理解绑超时时间
    public static final long BLE_NETWORK_TYPE_TIMEOUT = 10 * 1000;              // 蓝牙查询设备网络连接方式超时时间
    public static final int BLE_CONNECT_COUNT = 100;                            // 蓝牙连接重复次数限制(由于目前版本控制了重连超时时间，所以重连次数尽量多)
    public static final long BLE_RECONNECT_TIMEOUT = 120 * 1000;                // 蓝牙重连超时时间

    /*广播Action*/
    public static String ACTION_BLE_DISCOVERSERVICES_TIMEOUT = "ACTION_BLE_DISCOVERSERVICES_TIMEOUT";       // 蓝牙发现服务超时
    public static String ACTION_BLE_CONNECT_TIMEOUT = "ACTION_BLE_CONNECT_TIMEOUT";                         // 蓝牙一对一建立连接超时
    public static String ACTION_BLE_NET_SET_TIMEOUT = "ACTION_BLE_NET_SET_TIMEOUT";                         // 设备wifi、有线网络设置，连接超时
    public static String ACTION_BLE_DEVICE_BIND_TIMEOUT = "ACTION_BLE_DEVICE_BIND_TIMEOUT";                 // 设备绑定超时
    public static String ACTION_BLE_DISCONNECT_TIMEOUT = "ACTION_BLE_DISCONNECT_TIMEOUT";                   // APP 主动断开超时
    public static String ACTION_BLE_QUERY_PHYSICS_UNBIND_TIMEOUT = "ACTION_BLE_QUERY_PHYSICS_UNBIND__TIMEOUT";                   // 查询物理解绑超时
    public static String ACTION_BLE_QUERY_NETWORK_TYPE_TIMEOUT = "ACTION_BLE_QUERY_NETWORK_TYPE_TIMEOUT";                     // 查询设备网络连接方式超时


    /* 状态码*/
    public static final int NOT_BAND_TRADITION = 0;     // 无绑定传统设备(即将弃用)
    public static final int NOT_BAND_WISDOM = 1;        // 无绑定智能设备
    public static final int BANDED_TRADITION = 2;       // 已绑定传统设备(即将弃用)
    public static final int BANDED_WISDOM = 3;          // 已绑定智能设备

    public static final int BLE_CONNECTING = 4;         // 考勤机蓝牙正在连接
    public static final int BLE_CONNECTED = 5;          // 考勤机蓝牙一对一连接成功
    public static final int BLE_DISCONNECTED = 6;       // 考勤机蓝牙断开连接
    public static final int BLE_CONNECT_FAIL = 12;      // 考勤机连接失败（蓝牙根本连接不了）

    public static final int BLE_CONNECT_TIME_OUT = 7;   // 蓝牙扫描超时（扫描30秒没发现任何蓝牙设备）

    public static final int BLE_NET_CONFIG_SUCCESS = 8;      // 设备网络连接成功
    public static final int BLE_NET_CONFIG_FAIL = 9;         // 设备网络连接失败

    public static final int BLUETOOTH_OFF = 10;         // 蓝牙开关关闭（手动）
    public static final int BLUETOOTH_ON = 11;          // 蓝牙开关开启（手动）

    public static final int BLE_DEVICE_BIND_SUCCESS = 13;           // 蓝牙设备绑定成功
    public static final int BLE_DEVICE_BIND_FAIL = 14;              // 蓝牙设备绑定失败(或绑定超时)

    public static final int BLE_DELETE_SN = 15;                     // 需要删除考勤机序列号
    public static final int BLE_STET_SN = 16;                       // 不需要删除考勤机序列号
    public static final int BLE_PHYSICS_UNBIND_TIME_OUT = 17;       // 查询设备是否物理解绑超时

    public static final int BLE_NETWORK_TYPE_WIFI = 18;                 // 设备网络连接方式只支持无线网络
    public static final int BLE_NETWORK_TYPE_WIFI_AND_CABLE = 19;       // 设备网络连接方式支持有线和无线网络
    public static final int BLE_NETWORK_TYPE_TIME_OUT = 20;             // 设备网络连接方式支持有线和无线网络

    /* 蓝牙指令*/
    public static final String REQ_HEAD = "HEAD=%1$d;%2$s";                     // 指令长度
    public static final String REQ_CONNECT = "REQ=CONNECT;";                    // 蓝牙一对一连接指令
    public static final String REQ_TIME = "TIME=%1$s;";                         // 设置时间指令
    public static final String REQ_WIFI = "SSID=%1$s;BSSID=%2$s;KEY=%3$s;";     // 设置wifi指令
    public static final String REQ_DISCONNECT = "REQ=DISCONNECT;";              // APP主动断开蓝牙连接指令
    public static final String REQ_RESTORE_STATUS = "REQ=RESTORE-STATUS;";      // 查询考勤机是否物理解绑指令
    public static final String REQ_UNBIND_UPDATE = "REQ=UNBIND-UPDATE;";        // 考勤机序列号删除成功指令
    public static final String REQ_NETWORK_TYPE = "NETWORK=TYPE;";              // 考勤机网络连接方式查询指令
    public static final String REQ_WIRED_NETWORK = "DHCP=%1$s;IP=%2$s;MASK=%3$s;GW=%4$s;DNS=%5$s;";     // 设置有线网络指令，DHCP关闭
    public static final String REQ_DHCP_ON = "DHCP=ON;";                                   // 设置有线网络指令，DHCP开启自动获取IP

    public static final String RESP_CON_OK = "RESP=CON-OK;";
    public static final String RESP_TIME_OK = "RESP=TIME-OK;";
    public static final String RESP_WIFI_INRO_OK = "RESP=WIFI-INFO-OK;";        // 考勤机wifi信息接收成功响应指令
    public static final String RESP_WIFI_CONNECT = "RESP=WIFI-CONNECT;";        // 考勤机wifi连接成功响应指令
    public static final String RESP_DISCON_OK = "RESP=DISCON-OK;";              // APP与考勤机断开响应指令

    public static final String RESP_BIND_OK = "RESP=BIND-OK;";                  // 考勤机绑定成功指令
    public static final String RESP_BIND_FAIL = "RESP=BIND-FAIL;";              // 考勤机绑定失败指令

    public static final String RESP_BIND_RESTORE = "RESP=BIND-RESTORE;";        // 考勤机有做物理解绑指令
    public static final String RESP_BIND_NORMAL = "RESP=BIND-NORMAL;";          // 考勤机没做物理解绑指令

    public static final String RESP_WIFI_ONLY = "RESP=WIFI-ONLY;";              // 考勤机只支持无线网络指令
    public static final String RESP_WIFI_AND_CABLE = "RESP=WIFIANDCABLE;";      // 考勤机支持有线和无线网络指令
    public static final String RESP_NETWORK_SET_OK = "RESP=NET-SET-OK;";        // 考勤机有线网络信息设置成功指令
    public static final String RESP_NETWORK_CON_OK = "RESP=NET-CON-OK;";        // 考勤机有线网络连接成功指令


}
