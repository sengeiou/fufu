package org.apache.cordova.map.model;

/**
 * Created by shangzh on 16/6/28.
 */
public class SearchAddress extends Address {

    //当前地点描述，用于
    public String descrip;
    //当前地点的别名
    public String anotherName;

    public void setDescrip(String descrip) {
        this.descrip = descrip;
    }

    public String getDescrip() {
        return descrip;
    }

    public void setAnotherName(String anotherName) {
        this.anotherName = anotherName;
    }

    public String getAnotherName() {
        return anotherName;
    }
}
