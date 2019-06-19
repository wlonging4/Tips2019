'use strict';
function cooperateOrgan($scope, $http, getSelectListFactory, getProListFactory, tools, DTOptionsBuilder, DTColumnBuilder) {
    var domForm = $("#js_form"), conditionItem = domForm.find(".form-group");
    $scope.form = {
        isShow: (conditionItem.length > 6) ? true : false,
        bizSysRoute:1

    };
    $scope.select = {};
    $scope.action = {};

    /*
     创建表格选项
     */
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/caiyiuser/cooperateOrganDataTable.shtml',
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
        DTColumnBuilder.newColumn('orgName').withTitle('机构名称').withOption('sWidth', '160px'),
        DTColumnBuilder.newColumn('orgBus').withTitle('主营业务').withOption('sWidth','150px'),
        DTColumnBuilder.newColumn('orgAddress').withTitle('机构地址').withOption('sWidth','110px').renderWith(function(data,type,full){
            if(!data) return "";
            return '<span class="ui_ellipsis" title="' + data + '">' + data + '</span>';
        }),
        DTColumnBuilder.newColumn('orgLinkman').withTitle('联系人').withOption('sWidth','100px').renderWith(function(data,type,full){
            if(!data) return "";
            return '<span class="ui_ellipsis" title="' + data + '">' + data + '</span>';
        }),
        DTColumnBuilder.newColumn('orgPhone').withTitle('联系电话').withOption('sWidth', '100px'),
        DTColumnBuilder.newColumn('orgIDcard').withTitle('身份证号').withOption('sWidth', '140px'),
        DTColumnBuilder.newColumn('orgMail').withTitle('联系邮箱').withOption('sWidth','140px'),
        DTColumnBuilder.newColumn('orgSuffer').withTitle('销售经验').withOption('sWidth','90px'),
        DTColumnBuilder.newColumn('orgCooper').withTitle('合作产品').withOption('sWidth','120px'),
        DTColumnBuilder.newColumn('orgRemark').withTitle('备注').withOption('sWidth','150px')
    ];
    $scope.action.reset = function(){
        for(var prop in $scope.form){
            if(prop !== 'isShow' &&  prop !== 'bizSysRoute') delete $scope.form[prop];
        }
        vm.dtColumns = $.extend([],default_dtColumns);
        vm.dtInstance.rerender();
    };
    $scope.action.search = function(){
        vm.dtInstance.rerender();
    };
}
