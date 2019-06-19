'use strict';

function fixationProduct($scope, $modal, tools, $location, DTOptionsBuilder, DTColumnBuilder) {
    var domForm = $("#js_form"),
        conditionItem = domForm.find(".form-group");
    $scope.form = {
        isShow: (conditionItem.length > 1) ? true : false,
        //productType: 1
    };
    $scope.select = {};
    $scope.action = {};
    Number.prototype.mul = function(arg) {
        var m = 0,
            s1 = this.toString(),
            s2 = arg.toString();
        try {
            m += s1.split(".")[1].length
        } catch (e) {}
        try {
            m += s2.split(".")[1].length
        } catch (e) {}
        return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m)
    };
    var search = $location.$$search;
    if (search.productName) {
        $scope.form.productName = search.productName;
    }

    /*
     创建表格选项
     */
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax', {
            url: siteVar.serverUrl + '/sesametrade/tableSesameTrade.shtml',
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
        .withOption('scrollX', true)
        .withLanguage(tools.dataTablesLanguage)
        .withOption('fnDrawCallback', fnDrawCallback)
        .withPaginationType('simple_numbers');
    vm.dtColumns = [
        DTColumnBuilder.newColumn('applyid').withTitle('交易订单号').withOption('sWidth', '300px').renderWith(function(data, type, full) {
            if (!data) return "";
            return '<a href="javascript:;" data-selfSupport="' + full.selfSupport + '" data-href="/sesametrade/viewSesameTrade.json?applyid=' + data + '&id=' + full.id + '&investApplyno=' + full.investApplyno +'" class="js-order">' + data + '</a>'
        }),
        DTColumnBuilder.newColumn('contractno').withTitle('协议编号').withOption('sWidth', '200px'),
        DTColumnBuilder.newColumn('productCode').withTitle('项目编号').withOption('sWidth', '200px'),
        DTColumnBuilder.newColumn('productName').withTitle('项目名称').withOption('sWidth', '250px').renderWith(function(data, type, full) {
            if (!data) return "";
            return '<a data-href="/sesameproduct/viewSesameProduct.json?productId=' + full.productId + '" href="javascript:;" class="js-project">' + data + '</a>'
        }),
        DTColumnBuilder.newColumn('selfSupport').withTitle('是否自营').withOption('sWidth', '80px').renderWith(function(data, type, full) {
            if (!data) return "";
            return data == 2 ? '是' : '否';
        }),
        DTColumnBuilder.newColumn('userName').withTitle('用户姓名').withOption('sWidth', '100px'),
        DTColumnBuilder.newColumn('userPhone').withTitle('用户手机号').withOption('sWidth', '100px'),
        DTColumnBuilder.newColumn('contractSignDate').withTitle('签约时间').withOption('sWidth', '150px').renderWith(function(data, full, type) {
            if (!data) return "";
            return data.substr(0, 4) + "-" + data.substr(4, 2) + "-" + data.substr(6, 2) + " " + data.substr(8, 2) + ":" + data.substr(10, 2) + ":" + data.substr(12, 2);
            //return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('contractAmt').withTitle('投资金额').withOption('sWidth', '100px').renderWith(function(data, type, full) {
            if (data == null) return "";
            return tools.formatNumber(data);
        }),
        DTColumnBuilder.newColumn('transAmt').withTitle('到账金额').withOption('sWidth', '100px').renderWith(function(data, type, full) {
            if (data == null) return "";
            return tools.formatNumber(data);
        }),
        DTColumnBuilder.newColumn('currencyName').withTitle('币种').withOption('sWidth', '80px').renderWith(function(data, full, type) {
            if (!data) return "";
            return data;
        }),
        DTColumnBuilder.newColumn('transtimeFormat').withTitle('到账时间').withOption('sWidth', '150px').renderWith(function(data, type, full) {
            if (!data) return "";
            //return tools.toJSDate(data);
            return data;
        }),
        DTColumnBuilder.newColumn('state').withTitle('订单状态').withOption('sWidth', '100px').renderWith(function(data, type, full) {
            var str = "";
            switch (parseInt(data)) {
                case 10:
                    str = "待付款";
                    break;
                case 20:
                    str = "已付款";
                    break;
                case 30:
                    str = "认购成功";
                    break;
                case 40:
                    str = "赎回中";
                    break;
                case 50:
                    str = "赎回成功";
                    break;
                case 60:
                    str = "已取消";
                    break;
                default:
                    str = "";
                    break;
            }
            return str;
        }),
        DTColumnBuilder.newColumn('financialUserName').withTitle('理财经理姓名').withOption('sWidth', '100px').renderWith(function(data, type, full) {
            if (!data) return "";
            return '<a href="javascript:;" class="financialDetail" key="' + full.financialUserId + '">' + data + '</a>';
        }),
        DTColumnBuilder.newColumn('id').withTitle('操作').withOption('sWidth', '200px').renderWith(function(data, type, full) {
            var str = "";
            if (parseInt(full.state) == 10 || parseInt(full.state) == 20) {
                str = '<a href="javascript:;" class="js-cancel btn btn-success btn-sm" data-href="/sesametrade/cancelSesameTradePage.json?id=' + data + '&applyid=' + full.applyid + '&productName=' + full.productName + '&contractno=' + full.contractno + '&state=' + full.state + '&userName=' + full.userName + '&contractAmt=' + full.contractAmt + '">取消订单</a>';
                if (parseInt(full.auditstate) == 3) {
                    str = str + '<a data-href="/sesametrade/supplementTradeContract.json?id=' + data + '" href="javascript:;" class="btn btn-warning btn-sm js-deal">补签合同</a>';
                }
            } else {
                str = "";
                if (parseInt(full.auditstate) == 3) {
                    str = str + '<a data-href="/sesametrade/supplementTradeContract.json?id=' + data + '" href="javascript:;" class="btn btn-warning btn-sm js-deal">补签合同</a>';
                }
            }

            return str;
        })
    ];

    $scope.action.reset = function() {
        for (var prop in $scope.form) {
            if (prop !== 'isShow') delete $scope.form[prop];
        };
        var auditstateBox = $("#auditstateBox");
        auditstateBox.find("[name='state']").val('')
            .prev().val('').end().end().find("[type='checkbox']").prop("checked", false).uniform();

        vm.dtInstance.rerender();
    };

    $scope.action.search = function() {
        vm.dtInstance.rerender();
    };

    $scope.action.export = function(event) {
        var self = event.currentTarget;
        var url = "/sesametrade/exportSesameTradePage.json";
        tools.resetWidth();
        tools.createModal();
        tools.createModalProgress();
        $.when($.ajax({
            url: siteVar.serverUrl + url
        })).then(function(data) {
            if (data.success) {
                tools.export(self);
            }
        }).fail(function(err) {
            tools.ajaxOpened(self);
            tools.ajaxError(err);
            $("#js_dialog .js_content").html('用户没有权限！');
            $("#js_dialog").modal("show");
            return false;
        });

    };
    (function() {
        $('#auditstateBox').multiSel({
            'data': [{
                "text": "待付款",
                "value": "10",
                "default": false
            }, {
                "text": "已付款",
                "value": "20",
                "default": false
            }, {
                "text": "认购成功",
                "value": "30",
                "default": false
            }, {
                "text": "赎回中",
                "value": "40",
                "default": false
            }, {
                "text": "赎回成功",
                "value": "50",
                "default": false
            }, {
                "text": "已取消",
                "value": "60",
                "default": false
            }],
            'name': "state",
            "callbackChange": function(dom) {
                $scope.$apply(function() {
                    var value = dom.val();
                    value = value.split(",").sort(function(a, b) {
                        return a - b
                    }).toString();
                    $scope.form.state = value;
                })
            }
        });

        if (search.financialUserId) {
            $scope.form = angular.extend($scope.form, search);
            $('#auditstateBox').find("[name='state']").val('20,30,40,50')
            .prev().val('已付款,认购成功,赎回中,赎回成功').end().end().find("[type='checkbox'][value='20'],[type='checkbox'][value='30'],[type='checkbox'][value='40'],[type='checkbox'][value='50']").prop("checked", true).uniform();
        }

    })();

    function fnDrawCallback() {

        if(window.ajaxDataInfo.info){
        $("#toal_info").html("投资总金额：<b style='color:#fd1e00'>"+tools.formatNumber(window.ajaxDataInfo.info)+"</b>");
        }else{
            $("#toal_info").html("");
        };
        if (!tools.interceptor(window.ajaxDataInfo)) return;

        var table = $("#dataTables"),
            tbody = table.find("tbody");
        /*交易订单号 详情*/
        table.off("click").on("click", ".js-order", function() {
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
                success: function(data) {
                    tools.ajaxOpened(self);
                    if (!tools.interceptor(data)) return;
                    if (data.success) {
                        $modal.open({
                            backdrop: true,
                            backdropClick: true,
                            dialogFade: false,
                            keyboard: true,
                            templateUrl: 'infoDetailModal.html',
                            controller: infoDetailModalCtrl,
                            //windowClass:'modal-640',
                            resolve: {
                                "info": function() {
                                    return data.data;
                                },
                                "selfSupport": function() {
                                    return self.attr("data-selfSupport") || 1;
                                }
                            }
                        });
                    }

                },
                error: function(err) {
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            })

        });
        //项目编号---查看详情
        table.on("click", ".js-project", function() {
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
                dataType: "json",
                success: function(data) {
                    tools.ajaxOpened(self);
                    if (!tools.interceptor(data)) return;
                    if (data.success) {
                        var info = $.extend({}, data.data.dbDto, data.data.httpDto);
                        //console.log( data.dbDto)
                        $modal.open({
                            backdrop: true,
                            backdropClick: true,
                            dialogFade: false,
                            keyboard: true,
                            templateUrl: 'projectDetailModal.html',
                            controller: projectDetailModal,
                            resolve: {
                                "info": function() {
                                    return info;
                                }
                            }
                        });
                    } else {
                        alert(data.msg);
                    }

                },
                error: function(err) {
                    tools.ajaxOpened(self);
                    tools.ajaxError403(err);
                }
            })
        });
        /*取消订单*/
        $(".js-cancel", table).on("click", function() {
            var self = $(this),
                href = self.attr("data-href"),
                reData, url;
            reData = tools.queryUrl(href);
            url = href.split('?')[0];

            if (!tools.ajaxLocked(self)) return;
            $.when($.ajax({
                url: siteVar.serverUrl + url
            })).then(function(data) {
                tools.ajaxOpened(self);
                if (!tools.interceptor(data)) return;
                if (data.success) {
                    $modal.open({
                        backdrop: true,
                        backdropClick: true,
                        dialogFade: false,
                        keyboard: true,
                        templateUrl: 'cancelOrderModal.html',
                        controller: cancelOrderModal,
                        windowClass: 'modal-640',
                        resolve: {
                            "info": function() {
                                return reData;
                            }
                        }
                    });
                }
            }).fail(function(err) {
                tools.ajaxOpened(self);
                tools.ajaxError(err);
                return false;
            });

        });
        /**
         * [查看理财经理信息]
         * @param  {object}   [description]
         * @return {[type]}   [description]
         */
        tools.resetWidth();
        tools.createModal();
        tools.createModalProgress();
        table.on("click", ".financialDetail", function() {
            var data = {
                "id": $(this).attr("key"),
                "userType": "director",
                "bizSysRoute": $("#biz_sys_route").val()
            };
            var self = this;
            if (!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + "/xinghuouser/userinfo.shtml",
                data: data,
                dataType: "text",
                success: function(data) {
                    tools.ajaxOpened(self);
                    if (!tools.interceptor(data)) return;
                    $("#js_dialog .js_content").html(data);
                    $("#js_dialog").modal("show");
                },
                error: function(err) {
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });
        });
        /*补签合同*/
        table.on("click", ".js-deal", function() {
            var self = $(this),
                href = self.attr("data-href"),
                dataSelf, url;
            dataSelf = tools.queryUrl(href);
            url = href.split('?')[0];

            var url1 = "/sesametrade/supplementTradeContractPage.json";
            $.when($.ajax({
                url: siteVar.serverUrl + url1
            })).then(function(data) {
                if (!tools.ajaxLocked(self)) return;
                if (data.success) {
                    $.ajax({
                        type: "post",
                        url: siteVar.serverUrl + url,
                        data: dataSelf,
                        success: function(data) {
                            tools.ajaxOpened(self);
                            if (!tools.interceptor(data)) return;
                            if (data.success) {
                                alert('签约已提交，订单详情中查看签约结果');
                                vm.dtInstance.rerender();
                            }
                        },
                        error: function(err) {
                            tools.ajaxOpened(self);
                            tools.ajaxError(err);
                        }
                    })
                }
            }).fail(function(err) {
                tools.ajaxOpened(self);
                tools.ajaxError(err);
                $("#js_dialog .js_content").html('用户没有权限！');
                $("#js_dialog").modal("show");
                return false;
            });
        })
    }
    /*交易单号详情*/
    var infoDetailModalCtrl = function($scope, tools, info, selfSupport, $modalInstance) {
        $scope.action = {};
        $scope.info = info;
        $scope.showProtocol=1;
        if(!info.appreqid){$scope.showProtocol=0;}
        $scope.info.contractAmt = info.contractAmt == null ? "" : tools.formatNumber(info.contractAmt);
        $scope.info.xhValueDate = info.xhValueDate == null ? "" : info.xhValueDate;
        $scope.info.payAmt = info.payAmt == null ? "" : tools.formatNumber(info.payAmt);
        $scope.info.buyAmt = info.buyAmt == null ? "" : tools.formatNumber(info.buyAmt);
        $scope.info.netAmt = info.netAmt == null ? "" : tools.formatNumber(info.netAmt);
        $scope.info.transAmt = info.transAmt == null ? "" : tools.formatNumber(info.transAmt);
        $scope.info.commisionfee = info.commisionfee == null ? "" : tools.formatNumber(info.commisionfee)+'元';
        $scope.info.sesameMonth = info.sesameMonth == null ? "" : tools.formatNumber(info.sesameMonth)+'个月';
        $scope.info.confirmAmount = info.confirmAmount == null ? "" : tools.formatNumber(info.confirmAmount);
        $scope.info.redeemAmount = info.redeemAmount == null ? "" : tools.formatNumber(info.redeemAmount);
        $scope.info.cmpletedEarnings = info.cmpletedEarnings == null ? "" : tools.formatNumber(info.cmpletedEarnings);
        $scope.info.netValue = info.netValue == null ? "" : tools.formatNumber(info.netValue);
        $scope.info.subscribeSuccessDate = !info.subscribeSuccessDate ? "" : info.subscribeSuccessDate.substr(0, 4) + "-" + info.subscribeSuccessDate.substr(4, 2) + "-" + info.subscribeSuccessDate.substr(6, 2) + " " + info.subscribeSuccessDate.substr(8, 2) + ":" + info.subscribeSuccessDate.substr(10, 2) + ":" + info.subscribeSuccessDate.substr(12, 2);
        $scope.info.valueDate = !info.valueDate ? "" : info.valueDate.substr(0, 4) + "-" + info.valueDate.substr(4, 2) + "-" + info.valueDate.substr(6, 2) + " " + info.valueDate.substr(8, 2) + ":" + info.valueDate.substr(10, 2) + ":" + info.valueDate.substr(12, 2);
        $scope.info.contractSignDate = info.contractSignDate == null ? "" : info.contractSignDate.substr(0, 4) + "-" + info.contractSignDate.substr(4, 2) + "-" + info.contractSignDate.substr(6, 2) + " " + info.contractSignDate.substr(8, 2) + ":" + info.contractSignDate.substr(10, 2) + ":" + info.contractSignDate.substr(12, 2);
        $scope.info.contractDate = info.contractDate == null ? "" : info.contractDate.substr(0, 4) + "-" + info.contractDate.substr(4, 2) + "-" + info.contractDate.substr(6, 2) + " " + info.contractDate.substr(8, 2) + ":" + info.contractDate.substr(10, 2) + ":" + info.contractDate.substr(12, 2);
        //银行卡
        var h = info.bankCardno == null ? "" : $scope.info.bankCardno.length,
            str = '';
        for (var i = 0; i < h - 8; i++) {
            str += '*'
        }
        $scope.info.bankCardno = info.bankCardno == null ? "" : $scope.info.bankCardno.substr(0, 4) + str + $scope.info.bankCardno.substr(h - 4, 4);
        //手机号
        var phoneH = info.userPhone == null ? 0 : $scope.info.userPhone.length,
            phoneStr = '';
        for (var j = 0; j < phoneH - 7; j++) {
            phoneStr += '*';
        }
        $scope.info.userPhone = info.userPhone == null ? "" : $scope.info.userPhone.substr(0, 3) + phoneStr + $scope.info.userPhone.substr(7);
        $scope.info.financialUserPhone = info.financialUserPhone == null ? "" : $scope.info.financialUserPhone.substr(0, 3) + phoneStr + $scope.info.financialUserPhone.substr(7);
        //自营
        $scope.info.selfSupport = selfSupport;
        $scope.encodeInfo = encodeURIComponent(JSON.stringify(info))
        //取消
        $scope.close = function() {
            $modalInstance.close();
        };
        //查看协议
        $scope.action.dealFile = function(event) {
            var self = event.currentTarget;
            $.when($.ajax({
                url: siteVar.serverUrl + "/sesametrade/lookSignedPDFPage.json"
            })).then(function(data) {
                if (data.success) {
                    if (!tools.ajaxLocked(self)) return;
                    $.ajax({
                        type: "post",
                        url: siteVar.serverUrl + '/sesametrade/lookSignedPDF.json',
                        data: {
                            appreqid: info.appreqid
                        },
                        success: function(data) {
                            tools.ajaxOpened(self);
                            if (!tools.interceptor(data)) return;
                            if (data.success) {
                                var openWin = window.open('about:blank');
                                openWin.location.href = data.data;
                            }
                        },
                        error: function(err) {
                            tools.ajaxOpened(self);
                            tools.ajaxError(err);
                            return false;
                        }
                    })
                }

            }).fail(function(err) {
                tools.ajaxOpened(self);
                tools.ajaxError(err);
                return false;
            });

        }
    };


    //项目详情
    function projectDetailModal($scope, info, $modalInstance) {
        $scope.info = info;
        info.minSubscribeAmt = tools.formatNumber(info.minSubscribeAmt);
        info.incSubscribeAmt = tools.formatNumber(info.incSubscribeAmt);
        info.planRaiseAmt = tools.formatNumber(info.planRaiseAmt);
        //info.adviserRate = (new Number(info.adviserRate)).mul(100)
        $scope.close = function() {
            $modalInstance.close();
        };

    };
    //取消交易
    var cancelOrderModal = function($scope, info, $modalInstance) {
        $scope.info = info;
        switch (parseInt(info.state)) {
            case 10:
                $scope.info.state = "待付款";
                break;
            case 20:
                $scope.info.state = "已付款";
                break;
            case 30:
                $scope.info.state = "认购成功";
                break;
            case 40:
                $scope.info.state = "赎回中";
                break;
            case 50:
                $scope.info.state = "赎回成功";
                break;
            case 60:
                $scope.info.state = "已取消";
                break;
            default:
                $scope.info.state = "";
                break;
        }
        $scope.form = {
            id: info.id
        };
        //取消
        $scope.close = function() {
            $modalInstance.close();
        };
        //确定
        $scope.ok = function(event) {
            var self = event.currentTarget;

            if (!$scope.form.cancelDescribe) {
                alert("取消备注不能为空！");
                return false;
            };
            if (!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + '/sesametrade/cancelSesameTrade.json',
                data: $scope.form,
                success: function(data) {
                    tools.ajaxOpened(self);
                    if (!tools.interceptor(data)) return;
                    alert("成功取消该订单，该订单状态变为已取消!");
                    $modalInstance.close();
                    vm.dtInstance.rerender();
                },
                error: function(err) {
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            })
        }
    }

}
