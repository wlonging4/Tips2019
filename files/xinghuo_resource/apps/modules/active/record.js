'use strict';
function record($scope, $location, getSelectListFactory, tools, DTOptionsBuilder, DTColumnBuilder) {
    var domForm = $("#js_form"), conditionItem = domForm.find(".form-group");
    $scope.form = {
        isShow: (conditionItem.length > 6) ? true : false
    };
    $scope.select = {};
    $scope.action = {};
    var params = $location.$$search;
    if(params.userId){
        $scope.form.userId = params.userId;
    };
    /*
     获取枚举类型
     */
    var selectList = getSelectListFactory.getSelectList(['issoldout']);
    selectList.then(function(data){
        $scope.select.issoldout = data.appResData.retList[0].issoldout;
    });

    /*
     创建表格选项
     */
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/xinghuoinviteuser/recordtable.shtml',
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
        DTColumnBuilder.newColumn('invitedUserId').withTitle('用户ID').withOption('sWidth', '100px'),
        DTColumnBuilder.newColumn('statusstr').withTitle('状态').withOption('sWidth','70px'),
        DTColumnBuilder.newColumn('openStoreTime').withTitle('店铺审核通过').withOption('sWidth','140px').renderWith(function(data, type, full) {
            if(!data) return "";
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('authTime').withTitle('资质认证通过').withOption('sWidth','140px').renderWith(function(data, type, full) {
            if(!data) return "";
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('effectiveStatus').withTitle('是否占用名额').withOption('sWidth', '90px').renderWith(function(data, type, full) {
            return data == 1 ? '是' : '否';
        }),
        DTColumnBuilder.newColumn('rewardAmount').withTitle('奖励（元）').withOption('sWidth', '80px').renderWith(function(data, type, full) {
            return '<a href="#/xinghuoinviteuser-reward.html?userId=' + full.userId + '&invitedUserId=' + full.invitedUserId + '" target="_blank">' + data + '</a>';
        }),
        DTColumnBuilder.newColumn('registTime').withTitle('注册时间').withOption('sWidth','140px').renderWith(function(data, type, full) {
            if(!data) return "";
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('userId').withTitle('理财师').withOption('sWidth','100px'),
        DTColumnBuilder.newColumn('source').withTitle('来源').withOption('sWidth','80px')
    ];
    $scope.action.reset = function(){
        for(var prop in $scope.form){
            if(prop !== 'isShow') delete $scope.form[prop];
        }
        vm.dtInstance.rerender();
    };
    $scope.action.search = function(){
        vm.dtInstance.rerender();
    };

    function fnDrawCallback(){
        if(!tools.interceptor(window.ajaxDataInfo)) return;
        $(".js_export").on("click", function(){
            tools.export(this);
        });

    }
}
