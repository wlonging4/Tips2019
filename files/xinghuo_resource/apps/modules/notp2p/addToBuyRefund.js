'use strict';
function addToBuyRefund($scope,tools){
    var Form = $("#js_form");
    $scope.form = {};
    $scope.action={};
    $scope.select={};
    $scope.info = {};
    //$scope.id=$location.$$search.id;

    /*
     *描述：确定订单号，获取订单信息（为获取弹出提示信息）
     *参数：订单号[applyid]
    */
    $scope.action.confirm = function(event){
        tools.resetWidth();
        tools.createModal();
        tools.createModalProgress();

        if(!$scope.applyNo){ return alert("请输入订单号！");}

        var self = event.currentTarget;
        if(!tools.ajaxLocked(self)) return;
        $.ajax({
            type: "post",
            url: siteVar.serverUrl + '/sesamerefund/queryTradeDatailBeforeRefund.json',
            data: {applyNo:$scope.applyNo},
            dataType: "json",
            success: function(data){
                tools.ajaxOpened(self);
                if(!tools.interceptor(data)) return;
                if(data.success){
                    $scope.$apply(function(){
                        $scope.form=data.data;
                        $scope.form.transTime = tools.toJSDate(data.data.transTime);
                        $scope.form.payAmt = tools.formatNumber(data.data.payAmt);
                        switch (parseInt(data.data.tradeStatue)){
                            case 10:
                                $scope.form.tradeStatue ="待付款";
                                break;
                            case 20:
                                $scope.form.tradeStatue ="已付款";
                                break;
                            case 30:
                                $scope.form.tradeStatue ="认购成功";
                                break;
                            case 40:
                                $scope.form.tradeStatue ="赎回中";
                                break;
                            case 50:
                                $scope.form.tradeStatue ="赎回成功";
                                break;
                            case 60:
                                $scope.form.tradeStatue ="已取消";
                                break;
                        }

                        //$scope.form.sasameList = data.data.sasameBankName+"/"+data.data.sesameBankDetail+"/"+data.data.sasameCardNo;
                        //$scope.form.cardList = data.data.bankName+"/"+data.data.branchName+"/"+data.data.cardNo;
                    });

                }else{
                    $("#js_dialog .js_content").html(data.msg);
                    $("#js_dialog").modal("show");
                }

            },
            error: function(err){
                tools.ajaxOpened(self);
                tools.ajaxError(err);
            }
        })
    };

    //取消
    $scope.action.cancel = function(){
        window.location="#xinghuogoldrainbow-fixationToBuyRefund.html";
    };
    //保存
    $scope.action.save = function(e){
        var self= e.currentTarget;
        var vData = tools.getFormele({},$("#js_form"));
        if(!vData.applyTime) return alert("申请日期不能为空！");
        if(!vData.refundWay) return alert("退款方式不能为空！");
        if(!vData.refundReason) return alert("退款原因不能为空！");
        if(!vData.payAmt && !vData.balanceAmt) return alert("退款金额不能为空！");
        if(!vData.refundApplyFile) return alert("退款申请书不能为空！");


        var submintData = new FormData();
        $("#js_form input[type='text'],#js_form input[type='radio']:checked,#js_form input[type='hidden'], #js_form select, #js_form textarea").each(function(item, index){
            var name = $(this).attr("name"), value = $(this).val(), type=$(this).attr("type");
            if(name != "description" || value){
                submintData.append(name, value);
            }
        });
        //file
        $("#js_form input[type='file']").each(function(i,v){
            var name=$(this).attr("name"), value=$("#js_form input[type='file']").get(i).files[0];
            if( value != undefined){
                var filename = value.name;
                submintData.append(name, value,filename);
            }else{
                var nullData = new Blob();
                submintData.append(name, nullData,'');
            }
        });

        //需要兼容chrome50.0以上
        //if(!vData.description){
        //    submintData.delete('description');
        //}

        if(!tools.ajaxLocked(self)) return;
        $.ajax({
            type: "post",
            url: siteVar.serverUrl + "/sesamerefund/sesameRefundApply.json",
            data:submintData,
            processData: false,
            contentType: false,
            success: function(data){
                tools.ajaxOpened(self);
                if(!tools.interceptor(data)) return;
                if(data.success){
                    alert("新增退款申请成功！");
                    $scope.action.cancel();
                }else{
                    alert(data.msg);
                }
            },
            error: function(err){
                tools.ajaxOpened(self);
                tools.ajaxError(err);
            }
        });

    };

    $scope.select.refund = [
        {"key":"","value":"请选择"},
        {"key":1,"value":"主动退款"},
        {"key":2,"value":"超募退款"},
        {"key":3,"value":"违规退款"},
        {"key":4,"value":"其他"},
        {"key":5,"value":"冷凝期退款"},
        {"key":6,"value":"募集失败"}
        //{"key":8,"value":"认购费优惠"}
    ];
    $scope.form.refundWay = "全部";
    $scope.form.refundType = 2;

    $(function(){

        //退款类型 对应改变 退款原因
        var radioBox2 = $("#radioBox2"),radioBox3 = $("#radioBox3");

        if(parseInt(radioBox2.val()) == 2 ){
            var str ='';
            for(var i in $scope.select.refund){
                str+='<option value="'+$scope.select.refund[i].key+'">'+$scope.select.refund[i].value+'</option>'
            }
            $("#refund-select").html(str);
            $("#refundWay").val("全部");

        }
        radioBox2.off().on("click",function(){
            var val1 = $("#money").attr("data-pay");

            var str ='';

            for(var i in $scope.select.refund){
                str+='<option value="'+$scope.select.refund[i].key+'">'+$scope.select.refund[i].value+'</option>'
            }
            $("#refund-select").html(str);
            $("#refundWay").val("全部");
            $("#money").val(val1).attr("name","payAmt");
        });
        radioBox3.off().on("click",function(){
            var val1 = $("#money").attr("data-money");

            var str='<option value="">请选择</option><option value="7">超额退款</option>';
            $("#refund-select").html(str);
            $("#refundWay").val("部分");
            $("#money").val(val1).attr("name","balanceAmt");
        })
    })

}
