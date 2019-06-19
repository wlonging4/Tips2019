/**
 * Created by yugu10 on 2017/7/3.测评页面js
 */
$(document).ready(function(){
    /* 判断是哪个风险测评页
        riskQuestionType的值wallet公募基金、xinghuoPlan星火自营类固收、sesameProduct私募产品
     */
    var riskQuestionType = $('#riskQuestionType').val(),xinghuoAppToken = $("#xinghuo-app-token").val(),submitToken,sumbitUrl,resultObj;
    var sesameSourceValue = $('#sesameSource').val();
    switch (riskQuestionType) {
        case 'wallet':
            submitToken = $("#token").val();
            sumbitUrl = '/mobile/appRisk/creteWalletRiskAssess.json';
            resultObj = {
                "0":"未测评",
                "1":"安益型",
                "2":"保守型",
                "3":"稳健型",
                "4":"积极型",
                "5":"进取型"
            };
            break;
        case 'sesameProduct':
            submitToken = xinghuoAppToken;
            sumbitUrl = '/mobile/appsesame/riskQuestionSubmit.shtml';
            resultObj = {
                "0":"未测评",
                "1":"保守型",
                "2":"稳健型",
                "3":"平衡型",
                "4":"进取型",
                "5":"激进型"
            };
            break;
        case 'xinghuoPlan':
            submitToken = xinghuoAppToken;
            sumbitUrl = '/mobile/appsesame/riskQuestionSubmitXinghuoPlan.shtml';
            if(sesameSourceValue == '8'){
                resultObj = {
                    "0":"未测评",
                    "1":"保守型",
                    "2":"平衡型",
                    "3":"稳健型",
                    "4":"进取型",
                    "5":"激进型"
                };
            }else{
                resultObj = {
                    "0":"未测评",
                    "1":"保守型",
                    "2":"稳健型",
                    "3":"平衡型",
                    "4":"进取型",
                    "5":"激进型"
                };
            }
            break;
    }
    var  Assessment = {
        result:[],
        submitFlag:true,
        bindEvent:function(){
            var self = this, result = this.result, verify = this.verify, submitBtn = $("#submit-btn");
            $(document).on("change", "#questions-list input[type='radio'], #questions-list input[type='checkbox']", function(){
                var name = $(this).attr("name"), index = name.replace(/risk/,'') - 1, type = $(this).attr("type"), value = $(this).val();
                if(type == 'radio'){
                    value = $(this).val();
                    result[index] = value;
                }else{
                    var checkedBox = $('input[name= ' + name + ']:checked');
                    result[index] = '';
                    if(checkedBox.length > 0){
                        checkedBox.each(function(i, item){
                            result[index] += item.value;
                        })
                    }
                };
                if(verify(result)){
                    submitBtn.removeClass("disable");
                }else{
                    submitBtn.addClass("disable");
                };
            });
            if(riskQuestionType === 'wallet' || riskQuestionType === 'sesameProduct'){
                $(document).on("touchstart", ".risk-xieyi", function(){
                    var icon = $(".checkIcon");
                    if(icon.hasClass('active')){
                        icon.removeClass('active');
                    }else{
                        icon.addClass('active');
                    };
                    if(verify(result)){
                        submitBtn.removeClass("disable");
                    }else{
                        submitBtn.addClass("disable");
                    };
                });
            }
            var protocolFlag = true;
            $(document).on("touchstart", "#sesame-questions-shuzizhengshu-protocol", function(event){
                var url = $(this).attr("data-href");
                if(protocolFlag){
                    protocolFlag = false;
                    $.ajax({
                        url:url,
                        type:"POST",
                        success:function(data){
                            if(data.code == 1){
                                var mymodal = new Modal({
                                    title:data.data.protocolTitle,
                                    wrapperClass:'dialog2',
                                    contentText : data.data.protocolContent,
                                    isClosebtn: true
                                });
                                mymodal.open();

                            }else{
                                var mymodal = new Modal({
                                    wrapperClass:'dialog1',
                                    contentText : data.msg,
                                    isTipConfirm: true
                                });
                                mymodal.open();
                            };
                            protocolFlag = true;
                        },
                        error: function () {
                            protocolFlag = true;
                        }
                    });
                };
                event.stopPropagation();
                if(riskQuestionType === 'sesameProduct' || riskQuestionType === 'xinghuoPlan'){
                    event.preventDefault();
                }
                return false;
            });

        },
        verify:function(result){
            var len = result.length, flag = true;
            for(var i = 0; i < len; i++){
                if(!result[i]){
                    flag = false;
                    break;
                };
            };
            if(riskQuestionType === 'sesameProduct' && !$('.checkIcon').hasClass('active')){
                flag = false;
            };
            return flag;
        },
        submitAnswers:function(){
            var self = this, result = this.result, verify = this.verify;
            $("#submit-btn").on("click", function(){
                if(!verify(result)){
                    return false;
                };
                var arr = $.map(result, function(item, i){
                    return (riskQuestionType === 'wallet')?item:(parseInt(i + 1) + '|' + item);
                });
                if(self.submitFlag){
                    var loadingHtml='<div class="loadingDiv"></div>';
                    $("body").append(loadingHtml);
                    var sendOption = {
                        answer: arr.join(","),
                        token: submitToken
                    };
                    if(riskQuestionType === 'xinghuoPlan'){
                        sendOption.assessmentType = sesameSourceValue;
                    }
                    $.ajax({
                        url: sumbitUrl,
                        type: "POST",
                        data: sendOption,
                        success:function(data){
                            $(".loadingDiv").remove();
                            if(data.code == 1 || data.success == true){
                                var result = data.data;

                                if(riskQuestionType === 'wallet' && $("#type").val() =="list"){
                                    location.href="/mobile/appRisk/getAppPublicFundsRiskResult.shtml?token="+ submitToken;
                                    return;
                                }

                                var walletenterBool = true, optionA = {
                                    title:"您的风险偏好类型为",
                                    wrapperClass:'dialog4',
                                    contentText : "<div class='orangeWord'>" + resultObj[result.riskType] + "</div>",/*+ result.detailRemark*/
                                    isPromptbtn:true,
                                    conisPromptText:["转入","取消"],
                                    conisPromptLink:[walletenterBool?"xinghuo://RiskWalletEnter":"","xinghuo://RiskWalletCancle"],  /*取消（取消之后进入钱包页）：xinghuo://RiskWalletCancle转入（转入之后进入转入页）：xinghuo://RiskWalletEnter*/
                                    conisPromptClass:[walletenterBool?"":"disable",""]
                                }, optionB = {
                                    title:"您的风险偏好类型为",
                                    wrapperClass:'dialog3',
                                    contentText : "<div class='orangeWord'>" + resultObj[result.riskLevel] + "</div>" + result.detailRemark,
                                    isConfirmbtn: true,
                                    confirmText:"预约产品",
                                    maskNoClickClose:true,
                                    callback: function () {
                                        var sesameCode = $("#xinghuo-app-sesameCode");
                                        location.href = 'xinghuo://GoToSesameInfo?sesameCode=' + (sesameCode.val() || "");
                                    }
                                }, modalOption = (riskQuestionType === 'wallet')?optionA:optionB;

                                switch (riskQuestionType) {
                                    case 'wallet':
                                        var mymodal = new Modal(modalOption);
                                        mymodal.open();
                                        [].slice.call(document.querySelectorAll(".twoBtn")).forEach(function(thisObj,index){
                                            thisObj.addEventListener("click",function(){
                                                thisObj.classList.add("touchbtn");
                                                setTimeout(function(){
                                                    thisObj.classList.remove("touchbtn");
                                                }, 500);
                                            },false);
                                        });
                                        break;
                                    case 'xinghuoPlan':
                                        var xinghuoAppAesameCodeVal=$("#xinghuo-app-sesameCode").val();
                                        if(xinghuoAppAesameCodeVal!="" && xinghuoAppAesameCodeVal!=undefined){
                                            var mymodal = new Modal(modalOption);
                                            mymodal.open();
                                            return;
                                        }else{
                                            location.href="/mobile/apppersonal/riskResult.shtml?token="+submitToken+"&assessmentType="+sesameSourceValue;
                                        }
                                        break;
                                    case 'sesameProduct':
                                        var mymodal = new Modal(modalOption);
                                        mymodal.open();
                                        break;
                                }
                            }else{
                                var mymodal = new Modal({
                                    wrapperClass:'dialog1',
                                    contentText : riskQuestionType === 'wallet'?'请求失败':data.msg,
                                    isTipConfirm: true
                                });
                                mymodal.open();
                            };
                            self.submitFlag = true;
                        },
                        error: function () {
                            self.submitFlag = true;
                        }
                    });
                };
            });
        },
        init:function(){
            this.result.length = $('#questions-list').find('li').length;
            this.bindEvent();
            this.submitAnswers();
        }
    };
    Assessment.init();
});
