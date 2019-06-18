'use strict';
function pushListController($scope,tools,DTOptionsBuilder, DTColumnBuilder,$location,$modal) {
    $scope.G=G;
    $scope.form = {
        isShow: ($("#js_form").find(".form-group").length>6) ? true : false
    };
    $scope.select = {};
    $scope.form.createTimeEnd=tools.toJSDate(Date.parse(new Date())).slice(0,10);
    $scope.form.createTimeBeg=tools.toJSDate(Date.parse(new Date())-30*3600*24*1000).slice(0,10);

    //下拉菜单查询消息类型0 推送状态
    $.ajax({
        url : G.server + '/enums/get.json',
        type:"get",
        data : {key:'12'},
        success :function(data){
            tools.ajaxOpened(self);
            if(!tools.interceptor(data)) return;
            if(data.success){
                $scope.$apply(function () {
                    $scope.select.sendStatus=data.data;
                });

            }else{
                tools.interalert(data.msg);
            }
        }
    });
    //下拉菜单查询消息类型0 消息行为
    $.ajax({
        url : G.server + '/enums/get.json',
        type:"get",
        data : {key:0},
        success :function(data){
            tools.ajaxOpened(self);
            if(!tools.interceptor(data)) return;
            if(data.success){
                $scope.$apply(function () {
                    $scope.select.type=data.data;
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
            url: G.server + '/messagePush/selectMessagePushByParam.json',
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
        DTColumnBuilder.newColumn('messagePushId').withTitle('推送ID').withOption('sWidth','40px').renderWith(function (data,type,full) {
            return data?'<a href="javascript:;" data-id="'+data+'" class="infoDetail">'+data+'</a>':'';
        }),
        DTColumnBuilder.newColumn('messageTitle').withTitle('推送标题').withOption('sWidth','210px'),
        DTColumnBuilder.newColumn('createTime').withTitle('创建时间').withOption('sWidth','130px').renderWith(function(data, type, full) {
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('userId').withTitle('合伙人ID').withOption('sWidth','110px').renderWith(function (data,type,full) {
            return data?'<a href="javascript:;" data-id="'+data+'" class="titleDetail">'+data+'</a>':'';
        }),
        DTColumnBuilder.newColumn('pushTime').withTitle('推送时间').withOption('sWidth','130px').renderWith(function(data, type, full) {
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('sendStatusStr').withTitle('推送状态').withOption('sWidth','60px'),
        DTColumnBuilder.newColumn('sendResult').withTitle('推送返回结果').withOption('sWidth','90px')
    ];
    $scope.reset = function(){
        for(var prop in $scope.form){
            delete $scope.form[prop];
        }
        vm.dtInstance.rerender();
    };
    $scope.search = function(){
        if(!$scope.form.createTimeBeg&&!$scope.form.createTimeEnd&&!$scope.form.messageTitle&&!$scope.form.sendStatus&&!$scope.form.type){return tools.interalert('查询条件不能为空!')}
        console.log(vm.dtInstance);
        vm.dtInstance.rerender();
    };
    function fnDrawCallback(data){
        if(!tools.interceptor(window.ajaxDataInfo)) return;
        tools.resetWidth();

        //合伙人详情
        $('.titleDetail').on('click',function () {
            var nowId=$(this).attr('data-id');
            $.ajax({
                url : G.server + '/user/getUserInfo.json',
                type:"POST",
                data : {userId:nowId},
                success :function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    if(data.success){
                        $modal.open({
                            backdrop: true,
                            backdropClick: true,
                            dialogFade: false,
                            keyboard: true,
                            templateUrl : 'partnerDetailCtrl.html',
                            controller : partnerDetailCtrl,
                            windowClass:'modal-320',
                            resolve: {
                                "info": function() {
                                    return data.data;
                                },
                                "G":function () {
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

        //关联合伙人详情弹窗
        function partnerDetailCtrl($scope,G,info,$modalInstance) {
            $scope.info={};
            $scope.G=G;
            $scope.info=info;
            $scope.close = function() {
                $modalInstance.close();
            };
        }

        //推送详情
        $('.infoDetail').on('click',function () {
            var nowId=$(this).attr('data-id');
            $.ajax({
                url : G.server + '/messagePush/selectMessagePushById.json',
                type:"POST",
                data : {messagePushId:nowId},
                success :function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    if(data.success){
                        $modal.open({
                            backdrop: true,
                            backdropClick: true,
                            dialogFade: false,
                            keyboard: true,
                            templateUrl : 'infoDetailCtrl.html',
                            controller : infoDetailCtrl,
                            windowClass:'modal-640',
                            resolve: {
                                "info": function() {
                                    return data.data;
                                }
                            }
                        });
                    }else{
                        tools.interalert(data.msg);
                    }
                }
            });
        });

        //推送详情弹窗
        function infoDetailCtrl($scope,info,$modalInstance) {
            $scope.form={};
            info.pushTime=tools.toJSDate(info.pushTime);
            $scope.form=info;
            $scope.close = function() {
                $modalInstance.close();
            };
        }

    }
}
