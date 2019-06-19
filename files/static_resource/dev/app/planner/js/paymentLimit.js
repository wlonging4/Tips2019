import "../css/paymentLimit.less";
import $ from 'jquery';
import {Tools,G} from "COMMON/js/common";

let html = document.documentElement;
let originFS = parseInt(html.style.fontSize);
let tempFs = originFS;
let count = 0;
while(true) {
    let realFs = parseInt(window.getComputedStyle(html).fontSize);
    let delta = realFs - tempFs;
    if (Math.abs(delta) >1)
    {
        if (delta > 0) originFS-=1; else originFS+=1;
        html.setAttribute('style', 'font-size:'+originFS + 'px!important');
        //alert(originFS+'origin_'+tempFs+'tempFs_'+realFs+'realFs');
    } else
        break;

    /*if (count++ > 5)
        break*/
}

var paymentLimitShare={
    init:function(titleStr){
        let self=this;
        self.headerShareBtn();
        Tools.setTitle(titleStr);
    },
    headerShareBtn:function(){
        let self=this;
        let host=window.location.host;
        let options={};
        options.shareTitle="星火金服-支付限额表";
        options.shareContent="星火金服，宜信®旗下金融服务平台";
        options.shareImageUrl="https://"+host+"/h5static/financialPlanner/images/captainInvite/defaultHeadPortrait.jpg";
        options.shareUrl="https://"+host+"/h5static/app/planner/paymentLimit.html";
        let shareOptions={"titleTranslate":"0","titleBack": "1","titleClose": "0","titleShare":options};
        Tools.shareHeaderBtn(shareOptions);
    }
};
paymentLimitShare.init("星火金服-支付限额表");


//获取限额列表
//cyberback网银支付; kuaijie快捷支付
var dataUrl=G.base + '/quickpay/payBankList';
$.ajax({
    url:dataUrl,
    data:{accessMode:'kuaijie'},
    type:'POST',
    success:function (res) {
        if(!res.code){Tools.toast('获取列表信息失败！');return}
        var str1='';
        str1 = res.data.map((item)=>
            `<li>
                <span>
                    <img src="${item.imageUrl}" alt="">
                    <i>${item.bankName}</i>
                </span>
                <span>${item.bankAmount}</span>
                <span>${item.upperlimitsecond}</span>
                <span>${item.singleDayLimit}</span>
            </li>`).join("");
        $('#main-ul1').html(str1);
    }
})
.then(function () {
    $.ajax({
        url:'/webapi/quickpay/payBankList',
        data:{accessMode:'cyberbank'},
        type:'POST',
        success:function (res) {
            if(!res.code){Tools.toast('获取列表信息失败！');return}
            var str2='';
            str2 = res.data.map((item)=>
                `<li>
                <span>
                    <img src="${item.imageUrl}" alt="">
                    <i>${item.bankName}</i>
                </span>
                <span>${item.upperlimitsecond}</span>
                <span>${item.singleDayLimit}</span>
            </li>`).join("");
            $('#main-ul2').html(str2);
        }
    })
})
.then(function () {
    //document.querySelector('body').style.visibility = "visible";
    //切换列表展示
    $('.head-menu ul li').on('click',function () {
        $(this).addClass('act').siblings().removeClass('act');
        var ind=$('.head-menu ul li').index(this);
        ind?$('.head-flow').addClass('mov'):$('.head-flow').removeClass('mov');
        $('.main-mod').eq(ind).addClass('blk').siblings().removeClass('blk');
    });
});
