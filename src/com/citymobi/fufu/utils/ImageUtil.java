package com.citymobi.fufu.utils;

import android.content.ContentResolver;
import android.database.Cursor;
import android.net.Uri;
import android.provider.MediaStore;

import com.citymobi.fufu.application.FuFuApplication;
import com.socks.library.KLog;

import org.apache.cordova.image.model.DetailImageBean;

import java.io.File;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

/**
 * <pre>
 *     author : ZhongQuan
 *     e-mail : xxx@xx
 *     time   : 2017/04/19
 *     desc   :
 *     version: 3.0
 * </pre>
 */
public class ImageUtil {

    /**
     * 获取手机所有图片
     *
     * @return
     */
    public static ArrayList<DetailImageBean> getAllImgs() {
        ArrayList<DetailImageBean> imgList = new ArrayList<DetailImageBean>();

        Uri mImageUri = MediaStore.Images.Media.EXTERNAL_CONTENT_URI;
        ContentResolver mContentResolver = FuFuApplication.getmInstance().getContentResolver();

        // 拼接查询sql，只查询jpeg和png的图片
        Cursor mCursor = mContentResolver.query(
                mImageUri,
                null,
                MediaStore.Images.Media.MIME_TYPE + "=? or " + MediaStore.Images.Media.MIME_TYPE + "=?",
                new String[]{"image/jpeg", "image/png"},
                MediaStore.Images.Media.DATE_MODIFIED);

        if (mCursor == null) {
            return imgList;
        }

        while (mCursor.moveToNext()) {
            //获取图片的路径
            String path = mCursor.getString(mCursor.getColumnIndex(MediaStore.Images.Media.DATA));
            // 文件存在才添加
            if (new File(path).exists()) {
                DetailImageBean detail = new DetailImageBean();
                detail.setFilePath(path);
                detail.setChecked(false);
                imgList.add(0, detail);
            } else {
                KLog.d(path);
            }
        }
        mCursor.close();

        return imgList;
    }


    /**
     * 获取分组后的图片路径集合
     *
     * @return
     */
    public static HashMap<String, List<String>> getImgsByGroup() {
        HashMap<String, List<String>> groupImgs = new HashMap<String, List<String>>();

        Uri mImageUri = MediaStore.Images.Media.EXTERNAL_CONTENT_URI;
        ContentResolver mContentResolver = FuFuApplication.getmInstance().getContentResolver();
        //只查询jpeg和png的图片
        Cursor mCursor = mContentResolver.query(
                mImageUri,
                null,
                MediaStore.Images.Media.MIME_TYPE + "=? or " + MediaStore.Images.Media.MIME_TYPE + "=?",
                new String[]{"image/jpeg", "image/png"},
                MediaStore.Images.Media.DATE_MODIFIED);

        if (mCursor == null) {
            return groupImgs;
        }

        while (mCursor.moveToNext()) {
            //获取图片的路径
            String path = mCursor.getString(mCursor.getColumnIndex(MediaStore.Images.Media.DATA));

            //获取该图片的父路径名
            String parentName = new File(path).getParentFile().getName();

            //根据父路径名将图片放入到mGruopMap中
            if (!groupImgs.containsKey(parentName)) {
                List<String> chileList = new ArrayList<String>();
                chileList.add(path);
                groupImgs.put(parentName, chileList);
            } else {
                groupImgs.get(parentName).add(path);
            }
        }
        mCursor.close();

        return groupImgs;
    }

    /**
     * 根据分组名获取对应图片对象列表
     *
     * @param groupName
     * @return
     */
    public static List<DetailImageBean> getDetailImageBeanData(String groupName) {
        List<DetailImageBean> data = new ArrayList<DetailImageBean>();
        List<String> strList = getImgsByGroup().get(groupName);
        if (strList != null) {
            for (String s : strList) {
                if (new File(s).exists()) {
                    DetailImageBean bean = new DetailImageBean();
                    bean.setFilePath(s);
                    bean.setChecked(false);
                    data.add(bean);
                }
            }
        }
        return data;
    }
}
