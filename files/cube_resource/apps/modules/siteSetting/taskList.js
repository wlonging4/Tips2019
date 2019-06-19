'use strict';
function taskListController($scope,tools,$modal) {
    setTimeout(function(){
        ComponentsPickers.init();
    },300)
    $.ajax({
        url: siteVar.serverUrl+'taskExecution/allTask.json',
        method: 'get'
    }).then(function(data){
        if(!tools.interceptor(data)) return;
        $scope.$apply(function(){
            $scope.taskList = data.data;
        });
    });
    var execTaskController = function($scope, $modalInstance,form) {
        $scope.init = function(){
            setTimeout(function(){
                ComponentsPickers.init();
            },300)
        },
        $scope.ok = function(e){
            var currentDom = $(e.currentTarget);
            if(!tools.ajaxLocked(currentDom)) return;
            var dateTime = $("#js_execTask_form").find("input[name='dateTime']").val();
            var exp = /^\d{4}-\d{2}-\d{2}$/;
            var obj = {code : form};
            if(exp.test(dateTime)){
                obj.dateTime = dateTime;
            }
            $.ajax({
                url: siteVar.serverUrl+'taskExecution/execute.json',
                method: 'post',
                data: obj
            }).then(function(data){
                if(!tools.interceptor(data)) return;
                $modalInstance.close();
            })
        };
        $scope.cancel = function() {
            $modalInstance.close();
        };
    };
    $scope.show = function(e){
        var currentDom = $(e.currentTarget), code = currentDom.attr("data-code");
        if(!code) return;
        $modal.open({
            backdrop: true,
            backdropClick: true,
            dialogFade: false,
            keyboard: true,
            templateUrl : 'execTaskModal.html',
            controller : execTaskController,
            resolve:{
            "form": function(){
                return code;
            }
        }
        });
    }
}