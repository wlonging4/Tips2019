'use strict';
function fundRedeemController($scope, getSelectListFactory, getProListFactory, tools, DTOptionsBuilder, DTColumnBuilder) {
    var domForm = $("#js_form"), conditionItem = domForm.find(".form-group");
    $scope.form = {
        isShow: (conditionItem.length > 6) ? true : false
    };
    $scope.select = {};
    $scope.action = {};
    /*
     获取枚举类型
     */
    var selectList = getSelectListFactory.getSelectList(['fund_redeem_status','product_category']);
    selectList.then(function(data){
        $scope.select.fund_redeem_status = data.appResData.retList[0].fund_redeem_status;
        $scope.select.proFirstList = data.appResData.retList[1].product_category;
    });
    $scope.action.chooseThirdPro = function(){
        getProListFactory.getProOtherList({
            category: $scope.form.category,
            series: $scope.form.series
        }).then(function(data){
            if(!data.success) {
                alert("获取产品列表失败，请与管理员联系。"+data.msg);
                return;
            }
            $scope.select.productNameCode = data.data.nameList;
        });
        delete $scope.form.productNameCode;
    };
    /*
     创建表格选项
     */
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/xinghuodeal/tableFundRedeem.shtml',
            type: 'POST',
            data: function(d){
                jQuery.extend(d, $scope.form);
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
        DTColumnBuilder.newColumn('redeemNo').withTitle('赎回单ID').withOption('sWidth','190px').renderWith(function(data, type, full) {
            return '<a href="javascript:void(0);" class="infoDetail" data-href="/xinghuodeal/fundRedeemInfo.shtml?id=' + full.id + '">' + data + '</a>';
        }),
        DTColumnBuilder.newColumn('lenderName').withTitle('出借人姓名').withOption('sWidth','80px').renderWith(function(data, type, full) {
            if(!data) return "";
            return '<a href="javascript:void(0);" class="infoDetail" data-href="/xinghuouser/userinfo.shtml?userType=consumer&id=' + full.lenderId + '">' + data + '</a>';
        }),
        DTColumnBuilder.newColumn('fundName').withTitle('基金名称').withOption('sWidth','160px').renderWith(function(data, type, full) {
            if(!data) return "";
            return '<a href="javascript:void(0);" class="infoDetail ui_ellipsis" data-href="/xinghuoproduct/productDetail.shtml?productid=' + full.fundId + '" style="width: 160px" title="' + data + '">' + data + '</a>';
        }),
        DTColumnBuilder.newColumn('redeemNumber').withTitle('赎回金额').withOption('sWidth','80px'),
        DTColumnBuilder.newColumn('redeemFee').withTitle('赎回手续费').withOption('sWidth','80px'),
        DTColumnBuilder.newColumn('applyTime').withTitle('赎回申请时间').withOption('sWidth','140px').renderWith(function(data, type, full) {
            if(!data) return "";
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('statusStr').withTitle('赎回单状态').withOption('sWidth', '90px'),
        DTColumnBuilder.newColumn('bankname').withTitle('赎回银行').withOption('sWidth', '170px').renderWith(function(data, type, full) {
            return '<span class="ui_ellipsis" style="width: 170px" title="' + data + '">' + data + '</span>';
        }),
    ];
    $scope.action.reset = function(){
        for(var prop in $scope.form){
            if(prop !== 'isShow') delete $scope.form[prop];
        }
        vm.dtInstance.rerender();
    };
    $scope.action.search = function(){
        vm.dtInstance.rerender();
    };
    ;(function(){
        $(document).off("change").on('change',"#js_category",function(){
            var source = $(this).find ("option:selected").attr("source");
            $scope.form.source = source;
            getProListFactory.getProOtherList({
                category: $scope.form.category,
                source : source
            }).then(function(data){
                if(!data.success) {
                    alert("获取产品列表失败，请与管理员联系。"+data.msg);
                    return;
                }
                $scope.select.series = data.data.seriesList;
            });
            delete $scope.form.series;
            delete $scope.form.productNameCode;
            $scope.select.productNameCode = [];
            return false;
        });
    })();
    function fnDrawCallback(){
        tools.resetWidth();
        $scope.$apply(function(){
            $scope.tableinfo = window.ajaxDataInfo.info;
        });


        tools.createModal();
        tools.createModalProgress();
        var popUpLayer = $("#js_dialog"), popUpLayerContent = popUpLayer.find(".js_content");

        $(".js_export").on("click", function(){
            tools.export(this);
        });

        var table = $("#dataTables"), tbody = table.find("tbody");
        table.off("click").on("click", ".infoDetail", function(){
            var self = $(this), href = self.attr("data-href"), data, url;
            data = tools.queryUrl(href);
            url = href.split('?')[0];
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + url,
                data: data,
                dataType: "text",
                success: function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    popUpLayerContent.html(data);
                    popUpLayer.modal("show");
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            })
        });
    }
}
