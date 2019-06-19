'use strict';
function bookingManagement($scope, $compile,$location, getSelectListFactory, tools, DTOptionsBuilder, DTColumnBuilder) {
    var domForm = $("#js_form"), conditionItem = domForm.find(".form-group");
    $scope.form = {
        isShow: (conditionItem.length > 6) ? true : false

    };
    $scope.select = {};
    $scope.action = {};
    function addAttr(scope, el, attrName, attrValue) {
        el.replaceWith($compile(el.clone().attr(attrName, attrValue))(scope));
    }
    getSelectListFactory.getSelectList(['reservationtype', 'webcmsrc']).then(function(data){
        $scope.select.reservationtype = data.appResData.retList[0].reservationtype;
        $scope.select.webcmsrc = data.appResData.retList[1].webcmsrc;
        addAttr($scope, angular.element("#dataTables"), "datatable", true)
    });
    $scope.filerType = function(item){
        return item.key > 3;
    };

    //获取公开课预约信息
    if($location.url().indexOf("bookingTitleFromOpenClass") > -1){
        var urlStr = $location.url().split("?")[1];
        var urlObj = tools.serializeUrl(urlStr);
        if(!urlObj.bookingTitleFromOpenClass){
            tools.interalert("参数非法");
        }
        $scope.form.applyRemark=urlObj.bookingTitleFromOpenClass;
    }

    /*
     创建表格选项
     */

    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/xinghuogoldrainbow/tableReservationApply.shtml',
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
        DTColumnBuilder.newColumn('applyName').withTitle('预约人姓名').withOption('sWidth', '80px'),
        DTColumnBuilder.newColumn('applyMobile').withTitle('预约人手机号').withOption('sWidth','100px'),
        DTColumnBuilder.newColumn('applyType').withTitle('预约类型').withOption('sWidth', '80px').renderWith(function(data, type, full) {
            var type;
            angular.forEach($scope.select.reservationtype, function(item, index, array){
                if(item.key == data){
                    type = item.value;
                }
            });
            return type;
        }),
        DTColumnBuilder.newColumn('applyRemark').withTitle('预约信息').withOption('sWidth','160px'),
        DTColumnBuilder.newColumn('managerid').withTitle('理财经理ID').withOption('sWidth', '100px').renderWith(function(data, type, full) {
            if(!data) return "";
            return '<a href="javascript:void(0);" class="infoDetail" data-href="/xinghuouser/userinfo.shtml?userType=director&id=' + full.managerid + '">' + data + '</a>';
        }),
        DTColumnBuilder.newColumn('managerName').withTitle('理财经理姓名').withOption('sWidth','90px'),
        DTColumnBuilder.newColumn('applytime').withTitle('预约时间').withOption('sWidth','140px').renderWith(function(data, type, full) {
            if(!data) return "";
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('source').withTitle('渠道').withOption('sWidth','100px').renderWith(function(data, type, full) {
            var type;
            angular.forEach($scope.select.webcmsrc, function(item, index, array){
                if(item.key == data){
                    type = item.value;
                }
            });
            return type;
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
