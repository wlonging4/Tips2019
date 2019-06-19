'use strict';
function editActivitiesParticipants($scope, $timeout, getSelectListFactory, getProListFactory, $q, $http, $modal, $location ) {
    var search = $location.$$search;
    $scope.pageTitle = "新建";
    if(!search.activityId){
        return alert("缺少活动ID")
    }
    if(search.edit){
        $scope.pageTitle = "编辑";
    }
    var form = angular.element("#ParticipantsForm"), timer;
    $scope.form = {
        activityId:search.activityId,
        whiteList:[],
        blackList:[]
    };
    $scope.select = {};
    var promise1 = getSelectListFactory.getSelectList(['manager_star_level', 'manager_level', 'autonomy', 'store_have_deal', 'lender_have_deal', 'activity_participate']),
        promise2 = $http({
            method: "POST",
            url: siteVar.serverUrl + "/xinghuoActivityManage/getActivityParticipate.json",
            data:$.param({activityId:search.activityId}),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                'X-Requested-With' :'XMLHttpRequest'
            }
        }),promise3 = getProListFactory.getUserLevel();
    $q.all([promise1, promise2, promise3]).then(function (data) {
        $scope.select.manager_star_level = data[0].appResData.retList[0].manager_star_level;
        $scope.select.autonomy = data[0].appResData.retList[2].autonomy;
        $scope.select.store_have_deal = data[0].appResData.retList[3].store_have_deal;
        $scope.select.lender_have_deal = data[0].appResData.retList[4].lender_have_deal;
        $scope.select.activity_participate = data[0].appResData.retList[5].activity_participate;

        var managerLevel = data[2].appResData.levellist, temp;
        //回显信息
        var info = data[1].data;
        if(!info.success) {
            return alert(info.msg);
        };
        $scope.form = $.extend({}, search, info.data);
        if(!info.data.participate){
            if($scope.form.activityMode == 3){
                $scope.form.participate = 2;
            }else{
                $scope.form.participate = 1
            }
        }

        temp = managerLevel.map(function (item, index) {
            var o = {};
            o.text = item.levelname;
            o.value = item.id + '';
            o.default = info.data.level && info.data.level.split(",").indexOf(o.value) > -1 ? true : false;//区分 1,2,3 和12,3
            return o;
        });
        $scope.$applyAsync(function () {
            $scope.form.autonomy = info.data.autonomy === null ? "" : ('' + info.data.autonomy);
            if($scope.form.activityMode == 3){
                $scope.form.autonomy = '0';
            }
            $scope.form.storeHaveDeal = info.data.storeHaveDeal === null ? "" : ('' + info.data.storeHaveDeal);
            $scope.form.lenderHaveDeal = info.data.lenderHaveDeal === null ? "" : ('' + info.data.lenderHaveDeal);
        });

        timer = $timeout(function () {
            $('#managerLevel').multiSel({
                name:"level",
                'data': temp,
                callbackChange:function (dom) {
                    var val = dom.val();
                    $scope.form.level = val;
                }
            });

            form.find("input[type='radio']").uniform();
            form.find("input[type='checkbox']").uniform();
            $timeout.cancel(timer);
        }, 0);
    });

    
    $scope.getStarLevel = function () {
        var temp = [];
        $scope.select.manager_star_level.forEach(function (item) {
            if(item.v){
                temp.push(item.v)
            }
        });
        $scope.form.starLevel = temp.toString()
    };
    
    $scope.lastStep = function () {
        var edit = '';
        if(search.edit){
            edit = '&edit=1'
        }
      return window.location.hash = "#/redEnvelopes-editActivitiesBasicInfo.html?activityId=" + search.activityId + edit;
    };
    $scope.save = function () {
        $http({
            method: "POST",
            url: siteVar.serverUrl + "/xinghuoActivityManage/create-second.json",
            data:$.param($scope.form),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                'X-Requested-With' :'XMLHttpRequest'
            }
        }).success(function (data) {
            if(!data.success){
                return alert(data.msg);
            }
            var edit = '';
            if(search.edit){
                edit = '&edit=1'
            }
            return window.location.hash = "/redEnvelopes-editActivitiesAssociated.html?activityId=" + search.activityId + edit;
        }).error(function (err) {
            return alert("提交信息失败！")
        })
    };



    $scope.changeDimension = function (val) {
        $scope.dimension = val;
        timer = $timeout(function () {
            form.find("input[type='radio']").uniform();
            form.find("input[type='checkbox']").uniform();
            $timeout.cancel(timer);
        }, 0);
    };




    
    function importCtrl($scope, $modalInstance, type, activityId, vm) {
        $scope.title = type == 1 ? "补充白名单" : "补充黑名单";
        $scope.type = type;

        $scope.activityId = activityId;
        $scope.showResult = false;
        $scope.close = function() {
            $modalInstance.close();
        };
        $scope.down = function (type) {
            $("#importForm").attr("action", siteVar.serverUrl + "/xinghuoActivityManage/downloadHitListTemplate.json")
                .submit();
        };
        $scope.save = function () {
            var data = new FormData($("#importForm")[0]);
            if(!$scope.importFile){
                return alert("请选择导入文件!")
            }
            $.ajax({
                url : siteVar.serverUrl + "/xinghuoActivityManage/importHitList.json",
                type:"POST",
                data : data,
                processData: false,
                contentType: false,
                dataType:"json",
                success :function(data){
                    if(!data.success){
                        return alert(data.msg);
                    }
                    $scope.$apply(function () {
                        $scope.showResult = true;
                        $scope.info = data.data;
                        if(data.data.sussesCount && data.data.sussesCount != 0){
                            var temp = {
                                activityId:data.data.activityId,
                                batchNo:data.data.batchNo
                            };
                            if(type == 1){
                                vm.form.whiteList.push(temp)
                            }
                            if(type == 2){
                                vm.form.blackList.push(temp)
                            }
                        }
                        $scope.title = data.data.msg;
                    })

                }

            });
        };
    }

    $scope.import = function (type) {
        $modal.open({
            backdrop: true,
            backdropClick: true,
            dialogFade: false,
            keyboard: true,
            templateUrl: 'importModal.html',
            controller: importCtrl,
            windowClass:'modal-640',
            resolve: {
                "type": function() {
                    return type;
                },
                "activityId": function () {
                    return search.activityId;
                },
                "vm":function () {
                    return $scope;
                }
            }
        });
    }
    
    $scope.deleteFile = function (activityId, batchNo, index, type) {
        var txt = "";
        if(type == 1){
            txt = "确认删除本批次白名单？"
        }
        if(type == 2){
            txt = "确认删除本批次黑名单？"
        }
        if(!confirm(txt)){
            return ;
        }
        $http({
            method: "POST",
            url: siteVar.serverUrl + "/xinghuoActivityManage/deleteHitList.json",
            data:$.param({
                activityId:activityId,
                batchNo:batchNo
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
            alert("删除成功！");
            if(type == 1){
                $scope.form.whiteList.splice(index, 1);
            }
            if(type == 2){
                $scope.form.blackList.splice(index, 1);
            }
        });
    };
    $scope.downloadFile = (function () {
        var form;
        return function (activityId, batchNo) {
            if(!form){
                form = $("<form action='" + siteVar.serverUrl + "/xinghuoActivityManage/downloadHitList.json' method='POST'></form>");
                var activityIdInput = $("<input name='activityId' value=''>"), batchNoInput = $("<input name='batchNo' value=''>");
                form.append(activityIdInput);
                form.append(batchNoInput);
                $('body').append(form);
            }
            form.find("input[name='activityId']").val(activityId);
            form.find("input[name='batchNo']").val(batchNo);
            form.submit();
        }
    })();
    // $scope.downloadFile(1,2)
}
