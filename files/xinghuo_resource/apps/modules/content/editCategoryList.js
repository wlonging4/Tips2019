'use strict';
function editCategoryList($scope, $timeout, $window, $state, $http, $location, getSelectListFactory, tools, DTOptionsBuilder, DTColumnBuilder) {
    $scope.form = {
    };
    $scope.select = {};
    $scope.img = {};
    $scope.action = {};
    $scope.isShow = false;
    $scope.subTitle = '新增分类';
    var id = $location.$$search.id, info = $location.$$search.info ? JSON.parse($location.$$search.info) : '', parentId = $location.$$search.parentId, subName = $location.$$search.subname, form = $("#js_category_add_form");
    if(id){
        $scope.form.id = id;
        $("input[name='id']").val(id);
        $scope.subTitle = '修改分类';
    };
    if(parentId){
        $scope.form.parentId = parentId;
        $("#parentId").val(parentId);
    };
    if(subName){
        $scope.subName = subName;
    };
    if(subName == '问答'){
        $scope.isShow = true;
    };
    if(info){
        $scope.form.levelId = info.levelId || '';
        $scope.form.status = info.status;
        $scope.form.name = info.name;
        $scope.form.sortNum = info.sortNum;
        $scope.img.href = info.imageUrl || '';
    }else{
        $scope.form.status = 0
    };
    $timeout(function(){
        $("input[type=radio]").uniform();
    }, 0);
    $http({
        method: "POST",
        url: siteVar.serverUrl + "/xinghuocontent/toaddwebcms.shtml",
        data:{},
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
            'X-Requested-With' :'XMLHttpRequest'
        }
    }).success(function(data, status) {
        $scope.select.levelId = data.data.userlevels;



    }).error(function(data, status) {
        alert("获取广告信息失败，请与管理员联系。");
        return;
    });


    $scope.filerSource = function(e){
        return e.key != 4;
    };
    $scope.status = function(key){
        return $scope.form.status == key;
    };
    /**
     * 保存**/
    $scope.save = function(){
        var saveBtn = $("#saveBtn"), form = $("#js_category_add_form");
        if(!$scope.form.name){
            return alert("请输入分类标题！");
        };
        if(!tools.ajaxLocked(saveBtn)) return;
        //tools.ajaxForm({
        //    "ele": form,
        //    "action": siteVar.serverUrl + "/xinghuocategory/saveCategory.shtml",
        //    onComplete: function(data){
        //        tools.ajaxOpened(saveBtn);
        //        $("#js_dialog_progress").modal("hide");
        //        if(!tools.interceptor(data)) return;
        //        if(data.success){
        //            alert("保存成功！");
        //            $window.history.back();
        //        }else{
        //            alert("保存失败！")
        //        }
        //    }
        //});
        var data = new FormData(form[0]);
        $.ajax({
            url : siteVar.serverUrl + "/xinghuocategory/saveCategory.shtml",
            type:"POST",
            data : data,
            processData: false,
            contentType: false,
            success :function(data){
                if(typeof data == "string"){
                    var data = JSON.parse(data);
                };
                tools.ajaxOpened(saveBtn);
                $("#js_dialog_progress").modal("hide");
                // if(!tools.interceptor(data)) return;
                if(data.success){
                    alert("保存成功！");
                    $window.history.back();
                }else{
                    alert("保存失败！")
                }
            }

        });

    };
    $scope.cancel = function(){
        $window.history.back();
    };
}
