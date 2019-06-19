'use strict';
function addNoBuyRefund($scope,tools,$modal){
    var Form = $("#js_form");
    $scope.form={};
    $scope.action={};
    $scope.result ={};
    $scope.select={
        refund : [
            {"key":1,"value":"主动退款"},
            {"key":2,"value":"超募退款"},
            {"key":3,"value":"违规退款"},
            {"key":4,"value":"其他"},
            {"key":5,"value":"冷凝期退款"},
            {"key":6,"value":"募集失败"}
        ]
    };

    /*
    *标题：搜索用户交易记录
    *功能描述：输入用户名和手机号，点击查询，返回用户相关列表；点击单选按钮选中用户相关列表对应数据，点击保存，返回数据
    *时间：2017-09-26
    * */
    var getUserModal = function($scope,$modalInstance){
        $scope.submitForm={};
        $scope.search ={};
        $scope.result = {};
        //取消
        $scope.close = function() {
            $modalInstance.close();
        };
        //查询
        $scope.searchFun = function(event){
            var self = event.currentTarget;
            //不能为空判断
            //if( !$scope.submitForm.userName ) return alert("用户姓名不能为空！");
            //if( !$scope.submitForm.mobile ) return alert("用户手机号不能为空！");
            //格式判断
            //if($scope.submitForm.mobile.length==0)return alert('请输入手机号码！');
            //if($scope.submitForm.mobile.length!=11) return alert('请输入有效的手机号码！');

            //var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1}))+\d{8})$/,chinname=/^[\u2E80-\u9FFF]{2,5}(?:•[\u2E80-\u9FFF]{2,5})*$/;
            //if(!myreg.test($scope.submitForm.mobile)) return alert('请输入有效的手机号码！');
            //if(!chinname.test($scope.submitForm.userName)) return alert('用户姓名格式有误，请输入中文！');
            //查询用户信息
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + '/sesamerefund/queryUserInfo.json',
                data: $scope.submitForm,
                dataType: "json",
                success: function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    if(data.success){
                        if(data.data.userList.length!=0){
                            $(".js-getUserList").show();
                            $scope.$apply(function(){
                                $scope.search=data.data.userList;
                            });
                        }else{
                            alert("用户名或手机号不存在");
                        }
                    }else{
                        $(".js-getUserList").hide();
                        alert(data.msg);
                        $scope.close();
                    }
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                    $scope.close();
                }
            })
        };
        //确认
        $scope.ok = function(){
            var val=$(".radilBox:checked").val();
            if( val == "undefined" || val == undefined){
                return alert("请选择用户信息！");
            }else{
                $("#realName").val($scope.search[val].realName);
                $("#documentNo").val($scope.search[val].documentNo);
                $("#ecifid").val($scope.search[val].ecifId);
                $("#userid").val($scope.search[val].userId);
                $modalInstance.close();
            }
        };
    };
    $scope.action.getUser = function(){
        $modal.open({
            backdrop: true,
            backdropClick: true,
            dialogFade: false,
            keyboard: true,
            templateUrl : 'getUserModal.html',
            controller : getUserModal,
            windowClass:'modal-640'
        });
    };

    /*
    * 标题：添加银行卡
    * 功能描述:添加input，点击保存
    *
    * */
    var getBankModal = function($scope,$modalInstance){
        $scope.bank={};
        $scope.form = {};
        //银行名称
        $.ajax({
            type:"POST",
            url:siteVar.serverUrl+"/sesamerefund/getPayBankList.json",
            success:function(data){
                if(data.success){
                    $scope.$apply(function(){
                        $scope.bank=data.data;
                    });
                }else{
                    alert(data.msg);
                }
            }
        });
        //选择银行
        $scope.bankNameFun = function(code){
            $scope.form.bankName = $("#bankCode").find('option:selected').text();
        };
        //显示省
        $.when($.ajax({type:"POST",url:siteVar.serverUrl+"/sesamerefund/getAllProvinceCode.json"})).then(function(data){
            if(data.success){
                $("#id-city").find("option").eq(0).text("请选择市");
                $scope.$apply(function(){
                    $scope.province = data.data.data;
                    $scope.city=data.data.data[0].cityList;
                });
            }
        }).fail(function(err){
            tools.ajaxError(err);
            return false;
        });
        //联动，显示市
        $scope.provinceFun = function(v){
            var city= $("#id-city");
            if(city.val() != "" || city.val()==null){
                city.val("");
                city.find("option").eq(0).text("请选择市");
            }
            if(v){
                $scope.form.provinceName = $("#id-province").find("option:selected").text();
            }
            if(!v){return alert("请选择省份！");}
            $.ajax({
                type:"POST",
                url:siteVar.serverUrl+"/sesamerefund/getProvinceCode.json",
                data:{provinceCode:v},
                success:function(data){
                    if(data.success){
                        $scope.$apply(function(){
                            $scope.city=data.data.data[0].cityList;
                        });
                    }else{
                        alert(data.msg);
                    }
                }
            });
        };
        //
        $scope.cityFun = function(city){
          if(city){
              $scope.form.cityName = $("#id-city").find("option:selected").text();
          }
        };
        //支行显示
        $scope.bankFun = function(){
            var bank=$("#branch").val();
            if(!bank) return alert("请输入支行名称，模糊查找");
            $.ajax({
                type:"POST",
                url:siteVar.serverUrl+"/sesamerefund/getBank.json",
                data:$scope.form,
                success:function(data){
                    if(!tools.interceptor(data)) return;
                    if(data.success){
                        $("#branchDown").show();
                        $scope.$apply(function(){
                            $scope.bankList=data.data;
                        });
                    }else{
                        alert(data.msg);
                    }
                }
            });
        };
        //选择支行
        $scope.branchFun = function(e,unionCode){
            $scope.form.branchName = e;
            $scope.form.unionCode = unionCode;
            $("#branchDown").hide();
        };

        //取消
        $scope.close = function() {
            $modalInstance.close();
        };
        //保存银行卡
        $scope.ok = function(e){
            var self = e.currentTarget;
            //var submintData = new FormData(Form[0]);
            if(!$scope.form.userName)return alert("持卡人不能为空！");
            if(!$scope.form.bankCode)return alert("银行名称不能为空！");
            if(!$scope.form.cardNo)return alert("银行卡号不能为空！");
            if(!$scope.form.reCardNo)return alert("确认卡号不能为空！");
            if(!$scope.form.provinceCode)return alert("开户行所在省不能为空！");
            if(!$scope.form.cityCode)return alert("开户行所在市不能为空！");
            if(!$scope.form.branchName)return alert("支行名称不能为空！");
            if( $scope.form.cardNo != $scope.form.reCardNo)return alert("银行卡号两次输入不一致，请重新输入！");

            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + "/sesamerefund/saveRefundCard.json",
                data:$scope.form,
                success: function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    if(data.success){
                        alert("添加银行卡成功！");
                        $scope.close();
                        var bank=$("#id-bankForm");
                        var userAccountDetail = $('select[name="provinceCode"]',bank).find('option:selected').text()+"/"+$('select[name="cityCode"]',bank).find('option:selected').text()+"/"+
                            $('select[name="bankCode"]',bank).find('option:selected').text()+"/"+$('input[name="branchName"]',bank).val()+"/"+
                            $('input[name="userName"]',bank).val()+"/"+$('input[name="cardNo"]',bank).val();
                        $("#userAccountDetail").val(userAccountDetail);
                        $("#unionCode").val($scope.form.unionCode);
                        $("#cardid").val(data.data);
                    }else{
                        alert(data.msg);
                    }
                    $scope.close();
                },
                error: function(err){
                    $scope.close();
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });
        };
    };
    $scope.action.getBank = function(){
        $.when($.ajax({url:siteVar.serverUrl+"/sesamerefund/saveRefundCardPage.json"})).then(function(data){
            if(data.success){
                $modal.open({
                    backdrop:true,
                    backdropClick:true,
                    dialogFade:false,
                    keyboard:true,
                    templateUrl :"getBankModal.html",
                    controller:getBankModal,
                    windowClass:"modal-640"
                });
            }else{
                alert(data.msg);
            }
        }).fail(function(){
            tools.ajaxError(err);
            return false;
        });

    };

    //取消
    $scope.action.cancel = function(){
        window.location="#xinghuogoldrainbow-fixationNoBuyRefund.html";
    };
    //保存
    var viewSaveInfo = function($scope,info,$modalInstance){
        $scope.info = info;

        //取消
        $scope.close = function() {
            $modalInstance.close();
        };
        $scope.save = function(e){
            var self = e.currentTarget;

            //var submintData = new FormData(Form[0]);
            var submintData = new FormData();
            $("#js_form input[type='text'],#js_form input[type='hidden'], #js_form select, #js_form textarea").each(function(item, index){
                var name = $(this).attr("name"), value = $(this).val(), type=$(this).attr("type");
                if(name != "refundDescription" || value){
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

            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + "/sesamerefund/sesameFlowRefundApply.json",
                data:submintData,
                processData: false,
                contentType: false,
                success: function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    if(data.success){
                        alert("新增退款申请成功！");
                        $scope.close();
                        window.location="#xinghuogoldrainbow-fixationNoBuyRefund.html";
                    }else{
                        alert(data.msg);
                    }
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });
        }
    };
    $scope.action.save = function(){
        var submitVal = tools.getFormele({},Form);
        $.when($.ajax({url:siteVar.serverUrl+"/sesamerefund/sesameFlowRefundApplyPage.json"})).then(function(data){
            if(data.success){
                if(!submitVal.realName) return alert("用户姓名不能为空！");
                if(!submitVal.documentNo) return alert("身份证号不能为空！");
                if(!submitVal.ecifid) return alert("ecifid不能为空！");
                if(!submitVal.refundReason) return alert("退款原因不能为空！");
                if(!submitVal.refundAmt) return alert("退款金额不能为空！");
                if(!submitVal.currencyType) return alert("币种不能为空！");
                if(!submitVal.sesameCardno) return alert("募集账号不能为空！");
                if(!submitVal.userAccountDetail) return alert("打款银行卡不能为空！");
                if(!submitVal.applyTime) return alert("申请日期不能为空！");
                if(!submitVal.payFile) return alert("汇款凭证不能为空！");
                switch ( parseInt(submitVal.refundReason) ){
                    case 1:
                        submitVal.refundReasonType = "主动退款";
                        break;
                    case 2:
                        submitVal.refundReasonType = "超募退款";
                        break;
                    case 3:
                        submitVal.refundReasonType = "违规退款";
                        break;
                    case 4:
                        submitVal.refundReasonType = "其他";
                        break;
                    case 5:
                        submitVal.refundReasonType = "冷凝期退款";
                        break;
                    case 6:
                        submitVal.refundReasonType = "募集失败";
                        break;
                    case 8:
                        submitVal.refundReasonType = "认购费优惠";
                        break;
                }
                $modal.open({
                    backdrop: true,
                    backdropClick: true,
                    dialogFade: false,
                    keyboard: true,
                    templateUrl : 'viewSaveInfo.html',
                    controller : viewSaveInfo,
                    windowClass:'modal-640',
                    resolve:{
                        "info" : function(){
                            return submitVal;
                        }
                    }
                });
            }else{
                alert(data.msg);
            }
        }).fail(function(){
            tools.ajaxError(err);
            return false;
        });

    };
}
