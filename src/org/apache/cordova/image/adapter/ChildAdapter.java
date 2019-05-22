package org.apache.cordova.image.adapter;

import android.animation.AnimatorSet;
import android.animation.ObjectAnimator;
import android.content.Context;
import android.graphics.Point;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.BaseAdapter;
import android.widget.CheckBox;
import android.widget.GridView;
import android.widget.TextView;
import android.widget.Toast;

import com.bumptech.glide.Glide;
import com.citymobi.fufu.R;

import org.apache.cordova.image.model.DetailImageBean;
import org.apache.cordova.image.view.MyImageView;

import java.io.File;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

/**
 * Created by shangzh on 16/8/22.
 */
public class ChildAdapter extends BaseAdapter {

    private Point mPoint = new Point(0, 0);//用来封装ImageView的宽和高的对象
    /**
     * 用来存储图片的选中情况
     */
    private HashMap<Integer, Boolean> mSelectMap = new HashMap<Integer, Boolean>();
    private GridView mGridView;
//    private List<String> list;

    //所有图片
    private  List<DetailImageBean> list;
    protected LayoutInflater mInflater;
    private int selectCount;
    private TextView uploadView;

    private Context context;
//    private ArrayList<String> urlList;

    public ChildAdapter(Context context, List<DetailImageBean> list, GridView mGridView, int selectCount, TextView uploadView) {
        this.list = list;
        this.mGridView = mGridView;
        this.selectCount = selectCount;
        this.uploadView = uploadView;
        this.context = context;
        mInflater = LayoutInflater.from(context);
    }

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

    @Override
    public View getView(final int position, View convertView, ViewGroup parent) {
         ViewHolder viewHolder = null;

        final DetailImageBean bean = list.get(position);

        if(convertView == null){
            viewHolder = new ViewHolder();
            convertView = mInflater.inflate(R.layout.grid_child_item, null);
            viewHolder.mImageView = (MyImageView) convertView.findViewById(R.id.child_image);
            viewHolder.mCheckBox = (CheckBox) convertView.findViewById(R.id.child_checkbox);
            convertView.setTag(viewHolder);
        }else{
            viewHolder = (ViewHolder) convertView.getTag();
        }

        setData(viewHolder,position,false);
        Glide.with(viewHolder.mImageView.getContext()).load(new File(bean.getFilePath())).placeholder(R.drawable.friends_sends_pictures_no).centerCrop().into(viewHolder.mImageView);

        return convertView;
    }

    /**
     * 给CheckBox加点击动画，利用开源库nineoldandroids设置动画
     * @param view
     */
    private void addAnimation(View view){
        float [] vaules = new float[]{ 0.8f, 0.9f, 1.0f, 1.1f, 1.15f, 1.1f, 1.0f};
        AnimatorSet set = new AnimatorSet();
        set.playTogether(ObjectAnimator.ofFloat(view, "scaleX", vaules),
                ObjectAnimator.ofFloat(view, "scaleY", vaules));
        set.setDuration(150);
        set.start();
    }

    private void setData(final ViewHolder holder, final int itemIndex,boolean flag) {
//        String path = list.get(itemIndex);
        final DetailImageBean bean = list.get(itemIndex);

        holder.mCheckBox.setChecked(bean.getChecked());
        holder.mCheckBox.setSelected(bean.getChecked());

        holder.mCheckBox.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                List<Integer> getItemlist = getSelectItems();
                if (v.isSelected()) {
                    v.setSelected(false);

                    mSelectMap.put(itemIndex,false);
                    bean.setChecked(false);
                    holder.mCheckBox.setChecked(false);

                } else {
                    if (getItemlist.size() < (9-selectCount)) {
                        v.setSelected(true);
                        if(!mSelectMap.containsKey(itemIndex) || !mSelectMap.get(itemIndex)){
                            addAnimation(holder.mCheckBox);
                        }
                        mSelectMap.put(itemIndex, true);
                        bean.setChecked(true);
                        holder.mCheckBox.setChecked(true);
                    } else {
                        Toast.makeText(context,"您已选择9张图片",Toast.LENGTH_SHORT).show();
                        v.setSelected(false);
                        bean.setChecked(false);
                        holder.mCheckBox.setChecked(false);
                    }
                }
                uploadView.setText("完成("+getSelectItems().size()+"/"+(9-selectCount)+")");
            }
        });
    }

    public void updateView(View view, int itemIndex,boolean flag) {

        if(view == null) {
            return;
        }
        //从view中取得holder
        ViewHolder holder = (ViewHolder) view.getTag();
        setData(holder, itemIndex,flag);
    }

    /**
     * 获取选中的Item的position
     * @return
     */
    public List<Integer> getSelectItems(){
        List<Integer> list = new ArrayList<Integer>();
        for(Iterator<Map.Entry<Integer, Boolean>> it = mSelectMap.entrySet().iterator(); it.hasNext();){
            Map.Entry<Integer, Boolean> entry = it.next();
            if(entry.getValue()){
                list.add(entry.getKey());
            }
        }
        return list;
    }

    public void updateSelectItems(List<Integer> list){

        for(Iterator<Map.Entry<Integer, Boolean>> it = mSelectMap.entrySet().iterator(); it.hasNext();){
            Map.Entry<Integer, Boolean> entry = it.next();
           entry.setValue(false);
        }

        for(Integer integer : list) {
            mSelectMap.put(integer,true);
        }
    }

    public static class ViewHolder{
        public MyImageView mImageView;
        public CheckBox mCheckBox;
    }
}
