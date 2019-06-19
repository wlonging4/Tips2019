'use strict';
function rate($scope, getSelectListFactory, getProListFactory, tools, DTOptionsBuilder, DTColumnBuilder) {
    var domForm = $("#js_form"), conditionItem = domForm.find(".form-group");
    $scope.form = {
        isShow: (conditionItem.length > 6) ? true : false,
        "searchObject":{
            "itmRate":{
                "type":"-1",
                "levelid":"-1",
                "psettlementTypeValue":"-1"
            },
            "xhStatus":"-1"
        }
    };
    $scope.select = {};
    $scope.action = {};

    var selectList = getSelectListFactory.getSelectList(['rate_type', 'psettlementtype', 'product_category_productcenter','sub_pro_status']);
    selectList.then(function(data){
        $scope.select.rate_type = data.appResData.retList[0].rate_type;
        $scope.select.psettlementTypeValue = data.appResData.retList[1].psettlementtype;
        $scope.select.proFirstList = data.appResData.retList[2].product_category_productcenter;
        $scope.select.proStatus = data.appResData.retList[3].sub_pro_status;
    });
    getProListFactory.getUserLevel().then(function(data){
        $scope.select.levelid = data.appResData.levellist;
    });
    $scope.action.chooseSecondPro = function(){
        $scope.form.searchObject.productid = "";
        $scope.form.searchObject.subproductCode = "";
        $scope.select.productNameCode = [];
        getProListFactory.getProOtherList({
            category: $scope.form.searchObject.category,
            source:1
        }).then(function(data){
            if(!data.success) {
                alert("获取产品列表失败，请与管理员联系。"+data.msg);
                return;
            }
            $scope.select.series = data.data.seriesList;
        });
    };
    $scope.action.chooseThirdPro = function(){
        $scope.form.productName = "";
        getProListFactory.getProOtherList({
            category: $scope.form.searchObject.category,
            series: $scope.form.searchObject.productid
        }).then(function(data){
            if(!data.success) {
                alert("获取产品列表失败，请与管理员联系。"+data.msg);
                return;
            }
            $scope.select.productNameCode = data.data.nameList;
        });
    };

    /*
     创建表格选项
     */
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/xinghuoproduct/tableRate.shtml',
            type: 'POST',
            data: function(d){
                var data = tools.getFormele({}, domForm);
                $.extend(d, data);
            }
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
        .withOption('fnDrawCallback', fnDrawCallback)
        .withPaginationType('simple_numbers');
    vm.dtColumns = [
        DTColumnBuilder.newColumn('productName').withTitle('产品名称').withOption('sWidth', '306px').renderWith(function(data, type, full) {
            return data + '---' + full.subProductName;
        }),
        DTColumnBuilder.newColumn('bizSysRouteStr').withTitle('发布渠道').withOption('sWidth','80px'),
        DTColumnBuilder.newColumn('typeValue').withTitle('购买用户').withOption('sWidth','80px'),
        DTColumnBuilder.newColumn('levelRateList').withTitle('销售店铺-基础费率').withOption('sWidth','200px').renderWith(function(data, type, full) {
            if(!!data && !!data.length) {
                var str = '';
                for(var i = 0; i < data.length; i++) {
                    str += data[i].userLevelName + '<a class="js_hover_info" href="javascript:;" data-content="' + data[i].rateRange + '" data-original-title="' + data[i].rateTmpName + '">' + data[i].rateTmpName + '</a><br>';
                }
                return str;
            } else {
                return "";
            }
        }),
        DTColumnBuilder.newColumn('havePersonRate').withTitle('销售店铺-个别费率').withOption('sWidth','140px').renderWith(function(data, type, full) {
            if(!data){ return "" };
            return '<a target="_blank" href="#xinghuoproductrate-toPersonRateList.html?id=' + full.subId + '&productid=' + full.productId + '">查询个别费率明细</a>';
        }),
        DTColumnBuilder.newColumn('ratio').withTitle('费率系数').withOption('sWidth', '60px').renderWith(function(data, type, full) {
            return !!data ? data : "";
        }),
        DTColumnBuilder.newColumn('settleTypeName').withTitle('佣金结算方式').withOption('sWidth', '170px'),
        DTColumnBuilder.newColumn('status').withTitle('销售状态').withOption('sWidth','60px'),
        DTColumnBuilder.newColumn('productName').withTitle('操作').withOption('sWidth','60px').renderWith(function(data, type, full) {
            if(full.category == 9){
                return '';
            }
            return '<div class="ui_center"><a href="#xinghuoproductrate-intoProductRatePage.html?backUrl=xinghuoproduct-rate&subproductId=' + full.subId + '&productid=' + full.productId + '" >修改配置</a></div>';
        })
    ];
    $scope.action.reset = function(){
        for(var prop in $scope.form){
            if(prop !== 'isShow' && prop !== "searchObject") delete $scope.form[prop];
            if(prop == "searchObject"){
                $scope.form[prop] = {
                    "itmRate":{
                        "type":"-1",
                        "levelid":"-1",
                        "psettlementTypeValue":"-1"
                    },
                    "xhStatus":"-1"
                };
            };
        };
        domForm.find("[name='searchObject.status']").val("");
        vm.dtInstance.rerender();
    };
    $scope.action.search = function(){
        vm.dtInstance.rerender();
    };

    function fnDrawCallback(){
        var table = $("#dataTables"), tbody = table.find("tbody"),hoverInfo = tbody.find(".js_hover_info");
        hoverInfo.popover("destroy");
        hoverInfo.popover({"trigger": "hover", "container": "body", "placement": "left", "html": true});
    }

}
