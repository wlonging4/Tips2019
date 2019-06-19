import "../css/productDetails.less"
import $ from 'jquery'
import {Tools, G, Dialog, CALC} from "COMMON/js/common";
/**
 * -------------------------------------------test----------------开发
 * **/

// let loginData = {"src":"5","sign":"7E08073CB870871515558ADC595241D5","deviceVersion":"Android 9","versionName":"3.0.2","version":"2.0.0","deviceName":"MI MAX 3","orgId":"TROSR4VaMZAZyVqdqzVkvw==","versionCode":180,"token":"f2111bb3547d27e8c86fb8e895fcbcb2:1","deviceIdentifier":"finance_2876b208-f735-4ab7-963b-d64d016fd347","orgCode":"6231613462643963343233343133336332613864","appid":"8aead9a64cc04916014cc049169d0000","sdkVersion":"28","appReqData":{"loanCode":"9654574"}};
//
// function test() {
//     return Tools.AJAX({
//         url: "/js/commons.js",
//         type:"get"
//     })
// }


/**
 * ---------------------------------------test   end  end  end
 *
 * **/
function isIOS() {
    var u = navigator.userAgent;
    return !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)
}
let wrapperDom = $("#wrapper"),
    w = $('body').width(),
    PRODUCTDETAILS = {
        calData:{
            rate:0,
            chargeRate:0,
            period:0
        },
        getData:function (loanCode) {
            // return test();
            return Tools.AJAXTOKEN({
                url:G.base + "/capp/loanProduct/loanDetail.ason",
                type:"post",
                data:{
                    loanCode: loanCode
                }
            });
        },
        renderHtml:function (data) {
            let template = ``;
            if(data){
                template = `<div class="content">
                <header>
                    <div class="product-feature">
                        <p class="product-rate">${data.loanRatio}<span>%</span></p>
                        <p class="product-rate-title"><span>借款年利率</span><i id="notice">?</i></p>
                    </div>
                    <div class="product-info">
                        <dl>
                            <dt>${data.loanAmount}</dt>
                            <dd>借款金额(元)</dd>
                        </dl>
                        <dl>
                            <dt>${data.loanExpire}期</dt>
                            <dd>借款期限</dd>
                        </dl>
                    </div>
                </header>
                <div class="date-box">
                    <div class="date-item flex1">
                        <p class="date-title">成功投标</p>
                        <div class="date-progress">
                            <i></i>
                            <span></span>
                        </div>
                    </div>
                    <div class="date-item flex3">
                        <p class="date-title">借款协议生效次日起息</p>
                        <div class="date-progress">
                            <i class="r50"></i>
                            <span></span>
                        </div>
                    </div>
                    <div class="date-item flex2">
                        <p class="date-title right">每月收到回款</p>
                        <div class="date-progress">
                            <i class="right"></i>
                            <span class=""></span>
                        </div>
                    </div>
                </div>
    
                <div class="item mt20 noBorder">
                    <div>
                        <span class="yellow"><i class="bigger">${data.chargeRate}</i>%</span>
                        <span>推荐服务费率(年化)</span>
                    </div>
                </div>
                <div class="item mt20 link">
                    <div>
                        <a data-href="securityMechanism.html" href="javascript:void(0)" class="bridgeRedirect">
                            <i></i>
                            <span>保障机制</span>
                        </a>
                    </div>
                </div>
                <div class="item link">
                    <div>
                        <a data-href="loanRecord" href="javascript:void(0)" class="redirectApp">
                            <i></i>
                            <span>出借记录</span>
                        </a>
                    </div>
                </div>
                <div class="item link">
                    <div>
                        <a data-href="/financialPlanner/rules/commonProblemFinacial.html" data-type="others" href="javascript:void(0)" class="bridgeRedirect">
                            <i></i>
                            <span>常见问题</span>
                        </a>
                    </div>
                </div>
                <div class="tips">网贷有风险 出借需谨慎</div>
                <div class="surplusAmount">剩余：<span>${data.surplusAmount}</span>元</div>
            </div>`
            }
            return template;
        },
        bindEvent:function (loanCode) {
            $(document).on("click", "#notice", function () {
               Tools.dialogAlert({
                   content:"此年利率不等同于收益率（由于借<br/>款人采用等额本息法每月还款），<br/>若想达到等同于此利率的收益，建<br/>议您循环出借。",
                   confirm:"知道了"
               })
            });
            $(document).on("click", ".bridgeRedirect", function () {
                let url = $(this).attr("data-href"),
                    dataType = $(this).attr("data-type"),
                    pathArr = location.pathname.split("/"),
                    path = '';
                pathArr.pop();
                path = pathArr.join("/");
                let gotoUrl = dataType === 'others'?(location.origin + '/h5static/'+ url):(location.origin + path + '/' + url);
                Tools.bridgeRedirect(`${gotoUrl}`);
            });
            $(document).on("click", ".redirectApp", function () {
                let url = $(this).attr("data-href");
                Tools.bridgeRedirect(url,{
                    page:"loanRecord",
                    pageParams:{
                        id:loanCode
                    }
                });
            });
        },
        init:function () {
            let params = Tools.queryUrl(location.href),
                loanCode = params.loanCode,
                self = this;
            if(!loanCode){
                return Tools.toast("缺少参数loanCode")
            }
            // var data = {
            //     "data":{
            //         "loanName":"购车(女_35岁_北京市市辖区)",
            //         "loanRatio":12,
            //         "loanExpire":36,
            //         "profit":null,
            //         "surplusAmount":62237.44,
            //         "chargeRate":1,
            //         "minBuyAmount":100,
            //         "maxBuyAmount":10000,
            //         "loanAmount":62237.44,
            //         "purchasedAmount":0,
            //         "loanPurpose":"购车",
            //         "loanCode":"9654574",
            //         "loanStatus":1,
            //         "category":40,
            //         "computeMode":"等额本息",
            //         "productId":300000015224526,
            //         "loanId":228,
            //         "lastBuyTime":1558604421000,
            //         "lastPayTime":1558604721000,
            //         "infoPublishUrl":"https://m.creditease.cn/?channel=***&visitor=***&ecif=***#/infoDiscover/basicInfo",
            //         "loanInfoUrl":"http://10.143.143.175:8001/h5static/compliance/page/loanDetailsSB.html?loanCode=9654574"
            //     },
            //     "msg":"",
            //     "code":"1"
            // };
            // let info = data.data;
            // let html = self.renderHtml(info);
            // wrapperDom.html(html);
            //
            // self.calData.rate = CALC.add(info.annualRate, info.variableAnnualRate || 0);
            // self.calData.chargeRate = CALC.add(info.baseChargeRate, info.floatChargeRate || 0);
            // self.calData.period = info.productPeriod;
            //
            // Tools.setTitle(info.loanName);
            //
            // self.bindEvent(loanCode);
            // return false;
            this.getData(loanCode).then(function (data) {
                if(data.code == "0"){
                    return Tools.toast(data.msg)
                }
                if(data.data){
                    let info = data.data;
                    let html = self.renderHtml(info);
                    wrapperDom.html(html);

                    self.calData.rate = CALC.add(info.annualRate, info.variableAnnualRate || 0);
                    self.calData.chargeRate = CALC.add(info.baseChargeRate, info.floatChargeRate || 0);
                    self.calData.period = info.productPeriod;

                    Tools.setTitle(info.loanName);

                    self.bindEvent(loanCode);

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
