'use strict';
function xinhuodealPaymentController($scope, getSelectListFactory, tools, DTOptionsBuilder, DTColumnBuilder) {
    var domForm = $("#js_form"), conditionItem = domForm.find(".form-group");
    $scope.form = {
        isShow: (conditionItem.length > 6) ? true : false
    };
    $scope.select = {};
    $scope.action = {};

    /*
     获取枚举类型
     */
    var selectList = getSelectListFactory.getSelectList(['paystatus','terminalrom','payagentenum','biz_sys_route']);
    selectList.then(function(data){
        $scope.select.paystatus = data.appResData.retList[0].paystatus;
        $scope.select.terminalrom = data.appResData.retList[1].terminalrom;
        $scope.select.payagentenum = data.appResData.retList[2].payagentenum;
        $scope.select.biz_sys_route = data.appResData.retList[3].biz_sys_route;
    });
    $scope.filerSource = function(e){
        return e.key != 2 && e.key != 4;
    };
    /*
     创建表格选项
     */
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/xinghuodeal/tablePayment.shtml',
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
        DTColumnBuilder.newColumn('taskbizno').withTitle('支付任务号').withOption('sWidth','250px'),
        DTColumnBuilder.newColumn('taskcode').withTitle('支付流水号').withOption('sWidth','220px'),
        DTColumnBuilder.newColumn('no').withTitle('交易单号').withOption('sWidth','210px'),
        DTColumnBuilder.newColumn('taskamount').withTitle('支付金额(元)').withOption('sWidth','90px'),
        DTColumnBuilder.newColumn('productname').withTitle('商品名称').withOption('sWidth', '140px').renderWith(function(data, type, full) {
            if(!data) return "";
            return '<span class="ui_ellipsis" style="width: 140px;" title="' + data + '">' + data + '</span>';
        }),
        DTColumnBuilder.newColumn('userid').withTitle('出借人ID').withOption('sWidth', '100px'),
        DTColumnBuilder.newColumn('mobile').withTitle('出借人手机号').withOption('sWidth','100px'),
        DTColumnBuilder.newColumn('realname').withTitle('出借人姓名').withOption('sWidth','80px'),
        DTColumnBuilder.newColumn('tasktime').withTitle('创建时间').withOption('sWidth','140px').renderWith(function(data, type, full) {
            return tools.toJSDate(data);;
        }),
        DTColumnBuilder.newColumn('payresultstr').withTitle('支付状态').withOption('sWidth','60px').renderWith(function(data, type, full) {
            if(!data){
                return "";
            }
            return "支付" + data;
        }),
        DTColumnBuilder.newColumn('payresult').withTitle('备注').withOption('sWidth','80px').renderWith(function(data, type, full) {
            return data == "01" ? full.resinfo : "";
        }),
        DTColumnBuilder.newColumn('paytime').withTitle('完成时间').withOption('sWidth','140px').renderWith(function(data, type, full) {
            if(full.payresult && full.payresult == "00"){
                return tools.toJSDate(data);
            }else{
                return "";
            }
        }),
        DTColumnBuilder.newColumn('paymentorgname').withTitle('支付机构').withOption('sWidth','120px').renderWith(function(data, type, full) {
            if(!data) return "";
            return '<span class="ui_ellipsis" style="width: 120px;" title="' + data + '">' + data + '</span>';
        }),
        DTColumnBuilder.newColumn('terminalstr').withTitle('支付单来源').withOption('sWidth','80px')
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
        $scope.$apply(function(){
            $scope.tableinfo = window.ajaxDataInfo.info;
        });

        $("#js_payment_export").on("click", function(){
            tools.export(this);
        });
    }

}
