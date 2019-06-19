'use strict';
function serviceChargeController($scope,tools,DTOptionsBuilder, DTColumnBuilder) {
    $scope.form = {
        isShow: ($("#js_form").find(".form-group").length>6) ? true : false
    };
    $scope.select = {};
    $scope.action = {};
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder
        .newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/settlefee/list.json',
            type: 'POST',
            data: $scope.form
        })
        .withDataProp('data')
        .withOption('searching',false)
        .withOption('ordering',false)
        .withOption('serverSide',true)
        .withOption('processing',false)
        .withOption('scrollX',false)
        .withLanguage(tools.dataTablesLanguage)
        .withOption('createdRow', function(row, data, dataIndex) {
            angular.element(row).addClass("test"+data.id)
        })
        .withOption('fnDrawCallback',fnDrawCallback)
        .withPaginationType('full_numbers');
    vm.dtColumns = [
        DTColumnBuilder.newColumn('lenderId').withTitle('用户ID').withOption('sWidth','80px').renderWith(function(data,type,full){
            if(data && data != "null"){
                return '<a href="javascript:;" class="js_see_info" key="'+data+'" key_sys="'+full.bizSysRoute+'">'+data+'</a>';
            }else{
                return "";
            }
        }).notSortable(),
        DTColumnBuilder.newColumn('appBussinessId').withTitle('渠道业务编号').withOption('sWidth','200px').notSortable(),
        DTColumnBuilder.newColumn('lenderName').withTitle('用户姓名').withOption('sWidth','100px').notSortable(),
        DTColumnBuilder.newColumn('appOrderId').withTitle('原结算系统单号').withOption('sWidth','120px').notSortable(),
        DTColumnBuilder.newColumn('amount').withTitle('金额').withOption('sWidth','80px').notSortable(),
        DTColumnBuilder.newColumn('dealNo').withTitle('原订单号').withOption('sWidth','100px').renderWith(function(data,type,full){
            if(data && data != "null"){
                return '<a href="javascript:;" class="js_trade_info" type="tradeinfo" key="'+full.id+'" key2="'+ data +'" data-category="' + full.category + '">'+data+'</a>';
            }else{
                return "";
            }
        }),
        DTColumnBuilder.newColumn('settleState').withTitle('状态').withOption('sWidth','100px').renderWith(function(data,type,full){
            var str = "";
            switch (data){
                case "1":
                    str = "未提交成功";
                    break;
                case "2":
                    str = "订单不存在";
                    break;
                case "3":
                    str = "订单重复";
                    break;
                case "01":
                    str = "订单接收成功";
                    break;
                case "02":
                    str = "交易成功";
                    break;
                case "03":
                    str = "交易失败";
                    break;
            }
            return str;
        }).notSortable(),
        DTColumnBuilder.newColumn('feeType').withTitle('费用类型').withOption('sWidth','120px').renderWith(function(data,type,full){
            data = data.toString();
            var str = "";
            switch (data){
                case "2":
                    str = "返现";
                    break;
                case "3":
                    str = "体验金";
                    break;
                case "4":
                    str = "渠道补偿客户";
                    break;
                case "5":
                    str = "客户补偿渠道";
                    break;
                case "6":
                    str = "退款(服务费入金)";
                    break;
                case "101":
                    str = "其他(服务费出金)";
                    break;
                case "102":
                    str = "其他(服务费入金)";
                    break;
            }
            return str;
        }).notSortable()
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
        }
    }
    function fnDrawCallback(){
        if(!tools.interceptor(window.ajaxDataInfo)) return;
        $scope.$apply(function(){
            $scope.tableinfo = window.ajaxDataInfo.info;
        })
        tools.createModal();
        tools.createModalProgress();
        /**
         * [查看用户信息]
         * @param  {object}   [description]
         * @return {[type]}   [description]
         */
        $("#dataTables tbody").off("click", ".js_see_info");
        $("#dataTables tbody").on("click", ".js_see_info", function(){
            var url = "/xinghuouser/userinfo.shtml";
            var data = {
                "id": $(this).attr("key"),
                "userType": "consumer"
            };
            var self = this;
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + url,
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
        /**
         * [查看交易信息]
         * @param  {object}   [description]
         * @return {[type]}   [description]
         */
        $("#dataTables tbody").off("click", ".js_trade_info");
        $("#dataTables tbody").on("click", ".js_trade_info", function(){
            var data = {
                "id": $(this).attr("key"),
                "no": $(this).attr("key2"),
                "category":$(this).attr("data-category")
            };
            var self = this;
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + "/xinghuodeal/tradeinfo.shtml",
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
        $("[ui-view]").append("<style>table.dataTable,table.dataTable.no-footer {width: 100% !important;table-layout: auto !important;}</style>");
    })();
}