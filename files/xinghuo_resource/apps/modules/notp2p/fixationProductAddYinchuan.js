'use strict';
function fixationProductAddYinchuan($scope,tools,$modal,$timeout){
    var Form = $("#js_form");
    var selectCardUserId=null;
    var selectCardId=null;
    var dictionaryBank;
    var userAccountDetailGloble;
    $scope.form={};
    $scope.action={};
    $scope.result ={};
    $scope.select ={};

    //检验金额聚失焦状态下的输入
    $scope.checkPro=function(){
        if(!$('#sesameName').val()){
            return tools.interalert('请选择产品');
        }
    };
    $scope.checkAmount=function(){
        var minSubscribeAmt=Number($('#minSubscribeAmt').val());
        var incSubscribeAmt=Number($('#incSubscribeAmt').val());
        var amount=Number($('#amount').val());
        if($('#sesameName').val()){
            if(!amount||amount==0){return tools.interalert('请填写投资金额')}
        }
        if(minSubscribeAmt&&incSubscribeAmt){
            if(amount < minSubscribeAmt){
                $('#amount').val('');
                delete $scope.form.amount;
                return tools.interalert('投资金额不能小于起投金额');
            }
            if((''+(amount-minSubscribeAmt)/incSubscribeAmt).indexOf('.')>-1){
                $('#amount').val('');
                delete $scope.form.amount;
                return tools.interalert('递增金额为'+incSubscribeAmt/10000+'万元');
            }
        }
    };

    //获取弹窗确认的银行卡中文信息字串
    $scope.personalBankInfo = function(code){
        userAccountDetailGloble = $("#usercardid").find('option:selected').text();
        if(userAccountDetailGloble=='请选择'){userAccountDetailGloble=''}
    };

    //大写金额
    $scope.$watch('form.amount',  function(newValue, oldValue) {
        if($scope.form.amount){
            $scope.upperMoney=tools.toChineseCharacters($scope.form.amount);
        }else{
            $scope.upperMoney='零';
        }
    });

    //用户id变化监控银行卡信息列表变化
    $scope.$on('getCardList',function () {
        if(selectCardUserId){
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + '/sesametrade/querySesameCardList.json',
                data: {userId:selectCardUserId},
                dataType: "json",
                success: function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    if(data.success){
                        if(data.data.length){
                            //先清除原来选取的银行卡数据
                            delete $scope.form.usercardid;
                            $scope.select.cardList=data.data;
                        }else{
                            delete $scope.select.cardList;
                        }
                    }else{
                        tools.interalert(data.msg);
                    }
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            })
        }
    });

    /*
    *标题：搜索用户信息
    *功能描述：输入用户名和手机号，点击查询，返回用户相关列表；点击单选按钮选中用户相关列表对应数据，点击保存，返回数据
    *时间：2017-09-26
    * */
    var getUserModal = function($scope,$modalInstance,tools,vm){
        $scope.submitForm={};
        $scope.search ={};
        $scope.result = {};
        $scope.select={};
        //取消
        $scope.close = function() {
            $modalInstance.close();
        };
        //查询
        $scope.searchFun = function(event){
            var self = event.currentTarget;
            if(!$scope.submitForm.name && !$scope.submitForm.mobile){
                return tools.interalert('请输入查询条件搜索');
            }
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
                            tools.interalert("用户名或手机号不存在");
                        }
                    }else{
                        $(".js-getUserList").hide();
                        tools.interalert(data.msg);
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
                return tools.interalert("请选择用户信息！");
            }else{
                $("#realName").val($scope.search[val].realName);
                $("#documentNo").val($scope.search[val].documentNo);
                $("#ecifid").val($scope.search[val].ecifId);
                $("#lenderid").val($scope.search[val].userId);
                $("#mobile").val($scope.search[val].mobile);
                $("#userid").val($scope.search[val].managerId);
                $("#managerName").val($scope.search[val].managerName);
                $("#managerMobile").val($scope.search[val].managerMobile);
                //获取相关银行卡列表
                selectCardUserId=$scope.search[val].userId;
                vm.$emit('getCardList');

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
            windowClass:'modal-320',
            resolve: {
                "vm":function () {
                    return $scope
                }
            }
        });
    };

    /*
    *标题：搜索私募产品信息
    *功能描述：输入项目编码和项目名称，点击查询，返回产品相关列表；点击单选按钮选中用户相关列表对应数据，点击保存，返回数据
    *时间：2019-03-13
    * */
    var getSesameModal = function($scope,$modalInstance,tools){
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
            if(!$scope.submitForm.sesameCode && !$scope.submitForm.sesameName){
                return tools.interalert('请输入查询条件搜索');
            }
            //查询产品信息
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + '/sesametrade/getSesameInfoList.json',
                data: $scope.submitForm,
                dataType: "json",
                success: function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    if(data.success){
                        if(data.data.length!=0){
                            $(".js-getSesameList").show();
                            $scope.$apply(function(){
                                data.data.forEach(function (val,inx) {
                                    data.data[inx].minSubscribeAmt2=tools.formatNumber(data.data[inx].minSubscribeAmt);
                                });
                                $scope.search=data.data;
                            });
                        }else{
                            tools.interalert("项目编码或项目名称不存在");
                        }
                    }else{
                        $(".js-getSesameList").hide();
                        tools.interalert(data.msg);
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
                return tools.interalert("请选择产品信息");
            }else{
                $("#sesameCode").val($scope.search[val].sesameCode);
                $("#sesameName").val($scope.search[val].sesameName);
                $("#minSubscribeAmt2").val($scope.search[val].minSubscribeAmt2);
                $("#productRate").val($scope.search[val].productRate);
                $("#term").val($scope.search[val].term);
                $("#surplusQuota").val($scope.search[val].surplusQuota);
                $("#sesameTypeStr").val($scope.search[val].sesameTypeStr);
                $("#sesameSourceStr").val($scope.search[val].sesameSourceStr);
                $("#sesameStatusStr").val($scope.search[val].sesameStatusStr);

                $("#minSubscribeAmt").val($scope.search[val].minSubscribeAmt);
                $("#incSubscribeAmt").val($scope.search[val].incSubscribeAmt);
                $('#amount').attr('placeholder',$scope.search[val].minSubscribeAmt/10000+'万起投，'+$scope.search[val].incSubscribeAmt/10000+'万递增');
                $modalInstance.close();
            }
        };
    };
    $scope.action.getSesame = function(){
        $modal.open({
            backdrop: true,
            backdropClick: true,
            dialogFade: false,
            keyboard: true,
            templateUrl : 'getSesameModal.html',
            controller : getSesameModal,
            windowClass:'modal-320'
        });
    };

    /*
    * 标题：添加银行卡
    * 功能描述:添加input，点击保存
    *时间：2019-03-13
    * */
    var getBankModal = function($scope,$modalInstance,tools,userName,userId,vm){
        $scope.bank={};
        $scope.form = {};
        $scope.form.userName=userName;
        $scope.form.userId=userId;
        $scope.bankExist=true;
        $scope.bankNotExistShow='';

        $scope.sameCard=function(){
            if($('#reCardNo').val()!=$('#cardNo').val()){
                $('#notSameCard').show();
            }else{
                $('#notSameCard').hide();
                if (!/^[0-9]{16,19}$/.test($('#reCardNo').val())){
                    return tools.interalert('卡号不合法，请重新输入');
                }
                //请求对应银行信息
                $.ajax({
                    type:"POST",
                    url:siteVar.serverUrl+"/sesametrade/querySesameCard.json",
                    data:{cardno:$('#reCardNo').val()},
                    success:function(data){
                        if(data.success){
                            $scope.$applyAsync(function () {
                                var hasBankCode=false;
                                for(var key in dictionaryBank){
                                    if(dictionaryBank[key].bankCodeEx == data.data.businessBankCode){
                                        hasBankCode=true;
                                    }
                                }
                                $scope.form.bankCode=data.data.businessBankCode;
                                console.log($scope.form.bankCode);
                                if(hasBankCode){
                                    $scope.bankExist=true;
                                    $scope.bankNotExistShow='';
                                    $scope.check.checkBank=false;
                                }else{
                                    //银行字典内不包含当前银行编码
                                    $scope.bankExist=false;
                                    $scope.bankNotExistShow=data.data.bankName;
                                    $scope.form.bankName=data.data.bankName;
                                }
                            });
                        }else{
                            tools.interalert(data.msg);
                            $scope.bankExist=true;
                            $scope.bankNotExistShow='';
                            $scope.check.checkBank=false;
                        }
                    },
                    error:function (data) {
                        tools.interalert(data.msg);
                        $scope.bankExist=true;
                        $scope.bankNotExistShow='';
                        $scope.check.checkBank=false;
                    }
                });
            }
        };

        //银行名称
        $.ajax({
            type:"POST",
            url:siteVar.serverUrl+"/sesamerefund/getPayBankList.json",
            success:function(data){
                if(data.success){
                    $scope.$apply(function(){
                        $scope.bank=data.data;
                        dictionaryBank=data.data;
                        $scope.check={checkBank:true};
                    });
                }else{
                    tools.interalert(data.msg);
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
            if(!v){return tools.interalert("请选择省份！");}
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
                        tools.interalert(data.msg);
                    }
                }
            });
        };
        $scope.cityFun = function(city){
            if(city){
                $scope.form.cityName = $("#id-city").find("option:selected").text();
            }
        };
        //支行搜索
        $scope.bankFun = function(){
            var bank=$("#branch").val();
            if(!bank) return tools.interalert("请输入支行名称以便模糊查找");
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
                        tools.interalert(data.msg);
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
            if(!$scope.form.userName)return tools.interalert("持卡人不能为空！");
            if(!$scope.form.userId)return tools.interalert("持卡人ID不能为空！");
            if(!$scope.form.cardNo)return tools.interalert("银行卡号不能为空！");
            if(!$scope.form.reCardNo)return tools.interalert("确认卡号不能为空！");
            if(!$scope.form.bankCode)return tools.interalert("银行CODE不能为空！");
            if(dictionaryBank.length && $scope.bankExist){
                for(var k=0;k<dictionaryBank.length;k++){
                    if(dictionaryBank[k].bankCodeEx == $scope.form.bankCode){
                        $scope.form.bankName=dictionaryBank[k].bankName;
                    }
                }
            }
            if(!$scope.form.bankName)return tools.interalert("银行名称不能为空！");
            if(!$scope.form.provinceCode)return tools.interalert("开户行所在省不能为空！");
            if(!$scope.form.cityCode)return tools.interalert("开户行所在市不能为空！");
            if(!$scope.form.branchName)return tools.interalert("支行名称不能为空！");
            if( $scope.form.cardNo != $scope.form.reCardNo)return tools.interalert("银行卡号两次输入不一致，请重新输入！");

            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + "/sesametrade/addSesameBank.json",
                data:$scope.form,
                success: function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    if(data.success){
                        tools.interalert("添加银行卡成功！");
                        $scope.close();
                        var bank=$("#id-bankForm");
                        var userAccountDetail;
                        //如果该银行可匹配银行列表
                        if($scope.bankExist){
                            userAccountDetail = $('select[name="provinceCode"]',bank).find('option:selected').text()+"/"+$('select[name="cityCode"]',bank).find('option:selected').text()+"/"+
                                $('select[name="bankCode"]',bank).find('option:selected').text()+"/"+$('input[name="branchName"]',bank).val()+"/"+
                                $('input[name="userName"]',bank).val()+"/"+$('input[name="cardNo"]',bank).val();
                        }else{
                            userAccountDetail = $('select[name="provinceCode"]',bank).find('option:selected').text()+"/"+$('select[name="cityCode"]',bank).find('option:selected').text()+"/"+
                                $('input[name="bankNotExistShow"]',bank).val()+"/"+$('input[name="branchName"]',bank).val()+"/"+
                                $('input[name="userName"]',bank).val()+"/"+$('input[name="cardNo"]',bank).val();
                        }

                        $('#selectDefault').after('<option selected value="'+data.data+'">'+userAccountDetail+'</option>');
                        selectCardId=data.data;
                        userAccountDetailGloble = userAccountDetail;
                        $("#unionCode").val($scope.form.unionCode);
                        $("#cardid").val(data.data);
                    }else{
                        tools.interalert(data.msg);
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
        var realName=$("#realName").val(); var userId=$("#lenderid").val();
        if(realName&&userId){
            $scope.$emit('getCardList');
            $modal.open({
                backdrop:true,
                backdropClick:true,
                dialogFade:false,
                keyboard:true,
                templateUrl :"getBankModal.html",
                controller:getBankModal,
                windowClass:"modal-640",
                resolve:{
                    "vm":function (){
                        return $scope;
                    },
                    "userName":function (){
                        return realName;
                    },
                    "userId":function (){
                        return userId;
                    }
                }
            });
        }else{
            tools.interalert('请填写用户姓名');
        }
    };

    //主页表单取消
    $scope.action.cancel = function(){
        window.location="#xinghuogoldrainbow-fixationProduct.html";
    };

    //主页表单保存
    $scope.action.save = function(){
        var submitVal = tools.getFormele({},Form);
        if(!submitVal.contractno) return tools.interalert("请填写合同编号");
        if(!submitVal.contractSignDateOrigin) return tools.interalert("请填写合同签署日期！");
        submitVal.contractDate=submitVal.contractSignDateOrigin.replace(/\D/g,'');
        if(!submitVal.realName) return tools.interalert("请填写用户姓名");
        if(!submitVal.lenderid) return tools.interalert("用户ID不能为空");
        if(!submitVal.managerName) return tools.interalert("请填写理财经理");
        if(!submitVal.userid) return tools.interalert("理财经理ID不能为空");
        if(!submitVal.ecifid) return tools.interalert("请填写ECIFID");
        if(!submitVal.sesameName) return tools.interalert("请填写产品名称");
        if(!submitVal.sesameCode) return tools.interalert("产品编码不能为空");
        if(!submitVal.amount) return tools.interalert("请填写投资金额");
        if(submitVal.amount==0) return tools.interalert("投资金额格式有误");
        if(!submitVal.usercardid) return tools.interalert("请选择打款银行卡");
        if(submitVal.usercardid){submitVal.userAccountDetailGloble=userAccountDetailGloble}

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
    };

    //保存信息弹层
    var viewSaveInfo = function($scope,info,tools,$modalInstance){
        $scope.selcet={};
        $scope.info = info;
        $scope.info.amount2=tools.formatNumber($scope.info.amount);

        //取消
        $scope.close = function() {
            $modalInstance.close();
        };

        $scope.save = function(e){
            var self = e.currentTarget;
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + "/sesametrade/addSesameTrade.json",
                data: $scope.info,
                success: function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    if(data.success){
                        tools.interalert("新增交易单成功");
                        $scope.close();
                        window.location="#xinghuogoldrainbow-fixationProduct.html";
                    }else{
                        tools.interalert(data.msg);
                    }
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });
        }
    };
}
