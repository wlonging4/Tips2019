'use strict';

function ratetemplate($scope, getSelectListFactory, getProListFactory, tools, DTOptionsBuilder, DTColumnBuilder) {
    var domForm = $("#js_form"),
        conditionItem = domForm.find(".form-group");
    $scope.form = {

    };
    $scope.select = {};
    $scope.action = {};



    /*
     创建表格选项
     */
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax', {
            url: siteVar.serverUrl + '/xinghuoproduct/tableRatetemplate.shtml',
            type: 'POST',
            data: $scope.form
        })
        .withDataProp('data')
        .withOption('createdRow', function(row, data, dataIndex) {
            angular.element(row).addClass("rows" + data.id)
        })
        .withOption('searching', false)
        .withOption('ordering', false)
        .withOption('serverSide', true)
        .withOption('processing', false)
        .withOption('scrollX', false)
        .withLanguage(tools.dataTablesLanguage)
        .withOption('fnDrawCallback', fnDrawCallback)
        .withPaginationType('simple_numbers');
    vm.dtColumns = [
        DTColumnBuilder.newColumn('id').withTitle('模板ID').withOption('sWidth', '160px'),
        DTColumnBuilder.newColumn('name').withTitle('模板名称').withOption('sWidth', '200px'),
        DTColumnBuilder.newColumn('id').withTitle('费率').withOption('sWidth', '160px').renderWith(function(data, type, full) {
            if (!data) {
                return ""
            };
            return '<a target="_blank" href="javascript:void(0);" class="infoDetail" data-href="/xinghuoproduct/templateinfo.shtml?rateTemplateId=' + data + '">查看费率</a>';
        }),
        DTColumnBuilder.newColumn('createTime').withTitle('添加时间').withOption('sWidth', '140px').renderWith(function(data, type, full) {
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('creatorName').withTitle('管理员').withOption('sWidth', '100px')
    ];
    $scope.action.reset = function() {
        for (var prop in $scope.form) {
            delete $scope.form[prop];
        }
        vm.dtInstance.rerender();
    };
    tools.createModal();
    tools.createModalProgress();
    var popUpLayer = $("#js_dialog"),
        popUpLayerContent = popUpLayer.find(".js_content");
    $scope.action.addTemplate = function() {
        var self = $("#js_add_rate_template");
        if (!tools.ajaxLocked(self)) return;
        $.ajax({
            type: "post",
            url: siteVar.serverUrl + "/xinghuoproduct/toaddratetemplate.shtml",
            data: {},
            dataType: "text",
            success: function(data) {
                tools.ajaxOpened(self);
                if (!tools.interceptor(data)) return;
                popUpLayerContent.html(data);
                popUpLayer.modal("show");


                table();
                $("#js_dialog #js_add_rate_ran").attr("key", "open");

            },
            error: function(err) {
                tools.ajaxOpened(self);
                tools.ajaxError(err);
            }
        })
    };
    $scope.action.search = function() {
        vm.dtInstance.rerender();
    };;
    (function() {
        popUpLayerContent.on("click", "#js_add_rate_ran", function() {
            table();
        });

        popUpLayerContent.on("click", "#js_save_raterang_table .js_delete", function() {
            var p = $(this).parents("tr");
            if (p.index() != p.parent().find("tr").length - 1) {
                return $("#js_dialog #js_add_rate_ran").attr("key", "close");
            };
            p.remove();
            return $("#js_dialog #js_add_rate_ran").attr("key", "close");
        });

        popUpLayerContent.on("click", "#js_save_raterang_table .js_add", function() {

            var p = $(this).parents("tr");
            var inputs = p.find("input");

            if (!tools.Validator(p.find(".js_need_validator"))) return false;
            var num = Number(inputs[2].value) + Number(inputs[3].value);

            if (num > 10) {
                alert("基础费率与浮动费率之和不得大于10%");
                return false;
            }
            var str = '<tr class="js_rate_template_row"><td val="' + inputs[0].value + '">&gt;=' + inputs[0].value + '</td><td val="' + inputs[1].value + '">&lt;' + inputs[1].value + '</td><td val="' + inputs[2].value + '">' + inputs[2].value + '%</td><td val="' + inputs[3].value + '">' + inputs[3].value + '%</td><td ><a href="javascript:;" class="btn btn-danger btn-sm js_delete" style="margin:0px auto;">删除</a></td></tr>';
            str = $(str)
            $(this).parents("tbody").append(str);
            p.remove();
            return $("#js_dialog #js_add_rate_ran").attr("key", "close");
        });

        popUpLayerContent.on("click", "#js_save_ratetemplate_submit", function() {
            var templateRow = [],
                form = $("#js_save_template_form"),
                nameInput = form.find("[name='name']");
            $("#js_save_raterang_table .js_rate_template_row").each(function(i, e) {
                var tds = $(this).find("td");
                templateRow.push({
                    "startamount": tds.eq(0).attr("val"),
                    "endamount": tds.eq(1).attr("val"),
                    "baseChargerate": tds.eq(2).attr("val"),
                    "floatChargerate": tds.eq(3).attr("val")
                });
            });
            if (!nameInput.val()) return alert("模板名称不能为空！");
            if (!templateRow.length) return alert("费率不能为空！");
            var data = tools.getFormele({}, $("#js_save_template_form"));
            $.extend(true, data, {
                "rateRangeList": templateRow
            });
            var _this = this;
            if (!tools.ajaxLocked(_this)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + "/xinghuoproduct/addRatetemplate.shtml",
                data: JSON.stringify(data),
                dataType: "json",
                contentType: 'application/json',
                mimeType: 'application/json',
                success: function(data) {
                    if (data.success) {
                        $("#js_dialog").modal("hide");
                        alert("保存成功！");
                        tools.ajaxOpened(_this);
                        vm.dtInstance.rerender();

                    } else if (!data.success) {
                        if (data.errorcode == "101") return window.location.reload();
                        alert(data.msg);
                        tools.ajaxOpened(_this)
                    }
                },
                error: function(err) {
                    tools.ajaxOpened(_this);
                    tools.ajaxError(err);
                }
            })

        })



    })();

    function fnDrawCallback() {

        var table = $("#dataTables"),
            tbody = table.find("tbody");
        table.off("click");
        tbody.on("click", ".infoDetail", function() {
            var self = $(this),
                href = self.attr("data-href"),
                data, url;
            data = tools.queryUrl(href);
            url = href.split('?')[0];
            if (!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + url,
                data: data,
                dataType: "text",
                success: function(data) {
                    tools.ajaxOpened(self);
                    if (!tools.interceptor(data)) return;
                    popUpLayerContent.html(data);
                    popUpLayer.modal("show");
                },
                error: function(err) {
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            })
        });
    }

}

