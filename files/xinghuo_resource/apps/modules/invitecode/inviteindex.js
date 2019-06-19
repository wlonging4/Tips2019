'use strict';
function inviteindex($scope, getProListFactory, tools, DTOptionsBuilder, DTColumnBuilder) {
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
            url: siteVar.serverUrl + '/xinghuoinvitecode/inviteindextable.shtml',
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
        DTColumnBuilder.newColumn('name').withTitle('名称').withOption('sWidth', '160px').renderWith(function(data, type, full) {
            return '<a href="javascript:void(0)" data-href="/xinghuoinvitecode/viewinvitecode.shtml?id=' + full.id + '" class="infoDetail">' + data + '</a>';
        }),
        DTColumnBuilder.newColumn('numbers').withTitle('数量').withOption('sWidth','40px'),
        DTColumnBuilder.newColumn('id').withTitle('有效期').withOption('sWidth','170px').renderWith(function(data, type, full) {
            if(!full.startDate || !full.endDate) return "";
            return tools.toJSYMD(full.startDate) + ' 至 ' + tools.toJSYMD(full.endDate);
        }),
        DTColumnBuilder.newColumn('description').withTitle('说明').withOption('sWidth','180px'),
        DTColumnBuilder.newColumn('createDate').withTitle('创建时间').withOption('sWidth', '140px').renderWith(function(data, type, full) {
            if(!data) return "";
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('id').withTitle('操作').withOption('sWidth', '100px').renderWith(function(data, type, full) {

            if(!data) return "";
            var info = encodeURIComponent(JSON.stringify(full));
            return '<a href="#/xinghuoinvitecode-editinvitecode.html?showCancel=1&data=' + info + '">修改</a>' + ' ' + '<a href="#/xinghuoinvitecode-datacodeanalysi.html?id=' + data + '">数据分析</a>';
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

        tools.createModal();
        tools.createModalProgress();
        var popUpLayer = $("#js_dialog"), popUpLayerContent = popUpLayer.find(".js_content");

        $(".js_export").on("click", function(){
            tools.export(this);
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
