'use strict';
function cash($scope, tools, DTOptionsBuilder, DTColumnBuilder) {
    var domForm = $("#js_form"), conditionItem = domForm.find(".form-group");
    $scope.form = {
        isShow: (conditionItem.length > 6) ? true : false
    };
    $scope.select = {};
    $scope.action = {};
    $('#cashStatus').multiSel({
        'data': [
            {"text": "变现成功", "value": "1,4", "default": false},
            {"text": "变现中", "value": "0", "default": false},
            {"text": "变现失败", "value": "2,3,5", "default": false}
        ],
        "name" : "queryCashStatus"
    });
    /*
     创建表格选项
     */
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/xinghuoproduct/tableCash.shtml',
            type: 'POST',
            data: function(d){
                var data = tools.getFormele({}, domForm);
                $.extend(d, data, $scope.form);
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
        .withOption('scrollX',true)
        .withLanguage(tools.dataTablesLanguage)
        .withOption('fnDrawCallback', fnDrawCallback)
        .withPaginationType('simple_numbers');
    vm.dtColumns = [
        DTColumnBuilder.newColumn('code').withTitle('产品编号').withOption('sWidth','160px'),
        DTColumnBuilder.newColumn('name').withTitle('产品名称').withOption('sWidth','140px').renderWith(function(data, type, full) {
            if(!data) return "";
            return '<a href="javascript:void(0)" class="infoDetail" data-href="/xinghuoproduct/productDetail.shtml?productid=' + full.subproductid + '&category=' + full.category + '">' + data + '</a>';
        }),
        DTColumnBuilder.newColumn('annualrate').withTitle('预计年化收益率').withOption('sWidth','100px').renderWith(function(data, type, full) {
            if(!data) return "";
            return data ? data + "%" : "";
        }),
        DTColumnBuilder.newColumn('applyAmount').withTitle('申请金额').withOption('sWidth','80px'),
        DTColumnBuilder.newColumn('buyAmount').withTitle('已成交金额').withOption('sWidth','80px').renderWith(function(data, type, full) {

            return !!data ? ('<a target="_blank" href="#xinghuodeal-trade.html?selectstatus=01111100&productcode=' + full.code + '">' + data + '</a>') : '0';

        }),
        DTColumnBuilder.newColumn('parentNo').withTitle('上级交易单号').withOption('sWidth','180px').renderWith(function(data, type, full) {
            if(!data) return "";
            return '<a href="javascript:void(0)" class="infoDetail" data-href="/xinghuodeal/tradeinfo.shtml?id=' + full.subproductid + '&no=' + data + '">' + data + '</a>';
        }),
        DTColumnBuilder.newColumn('sourceNo').withTitle('一级交易单号').withOption('sWidth','180px').renderWith(function(data, type, full) {
            if(!data) return "";
            return '<a href="javascript:void(0)" class="infoDetail" data-href="/xinghuodeal/tradeinfo.shtml?id=' + full.subproductid + '&no=' + data + '">' + data + '</a>';

        }),
        DTColumnBuilder.newColumn('realname').withTitle('产品发起人').withOption('sWidth','80px').renderWith(function(data, type, full) {
            if(!data) return "";
            return '<a href="javascript:void(0)" class="infoDetail" data-href="/xinghuouser/userinfo.shtml?id=' + full.userid + '&userType=consumer&bizSysRoute=0">' + data + '</a>';
        }),
        DTColumnBuilder.newColumn('applytime').withTitle('申请时间').withOption('sWidth','140px').renderWith(function(data, type, full) {
            if(!data) return "";
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('cashStatusStr').withTitle('变现状态').withOption('sWidth','80px')
    ];
    $scope.action.search = function(){
        vm.dtInstance.rerender();
    };
    $scope.action.reset = function(){
        for(var prop in $scope.form){
            if(prop !== 'isShow') delete $scope.form[prop];
        };
        var cashStatus = $("#cashStatus");
        cashStatus.find("[name='queryCashStatus']").val('')
            .prev().val('').end().end().find("[type='checkbox']").prop("checked", false).uniform();

        vm.dtInstance.rerender();
    };
    ;(function(){
        $("#js_subproduct_export").on("click", function(){
            tools.export(this);
        });
    })();
    function fnDrawCallback(){
        tools.createModal();
        tools.createModalProgress();
        var popUpLayer = $("#js_dialog"), popUpLayerContent = popUpLayer.find(".js_content");
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
                    var form = $("#js_recommend_product_form");
                    form.find("input[type=checkbox]").uniform();
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
