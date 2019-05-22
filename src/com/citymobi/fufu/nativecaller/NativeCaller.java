package com.citymobi.fufu.nativecaller;

/**
 * <pre>
 *     author : ZhongQuan
 *     e-mail : xxx@xx
 *     time   : 2017/07/21
 *     desc   : 调用zkdes.so中的方法
 *     version: 1.0
 * </pre>
 */
public class NativeCaller {

    static {
        System.loadLibrary("zkdes");
    }

    /**
     * 原生方法，获取解密后的sn码和时间
     * @param charArray 加密字符数据
     * @return
     */
    public native static char[] getDecryptCharArray(char[] charArray);

}
