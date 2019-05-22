package com.citymobi.fufu.utils;

import android.Manifest;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.location.LocationManager;
import android.net.Uri;
import android.os.Binder;
import android.os.Build;
import android.provider.Settings;
import android.support.annotation.NonNull;
import android.support.annotation.StringRes;
import android.support.v4.content.ContextCompat;
import android.view.View;

import com.citymobi.fufu.application.FuFuApplication;
import com.citymobi.fufu.widgets.CustomDialog;
import com.google.zxing.activity.CaptureActivity;

import org.apache.cordova.CordovaPlugin;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

/**
 * 权限管理
 * Created by ZhongQuan on 2017/2/21.
 */

public class PermissionManage {
    private static final String PACKAGE_NAME = FuFuApplication.getmInstance().getPackageName();

    /**
     * 打开权限提示框，进入应用详细设置
     *
     * @param cordovaPlugin
     * @param title
     * @param message
     */
    public static void openPermissionHint(final CordovaPlugin cordovaPlugin, String title, String message) {
        final CustomDialog mDialog = CustomDialog.getCustomDialog(cordovaPlugin.cordova.getActivity());
        mDialog.setInfo(title, message);
        mDialog.setListenerYes(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent localIntent = new Intent();
                localIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                localIntent.setAction("android.settings.APPLICATION_DETAILS_SETTINGS");
                localIntent.setData(Uri.fromParts("package", PACKAGE_NAME, null));
                cordovaPlugin.cordova.startActivityForResult(cordovaPlugin, localIntent, 0);
                mDialog.hideDialog();
            }
        });
        mDialog.showDialog();
    }


    public static void openPermissionHint(@NonNull CordovaPlugin cordovaPlugin, @StringRes int titleRes, @StringRes int msgRes) {
        openPermissionHint(cordovaPlugin, FuFuApplication.getmInstance().getString(titleRes), FuFuApplication.getmInstance().getString(msgRes));
    }

    public static void openPermissionHint(@NonNull final Activity activity, @StringRes int titleRes, @StringRes int msgRes) {
        final CustomDialog mDialog = CustomDialog.getCustomDialog(activity);
        mDialog.setInfo(FuFuApplication.getmInstance().getString(titleRes), FuFuApplication.getmInstance().getString(msgRes));
        mDialog.setListenerYes(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent localIntent = new Intent();
                localIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                localIntent.setAction("android.settings.APPLICATION_DETAILS_SETTINGS");
                localIntent.setData(Uri.fromParts("package", PACKAGE_NAME, null));
                activity.startActivity(localIntent);
                mDialog.hideDialog();
                ActivityManagerUtils.getInstance().finishActivityclass(CaptureActivity.class);
            }
        });
        mDialog.showDialog();
    }

    /**
     * 打开提示框，进入app设置
     *
     * @param cordovaPlugin
     * @param title
     * @param message
     */
    public static void openAppSettingHint(final CordovaPlugin cordovaPlugin, String title, String message) {
        final CustomDialog mDialog = CustomDialog.getCustomDialog(cordovaPlugin.cordova.getActivity());
        mDialog.setInfo(title, message);
        mDialog.setListenerYes(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent localIntent = new Intent(Settings.ACTION_SETTINGS);
                cordovaPlugin.cordova.startActivityForResult(cordovaPlugin, localIntent, 0);
                mDialog.hideDialog();
            }
        });
        mDialog.showDialog();
    }

    public static void openAppSettingHint(@NonNull CordovaPlugin cordovaPlugin, @StringRes int titleRes, @StringRes int msgRes) {
        openAppSettingHint(cordovaPlugin, FuFuApplication.getmInstance().getString(titleRes), FuFuApplication.getmInstance().getString(msgRes));
    }

    /**
     * 定位权限设置
     *
     * @param activity
     * @param titleRes
     * @param msgRes
     */
    public static void openAppLocationHint(@NonNull final Activity activity, @StringRes int titleRes, @StringRes int msgRes) {
        final CustomDialog mDialog = CustomDialog.getCustomDialog(activity);
        mDialog.setInfo(FuFuApplication.getmInstance().getString(titleRes), FuFuApplication.getmInstance().getString(msgRes));
        mDialog.setListenerYes(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent localIntent = new Intent();
                localIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                localIntent.setAction("android.settings.APPLICATION_DETAILS_SETTINGS");
                localIntent.setData(Uri.fromParts("package", PACKAGE_NAME, null));
                activity.startActivityForResult(localIntent, 1001);
                mDialog.hideDialog();
            }
        });
        mDialog.showDialog();
    }

    /**
     * 蓝牙开关设置界面
     *
     * @param activity
     * @param titleRes
     * @param msgRes
     */
    public static CustomDialog openBluetoothSettingHint(@NonNull final Activity activity, @StringRes int titleRes, @StringRes int msgRes) {
        final CustomDialog mDialog = CustomDialog.getCustomDialog(activity);
        mDialog.setInfo(FuFuApplication.getmInstance().getString(titleRes), FuFuApplication.getmInstance().getString(msgRes));
        mDialog.setListenerYes(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent bluetoothIntent = new Intent(Settings.ACTION_BLUETOOTH_SETTINGS);
                activity.startActivity(bluetoothIntent);
                mDialog.hideDialog();
            }
        });
        mDialog.showDialog();
        return mDialog;
    }


    public static boolean isCameraAvailable() {
        return ContextCompat.checkSelfPermission(FuFuApplication.getmInstance(), Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED;
    }

    public static boolean isBluetoothAvailable() {
        return ContextCompat.checkSelfPermission(FuFuApplication.getmInstance(), Manifest.permission.BLUETOOTH_ADMIN) == PackageManager.PERMISSION_GRANTED;
    }

    public static boolean isLocationAvailable() {
        return ContextCompat.checkSelfPermission(FuFuApplication.getmInstance(), Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED;
    }

    public static boolean isLocationAvailable2() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            return ContextCompat.checkSelfPermission(FuFuApplication.getmInstance(), Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED;
        } else {
            Object object = FuFuApplication.getmInstance().getSystemService(Context.APP_OPS_SERVICE);
            if (object != null) {
                Class c = object.getClass();
                try {
                    Class[] cArg = new Class[3];
                    cArg[0] = int.class;
                    cArg[1] = int.class;
                    cArg[2] = String.class;
                    Method lMethod = c.getDeclaredMethod("checkOp", cArg);
                    int result = (Integer) lMethod.invoke(object, 1, Binder.getCallingUid(), FuFuApplication.getmInstance().getPackageName());
                    if (result == 0) {
                        return true;
                    } else {
                        return false;
                    }
                } catch (NoSuchMethodException e) {
                    e.printStackTrace();
                } catch (IllegalAccessException e) {
                    e.printStackTrace();
                } catch (IllegalArgumentException e) {
                    e.printStackTrace();
                } catch (InvocationTargetException e) {
                    e.printStackTrace();
                }
            } else {
                LocationManager locationManager = (LocationManager) FuFuApplication.getmInstance().getSystemService(Context.LOCATION_SERVICE);
                // 通过GPS卫星定位
                return locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER);
            }
        }
        return false;
    }

    public static void dissmissDialog() {
        CustomDialog.hideDialog();
    }
}
