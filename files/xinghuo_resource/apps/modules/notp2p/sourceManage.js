'use strict';
function sourceManageController($scope,getSelectListFactory,$timeout,$http, $modal, tools,DTOptionsBuilder, DTColumnBuilder,$q){
    $scope.select = {};
    $scope.action = {};

    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder
        .newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/sesamesource/tableList.shtml',
            type: 'POST',
            data: {}
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
        DTColumnBuilder.newColumn('id').withTitle('编号').withOption('sWidth','150px').notSortable(),
        DTColumnBuilder.newColumn('name').withTitle('项目来源（交易所名称）').withOption('sWidth','280px').notSortable(),
        DTColumnBuilder.newColumn('createTime').withTitle('添加时间').withOption('sWidth','260px').notSortable().renderWith(function(data,type,full){
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('id').withTitle('操作').withOption('sWidth','200px').renderWith(function (data,type,full) {
            var str='<a href="javascript:;" class="btn btn-primary btn-sm editSource" style="height: 22px;line-height: 14px;margin-right: 10px;" data-name="'+full.name+'" data-id="'+full.id+'">修改</a>';
            return str;
        }).notSortable()
    ];

    //来源添加
    $(document).on('click','.addSource',function () {
        var info={};
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

    function fnDrawCallback(){
        tools.createModal();
        tools.createModalProgress();

        //来源修改
        $("#dataTables tbody").on('click','.editSource',function () {
            var sourceName=$(this).attr('data-name');
            var sourceId=$(this).attr('data-id');
            var info = $.extend({}, {
                'sourceName':sourceName,
                'sourceId':sourceId
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
    }

    //课程状态修改弹窗controller
    function changeStatus($scope,$modalInstance,info,$http) {
        $scope.close = function() {
            $modalInstance.close();
        };
        $scope.form=info;
        var jsonUrl;
        if(info.sourceName){
            $scope.form.sourceName=info.sourceName;
            $scope.form.id=info.sourceId;
            jsonUrl=siteVar.serverUrl + "/sesamesource/update.json";
        }else{
            jsonUrl=siteVar.serverUrl + "/sesamesource/create.json";
        }
        console.log($scope.form);
        $scope.ok=function () {
            var dataParam={};
            if(!$scope.form.sourceName){tools.interalert('请输入项目来源(交易所名称)');return;}
            if(info.sourceName){
                dataParam.id=$scope.form.id;
                dataParam.name=$scope.form.sourceName;
            }else{
                dataParam.name=$scope.form.sourceName;
            }

            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: jsonUrl,
                data: JSON.stringify(dataParam),
                contentType : "application/json",
                dataType:'json',
                success: function(res){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(res)) return;
                    if(dataParam.id){
                        tools.interalert('修改项目来源成功');
                    }else{
                        tools.interalert('添加项目来源成功');
                    }

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
}