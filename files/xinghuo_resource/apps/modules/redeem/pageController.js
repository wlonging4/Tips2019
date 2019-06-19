'use strict';
function pageController($scope, getSelectListFactory, getProListFactory, tools, DTOptionsBuilder, DTColumnBuilder) {
    var domForm = $("#js_form"), conditionItem = domForm.find(".form-group");
    $scope.form = {
        isShow: (conditionItem.length > 6) ? true : false
    };
    $scope.select = {};
    $scope.action = {};
    $scope.form.payChannel =0;
    /*
     获取枚举类型
     */
    var selectList = getSelectListFactory.getSelectList(['sp_status']);
    selectList.then(function(data){
        $scope.select.sp_status = data.appResData.retList[0].sp_status;
    });

    /*
     创建表格选项
     */
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/singlepayment/tableSinglePayMent.shtml',
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
        .withPaginationType('simple_numbers');
    vm.dtColumns = [
        DTColumnBuilder.newColumn('createTime').withTitle('创建时间').withOption('sWidth','140px').renderWith(function(data, type, full) {
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('userName').withTitle('出借人姓名').withOption('sWidth','90px').renderWith(function(data, type, full) {
            if(!data) return "";
            return '<a href="javascript:void(0);" class="infoDetail" data-href="/xinghuouser/userinfo.shtml?bizSysRoute=0&userType=consumer&id=' + full.userId + '">' + data + '</a>';
        }),
        DTColumnBuilder.newColumn('amountStr').withTitle('提现金额').withOption('sWidth', '60px'),
        DTColumnBuilder.newColumn('stateStr').withTitle('结算单状态').withOption('sWidth', '100px'),
        DTColumnBuilder.newColumn('bizId').withTitle('星火付款单号').withOption('sWidth','260px'),
        DTColumnBuilder.newColumn('txId').withTitle('平台付款单号').withOption('sWidth','220px'),
        DTColumnBuilder.newColumn('respDescription').withTitle('回款备注').withOption('sWidth','150px').renderWith(function(data, type, full) {
            return '<span class="ui_ellipsis" style="width: 150px" title="' + data + '">' + data + '</span>';
        }),
        DTColumnBuilder.newColumn('completeTime').withTitle('完成时间').withOption('sWidth','140px').renderWith(function(data, type, full) {
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('appRedeemNo').withTitle('赎回单ID').withOption('sWidth','270px').renderWith(function(data, type, full) {
            return '<a href="javascript:void(0);" class="infoDetail" data-href="/xinghuodeal/redeemDetail.shtml?appRedeemId=' + data + '">' + data + '</a>';
        }),
        DTColumnBuilder.newColumn('dealNO').withTitle('交易单号').withOption('sWidth','190px').renderWith(function(data, type, full) {
            if(!data) return "";
            return '<a href="javascript:void(0);" class="infoDetail" data-href="/xinghuodeal/tradeinfo.shtml?&no=' + data + '">' + data + '</a>';
        }),
        DTColumnBuilder.newColumn('trusteeshipStr').withTitle('是否托管').withOption('sWidth', '60px')
    ];
    $scope.action.reset = function(){
        for(var prop in $scope.form){
            if(prop !== 'isShow') delete $scope.form[prop];
        }
        $scope.form.payChannel =0;
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
