'use strict';
function activeSignupController($scope, tools, DTOptionsBuilder, DTColumnBuilder, EnumeratorCollection, $http, $modal) {
    $scope.form = {
        classId:17,
        applyTimeBegin: tools.toJSYMD(new Date().getTime() - 60*60*24*1000*30),
        applyTimeEnd:tools.toJSYMD(new Date().getTime())
    };
    $scope.select = {};
    /**
     * 分类下拉框
     * **/
    $http({
        method: "POST",
        url: G.server + "/class/childClassList.json",
        data:$.param({
            parentId:17
        }),
    }).then(function (data) {
        var info = data.data;
        if(!info.success) {
            return alert(info.msg);
        };
        $scope.select.childClassIdArr = info.data;

    });
    EnumeratorCollection.getSelectList('ActivityApplyStatusEnum').then(function (data) {
        $scope.select.statusList = data.data['ActivityApplyStatusEnum']
    });

    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder
        .newOptions().withOption('ajax',{
            url: G.server + '/activity/activityApplyList.json',
            type: 'POST',
            data: $scope.form
        })
        .withDataProp('data')
        .withOption('searching',false)
        .withOption('ordering',false)
        .withOption('serverSide',true)
        .withOption('processing',false)
        .withOption('scrollX',true)
        .withLanguage(tools.dataTablesLanguage)
        .withOption('fnDrawCallback',fnDrawCallback)
        .withPaginationType('simple_numbers');
    vm.dtColumns = [
        DTColumnBuilder.newColumn('applyId').withTitle('报名ID').withOption('sWidth','80px').renderWith(function(data, type, full) {
            return '<a class="detailInfo" data-id="' + data + '" href="javascript:void(0)">' + data + '</a>';
        }),
        DTColumnBuilder.newColumn('activityName').withTitle('活动名称').withOption('sWidth','160px').renderWith(function(data, type, full) {
            return '<span class="break-word">' + data + '</span>';
        }),
        DTColumnBuilder.newColumn('applyStatusDesc').withTitle('状态').withOption('sWidth','50px').renderWith(function(data, type, full) {
            return '<span class="status">' + data + '</span>';
        }),
        DTColumnBuilder.newColumn('activityStartTime').withTitle('活动时间').withOption('sWidth','270px').renderWith(function(data, type, full) {
            return tools.toJSDate(data) + ' 至 ' + tools.toJSDate(full.activityEndTime);
        }),
        DTColumnBuilder.newColumn('childClassName').withTitle('分类').withOption('sWidth','120px'),
        DTColumnBuilder.newColumn('applyName').withTitle('报名客户').withOption('sWidth','80px'),
        DTColumnBuilder.newColumn('applyMobile').withTitle('客户手机号').withOption('sWidth','100px'),
        DTColumnBuilder.newColumn('applyTime').withTitle('报名时间').withOption('sWidth','140px').renderWith(function(data, type, full) {
            return tools.toJSDate(data);
        }),

        DTColumnBuilder.newColumn('applyId').withTitle('操作').withOption('sWidth','80px').renderWith(function(data, type, full) {
            return '<a class="handle" data-id="' + data + '" data-status="' + full.applyStatus + '">更改状态</a>';
        })
    ];
    $scope.reset = function(){
        for(var prop in $scope.form){
            delete $scope.form[prop];
        }
        $scope.form.classId = 17;
        $scope.form.applyTimeBegin = tools.toJSYMD(new Date().getTime() - 60*60*24*1000*30);
        $scope.form.applyTimeEnd = tools.toJSYMD(new Date().getTime());
        vm.dtInstance.rerender();
    };
    $scope.search = function(){
        for(var prop in $scope.form){
            if(!$scope.form[prop]) delete $scope.form[prop];
        }
        var keysArr = Object.keys($scope.form);
        if(keysArr.length === 1 && keysArr[0] === 'classId'){
            return tools.interalert('查询条件不能为空!')
        }
        vm.dtInstance.rerender();
    };

    $scope.export = function (e) {
        var target = e.target, $target = $(target);
        tools.export($target)
    };
    function fnDrawCallback(){
        var table = $("#dataTables");

        table.off("click").on("click", ".detailInfo", function () {
            var applyId = $(this).attr("data-id");
            $http({
                method: "POST",
                url: G.server + "/activity/activityApplyDetail.json",
                data:$.param({
                    applyId:applyId
                }),
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
                    templateUrl : 'detailModal.html',
                    controller : detailCtrl,
                    resolve:{
                        info:function () {
                            return info.data
                        }
                    }
                });
            });

        });

        table.on("click", ".handle", function () {
            var self= $(this),
                tr = self.parents('tr'),
                applyId = $(this).attr("data-id"),
                applyStatus = $(this).attr("data-status"),
                modalInstance = $modal.open({
                    backdrop: true,
                    backdropClick: true,
                    dialogFade: false,
                    keyboard: true,
                    templateUrl : 'statusContent.html',
                    controller : statusCtrl,
                    windowClass:'modal-640',
                    resolve:{
                        select:function () {
                            return $scope.select
                        },
                        info:function () {
                            return {
                                applyId:applyId,
                                applyStatus:applyStatus
                            }
                        }
                    }
                });
            modalInstance.result.then(function (data) {
                if(data && data.applyStatus){
                    var applyStatus = data.applyStatus, len = $scope.select.statusList.length, txt = '';
                    for(var i = 0; i < len; i++){
                        var item = $scope.select.statusList[i];
                        if(item.key == applyStatus){
                            txt = item.value;
                            break;
                        }
                    }
                    tr.find(".status").html(txt);
                    self.attr("data-status", applyStatus)

                }
            })

        });
        function detailCtrl($scope, $modalInstance, info) {
            $scope.info = info;

            $scope.info.activityStartTime =  info.activityStartTime ? tools.toJSYMD(info.activityStartTime) : '';
            $scope.info.activityEndTime =  info.activityEndTime? tools.toJSYMD(info.activityEndTime) : '';
            $scope.info.applyTime =  info.applyTime ? tools.toJSDate(info.applyTime) : '';

            $scope.close = function() {
                $modalInstance.close();
            };
        }
        function statusCtrl($scope, $modalInstance, select, info, $http) {
            $scope.form = info;
            $scope.select = select;
            $scope.change = function () {
                if(!$scope.form.applyStatus){
                    return alert("请选择状态！");
                }
                $http({
                    method: "POST",
                    url: G.server + "/activity/changeApplyStatus.json",
                    data:$.param($scope.form)
                }).then(function (data) {
                    var detail = data.data;
                    if(detail.code === '0') {
                        return alert(detail.msg);
                    };
                    $modalInstance.close($scope.form);
                });
            };
            $scope.close = function() {
                $modalInstance.close();
            };
        }

    }
}
