package com.citymobi.fufu.utils;

import android.text.TextUtils;

import com.citymobi.fufu.application.FuFuApplication;
import com.citymobi.fufu.nativecaller.NativeCaller;

import java.math.BigInteger;
import java.util.Arrays;
import java.util.UUID;

/**
 * 字符串工具类
 * Created by ZhongQuan on 2017/6/12.
 */

public class StringUtil {
    // 中控自定义广播包
    private static final int SN_LENGHT = 38;// 13位sn码+6位时间码
    private static final int SN_START_INDEX = 14;
    private static final int FLAG_LENGHT = 2; // 自定义广播包中设备绑定与蓝牙连接的标识位
    private static final int FLAG_START_INDEX = 52;
    private static final int ZK_LENGHT = 4;// 中控设备的标志位
    private static final int ZK_START_INDEX = 10;
    // ibeacon 广播包
    private static final int UUID_LENGHT = 32;
    private static final int UUID_START_INDEX = 18;
    private static final int MAJOR_LENGHT = 4;
    private static final int MAJOR_START_INDEX = 50;

    /**
     * 获取SN码字符串；ps:开始获取到的是加密后的数据，需要进行解密，再取sn码和时间码
     *
     * @param b
     * @return String[] , [0] 是sn码, [1] 是time码
     */
    public synchronized static String[] getSNStr(byte[] b) {
        String data = byte2HexStr(b);
        return getSNStr(data);
    }

    public synchronized static String[] getSNStr(String data) {
        String snHexStr = "";
        if (!TextUtils.isEmpty(data) && data.length() > (SN_START_INDEX + SN_LENGHT)) {
            // 截取对应sn码和时间的十六进制字符串,长度为38
            snHexStr = data.substring(SN_START_INDEX, SN_START_INDEX + SN_LENGHT);
            // 若截取的16进制字符串中包含连续26位的0，则数据不正常
            if (TextUtils.isEmpty(snHexStr) || snHexStr.contains("00000000000000000000000000")) {
                return new String[]{"", ""};
            }
            // major
//            KLog.d(data.substring(MAJOR_START_INDEX, MAJOR_START_INDEX + MAJOR_LENGHT));
        }
        char[] snBefore = hexStr2CharArray(snHexStr);// 解密前
        char[] snAfter = null;
        if (snBefore.length != 38) {
            snAfter = NativeCaller.getDecryptCharArray(snBefore);// 解密
        }

        return getSnAndTime(snAfter);
    }

    /**
     * 获取解密数据中的sn码和time码
     *
     * @param charArray 解密后的字符数组
     * @return
     */
    public static String[] getSnAndTime(char[] charArray) {
        String[] s = {"", ""};
        if (charArray == null || charArray.length != 19) {
            return s;
        }
        char[] sn = Arrays.copyOfRange(charArray, 0, 13);// 前13位为sn码
        char[] time = Arrays.copyOfRange(charArray, 13, charArray.length);// 后6位为时间码
        StringBuilder sb = new StringBuilder();
        for (char c : time) {
            int t = c;
            if (t < 10) {
                sb.append("0");
            }
            sb.append(t);
        }
        s[0] = String.valueOf(sn);
        s[1] = sb.toString();
        return s;
    }

    public static String getUuidStr(byte[] b) {
        String data = byte2HexStr(b);
        String uuidHexStr = "";
        if (!TextUtils.isEmpty(data) && data.length() > (UUID_START_INDEX + UUID_LENGHT)) {
            // 截取对应uuid码的十六进制字符串
            uuidHexStr = data.substring(UUID_START_INDEX, UUID_START_INDEX + UUID_LENGHT);
        }
        if (TextUtils.isEmpty(uuidHexStr)) {
            return "";
        }
        UUID uuid = byte2UUID(hexStr2Bytes(uuidHexStr));
        return uuid == null ? "" : uuid.toString();
    }

    /**
     * 获取自定义广播包中设备绑定与蓝牙连接的标识位
     *
     * @param b
     * @return
     */
    public static String getBandAndConnectStatusFlagStr(byte[] b) {
        String data = byte2HexStr(b);
        return getBandAndConnectStatusFlagStr(data);
    }

    // 获取自定义广播包中设备绑定与蓝牙连接的标识位
    public static synchronized String getBandAndConnectStatusFlagStr(String data) {
        String flagStr = "";
        if (!TextUtils.isEmpty(data) && data.length() > FLAG_START_INDEX + FLAG_LENGHT) {
            flagStr = data.substring(FLAG_START_INDEX, FLAG_START_INDEX + FLAG_LENGHT);
        }
        return flagStr;
    }

    /**
     * 获取设备“绑定与连接”标志位的第一和第二bit位
     *
     * @param hex
     * @return
     */
    public static synchronized String getBandAndConnectBinaryFlag(String hex) {
        byte[] b = hexStr2Bytes(hex);
        if (b != null) {
            String binaryStr = byte2Binary(b);
            String fullStr = autoZeroPadding(binaryStr);
            if (!TextUtils.isEmpty(fullStr) && fullStr.length() >= 2) {
                return fullStr.substring(fullStr.length() - 2, fullStr.length());
            }
        }
        return null;
    }

    /**
     * 获取自定义广播包中中控设备的标识位
     *
     * @param b
     * @return
     */
    public static String getZKDevicesFlagStr(byte[] b) {
        String data = byte2HexStr(b);
        return getZKDevicesFlagStr(data);
    }

