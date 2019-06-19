'use strict';
function xinghuodataStoreregController($scope, tools, DTOptionsBuilder, DTColumnBuilder) {
    var domForm = $("#js_form"), conditionItem = domForm.find(".form-group");
    $scope.form = {
        isShow: (conditionItem.length > 6) ? true : false
    };
    $scope.select = {};
    /*
     创建表格选项
     */
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/xinghuodata/queryStoreRegister.shtml',
            type: 'POST',
            data: function(d){
                jQuery.extend(d,{
                    "orderColumn" : d.columns[d.order[0]["column"]]["data"],
                    "orderType" : d.order[0]["dir"]
                },$scope.form);
            }
        })
        .withDataProp('data')
        .withOption('createdRow', function(row, data, dataIndex) {
            angular.element(row).addClass("rows" + data.id)
        })
        .withOption('searching',false)
        .withOption('ordering',true)
        .withOption('serverSide',true)
        .withOption('processing',false)
        .withOption('scrollX',false)
        .withLanguage(tools.dataTablesLanguage)
        .withOption('fnDrawCallback', fnDrawCallback)
        .withPaginationType('simple_numbers')
        .withOption('order', [0, 'asc']);
    vm.dtColumns = [
        DTColumnBuilder.newColumn('registertime').withTitle('日期'),
        DTColumnBuilder.newColumn('district').withTitle('城市').withOption('sWidth','90px'),
        DTColumnBuilder.newColumn('newRegUserNum').withTitle('店铺首页注册用户数').withOption('sWidth','150px'),
        DTColumnBuilder.newColumn('documentnoNum').withTitle('实名认证数'),
        DTColumnBuilder.newColumn('cardvalidatedNum').withTitle('绑卡用户数').notSortable(),
        DTColumnBuilder.newColumn('validdealnum').withTitle('交易用户数').notSortable(),
        DTColumnBuilder.newColumn('registerre').withTitle('红包金额').notSortable()
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
    function fnDrawCallback(){
        if (!tools.interceptor(window.ajaxDataInfo)) return;
        /*
         刷新统计数据
         */
        $scope.$apply(function(){
            $scope.tableinfo = window.ajaxDataInfo.info;
        });
    }
    (function(){
        /**
         * [导出店铺首页注册]
         * @param  {[type]}   [description]
         * @param  {[type]}   [description]
         * @return {[type]}   [description]
         */
        $("#js_data_store_register_export_btn").on("click", function(){
            tools.export(this);
        });
        $("[ui-view]").append("<style>table.dataTable,table.dataTable.no-footer {width: 100% !important;}</style>");
    })();
}
