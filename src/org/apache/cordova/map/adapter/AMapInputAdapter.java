package org.apache.cordova.map.adapter;

import com.amap.api.services.help.Tip;
import com.chad.library.adapter.base.BaseQuickAdapter;
import com.chad.library.adapter.base.BaseViewHolder;
import com.citymobi.fufu.R;

import java.util.List;


/**
 * <pre>
 *     author : ZhongQuan
 *     e-mail : xxx@xx
 *     time   : 2018/10/24
 *     desc   : 高德地图搜索，自动提示列表适配器
 *     version: 1.0
 * </pre>
 */
public class AMapInputAdapter extends BaseQuickAdapter<Tip, BaseViewHolder> {

    public AMapInputAdapter(int layoutResId, List<Tip> data) {
        super(layoutResId, data);
    }

    @Override
    protected void convert(BaseViewHolder helper, Tip item) {
        helper.setText(R.id.tv_name_amap_input, item.getName());
        helper.setText(R.id.tv_address_amap_input, item.getAddress());
    }
}
