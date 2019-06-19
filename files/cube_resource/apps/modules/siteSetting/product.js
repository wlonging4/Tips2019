'use strict';
function productController($scope, $modal, tools) {
    $scope.form = {};
    $scope.action ={
        drawTable: function(){
            var data = {};
            if($scope.form.productName){
                data.productName = $scope.form.productName;
            }
            $.ajax({
                url: siteVar.serverUrl+"days/queryList.json",
                data: data,
                method: 'post',
                dataType: 'json'
            }).then(function(data){
                if(!tools.interceptor(data)) return;
                if(data.success){
                    $scope.$apply(function(){
                        $scope.tableData = data.data;
                    })
                }else{
                    alert(data.msg)
                }
            })
        },
        load : function(){
            this.drawTable();
        },
        build: function(e){
            var currentDom = $(e.currentTarget), data = currentDom.attr("data-obj");
            data = data ? JSON.parse(data) : {};
            $modal.open({
                backdrop: true,
                backdropClick: true,
                dialogFade: false,
                keyboard: true,
                templateUrl : 'myModalContent.html',
                controller : ModalCtrl,
                resolve:{
                    "form": function(){
                        return data;
                    }
                }
            });
        },
        del: function(e,id,num){
            if(window.confirm("真的要删除吗？")){
                var data = {"id":id};
                $.ajax({
                    url: siteVar.serverUrl+'days/delete.json',
                    method: 'post',
                    data: data
                }).then(function(data){
                    if(!tools.interceptor(data)) return;
                    if(data.success){
                        $scope.$apply(function(){
                            $scope.tableData.splice(num,1);
                        })
                    }else{
                        alert(data.msg)
                    }
                })
            }
        }
    }
    var ModalCtrl = function($scope, $modalInstance, form) {
        if(form.id){
            $scope.form = form;
        }
        $scope.init = function(){
            var formDom = $("#js_modify_product_form"), productName = formDom.find("[name='productName']"), days = formDom.find("[name='days']");
            productName.Validator({hmsg: "请填写产品名称", regexp: /^[\s|\S]{1,50}$/, showok: false, style: {placement: "top"}, emsg: "产品名称不能为空", rmsg: "产品名称不合法"});
            days.Validator({hmsg: "请填写天数", regexp: /^[\d]+$/, showok: false, style: {placement: "top"}, emsg: "天数不能为空", rmsg: "天数不合法"});
        };
        $scope.ok = function() {
            var self = $("#confirmBtn"), formDom = $("#js_modify_product_form"), productName = formDom.find("[name='productName']"), days = formDom.find("[name='days']");
            if(!tools.Validator(productName) || !tools.Validator(days)){
                return false;
            };
            formDom.find("[name='id']").val(form.id);
            var data = tools.getFormele({}, formDom);
            if(!tools.ajaxLocked(self)) return;
            var url = form.id ? "days/updateDays.json":"days/addDays.json";
            $modalInstance.close();
            $.ajax({
                type: "post",
                url: siteVar.serverUrl+url,
                data: data,
                dataType: "json",
                success: function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    if(data.success){
                        location.reload();
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
}
