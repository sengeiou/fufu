package com.citymobi.fufu.application;

import android.app.Application;

import com.citymobi.fufu.BuildConfig;
import com.citymobi.fufu.channel.PackerNg;
import com.citymobi.fufu.common.GlobalObject;
import com.socks.library.KLog;
import com.umeng.analytics.MobclickAgent;

import cn.jpush.android.api.JPushInterface;

/**
 * Created by ZhongQuan on 2017/1/12.
 * 服服Application
 */

public class FuFuApplication extends Application {
    private String TAG = FuFuApplication.class.getSimpleName();

    public static GlobalObject globalObject = null;
    private static FuFuApplication mInstance;

    @Override
    public void onCreate() {
        super.onCreate();
        mInstance = FuFuApplication.this;
        globalObject = GlobalObject.getInstance(this);

        // KLog初始化
        KLog.init(BuildConfig.LOG_DEBUG);
        // 极光推送
        JPushInterface.setDebugMode(BuildConfig.DEBUG);
        JPushInterface.init(this);
        //友盟初始化
        MobclickAgent.setScenarioType(this, MobclickAgent.EScenarioType.E_UM_NORMAL);
        MobclickAgent.setDebugMode(BuildConfig.DEBUG);
        MobclickAgent.openActivityDurationTrack(false);
        // 设置渠道信息
        final String channelId = PackerNg.getMarket(mInstance, "yingyongbao");
        MobclickAgent.startWithConfigure(new MobclickAgent.UMAnalyticsConfig(mInstance, "58325163f43e485f7b0004e9", channelId, MobclickAgent.EScenarioType.E_UM_NORMAL, true));
    }

    public static FuFuApplication getmInstance() {
        return mInstance;
    }

}
