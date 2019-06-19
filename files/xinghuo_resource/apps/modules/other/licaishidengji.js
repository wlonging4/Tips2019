'use strict';

function licaishidengjiController($scope, tools, DTOptionsBuilder, DTColumnBuilder, $modal) {
    var domForm = $("#js_form"),
        conditionItem = domForm.find(".form-group");
    $scope.form = {
        isShow: (conditionItem.length > 6) ? true : false
    };

    $scope.select = {};
    $scope.action = {
        init: function() {
            var that = this;
            setTimeout(function() {
                Metronic.init();
                ComponentsPickers.init();
            }, 300);
        }
    };

    /*
     创建表格选项
     */
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax', {
            url: siteVar.serverUrl + '/managerstarlevel/getManagerStarActivityList.shtml',
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

        .withOption('bPaginate',true)
        .withOption('bFilter', false)

        .withLanguage(tools.dataTablesLanguage)
        .withOption('fnDrawCallback', fnDrawCallback)
        .withPaginationType('simple_numbers');
    vm.dtColumns = [
        DTColumnBuilder.newColumn('activityName').withTitle('活动名称').withOption('sWidth', '120px').renderWith(function(data, type, full) {
            if (!data) return "";
            return data;
        }),
        DTColumnBuilder.newColumn('activityStartDate').withTitle('活动时间').withOption('sWidth', '200px').renderWith(function(data, type, full) {
            if (!data) return "";
            return (data ? tools.toJSYMD(data) : '') + ' 到 ' + (data ? tools.toJSYMD(full.activityEndDate) : '');
        }),
        DTColumnBuilder.newColumn('updateTime').withTitle('更新时间').withOption('sWidth', '80px').renderWith(function(data, type, full) {
            if (!data) return "";
            return tools.toJSYMD(data);
        }),
        DTColumnBuilder.newColumn('updateTime').withTitle('活动数据').withOption('sWidth', '50px').renderWith(function(data, type, full) {
            var html = '';
            html += ('<a href="javascript:void(0)" class="btn btn-success btn-xs editBtn" style="margin: 0 5px;" data-id="' 
                + full.id + '" data-activityName="' + full.activityName + '" data-activityTime="' + ((data ? tools.toJSYMD(full.activityStartDate) : '') + ' 到 ' + (data ? tools.toJSYMD(full.activityEndDate) : '')) + '">修改</a>');
            return html;
        })
    ];
    $scope.action.reset = function() {
        for (var prop in $scope.form) {
            delete $scope.form[prop];
        }
        vm.dtInstance.rerender();
    };
    $scope.action.search = function() {
        vm.dtInstance.rerender();
    };

    //新建 controller
    function addModalCtrl($scope, $modalInstance){
        $scope.form = {};

        $scope.addClose = function() {
            $modalInstance.close();
        };

        var submitFlag = true;

        $scope.addSave = function() {
            if(!$scope.form.activityName){
                return tools.interalert("请填写活动名称");
            }

            if (!/^\d{4}-\d{2}-\d{2}$/.test($scope.form.activityStartDate)) {
                return tools.interalert("请选择活动时间");
            }

            if (!/^\d{4}-\d{2}-\d{2}$/.test($scope.form.activityEndDate)) {
                return tools.interalert("请选择活动时间");
            }

            if(!$("#addModalForm [name='uploadFile']").val()) return tools.interalert("请选择上传文件");

            var nameArr = $("#addModalForm [name='uploadFile']").val().split(".");
            if(!/xlsx/gi.test(nameArr[nameArr.length-1])) return tools.interalert("文件必须是excel文件，后缀名为xlsx!");

            var self = this;

            if (submitFlag) {
                submitFlag = false;

                var formData = new FormData();
                formData.append('file',$("#addModalForm [name='uploadFile']")[0].files[0]);
                formData.append('activityName',$("#addModalForm [name='activityName']").val());
                formData.append('activityStartDate',$("#addModalForm [name='activityStartDate']").val());
                formData.append('activityEndDate',$("#addModalForm [name='activityEndDate']").val());
                $.ajax({
                    url: siteVar.serverUrl + "/managerstarlevel/saveManagerStarActivity.shtml",
                    method: 'post',
                    data: formData,
                    contentType: false,
                    processData: false,
                    success: function(data) {
                        submitFlag = true;
                        if (!tools.interceptor(data)) return;
                        if(data.success){
                            $modalInstance.close();
                            vm.dtInstance.rerender();
                            // tools.interalert(data.msg);
                            tools.interalert('新建成功');
                        }else{
                            return tools.interalert(data.msg);
                        }
                    },
                    error: function(err){
                        self.ajaxError(err);
                    }
                });
            }
        }   
    }


    //修改 controller
    function editModalCtrl($scope, $modalInstance, id, activityName, activityTime) {
        $scope.form = {};
        $scope.form.id = id;
        $scope.form.activityName = activityName;
        $scope.form.activityTime = activityTime;

        $scope.close = function() {
            $modalInstance.close();
        };
        var submitFlag = true;
        $scope.ok = function() {
            if(!$("#editModalForm [name='uploadFile']").val()) return tools.interalert("请选择上传文件");

            var nameArr = $("#editModalForm [name='uploadFile']").val().split(".");
            if(!/xlsx/gi.test(nameArr[nameArr.length-1])) return tools.interalert("文件必须是excel文件，后缀名为xlsx!");

            var self = this;

            if (submitFlag) {
                submitFlag = false;

                var formData = new FormData();
                formData.append('file',$("#editModalForm [name='uploadFile']")[0].files[0]);
                formData.append('id',id);
                $.ajax({
                    url: siteVar.serverUrl + "/managerstarlevel/updateManagerStarActivity.shtml",
                    method: 'post',
                    data: formData,
                    contentType: false,
                    processData: false,
                    success: function(data) {
                        submitFlag = true;
                        if(!tools.interceptor(data)) return;
                        if(data.success){
                            $modalInstance.close();
                            vm.dtInstance.rerender();
                            tools.interalert('修改成功');
                        }else{
                            return tools.interalert(data.msg);
                        }
                    },
                    error: function(err){
                        self.ajaxError(err);
                    }
                })
            }

        }
    }

    //新建
    $('.addBtn').click(function() {
        setTimeout(function() {
            Metronic.init();
            ComponentsPickers.init();
        }, 300);

        $modal.open({
            backdrop: true,
            backdropClick: true,
            dialogFade: false,
            keyboard: true,
            templateUrl: 'addModal.html',
            controller: addModalCtrl,
            windowClass: 'modal-640'
        });
    });

    function fnDrawCallback() {
        tools.createModal();
        var popUpLayer = $("#js_dialog"),
            popUpLayerContent = popUpLayer.find(".js_content");

        var table = $("#dataTables"),
            tbody = table.find("tbody");


        //修改
        table.off('click').on("click", ".editBtn", function() {
            var self = $(this);
            $modal.open({
                backdrop: true,
                backdropClick: true,
                dialogFade: false,
                keyboard: true,
                templateUrl: 'editModal.html',
                controller: editModalCtrl,
                windowClass: 'modal-640',
                resolve: {
                    "activityName": function() {
                        return self.attr("data-activityname");
                    },
                    "id": function() {
                        return self.attr("data-id");
                    },
                    "activityTime": function() {
                        return self.attr("data-activitytime");
                    }
                }
            });
        });
    }
}

