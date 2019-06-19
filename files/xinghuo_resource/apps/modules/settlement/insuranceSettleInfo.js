'use strict';
function insuranceSettleInfo($scope, $location, $modal, tools, DTOptionsBuilder, DTColumnBuilder) {
    var form = $("#js_form"), conditionItem = form.find(".form-group");

    $scope.form = {
        isShow: (conditionItem.length > 6) ? true : false
    };
    $scope.select = {};
    $scope.action = {};
    var params = $location.$$search;
    $scope.managersName = params.name;
    $scope.managerId = params.userid;
    $scope.fmsuminsurance = params.fmsuminsurance;
    $scope.month = params.settlemonth;

    /*
     创建表格选项
     */
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/xinghuosettle/tableInsuranceSettleinfo.shtml',
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
        DTColumnBuilder.newColumn('dealNo').withTitle("保险单号").withOption('sWidth', '100px'),
        DTColumnBuilder.newColumn('lenderName').withTitle('出借人').withOption('sWidth','80px'),
        DTColumnBuilder.newColumn('lenderId').withTitle('出借人ID').withOption('sWidth','100px').renderWith(function(data, type, full) {
            if(!data) return "";
            return '<a href="javascript:void(0);" class="infoDetail" data-href="/xinghuouser/userinfo.shtml?userType=consumer&id=' + data + '&bizSysRoute=' + (full.bizSysRoute || 0) + '">' + data + '</a>';
        }),
        DTColumnBuilder.newColumn('companyName').withTitle('保险公司名称').withOption('sWidth','180px'),
        DTColumnBuilder.newColumn('productName').withTitle('主险名称').withOption('sWidth', '180px'),
        DTColumnBuilder.newColumn('insuranceStatus').withTitle('保单状态').withOption('sWidth', '80px'),
        DTColumnBuilder.newColumn('applyDate').withTitle('受理日期').withOption('sWidth','140px').renderWith(function(data, type, full) {
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('effectiveDate').withTitle('生效日期').withOption('sWidth','140px').renderWith(function(data, type, full) {
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('dealAmount').withTitle('保险金额').withOption('sWidth','80px').renderWith(function(data, type, full) {
            if(!data) return 0;
            return parseInt(data);
        }),
        DTColumnBuilder.newColumn('dcommAmount').withTitle('理财师佣金（税前）').withOption('sWidth','140px').renderWith(function(data, type, full) {
            if(!data) return 0;
            return data.toFixed(2);
        }),
        DTColumnBuilder.newColumn('xinghuoFee').withTitle('星火渠道佣金（元）').withOption('sWidth','140px').renderWith(function(data, type, full) {
            if(!data) return 0;
            return data.toFixed(2);
        }),
        //DTColumnBuilder.newColumn('effectivedate').withTitle('生效日期').withOption('sWidth','140px').renderWith(function(data, type, full) {
        //    return tools.toJSDate(data);
        //}),
        DTColumnBuilder.newColumn('userName').withTitle('理财师姓名').withOption('sWidth','80px'),
        DTColumnBuilder.newColumn('userId').withTitle('理财经理ID').withOption('sWidth','100px')
    ];



    function fnDrawCallback(data){
        $scope.$apply(function(){
            $scope.totalFeeAmount = data.json.info.totalFeeAmount || 0;
            $scope.totalTradeAmount = data.json.info.totalTradeAmount || 0;
        });
        tools.createModal();
        tools.createModalProgress();
        var popUpLayer = $("#js_dialog"), popUpLayerContent = popUpLayer.find(".js_content");

        $("#js_settled_export").on("click", function(){
            if(data._iRecordsTotal > 0){
                tools.export(this);
            }else{
                alert("没有数据！");
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




    }
}