function table() {
    
    var rateTable = $("#js_save_raterang_table"),
        rateTbody = rateTable.find("tbody");
    if ($("#js_add_rate_ran").attr("key") == "open") return;
    $(this).attr("key", "open");
    var trs = rateTbody.find("tr"),
        firstVlaue = 0;
    if (trs.length > 0) {
        var str = trs.eq(trs.length - 1).find('td').eq(1).text();
        firstVlaue = str.substring(1, str.length);
    };
    var html = "<tr>";
    html += '<td><input type="text" class="form-control" readonly value="' + firstVlaue + '"></td>';
    html += '<td><input type="text" class="form-control js_need_validator"></td>';
    html += '<td style="padding-left:0px;padding-right:0px;"><div class="col-xs-10" ><input type="text" class="form-control js_need_validator"></div><span class="fn-ms" style="line-height: 34px; color: #cc0000;">%</span></td>';
    html += '<td style="padding-left:0px;padding-right:0px;"><div class="col-xs-10"><input type="text" class="form-control js_need_validator"></div><span class="fn-ms" style="line-height: 34px; color: #cc0000;">%</span></td>';
    html += '<td><table><tr style="    background-color: transparent;"><td style="padding:0px"><a href="javascript:;" class="btn btn-success btn-xs js_add">保存</a></td><td style="padding:0px"><a href="javascript:;" class="btn btn-danger btn-xs js_delete" >删除</a></td></tr></table></td>';
    html += '</tr>';
    html = $(html);
    rateTbody.append(html);
    var inputDom = html.find(".js_need_validator");
    inputDom.eq(0).Validator({
        hmsg: "请输入推荐费基数",
        regexp: /^([1-9]{1}[0-9]{0,8})$|0/,
        showok: false,
        style: {
            placement: "top"
        },
        emsg: "推荐费基数不能为空",
        rmsg: "推荐费基数不能超过9位整数",
        fn: function(v, tag) {
            return (firstVlaue < v * 1);
        },
        fnmsg: "最高推荐费基数必须大与起始推荐基数"
    });
    inputDom.eq(1).Validator({
        hmsg: "请输入基础费率",
        regexp: /^((10|10\.00)|0|([1-9]{1})|([0-9]{1}\.[0-9]{1,2}))$/,
        showok: false,
        style: {
            placement: "top"
        },
        emsg: "基础费率系数不能为空",
        rmsg: "基础费率系数必须小于等于10，小数只保留2位"
    });
    inputDom.eq(2).Validator({
        hmsg: "请输入浮动费率系数",
        regexp: /^((10|10\.00)|0|([1-9]{0})|([0-9]{1}\.[0-9]{1,2}))$/,
        showok: false,
        style: {
            placement: "top"
        },
        emsg: "浮动费率系数不能为空",
        rmsg: "浮动费率系数必须小于等于10，小数只保留2位"
    });

}