package org.apache.cordova.image.activity;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.Point;
import android.graphics.drawable.BitmapDrawable;
import android.os.Bundle;
import android.support.v4.view.PagerAdapter;
import android.text.TextUtils;
import android.view.View;
import android.view.ViewGroup;
import android.view.animation.Animation;
import android.view.animation.TranslateAnimation;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import com.citymobi.fufu.R;
import com.citymobi.fufu.utils.ImageUtil;

import org.apache.cordova.image.NativeImageLoader;
import org.apache.cordova.image.model.DetailImageBean;
import org.apache.cordova.image.view.ChangeViewCallback;
import org.apache.cordova.image.view.MeityitianViewPager;

import java.util.ArrayList;
import java.util.List;

import uk.co.senab.photoview.PhotoView;
import uk.co.senab.photoview.PhotoViewAttacher;

/**
 * 大图展示界面
 */
public class ShwoDetailTwoActivity extends Activity {

    private MeityitianViewPager search_viewpager;

    private List<String> imgs = new ArrayList<String>();

    private List<String> list = new ArrayList<String>();

    private TextView titleView;

    private List<Integer> selectList;

    private TextView checkImageBtn;

    private int curtentPage;

    private int selectCount;

    private ImageBrowseAdapter imageAdapter;

    private Point mPoint = new Point(0, 0);//用来封装ImageView的宽和高的对象

    private Context context;

    private ImageView right_check_View;

    private FrameLayout imageDetailTwoTopBar;

    private FrameLayout imageDetailTwoBottomBar;

    //是否执行过动画
    private boolean isMove = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {

        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_shwo_detail_two);

        initData();

        context = this;

        right_check_View = (ImageView) findViewById(R.id.right_check_View);

        //getXxxExtra方法获取Intent传递过来的数据
//        list = getIntent().getStringArrayListExtra("data");
//        this.imgs = getIntent().getStringArrayListExtra("data");

        selectList = getIntent().getIntegerArrayListExtra("selectList");

        curtentPage = (int) (getIntent().getLongExtra("curtentIndex", 0));

        selectCount = getIntent().getIntExtra("selectCount", 0);

