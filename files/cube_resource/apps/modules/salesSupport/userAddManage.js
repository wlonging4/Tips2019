'use strict';
function userAddManageController($scope,getSelectListFactory,$timeout,$location, $modal, tools,DTOptionsBuilder, DTColumnBuilder,$q){
    $scope.form = {
        isShow: ($("#js_form").find(".form-group").length>6) ? true : false
    };
    $scope.select = {};
    $scope.action = {};

    //解析跳转过来的页面
    if($location.url().indexOf("?") > -1){
        var urlStr = $location.url().split("?")[1];
        var urlObj = tools.serializeUrl(urlStr);
        console.log(urlObj);
        $scope.form.registerTimeStart=urlObj.registerTimeStart.split(' ')[0];
        $scope.form.registerTimeEnd=urlObj.registerTimeEnd.split(' ')[0];
        //$scope.form.managerName='高玉珑';
    }

    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder
        .newOptions().withOption('ajax',{
            url: siteVar.serverUrl + 'newuser/queryList.json',
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
    vm.dtColumns = [
        DTColumnBuilder.newColumn('userId').withTitle('用户ID').withOption('sWidth','110px').notSortable().renderWith(function (data,type,full) {
            //return '<a href="javascript:;" class="" kye_sys="null" key="'+data+'" keyId="'+full.id+'">'+data+'</a>';
            return data;
        }),
        DTColumnBuilder.newColumn('realName').withTitle('姓名').withOption('sWidth','60px').notSortable().renderWith(function (data,type,full) {
            return data?data:'--';
        }),
        DTColumnBuilder.newColumn('mobile').withTitle('手机号码').withOption('sWidth','90px').notSortable(),
        DTColumnBuilder.newColumn('createTime').withTitle('注册时间').withOption('sWidth','130px').notSortable().renderWith(function(data,type,full){
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('cardValidated').withTitle('绑定回款卡').withOption('sWidth','90px').notSortable().renderWith(function (data,type,full) {
            return Number(data)?'已绑定':'未绑定';
        }),
        DTColumnBuilder.newColumn('haveDeal').withTitle('是否交易').withOption('sWidth','65px').notSortable().renderWith(function (data,type,full) {
            return Number(data)?'是':'否';
        }),
        DTColumnBuilder.newColumn('managerName').withTitle('理财师姓名').withOption('sWidth','90px').notSortable(),
        DTColumnBuilder.newColumn('managerId').withTitle('理财师ID').withOption('sWidth','110px').notSortable(),
        DTColumnBuilder.newColumn('mailName').withTitle('邮寄地址').withOption('sWidth','180px').notSortable().renderWith(function (data,type,full) {
            return (data?data:'')+'&nbsp;&nbsp;'+(full.mailMobile?full.mailMobile:'')+'<br/>'+(full.mailAddress?full.mailAddress:'');
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
    };


    function fnDrawCallback(){
        tools.createModal();
        tools.createModalProgress();
    }
    (function(){
        $("[ui-view]").append("<style>table.dataTable,table.dataTable.no-footer {width: 100% !important;}</style>");
    })();

}