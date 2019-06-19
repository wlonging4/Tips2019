'use strict';
function saleSite($scope, $location, $modal, tools, DTOptionsBuilder, DTColumnBuilder) {
    $scope.select = {};
    $scope.action = {};
    $scope.form = {};

    $scope.form.productId = $location.$$search.id;
    $scope.form.productCode = $location.$$search.code;
    $scope.asyncFlag = null;

    /*
     创建表格选项
     */
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/xinghuoproduct/tableExtendProductSaleSite.shtml',
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
        DTColumnBuilder.newColumn('userId').withTitle('理财经理ID').withOption('sWidth', '100px'),
        DTColumnBuilder.newColumn('realName').withTitle('理财经理姓名').withOption('sWidth','180px'),
        DTColumnBuilder.newColumn('mobile').withTitle('手机号').withOption('sWidth','220px'),
        DTColumnBuilder.newColumn('storeCode').withTitle('店铺ID').withOption('sWidth','130px'),
        DTColumnBuilder.newColumn('storeName').withTitle('店铺名称').withOption('sWidth','160px'),
        DTColumnBuilder.newColumn('id').withTitle('操作').withOption('sWidth', '150px').renderWith(function(data, type, full) {
            return '<div class="col-lg-12 col-xs-12 ui_center"><a href="javascript:;" data-href="/xinghuoproduct/deleteExtendProductSaleSite.shtml?id=' + data + '" class="btn btn-danger btn-xs js_extendProductSaleSite_delete">删除</a></div>';
        })
    ];
    $scope.action.search = function(){
        vm.dtInstance.rerender();
    };
    function fnDrawCallback(){
        var ModalCtrl = function($scope, $modalInstance, form) {
            $scope.ok = function() {
                var idInput = $("#js_sale_site_add_id"), mobileInput = $("#js_sale_site_add_mobile");
                if(!tools.Validator($("#js_sale_site_add_id, #js_sale_site_add_mobile"))) return false;
                var data = $.extend({}, form, {
                    mobile: mobileInput.val(),
                    userId: idInput.val()
                });
                var self = this;
                if(!tools.ajaxLocked(self)) return;

                $.ajax({
                    type: "post",
                    url: siteVar.serverUrl + "/xinghuoproduct/saveOneExtendProductUser.shtml",
                    data: data,
                    dataType: "json",
                    success: function(data){
                        tools.ajaxOpened(self);
                        $modalInstance.close();
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
                });
            };
            $scope.cancel = function() {
                $modalInstance.close();
            };
        };

        $("#js_extendProduct_down_template").on("click", function(){
            tools.export(this);
        });

        var table = $("#dataTables"), tbody = table.find("tbody");
        table.off("click");

        $("#js_sale_site_add").off("click").on("click", function () {
            var self = this;
            if(!tools.ajaxLocked(self)) return;
            var modalInstance = $modal.open({
                backdrop: true,
                backdropClick: true,
                dialogFade: false,
                keyboard: true,
                templateUrl : 'myModalContent.html',
                controller : ModalCtrl,
                resolve:{
                    "form" : function(){
                        return $scope.form
                    }
                }
            });
            modalInstance.opened.then(function() {
                tools.ajaxOpened(self);
                if($scope.asyncFlag){
                    clearTimeout($scope.asyncFlag);
                };
                $scope.asyncFlag = setTimeout(function(){
                    var idInput = $("#js_sale_site_add_id"), mobileInput = $("#js_sale_site_add_mobile").eq(0);
                    idInput.Validator({hmsg: "请输入理财经理ID", regexp: /^\d{12}$/, showok: false, style: {placement: "top"}, emsg: "理财经理ID不能为空", rmsg: "请输入合法理财经理ID"});
                    mobileInput.Validator({hmsg: "请输入手机号", regexp: "phone", showok: false, style: {placement: "top"}, emsg: "手机号不能为空", rmsg: "请输入合法手机号码"});
                }, 0)

            });
        });

        $("#js_sale_site_import").off("click").on("click", function () {
            var fileInput = $("#js_file");
            if(!fileInput.val()) return alert("请选择导入文件");
            var nameArr = fileInput.val().split(".");
            if(!/xls/gi.test(nameArr[nameArr.length-1])) return alert("文件必须是excel文件，后缀名为xls或者xlsx!");
            var self = this;
            if(!tools.ajaxLocked(self)) return;
            $("#js_dialog_progress").modal({backdrop: 'static', keyboard: false});
            // tools.ajaxForm({
            //     "ele": $("#js_sale_site_form"),
            //     "action": siteVar.serverUrl + "/xinghuoproduct/importCheck.shtml",
            //     onComplete: function(data){
            //         tools.ajaxOpened(self);
            //         $("#js_dialog_progress").modal("hide");
            //         if(data.success){
            //             alert(data.msg);
            //             return vm.dtInstance.rerender();
            //         }else{
            //             alert(data.msg);
            //         };
            //     }
            // });

            var data = new FormData($("#js_sale_site_form")[0]);
            $.ajax({
                url : siteVar.serverUrl + "/xinghuoproduct/importCheck.shtml",
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
                    if(data.success){
                        alert(data.msg);
                        return vm.dtInstance.rerender();
                    }else{
                        alert(data.msg);
                    };
                }

            });

        });


        $("#js_sale_site_delete").off("click").on("click", function () {
            var data = tools.getFormele({}, $("#js_form")), len = tbody.find(".dataTables_empty").length;
            if(len > 0){
                return alert("暂时没有信息");
            };
            if(!confirm("你确定要删除该条信息么！")) return false;
            var self = this;
            if(!tools.ajaxLocked(self)) return;

            $.ajax({
                type: "post",
                url: siteVar.serverUrl + "/xinghuoproduct/deleteAllExtendProductSaleSite.shtml",
                data: data,
                dataType: "json",
                success: function(data){
                    tools.ajaxOpened(self);
                    if(data.success){
                        alert(data.msg);
                        return vm.dtInstance.rerender();
                    }else{
                        alert(data.msg);
                    }

                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });
            return false;
        });
        tbody.off("click").on("click", ".js_extendProductSaleSite_delete", function(){
            var self = $(this), href = self.attr("data-href"), data, url;
            data = tools.queryUrl(href);
            url = href.split('?')[0];
            if(!confirm("你确定要删除该条信息么！")) return false;
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
                        alert(data.msg);
                        return vm.dtInstance.rerender();
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
