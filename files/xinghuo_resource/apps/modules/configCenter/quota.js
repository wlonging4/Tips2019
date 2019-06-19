'use strict';
function quota($scope, $modal, tools, DTOptionsBuilder, DTColumnBuilder) {
    var domForm = $("#js_form"), conditionItem = domForm.find(".form-group");
    $scope.form = {
        isShow: (conditionItem.length > 6) ? true : false
    };
    $scope.select = {};
    $scope.action = {};
    /*
     创建表格选项
     */
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/xinghuosite/tableQuota.shtml',
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
        DTColumnBuilder.newColumn('no').withTitle('交易单号').withOption('sWidth','200px').renderWith(function(data, type, full) {
            if(!data) return "";
            var highLight = full.isHighLight ? "highLight" : "";
            return '<a href="javascript:void(0)" class="infoDetail ' + highLight + '" data-href="/xinghuodeal/tradeinfo.shtml?id=' + full.id + '&no=' + full.no + '">' + data + '</a>';
        }),
        DTColumnBuilder.newColumn('subproductname').withTitle('产品名称').withOption('sWidth','160px').renderWith(function(data, type, full) {
            if(!data) return "";
            return '<a href="javascript:void(0);" class="infoDetail" data-href="/xinghuoproduct/productinfo.shtml?productid=' + full.subproductid + '&category=' + full.category + '">' + data + '</a>';
        }),
        DTColumnBuilder.newColumn('fmamount').withTitle('出借金额').withOption('sWidth','110px'),
        DTColumnBuilder.newColumn('lendername').withTitle('出借人姓名').withOption('sWidth','80px'),
        DTColumnBuilder.newColumn('userid').withTitle('理财经理ID').withOption('sWidth','120px').renderWith(function(data, type, full) {
            if(!data) return "";
            return '<a href="javascript:void(0);" class="infoDetail" data-href="/xinghuouser/userinfo.shtml?userType=director&id=' + data + '">' + data + '</a>';
        }),
        DTColumnBuilder.newColumn('lockQuotaTime').withTitle('加锁时间').withOption('sWidth','160px').renderWith(function(data, type, full) {
            if(!data) return "";
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('no').withTitle('操作').withOption('sWidth','280px').renderWith(function(data, type, full) {
            if(!data) return "";
            return '<a href="javascript:void(0);" class="btn btn-success btn-xs js_site_quota_lock_cancel" data-href="/xinghuosite/unlockQuota.shtml?dealno=' + data + '">取消锁定</a>'
                    +'<a href="javascript:void(0);" class="btn btn-danger btn-xs underlinePay" data-info=\'' + JSON.stringify(full) + '\'>提交线下大额支付</a>'
                    +'<a href="javascript:void(0);" class="btn btn-primary btn-xs payStatus" data-href="/xinghuosite/syncPaymentResult.shtml?dealno=' + data + '">同步支付状态</a>';
        })
    ];
    $scope.action.search = function(){
        vm.dtInstance.rerender();
    };
    var ModalCtrl = function($scope, $modalInstance) {
        $scope.form = {};
        $scope.action = {};
        $scope.queryInfo = function(){
            var self = $("#dealnoInput");
            if(!$scope.form.dealno){
                return;
            };
            if(!tools.ajaxLocked(self)) return;

            $.ajax({
                type: "post",
                url: siteVar.serverUrl + "/xinghuosite/queryDealByno.shtml",
                data: $scope.form,
                dataType: "json",
                success: function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    if(data.success){
                        $scope.$apply(function(){
                            $scope.lendername = data.data.lendername;
                            $scope.fmamount = data.data.fmamount;
                        });
                    };
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });
        };
        $scope.ok = function() {
            var self = $("#confirmBtn");
            if(!$scope.form.dealno) return;
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + "/xinghuosite/lockQuota.shtml",
                data: $scope.form,
                dataType: "json",
                success: function (data) {
                    tools.ajaxOpened(self);
                    //if (!tools.interceptor(data)) return;
                    if (data.success) {
                        alert("锁定成功");
                        $modalInstance.close();
                        vm.dtInstance.rerender();
                    }else{
                        alert("锁定失败");
                    };
                },
                error: function (err) {
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });
        };
        $scope.cancel = function() {
            $modalInstance.close();
        };
    };
    $scope.action.config = function(){
        $modal.open({
            backdrop: true,
            backdropClick: true,
            dialogFade: false,
            keyboard: true,
            templateUrl : 'myModalContent.html',
            controller : ModalCtrl,
            windowClass:'modal-640'
        });
    };
    var underlinePayModalCtrl = function ($scope, $modalInstance, info) {
        $scope.info = info;
        $scope.info.fmamountCN = tools.toChineseCharacters((info.fmamount || 0).split(",").join("") - 0);
        $scope.cancel = function() {
            $modalInstance.close();
        };
        $scope.confirmInfo = function () {
            if(!window.confirm('请确认 "' + info.lendername + '" 该笔交易单资金已匹配到账')){
                return;
            };
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + "/xinghuosite/confirmPayment.shtml",
                data: {
                    dealno:info.no
                },
                dataType: "json",
                success: function (data) {
                    if (data.success) {
                        $modalInstance.close();
                        vm.dtInstance.rerender();
                        alert("支付成功，请前往交易单列表查看！");
                    }else{
                        alert("支付失败:" + data.msg);
                    };
                },
                error: function (err) {
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });
        }
    };

    function fnDrawCallback(){
        tools.createModal();
        tools.createModalProgress();
        var popUpLayer = $("#js_dialog"), popUpLayerContent = popUpLayer.find(".js_content");
        var table = $("#dataTables"), tbody = table.find("tbody");
        tbody.find(".highLight").parents("tr").addClass("ui_click");
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
                    var form = $("#js_recommend_product_form");
                    form.find("input[type=checkbox]").uniform();
                    popUpLayer.modal("show");
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            })
        });

        table.on("click", ".js_site_quota_lock_cancel", function(){
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
                    var data = JSON.parse(data);
                    if(data.success){
                        vm.dtInstance.rerender();
                    }else{
                        alert(data.msg);
                    };
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            })
        });
        table.on("click", ".underlinePay", function () {
            var info = $(this).attr("data-info");
            info = JSON.parse(info);
            $modal.open({
                backdrop: true,
                backdropClick: true,
                dialogFade: false,
                keyboard: true,
                templateUrl : 'underlinePayModal.html',
                controller : underlinePayModalCtrl,
                windowClass:'modal-640',
                resolve:{
                    "info" : function(){
                        return info;
                    }
                }
            });
        });
        table.on("click", ".payStatus", function () {
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
                    var data = JSON.parse(data);
                    if(data.success){
                        alert(data.msg);
                        vm.dtInstance.rerender();
                    }else{
                        alert(data.msg);
                    };
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            })
        });
    }
}
