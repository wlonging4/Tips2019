'use strict';
function subjectController($scope,tools,DTOptionsBuilder, DTColumnBuilder) {
    $scope.form = {
        isShow: ($("#js_form").find(".form-group").length>6) ? true : false
    };
    $scope.select = {};
    $scope.pageNum=1;
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder
        .newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/xinghuogoodhope/tableSubject.shtml',
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
        DTColumnBuilder.newColumn('id').withTitle('ID').withOption('sWidth','30px'),
        DTColumnBuilder.newColumn('code').withTitle('项目编号').withOption('sWidth','60px'),
        DTColumnBuilder.newColumn('name').withTitle('项目名称').withOption('sWidth','280px'),
        DTColumnBuilder.newColumn('processtime').withTitle('处理时间').withOption('sWidth','140px').renderWith(function(data, type, full) {
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('proType').withTitle('分类').withOption('sWidth','60px'),
        DTColumnBuilder.newColumn('country').withTitle('移民地').withOption('sWidth','80px'),
        DTColumnBuilder.newColumn('saleStatus').withTitle('状态').withOption('sWidth','30px').renderWith(function(data, type, full) {
            switch(data){
                case 0:
                    return '<font>在售</font>';
                    break;
                case 1:
                    return '<font style="color:#999">停售</font>';
                    break;
                case 2:
                    return '<font style="color:#999">停售</font>';
                    break;
                default:
                    return '<font>在售</font>';
                    break;
            }
        }),
        DTColumnBuilder.newColumn('id').withTitle('操作').withOption('sWidth','200px').renderWith(function(data,type,full){
            var str='';
            //0,1在售需下架
            if(full.status!==2){
                str+='<a href="javascript:void(0)" data-subjectId='+data+' data-status='+full.status+' class="btn btn-sm btn-danger js-modify-goodHopeStatus">下架</a>'
            }else{
                str+='<a href="javascript:void(0)" data-subjectId='+data+' data-status='+full.status+' class="btn btn-sm btn-danger js-modify-goodHopeStatus">上架</a>';
            }
            //当渠道为全部或者理财师app时显示资料管理
            if((!full.channel&&full.channel!==null&&full.channel.toString()=='0')||full.channel==2){
                return str+='<a href="#/xinghuogoodhope-add.html?subjectId=' + data + '"  class="btn btn-sm btn-primary" >修改</a><a href="#/xinghuogoodhope-dataManage.html?subjectId=' + data + '&code='+full.code+'&name='+full.name+'"  class="btn btn-sm btn-primary" >资料管理</a>';
            }else{
                return str+='<a href="#/xinghuogoodhope-add.html?subjectId=' + data + '"  class="btn btn-sm btn-primary" >修改</a>';
            }
        })
    ];
    $scope.reset = function(){
        for(var prop in $scope.form){
            delete $scope.form[prop];
        }
        vm.dtInstance.rerender();
    };
    $scope.search = function(){
        for(var prop in $scope.form){
           if(!$scope.form[prop]) delete $scope.form[prop];
        }
        vm.dtInstance.rerender();
    };
    function fnDrawCallback(data){
        $scope.pageNum=data._iDisplayStart/data._iDisplayLength+1;
        console.log($scope.pageNum);
        if(!tools.interceptor(window.ajaxDataInfo)) return;
        tools.resetWidth();
        //status0和1上架或下架不可看 2下架状态
        $("#dataTables tbody").off('click').on("click",".js-modify-goodHopeStatus",function(){
            var subjectId = $(this).attr("data-subjectId");
            if(!subjectId || !$(this).attr("data-status")) return;
            var data = {
                "subjectId": subjectId,
                "status": (parseInt($(this).attr("data-status"))==2?0:2)
            };
            if(data.status==2){
                if(!window.confirm('确认下架？')){return;}
            }
            var self = this;
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + "/xinghuogoodhope/changeSubjectStatus.shtml",
                data: data,
                dataType: "text",
                success: function(data){
                    data=JSON.parse(data);
                    if(data.success){
                        tools.ajaxOpened(self);
                        if(!tools.interceptor(data)) return;
                        tools.interalert('修改状态成功');
                        //先刷新其他页面再刷新当前页才能trigger刷新
                        if($scope.pageNum&&$scope.pageNum==1){
                            vm.dtInstance.rerender();
                        }
                        if($scope.pageNum&&$scope.pageNum>1){
                            $('#redirect').val($scope.pageNum-1);
                            $('#pagination_btn_go').trigger('click');
                            $('#redirect').val($scope.pageNum);
                            $('#pagination_btn_go').trigger('click');
                            console.log('已修改状态且刷新页面')
                        }
                        //vm.dtInstance.rerender();
                    }else{
                        tools.interalert(data.msg);
                    }
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });
            return false;
        })


    }
    (function(){
        $("[ui-view]").append("<style>table.dataTable,table.dataTable.no-footer {width: 100% !important;}</style>");
    })();
}
