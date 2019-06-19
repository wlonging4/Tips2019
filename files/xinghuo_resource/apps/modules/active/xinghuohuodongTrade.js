'use strict';
function xinghuohuodongTradeController($scope,getSelectListFactory,tools,DTOptionsBuilder, DTColumnBuilder) {
    $scope.form = {
        isShow: ($("#js_form").find(".form-group").length>6) ? true : false,
    };
    $scope.select = {};
    $scope.action = {};
    /*
     获取枚举类型
     */
    var selectList = getSelectListFactory.getSelectList(['biz_sys_route']);
    selectList.then(function(data){
        //过滤业务系统来源
        var arr = [];
        var bizSysRoute = data.appResData.retList[0].biz_sys_route;
        for(var i in bizSysRoute){
            if(i != 3 && i != 4){
                arr.push(bizSysRoute[i]);
            }
        }
        $scope.select.bizSysRoute = arr;
        arr = [];
    });
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder
        .newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/xinghuohuodong/tableHuodongTrade.shtml',
            type: 'POST',
            data: function(d){
                jQuery.extend(d,$scope.form);
                if($('input[name="p_dealstatus"]').val().length>0){
                    d.p_dealstatus = $('input[name="p_dealstatus"]').val();
                }
            }
        })
        .withDataProp('data')
        .withOption('searching',false)
        .withOption('ordering',false)
        .withOption('serverSide',true)
        .withOption('processing',false)
        .withOption('scrollX',true)
        .withLanguage(tools.dataTablesLanguage)
        .withOption('createdRow', function(row, data, dataIndex) {
            angular.element(row).addClass("test"+data.id)
        })
        .withOption('fnDrawCallback',fnDrawCallback)
        .withPaginationType('full_numbers');
    vm.dtColumns = [
        DTColumnBuilder.newColumn('dealno').withTitle('订单号').withOption('sWidth','180px').renderWith(function(data,type,full){
            return '<a href="javascript:;" class="js_huodongTrade_info" key_id="'+full.dealid+'" key_no="'+data+'">'+data+'</a>';
        }),
        DTColumnBuilder.newColumn('lenderid').withTitle('用户ID').withOption('sWidth','100px'),
        DTColumnBuilder.newColumn('userid').withTitle('理财经理ID').withOption('sWidth','100px'),
        DTColumnBuilder.newColumn('subproductname').withTitle('购买产品').withOption('sWidth','150px').renderWith(function(data,type,full){
            return '<span class="ui_ellipsis" style="width: 200px;" title="'+data+'">'+data+'</span>';
        }),
        DTColumnBuilder.newColumn('amount').withTitle('交易金额').withOption('sWidth','70px'),
        DTColumnBuilder.newColumn('ownedamount').withTitle('抵扣').withOption('sWidth','60px'),
        DTColumnBuilder.newColumn('code').withTitle('红包编码').withOption('sWidth','120px'),
        DTColumnBuilder.newColumn('activityname').withTitle('活动名称').withOption('sWidth','120px').renderWith(function(data,type,full){
            return '<div class="ui_ellipsis">' + data + '</div>';
        }),
        DTColumnBuilder.newColumn('dealstatusstr').withTitle('交易状态').withOption('sWidth','80px'),
        DTColumnBuilder.newColumn('createtime').withTitle('交易时间').withOption('sWidth','160px').renderWith(function(data,type,full){
            return tools.toJSDate(data);
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
        }
    }
    function fnDrawCallback(){
        if(!tools.interceptor(window.ajaxDataInfo)) return;
        tools.createModal();
        tools.createModalProgress();
        /**
         * [description]
         * @param  {object}    [description]
         * @param  {[type]}    [description]
         * @return {[type]}    [description]
         */
        $("#dataTables tbody").on("click", ".js_huodongTrade_info", function(){
            var data = {
                "id": $(this).attr("key_id"),
                "no": $(this).attr("key_no")
            }
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
        /**
         * [活动交易单导出]
         * @param  {[type]}   [description]
         * @param  {[type]}   [description]
         * @return {[type]}   [description]
         */
        $("#js_huodong_trade_export").on("click", function(){
            tools.export(this);
        });
    })();
}