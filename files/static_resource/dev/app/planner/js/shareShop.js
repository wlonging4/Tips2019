import "../css/shareShop.less";
import $ from "jquery";
import {Tools,G} from "COMMON/js/common";

~(function (window,document) {
    //打开获取店铺信息
    let urlArgs=Tools.queryUrl(decodeURI(location.href));
    if(!urlArgs.storeCode){
        Tools.toast('参数错误');
        return;
    }
    //店铺code id
    let storeCode=urlArgs.storeCode;
    let storeId;
    let originData;
    Tools.AJAX({
        url: G.base + "/store/getStoreByStoreCode",
        type:"post",
        data:{
            "storeCode":storeCode
        },
        success:function (res) {
            if(res.code!='1'){
                Tools.toast('接口请求失败，请刷新重试！');return;
            }
            originData=res.data;
            //店铺信息绑定
            storeId=originData.id;
            $('#userHead').attr('src',originData.accountimg);
            //姓名字数超过8改变字号大小
            //console.log(originData.realName.length)
            if(originData.realName.length > 8 && originData.realName.length <= 10){
                $('.userName p').addClass('mini2');
            }
            if(originData.realName.length > 10){
                $('.userName p').addClass('mini1');
            }
            $('#userName').html(originData.realName);
            /*$('#userTel').html(originData.tel.replace(/^(\d{3})\d*(\d{4})$/,'$1****$2'));*/
            $('#userTel').html(originData.tel);
            $('.head-des').html(originData.introduction);
            $('#phone').attr('href','tel:'+originData.tel);
            if(originData.regRedEnveAmount){
                $('.login-redbag').html("注册即得总面值 <span>"+originData.regRedEnveAmount+" </span> 元红包");
                $('.okay-redbag').html("您已获得总面值 <span id='shadow-num'>"+originData.regRedEnveAmount+" </span> 元红包");
            }else{
                $('.login-redbag').html("为您提供全球资产配置服务");
                $('.okay-redbag').html(" ");
            }
            //产品信息绑定
            if(!originData.result.length){
                $('.product').hide();
            }else{
                $('.product').show();
                var strProList='';
                strProList = originData.result.map((item)=>
                `<li>
                    <div class="pro_tit">${item.productName}</div>
                    <div class="pro_left">
                        <div class="pro_left_rate">${item.annualRate}<em>%</em></div>
                        <div class="pro_des">参考年回报率</div>
                    </div>
                    <div class="pro_right">
                        <div class="pro_right_rate">${item.productPeriod}<em>天</em></div>
                        <div class="pro_des">出借天数</div>
                    </div>
                </li>`).join("");
                $('#proList').html(strProList);
            }
        }
    });

    //ipt1:手机号动态分割xxx_xxxx_xxxx
    var ipt1Len=0;
    $('#ipt1').on('input',function () {
        var len=this.value.length;
        len?$('.delete1').removeClass('hide'):$('.delete1').addClass('hide');
        if(len>ipt1Len){
            //输入
            if(len==3||len==8){this.value=this.value+' ';}
        }else{
            //回删
            if(len==3||len==8){this.value=this.value.slice(0,len-1);len=this.value.length;}
        }
        ipt1Len=len;
        $(this).val(this.value);
    });

    //ipt2:密码框的的输入
    $('#ipt2').on('input',function () {
        var len=this.value.length;
        len?$('.eye').removeClass('hide'):$('.eye').addClass('hide');
        len?$('.delete2').removeClass('hide'):$('.delete2').addClass('hide');
    });
    $('.eye').on('click',function () {
        if($(this).hasClass('eyeSee')){
            $('#ipt2').prop('type','password');$(this).removeClass('eyeSee')
        }else{
            $('#ipt2').prop('type','text');$(this).addClass('eyeSee')
        }
    });

    //ipt3:图片验证码
    $('#ipt3').on('input',function () {
        var len=this.value.length;len?$('.delete3').removeClass('hide'):$('.delete3').addClass('hide');
    });

    //ipt4:短信验证码
    $('#ipt4').on('input',function () {
        //输入判断是否为连续六位数字
        var str = this.value.replace(/\D/g, "");this.value=str;
        var len=this.value.length;len?$('.delete4').removeClass('hide'):$('.delete4').addClass('hide');
    });

    //输入框delete按钮
    $('.delete1').on('mousedown',function (e) {
        $('#ipt1').val('');ipt1Len=0;$(this).addClass('hide');
        e.stopPropagation();
    });
    $('.delete2').on('mousedown',function () {
        $('#ipt2').val('').prop('type','password');$(this).addClass('hide');$('.eye').addClass('hide').removeClass('eyeSee');
    });
    $('.delete3').on('mousedown',function () {
        $('#ipt3').val('');$(this).addClass('hide');
    });
    $('.delete4').on('mousedown',function () {
        $('#ipt4').val('');$(this).addClass('hide');
    });

    //focus_blur状态切换
    $('input').on('focus',function () {
        $(this).parent().addClass('lineGolden');
        if($(this).val()){
            $(this).parent().find('.delete').removeClass('hide');
        }
    }).on('blur',function () {
        $(this).parent().removeClass('lineGolden');
        if($(this).val()){
            $(this).parent().find('.delete').addClass('hide');
        }
    });

    //环状倒计时
    //计算右边角度
    let iDeg = 0;
    //计算左边角度
    let jDeg = 0;
    //计时器
    let count = 0;
    let t1,t2;

    function circleStart1(){
        iDeg = iDeg + 6;
        count = count + 1;
        if(count>=30){
            count = 30;
            clearInterval(t1);
            t2 = setInterval(circleStart2,1000);
        }
        $('#timeNum .time').html(60-count);
        $(".pie1").css("transform","rotate(" + iDeg + "deg)");
        $(".pie1").css("-webkit-transform","rotate(" + iDeg + "deg)");
    }

    function circleStart2(){
        jDeg = jDeg + 6;
        count = count + 1;
        if(count>=60){
            count = 60;
            clearInterval(t2);
            $('#timeNum').removeClass('show');$('#getCode').removeClass('hide');
            iDeg = 0;
            jDeg = 0;
            count = 0;
            $(".pie1").css("transform","rotate(" + 0 + "deg)");
            $(".pie1").css("-webkit-transform","rotate(" + 0 + "deg)");
            $(".pie2").css("transform","rotate(" + 0 + "deg)");
            $(".pie2").css("-webkit-transform","rotate(" + 0 + "deg)");
        }
        $('#timeNum .time').html(60-count);
        $(".pie2").css("transform","rotate(" + jDeg + "deg)");
        $(".pie2").css("-webkit-transform","rotate(" + jDeg + "deg)");
    }

    //请求短信验证码之前填写图片验证码
    $('#getCode').on('click',function () {
        if(!$('#ipt1').val()){Tools.toast('请输入手机号');return;}
        let phoneNumFormat=formateNumber($('#ipt1').val());
        if(!/^1[3,4,5,6,7,8,9]{1}[0-9]{9}$/.test(phoneNumFormat)){Tools.toast('手机号格式不正确');return;}
        let imgCode=$('#ipt3').val();
        if(!imgCode){Tools.toast('请输入图片验证码');return;}

        Tools.AJAX({
            url: G.base + "/user/mobileCaptchaSend",
            type: "post",
            data: {
                mobile: phoneNumFormat,
                captcha:imgCode
            },
            success:function (res) {
                if(res.code=='1'){
                    $('#getCode').addClass('hide');$('#timeNum').addClass('show');
                    t1 = setInterval(circleStart1,1000);
                }else{
                    Tools.toast(res.msg);
                    $('#changeImg img').attr('src',G.base+'/user/captchImg?'+Math.random());
                }
            }
        });
    });

    //按钮动态变化
    $("body").on('input','#ipt1,#ipt2,#ipt3,#ipt4',function(){
        let mobile = formateNumber($('#ipt1').val());
        let password = $('#ipt2').val();
        let checkCodeImg = $('#ipt3').val();
        let checkCodeMsg = $('#ipt4').val();
        if(!mobile.length||!password.length||!checkCodeImg.length||!checkCodeMsg.length||(!$('.check').hasClass('checked'))){
            $('#registerNow').addClass('disabled');
        }else{
            $('#registerNow').removeClass('disabled');
        }
    });


    //注册按钮
    $('#registerNow').on('click',function () {
        if($(this).hasClass('disabled')){return;}

        let val_mobile = formateNumber($.trim($('#ipt1').val()));
        let val_password = $('#ipt2').val();
        let val_checkCodeImg = $('#ipt3').val();
        let val_checkCodeMsg = $('#ipt4').val();

        if(!$('#protocol').hasClass('checked')){
            Tools.toast('请阅读并同意《星火注册协议》');
            return;
        }

        if( val_mobile.match(/^1[3,4,5,6,7,8,9]{1}[0-9]{9}$/) ){
            if(val_password.match(/^(?!\d+$)(?![a-zA-Z]+$)[0-9a-zA-Z]{6,18}$/)){
                var req={
                    mobile : val_mobile,
                    password: val_password,
                    mobileCaptcha: val_checkCodeMsg,
                    storeId: storeId,
                    regFrom:1
                };
                $('#registerNow').addClass('disabled');
                Tools.AJAX({
                    type : "post",
                    url : G.base + "/user/register",
                    data : req,
                    success : function(res) {
                        $('#registerNow').removeClass('disabled');
                        if (res.code=='1') {
                            $('.shadow').addClass('show');
                        }else{
                            Tools.toast(res.msg);
                            $('#ipt4').val('');
                            $('#registerNow').addClass('disabled');
                            $('#getCode').removeClass('hide');
                            $('#timeNum').removeClass('show');
                            $('#changeImg img').attr('src',G.base+'/user/captchImg?'+Math.random());
                        }
                        clearInterval(t1);
                        clearInterval(t2);
                        iDeg = 0;
                        jDeg = 0;
                        count = 0;
                    },
                    error : function() {
                        $('#registerNow').removeClass('disabled');
                        Tools.toast("注册异常，请稍后再试");
                    }
                });
            }else{
                Tools.toast("密码需为6-18位数字与字母组合");
            }
        }else{
            Tools.toast("手机号格式不正确");
        }
    });

    //格式化手机号
    function formateNumber(str){
        let arr=(str).split('');
        let newStr='';
        for(var i=0;i<arr.length;i++){
            if(arr[i]!=' '){newStr+=arr[i]}
        }
        return newStr;
    }

    //重新加载图片验证码
    $('#changeImg').on('click',function () {$('#changeImg img').attr('src',G.base+'/user/captchImg?'+Math.random());});

    //协议选中
    $('.check').off().on('click',function(){
        $(this).toggleClass('checked');
        if( $(this).hasClass('checked')){
            let mobile = formateNumber($('#ipt1').val());
            let password = $('#ipt2').val();
            let checkCodeImg = $('#ipt3').val();
            let checkCodeMsg = $('#ipt4').val();
            if(!mobile.length||!password.length||!checkCodeImg.length||!checkCodeMsg.length){
                return;
            }
            $('#registerNow').removeClass('disabled');
        }else{
            $('#registerNow').addClass('disabled');
        }
    });

})(window,document);
