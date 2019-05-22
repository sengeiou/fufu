package org.apache.cordova.image;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;

/**
 * Created by shangzh on 16/9/6.
 */
public class ImageCompress {

    private Bitmap compressImage(Bitmap image) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        image.compress(Bitmap.CompressFormat.JPEG,100,baos);//质量压缩方法，这里100表示不压缩，把压缩后的数据存放到baos中
        int options = 100;
        while (baos.toByteArray().length/1024 > 100) {
            baos.reset();
            options -= 10;
            image.compress(Bitmap.CompressFormat.JPEG,options,baos);
        }
        ByteArrayInputStream isBm = new ByteArrayInputStream(baos.toByteArray());
        Bitmap bitmap = BitmapFactory.decodeStream(isBm,null,null);
        return bitmap;
    }

    private Bitmap getImage (String srcPath) {
        BitmapFactory.Options newopts = new BitmapFactory.Options();
        newopts.inJustDecodeBounds = true;
        Bitmap bitmap = BitmapFactory.decodeFile(srcPath,newopts);
        newopts.inJustDecodeBounds = false;
        int w = newopts.outWidth;
        int h = newopts.outHeight;
        float hh = 800f;
        float ww = 480f;
        int be =1;
        if (w > h && w > ww) {
            be = (int) (newopts.outWidth / ww);
        } else  if (w < h && h > hh) {
            be = (int) (newopts.outHeight / hh);
        }

        if (be <= 0) {
            be = 1;
        }
        newopts.inSampleSize = be;
        bitmap = BitmapFactory.decodeFile(srcPath,newopts);

        return compressImage(bitmap);

    }

//    public static File saveImage(Bitmap bmp) {
//        File appDir = new File(Environment.getExternalStorageDirectory(), "Boohee");
//        if (!appDir.exists()) {
//            appDir.mkdir();
//        }
//        String fileName = System.currentTimeMillis() + ".jpg";
//        File file = new File(appDir, fileName);
//        try {
//            FileOutputStream fos = new FileOutputStream(file);
//            bmp.compress(Bitmap.CompressFormat.JPEG,100,fos);
//            fos.flush();
//            fos.close();
//        } catch (FileNotFoundException e) {
//            e.printStackTrace();
//        } catch (IOException e) {
//            e.printStackTrace();
//        }
//    }

}
