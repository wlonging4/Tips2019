'use strict';
function editActivitiesAssociated($scope, $http, $timeout, $modal, $location ) {
    var search = $location.$$search;
    $scope.pageTitle = "新建";
    if(!search.activityId){
        return alert("缺少活动ID")
    }
    if(search.edit){
        $scope.pageTitle = "编辑";
    }
    // $scope.pageTitle = "编辑";
    $scope.$on("getBasicInfo", function () {
        $http({
            method: "GET",
            url: siteVar.serverUrl + "/xinghuoActivityManage/getActivity.json?activityId=" + search.activityId,
            // data:$.param({activityId:search.activityId}),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                'X-Requested-With' :'XMLHttpRequest'
            }
        }).then(function (data) {
            var info = data.data;
            if(!info.success) {
                return alert(info.msg);
            };
            $scope.form = info.data;
        });
    });
    $scope.$on( "getList", function () {
        $http({
            method: "GET",
            url: siteVar.serverUrl + "/xinghuoActivityRedPacket/get.json?activityId=" + search.activityId,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                'X-Requested-With' :'XMLHttpRequest'
            }
        }).success(function(data, status) {
            if(!data.success) {
                alert(data.msg);
                return;
            };
            $scope.list = data.data;
        }).error(function(data, status) {
            alert("获取红包信息失败！");
            return;
        });
    });
    //初始化获取信息
    $scope.$emit("getBasicInfo");
    $scope.$emit("getList");

    $scope.delete = function (activityId, redTemplateId) {
        if(!window.confirm("确认删除当前红包？")){
            return;
        }
        $http({
            method: "POST",
            url: siteVar.serverUrl + "/xinghuoActivityRedPacket/delete.json",
            data:$.param({
                activityId:activityId,
                redTemplateId:redTemplateId
            }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                'X-Requested-With' :'XMLHttpRequest'
            }
        }).then(function (data) {
            var info = data.data;
            if(!info.success) {
                return alert(info.msg);
            };
            $scope.$emit("getList");
        })
    };
    

    $scope.lastStep = function () {
        var edit = '';
        if(search.edit){
            edit = '&edit=1'
        }
        return location.hash = "#/redEnvelopes-editActivitiesParticipants.html?activityId=" + search.activityId + edit;
    };

    //关联红包弹窗 start
    var associatedCtrl = function ($scope, $modalInstance, list, vm) {
        var temp = [];
        $scope.info = vm.form;
        $scope.list = list;
        $scope.form = {
            activityId : vm.form.activityId
        };
        $scope.isAdd = true;
        $scope.form.activityRepeatTimeRequstList = JSON.parse(JSON.stringify(temp));
        $scope.planItem = {
            effectiveStartTime:vm.form.activityEffectiveStartTime,
            effectiveEndTime:vm.form.activityEffectiveEndTime
        };
        $scope.add = function () {
            if(!$scope.isAdd){
                $scope.isAdd = true;
                $scope.planItem = {};
            }

        };
        $scope.delete = function (index) {
            $scope.form.activityRepeatTimeRequstList.splice(index, 1);
        };
        $scope.newPlan = function () {
            if(!$scope.planItem.effectiveStartTime || !$scope.planItem.effectiveEndTime || !$scope.planItem.redCount || !$scope.planItem.managerCanGetCount){
                return alert("输入框内容不能为空！")
            }
            if(new Date($scope.planItem.effectiveStartTime) - new Date() < 0){
                return alert("开始时间应大于当前时间！")
            }
            if(new Date($scope.planItem.effectiveStartTime) - new Date($scope.planItem.effectiveEndTime) > 0){
                return alert("开始时间应小于结束时间！")
            }
            if(Number($scope.planItem.managerCanGetCount) > Number($scope.planItem.redCount)){
                return alert("理财经理单次可抢数，应该小于等于本次可抢总数量")
            }
            var sum = 0;
            $scope.form.activityRepeatTimeRequstList.forEach(function (item) {
                sum += Number(item.managerCanGetCount)
            });

            if($scope.form.managerCanGetCount && (Number($scope.planItem.managerCanGetCount) > $scope.form.managerCanGetCount - sum)){
                return alert("理财经理单次可抢数之和，应小于理财经理可得数！")
            }

            $scope.form.activityRepeatTimeRequstList.push(JSON.parse(JSON.stringify($scope.planItem)));
            $scope.planItem = {};
            $scope.isAdd = false;
        };
        $scope.close = function() {
            $modalInstance.close();
        };
        $scope.save = function () {
            if(!$scope.form.redTemplateId){
                return alert("请选择需要关联的红包！");
            }
            if(($scope.info.activityMode != 3) && !$scope.form.managerCanGetCount){
                return alert("请输入理财经理可得数！");
            }
            if(($scope.info.activityMode == 2) && $scope.form.activityRepeatTimeRequstList.length === 0){
                return alert("请输入可抢红包计划！");
            }
            if(!$scope.form.lenderCanGetCount){
                return alert("请输入出借人可得数！");
            }
            $http({
                method: "POST",
                url: siteVar.serverUrl + "/xinghuoActivityRedPacket/create.json",
                data:$scope.form,
                headers: {
                    'Content-Type': 'application/json;charset=utf-8',
                    'X-Requested-With' :'XMLHttpRequest'
                }
            }).then(function (data) {
                var info = data.data;
                if(!info.success) {
                    return alert(info.msg);
                };
                alert("关联红包成功！");
                $scope.close();
                vm.$emit("getList");
            });
        };
        var timer = $timeout(function () {
            $(".form_exact_datetime").datetimepicker({
                isRTL: Metronic.isRTL(),
                format: "yyyy-mm-dd hh:ii:ss",
                autoclose: true,
                todayBtn: true,
                pickerPosition: (Metronic.isRTL() ? "bottom-right" : "bottom-left"),
                minuteStep: 1,
                language:"zh-CN"
            });
            $timeout.cancel(timer);
        }, 0)
    };
    $scope.associate = function () {
        $http({
            method: "POST",
            url: siteVar.serverUrl + "/xinghuoRedPacketTemplate/list.json",
            data:$.param({
                status:1,
                effectiveType:1,
                effectiveEndTime: $scope.form.activityEffectiveEndTime
            }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                'X-Requested-With' :'XMLHttpRequest'
            }
        }).then(function (data) {
            var info = data.data;
            if(!info.success) {
                return alert(info.msg);
            };
            $modal.open({
                backdrop: true,
                backdropClick: true,
                dialogFade: false,
                keyboard: true,
                templateUrl: 'associatedModal.html',
                controller: associatedCtrl,
                // windowClass:'modal-640',
                resolve: {
                    "list":function () {
                        return info.data
                    },
                    "vm":function () {
                        return $scope
                    }
                }
            });
        });
    };

    //关联红包弹窗 end

    $scope.save = function () {
        if($scope.list.length == 0){
            return alert("请关联红包！");
        }
        alert("提交成功");
        window.location.hash = "#/redEnvelopes-conventionalActivity.html";
    };
    //红包计划弹窗 start
    function infoCtrl($scope, $modalInstance, list) {
        $scope.list = list;
        $scope.close = function() {
            $modalInstance.close();
        };
    }
    $scope.showDetails = function (list) {
        $modal.open({
            backdrop: true,
            backdropClick: true,
            dialogFade: false,
            keyboard: true,
            templateUrl: 'infoModal.html',
            controller: infoCtrl,
            windowClass:'modal-640',
            resolve: {
                "list": function() {
                    return list;
                }
            }
        });
    }
    //红包计划弹窗 end
}
