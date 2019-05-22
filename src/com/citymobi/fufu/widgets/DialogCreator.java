package com.citymobi.fufu.widgets;

import android.app.Dialog;
import android.content.Context;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.WindowManager;

import com.citymobi.fufu.R;


/**
 * <pre>
 *     author : ZhongQuan
 *     e-mail : xxx@xx
 *     time   : 2017/05/09
 *     desc   : Dialog辅助类
 *     version: 1.0
 * </pre>
 */
public class DialogCreator {

    public static Dialog createProgressDialog(Context context, boolean cancellable) {
        View view = LayoutInflater.from(context).inflate(R.layout.layout_center_progress_dialog, null, false);
        Dialog dialog = new Dialog(context, R.style.CenterDialog);
        dialog.setContentView(view);
        dialog.setCanceledOnTouchOutside(cancellable);
        dialog.setCancelable(cancellable);
        WindowManager.LayoutParams params = dialog.getWindow().getAttributes();
        params.gravity = Gravity.CENTER;
        dialog.getWindow().setAttributes(params);
        return dialog;
    }

}
