import "../css/productDetails.less"
import $ from 'jquery'
import {Tools, G, Dialog, CALC} from "COMMON/js/common";
import IosSelect from "COMMON/js/iosSelect";


/**
 * -------------------------------------------test----------------开发
 * **/

// let loginData = {
//     "appReqData": {
//         "productId": 3000001879
//     },
//     "appVersion": "3.0.1",
//     "appid": "8aead9a64cc04916014cc049169d0000",
//     "deviceIdentifier": "finance_c10d9599-1c6d-492b-8ef7-32dad950cd10",
//     "orgCode": "3636346132616633316162613461363338623463",
//     "orgId": "h7kuLlAS4mXevdJDxYOOYA==",
//     "sign": "F0385CBC3531B5814DEA7B51796EE529",
//     "token": "4ac53d20ae274817e171294b63bea6e0:1",
//     "version": "2.0.0"
// }
//
// function test() {
//     return Tools.AJAX({
//         url: G.base + "/capp/product/detail.ason",
//         type:"post",
//         data:{
//             data:'{"src":"5","sign":"7E52E38820B4B5F10292C3A8836C10F9","deviceVersion":"Android 9","versionName":"3.0.2","version":"2.0.0","deviceName":"MI MAX 3","orgId":"TROSR4VaMZAZyVqdqzVkvw==","versionCode":180,"token":"eac36e0832314f206a7d5bb00563ebd4:1","deviceIdentifier":"finance_2876b208-f735-4ab7-963b-d64d016fd347","orgCode":"6338323330646362633762653835656537386232","appid":"8aead9a64cc04916014cc049169d0000","sdkVersion":"28","appReqData":{"productId":"13920"}}'
//         }
//     })
// }
/**
 * -------------------------------------------test----------------开发 end
 * **/
