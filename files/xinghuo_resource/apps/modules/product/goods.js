'use strict';
function goods($scope, $http, getSelectListFactory, getProListFactory, tools, DTOptionsBuilder, DTColumnBuilder) {
    var domForm = $("#js_form"), conditionItem = domForm.find(".form-group");
    $scope.form = {
        isShow: (conditionItem.length > 6) ? true : false

    };
    $scope.select = {};
    $scope.action = {};
    /*
     获取枚举类型
     */
    var selectList = getSelectListFactory.getSelectList(['issoldout']);
    selectList.then(function(data){
        $scope.select.issoldout = data.appResData.retList[0].issoldout;
    });
    getProListFactory.getProFirstList({
        'source' : 0,
        'status' : 0
    }).then(function(data){
        if(data.result == "FAILED") {
            alert("获取产品列表失败，请与管理员联系。" + data.errMsg);
            return;
        }
        $scope.select.productid = data.appResData.proList;
    });

    $scope.action.choosePro = function(){
        $scope.form.id = '';
        if(!$scope.form.productid){
            return $scope.select.id = [];
        };
        $http({
            method: "POST",
            url: siteVar.serverUrl + "/xinghuoproduct/subprducts/" + $scope.form.productid + ".shtml",
            data: $.param({'status':0}),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                'X-Requested-With' :'XMLHttpRequest'
            }
        }).success(function(data, status) {
            if(!data.success) {
                alert("获取产品列表失败，请与管理员联系。" + data.msg);
                return;
            };
            $scope.select.id = data.data;
        }).error(function(data, status) {
            alert("获取产品列表失败，请与管理员联系。");
            return;
        });
    };
    /*
     创建表格选项
     */
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/xinghuoproduct/tableGoods.shtml',
            type: 'POST',
            data: function(d){
                $scope.form["orderColumn"] = d.columns[d.order[0]["column"]]["data"];
                $scope.form["orderType"] = d.order[0]["dir"];
                jQuery.extend(d, $scope.form);
            }

        })
        .withDataProp('data')
        .withOption('createdRow', function(row, data, dataIndex) {
            angular.element(row).addClass("rows" + data.id)
        })
        .withOption('searching',false)
        .withOption('ordering',true)
        .withOption('serverSide',true)
        .withOption('processing',false)
        .withOption('scrollX',true)
        .withLanguage(tools.dataTablesLanguage)
        .withOption('fnDrawCallback', fnDrawCallback)
        .withPaginationType('simple_numbers')
        .withOption('order', [1, 'desc']);
    vm.dtColumns = [
        DTColumnBuilder.newColumn('id').withTitle('操作').withOption('sWidth', '50px').renderWith(function(data, type, full) {
            var sequence = full.sequence === null ? "": full.sequence;
            var activityEnd = full.activityEnd === null ? "" : tools.toJSDate(full.activityEnd).split(" ")[0];
            var activityStart = full.activityStart === null ? "" : tools.toJSDate(full.activityStart).split(" ")[0];
            var whetherTop = full.whetherTop === null ? "": full.whetherTop;
            return '<a href="javascript:;" class="showInfo" data-href="/xinghuoproduct/showModifySubproduct.shtml?id=' + data + '&sequence=' + sequence + '&showsign=' + full.showsign + '&activityEnd=' + activityEnd + '&activityStart=' + activityStart + '&whetherTop=' + whetherTop + '">属性</a>';
        }).notSortable(),
        DTColumnBuilder.newColumn('sequence').withTitle('排序').withOption('sWidth','50px'),
        DTColumnBuilder.newColumn('code').withTitle('子产品编号').withOption('sWidth','80px').notSortable(),
        DTColumnBuilder.newColumn('name').withTitle('产品名称').withOption('sWidth','140px').renderWith(function(data, type, full) {
            if(!data) return "";
            return '<a href="javascript:void(0);" class="infoDetail" data-href="/xinghuoproduct/productinfo.shtml?productid=' + full.id + '">' + data + '</a>';
        }).notSortable(),
        DTColumnBuilder.newColumn('starttime').withTitle('开放日期').withOption('sWidth', '140px').renderWith(function(data, type, full) {
            if(!data) return "";
            return tools.toJSDate(data);
        }).notSortable(),
        DTColumnBuilder.newColumn('calldate').withTitle('到期日期').withOption('sWidth', '140px').renderWith(function(data, type, full) {
            if(!data) return "";
            return tools.toJSDate(data);
        }).notSortable(),
        DTColumnBuilder.newColumn('minamount').withTitle('起投金额(低)').withOption('sWidth','90px').notSortable(),
        DTColumnBuilder.newColumn('maxamount').withTitle('起投金额(高)').withOption('sWidth','90px').notSortable(),
        DTColumnBuilder.newColumn('rundays').withTitle('产品期限(天)').withOption('sWidth','90px').notSortable(),
        DTColumnBuilder.newColumn('annualrate').withTitle('预计年化收益率').withOption('sWidth','120px').renderWith(function(data, type, full) {
            return data + "%";
        }).notSortable(),
        DTColumnBuilder.newColumn('issoldout').withTitle('产品状态').withOption('sWidth','90px').renderWith(function(data, type, full) {
            var arr = ["在售", "已售罄"];
            return arr[data];
        }).notSortable(),
        DTColumnBuilder.newColumn('updatetimeDT').withTitle('更新时间').withOption('sWidth','140px').renderWith(function(data, type, full) {
            return tools.toJSDate(data);
        }).notSortable()
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
        popUpLayer.on("click", "#js_save", function(){
            var self = this, formDom = $("#js_modify_subproduct_form"), sequence = formDom.find("[name='sequence']"), url = formDom.attr("action");
            if(!sequence.val()) return;
            var data = tools.getFormele({}, formDom);
            if(!tools.ajaxLocked(self)) return;
            popUpLayer.modal("hide");
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + url,
                data: data,
                dataType: "json",
                success: function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    if(data.success){
                        vm.dtInstance.rerender();
                    }
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });
        });
    }
}
