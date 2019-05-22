package org.apache.cordova.wx;

import android.content.Context;
import android.text.TextUtils;

import com.socks.library.KLog;
import com.tencent.mm.opensdk.constants.ConstantsAPI;
import com.tencent.mm.opensdk.modelbase.BaseReq;
import com.tencent.mm.opensdk.modelbase.BaseResp;
import com.tencent.mm.opensdk.modelbiz.WXLaunchMiniProgram;
import com.tencent.mm.opensdk.openapi.IWXAPI;
import com.tencent.mm.opensdk.openapi.IWXAPIEventHandler;
import com.tencent.mm.opensdk.openapi.WXAPIFactory;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaWebView;
import org.json.JSONArray;
import org.json.JSONException;

/**
 * <pre>
 *     author : ZhongQuan
 *     e-mail : xxx@xx
 *     time   : 2019/05/17
 *     desc   : 微信小程序插件
 *     version: 1.0
 * </pre>
 */
public class WXMiniProgram extends CordovaPlugin implements IWXAPIEventHandler {
    private Context mContext;

    private final String appId = "wx8938135337de5c7e";

    @Override
    public void initialize(CordovaInterface cordova, CordovaWebView webView) {
        super.initialize(cordova, webView);
        mContext = cordova.getActivity();
    }

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        KLog.d(action);
        KLog.json(args.toString());
        if ("launchMiniProgram".equals(action)) {
            if (!TextUtils.isEmpty(args.getJSONObject(0).getString("userName"))) {
                launchMiniProgram(args.getJSONObject(0).getString("userName"));
            }
        }

        return true;
    }

    /**
     * 运行微信小程序
     *
     * @param usreName
     */
    private void launchMiniProgram(String usreName) {
        KLog.d(usreName);
        IWXAPI api = WXAPIFactory.createWXAPI(mContext, appId, true);
        //注意：
        //第三方开发者如果使用透明界面来实现WXEntryActivity，需要判断handleIntent的返回值，如果返回值为false，则说明入参不合法未被SDK处理，应finish当前透明界面，避免外部通过传递非法参数的Intent导致停留在透明界面，引起用户的疑惑
        try {
            boolean bool = api.handleIntent(cordova.getActivity().getIntent(), this);
            KLog.d(bool);
        } catch (Exception e) {
            e.printStackTrace();
        }

        WXLaunchMiniProgram.Req req = new WXLaunchMiniProgram.Req();
        req.userName = usreName;        // 填小程序原始id
        req.path = "";                  //拉起小程序页面的可带参路径，不填默认拉起小程序首页
        req.miniprogramType = WXLaunchMiniProgram.Req.MINIPTOGRAM_TYPE_RELEASE;// 可选打开 开发版，体验版和正式版
        api.sendReq(req);
    }

    /**
     * 微信发送请求到第三方应用时，会回调到该方法
     *
     * @param baseReq
     */
    @Override
    public void onReq(BaseReq baseReq) {

    }

    /**
     * 第三方应用发送到微信的请求处理后的响应结果，会回调到该方法
     *
     * @param resp
     */
    @Override
    public void onResp(BaseResp resp) {
        KLog.i("WXEntryActivity", resp.errCode + "");
        KLog.i("WXEntryActivity", resp.errStr);
        KLog.i("WXEntryActivity", resp.transaction);
        KLog.i("WXEntryActivity", resp.openId);
        KLog.i("WXEntryActivity", "baseresp.getType = " + resp.getType());

        if (resp.getType() == ConstantsAPI.COMMAND_LAUNCH_WX_MINIPROGRAM) {
            WXLaunchMiniProgram.Resp launchMiniProResp = (WXLaunchMiniProgram.Resp) resp;
            String extraData = launchMiniProResp.extMsg; // 对应小程序组件 <button open-type="launchApp"> 中的 app-parameter 属性
        }

        String result = "";
        switch (resp.errCode) {
            case BaseResp.ErrCode.ERR_OK:
                result = "发送成功";
                break;
            case BaseResp.ErrCode.ERR_USER_CANCEL:
                result = "发送取消";
                break;
            case BaseResp.ErrCode.ERR_AUTH_DENIED:
                result = "发送被拒绝";
                break;
            case BaseResp.ErrCode.ERR_UNSUPPORT:
                result = "不支持错误";
                break;
            default:
                result = "发送返回";
                break;
        }
        KLog.d(result);
    }
}
