/**
 * Created by yugu10 on 2017/7/3.测评页面js
 */

$(document).ready(function(){
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
            if(!$('.checkIcon').hasClass('active')){
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
                var data = '', arr = [], token = $("#xinghuo-app-token").val();

                arr = $.map(result, function(item, i){
                    return parseInt(i + 1) + '|' + item;
                });
                if(self.submitFlag){
                    $.ajax({
                        url:"/mobile/appsesame/riskQuestionSubmit.shtml",
                        type:"POST",
                        data:{
                            answer: arr.join(","),
                            token: token
                        },
                        success:function(data){
                            if(data.code == 1){
                                var typeObj = {
                                    "0":"未测评",
                                    "1":"保守型",
                                    "2":"稳健型",
                                    "3":"平衡型",
                                    "4":"积极型",
                                    "5":"激进型"
                                }, result = data.data;


                                var mymodal = new Modal({
                                    title:"您的风险偏好类型为",
                                    wrapperClass:'dialog4',
                                    contentText : "<div class='orangeWord'>" + typeObj[result.riskLevel] + "</div>",/*+ result.detailRemark*/
                                    isPromptbtn:true,
                     				conisPromptText:["转入","取消"],
                                    callback: function () {
                                        var sesameCode = $("#xinghuo-app-sesameCode");
                                        location.href = 'xinghuo://GoToSesameInfo?sesameCode=' + (sesameCode.val() || "");
                                    }
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
            this.result.length = 20;
            this.bindEvent();
            this.submitAnswers();
        }
    };
    Assessment.init();


    //测评结果页面
    var AssessmentResult = {
        submitFlag:true,
        viewReport : function(){
            var self = this;
            $(".lookSignedPDF").on("click", function(){
                var url = $(this).attr("pdf-url");
                if(self.submitFlag){
                    self.submitFlag = false;
                    $.ajax({
                        url:url,
                        type:"GET",
                        success:function(data){
                            if(data.code == 1){
                                window.location.href = data.data;
                            }else{
                                var mymodal = new Modal({
                                    wrapperClass:'dialog1',
                                    contentText : data.msg,
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
                return false;
            })
        },

        init:function(){
            this.viewReport();
        }
    };
    AssessmentResult.init();
});