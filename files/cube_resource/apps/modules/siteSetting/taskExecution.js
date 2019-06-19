'use strict';
function taskExecutionController($scope, tools, DTOptionsBuilder, DTColumnBuilder) {
    $scope.form = {};
    $scope.select = {};
    $scope.action = {
        load: function(){
            ComponentsPickers.init();
            setTimeout(function(){
                Metronic.initComponents();

            },100)
        },
        search: function(){
            vm.dtInstance.rerender();
        },
        reset:  function(){
            for(var prop in $scope.form){
                delete $scope.form[prop];
            }
            vm.dtInstance.rerender();
        }
    };
    /*
     创建表格选项
     */
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax',{
            url: siteVar.serverUrl+'taskExecution/queryForPage.json',
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
        .withOption('processing',true)
        .withOption('scrollX',true)
        .withLanguage(tools.dataTablesLanguage)
        .withOption('fnDrawCallback', fnDrawCallback)
        .withPaginationType('simple_numbers');
    vm.dtColumns = [
        DTColumnBuilder.newColumn('id').withTitle('ID').withOption('sWidth','80px'),
        DTColumnBuilder.newColumn('code').withTitle('CODE').withOption('sWidth','80px'),
        DTColumnBuilder.newColumn('startTime').withTitle('startTime').withOption('sWidth','120px').renderWith(function(data,type,full){
            if(!data) return "";
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('endTime').withTitle('endTime').withOption('sWidth','120px').renderWith(function(data,type,full){
            if(!data) return "";
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('memo').withTitle('memo').withOption('sWidth','80px'),
        DTColumnBuilder.newColumn('paramTime').withTitle('执行时间参数').withOption('sWidth','100px').renderWith(function(data,type,full){
            return tools.toJSYMD(data);
        }),
        DTColumnBuilder.newColumn('adminUserName').withTitle('管理员名称').withOption('sWidth','80px'),
        DTColumnBuilder.newColumn('manual').withTitle('是否手动').withOption('sWidth','80px').renderWith(function(data,type,full){
            switch (data){
                case 0:
                    return "否";
                break;
                case 1:
                    return "是";
                break;
                default:
                    return "";
                break;
            }
        }),
        DTColumnBuilder.newColumn('status').withTitle('状态').withOption('sWidth','80px').renderWith(function(data,type,full){
            var result = data;
            switch(data){
                case "success":
                    result = "成功";
                    break;
                case "error":
                    result = "失败";
                    break;
                default :
                    result = "执行中";
                    break;
            }
            return result;
        }),
    ];
    function fnDrawCallback(){
        if(!tools.interceptor(window.ajaxDataInfo)) return;
        tools.resetWidth();
    }
}
