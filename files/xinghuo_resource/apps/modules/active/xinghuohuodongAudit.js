'use strict';
function xinghuohuodongAuditController($scope,getSelectListFactory,tools,DTOptionsBuilder, DTColumnBuilder) {
    $scope.form = {
        isShow: ($("#js_form").find(".form-group").length>6) ? true : false,
    };
    $scope.select = {};
    $scope.action = {};
    /*
     获取枚举类型
     */
    var selectList = getSelectListFactory.getSelectList(['auditstatus']);
    selectList.then(function(data){
        $scope.select.applystatus = data.appResData.retList[0].auditstatus;
    });
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder
        .newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/xinghuohuodong/huodongaudittable.shtml',
            type: 'POST',
            data: $scope.form
        })
        .withDataProp('data')
        .withOption('searching',false)
        .withOption('ordering',false)
        .withOption('serverSide',true)
        .withOption('processing',false)
        .withOption('scrollX',false)
        .withLanguage(tools.dataTablesLanguage)
        .withOption('createdRow', function(row, data, dataIndex) {
            angular.element(row).addClass("test"+data.id)
        })
        .withOption('fnDrawCallback',fnDrawCallback)
        .withPaginationType('full_numbers');
    vm.dtColumns = [
        DTColumnBuilder.newColumn('applyuserid').withTitle('申请人').withOption('sWidth','80px'),
        DTColumnBuilder.newColumn('activityname').withTitle('活动名称').withOption('sWidth','130px').renderWith(function(data,type,full){
            if(!data) return "";
            return '<span class="ui_ellipsis" style="width: 130px;" title="'+data+'">'+data+'</span>';
        }),
        DTColumnBuilder.newColumn('totalnumber').withTitle('总数量').withOption('sWidth','70px'),
        DTColumnBuilder.newColumn('sendtotalnumber').withTitle('已申请数量').withOption('sWidth','80px'),
        DTColumnBuilder.newColumn('applynum').withTitle('申请数量').withOption('sWidth','60px'),
        DTColumnBuilder.newColumn('applynum').withTitle('通过申请').withOption('sWidth','60px'),
        DTColumnBuilder.newColumn('applytime').withTitle('申请时间').withOption('sWidth','120px').renderWith(function(data,type,full){
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('applytime').withTitle('审核时间').withOption('sWidth','120px').renderWith(function(data,type,full){
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('applyuserid').withTitle('操作').withOption('sWidth','100px').renderWith(function(data,type,full){
            return '<a href="javascript:;" class="js_activityAudit_info" key_prizeapplyid="'+full.prizeapplyid+'">查看审核详情</a>';
        })
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
    }
    function fnDrawCallback(){
        if(!tools.interceptor(window.ajaxDataInfo)) return;
        tools.createModal();
        tools.createModalProgress();
        $("#dataTables tbody").on("click", ".js_activityAudit_info", function(){
            var data = {
                "prizeapplyid": $(this).attr("key_prizeapplyid")
            }
            var self = this;
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + "/xinghuohuodong/huodongauditdetail.shtml",
                data: data,
                dataType: "text",
                success: function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    $("#js_dialog .js_content").html(data);
                    $("#js_dialog").modal("show");
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });
        });
    }
    (function(){
        $("[ui-view]").append("<style>table.dataTable,table.dataTable.no-footer {width: 100% !important;}</style>");
    })();
}