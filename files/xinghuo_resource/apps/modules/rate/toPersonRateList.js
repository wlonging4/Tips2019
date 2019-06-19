'use strict';
function toPersonRateList($scope, $location, $timeout, tools, DTOptionsBuilder, DTColumnBuilder) {
    var domForm = $("#js_form"), conditionItem = domForm.find(".form-group");
    $scope.form = {
        isShow: (conditionItem.length > 6) ? true : false
    };
    $scope.select = {};
    $scope.action = {};
    $scope.form = $.extend({},$scope.form, $location.$$search);

    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/xinghuoproductrate/personRateProductRateList.shtml',
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
        DTColumnBuilder.newColumn('managerId').withTitle('理财经理ID').withOption('sWidth', '260px'),
        DTColumnBuilder.newColumn('managerName').withTitle('理财经理姓名').withOption('sWidth','120px'),
        DTColumnBuilder.newColumn('managerMobile').withTitle('理财经理手机号').withOption('sWidth','120px'),
        DTColumnBuilder.newColumn('managerDocumentNo').withTitle('身份证号').withOption('sWidth','200px'),
        DTColumnBuilder.newColumn('subproductName').withTitle('产品名称').withOption('sWidth', '150px'),
        DTColumnBuilder.newColumn('rateTmpName').withTitle('佣金费率').withOption('sWidth', '130px').renderWith(function(data, type, full) {
            if(!data){ return "" };
            return '<a href="javascript:;" class="js_hover_info" data-content="' + full.rateRange + '" data-original-title="' + full.rateTmpName + '">' + full.rateTmpName + '</a>';
        })
    ];
    $scope.action.reset = function(){
        for(var prop in $scope.form){
            if(prop !== 'isShow' && prop !== 'id' && prop !== 'productid') delete $scope.form[prop];
        };
        $timeout(function(){
            vm.dtInstance.rerender();

        });
    };
    $scope.action.search = function(){
        vm.dtInstance.rerender();
    };
    function fnDrawCallback(){
        var table = $("#dataTables"), tbody = table.find("tbody"),hoverInfo = tbody.find(".js_hover_info");
        hoverInfo.popover("destroy");
        hoverInfo.popover({"trigger": "hover", "container": "body", "placement": "left", "html": true});
    }

}
