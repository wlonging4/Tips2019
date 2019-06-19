'use strict';

function sxbAssetController($scope, tools, DTOptionsBuilder, DTColumnBuilder) {
    var domForm = $("#js_form"),
        conditionItem = domForm.find(".form-group");
    $scope.form = {
        isShow: (conditionItem.length > 6) ? true : false
    };

    $scope.select = {};

    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder
        .newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/xinghuoAssets/tableAssets.shtml',
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
        .withOption('fnDrawCallback',fnDrawCallback)
        .withPaginationType('full_numbers');
    vm.dtColumns = [
        DTColumnBuilder.newColumn('lenderId').withTitle('用户ID').withOption('sWidth','100px').renderWith(function(data,type,full){
            return '<a href="javascript:;" class="js_show_info" key="'+data+'" key_sys="'+full.bizSysRoute+'">'+data+'</a>';
        }).notSortable(),
        DTColumnBuilder.newColumn('lenderName').withTitle('用户姓名').withOption('sWidth','100px').renderWith(function(data,type,full){
            return '<a href="javascript:;" class="js_show_info" key="'+full.lenderId+'" key_sys="'+full.bizSysRoute+'">'+data+'</a>';
        }).notSortable(),
        DTColumnBuilder.newColumn('investAmount').withTitle('持有资产').withOption('sWidth','100px').notSortable(),
        DTColumnBuilder.newColumn('lockedDateBegin').withTitle('锁定期起始日').withOption('sWidth','150px').renderWith(function(data, type, full) {
            if (!data) return "";
            return tools.toJSYMD(data);
        }),
        DTColumnBuilder.newColumn('lockedDate').withTitle('锁定期到期日').withOption('sWidth','150px').renderWith(function(data, type, full) {
            if (!data) return "";
            return tools.toJSYMD(data);
        }),
        DTColumnBuilder.newColumn('endDate').withTitle('产品到期日').withOption('sWidth','150px').renderWith(function(data, type, full) {
            if (!data) return "";
            return tools.toJSYMD(data);
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
        init: function() {
            var that = this;
            setTimeout(function() {
                Metronic.init();
                ComponentsPickers.init();
            }, 300);
        }
    }
    function fnDrawCallback(){
        if(!tools.interceptor(window.ajaxDataInfo)) return;
        /*
         刷新统计数据
         */
        $scope.$apply(function(){
            $scope.tableinfo = window.ajaxDataInfo.info;
            if($scope.tableinfo){
                $scope.tableinfo = tools.formatNumber($scope.tableinfo);
            }
        });

        $('._asset-amount').html();

        $("#js_consumer_export").on("click", function(){
            tools.export(this);
        });


                /*
        绑定事件
         */
        $("#dataTables tbody").off("click");
        tools.createModal();
        tools.createModalProgress();


        /**
         * [查看用户信息]
         * @param  {object}   [description]
         * @return {[type]}   [description]
         */
        $("#dataTables tbody").on("click", ".js_show_info", function(){
            var bizSysRoute = $(this).attr("key_sys") == "null" ? 0 : $(this).attr("key_sys");
            var url = "/xinghuouser/userinfo.shtml";
            var data = {
                "id": $(this).attr("key"),
                "userType": "consumer",
                "bizSysRoute": bizSysRoute
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

    }
    (function(){
        $("[ui-view]").append("<style>table.dataTable,table.dataTable.no-footer {width: 100% !important;}</style>");
    })();
}