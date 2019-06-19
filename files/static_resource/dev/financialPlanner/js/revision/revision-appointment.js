/**
 * Created by yugu10 on 2017/7/6. 预约
 */

$(document).ready(function(){
    (function(){
        if($("#subscribe").length == 0){
            return;
        };
        //$("#applyName").removeClass("error");
        //$("#applyMobile").removeClass("error");
        var applyName = $("#applyName").val() || "", applyMobile = $("#applyMobile").val() || "", hiddenApplyMobile = "";
        if(applyMobile.length > 0){
            for(var i = 0;i < 11; i++){
                if( 2< i && i < 7){
                    hiddenApplyMobile += "*"

                }else{
                    hiddenApplyMobile += applyMobile.charAt(i)
                }
            }
        }
        var submitFlag = true;
        var myAppointment = new ModalAppointment({
            title:"立即预约",
            tips:"预约后星火工作人员会联系您",
            name:applyName,
            phonenum:hiddenApplyMobile,
            openBtn:"subscribe",
            openfn:function(){
                var dialogApplyName = $("#dialog-applyName"), dialogApplyMobile = $("#dialog-applyMobile"), popup = $(".dialogBox"), errorInfo = popup.find(".errorInfo");
                dialogApplyName.val(applyName);
                dialogApplyMobile.val(hiddenApplyMobile);
                errorInfo.html("");
            },
            callback:function(){
                var dialogApplyName = $("#dialog-applyName"), dialogApplyMobile = $("#dialog-applyMobile"), popup = $(".dialogBox"), errorInfo = popup.find(".errorInfo");

                if(!dialogApplyName.val()){
                    errorInfo.html("请输入姓名");
                    return dialogApplyName.focus();
                }else{
                    errorInfo.html("");
                    //dialogApplyName.removeClass("error");
                };
                if(!(/^[\u4E00-\u9FA5\u00B7]+$/).test(dialogApplyName.val())){
                    errorInfo.html("请输入中文名");
                    return dialogApplyName.focus();
                }else{
                    errorInfo.html("");
                    //dialogApplyName.removeClass("error");
                };
                if(!dialogApplyMobile.val()){

                    errorInfo.html("请输入合法手机号");
                    return dialogApplyMobile.focus();
                }else{
                    if(dialogApplyMobile.val() == hiddenApplyMobile){
                        errorInfo.html("");
                        //dialogApplyMobile.removeClass("error");
                    }else if(!(/^1[34578]\d{9}$/.test(dialogApplyMobile.val()))){
                        errorInfo.html("请输入合法手机号");
                        return dialogApplyMobile.focus();
                    }else{
                        errorInfo.html("");
                        //dialogApplyMobile.removeClass("error");
                    }
                };
                //$("#dialog-applyMobile").blur();
                document.activeElement.blur();
                var data = {
                    managerid: $("#managerid").val(),
                    managerName: $("#managerName").val(),
                    applyType: $("#applyType").val(),
                    subjectId: $("#subjectId").val(),
                    applyName: dialogApplyName.val(),
                    applyMobile: (dialogApplyMobile.val() && dialogApplyMobile.val() == hiddenApplyMobile)? applyMobile : dialogApplyMobile.val()

                };
                if(submitFlag){
                    submitFlag = false;
                    $.ajax({
                        url:'/mobile/oneStopService/reservation.json',
                        type:"POST",
                        data:data,
                        dataType:'json',
                        success:function(data){
                            submitFlag = true;
                            myAppointment.close();
                            if(data.data){
                                myAppointment.openTips("预约成功")
                            }else{
                                myAppointment.openTips(data.msg)
                            };
                            var timer = setTimeout(function(){
                                myAppointment.closeTips();
                                clearTimeout(timer);
                            }, 2000)
                        },
                        error:function(){
                            submitFlag = true;
                        }
                    })
                }
            }
        });
    })();

    ;(function(){
        if($("#submitOrder").length == 0){
            return;
        }
        //$("#applyName").removeClass("error");
        //$("#applyMobile").removeClass("error");
        var applyName = $("#applyName").val() || "", applyMobile = $("#applyMobile").val() || "", hiddenApplyMobile = "";
        if(applyMobile.length > 0){
            for(var i = 0;i < 11; i++){
                if( 2< i && i < 7){
                    hiddenApplyMobile += "*"

                }else{
                    hiddenApplyMobile += applyMobile.charAt(i)
                }
            }
        }
        var submitFlag = true;
        var myAppointment = new ModalAppointment({
            title:"立即报名",
            tips:"报名后星火工作人员会联系您",
            name:applyName,
            phonenum:hiddenApplyMobile,
            openBtn:"submitOrder",
            openfn:function(){
                var dialogApplyName = $("#dialog-applyName"), dialogApplyMobile = $("#dialog-applyMobile"), popup = $(".dialogBox"), errorInfo = popup.find(".errorInfo");
                dialogApplyName.val(applyName);
                dialogApplyMobile.val(hiddenApplyMobile);
                errorInfo.html("");
            },
            callback:function(){
                var dialogApplyName = $("#dialog-applyName"), dialogApplyMobile = $("#dialog-applyMobile"), popup = $(".dialogBox"), errorInfo = popup.find(".errorInfo");
                if(!dialogApplyName.val()){
                    errorInfo.html("请输入姓名");
                    return dialogApplyName.focus();
                }else{
                    errorInfo.html("");
                    //dialogApplyName.removeClass("error");
                };
                if(!(/^[\u4E00-\u9FA5\u00B7]+$/).test(dialogApplyName.val())){
                    errorInfo.html("请输入中文名");
                    return dialogApplyName.focus();
                }else{
                    errorInfo.html("");
                    //dialogApplyName.removeClass("error");
                };
                if(!dialogApplyMobile.val()){
                    errorInfo.html("请输入合法手机号");
                    return dialogApplyMobile.focus();
                }else{
                    if(dialogApplyMobile.val() == hiddenApplyMobile){
                        errorInfo.html("");
                        //dialogApplyMobile.removeClass("error");
                    }else if(!(/^1[34578]\d{9}$/.test(dialogApplyMobile.val()))){
                        errorInfo.html("请输入合法手机号");
                        return dialogApplyMobile.focus();
                    }else{
                        errorInfo.html("");
                        //dialogApplyMobile.removeClass("error");
                    }
                };
                //$("#dialog-applyMobile").blur();
                document.activeElement.blur();
                var data = {
                    managerid: $("#managerid").val(),
                    managerName: $("#managerName").val(),
                    applyType: $("#applyType").val(),
                    subjectId: $("#subjectId").val(),
                    applyName: dialogApplyName.val(),
                    applyMobile: (dialogApplyMobile.val() && dialogApplyMobile.val() == hiddenApplyMobile)? applyMobile : dialogApplyMobile.val()
                };
                if(submitFlag){
                    submitFlag = false;
                    $.ajax({
                        url:'/mobile/oneStopService/reservation.json',
                        type:"POST",
                        data:data,
                        dataType:'json',
                        success:function(data){
                            submitFlag = true;
                            myAppointment.close();
                            if(data.data){
                                myAppointment.openTips("报名成功")
                            }else{
                                myAppointment.openTips(data.msg)
                            };
                            var timer = setTimeout(function(){
                                myAppointment.closeTips();
                                clearTimeout(timer);
                            }, 2000)
                        },
                        error:function(){
                            submitFlag = true;
                        }
                    })
                }
            }
        });

    })();
    //$(document).on("change input propertychange keydown paste", "#dialog-applyName, #dialog-applyMobile",function(event){
    //    var self = $(this);
    //
    //        self.removeClass("error");
    //
    //});
});