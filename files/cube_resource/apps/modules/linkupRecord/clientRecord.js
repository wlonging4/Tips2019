/**
 * Created by yanzhong1 on 2017/4/18.
 */
'use strict';
function linkUpController($scope,tools,$modal,DTOptionsBuilder, DTColumnBuilder) {
    var form = $("#js_form"), conditionItem = form.find(".form-group");
    $scope.form = {
        isShow: (conditionItem.length>6) ? true : false
    };

    /*
     * 客户线索池 --创建表格
     * 2017-04-25
     * */
    var vm = this;
    vm.dtInstance={};
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax',{
        url:siteVar.serverUrl +'clientsClue/getClientsClue.json',
        type:'POST',
        data: function(d){
            jQuery.extend(d,tools.getFormele({},form))
        }
    })
        .withDataProp('data')
        .withOption('createdRow',function(row,data,dataIndex){
            angular.element(row).addClass("rows"+data.id);
        })
        .withOption('searching',false)
        .withOption('ordering',false)
        .withOption('serverSide',true)
        .withOption('processing',false)
        .withOption('scrollX',true)
        .withLanguage(tools.dataTablesLanguage)
        .withOption('fnDrawCallback',fnDrawCallback)
        .withPaginationType('simple_numbers');
    var dtColumns = [
        DTColumnBuilder.newColumn('clueId').withTitle('线索ID').withOption('sWidth','150px'),
        DTColumnBuilder.newColumn('type').withTitle('线索类型').withOption('sWidth','100px'),
        DTColumnBuilder.newColumn('userName').withTitle('客户姓名').withOption('sWidth','80px'),
        DTColumnBuilder.newColumn('userMobile').withTitle('手机号').withOption('sWidth','100px'),
        DTColumnBuilder.newColumn('appointProd').withTitle('预约产品').withOption('sWidth','200px'),
        DTColumnBuilder.newColumn('appointTime').withTitle('预约时间').withOption('sWidth','100px'),
        DTColumnBuilder.newColumn('orderStatus').withTitle('订单状态').withOption('sWidth','120px'),
        DTColumnBuilder.newColumn('loginStatus').withTitle('登录状态').withOption('sWidth','120px'),
        DTColumnBuilder.newColumn('starttime').withTitle('导入时间').withOption('sWidth','100px'),
        DTColumnBuilder.newColumn('startFilter').withTitle('初筛分配时间').withOption('sWidth','100px'),
        DTColumnBuilder.newColumn('firstScreenUser').withTitle('初筛人').withOption('sWidth','80px'),
        DTColumnBuilder.newColumn('filter1Lab').withTitle('初筛第一次沟通标签').withOption('sWidth','200px'),
        DTColumnBuilder.newColumn('filter2Lab').withTitle('初筛第二次沟通标签').withOption('sWidth','200px'),
        DTColumnBuilder.newColumn('filter3Lab').withTitle('初筛第三次沟通标签').withOption('sWidth','200px'),
        DTColumnBuilder.newColumn('filterResLab').withTitle('初筛结果标签').withOption('sWidth','200px'),
        DTColumnBuilder.newColumn('').withTitle('初筛人操作').withOption('sWidth','100px'),
        DTColumnBuilder.newColumn('financial').withTitle('理财师沟通人').withOption('sWidth','100px'),
        DTColumnBuilder.newColumn('endResult').withTitle('最终确认').withOption('sWidth','200px'),
        DTColumnBuilder.newColumn('').withTitle('理财师操作').withOption('sWidth','100px'),
    ];
    vm.dtColumns = dtColumns;
    function fnDrawCallback(data){
        if(!tools.interceptor(window.ajaxDataInfo)) return;
        /*
         刷新统计数据
         */
        $scope.$apply(function(){
            $scope.tableinfo = window.ajaxDataInfo || {recordsFiltered:0, recordsTotal:0};
        });

    }
    /*
     * 查询
     * */
    $scope.action.search = function(){
        vm.dtInstance.rerender();
    };
    /*
     * 重置
     * */
    $scope.action.reset = function(){
        $('input[name="p_status"]').val("");
        /*标签*/
        $(".linkupTag_first").find("[readonly]").val("");
        $(".linkupTag_first").find(".multiSel_unit").prop("checked",false);
        $.uniform.update($(".linkupTag_first").find(".multiSel_unit"));
        $(".linkupTag_financial").find("[readonly]").val("");
        $(".linkupTag_financial").find(".multiSel_unit").prop("checked",false);
        $.uniform.update($(".linkupTag_financial").find(".multiSel_unit"));
        $(".linkupTag_financialLast").find("[readonly]").val("");
        $(".linkupTag_financialLast").find(".multiSel_unit").prop("checked",false);
        $.uniform.update($(".linkupTag_financialLast").find(".multiSel_unit"));
        for(var prop in $scope.form){
            if(prop !== 'isShow') delete $scope.form[prop];
        }
        vm.dtColumns = $.extend([],dtColumns);
        var len = 0, p_status = $("#js_form").find("input[name='p_status']");
        for(var item in $scope.form){
            var key = $scope.form[item];
            if(item != 'isShow' && key){
                len++;
            };
        };
        if(len > 0 || (p_status.val() && p_status.val().length > 0)){
            vm.dtInstance.rerender();
        }else{
            alert("请选择查询条件！");
        };
    };

    $scope.$watch("form.source", function(newValue, oldValue){
        var sourceInput = $("#js_form").find('input[name="source"]');
        sourceInput.val(newValue);
    });

}
