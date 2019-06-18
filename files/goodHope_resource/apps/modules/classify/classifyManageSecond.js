'use strict';
function classifyManageSecondController($scope,tools,$location,$timeout,DTOptionsBuilder,$modal,DTColumnBuilder) {
    $scope.select = {};
    $scope.form={};
    var bannerId = $location.$$search.parentId;
    var namePrimary = $location.$$search.namePrimary;
    if(bannerId){
        $scope.form.parentId=bannerId;
        $scope.form.namePrimary=namePrimary;
    }else{
        tools.interalert('一级分类参数缺失！');return;
    }

    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder
        .newOptions().withOption('ajax',{
            url: G.server + '/class/childClassList.json',
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
        DTColumnBuilder.newColumn('classId').withTitle('分类ID').withOption('sWidth','40px'),
        DTColumnBuilder.newColumn('name').withTitle('分类标题').withOption('sWidth','120px'),
        DTColumnBuilder.newColumn('status').withTitle('状态').withOption('sWidth','40px').renderWith(function (data,type,full) {
            return data?'有效':'无效';
        }),
        DTColumnBuilder.newColumn('updateTime').withTitle('修改时间').withOption('sWidth','120px').renderWith(function(data, type, full) {
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('priority').withTitle('序号').withOption('sWidth','40px'),
        DTColumnBuilder.newColumn('classId').withTitle('操作').withOption('sWidth','150px').renderWith(function(data,type,full){
            return '<a data-classId="'+data+'" data-namePrimary="'+namePrimary+'" data-name="'+full.name+'" data-status="'+full.status+'" data-priority="'+full.priority+'" href="javascript:;" class="btn btn-sm btn-primary modifyClassifySecond">修改</a>';
        })
    ];
    function fnDrawCallback(data){
        if(!tools.interceptor(window.ajaxDataInfo)) return;
        tools.resetWidth();

        //编辑打开二级弹窗
        $('.modifyClassifySecond').on('click',function () {
            var info=$(this).data();
            $modal.open({
                backdrop: true,
                backdropClick: true,
                dialogFade: false,
                keyboard: true,
                templateUrl : 'addClassifySecondCtrl.html',
                controller : addClassifySecondCtrl,
                windowClass:'modal-640',
                resolve: {
                    "info": function() {
                        return info;
                    }
                }
            });
        });
    }

    //新增打开二级弹窗
    $('.addClassifySecond').on('click',function () {
        $modal.open({
            backdrop: true,
            backdropClick: true,
            dialogFade: false,
            keyboard: true,
            templateUrl : 'addClassifySecondCtrl.html',
            controller : addClassifySecondCtrl,
            windowClass:'modal-640',
            resolve: {
                "info": function() {
                    return $scope.form;
                }
            }
        });
    });

    //关联二级弹窗
    function addClassifySecondCtrl($scope,info,$timeout,$modalInstance) {
        $scope.form=info;
        var url;
        //判断是编辑还是新增
        if(!info.classid){
            $scope.form.status='1';
            url='/class/saveClass.json';
        }else{
            $scope.form.classId=info.classid;
            $scope.form.status=info.status;
            $scope.form.namePrimary=info.nameprimary;
            $timeout(function () {
                $('input[type="radio"]').uniform();
            });
            url='/class/updateClass.json';
        }
        $timeout(function () {
            $('input[type="radio"]').uniform()
        });
        $scope.close = function() {
            $modalInstance.close();
        };

        $scope.add=function () {
            if(!$scope.form.name){tools.interalert("请填写二分类名称！");return;}
            if(!($scope.form.status.toString())){tools.interalert("请选择分类状态！");return;}
            if(!$scope.form.priority){tools.interalert("请填写序号！");return;}

            $.ajax({
                url : G.server + url,
                type:"POST",
                data : $scope.form,
                success :function(data){
                    if(typeof data == "string"){
                        var data = JSON.parse(data);
                    }
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    if(data.success){
                        if($scope.form.classId){
                            tools.interalert("编辑二级分类成功！");
                        }else{
                            tools.interalert("添加二级分类成功！");
                        }
                        $modalInstance.close();
                        vm.dtInstance.rerender();
                    }
                }
            });
        }
    }
}
