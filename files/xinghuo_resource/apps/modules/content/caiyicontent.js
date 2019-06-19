'use strict';
function caiyicontent($scope, $http, getSelectListFactory, tools, DTOptionsBuilder, DTColumnBuilder) {
    $scope.form = {};
    $scope.select = {};
    $scope.action = {};
    $scope.cmstype = 0;

    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/xinghuocontent/tableContent.shtml',
            type: 'POST',
            data: function(d){
                jQuery.extend(d,{
                    "orderColumn" : d.columns[d.order[0]["column"]]["data"],
                    "orderType" : d.order[0]["dir"]
                }, tools.getFormele({},$("#js_form")));
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
        .withOption('order', [4, 'desc']);
    vm.dtColumns = [
        DTColumnBuilder.newColumn('id').withTitle('ID').withOption('sWidth','60px').notSortable(),
        DTColumnBuilder.newColumn('title').withTitle('标题').withOption('sWidth','120px').renderWith(function(data,type,full){
            return '<a href="javascript:;" data-href="/xinghuocontent/webcmsInfo.shtml?id=' + full.id + '" class="infoDetail ui_ellipsis"  title="' + data + '">' + data + '</a>';
        }).notSortable(),
        DTColumnBuilder.newColumn('levelname').withTitle('理财经理').withOption('sWidth','140px').renderWith(function(data,type,full){
            if(!data) return "全部";
            return data;
        }).notSortable(),
        DTColumnBuilder.newColumn('typestr').withTitle('分类').withOption('sWidth','120px').notSortable(),
        DTColumnBuilder.newColumn('createtime').withTitle('发布时间').withOption('sWidth','140px').renderWith(function(data, type, full) {
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('status').withTitle('状态').withOption('sWidth','40px').renderWith(function(data, type, full) {
            return full.statusstr;
        }).notSortable(),
        DTColumnBuilder.newColumn('id').withTitle('操作').withOption('sWidth','100px').renderWith(function(data, type, full) {
            return '<a href="#/xinghuocontent-editContent.html?redirect=caiyicontent-content&type=8&id=' + data + '" class="btn btn-success btn-xs">修改</a>' + '<a href="javascript:;" data-href="/xinghuocontent/deletewebcms.shtml?id=' + data + '" class="btn btn-danger btn-xs js_content_delete">删除 </a>';
        }).notSortable()
    ];


    $scope.action.search = function(){
        vm.dtInstance.rerender();
    };

    function fnDrawCallback(){
        var table = $("#dataTables"), tbody = table.find("tbody");
        tools.createModal();
        tools.createModalProgress();
        var popUpLayer = $("#js_dialog"), popUpLayerContent = popUpLayer.find(".js_content");
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
        tbody.on("click", ".js_content_delete", function(){
            var self = $(this), href = self.attr("data-href"), data, url;
            data = tools.queryUrl(href);
            url = href.split('?')[0];
            if(!confirm("你确定要删除该资源！")) return false;
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + url,
                data: data,
                dataType: "json",
                success: function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    if(data.success){
                        return vm.dtInstance.rerender();
                    };
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });

        });
    }
}
