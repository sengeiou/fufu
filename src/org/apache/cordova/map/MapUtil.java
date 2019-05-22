package org.apache.cordova.map;

import com.amap.api.location.AMapLocation;
import com.citymobi.fufu.utils.AMapUtil;

import org.json.JSONException;
import org.json.JSONObject;

/**
 * 地图工具类
 * 修改于：20181024
 */
public class MapUtil {

    public synchronized static JSONObject getLocation(AMapLocation location) throws JSONException {
        JSONObject jsonObject = new JSONObject();
        jsonObject.put("longitude", String.valueOf(location.getLongitude()));
        jsonObject.put("latitude", String.valueOf(location.getLatitude()));
//        jsonObject.put("address", location.getAddress().replace(location.getProvince(), "").replace(location.getCity(), "").replace(location.getDistrict(), "").replace(location.getStreet(), ""));
        jsonObject.put("address", AMapUtil.getLocationAddress(location));
        jsonObject.put("city", location.getProvince() + location.getCity() + location.getDistrict() + location.getStreet());
        return jsonObject;
    }
}
