'use strict';
function adManageController($scope,tools,DTOptionsBuilder,$modal, DTColumnBuilder,$location) {
    $scope.G=G;
    $scope.form = {
        isShow: ($("#js_form").find(".form-group").length>6) ? true : false,
        //默认搜索有效的广告
        status:1
    };
    $scope.form.endTime=tools.toJSDate(Date.parse(new Date())).slice(0,10);
    $scope.form.startTime=tools.toJSDate(Date.parse(new Date())-30*3600*24*1000).slice(0,10);

    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder
        .newOptions().withOption('ajax',{
            url: G.server + '/banner/bannerList.json',
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
        DTColumnBuilder.newColumn('name').withTitle('广告名称').withOption('sWidth','140px').renderWith(function (data,type,full) {
            return '<a href="javascript:;" class="adName" data-id="'+full.bannerId+'">'+data+'</a>';
        }),
        DTColumnBuilder.newColumn('linkUrl').withTitle('广告URL').withOption('sWidth','300px'),
        DTColumnBuilder.newColumn('status').withTitle('状态').withOption('sWidth','40px').renderWith(function (data,type,full) {
            return data?'有效':'无效';
        }),
        DTColumnBuilder.newColumn('createTime').withTitle('上传时间').withOption('sWidth','130px'),
        DTColumnBuilder.newColumn('updateTime').withTitle('修改时间').withOption('sWidth','130px').renderWith(function(data, type, full) {
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('layout').withTitle('版位').withOption('sWidth','40px').renderWith(function (data,type,full) {
            if(data == 1){return '首页'}else{return ''}
        }),
        DTColumnBuilder.newColumn('bannerId').withTitle('操作').withOption('sWidth','40px').renderWith(function(data,type,full){
            return '<a style="line-height: 1.2" href="#/adEdit?bannerId=' + data + '&name='+full.name+'"  class="btn btn-sm btn-primary" >修改</a>';
        })
    ];
    $scope.reset = function(){
        for(var prop in $scope.form){
            delete $scope.form[prop];
        }
        vm.dtInstance.rerender();
    };
    $scope.search = function(){
        if(!$scope.form.name&&!$scope.form.status&&!$scope.form.startTime&&!$scope.form.endTime){return tools.interalert('查询条件不能为空!')}
        vm.dtInstance.rerender();
    };
    function fnDrawCallback(data){
        if(!tools.interceptor(window.ajaxDataInfo)) return;
        tools.resetWidth();


        $('.adName').on('click',function () {
            var nowId=$(this).attr('data-id');
            $.ajax({
                url : G.server + '/banner/bannerInfo.json',
                type:"POST",
                data : {bannerId:nowId},
                success :function(data){
                    if(typeof data == "string"){
                        var data = JSON.parse(data);
                    }
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    if(data.success){
                        $modal.open({
                            backdrop: true,
                            backdropClick: true,
                            dialogFade: false,
                            keyboard: true,
                            templateUrl : 'adDetailCtrl.html',
                            controller : adDetailCtrl,
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

        //关联弹窗
        function adDetailCtrl($scope,info,$modalInstance,G) {
            $scope.info=info;
            $scope.G=G;
            $scope.close = function() {
                $modalInstance.close();
            };
        }
    }
}