        ImageView back = (ImageView) findViewById(R.id.left_btn);
        back.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                close(1004);
            }
        });

        imageDetailTwoTopBar = (FrameLayout) findViewById(R.id.imageDetailTwoTopBar);

        imageDetailTwoBottomBar = (FrameLayout) findViewById(R.id.imageDetailTwoBottomBar);

        titleView = (TextView) findViewById(R.id.imageDetailTitle);
        titleView.setText((curtentPage + 1) + "/" + list.size());


        search_viewpager = (MeityitianViewPager) this.findViewById(R.id.imgs_viewpager);
        search_viewpager.setOffscreenPageLimit(0);
        search_viewpager.setPageMargin(10);
        ChangeViewCallback callback = new ChangeViewCallback() {
            @Override
            public void changeView(boolean left, boolean right) {

            }

            @Override
            public void getCurrentPageIndex(int index) {
                titleView.setText((index + 1) + "/" + list.size());
                curtentPage = index;
                for (int i = 0; i < selectList.size(); i++) {
                    if (index == selectList.get(i)) {
                        right_check_View.setImageResource(R.drawable.selected);
                        right_check_View.setSelected(true);
                        break;
                    } else {
                        right_check_View.setImageResource(R.drawable.unselect);
                        right_check_View.setSelected(false);
                    }
                }
            }
        };

        ChangeViewCallback scrollCallback = new ChangeViewCallback() {
            @Override
            public void changeView(boolean left, boolean right) {
                if (isMove) {
                    frameLayoutAnimation(imageDetailTwoTopBar, 0, 140, 0);
                    frameLayoutBottomAnimation(imageDetailTwoBottomBar, 0, -140, 0);
                    isMove = false;
                }
            }

            @Override
            public void getCurrentPageIndex(int index) {
            }
        };

        search_viewpager.setChangeViewCallback(callback);
        search_viewpager.setScrollViewCallback(scrollCallback);

        imageAdapter = new ImageBrowseAdapter(this, imgs);
        search_viewpager.setAdapter(imageAdapter);
        search_viewpager.setCurrentItem(curtentPage);

        right_check_View.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (!v.isSelected()) {  //选中
                    if (selectList.size() == (9 - selectCount)) {
                        Toast.makeText(context, "您已选择9张图片", Toast.LENGTH_SHORT).show();
                    } else {
                        v.setSelected(true);
                        right_check_View.setImageResource(R.drawable.selected);
                        selectList.add(curtentPage);
                    }
                } else {  //取消
                    v.setSelected(false);
                    right_check_View.setImageResource(R.drawable.unselect);

                    for (int a = 0; a < selectList.size(); a++) {
                        if (curtentPage == selectList.get(a)) {
                            selectList.remove(a);
                            break;
                        }
                    }
                }
                checkImageBtn.setText("完成(" + selectList.size() + "/" + (9 - selectCount) + ")");
            }
        });

        checkImageBtn = (TextView) findViewById(R.id.checkImageBtn);

        checkImageBtn.setText("完成(" + selectList.size() + "/" + (9 - selectCount) + ")");
        checkImageBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                close(1005);
            }
        });

        //判断是否有已经选中的图片，选中图片打勾
        for (int a = 0; a < selectList.size(); a++) {
            if (selectList.get(a) == curtentPage) {
                right_check_View.setImageResource(R.drawable.selected);
                right_check_View.setSelected(true);
            }
        }
    }

    /**
     * 初始化数据
     */
    private void initData() {
        // 照片分组名，如果为null获取全部图片，反之获取对应分组图片
        String groupName = getIntent().getStringExtra("imgGroupName");
        List<DetailImageBean> data;
        if (!TextUtils.isEmpty(groupName)) {// 按组获取图片
            data = ImageUtil.getDetailImageBeanData(groupName);
        } else {// 获取全部图片
            data = ImageUtil.getAllImgs();
        }
        if (data != null) {
            for (DetailImageBean detailImageBean : data) {
                list.add(detailImageBean.getFilePath());
            }
            imgs = list;
        }
    }

    @Override
    public void onBackPressed() {
        backData(1004);
        super.onBackPressed();
    }

    private void backData(int requestCode) {

        Intent intent = new Intent();
        if (selectList == null) {
            intent.putIntegerArrayListExtra("data", new ArrayList<Integer>());
        } else {
            intent.putIntegerArrayListExtra("data", (ArrayList<Integer>) selectList);
        }
                /*
                 * 调用setResult方法表示我将Intent对象返回给之前的那个Activity，这样就可以在onActivityResult方法中得到Intent对象，
                 */
        intent.putExtra("curtentPage", curtentPage);
        setResult(requestCode, intent);
    }

    private void close(int requestCode) {
        backData(requestCode);

        this.finish();
    }

    class ImageBrowseAdapter extends PagerAdapter {
        PhotoViewAttacher mAttacher;
        private Context context;
        private List<String> imagePath;

        public ImageBrowseAdapter(Context context, List<String> urls) {
            this.context = context;
            this.imagePath = urls;
        }

        @Override
        public int getCount() {
            return imagePath.size();
        }

        @Override
        public boolean isViewFromObject(View view, Object o) {
            return view == o;
        }

        @Override
        public void destroyItem(ViewGroup view, int position, Object object) {
            if (position < imgs.size()) {
                NativeImageLoader.getInstance().removeBitmapToMemoryCache(imgs.get(position));
            }
            if (position + 1 < imgs.size()) {
                NativeImageLoader.getInstance().removeBitmapToMemoryCache(imgs.get(position + 1));
            }
            PhotoView image = (PhotoView) object;

            if (image != null) {
                Bitmap bitmap = ((BitmapDrawable) image.getDrawable()).getBitmap();
                if (bitmap != null) {
                    bitmap.recycle();
                }
                image = null;
            }
            view.removeView((PhotoView) object);
            view = null;
        }

        @Override
        public Object instantiateItem(ViewGroup view, int position) {
            final PhotoView imageView = new PhotoView(context);
            imageView.setScaleType(ImageView.ScaleType.CENTER_CROP);
            imageView.setMaximumScale(2);
            //以400*400做为图片大小默认值来压缩
            mPoint.set(400, 400);

            imageView.setOnPhotoTapListener(new PhotoViewAttacher.OnPhotoTapListener() {
                @Override
                public void onPhotoTap(View view, float x, float y) {

                    if (isMove) {
                        frameLayoutAnimation(imageDetailTwoTopBar, 0, 140, 0);
                        frameLayoutBottomAnimation(imageDetailTwoBottomBar, 0, -140, 0);
                        isMove = false;
                    } else {
                        frameLayoutAnimation(imageDetailTwoTopBar, -140, 0, 0);
                        frameLayoutBottomAnimation(imageDetailTwoBottomBar, 140, 0, 0);
                        isMove = true;
                    }
                }
            });

            Bitmap bitmap = NativeImageLoader.getInstance().loadOneNativeImage(imgs.get(position), mPoint);
            imageView.setImageBitmap(bitmap);
            view.addView(imageView);
            return imageView;
        }
    }

    public void frameLayoutAnimation(final FrameLayout frameLayout, final int topValue, final int bottomValue, final float density) {
        //初始化

        if (bottomValue != 0) {
            FrameLayout.LayoutParams btnLp = (FrameLayout.LayoutParams) frameLayout.getLayoutParams();
            btnLp.setMargins(0, -140, 0, 0);
            frameLayout.requestLayout();
            frameLayout.setVisibility(View.VISIBLE);
        }

        Animation translateAnimation = null;
        if (topValue != 0) {
            translateAnimation = new TranslateAnimation(0, 0, 0, topValue);
        } else {
            translateAnimation = new TranslateAnimation(0, 0, 0, bottomValue);
        }

        translateAnimation.setDuration(500);

        frameLayout.startAnimation(translateAnimation);

        translateAnimation.setAnimationListener(new Animation.AnimationListener() {
            @Override
            public void onAnimationStart(Animation animation) {

            }

            @Override
            public void onAnimationEnd(Animation animation) {
                if (topValue != 0) {
                    frameLayout.setVisibility(View.INVISIBLE);
                }

                if (bottomValue != 0) {
                    FrameLayout.LayoutParams btnLp = (FrameLayout.LayoutParams) frameLayout.getLayoutParams();
                    btnLp.setMargins(0, 0, 0, 0);
                    frameLayout.requestLayout();
                }
                frameLayout.clearAnimation();
            }

            @Override
            public void onAnimationRepeat(Animation animation) {

            }
        });

    }

    public void frameLayoutBottomAnimation(final FrameLayout frameLayouttwo, final int topValue, final int bottomValue, final float density) {
        //初始化
        Animation translateAnimationTwo = null;
        if (topValue != 0) {
            translateAnimationTwo = new TranslateAnimation(0, 0, 0, topValue);
        } else {
            translateAnimationTwo = new TranslateAnimation(0, 0, 0, bottomValue);
        }

        if (bottomValue != 0) {
            FrameLayout.LayoutParams btnLp = (FrameLayout.LayoutParams) frameLayouttwo.getLayoutParams();
            btnLp.setMargins(0, 0, 0, -140);
            frameLayouttwo.requestLayout();
            frameLayouttwo.setVisibility(View.INVISIBLE);
        }

        translateAnimationTwo.setDuration(500);
        frameLayouttwo.startAnimation(translateAnimationTwo);
        frameLayouttwo.getAnimation().setAnimationListener(new Animation.AnimationListener() {
            @Override
            public void onAnimationStart(Animation animation) {

            }

            @Override
            public void onAnimationEnd(Animation animation) {
                frameLayouttwo.clearAnimation();
                if (topValue != 0) {
                    frameLayouttwo.setVisibility(View.INVISIBLE);
                }

                if (bottomValue != 0) {
                    FrameLayout.LayoutParams btnLp = (FrameLayout.LayoutParams) frameLayouttwo.getLayoutParams();
                    btnLp.setMargins(0, 0, 0, 0);
                    frameLayouttwo.requestLayout();
                    frameLayouttwo.setVisibility(View.VISIBLE);
                }
            }

            @Override
            public void onAnimationRepeat(Animation animation) {

            }
        });

    }

}