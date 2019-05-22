package com.citymobi.fufu.common;

import android.content.Context;

import com.citymobi.fufu.utils.UserConfigPreference;

/**
 * 全局对象
 * Created by ZQ on 2017/2/10.
 */

public class GlobalObject {

    private static GlobalObject INSTANCE;
    public UserConfigPreference mUserConfig;

    public static GlobalObject getInstance(Context context) {
        if (null == INSTANCE) {
            synchronized (GlobalObject.class) {
                INSTANCE = new GlobalObject(context);
            }
        }
        return INSTANCE;
    }

    private GlobalObject(Context context) {
        mUserConfig = new UserConfigPreference(context);
    }

    public UserConfigPreference getmUserConfig() {
        return mUserConfig;
    }
}