function isIOS() {
    var u = navigator.userAgent;
    return !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)
}
let wrapperDom = $("#wrapper"),
    returnDate = (function () {
        let result = [];
        for(let i = 0; i < 31; i++){
            let temp = {
                id:i + 1,
                value:`每月${i + 1}日`
            }
            result.push(temp)
        }
        return result
    })(),
    w = $('body').width(),
    PRODUCTDETAILS = {
        calData:{
            "productCode": "",
            "buyAmount": "",//出借金额
            "productPeriod":"2",
            "periodCallDay":0,//回款日
            "periodCallAmount":"",//回款金额
            "baseChargeRate":0,
            "floatChargeRate":0
        },
        isSelectShow:false,//判断下拉框唯一性
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
                        <p class="product-label"><em>月回款</em></p>
                    </div>
                    <div class="product-info">
                        <dl>
                            <dt>${data.productPeriod}期</dt>
                            <dd>锁定期</dd>
                        </dl>
                        <dl>
                            <dt>${Tools.formatNumber(data.minAmout)}-${Tools.formatNumber(data.maxAmount)}</dt>
                            <dd>出借金额(元)</dd>
                        </dl>
                    </div>
                </header>
                <div class="item noBorder">
                    <div>
                        <span class="yellow">${data.floatChargeRate ? `<i class="bigger">${CALC.add(data.baseChargeRate, data.floatChargeRate)}</i>%`: `<i class="bigger">${data.baseChargeRate}</i>%`}</span>
                        <span>推荐服务费率(年化)</span>
                    </div>
    
                </div>
                <div class="item mt20">
                    <div>
                        <span>${data.monthCallDate}</span>
                        <span>月回款日期</span>
                    </div>
    
                </div>
                <div class="item">
                    <div>
                        <span>${data.monthCallAmout}</span>
                        <span>月回款金额</span>
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
                        <span>${data.serviceCharge}</span>
                        <span>手续费</span>
                    </div>
                </div>
                 <div class="item noBorder">
                    <div>
                        <span class="small">${data.callDateType}</span>
                        <span>回款</span>
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
                        <dl class="calculatorItem clearfix inputItem">
                            <dd id="selectDate" class="select" data-id="1"><span class="select-val">请选择回款日期</span><i class="arrow"></i></dd>
                            <dt>月回款日期</dt>
                        </dl>
                        <dl class="calculatorItem clearfix inputItem">
                            <dd><span class="unit">元</span><i class="input-del"></i><input type="number" name="periodCallAmount" id="periodCallAmount" placeholder="请输入月回款金额"  maxlength="8" oninput="this.value=this.value.replace(/\\D/g,'');if (this.value.length > this.maxLength) this.value = this.value.slice(0, this.maxLength);"></dd>
                            <dt>月回款金额</dt>
                        </dl>
                        <dl class="calculatorItem clearfix">
                            <dd class="red"><strong id="returnAmount">0.00</strong>元</dd>
                            <dt>客户收益</dt>
                        </dl>
                        <dl class="calculatorItem clearfix" style="overflow: hidden">
                            <dd class="red"><strong id="charge">0.00</strong>元</dd>
                            <dt>推荐服务费</dt>
                        </dl>
                        <!--<div class="submitBox">-->
                            <!--<a href="javascript:void(0)" id="calculatorBtn">开始计算</a>-->
                        <!--</div>-->
                        <div id="selectBox" style="overflow: hidden"></div>`,

                    cancel:function () {
                        d.close().remove();
                        self.resetCalData();
                    },
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

            $(document).on("input change", ".inputItem input", function () {
                let name = $(this).attr("name"), v = $(this).val();
                self.calData[name] = Number(v);
            });
            $(document).on("focus", ".inputItem input", function () {
                $(this).siblings("i.input-del").show();
            });
            $(document).on("blur", ".inputItem input", (function () {
                var timer;
                return function () {
                    document.body.scrollTop = 0;
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
                let buyAmount = self.calData.buyAmount,
                    productPeriod = self.calData.productPeriod;
                if(buyAmount >= 10000){
                    let maxNum = Number(CALC.div(buyAmount, productPeriod).toFixed(2));
                    $("#periodCallAmount").val('').attr("placeholder", `${'100~' + parseInt(maxNum)}`)
                }else{
                    $("#periodCallAmount").val('').attr("placeholder", `请输入月回款金额`)
                }

            });
            /**
             * 校验出借金额方法
             * **/
            function verifyBuyamount() {
                let flag = true, buyAmount = self.calData.buyAmount, buyAmountDom = $("#buyAmount");
                if(buyAmount === ''){
                    flag = false;
                    return Tools.toast("请先输入出借金额", 2000, function () {
                        if(!isIOS()){
                            buyAmountDom.focus();
                        }
                    }) && flag;
                }
                if(buyAmount < 10000){
                    flag = false;
                    return Tools.toast("出借金额不能小于10,000元", 2000, function () {
                        if(!isIOS()){
                            buyAmountDom.focus();
                        }
                    }) && flag;
                }
                if(buyAmount > 500000){
                    flag = false;
                    return Tools.toast("出借金额不能大于500,000元", 2000, function () {
                        if(!isIOS()){
                            buyAmountDom.focus();
                        }
                    }) && flag;
                }
                return flag;
            }
            /**
             * 校验回款金额方法
             * **/
            function verifyPeriod() {
                let flag = true,
                    periodCallDay = self.calData.periodCallDay,
                    selectDateDom = $("#selectDate");
                if(!periodCallDay){
                    flag = false;
                    return Tools.toast("请选择月回款日期", 2000, function () {
                        // $("#periodCallAmount").blur();
                        // selectDateDom.focus().trigger("click");
                    }) && flag;
                }
                return flag;
            }

            $(document).on("focus", ".inputItem input", function () {
                $("#selectBox").html("");
                self.isSelectShow = false;
                $("#selectDate i").removeClass("active");
            });

            $(document).on("touchend", "#selectDate", function (e) {
                let selectBtn = $(this);
                e.preventDefault();
                e.stopPropagation()
                if(!verifyBuyamount()){

                    return false;
                }
                if(!self.isSelectShow){
                    self.isSelectShow = true;
                    $("#selectDate i").addClass("active");
                    let id = selectBtn.attr("data-id");
                    new IosSelect(1, [returnDate],
                        {
                            container: '#selectBox',
                            addClassName:"iosselect-return-date",
                            itemShowCount: 3,
                            oneLevelId: id,
                            callback: function (data) {
                                let showDom = selectBtn.find("span");
                                self.isSelectShow = false;
                                $("#selectDate i").removeClass("active");
                                selectBtn.attr("data-id", data.id);
                                self.calData.periodCallDay = data.id;
                                showDom.html(data.value);
                            },
                            fallback:function () {
                                self.isSelectShow = false;
                                $("#selectDate i").removeClass("active");
                            }
                        });

                    return false;
                }

            });
            $(document).on("focus", "#periodCallAmount", function () {
                if(!verifyBuyamount()){
                    return ;
                }
                if(!verifyPeriod()){
                    return ;
                }
            });
            /**
             * 计算收益和服务费方法
             * **/
            function calculator(data) {
                Tools.AJAXTOKEN({
                    url:G.base + "/capp/product/getYybCharge.ason",
                    type:"post",
                    data:data
                }).then(function (data) {
                    if(data.code == "0"){
                        return Tools.toast(data.msg)
                    }
                    let info = data.data;
                    $("#returnAmount").html(info.returnAmount);
                    $("#charge").html(info.charge);
                });
            }
            $(document).on("input change", "#periodCallAmount", function () {
                let periodCallAmount = self.calData.periodCallAmount,
                    buyAmount = self.calData.buyAmount,
                    productPeriod = self.calData.productPeriod;
                let maxNum = Number(CALC.div(buyAmount, productPeriod).toFixed(2));
                if(100 <= periodCallAmount && periodCallAmount <= maxNum){
                    calculator(self.calData);
                }else{
                    $("#returnAmount").html("0.00");
                    $("#charge").html("0.00");
                }
                if(periodCallAmount > maxNum){
                    return $(this).val(parseInt(maxNum)) && $(this).trigger("change") && Tools.toast(`月回款金额不能大于${parseInt(maxNum)}元`, 2000, function () {
                        calculator(self.calData);
                    });
                }
            });


            /**
             * 分享
             * **/
            $(document).on("click", "#shareBtn", function () {
                Tools.SHARE({
                    "shareType":"all",
                    "shareTitle":"星火金服-宜信®优质债权",
                    "shareContent": `${productInfo.productName}，参考年回报率${productInfo.variableAnnualRate ? `${CALC.add(productInfo.annualRate , productInfo.variableAnnualRate) + '%'}`:`${productInfo.annualRate}%`}，${productInfo.minAmout}元起，${productInfo.productPeriod}期，每月自定义回款计划。`,
                    "shareImageUrl": productInfo.avatar,
                    "shareUrl": productInfo.productUrl
                })
            });


        },
        resetCalData:function () {
            this.calData.buyAmount = "";
            this.calData.periodCallDay = 1;
            this.calData.periodCallAmount = "";
        },
        init:function () {
            let params = Tools.queryUrl(location.href),
                productId = params.productId, self = this;
            if(!productId){
                return Tools.toast("缺少参数productId")
            }
            // return this.bindEvent();
            this.getData(productId).then(function (data) {

                if(data.code == "0"){
                    return Tools.toast(data.msg)
                }
                if(data.data){
                    let info = data.data;
                    let html = self.renderHtml(info);
                    wrapperDom.html(html);

                    self.calData.productCode = info.productCode;
                    self.calData.productPeriod = info.productPeriod;
                    self.calData.baseChargeRate = info.baseChargeRate;
                    self.calData.floatChargeRate = info.floatChargeRate || 0;

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



