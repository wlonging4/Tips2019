'use strict';
function toProductRateVipList($scope, $location, getSelectListFactory, getProListFactory, tools, DTOptionsBuilder, DTColumnBuilder) {
    var domForm = $("#js_form"), conditionItem = domForm.find(".form-group");
    $scope.form = {
        isShow: (conditionItem.length > 6) ? true : false

    };
    $scope.select = {};
    $scope.action = {};
    console.log($location)
    $.extend($scope.form, $location.$$search
);
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/xinghuoproductrate/productRateVipList.shtml',
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
        .withPaginationType('simple_numbers')
        .withOption('order', [1, 'desc']);
    vm.dtColumns = [
        DTColumnBuilder.newColumn('userid').withTitle('用户ID').withOption('sWidth', '200px'),
        DTColumnBuilder.newColumn('managername').withTitle('理财师').withOption('sWidth','200px'),
        DTColumnBuilder.newColumn('limitamount').withTitle('购买限额（元）').withOption('sWidth','200px'),
        DTColumnBuilder.newColumn('createtime').withTitle('导入时间').withOption('sWidth','180px').renderWith(function(data, type, full) {
            if(!data) return "";
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('id').withTitle('操作').withOption('sWidth', '160px').renderWith(function(data, type, full) {
            if(!data) return "";
            return '<a href="javascript:void(0);" class="productRateVipInfo" data-href="/xinghuoproductrate/deleteProductRateVip.shtml?subproductid=' + full.subproductid + '&id=' + full.id + '">' + '删除' + '</a>';
        })
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
        var dataTable = $("#dataTables"), tbody = dataTable.find('tbody');
        tbody.on("click", ".productRateVipInfo", function(){
            var self = $(this), href = self.attr("data-href"), data, url;
            data = tools.queryUrl(href);
            url = href.split('?')[0];
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + url,
                data: data,
                dataType: "json",
                success: function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    vm.dtInstance.rerender();
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });
        });

    }
}
