package org.apache.cordova.map.activity;

import android.content.Intent;
import android.graphics.BitmapFactory;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.LayoutInflater;
import android.view.MotionEvent;
import android.view.View;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.TextView;

import com.amap.api.location.AMapLocation;
import com.amap.api.location.AMapLocationClient;
import com.amap.api.location.AMapLocationClientOption;
import com.amap.api.location.AMapLocationListener;
import com.amap.api.maps.AMap;
import com.amap.api.maps.CameraUpdateFactory;
import com.amap.api.maps.LocationSource;
import com.amap.api.maps.MapView;
import com.amap.api.maps.model.BitmapDescriptorFactory;
import com.amap.api.maps.model.CameraPosition;
import com.amap.api.maps.model.LatLng;
import com.amap.api.maps.model.Marker;
import com.amap.api.maps.model.MarkerOptions;
import com.amap.api.services.core.LatLonPoint;
import com.amap.api.services.geocoder.GeocodeResult;
import com.amap.api.services.geocoder.GeocodeSearch;
import com.amap.api.services.geocoder.RegeocodeQuery;
import com.amap.api.services.geocoder.RegeocodeResult;
import com.amap.api.services.help.Tip;
import com.citymobi.fufu.R;
import com.citymobi.fufu.activity.base.BaseActivity;
import com.citymobi.fufu.utils.AMapUtil;
import com.citymobi.fufu.widgets.EditTextDialog;
import com.socks.library.KLog;

import org.apache.cordova.map.model.SearchAddress;

/**
 * 搜索地图界面，
 * 于20181024修改
 */
