package org.apache.cordova.map.activity;

import android.app.Activity;
import android.content.Intent;
import android.graphics.BitmapFactory;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ImageView;
import android.widget.ListView;
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
import com.amap.api.maps.model.LatLng;
import com.amap.api.maps.model.MarkerOptions;
import com.amap.api.services.core.LatLonPoint;
import com.amap.api.services.core.PoiItem;
import com.amap.api.services.poisearch.PoiResult;
import com.amap.api.services.poisearch.PoiSearch;
import com.citymobi.fufu.R;
import com.citymobi.fufu.utils.AMapUtil;
import com.handmark.pulltorefresh.library.PullToRefreshBase;
import com.handmark.pulltorefresh.library.PullToRefreshListView;
import com.socks.library.KLog;

import org.apache.cordova.map.adapter.AddressAdapter;
import org.apache.cordova.map.model.Address;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;

/**
 * 上报位置地图界面
 */
public class ShowMapActivity extends Activity implements
        LocationSource,
        AMapLocationListener,
        PoiSearch.OnPoiSearchListener,
        AdapterView.OnItemClickListener,
        View.OnClickListener {

    private AMap aMap;
    private MapView mapView;
    private AMapLocationClient mlocationClient;

    private AMapLocation mLocation;

    private PullToRefreshListView mPullRefreshListView;
    private AddressAdapter mAdapter = null;
    private List<Address> mData = new LinkedList<Address>();

    private PoiSearch.Query query;

    private Bundle saveState;

    private int pageNum = 1;

    // 已选择的地址名称（不包含省市）
    private Address selectedAddress = new Address();
    // 省市区
    private String city = "";

    private TextView loadTextView;
    private String addressTitle, addressDetail, latitude, longitude;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_show_map);
        saveState = savedInstanceState;

        initMap();
        initView();
        initData();
    }

    private void initView() {
        loadTextView = (TextView) findViewById(R.id.loading);
        loadTextView.setVisibility(View.GONE);
        ImageView back = (ImageView) findViewById(R.id.left_btn);
        back.setOnClickListener(this);
        TextView selected = (TextView) findViewById(R.id.right_text);
        selected.setOnClickListener(this);

        mPullRefreshListView = (PullToRefreshListView) findViewById(R.id.pull_refresh_list);
        mPullRefreshListView.setMode(PullToRefreshBase.Mode.PULL_FROM_END);
        mAdapter = new AddressAdapter((LinkedList<Address>) mData, this, getResources());
        mPullRefreshListView.setAdapter(mAdapter);
        mPullRefreshListView.setOnRefreshListener(new PullToRefreshBase.OnRefreshListener2<ListView>() {
            @Override
            public void onPullDownToRefresh(PullToRefreshBase<ListView> refreshView) {

            }

            @Override
            public void onPullUpToRefresh(PullToRefreshBase<ListView> refreshView) {
                poiSearchData(mLocation);
            }
        });
        mPullRefreshListView.setOnItemClickListener(this);
    }

    private void initData() {
        Intent intent = getIntent();
        latitude = intent.getStringExtra("latitude");
        longitude = intent.getStringExtra("longitude");
        addressTitle = intent.getStringExtra("addressTitle");
        addressDetail = intent.getStringExtra("addressDetail");
        if (!TextUtils.isEmpty(latitude) && !TextUtils.isEmpty(longitude) && !TextUtils.isEmpty(addressTitle)) {
            selectedAddress = new Address(latitude, longitude, addressTitle, addressDetail);

            mData.clear();
            Address newAddress = new Address(latitude, longitude, addressTitle, addressDetail, true);
            mData.add(newAddress);
            addMark(Double.valueOf(latitude), Double.valueOf(longitude));
            mAdapter.notifyDataSetChanged();
        }
        query = new PoiSearch.Query("", "商务住宅|政府机构及社会团体|交通设施服务", "");
    }

    /**
     * 初始化Map
     */
    private void initMap() {
        mapView = (MapView) findViewById(R.id.map);
        mapView.onCreate(saveState);
        if (aMap == null) {
            aMap = mapView.getMap();
        }
        aMap.getUiSettings().setMyLocationButtonEnabled(true);// 设置默认定位按钮是否显示
        aMap.setLocationSource(this);// 设置定位监听
        aMap.setMyLocationEnabled(true);// 设置为true表示显示定位层并可触发定位，false表示隐藏定位层并不可触发定位，默认是false
    }

    @Override
    public void onPoiSearched(PoiResult poiResult, int rCode) {
        KLog.d("搜索成功: " + pageNum);
        mPullRefreshListView.onRefreshComplete();
        if (rCode == 1000) {
            if (poiResult != null) {
                ArrayList<PoiItem> poiItems = poiResult.getPois();
                if (pageNum == 1) {
                    mData.clear();
                    if (!TextUtils.isEmpty(addressTitle)) {
                        KLog.d("添加一条成功");
                        Address newAddress = new Address(latitude, longitude, addressTitle, addressDetail, true);
                        mData.add(newAddress);
                    }
                }
                for (PoiItem poiItem : poiItems) {
                    KLog.d(poiItem.getTitle());
                    if (!poiItem.getTitle().equals(addressTitle)) {
                        Address address = new Address();
                        address.setAddressTitle(poiItem.getTitle());
                        address.setSelected(false);
                        address.setLatitude(String.valueOf(poiItem.getLatLonPoint().getLatitude()));
                        address.setLongitude(String.valueOf(poiItem.getLatLonPoint().getLongitude()));
                        address.setAddressDetail(poiItem.getProvinceName() + poiItem.getCityName() + poiItem.getAdName() + poiItem.getSnippet());
                        mData.add(address);
                    }
                }
                if (poiItems.size() < 20) {
                    mPullRefreshListView.setMode(PullToRefreshBase.Mode.DISABLED);
                } else {
                    pageNum++;
                }
            }
        } else {
            KLog.e("搜索失败 ErrorCode" + rCode);
        }
        mAdapter.notifyDataSetChanged();
    }

    @Override
    public void onPoiItemSearched(PoiItem poiItem, int i) {
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (mlocationClient != null) {
            mlocationClient.onDestroy();
        }
        //在activity执行onDestroy时执行mMapView.onDestroy()，实现地图生命周期管理
        mapView.onDestroy();
    }

    @Override
    protected void onResume() {
        super.onResume();
        //在activity执行onResume时执行mMapView.onResume ()，实现地图生命周期管理
        mapView.onResume();
    }

    @Override
    protected void onPause() {
        super.onPause();
        //在activity执行onPause时执行mMapView.onPause ()，实现地图生命周期管理
        mapView.onPause();
        deactivate();
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        //在activity执行onSaveInstanceState时执行mMapView.onSaveInstanceState (outState)，实现地图生命周期管理
        mapView.onSaveInstanceState(outState);
    }

    /**
     * 定位成功后回调函数
     */
    @Override
    public void onLocationChanged(AMapLocation amapLocation) {
        if (amapLocation != null) {
            if (amapLocation.getErrorCode() == 0) {
                if (!TextUtils.isEmpty(latitude) && !TextUtils.isEmpty(longitude) && !TextUtils.isEmpty(addressTitle)) {
                    selectedAddress = new Address(latitude, longitude, addressTitle, addressDetail);
                    addMark(Double.valueOf(latitude), Double.valueOf(longitude));
                } else {
                    selectedAddress = new Address();
                    addMark(amapLocation.getLatitude(), amapLocation.getLongitude());
                }
                mLocation = amapLocation;
                city = amapLocation.getProvince() + amapLocation.getCity() + amapLocation.getDistrict() + amapLocation.getStreet();
                pageNum = 1;
                poiSearchData(mLocation);
            } else {
                String errText = "定位失败," + amapLocation.getErrorCode() + ": " + amapLocation.getErrorInfo();
                KLog.e("AmapErr", errText);
            }
        }
    }

    /**
     * 检索周边POI
     *
     * @param amapLocation
     */
    private void poiSearchData(AMapLocation amapLocation) {
        KLog.d("开始搜索");
        if (amapLocation != null) {
            query.setPageSize(20);// 设置每页最多返回多少条poiitem
            query.setPageNum(pageNum);//设置查询页码
            PoiSearch poiSearch = new PoiSearch(this, query);//初始化poiSearch对象
            poiSearch.setBound(new PoiSearch.SearchBound(new LatLonPoint(amapLocation.getLatitude(), amapLocation.getLongitude()), 500));//设置周边搜索的中心点以及区域
            poiSearch.setOnPoiSearchListener(this);//设置数据返回的监听器
            poiSearch.searchPOIAsyn();
        }
    }

    /**
     * 激活定位
     */
    @Override
    public void activate(OnLocationChangedListener listener) {
        if (mlocationClient == null) {
            mlocationClient = new AMapLocationClient(this);
        }
        AMapLocationClientOption mLocationOption = AMapUtil.getDefaultOption();
        mlocationClient.setLocationListener(this);
        mlocationClient.setLocationOption(mLocationOption);
        mlocationClient.startLocation();
        KLog.d("开始定位");
    }

    @Override
    public void deactivate() {
    }

    @Override
    public void onItemClick(AdapterView<?> adapterView, View view, int i, long l) {
        Address address = mData.get(i - 1);
        if (address.selected) {
            address.selected = false;
            selectedAddress = new Address();
        } else {
            address.selected = true;
            selectedAddress = new Address(address.latitude, address.longitude, address.addressTitle, address.addressDetail);
            addMark(Double.valueOf(address.getLatitude()), Double.valueOf(address.getLongitude()));
        }
        for (Address addr : mData) {
            // 不是当前点击的对象
            if (!addr.addressTitle.equals(address.addressTitle) || !addr.latitude.equals(address.latitude) || !addr.longitude.equals(address.longitude)) {
                addr.selected = false;
            }
        }
        mAdapter.notifyDataSetChanged();
    }

    private void backResult() {
        Intent intent = getIntent();
        intent.putExtra("city", city);
        intent.putExtra("latitude", selectedAddress.latitude);
        intent.putExtra("longitude", selectedAddress.longitude);
        intent.putExtra("addressTitle", selectedAddress.addressTitle);
        intent.putExtra("addressDetail", selectedAddress.addressDetail);
        setResult(RESULT_OK, intent);
        this.finish();
    }

    /**
     * 添加标注
     *
     * @param latitude
     * @param longitude
     */
    private void addMark(double latitude, double longitude) {
        aMap.clear();
        LatLng latLng = new LatLng(latitude, longitude);
        MarkerOptions markerOption = new MarkerOptions();
        markerOption.position(latLng);
        markerOption.icon(BitmapDescriptorFactory.fromBitmap(BitmapFactory.decodeResource(getResources(), R.drawable.map_mark_small)));
        aMap.addMarker(markerOption);
        aMap.moveCamera(CameraUpdateFactory.newLatLngZoom(latLng, 18));
    }

    @Override
    public void onClick(View v) {
        switch (v.getId()) {
            case R.id.left_btn:
                finish();
                break;
            case R.id.right_text:
                backResult();
                break;
        }
    }
}
