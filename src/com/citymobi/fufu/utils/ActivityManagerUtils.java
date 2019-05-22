package com.citymobi.fufu.utils;

import android.app.Activity;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

/**
 * <pre>
 *     author : ZhongQuan
 *     e-mail : xxx@xx
 *     time   : 2017/09/11
 *     desc   : Activity管理工具类
 *     version: 1.0
 * </pre>
 */
public class ActivityManagerUtils {
    private static ActivityManagerUtils mActivityManagerUtils;


    static {
        mActivityManagerUtils = new ActivityManagerUtils();
    }

    private ActivityManagerUtils() {
        /**
         * 这里面写一些需要执行初始化的工作
         */
    }

    public static ActivityManagerUtils getInstance() {
        return mActivityManagerUtils;
    }

    /**
     * 打开的activity
     **/

    private List<Activity> activities = new ArrayList<Activity>();


    /**
     * 新建了一个activity
     *
     * @param activity
     */

    public void addActivity(Activity activity) {
        activities.add(activity);
    }

    /**
     * 结束指定的Activity
     *
     * @param activity
     */

    public void finishActivity(Activity activity) {
        if (activity != null) {
            this.activities.remove(activity);
            activity.finish();
        }
    }

    /**
     * 应用退出，结束所有的activity
     */

    public void exit() {
        for (Activity activity : activities) {
            if (activity != null) {
                activity.finish();
            }
        }
        System.exit(0);
    }

    /**
     * 结束指定类名的Activity
     */
    public void finishActivityclass(Class<?> cls) {
        if (activities != null) {
//            for (Activity activity : activities) {// 对Vector、ArrayList在迭代的时候如果同时对其进行修改就会抛出java.util.ConcurrentModificationException异常
//                if (activity.getClass().equals(cls)) {
//                    finishActivity(activity);
//                    break;
//                }
//            }

            Iterator<Activity> it = activities.iterator();
            while (it.hasNext()) {
                Activity activity = it.next();
                if (activity.getClass().equals(cls)) {
                    it.remove();
                    activity.finish();
                }
            }
        }
    }
}
