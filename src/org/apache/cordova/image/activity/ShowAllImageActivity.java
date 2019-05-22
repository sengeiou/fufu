package org.apache.cordova.image.activity;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.support.v4.app.ActivityCompat;
import android.text.TextUtils;
import android.view.View;
import android.widget.AdapterView;
import android.widget.GridView;
import android.widget.ImageView;
import android.widget.TextView;

import com.bumptech.glide.Glide;
import com.citymobi.fufu.R;
import com.citymobi.fufu.utils.ImageUtil;
import com.citymobi.fufu.widgets.CustomDialog;

import org.apache.cordova.image.adapter.ChildAdapter;
import org.apache.cordova.image.model.DetailImageBean;

import java.util.ArrayList;
import java.util.List;

/**
 * 多图展示界面，将照片全部展示以提供用户选择
 */
public class ShowAllImageActivity extends Activity {

    private GridView mGridView;
    private List<DetailImageBean> datalist = new ArrayList<DetailImageBean>();
    private ChildAdapter adapter;

    private ArrayList<Integer> selectedList = new ArrayList<Integer>();

    private int selectCount;

    private TextView uploadView;

    private String imgGroupName; // 相册分组名称

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_show_image);

        initData();

        ImageView back = (ImageView) findViewById(R.id.left_btn);
        back.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                close();
            }
        });

        TextView titleView = (TextView) findViewById(R.id.title);
        titleView.setText("相册");

        //隐藏右边按钮
        final TextView selected = (TextView) findViewById(R.id.right_text);
        selected.setVisibility(View.INVISIBLE);

        //将图片url返回到html
        uploadView = (TextView) findViewById(R.id.imageUploadView);
        uploadView.setText("完成(0/" + (9 - selectCount) + ")");
        uploadView.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (selectedList.size() == 0) {
                    for (Integer len : adapter.getSelectItems()) {
                        selectedList.add(len);
                    }
                }

                backData(true);
            }
        });

        mGridView = (GridView) findViewById(R.id.child_grid);

        adapter = new ChildAdapter(this, datalist, mGridView, selectCount, uploadView);
        mGridView.setAdapter(adapter);

        mGridView.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                Intent detail = new Intent(ShowAllImageActivity.this, ShwoDetailTwoActivity.class);
                detail.putExtra("curtentIndex", id);
                detail.putIntegerArrayListExtra("selectList", (ArrayList<Integer>) adapter.getSelectItems());
                detail.putExtra("selectCount", selectCount);  // 已选择了多少图片
                detail.putExtra("imgGroupName", imgGroupName);  // 照片分组名称
                startActivityForResult(detail, 1004);
            }

        });
    }

    /**
     * 初始化数据
     */
    private void initData() {
        selectCount = getIntent().getIntExtra("selectCount", 0);
        // 获取ShowImageMainActivity的相册分组名称
        imgGroupName = getIntent().getStringExtra("imgGroupName");
        if (!TextUtils.isEmpty(imgGroupName)) {
            datalist = ImageUtil.getDetailImageBeanData(imgGroupName);// 根据组名获取对应的图片
        }
        // 获取全部图片
        else {
            if (Build.VERSION.SDK_INT >= 23) {
                int hasWriteContactsPermission = checkSelfPermission(Manifest.permission.WRITE_EXTERNAL_STORAGE);
                if (hasWriteContactsPermission != PackageManager.PERMISSION_GRANTED) {
                    ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.WRITE_EXTERNAL_STORAGE}, PackageManager.PERMISSION_GRANTED);
                    return;
                }
            }
            datalist = ImageUtil.getAllImgs();
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        Glide.get(ShowAllImageActivity.this).clearMemory();
        //从详细页面返回时将所有图片置为false，根据返回数据来确定true
        for (int c = 0; c < datalist.size(); c++) {
            DetailImageBean bean = datalist.get(c);
            bean.setChecked(false);
        }

        //refresh gridView

        adapter.notifyDataSetChanged();
        mGridView.invalidate();
        //从文件选择目录返回
        if (requestCode == 10050) {
            String path = data.getStringExtra("path");
            Intent intent = new Intent();
            intent.putExtra("path", path);
                /*
                 * 调用setResult方法表示我将Intent对象返回给之前的那个Activity，这样就可以在onActivityResult方法中得到Intent对象，
                 */
            setResult(10050, intent);
            finish();
        } else if (requestCode == 1004) {  //从详细页面返回
            if (resultCode == 1004) {
                mGridView.setAdapter(adapter);
                int curtentPage = data.getIntExtra("curtentPage", 1);
                mGridView.setSelection(curtentPage);
                if (data.getIntegerArrayListExtra("data") != null && data.getIntegerArrayListExtra("data").size() > 0) {
                    selectedList = data.getIntegerArrayListExtra("data");

                    for (int a = 0; a < selectedList.size(); a++) {
                        DetailImageBean bean = datalist.get(selectedList.get(a));
                        bean.setChecked(true);
                        View view = mGridView.getChildAt(selectedList.get(a));
                        adapter.updateView(view, selectedList.get(a), true);
                    }
                    adapter.updateSelectItems(selectedList);
                }
                uploadView.setText("完成(" + selectedList.size() + "/" + (9 - selectCount) + ")");
            } else if (resultCode == 1005) {   //详细页面直接返回选择的url到html
                String path = "";

                if (data.getIntegerArrayListExtra("data") != null && data.getIntegerArrayListExtra("data").size() > 0) {
                    ArrayList<Integer> selectList2 = data.getIntegerArrayListExtra("data");
                    for (int b = 0; b < selectList2.size(); b++) {
                        if (b == 0) {
                            path += datalist.get(selectList2.get(b)).getFilePath().toString();
                        } else {
                            path += "," + datalist.get(selectList2.get(b)).getFilePath().toString();
                        }
                    }
                }

                Intent intent = new Intent();
                intent.putExtra("path", path);
                /*
                 * 调用setResult方法表示我将Intent对象返回给之前的那个Activity，这样就可以在onActivityResult方法中得到Intent对象，
                 */
                setResult(1001, intent);
                finish();
            }
        }
    }

    @Override
    public void onBackPressed() {
        backData(false);
        super.onBackPressed();
    }

    //返回到文件夹目录页面
    private void close() {
        Glide.get(ShowAllImageActivity.this).clearMemory();

        Intent mIntent = new Intent(ShowAllImageActivity.this, ShowImageMainActivity.class);
        mIntent.putExtra("selectCount", selectCount);
        startActivityForResult(mIntent, 10050);
//        finish();
    }

    private void backData(boolean flag) {
        Glide.get(ShowAllImageActivity.this).clearMemory();
        Intent intent = new Intent();
        List<Integer> list = adapter.getSelectItems();
        String path = "";
        for (int b = 0; b < list.size(); b++) {
            if (b == 0) {
                path += datalist.get(list.get(b)).getFilePath().toString();
            } else {
                path += "," + datalist.get(list.get(b)).getFilePath().toString();
            }
        }
        if (flag) {  //true 返回图片路径，false 关闭activity
            intent.putExtra("path", path);
        } else {
            intent.putExtra("path", "");
        }

        /*
         * 调用setResult方法表示我将Intent对象返回给之前的那个Activity，这样就可以在onActivityResult方法中得到Intent对象，
         */
        setResult(1001, intent);
        finish();
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
//        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == PackageManager.PERMISSION_GRANTED) {
            if (permissions[0].equals(Manifest.permission.WRITE_EXTERNAL_STORAGE)
                    && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                //用户同意使用write

                datalist = ImageUtil.getAllImgs();

                adapter = new ChildAdapter(this, datalist, mGridView, selectCount, uploadView);
                mGridView.setAdapter(adapter);
                adapter.notifyDataSetChanged();

                mGridView.setOnItemClickListener(new AdapterView.OnItemClickListener() {
                    @Override
                    public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                        ArrayList<String> filePath = new ArrayList<String>();
                        for (DetailImageBean bean : datalist) {
                            filePath.add(bean.getFilePath());
                        }
                        Intent detail = new Intent(ShowAllImageActivity.this, ShwoDetailTwoActivity.class);
                        detail.putExtra("curtentIndex", id);
                        detail.putStringArrayListExtra("data", (ArrayList<String>) filePath);
                        detail.putIntegerArrayListExtra("selectList", (ArrayList<Integer>) adapter.getSelectItems());
                        detail.putExtra("selectCount", selectCount);  //已选择了多少图片
                        startActivityForResult(detail, 1004);
                    }

                });

//            }

            } else {
                //用户不同意，向用户展示该权限作用
                final CustomDialog mDialog = CustomDialog.getCustomDialog(this);
                mDialog.setInfo(R.string.dialog_hint, R.string.request_storage_permission);
                mDialog.setConfirmText(R.string.confirm);
                mDialog.setListenerYes(new View.OnClickListener() {
                    @Override
                    public void onClick(View v) {
                        ActivityCompat.requestPermissions(ShowAllImageActivity.this, new String[]{Manifest.permission.WRITE_EXTERNAL_STORAGE},
                                PackageManager.PERMISSION_GRANTED);
                        mDialog.hideDialog();
                    }
                });
                mDialog.showDialog();

            }
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        mGridView.setAdapter(null);
    }

    @Override
    protected void onStop() {
        super.onStop();
//        mGridView.setAdapter(null);
    }


}