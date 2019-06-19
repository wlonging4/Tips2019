'use strict';
function site($scope, $http, $modal, tools, DTOptionsBuilder, DTColumnBuilder) {
    var configForm = $("#js_form_config_site");
    $scope.form = {};
    $scope.select = {};
    $scope.action = {};
    tools.createModal();
    tools.createModalProgress();
    var popUpLayer = $("#js_dialog"), popUpLayerContent = popUpLayer.find(".js_content");

    $http({
        method: "POST",
        url: siteVar.serverUrl + "/xinghuopageapi/getSiteConfig.json"
    }).success(function(data, status) {
        if(data.result == 'FAILED') {
            alert("获取配置信息失败，请与管理员联系。" + data.msg);
            return;
        };
        $scope.form.scaninterval = data.appResData.defaultScanTime;
        $scope.select.q_productid = data.appResData.productslist;
    }).error(function(data, status) {
        alert("获取配置信息失败，请与管理员联系。");
        return;
    });
    var productName = $('#productname'), subproductName = $('#subproductname'), selectPro = configForm.find("[name='q_productid']"), selectSubPro = configForm.find("[name='q_subproductid']");

    $scope.action.choosePro = function(){
        var productId = $scope.form.q_productid;
        subproductName.val('');
        if(!productId){
            $scope.select.q_subproductid = [];
            productName.val('');
        }else{
            productName.val($scope.select.q_productid[selectPro.get(0).selectedIndex -1].value);
            $http({
                method: "POST",
                url: siteVar.serverUrl + "/xinghuoproduct/subprducts/" + productId + ".shtml",
                data: $.param({
                    'status' : 0,
                    'querytype' : 4
                }),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                    'X-Requested-With' :'XMLHttpRequest'
                }
            }).success(function(data, status) {
                if(!data.success) {
                    alert("获取产品列表失败，请与管理员联系。" + data.msg);
                    return;
                };
                $scope.select.q_subproductid = data.data;
            }).error(function(data, status) {
                alert("获取产品列表失败，请与管理员联系。");
                return;
            });
        };
    };
    $scope.action.chooseSubPro = function(){
        var subProductId = $scope.form.q_subproductid;
        if(!subProductId){
            subproductName.val('');
        }else{
            subproductName.val($scope.select.q_subproductid[selectSubPro.get(0).selectedIndex -1].value)
        };
    };
    $scope.action.configBtn = function(){
        var data = tools.getFormele({}, configForm), self = $("#js_site_config_btn");
        if(!$scope.form.q_productid || !$scope.form.q_subproductid) {
            return alert("请选择产品！");
        };
        if(!tools.ajaxLocked(self)) return;

        $.ajax({
            type: "post",
            url: siteVar.serverUrl + "/xinghuosite/tositeConfig.shtml",
            data: data,
            dataType: "text",
            success: function(data){
                tools.ajaxOpened(self);
                if(!tools.interceptor(data)) return;
                popUpLayerContent.html(data);
                var form = $("#js_config_site_form"), interval = form.find("[name='interval']");
                interval.Validator({
                    hmsg: "请填写交易单取消时间间隔",
                    regexp: /^[0-9]*[1-9][0-9]*$/,
                    showok: false,
                    style: {placement: "top"},
                    emsg: "交易单取消时间间隔不能为空",
                    rmsg: "交易单取消时间间隔不合法"
                });
                popUpLayer.modal("show");
            },
            error: function(err){
                tools.ajaxOpened(self);
                tools.ajaxError(err);
            }
        });
    };
    $scope.action.update = function(){
        var scaninterval = $scope.form.scaninterval, self = $("#scaninterval");
        if(!scaninterval) return;
        if(!tools.ajaxLocked(self)) return;
        $.ajax({
            type: "post",
            url: siteVar.serverUrl + "/xinghuosite/updateScanInterval.shtml",
            data: {
                "scaninterval": scaninterval
            },
            dataType: "json",
            success: function(data){
                tools.ajaxOpened(self);
                if(!tools.interceptor(data)) return;
                if(data.success) return alert(data.msg);
            },
            error: function(err){
                tools.ajaxOpened(self);
                tools.ajaxError(err);
            }
        });
    };
    $scope.action.clearCache = function(){
        var self = $("#js_site_clear_protol_cache");
        if(!confirm("您确定要清除协议的缓存么？")) return false;
        if(!tools.ajaxLocked(self)) return;
        $.ajax({
            type: "post",
            url: siteVar.serverUrl + "/xinghuosite/clearProtocolCache.shtml",
            data: {},
            dataType: "json",
            success: function(data){
                tools.ajaxOpened(self);
                if(!tools.interceptor(data)) return;
                if(data.success) return alert(data.msg);
            },
            error: function(err){
                tools.ajaxOpened(self);
                tools.ajaxError(err);
            }
        });
    };
    /*
     创建表格选项
     */
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/xinghuosite/tableSite.shtml',
            type: 'POST',
            data: {}
        })
        .withDataProp('data')
        .withOption('createdRow', function(row, data, dataIndex) {
            angular.element(row).addClass("rows" + data.id)
        })
        .withOption('searching',false)
        .withOption('ordering',false)
        .withOption('serverSide',true)
        .withOption('processing',false)
        .withOption('scrollX',false)
        .withLanguage(tools.dataTablesLanguage)
        .withOption('fnDrawCallback', fnDrawCallback)
        .withPaginationType('simple_numbers');
    vm.dtColumns = [
        DTColumnBuilder.newColumn('subproductname').withTitle('产品名称').withOption('sWidth','200px').renderWith(function(data, type, full) {
            return "<div class='ui_ellipsis' title='" + data + "'>" + data + ":-->" + tools.toJSYMD(full.calldate) + "</div>";
        }),
        DTColumnBuilder.newColumn('annualrate').withTitle('预期年化收益率（%）').withOption('sWidth','160px').renderWith(function(data, type, full) {
            if(!data) return "";
            return data.toFixed(2);
        }),
        DTColumnBuilder.newColumn('configtime').withTitle('配置时间').withOption('sWidth','140px').renderWith(function(data, type, full) {
            if(!data) return "";
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('interval').withTitle('交易单取消时间间隔（分钟）').withOption('sWidth','190px'),
        DTColumnBuilder.newColumn('id').withTitle('操作').withOption('sWidth','160px').renderWith(function(data, type, full) {
            if(!data) return "";
            return '<div class="text-center"><a href="javascript:;" data-href="/xinghuosite/tositeConfig.shtml?id=' + full.id + '&subproductname=' + full.subproductname + '" class="btn btn-success btn-xs js_site_edit">更新</a>' + '<a href="javascript:;" class="btn btn-danger btn-xs js_site_delete" data-href="/xinghuosite/deleteSite.shtml?id=' + data + '">删除</a></div>';

        })
    ];

    ;(function(){
        popUpLayer.on("click", "#js_site_config_save", function(){
            var self = this, form = $("#js_config_site_form"), interval = form.find("[name='interval']"), data = tools.getFormele({}, form), url = form.attr("action");
            if(!interval.val()){
                return;
            };
            popUpLayer.modal("hide");
            if(!tools.ajaxLocked(self)) return;
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
                    };
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });
        });


    })();
    function fnDrawCallback(){
        var table = $("#dataTables"), tbody = table.find("tbody");
        table.off("click").on("click", ".js_site_delete", function(){
            var self = $(this), href = self.attr("data-href"), data, url;
            data = tools.queryUrl(href);
            url = href.split('?')[0];
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + url,
                data: data,
                dataType: "json",
                success: function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    if(data.success) {
                        return vm.dtInstance.rerender();
                    };
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });

        });

        table.on("click", ".js_site_edit", function() {
            var self = $(this), href = self.attr("data-href"), data, url;
            data = tools.queryUrl(href);
            url = href.split('?')[0];
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + url,
                data: data,
                dataType: "text",
                success: function (data) {
                    tools.ajaxOpened(self);
                    if (!tools.interceptor(data)) return;
                    popUpLayerContent.html(data);
                    var form = $("#js_config_site_form"), interval = form.find("[name='interval']");
                    interval.Validator({
                        hmsg: "请填写交易单取消时间间隔",
                        regexp: /^[0-9]*[1-9][0-9]*$/,
                        showok: false,
                        style: {placement: "top"},
                        emsg: "交易单取消时间间隔不能为空",
                        rmsg: "交易单取消时间间隔不合法"
                    });
                    popUpLayer.modal("show");
                },
                error: function (err) {
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });
        });
    }
}
