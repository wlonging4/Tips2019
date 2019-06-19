'use strict';
function reservation($scope, $http, getSelectListFactory, getProListFactory, tools, DTOptionsBuilder, DTColumnBuilder) {
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
            url: siteVar.serverUrl + '/caiyiuser/reservationDataTable.shtml',
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
        //.withOption('fnDrawCallback', fnDrawCallback)
        .withPaginationType('simple_numbers');
    vm.dtColumns = [
        DTColumnBuilder.newColumn('username').withTitle('预约人姓名').withOption('sWidth', '20%'),
        DTColumnBuilder.newColumn('mobile').withTitle('手机号').withOption('sWidth', '20%'),
        DTColumnBuilder.newColumn('provincestr').withTitle('省份').withOption('sWidth', '20%'),
        DTColumnBuilder.newColumn('citystr').withTitle('城市').withOption('sWidth', '20%'),
        DTColumnBuilder.newColumn('reservationtime').withTitle('预约时间').withOption('sWidth', '20%').renderWith(function(data, type, full) {
            if(!data) return "";
            return tools.toJSDate(data);
        })
    ];
    $scope.action.reset = function(){
        for(var prop in $scope.form){
            delete $scope.form[prop];
        }
        vm.dtInstance.rerender();
    };
    $scope.action.search = function(){
        vm.dtInstance.rerender();
    };
}
