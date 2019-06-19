'use strict';
function userinfo($scope, tools, DTOptionsBuilder, DTColumnBuilder) {
    var domForm = $("#js_form");
    $scope.form = {};
    $scope.select = {};
    $scope.action = {};

    /*
     创建表格选项
     */
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/xinghuoother/queryUserinfo.shtml',
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
        DTColumnBuilder.newColumn('id').withTitle('用户ID').withOption('sWidth', '25%'),
        DTColumnBuilder.newColumn('realname').withTitle('用户姓名').withOption('sWidth','25%').renderWith(function(data, type, full) {
            if(!data) return "";
            return data;
        }),
        DTColumnBuilder.newColumn('documentno').withTitle('身份证号码').withOption('sWidth','25%').renderWith(function(data, type, full) {
            if(!data) return "";
            return data;
        }),
        DTColumnBuilder.newColumn('mobile').withTitle('用户手机号').withOption('sWidth','25%')
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
