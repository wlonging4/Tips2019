'use strict';
function refund($scope, $modal, getSelectListFactory, getProListFactory, tools, DTOptionsBuilder, DTColumnBuilder) {
    var domForm = $("#js_form"), conditionItem = domForm.find(".form-group");
    $scope.form = {
        isShow: (conditionItem.length > 6) ? true : false
    };
    $scope.select = {};
    $scope.action = {};
    /*
     获取枚举类型
     */
    getSelectListFactory.getSelectList(['refundstatus']).then(function(data){
        $scope.select.refundStatus = data.appResData.retList[0].refundstatus;
    });

    /*
     创建表格选项
     */
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/refund/getRefundList.shtml',
            type: 'POST',
            data: function(d){
                var data = tools.getFormele({}, domForm);
                $.extend(d, data);
            }
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
        DTColumnBuilder.newColumn('bizId').withTitle('退款支付任务号').withOption('sWidth', '250px'),
        DTColumnBuilder.newColumn('txId').withTitle('退款支付流水号').withOption('sWidth','210px'),
        DTColumnBuilder.newColumn('feeId').withTitle('退款业务单号').withOption('sWidth','170px'),
        DTColumnBuilder.newColumn('dealNo').withTitle('原交易单号').withOption('sWidth','200px'),
        DTColumnBuilder.newColumn('amount').withTitle('退款金额').withOption('sWidth','80px'),
        DTColumnBuilder.newColumn('refundType').withTitle('退款类型').withOption('sWidth','80px').renderWith(function(data,type,full){
            return data === 1 ? "星火钱包" : "银行卡";
        }),
        DTColumnBuilder.newColumn('lenderName').withTitle('退款人姓名').withOption('sWidth', '80px'),
        DTColumnBuilder.newColumn('mobile').withTitle('退款人手机号').withOption('sWidth', '100px'),
        DTColumnBuilder.newColumn('lenderId').withTitle('退款人ID').withOption('sWidth','100px'),
        DTColumnBuilder.newColumn('applyTime').withTitle('申请时间').withOption('sWidth','150px').renderWith(function(data, type, full) {
            if(!data) return "";
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('completeTime').withTitle('完成时间').withOption('sWidth','160px').renderWith(function(data, type, full) {
            if(!data) return "";
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('refundStatusStr').withTitle('退款状态').withOption('sWidth','80px'),
        DTColumnBuilder.newColumn('memo').withTitle('备注').withOption('sWidth','170px').renderWith(function(data, type, full) {
            if(!data) return "";
            return '<span class="ui_ellipsis" title="' + data + '">' + data + '</span>';
        })
    ];
    $scope.action.reset = function(){
        for(var prop in $scope.form){
            if(prop !== 'isShow') delete $scope.form[prop];
        }
        vm.dtInstance.rerender();
    };
    $scope.action.search = function(){
        vm.dtInstance.rerender();
    };
    var ModalCtrl = function($scope, $modalInstance, type) {
        $scope.modalTitle = '修改赎回金额';
        $scope.form = {};
        $scope.select = {};
        //$scope.select.bankList = bankList;
        $scope.showFlag = true;
        $scope.confirmInfo = function(){
            if(!$.trim($scope.form.dealNo)){
                return alert("请输入订单号！");
            };
            var dataStr='';
            if(type==2){
                dataStr=$scope.form.dealNo+'&type=old';
            }else{
                dataStr=$scope.form.dealNo;
            }
            $.ajax({
                type: "get",
                url: siteVar.serverUrl + "/refund/getRefundDealDetail.shtml?dealNo=" + dataStr,
                dataType: "json",
                success: function (data) {
                    tools.ajaxOpened(self);
                    if(!data.success){
                        $modalInstance.close();
                    };
                    if (!tools.interceptor(data)) return;
                    if (data.success) {
                        $scope.$apply(function(){
                            $scope.showFlag = false;
                            $scope.form.amount = data.data.payAmount;
                        });
                    };
                },
                error: function (err) {
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });

        };
        $scope.ok = function() {
            var self = $("#confirmBtn");
            if(!tools.ajaxLocked(self)) return;
            $modalInstance.close();
            var url = siteVar.serverUrl + "/refund/applyRefund.shtml";
            if(type == 1){
                url = siteVar.serverUrl + "/refund/productCenterRefund.shtml"
            }
            $.ajax({
                type: "post",
                url: url,
                data: $scope.form,
                dataType: "json",
                success: function (data) {
                    tools.ajaxOpened(self);
                    if (!tools.interceptor(data)) return;
                    if (data.success) {
                        alert("退款申请提交成功");
                        vm.dtInstance.rerender();
                    }else{
                        alert("退款申请提交失败");
                    };
                },
                error: function (err) {
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });
        };
        $scope.close = function() {
            $modalInstance.close();
        };
    };
    $scope.action.refundModal = function(type){
        $modal.open({
            backdrop: true,
            backdropClick: true,
            dialogFade: false,
            keyboard: true,
            templateUrl : 'myModalContent.html',
            controller : ModalCtrl,
            windowClass:'modal-640',
            resolve:{
                "type":function () {
                    return type
                }
            }
        });
    }
    /*钱包退款申请*/
    function walletModalCtrl($scope,tools, $modalInstance){
        $scope.showFlag = true;
        $scope.form = {};
        $scope.info = {};
        //提交
        $scope.confirmInfo = function(event){
            var self = event.currentTarget;
            if(!tools.ajaxLocked(self)) return;
            if(!$.trim($scope.form.dealNo)){
                return alert("请输入订单号！");
            };
            $.ajax({
                type: "get",
                url: siteVar.serverUrl + "/refund/getRefundDealDetail.shtml?dealNo=" + $scope.form.dealNo,
                dataType: "json",
                success: function (data) {
                    tools.ajaxOpened(self);
                    if(!data.success){
                        $modalInstance.close();
                    };
                    if (!tools.interceptor(data)) return;
                    if (data.success) {
                        if(data.data.paytype==2){
                            $scope.$apply(function(){
                                $scope.showFlag = false;
                                $scope.form = data.data;
                                $scope.info.dealNo=data.data.no;
                                $scope.info.amount=data.data.payAmount;
                            });
                        }else{
                            alert('不是星火钱包订单，无法退款！');
                            $modalInstance.close();
                        }
                    };
                },
                error: function (err) {
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });
        };

        $scope.ok = function(event) {
            var self = event.currentTarget;

            if(!tools.ajaxLocked(self)) return;
            $modalInstance.close();
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + "/refund/walletApplyRefund.json",
                data: $scope.info,
                dataType: "json",
                success: function (data) {
                    tools.ajaxOpened(self);
                    if (!tools.interceptor(data)) return;
                    if (data.success) {
                        alert("退款申请提交成功");
                        vm.dtInstance.rerender();
                    }else{
                        alert("退款申请提交失败");
                    };
                },
                error: function (err) {
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });
        };
        $scope.close = function() {
            $modalInstance.close();
        };
    }
    $scope.action.walletRefundModal = function(){
        $modal.open({
            backdrop: true,
            backdropClick: true,
            dialogFade: false,
            keyboard: true,
            templateUrl : 'walletModalContent.html',
            controller : walletModalCtrl,
            windowClass:'modal-640'
        });
    }
    ;(function(){
        $(document).off("change").on('change',"#js_category",function(){
            var source = $(this).find ("option:selected").attr("source");
            $scope.form.source = source;
            getProListFactory.getProOtherList({
                category: $scope.form.category,
                source : source
            }).then(function(data){
                if(!data.success) {
                    alert("获取产品列表失败，请与管理员联系。"+data.msg);
                    return;
                }
                $scope.select.series = data.data.seriesList;
            });
            delete $scope.form.series;
            delete $scope.form.productNameCode;
            $scope.select.productNameCode = [];
            return false;
        });
    })();


    function fnDrawCallback(){
        console.log(window.ajaxDataInfo.info)
        $scope.$apply(function(){
            $scope.tableinfo = window.ajaxDataInfo.info || 0;
        });

        tools.createModal();
        tools.createModalProgress();
        var popUpLayer = $("#js_dialog"), popUpLayerContent = popUpLayer.find(".js_content");

        $(".js_export").on("click", function(){
            tools.export(this);
        });

        var table = $("#dataTables"), tbody = table.find("tbody");
        table.off("click").on("click", ".infoDetail", function(){
            var self = $(this), href = self.attr("data-href"), data, url;
            data = tools.queryUrl(href);
            url = href.split('?')[0];
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + url,
                data: data,
                dataType: "text",
                success: function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    popUpLayerContent.html(data);
                    popUpLayer.modal("show");
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            })
        });



        $("#js_redempt_settle_selected").off("click").on("click", function () {
            var setIds = [], checkLen, checkboxDom = table.find(".js_settle_checkbox");
            checkboxDom.each(function (i, e){
                if(e.checked){
                    setIds.push(e.value);
                };
            });
            checkLen = setIds.length;
            var difDom = '';
            if(checkLen > 0){
                difDom = '<div class="modal-body clearfix"><div>选中结算赎回单为' + checkLen + '条</div></div><div class="modal-footer"><button type="button" class="btn btn-primary fn-ms" data-dismiss="modal">取消</button><button type="button" class="btn btn-success fn-ms" id="js_jiesuan_checked_retrun">确认</button></div>';
            }else{
                difDom = '<div class="modal-body clearfix"><div>请选择需要结算的记录</div></div><div class="modal-footer"><button type="button" class="btn btn-primary fn-ms" data-dismiss="modal">确定</button></div>'
            }
            var html = '<div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button><h4 class="modal-title fn-ms">更新赎回单管理状态</h4></div>' + difDom + '</div>';
            popUpLayerContent.html(html);
            popUpLayer.modal("show");
            if(checkLen > 0){
                $("#js_jiesuan_checked_retrun").off("click").on("click",function(){
                    var self = this;
                    var data = {
                        redeemIds: setIds.join(',')
                    };
                    if(!tools.ajaxLocked(self)) return;
                    $.ajax({
                        type: "post",
                        url: siteVar.serverUrl + "/xinghuodeal/redeemSettlement.shtml",
                        data: data,
                        dataType: "json",
                        success: function(data){
                            tools.ajaxOpened(self);
                            if(!tools.interceptor(data)) return;
                            if(data.success) {
                                var callbackHtml = '<div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button><h4 class="modal-title fn-ms">更新赎回单管理状态</h4></div><div class="modal-body clearfix"><div>' + data.msg + '</div></div><div class="modal-footer"><button type="button" class="btn btn-primary fn-ms" data-dismiss="modal">确定</button></div></div>';
                                popUpLayerContent.html(callbackHtml);
                                popUpLayer.modal("show");
                                vm.dtInstance.rerender();
                            }
                        },
                        error: function(err){
                            tools.ajaxOpened(self);
                            tools.ajaxError(err);
                        }
                    });
                })

            };
            return false;

        });


        $("#js_redempt_settleall").on("click", function () {
            var data = tools.getFormele({}, $("#js_form"));
            var domList = {}, statusArr = [], typeArr = ['到期回款', '月息通收益'];
            angular.forEach($scope.select.redeem_status, function(data, index, array){
                statusArr.push(data.value)
            });
            for(var o in data){
                if( o == 'appRedeemId'){
                    domList[o] = '<div>赎回单ID为：' + data.appRedeemId + '</div>';
                };
                if( o == 'appOrderId'){
                    domList[o] = '<div>交易单号为：' + data.appOrderId + '</div>';
                };
                if( o == 'lenderId'){
                    domList[o] = '<div>出借人ID为：' + data.lenderId + '</div>';
                };
                if( o == 'repayAmountStart' || o == 'repayAmountEnd'){
                    domList['repayAmount'] = '<div>结算金额为：' + data.repayAmountStart + '-' + data.repayAmountEnd + '</div>';
                };
                if( o == 'applyTimeStart' || o == 'applyTimeEnd'){
                    domList['applyTime'] = '<div>申请时间为：' + data.applyTimeStart + '-' + data.applyTimeEnd + '</div>';
                };
                if( o == 'redeemStatus'){
                    domList[o] = data.redeemStatus;
                };
                if( o == 'receivedType'){
                    domList[o] = data.receivedType;
                };
                if( o == 'repayDate'){
                    domList[o] = '<div>到期日为：' + data.repayDate + '</div>';
                };
            };
            if(!!domList.redeemStatus){
                domList.redeemStatus = '<div>赎回状态为：' + statusArr[domList.redeemStatus - 1] + '</div>'
            };
            if(!!domList.receivedType){
                domList.receivedType = '<div>回款类型为：' + typeArr[domList.receivedType] + '</div>'
            };
            var settleData = '';
            for(var o in domList){
                settleData += domList[o];
            };
            var html = '';
            html += '<div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button><h4 class="modal-title fn-ms">更新赎回单管理状态</h4></div><div class="modal-body clearfix">';
            html += settleData;
            html +='</div><div class="modal-footer"><button type="button" class="btn btn-primary fn-ms" data-dismiss="modal">取消</button><button type="button" class="btn btn-success fn-ms" id="js_jiesuan_all_retrun">确认</button></div></div>';
            popUpLayerContent.html(html);
            popUpLayer.modal("show");
            $('#js_jiesuan_all_retrun').on('click',function(){
                var self = this;

                if(!tools.ajaxLocked(self)) return;
                $.ajax({
                    type: "post",
                    url: siteVar.serverUrl + "/xinghuodeal/redeemSettlement.shtml",
                    data: data,
                    dataType: "json",
                    success: function(data){
                        tools.ajaxOpened(self);
                        //if(!tools.interceptor(data)) return;
                        //if(data.success) {
                        var callbackHtml = '<div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button><h4 class="modal-title fn-ms">更新赎回单管理状态</h4></div><div class="modal-body clearfix"><div>' + data.msg + '</div></div><div class="modal-footer"><button type="button" class="btn btn-primary fn-ms" data-dismiss="modal">确定</button></div></div>';
                        popUpLayerContent.html(callbackHtml);
                        popUpLayer.modal("show");
                        vm.dtInstance.rerender();
                        //};
                    },
                    error: function(err){
                        tools.ajaxOpened(self);
                        tools.ajaxError(err);
                    }
                });
            })
        });
    }
}
