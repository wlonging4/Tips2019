import "../css/productDetailsXXL.less"
import $ from 'jquery'
import {Tools, G, Dialog, CALC} from "COMMON/js/common";




/**
 * -------------------------------------------test----------------开发
 * **/


// function test() {
//     return Tools.AJAX({
//         url: G.base + "/capp/sesame/detail.ason",
//         type:"post",
//         data:{
//             data:'{"appVersion":"3.1.0","src":"5","appReqData":{"sesameCode":"zma154995181902112902"},"version":"2.0.0","token":"537e3679e27dc6485182ef27e65301c6:1","sign":"024DFC0294341CB52F1D59B56A6D2396","appid":"8aead9a64cc04c8b014cc04c8b1e0000"}'
//         }
//     })
// }
/**
 * -------------------------------------------test----------------开发
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
        getData:function (sesameCode) {
            // return test();
            return Tools.AJAXTOKEN({
                url:G.base + "/capp/sesame/detail.ason",
                type:"post",
                data:{
                    sesameCode:sesameCode
                }
            });
        },
        renderHtml:function (data) {
            let template = ``;
            if(data){
                template = `<div class="content">
                <header>
                    
                    <div class="product-feature">
                        <p class="product-rate">${data.expectAnnualRate.indexOf("~") > 0 ? data.expectAnnualRate.replace(/(.*)~(.*)/g,"$1<span>%</span>~$2<span>%</span>") :`${data.expectAnnualRate}<span>%</span>`}</p>
                        <p class="product-rate-title"><span>预期年化收益率</span></p>
                    </div>
                    <div class="product-info">
                        <dl>
                            <dt><span>${data.sesameTerm}</span>${data.sesameTermUnitStr}</dt>
                            <dd>期限</dd>
                        </dl>
                        <dl>
                            <dt><span>${data.minSubcribeAmount}</span>${data.currencyUnit}</dt>
                            <dd>起投金额(元)</dd>
                        </dl>
                    </div>
                    <div class="product-status">${data.sesameRaiseStatus}</div>
                </header>
                ${data.sesameRemark ? `<div class="product-comment">
                    <p><span>点评</span>${data.sesameRemark}</p>
                </div>`:''}
                ${data.cashBack ? `<div class="item mt20 noBorder">
                    <div>
                        <span>${data.cashBack}</span>
                        <span class="yellow">返现活动</span>
                    </div>
    
                </div>`:''}
                ${data.sesameinfo.map((item, index)=>{
                    let len = data.sesameinfo.length;
                    return `<div class="item ${index === 0 ?`mt20`:`${len === index + 1 ? ` noBorder`:``}`}"><div><span ${index === 1 ? 'class="small"':''}>${item.value || '' }</span><span>${item.key}</span></div></div>`
                }).join('')}
                <div class="item mt20 link">
                    <div>
                        <a data-href="productLinkContent.html?type=bright&sesameCode=${data.sesameCode}" href="javascript:void(0)" class="bridgeRedirect">
                            <i></i>
                            <span>项目亮点</span>
                        </a>
                    </div>
                </div>
                ${data.sesameMaterials && data.sesameMaterials.length > 0 ? `${data.sesameMaterials.map((item, index) => {
                    return `<div class="item link">
                    <div>
                        <a data-href="${item.materialUrl}" href="javascript:void(0)" class="bridgeRedirect">
                            <i></i>
                            <span>${item.materialName}</span>
                        </a>
                    </div>
                </div>`
                }).join('')}`:''}
                <div class="item noBorder link">
                    <div>
                        <a data-href="productLinkContent.html?type=risk&sesameCode=${data.sesameCode}" href="javascript:void(0)" class="bridgeRedirect">
                            <i></i>
                            <span>风险揭示</span>
                        </a>
                    </div>
                </div>
                <div class="tips">市场有风险 投资需谨慎</div>
            </div>`;
            }
            return template;
        },
        bindEvent:function () {
            let self = this;

            $(document).on("click", ".bridgeRedirect", function () {
                let url = $(this).attr("data-href"),
                    pathArr = location.pathname.split("/"),
                    path = '';
                pathArr.pop();
                path = pathArr.join("/");
                if(url.indexOf('http') > -1){
                    Tools.bridgeRedirect(url);
                }else{
                    Tools.bridgeRedirect(`${location.origin + path + '/' + url}`);
                }
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
                                <dd><span class="unit">元</span><i class="input-del"></i><input type="number" autofocus name="buyAmount" id="buyAmount" placeholder="请输入出借金额" maxlength="8"  oninput="this.value=this.value.replace(/\\D/g,'');if (this.value.length > this.maxLength) this.value = this.value.slice(0, this.maxLength);"></dd>
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


            var winHeight = $(window).height(); //获取当前页面高度
            $(window).resize(function() {

                var thisHeight = $(this).height();  //窗体变化后的高度
                if (winHeight - thisHeight > 50) {

                    $('body').css('height', winHeight + 'px');
                } else {

                    $('body').css('height', '100%');
                }
            });


            $(document).on("input change", "#buyAmount", function () {
                let v = $(this).val(),
                    returnAmountDom = $("#returnAmount"),
                    chargeDom = $("#charge"),
                    rate = self.calData.rate,
                    chargeRate = self.calData.chargeRate,
                    period = self.calData.period;
                if(v){
                    let returnAmount;
                    if(rate.indexOf('~') > -1){
                        let minRate = rate.replace(/(.*)~(.*)/g,'$1'), maxRate = rate.replace(/(.*)~(.*)/g,'$2');
                        let minReturn = CALC.div(CALC.mul(CALC.mul(v, period), minRate), 1200).toFixed(2),
                            maxReturn = CALC.div(CALC.mul(CALC.mul(v, period), maxRate), 1200).toFixed(2);
                        returnAmount = `${minReturn}-${maxReturn}`
                    }else{
                         returnAmount = CALC.div(CALC.mul(CALC.mul(v, period), rate), 1200).toFixed(2);

                    }
                    let charge = CALC.div(CALC.mul(CALC.mul(v, period), chargeRate), 1200).toFixed(2);
                    returnAmountDom.html(returnAmount);
                    chargeDom.html(charge);
                }else{
                    returnAmountDom.html('0.00');
                    chargeDom.html('0.00');
                }


            });
        },
        init:function () {
            let params = Tools.queryUrl(location.href),
                sesameCode = params.sesameCode, self = this;
            if(!sesameCode){
                return Tools.toast("缺少参数sesameCode")
            }
            this.getData(sesameCode).then(function (data) {
                if(data.code == "0"){
                    return Tools.toast(data.msg)
                }
                if(data.data){
                    let info = data.data;
                    let html = self.renderHtml(info);
                    wrapperDom.append(html);
                    self.calData.rate = info.expectAnnualRate;
                    self.calData.chargeRate = info.chargeRate;
                    self.calData.period = info.sesameTerm;

                    Tools.setTitle(info.sesameName);

                    self.bindEvent();

                }
            })
        }
    };
$(document).ready(function () {
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
});


