'use strict';
function dataManage($scope, $modal, tools, $http, getSelectListFactory, DTOptionsBuilder, DTColumnBuilder) {
    var form = $("#js_form"), conditionItem = form.find(".form-group");
    $scope.form = {
        isShow: (conditionItem.length > 6) ? true : false
    };

    $scope.select = {};
    $scope.action = {};
    getSelectListFactory.getSelectList(['businesstype', 'liveness', 'yixintype']).then(function (res) {;
        $scope.select.businesstype = res.data[0].businesstype;
        $scope.select.liveness = res.data[1].liveness;
        $scope.select.yixintype = res.data[2].yixintype;
    });
    $scope.action.chooseStatus = function () {
        if($scope.form.yixinstatus !== '1'){
            if($scope.form.yixintype){
                delete $scope.form.yixintype;
            }
        }
    };
    $http({
        method: "POST",
        url: siteVar.serverUrl + "fiancial/getUserlevel.json",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
        }
    }).success(function(data, status) {
        if(data.success){

            $scope.select.levelid = data.data;
        }else{
            alert(data.msg);
            $scope.select.levelid = [];
        }
    }).error(function(data, status) {
        alert("获取信息失败，请与管理员联系。");
        return;
    });
    /*
     创建表格选项
     */
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax',{
            url:  siteVar.serverUrl + 'fiancial/queryFiancialList.json',
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
        DTColumnBuilder.newColumn('financialId').withTitle('理财经理ID').withOption('sWidth','100px').renderWith(function(data, type, full) {
            if(!data) return "";
            return '<a href="#/managerDetail.html?financialId=' + data + '" target="_blank">' + data + '</a>';
        }),
        DTColumnBuilder.newColumn('realname').withTitle('姓名').withOption('sWidth','120px'),
        DTColumnBuilder.newColumn('mobile').withTitle('联系电话').withOption('sWidth','120px'),
        DTColumnBuilder.newColumn('yixinstatusStr').withTitle('宜信员工').withOption('sWidth','60px'),
        DTColumnBuilder.newColumn('isSalesStr').withTitle('在宜信是否销售岗').withOption('sWidth','120px'),
        DTColumnBuilder.newColumn('levelname').withTitle('级别').withOption('sWidth','120px'),
        DTColumnBuilder.newColumn('isSalesNowStr').withTitle('现在是否销售岗').withOption('sWidth','120px'),
        DTColumnBuilder.newColumn('hierarchy').withTitle('等级').withOption('sWidth','120px'),
        DTColumnBuilder.newColumn('allotTime').withTitle('分配时间').withOption('sWidth','140px').renderWith(function(data, type, full) {
            if(!data) return "";
            return tools.toJSYMD(data);
        }),
        DTColumnBuilder.newColumn('district').withTitle('地区').withOption('sWidth','120px'),
        DTColumnBuilder.newColumn('starttime').withTitle('开店时间').withOption('sWidth','140px').renderWith(function(data, type, full) {
            if(!data) return "";
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('team').withTitle('团队').withOption('sWidth','120px'),
        DTColumnBuilder.newColumn('businessTypeStr').withTitle('业务类型').withOption('sWidth','120px'),
        DTColumnBuilder.newColumn('financialId').withTitle('操作').withOption('sWidth','160px').renderWith(function(data, type, full) {
            if(!data) return "";
            return "<a href='javascript:void(0)' class='btn btn-sm btn-danger editInfo' data-info='" + JSON.stringify(full) + "'>修改信息</a>" +
                "<a href='javascript:void(0)' class='btn btn-sm btn-primary addLog' data-mobile='"+full.mobile+"' data-id='"+full.financialId+"' data-realname='"+full.realname+"'>新增日志</a>";
        })
    ];
    $scope.action.reset = function(){
        for(var prop in $scope.form){
            if(prop !== 'isShow') delete $scope.form[prop];
        };
        vm.dtInstance.rerender();
    };
    $scope.action.search = function(){
        vm.dtInstance.rerender();
    };

    var ModalCtrl = function($scope, $modalInstance, select, info,tools) {
        for(var prop in info){
            if(info[prop] === null){
                info[prop] = ""
            }
        }
        if(!!info.birthday){
            info.birthday = tools.toJSYMD(info.birthday)
        }
        $scope.form = info;
        $scope.select = select;
        $scope.ok = function() {
            var self = $("#confirmBtn");
            var data = tools.getFormele({}, $("#editForm"));
            data.id = info.id;
            if(!tools.ajaxLocked(self)) return;
            $modalInstance.close();
            $.ajax({
                url : siteVar.serverUrl + "fiancial/updateFinancialInfo.json",
                type:"POST",
                data : data,
                success :function(data){
                    if(typeof data == "string"){
                        var data = JSON.parse(data);
                    };
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    if(data.success){
                        alert("修改信息成功");
                        vm.dtInstance.rerender();
                    }else{
                        alert(data.msg)
                    }

                }

            });
        };
        $scope.close = function() {
            $modalInstance.close();
        };
    };

    function fnDrawCallback(data){

        var popUpLayer = $("#js_dialog"), popUpLayerContent = popUpLayer.find(".js_content");
        var table = $("#dataTables"), tbody = table.find("tbody");
        table.off("click").on("click", ".editInfo", function(){
            var info = $(this).attr("data-info");
            info = JSON.parse(info);
            $modal.open({
                backdrop: true,
                backdropClick: true,
                dialogFade: false,
                keyboard: true,
                templateUrl : 'myModalContent.html',
                controller : ModalCtrl,
                resolve:{
                   "select": function(){
                       return $scope.select;
                   },
                    "info": function(){
                        return info;
                    }
                }
            });
        });


        //新增日志
        var logModal=function($scope, infos, $modal, $rootScope, tools, DTOptionsBuilder, DTColumnBuilder, $modalInstance, getSelectListFactory,select,form) {
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
            $scope.data.realname=infos.realname;
            $scope.data.mobile=infos.mobile;
            $scope.data.financialId =infos.financialId;
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
            var vm = this;
            vm.dtInstance = {};
            vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax', {
                //url: siteVar.serverUrl + "log/queryLogList.json",
                url: siteVar.serverUrl + "log/queryLogFinancial.json",
                type: 'POST',
                data: function () {
                    return {'mobile':$scope.data.mobile,'realname':$scope.data.realname}
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
                .withOption('scrollX', true)
                .withLanguage(tools.dataTablesLanguage)
                .withOption('fnDrawCallback', fnDrawCallback)
                .withPaginationType('simple_numbers');
            vm.dtColumns = [
                DTColumnBuilder.newColumn('').withTitle('选择').withOption('sWidth', '30px').renderWith(function (data,type,full) {
                    return "<input type='radio' data-id='"+full.financialId+"' data-realname='" + full.realname + "' data-mobile='"+full.mobile+"' class='checkItemLog'>";
                }),
                DTColumnBuilder.newColumn('realname').withTitle('姓名').withOption('sWidth', '60px').notSortable(),
                DTColumnBuilder.newColumn('mobile').withTitle('手机号码').withOption('sWidth', '100px'),
                DTColumnBuilder.newColumn('storename').withTitle('店铺名称').withOption('sWidth', '150px'),
                DTColumnBuilder.newColumn('hierarchy').withTitle('级别').withOption('sWidth', '100px'),

            ];

            function fnDrawCallback(){
                //绑定当前手机号
                $('.checkItemLog').attr('checked','true');
                $('.checkItemLog').attr('disabled','true');
            }
            $scope.action.titleChange=function(){
                $scope.titleCount=$(".logTitle").val().length;
            }
            $scope.action.contentChange=function(){
                $scope.contentCount=$(".logContent").val().length;
            }
            $scope.action.search = function () {
                vm.dtInstance.rerender();
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
                if (!$scope.ifBlank ) {
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
        };
        $('.addLog').on('click',function () {
            var nowRealName=$(this).attr('data-realname');
            var nowMobile=$(this).attr('data-mobile');
            var nowFinancialId=$(this).attr('data-id');
            $modal.open({
                backdrop: true,
                backdropClick: true,
                dialogFade: false,
                keyboard: true,
                templateUrl: 'addLog.html',
                controller : logModal,
                controllerAs : 'logModal',
                resolve: {
                    "infos": function(){
                        return {
                            'realname':nowRealName,
                            'mobile':nowMobile,
                            'financialId':nowFinancialId
                        }
                     },
                    "form": function () {
                        return $scope.form;
                    },
                    "select": function () {
                        return $scope.select;
                    }
                }
            });
        })
    }
}
