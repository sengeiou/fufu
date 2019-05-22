package com.citymobi.fufu;

import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.text.TextUtils;

import com.citymobi.fufu.application.FuFuApplication;
import com.socks.library.KLog;
import com.umeng.analytics.MobclickAgent;

import org.apache.cordova.CordovaActivity;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Enumeration;
import java.util.zip.ZipEntry;
import java.util.zip.ZipException;
import java.util.zip.ZipFile;

import cn.jpush.android.api.JPushInterface;

public class MainActivity extends CordovaActivity {

    //当前版本
    private String currentVersion = "";
    //上一版本
    private String lastVersion = null;

    private static final String FILE_PATH = FuFuApplication.getmInstance().getFilesDir().getPath();
    private static final String ZIP_FILE_PATH = FILE_PATH + "/www.zip";

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        KLog.d(launchUrl);
        loadUrl(launchUrl);
        checkVersionUpdate();

        KLog.d("JPush token " + JPushInterface.getRegistrationID(this));
    }

    /**
     * 检查版本更新
     */
    private void checkVersionUpdate() {
        try {
            currentVersion = getPackageManager().getPackageInfo(getPackageName(), 0).versionName;
        } catch (PackageManager.NameNotFoundException e) {
            e.printStackTrace();
        }
        SharedPreferences settings = getSharedPreferences("setting", MODE_APPEND);
        final SharedPreferences.Editor editor = settings.edit();
        lastVersion = settings.getString("VERSION", null);
        if (TextUtils.isEmpty(lastVersion) || !currentVersion.equals(lastVersion)) {
            new Thread(new Runnable() {
                @Override
                public void run() {
                    fileCheck();
                    copyFile(0, editor);
                }
            }).start();
        }
    }

    @Override
    protected void onStart() {
        super.onStart();
    }

    @Override
    protected void onResume() {
        super.onResume();
        JPushInterface.onResume(this);
        MobclickAgent.onResume(this);
    }

    @Override
    protected void onPause() {
        super.onPause();
        JPushInterface.onPause(this);
        MobclickAgent.onPause(this);
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
    }

    //判断www.zip是否存在
    private void fileCheck() {
        File exitFile = new File(ZIP_FILE_PATH);
        if (exitFile.exists()) {
            exitFile.delete();
        }
    }

    /**
     * 复制文件
     *
     * @param a
     * @param editor
     */
    private void copyFile(int a, SharedPreferences.Editor editor) {

        try {
            if (a != 2) {
                InputStream inputStream = getAssets().open("www.zip");
                FileOutputStream fos = new FileOutputStream(new File(ZIP_FILE_PATH));
                byte[] buffer = new byte[1024];
                int byteCount = 0;
                while ((byteCount = inputStream.read(buffer)) != -1) {//循环从输入流读取 buffer字节
                    fos.write(buffer, 0, byteCount);//将读取的输入流写入到输出流
                }
                fos.flush();//刷新缓冲区
                inputStream.close();
                fos.close();
            }

            try {
                upZipFile(new File(ZIP_FILE_PATH), FILE_PATH);
            } catch (Exception e) {
                e.printStackTrace();
                KLog.w(e.toString());
                copyFile(2, editor);
            }

            //存入数据
            editor.putString("VERSION", currentVersion);

            editor.putBoolean("isCopy", true);

            editor.commit();

        } catch (Exception e) {
            e.printStackTrace();

            editor.putString("VERSION", lastVersion);

            editor.putBoolean("isCopy", false);

            editor.commit();

            fileCheck();
            if (a == 0) {
                copyFile(1, editor);
            }
        }

    }

    /**
     * 解压文件
     *
     * @param zipFile
     * @param folderPath
     * @throws ZipException
     * @throws IOException
     */
    public static void upZipFile(File zipFile, String folderPath) throws IOException {
        File desDir = new File(folderPath);
        if (!desDir.exists()) {
            desDir.mkdirs();
        }

        ZipFile zf = new ZipFile(zipFile);
        for (Enumeration<?> entries = zf.entries(); entries.hasMoreElements(); ) {
            ZipEntry entry = ((ZipEntry) entries.nextElement());
            if (entry.isDirectory()) {
                continue;
            }

            InputStream in = zf.getInputStream(entry);
            String str = folderPath + File.separator + entry.getName();
            KLog.d(str);
            str = new String(str.getBytes(), "utf-8");
            File desFile = new File(str);
            if (!desFile.exists()) {
                File fileParentDir = desFile.getParentFile();
                if (!fileParentDir.exists()) {
                    fileParentDir.mkdirs();
                }
                desFile.createNewFile();
            }
            OutputStream out = new FileOutputStream(desFile);
            byte buffer[] = new byte[1024];
            int realLength;
            while ((realLength = in.read(buffer)) > 0) {
                out.write(buffer, 0, realLength);
            }
            in.close();
            out.close();
        }
    }
}
