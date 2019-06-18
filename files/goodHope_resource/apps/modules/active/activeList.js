'use strict';
function activeListController($scope, tools, DTOptionsBuilder, DTColumnBuilder, $location, $http, EnumeratorCollection, $modal) {
    $scope.form = {
        classId:17,
        activityStartTimeBegin: tools.toJSYMD(new Date().getTime() - 60*60*24*1000*30),
        activityStartTimeEnd:tools.toJSYMD(new Date().getTime())
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
    EnumeratorCollection.getSelectList('ActivityStatusEnum').then(function (data) {
        $scope.select.statusList = data.data['ActivityStatusEnum']
    });

    //产品分类
    $http({
        method: "POST",
        url: G.server + "/class/getListByParentId.json",
        data:$.param({
            parentId:0,
            type:0
        }),
    }).then(function (data) {
        var info = data.data;
        if(!info.success) {
            return alert(info.msg);
        };
        $scope.select.activityProductClassId = info.data;
    });
    //活动区域
    $.ajax({
        url : G.server + '/enums/get.json',
        type:"get",
        data : {key:16},
        success :function(data){
            if(!tools.interceptor(data)) return;
            if(data.success){
                $scope.$apply(function () {
                    $scope.select.activityAreasId=data.data;
                });
            }else{
                tools.interalert(data.msg);
            }
        }
    });
    //是否线上活动
    $.ajax({
        url : G.server + '/enums/get.json',
        type:"get",
        data : {key:17},
        success :function(data){
            if(!tools.interceptor(data)) return;
            if(data.success){
                $scope.$apply(function () {
                    $scope.select.onlineType=data.data;
                });
            }else{
                tools.interalert(data.msg);
            }
        }
    });


    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder
        .newOptions().withOption('ajax',{
            url: G.server + '/activity/activityList.json',
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
        DTColumnBuilder.newColumn('activityId').withTitle('活动ID').withOption('sWidth','45px'),
        DTColumnBuilder.newColumn('activityName').withTitle('活动名称').withOption('sWidth','160px').renderWith(function(data, type, full) {
            return '<a class="detailInfo break-word" data-id="' + full.activityId + '" href="javascript:void(0)">' + data + '</a>';
        }),
        DTColumnBuilder.newColumn('statusDesc').withTitle('状态').withOption('sWidth','30px').renderWith(function(data, type, full) {
            return '<span class="status">' + data + '</span>';
        }),
        DTColumnBuilder.newColumn('activityStartTime').withTitle('活动时间').withOption('sWidth','290px').renderWith(function(data, type, full) {
            return tools.toJSDate(data) + ' 至 ' + tools.toJSDate(full.activityEndTime);
        }),
        DTColumnBuilder.newColumn('childClassName').withTitle('分类').withOption('sWidth','80px'),

        DTColumnBuilder.newColumn('createTime').withTitle('发布日期').withOption('sWidth','150px').renderWith(function(data, type, full) {
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('activityAreasName').withTitle('活动区域').withOption('sWidth','80px'),
        DTColumnBuilder.newColumn('activityProductClassName').withTitle('产品分类').withOption('sWidth','80px'),
        DTColumnBuilder.newColumn('onlineTypeDesc').withTitle('是否线上活动').withOption('sWidth','80px'),
        DTColumnBuilder.newColumn('activityId').withTitle('操作').withOption('sWidth','60px').renderWith(function(data, type, full) {
            var str = full.status === 0 ? '启用':'禁用';
            return '<a class="handle" data-id="' + data + '" data-status="' + full.status + '">' + str + '</a> <a href="#/activeAdd?activityId=' + data + '">编辑</a>';
        })
    ];
    $scope.reset = function(){
        for(var prop in $scope.form){
            delete $scope.form[prop];
        }
        $scope.form.classId = 17;
        $scope.form.activityStartTimeBegin = tools.toJSYMD(new Date().getTime() - 60*60*24*1000*30);
        $scope.form.activityStartTimeEnd = tools.toJSYMD(new Date().getTime());
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
    function fnDrawCallback(){
        var table = $("#dataTables");
        table.off("click").on("click", ".detailInfo", function () {
            var activityId = $(this).attr("data-id");
            $http({
                method: "POST",
                url: G.server + "/activity/activityDetail.json",
                data:$.param({
                    activityId:activityId
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
            var self = $(this),
                tr = self.parents('tr'),
                id = self.attr("data-id"),
                status = self.attr("data-status");

            $.ajax({
                url:G.server + "/activity/changeStatus.json",
                method:"POST",
                data:{
                    activityId:id,
                    status:status === '0'? '1':'0'
                },
                dataType:"json",
                success:function (res) {
                    if(!res.success){
                        alert(res.msg);
                    }
                    console.log(tr.find(".status"))
                    var newStatusStr = status === '0'? '有效':'无效',
                        newTxt = status === '0'? '禁用':'启用',
                        newStatus = status === '0'? '1':'0';
                    tr.find(".status").html(newStatusStr);
                    self.html(newTxt).attr("data-status", newStatus);
                }
            })

        });

        function detailCtrl($scope, $modalInstance, info) {
            $scope.info = info;
            $scope.G = G;
            $scope.info.activityStartTime =  info.activityStartTime ? tools.toJSYMD(info.activityStartTime) : '';
            $scope.info.activityEndTime =  info.activityEndTime? tools.toJSYMD(info.activityEndTime) : '';
            $scope.info.applyTime =  info.applyTime ? tools.toJSDate(info.applyTime) : '';

            $scope.close = function() {
                $modalInstance.close();
            };
        }

    }
}
