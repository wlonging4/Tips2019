'use strict';
function openClassController($scope,getSelectListFactory,$timeout, $modal, tools,DTOptionsBuilder, DTColumnBuilder,$q){
    $scope.form = {
        isShow: ($("#js_form").find(".form-group").length>6) ? true : false
    };
    $scope.select = {};
    $scope.action = {};

    /*
    * 获取课程状态
    * */
    var defer = $q.defer();
    $.ajax({
        url: siteVar.serverUrl+'/xinghuopageapi/getEnumValues.json',
        method: 'POST',
        data: {
            keyNames:"ClassTypeEnum",
            packageName:"com.creditease.xinghuo.service.openclass.api.enums"
        }
    }).then(function(data){
        defer.resolve(data);
        $timeout(function () {
            $scope.select.classType = data.data.ClassTypeEnum;
        },0);
    },function(error){
        defer.reject(error);
    });

    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder
        .newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/openclass/tableOpenClass.shtml',
            type: 'POST',
            data: $scope.form
        })
        .withDataProp('data')
        .withOption('searching',false)
        //设置是否排序
        .withOption('ordering',false)
        .withOption('serverSide',true)
        .withOption('processing',false)
        .withOption('scrollX',true)
        .withLanguage(tools.dataTablesLanguage)
        .withOption('createdRow', function(row, data, dataIndex) {
            angular.element(row).addClass("test"+data.id)
        })
        .withOption('fnDrawCallback',fnDrawCallback)
        .withPaginationType('full_numbers');
    //.withOption('order', [2, 'desc']);
    vm.dtColumns = [
        DTColumnBuilder.newColumn('title').withTitle('标题').withOption('sWidth','160px').notSortable().renderWith(function (data,type,full) {
            return '<a href="javascript:;" class="titleOpenClass ui_ellipsis"  keyId="'+full.classId+'">'+data+'</a>';
            //return data;
        }),
        DTColumnBuilder.newColumn('teacher').withTitle('讲师').withOption('sWidth','60px').notSortable(),
        DTColumnBuilder.newColumn('startTime').withTitle('开讲时间').withOption('sWidth','130px').notSortable(),
        DTColumnBuilder.newColumn('duration').withTitle('课件时长').withOption('sWidth','70px').notSortable(),
        DTColumnBuilder.newColumn('isTop').withTitle('是否置顶').withOption('sWidth','70px').notSortable().renderWith(function (data,type,full) {
            return data?'是':'否';
        }),
        DTColumnBuilder.newColumn('recommend').withTitle('推荐至首页').withOption('sWidth','75px').notSortable().renderWith(function (data,type,full) {
            return data?'是':'否';
        }),
        DTColumnBuilder.newColumn('classTypeStr').withTitle('课程状态').withOption('sWidth','70px').notSortable(),
        DTColumnBuilder.newColumn('status').withTitle('状态').withOption('sWidth','70px').notSortable().renderWith(function (data,type,full) {
            return data?'有效':'无效';
        }),
        DTColumnBuilder.newColumn('updateTime').withTitle('更新时间').withOption('sWidth','140px').notSortable().renderWith(function(data,type,full){
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('applyCount').withTitle('已预约人数').withOption('sWidth','90px').renderWith(function (data,type,full) {
            if(data=='undefined'||!Number(data)){return '0'}
            else{
                return '<a href="#/xinghuogoldrainbow-bookingManagement.html?bookingTitleFromOpenClass='+full.title+'" class="js_see_info" kye_sys="null" key="'+data+'" keyId="'+full.userid+'">'+data+'</a>';
            }
        }).notSortable(),
        DTColumnBuilder.newColumn('classId').withTitle('操作').withOption('sWidth','160px').renderWith(function (data,type,full) {
            var str='<a href="#/editOpenClass.html?classId='+full.classId+'" class="btn btn-primary btn-sm" style="    height: 22px;line-height: 14px;margin-right: 10px;" keyId="'+full.classId+'">修改</a>';
            if(full.classType && full.classType!=3){
                str+='<a href="javascript:void(0)" data-type="'+full.classType+'"  data-id="'+full.classId+'" class="changeStatus btn btn-sm btn-success" style="height: 22px;line-height: 14px;">更改课程状态</a>';
            }
            return str;
        }).notSortable()
    ];


    $scope.action = {
        reset: function(){
            for(var prop in $scope.form){
                if(prop !== 'isShow') delete $scope.form[prop];
            }
            vm.dtInstance.rerender();
        },
        search: function(){
            vm.dtInstance.rerender();
        }
    };


    function fnDrawCallback(){
        tools.createModal();
        tools.createModalProgress();
        //课程状态修改弹窗
        $("#dataTables tbody").on('click','.changeStatus',function () {
            var classType=$(this).attr('data-type');
            var classId=$(this).attr('data-id');
            var info = $.extend({}, {
                'classType':classType,
                'classId':classId
            });
            $modal.open({
                backdrop: true,
                backdropClick: true,
                dialogFade: false,
                keyboard: true,
                windowClass:'modal-640',
                templateUrl: 'changeStatus.html',
                controller: changeStatus,
                resolve: {
                    "info": function() {
                        return info;
                    }
                }
            });
        });
        //课程状态修改弹窗controller
        function changeStatus($scope,$modalInstance,info) {
            $scope.infoStatus=info;console.log($scope.infoStatus);
            $scope.infos={};
            $scope.infos.newStatus=$scope.infoStatus.classType;
            $scope.close = function() {
                $modalInstance.close();
            };
            $scope.ok=function () {
                var data=$.extend({},{
                    'classId':$scope.infoStatus.classId,
                    //'classType':$scope.infos.newStatus?$scope.infos.newStatus:$scope.infoStatus.classType
                    'classType':$scope.infos.newStatus
                });
                console.log(data);
                if(!data.classType){tools.interalert('请填写状态！');return;}
                $.ajax({
                    type: "post",
                    url: siteVar.serverUrl + '/openclass/updateClassType.shtml',
                    data: data,
                    success: function(data){
                        tools.ajaxOpened(self);
                        if(!tools.interceptor(data)) return;
                        tools.interalert('修改公开课状态成功！');
                        $modalInstance.close();
                        vm.dtInstance.rerender();
                    },
                    error: function(err){
                        tools.ajaxOpened(self);
                        tools.ajaxError(err);
                    }
                });
            }
        }
        //查看课程信息详情
        $("#dataTables tbody").on('click','.titleOpenClass',function () {
            var keyId=$(this).attr('keyId'),self=$(this);
            var data = $.extend({}, {
                'classId':keyId
            });
            if(!tools.ajaxLocked(self)) return;
            console.log(data);
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + '/openclass/getOpenClassById.shtml',
                data: data,
                success: function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    console.log(data.data);
                    $modal.open({
                        backdrop: true,
                        backdropClick: true,
                        dialogFade: false,
                        keyboard: true,
                        windowClass:'modal-320',
                        templateUrl: 'titleOpenClass.html',
                        controller: titleOpenClass,
                        resolve: {
                            "info": function() {
                                return data.data;
                            }
                        }
                    });
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });
        });
    }
    function titleOpenClass($scope,$modalInstance,info) {
        $scope.info=info;
        console.log($scope.info);
        $scope.close = function() {
            $modalInstance.close();
        };
    }

}