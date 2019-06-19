'use strict';
function managerDetail($scope, $compile, $modal, $http, $q, tools, getSelectListFactory) {
    var form = $("#js_form"), conditionItem = form.find(".form-group"), params = tools.queryUrl(location.href);
    $scope.form = {
        isShow: (conditionItem.length > 6) ? true : false
    };

    $scope.select = {};
    $scope.action = {
    };
    getSelectListFactory.getSelectList([ 'liveness']).then(function (res) {
        $scope.select.liveness = res.data[0].liveness;
    });
    $scope.action.tab = function (e) {
        var target = e.target, $target = $(target), tabs = $("#tabs li"), tabContent = $('.tab-pane');
        if(target.nodeName == "A"){
            var t = $target.attr("data-target");
            var action = $target.attr("data-action");
            tabs.removeClass("active");
            $target.parent().addClass("active");
            tabContent.removeClass("active");
            $("#" + t).addClass("active");
        }
        if($("#" + t).hasClass("active")){
            $scope[action].searchInfo()
        }
    }
    /**
     * 基本信息
     * **/
    $scope.basic = {
        searchInfo:function () {
            var reqData = $.param({financialId: params.financialId})
            $http({
                method: "POST",
                url: siteVar.serverUrl + "fiancial/selectFinancialDetail.json",
                data:reqData,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
                    // 'X-Requested-With' :'XMLHttpRequest'
                }
            }).success(function(data) {
                if(data.success){
                    var temp = data.data;
                    temp.birthday = temp.birthday ? tools.toJSYMD(temp.birthday) : "";
                    temp.starttime = temp.starttime ? tools.toJSDate(temp.starttime) : "";
                    temp.lastLoginTime = temp.lastLoginTime ? tools.toJSDate(temp.lastLoginTime) : "";
                    temp.allotTime = temp.allotTime ? tools.toJSDate(temp.allotTime) : "";
                    temp.leaveTime = temp.leaveTime ? tools.toJSDate(temp.leaveTime) : "";
                    temp.redpacketSendUpdatetime = temp.redpacketSendUpdatetime ? tools.toJSDate(temp.redpacketSendUpdatetime) : "";
                    $scope.basicInfo = temp;
                }else{
                    alert(data.msg)
                }
            }).error(function(data, status) {
                alert("获取信息失败，请与管理员联系。");
                return;
            });
        }
    };
    /**
     * 初始化信息
     * **/
    $scope.basic.searchInfo();

    var ModalCtrl = function($scope, $modalInstance, select, info, tools) {
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
                        window.location.reload()
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
    $scope.action.edit = function () {
        var editInfo=$.extend({},$scope.basicInfo);
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
                    return editInfo;
                }
            }
        });
    };
    var cardCtrl = function($scope, $modalInstance, cardUrl) {
        $scope.cardUrl = cardUrl;
        $scope.close = function() {
            $modalInstance.close();
        };
    };
    $scope.action.card = function (e) {
        var target = e.target, url = $(target).attr("data-url");
        if(url){
            $modal.open({
                backdrop: true,
                backdropClick: true,
                dialogFade: false,
                keyboard: true,
                templateUrl : 'cardModal.html',
                controller : cardCtrl,
                windowClass:'modal-640',
                resolve:{
                    "cardUrl": function(){
                        return url;
                    }
                }
            });
        }
    };
    var managerCtrl = function($scope, $modalInstance, levelList) {
        $scope.levelList = levelList;
        $scope.levelList = $scope.levelList.map(function (item) {
            item.updateTime = tools.toJSYMD(item.updateTime);
            return item
        });
        $scope.close = function() {
            $modalInstance.close();
        };
    };
    $scope.action.manageerLevel = function () {
        $modal.open({
            backdrop: true,
            backdropClick: true,
            dialogFade: false,
            keyboard: true,
            templateUrl : 'managerModal.html',
            controller : managerCtrl,
            windowClass:'modal-640',
            resolve:{
                "levelList": function(){
                    return $scope.basicInfo.manageerLevel;
                }
            }
        });
    };



    /**
     * 销售数据
     * **/

    $scope.sale = {
        searchInfo:function(){
            var temp = {financialId: params.financialId}, self = this;
            if(this.startTime){
                temp.startTime = this.startTime;
            }
            if(this.endTime){
                temp.endTime = this.endTime;
            }
            return $http({
                method: "POST",
                url: siteVar.serverUrl + "fiancial/selectSaleData.json",
                data:$.param(temp),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
                    // 'X-Requested-With' :'XMLHttpRequest'
                }
            }).success(function(data, status) {
                if(data.success){
                    self["info"] = data.data;
                }else{
                    alert(data.msg)
                }
            }).error(function(data, status) {
                alert("获取信息失败，请与管理员联系。");
                return;
            });
        }
    };
    // $scope.sale.searchInfo();

    /**
     * 客户数据
     * **/
    $scope.customer = {
        searchInfo:function () {
            var temp = {financialId: params.financialId}, self = this;
            if(this.startTime){
                temp.startTime = this.startTime;
            }
            if(this.endTime){
                temp.endTime = this.endTime;
            }
            $http({
                method: "POST",
                url: siteVar.serverUrl + "fiancial/selectCustomerData.json",
                data:$.param(temp),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
                    // 'X-Requested-With' :'XMLHttpRequest'
                }
            }).success(function(data, status) {
                if(data.success){
                    self["info"] = data.data;
                }else{
                    alert(data.msg)
                }
            }).error(function(data, status) {
                alert("获取信息失败，请与管理员联系。");
                return;
            });
        }
    };
    // $scope.customer.searchInfo();
    /**
     * 团队数据
     * **/
    $scope.team = {
        searchInfo:function () {
            var temp = {financialId: params.financialId}, self = this;
            if(this.startTime){
                temp.starttimeFirst = this.starttimeFirst;
            }
            if(this.starttimeEnd){
                temp.starttimeEnd = this.starttimeEnd;
            }
            if(this.sumamountStart){
                temp.sumamountStart = this.sumamountStart;
            }
            if(this.sumamountEnd){
                temp.sumamountEnd = this.sumamountEnd;
            }
            $http({
                method: "POST",
                url: siteVar.serverUrl + "fiancial/selecTeamDetail.json",
                data:$.param(temp),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
                    // 'X-Requested-With' :'XMLHttpRequest'
                }
            }).success(function(res, status) {
                if(res.success){
                    self["info"] = res.data;
                    if(res.data.list && res.data.list.length > 0){
                        var temp = res.data.list;
                        temp.map(function (item) {
                            item.startTime = tools.toJSDate(item.startTime);
                        })
                    }

                }else{
                    alert(res.msg)
                }
            }).error(function(data, status) {
                alert("获取信息失败，请与管理员联系。");
                return;
            });
        },
        showCaptain:function (e) {
            var target = e.target, financialId = $(target).attr('data-captain'), temp = {financialId: financialId};
            if(financialId){
                $http({
                    method: "POST",
                    url: siteVar.serverUrl + "fiancial/isOpenFinancialDetail.json",
                    data:$.param(temp),
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
                    }
                }).success(function(res, status) {
                    if(res.success){
                        window.open(window.location.protocol + "//" + window.location.host + window.location.pathname + "#/managerDetail.html?financialId=" + financialId, "_blank");
                    }else{
                        alert(res.msg)
                    }
                }).error(function(data, status) {
                    alert("获取信息失败，请与管理员联系。");
                    return;
                });
            }
            // http://10.10.56.101:8080/api/fiancial/isOpenFinancialDetail.json?financialId=100167503009
        }
    };
    // $scope.team.searchInfo();
    /**
     * 红包数据
     * **/
    $scope.red = {
        searchInfo:function () {
            var temp = {financialId: params.financialId}, self = this;
            if(this.startTime){
                temp.startTime = this.startTime;
            }
            if(this.endTime){
                temp.endTime = this.endTime;
            }
            $http({
                method: "POST",
                url: siteVar.serverUrl + "fiancial/queryRedPaper.json",
                data:$.param(temp),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
                }
            }).success(function(res, status) {
                if(res.success){
                    self["info"] = res.data;
                    if(res.data.list && res.data.list.length > 0){
                        var temp = res.data.list;
                        temp.map(function (item) {
                            item.startTime = tools.toJSDate(item.startTime);
                        })
                    }

                }else{
                    alert(data.msg)
                }
            }).error(function(data, status) {
                alert("获取信息失败，请与管理员联系。");
                return;
            });
        }
    };
    // $scope.red.searchInfo();
    /**
     * 日志记录
     * **/
    $scope.record = {
        //页码数 从 1 开始
        getData:function (pageNum) {
            var defer = $q.defer();
            var temp = {financialId: params.financialId}, self = this;
            temp.start = (pageNum? pageNum - 1 : 0)*10;
            temp.length = 10;
            $http({
                method: "POST",
                url: siteVar.serverUrl + "log/queryLogList.json",
                data:$.param(temp),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
                }
            }).success(function(res, status) {
                if(res.success){
                    self["info"] = res.data;
                    if(self["info"].length && self["info"].length > 0){
                        self["info"].map(function (item) {
                            item.connectTime = tools.toJSDate(item.connectTime);
                        })
                    }
                }else{
                    alert(data.msg)
                }
                defer.resolve(res);

            }).error(function(data, status) {
                alert("获取信息失败，请与管理员联系。");
                defer.reject(data);
            });
            return defer.promise;
        },
        searchInfo: function () {
            this.getData().then(function (data) {
                $scope.record.currentPage = 1;
                $scope.record.sumpage = Math.ceil(data.recordsTotal / 10);
                $scope.record.total = data.recordsTotal;
                if(data.recordsTotal > 0){
                    var pagination = $("#pagination");
                    pagination.jqPaginator({
                        totalPages: $scope.record.sumpage,
                        visiblePages: 6,
                        currentPage: 1,
                        first: '<li class="first"><a href="javascript:void(0);">首页<\/a><\/li>',
                        prev: '<li class="prev"><a href="javascript:void(0);">前一页<\/a><\/li>',
                        next: '<li class="next"><a href="javascript:void(0);">下一页<\/a><\/li>',
                        last: '<li class="last"><a href="javascript:void(0);">末页<\/a><\/li>',
                        page: '<li class="page"><a href="javascript:void(0);">{{page}}<\/a><\/li>',
                        onPageChange: function (n,type) {
                            if(type == 'init'){

                            }
                            if(type == "change"){
                                $scope.$apply(function () {
                                    $scope.record.currentPage = n;
                                });
                                $scope.record.searchInfo(n)
                            }
                        }
                    })
                }
            })
        }
    };

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
        }
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
                        console.log(msg);
                        tools.ajaxOpened(self);
                        tools.ajaxError(err);
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
                        console.log(msg);
                        tools.ajaxOpened(self);
                        tools.ajaxError(err);
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
