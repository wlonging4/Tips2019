'use strict';
function logManage($scope, $modal, tools, DTOptionsBuilder, DTColumnBuilder, $location, getSelectListFactory) {
    var form = $("#js_form"),form_lite = $("#js_form_lite"), conditionItem = form.find(".form-group");
    $scope.form = {
        isShow: (conditionItem.length > 0) ? true : false
    };
    $scope.action = {};
    var userId = $location.$$search;
    getSelectListFactory.getSelectList(['connecttype']).then(function (res) {
        $scope.selectList = res.data[0].connecttype;
    });
    /*
创建表格选项
*/
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax', {
        url: siteVar.serverUrl + "log/queryLogList.json",
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
        DTColumnBuilder.newColumn('id').withTitle('<input type="checkbox" class="selectAll">全选').withOption('sWidth', '50px').renderWith(function (data) {
            return "<input type='checkbox' data-id='" + data + "' class='checkItem'>";
        }),
        DTColumnBuilder.newColumn('title').withTitle('日志标题').withOption('sWidth', '200px').renderWith(function (data, type, full) {
            return "<a href='javascript:void(0)' class='logDetail' data-id='" + full.id + "'>" + data + "</a>"
        }),
        DTColumnBuilder.newColumn('connectTime').withTitle('沟通时间').withOption('sWidth', '150px').renderWith(function (data) {
            return toFullDate(data);
        }),
        DTColumnBuilder.newColumn('connectTypeName').withTitle('沟通方式').withOption('sWidth', '60px'),
        DTColumnBuilder.newColumn('isSubmit').withTitle('是否提交').withOption('sWidth', '60px').renderWith(function (data, type, full) {
            return data ? '已提交' : '未提交';
        }),
        DTColumnBuilder.newColumn('financialId').withTitle('理财经理ID').withOption('sWidth', '90px').renderWith(function (data) {
            if (!data) return "";
            return '<a href="#/managerDetail.html?financialId=' + data + '" target="_blank">' + data + '</a>';
        }),
        DTColumnBuilder.newColumn('financialName').withTitle('理财经理姓名').withOption('sWidth', '90px'),
        DTColumnBuilder.newColumn('financialMobile').withTitle('联系电话').withOption('sWidth', '80px'),
        DTColumnBuilder.newColumn('levelName').withTitle('级别').withOption('sWidth', '30px'),
        DTColumnBuilder.newColumn('district').withTitle('地区').withOption('sWidth', '80px'),
        DTColumnBuilder.newColumn('supportUserName').withTitle('支持人姓名').withOption('sWidth', '80px'),
        DTColumnBuilder.newColumn('id').withTitle('操作').withOption('sWidth', '130px').renderWith(function (data, type, full) {
            if (full.isSubmit == false) {
                return "<a href='javascript:void(0)' class='btn btn-primary editLog' data-id='" + data + "'>编辑</a><a href='javascript:void(0)' class='btn btn-danger deleteLog' data-id='" + data + "'>删除</a>";
            } else {
                return "<button class='btn btn-primary' disabled='disabled'>编辑</button><button class='btn btn-danger' disabled='disabled' data-id='" + data + "'>删除</button>";
            }
        })
    ];
    $scope.action.reset = function () {
        for (var prop in $scope.form) {
            if (prop !== 'isShow') delete $scope.form[prop];
        }
        vm.dtInstance.rerender();
    };
    $scope.action.search = function () {
        vm.dtInstance.rerender();
    };
    var addLogData = {};

    var logModal=function($scope, $modal, $rootScope, tools, DTOptionsBuilder, DTColumnBuilder, $modalInstance, form, select, getSelectListFactory) {
            setTimeout(function(){
                ComponentsPickers.init();
            },300);
            $scope.form = form || {};
            $scope.select = select || {};
            $scope.action = {};
            $scope.ifSave = false;
            $scope.ifChange = false;
            $scope.ifBlank = false;
            $scope.data = {};
            $scope.searches = {};
            $scope.selectList = [];
            $scope.titleCount=0;
            $scope.contentCount=0;
            $scope.close = function () {
                $modalInstance.close();
            }
            getSelectListFactory.getSelectList(['connecttype']).then(function (res) {
                $scope.selectList = res.data[0].connecttype;
            });
        $scope.interalert=function (data) {
            $("#js_dialog_permission .js_content").html('<span class="ui_red">'+data+'</span>');
            $("#js_dialog_permission").modal("show");
        };
        $scope.data.connectTime=tools.toJSDate(new Date());

        //添加表格
        /*
        创建表格选项
        */
        var vms = this;
        vms.dtInstance = {};
        vms.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax', {
            url: siteVar.serverUrl + "log/queryLogFinancial.json",
            type: 'POST',
            /*data: function () {
                return {'mobile':$scope.searches.mobileSearch,'realname':$scope.searches.realnameSearch}
            }*/
            data: function (d) {
                jQuery.extend(d, tools.getFormele({},form_lite,{'mobile':$scope.searches.mobileSearch,'realname':$scope.searches.realnameSearch}));
            }
        })
            .withDataProp('data')
            .withOption('searching', false)
            .withOption('ordering', false)
            .withOption('serverSide', true)
            .withOption('processing', false)
            .withOption('scrollX', true)
            .withLanguage(tools.dataTablesLanguage)
            .withOption('createdRow', function (row, data, dataIndex) {
                angular.element(row).addClass("rows" + data.id)
            })
            .withOption('fnDrawCallback', fnDrawCallback)
            .withPaginationType('simple_numbers');
        vms.dtColumns = [
            DTColumnBuilder.newColumn('').withTitle('选择').withOption('sWidth', '30px').renderWith(function (data,type,full) {
                return "<input type='radio' data-id='"+full.financialId+"' data-realname='" + full.realname + "' data-mobile='"+full.mobile+"' class='checkItemLog'>";
            }),
            DTColumnBuilder.newColumn('realname').withTitle('姓名').withOption('sWidth', '60px').notSortable(),
            DTColumnBuilder.newColumn('mobile').withTitle('手机号码').withOption('sWidth', '100px'),
            DTColumnBuilder.newColumn('storename').withTitle('店铺名称').withOption('sWidth', '150px'),
            DTColumnBuilder.newColumn('hierarchy').withTitle('级别').withOption('sWidth', '100px')
        ];

            function fnDrawCallback(){
                //回显手机号
                $('.checkItemLog').each(function (i) {
                    if($('.checkItemLog').eq(i).attr('data-id')==$scope.data.financialId){
                        $(this).attr('checked','true');
                    }
                });
                //单选获取手机号
                $('.checkItemLog').on('click',function () {
                    $('.checkItemLog').each(function (i) {
                        $('.checkItemLog').eq(i).removeProp('checked');
                    });
                    if($(this).attr('data-id')!=$scope.data.financialId){
                        $(this).attr('checked','true');
                        $scope.data.realname=$(this).attr('data-realname');
                        $scope.data.mobile=$(this).attr('data-mobile');
                        $scope.data.financialId = $(this).attr('data-id');
                    }else{
                        $(this).removeProp('checked');
                        delete  $scope.data.realname;
                        delete  $scope.data.mobile;
                        delete  $scope.data.financialId;
                    }
                })
            }
            $(document).on("keyup", ".js_validator_int", function() {
                var str = this.value.replace(/\D/g, "");
                this.value = str;
            });
            $scope.action.titleChange=function(){
                $scope.titleCount=$(".logTitle").val().length;
            }
            $scope.action.contentChange=function(){
                $scope.contentCount=$(".logContent").val().length;
            }
            $scope.action.search = function () {
                vms.dtInstance.rerender();
            }
            $scope.action.save = function () {
                $scope.ifBlank = $scope.data['title'] && $scope.data['content'] && $scope.data['connectTime'] && $scope.data['connectType']&& $scope.data['mobile']&& $scope.data['realname']&& $scope.data['financialId'];
                if (!$scope.ifBlank) {
                    $scope.interalert("请输入完整信息");
                } else {
                    var param = {
                        title: $scope.data['title'],
                        content: $scope.data['content'],
                        connectTime: $scope.data['connectTime'],
                        connectType: $scope.data['connectType'],
                        financialId: $scope.data['financialId']
                    }
                    var self = this;
                    if(!tools.ajaxLocked(self)) return;
                    $.ajax({
                        url: siteVar.serverUrl + "log/saveLog.json",
                        type: "POST",
                        data: param,
                        success: function (data) {
                            tools.ajaxOpened(self);
                            if (data && data.success) {
                                $scope.interalert("保存成功");
                                $scope.data = {};
                                $scope.ifSave = true;
                                $modalInstance.close();
                                vm.dtInstance.rerender();
                            }
                        },
                        error: function (msg) {
                            tools.ajaxOpened(self);
                            tools.ajaxError(err);
                            console.log(msg);
                        }
                    })
                }
            }
            $scope.action.saveAndSubmit = function () {
                $scope.ifBlank = $scope.data['title'] && $scope.data['content'] && $scope.data['connectTime'] && $scope.data['connectType']&& $scope.data['mobile']&& $scope.data['realname']&& $scope.data['financialId'];
                if (!$scope.ifBlank) {
                    $scope.interalert("请输入完整信息");
                } else {
                    var param = {
                        title: $scope.data['title'],
                        content: $scope.data['content'],
                        connectTime: $scope.data['connectTime'],
                        connectType: $scope.data['connectType'],
                        financialId: $scope.data['financialId']
                    }
                    var self = this;
                    if(!tools.ajaxLocked(self)) return;
                    $.ajax({
                        url: siteVar.serverUrl + "log/saveAndSubmitLog.json",
                        type: "POST",
                        data: param,
                        success: function (data) {
                            tools.ajaxOpened(self);
                            if (data && data.success) {
                                $scope.interalert("保存成功");
                                $scope.data = {};
                                $scope.ifSave = true;
                                $modalInstance.close();
                                vm.dtInstance.rerender();
                            }
                        },
                        error: function (msg) {
                            tools.ajaxOpened(self);
                            tools.ajaxError(err);
                            console.log(msg);
                        }
                    })
                }
            }
            var outsideModal = $modalInstance;
            $scope.action.cancel = function () {
                if ($scope.ifSave == false && $scope.ifChange == true) {
                    $modal.open({
                        backdrop: true,
                        backdropClick: true,
                        dialogFade: false,
                        keyboard: true,
                        templateUrl: 'alertModal.html',
                        windowClass: "modal-640",
                        controller: function ($scope, tools, $modalInstance, form, select) {
                            $scope.form = form || {};
                            $scope.select = select || {};
                            $scope.close = function () {
                                $modalInstance.close();
                            }
                            $scope.modalHead = "提示";
                            $scope.modalContent = "该日志未保存，确定取消编辑？";
                            $scope.confirmShow = true;
                            $scope.confirmBtn = function () {
                                $scope.close();
                                outsideModal.close();
                            }
                        },
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
                    $scope.close();
                }
            }
        }
    $scope.action.addLog = function () {
        $modal.open({
            backdrop: true,
            backdropClick: true,
            dialogFade: false,
            keyboard: true,
            templateUrl: 'addLog.html',
            controller : logModal,
            controllerAs : 'logModal',
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
    $scope.action.submitLog = function () {
        var logList = [];
        $("#dataTables input:checked").each(function (index, item) {
            logList.push(item.getAttribute("data-id"));
        });
        if (logList.length == 0) {
            $modal.open({
                backdrop: true,
                backdropClick: true,
                dialogFade: false,
                keyboard: true,
                templateUrl: 'alertModal.html',
                windowClass: "modal-640",
                controller: function ($scope, tools, $modalInstance, form, select) {
                    $scope.form = form || {};
                    $scope.select = select || {};
                    $scope.close = function () {
                        $modalInstance.close();
                    }
                    $scope.modalHead = "提醒";
                    $scope.modalContent = "请先选择需要提交的日志";
                    $scope.confirmShow = false;
                },
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
            console.log(logList);
            $modal.open({
                backdrop: true,
                backdropClick: true,
                dialogFade: false,
                keyboard: true,
                templateUrl: 'alertModal.html',
                windowClass: "modal-640",
                controller: function ($scope, tools, $modalInstance, form, select) {
                    $scope.form = form || {};
                    $scope.select = select || {};
                    $scope.close = function () {
                        $modalInstance.close();
                    }
                    $scope.modalHead = "确认";
                    $scope.modalContent = "确认提交？";
                    $scope.confirmShow = true;
                    $scope.confirmBtn = function () {
                        $.ajax({
                            url: siteVar.serverUrl + "log/submitBatch.json",
                            type: "POST",
                            data: {
                                logIds: logList
                            },
                            traditional: true,
                            success: function (data) {
                                if (data.success) {
                                    alert("提交成功");
                                    $modalInstance.close();
                                    vm.dtInstance.rerender();
                                }
                            },
                            error: function (msg) {
                                console.log(msg);
                            }
                        })
                    }
                },
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

    function fnDrawCallback(data) {
        $scope.$apply(function () {
            $scope.recordsTotal = data.json.recordsTotal;
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
            var totalChecked = 0;
            $(".checkItem").each(function (index, item) {
                if ($(item).attr("checked")) {
                    totalChecked++;
                }
            });
            console.log(totalChecked);
            if (totalChecked == $(".checkItem").length) {
                $(".selectAll").attr("checked", "checked");
                $scope.selectAll = true;
            } else {
                $(".selectAll").attr("checked", false);
                $scope.selectAll = false;
            }
        });
        table.on("click", ".logDetail", function () {
            var logId = this.getAttribute("data-id");
            $.ajax({
                url: siteVar.serverUrl + "log/queryLogById.json",
                type: "POST",
                data: {
                    id: logId
                },
                success: function (data) {
                    if (typeof data == "string") {
                        var data = JSON.parse(data);
                    }
                    if (!tools.interceptor(data)) return;
                    if (data.success) {
                        $modal.open({
                            backdrop: true,
                            backdropClick: true,
                            dialogFade: false,
                            keyboard: true,
                            templateUrl: 'logDetail.html',
                            controller: function ($scope, tools, $modalInstance, form, select) {
                                $scope.form = form || {};
                                $scope.select = select || {};
                                $scope.close = function () {
                                    $modalInstance.close();
                                }
                                $scope.data = data.data;
                                $scope.data.connectTime = toFullDate(data.data.connectTime);
                            },
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
            });
        });

        var editLogData = {};
        table.on("click", ".editLog", function () {
            var logId = this.getAttribute("data-id");
            //if (!editLogData[logId]) {
            editLogData[logId] = {};
            $.ajax({
                url: siteVar.serverUrl + "log/queryLogById.json",
                type: "POST",
                data: {
                    id: logId
                },
                success: function (data) {
                    if (typeof data == "string") {
                        var data = JSON.parse(data);
                    }
                    if (!tools.interceptor(data)) return;
                    if (data.success) {
                        $modal.open({
                            backdrop: true,
                            backdropClick: true,
                            dialogFade: false,
                            keyboard: true,
                            templateUrl: 'editLog.html',
                            controller: function ($scope, tools, $modalInstance, form, select, getSelectListFactory) {
                                $scope.form = form || {};
                                $scope.select = select || {};
                                $scope.action = {};
                                $scope.ifSave = false;
                                $scope.ifChange = false;
                                $scope.ifBlank = false;
                                $scope.selectList = [];

                                $scope.close = function () {
                                    $modalInstance.close();
                                }
                                setTimeout(function(){
                                    ComponentsPickers.init();
                                },300);
                                $scope.action.titleChange=function(){
                                    $scope.titleCount=$(".logTitle").val().length;
                                }
                                $scope.action.contentChange=function(){
                                    console.log(1);
                                    $scope.contentCount=$(".logContent").val().length;
                                }
                                getSelectListFactory.getSelectList(['connecttype']).then(function (res) {
                                    $scope.data = data.data;
                                    $scope.titleCount=$scope.data.title.length;
                                    $scope.contentCount=$scope.data.content.length;
                                    $scope.data.connectTime = toFullDate(data.data.connectTime);
                                    $scope.selectList = res.data[0].connecttype;
                                    $scope.data.connectType = data.data.connectType;
                                    $scope.$apply();
                                    $("#editSelect").find("option").eq($scope.data.connectType).attr("selected", "selected");
                                    for (var key in $scope.data) {
                                        editLogData[logId][key] = $scope.data[key];
                                    }
                                });
                                $scope.action.save = function () {
                                    $scope.ifBlank = $scope.data['title'] && $scope.data['content'] && $scope.data['connectTime'] && $scope.data['connectType'].toString();
                                    if (!$scope.ifBlank) {
                                        alert("请输入完整信息");
                                    } else {
                                        var param = {
                                            id: $scope.data['id'],
                                            title: $scope.data['title'],
                                            content: $scope.data['content'],
                                            connectTime: $scope.data['connectTime'],
                                            connectType: $scope.data['connectType'],
                                            financialId: $scope.data['financialId']
                                        }
                                        $.ajax({
                                            url: siteVar.serverUrl + "log/saveLog.json",
                                            type: "POST",
                                            data: param,
                                            success: function (data) {
                                                if (data && data.success) {
                                                    alert("保存成功");
                                                    $scope.data = {};
                                                    $scope.ifSave = true;
                                                    $modalInstance.close();
                                                    vm.dtInstance.rerender();
                                                }
                                            },
                                            error: function (msg) {
                                                console.log(msg);
                                            }
                                        })
                                    }
                                }
                                $scope.action.saveAndSubmit = function () {
                                    $scope.ifBlank = $scope.data['title'] && $scope.data['content'] && $scope.data['connectTime'] && $scope.data['connectType'].toString();
                                    if (!$scope.ifBlank) {
                                        alert("请输入完整信息");
                                    } else {
                                        var param = {
                                            title: $scope.data['title'],
                                            content: $scope.data['content'],
                                            connectTime: $scope.data['connectTime'],
                                            connectType: $scope.data['connectType'],
                                            financialId: $scope.data['financialId'],
                                            id: $scope.data['id']
                                        }
                                        $.ajax({
                                            url: siteVar.serverUrl + "log/saveAndSubmitLog.json",
                                            type: "POST",
                                            data: param,
                                            success: function (data) {
                                                if (data && data.success) {
                                                    alert("保存成功");
                                                    $scope.data = {};
                                                    $scope.ifSave = true;
                                                    $modalInstance.close();
                                                    vm.dtInstance.rerender();
                                                }
                                            },
                                            error: function (msg) {
                                                console.log(msg);
                                            }
                                        })
                                    }
                                }
                                var outsideModal = $modalInstance;
                                $scope.action.cancel = function () {
                                    $scope.ifChange = false;
                                    for (var key in $scope.data) {
                                        if (editLogData[logId][key] !== $scope.data[key])
                                            $scope.ifChange = true;
                                    }
                                    if ($scope.ifChange == true && $scope.ifSave == false) {
                                        $modal.open({
                                            backdrop: true,
                                            backdropClick: true,
                                            dialogFade: false,
                                            keyboard: true,
                                            templateUrl: 'alertModal.html',
                                            windowClass: "modal-640",
                                            controller: function ($scope, tools, $modalInstance, form, select) {
                                                $scope.form = form || {};
                                                $scope.select = select || {};
                                                $scope.close = function () {
                                                    $modalInstance.close();
                                                }
                                                $scope.modalHead = "提示";
                                                $scope.modalContent = "该日志未保存，确定取消编辑？";
                                                $scope.confirmShow = true;
                                                $scope.confirmBtn = function () {
                                                    $scope.close();
                                                    outsideModal.close();
                                                }
                                            },
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
                                        $scope.close();
                                    }
                                }
                            },
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
            });
        });
        table.on("click", ".deleteLog", function () {
            var logId = this.getAttribute("data-id");
            $modal.open({
                backdrop: true,
                backdropClick: true,
                dialogFade: false,
                keyboard: true,
                templateUrl: 'alertModal.html',
                windowClass: "modal-640",
                controller: function ($scope, tools, $modalInstance, form, select) {
                    $scope.form = form || {};
                    $scope.select = select || {};
                    $scope.close = function () {
                        $modalInstance.close();
                    }
                    $scope.modalHead = "确认";
                    $scope.modalContent = "确认删除该日志？";
                    $scope.confirmShow = true;
                    $scope.confirmBtn = function () {
                        $.ajax({
                            url: siteVar.serverUrl + "log/deleteLog.json",
                            type: "POST",
                            data: {
                                id: logId
                            },
                            success: function (data) {
                                if (data.success) {
                                    alert("删除成功！");
                                    $modalInstance.close();
                                    vm.dtInstance.rerender();
                                }
                            },
                            error: function () {

                            }
                        })
                    }
                },
                resolve: {
                    "form": function () {
                        return $scope.form;
                    },
                    "select": function () {
                        return $scope.select;
                    }
                }
            });
        });
        $("#logExport").on("click", function () {
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