'use strict';
function dataMangageHWJController($scope,tools,$location,DTOptionsBuilder, DTColumnBuilder) {
    $scope.form={};
    if($location.url().indexOf("?") > -1){
        var urlStr = $location.url().split("?")[1];
        var urlObj = tools.serializeUrl(urlStr);
        if(!urlObj.subjectId){
            tools.interalert("参数非法");return;
        }
        $scope.form.subjectId=urlObj.subjectId;
        $scope.form.code=urlObj.code;
        $scope.form.name=urlObj.name;
    }else{
        tools.interalert("参数不存在");return;
    }
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder
        .newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/goodHopeSubjectData/tableSubjectdata.shtml',
            type: 'POST',
            data: {'subjectId':$scope.form.subjectId},
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
        DTColumnBuilder.newColumn('fileName').withTitle('文件名称').withOption('sWidth','50px'),
        DTColumnBuilder.newColumn('fileTypeStr').withTitle('文件类型').withOption('sWidth','50px'),
        DTColumnBuilder.newColumn('updateTime').withTitle('更新时间').withOption('sWidth','110px').renderWith(function(data, type, full) {
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('sort').withTitle('排序').withOption('sWidth','30px'),
        DTColumnBuilder.newColumn('id').withTitle('操作').withOption('sWidth','200px').renderWith(function(data,type,full){
            return '<a href="javascript:;" style="width: 100px;height: 30px;border-radius:5px!important;" class="btn btn-sm btn-primary editList" data-id="'+data+'">修改</a><a href="javascript:;" data-id="'+data+'"  style="width: 100px;height: 30px;background: #fff!important;border-radius:5px!important;border:1px solid #ccc;color:#000" class="btn btn-sm btn-primary deleteList">删除</a>';
        })
    ];

    function fnDrawCallback(){
        if(!tools.interceptor(window.ajaxDataInfo)) return;
        tools.resetWidth();

        //新增
        $('#addList').click(function () {
            $(this).attr('href','#/xinghuogoodhope-dataAdd.html?subjectId='+$scope.form.subjectId+'&code='+$scope.form.code+'&name='+$scope.form.name+'&fileType='+'1');
            //window.history.go(-1);
        });

        //编辑
        $('.editList').off('click').on('click',function () {
            var id=$(this).attr('data-id');
            $(this).attr('href','#/xinghuogoodhope-dataAdd.html?subjectId='+$scope.form.subjectId+'&id='+id+'&code='+$scope.form.code+'&name='+$scope.form.name);
            //window.history.go(-1);
        });

        //删除
        $("#dataTables tbody").on('click','.deleteList',function () {
            var nowId=$(this).attr('data-id');
            if(!window.confirm('确认要删除该文件吗?')){return;}
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + "/goodHopeSubjectData/delete.shtml",
                data: {'id':nowId},
                dataType: "text",
                success: function(data){
                    vm.dtInstance.rerender();
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });
        });
    }
}
