'use strict';

function intoProductRatePage($scope, $timeout, $location, $state, $http, getSelectListFactory, getProListFactory, tools, DTOptionsBuilder, DTColumnBuilder) {
    var domForm = $("#js_form"),
        conditionItem = domForm.find(".form-group");
    $scope.form = {
        isShow: (conditionItem.length > 6) ? true : false,
        subProduct: {}
    };

    $scope.isNew = false;
    $scope.isJX = false;
    $scope.isYXB = false;
    $scope.isEdit = false;
    //$scope.levelShow = false
    $scope.select = {};
    $scope.action = {};
    $scope.allUserLevelRateTempList = [];
    tools.createModal();
    tools.createModalProgress();
    var popUpLayer = $("#js_dialog"),
        popUpLayerContent = popUpLayer.find(".js_content");
    var prams = $.extend({}, $location.$$search);
    if (!!prams.subproductId) {
        $scope.subproductId = prams.subproductId;
    };
    if (!!prams.productid) {
        $scope.productid = prams.productid;
    };
    var selectList = getSelectListFactory.getSelectList(['biz_sys_route', 'buyuser', 'productsalestatus']);
    selectList.then(function(data) {
        $scope.select.biz_sys_route = data.appResData.retList[0].biz_sys_route;
        $scope.select.buyuser = data.appResData.retList[1].buyuser;
        $scope.select.productsalestatus = data.appResData.retList[2].productsalestatus;
    }).then(function() {
        if (prams.subproductId && prams.productid) {
            $scope.isEdit = true;
            var reqData = $.param({
                data: JSON.stringify({
                    'appReqData': prams
                })
            });
            $http({
                method: "POST",
                url: siteVar.serverUrl + "/xinghuopageapi/getProRateInfo.json",
                data: reqData,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            }).success(function(data, status) {
                if (data.result != 'SUCCESS') {
                    alert("获取产品列表失败，请与管理员联系。" + data.msg);
                    return;
                };
                var res = data.appResData;
                console.log(res)

                $scope.productname = res.productname;
                $scope.name = res.name;
                $scope.allUserLevelRateTempList = res.allUserLevelRateTempList;
                $scope.userLevelRateTemplateRelMap = res.userLevelRateTemplateRelMap;
                $scope.ul = res.ul;
                $scope.vipUserInfo = res.vipUserInfo;
                $scope.subStatus = res.status;
                $scope.isNew = (function() {
                    return res.name.indexOf("新手专享") > -1;
                })();
                $scope.showVip = (function() {
                    return res.vipUserInfo && res.vipUserInfo.limitcount > 0;
                })();
                $scope.form.subProduct.isRemittance = res.isRemittance;
                $scope.chooseUserType = function() {
                    var select = $("#rateTypeIndex"),
                        selectVal = select.val(),
                        divRateProductVIP = $("#divRateProductVIP");
                    if (selectVal == 2) {
                        $scope.showVip = true;
                    } else {
                        $scope.showVip = false;
                    }
                };
                if (!$scope.isNew) {
                    $scope.form.rateTypeIndex = res.rateType === null ? '' : res.rateType;
                };
                $scope.form.subProduct.xhStatus = res.xhStatus;
                $scope.form.subProduct.bizSysRoute = res.bizSysRoute === null ? '' : res.bizSysRoute;
                $scope.select.settleList = res.settleList;

                var settleFlag = false;
                if (res.settlementType != null) {

                    if (res.settleList && res.settleList.length > 0) {
                        angular.forEach(res.settleList, function(data, index, array) {
                            if (data.key == res.settlementType) {
                                settleFlag = true;
                            };
                        });
                    }
                };
                $scope.form.settleTypeIndex = settleFlag ? res.settlementType : '';
                // 如果是散标，佣金结算方式默认为单笔-封闭期月结&期外不结算
                if(res.category === 999){
                    $scope.form.settleTypeIndex = '4';
                }
                $scope.form.ratio = res.ratio;
                $scope.form.subProduct.variableAnnualRate = res.variableAnnualRate;
                $scope.form.subProduct.annualrate = res.annualrate;
                $scope.form.outVar = res.variableAnnualRate && res.variableAnnualRate > 0 ? 1 : 0;

                $scope.form.baseAnnua = Number($scope.form.subProduct.annualrate - $scope.form.subProduct.variableAnnualRate).toFixed(2);
                if ($scope.form.baseAnnua < 0) {
                    $scope.form.baseAnnua = 0;
                };
                $scope.count = function() {
                     var variableAnnualRate=Number($scope.form.subProduct.variableAnnualRate);
                    if (variableAnnualRate <= 0) {
                        tools.interalert("加息率不可小于等于0");
                        return false;
                    }

                    if ($scope.form.subProduct.variableAnnualRate == undefined || $scope.form.subProduct.variableAnnualRate == "") {
                        tools.interalert("请输入加息率");
                        return false;
                    }
                    $scope.form.baseAnnua = Number($scope.form.subProduct.annualrate - $scope.form.subProduct.variableAnnualRate).toFixed(2);


                    var reg = /^\d+(\.\d{1,2})?$/;
                    if (!reg.test(variableAnnualRate)) {
                        tools.interalert("加息率不可超过2位小数");

                    };
                    // if ($scope.form.subProduct.variableAnnualRate <= 0) {
                    //     tools.interalert("加息率不可小于等于0");
                    //     return false;
                    // }
                    if ($scope.form.baseAnnua < 0) {
                        $scope.form.baseAnnua = 0;
                        tools.interalert("加息率需小于等于原始预计年化收益率");
                        return false;
                    }


                }
                $scope.isJX = (function() {
                    return res.categoryKey && res.categoryInPC && (res.categoryKey == 5 || (res.source == 1 && (res.categoryInPC == 10 || res.category == 11)));
                })();
                $scope.isYXB = (function() {
                    return res.isYixinbao == 0;
                })();
                $scope.form.serviceRate = res.serviceRate || "YXB_zixunfuwufeilv_def";

                $scope.form.levelCheckbox = (function() {
                    return (res.userLevelRateTemplateRelList && res.userLevelRateTemplateRelList.length > 0) ? 1 : 0;
                })();
                $scope.allLevel = function() {
                    var btn = $("#js_goodRate_level_all"),
                        allInput = $("#js_goodRate_level_table input[type='checkbox']");
                    if (btn.hasClass("disabled")) {
                        return false;
                    };
                    if (!btn.is(':checked')) {
                        allInput.prop("checked", false).uniform();
                    } else {
                        allInput.prop("checked", true).uniform();
                    }
                };
                $scope.levelShow = (function() {
                    if (res.userLevelRateTemplateRelList && res.userLevelRateTemplateRelList.length > 0) {
                        $("#js_goodRate_config_level").prop('checked', true).uniform();
                    };
                    return res.userLevelRateTemplateRelList && res.userLevelRateTemplateRelList.length > 0;
                })();
                $scope.form.personCheckbox = (function() {
                    return (res.ul && res.ul.length > 0) ? 1 : 0;
                })();
                $scope.personShow = (function() {
                    if (res.ul && res.ul.length > 0) {
                        $("#js_goodRate_config_person").prop('checked', true).uniform();
                    };
                    return res.ul && res.ul.length > 0;
                })();



                $timeout(function() {
                    $("#js_goodRate_level_table").find("input[type='checkbox']").uniform();
                    $('.js_rateTemplate_info').each(function() {
                        $(this).popover({
                            "trigger": "hover",
                            "container": "body",
                            "placement": "left",
                            "html": true
                        });
                    });

                    var subStatus = $("[name='subStatus']"),
                        subStatusVal = subStatus.val(),
                        form = $("#js_form"),
                        levelBtn = $("#js_goodRate_config_level"),
                        personBtn = $("#js_goodRate_config_person"),
                        saveBtn = $("#js_goodRate_save"),
                        selectAllBtn = $("#js_goodRate_level_table thead input[type='checkbox']");
                    if (subStatusVal != 0) {
                        form.find("input, textarea").each(function() {
                            $(this).attr("readonly", "readonly");
                        });
                        form.find("input[type='checkbox']").each(function() {
                            $(this).attr("onclick", "return false");
                        });
                        form.find("select").each(function() {
                            $(this).attr({
                                "onchange": "this.selectedIndex=this.defaultIndex;",
                                "onfocus": "this.defaultIndex=this.selectedIndex;"
                            });
                        });
                        form.find(".btn").addClass("disabled").end().find("#rate_gobackBtn").removeClass("disabled");
                        levelBtn.addClass("disabled").prop("disabled", "true").uniform();
                        personBtn.addClass("disabled").prop("disabled", "true").uniform();
                        saveBtn.addClass("disabled");
                        selectAllBtn.addClass("disabled").prop("disabled", "true").uniform();
                    };
                }, 0)



            }).error(function(data, status) {
                alert("获取产品列表失败，请与管理员联系。");
                return;
            });
        }
    });
    $scope.filerSource = function(e) {
        return e.key != 4;
    };
    $scope.popContent = function(items) {
        var html = '';
        angular.forEach(items, function(data, index, array) {
            html += ">= " + data.startamount + "< " + data.endamount + "&nbsp;&nbsp;基础费率：" + data.baseChargerate + "&nbsp;&nbsp;浮动费率：" + data.floatChargerate + "<br/>";
        });
        return html;
    };
    $http({
        method: "POST",
        url: siteVar.serverUrl + "/xinghuoproductrate/getAllRateTempInfo.shtml",
        data: {},
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
            'X-Requested-With': 'XMLHttpRequest'
        }
    }).success(function(data, status) {

        if (!tools.interceptor(data)) return;
        if (data.success && !!data.data.length) {
            var table = '<table class="table table-striped table-bordered table-hover" id=""><thead><tr><th>请选择</th><th>费率模板</th></tr></thead><tbody>';
            $(data.data).each(function(i, e) {
                table += '<tr><td><input type="radio" name="__rateId" value="' + e.rateTmpId + '" rTitle="' + e.rateTmpName + '" rHtml="' + e.rateRange + '"></td>';
                table += '<td><a href="javascript:void(0);" data-content="' + e.rateRange + '" original-title="' + e.rateTmpName + '" class="js_info">' + e.rateTmpName + '</a></td></tr>';
            });
            table += "</tbody></table>";
            $scope.ratePop = table;
            $("#js_goodRate_level_table").on("click", ".js_update", function() {
                var tc = '<div class="modal-content" style="width: 580px; margin: 0 auto;"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button><h4 class="modal-title fn-ms">请选择<<' + $(this).parents("tr").find("td").eq(1).html() + '>>的费率模板</h4></div>' +
                    '<div class="modal-body clearfix"><div class="col-lg-12" style="max-height: 300px; overflow-y: scroll;">' + table + '</div></div>' +
                    '<div class="modal-footer"><button type="button" class="btn btn-success fn-ms" data-dismiss="modal">取消</button><button type="button" class="btn btn-primary fn-ms" id="js_level_update_rateTmp" key_index="' + $(this).parents("tr").index() + '">确认修改</button></div></div>';
                popUpLayerContent.html(tc);
                popUpLayer.modal("show");
                $("#js_dialog .js_info").each(function() {
                    $(this).popover({
                        "trigger": "hover",
                        "container": "body",
                        "placement": "right",
                        "html": true,
                        "content": "123132"
                    });
                });
            });
        }



    }).error(function(data, status) {
        alert("获取产品列表失败，请与管理员联系。");
        return;
    });


    $scope.action.save = function() {

        var saveBtn = $("#js_goodRate_save");
        var ratio = $("#ratio"),
            ratioValue = ratio.val();
        if (ratioValue <= 0 || ratioValue > 100) {
            return alert("费率系数必须大于0小于等于100！");
        };
        var data = tools.getFormele({}, $("#js_form"));
        // return console.log(data);
        var levelCheckbox = $("#js_goodRate_level_table tbody input[type='checkbox']"),
            personTr = $("#js_goodRate_person_table tbody tr");
        var leverSwitch = $("#js_goodRate_config_level").prop("checked"),
            personSwitch = $("#js_goodRate_config_person").prop("checked");
        var levelCheckedbox = levelCheckbox.filter(function() {
            if (!leverSwitch) {
                return;
            };
            return $(this).prop("checked") == true;
        });
        var presonTrCorrect = personTr.filter(function() {
            if (!personSwitch) {
                return;
            };
            var inputs = $(this).find("input[type='hidden'], input[type='text']");
            return inputs.length > 0 ? !!inputs.eq(0).val() : true;
        });
        if (personSwitch) {
            var rateFlag = true,
                idFlag = true;
            personTr.each(function() {
                var rateId = $(this).find(".js_rateId"),
                    idInput = $(this).find("td").eq(0).find(".js_userId");
                if (idInput.length) {
                    if (idInput.val() && !rateId.val()) {
                        rateFlag = false;
                    };
                    if (!idInput.val() && rateId.val()) {
                        idFlag = false;
                    };
                };
            });

            if (!rateFlag) {
                return alert("请选择费率模板！");
            };
            if (!idFlag) {
                return alert("请填写理财经理ID！");
            };
        };
        if ((levelCheckedbox.length == 0) && (presonTrCorrect.length == 0)) {
            return alert('“按级别分配”、“按个别分配”至少要录入一条信息！');
        }
        levelCheckbox.each(function(i) {
            if (!$(this).is(':checked')) {
                delete data['userLevelRateTemplateRelList[' + i + '].userLevel.id'];
                delete data['userLevelRateTemplateRelList[' + i + '].rate.rateTemplate.id'];
            }
        });
        var rateLink = $("#js_goodRate_person_table .js_rateTemplate_info"),
            rateLinkMap = rateLink.filter(function(i, item) {
                return $(item).siblings("input").length > 0 && $(item).siblings("input").val();
            });

        if ($scope.form.outVar === "") {
            return tools.interalert("请选择是否加息");
        } else if ($scope.form.outVar == "0") {
            data["subProduct.variableAnnualRate"] = 0;
        } else if ($scope.form.outVar == "1") {

            if ($scope.form.subProduct.variableAnnualRate <= 0 || $scope.form.subProduct.variableAnnualRate == undefined || $scope.form.subProduct.variableAnnualRate == "") {
                return tools.interalert("加息率不可小于等于0");

            };
            var reg = /^\d+(\.\d{1,2})?$/;
            if (!reg.test($scope.form.subProduct.variableAnnualRate)) {
                tools.interalert("加息率不可超过2位小数");
                return false;

            };
        };


        if (rateLinkMap.length > 4000) {
            return alert("按个别分配，单次新增不能超过4000条！")
        }
        if (!tools.ajaxLocked(saveBtn)) return;
        //$("#js_dialog_progress").modal({backdrop: 'static', keyboard: false});
        //return console.log(data)
        $.ajax({
            type: "post",
            url: siteVar.serverUrl + "/xinghuoproductrate/saveProductRate.shtml",
            data: data,
            dataType: "json",
            success: function(data) {
                tools.ajaxOpened(saveBtn);
                //$("#js_dialog_progress").modal("hide");
                if (!tools.interceptor(data)) return;
                if (data.success) {
                    alert(data.msg);
                    var backUrl = $location.$$search.backUrl;
                    $state.go(backUrl);
                }

            },
            error: function(err) {
                tools.ajaxOpened(saveBtn);
                //$("#js_dialog_progress").modal("hide");
                tools.ajaxError(err);
            }
        });
    };
    $scope.action.goback = function() {
        var backUrl = $location.$$search.backUrl;
        $state.go(backUrl)
    };;
    (function() {

        $("#js_goodRate_config_person").on("click", function() {

            var self = $(this),
                personCheckbox = domForm.find("[name='personCheckbox']");

            if (self.hasClass("disabled")) {
                return false;
            };
            if (!$(this).is(':checked')) {
                personCheckbox.val(0);
            } else {
                personCheckbox.val(1);
            };
        });
        $("#js_goodRate_config_level").on("change", function() {
            var self = $(this),
                levelCheckbox = domForm.find("[name='levelCheckbox']"),
                allInput = $("#js_goodRate_level_table input[type='checkbox']");
            if (self.hasClass("disabled")) {
                return false;
            };
            if (!$(this).is(':checked')) {
                levelCheckbox.val(0);
            } else {
                allInput.prop("checked", false).uniform();
                levelCheckbox.val(1);
            };
        });


        $("#rateTypeIndex").on("change", function() {
            var self = $(this),
                selectVal = self.val(),
                divRateProductVIP = $("#divRateProductVIP");
            if (selectVal == 2) {
                divRateProductVIP.show();
            } else {
                divRateProductVIP.hide();
            }
        }).trigger("change");
        $timeout(function() {
            $(".addServerUrl").each(function() {
                var url = $(this).attr("href");
                console.log(url)
                $(this).attr("href", siteVar.serverUrl + url);
            });
        }, 0)


        $("#js_dialog").on("click", "#js_level_update_rateTmp", function() {
            var tmpRateTmp = {};
            $("#js_dialog [name='__rateId']").each(function(i, e) {
                if ($(e).is(":checked")) {
                    tmpRateTmp.id = $(e).val();
                    tmpRateTmp.name = $(e).attr("rTitle");
                    tmpRateTmp.html = $(e).attr("rHtml");
                }
            });
            var inputTmp = $("#js_goodRate_level_table [name='userLevelRateTemplateRelList[" + $(this).attr("key_index") + "].rate.rateTemplate.id']");
            inputTmp.val(tmpRateTmp.id);
            inputTmp.parent().find("a").attr({
                "data-content": tmpRateTmp.html,
                "data-original-title": tmpRateTmp.name
            }).html(tmpRateTmp.name);
            popUpLayer.modal("hide");

        });
        $("#js_goodRate_vip_import_btn").on("click", function() {
            var form = $("#js_form"),
                idInput = form.find("[name='subProduct.id']"),
                idInputval = idInput.val(),
                html = '';
            html += '<div class="modal-content" style="width: 500px; margin: 0 auto;"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button><h4 class="modal-title fn-ms">用户文件导入</h4></div>' +
                '<div class="modal-body clearfix"><div class="col-lg-12"><form role="form" id="js_goodRate_vip_import_form" enctype="multipart/form-data" class="form-horizontal"><div class="form-group col-lg-12"><label for="" class="col-sm-4 control-label ui_right">请选择上传文件</label>' +
                '<div class="col-sm-8"><input name="vipUserfile" type="file" accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" class="btn btn-sm ui_input_file"></div><input type="hidden" name="subProduct.id" value="' + idInputval + '"></div><div class="form-group col-lg-12" id="js_goodRate_vip_import_msg" style="max-height: 200px;"></div></form></div></div>' +
                '<div class="modal-footer"><button type="button" class="btn btn-success fn-ms" data-dismiss="modal">取消</button><button type="button" class="btn btn-primary fn-ms" id="js_goodRate_vip_import_form_sure">提交</button></div></div>';
            popUpLayerContent.html(html)
            popUpLayer.modal();
        });

        $("#js_dialog").on("click", "#js_goodRate_vip_import_form_sure", function() {
            var fileInput = $("[name='vipUserfile']").eq(0);
            if (!fileInput.val()) {
                return alert("请选择文件")
            }
            var self = this,
                tds = $("#tblRateProductVIP tbody td");
            if (!tools.ajaxLocked(self)) return;
            // tools.ajaxForm({
            //     "ele": $("#js_goodRate_vip_import_form"),
            //     "action": siteVar.serverUrl + "/xinghuoproductrate/uploadVIP.shtml",
            //     onComplete: function(data){
            //         tools.ajaxOpened(self);
            //         if(!tools.interceptor(data)) return;
            //         if(data.success) {
            //             if(!!data.data.successCount) {
            //                 var vipUserInfo = data.data.vipUserInfo;
            //                 tds.eq(0).html(vipUserInfo.limitcount).end()
            //                     .eq(1).html(vipUserInfo.limitamount)
            //             }
            //             var errMsg = "";
            //             if(data.data.failedInfo.length) {
            //                 $(data.data.failedInfo).each(function (i, e) {
            //                     errMsg += '<span>' + e + '</span><br>'
            //                 });
            //                 return $("#js_goodRate_vip_import_msg").html(errMsg);
            //             }
            //             alert(data.msg);
            //             return $("#js_dialog").modal("hide");

            //         } else {
            //             alert(data.msg);
            //             return $("#js_dialog").modal("hide");
            //         }
            //     }
            // });
            var data = new FormData($("#js_goodRate_vip_import_form")[0]);
            $.ajax({
                url: siteVar.serverUrl + "/xinghuoproductrate/uploadVIP.shtml",
                type: "POST",
                data: data,
                processData: false,
                contentType: false,
                success: function(data) {
                    if (typeof data == "string") {
                        var data = JSON.parse(data);
                    };
                    tools.ajaxOpened(self);
                    if (!tools.interceptor(data)) return;
                    if (data.success) {
                        if (!!data.data.successCount) {
                            var vipUserInfo = data.data.vipUserInfo;
                            tds.eq(0).html(vipUserInfo.limitcount).end()
                                .eq(1).html(vipUserInfo.limitamount)
                        }
                        var errMsg = "";
                        if (data.data.failedInfo.length) {
                            $(data.data.failedInfo).each(function(i, e) {
                                errMsg += '<span>' + e + '</span><br>'
                            });
                            return $("#js_goodRate_vip_import_msg").html(errMsg);
                        }
                        alert(data.msg);
                        return $("#js_dialog").modal("hide");

                    } else {
                        alert(data.msg);
                        return $("#js_dialog").modal("hide");
                    }
                }

            });

        });

        $("#delRateProductVIP").on("click", function() {
            var self = $(this),
                href = self.attr("data-href"),
                data, url, tds = $("#tblRateProductVIP tbody td");
            data = tools.queryUrl(href);
            url = href.split('?')[0];
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + url,
                data: data,
                dataType: "json",
                success: function(data) {
                    tools.ajaxOpened(self);
                    if (!tools.interceptor(data)) return;
                    if (data.success) {
                        alert(data.msg);
                        var vipUserInfo = data.data.vipUserInfo;
                        tds.eq(0).html(vipUserInfo.limitcount).end()
                            .eq(1).html(vipUserInfo.limitamount);

                        return $("#js_dialog").modal("hide");

                    } else {
                        alert(data.msg);
                        return $("#js_dialog").modal("hide");
                    }
                },
                error: function(err) {
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });
        });
        $("#js_rate_product_vip_export").on("click", function() {
            tools.export(this);
        });

        function countInputNum() {
            var table = $("#js_goodRate_person_table"),
                inputs = table.find("input[type='hidden']"),
                num = 0;
            inputs.each(function(i, item) {
                var name = $(item).attr("name");
                console.log(name);
                if ((/^ul\[\d*\]\.rateTemplate\.id$/).test(name)) {
                    num++;
                }
            })

            return num;
        }


        $("#js_goodRate_person_import_btn").on("click", function() {

            if ($("#js_goodRate_person_add").attr("lock") === "locked") return;

            $("#js_dialog .js_content").html([
                '<div class="modal-content" style="width: 500px; margin: 0 auto;">',
                '<div class="modal-header">',
                '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>',
                '<h4 class="modal-title fn-ms">导入理财经理费率配置文件</h4>',
                '</div>',
                '<div class="modal-body clearfix">',
                '<div class="col-lg-12">',
                '<form role="form" id="js_goodRate_person_import_form" enctype="multipart/form-data" class="form-horizontal">',
                '<div class="form-group col-lg-12">',
                '<label for="" class="col-sm-4 control-label ui_right">请选择上传文件</label>',
                '<div class="col-sm-8"><input id="js_goodRate_person_import_form_file" name="userfile" type="file" class="btn btn-sm ui_input_file"></div>',
                '</div>',
                '<div class="form-group col-lg-12" id="js_goodRate_person_import_msg" style="max-height: 200px;overflow: auto"></div>',
                '</form>',
                '</div>',
                '</div>',
                '<div class="modal-footer">',
                '<button type="button" class="btn btn-success fn-ms" data-dismiss="modal">取消</button>',
                '<button type="button" class="btn btn-primary fn-ms" id="js_goodRate_person_import_form_sure">提交</button>',
                '</div>',
                '</div>'
            ].join(""));
            $("#js_dialog").modal();
        });

        $("#js_dialog").on("click", "#js_goodRate_person_import_form_sure", function() {
            var self = this;
            if (!tools.ajaxLocked(self)) return;

            $("#js_goodRate_person_table tbody tr").each(function(i, e) {
                var tmpInput = $(e).find("input").eq(0).clone(true).hide();
                $("#js_goodRate_person_import_form").append(tmpInput);
            });

            // tools.ajaxForm({
            //     "ele": $("#js_goodRate_person_import_form"),
            //     "action": siteVar.serverUrl + "/xinghuoproductrate/upload.shtml",
            //     onComplete: function(data){
            //         tools.ajaxOpened(self);
            //         if(!tools.interceptor(data)) return;
            //         if(data.success) {
            //             if(!!data.data.successCount) {
            //                 var list = "";
            //                 var key = !!$("#js_goodRate_person_table tbody tr").length ? $("#js_goodRate_person_table tbody tr:last").attr("key_i")*1+1 : 0;
            //                 $(data.data.successInfo).each(function (i, e) {
            //                     list += ['<tr class="js_tmp_tr" status="init" key_i="'+ (key+i) +'">',
            //                         '<td>',
            //                         '<span name="managerIdName">'+ e.userId +'</span>',
            //                         '<input type="hidden" value="'+ e.userId +'" name="ul['+ (key+i) +'].userid">',
            //                         '</td>',
            //                         '<td>'+ e.userName +'</td>',
            //                         '<td>'+ e.mobile +'</td>',
            //                         '<td>'+ e.documentno +'</td>',
            //                         '<td>',
            //                         '<a href="javascript:;" class="ui_ellipsis js_rateTemplate_info" style="width:120px;" key_html="'+ e.rateInfo +'" data-original-title="'+ e.rateTmpName +'">'+ e.rateTmpName +'</a>',
            //                         '<input type="hidden" value="'+ e.rateTmpId +'" name="ul['+ (key+i) +'].rateTemplate.id">',
            //                         '</td>',
            //                         '<td><div class="ui_center">',
            //                         '<a href="javascript:;" class="btn btn-success btn-xs js_save">保存</a>&nbsp;&nbsp;&nbsp;&nbsp;',
            //                         '<a href="javascript:;" class="btn btn-danger btn-xs js_cancel">删除</a>',
            //                         '</div></td>',
            //                         '</tr>'].join('');
            //                 });
            //                 $("#js_goodRate_person_table tbody").append(list);
            //                 $('#js_goodRate_person_table tbody .js_rateTemplate_info').each(function () {
            //                     var html = $(this).attr("key_html");
            //                     $(this).popover({"trigger": "hover", "container": "body", "placement": "left", "html": true, "content": html});
            //                 });
            //             }
            //             var errMsg = "";
            //             if(data.data.failedInfo.length) {
            //                 $(data.data.failedInfo).each(function (i, e) {
            //                     errMsg += '<span>' + e + '</span><br>'
            //                 });
            //                 return $("#js_goodRate_person_import_msg").html(errMsg);
            //             }
            //             alert(data.msg);
            //             return $("#js_dialog").modal("hide");

            //         } else {
            //             alert(data.msg);
            //             return $("#js_dialog").modal("hide");
            //         }
            //     }
            // });
            var data = new FormData($("#js_goodRate_person_import_form")[0]);
            $.ajax({
                url: siteVar.serverUrl + "/xinghuoproductrate/upload.shtml",
                type: "POST",
                data: data,
                processData: false,
                contentType: false,
                success: function(data) {
                    if (typeof data == "string") {
                        var data = JSON.parse(data);
                    };
                    tools.ajaxOpened(self);
                    if (!tools.interceptor(data)) return;
                    if (data.success) {
                        if (!!data.data.successCount) {
                            var list = "";
                            var key = !!$("#js_goodRate_person_table tbody tr").length ? $("#js_goodRate_person_table tbody tr:last").attr("key_i") * 1 + 1 : 0;
                            //var key = 0;
                            var inputKey = countInputNum();
                            $(data.data.successInfo).each(function(i, e) {
                                list += ['<tr class="js_tmp_tr" status="init" key_i="' + (key + i) + '">',
                                    '<td><label><input type="checkbox" name="rateId" value=""><i></i></label></td>',
                                    '<td>',
                                    '<span name="managerIdName">' + e.userId + '</span>',
                                    '<input type="hidden" value="' + e.userId + '" name="ul[' + (inputKey + i) + '].userid">',
                                    '</td>',
                                    '<td>' + e.userName + '</td>',
                                    '<td>' + e.mobile + '</td>',
                                    '<td>' + e.documentno + '</td>',
                                    '<td>',
                                    '<a href="javascript:;" class="ui_ellipsis js_rateTemplate_info" style="width:120px;" key_html="' + e.rateInfo + '" data-original-title="' + e.rateTmpName + '">' + e.rateTmpName + '</a>',
                                    '<input type="hidden" value="' + e.rateTmpId + '" name="ul[' + (inputKey + i) + '].rateTemplate.id">',
                                    '</td>',
                                    '<td><div class="ui_center">',
                                    //'<a href="javascript:;" class="btn btn-success btn-xs js_save">保存</a>&nbsp;&nbsp;&nbsp;&nbsp;',
                                    '<a href="javascript:;" class="btn btn-danger btn-xs js_cancel">删除</a>',
                                    '</div></td>',
                                    '</tr>'
                                ].join('');
                            });
                            $("#js_goodRate_person_table tbody").append(list);
                            //$("#js_goodRate_person_table tbody").find("input[type='checkbox']");
                            $('#js_goodRate_person_table tbody .js_rateTemplate_info').each(function() {
                                var html = $(this).attr("key_html");
                                $(this).popover({
                                    "trigger": "hover",
                                    "container": "body",
                                    "placement": "left",
                                    "html": true,
                                    "content": html
                                });
                            });
                        }
                        var errMsg = "";
                        if (data.data.failedInfo.length) {
                            $(data.data.failedInfo).each(function(i, e) {
                                errMsg += '<span>' + e + '</span><br>'
                            });
                            return $("#js_goodRate_person_import_msg").html(errMsg);
                        }
                        alert(data.msg);
                        return $("#js_dialog").modal("hide");

                    } else {
                        alert(data.msg);
                        return $("#js_dialog").modal("hide");
                    }
                }

            });
        });

        $("#js_goodRate_person_add").on("click", function() {

            if ($(this).attr("lock") === "locked") return;
            //$("#js_goodRate_person_add").attr("lock", "locked")
            var key = !!$("#js_goodRate_person_table tbody tr").length ? $("#js_goodRate_person_table tbody tr:last").attr("key_i") * 1 + 1 : 0;
            //var key = 0;
            var inputKey = countInputNum();
            // todo

            var oneTr = ['<tr class="js_tmp_tr" status="init" key_i="' + key + '" inputkey="' + inputKey + '">',
                '<td></td><td>',
                '<input type="text" class="form-control js_userId" name="ul[' + inputKey + '].userid">',
                '</td>',
                '<td><input type="text" class="form-control js_userName" readonly style="width: 150px;" id=""></td>',
                '<td><input type="text" class="form-control js_mobile" readonly id=""></td>',
                '<td><input type="text" class="form-control js_documentNo" readonly id=""></td>',
                '<td>',
                '<a href="javascript:;" class="js_rateTemplate_info" inputkey="' + inputKey + '" data-original-title="选择费率模板">选择费率模板</a>',
                '<input type="hidden" value="" name="ul[' + inputKey + '].rateTemplate.id" class="js_rateId">',
                '</td>',
                '<td><div class="ui_center">',
                '<a href="javascript:;" class="btn btn-success btn-xs js_input_save" style="margin: 3px 5px;">保存</a>',
                '<a href="javascript:;" class="btn btn-danger btn-xs js_cancel" style="margin: 3px 5px;">删除</a>',
                '</div></td>',
                '</tr>'
            ].join('');

            $("#js_goodRate_person_table tbody").append(oneTr);

            $("#js_goodRate_person_table tbody .js_rateTemplate_info").popover({
                "trigger": "hover",
                "container": "body",
                "placement": "left",
                "html": true,
                "content": "请选择费率模板"
            });

            $("#js_goodRate_person_table .js_userId").Validator({
                hmsg: "请输入理财经理ID",
                regexp: /^\d{12}$/,
                showok: false,
                style: {
                    placement: "top"
                },
                emsg: "理财经理ID不能为空",
                rmsg: "请输入合法理财经理ID",
                fn: function(v, tag) {
                    var self = $(this),
                        tr = self.parents("tr"),
                        userName = tr.find(".js_userName"),
                        mobile = tr.find(".js_mobile"),
                        documentNo = tr.find(".js_documentNo"),
                        rateId = tr.find(".js_rateId");
                    userName.val("");
                    mobile.val("");
                    documentNo.val("");

                    var validator = true;
                    if (!tools.ajaxLocked(self)) return;

                    var data = {
                        "userId": v
                    };

                    $.ajax({
                        type: "post",
                        url: siteVar.serverUrl + "/xinghuodefaultrate/getManagerInfo.shtml",
                        data: data,
                        async: false,
                        dataType: "json",
                        success: function(data) {

                            tools.ajaxOpened(self);
                            if (!tools.interceptor(data)) return;
                            if (data.success) {
                                userName.val(data.data.realname);
                                mobile.val(data.data.mobile);
                                documentNo.val(data.data.documentno);
                                if (self.attr("hasValidator") === "hasValidator") return;
                                if (data.data.rateTempId && data.data.rateTempName && data.data.rateRange) {
                                    rateId.val(data.data.rateTempId);
                                    rateId.prev().attr({
                                        "data-original-title": data.data.rateTempName,
                                        "data-content": data.data.rateRange
                                    }).html(data.data.rateTempName);
                                    self.attr("hasValidator", "hasValidator");
                                }
                            }
                        },
                        error: function(err) {
                            tools.ajaxOpened(self);
                            tools.ajaxError(err);
                            validator = flase;
                            self.fnmsg = "网络错误，请重新输入！"
                        }
                    });

                    return validator;

                },
                fnmsg: ""
            });

        });

        $("#js_goodRate_person_table").on("click", ".js_cancel", function() {

            $(this).parents("tr").remove();
            $("#js_goodRate_person_add").attr("lock", "");

        });

        $("#js_goodRate_person_table").on("click", ".js_save, .js_input_save", function() {

            var self = $(this),
                tr = $(this).parents("tr"),
                userId = tr.find(".js_userId"),
                userName = tr.find(".js_userName"),
                mobile = tr.find(".js_mobile"),
                documentNo = tr.find(".js_documentNo"),
                rateId = tr.find(".js_rateId");
            if (!tools.Validator(userId)) return;
            if (self.hasClass("js_input_save")) {
                if (!rateId.val()) return alert("请选择费率模板！");
            };
            tr.attr("status", "open");
            if (!tools.ajaxLocked(self)) return;
            //$("#js_dialog_progress").modal({backdrop: 'static', keyboard: false});
            //var data = tools.getFormele({},$("#js_form"));
            //$("#js_goodRate_level_table tbody input[type='checkbox']").each(function (i) {
            //    if(!$(this).is(':checked')) {
            //        delete data['userLevelRateTemplateRelList['+i+'].userLevel.id'];
            //        delete data['userLevelRateTemplateRelList['+i+'].rate.rateTemplate.id'];
            //    }
            //});
            //
            //$("#js_goodRate_person_table tr.js_tmp_tr").each(function (i ,e) {
            //    if($(e).attr("status") === "init") {
            //        var index = $(e).attr("inputkey");
            //        delete data['ul['+ index +'].userid'];
            //        delete data['ul['+ index +'].rateTemplate.id'];
            //    }
            //});
            $(self).parents("tr").attr({
                "status": "open"
            });
            var tds = tr.find("td"),
                valueUserId = tds.eq(0).find("span").html(),
                valueUserName = userName.val(),
                valueMobile = mobile.val(),
                valueDocumentNo = documentNo.val();
            if ($(self).hasClass("js_input_save")) {
                valueUserId = userId.val();
            };
            tds.eq(0).html('<label><input type="checkbox" name="rateId" value=""><i></i></label>');
            tds.eq(1).html('<span name="managerIdName">' + valueUserId + '</span>' + '<input type="hidden" value="' + valueUserId + '" name="ul[' + $(self).parents("tr").attr("inputkey") + '].userid">');
            tds.eq(2).html(valueUserName);
            tds.eq(3).html(valueMobile);
            tds.eq(4).html(valueDocumentNo);
            tds.eq(5).find("input").attr("id", "");
            tds.eq(6).html('<div class="ui_center"><a href="javascript:;"  class="btn btn-danger btn-xs js_delete">删除</a></div>');


        });
        $("#js_goodRate_person_table").on("click", ".js_delete", function() {

            if (!confirm("您确定要删除该费率配置么?")) return false;

            var self = $(this);
            //self.parents("tr").remove()
            if (!tools.ajaxLocked(self)) return;

            var data = {
                "rateIds": $(this).parents("tr").attr("key_rateid")
            };
            if (!data.rateIds) {
                return self.parents('tr').remove();
            }
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + "/xinghuoproductrate/removePersonRate.shtml",
                data: data,
                dataType: "json",
                success: function(data) {
                    tools.ajaxOpened(self);
                    if (!tools.interceptor(data)) return;
                    if (data.success) {
                        $(self).parents("tr").remove();
                    }

                },
                error: function(err) {
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });

        });
        $(document).on("change", "#chooseAll", function() {
            var self = $(this),
                table = $("#js_goodRate_person_table"),
                tbody = table.find("tbody"),
                checkboxList = tbody.find("input[type='checkbox']");
            if (self.prop("checked")) {
                checkboxList.each(function(i, item) {
                    $(item).prop("checked", true);
                })
            } else {
                checkboxList.each(function(i, item) {
                    $(item).prop("checked", false);
                })
            }
        });
        $("#js_goodRate_person_delete").on("click", function() {
            var rateIds = "",
                table = $("#js_goodRate_person_table"),
                tbody = table.find("tbody"),
                checkboxList = tbody.find("input[type='checkbox']:checked"),
                flag = 0;

            if (checkboxList.length > 0) {
                checkboxList.each(function(i, item) {
                    if ($(item).val()) {
                        rateIds += $(item).val() + ",";
                    } else {
                        //$(item).parents('tr').remove();
                        flag = 1;
                    }
                });
                rateIds = rateIds.substring(0, rateIds.length - 1);
            } else {
                return alert("请选择批量删除的条目！");
            };
            if ((flag == 1) && rateIds.length == 0) {
                return (function() {
                    checkboxList.each(function(i, item) {
                        $(item).parents('tr').remove();
                    });
                })()
            }
            if (!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + "/xinghuoproductrate/removePersonRate.shtml",
                data: {
                    "rateIds": rateIds
                },
                dataType: "json",
                success: function(data) {
                    tools.ajaxOpened(self);
                    if (!tools.interceptor(data)) return;
                    if (data.success) {
                        checkboxList.each(function(i, item) {
                            $(item).parents('tr').remove();
                        });
                    }

                },
                error: function(err) {
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });
        });
        $("#js_goodRate_person_table").on("click", ".js_rateTemplate_info", function() {
            var inputKey = $(this).attr("inputkey") || countInputNum();
            var currentRateObj = $(this);
            var popUp = $("#js_dialog");
            popUp.find(".js_content").html([
                '<div class="modal-content" style="width: 580px; margin: 0 auto;">',
                '<div class="modal-header">',
                '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>',
                '<h4 class="modal-title fn-ms">请选择费率模板</h4>',
                '</div>',
                '<div class="modal-body clearfix">',
                '<div class="col-lg-12" style="max-height: 300px; overflow-y: scroll;">',
                $scope.ratePop,
                '</div>',
                '</div>',
                '<div class="modal-footer">',
                '<button type="button" class="btn btn-success fn-ms" data-dismiss="modal">取消</button>',
                '<button type="button" class="btn btn-primary fn-ms" id="js_person_update_rateTmp" inputkey="' + inputKey + '" key_index="' + $(this).parents("tr").attr("key_i") + '">确认修改</button>',
                '</div>',
                '</div>'
            ].join(""));
            popUp.find(".js_info").each(function() {
                var html = $(this).attr("key_html");
                $(this).popover({
                    "trigger": "hover",
                    "container": "body",
                    "placement": "right",
                    "html": true,
                    "content": html
                });
            });


            $("#js_person_update_rateTmp").off("click").on("click", function() {
                var tmpRateTmp = {},
                    inputKey = $(this).attr("inputkey");
                $("#js_dialog [name='__rateId']").each(function(i, e) {
                    if ($(e).is(":checked")) {
                        tmpRateTmp.id = $(e).val();
                        tmpRateTmp.name = $(e).attr("rTitle");
                        tmpRateTmp.html = $(e).attr("rHtml");
                    }
                });
                if (tmpRateTmp.id) {
                    if (currentRateObj.siblings("input").length == 0) {
                        var tr = currentRateObj.parents("tr"),
                            tds = tr.children(),
                            userid = tr.attr("userid");

                        tds.eq(1).append('<input type="hidden" value="' + userid + '" name="ul[' + inputKey + '].userid" />');
                        tds.eq(5).append('<input type="hidden" value="' + tmpRateTmp.id + '" name="ul[' + inputKey + '].rateTemplate.id" />')
                    } else {
                        currentRateObj.siblings("input").eq(0).val(tmpRateTmp.id)
                    }
                    currentRateObj.attr({
                        "data-content": tmpRateTmp.html,
                        "data-original-title": tmpRateTmp.name
                    }).html(tmpRateTmp.name);
                }

                //inputTmp.parents('tr').attr("key_rateid", tmpRateTmp.id);

                $("#js_dialog").modal("hide");
            });
            popUp.modal();


        });



        $(document).on("keydown", "#searchMobile", function(e) {
            if (e.keyCode == 13) {
                SalesConfigList(this);
            }
        });
        $(document).on("click", "#js_mobile_search", function(e) {
            var input = $("#searchMobile");
            SalesConfigList(input);

        });;
        (function() {
            $("[name='searchObject.subproductname']").on("keydown", function(e) {
                if (e.keyCode == 13) {
                    return false;
                };
            });
        })();

        function SalesConfigList(input) {
            var val = $(input).val();
            var personTable = $("#js_goodRate_person_table"),
                tds = personTable.find("tbody td");
            tds.each(function() {
                var text, tdInput = $(this).find("input");
                if (tdInput.length > 0) {
                    text = tdInput.val();
                } else {
                    text = $(this).text();
                }
                if (text == val) {
                    $(this).addClass("bg-yellow")
                } else {
                    $(this).removeClass("bg-yellow")
                }
            });
        }

    })();
}
