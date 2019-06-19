'use strict';
function xinghuohuodongEffectController($scope,tools,DTOptionsBuilder, DTColumnBuilder) {
    $scope.form = {
        isShow: ($("#js_form").find(".form-group").length>6) ? true : false,
    };
    $scope.select = {};
    $scope.action = {};
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder
        .newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/xinghuohuodong/tableEffectStatistical.shtml',
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
        .withOption('createdRow', function(row, data, dataIndex) {
            angular.element(row).addClass("test"+data.id)
        })
        .withOption('fnDrawCallback',fnDrawCallback)
        .withPaginationType('full_numbers');
    vm.dtColumns = [
        DTColumnBuilder.newColumn('activityname').withTitle('活动名称').withOption('sWidth','100px').renderWith(function(data,type,full){
            return '<span class="ui_ellipsis" style="width: 100px;" title="'+data+'">'+data+'</span>';
        }),
        DTColumnBuilder.newColumn('subproductnamestr').withTitle('适用产品').withOption('sWidth','80px').renderWith(function(data,type,full){
            if(!data) return "全部";
            return '<span class="ui_ellipsis" style="width: 80px;" title="'+data+'">'+data+'</span>';
        }),
        DTColumnBuilder.newColumn('prizename').withTitle('红包名称').withOption('sWidth','120px').renderWith(function(data,type,full){
            return '<span class="ui_ellipsis" style="width: 120px;" title="'+data+'">'+data+'</span>';
        }),
        DTColumnBuilder.newColumn('prizeamount').withTitle('面额(元)').withOption('sWidth','70px'),
        DTColumnBuilder.newColumn('totalnumber').withTitle('数量').withOption('sWidth','40px'),
        DTColumnBuilder.newColumn('sendtotalnumber').withTitle('下发数量').withOption('sWidth','70px'),
        DTColumnBuilder.newColumn('usetotalnumber').withTitle('已使用数量').withOption('sWidth','80px'),
        DTColumnBuilder.newColumn('sumamount').withTitle('达成交易金额(元)').withOption('sWidth','130px'),
        DTColumnBuilder.newColumn('activitystarttime').withTitle('活动时间').withOption('sWidth','160px').renderWith(function(data,type,full){
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('prizestarttime').withTitle('有效期').withOption('sWidth','200px').renderWith(function(data,type,full){
            return tools.toJSDate(data).split(" ")[0]+"&nbsp;至&nbsp;"+tools.toJSDate(full.prizeendtime).split(" ")[0];
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
    function fnDrawCallback() {
        if (!tools.interceptor(window.ajaxDataInfo)) return;
    }
    (function(){
        $("[ui-view]").append("<style>table.dataTable,table.dataTable.no-footer {width: 100% !important;}</style>");
    })();
}