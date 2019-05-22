package org.apache.cordova.image.activity;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.os.Bundle;
import android.support.v4.view.PagerAdapter;
import android.view.LayoutInflater;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.LinearLayout;

import com.bumptech.glide.Glide;
import com.bumptech.glide.request.animation.GlideAnimation;
import com.bumptech.glide.request.target.SimpleTarget;
import com.citymobi.fufu.R;

import org.apache.cordova.image.view.ChangeViewCallback;
import org.apache.cordova.image.view.MeityitianViewPager;

import uk.co.senab.photoview.PhotoView;
import uk.co.senab.photoview.PhotoViewAttacher;

public class ImageBrowseActivity extends Activity {

    private MeityitianViewPager search_viewpager;

    private ImageBrowseAdapter imageAdapter;

    private LinearLayout linearLayout;

    private String[] images = {"http://120.24.153.50/cb_hrms/upload/6A71C3A9-62AC-4D33-85A7F4849E96E723.png","http://120.24.153.50/cb_hrms/upload/C7D0983E-0697-4647-B5428487C6E6994E.png","http://120.24.153.50/cb_hrms/upload/C84F1725-C997-45B6-BD663C0EC9514E87.png"};

//    @Override
//    public void onAttachedToWindow() {
//        super.onAttachedToWindow();
//        Window window = getWindow();
//        window.setFormat(PixelFormat.RGBA_8888);
//    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        setContentView(R.layout.activity_image_browse);

        linearLayout = (LinearLayout)this.findViewById(R.id.linearlayout);

        search_viewpager = (MeityitianViewPager) this.findViewById(R.id.imgs_browse_viewpager);
        search_viewpager.setOffscreenPageLimit(0);
        search_viewpager.setPageMargin(10);
        ChangeViewCallback callback = new ChangeViewCallback() {
            @Override
            public void changeView(boolean left, boolean right) {

            }

            @Override
            public void getCurrentPageIndex(int index) {
                for (int b = 0;b < images.length;b++){
                    if (index == b) {
                        linearLayout.getChildAt(b).setSelected(true);
                    } else {
                        linearLayout.getChildAt(b).setSelected(false);
                    }
                }
            }
        };

        search_viewpager.setChangeViewCallback(callback);
        imageAdapter = new ImageBrowseAdapter(this,images);
        search_viewpager.setAdapter(imageAdapter);
        search_viewpager.setCurrentItem(0);

        initDots(images.length);

    }

    //将点添加到linearlayout中
    private void initDots(int count){
        for (int j = 0; j < count; j++) {
            linearLayout.addView(initDot());
        }
        linearLayout.getChildAt(0).setSelected(true);
    }

    //图上浏览中的点
    private View initDot(){
        return LayoutInflater.from(getApplicationContext()).inflate(R.layout.image_brow_dot, null);
    }

    @Override
    public void onBackPressed() {
        super.onBackPressed();
        closeActivity();
    }

    @Override
    public boolean onTouchEvent(MotionEvent event) {
//        return super.onTouchEvent(event);
        this.finish();
        return true;
    }

    @Override
    public void finish() {
//        overridePendingTransition(0,R.anim.activity_browse_animation_exit);
        super.finish();
    }

    @Override
    protected void onPause() {
        super.onPause();
    }

    private void closeActivity() {
        Glide.get(ImageBrowseActivity.this).clearMemory();
        Intent intent = new Intent();
        setResult(1000410,intent);
        ImageBrowseActivity.this.finish();
    }

    class ImageBrowseAdapter extends PagerAdapter {
        PhotoViewAttacher mAttacher;
        private Context context;
        private String[] imagePath;

        public ImageBrowseAdapter(Context context, String[] urls) {
            this.context = context;
            this.imagePath = urls;
        }

        @Override
        public int getCount() {
            return imagePath.length;
        }

        @Override
        public boolean isViewFromObject(View view, Object o) {
            return view == o;
        }

        @Override
        public void destroyItem(ViewGroup view, int position, Object object) {

            PhotoView image = (PhotoView)object;
//
//            if (image != null) {
////                Bitmap bitmap = ((BitmapDrawable) image.getDrawable()).getBitmap();
////                if (bitmap != null) {
////                    bitmap.recycle();
////                }
//                image = null;
//            }
            view.removeView((PhotoView) object);
            view = null;
        }

        @Override
        public Object instantiateItem(ViewGroup view, int position) {
            final PhotoView imageView = new PhotoView(context);
            imageView.setScaleType(ImageView.ScaleType.FIT_CENTER);

            imageView.setOnPhotoTapListener(new PhotoViewAttacher.OnPhotoTapListener() {
                @Override
                public void onPhotoTap(View view, float x, float y) {
                closeActivity();
                }
            });

//            final ProgressDialog dialog = ProgressDialog.show(ImageBrowseActivity.this, "",
//                    "", true);
//            dialog.show();
             SimpleTarget target = new SimpleTarget<Bitmap>() {
                @Override
                public void onResourceReady(Bitmap bitmap, GlideAnimation glideAnimation) {
                    imageView.setImageBitmap(bitmap);
//                    dialog.hide();

                }
            };

            view.addView(imageView);

            Glide.with(context)
                    .load(imagePath[position])
                    .asBitmap()
                    .skipMemoryCache(true)
                    .error(R.drawable.friends_sends_pictures_no)
                    .into(target);
            return imageView;
        }
    }

}
