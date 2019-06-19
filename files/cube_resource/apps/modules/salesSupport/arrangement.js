'use strict';
function arrangement($scope, $modal, tools, DTOptionsBuilder, DTColumnBuilder,getSelectListFactory) {
    var form = $("#js_form"), conditionItem = form.find(".form-group");
    var listString = "";
    var financialIds = [];
    var supportId = "";
    $scope.form = {
        isShow: (conditionItem.length > 0) ? true : false
    };
    $scope.action = {};
    $scope.managerList = [];
    getSelectListFactory.getSelectList(['yixinstatus','businesstype','yixintype']).then(function (res) {
        $scope.yixinstatusList=res.data[0].yixinstatus;
        $scope.businesstypeList=res.data[1].businesstype;
        $scope.yixintypeList=res.data[2].yixintype;
        $.ajax({
            url:siteVar.serverUrl+"fiancial/getUserlevel.json",
            success:function (data) {
                if(data.success && data.data)
                {
                    $scope.levelList=data.data;
                }else{
                    console.log(data.msg);
                }
            }
        })
    });

    /*
 创建表格选项
 */
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax', {
        url: siteVar.serverUrl+'fiancial/queryFiancialList.json',
        type: 'POST',
        data: function (d) {
            jQuery.extend(d, tools.getFormele({}, form));
        }
    })
        .withDataProp('data')
        .withOption('createdRow', function (row, data, dataIndex) {
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
        DTColumnBuilder.newColumn('financialId').withTitle('<input type="checkbox" class="selectAll">全选').withOption('sWidth', '45px').renderWith(function (data, type, full) {
            return "<input type='checkbox' data-id='" + data + "' data-name='" + full.realname + "' class='checkItem'>";
        }),
        DTColumnBuilder.newColumn('allotTime').withTitle('分配时间').withOption('sWidth', '140px').renderWith(function (data) {
            return toFullDate(data);
        }),
        DTColumnBuilder.newColumn('supportName').withTitle('支持人员姓名').withOption('sWidth', '90px'),
        DTColumnBuilder.newColumn('financialId').withTitle('理财经理ID').withOption('sWidth', '100px').renderWith(function (data,type,full) {
            if(!data) return "";
            return '<a href="#/managerDetail.html?financialId=' + data + '" target="_blank">' + data + '</a>';
        }),
        DTColumnBuilder.newColumn('realname').withTitle('理财经理姓名').withOption('sWidth', '90px'),
        DTColumnBuilder.newColumn('mobile').withTitle('联系电话').withOption('sWidth', '80px'),
        DTColumnBuilder.newColumn('starttime').withTitle('开店时间').withOption('sWidth', '140px').renderWith(function (data) {
            return toFullDate(data);
        }),
        DTColumnBuilder.newColumn('yixinstatusStr').withTitle('宜信员工').withOption('sWidth', '60px'),
        DTColumnBuilder.newColumn('isSalesStr').withTitle("在宜信是否销售岗").withOption("sWidth", "60px"),
        DTColumnBuilder.newColumn('levelname').withTitle("级别").withOption("sWidth", "120px"),
        DTColumnBuilder.newColumn('hierarchy').withTitle("等级").withOption("sWidth", "40px"),
        DTColumnBuilder.newColumn('district').withTitle("地区").withOption("sWidth", "60px"),
        DTColumnBuilder.newColumn('team').withTitle("团队").withOption("sWidth", "50px"),
        DTColumnBuilder.newColumn('businessTypeStr').withTitle("业务类型").withOption("sWidth", "80px"),
        DTColumnBuilder.newColumn('remark').withTitle("备注").withOption("sWidth", "80px")
    ];
    $scope.action.reset = function () {
        for (var prop in $scope.form) {
            if (prop !== 'isShow') delete $scope.form[prop];
        }
        ;
        vm.dtInstance.rerender();
    };
    $scope.action.search = function () {
        vm.dtInstance.rerender();
    };
    $scope.showSelect = false;
    $scope.action.showSelect = function () {
        if ($scope.form.yixinstatus == '1') {
            $scope.showSelect = true;
        } else {
            $scope.showSelect = false;
        }
    }
    $scope.action.import = function () {
        $modal.open({
            backdrop: true,
            backdropClick: true,
            dialogFade: false,
            keyboard: true,
            templateUrl: 'importTemplate.html',
            controller: importTemplateCtrl,
            windowClass: 'modal-640',
            resolve: {
                "form": function () {
                    return $scope.form;
                },
                "select": function () {
                    return $scope.select;
                }
            }
        });
    }
    $scope.action.transArrange = function () {
        if ($("#dataTables input:checked").length == 0) {
            alert("请先选择理财经理");
        }
        else {
            $scope.managerList = [];
            financialIds = [];
            $("#dataTables input:checked").each(function (index, item) {
                if (item.getAttribute("class") !== "checkItem") {
                    return true;
                }
                $scope.managerList.push(item.getAttribute("data-name"));
                financialIds.push(item.getAttribute("data-id"));
            });
            listString = $scope.managerList.join(",");
            $modal.open({
                backdrop: true,
                backdropClick: true,
                dialogFade: false,
                keyboard: true,
                templateUrl: 'transArrange.html',
                controller: function ($scope, tools, $modalInstance, form, select) {
                    $scope.form = form || {};
                    $scope.select = select || {};
                    $scope.selectShow = false;
                    $scope.ifBlank = false;
                    $scope.searchList = [];
                    var inputValue = "";
                    $scope.inputValue = "";
                    $scope.close = function () {
                        $modalInstance.close();
                    }
                    $scope.search = function () {
                        $.ajax({
                            url: siteVar.serverUrl + "support/queryByName.json",
                            data: {
                                supportName: encodeURI($scope.inputValue),
                            },
                            success: function (data) {
                                if (data.success && data.data.length > 0) {
                                    var data = data.data;
                                    $scope.searchList = [];
                                    for (var i = 0; i < data.length; i++) {
                                        var item = {
                                            supportName: data[i].supportName,
                                            supportMobile: data[i].supportMobile,
                                            supportEmail: data[i].supportEmail,
                                            supportId: data[i].supportId
                                        }
                                        item.text = item.supportName + " " + item.supportEmail + " " + item.supportMobile;
                                        $scope.searchList.push(item);
                                    }
                                    $scope.selectShow = true;
                                    $scope.$apply();
                                }
                            }
                        })
                    }
                    $scope.hideSelect = function () {
                        $scope.selectShow = false;
                    }
                    $scope.mouseOver = function (e) {
                        var thisDom = e.currentTarget;
                        thisDom.style.backgroundColor = "#EAEAEA";
                    }
                    $scope.mouseLeave = function (e) {
                        var thisDom = e.currentTarget;
                        thisDom.style.backgroundColor = "";
                    }
                    $scope.optionsClick = function (e) {
                        var thisDom = e.currentTarget;
                        $scope.inputValue = thisDom.innerHTML;
                        inputValue = $scope.inputValue;
                        supportId = e.currentTarget.getAttribute("data-id");
                        $scope.selectShow = false;
                    }
                    var thisModal = $modalInstance;
                    $scope.transConfirm = function () {
                        if ($scope.inputValue == "") {
                            $scope.ifBlank = true;
                        }
                        else {
                            $scope.ifBlank = false;
                            $modal.open({
                                backdrop: true,
                                backdropClick: true,
                                dialogFade: false,
                                keyboard: true,
                                templateUrl: 'transConfirm.html',
                                controller: function ($scope, tools, $modalInstance, form, select) {
                                    $scope.form = form || {};
                                    $scope.select = select || {};
                                    $scope.close = function () {
                                        $modalInstance.close();
                                    }
                                    $scope.inputValue = inputValue;
                                    $scope.submit = function () {
                                        $.ajax({
                                            url: siteVar.serverUrl + "fiancial/updateSales.json",
                                            data: {
                                                financialIds: financialIds,
                                                supportId: supportId
                                            },
                                            traditional: true,
                                            success: function (data) {
                                                if (data.success) {
                                                    alert("转分配成功!");
                                                    thisModal.close();
                                                    $modalInstance.close();
                                                    vm.dtInstance.rerender();
                                                }
                                                else {
                                                    alert("转分配失败");
                                                    console.log(data.msg);
                                                }
                                            }
                                        });
                                    }

                                },
                                windowClass: 'modal-640',
                                resolve: {
                                    "form": function () {
                                        return $scope.form;
                                    },
                                    "select": function () {
                                        return $scope.select;
                                    }
                                }
                            });
                        }
                    }
                    $scope.listString = listString;
                },
                windowClass: 'modal-640',
                resolve: {
                    "form": function () {
                        return $scope.form;
                    },
                    "select": function () {
                        return $scope.select;
                    }
                }
            });
        }
    }

    var importTemplateCtrl = function ($scope, tools, $modalInstance, form, select) {
        $scope.form = form || {};
        $scope.select = select || {};
        $scope.close = function () {
            $modalInstance.close();
        }
        $scope.downloadTemplate = function (e) {
            var This = $(e.currentTarget);
            tools.export(This);
        }
        /*导入确认按钮*/
        $scope.ok = function () {
            var self = $("#confirmBtn");
            if (!tools.ajaxLocked(self)) return;
            $modalInstance.close();
            var data = new FormData($("#importManagerListForm")[0]);
            $.ajax({
                url: siteVar.serverUrl + "fiancial/importFinancial.json",
                type: "POST",
                data: data,
                processData: false,
                contentType: false,
                success: function (data) {
                    if (typeof data == "string") {
                        var data = JSON.parse(data);
                    }
                    tools.ajaxOpened(self);
                    if (!data.success) {
                        var wrongMsg = data.msg;
                        $modal.open({
                            backdrop: true,
                            backdropClick: true,
                            dialogFade: false,
                            keyboard: true,
                            templateUrl: 'importFail.html',
                            controller: function ($scope, tools, $modalInstance, form, select) {
                                $scope.form = form || {};
                                $scope.select = select || {};
                                $scope.close = function () {
                                    $modalInstance.close();
                                }
                                $scope.wrongMsg = wrongMsg;
                            },
                            windowClass: 'modal-640',
                            resolve: {
                                "form": function () {
                                    return $scope.form;
                                },
                                "select": function () {
                                    return $scope.select;
                                }
                            }
                        });
                    }
                    else {
                        $modal.open({
                            backdrop: true,
                            backdropClick: true,
                            dialogFade: false,
                            keyboard: true,
                            templateUrl: 'importSuccess.html',
                            controller: function ($scope, tools, $modalInstance, form, select) {
                                $scope.form = form || {};
                                $scope.select = select || {};
                                $scope.close = function () {
                                    $modalInstance.close();
                                }
                                $scope.msg = data.msg;
                            },
                            windowClass: 'modal-640',
                            resolve: {
                                "form": function () {
                                    return $scope.form;
                                },
                                "select": function () {
                                    return $scope.select;
                                }
                            }
                        });
                    }
                    vm.dtInstance.rerender();
                },
                error: function (err) {
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });
        };
    }

    function fnDrawCallback(data) {
        $scope.$apply(function () {
            $scope.recordsTotal = data.json.info.supportCount;
        });
        $scope.selectAll = false;
        var table = $("#dataTables"), tbody = table.find("tbody");
        table.off("click").on("click", ".selectAll", function () {
            if ($scope.selectAll == false) {
                $("#dataTables input").attr("checked", "checked");
                $scope.selectAll = true;
            }
            else {
                $("#dataTables input").attr("checked", false);
                $scope.selectAll = false;
            }
        });
        $(".checkItem").click(function () {
            var totalChecked=0;
            $(".checkItem").each(function (index, item) {
                if($(item).attr("checked")){
                    totalChecked++;
                }
            });
            if(totalChecked==$(".checkItem").length){
                $(".selectAll").attr("checked","checked");
                $scope.selectAll=true;
            }else{
                $(".selectAll").attr("checked",false);
                $scope.selectAll=false;
            }
        });
        $("#arrangeExport").on("click", function () {
            tools.export(this);
        });

    }

    function toFullDate(n) {
        if (!n) return "";
        let D = new Date(n),
            date = [
                D.getFullYear(),
                formatNum(D.getMonth() + 1),
                formatNum(D.getDate())
            ],
            time = D.toTimeString().split(" ")[0];
        return date.join("-") + " " + time;
    }

    function formatNum(num) {
        return num < 10 ? "0" + num : "" + num;
    }
}