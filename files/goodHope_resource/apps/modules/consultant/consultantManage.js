'use strict';
function consultantManageController($scope,tools,DTOptionsBuilder, DTColumnBuilder,$location) {
    $scope.G=G;
    $scope.form = {
        isShow: ($("#js_form").find(".form-group").length>6) ? true : false
    };
    $scope.form.createTimeEnd=tools.toJSDate(Date.parse(new Date())).slice(0,10);
    $scope.form.createTimeBeg=tools.toJSDate(Date.parse(new Date())-30*3600*24*1000).slice(0,10);

    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder
        .newOptions().withOption('ajax',{
            url: G.server + '/advisor/getAdvisorPageList.json',
            type: 'POST',
            data: $scope.form
        })
        .withDataProp('data')
        .withOption('createdRow', function(row, data, dataIndex) {
            angular.element(row).addClass("rows"+data.id)
        })
        .withOption('searching',false)
        .withOption('ordering',false)
        .withOption('serverSide',true)
        .withOption('processing',false)
        .withOption('scrollX',true)
        .withLanguage(tools.dataTablesLanguage)
        .withOption('fnDrawCallback',fnDrawCallback)
        .withPaginationType('simple_numbers');
    vm.dtColumns = [
        DTColumnBuilder.newColumn('advisorName').withTitle('顾问姓名').withOption('sWidth','60px'),
        DTColumnBuilder.newColumn('mobile').withTitle('手机号').withOption('sWidth','100px'),
        DTColumnBuilder.newColumn('address').withTitle('地区').withOption('sWidth','90px'),
        DTColumnBuilder.newColumn('createTime').withTitle('创建时间').withOption('sWidth','140px').renderWith(function(data, type, full) {
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('workYears').withTitle('从业年限').withOption('sWidth','80px'),
        DTColumnBuilder.newColumn('tag').withTitle('标签').withOption('sWidth','120px'),
        DTColumnBuilder.newColumn('status').withTitle('状态').withOption('sWidth','60px').renderWith(function (data,type,full) {
            return data?'有效':'无效';
        }),
        DTColumnBuilder.newColumn('advisorId').withTitle('操作').withOption('sWidth','100px').renderWith(function(data,type,full){
            return '<a style="line-height: 1" href="#/consultantEdit?advisorId=' + data + '"  class="btn btn-sm btn-primary" >修改</a>';
        })
    ];
    $scope.reset = function(){
        for(var prop in $scope.form){
            delete $scope.form[prop];
        }
        vm.dtInstance.rerender();
    };
    $scope.search = function(){
        if(!$scope.form.advisorName&&!$scope.form.mobile&&!$scope.form.createTimeBeg&&!$scope.form.createTimeEnd&&!$scope.form.status){return tools.interalert('查询条件不能为空!')}
        vm.dtInstance.rerender();
    };
    function fnDrawCallback(data){
        if(!tools.interceptor(window.ajaxDataInfo)) return;
        tools.resetWidth();

    }
}
