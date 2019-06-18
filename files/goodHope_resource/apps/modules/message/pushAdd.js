'use strict';
function pushAddController($scope,$state,$timeout,$modal,tools,DTOptionsBuilder,DTColumnBuilder, $compile) {
    $scope.form = {};
    $scope.form.scope=1;
    $scope.select = {};
    $scope.list={};
    $scope.list.choose=[];
    var listArr=[];

    $timeout(function () {
        $('input[type="radio"]').uniform();
    });
    //添加消息用户
    $scope.$on('modifyArr',function (){
        $scope.list.choose=listArr;
        $scope.form.userIdList='';
        for(var p=0;p<$scope.list.choose.length;p++){
            $scope.form.userIdList+=$scope.list.choose[p].id+',';
        }
        $scope.form.userIdList=$scope.form.userIdList.slice(0,-1);
    });
    //删除当前列表
    $(document).on('click','.deleteData',function () {
        var nowId=$(this).attr('data-id');
        $scope.list.choose.forEach(function (i,inx) {
            if(i.id == nowId){
                $scope.list.choose.splice(inx,1);
                $scope.$emit('modifyArr');
                return;
            }
        });
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

    $scope.save = function () {
        if(!$scope.form.messageTitle){
            tools.interalert("请填写推送标题！");return;
        }
        if(!$scope.form.type){
            tools.interalert("请选择推送类型！");return;
        }
        if(!$scope.form.scope){
            tools.interalert("请选择推送范围！");return;
        }

        if($scope.form.scope==2 && !$scope.form.userIdList){
            tools.interalert("请选择发送接收人！");return;
        }
        if($scope.form.pushTime){
            if(Number(new Date($scope.form.pushTime))<Number(new Date)){
                tools.interalert("推送时间不能小于当前时间！");return;
            }
        }
        if(!$scope.form.content){
            tools.interalert("请填写推送内容！");return;
        }

        if($scope.form.scope==1){
            if(!window.confirm('确定发布推送给所有合伙人！')){
                return;
            }
        }
        $.ajax({
            url : G.server + '/messagePush/saveMessagePush.json',
            type:"POST",
            data : $scope.form,
            success :function(data){
                tools.ajaxOpened(self);
                if(!tools.interceptor(data)) return;
                if(data.success){
                    tools.interalert('发布推送成功!');
                    $state.go('pushList');
                }else{
                    tools.interalert(data.msg);
                }
            }
        });
    };

    //合伙人搜索
    $('#openModal').on('click',function () {
        $modal.open({
            backdrop: true,
            backdropClick: true,
            dialogFade: false,
            keyboard: true,
            templateUrl : 'partnerChooseCtrl.html',
            controller : partnerChooseCtrl,
            windowClass:'modal-320',
            resolve: {
                "scp":function () {
                    return $scope
                }
            }
        });
    });

    //合伙人搜索弹窗
    function partnerChooseCtrl($scope,$modalInstance,tools,DTOptionsBuilder,DTColumnBuilder,scp, $timeout) {
        $scope.form={};
        $scope.vm = {};
        $scope.vm.dtInstance = {};
        $scope.vm.dtOptions = DTOptionsBuilder
            .newOptions().withOption('ajax',{
                url: G.server + '/user/queryUserBrieflyByParam.json',
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
        $scope.vm.dtColumns = [
            DTColumnBuilder.newColumn('userId').withTitle('').withOption('sWidth','60px').renderWith(function (data,type,full) {
                return '<input type="checkbox" class="choosePartner" data-id="'+full.userId+'" data-name="'+full.realName+'">';
            }),
            DTColumnBuilder.newColumn('realName').withTitle('合伙人').withOption('sWidth','120px'),
            DTColumnBuilder.newColumn('userId').withTitle('合伙人ID').withOption('sWidth','120px'),
            DTColumnBuilder.newColumn('mobile').withTitle('手机号').withOption('sWidth','120px')
        ];
        $scope.search = function() {
            if(!$scope.form.realName&&!$scope.form.mobile){
                return tools.interalert('查询条件不能为空!');
            }
            $scope.vm.dtInstance.rerender();
        };
        $scope.close = function() {
            $modalInstance.close();
        };
        $scope.submit = function() {
            $modalInstance.close();
            listArr=listArr.concat(submitCheckedInfo);
            //去重
            var newListArr=[];
            if(listArr.length){
                newListArr = [listArr[0]];
                for(var i = 1; i < listArr.length; i++){
                    var item = listArr[i];
                    var repeat = false;
                    for (var j = 0; j < newListArr.length; j++) {
                        if (item.id == newListArr[j].id) {
                            repeat = true;
                            break;
                        }
                    }
                    if (!repeat) {
                        if(newListArr.length>=10){
                            tools.interalert('个人推送最多可添加10人');
                        }else{
                            newListArr.push(item);
                        }
                    }
                }
            }
            listArr=newListArr;
            scp.$emit('modifyArr');
        };
        var submitCheckedInfo=[];
        function fnDrawCallback(){
            if(!tools.interceptor(window.ajaxDataInfo)) return;
            tools.resetWidth();

            //单选
            $('#dataTables .choosePartner').on('click',function () {
                submitCheckedInfo=[];
                $('#dataTables .choosePartner').each(function (i) {
                    //并且id不能为空
                    if($(this).is(':checked')&& $(this).attr('data-id') && $(this).attr('data-id')!='null'){
                        submitCheckedInfo.push({'id':$(this).attr('data-id'),'name':$(this).attr('data-name')!='null'?$(this).attr('data-name'):''});
                    }
                });
            });
            //换页之后清空全选列表
            $('.dataTables_paginate').on('click','.paginate_button',function () {
                submitCheckedInfo=[];
                $('.choosePartner').each(function (i) {
                    $(this).removeProp('checked');
                })
            });
        }
    }
}
