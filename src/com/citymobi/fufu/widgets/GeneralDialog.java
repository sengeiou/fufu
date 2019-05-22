package com.citymobi.fufu.widgets;

import android.app.Dialog;
import android.content.Context;
import android.support.annotation.StringRes;
import android.view.View;
import android.widget.TextView;

import com.citymobi.fufu.R;
import com.citymobi.fufu.application.FuFuApplication;

/**
 * 普通dialog
 * Created by ZhongQuan on 17/10/16.
 */

public class GeneralDialog extends Dialog {

    private TextView message;
    private TextView tvCancel;
    private TextView tvConfirm;
    private static GeneralDialog generalDialog;

    private View.OnClickListener mListener;

    public GeneralDialog(Context context) {
        super(context);
        initView();
    }

    public GeneralDialog(Context context, int themeResId) {
        super(context, themeResId);
        initView();
    }

    public GeneralDialog(Context context, boolean cancelable, OnCancelListener cancelListener) {
        super(context, cancelable, cancelListener);
        initView();
    }


    public static GeneralDialog getGeneralDialog(Context context) {
        if (generalDialog != null && generalDialog.isShowing()) {
            generalDialog.dismiss();
            generalDialog = null;
        }
        generalDialog = new GeneralDialog(context, R.style.CustomerDialog);
        return generalDialog;
    }


    private void initView() {
        setContentView(R.layout.dialog_general);
        message = (TextView) findViewById(R.id.tv_msg_dialog);
        tvCancel = (TextView) findViewById(R.id.tv_cancel_dialog);
        tvConfirm = (TextView) findViewById(R.id.tv_confirm_dialog);
        setCancelable(false);
        tvCancel.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                hideDialog();
            }
        });
        tvConfirm.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                hideDialog();
                if (mListener != null) {
                    mListener.onClick(v);
                }
            }
        });
    }

    public void setInfo(String message) {
        this.message.setText(message);
    }

    public void setInfo(@StringRes int msgRes) {
        setInfo(FuFuApplication.getmInstance().getResources().getString(msgRes));
    }

    public void setConfirmListener(View.OnClickListener mListener) {
        this.mListener = mListener;
    }

    public void showDialog() {
        if (generalDialog != null && !generalDialog.isShowing()) {
            generalDialog.show();
        }
    }

    public void hideDialog() {
        if (generalDialog != null && generalDialog.isShowing()) {
            generalDialog.dismiss();
            generalDialog = null;
        }
    }

}
