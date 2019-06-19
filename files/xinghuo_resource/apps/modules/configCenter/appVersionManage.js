'use strict';
function appVersionManageController($scope,getSelectListFactory,$timeout,$location, $modal, tools,DTOptionsBuilder, DTColumnBuilder,$q){
    $scope.dictionaryTitle=['投资人App【安卓】','投资人App【IOS】','理财师App【安卓】','理财师App【IOS】'];
    $scope.form={};
    if($location.url().indexOf("?") > -1){
        var urlStr = $location.url().split("?")[1];
        var urlObj = tools.serializeUrl(urlStr);
        if(!urlObj.appType){
            tools.interalert("参数非法");return;
        }
        $scope.form.appType=urlObj.appType;
        $('#pageTitle').html($scope.dictionaryTitle[Number(urlObj.appType)-1]);
    }else{
        tools.interalert("参数不存在");return;
    }
    $scope.select = {};
    $scope.action = {};

    getSelectListFactory.getSelectList(['updatetypeenum']).then(function (res) {
        $scope.select.updatetypeenum = res.appResData.retList[0].updatetypeenum;
    });

    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder
        .newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/appversion/tableList.shtml',
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
        DTColumnBuilder.newColumn('versionNo').withTitle('版本号').withOption('sWidth','50px').notSortable().renderWith(function (data,type,full) {
            return '<a href="javascript:;" class="versionDetail" data-id="'+full.versionId+'">'+data+'</a>';
            //return data;
        }),
        DTColumnBuilder.newColumn('updateTypeStr').withTitle('更新类型').withOption('sWidth','60px').notSortable(),
        DTColumnBuilder.newColumn('updateDescList').withTitle('更新文案').withOption('sWidth','240px').notSortable().renderWith(function (data,type,full) {
            if(data){
                var nowStr='';
                for(var lis in data){
                    lis!=data.length?nowStr+=data[lis]+' ':nowStr+=data[lis];
                }
                return '<div style="position: relative;" title="'+nowStr+'" class="ui_ellipsis" ng-mouseover="nowI=0">'+data+'</div>';
            }else{
                return '';
            }

        }),

        DTColumnBuilder.newColumn('upDate').withTitle('启用时间').withOption('sWidth','150px').renderWith(function (data,type,full) {
            return data?tools.toJSDate(data):'';
            return data;
        }).notSortable(),
        DTColumnBuilder.newColumn('appPackageUrl').withTitle('APP地址').withOption('sWidth','320px').notSortable(),
        DTColumnBuilder.newColumn('statusStr').withTitle('状态').withOption('sWidth','40px').notSortable().renderWith(function(data,type,full){
            return data;
        }),
        DTColumnBuilder.newColumn('statusStr').withTitle('操作').withOption('sWidth','90px').renderWith(function (data,type,full) {
            var str='';
            if(full.status!=1){
                str+= '<a href="javascript:;" class="btn btn-danger btn-xs js_huodong_open" key_id="'+full.versionId+'" key_status="'+full.status+'">禁用</a>';
            }else{
                str+= '<a href="javascript:;" class="btn btn-success btn-xs js_huodong_open" key_id="'+full.versionId+'" key_status="'+full.status+'">启用</a>';
            }
            str += ' <a href="javascript:;" data-id="'+full.versionId+'" class="btn btn-warning btn-xs editAppVersion">编辑</a>';
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
        },
        add:function () {
            if($scope.form.appType==1||$scope.form.appType==3){
                location.href='#/xinghuosite-appVersionAndriod.html?appType='+$scope.form.appType;
            }
            if($scope.form.appType==2||$scope.form.appType==4){
                location.href='#/xinghuosite-appVersionIos.html?appType='+$scope.form.appType;
            }
        }
    };


    function fnDrawCallback(){
        tools.createModal();
        tools.createModalProgress();
        /**
         * [启用/禁用活动]
         * @param  {[type]}     [description]
         * @return {[type]}     [description]
         */
        $(".js_huodong_open").on("click", function(){
            //status：0启用,1禁用
            var data ={
                "id": $(this).attr("key_id"),
                "status": 1-$(this).attr("key_status")
            };
            var confirmStr='';
            data.status==0?confirmStr='确定启用状态':confirmStr='确定禁用状态';
            if(!window.confirm(confirmStr)){return false;}
            var self = this;
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + "/appversion/disable.json",
                data: data,
                dataType: "json",
                success: function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    vm.dtInstance.rerender();
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });
        });

        /**
         * [查看版本详情]
         * @param  {[type]}     [description]
         * @return {[type]}     [description]
         */
        $("#dataTables tbody").off('click').on("click", ".versionDetail", function(){
            var data ={"id": $(this).attr("data-id")};
            var self = $(this);
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + "/appversion/getById.json",
                data: data,
                dataType: "json",
                success: function(data){
                    tools.ajaxOpened(self);
                    if(data.success) {
                        var info = $.extend({}, data.data);
                        $modal.open({
                            backdrop: true,
                            backdropClick: true,
                            dialogFade: false,
                            keyboard: true,
                            templateUrl: 'appVersionManageModal.html',
                            controller: appVersionManageModal,
                            resolve: {
                                "info": function() {
                                    return info;
                                },
                                "appType":function () {
                                    return $scope.form.appType;
                                }
                            }
                        });
                    } else {
                        alert(data.msg);
                    }
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });

        });

        //编辑editAppVersion
        $('.editAppVersion').click(function () {
            var nowId=$(this).attr('data-id');
            if($scope.form.appType==1||$scope.form.appType==3){
                location.href='#/xinghuosite-appVersionAndriod.html?appType='+$scope.form.appType+'&id='+nowId;
            }
            if($scope.form.appType==2||$scope.form.appType==4){
                location.href='#/xinghuosite-appVersionIos.html?appType='+$scope.form.appType+'&id='+nowId;
            }
        });

        //详情
        function appVersionManageModal($scope,info,appType,tools,$modalInstance) {
            $scope.info=info;
            $scope.info.appType=appType;
            if(appType==1||appType==3){
                $scope.info.versionFlag=1;
            }
            if(appType==2||appType==4){
                $scope.info.versionFlag=2;
            }
            $scope.info.createTime=tools.toJSDate($scope.info.createTime);
            $scope.info.updateTime=tools.toJSDate($scope.info.updateTime);
            $scope.info.upDate=tools.toJSDate($scope.info.upDate);
            $scope.info.updateDescList2='';
            if($scope.info.updateDescList){
                for(var j=0;j<$scope.info.updateDescList.length;j++){
                    $scope.info.updateDescList2+=$scope.info.updateDescList[j]+' ';
                }
            }
            $scope.close = function() {
                $modalInstance.close();
            };
        }
    }
    (function(){
        $("[ui-view]").append("<style>table.dataTable,table.dataTable.no-footer {width: 100% !important;}</style>");
    })();

}