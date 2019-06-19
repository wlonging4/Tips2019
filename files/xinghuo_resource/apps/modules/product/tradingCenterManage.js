'use strict';
function tradingCenterManage($scope, $http, getSelectListFactory, getProListFactory, tools, DTOptionsBuilder, DTColumnBuilder) {
    var domForm = $("#js_form"), conditionItem = domForm.find(".form-group");
    $scope.form = {
        isShow: (conditionItem.length > 6) ? true : false
    };
    $scope.select = {};
    $scope.action = {};
    var selectList = getSelectListFactory.getSelectList(['sub_pro_status', 'product_category_tradingcenter']);
    selectList.then(function(data){
        $scope.select.sub_pro_status = data.appResData.retList[0].sub_pro_status;
        $scope.select.product_category_tradingcenter = data.appResData.retList[1].product_category_tradingcenter;
    });
    $scope.action.chooseSecondPro = function(){
        getProListFactory.getProOtherList({
            category: $scope.form.category,
            source: 2
        }).then(function(data){
            if(!data.success) {
                alert("获取产品列表失败，请与管理员联系。"+data.msg);
                return;
            }
            $scope.select.series = data.data.seriesList;
        });
        delete $scope.form.series;
        delete $scope.form.productName;
        $scope.select.productNameCode = [];
    };
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
        delete $scope.form.productName;
    };

    /*
     创建表格选项
     */
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/xinghuoproduct/tradingCenterProducts.shtml',
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
        .withOption('fnDrawCallback', fnDrawCallback)
        .withPaginationType('simple_numbers');
    vm.dtColumns = [
        DTColumnBuilder.newColumn('code').withTitle('操作').withOption('sWidth', '80px').renderWith(function(data, type, full) {
            var sequence = full.sequence === null ? "": full.sequence ;
            var description = full.description === null ? "" : full.description;
            var icon = full.icon === null ? "" : full.icon;

            var whetherTop = full.whetherTop === null ? "": full.whetherTop;

            return '<a href="javascript:;" class="showInfo" data-href="/xinghuopageapi/newProCenterGoodOrder.shtml?code=' + data + '&description=' + description + '&icon=' + icon + '&sequence=' + sequence + '&showSign=' + full.showSign + '&whetherTop=' + whetherTop + '">属性</a>';
        }),
        DTColumnBuilder.newColumn('code').withTitle('产品编号').withOption('sWidth','140px'),
        DTColumnBuilder.newColumn('name').withTitle('产品名称').withOption('sWidth','140px').renderWith(function(data, type, full) {
            if(!data) return "";
            return '<a href="javascript:void(0);" class="infoDetail" data-href="/xinghuoproduct/productinfo.shtml?productid=' + full.id + '">' + data + '</a>';
        }),
        DTColumnBuilder.newColumn('calldate').withTitle('到期日期').withOption('sWidth','140px').renderWith(function(data, type, full) {
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('minAmount').withTitle('起投金额(元)').withOption('sWidth','90px'),
        DTColumnBuilder.newColumn('annualRate').withTitle('预计年化收益率').withOption('sWidth', '100px').renderWith(function(data, type, full) {
            return data+"%"+"以上";
        }),
        DTColumnBuilder.newColumn('runDays').withTitle('出借天数').withOption('sWidth', '130px'),
        DTColumnBuilder.newColumn('statusStr').withTitle('产品状态').withOption('sWidth', '130px'),
        DTColumnBuilder.newColumn('createTime').withTitle('发布时间').withOption('sWidth','160px').renderWith(function(data, type, full) {
            return tools.toJSDate(data);
        })
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

    function fnDrawCallback(){
        tools.createModal();
        tools.createModalProgress();
        var popUpLayer = $("#js_dialog"), popUpLayerContent = popUpLayer.find(".js_content");

        $(".js_export").on("click", function(){
            tools.export(this);
        });

        var table = $("#dataTables"), tbody = table.find("tbody");
        table.off("click");
        tbody.on("click", ".infoDetail", function(){
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
        tbody.on("click", ".showInfo", function(){
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
                    $(".form_exact_datetime").datetimepicker({
                        isRTL: Metronic.isRTL(),
                        format: "yyyy-mm-dd hh:mm:ss",
                        autoclose: true,
                        todayBtn: true,
                        pickerPosition: (Metronic.isRTL() ? "bottom-right" : "bottom-left"),
                        minuteStep: 1,
                        language:"zh-CN"
                    });
                    popUpLayer.modal("show");
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            })
        });
        popUpLayerContent.on("click", "#js_save", function(){
            var self = this;
            if(!tools.ajaxLocked(self)) return;

            $("#js_dialog").modal("hide");

            $("#js_dialog_progress").modal({backdrop: 'static', keyboard: false});

            // tools.ajaxForm({
            //     "ele": $("#js_modify_productCenter_form"),
            //     "action": siteVar.serverUrl + "/xinghuoproduct/saveProductCenterOrder.shtml",
            //     onComplete: function(data){
            //         tools.ajaxOpened(self);
            //         $("#js_dialog_progress").modal("hide");
            //         if(!tools.interceptor(data)) return;
            //         if(data.success){
            //             vm.dtInstance.rerender();
            //         }
            //     }
            // });
            var data = new FormData($("#js_modify_productCenter_form")[0]);
            $.ajax({
                url : siteVar.serverUrl + "/xinghuoproduct/saveProductCenterOrder.shtml",
                type:"POST",
                data : data,
                processData: false,
                contentType: false,
                success :function(data){
                    if(typeof data == "string"){
                        var data = JSON.parse(data);
                    };
                    tools.ajaxOpened(self);
                    $("#js_dialog_progress").modal("hide");
                    if(!tools.interceptor(data)) return;
                    if(data.success){
                        vm.dtInstance.rerender();
                    }
                }

            });
        });
    }
}
