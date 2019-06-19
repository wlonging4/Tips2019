/**
 * Created by yugu10 on 2017/7/4.合格投资协议
 */
;(function(){
    var submitFlag = true;
    $("#sesame-qualified-agree-btn").on("click",function(){
        var self = $(this),
            form = $("#sesame-qualified-form"),
            url = form.attr("action"),
            protocolType = form.find("input[name='protocolType']").val(),
            sesameCode = form.find("input[name='sesameCode']").val() || "",
            token = form.find("input[name='token']").val(),
            goToSesameRiskQuestionUrl = form.find("input[name='goToSesameRiskQuestionUrl']").val(),
            riskValidateUrl = form.find("input[name='riskValidateUrl']").val();
        if(submitFlag){
            submitFlag = false;
            $.ajax({
                url:url,
                type:"POST",
                data:{
                    protocolType: protocolType,
                    sesameCode: sesameCode,
                    token: token
                },
                success:function(data){
                    if(data.code == 1){
                        $.ajax({
                            url:riskValidateUrl,
                            type:"GET",
                            success:function(data){
                                if(data.code == 404){
                                    var mymodal = new Modal();
                                    mymodal.openTips("合格投资者认定已完成，请进行风险测评");
                                    var timer = setTimeout(function(){
                                        mymodal.closeTips();
                                        clearTimeout(timer);
                                        location.href = goToSesameRiskQuestionUrl
                                    }, 2000)
                                }else{
                                    var mymodal = new Modal();
                                    mymodal.openTips("合格投资者认定已完成");
                                    var timer = setTimeout(function(){
                                        mymodal.closeTips();
                                        clearTimeout(timer);
                                        location.href = "xinghuo://GoToSesameInfo?sesameCode=" + sesameCode;
                                    }, 2000)
                                    //location.href = "xinghuo://GoToSesameInfo?sesameCode=" + sesameCode;
                                };

                            },
                            error:function(){

                            }
                        })
                    }else{
                        var mymodal = new Modal({
                            wrapperClass:'dialog1',
                            contentText : data.errMsg,
                            isTipConfirm: true
                        });
                        mymodal.open();
                    };
                    submitFlag = true;
                },
                error:function(){
                    submitFlag = true;
                }
            })
        }

    });
})();

