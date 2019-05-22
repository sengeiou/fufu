package com.citymobi.fufu.common;

import android.app.Activity;
import android.graphics.Rect;
import android.support.v4.content.ContextCompat;
import android.view.View;
import android.view.ViewTreeObserver;
import android.widget.FrameLayout;

import com.citymobi.fufu.R;
import com.socks.library.KLog;

/**
 * Created by ZhongQuan on 2017/2/17.
 */

public class AndroidBug5497Workaround {
    // For more information, see https://code.google.com/p/android/issues/detail?id=5497
    // To use this class, simply invoke assistActivity() on an activity that already has its content view set.

    public static void assistActivity(Activity activity) {
        new AndroidBug5497Workaround(activity);
    }

    private View mChildOfContent;
    private int usableHeightPrevious;
    private FrameLayout.LayoutParams frameLayoutParams;

    private AndroidBug5497Workaround(Activity activity) {
        FrameLayout content = (FrameLayout) activity.findViewById(android.R.id.content);
        mChildOfContent = content.getChildAt(0);
        mChildOfContent.setBackgroundColor(ContextCompat.getColor(activity, R.color.colorWindowBackground));
        mChildOfContent.getViewTreeObserver().addOnGlobalLayoutListener(new ViewTreeObserver.OnGlobalLayoutListener() {
            public void onGlobalLayout() {
                possiblyResizeChildOfContent();
            }
        });
        frameLayoutParams = (FrameLayout.LayoutParams) mChildOfContent.getLayoutParams();
    }

    private void possiblyResizeChildOfContent() {
        int usableHeightNow = computeUsableHeight();

        KLog.d("Height11", usableHeightNow);
        KLog.d("Height22", usableHeightPrevious);

        if (usableHeightNow != usableHeightPrevious) {

            int usableHeightSansKeyboard = mChildOfContent.getRootView().getHeight();// 全屏高
            KLog.d("Height33", usableHeightSansKeyboard);

            int heightDifference = usableHeightSansKeyboard - usableHeightNow;// 变化高度
            KLog.d("Height44", heightDifference);

            if (heightDifference > (usableHeightSansKeyboard / 4)) {
                // keyboard probably just became visible
                frameLayoutParams.height = usableHeightSansKeyboard - heightDifference;
                KLog.d("Height55", usableHeightSansKeyboard - heightDifference);
//                frameLayoutParams.bottomMargin = heightDifference;
//                mChildOfContent.setPadding(0, 0, 0, heightDifference);

            } else {
                // keyboard probably just became hidden
//                frameLayoutParams.height = usableHeightSansKeyboard ;
                frameLayoutParams.height = usableHeightNow;
                KLog.d("Height66", usableHeightSansKeyboard);
//                frameLayoutParams.bottomMargin = 0;
//                mChildOfContent.setPadding(0, 0, 0, 0);
            }
            mChildOfContent.requestLayout();

            usableHeightPrevious = usableHeightNow;
            KLog.d("Height77", usableHeightNow);
        }
    }

    private int computeUsableHeight() {
        Rect r = new Rect();
        mChildOfContent.getWindowVisibleDisplayFrame(r);

        KLog.d(r.bottom + "~~~" + r.top);

        return (r.bottom - r.top); // 全屏模式下： return r.bottom
    }
}
