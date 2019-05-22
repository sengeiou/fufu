package com.citymobi.fufu.utils;

import android.text.TextUtils;

import com.amap.api.location.AMapLocation;
import com.amap.api.location.AMapLocationClientOption;

/**
 * <pre>
 *     author : ZhongQuan
 *     e-mail : xxx@xx
 *     time   : 2018/07/03
 *     desc   : 高德地图工具类
 *     version: 1.0
 * </pre>
 */
public class AMapUtil {

    public static AMapLocationClientOption getDefaultOption() {
        AMapLocationClientOption locationOption = new AMapLocationClientOption();
        // 设置定位模式为高精度模式
        locationOption.setLocationMode(AMapLocationClientOption.AMapLocationMode.Hight_Accuracy);
        // 获取一次定位结果
        locationOption.setOnceLocation(true);
        //获取最近3s内精度最高的一次定位结果：
        locationOption.setOnceLocationLatest(true);
        // 设置定位请求超时时间
        locationOption.setHttpTimeOut(15000);
        //关闭缓存机制
        locationOption.setLocationCacheEnable(false);
        // 主动刷新设备wifi模块，获取到最新鲜的wifi列表
        locationOption.setWifiScan(true);
        // 设置定位场景，目前支持三种场景（签到、出行、运动，默认无场景）
        locationOption.setLocationPurpose(AMapLocationClientOption.AMapLocationPurpose.SignIn);
        // 设置是否允许模拟位置,默认为true，允许模拟位置
        locationOption.setMockEnable(true);
        return locationOption;
    }

    public static String getLocationAddress(AMapLocation location) {
        String longAddress = location.getAddress();
        String shortAddress = longAddress
                .replace(location.getProvince(), "")
                .replace(location.getCity(), "")
                .replace(location.getDistrict(), "");
        if (!TextUtils.isEmpty(shortAddress)) {
            return shortAddress;
        }
        return longAddress;
    }
}
