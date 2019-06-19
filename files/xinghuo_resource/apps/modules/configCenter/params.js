'use strict';
function params($scope, $http, $modal, getProListFactory, tools, DTOptionsBuilder, DTColumnBuilder) {
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


    /*
     创建表格选项
     */
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/xinghuosite/tableParams.shtml',
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
        DTColumnBuilder.newColumn('ename').withTitle('参数').withOption('sWidth','120px').renderWith(function(data, type, full) {
            if(!data) return "";
            return '<a href="javascript:void(0)" class="infoDetail ui_ellipsis" title="' + data + '" data-href="/xinghuosite/paramInfo.shtml?id=' + full.id + '">' + data + '</a>';
        }),
        DTColumnBuilder.newColumn('cname').withTitle('参数名称').withOption('sWidth','160px').renderWith(function(data,type,full){
            if(!data) return "";
            return '<span class="ui_ellipsis" title="' + data + '">' + data + '</span>';
        }),
        DTColumnBuilder.newColumn('value').withTitle('参数值').withOption('sWidth','140px').renderWith(function(data, type, full) {
            if(!data) return "";
            return '<div class="ui_ellipsis" title="' + data + '">' + data + '</div>';
        }),
        DTColumnBuilder.newColumn('updatetime').withTitle('修改时间').withOption('sWidth','140px').renderWith(function(data, type, full) {
                if(!data) return "";
                return tools.toJSDate(data);
            }),
        DTColumnBuilder.newColumn('id').withTitle('操作').withOption('sWidth','60px').renderWith(function(data, type, full) {
            if(!data) return "";
            var detail = encodeURIComponent(JSON.stringify(full))
            return '<div class="text-center"><a href="javascript:;" class="btn btn-success btn-xs js_params_edit" data-detail="' + detail + '">修改</a></div>';
        })
    ];
    var ModalCtrl = function($scope, $modalInstance, form) {
        $scope.form = form;
        $scope.init = function(){
            var formDom = $("#js_modify_params_form"), ename = formDom.find("[name='ename']"), cname = formDom.find("[name='cname']"), value = formDom.find("[name='value']");
            ename.Validator({hmsg: "请填写参数", regexp: /^[\s|\S]{1,50}$/, showok: false, style: {placement: "top"}, emsg: "参数不能为空", rmsg: "参数不合法"});
            cname.Validator({hmsg: "请填写参数名称", regexp: /^[\s|\S]{1,50}$/, showok: false, style: {placement: "top"}, emsg: "参数名称不能为空", rmsg: "参数名称不合法"});
            //value.Validator({hmsg: "请填写参数值", regexp: /^[\s|\S]+$/, showok: false, style: {placement: "top"}, emsg: "参数值不能为空", rmsg: "参数值不合法"});

        };
        $scope.ok = function() {
            var self = $("#confirmBtn"), formDom = $("#js_modify_params_form"), idDom = formDom.find("[name='id']"), ename = formDom.find("[name='ename']"), cname = formDom.find("[name='cname']"), value = formDom.find("[name='value']");
            //if(!tools.Validator(ename) || !tools.Validator(cname) || !tools.Validator(value)){
            if(!tools.Validator(ename) || !tools.Validator(cname)){
                return false;
            };
            idDom.val(form.id);
            var data = tools.getFormele({}, formDom);
            if(!tools.ajaxLocked(self)) return;
            $modalInstance.close();
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + "/xinghuosite/modifyParam.shtml",
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
        };
        $scope.cancel = function() {
            $modalInstance.close();
        };
    };
    $scope.action.build = function(e){
        var currentDom = $(e.currentTarget), data = currentDom.attr("data-detail");
        data = data ? JSON.parse(decodeURIComponent(data)) : {};
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
        table.on("click", ".js_params_edit", function(e){
            $scope.action.build(e);
        });
    }
}
