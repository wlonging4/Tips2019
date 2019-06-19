'use strict';
function xinghuodataStoreredController($scope, tools, DTOptionsBuilder, DTColumnBuilder) {
    var domForm = $("#js_form"), conditionItem = domForm.find(".form-group");
    $scope.form = {
        isShow: (conditionItem.length > 6) ? true : false,
    };
    $scope.select = {};
    /*
     创建表格选项
     */
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/xinghuodata/queryStoreRed.shtml',
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
        DTColumnBuilder.newColumn('storeuserid').withTitle('理财经理ID').withOption('sWidth', '100px').notSortable(),
        DTColumnBuilder.newColumn('realname').withTitle('理财经理姓名').withOption('sWidth','90px').notSortable(),
        DTColumnBuilder.newColumn('mobile').withTitle('理财经理手机号').withOption('sWidth','100px').notSortable(),
        DTColumnBuilder.newColumn('district').withTitle('城市').withOption('sWidth','70px').notSortable(),
        DTColumnBuilder.newColumn('documentNo').withTitle('身份证号码').withOption('sWidth', '130px').notSortable(),
        DTColumnBuilder.newColumn('bankname').withTitle('银行卡名称').withOption('sWidth', '100px'),
        DTColumnBuilder.newColumn('cardno').withTitle('银行卡号码').withOption('sWidth','160px'),
        DTColumnBuilder.newColumn('branchbankname').withTitle('支行名称').withOption('sWidth','130px').renderWith(function(data, type, full) {
            if(!data) return "";
            return '<span class="ui_ellipsis" style="width: 130px;" title="'+data+'">'+data+'</span>';
        }),
        DTColumnBuilder.newColumn('department').withTitle('部门').withOption('sWidth','130px').renderWith(function(data, type, full) {
            if(!data) return "";
            return '<span class="ui_ellipsis" style="width: 130px;" title="'+data+'">'+data+'</span>';
        }),
        DTColumnBuilder.newColumn('dealrenumber').withTitle('红包数').withOption('sWidth','70px').renderWith(function(data, type, full) {
            return '<a href="#/xinghuodata-storeregisterdetail.html?p_storeuserid='+full.storeuserid+'" target="_blank">'+data+'</a>'
        }),
        DTColumnBuilder.newColumn('registerre').withTitle('红包金额(元)').withOption('sWidth','90px').notSortable(),
        DTColumnBuilder.newColumn('msstatus').withTitle('结算状态').withOption('sWidth','80px').renderWith(function(data, type, full) {
            var showArr = ["未结算", "结算中", "已结算"];
            if(!showArr[data]) return "";
            return showArr[data];
        })
    ];
    $scope.action = {
        reset: function(){
            for(var prop in $scope.form){
                if(prop !== 'isShow') delete $scope.form[prop];
            }
            vm.dtInstance.rerender();
        },
        search: function(){
            vm.dtInstance.rerender();
        },
        load: function(){
            ComponentsPickers.init();
        }
    };
    function fnDrawCallback() {
        if (!tools.interceptor(window.ajaxDataInfo)) return;
    }
    (function(){
        /**
         * [导出店铺红包明细]
         * @param  {[type]}   [description]
         * @param  {[type]}   [description]
         * @return {[type]}   [description]
         */
        $("#js_data_storered_export_btn").on("click", function(){
            tools.export(this);
        });
    })();
}
