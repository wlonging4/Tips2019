'use strict';
function posterManageController($scope,tools,$modal,DTOptionsBuilder, DTColumnBuilder) {
    $scope.G=G;
    $scope.select = {};
    $scope.form={};
    $scope.form.endTime=tools.toJSDate(Date.parse(new Date())).slice(0,10);
    $scope.form.startTime=tools.toJSDate(Date.parse(new Date())-30*3600*24*1000).slice(0,10);
    //查询二级分类
    $.ajax({
        url : G.server + '/class/getListByParentId.json',
        type:"POST",
        data : {parentId:'41'},
        success :function(data){
            tools.ajaxOpened(self);
            if(!tools.interceptor(data)) return;
            if(data.success){
                $scope.$applyAsync(function () {
                    $scope.select.childClassId=data.data;
                });
            }
        }
    });

    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder
        .newOptions().withOption('ajax',{
            url: G.server + '/poster/posterList.json',
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
        DTColumnBuilder.newColumn('posterId').withTitle('id').withOption('sWidth','40px'),
        DTColumnBuilder.newColumn('title').withTitle('标题').withOption('sWidth','280px').renderWith(function (data,type,full) {
            return '<a href="javascript:;" data-id="'+full.posterId+'" class="titleDetail">'+data+'</a>'
        }),
        DTColumnBuilder.newColumn('status').withTitle('状态').withOption('sWidth','40px').renderWith(function (data,type,full) {
            return data?'有效':'无效';
        }),
        DTColumnBuilder.newColumn('createTime').withTitle('发布时间').withOption('sWidth','120px').renderWith(function(data, type, full) {
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('className').withTitle('分类').withOption('sWidth','40px'),
        DTColumnBuilder.newColumn('childClassName').withTitle('二级分类').withOption('sWidth','60px'),
        DTColumnBuilder.newColumn('posterId').withTitle('操作').withOption('sWidth','90px').renderWith(function(data,type,full){
            return '<a href="#/posterEdit?posterId=' + data + '"  class="btn btn-sm btn-primary" >修改</a>' +
                '<a href="javascript:;" data-posterId="'+data+'" class="btn btn-sm btn-danger deletePoster">删除</a>';
        })
    ];
    function fnDrawCallback(data){
        if(!tools.interceptor(window.ajaxDataInfo)) return;
        tools.resetWidth();

        //删除海报
        $('.deletePoster').on('click',function () {
            var posterId=$(this).attr('data-posterId');
            if(window.confirm('是否要删除此条数据?')){
                $.ajax({
                    url : G.server + '/poster/deletePoster.json',
                    type:"POST",
                    data : {posterId:posterId},
                    success :function(data){
                        tools.ajaxOpened(self);
                        if(!tools.interceptor(data)) return;
                        if(data.success){
                            vm.dtInstance.rerender();
                        }
                    }
                });
            }
        });

        //海报详情
        $('.titleDetail').on('click',function () {
            var nowId=$(this).attr('data-id');
            $.ajax({
                url : G.server + '/poster/posterInfo.json',
                type:"POST",
                data : {posterId:nowId},
                success :function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    if(data.success){
                        $modal.open({
                            backdrop: true,
                            backdropClick: true,
                            dialogFade: false,
                            keyboard: true,
                            templateUrl : 'posterDetailCtrl.html',
                            controller : posterDetailCtrl,
                            windowClass:'modal-640',
                            resolve: {
                                "info": function() {
                                    return data.data;
                                },
                                "G": function() {
                                    return $scope.G;
                                }
                            }
                        });
                    }else{
                        tools.interalert(data.msg);
                    }
                }
            });
        });

        //关联详情弹窗
        function posterDetailCtrl($scope,info,$modalInstance,G) {
            $scope.form={};
            $scope.G=G;
            info.imagePathArr=[];
            info.imagePathObj=[];
            if(info.imagePath){
                info.imagePathArr=info.imagePath.split(',');
            }
            if(info.imagePathArr){
                for(var j=0;j<info.imagePathArr.length;j++){
                    info.imagePathObj.push({'imagePath':info.imagePathArr[j]})
                }
            }
            $scope.form=info;
            $scope.close = function() {
                $modalInstance.close();
            };
        }
        $scope.search=function () {
            if(!$scope.form.title&&!$scope.form.classId&&!$scope.form.startTime&&!$scope.form.endTime&&!$scope.form.status){return tools.interalert('查询条件不能为空!')}
            vm.dtInstance.rerender();
        }
    }
}
