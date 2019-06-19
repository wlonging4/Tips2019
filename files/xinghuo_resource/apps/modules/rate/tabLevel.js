'use strict';
function tabLevel($scope, tools, DTOptionsBuilder, DTColumnBuilder) {
    $scope.form = {

    };
    $scope.select = {};
    $scope.action = {};
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/xinghuodefaultrate/defaultLevelRate.shtml',
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
        .withOption('fnDrawCallback', fnDrawCallback)
        .withPaginationType('simple_numbers');
    vm.dtColumns = [
        DTColumnBuilder.newColumn('levelName').withTitle('级别名称').withOption('sWidth', '100px'),
        DTColumnBuilder.newColumn('rateTmpName').withTitle('选择店铺费率').withOption('sWidth','100px').renderWith(function(data, type, full) {
            return (!!data) ? ('<a href="javascript:;" class="js_rateTemplate_info" title="' + data + '" data-content="' + full.rateRange + '">' + data + '</a>') : '';
        }),
        DTColumnBuilder.newColumn('rateTmpName').withTitle('操作').withOption('sWidth','50px').renderWith(function(data, type, full) {
            //if(!data){ return "" };
            return '<a href="javascript:void(0);" class="btn btn-success btn-xs infoDetail" data-href="/xinghuodefaultrate/editLevelRate.shtml?levelId=' + full.levelId + '">修改</a>';
        })
    ];
    $scope.action.reset = function(){
        for(var prop in $scope.form){
            delete $scope.form[prop];
        }
        vm.dtInstance.rerender();
    };
    tools.createModal();
    tools.createModalProgress();
    var popUpLayer = $("#js_dialog"), popUpLayerContent = popUpLayer.find(".js_content");

    $scope.action.search = function(){
        vm.dtInstance.rerender();
    };
    ;(function(){
        $("#js_dialog").on("click", ".js_rate_level_save", function () {

            var self = this;
            if(!tools.ajaxLocked(self)) return;

            var data = tools.getFormele({}, $("#js_rate_level_form"));

            $.ajax({
                type: "post",
                url: siteVar.serverUrl + "/xinghuodefaultrate/saveLevelRate.shtml",
                data: data,
                dataType: "json",
                success: function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    if(data.success) {
                        alert(data.msg);
                        $("#js_dialog").modal("hide");
                        vm.dtInstance.rerender();
                    }

                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });

        });
    })();
    function fnDrawCallback(){

        tools.createModal();
        tools.createModalProgress();
        var popUpLayer = $("#js_dialog"), popUpLayerContent = popUpLayer.find(".js_content");
        var table = $("#dataTables"), tbody = table.find("tbody");
        table.off("click");
        tbody.on("click", ".infoDetail", function(){
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
        $('.js_rateTemplate_info').each(function () {
            var content = $(this).attr("data-content");
            $(this).popover({"trigger": "hover", "container": "body", "placement": "right", "html": true, "content": content});
        });

        $("#js_dialog").on("change", '[name="rateTemId"]', function () {

            var self = this;
            if(!tools.ajaxLocked(self)) return;

            var data = {"rateTemplateId": this.value};

            $.ajax({
                type: "post",
                url: siteVar.serverUrl + "/xinghuodefaultrate/getRateRangeInfoForCreateRatePage.shtml",
                data: data,
                dataType: "text",
                success: function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    $("#rateRangeDiv").html(data);
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });

        });

    }

}
