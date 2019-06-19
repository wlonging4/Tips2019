'use strict';
function changeBank($scope, $http,$modal, getSelectListFactory, tools, DTOptionsBuilder, DTColumnBuilder) {
    var domForm = $("#js_form"), conditionItem = domForm.find(".form-group"), subtype;
    $scope.form = {
        isShow: (conditionItem.length > 1) ? true : false
    };
    $scope.select = {};
    $scope.action = {};
    getSelectListFactory.getSelectList(['sesame_card_change_status']).then(function(data){
        $scope.select.applyStatus = data.appResData.retList[0].sesame_card_change_status;

    });






    /*
     创建表格选项
     */
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax',{
        url: siteVar.serverUrl + '/sesameCardChange/tableCardChangeApply.shtml',
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
        .withOption('scrollX',true)
        .withOption('processing',false)
        .withLanguage(tools.dataTablesLanguage)
        .withOption('fnDrawCallback',fnDrawCallback)
        .withPaginationType('simple_numbers');
    vm.dtColumns = [
        DTColumnBuilder.newColumn('changeApplyNo').withTitle('变更申请单号').withOption('sWidth', '280px').renderWith(function(data, type, full) {
            if(!data) return "";
            return '<a href="javascript:void(0);" class="changeInfo" data-href="/sesameCardChange/viewCardChangeApply.json?changeApplyNo=' + data + '">' + data + '</a>';
        }),
        DTColumnBuilder.newColumn('userName').withTitle('用户姓名').withOption('sWidth','70px'),
        DTColumnBuilder.newColumn('tradeApplyNo').withTitle('交易订单号').withOption('sWidth','280px').renderWith(function(data, type, full) {
            if(!data) return "";
            return '<a href="javascript:void(0);" class="infoDetail" data-href="/sesametrade/viewSesameTrade.json?applyid=' + data + '&id=' + full.tradeId + '">' + data + '</a>';
        }),
        DTColumnBuilder.newColumn('financialUserName').withTitle('理财经理姓名').withOption('sWidth','140px').renderWith(function(data, type, full) {
            if(!data) return "";
            return '<a href="javascript:void(0);" class="infoManage" data-href="/xinghuouser/userinfo.shtml?id=' + full.financialUserId + '&userType=director">' + data + '</a>';
        }),
        DTColumnBuilder.newColumn('originCardMsg').withTitle('变更前银行卡信息').withOption('sWidth', '160px'),
        DTColumnBuilder.newColumn('cardMsg').withTitle('变更后银行卡信息').withOption('sWidth', '160px'),
        DTColumnBuilder.newColumn('applyTime').withTitle('申请时间').withOption('sWidth', '140px').renderWith(function(data, type, full) {
            if(!data) return "";
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('applyStatusStr').withTitle('申请状态').withOption('sWidth', '160px')
    ];
    $scope.action.reset = function(){
        for(var prop in $scope.form){
            if(prop !== 'isShow') delete $scope.form[prop];
        };
        vm.dtInstance.rerender();
    };
    $scope.action.search = function(){
        vm.dtInstance.rerender();
    };
    var changeInfoModal = function($scope, tools, info, $modalInstance) {
        $scope.info = info;
        $scope.info.applyTime = info.applyTime ? tools.toJSDate(info.applyTime):"";
        $scope.info.createTime = info.createTime ? tools.toJSDate(info.createTime):"";
        $scope.info.auditTime = info.auditTime || "";

        //取消
        $scope.close = function() {
            $modalInstance.close();
        };

    };

    /*交易单号详情 copy 自 fixationProduct----by zhongyan*/
    var infoDetailModalCtrl = function($scope, tools, info, $modalInstance) {
        $scope.action = {};
        $scope.info = info;
        $scope.info.contractAmt = info.contractAmt == null ? "" : tools.formatNumber(info.contractAmt);
        $scope.info.payAmt = info.payAmt == null ? "" : tools.formatNumber(info.payAmt);
        $scope.info.buyAmt = info.buyAmt == null ? "" : tools.formatNumber(info.buyAmt);
        $scope.info.netAmt = info.netAmt == null ? "" : tools.formatNumber(info.netAmt);
        $scope.info.transAmt = info.transAmt == null ? "" : tools.formatNumber(info.transAmt);
        $scope.info.confirmAmount = info.confirmAmount == null ? "" : tools.formatNumber(info.confirmAmount);
        $scope.info.redeemAmount = info.redeemAmount == null ? "" : tools.formatNumber(info.redeemAmount);
        $scope.info.cmpletedEarnings = info.cmpletedEarnings == null ? "" : tools.formatNumber(info.cmpletedEarnings);
        $scope.info.netValue = info.netValue == null ? "" : tools.formatNumber(info.netValue);
        $scope.info.subscribeSuccessDate = !info.subscribeSuccessDate ? "" : info.subscribeSuccessDate.substr(0, 4) + "-" + info.subscribeSuccessDate.substr(4, 2) + "-" + info.subscribeSuccessDate.substr(6, 2) + " " + info.subscribeSuccessDate.substr(8, 2) + ":" + info.subscribeSuccessDate.substr(10, 2) + ":" + info.subscribeSuccessDate.substr(12, 2);
        $scope.info.valueDate = !info.valueDate ? "" : info.valueDate.substr(0, 4) + "-" + info.valueDate.substr(4, 2) + "-" + info.valueDate.substr(6, 2) + " " + info.valueDate.substr(8, 2) + ":" + info.valueDate.substr(10, 2) + ":" + info.valueDate.substr(12, 2);
        $scope.info.contractSignDate = info.contractSignDate == null ? "" : info.contractSignDate.substr(0, 4) + "-" + info.contractSignDate.substr(4, 2) + "-" + info.contractSignDate.substr(6, 2) + " " + info.contractSignDate.substr(8, 2) + ":" + info.contractSignDate.substr(10, 2) + ":" + info.contractSignDate.substr(12, 2);
        //银行卡
        var h = info.bankCardno == null ? "" : $scope.info.bankCardno.length,
            str = '';
        for (var i = 0; i < h - 8; i++) {
            str += '*'
        }
        $scope.info.bankCardno = info.bankCardno == null ? "" : $scope.info.bankCardno.substr(0, 4) + str + $scope.info.bankCardno.substr(h - 4, 4);
        //手机号
        var phoneH = info.userPhone == null ? 0 : $scope.info.userPhone.length,
            phoneStr = '';
        for (var j = 0; j < phoneH - 7; j++) {
            phoneStr += '*';
        }
        $scope.info.userPhone = info.userPhone == null ? "" : $scope.info.userPhone.substr(0, 3) + phoneStr + $scope.info.userPhone.substr(7);
        $scope.info.financialUserPhone = info.financialUserPhone == null ? "" : $scope.info.financialUserPhone.substr(0, 3) + phoneStr + $scope.info.financialUserPhone.substr(7);
        //自营
        $scope.encodeInfo = encodeURIComponent(JSON.stringify(info))
        //取消
        $scope.close = function() {
            $modalInstance.close();
        };
        //查看协议
        $scope.action.dealFile = function(event) {
            var self = event.currentTarget;
            $.when($.ajax({
                url: siteVar.serverUrl + "/sesametrade/lookSignedPDFPage.json"
            })).then(function(data) {
                if (data.success) {
                    if (!tools.ajaxLocked(self)) return;
                    $.ajax({
                        type: "post",
                        url: siteVar.serverUrl + '/sesametrade/lookSignedPDF.json',
                        data: {
                            appreqid: info.appreqid
                        },
                        success: function(data) {
                            tools.ajaxOpened(self);
                            if (!tools.interceptor(data)) return;
                            if (data.success) {
                                var openWin = window.open('about:blank');
                                openWin.location.href = data.data;
                            }
                        },
                        error: function(err) {
                            tools.ajaxOpened(self);
                            tools.ajaxError(err);
                            return false;
                        }
                    })
                }

            }).fail(function(err) {
                tools.ajaxOpened(self);
                tools.ajaxError(err);
                return false;
            });

        }
    };

    ;(function () {
        $("#export").on("click", function(){
            tools.export(this);
        });
    })();
    function fnDrawCallback(){
        tools.createModal();
        tools.createModalProgress();
        var popUpLayer = $("#js_dialog"), popUpLayerContent = popUpLayer.find(".js_content");

        $(".js_export").on("click", function(){
            tools.export(this);
        });

        var table = $("#dataTables"), tbody = table.find("tbody");
        table.off("click").on("click", ".changeInfo", function(){
            var self = $(this), href = self.attr("data-href"), data, url;
            data = tools.queryUrl(href);
            url = href.split('?')[0];
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + url,
                data: data,
                dataType: "json",
                success: function(data){
                    data.data.sesameCode=$scope.form.sesameCode;
                    data.data.sesameName=$scope.form.sesameName;
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    if(data.success){
                        //var info = $.extend({}, data.data.dbDto, data.data.httpDto);
                        $modal.open({
                            backdrop: true,
                            backdropClick: true,
                            dialogFade: false,
                            keyboard: true,
                            templateUrl: 'changeInfoModal.html',
                            controller: changeInfoModal,
                            //windowClass:'modal-640',
                            resolve: {
                                "info": function() {
                                    return data.data;
                                }
                            }
                        });
                    }else{
                        alert(data.msg);
                    }

                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError403(err);
                }
            })

        });
        table.on("click", ".infoDetail", function(){
            var self = $(this), href = self.attr("data-href"), data, url;
            data = tools.queryUrl(href);
            url = href.split('?')[0];
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + url,
                data: data,
                dataType: "json",
                success: function(data){
                    data.data.sesameCode=$scope.form.sesameCode;
                    data.data.sesameName=$scope.form.sesameName;
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    if(data.success){
                        //var info = $.extend({}, data.data.dbDto, data.data.httpDto);
                        $modal.open({
                            backdrop: true,
                            backdropClick: true,
                            dialogFade: false,
                            keyboard: true,
                            templateUrl: 'infoDetailModal.html',
                            controller: infoDetailModalCtrl,
                            //windowClass:'modal-640',
                            resolve: {
                                "info": function() {
                                    return data.data;
                                }
                            }
                        });
                    }else{
                        alert(data.msg);
                    }

                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError403(err);
                }
            })

        });
        table.on("click", ".infoManage", function(){
            var self = $(this), href = self.attr("data-href"), data, url;
            data = tools.queryUrl(href);
            url = href.split('?')[0];
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url:siteVar.serverUrl + url,
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
    }
}
