import "../css/productDetails.less"
import $ from 'jquery'
import {Tools, G, Dialog} from "COMMON/js/common";


/**
 * -------------------------------------------test----------------开发
 * **/

// let loginData = {
//     "appReqData": {
//         "customCode": "DZ190125151419926783228031104851"
//     },
//     "appVersion": "3.0.1",
//     "appid": "8aead9a64cc04916014cc049169d0000",
//     "deviceIdentifier": "finance_c10d9599-1c6d-492b-8ef7-32dad950cd10",
//     "orgCode": "3636346132616633316162613461363338623463",
//     "orgId": "h7kuLlAS4mXevdJDxYOOYA==",
//     "sign": "2C2D32905EE815945DAD49DDFC9EB2BA",
//     "token": "3a1c3776e0738ba10d4df6144a4bb8cf:1",
//     "version": "2.0.0"
// }
//
// function test() {
//     return Tools.AJAX({
//         url: G.base + "/capp/custom/productDetail.ason",
//         type:"post",
//         data:{
//             data:JSON.stringify(loginData)
//         }
//     })
// }


/**
 * ---------------------------------------test   end  end  end
 *
 * **/

let wrapperDom = $("#wrapper");
let PRODUCTDETAILS = {
    getData:function (customCode) {
        // return test();
        return Tools.AJAXTOKEN({
            url:G.base + "/capp/custom/productDetail.ason",
            type:"post",
            data:{
                customCode:customCode
            }
        });
    },
    renderHtml:function (data) {
        let template = ``;
        if(data){
            template = `<div class="content">
            <header>
                <div class="product-feature">
                    <p class="product-rate">${data.customAnnaulRate}<span>%</span></p>
                    <p class="product-rate-title"><span>参考年回报率</span><i id="notice">?</i></p>
                    <p class="product-label"><em>宜信优质债权</em></p>
                </div>
                <div class="product-info">
                    <dl>
                        <dt>${data.customPeriod + data.customPeriodUnitStr}</dt>
                        <dd>锁定期</dd>
                    </dl>
                    <dl>
                        <dt>${Tools.formatNumber(data.customAmount)}</dt>
                        <dd>出借金额(元)</dd>
                    </dl>
                </div>
            </header>
            <div class="date-box">
                <div class="date-item">
                    <p class="date-title">起息日</p>
                    <div class="date-progress">
                        <i></i>
                        <span></span>
                    </div>
                    <p class="date-content">${data.effectTime}</p>
                </div>
                <div class="date-item flex3">
                    <p class="date-title right"><span>授权到期日</span></p>
                    <div class="date-progress">
                        <i class="right r50"></i>
                        <span></span>
                    </div>
                    <p class="date-content right"><span>${data.endTime}</span></p>
                </div>
                <div class="date-item">
                    <p class="date-title right grey">预计回款日</p>
                    <div class="date-progress">
                        <i class="right grey"></i>
                        <span class="grey"></span>
                    </div>
                    <p class="date-content right grey">${data.expectCallDate}</p>
                </div>
            </div>
            <div class="item mt20 noBorder">
                <div>
                    <span class="yellow"><i class="bigger">${data.customRate}</i>%</span>
                    <span>推荐服务费率(年化)</span>
                </div>
            </div>
${data.custominfo.map((item, index)=>{
    let len = data.custominfo.length;
    return`<div class="item ${index === 0 ? `mt20`:(index ===  len - 1 ? `noBorder`: '')}">
                <div>
                    <span>${item.value}</span>
                    <span>${item.key}</span>
                </div>

            </div>`}).join('')}
            <div class="item mt20 noBorder link">
                <div>
                    <a data-href="securityMechanism.html" href="javascript:void(0)" class="bridgeRedirect">
                        <i></i>
                        <span>保障机制</span>
                    </a>
                </div>
            </div>

        </div>
        <div class="tips">网贷有风险 出借需谨慎</div>`
        }
        return template;
    },
    bindEvent:function () {
        $(document).on("click", "#notice", function () {
            Tools.dialogAlert({
                content:"未发生《风险揭示书》项下风险且<br/>《借款协议》及相关协议正常履行<br/>完毕后期待获得的收益与出借（或<br/>受让）本金的比率，据此换算成的<br/>年回报率。",
                confirm:"知道了"
            })
        });

        $(document).on("click", ".bridgeRedirect", function () {
            let url = $(this).attr("data-href"),
                pathArr = location.pathname.split("/"),
                path = '';
            pathArr.pop();
            path = pathArr.join("/");
            Tools.bridgeRedirect(`${location.origin + path + '/' + url}`);
        });
    },
    init:function () {
        let params = Tools.queryUrl(location.href),
            customCode = params.customCode, self = this;
        if(!customCode){
            return Tools.toast("缺少参数customCode")
        }
        this.getData(customCode).then(function (data) {
            if(data.code == "0"){
                return Tools.toast(data.msg)
            }
            if(data.data){
                let info = data.data;
                let html = self.renderHtml(info);
                wrapperDom.html(html);

                Tools.setTitle(info.customName);

                self.bindEvent();

            }
        })
    }
};

PRODUCTDETAILS.init();

(function(){
    var agent = navigator.userAgent.toLowerCase();        //检测是否是ios
    var iLastTouch = null;                                //缓存上一次tap的时间
    if (agent.indexOf('iphone') >= 0 || agent.indexOf('ipad') >= 0)
    {
        document.body.addEventListener('touchend', function(event)
        {
            var iNow = new Date()
                .getTime();
            iLastTouch = iLastTouch || iNow + 1 /** 第一次时将iLastTouch设为当前时间+1 */ ;
            var delta = iNow - iLastTouch;
            if (delta < 500 && delta > 0)
            {
                event.preventDefault();
                return false;
            }
            iLastTouch = iNow;
        }, false);
    }

})();


