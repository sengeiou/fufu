package com.citymobi.fufu.utils;

import android.content.Context;
import android.content.SharedPreferences;

import com.citymobi.fufu.entity.UserConfig;

/**
 * 用户配置
 * Created by ZQ on 2017/2/10.
 */

public class UserConfigPreference {
    private SharedPreferences mPreferences;
    private SharedPreferences.Editor mEditor;

    public UserConfigPreference(Context context) {
        mPreferences = context.getSharedPreferences("UserConfig", Context.MODE_PRIVATE);
        mEditor = mPreferences.edit();
    }

    public String getJPushMessage() {
        return mPreferences.getString(UserConfig.JPUSH_MESSAGE, "");
    }

    public UserConfigPreference saveJPushMessage(String jpushMessage) {
        mEditor.putString(UserConfig.JPUSH_MESSAGE, jpushMessage);
        return this;
    }

    public String getSNList() {
        return mPreferences.getString(UserConfig.SN_LIST, "");
    }

    public UserConfigPreference saveSNList(String snList) {
        mEditor.putString(UserConfig.SN_LIST, snList);
        return this;
    }

    public boolean getIsLeave() {
        return mPreferences.getBoolean(UserConfig.IS_LEAVE, true);
    }

    public UserConfigPreference saveIsLeave(boolean isLeave) {
        mEditor.putBoolean(UserConfig.IS_LEAVE, isLeave);
        return this;
    }

    public String getSNBle() {
        return mPreferences.getString(UserConfig.SN_BLE, "");
    }

    public UserConfigPreference saveSNBle(String sn) {
        mEditor.putString(UserConfig.SN_BLE, sn);
        return this;
    }

    public String getSNTimeBle() {
        return mPreferences.getString(UserConfig.SN_TIME, "");
    }

    public UserConfigPreference saveSNTimeBle(String time) {
        mEditor.putString(UserConfig.SN_TIME, time);
        return this;
    }

    public String getLocalData(String key) {
        return mPreferences.getString(key, "");
    }

    public UserConfigPreference saveData(String key, String value) {
        mEditor.putString(key, value);
        return this;
    }

    /**
     * 最终保存方法（不调用则不保存）
     */
    public UserConfigPreference apply() {
        mEditor.apply();
        return this;
    }

    /**
     * 移除某个key值已经对应的值
     *
     * @param key
     * @return
     */
    public UserConfigPreference remove(String key) {
        mEditor.remove(key);
        return this;
    }

    public void clear() {
        mEditor.clear();
        mEditor.apply();
    }
}
