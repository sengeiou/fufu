package org.apache.cordova.map.model;

/**
 * Created by shangzh on 16/5/30.
 */
public class Address {

    public String addressTitle;

    public String latitude;

    public String longitude;

    public boolean selected;

    //省市区，用于搜索附近地点的地图
    public String city;

    // 详细地址
    public String addressDetail;

    public Address() {
        this.latitude = "";
        this.longitude = "";
        this.addressTitle = "";
        this.addressDetail = "";
    }

    public Address(String latitude, String longitude, String addressTitle, String addressDetail, boolean selected) {
        this.addressTitle = addressTitle;
        this.latitude = latitude;
        this.longitude = longitude;
        this.selected = selected;
        this.addressDetail = addressDetail;
    }

    public Address(String latitude, String longitude, String addressTitle, String addressDetail) {
        this.addressTitle = addressTitle;
        this.latitude = latitude;
        this.longitude = longitude;
        this.addressDetail = addressDetail;
    }

    public void setAddressTitle(String addressTitle) {
        this.addressTitle = addressTitle;
    }

    public void setSelected(boolean selected) {
        this.selected = selected;
    }

    public String getLatitude() {
        return latitude;
    }

    public void setLatitude(String latitude) {
        this.latitude = latitude;
    }

    public String getLongitude() {
        return longitude;
    }

    public void setLongitude(String longitude) {
        this.longitude = longitude;
    }

    public String getAddressTitle() {
        return addressTitle;
    }

    public boolean isSelected() {
        return selected;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getCity() {
        return city;
    }

    public String getAddressDetail() {
        return addressDetail;
    }

    public void setAddressDetail(String addressDetail) {
        this.addressDetail = addressDetail;
    }
}

