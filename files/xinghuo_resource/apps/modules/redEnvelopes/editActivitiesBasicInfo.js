'use strict';
function editActivitiesBasicInfo($scope, $timeout, $q, getSelectListFactory, $modal, $location, $http) {
    $scope.form = {
        activityMode:1
    };
    $scope.select = {};
    $scope.pageTitle = "新建";
    $scope.btnTxt = "下一步：配置参与对象";

    var search = $location.$$search;
    if(search.edit){
        $scope.pageTitle = "编辑";
    }
    var promise1 = getSelectListFactory.getSelectList(['routine_activity_mode']), promiseList = [promise1];
    if(search.activityId){
        var promise2 = $http({
                method: "GET",
                url: siteVar.serverUrl + "/xinghuoActivityManage/getActivity.json?activityId=" + search.activityId,
                // data:$.param({activityId:search.activityId}),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                    'X-Requested-With' :'XMLHttpRequest'
                }
            });
        promiseList.push(promise2)
    }
    $q.all(promiseList).then(function (data){
            if(data[1]){
                $scope.$applyAsync(function () {
                    var info = data[1].data;
                    if(!info.success) {
                        return alert(info.msg);
                    };
                    $scope.form = info.data;
                    if(info.data.activityStatus == 2){
                        $scope.btnTxt = "提交"
                    }
                });
            }

        $scope.select.activity_mode = data[0].appResData.retList[0].routine_activity_mode;
    });

    $scope.save = function () {
        if(!$scope.form.activityMode){
            return alert("请选择活动方式！");
        }
        if(!$scope.form.activityName){
            return alert("请输入活动名称！");
        }
        if(!$scope.form.activityEffectiveStartTime || !$scope.form.activityEffectiveEndTime){
            return alert("请完善活动有效期");
        }
        if(new Date($scope.form.activityEffectiveEndTime) - new Date($scope.form.activityEffectiveStartTime) < 0 ){
            return alert("有效期结束时间应大于开始时间！");
        }
        var reqData = $.param($scope.form);
        var url = "/xinghuoActivityManage/create-first.json";//新建的时候的接口
        if(search.activityId){
            url = "/xinghuoActivityManage/edit.json";
        }
        $http({
            method: "POST",
            url: siteVar.serverUrl + url,
            data:reqData,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                'X-Requested-With' :'XMLHttpRequest'
            }
        }).success(function(data, status) {
            if(!data.success) {
                return alert(data.msg);
            };
            if($scope.form.activityStatus == 2){
                return location.hash = "#/redEnvelopes-conventionalActivity.html";
            }
            var edit = '';
            if(search.edit){
                edit = '&edit=1'
            }
            if(search.activityId){
                return location.hash = "#/redEnvelopes-editActivitiesParticipants.html?activityId=" + search.activityId + edit;
            }
            return location.hash = "#/redEnvelopes-editActivitiesParticipants.html?activityId=" + data.data.activityId + edit;

        }).error(function(data, status) {
            alert("提交活动基本信息失败！");
            return;
        });
    }
    $timeout(function () {
        $(".form_exact_datetime").datetimepicker({
            isRTL: Metronic.isRTL(),
            format: "yyyy-mm-dd hh:ii:ss",
            autoclose: true,
            todayBtn: true,
            pickerPosition: (Metronic.isRTL() ? "bottom-right" : "bottom-left"),
            minuteStep: 1,
            minView:0,
            language:"zh-CN"
        })
    }, 0);
}
