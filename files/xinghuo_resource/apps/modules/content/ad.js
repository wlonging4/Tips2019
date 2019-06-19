'use strict';
function ad($scope, $compile, getSelectListFactory, tools, DTOptionsBuilder, DTColumnBuilder) {
    $scope.form = {};
    $scope.select = {};
    $scope.action = {};
    function addAttr(scope, el, attrName, attrValue) {
        el.replaceWith($compile(el.clone().attr(attrName, attrValue))(scope));
    }
    getSelectListFactory.getSelectList(['lay_out', 'ad_status', 'ad_source', 'biz_sys_route']).then(function(data){
        $scope.select.layout = data.appResData.retList[0].lay_out;
        $scope.select.status = data.appResData.retList[1].ad_status;
        $scope.select.source = data.appResData.retList[2].ad_source;
        $scope.select.bizSysRoute = data.appResData.retList[3].biz_sys_route;
        addAttr($scope, angular.element("#dataTables"), "datatable", true)
    });
    $scope.filerSource = function(e){
        return e.key != 4;
    };
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/xinghuocontent/tableAd.shtml',
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
        .withOption('order', [5, 'desc']);
    vm.dtColumns = [
        DTColumnBuilder.newColumn('id').withTitle('广告名称').withOption('sWidth','120px').renderWith(function(data, type, full){
            return '<a href="javascript:;" data-href="/xinghuocontent/adinfo.shtml?id=' + data + '" class="infoDetail ui_ellipsis">' + full.adname + '</a>';
        }).notSortable(),
        DTColumnBuilder.newColumn('url').withTitle('广告URL').withOption('sWidth','120px').renderWith(function(data, type, full){
            return '<div class="ui_ellipsis" title="' + data + '">' + data + '</div>';
        }).notSortable(),
        DTColumnBuilder.newColumn('layout').withTitle('版位').withOption('sWidth','100px').renderWith(function(data, type, full){
            var type;
            angular.forEach($scope.select.layout, function(item, index, array){
                if(item.key == data){
                    type = item.value;
                }
            });
            return type;
        }).notSortable(),
        DTColumnBuilder.newColumn('status').withTitle('状态').withOption('sWidth','40px').renderWith(function(data, type, full) {
            var arr = ["有效", "删除"];
            return arr[data];
        }).notSortable(),
        DTColumnBuilder.newColumn('source').withTitle('来源').withOption('sWidth','100px').withOption('sWidth','120px').notSortable(),
        DTColumnBuilder.newColumn('updatetime').withTitle('上传时间').withOption('sWidth','140px').renderWith(function(data, type, full) {
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('photo').withTitle('预览').withOption('sWidth','40px').renderWith(function(data, type, full) {
            return '<a href="' + data + '" target="_blank">预览</a>';
        }).notSortable(),
        DTColumnBuilder.newColumn('id').withTitle('操作').withOption('sWidth','40px').renderWith(function(data, type, full) {
            return '<div class="ui_center"><a href="#xinghuocontent-editAd.html?id=' + data + '" class="btn btn-success btn-xs" >修改</a></div>';
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
    }
}
