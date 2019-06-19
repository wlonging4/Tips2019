'use strict';
function tabPerson($scope, getSelectListFactory, getProListFactory, tools, DTOptionsBuilder, DTColumnBuilder) {
    $scope.form = {

    };
    $scope.select = {};
    $scope.action = {};
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/xinghuodefaultrate/defaultPersonRate.shtml',
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
        DTColumnBuilder.newColumn('managerId').withTitle('理财经理ID').withOption('sWidth', '100px'),
        DTColumnBuilder.newColumn('managerName').withTitle('理财经理姓名').withOption('sWidth','100px'),
        DTColumnBuilder.newColumn('mobile').withTitle('手机号').withOption('sWidth','100px'),
        DTColumnBuilder.newColumn('documentNo').withTitle('身份证号').withOption('sWidth','120px'),
        DTColumnBuilder.newColumn('rateTmpName').withTitle('佣金费率模板').withOption('sWidth','120px').renderWith(function(data, type, full) {
            return '<a href="javascript:;" class="ui_ellipsis js_rateTemplate_info" title="' + data + '" key_html="' + full.rateRange+'">' + data + '</a>';
        }),
        DTColumnBuilder.newColumn('managerId').withTitle('操作').withOption('sWidth','80px').renderWith(function(data, type, full) {
            if(!data){ return "" };
            return '<div class="ui_center"><a href="javascript:;" data-href="/xinghuodefaultrate/editDefaultRatePerson.shtml?managerId=' + data + '" class="btn btn-success btn-xs infoDetail">修改</a><a href="javascript:;" data-href="/xinghuodefaultrate/removePersonRate.shtml?userId=' + data + '" class="btn btn-danger btn-xs js_site_delete">删除</a></div>'
        })
    ];
    $scope.action.reset = function(){
        for(var prop in $scope.form){
            delete $scope.form[prop];
        }
        vm.dtInstance.rerender();
    };
    tools.createModal();
    tools.createModalProgress();

    $scope.action.search = function(){
        vm.dtInstance.rerender();
    };

    ;(function(){
        $("#js_dialog").on("click", ".js_rate_person_save", function () {
            var self = this;
            if(!tools.ajaxLocked(self)) return;
            var data = tools.getFormele({}, $("#js_rate_person_form"));
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + "/xinghuodefaultrate/saveManagerInfo.shtml",
                data: data,
                dataType: "json",
                success: function(data){
                    tools.ajaxOpened(self);
                    //if(!tools.interceptor(data)) return;
                    if(data.success) {
                        alert(data.msg);
                        $("#js_dialog").modal("hide");
                        vm.dtInstance.rerender();
                    }else{
                        $("#js_dialog").modal("hide");
                        alert(data.msg);
                    }
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });

        });

        $("#js_default_rate_person_config").on("click", function () {
            var self = this;
            var popUp = $("#js_dialog"), popUpContent = popUp.find(".js_content");
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + "/xinghuodefaultrate/editDefaultRatePerson.shtml",
                data: {},
                dataType: "text",
                success: function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    popUpContent.html(data);
                    popUp.modal("show");
                    var id = popUp.find("input[name = 'managerId']"), name = popUp.find("#js_rate_dialog_realName"), mobile = popUp.find("#js_rate_dialog_mobile"), identity = popUp.find("#js_rate_dialog_identity");
                    id.Validator({hmsg: "请输入理财经理ID", regexp: /^\d{12}$/, showok: false, style: {placement: "top"}, emsg: "理财经理ID不能为空", rmsg: "请输入合法理财经理ID", fn: function(v, tag) {
                        var self = this;
                        var data = {"userId": v};
                        var flag = true;
                        name.val("");
                        mobile.val("");
                        identity.val("");
                        if(!tools.ajaxLocked(self)) return;
                        $.ajax({
                            type: "post",
                            url: siteVar.serverUrl + "/xinghuodefaultrate/getManagerInfo.shtml",
                            data: data,
                            async: false,
                            dataType: "json",
                            success: function(data){
                                tools.ajaxOpened(self);
                                if(!tools.interceptor(data)) return;
                                if(data.success) {
                                    name.val(data.data.realname);
                                    mobile.val(data.data.mobile);
                                    identity.val(data.data.documentno);
                                };
                                flag = true;
                            },
                            error: function(err){
                                tools.ajaxOpened(self);
                                tools.ajaxError(err);
                                flag = flase;
                                self.fnmsg = "网络错误，请重新输入！";
                            }
                        });

                        return flag;


                    }, fnmsg: ""});
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });
        });
    })();
    function fnDrawCallback(){

        tools.createModal();
        tools.createModalProgress();
        var popUpLayer = $("#js_dialog"), popUpLayerContent = popUpLayer.find(".js_content");
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
        $('.js_rateTemplate_info').each(function () {
            var html = $(this).attr("key_html");
            $(this).popover({"trigger": "hover", "container": "body", "placement": "left", "html": true, "content": html});
        });
        tbody.on("click", ".js_site_delete", function () {
            if(!confirm("您确定要删除该理财经理的费率配置么?")) return false;
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
                    data = eval('(' + data + ')');
                    if(data.success) {
                        alert(data.msg);
                        vm.dtInstance.rerender();
                    }
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            })

        });

        $("#js_dialog").on("change", '[name="rateTemplateId"]', function () {

            var self = this;
            if(!tools.ajaxLocked(self)) return;

            var data = {"rateTemplateId": this.value};

            $.ajax({
                type: "post",
                url: siteVar.serverUrl + "/xinghuodefaultrate/getRateRangeInfoForCreateRatePage.shtml",
                data: data,
                dataType: "text",
                success: function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    $("#rateRangeDiv").html(data);
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });

        });
    }

}
