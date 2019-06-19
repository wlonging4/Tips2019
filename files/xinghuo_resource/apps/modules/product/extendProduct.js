'use strict';
function extendProduct($scope, tools, DTOptionsBuilder, DTColumnBuilder) {
    var domForm = $("#js_form"), conditionItem = domForm.find(".form-group");
    $scope.form = {
        isShow: (conditionItem.length > 6) ? true : false
    };
    $scope.select = {};
    $scope.action = {};
    $scope.isShow = true;
    $scope.formTitle = "新增保险产品";
    /*
     创建表格选项
     */
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/xinghuoproduct/tableExtendProducts.shtml',
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
        .withOption('scrollX',false)
        .withLanguage(tools.dataTablesLanguage)
        .withOption('fnDrawCallback', fnDrawCallback)
        .withPaginationType('simple_numbers');
    vm.dtColumns = [
        DTColumnBuilder.newColumn('sequence').withTitle('排序').withOption('sWidth', '40px'),
        DTColumnBuilder.newColumn('code').withTitle('产品编号').withOption('sWidth','190px'),
        DTColumnBuilder.newColumn('name').withTitle('产品名称').withOption('sWidth','auto'),
        DTColumnBuilder.newColumn('iconURL').withTitle('产品图片').withOption('sWidth','60px').renderWith(function(data, type, full) {
            if(!data) return "";
            return '<a href="' + data + '" target="_blank">预览图片<a>';
        }),
        DTColumnBuilder.newColumn('createTime').withTitle('发布时间').withOption('sWidth','140px').renderWith(function(data, type, full) {
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('statusStr').withTitle('状态').withOption('sWidth','40px'),
        DTColumnBuilder.newColumn('sequence').withTitle('操作').withOption('sWidth', '110px').renderWith(function(data, type, full) {
            return '<div class="ui_center"><a href="javascript:;" data-href="/xinghuoproduct/saveOrUpdateExtendProduct.shtml?code=' + full.code + '" class="btn btn-danger btn-xs js_insuranceGood_update">修改</a>'+
                '<a href="#xinghuoproduct-saleSite.html?code=' + full.code + '&id=' + full.id + '" class="btn btn-success btn-xs saleSite">销售配置</a></div>';
        })
    ];
    $scope.action.add = function(){
        $scope.isShow = false;
        $scope.formTitle = "新增保险产品";
    };
    $scope.action.search = function(){
        vm.dtInstance.rerender();
    };
    ;(function(){
        var insuranceGoodForm = $("#js_insuranceGood_add_form"), radio = insuranceGoodForm.find("[name='status']"), age = insuranceGoodForm.find("[name='age']"), price = insuranceGoodForm.find("[name='price']"), sequence = insuranceGoodForm.find("[name='sequence']");
        radio.uniform();
        age.Validator({IsValidate: false, hmsg: "请输入投保年龄", showok: false,regexp: /^[1-9]\d*$/, rmsg:"数量必为正整数", style: {placement: "top"}});
        price.Validator({IsValidate: false, hmsg: "请输入投保年龄", showok: false,regexp: /^[1-9]\d*$/, rmsg:"数量必为正整数", style: {placement: "top"}});
        sequence.Validator({IsValidate: false, hmsg: "请输入投保年龄", showok: false,regexp: /^[1-9]\d*$/, rmsg:"数量必为正整数", style: {placement: "top"}});

    })();
    function fnDrawCallback(){
        var table = $("#dataTables"), tbody = table.find("tbody"), insuranceGoodForm = $("#js_insuranceGood_add_form"), formContent = insuranceGoodForm.html();
        table.off("click");

        tbody.on("click", ".js_insuranceGood_update", function(){
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
                    insuranceGoodForm.html(data);
                    $scope.$apply(function(){
                        $scope.isShow = false;
                        $scope.formTitle = "修改保险产品";
                    });

                    var radio = insuranceGoodForm.find("[name='status']");
                    radio.uniform();
                    var radioWrapper = insuranceGoodForm.find(".radio");
                    radioWrapper.css("padding-top", "2px");

                    insuranceGoodForm.find("[name='name']").Validator({hmsg: "请输入产品名称", regexp: /^[\s|\S]{0,256}$/, showok: false, style: {placement: "top"}, emsg: "产品名称为空", rmsg: "请输入产品名称"});

                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });

        });
        $("#js_insuranceGood_add_save").on("click", function () {
            var nameInput = insuranceGoodForm.find("[name='name']"), filenameInput = insuranceGoodForm.find("[name='uploadFile']"), reg = /^[1-9]\d*$/, age = insuranceGoodForm.find("[name='age']"), price = insuranceGoodForm.find("[name='price']"), sequence = insuranceGoodForm.find("[name='sequence']");
            var postUrl = "/xinghuoproduct/saveExtendProduct.shtml";
            if(!nameInput.val()) return alert("请填写产品名称！");
            var filename = filenameInput.val();
            var filetype = filename.split(".")[filename.split(".").length-1];
            if(!filename && !$("#js_view_picture").length) return alert("请选择上传图片!");
            if(!!filename && filetype != "jpg" && filetype != "jpeg" && filetype != "png" && filetype != "bmp") return alert("您上传的图片格式不对!");
            if(age.val() && (!reg.test(age.val()))){
                return alert("投保年龄必须为正整数！");
            };
            if(price.val() && (!reg.test(price.val()))){
                return alert("产品价格必须为正整数！");
            };
            if(sequence.val() && (!reg.test(sequence.val()))){
                return alert("排序必须为正整数！");
            };

            var self = this;
            if(!tools.ajaxLocked(self)) return;

            $("#js_dialog_progress").modal({backdrop: 'static', keyboard: false});
            // tools.ajaxForm({
            //     "ele": $("#js_insuranceGood_add_form"),
            //     "action": siteVar.serverUrl + postUrl,
            //     onComplete: function(data){
            //         tools.ajaxOpened(self);
            //         $("#js_dialog_progress").modal("hide");
            //         if(!tools.interceptor(data)) return;

            //         if(data.success){
            //             alert(data.msg);
            //             return window.location.reload();
            //         }
            //     }
            // });

            var data = new FormData($("#js_insuranceGood_add_form")[0]);
            $.ajax({
                url : siteVar.serverUrl + postUrl,
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
                        alert(data.msg);
                        return window.location.reload();
                    }
                }

            });
        });
        $("#js_insuranceGood_add_cancel").on("click", function () {
            insuranceGoodForm.html(formContent);
            $scope.$apply(function(){
                $scope.isShow = true;
            });
        });

        //$(".saleSite").on("click", function(){
        //    var code = $(this).data("code"), id = $(this).data("id");
        //    console.log(code)
        //    $state.go("saleSite",{
        //        "obj":{
        //            "code" : code,
        //            "id" : id
        //        }
        //    })
        //});
    }
}
