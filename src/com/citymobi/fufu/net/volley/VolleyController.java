package com.citymobi.fufu.net.volley;

import android.content.Context;
import android.text.TextUtils;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.toolbox.ImageLoader;
import com.android.volley.toolbox.Volley;

/**
 * Created by Jason<p/>
 * Usage:<p/>
 * VolleyStringRequest request = new VolleyStringRequest(...);<p/>
 * VolleyController.getInstance(activity).addToQueue(request);<p/>
 */
public class VolleyController {

    private static VolleyController INSTANCE;
    private RequestQueue mRequestQueue;
    private ImageLoader mImageLoader;
    private static boolean isEncryptKey = true;

    /**
     * Log or global request TAG
     */
    private static final String TAG = "VolleyPattern";

    /**
     * Gain the instance of VolleyHub class
     *
     * @param context Context
     * @return The instance of this class
     */
    public static VolleyController getInstance(Context context) {
        if (INSTANCE == null) {
            synchronized (VolleyController.class) {
                if (INSTANCE == null) {
                    INSTANCE = new VolleyController(context);
                }
            }
        }
        return INSTANCE;
    }

    /**
     * Gain the instance of VolleyHub class
     *
     * @param context     Context
     * @param isEncrypted Set whether to encrypt the key when loading the image, default is true;
     * @return The instance of this class
     */
    public static VolleyController getInstance(Context context, boolean isEncrypted) {
        if (INSTANCE == null) {
            synchronized (VolleyController.class) {
                if (INSTANCE == null) {
                    isEncryptKey = isEncrypted;
                    INSTANCE = new VolleyController(context);
                }
            }
        }
        return INSTANCE;
    }

    /**
     * Add request instance to the queue
     *
     * @param request The request instance you want to add to the queue
     */
    public void addToQueue(Request<?> request) {
        addToQueue(request, null);
    }

    /**
     * Add request instance to the queue and specify a tag
     *
     * @param request The request instance you want to add to the queue
     * @param tag     The tag you wanna specify for the request
     */
    public void addToQueue(Request<?> request, String tag) {
        if (tag != null) {
            request.setTag(TextUtils.isEmpty(tag) ? TAG : tag);
        }
        mRequestQueue.add(request);
    }

    /**
     * Cancels all pending requests by the specified TAG, it is important
     * to specify a TAG so that the pending/ongoing requests can be cancelled.
     *
     * @param tag The tag you labeled the request when you add to the queue
     */
    public void cancelPendingRequests(Object tag) {
        if (mRequestQueue != null) {
            mRequestQueue.cancelAll(tag);
        }
    }

    /**
     * Cancels all pending requests with default TAG
     */
    public void cancelPendingRequests() {
        if (mRequestQueue != null) {
            mRequestQueue.cancelAll(TAG);
        }
    }

    /**
     * Get the request queue that in volley
     *
     * @return the request queue in volley
     */
    public RequestQueue getRequestQueue() {
        return mRequestQueue;
    }

    /**
     * Get the image loader that in volley
     *
     * @return the image loader in volley
     */
    public ImageLoader getImageLoader() {
        return mImageLoader;
    }

    /**
     * The constructor will also initialize the ImageCache for ImageLoader
     *
     * @param context Context
     */
    private VolleyController(final Context context) {
        mRequestQueue = Volley.newRequestQueue(context.getApplicationContext());

//        mImageLoader = new ImageLoader(mRequestQueue, new ImageLoader.ImageCache() {
//            private FileUtils fileUtils = new FileUtils(context, FileUtils.EXTERNAL_CACHE, TAG);
//
//            private LruCache<String, Bitmap> memoryCache = new LruCache<String, Bitmap>(15 * 1024 * 1024) {
//                protected int sizeOf(String key, Bitmap value) {
//                    return value.getRowBytes() * value.getHeight();
//                }
//            };
//
//            @Override
//            public void putBitmap(String url, Bitmap bitmap) {
//                String key = MD5Utils.get32bitsMD5(url, MD5Utils.ENCRYPTION_A);
//                memoryCache.put((isEncryptKey && key != null) ? key : url, bitmap);
//                fileUtils.saveBitmap(key, bitmap);
//            }
//
//            @Override
//            public Bitmap getBitmap(String url) {
//                String key = MD5Utils.get32bitsMD5(url, MD5Utils.ENCRYPTION_A);
//                Bitmap bitmap = memoryCache.get((isEncryptKey && key != null) ? key : url);
//                if (bitmap == null) {
//                    bitmap = fileUtils.readBitmap(key);
//                }
//                return bitmap;
//            }
//        });
    }
}
