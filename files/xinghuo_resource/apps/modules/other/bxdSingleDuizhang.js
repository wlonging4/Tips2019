'use strict';
function bxdSingleDuizhang($scope, $location, tools, DTOptionsBuilder, DTColumnBuilder) {
    var domForm = $("#js_form"), conditionItem = domForm.find(".form-group");
    $scope.form = {

    };
    var params = $location.$$search;
    if(!params.no){
        return alert("缺少交易单号！");
    };
    /*
     创建表格选项
     */
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/bxdduizhang/bxdSingleDuizhangTable.shtml',
            type: 'POST',
            data: params
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
        DTColumnBuilder.newColumn('no').withTitle('交易单号').withOption('sWidth','100px').renderWith(function(data, type, full) {
            return '<a href="javascript:;" class="infoDetail" data-href="/xinghuodeal/tradeinfo.shtml?id=' + full.id + '&no=' + full.no + '">' + data + '</a>';
        }),
        DTColumnBuilder.newColumn('lendername').withTitle('出借人').withOption('sWidth','100px').renderWith(function(data, type, full) {
            return '<a href="javascript:;" class="infoDetail" data-href="/xinghuouser/userinfo.shtml?userType=consumer&id=' + full.lenderid +'&bizSysRoute=' + (full.bizSysRoute || 0) + '">' + data + '</a>';
        }),
        DTColumnBuilder.newColumn('subproductname').withTitle('产品名称').withOption('sWidth','170px').renderWith(function(data, type, full) {
            return '<a href="javascript:;" class="infoDetail ui_ellipsis" style="width: 170px;" title="' + data + '" data-href="/xinghuoproduct/productinfo.shtml?productid=' + full.subproductid + '">' + data + '</a>';
        }),
        DTColumnBuilder.newColumn('amount').withTitle('认购金额（元）').withOption('sWidth','100px'),
        DTColumnBuilder.newColumn('statusstr').withTitle('交易状态').withOption('sWidth','100px'),
        DTColumnBuilder.newColumn('createtime').withTitle('下单时间').withOption('sWidth','150px').renderWith(function(data, type, full) {
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('redPaperAmout').withTitle('红包金额（元）').withOption('sWidth','100px').renderWith(function(data, type, full) {
            if(!full.redPaperAmout) return "0";
            return full.redPaperAmout;
        }),
        DTColumnBuilder.newColumn('saleTerminal').withTitle('认购渠道').withOption('sWidth','100px').renderWith(function(data, type, full) {
            if(data == null) return "";
            var arr = ["PC", "WAP", "iPhone App", "Android App"];
            return arr[data];
        }),
        DTColumnBuilder.newColumn('userid').withTitle('理财经理姓名').withOption('sWidth','100px').renderWith(function(data, type, full) {
            return '<a href="javascript:;" class="infoDetail" data-href="/xinghuouser/userinfo.shtml?userType=director&id=' + full.id + '&bizSysRoute=' + full.bizSysRoute + '">' + full.userName + '</a>';
        }),
        DTColumnBuilder.newColumn('storecode').withTitle('店铺ID').withOption('sWidth','100px').renderWith(function(data, type, full) {
            if(!data) return "";
            if(!full.storeUrl) return '<span>' + data + '</span>';
            return '<a href="' + full.storeUrl + '" target="_blank">' + data + '</a>'
        })
    ];


    function fnDrawCallback(){

        tools.createModal();
        tools.createModalProgress();
        var popUpLayer = $("#js_dialog"), popUpLayerContent = popUpLayer.find(".js_content");

        $("#js_trade_export").off("click").on("click", function(){
            var originalAction = $("#js_trade_form").attr("action");
            $("#js_trade_form").attr({"action": $(this).attr("action"), "method": "post"}).submit();
            $("#js_trade_form").attr({"action": originalAction, "method": ""});
        });

        var table = $("#dataTables"), tbody = table.find("tbody");
        table.off("click").on("click", ".infoDetail", function(){
            var self = $(this), href = self.attr("data-href"), data, url;
            data = tools.queryUrl(href);
            url = href.split('?')[0];
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + url,
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
    }

}
