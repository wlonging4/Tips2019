'use strict';
function conventionalActivity($scope, $http, $modal, getSelectListFactory, tools, DTOptionsBuilder, DTColumnBuilder) {
    var domForm = $("#js_form"), conditionItem = domForm.find(".form-group");
    $scope.form = {
        isShow: (conditionItem.length > 1) ? true : false
    };
    $scope.select = {};
    $scope.action = {};
    getSelectListFactory.getSelectList(['routine_activity_mode', 'new_activity_status']).then(function(data){
        $scope.select.activity_mode = data.appResData.retList[0].routine_activity_mode;
        $scope.select.new_activity_status = data.appResData.retList[1].new_activity_status;
    });

    /*
     创建表格选项
     */
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/xinghuoActivityManage/list.json',
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
        DTColumnBuilder.newColumn('activityModeStr').withTitle('活动方式').withOption('sWidth', '130px'),
        DTColumnBuilder.newColumn('activityName').withTitle('活动名称').withOption('sWidth','110px').renderWith(function(data, type, full) {
            if(!data) return "";
            return '<a href="javascript:void(0);" class="infoDetail" data-activityId="' + full.activityId + '">' + data + '</a>';
        }),
        DTColumnBuilder.newColumn('activityEffectiveStartTime').withTitle('活动有效期').withOption('sWidth','160px').renderWith(function(data, type, full) {
            if(!data) return "";
            return data + " ~ " + full.activityEffectiveEndTime;
        }),
        DTColumnBuilder.newColumn('redCount').withTitle('关联红包').withOption('sWidth', '100px').renderWith(function(data, type, full) {
            return '<a href="javascript:void(0)" class="associated" data-activityId="' + full.activityId + '" data-activityMode="' + full.activityMode + '">' + data + '</a>'
        }),
        DTColumnBuilder.newColumn('startTime').withTitle('活动（启用/禁用）时间').withOption('sWidth','140px'),
        DTColumnBuilder.newColumn('statusStr').withTitle('活动状态').withOption('sWidth', '90px'),
        DTColumnBuilder.newColumn('status').withTitle('操作').withOption('sWidth','180px').renderWith(function(data, type, full) {
            var html = '';
            if(data == 1){
                html += '<a href="javascript:void(0)" class="btn btn-danger btn-xs startUp" data-activityId="' + full.activityId + '" style="margin: 0 5px;">启用</a>';
                html += '<a href="#/redEnvelopes-editActivitiesBasicInfo.html?activityId=' + full.activityId + '&edit=1"  class="btn btn-success btn-xs" style="margin: 0 5px;">编辑</a></td>';
            }
            if(data == 2){
                html += '<a href="javascript:void(0)" class="btn btn-danger btn-xs stopOff" data-activityMode="' + full.activityMode + '" data-activityId="' + full.activityId + '" style="margin: 0 5px;">禁用</a>';
                html += '<a href="javascript:void(0)" class="btn btn-primary btn-xs importFile" data-activityId="' + full.activityId + '" style="margin: 0 5px;">补充白名单</a>';
                html += '<a href="#/redEnvelopes-editActivitiesBasicInfo.html?activityId=' + full.activityId + '&edit=1" class="btn btn-success btn-xs" style="margin: 0 5px;">编辑</a></td>';
            }
            return html;
        })
    ];
    $scope.action.reset = function(){
        for(var prop in $scope.form){
            if(prop !== 'isShow') delete $scope.form[prop];
        };
        vm.dtInstance.rerender();
    };
    $scope.action.search = function(){
        vm.dtInstance.rerender();
    };
    function infoCtrl($scope, $modalInstance, activityId, isChangeStatus, vm) {
        $scope.current = 1;
        $scope.cacheInfo = {};//属性 basicInfo，participate，associated
        $scope.isChangeStatus = isChangeStatus;
        $scope.activityId = activityId;
        $scope.changeInfo = {
            1:function () {
                $scope.title = "第一步：请确认-活动基本信息";
            },
            2:function () {
                $scope.title = "第二步：请确认-活动参与对象";
            },
            3:function () {
                $scope.title = "第三步：请确认-活动关联红包";
            }
        };
        $scope.getInfo = {
            1:function () {
                if(!$scope.cacheInfo.basicInfo){
                    $http({
                        method: "GET",
                        url: siteVar.serverUrl + "/xinghuoActivityManage/getActivity.json?activityId=" + activityId,
                        // data:$.param({activityId:activityId}),
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                            'X-Requested-With' :'XMLHttpRequest'
                        }
                    }).then(function (data) {
                        var info = data.data;
                        if(!info.success) {
                            return alert(info.msg);
                        };
                        $scope.cacheInfo.basicInfo = info.data;
                        if(!$scope.isChangeStatus){
                            $scope.title = "【" + $scope.cacheInfo.basicInfo.activityModeStr + "】" + $scope.cacheInfo.basicInfo.activityName + "-详情页";
                        }
                    });
                }
            },
            2:function () {
                if(!$scope.cacheInfo.participate){
                    $http({
                        method: "POST",
                        url: siteVar.serverUrl + "/xinghuoActivityManage/getActivityParticipate.json",
                        data:$.param({activityId: activityId}),
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                            'X-Requested-With' :'XMLHttpRequest'
                        }
                    }).then(function (data) {
                        var info = data.data;
                        if(!info.success) {
                            return alert(info.msg);
                        };
                        $scope.cacheInfo.participate = info.data;
                    })
                }
            },
            3:function () {
                if(!$scope.cacheInfo.associated){
                    $http({
                        method: "GET",
                        url: siteVar.serverUrl + "/xinghuoActivityRedPacket/get.json?activityId=" + activityId,
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                            'X-Requested-With' :'XMLHttpRequest'
                        }
                    }).success(function(data, status) {
                        if(!data.success) {
                            alert(data.msg);
                            return;
                        };
                        $scope.cacheInfo.associated = data.data;
                    }).error(function(data, status) {
                        alert("获取红包信息失败！");
                        return;
                    });
                }

            }
        };
        if($scope.isChangeStatus){
            $scope.changeInfo[1]();
        }
        $scope.getInfo[1]();


        $scope.changeTab = function (current) {
            $scope.current = current;
            $scope.getInfo[current]()
            if($scope.isChangeStatus){
                $scope.changeInfo[current]();
            }

        };
        $scope.showDetails = function (list) {
            $scope.associatedInfo = list;
        };
        $scope.close = function() {
            $modalInstance.close('sjdkjklsjaklk');
        };

        $scope.save = function () {
            // $modalInstance.close("qidong");
            var confirmModal = $modal.open({
                backdrop: true,
                backdropClick: true,
                dialogFade: false,
                keyboard: true,
                templateUrl: 'confirmModal.html',
                controller: confirmCtrl,
                windowClass:'modal-640',
                resolve: {
                    "activityId": function () {
                        return activityId;
                    },
                    "activityMode":function () {
                        return $scope.cacheInfo.basicInfo.activityMode
                    },
                    "vm": function () {
                        return vm
                    }
                }
            });
            confirmModal.result.then(function (data) {
                if(data === 'success'){
                    $scope.close();
                }
            })
            
        };
    }

    function confirmCtrl($scope, $modalInstance, activityId, activityMode, vm) {
        $scope.close = function() {
            $modalInstance.close();
        };
        var flag = true;
        $scope.ok = function () {
            var url = "/xinghuoActivityManage/doStartActivity.json";
            if(activityMode == 3){
                url = "/xinghuoActivityManage/doStartUserActivity.json";
            }
            if(flag){
                flag = false;
                $http({
                    method: "POST",
                    url: siteVar.serverUrl + url,
                    data:$.param({activityId: activityId}),
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                        'X-Requested-With' :'XMLHttpRequest'
                    }
                }).then(function (data) {
                    flag = true;
                    var info = data.data;
                    if(!info.success) {
                        return alert(info.msg);
                    };
                    alert("启动成功");
                    $modalInstance.close('success');
                    vm.dtInstance.rerender();
                }).catch(function (err) {
                    flag = true;
                    console.log(err)
                })
            }

        }
    }
    function associatedCtrl($scope, $modalInstance, data, activityMode) {
        $scope.data = data;
        $scope.activityMode = activityMode;
        $scope.showFlag = true;
        $scope.close = function() {
            $modalInstance.close();
        };
        $scope.showDetails = function (e, item, data) {
            data.forEach(function (i) {
                i.showList = false;
            });
            item.showList = true;
            e.stopPropagation();
        }
        $scope.closeList = function (data) {
            if(data && data.length > 0){
                data.forEach(function (i) {
                    i.showList = false;
                });
            }
        }
    }
    function importCtrl($scope, $modalInstance, type, activityId) {
        $scope.title = "补充白名单";
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
                        $scope.title = data.data.msg;
                    })

                }

            });
        };
    }

    function fnDrawCallback(){
        tools.createModal();
        tools.createModalProgress();
        var popUpLayer = $("#js_dialog"), popUpLayerContent = popUpLayer.find(".js_content");

        $(document).on("click", ".export", function(){
            tools.export(this);
        });

        var table = $("#dataTables"), tbody = table.find("tbody");
        table.off("click").on("click", ".infoDetail", function(){
            var self = $(this), activityId = self.attr("data-activityId");
            $modal.open({
                backdrop: true,
                backdropClick: true,
                dialogFade: false,
                keyboard: true,
                templateUrl: 'infoModal.html',
                controller: infoCtrl,
                // windowClass:'modal-640',
                resolve: {
                    "activityId": function () {
                        return activityId;
                    },
                    "isChangeStatus":function () {
                        return false;
                    },
                    "vm":function () {
                        return vm;
                    }
                }
            });

        });
        table.on("click", ".associated", function(){
            var self = $(this), activityId = self.attr("data-activityId"), activityMode = self.attr("data-activityMode");
            $http({
                method: "GET",
                url: siteVar.serverUrl + "/xinghuoActivityRedPacket/getList.json?activityId=" + activityId,
                data:$.param({activityId: activityId}),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                    'X-Requested-With' :'XMLHttpRequest'
                }
            }).then(function (data) {
                var info = data.data;
                if(!info.success) {
                    return alert(info.msg);
                };
                info.data.forEach(function (item, index) {
                    item.createTime = tools.toJSDate(item.createTime);
                    item.effectiveEndTime = tools.toJSDate(item.effectiveEndTime);
                    item.effectiveStartTime = tools.toJSDate(item.effectiveStartTime);

                    item.redAmount = (item.redAmount === null) ? null : tools.formatNumber(item.redAmount || 0);
                    item.redCount = (item.redCount === null) ? null : tools.formatNumber(item.redCount || 0);
                    item.fullCutAmount = (item.fullCutAmount === null) ? null : tools.formatNumber(item.fullCutAmount || 0);
                    item.redUseCount = (item.redUseCount === null) ? null : tools.formatNumber(item.redUseCount || 0);
                    item.redRemainCount = (item.redRemainCount === null) ? null : tools.formatNumber(item.redRemainCount || 0);
                });

                $modal.open({
                    backdrop: true,
                    backdropClick: true,
                    dialogFade: false,
                    keyboard: true,
                    templateUrl: 'associatedModal.html',
                    controller: associatedCtrl,
                    // windowClass:'modal-640',
                    resolve: {
                        "data": function () {
                            return info.data;
                        },
                        "activityMode": function () {
                            return activityMode;
                        }
                    }
                });
            })


        });
        table.on("click", ".startUp", function(){
            var self = $(this), activityId = self.attr("data-activityId");
            $modal.open({
                backdrop: true,
                backdropClick: true,
                dialogFade: false,
                keyboard: true,
                templateUrl: 'infoModal.html',
                controller: infoCtrl,
                // windowClass:'modal-640',
                resolve: {
                    "activityId": function () {
                        return activityId;
                    },
                    "isChangeStatus":function () {
                        return true;
                    },
                    "vm":function () {
                        return vm;
                    }
                }
            });
        });
        table.on("click", ".stopOff", function(){
            if(!window.confirm("禁止该活动？")){
                return ;
            }
            var self = $(this), activityId = self.attr("data-activityId"), activityMode = self.attr("data-activityMode");
            var url = "/xinghuoActivityManage/doStopActivity.json";
            if(activityMode == 3){
                url = "/xinghuoActivityManage/doStopUserActivity.json";
            }
            $http({
                method: "POST",
                url: siteVar.serverUrl + url,
                data:$.param({activityId: activityId}),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                    'X-Requested-With' :'XMLHttpRequest'
                }
            }).then(function (data) {
                var info = data.data;
                if(!info.success) {
                    return alert(info.msg);
                };
                alert("禁止活动成功");
                vm.dtInstance.rerender();
            })
        });
        table.on("click", ".importFile", function(){
            var activityId = $(this).attr("data-activityId");
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
                        return 3;
                    },
                    "activityId": function () {
                        return activityId;
                    }
                }
            });
        });

    }
}
