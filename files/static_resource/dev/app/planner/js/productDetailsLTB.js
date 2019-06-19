import "../css/productDetails.less"
import $ from 'jquery'
import {Tools, G, Dialog, CALC} from "COMMON/js/common";
/**
 * -------------------------------------------test----------------开发
 * **/

// let loginData = {"src":"5","sign":"7E08073CB870871515558ADC595241D5","deviceVersion":"Android 9","versionName":"3.0.2","version":"2.0.0","deviceName":"MI MAX 3","orgId":"TROSR4VaMZAZyVqdqzVkvw==","versionCode":180,"token":"f2111bb3547d27e8c86fb8e895fcbcb2:1","deviceIdentifier":"finance_2876b208-f735-4ab7-963b-d64d016fd347","orgCode":"6231613462643963343233343133336332613864","appid":"8aead9a64cc04916014cc049169d0000","sdkVersion":"28","appReqData":{"productId":"300000338235934"}};
//
// function test() {
//     return Tools.AJAX({
//         url: G.base + "/capp/product/detail.ason",
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
        getData:function (productId) {
            // return test();
            return Tools.AJAXTOKEN({
                url:G.base + "/capp/product/detail.ason",
                type:"post",
                data:{
                    productId:productId
                }
            });
        },
        renderHtml:function (data) {
            let template = ``;
            if(data){
                template = `<div class="content">
                <header>
                    <div class="product-feature">
                        <p class="product-rate">${data.annualRate}<span>${data.variableAnnualRate ? `%+${data.variableAnnualRate}%`: "%"}</span></p>
                        <p class="product-rate-title"><span>参考年回报率</span><i id="notice">?</i></p>
                        <p class="product-label"><em>宜信优质债权</em></p>
                    </div>
                    <div class="product-info">
                        <dl>
                            <dt>${data.productPeriod}</dt>
                            <dd>出借天数(天)</dd>
                        </dl>
                        <dl>
                            <dt>${Tools.formatNumber(data.minAmout)}-${Tools.formatNumber(data.maxAmount)}</dt>
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
                        <p class="date-content">${data.effectDate}</p>
                    </div>
                    <div class="date-item flex3">
                        <p class="date-title right"><span>授权到期日</span></p>
                        <div class="date-progress">
                            <i class="right r50"></i>
                            <span></span>
                        </div>
                        <p class="date-content right"><span>${data.callDate}</span></p>
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
                        <span class="yellow">${data.floatChargeRate ? `<i class="bigger">${CALC.add(data.baseChargeRate, data.floatChargeRate)}</i>%`: `<i class="bigger">${data.baseChargeRate}</i>%`}</span>
                        <span>推荐服务费率(年化)</span>
                    </div>
                </div>
                <div class="item mt20">
                    <div>
                        <span>${data.callDateType}</span>
                        <span>到期回款方式</span>
                    </div>
                </div>
                <div class="item">
                    <div>
                        <span>${data.currency}</span>
                        <span>币种</span>
                    </div>
    
                </div>
                <div class="item">
                    <div>
                        <span>${data.lockupPeriod}</span>
                        <span>锁定期</span>
                    </div>
                </div>
                <div class="item noBorder">
                    <div>
                        <span>${data.serviceCharge}</span>
                        <span>手续费</span>
                    </div>
                </div>
                <div class="item mt20 noBorder link">
                    <div>
                        <a data-href="securityMechanism.html" href="javascript:void(0)" class="bridgeRedirect">
                            <i></i>
                            <span>保障机制</span>
                        </a>
                    </div>
                </div>
                <div class="tips">网贷有风险 出借需谨慎</div>

            </div>
            <div class="footer fix_iphonex">
                <a href="javascript:void (0)" class="shareBtn" id="shareBtn">立即分享</a>
                <!--<a href="javascript:void (0)" class="calculator" id="calculator"><i></i>计算器</a>-->
            </div>`
            }
            return template;
        },
        bindEvent:function (productInfo) {
            let self = this;

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

            //计算器
            var calTimer = null;
            $(document).on("click", "#calculator", function () {
                let d = Dialog({
                    id:"cal",
                    skin:"calculator",
                    title:"服务费计算器",
                    padding:0,
                    width:w,
                    content:
                        `<dl class="calculatorItem clearfix inputItem">
                            <dd><span class="unit">元</span><i class="input-del"></i><input type="number" name="buyAmount" autofocus id="buyAmount" placeholder="请输入出借金额" maxlength="8"  oninput="this.value=this.value.replace(/\\D/g,'');if (this.value.length > this.maxLength) this.value = this.value.slice(0, this.maxLength);"></dd>

                            <dt>出借金额</dt>
                        </dl>
                        <dl class="calculatorItem clearfix">
                            <dd class="red"><strong id="returnAmount">0.00</strong>元</dd>
                            <dt>客户收益</dt>
                        </dl>
                        <dl class="calculatorItem clearfix" style="overflow: hidden">
                            <dd class="red"><strong id="charge">0.00</strong>元</dd>
                            <dt>推荐服务费</dt>
                        </dl>`,
                    onshow:function () {
                        $(".ui-popup-backdrop").addClass("popupGradient");

                        if(isIOS()){
                            $(".tips").addClass("show-modal");
                            calTimer = setInterval(function(){
                                document.body.scrollTop = document.body.scrollHeight;
                            }, 150);
                        }else{
                            $("body").addClass('modal-open');
                            $(".ui-popup[aria-labelledby='title:cal']").css({
                                position:'fixed',
                                bottom:'0'
                            });
                        }
                    },
                    onbeforeremove:function () {
                        if(isIOS()){
                            clearInterval(calTimer);
                            $(".tips").removeClass("show-modal");

                        }else{
                            $("body").removeClass('modal-open');
                        }
                    }
                });
                d.showModal();
            });

            $(document).on("focus", ".inputItem input", function () {
                $(this).siblings("i.input-del").show();
            });
            $(document).on("blur", ".inputItem input", (function () {
                var timer;
                return function () {
                    $(this).attr("data-del", 0);
                    timer = setTimeout(()=>{
                        if($(this).attr("data-del") == 0){
                            $(this).siblings("i.input-del").hide();
                        }
                    }, 200)
                }
            })());
            $(document).on("touchend", ".input-del", function (e) {
                let inputDom = $(this).siblings("input").eq(0);
                inputDom.val('').attr("data-del",1).trigger("change").focus();
                e.stopPropagation();
                return false;
            });


            $(document).on("input change", "#buyAmount", function () {
                let v = $(this).val(),
                    returnAmountDom = $("#returnAmount"),
                    chargeDom = $("#charge"),
                    rate = self.calData.rate,
                    chargeRate = self.calData.chargeRate,
                    period = self.calData.period;
                if(v){
                    let returnAmount = CALC.div(CALC.mul(CALC.mul(v, period), rate), 36500).toFixed(2),
                        charge = CALC.div(CALC.mul(CALC.mul(v, period), chargeRate), 36500).toFixed(2);
                    returnAmountDom.html(returnAmount);
                    chargeDom.html(charge);
                }else{
                    returnAmountDom.html('0.00');
                    chargeDom.html('0.00');
                }


            });

            //分享按钮
            $(document).on("click", "#shareBtn", function () {
                Tools.SHARE({
                    "shareType":"all",
                    "shareTitle":"星火金服-宜信®优质债权",
                    "shareContent": `${productInfo.productName}，参考年回报率${productInfo.variableAnnualRate ? `${productInfo.annualRate + '%+' + productInfo.variableAnnualRate + '%'}`:`${productInfo.annualRate}%`}，${productInfo.minAmout}元起。`,
                    "shareImageUrl": productInfo.avatar,
                    "shareUrl": productInfo.productUrl
                })
            });
        },
        init:function () {
            let params = Tools.queryUrl(location.href),
                productId = params.productId,
                self = this;
            if(!productId){
                return Tools.toast("缺少参数productId")
            }
            this.getData(productId).then(function (data) {

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

                    Tools.setTitle(info.productName);

                    self.bindEvent(info);

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
