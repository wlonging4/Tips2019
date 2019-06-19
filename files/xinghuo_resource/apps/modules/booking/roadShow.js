'use strict';
function roadShow($scope, $http, tools, DTOptionsBuilder, DTColumnBuilder) {
    var domForm = $("#js_form"), conditionItem = domForm.find(".form-group");
    $scope.form = {
        isShow: (conditionItem.length > 6) ? true : false

    };
    $scope.select = {};
    $scope.action = {};

    $http({
        method : "POST",
        url : siteVar.serverUrl + "/xinghuopageapi/getRoadShowInfo.json",
        headers : {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
            'X-Requested-With' :'XMLHttpRequest'
        }
    }).success(function(data, status) {
        if(data.result != "SUCCESS") {
            return alert("获取申请活动名称失败，请与管理员联系。");
        };
        $scope.select.subjectCode = data.appResData.reslist;
    }).error(function(data, status) {
        alert("获取申请活动名称失败，请与管理员联系。");
        return;
    });
    /*
     创建表格选项
     */
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/xinghuogoldrainbow/tableRoadShow.shtml',
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
        DTColumnBuilder.newColumn('applyCode').withTitle('申请单号').withOption('sWidth', '120px'),
        DTColumnBuilder.newColumn('applytime').withTitle('申请时间').withOption('sWidth','140px').renderWith(function(data, type, full) {
            if(!data) return "";
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('subjectName').withTitle('申请活动名称').withOption('sWidth', '160px'),
        DTColumnBuilder.newColumn('applyName').withTitle('申请人姓名').withOption('sWidth', '90px'),
        DTColumnBuilder.newColumn('applyMobile').withTitle('申请人电话').withOption('sWidth','80px'),
        DTColumnBuilder.newColumn('managerName').withTitle('理财经理姓名').withOption('sWidth','90px'),
        DTColumnBuilder.newColumn('managerMobile').withTitle('理财经理手机号').withOption('sWidth','100px')
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
