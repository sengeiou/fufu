package com.citymobi.fufu.utils;

import java.text.SimpleDateFormat;
import java.util.Date;

/**
 * <pre>
 *     author : ZhongQuan
 *     e-mail : xxx@xx
 *     time   : 2017/09/05
 *     desc   : 日期时间工具类
 *     version: 1.0
 * </pre>
 */
public class DateUtil {
    public static final String SHORT_FORMAT = "yyMMddHHmmss";

    public static String getShortFormatDate() {
        SimpleDateFormat sdf = new SimpleDateFormat(SHORT_FORMAT);
        return sdf.format(new Date());
    }

    /**
     * 获取当前日期时间，精确到秒，格式为：2017-08-23-15-37-24
     *
     * @return
     */
    public static String getCurrentDate() {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd-HH-mm-ss");
        return sdf.format(new Date());
    }
}
