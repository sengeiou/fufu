package org.apache.cordova.map.activity;

import android.content.Intent;
import android.os.Bundle;
import android.support.v7.widget.LinearLayoutManager;
import android.support.v7.widget.RecyclerView;
import android.text.Editable;
import android.text.TextUtils;
import android.text.TextWatcher;
import android.view.View;
import android.widget.AdapterView;
import android.widget.AutoCompleteTextView;
import android.widget.ImageView;
import android.widget.TextView;

import com.amap.api.services.core.AMapException;
import com.amap.api.services.help.Inputtips;
import com.amap.api.services.help.InputtipsQuery;
import com.amap.api.services.help.Tip;
import com.chad.library.adapter.base.BaseQuickAdapter;
import com.citymobi.fufu.R;
import com.citymobi.fufu.activity.base.BaseActivity;
import com.socks.library.KLog;

import org.apache.cordova.map.adapter.AMapInputAdapter;

import java.util.ArrayList;
import java.util.List;

/**
 * 高德地图关键字搜索界面
 * Create by ZhongQuan
 * date 20181024
 */
public class MapKeywordsSearchActivity extends BaseActivity implements
        TextWatcher,
        Inputtips.InputtipsListener,
        AdapterView.OnItemClickListener,
        BaseQuickAdapter.OnItemClickListener,
        View.OnClickListener {

    private String city = "";// 设置null或""为全国

    private ImageView ivClear;
    private TextView tvCancel;
    private AutoCompleteTextView mKeywordText;

    private RecyclerView recyclerView;
    private AMapInputAdapter mAdapter;
    private List<Tip> mData = new ArrayList<Tip>();


    @Override
    protected void initContentView(Bundle bundle) {
        setContentView(R.layout.activity_map_keywords_search);
    }

    @Override
    protected void initView() {
        tvCancel = findView(R.id.tv_cancel_search);
        ivClear = findView(R.id.iv_clear_input);
        recyclerView = (RecyclerView) findViewById(R.id.recyclerview_inputlist);
        recyclerView.setLayoutManager(new LinearLayoutManager(MapKeywordsSearchActivity.this));
        mAdapter = new AMapInputAdapter(R.layout.item_amap_search, mData);
        recyclerView.setAdapter(mAdapter);
        mAdapter.setOnItemClickListener(this);

        mKeywordText = (AutoCompleteTextView) findViewById(R.id.input_edittext);
        mKeywordText.addTextChangedListener(this);
        tvCancel.setOnClickListener(this);
        ivClear.setOnClickListener(this);
    }

    @Override
    protected void initData() {
    }

    @Override
    protected void getBundleExtras(Bundle extras) {
    }

    @Override
    protected void onResume() {
        super.onResume();
    }

    @Override
    protected void onPause() {
        super.onPause();
    }

    @Override
    public void beforeTextChanged(CharSequence s, int start, int count, int after) {
        // TODO Auto-generated method stub
    }

    @Override
    public void onTextChanged(CharSequence s, int start, int before, int count) {
        String newText = s.toString().trim();
        InputtipsQuery inputquery = new InputtipsQuery(newText, city);
        inputquery.setCityLimit(true);
        Inputtips inputTips = new Inputtips(MapKeywordsSearchActivity.this, inputquery);
        inputTips.setInputtipsListener(this);
        inputTips.requestInputtipsAsyn();
    }

    @Override
    public void afterTextChanged(Editable s) {
        // TODO Auto-generated method stub
    }

    /**
     * 输入提示结果的回调
     *
     * @param tipList
     * @param rCode
     */
    @Override
    public void onGetInputtips(final List<Tip> tipList, int rCode) {
        if (rCode == AMapException.CODE_AMAP_SUCCESS) {
            if (tipList != null) {
                mData.clear();
                for (Tip tip : tipList) {
                    if (tip != null && tip.getPoint() != null && !TextUtils.isEmpty(tip.getAddress())) {
                        mData.add(tip);
                    }
                }
                mAdapter.notifyDataSetChanged();
            }
        } else {
            KLog.w("输入自动提示搜索失败：" + rCode);
        }
    }

    @Override
    public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
        Tip tip = mData.get(position);
        Intent intent = getIntent();
        intent.putExtra("AMap_Search_Result", tip);
        setResult(3001, intent);
        finish();
    }

    @Override
    public void onItemClick(BaseQuickAdapter adapter, View view, int position) {
        hideSoftKeyboard();
        Tip tip = mData.get(position);
        Intent intent = getIntent();
        intent.putExtra("AMap_Search_Result", tip);
        setResult(3001, intent);
        finish();
    }

    @Override
    public void onBackPressed() {
        super.onBackPressed();
        hideSoftKeyboard();
    }

    @Override
    public void onClick(View v) {
        switch (v.getId()) {
            case R.id.tv_cancel_search:
                hideSoftKeyboard();
                finish();
                break;
            case R.id.iv_clear_input:
                mKeywordText.setText("");
                break;
        }

    }
}
