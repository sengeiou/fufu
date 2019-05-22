package org.apache.cordova.image.adapter;

import android.content.Context;
import android.graphics.Point;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.BaseAdapter;
import android.widget.GridView;
import android.widget.TextView;

import com.bumptech.glide.Glide;
import com.citymobi.fufu.R;

import org.apache.cordova.image.model.ImageBean;
import org.apache.cordova.image.view.MyImageView;

import java.io.File;
import java.util.List;

/**
 * Created by shangzh on 16/8/22.
 */
public class GroupAdapter extends BaseAdapter {

    private List<ImageBean> list;
    private Point mPoint = new Point(0, 0);//用来封装ImageView的宽和高的对象
    private GridView mGridView;
    protected LayoutInflater mInflater;

    @Override
    public int getCount() {
        return list.size();
    }

    @Override
    public Object getItem(int position) {
        return list.get(position);
    }

    @Override
    public long getItemId(int position) {
        return position;
    }

    public GroupAdapter(Context context, List<ImageBean> list, GridView mGridView){
        this.list = list;
        this.mGridView = mGridView;
        mInflater = LayoutInflater.from(context);
    }

    @Override
    public View getView(int position, View convertView, ViewGroup parent) {
        ViewHolder viewHolder = null;
        if(convertView == null){
            viewHolder = new ViewHolder();
            convertView = mInflater.inflate(R.layout.grid_group_item, null);
            viewHolder.mImageView = (MyImageView) convertView.findViewById(R.id.group_image);
            viewHolder.mTextViewTitle = (TextView) convertView.findViewById(R.id.group_title);
            viewHolder.mTextViewCounts = (TextView) convertView.findViewById(R.id.group_count);
            convertView.setTag(viewHolder);
        }else{
            viewHolder = (ViewHolder) convertView.getTag();
        }

        ImageBean mImageBean = list.get(position);
        String path = mImageBean.getTopImagePath();

        Glide.with(viewHolder.mImageView.getContext()).load(new File(path)).placeholder(R.drawable.friends_sends_pictures_no).centerCrop().into(viewHolder.mImageView);

        setData(viewHolder,position,0);
        return convertView;
    }

    private void setData(ViewHolder holder,int itemIndex,int count) {
        ImageBean mImageBean = list.get(itemIndex);

        holder.mTextViewTitle.setText(mImageBean.getFolderName());
        holder.mTextViewCounts.setText(Integer.toString(mImageBean.getImageCounts()));

    }

    public void updateView(View view, int itemIndex,int count) {
        ImageBean mImageBean = list.get(itemIndex);
        String path = mImageBean.getTopImagePath();

        if(view == null) {
            return;
        }
        //从view中取得holder
        ViewHolder holder = (ViewHolder) view.getTag();

        holder.mTextViewTitle.setText(mImageBean.getFolderName());
        holder.mTextViewCounts.setText(Integer.toString(mImageBean.getImageCounts()));
        setData(holder,itemIndex,count);
    }

    public static class ViewHolder{
        public MyImageView mImageView;
        public TextView mTextViewTitle;
        public TextView mTextViewCounts;
    }
}
