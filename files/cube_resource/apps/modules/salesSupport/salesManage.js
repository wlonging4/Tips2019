'use strict';
function salesManageController($scope,tools,DTOptionsBuilder, DTColumnBuilder,$modal, $rootScope, getSelectListFactory) {
    $scope.show = {
        isShow: ($("#js_form").find(".form-group").length>3) ? true : false
    };
    $scope.select={};
    $scope.form={};
    //获取销支人员角色
    getSelectListFactory.getSelectList(['support_auth']).then(function (res) {
        $scope.select.logPermission = res.data[0].support_auth;
    });

    $scope.interalert=function (data) {
        $("#js_dialog_permission .js_content").html('<span class="ui_red">'+data+'</span>');
        $("#js_dialog_permission").modal("show");
    };

    $scope.reset = function(){
        for(var prop in $scope.form){
            delete $scope.form[prop];
        }
        vm.dtInstance.rerender();
    };
    $scope.search = function(){
        for(var prop in $scope.form){
            if(!$scope.form[prop]) delete $scope.form[prop];
        }
        vm.dtInstance.rerender();
    };

    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder
        .newOptions().withOption('ajax',{
            url: siteVar.serverUrl + 'support/tableSupport.json',
            type: 'POST',
            data: $scope.form
        })
        .withDataProp('data')
        .withOption('createdRow', function(row, data, dataIndex) {
            angular.element(row).addClass("rows"+data.id)
        })
        .withOption('searching',false)
        .withOption('ordering',false)
        .withOption('serverSide',true)
        .withOption('processing',false)
        .withOption('scrollX',false)
        .withLanguage(tools.dataTablesLanguage)
        .withOption('fnDrawCallback',fnDrawCallback)
        .withPaginationType('simple_numbers');
    vm.dtColumns = [
        DTColumnBuilder.newColumn('logPermission').withTitle('角色').withOption('sWidth','80px'),
        DTColumnBuilder.newColumn('supportName').withTitle('姓名').withOption('sWidth','40px'),
        DTColumnBuilder.newColumn('supportMobile').withTitle('手机号').withOption('sWidth','80px'),
        DTColumnBuilder.newColumn('supportId').withTitle('销支人员ID').withOption('sWidth','60px'),
        DTColumnBuilder.newColumn('supportWechat').withTitle('微信号').withOption('sWidth','100px'),
        DTColumnBuilder.newColumn('supportEmail').withTitle('邮箱').withOption('sWidth','180px'),
        DTColumnBuilder.newColumn('supportId').withTitle('操作').withOption('sWidth','100px').renderWith(function(data,type,full){
            return '<a href="#/salesEdit.html?supportId=' + data + '" class="btn btn-sm btn-primary editItem" >编辑</a><a href="javascript:;" data-id="'+data+'" data-name="'+full.supportName+'" class="btn btn-sm btn-danger deleteSales">删除</a>';
        })
    ];

    function fnDrawCallback(data){
        //删除销支信息
        $(".deleteSales").off('click').on("click",function(){
            var supportId = $(this).attr("data-id"),supportName = $(this).attr("data-name");
            if(!supportId||!supportName) return;
            var data = {
                "supportId": supportId
            };
            if(!window.confirm('确定要删除'+supportName+'？')){return;}

            var self = this;
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + "support/deleteSupport.json",
                data: data,
                dataType: "text",
                success: function(data){
                    data=JSON.parse(data);
                    tools.ajaxOpened(self);
                    if(data.success){
                        if(!tools.interceptor(data)) return;
                        $scope.interalert('销支信息删除成功！');
                        vm.dtInstance.rerender();
                    }else{
                        $scope.interalert(data.msg);
                    }
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });
            return false;
        });
    }
}
