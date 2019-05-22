package org.apache.cordova.map.adapter;

import android.content.Context;
import android.content.res.Resources;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.BaseAdapter;
import android.widget.ImageView;
import android.widget.TextView;

import com.citymobi.fufu.R;

import org.apache.cordova.map.model.Address;

import java.util.LinkedList;
import java.util.List;

/**
 * Created by shangzh on 16/5/26.
 */
public class AddressAdapter extends BaseAdapter {

    private List<Address> mData;
    private Context mContext;
    private Resources resources;

    public AddressAdapter(LinkedList<Address> mData, Context mContext, Resources resources) {
        this.mData = mData;
        this.mContext = mContext;
        this.resources = resources;
    }

    @Override
    public int getCount() {
        return mData.size();
    }

    @Override
    public Object getItem(int i) {
        return null;
    }

    @Override
    public long getItemId(int i) {
        return i;
    }


    /**
     * 局部刷新
     *
     * @param view
     * @param itemIndex
     */
    public void upDateItemView(View view, int itemIndex) {
        if (view == null) {
            return;
        }
        //从view中取得holder
        ViewHolder holder = (ViewHolder) view.getTag();
        holder.imgView = (ImageView) view.findViewById(R.id.selectimage);
        setData(holder, itemIndex);
    }

    @Override
    public View getView(int i, View convertView, ViewGroup viewGroup) {
        ViewHolder holder = null;
        if (convertView == null) {
            convertView = LayoutInflater.from(mContext).inflate(R.layout.item_list, viewGroup, false);
            holder = new ViewHolder();
            holder.txt_content = (TextView) convertView.findViewById(R.id.txt_content);
            holder.tvAddressDetail = (TextView) convertView.findViewById(R.id.tv_address_detail);
            holder.imgView = (ImageView) convertView.findViewById(R.id.selectimage);
            convertView.setTag(holder);
        } else {
            holder = (ViewHolder) convertView.getTag();
        }
        holder.txt_content.setText(mData.get(i).getAddressTitle());
        holder.tvAddressDetail.setText(mData.get(i).getAddressDetail());
        holder.imgView.setImageResource(0);
        setData(holder, i);
        return convertView;
    }

    /**
     * 设置viewHolder的数据
     *
     * @param holder
     * @param itemIndex
     */
    private void setData(ViewHolder holder, int itemIndex) {
        Address address = mData.get(itemIndex);
        if (address.selected) {
            holder.imgView.setImageResource(R.drawable.select_address);
        } else {
            if (holder.imgView.getResources() != null) {
                holder.imgView.setImageResource(0);
            }
        }

    }


    private class ViewHolder {
        TextView txt_content, tvAddressDetail;
        ImageView imgView;
    }
}
