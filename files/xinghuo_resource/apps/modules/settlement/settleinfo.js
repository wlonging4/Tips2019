'use strict';
function settleinfo($scope, $location, $modal, tools, DTOptionsBuilder, DTColumnBuilder) {
    var form = $("#js_form"), conditionItem = form.find(".form-group");

    $scope.form = {
        isShow: (conditionItem.length > 6) ? true : false
    };
    $scope.select = {};
    $scope.action = {};
    var params = $location.$$search;
    $scope.managerId = params.userId || '';
    $scope.managersName = params.name || '';
    $scope.form.month = params.commMonth || '';
    $scope.status = params.settleStatus || '';
    $scope.settleType = params.settleType || '';
    //$scope.month_settlement_id = params.month_settlement_id || '';
    /*
     创建表格选项
     */
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/xinghuosettle/tableSettleinfo.shtml',
            type: 'POST',
            data: params
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
        DTColumnBuilder.newColumn('dealNo').withTitle("交易单号").withOption('sWidth', '180px').renderWith(function(data, type, full) {
            if(!data) return "";
            return '<a href="javascript:void(0);" class="infoDetail" data-href="/xinghuodeal/tradeinfo.shtml?id=' + full.id + '&no=' + data + '">' + data + '</a>';
        }),
        DTColumnBuilder.newColumn('lenderName').withTitle('出借人').withOption('sWidth','80px'),
        DTColumnBuilder.newColumn('lenderId').withTitle('出借人ID').withOption('sWidth','100px').renderWith(function(data, type, full) {
            if(!data) return "";
            return '<a href="javascript:void(0);" class="infoDetail" data-href="/xinghuouser/userinfo.shtml?userType=consumer&id=' + data + '&bizSysRoute=' + (full.bizSysRoute || 0) + '">' + data + '</a>';
        }),
        DTColumnBuilder.newColumn('productName').withTitle('产品名称').withOption('sWidth','140px').renderWith(function(data, type, full) {
            if(!data) return "";
            return '<a href="javascript:void(0);" class="infoDetail ui_ellipsis" data-href="/xinghuoproduct/productinfo.shtml?productid=' + full.productId + '">' + data + '</a>';
        }),
        DTColumnBuilder.newColumn('caculateType').withTitle('结算方式').withOption('sWidth', '190px').renderWith(function(data,type,full){
            var str = '';
            switch ( data ){
                case 0:
                    str="单笔-封闭期一次结&期外不结";
                    break;
                case 1:
                    str="按用户资产-按日计算/月结";
                    break;
                case 2:
                    str="单笔-封闭期月结&期外月结";
                    break
                case 3:
                    str="总额-封闭期一次结&期外不结";
                    break;
                case 4:
                    str="单笔-封闭期月结&期外不结算";
                    break;
                case 5:
                    str="单笔-按期计算/月结";
                    break;
                case 6:
                    str="单笔-一次性结算";
                    break;
                case 7:
                    str="单笔-按日计算/月结";
                    break;
                default :
                    str="";
                    break;
            }
            return str;
        }),
        DTColumnBuilder.newColumn('mcommAmount').withTitle('本次佣金（税前）').withOption('sWidth', '160px').renderWith(function(data, type, full) {
            var result = '', index = full.caculateType, param;
            param = 'userId=' + (full.userId||'') + '&lenderId=' + (full.lenderId||'') + ('&commMonth=' + full.commMonth||'') + ('&settleStatus=' + full.settleStatus ||'') + '&dealNo=' + (full.dealNo||'') + '&caculateType=' + (full.caculateType||'') + '&productId=' + (full.productId||'') + '&storeId=' + (full.storeId||'');
            if(index == 1 || index == 2 || index == 4 || index == 5 || index == 7){
                result = '<a data-href="?' + param + '" class="settledInfoCommission" style="cursor: pointer;">' + data.toFixed(2) + '</a>';
            }else{
                result = data.toFixed(2);
            };
            return result;
        }),
        DTColumnBuilder.newColumn('dealAmount').withTitle('交易金额(元)').withOption('sWidth','90px'),
        //DTColumnBuilder.newColumn('fmrevenue').withTitle('收益金额(元)').withOption('sWidth','90px'),
        //DTColumnBuilder.newColumn('annuarate').withTitle('预期年化收益率').withOption('sWidth','100px').renderWith(function(data, type, full) {
        //    return !data ? '-' : (data.toFixed(2) + "%");
        //}),
        //DTColumnBuilder.newColumn('days').withTitle('投资天数').withOption('sWidth','100px'),
        //DTColumnBuilder.newColumn('enddate').withTitle('产品到期日').withOption('sWidth','90px').renderWith(function(data, type, full) {
        //    return tools.toJSYMD(data);
        //}),
        DTColumnBuilder.newColumn('commAmount').withTitle('单笔佣金(元)').withOption('sWidth','130px'),
        //DTColumnBuilder.newColumn('fmreferralbase').withTitle('推荐费基数').withOption('sWidth','100px'),
        DTColumnBuilder.newColumn('commRate').withTitle('费率').withOption('sWidth','80px').renderWith(function(data, type, full) {
            return (!data) ?'-': (data.toFixed(2)+"%");
        }),
        //DTColumnBuilder.newColumn('ratio').withTitle('费率系数').withOption('sWidth','80px'),
        //DTColumnBuilder.newColumn('rateid').withTitle('费率ID').withOption('sWidth','80px'),
        DTColumnBuilder.newColumn('dealPaytime').withTitle('付款时间').withOption('sWidth','140px').renderWith(function(data, type, full) {
            return tools.toJSDate(data);
        }),
        //DTColumnBuilder.newColumn('storecode').withTitle('店铺ID').withOption('sWidth','100px'),
        DTColumnBuilder.newColumn('lenderId').withTitle('理财经理ID').withOption('sWidth','100px'),
        //DTColumnBuilder.newColumn('statusstr').withTitle('交易状态').withOption('sWidth','80px'),
        //DTColumnBuilder.newColumn('endstatusstr').withTitle('退出状态').withOption('sWidth','80px'),
        DTColumnBuilder.newColumn('dealPaytype').withTitle('付款方式').withOption('sWidth','80px').renderWith(function(data,type,full){
            var str = '';
            switch ( data ){
                case 0:
                    str="在线支付";
                    break;
                case 1:
                    str="划扣";
                    break;
                case 3:
                    str="线下大额入金";
                    break;
                default :
                    str="";
                    break;
            }
            return str;
        })
    ];

    var ModalCtrl = function($scope, $modalInstance, params, tools, DTOptionsBuilder, DTColumnBuilder) {
        $scope.action = {};
        $scope.cancel = function() {
            $modalInstance.close();
        };
        var vm = this;
        vm.dtInstance = {};
        vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax',{
                url: siteVar.serverUrl + '/xinghuosettle/tableDailyStat.shtml',
                type: 'POST',
                data: params
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
            .withPaginationType('simple_numbers');
        var date, commission, caculateType = params.caculateType;
        //if(caculateType == 1){
        //    date = 'date';
        //    commission = 'fee';
        //}else if(caculateType == 7){
        //    date = 'feeDate';
        //    commission = 'fee';
        //}else{
        //    date = 'balanceDate';
        //    commission = 'commAmount';
        //}
        vm.dtColumns = [
            DTColumnBuilder.newColumn('balanceDate').withTitle("佣金月份").withOption('sWidth', '100px').renderWith(function(data, type, full) {
                return tools.toJSYMD(data);
            }),
            DTColumnBuilder.newColumn('commAmount').withTitle('佣金金额（元）').withOption('sWidth', '100px').renderWith(function(data, type, full) {
                return !!data ? data.toFixed(2) : data;
            }),
            DTColumnBuilder.newColumn('referralBase').withTitle('佣金基数（元）').withOption('sWidth', '100px').renderWith(function(data, type, full) {
                return !!data ? data.toFixed(2) : data;
            }),
            DTColumnBuilder.newColumn('commRate').withTitle('佣金费率（%）').withOption('sWidth', '100px').renderWith(function(data, type, full) {
                return !!data ? data.toFixed(2) : data;
            })
        ];
    };

    function fnDrawCallback(data){
        $scope.$apply(function(){
            $scope.totalTradeAmount = data.json.info.totalTradeAmount;
            $scope.totalFeeAmount = data.json.info.totalFeeAmount;
        });
        tools.createModal();
        tools.createModalProgress();
        var popUpLayer = $("#js_dialog"), popUpLayerContent = popUpLayer.find(".js_content");

        $("#js_settled_export").on("click", function(){
            if(data._iRecordsTotal > 0){
                tools.export(this);
            }else{
                alert("没有数据");
            };
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
        $(".settledInfoCommission").on("click", function(){
            var self = $(this), href = self.attr("data-href"), data;
            data = tools.queryUrl(href);
            $modal.open({
                backdrop: true,
                backdropClick: true,
                dialogFade: false,
                keyboard: true,
                templateUrl : 'myModalContent.html',
                controller : ModalCtrl,
                controllerAs : 'ModalCtrl',
                resolve:{
                    "params" : function(){
                        return data;
                    }
                }
            });
        });

    }
}
