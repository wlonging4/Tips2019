'use strict';
function statistics($scope, tools, DTOptionsBuilder, DTColumnBuilder) {
    var domForm = $("#js_form"), conditionItem = domForm.find(".form-group");
    $scope.form = {
        isShow: (conditionItem.length > 6) ? true : false,
        startYearMonth:"",
        endYearMonth:""

    };
    $scope.select = {};
    $scope.action = {};
    $scope.select.years = [2016, 2017, 2018, 2019, 2020];
    $scope.select.months = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
    $scope.date = {
        startYear:"",
        startMonth:"",
        endYear:"",
        endMonth:""
    };

    $scope.$watch('date',function(newValue,oldValue){
        $scope.form.startYearMonth = $scope.date.startYear + $scope.date.startMonth;
        $scope.form.endYearMonth = $scope.date.endYear + $scope.date.endMonth;
    }, true);

    /*
     创建表格选项
     */
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/xinghuoinviteuser/statisticstable.shtml',
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
        .withOption('scrollX',false)
        .withLanguage(tools.dataTablesLanguage)
        .withOption('fnDrawCallback', fnDrawCallback)
        .withPaginationType('simple_numbers');
    vm.dtColumns = [
        DTColumnBuilder.newColumn('month').withTitle('月份').withOption('sWidth', '60px'),
        DTColumnBuilder.newColumn('userId').withTitle('邀请人').withOption('sWidth','100px'),
        DTColumnBuilder.newColumn('userMobile').withTitle('理财师手机号').withOption('sWidth','110px'),
        DTColumnBuilder.newColumn('invitedNumber').withTitle('本月邀请额').withOption('sWidth','80px'),
        DTColumnBuilder.newColumn('haveInvitedNumber').withTitle('邀请人数').withOption('sWidth', '80px'),
        DTColumnBuilder.newColumn('sumDealAmount').withTitle('本月店铺销售额').withOption('sWidth', '100px'),
        DTColumnBuilder.newColumn('invitedNumberNext').withTitle('下月邀请名额').withOption('sWidth','100px'),
        DTColumnBuilder.newColumn('sumRewardAmount').withTitle('本月奖励').withOption('sWidth','100px').renderWith(function(data, type, full) {
            return '<a href="#/xinghuoinviteuser-reward.html?userId=' + full.userId + '" target="_blank">' + data + '</a>';
        })
    ];
    $scope.action.reset = function(){
        for(var prop in $scope.form){
            if(prop !== 'isShow' && prop !== 'startYearMonth' && prop !== 'endYearMonth') delete $scope.form[prop];
        };
        $scope.date.startYear = "";
        $scope.date.startMonth = "";
        $scope.date.endYear = "";
        $scope.date.endMonth = "";
        $scope.form.startYearMonth = "";
        $scope.form.endYearMonth = "";
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
