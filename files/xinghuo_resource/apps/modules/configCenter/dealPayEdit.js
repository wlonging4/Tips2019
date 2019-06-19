'use strict';
function dealPayEdit($scope, $http, $modal, $state, tools) {
    var domForm = $("#js_form");
    $scope.form = {};
    $scope.action = {};
    $scope.form.updateStatusType = 0;
    var ModalCtrl = function($scope, $modalInstance, amount, lendername, form) {
        $scope.amount = amount;
        $scope.lendername = lendername;
        $scope.form = form;
        $scope.ok = function() {
            var self = $("#confirmBtn");
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + "/xinghuodeal/updateDeal.shtml",
                data: $scope.form,
                dataType: "json",
                success: function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    if(data.success){
                        alert("操作成功！");
                        $modalInstance.close();
                        $state.go("xinghuosite-dealPay");
                    };

                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });
        };
        $scope.cancel = function() {
            $modalInstance.close();
        };
    };
    $scope.update = function(){
        var self = $("#updateBtn");
        if(!tools.ajaxLocked(self)) return;
        var reqData = $.param($scope.form);
        $http({
            method : "POST",
            url : siteVar.serverUrl + "/xinghuodeal/updateDealConfirm.shtml",
            data : reqData,
            headers : {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                'X-Requested-With' :'XMLHttpRequest'
            }
        }).success(function(data, status) {
            tools.ajaxOpened(self);
            if(!tools.interceptor(data)) return;
            if(data.success) {
                $modal.open({
                    backdrop: true,
                    backdropClick: true,
                    dialogFade: false,
                    keyboard: true,
                    templateUrl : 'myModalContent.html',
                    controller : ModalCtrl,
                    windowClass:'modal-640',
                    resolve:{
                        "amount" : function(){
                            return data.data.amount;
                        },
                        "lendername" : function(){
                            return data.data.lendername;
                        },
                        "form": function(){
                            return $scope.form;
                        }
                    }
                });
            };



        }).error(function(data, status) {
            tools.ajaxOpened(self);
            alert("获取信息失败，请与管理员联系。");
            return;
        });
    }




}
