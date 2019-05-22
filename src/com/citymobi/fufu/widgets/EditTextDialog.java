package com.citymobi.fufu.widgets;

import android.app.Dialog;
import android.content.Context;
import android.view.View;
import android.widget.EditText;
import android.widget.TextView;

import com.citymobi.fufu.R;

/**
 * 外出申请地址提示框
 * Created by ZhongQuan on 17/2/17.
 */

public class EditTextDialog extends Dialog {

    private TextView title, cancel, confirm;
    private EditText message;
    private View.OnClickListener mListener;
    private EditTextDialog customDialog;

    public EditTextDialog(Context context) {
        super(context);
        initView();

    }

    public EditTextDialog(Context context, boolean cancelable, OnCancelListener cancelListener) {
        super(context, cancelable, cancelListener);
        initView();
    }

    public EditTextDialog(Context context, int theme) {
        super(context, theme);
        initView();
    }

    public static EditTextDialog getEditTextDialog(Context context) {
        return new EditTextDialog(context, R.style.CustomerDialog);
    }


    private void initView() {
        setContentView(R.layout.dialog_edit);
        title = (TextView) findViewById(R.id.tv_title);
        message = (EditText) findViewById(R.id.et_message);
        cancel = (TextView) findViewById(R.id.tv_cancel);
        confirm = (TextView) findViewById(R.id.tv_confirm);

        cancel.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                dismiss();
            }
        });
        confirm.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (mListener != null) {
                    dismiss();
                    mListener.onClick(message);
                }
            }
        });
    }

    //对外提供内容信息和标题信息的方法
    public EditTextDialog setTitle(String title) {
        this.title.setText(title);
        return this;
    }

    public EditTextDialog setMessage(String msg) {
        this.message.setText(msg);
        return this;
    }

    public EditTextDialog setConfirmListener(View.OnClickListener mListener) {
        this.mListener = mListener;
        return this;
    }
}
