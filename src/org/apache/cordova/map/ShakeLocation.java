package org.apache.cordova.map;

import android.content.Context;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.media.AudioAttributes;
import android.media.AudioManager;
import android.media.SoundPool;
import android.os.Build;

import com.citymobi.fufu.R;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaArgs;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONException;

/**
 * Created by shangzh on 16/5/10.
 */
public class ShakeLocation extends CordovaPlugin {

    private SensorManager sensorManager;
    private int sound1;
    private SoundPool soundPool;
    //上一次晃动手机的时间
    private long lastTime;

    private CallbackContext callBack;

    @Override
    public boolean execute(String action, CordovaArgs args, final CallbackContext callbackContext) throws JSONException {
        callBack = callbackContext;
        if ("shake".equals(action)) {
            sensorManager = (SensorManager) this.cordova.getActivity().getSystemService(Context.SENSOR_SERVICE);
            this.initSoundPool();
        } else {
            if (sensorManager != null) {
                sensorManager.unregisterListener(sensorEventListener);
            }
        }
        return true;
    }


    /**
     * 重力感应监听
     */
    SensorEventListener sensorEventListener = new SensorEventListener() {
        @Override
        public void onSensorChanged(SensorEvent event) {
            //获取手机在不同方向上加速度的变化
            float valuesX = Math.abs(event.values[0]);
            float valuesY = Math.abs(event.values[1]);
            float valuesZ = Math.abs(event.values[2]);

            if (valuesX > 15 || valuesY > 15 || valuesZ > 15) {
                long currentTimeMillis = System.currentTimeMillis();
                if (currentTimeMillis - lastTime < 1000) {
                    return;
                }
                lastTime = currentTimeMillis;
                playSound();
                sensorManager.unregisterListener(sensorEventListener);
                callBack.success("ok");
            }

        }

        @Override
        public void onAccuracyChanged(Sensor sensor, int accuracy) {

        }
    };

    /**
     * 初始化声音池
     */
    private void initSoundPool() {
        if (Build.VERSION.SDK_INT > 20) {
            SoundPool.Builder builder = new SoundPool.Builder();
//1.最大并发流数
            builder.setMaxStreams(3);
            AudioAttributes.Builder aaBuilder = new AudioAttributes.Builder();
            aaBuilder.setLegacyStreamType(AudioManager.STREAM_SYSTEM);
            builder.setAudioAttributes(aaBuilder.build());
            soundPool = builder.build();
        } else {
            soundPool = new SoundPool(3, AudioManager.STREAM_MUSIC, 0);
        }
//加载一个音频文件
        sound1 = soundPool.load(this.cordova.getActivity(), R.raw.shak, 1);
        sensorManager.registerListener(sensorEventListener, sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER), SensorManager.SENSOR_DELAY_NORMAL);
// 第一个参数是Listener，第二个参数是所得传感器类型，第三个参数值获取传感器信息的频率
    }

    private void playSound() {
        soundPool.play(sound1, 1, 1, 0, 0, 1);
//2.表示是否重复震动，-1表示不重复
//        vibrator.vibrate(new long[]{100, 200, 100, 200, 100, 200}, -1);
    }

    @Override
    public void onStart() {
        super.onStart();
        if (sensorManager == null) {
            sensorManager = (SensorManager) this.cordova.getActivity().getSystemService(Context.SENSOR_SERVICE);
        }
    }

    @Override
    public void onPause(boolean multitasking) {
        super.onPause(multitasking);
        if (soundPool != null) {
            soundPool.release();
        }
        if (sensorManager != null) {
            sensorManager.unregisterListener(sensorEventListener);
        }

    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (soundPool != null) {
            soundPool.release();
        }
        if (sensorManager != null) {
            sensorManager.unregisterListener(sensorEventListener);
        }
    }
}
