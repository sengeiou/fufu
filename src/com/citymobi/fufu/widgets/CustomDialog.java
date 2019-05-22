package com.citymobi.fufu.widgets;

import android.app.Dialog;
import android.content.Context;
import android.support.annotation.StringRes;
import android.view.View;
import android.widget.TextView;

import com.citymobi.fufu.R;
import com.citymobi.fufu.application.FuFuApplication;
import com.socks.library.KLog;

/**
 * Created by shangzh on 17/2/17.
 */

public class CustomDialog extends Dialog {

    private TextView title;
    private TextView message;
    private TextView no;
    private TextView yes;
    private static CustomDialog customDialog;

    public CustomDialog(Context context) {
        super(context);
        initView();
    }

    public CustomDialog(Context context, int themeResId) {
        super(context, themeResId);
        initView();
    }

    public CustomDialog(Context context, boolean cancelable, OnCancelListener cancelListener) {
        super(context, cancelable, cancelListener);
        initView();
    }


    public static CustomDialog getCustomDialog(Context context) {
        if (customDialog != null && customDialog.isShowing()) {
            customDialog.dismiss(); // 当创建Dialog的Acitivity被销毁了，而之前的Dialog没有被销毁，再次销毁Dialog时会报错，如下
                                    // java.lang.IllegalArgumentException: View=com.android.internal.policy.PhoneWindow$DecorView{} not attached to window manager
            customDialog = null;
        }
        customDialog = new CustomDialog(context, R.style.CustomerDialog);
        return customDialog;
    }


    private void initView() {

        setContentView(R.layout.dialog);

//        Window window = getWindow();
//        WindowManager.LayoutParams params = window.getAttributes();
//        params.gravity = Gravity.CENTER;
//        window.setAttributes(params);


//实例化控件
        title = (TextView) findViewById(R.id.title);
        message = (TextView) findViewById(R.id.message);
//        no=(TextView) findViewById(R.id.no);
        yes = (TextView) findViewById(R.id.yes);

        setCancelable(false);
    }

    //对外提供内容信息和标题信息的方法
    public void setInfo(String title, String message) {
        this.title.setText(title);
        this.message.setText(message);
    }

    public void setConfirmText(String str) {
        this.yes.setText(str);
    }

    public void setInfo(@StringRes int titleStr, @StringRes int msgRes) {
        setInfo(FuFuApplication.getmInstance().getResources().getString(titleStr), FuFuApplication.getmInstance().getResources().getString(msgRes));
    }

    public void setConfirmText(@StringRes int strRes) {
        setConfirmText(FuFuApplication.getmInstance().getResources().getString(strRes));
    }

    public void setListenerYes(View.OnClickListener yesListener) {
        yes.setOnClickListener(yesListener);
    }

    public void showDialog() {
        if (customDialog != null && !customDialog.isShowing()) {
            KLog.d("showDialog");
            customDialog.show();
        }
    }

    public static void hideDialog() {
        if (customDialog != null && customDialog.isShowing()) {
            KLog.d("hideDialog");
            customDialog.dismiss();
            customDialog = null;
        }
    }

}