public class SearchMapActivity extends BaseActivity implements
        LocationSource,
        AMapLocationListener,
        AMap.InfoWindowAdapter,
        GeocodeSearch.OnGeocodeSearchListener,
        View.OnClickListener {

    private AMap aMap;
    private MapView mapView;
    private AMapLocationClient mlocationClient;
    private AMapLocationClientOption mLocationOption;

    private Bundle saveState;
    private ImageView back;  //返回按钮
    private TextView checkAddress; //使用当前地址
    private View layoutSearch;

    private SearchAddress selecedAddress = new SearchAddress(); //搜索后选择的地点
    // 逆地理编码
    private GeocodeSearch geocoderSearch;

    private float x1, x2, y1, y2;
    private double mapCameraLat, mapCameraLng;

    @Override
    protected void initContentView(Bundle bundle) {
        setContentView(R.layout.activity_search_map);
        saveState = bundle;
    }

    protected void initView() {
        initMap();
        back = (ImageView) findViewById(R.id.left_btn);
        checkAddress = (TextView) findViewById(R.id.checkAddress);
        layoutSearch = findViewById(R.id.layout_searchbar);
        back.setOnClickListener(this);
        checkAddress.setOnClickListener(this);
        layoutSearch.setOnClickListener(this);
    }

    protected void initData() {
        // 地理编码
        geocoderSearch = new GeocodeSearch(this);
        geocoderSearch.setOnGeocodeSearchListener(this);
        startLocation(true);
    }

    @Override
    protected void getBundleExtras(Bundle extras) {

    }

    /**
     * 初始化地图
     */
    private void initMap() {
        mapView = (MapView) findViewById(R.id.map);
        mapView.onCreate(saveState);
        if (aMap == null) {
            aMap = mapView.getMap();
        }
        aMap.getUiSettings().setZoomControlsEnabled(true);
        aMap.getUiSettings().setMyLocationButtonEnabled(true);// 设置默认定位按钮是否显示
        aMap.setLocationSource(this);// 设置定位按钮点击监听
        aMap.setInfoWindowAdapter(this);
        aMap.setOnMapTouchListener(new AMap.OnMapTouchListener() {
            @Override
            public void onTouch(MotionEvent motionEvent) {
                switch (motionEvent.getAction()) {
                    case MotionEvent.ACTION_DOWN:
                        x1 = motionEvent.getX();
                        y1 = motionEvent.getY();
                        KLog.d("按下地图: " + x1 + "," + y1);
                        break;
                    case MotionEvent.ACTION_MOVE:
                        break;
                    case MotionEvent.ACTION_UP:
                        x2 = motionEvent.getX();
                        y2 = motionEvent.getY();
                        KLog.d("离开地图: " + x2 + "," + y2);
                        break;
                }
            }
        });
        aMap.setOnCameraChangeListener(new AMap.OnCameraChangeListener() {
            @Override
            public void onCameraChange(CameraPosition cameraPosition) {
            }

            @Override
            public void onCameraChangeFinish(CameraPosition cameraPosition) {
                if (x1 != 0 && y1 != 0 && (Math.abs(x1 - x2) > 10 || Math.abs(y1 - y2) > 10)) {
                    mapCameraLat = cameraPosition.target.latitude;
                    mapCameraLng = cameraPosition.target.longitude;
                    LatLonPoint latLonPoint = new LatLonPoint(mapCameraLat, mapCameraLng);
                    getAddress(latLonPoint);
                    KLog.d("真正地图移动");
                }
                x1 = x2 = y1 = y2 = 0;
            }
        });
    }


    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        //在activity执行onSaveInstanceState时执行mMapView.onSaveInstanceState (outState)，实现地图生命周期管理
        mapView.onSaveInstanceState(outState);
    }

    /**
     * 给地图添加标记
     *
     * @param addressTitle
     * @param latitude
     * @param longitude
     */
    private void addMark(String addressTitle, double latitude, double longitude) {
        if (aMap != null) {
            aMap.clear();
        }
        KLog.d("添加标注 " + addressTitle);
        LatLng latLng = new LatLng(latitude, longitude);
        MarkerOptions markerOptions = new MarkerOptions();
        markerOptions.position(latLng);
        markerOptions.title(addressTitle);
        markerOptions.icon(BitmapDescriptorFactory.fromBitmap(BitmapFactory.decodeResource(getResources(), R.drawable.map_mark_small)));
        Marker mMarker = aMap.addMarker(markerOptions);
        mMarker.setTitle(addressTitle);
        mMarker.showInfoWindow();
        aMap.moveCamera(CameraUpdateFactory.newLatLngZoom(latLng, 18));

        selecedAddress.addressTitle = addressTitle;
        selecedAddress.latitude = String.valueOf(latitude);
        selecedAddress.longitude = String.valueOf(longitude);
    }

    /**
     * 开始定位
     *
     * @param isFirst
     */
    private void startLocation(boolean isFirst) {
        // 获取前端传值
        Intent intent = getIntent();
        if (isFirst && !TextUtils.isEmpty(intent.getStringExtra("anotherName"))) {
            String oldAnotherName = intent.getStringExtra("anotherName");
            double oldLatitude = intent.getDoubleExtra("latitude", 0.0);
            double oldLongitude = intent.getDoubleExtra("longitude", 0.0);
            addMark(oldAnotherName, oldLatitude, oldLongitude);
        } else {
            if (mlocationClient == null) {
                mlocationClient = new AMapLocationClient(this);
                mLocationOption = AMapUtil.getDefaultOption();
                mlocationClient.setLocationOption(mLocationOption);
                mlocationClient.setLocationListener(this);
            }
            mlocationClient.startLocation();
            KLog.d("开始定位");
        }
    }

    /**
     * 定位成功后回调函数
     */
    @Override
    public void onLocationChanged(AMapLocation amapLocation) {
        if (amapLocation != null) {
            if (amapLocation.getErrorCode() == 0) {
                KLog.d(amapLocation.toString());
                addMark(AMapUtil.getLocationAddress(amapLocation), amapLocation.getLatitude(), amapLocation.getLongitude());
            } else {
                String errText = "定位失败," + amapLocation.getErrorCode() + ": " + amapLocation.getErrorInfo();
                KLog.e(errText);
            }
        }
    }

    /**
     * 定位按钮点击回调
     */
    @Override
    public void activate(LocationSource.OnLocationChangedListener listener) {
        KLog.d("定位按钮");
        startLocation(false);
    }

    @Override
    public void deactivate() {
    }

    /**
     * 返回数据给H5
     */
    private void backResult() {
        //返回addressTitle
        //通过setResult绑定返回值
        Intent intent = new Intent();
        intent.putExtra("type", "searchmap");
        intent.putExtra("address", selecedAddress.addressTitle);
        intent.putExtra("latitude", selecedAddress.latitude);
        intent.putExtra("longitude", selecedAddress.longitude);
        intent.putExtra("anotherName", selecedAddress.anotherName);
        setResult(RESULT_OK, intent);
        this.finish();
    }

    /**
     * 监听自定义infowindow窗口的infocontents事件回调
     */
    @Override
    public View getInfoContents(Marker marker) {
        return null;
    }

    /**
     * 监听自定义infowindow窗口的infowindow事件回调
     */
    @Override
    public View getInfoWindow(Marker marker) {
        View infoWindow = LayoutInflater.from(this).inflate(R.layout.custom_info_window, null);
        render(marker, infoWindow);
        return infoWindow;
    }


    /**
     * 自定义infowinfow窗口
     */
    public void render(Marker marker, View view) {
        String title = marker.getTitle();
        TextView titleUi = (TextView) view.findViewById(R.id.title);
        if (title != null) {
            titleUi.setText(title);
        } else {
            titleUi.setText("");
        }
    }

    /**
     * 逆地理编码回调
     *
     * @param result
     * @param rCode
     */
    @Override
    public void onRegeocodeSearched(RegeocodeResult result, int rCode) {
        if (rCode == 1000) {
            if (result != null && result.getRegeocodeAddress() != null && !TextUtils.isEmpty(result.getRegeocodeAddress().getFormatAddress())) {
                KLog.d("反地理编码成功");
                KLog.d(result.getRegeocodeAddress().getFormatAddress());
                String address = result.getRegeocodeAddress().getFormatAddress()
                        .replace(result.getRegeocodeAddress().getProvince(), "")
                        .replace(result.getRegeocodeAddress().getCity(), "")
                        .replace(result.getRegeocodeAddress().getDistrict(), "");
                if (TextUtils.isEmpty(address)) {
                    address = result.getRegeocodeAddress().getFormatAddress();
                }
                addMark(address, mapCameraLat, mapCameraLng);
            }
        } else {
            KLog.e("反地理编码失败：" + rCode);
        }
    }

    @Override
    public void onGeocodeSearched(GeocodeResult geocodeResult, int i) {

    }

    /**
     * 逆地理编码
     */
    public void getAddress(final LatLonPoint latLonPoint) {
        // 第一个参数表示一个Latlng，第二参数查找范围。默认值为1000，取值范围1-3000，单位米，第三个参数表示是火系坐标系还是GPS原生坐标系
        RegeocodeQuery query = new RegeocodeQuery(latLonPoint, 10, GeocodeSearch.AMAP);
        // 逆地理编码查询的异步处理调用。
        geocoderSearch.getFromLocationAsyn(query);
    }

    @Override
    protected void onResume() {
        super.onResume();
        mapView.onResume();
    }

    @Override
    protected void onPause() {
        super.onPause();
        mapView.onPause();
        deactivate();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (mlocationClient != null) {
            mlocationClient.onDestroy();
        }
        mapView.onDestroy();
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == 3000 && resultCode == 3001 && data != null) {
            Tip tip = data.getParcelableExtra("AMap_Search_Result");
            addMark(tip.getAddress(), tip.getPoint().getLatitude(), tip.getPoint().getLongitude());
        }
    }

    @Override
    public void onClick(View v) {
        switch (v.getId()) {
            case R.id.left_btn:// 退出
                finish();
                break;
            case R.id.checkAddress:// 使用当前地址
                EditTextDialog.getEditTextDialog(SearchMapActivity.this)
                        .setTitle(getResources().getString(R.string.set_signin_address_name))
                        .setMessage(TextUtils.isEmpty(selecedAddress.addressTitle) ? "" : selecedAddress.addressTitle)
                        .setConfirmListener(new View.OnClickListener() {
                            @Override
                            public void onClick(View v) {
                                selecedAddress.anotherName = ((EditText) v).getText().toString().trim();
                                backResult();
                            }
                        })
                        .show();
                break;
            case R.id.layout_searchbar:// 搜索关键字
                Intent intent = new Intent(this, MapKeywordsSearchActivity.class);
                startActivityForResult(intent, 3000);
                break;
        }
    }
}
