'use strict';
function categoryList($scope, $http, getSelectListFactory, tools, DTOptionsBuilder, DTColumnBuilder) {


    $http({
        method: "POST",
        url: siteVar.serverUrl + "/xinghuopageapi/getcategList.json",
        data:{},
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
            'X-Requested-With' :'XMLHttpRequest'
        }
    }).success(function(data, status) {
        $scope.itmCategoryList = data.appResData.categoryList;
    }).error(function(data, status) {
        alert("获取分类列表失败，请与管理员联系。");
        return;
    });
}
