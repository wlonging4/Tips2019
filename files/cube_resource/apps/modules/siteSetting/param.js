'use strict';
function paramsController($scope, $modal, tools, DTOptionsBuilder, DTColumnBuilder) {
    var domForm = $("#js_form");
    $scope.form = {};
    $scope.select = {};
    $scope.action = {};
    tools.createModal();
    tools.createModalProgress();
    var popUpLayer = $("#js_dialog"), popUpLayerContent = popUpLayer.find(".js_content");
    $scope.action.search = function(){
        vm.dtInstance.rerender();
    };
    $scope.action.reset = function(){
        for(var prop in $scope.form){
            delete $scope.form[prop];
        }
        vm.dtInstance.rerender();
    };
    /*
     创建表格选项
     */
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax',{
            url: siteVar.serverUrl+'param/queryForPage.json',
            type: 'POST',
            data: $scope.form,
        })
        .withDataProp('data')
        .withOption('createdRow', function(row, data, dataIndex) {
            angular.element(row).addClass("rows" + data.id)
        })
        .withOption('searching',false)
        .withOption('ordering',false)
        .withOption('serverSide',true)
        .withOption('processing',true)
        .withOption('scrollX',true)
        .withLanguage(tools.dataTablesLanguage)
        .withOption('fnDrawCallback', fnDrawCallback)
        .withPaginationType('simple_numbers');
    vm.dtColumns = [
        DTColumnBuilder.newColumn('code').withTitle('参数').withOption('sWidth','80px'),
        DTColumnBuilder.newColumn('name').withTitle('参数名称').withOption('sWidth','160px'),
        DTColumnBuilder.newColumn('value').withTitle('参数值').withOption('sWidth','160px').renderWith(function(data,type,full){
           return '<span class="ui_ellipsis" style="width: 160px;" title="'+data+'">'+data+'</span>';
        }),
        DTColumnBuilder.newColumn('description').withTitle('参数描述').withOption('sWidth','160px').renderWith(function(data,type,full){
            if(!data) return "";
            return '<span class="ui_ellipsis" style="width: 160px;" title="'+data+'">'+data+'</span>';
        }),
        DTColumnBuilder.newColumn('updateTime').withTitle('修改时间').withOption('sWidth','80px').renderWith(function(data, type, full) {
                if(!data) return "";
                return tools.toJSDate(data);
            }),
        DTColumnBuilder.newColumn('id').withTitle('操作').withOption('sWidth','90px').renderWith(function(data, type, full) {
            if(!data) return "";
            var detail = encodeURIComponent(JSON.stringify(full))
            return '<div class="text-center"><a href="javascript:;" class="btn btn-success btn-xs js_params_edit" data-id="' + data + '">修改</a></div>';
        })
    ];
    var ModalCtrl = function($scope, $modalInstance, form) {
        if(form.id){
            $.ajax({
                url: siteVar.serverUrl+'param/detail.json',
                data: {id:form.id},
                method: "post"
            }).then(function(data){
                if(!tools.interceptor(data)) return;
                $scope.$apply(function(){
                    $scope.form = data.data;
                });
            })
        }
        $scope.init = function(){
            var formDom = $("#js_modify_params_form"), code = formDom.find("[name='code']"), name = formDom.find("[name='name']"), value = formDom.find("[name='value']"), desciption = formDom.find("[name='description']");
            code.Validator({hmsg: "请填写参数", regexp: /^[\s|\S]{1,50}$/, showok: false, style: {placement: "top"}, emsg: "参数不能为空", rmsg: "参数不合法"});
            name.Validator({hmsg: "请填写参数名称", regexp: /^[\s|\S]{1,50}$/, showok: false, style: {placement: "top"}, emsg: "参数名称不能为空", rmsg: "参数名称不合法"});
            value.Validator({hmsg: "请填写参数值", regexp: /^[\s|\S]+$/, showok: false, style: {placement: "top"}, emsg: "参数值不能为空", rmsg: "参数值不合法"});
        };
        $scope.ok = function() {
            var self = $("#confirmBtn"), formDom = $("#js_modify_params_form"), idDom = formDom.find("[name='id']"), code = formDom.find("[name='code']"), name = formDom.find("[name='name']"), value = formDom.find("[name='value']"), description = formDom.find("[name='description']");
            if(!tools.Validator(code) || !tools.Validator(name) || !tools.Validator(value)){
                return false;
            };
            idDom.val(form.id);
            var data = tools.getFormele({}, formDom);
            if(!tools.ajaxLocked(self)) return;
            var url = form.id ? "param/update.json":"param/add.json";
            $modalInstance.close();
            $.ajax({
                type: "post",
                url: siteVar.serverUrl+url,
                data: data,
                dataType: "json",
                success: function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    if(data.success){
                        location.reload();
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
    $scope.action.build = function(e){
        var currentDom = $(e.currentTarget), data = currentDom.attr("data-id");
        data = data ? {"id":data} : {};
        $modal.open({
            backdrop: true,
            backdropClick: true,
            dialogFade: false,
            keyboard: true,
            templateUrl : 'myModalContent.html',
            controller : ModalCtrl,
            resolve:{
                "form": function(){
                    return data;
                }
            }
        });
    };
    function fnDrawCallback(){
        if(!tools.interceptor(window.ajaxDataInfo)) return;
        var table = $("#dataTables");
        table.off("click", ".js_params_edit");
        table.on("click", ".js_params_edit", function(e){
            $scope.action.build(e);
        });
        tools.resetWidth();
    }
}
