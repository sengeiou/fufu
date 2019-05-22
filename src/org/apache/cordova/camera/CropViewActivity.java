package org.apache.cordova.camera;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.widget.ImageView;
import android.widget.TextView;

import com.citymobi.fufu.R;
import com.oginotihiro.cropview.CropUtil;
import com.oginotihiro.cropview.CropView;
import com.socks.library.KLog;

import java.io.File;
import java.text.SimpleDateFormat;
import java.util.Date;

/**
 * 图片剪裁界面
 */
public class CropViewActivity extends Activity {

    private CropView cropView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_crop_view);

        TextView textTitle = (TextView) findViewById(R.id.title);
        textTitle.setText("截图");

        Uri uri = Uri.parse(getIntent().getStringExtra("uri"));
        int x = getIntent().getIntExtra("aspectX", 1);
        int y = getIntent().getIntExtra("aspectY", 1);
        int width = getIntent().getIntExtra("outputX", 400);
        int height = getIntent().getIntExtra("outputY", 400);
        cropView = (CropView) findViewById(R.id.cropView);
        cropView.of(uri)
                .withAspect(x, y)
                .withOutputSize(width, height)
                .initialize(CropViewActivity.this);

        final TextView crop = (TextView) findViewById(R.id.right_text);
        crop.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Bitmap croppedBitmap = cropView.getOutput();

                SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
                Date curDate = new Date(System.currentTimeMillis());//获取当前时间
                String str = formatter.format(curDate);

//                File imageFile = new File(getCacheDir(), str + ".png");
                File imageFile = new File(getExternalCacheDir(), str + ".png");
                KLog.i(imageFile.getAbsolutePath());
                if (imageFile.exists()) {
                    imageFile.delete();
                }

                Intent backData = getIntent();

//                Uri destination = Uri.fromFile(new File(getCacheDir(), str + ".png"));
                Uri destination = Uri.fromFile(new File(getExternalCacheDir(), str + ".png"));
                if (croppedBitmap != null) {
                    boolean saveSuccess = CropUtil.saveOutput(CropViewActivity.this, destination, croppedBitmap, 100);
                    if (saveSuccess) {
                        backData.putExtra("uri", destination.toString());
                    } else {
                        backData.putExtra("uri", "");
                    }
                } else {
                    backData.putExtra("uri", "");
                }
                setResult(10500, backData);
                finish();
            }
        });

        ImageView back = (ImageView) findViewById(R.id.left_btn);
        back.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                backImage();
            }
        });
    }

    @Override
    public void onBackPressed() {
        backImage();
        super.onBackPressed();
    }

    private void backImage() {
        Intent backData = new Intent();
        backData.putExtra("uri", "");
        setResult(10500, backData);
        finish();
    }
}
