'use strict';
function commissionRecord($scope, $modal, $stateParams, getSelectListFactory, $q, tools, DTOptionsBuilder, DTColumnBuilder) {
    var form = $("#js_form"), conditionItem = form.find(".form-group");
    $scope.isYX = $stateParams.isYX;
    $scope.groupName = '非宜信员工';
    $scope.form = {
        isShow: (conditionItem.length > 6) ? true : false
    };
    $scope.action = {};
    var dateFlag, yearFlag, monthFlag;//默认date
    //$scope.isFlag = true;
    //$scope.select = {};
    //$scope.select.js_q_year = [2014, 2015, 2016, 2017, 2018];
    //$scope.select.js_q_month = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
    //$scope.date = {};
    //$scope.$watch('date',function(newValue,oldValue){
    //    $scope.form.month = '' + $scope.date.js_q_year + $scope.date.js_q_month;
    //    form.find("input[name='month']").val($scope.form.month)
    //}, true);
    //
    //var date = new Date();
    //if(date.getMonth() == 0){
    //    $scope.date.js_q_year = date.getFullYear() - 1;
    //    $scope.date.js_q_month = 12;
    //}else{
    //    $scope.date.js_q_year = date.getFullYear();
    //    $scope.date.js_q_month = date.getMonth() < 10 ? ("0" + date.getMonth()): date.getMonth();
    //};
    //$scope.form.month = '' + $scope.date.js_q_year + $scope.date.js_q_month;
    //dateFlag = $scope.form.month;
    //yearFlag = $scope.date.js_q_year;
    //monthFlag = $scope.date.js_q_month;
    //form.find("input[name='month']").val($scope.form.month);



    /*
     创建表格选项
     */
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax',{
            url:  siteVar.serverUrl + '/xinghuosettle/queryUserCommissionSettle.shtml',
            type: 'POST',
            data: function(d){
                jQuery.extend(d, tools.getFormele({}, form));
            }

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
        DTColumnBuilder.newColumn('userId').withTitle('理财师ID').withOption('sWidth','100px').renderWith(function(data, type, full) {
            if(!data) return "";
            return '<a href="javascript:void(0);" class="infoDetail" data-href="/xinghuouser/userinfo.shtml?userType=director&id=' + data + '">' + data + '</a>';
        }),
        DTColumnBuilder.newColumn('userame').withTitle('理财师姓名').withOption('sWidth','100px'),
        DTColumnBuilder.newColumn('mobile').withTitle('理财师手机号').withOption('sWidth','120px'),
        DTColumnBuilder.newColumn('amount').withTitle('修改金额（元）').withOption('sWidth', '120px'),
        DTColumnBuilder.newColumn('createTime').withTitle('修改时间').withOption('sWidth', '140px'),
        DTColumnBuilder.newColumn('modifyName').withTitle('修改人').withOption('sWidth','100px'),
        DTColumnBuilder.newColumn('yearAndMonth').withTitle('修改月份').withOption('sWidth', '140px'),
        DTColumnBuilder.newColumn('isYiXinStaff').withTitle('是否为宜信员工').withOption('sWidth','100px'),
        DTColumnBuilder.newColumn('remarks').withTitle('修改备注').withOption('sWidth','90px')
    ];
    $scope.action.reset = function(){
        for(var prop in $scope.form){
            if(prop !== 'isShow') delete $scope.form[prop];
        };
         //$scope.date.js_q_year = yearFlag;
         //$scope.date.js_q_month = monthFlag;
         //$scope.form.month = dateFlag;
        vm.dtInstance.rerender();
    };
    $scope.action.search = function(){
        //if(parseInt($scope.form.month) > parseInt(dateFlag)){
        //    return alert("选择的年月份，应当小于当前的日期！");
        //};
        vm.dtInstance.rerender();
    };


    function fnDrawCallback(data){
        tools.createModal();
        //tools.createModalProgress();
        var popUpLayer = $("#js_dialog"), popUpLayerContent = popUpLayer.find(".js_content");
        var table = $("#dataTables"), tbody = table.find("tbody");
        table.off("click").on("click", ".infoDetail", function(){
            var self = $(this), href = self.attr("data-href"), data, url;
            data = tools.queryUrl(href);
            url = href.split('?')[0];
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url:siteVar.serverUrl +  url,
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

        $("#js_record_export").on("click", function(){
            tools.export(this);
        });


    }
}
