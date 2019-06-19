'use strict';
function xinghuodataProductController($scope, $http, getProListFactory, tools, DTOptionsBuilder, DTColumnBuilder) {
    var domForm = $("#js_form"), conditionItem = domForm.find(".form-group");
    $scope.form = {
        isShow: (conditionItem.length > 6) ? true : false
    };
    $scope.select = {};
    $scope.action = {};
    /*
     获取枚举类型
     */
    getProListFactory.getProFirstList({
    }).then(function(data){
        if(data.result == "FAILED") {
            alert("获取产品列表失败，请与管理员联系。" + data.errMsg);
            return;
        }
        $scope.select.productid = data.appResData.proList;
    });
    $scope.action.choosePro = function(){
        $scope.form.subproductid = '';
        if(!$scope.form.productid){
            return $scope.select.subproductid = [];
        };
        $http({
            method: "POST",
            url: siteVar.serverUrl + "/xinghuoproduct/subprducts/" + $scope.form.productid + ".shtml",
            data:{
                'status' : 0
            }
        }).success(function(data, status) {
            if(!data.success) {
                alert("获取产品列表失败，请与管理员联系。" + data.msg);
                return;
            };
            $scope.select.subproductid = data.data;
        }).error(function(data, status) {
            alert("获取产品列表失败，请与管理员联系。");
            return;
        });
    };
    /*
     创建表格选项
     */
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/xinghuodata/queryProductTable.shtml',
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
        DTColumnBuilder.newColumn('spname').withTitle('产品名称').withOption('sWidth', '90px').renderWith(function(data, type, full) {
            return '<a href="javascript:;" key_id="'+full.id+'" class="ui_ellipsis js_data_goods_info" style="width:110px;" title="'+data+'">'+data+'</a>'
        }).notSortable(),
        DTColumnBuilder.newColumn('starttime').withTitle('开放日期').withOption('sWidth','80px').notSortable(),
        DTColumnBuilder.newColumn('calltime').withTitle('到期日').withOption('sWidth','80px').notSortable(),
        DTColumnBuilder.newColumn('fmminamount').withTitle('起投金额(元)').withOption('sWidth','80px').notSortable(),
        DTColumnBuilder.newColumn('fmmaxamount').withTitle('起投金额(元)').withOption('sWidth', '80px').notSortable(),
        DTColumnBuilder.newColumn('rundays').withTitle('投资天数').withOption('sWidth', '60px'),
        DTColumnBuilder.newColumn('annualrate').withTitle('预期年化收益率').withOption('sWidth','100px').notSortable(),
        DTColumnBuilder.newColumn('amount').withTitle('销售金额(元)').withOption('sWidth','80px').renderWith(function(data, type, full) {
            return full.fmamount;
        }),
        DTColumnBuilder.newColumn('status').withTitle('状态').withOption('sWidth','50px').notSortable()
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
        /*
         刷新统计数据
         */
        $scope.$apply(function(){
            $scope.tableinfo = window.ajaxDataInfo.info;
        });
        tools.createModal();
        tools.createModalProgress();
        $("#dataTables tbody").on("click", ".js_data_goods_info", function(){
            var data = {
                "productid": $(this).attr("key_id")
            }
            var self = this;
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + "/xinghuoproduct/productinfo.shtml",
                data: data,
                dataType: "text",
                success: function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    $("#js_dialog .js_content").html(data);
                    $("#js_dialog").modal("show");
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });
        });
    }
    (function(){
        /**
         * [导出产品统计]
         * @param  {[type]}   [description]
         * @param  {[type]}   [description]
         * @return {[type]}   [description]
         */
        $("#js_product_export_btn").on("click", function(){
            tools.export(this);
        });
        $("[ui-view]").append("<style>table.dataTable,table.dataTable.no-footer {width: 100% !important;}</style>");
    })();
}
