'use strict';
function structure($scope, tools, DTOptionsBuilder, DTColumnBuilder) {
    //var domForm = $("#js_form"), conditionItem = domForm.find(".form-group");
    $scope.form = {
        "awardtype":1
    };
    $scope.action = {};

    /*
     创建表格选项
     */
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/xinghuosite/tableStructure.shtml',
            type: 'POST',
            data: $scope.form
        })
        .withDataProp('data')
        .withOption('createdRow', function(row, data, dataIndex) {
            angular.element(row).addClass("rows" + data.id)
        })
        .withOption('searching',false)
        .withOption('ordering',false)
        .withOption('serverSide',true)
        .withOption('processing',false)
        .withOption('scrollX',true)
        .withLanguage(tools.dataTablesLanguage)
        //.withOption('fnDrawCallback', fnDrawCallback)
        .withPaginationType('simple_numbers');
    vm.dtColumns = [
        DTColumnBuilder.newColumn('structurename').withTitle('活动名称').withOption('sWidth','120px'),
        DTColumnBuilder.newColumn('structureremark').withTitle('活动说明').withOption('sWidth','160px'),
        DTColumnBuilder.newColumn('promotionurl').withTitle('活动地址').withOption('sWidth','180px').renderWith(function(data,type,full){
            if(!data) return "";
            return '<span class="ui_ellipsis" title="' + data + '">' + data + '</span>';
        }),
        DTColumnBuilder.newColumn('floatingannualrate').withTitle('浮动收益率').withOption('sWidth','80px'),
        DTColumnBuilder.newColumn('starttime').withTitle('活动时间').withOption('sWidth','280px').renderWith(function(data, type, full) {
            if(!data || !full.endtime) return "";
            return '<span>' + tools.toJSDate(data) + '至' + tools.toJSDate(full.endtime) + '</span>';
        }),
        DTColumnBuilder.newColumn('publishtime').withTitle('结果公布时间').withOption('sWidth','140px').renderWith(function(data, type, full) {
            if(!data) return "";
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('subproductcode').withTitle('产品CODE').withOption('sWidth','80px'),
        DTColumnBuilder.newColumn('resulttext').withTitle('最终竞猜结果').withOption('sWidth','110px'),
        DTColumnBuilder.newColumn('resultimage').withTitle('结果图片').withOption('sWidth','60px').renderWith(function(data, type, full) {
            return '<a href="' + data + '" target="_blank">预览</a>';
        }),
        DTColumnBuilder.newColumn('source').withTitle('来源').withOption('sWidth','90px'),
        DTColumnBuilder.newColumn('subproductcode').withTitle('操作').withOption('sWidth','60px').renderWith(function(data, type, full) {
            var params = JSON.stringify(full);
            return '<div class="col-lg-12 col-xs-12 ui_center"><a href="#xinghuosite-structureEdit.html?params=' + encodeURIComponent(params) + '" class="btn btn-success btn-xs">修改</a></div>';
        })
    ];
    $scope.action.search = function(){
        vm.dtInstance.rerender();
    };
}
