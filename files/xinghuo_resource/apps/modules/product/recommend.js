'use strict';
function recommend($scope, $http, $modal, getProListFactory, tools, DTOptionsBuilder, DTColumnBuilder) {
    var domForm = $("#js_form"), conditionItem = domForm.find(".form-group");
    $scope.form = {
        isShow: (conditionItem.length > 6) ? true : false

    };
    $scope.select = {};
    $scope.action = {};
    $scope.asyncFlag = null;
    /*
     获取枚举类型
     */
    getProListFactory.getProFirstList({
        'status' : 0
    }).then(function(data){
        if(data.result == "FAILED") {
            alert("获取产品列表失败，请与管理员联系。" + data.errMsg);
            return;
        }
        $scope.select.q_productid = data.appResData.proList;
    });

    $scope.action.choosePro = function(){
        $scope.form.q_id = '';
        if(!$scope.form.q_productid){
            return $scope.select.q_id = [];
        };
        $http({
            method: "POST",
            url: siteVar.serverUrl + "/xinghuoproduct/subprducts/" + $scope.form.q_productid + ".shtml",
            data:$.param({'status':0, 'querytype': 2}),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                'X-Requested-With' :'XMLHttpRequest'
            }
        }).success(function(data, status) {
            if(!data.success) {
                alert("获取产品列表失败，请与管理员联系。" + data.msg);
                return;
            };
            $scope.select.q_id = data.data;
        }).error(function(data, status) {
            alert("获取产品列表失败，请与管理员联系。");
            return;
        });
    };
    $scope.action.search = function(){
        vm.dtInstance.rerender();
    };
    $('#prior_type_select').multiSel({
        'data': [
            {"text": "星火推荐", "value": "2", "default": false},
            {"text": "精选产品", "value": "8", "default": false},
            {"text": "网贷服务", "value": "4", "default": false}
        ],
        "name" : "priortype_"
    });
    tools.createModal();
    tools.createModalProgress();
    var popUpLayer = $("#js_dialog"), popUpLayerContent = popUpLayer.find(".js_content");
    var ModalCtrl = function($scope, $modalInstance, select, choosePro, form) {
        $scope.action = {};
        $scope.select = {
            q_productid : select.q_productid
        };
        $scope.form = {};
        $scope.action.choosePro = function(){
            $scope.form.q_id = '';
            if(!$scope.form.q_productid){
                return $scope.select.q_id = [];
            };
            $http({
                method: "POST",
                url: siteVar.serverUrl + "/xinghuoproduct/subprducts/" + $scope.form.q_productid + ".shtml",
                data:$.param({'status':0, 'querytype': 3}),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                    'X-Requested-With' :'XMLHttpRequest'
                }
            }).success(function(data, status) {
                if(!data.success) {
                    alert("获取产品列表失败，请与管理员联系。" + data.msg);
                    return;
                };
                $scope.select.q_id = data.data;
            }).error(function(data, status) {
                alert("获取产品列表失败，请与管理员联系。");
                return;
            });
        };;
        $scope.ok = function() {
            var data = tools.getFormele({},$("#js_recommend_product_form")), id = $(this).attr("id");
            $.extend(data, $scope.form);
            data["productid"] = data["q_productid"] || "";
            data["id"] = data["q_id"] || "";
            if(!data["productid"]){
                return alert("请选择产品系列！");
            };
            if(!data["id"]){
                return alert("请选择产品！");
            };
            if(!data["priortype_"]){
                return alert("请选择推荐位！");
            };
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + "/xinghuoproduct/productRecommend.shtml",
                data: data,
                dataType: "json",
                success: function(data){
                    $modalInstance.close();
                    if(data.success){
                        alert(data.msg);
                        return vm.dtInstance.rerender();
                    }else{
                        alert(data.msg);
                    };
                },
                error: function(err){
                    tools.ajaxError(err);
                }
            })
        };
        $scope.cancel = function() {
            $modalInstance.close();
        };
    };
    $scope.action.add = function(){

        var modalInstance = $modal.open({
            backdrop: true,
            backdropClick: true,
            dialogFade: false,
            keyboard: true,
            templateUrl : 'myModalContent.html',
            controller : ModalCtrl,
            resolve:{
                "form" : function(){
                    return $scope.form;
                },
                "select" : function(){
                    return $scope.select;
                },
                "choosePro": function(){
                    return $scope.action.choosePro;
                }
            }
        });
        modalInstance.opened.then(function() {
            if($scope.asyncFlag){
                clearTimeout($scope.asyncFlag);
            };
            $scope.asyncFlag = setTimeout(function(){
                $('#add_prior_type_select').multiSel({
                    'data': [
                        {"text": "星火推荐", "value": "2", "default": false},
                        {"text": "精选产品", "value": "8", "default": false},
                        {"text": "网贷服务", "value": "4", "default": false}
                    ],
                    "name" : "priortype_"
                });
            }, 0);

        });
    };


    /*
     创建表格选项
     */
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/xinghuoproduct/tableRecommend.shtml',
            type: 'POST',
            data: function(d){
                var data = tools.getFormele({}, domForm);
                $.extend(d, data, $scope.form);
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
        .withOption('scrollX',false)
        .withLanguage(tools.dataTablesLanguage)
        .withOption('fnDrawCallback', fnDrawCallback)
        .withPaginationType('simple_numbers');
    vm.dtColumns = [
        DTColumnBuilder.newColumn('productname').withTitle('产品名称').withOption('sWidth', '200px').renderWith(function(data, type, full) {
            if(!data) return "";
            return '<a href="javascript:void(0);" class="infoDetail" data-href="/xinghuoproduct/productinfo.shtml?productid=' + full.id + '">' + data + ':' + full.name + '</a>';
        }),
        DTColumnBuilder.newColumn('priortypestr').withTitle('推荐位').withOption('sWidth','100px'),
        DTColumnBuilder.newColumn('annualrate').withTitle('预期年化收益率').withOption('sWidth','100px').renderWith(function(data, type, full) {
            return data + "%";
        }),
        DTColumnBuilder.newColumn('calldate').withTitle('产品到期日').withOption('sWidth','80px').renderWith(function(data, type, full) {
            return tools.toJSYMD(data);
        }),
        DTColumnBuilder.newColumn('id').withTitle('操作').withOption('sWidth', '80px').renderWith(function(data, type, full) {
            return '<a href="javascript:;" class="btn btn-success btn-xs infoDetail" data-href="/xinghuoproduct/toEditRecommend.shtml?subProductId=' + data + '">修改推荐</a>';
        })
    ];


    function fnDrawCallback(){

        var popUpLayer = $("#js_dialog"), popUpLayerContent = popUpLayer.find(".js_content");
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
                    var form = $("#js_recommend_product_form");
                    form.find("input[type=checkbox]").uniform();
                    popUpLayer.modal("show");
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            })
        });
        $(document).on("click", "#js_recommend_edit", function(){
            var form = $("#js_recommend_product_form");
            var data = tools.getFormele({}, form);
            data = $.extend({}, data);
            data['priortype_'] = data.priortype_? data.priortype_.join() : '';
            var self = this;
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + "/xinghuoproduct/productRecommend.shtml",
                data: data,
                dataType: "json",
                success: function(data){
                    tools.ajaxOpened(self);
                    popUpLayer.modal("hide");
                    if(data.success){
                        alert(data.msg);
                        vm.dtInstance.rerender();

                    }else{
                        alert(data.msg);
                    };
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            })
        });
    }
}
