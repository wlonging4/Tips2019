'use strict';
function studioListController($scope,tools,DTOptionsBuilder, DTColumnBuilder,$location, $modal) {
    $scope.form = {
        startTime: tools.toJSYMD(new Date().getTime() - 60*60*24*1000*30),
        endTime:tools.toJSYMD(new Date().getTime())
    };

    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder
        .newOptions().withOption('ajax',{
            url: G.server + '/studio/getStudioList.json',
            type: 'POST',
            data: $scope.form
        })
        .withDataProp('data')
        .withOption('createdRow', function(row, data, dataIndex) {
            angular.element(row).addClass("rows"+data.id)
        })
        .withOption('searching',false)
        .withOption('ordering',false)
        .withOption('serverSide',true)
        .withOption('processing',false)
        .withOption('scrollX',true)
        .withLanguage(tools.dataTablesLanguage)
        .withOption('fnDrawCallback',fnDrawCallback)
        .withPaginationType('simple_numbers');
    vm.dtColumns = [
        DTColumnBuilder.newColumn('userId').withTitle('合伙人ID').withOption('sWidth','100px'),
        DTColumnBuilder.newColumn('realName').withTitle('合伙人姓名').withOption('sWidth','80px'),
        DTColumnBuilder.newColumn('mobile').withTitle('手机号').withOption('sWidth','100px'),
        DTColumnBuilder.newColumn('studioName').withTitle('工作室名称').withOption('sWidth','120px').renderWith(function(data, type, full) {
            return '<a class="detailInfo" data-info="' + encodeURIComponent(JSON.stringify(full)) + '" href="javascript:void(0)">' + data + '</a>';
        }),
        DTColumnBuilder.newColumn('documentNo').withTitle('证件号码').withOption('sWidth','140px'),
        DTColumnBuilder.newColumn('createTime').withTitle('申请时间').withOption('sWidth','140px').renderWith(function(data, type, full) {
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('recommUserId').withTitle('推荐人ID').withOption('sWidth','80px'),
        DTColumnBuilder.newColumn('updateTime').withTitle('审核时间').withOption('sWidth','140px').renderWith(function(data, type, full) {
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('advisorName').withTitle('顾问名称').withOption('sWidth','80px').renderWith(function(data, type, full) {
            return '<span class="adviser">' + (data || '') + '</span>';
        }),
        DTColumnBuilder.newColumn('auditStatusStr').withTitle('状态').withOption('sWidth','80px'),
        DTColumnBuilder.newColumn('sourceStr').withTitle('来源').withOption('sWidth','60px'),
        DTColumnBuilder.newColumn('studioId').withTitle('操作').withOption('sWidth','80px').renderWith(function(data, type, full) {
            return full.auditStatus == 1 ?'<a class="changeAdviser" data-info="' + encodeURIComponent(JSON.stringify(full)) + '" href="javascript:void(0)">更换顾问</a>' :'';
        })
    ];
    $scope.reset = function(){
        for(var prop in $scope.form){
            delete $scope.form[prop];
        }
        $scope.form.startTime = tools.toJSYMD(new Date().getTime() - 60*60*24*1000*30);
        $scope.form.endTime = tools.toJSYMD(new Date().getTime());
        vm.dtInstance.rerender();
    };
    $scope.search = function(){
        for(var prop in $scope.form){
            if(!$scope.form[prop]) delete $scope.form[prop];
        }
        var keysArr = Object.keys($scope.form);
        if(keysArr.length === 0){
            return tools.interalert('查询条件不能为空!')
        }
        vm.dtInstance.rerender();
    };
    function fnDrawCallback(){
        var table = $("#dataTables");

        /**
         * 工作室详情
         * **/
        table.off("click").on("click", ".detailInfo", function () {
            var info = $(this).attr("data-info");
            info = decodeURIComponent(info);
            info = JSON.parse(info);
            $modal.open({
                backdrop: true,
                backdropClick: true,
                dialogFade: false,
                keyboard: true,
                templateUrl : 'detailModal.html',
                controller : detailCtrl,
                resolve:{
                    info:function () {
                        return info
                    }
                }
            });
        });


        /**
         * 更换顾问
         * **/
        table.on("click", ".changeAdviser", function () {
            var self = $(this),
                info = $(this).attr("data-info");
            info = decodeURIComponent(info);
            info = JSON.parse(info);
            var modalInstance = $modal.open({
                backdrop: true,
                backdropClick: true,
                dialogFade: false,
                keyboard: true,
                templateUrl : 'adviserModal.html',
                controller : adviserCtrl,
                resolve:{
                    info:function () {
                        return info
                    }
                }
            });
            modalInstance.result.then(function (data) {
                if(data && data.advisorName){
                    self.parents('tr').find('.adviser').html(data.advisorName)
                }
            })
        });

    }
    //工作室详情的ctrl
    function detailCtrl($scope, $modalInstance, info) {
        $scope.info = info;
        $scope.info.createTime =  tools.toJSDate(info.createTime);
        $scope.info.updateTime =  tools.toJSDate(info.updateTime);
        $scope.close = function() {
            $modalInstance.close();
        };
    }
    function adviserCtrl($scope, $modalInstance, $http, info) {
        $scope.form = {};
        $scope.adviserList = [];
        $scope.selectedInfo = null;
        $scope.select = function (obj, domid) {
            var $target = $('#' + domid);
            if($target.prop("checked")){
                $scope.selectedInfo = obj;
            }
        };
        $scope.flag = false;
        $scope.search = function () {
            for(var prop in $scope.form){
                if(!$scope.form[prop]) delete $scope.form[prop];
            }
            var keysArr = Object.keys($scope.form);
            if(keysArr.length === 0){
                return tools.interalert('查询条件不能为空!')
            }
            $http({
                method: "POST",
                url: G.server + "/studio/getAdvisorList.json",
                data:$.param($scope.form),
            }).then(function (data) {
                var info = data.data;
                if(!info.success) {
                    return alert(info.msg);
                };
                $scope.flag = true;
                $scope.adviserList = info.data;
            });
        };
        $scope.confirm = function () {
            if($scope.selectedInfo){
                $http({
                    method: "POST",
                    url: G.server + "/studio/modifyStudioInfo.json",
                    data:$.param({
                        adviserId:$scope.selectedInfo.advisorId,
                        studioId:info.studioId,
                        auditStatus:info.auditStatus,
                    }),
                }).then(function (data) {
                    var info = data.data;
                    if(!info.success) {
                        return alert(info.msg);
                    };
                    $modalInstance.close($scope.selectedInfo);
                });
            }

        };
        $scope.close = function() {
            $modalInstance.close();
        };
    }
}