    // 获取自定义广播包中中控设备的标识位
    public static synchronized String getZKDevicesFlagStr(String data) {
        String flagStr = "";
        if (!TextUtils.isEmpty(data) && data.length() > ZK_START_INDEX + ZK_LENGHT) {
            flagStr = data.substring(ZK_START_INDEX, ZK_START_INDEX + ZK_LENGHT);
        }
        return flagStr;
    }

    /**
     * 十六进制转文本字符串
     *
     * @param hexStr Byte字符串(Byte之间无分隔符 如:[616C6B])
     * @return 对应的字符串
     */
    public static String hexStr2TextStr(String hexStr) {
        String str = "0123456789ABCDEF";
        char[] hexs = hexStr.toCharArray();
        byte[] bytes = new byte[hexStr.length() / 2];
        int n;

        for (int i = 0; i < bytes.length; i++) {
            n = str.indexOf(hexs[2 * i]) * 16;
            n += str.indexOf(hexs[2 * i + 1]);
            bytes[i] = (byte) (n & 0xff);
        }
        return new String(bytes);
    }

    /**
     * bytes转换成十六进制字符串
     *
     * @param b
     * @return
     */
    public static synchronized String byte2HexStr(byte[] b) {
        String stmp = "";
        StringBuilder sb = new StringBuilder("");
        for (byte b1 : b) {
            stmp = Integer.toHexString(b1 & 0xFF);
            sb.append((stmp.length() == 1) ? "0" + stmp : stmp);
        }
        return sb.toString().toUpperCase().trim();
    }

    public static UUID byte2UUID(byte[] data) {
        if (data.length != 16) {
//            throw new IllegalArgumentException("Invalid UUID byte[]");
            return null;
        }

        long msb = 0;
        long lsb = 0;
        for (int i = 0; i < 8; i++)
            msb = (msb << 8) | (data[i] & 0xff);
        for (int i = 8; i < 16; i++)
            lsb = (lsb << 8) | (data[i] & 0xff);

        return new UUID(msb, lsb);
    }

    /**
     * 十六进制字符串转字节数组
     *
     * @param hexstr
     * @return
     */
    public static byte[] hexStr2Bytes(String hexstr) {
        byte[] b = new byte[hexstr.length() / 2];
        int j = 0;
        for (int i = 0; i < b.length; i++) {
            char c0 = hexstr.charAt(j++);
            char c1 = hexstr.charAt(j++);
            b[i] = (byte) ((parse(c0) << 4) | parse(c1));
        }
        return b;
    }

    private static int parse(char c) {
        if (c >= 'a')
            return (c - 'a' + 10) & 0x0f;
        if (c >= 'A')
            return (c - 'A' + 10) & 0x0f;
        return (c - '0') & 0x0f;
    }

    /**
     * 将十六进制字符串转字符数组
     *
     * @param hexStr
     * @return
     */
    public static char[] hexStr2CharArray(String hexStr) {
        char[] charArray = hexStr.toCharArray();
        char[] chars = new char[19];
        int x = 0, i, len = charArray.length;
        for (i = 0; i < len; i = i + 2) {
            String hexS = String.valueOf(charArray, i, 2);
            chars[x] = (char) Integer.parseInt(hexS, 16);
            x++;
        }
        return chars;
    }

    /**
     * 将byte[]转为各种进制的字符串
     *
     * @param bytes byte[]
     * @param radix 基数可以转换进制的范围，从Character.MIN_RADIX到Character.MAX_RADIX(即从2到36)，超出范围后变为10进制
     * @return 转换后的字符串
     */
    public static String byte2JinZhi(byte[] bytes, int radix) {
        return new BigInteger(1, bytes).toString(radix);// 这里的1代表正数
    }

    /**
     * 将byte[]转为二进制的字符串
     *
     * @param bytes
     * @return
     */
    public static String byte2Binary(byte[] bytes) {
        return new BigInteger(1, bytes).toString(2);// 这里的1代表正数
    }

    /**
     * 自动补位0，参数长度小于8位，前面自动补零
     *
     * @param code
     * @return
     */
    public static String autoZeroPadding(String code) {
        StringBuffer zero = new StringBuffer("00000000");
        if (TextUtils.isEmpty(code) || code.length() > zero.length()) {
            return "";
        }
        StringBuffer result = zero.replace(zero.length() - code.length(), zero.length(), code);
        return result.toString();
    }

    /**
     * SN 码是否匹配得上
     *
     * @param sn
     * @return
     */
    public synchronized static boolean isMatchingSN(String sn) {
        if (!TextUtils.isEmpty(sn) && sn.length() == 13) {
            UserConfigPreference mUserConfig = FuFuApplication.globalObject.getmUserConfig();
            // 进入状态的 SN 码
            String enterSN = mUserConfig.getSNBle();
            if (TextUtils.isEmpty(enterSN)) {
                String snList = mUserConfig.getSNList();
                if (!TextUtils.isEmpty(snList)) {
                    return snList.contains(sn);
                }
            } else {
                if (enterSN.equals(sn)) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * 检测uuid是否匹配得上
     *
     * @param b
     * @return
     */
    public synchronized static boolean isMatchingUuid(byte[] b) {
        String uuid = getUuidStr(b);
        if (!TextUtils.isEmpty(uuid)) {
            UserConfigPreference mUserConfig = FuFuApplication.globalObject.getmUserConfig();
            String snList = mUserConfig.getSNList();
            if (!TextUtils.isEmpty(snList)) {
                return snList.contains(uuid);
            }
        }
        return false;
    }
}
