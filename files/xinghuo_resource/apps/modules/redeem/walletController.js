'use strict';
function walletController($scope, $modal, getSelectListFactory, tools, DTOptionsBuilder, DTColumnBuilder) {
    var domForm = $("#js_form"), conditionItem = domForm.find(".form-group");
    $scope.form = {
        isShow: (conditionItem.length > 6) ? true : false
    };
    $scope.select = {};
    $scope.action = {};
    $scope.form.payChannel =1;
    /*
     获取枚举类型
     */
    var selectList = getSelectListFactory.getSelectList(['sp_status', 'walletsettletype']);
    selectList.then(function(data){
        $scope.select.sp_status = data.appResData.retList[0].sp_status;
        $scope.select.walletSettleType = data.appResData.retList[1].walletsettletype;
    });

    /*
     创建表格选项
     */
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/singlepayment/tableSinglePayMent.shtml',
            type: 'POST',
            data: $scope.form
        })
        .withDataProp('data')
        .withOption('createdRow', function(row, data, dataIndex) {
            angular.element(row).addClass("rows" + data.id)
        })
        .withOption('searching',false)
        .withOption('ordering',false)
        .withOption('serverSide',true)
        .withOption('processing',false)
        .withOption('scrollX',true)
        .withLanguage(tools.dataTablesLanguage)
        .withOption('fnDrawCallback', fnDrawCallback)
        .withPaginationType('simple_numbers');
    vm.dtColumns = [
        DTColumnBuilder.newColumn('createTime').withTitle('创建时间').withOption('sWidth','140px').renderWith(function(data, type, full) {
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('appRedeemNo').withTitle('赎回单ID/返现申请ID').withOption('sWidth','270px').renderWith(function(data, type, full) {
            return '<a href="javascript:void(0);" class="infoDetail" data-type="' + full.walletSettleType + '" data-href="/xinghuodeal/redeemDetail.shtml?appRedeemId=' + data + '" data-href2="/singlepayment/singlePayMentDetail.shtml?appredeemNo=' + data + '">' + data + '</a>';
        }),
        //DTColumnBuilder.newColumn('dealNO').withTitle('交易单号').withOption('sWidth','190px').renderWith(function(data, type, full) {
        //    if(!data) return "";
        //    return '<a href="javascript:void(0);" class="infoDetail" data-href="/xinghuodeal/tradeinfo.shtml?&no=' + data + '">' + data + '</a>';
        //}),
        DTColumnBuilder.newColumn('trusteeshipStr').withTitle('是否托管').withOption('sWidth', '60px'),
        DTColumnBuilder.newColumn('userName').withTitle('出借人姓名').withOption('sWidth','90px').renderWith(function(data, type, full) {
            if(!data) return "";
            return '<a href="javascript:void(0);" class="infoDetail" data-href="/xinghuouser/userinfo.shtml?bizSysRoute=0&userType=consumer&id=' + full.userId + '">' + data + '</a>';
        }),
        DTColumnBuilder.newColumn('amountStr').withTitle('付款金额').withOption('sWidth', '60px'),
        DTColumnBuilder.newColumn('stateStr').withTitle('结算单状态').withOption('sWidth', '100px'),
        DTColumnBuilder.newColumn('bizId').withTitle('星火付款单号').withOption('sWidth','270px'),
        DTColumnBuilder.newColumn('txId').withTitle('平台付款单号').withOption('sWidth','250px'),
        DTColumnBuilder.newColumn('respDescription').withTitle('付款备注').withOption('sWidth','150px').renderWith(function(data, type, full) {
            return '<span class="ui_ellipsis" style="width: 150px" title="' + data + '">' + data + '</span>';
        }),
        DTColumnBuilder.newColumn('completeTime').withTitle('完成时间').withOption('sWidth','140px').renderWith(function(data, type, full) {
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('id').withTitle('操作').withOption('sWidth','50px').renderWith(function(data, type, full) {
            if(full.state == "00" && full.walletSettleType == 2){
                return '<a href="javascript:void(0);" data-no="' + data + '" class="singleDelete">删除</a>';
            }else{
                return "";
            }

        })
    ];
    $scope.action.reset = function(){
        for(var prop in $scope.form){
            if(prop !== 'isShow') delete $scope.form[prop];
        }
        $scope.form.payChannel =1;
        vm.dtInstance.rerender();
    };
    $scope.action.search = function(){
        vm.dtInstance.rerender();
    };
    //结算搜索返现申请单
    var detailModalCtrl = function($scope, info, id, data, $modalInstance){
        //type 1 是结算 2是批量删除
        $scope.info = info;
        $scope.id = id;
        var url;
        if(id == "settlementBtn" ){
            $scope.modalTitle = "确认结算以下返现申请";
            url = siteVar.serverUrl + "/singlepayment/batchSettlement.shtml";
        }else{
            $scope.modalTitle = "确认删除以下返现申请";
            url = siteVar.serverUrl + "/singlepayment/batchDeleteSinglePayMent.shtml"
        };
        $scope.detailSubmitBtn = function(){
            if(!id){
                return;
            }
            $.ajax({
                type: "post",
                url: url,
                data:data,
                success: function(data){
                    $modalInstance.close();
                    if(!tools.interceptor(data)) return;

                    if(data.success){
                        alert(data.msg)
                        vm.dtInstance.rerender();
                    }else{
                        alert(data.msg)
                    }

                },
                error: function(err){
                    tools.ajaxError(err);
                }
            })
        };
        $scope.close = function() {
            $modalInstance.close();
        };
    }
    $scope.action.settleAndDetele = function(e){
        var target = e.currentTarget, id = $(target).attr("id");
        if($scope.form.state != "00"){
            return alert("结算单状态，请选择代付款！");
        }
        if($scope.form.walletSettleType != "2"){
            return alert("钱包结算类型，请选择私募返现！");
        };
        var self = $(target);
        if(!tools.ajaxLocked(self)) return;
        $.ajax({
            type: "post",
            url: siteVar.serverUrl + "/singlepayment/confrimSinglePayMent.shtml",
            data: $scope.form,
            dataType:"json",
            success: function(data){
                tools.ajaxOpened(self);
                if(!tools.interceptor(data)) return;
                if(data.success){
                    $modal.open({
                        backdrop: true,
                        backdropClick: true,
                        dialogFade: false,
                        keyboard: true,
                        templateUrl : 'detailModal.html',
                        controller : detailModalCtrl,
                        windowClass:'modal-640',
                        resolve:{
                            "info" : function(){
                                return data.data;
                            },
                            "id" : function(){
                                return id;
                            },
                            "data" : function(){
                                return $scope.form;
                            }
                        }
                    });
                }else{
                    alert(data.msg)
                }

            },
            error: function(err){
                tools.ajaxOpened(self);
                tools.ajaxError(err);
            }
        })

    };

    var applyModalCtrl = function($scope, $timeout, $modalInstance) {
        $scope.modalTitle = '提交返现申请';
        $scope.form = {};
        $scope.submitType = 0;
        $scope.showFlag = true;
        $scope.host = siteVar.serverUrl;
        $timeout(function(){
            $("#radioList").find("input[type='radio']").uniform();
        }, 0);
        $scope.getUserInfo = function(){
            if($.trim($scope.form.userId)){
                $.ajax({
                    type: "post",
                    url: siteVar.serverUrl + "/xinghuouser/getUserInfo.json",
                    data: {
                        userId:$scope.form.userId
                    },
                    dataType: "json",
                    success: function (data) {
                        if(data.success){
                            $scope.form.username = data.data ? data.data.realname:"";
                            $scope.$digest();
                        }
                    },
                    error: function (err) {
                        tools.ajaxOpened(self);
                        tools.ajaxError(err);
                    }
                });
            }

        };
        $scope.confirmInfo = function(){
            if(!$.trim($scope.form.userId)){
                return alert("请输入星火用户ID！");
            };
            if(!$.trim($scope.form.productName)){
                return alert("请输入产品名称！");
            };
            if(!$.trim($scope.form.amount)){
                return alert("请输入返现金额！");
            };

            var reg = new RegExp('^[1-9]\d*\.\d*|0\.\d*[1-9]\d*|0?\.0+|0$');
            if(!reg.test($scope.form.amount - 0)){
                return alert("返现金额必须为数字！")
            }

            if(!$.trim($scope.form.remark)){
                return alert("请输入备注！");
            };
            if($scope.form.amount > 10000 && !confirm("返现金额大于1万，是否确认提交？若确认则继续下一步")){
                return;
            }
            $scope.modalTitle = '确认申请信息';
            $scope.showFlag = false;
        };
        $scope.ok = function() {
            var self = $("#confirmBtn");

            if(!tools.ajaxLocked(self)) return;
            $modalInstance.close();
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + "/singlepayment/applyCashBack.shtml",
                data: $scope.form,
                dataType: "json",
                success: function (data) {
                    tools.ajaxOpened(self);
                    if (!tools.interceptor(data)) return;
                    if (data.success) {
                        alert("提交返现成功");
                        return vm.dtInstance.rerender();
                    }else{
                        alert("提交返现失败");
                    };
                },
                error: function (err) {
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });
        };
        $scope.confirmInfoBatch = function(){
            var self = $("#confirmInfoBatch");
            var data = new FormData($("#confirmInfoBatchForm")[0]);
            if(!data.get("mfile").name){
                return alert("请选择导入的excel！")
            };
            if(!tools.ajaxLocked(self)) return;

            $.ajax({
                url : siteVar.serverUrl + "/singlepayment/batchApplyCashBack.shtml",
                type:"POST",
                data : data,
                dataType: "json",
                processData: false,
                contentType: false,
                success :function(data){
                    if(typeof data == "string"){
                        var data = JSON.parse(data);
                    };
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    if(data.success) {
                        alert("请求成功！")
                        $modalInstance.close();
                        vm.dtInstance.rerender();
                    }else{
                        alert(data.msg)
                    }
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }

            });
        }
        $scope.cancel = function() {
            $scope.showFlag = true;
            $scope.modalTitle = '修改赎回金额';
        };
        $scope.close = function() {
            $modalInstance.close();
        };
    };
    $scope.action.apply = function(){
        var now = new Date(), h = now.getHours();
        //if(h - 15 > -1){
            $modal.open({
                backdrop: true,
                backdropClick: true,
                dialogFade: false,
                keyboard: true,
                templateUrl : 'myModalContent.html',
                controller : applyModalCtrl,
                windowClass:'modal-640'
            });
        //}else{
        //    return alert("请于15:00后提交返现申请！");
        //}
    };
    //详情
    function infoDetailModalCtrl($scope, info, $modalInstance){
        $scope.info = info;
        info.walletSettleType = info.walletSettleType == 1 ? "产品赎回":"私募返现";
        info.createTime = tools.toJSDate(info.createTime);
        //info.adviserRate = (new Number(info.adviserRate)).mul(100)
        $scope.close = function() {
            $modalInstance.close();
        };
    }
    function fnDrawCallback(data){
        tools.createModal();
        tools.createModalProgress();
        var popUpLayer = $("#js_dialog"), popUpLayerContent = popUpLayer.find(".js_content");

        $(".js_export").on("click", function(){
            tools.export(this);
        });

        var table = $("#dataTables"), tbody = table.find("tbody");
        table.off("click").on("click", ".infoDetail", function(){
            var self = $(this), href = self.attr("data-href"), data, url, type = self.attr("data-type");
            if(type == 2){
                href = self.attr("data-href2")
            }
            data = tools.queryUrl(href);
            url = href.split('?')[0];
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + url,
                data: data,
                success: function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    if(type != 2){
                        popUpLayerContent.html(data);
                        popUpLayer.modal("show");
                    }else{
                        if(data.success){
                            $modal.open({
                                backdrop: true,
                                backdropClick: true,
                                dialogFade: false,
                                keyboard: true,
                                templateUrl : 'infoDetailModal.html',
                                controller : infoDetailModalCtrl,
                                resolve:{
                                    "info" : function(){
                                        return data.data;
                                    }
                                }
                            });
                        }

                    }

                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            })
        });
        table.on("click", ".singleDelete", function(){
            if(!window.confirm("确认删除该条返现申请？")){
                return false;
            }
            var self = $(this), no = self.attr("data-no");
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + "/singlepayment/deleteSinglePayMent.shtml",
                data: {
                    id:no
                },
                success: function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    if(data.success){
                        vm.dtInstance.rerender();
                    }

                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            })
        });
    }
}
