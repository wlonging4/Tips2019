'use strict';
function classifyManageController($scope,tools,DTOptionsBuilder,$modal,$timeout, DTColumnBuilder) {
    $scope.select = {};
    $scope.form = {};
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder
        .newOptions().withOption('ajax',{
            url: G.server + '/class/classList.json',
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
        DTColumnBuilder.newColumn('name').withTitle('分类标题').withOption('sWidth','100px'),
        DTColumnBuilder.newColumn('childClassCount').withTitle('分类数量').withOption('sWidth','60px'),
        DTColumnBuilder.newColumn('updateTime').withTitle('修改时间').withOption('sWidth','60px').renderWith(function(data, type, full) {
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('classId').withTitle('操作').withOption('sWidth','100px').renderWith(function(data,type,full){
            return '<a style="line-height: 1.2" href="#/classifyManageSecond?parentId=' + data + '&namePrimary='+full.name+'"  class="btn btn-sm btn-primary" >查看</a><a style="line-height: 1.2" data-namePrimary="'+full.name+'" data-id="'+full.classId+'"  href="javascript:;"  class="btn btn-sm btn-primary addClassifySecond" >新增二级分类</a>';
        })
    ];
    function fnDrawCallback(data){
        if(!tools.interceptor(window.ajaxDataInfo)) return;
        tools.resetWidth();

        //打开二级弹窗-列表页操作
        $('.addClassifySecond').on('click',function () {
            var info={};
            info.namePrimary=$(this).attr('data-namePrimary');
            info.parentId=$(this).attr('data-id');
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

    $(document).on("keyup", ".js_validator_int", function() {
        var str = this.value.replace(/\D/g, "");
        this.value = str;
    });


    //打开一级弹窗
    $('.addClassify').on('click',function () {
        $modal.open({
            backdrop: true,
            backdropClick: true,
            dialogFade: false,
            keyboard: true,
            templateUrl : 'addClassifyCtrl.html',
            controller : addClassifyCtrl,
            windowClass:'modal-640',
            resolve: {
                "info": function() {
                    return '';
                }
            }
        });
    });

    //关联一级弹窗
    function addClassifyCtrl($scope,info,$modalInstance,$timeout) {
        $timeout(function () {
            $('input[type="radio"]').uniform()
        });
        $scope.form={
            status:1
        };
        $scope.close = function() {
            $modalInstance.close();
        };
        $scope.add=function () {
            if(!$scope.form.name){tools.interalert("请填写一级分类名称！");return;}
            if(!$scope.form.status){tools.interalert("请选择分类状态！");return;}
            if(!$scope.form.priority){tools.interalert("请填写序号！");return;}

            $.ajax({
                url : G.server + '/class/saveClass.json',
                type:"POST",
                data : $scope.form,
                success :function(data){
                    if(typeof data == "string"){
                        var data = JSON.parse(data);
                    }
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    if(data.success){
                        tools.interalert("添加一级分类成功！");
                        $modalInstance.close();
                        vm.dtInstance.rerender();
                    }
                }
            });
        }
    }



    //关联二级弹窗
    function addClassifySecondCtrl($scope,info,$modalInstance,$timeout) {
        $scope.close = function() {
            $modalInstance.close();
        };
        $scope.form=info;
        $scope.form.status=1;
        $timeout(function () {
            $('input[type="radio"]').uniform()
        });
        $scope.add=function () {
            if(!$scope.form.name){tools.interalert("请填写二分类名称！");return;}
            if(!$scope.form.status){tools.interalert("请选择分类状态！");return;}
            if(!$scope.form.priority){tools.interalert("请填写序号！");return;}

            $.ajax({
                url : G.server + '/class/saveClass.json',
                type:"POST",
                data : $scope.form,
                success :function(data){
                    if(typeof data == "string"){
                        var data = JSON.parse(data);
                    }
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    if(data.success){
                        tools.interalert("添加二级分类成功！");
                        $modalInstance.close();
                    }
                }
            });
        }
    }
}
