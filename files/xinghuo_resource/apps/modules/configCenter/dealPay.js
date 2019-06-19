'use strict';
function dealPay($scope, $http, $modal, getProListFactory, tools, DTOptionsBuilder, DTColumnBuilder) {
    var domForm = $("#js_form"), conditionItem = domForm.find(".form-group");
    $scope.form = {
        isShow: (conditionItem.length > 6) ? true : false
    };
    $scope.select = {};
    $scope.action = {};




    /*
     创建表格选项
     */
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/xinghuodeal/dealList.shtml',
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
        .withOption('scrollX',false)
        .withLanguage(tools.dataTablesLanguage)
        .withOption('fnDrawCallback', fnDrawCallback)
        .withPaginationType('simple_numbers');
    vm.dtColumns = [
        DTColumnBuilder.newColumn('no').withTitle('交易单号').withOption('sWidth','170px').renderWith(function(data, type, full) {
            if(!data) return "";
            return '<a href="javascript:;" class="infoDetail" data-href="/xinghuodeal/tradeinfo.shtml?id=' + full.id + '&no=' + full.no + '">' + data + '</a>';
        }),
        DTColumnBuilder.newColumn('amount').withTitle('交易金额').withOption('sWidth','80px'),
        DTColumnBuilder.newColumn('lendername').withTitle('出借人姓名').withOption('sWidth','100px'),
        DTColumnBuilder.newColumn('lenderid').withTitle('出借人ID').withOption('sWidth','90px'),
        DTColumnBuilder.newColumn('updateStatusTypeStr').withTitle('类型').withOption('sWidth','90px'),
        DTColumnBuilder.newColumn('updateStatusTime').withTitle('修改时间').withOption('sWidth','140px').renderWith(function(data, type, full) {
            if(!data) return "";
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('updateStatusAdminName').withTitle('操作管理员').withOption('sWidth','100px').renderWith(function(data, type, full) {
            if(!data) return "";
                return "<span title='" + full.updateStatusAdmin + "'>" + data + "</span>";
        })
    ];
    $scope.action.search = function(){
        vm.dtInstance.rerender();
    };

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
