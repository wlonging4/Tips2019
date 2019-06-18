'use strict';
function studioAuditListController($scope, tools, DTOptionsBuilder, DTColumnBuilder, $location, $modal, $http, EnumeratorCollection) {
    $scope.form = {
        startTime: tools.toJSYMD(new Date().getTime() - 60*60*24*1000*30),
        endTime:tools.toJSYMD(new Date().getTime())
    };

    $scope.select = {};

    EnumeratorCollection.getSelectList('StudioAuditStatusEnum').then(function (data) {
        $scope.select = data.data;
    });

    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder
        .newOptions().withOption('ajax',{
            url: G.server + '/studio/getStudioAuditList.json',
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
        DTColumnBuilder.newColumn('studioName').withTitle('工作室名称').withOption('sWidth','120px'),
        DTColumnBuilder.newColumn('documentNo').withTitle('证件号码').withOption('sWidth','140px'),
        DTColumnBuilder.newColumn('createTime').withTitle('申请时间').withOption('sWidth','140px').renderWith(function(data, type, full) {
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('recommUserId').withTitle('推荐人ID').withOption('sWidth','80px'),
        DTColumnBuilder.newColumn('updateTime').withTitle('审核时间').withOption('sWidth','140px').renderWith(function(data, type, full) {
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('auditor').withTitle('审核人').withOption('sWidth','60px'),
        DTColumnBuilder.newColumn('auditStatusStr').withTitle('状态').withOption('sWidth','80px'),
        DTColumnBuilder.newColumn('sourceStr').withTitle('来源').withOption('sWidth','60px'),
        DTColumnBuilder.newColumn('studioId').withTitle('操作').withOption('sWidth','60px').renderWith(function(data, type, full) {
            return full.auditStatus === 0 ? '<a class="audit" data-info="' + encodeURIComponent(JSON.stringify(full)) + '" href="javascript:void(0)">审核</a>': '';
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
         * 审核
         * **/
        table.off("click").on("click", ".audit", function () {
            var info = $(this).attr("data-info");
            info = decodeURIComponent(info);
            info = JSON.parse(info);
            if(!$scope.select.suggestion){
                /**
                 * 枚举
                 * **/
                EnumeratorCollection.getSelectList('StudioAuditOpinionsEnum').then(function (data) {
                    $scope.select.suggestion = data.data['StudioAuditOpinionsEnum'];

                    $modal.open({
                        backdrop: true,
                        backdropClick: true,
                        dialogFade: false,
                        keyboard: true,
                        templateUrl : 'auditModal.html',
                        controller : auditCtrl,
                        resolve:{
                            info:function () {
                                return info
                            },
                            suggestion:function () {
                                return $scope.select.suggestion
                            }
                        }
                    });
                });

            }else{
                $modal.open({
                    backdrop: true,
                    backdropClick: true,
                    dialogFade: false,
                    keyboard: true,
                    templateUrl : 'auditModal.html',
                    controller : auditCtrl,
                    resolve:{
                        info:function () {
                            return info
                        },
                        suggestion:function () {
                            return $scope.select.suggestion
                        }
                    }
                });
            }

        });
    }



    function auditCtrl($scope, $modalInstance, $http, info, suggestion) {
        $scope.G = G;
        $scope.info = info;
        $scope.suggestion = suggestion;
        $scope.info.sexStr = info.sex === 0 ? '男':'女';
        $scope.info.documentTypeStr = info.documentType === 1 ? '身份证':'护照';
        $scope.info.createTimeStr = tools.toJSDate(info.createTime);
        $scope.info.lastLoginTimeStr = tools.toJSDate(info.lastLoginTime);
        $scope.form = {
            userId:info.userId,
            auditOpinion:'',
            adviserId:'',
            studioId:info.studioId,
            id:info.id,
            auditStatus:0
        }
        $scope.close = function() {
            $modalInstance.close();
        };
        $scope.selectSuggestion = function (txt) {
            $scope.form.auditOpinion = txt;
        };

        
        $scope.selectAdviser = function () {

            var modalInstance = $modal.open({
                backdrop: true,
                backdropClick: true,
                dialogFade: false,
                keyboard: true,
                templateUrl : 'adviserModal.html',
                controller : adviserCtrl
            });
            modalInstance.result.then(function (data) {
                if(data){
                    $scope.form.advisorName = data.advisorName;
                    $scope.form.adviserId = data.advisorId;
                }

            })
        };
        $scope.deleteAdviser = function () {
            $scope.form.advisorName = '';
            $scope.form.adviserId = '';
        };
        $scope.audit = function (type) {
            if(type === 1 && !$scope.form.adviserId){
                return alert("请选择合伙人顾问！");
            }
            if(type === 2 && $scope.form.adviserId){
                return alert("不能选择合伙人顾问！");
            }
            if(!$scope.form.auditOpinion){
                return alert("请填写审核意见！")
            }
            $scope.form.auditStatus = type;
            $scope.form.realName = $scope.info.realName;
            $http({
                method: "POST",
                url: G.server + "/studio/saveStudioAudit.json",
                data:$.param($scope.form),
            }).then(function (data) {
                $scope.close();
                var info = data.data;
                if(!info.success) {
                    return alert(info.msg);
                };

                vm.dtInstance.rerender();
            });
        };
    }

    function adviserCtrl($scope, $modalInstance, $http) {
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
                $modalInstance.close($scope.selectedInfo);
            }

        };
        $scope.cancel = function () {

        };
        $scope.close = function() {
            $modalInstance.close();
        };
    }

}
