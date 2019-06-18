'use strict';
function contentManageController($scope,tools,$modal,DTOptionsBuilder,$sce, DTColumnBuilder) {
    $scope.G=G;
    $scope.select = {};
    $scope.form={};
    $scope.form.endTime=tools.toJSDate(Date.parse(new Date())).slice(0,10);
    $scope.form.startTime=tools.toJSDate(Date.parse(new Date())-30*3600*24*1000).slice(0,10);
    //查询一级分类
    $.ajax({
        url : G.server + '/class/getListByParentId.json',
        type:"POST",
        data : {parentId:'0',type:1},
        success :function(data){
            tools.ajaxOpened(self);
            if(!tools.interceptor(data)) return;
            if(data.success){
                $scope.$applyAsync(function () {
                    $scope.select.classId=data.data;
                });
            }
        }
    });

    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder
        .newOptions().withOption('ajax',{
            url: G.server + '/content/contentList.json',
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
        DTColumnBuilder.newColumn('contentId').withTitle('内容Id').withOption('sWidth','40px'),
        DTColumnBuilder.newColumn('title').withTitle('标题').withOption('sWidth','250px').renderWith(function (data,type,full) {
            return '<a href="javascript:;" data-id="'+full.contentId+'" class="titleDetail">'+data+'</a>'
        }),
        DTColumnBuilder.newColumn('status').withTitle('状态').withOption('sWidth','40px').renderWith(function (data,type,full) {
            return data?'有效':'无效';
        }),
        DTColumnBuilder.newColumn('createTime').withTitle('发布时间').withOption('sWidth','120px').renderWith(function(data, type, full) {
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('className').withTitle('分类').withOption('sWidth','40px'),
        DTColumnBuilder.newColumn('childClassName').withTitle('二级分类').withOption('sWidth','60px'),
        DTColumnBuilder.newColumn('contentId').withTitle('操作').withOption('sWidth','130px').renderWith(function(data,type,full){
            var str='<a href="#/contentEdit?contentId=' + data + '"  class="btn btn-sm btn-primary" >修改</a>' +
                '<a href="javascript:;" data-contentId="'+data+'" class="btn btn-sm btn-danger deleteContent">删除</a>';
            if(full.contentType==1 && full.previewUrl){
                return str+'<a href="'+full.previewUrl+'" class="btn btn-success btn-sm previewUrl2" data-url="'+full.previewUrl+'" target="_blank" title="点击【F12+手机图标】  进行预览~" ng-click="action.preview()">预览</a>';
            }else{
                return str;
            }
        })
    ];
    function fnDrawCallback(data){
        if(!tools.interceptor(window.ajaxDataInfo)) return;
        tools.resetWidth();

        //删除内容
        $('.deleteContent').on('click',function () {
           var contentId=$(this).attr('data-contentId');
           if(window.confirm('是否要删除此条数据?')){
               $.ajax({
                   url : G.server + '/content/deleteContent.json',
                   type:"POST",
                   data : {contentId:contentId},
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

        //内容详情
        $('.titleDetail').on('click',function () {
            var nowId=$(this).attr('data-id');
            $.ajax({
                url : G.server + '/content/contentInfo.json',
                type:"POST",
                data : {contentId:nowId},
                success :function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    if(data.success){
                        $modal.open({
                            backdrop: true,
                            backdropClick: true,
                            dialogFade: false,
                            keyboard: true,
                            templateUrl : 'contentDetailCtrl.html',
                            controller : contentDetailCtrl,
                            windowClass:'modal-320',
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

        //预览内容
        $('.previewUrl').on('click',function () {
            var nowUrl=$(this).attr('data-url');
            //预览URL
            $modal.open({
                backdrop: true,
                backdropClick: true,
                dialogFade: false,
                keyboard: true,
                templateUrl : 'URLDetailCtrl.html',
                controller : URLDetailCtrl,
                windowClass:'modal-640',
                resolve: {
                    "Url": function() {
                        return nowUrl;
                    }
                }
            });
        });
        //预览URL弹窗
        function URLDetailCtrl($scope,Url,$sce,$modalInstance) {
            $scope.form={};
            $scope.form.UrlOpen=Url;
            if(!$scope.form.UrlOpen||$scope.form.UrlOpen=='null'){
                //默认预览地址
                $scope.form.UrlOpen=$sce.trustAsResourceUrl('http://10.143.143.191:9999/h5static/goodhope/articleDetails.html?type=share&contentId=1');
            }else{
                $scope.form.UrlOpen=$sce.trustAsResourceUrl($scope.form.UrlOpen);
            }
            $scope.close = function() {
                $modalInstance.close();
            };
        }

        //关联内容详情弹窗
        function contentDetailCtrl($scope,info,$modalInstance,G) {
            $scope.G=G;
            $scope.form={};
            $scope.form=info;
            $scope.form.previewUrl=$sce.trustAsResourceUrl($scope.form.previewUrl);
            $scope.close = function() {
                $modalInstance.close();
            };
        }
    }

    $scope.search=function () {
        if(!$scope.form.title&&!$scope.form.classId&&!$scope.form.startTime&&!$scope.form.endTime){return tools.interalert('查询条件不能为空!')}
        vm.dtInstance.rerender();
    }
}
