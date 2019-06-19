'use strict';
function productCenterManage($scope, $modal, $http, getSelectListFactory, getProListFactory, tools, DTOptionsBuilder, DTColumnBuilder) {
    var domForm = $("#js_form"), conditionItem = domForm.find(".form-group");
    $scope.form = {
        isShow: (conditionItem.length > 6) ? true : false
    };
    $scope.select = {};
    $scope.action = {};
    /*
     获取枚举类型
     */

    var selectList = getSelectListFactory.getSelectList(['issoldout', 'sub_pro_status', 'fundtypeenum', 'product_category_productcenter', 'show_sign']);
    selectList.then(function(data){
       
        $scope.select.issoldout = data.appResData.retList[0].issoldout;
        $scope.select.productStatus = data.appResData.retList[1].sub_pro_status;
        $scope.select.fundtypeenum = data.appResData.retList[2].fundtypeenum;
        $scope.select.proFirstList = data.appResData.retList[3].product_category_productcenter;
        $scope.select.showSign = data.appResData.retList[4].show_sign;
        //$scope.select.isVariableAnnualRate = data.appResData.retList[0][0].isVariableAnnualRate;
    });
    $scope.action.chooseSecondPro = function(){
        $scope.form.series = "";
        $scope.form.productName = "";
        $scope.select.productNameCode = [];
        getProListFactory.getProOtherList({
            category: $scope.form.category
        }).then(function(data){
            if(!data.success) {
                alert("获取产品列表失败，请与管理员联系。"+data.msg);
                return;
            }
            $scope.select.series = data.data.seriesList;
        });
    };
    $scope.filerSource = function(e){
        return e.key != 12;
    };
    $scope.action.chooseThirdPro = function(){
        $scope.form.productName = "";
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
    };

    /*
     创建表格选项
     */
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/xinghuoproduct/tableProducts.shtml',
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
        DTColumnBuilder.newColumn('code').withTitle('操作').withOption('sWidth', '80px').renderWith(function(data, type, full) {
            var sequence = full.sequence === null ? "": full.sequence ;
            var description = full.description === null ? "" : full.description;
            var icon = full.icon === null ? "" : full.icon;

            var isAdd = full.upAndDown, isAddCon = '';
            isAddCon = (isAdd == 1)?'上架':'下架';

            return '<a href="javascript:;" class="showDetail" data-href="/xinghuopageapi/getProductConfig.json?productId=' + full.id + '">属性</a>&nbsp;&nbsp;<a href="javascript:void(0);" class="productsCenterAdd" data-href="/xinghuoproduct/saveUpAndDown.shtml?id=' + full.id + '&upAndDown=' + isAdd + '">' + isAddCon + '</a>';
        }),
        DTColumnBuilder.newColumn('code').withTitle('产品编号').withOption('sWidth','140px'),
        DTColumnBuilder.newColumn('name').withTitle('产品名称').withOption('sWidth','140px').renderWith(function(data, type, full) {
            if(!data) return "";
            return '<a href="javascript:void(0);" class="infoDetail" data-href="/xinghuoproduct/productinfo.shtml?productid=' + full.id + '&category=' + full.category + '">' + data + '</a>';
        }),
        DTColumnBuilder.newColumn('minAmount').withTitle('起投金额(元)').withOption('sWidth','90px'),
        DTColumnBuilder.newColumn('annualRate').withTitle('预计年化收益率').withOption('sWidth', '100px').renderWith(function(data, type, full) {
            return data+"%"+"以上";
        }),
        DTColumnBuilder.newColumn('isVariableAnnualRate').withTitle('是否加息').withOption('sWidth', '60px').renderWith(function(data, type, full) {
            if(full.isVariableAnnualRate){
                return '是';
            }else{
                return '否';
            };
            
        }),
        DTColumnBuilder.newColumn('statusStr').withTitle('产品状态').withOption('sWidth', '60px'),
        DTColumnBuilder.newColumn('startTime').withTitle('开放日期').withOption('sWidth','140px').renderWith(function(data, type, full) {
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('id').withTitle('产品更新').withOption('sWidth','90px').renderWith(function(data, type, full) {
            return '<a href="javascript:;" class="productUpdate btn btn-success btn-xs" data-href="/xinghuoproduct/updateProductSyncTime.shtml?id=' + data + '&code=' + full.code + '&category=' + full.category + '">更新产品状态</a>';
        }),
        DTColumnBuilder.newColumn('confRate').withTitle('销售配置').withOption('sWidth','60px').renderWith(function(data, type, full) {
            var title = data ? "查看配置" : "新增配置";
            if(full.category == 9){
                title = '';
            };
            return '<a href="#xinghuoproductrate-intoProductRatePage.html?backUrl=xinghuoproduct-productCenterManage&subproductId='+ full.id +'&productid='+ full.productid +'" >' + title + '</a>';
        })
    ];
    $scope.action.reset = function(){
        for(var prop in $scope.form){
            if(prop !== 'isShow') delete $scope.form[prop];
        }
        //vm.dtColumns = $.extend([],default_dtColumns);
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
        var ModalCtrl = function($scope, $modalInstance, form, select, $timeout) {
            $scope.form = form || {};

            $scope.select = select || {};

            $timeout(function(){
                $(".form_exact_datetime").datetimepicker({
                    isRTL: Metronic.isRTL(),
                    format: "yyyy-mm-dd hh:ii:ss",
                    autoclose: true,
                    todayBtn: true,
                    pickerPosition: (Metronic.isRTL() ? "bottom-right" : "bottom-left"),
                    minuteStep: 1,
                    language:"zh-CN"
                });
            },0)
            $scope.ok = function() {
                var self = $("#save");
                if(!tools.ajaxLocked(self)) return;
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
                        if(!tools.interceptor(data)) return;
                        if(data.success){
                            $modalInstance.close();
                            vm.dtInstance.rerender();
                        }else{
                            alert(data.msg)
                        }
                    }

                });
            };
            $scope.close = function() {
                $modalInstance.close();
            };
        };
        tbody.on("click", ".showDetail", function(){
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
                    //if(!tools.interceptor(data)) return;

                    if(typeof data == "string"){
                        data = $.parseJSON(data)
                    };
                    if(data.result == "FAILED"){
                        return alert(data.errMsg);
                    }else{
                        $modal.open({
                            backdrop: true,
                            backdropClick: true,
                            dialogFade: false,
                            keyboard: true,
                            templateUrl : 'myModal.html',
                            controller : ModalCtrl,
                            resolve:{
                                "form": function(){
                                    return data.appResData;
                                },
                                "select": function(){
                                    return $scope.select;
                                }
                            }
                        });
                    }

                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            })
        });
        tbody.on("click", ".productsCenterAdd", function(){
            var self = $(this), href = self.attr("data-href"), data, url, conArr = ['上架','下架'], selfCon = self.html();
            data = tools.queryUrl(href);
            url = href.split('?')[0];
            data.upAndDown = (selfCon == conArr[0] ? 1 : 0);
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + url,
                data: data,
                dataType: "text",
                success: function(data){
                    data = eval('(' + data + ')');
                    if(data.success){
                        self.html(selfCon == conArr[0] ? conArr[1] : conArr[0]);
                    }else{
                        alert(data.msg)
                    }
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });
        });
        tbody.on("click", ".productUpdate", function(){
            var self = $(this), href = self.attr("data-href"), data, url;
            data = tools.queryUrl(href);
            url = href.split('?')[0];
            if(!tools.ajaxLocked(self)) return;
            $("#js_dialog_progress").modal({backdrop: 'static', keyboard: false});
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + url,
                data: data,
                dataType: "text",
                success: function(data){
                    tools.ajaxOpened(self);
                    $("#js_dialog_progress").modal("hide");
                    if(!tools.interceptor(data)) return;
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            })
        });
        //popUpLayerContent.on("click", "#js_save", function(){
        //    var self = this;
        //    if(!tools.ajaxLocked(self)) return;
        //
        //    $("#js_dialog").modal("hide");
        //
        //    $("#js_dialog_progress").modal({backdrop: 'static', keyboard: false});
        //    // tools.ajaxForm({
        //    //     "ele": $("#js_modify_productCenter_form"),
        //    //     "action": siteVar.serverUrl + "/xinghuoproduct/saveProductCenterOrder.shtml",
        //    //     onComplete: function(data){
        //    //         tools.ajaxOpened(self);
        //    //         $("#js_dialog_progress").modal("hide");
        //    //         if(!tools.interceptor(data)) return;
        //    //         if(data.success){
        //    //             vm.dtInstance.rerender();
        //    //         }
        //    //     },
        //    //     onStart:function(){
        //    //         console.log(tools.getFormele({},$("#js_modify_productCenter_form")))
        //    //     }
        //    // });
        //
        //    var data = new FormData($("#js_modify_productCenter_form")[0]);
        //    $.ajax({
        //        url : siteVar.serverUrl + "/xinghuoproduct/saveProductCenterOrder.shtml",
        //        type:"POST",
        //        data : data,
        //        processData: false,
        //        contentType: false,
        //        success :function(data){
        //            if(typeof data == "string"){
        //                var data = JSON.parse(data);
        //            };
        //            tools.ajaxOpened(self);
        //            $("#js_dialog_progress").modal("hide");
        //            if(!tools.interceptor(data)) return;
        //            if(data.success){
        //                vm.dtInstance.rerender();
        //            }
        //        }
        //
        //    });
        //});
    }
}
