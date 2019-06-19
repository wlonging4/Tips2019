'use strict';
function categoryListTable($scope, $http, $location, getSelectListFactory, tools, DTOptionsBuilder, DTColumnBuilder) {
    $scope.form = {};
    $scope.select = {};
    $scope.action = {};
    $scope.parentId = $location.$$search.parentId;
    $scope.subname = $location.$$search.subname;


    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/xinghuocategory/tableCategory.shtml',
            type: 'POST',
            data: function(d){
                jQuery.extend(d,{
                    "orderColumn" : d.columns[d.order[0]["column"]]["data"],
                    "orderType" : d.order[0]["dir"],
                    "parentId" : $location.$$search.parentId
                });
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
        .withOption('scrollX',true)
        .withLanguage(tools.dataTablesLanguage)
        .withOption('fnDrawCallback', fnDrawCallback)
        .withPaginationType('simple_numbers')
        //.withOption('order', [3, 'desc']);
        .withOption('order', [5, 'asc']);
    vm.dtColumns = [
        DTColumnBuilder.newColumn('id').withTitle('ID').withOption('sWidth','80px').notSortable(),
        DTColumnBuilder.newColumn('name').withTitle('分类标题').withOption('sWidth','120px').notSortable(),
        DTColumnBuilder.newColumn('levelname').withTitle('理财经理').withOption('sWidth','120px').renderWith(function(data,type,full){
            if(!data) return "全部";
            return data;
        }).notSortable(),
        DTColumnBuilder.newColumn('createTime').withTitle('发布时间').withOption('sWidth','160px').renderWith(function(data, type, full) {
            return tools.toJSDate(data);
        }).notSortable(),
        DTColumnBuilder.newColumn('statusStr').withTitle('状态').withOption('sWidth','80px').notSortable(),
        DTColumnBuilder.newColumn('sortNum').withTitle('序号').withOption('sWidth','80px').withOption('sWidth','100px'),
        DTColumnBuilder.newColumn('id').withTitle('操作').withOption('sWidth','100px').renderWith(function(data, type, full) {
           var info = JSON.stringify(full);
            return '<a href="#/xinghuocategory-editCategoryList.html?id=' + data + '&parentId=' + full.parentId + '&info=' + encodeURIComponent(info) + '" class="btn btn-success btn-xs">修改</a>' + '<a href="javascript:;" data-href="/xinghuocategory/delCategory.shtml?id=' + data + '" style="margin-left: 10%;" class="btn btn-danger btn-xs categoryDelete">删除</a>';
        }).notSortable()
    ];


    $scope.action.search = function(){
        vm.dtInstance.rerender();
    };

    function fnDrawCallback(){

        $(".categoryDelete").on("click", function(){
            var self = $(this), href = self.attr("data-href"), data, url;
            data = tools.queryUrl(href);
            url = href.split('?')[0];
            var confirmInfo = window.confirm("您确认要删除该分类吗？");
            if(!confirmInfo){
                return;
            };
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + url,
                data: data,
                dataType: "json",
                success: function(data){
                    tools.ajaxOpened(self);
                    tools.interceptor(data);
                    if(data.success){
                        vm.dtInstance.rerender();
                    };

                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            })
        });
    }
}
