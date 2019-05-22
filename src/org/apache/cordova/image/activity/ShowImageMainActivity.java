package org.apache.cordova.image.activity;

import android.app.Activity;
import android.app.ProgressDialog;
import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.view.View;
import android.widget.AdapterView;
import android.widget.GridView;
import android.widget.ImageView;
import android.widget.TextView;

import com.bumptech.glide.Glide;
import com.citymobi.fufu.R;
import com.citymobi.fufu.utils.ImageUtil;

import org.apache.cordova.image.adapter.GroupAdapter;
import org.apache.cordova.image.model.ImageBean;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

/**
 * 自定义相册界面，将照片按组展示
 */
public class ShowImageMainActivity extends Activity {

    private HashMap<String, List<String>> mGruopMap = new HashMap<String, List<String>>();
    private List<ImageBean> list = new ArrayList<ImageBean>();
    private final static int SCAN_OK = 1;
    private ProgressDialog mProgressDialog;
    private GroupAdapter adapter;
    private GridView mGroupGridView;

    private String path;

    private int selectCount;

    //前端传过来的url
    private String url;

    private Handler mHandler = new Handler() {

        @Override
        public void handleMessage(Message msg) {
            super.handleMessage(msg);
            switch (msg.what) {
                case SCAN_OK:
                    //关闭进度条
                    mProgressDialog.dismiss();

                    adapter = new GroupAdapter(ShowImageMainActivity.this, list = subGroupOfImage(mGruopMap), mGroupGridView);
                    mGroupGridView.setAdapter(adapter);
                    break;
            }
        }

    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_show_image_main);

        selectCount = getIntent().getIntExtra("selectCount", 0);

        ImageView back = (ImageView) findViewById(R.id.left_btn);
        back.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                backData("");
            }
        });

        TextView selected = (TextView) findViewById(R.id.right_text);
        selected.setVisibility(View.INVISIBLE);

        TextView titleView = (TextView) findViewById(R.id.title);
        titleView.setText("相册");

        mGroupGridView = (GridView) findViewById(R.id.main_grid);

        getImages();

        mGroupGridView.setOnItemClickListener(new AdapterView.OnItemClickListener() {

            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                // img分组名称
                String imgGroupName = list.get(position).getFolderName();
                Intent mIntent = new Intent(ShowImageMainActivity.this, ShowAllImageActivity.class);
                mIntent.putExtra("imgGroupName", imgGroupName);
                mIntent.putExtra("selectCount", selectCount);
                startActivityForResult(mIntent, 1000);
                // 当前Acitivity销毁后，启动它的界面应该刷新，此逻辑放到4.0版本优化
                // 2017年4月19日
            }
        });

    }

    /**
     * 利用ContentProvider扫描手机中的图片，此方法在运行在子线程中
     */
    private void getImages() {
        //显示进度条
        mProgressDialog = ProgressDialog.show(this, null, "正在加载...");
        new Thread(new Runnable() {

            @Override
            public void run() {
                mGruopMap = ImageUtil.getImgsByGroup();
                //通知Handler扫描图片完成
                mHandler.sendEmptyMessage(SCAN_OK);
            }
        }).start();
    }

    private List<ImageBean> subGroupOfImage(HashMap<String, List<String>> mGruopMap) {
        if (mGruopMap.size() == 0) {
            return null;
        }
        List<ImageBean> list = new ArrayList<ImageBean>();

        Iterator<Map.Entry<String, List<String>>> it = mGruopMap.entrySet().iterator();
        while (it.hasNext()) {
            Map.Entry<String, List<String>> entry = it.next();
            ImageBean mImageBean = new ImageBean();
            String key = entry.getKey();
            List<String> value = entry.getValue();

            mImageBean.setFolderName(key);
            mImageBean.setImageCounts(value.size());
            mImageBean.setTopImagePath(value.get(0));//获取该组的第一张图片

            list.add(mImageBean);
        }

        return list;
    }

    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (data == null) {
            return;
        }
        String path = data.getStringExtra("path");
        backData(path);
    }

    @Override
    public void onBackPressed() {
        Glide.get(ShowImageMainActivity.this).clearMemory();
        backData("");
        super.onBackPressed();
    }

    private void backData(String path) {
        Glide.get(ShowImageMainActivity.this).clearMemory();
        Intent intent = new Intent();
        intent.putExtra("path", path);
                /*
                 * 调用setResult方法表示我将Intent对象返回给之前的那个Activity，这样就可以在onActivityResult方法中得到Intent对象，
                 */

        setResult(10404, intent);
        finish();
    }


    @Override
    protected void onStop() {
        super.onStop();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        mGroupGridView.setAdapter(null);
    }

}
