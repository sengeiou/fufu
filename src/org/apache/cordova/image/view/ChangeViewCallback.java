package org.apache.cordova.image.view;

/**
 * Created by shangzh on 16/10/31.
 */

/**
 *  滑动状态改变回调
 * @author zxy
 *
 */
public interface ChangeViewCallback{
    /**
     * 切换视图 ？决定于left和right 。
     * @param left
     * @param right
     */
    public  void changeView(boolean left,boolean right);
    public  void  getCurrentPageIndex(int index);

}

