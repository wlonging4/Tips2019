'use strict';
function incomeDistribution($scope, $location, tools, DTOptionsBuilder, DTColumnBuilder) {
    if($location.$$search.info){
        $scope.info = JSON.parse($location.$$search.info);
    }else{
        return alert("参数不对")
    }

    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax', {
            url: siteVar.serverUrl + '/sesametrade/viewProfit.json',
            type: 'POST',
            data: {
                "investApplyno":$scope.info.investApplyno
            }
        })
        .withDataProp('data')
        .withOption('createdRow', function(row, data, dataIndex) {
            angular.element(row).addClass("rows" + data.id)
        })
        .withOption('searching', false)
        .withOption('ordering', false)
        .withOption('serverSide', true)
        .withOption('processing', false)
        .withOption('scrollX', true)
        .withLanguage(tools.dataTablesLanguage)
        .withPaginationType('simple_numbers');
    vm.dtColumns = [
        DTColumnBuilder.newColumn('allotNum').withTitle('分配次数').withOption('sWidth', '60px'),
        DTColumnBuilder.newColumn('allotDate').withTitle('分配日期').withOption('sWidth', '140px'),
        DTColumnBuilder.newColumn('payTime').withTitle('支付日期 <i class="fa fa-question-circle" title="结算从募集户出款到用户银行卡或安享基金户的支付时间"></i>').withOption('sWidth', '140px').renderWith(function(data, type, full) {
            if (!data) return "";
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('allotType').withTitle('分配类型').withOption('sWidth', '80px'),
        DTColumnBuilder.newColumn('startDate').withTitle('起算日期').withOption('sWidth', '140px'),
        DTColumnBuilder.newColumn('endDate').withTitle('结算日期').withOption('sWidth', '140px'),
        DTColumnBuilder.newColumn('allotPriorPrincipal').withTitle('分配本金').withOption('sWidth', '80px'),
        DTColumnBuilder.newColumn('allotPriorProfit').withTitle('分配收益<i class="fa fa-question-circle" title="本次返还客户的阶段性收益((起算日期至结算日期之间的收益）"></i>').withOption('sWidth', '80px'),

        DTColumnBuilder.newColumn('wpProfit').withTitle('等待期收益 <i class="fa fa-question-circle" title="客户款项到账到产品开始记息期间的收益"></i>').withOption('sWidth', '80px'),
        DTColumnBuilder.newColumn('balance').withTitle('现金结余 <i class="fa fa-question-circle" title="客户实际打款和应打款的差额部分"></i>').withOption('sWidth', '80px'),
        DTColumnBuilder.newColumn('allotTotalAmt').withTitle('分配总额 <i class="fa fa-question-circle" title="分配总额=分配本金+分配收益+等待期收益+现金结余"></i>').withOption('sWidth', '80px'),
        DTColumnBuilder.newColumn('payStatus').withTitle('状态').withOption('sWidth', '100px'),
        DTColumnBuilder.newColumn('paybackType').withTitle('回款方式').withOption('sWidth', '80px').renderWith(function(data, type, full) {
            if (!data) return "";
            return data;
        })

    ];





}