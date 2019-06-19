'use strict';
function xinghuoOtherActivityController($scope,$http, $modal,getSelectListFactory,tools,DTOptionsBuilder, DTColumnBuilder,$timeout) {
    $scope.form = {};
    $scope.select = {};
    $scope.action = {};
    /*
     获取枚举类型
     */
    var selectList = getSelectListFactory.getSelectList(['other_activity_mode','new_activity_status']);
    selectList.then(function(data){
        $scope.select.activityMode = data.appResData.retList[0].other_activity_mode;
        $scope.select.status = data.appResData.retList[1].new_activity_status;
        //过滤业务活动方式
    });
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder
        .newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/xinghuoOtherActivityManage/list.json',
            type: 'POST',
            data: $scope.form,
            dataSrc: function (json) {
                // console.log(json);
                if (!json.success) tools.interalert("加载失败,请刷新页面");
                return json.data;
            }
        })
        .withDataProp('data')
        .withOption('searching',false)
        .withOption('ordering',false)
        .withOption('serverSide',true)
        .withOption('processing',false)
        .withOption('scrollX',true)
        .withLanguage(tools.dataTablesLanguage)
        .withOption('createdRow', function(row, data, dataIndex) {
            angular.element(row).addClass("test"+data.id)
        })
        .withOption('fnDrawCallback',fnDrawCallback)
        .withPaginationType('full_numbers');
    vm.dtColumns = [
        DTColumnBuilder.newColumn('activityModeStr').withTitle('活动方式').withOption('sWidth','60px').renderWith(function(data,type,full){
            if(data == "") return "其他";
            return data;
        }),
        DTColumnBuilder.newColumn('activityName').withTitle('活动名称').withOption('sWidth','140px').renderWith(function(data,type,full){
            if(!data) return "";
            full.remark = full.remark != null?full.remark:"无";
            return '<a href="javascript:void(0);" class="infoDetail ui_ellipsis" data-activityId="' + full.activityId + '">' + data + '</a>';
        }),
        DTColumnBuilder.newColumn('activityEffectiveStartTime').withTitle('活动有效期').withOption('sWidth','320px').renderWith(function(data,type,full){
            if(!data) return "";
            return data+"&nbsp;至&nbsp;"+full.activityEffectiveEndTime;
        }),
        DTColumnBuilder.newColumn('redCount').withTitle('关联红包').withOption('sWidth', '70px').renderWith(function(data, type, full) {
            return '<a href="javascript:void(0)" class="associated" data-activityId="' + full.activityId + '" data-activityMode="' + full.activityMode + '">' + data + '</a>';
        }),
        DTColumnBuilder.newColumn('startTime').withTitle('启用/禁用时间').withOption('sWidth','150px').renderWith(function(data,type,full){
            if(!data) return "";
            return '<span class="" style="width: 120px;" title="'+data+'">'+data+'</span>';
        }),
        DTColumnBuilder.newColumn('statusStr').withTitle('活动状态').withOption('sWidth','70px'),
        DTColumnBuilder.newColumn('status').withTitle('操作').withOption('sWidth','180px').renderWith(function(data,type,full){
            if(data === 1){ //新建状态
                var str = '<a href="javascript:;" class="btn btn-primary btn-xs js_huodong_open" key_id="'+full.activityId+'">启用</a>';
                str += '<a href="javascript:;" class="btn btn-primary btn-xs js_huodong_edit" key_id="'+full.activityId+'">编辑</a>';
                return str;

            }else if (data == 2){ //启用状态
                var str = '<a href="javascript:;" class="btn btn-warning btn-xs js_huodong_forbid" key_id="'+full.activityId+'">禁用</a>';
                str += '<a href="javascript:;" class="btn btn-primary btn-xs js_huodong_edit" key_id="'+full.activityId+'">编辑</a>';
                if (full.activityMode == 5){
                    str += '&nbsp;<a href='+siteVar.serverUrl+'/xinghuoOtherActivityManage/downloadRedPacketCode.json?activityId='+full.activityId+' class="btn btn-success btn-xs">下载激活码</a>';
                }
                return str;
            } else{ //禁用状态
                return '';
            }
        })
    ];

    /*获取可关联红包列表*/
    function getPacket(time){ 
        return $http({
            method: "POST",
            url: siteVar.serverUrl + "/xinghuoRedPacketTemplate/list.json",
            data: $.param({status:1,effectiveType:2,effectiveEndTime:time}),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                'X-Requested-With' :'XMLHttpRequest'
            }
        }).then(function (data) {
            // console.log(data);
            var info = data.data;
            if(!info.success) {
                return tools.interalert(info.msg);
            }
            return info.data;
        });
    }

    function setTime(selector, time, rule) {
        if (rule && rule === 'date_only') {
            if ( selector.indexOf('start') > -1) {
                $(selector).datepicker('setEndDate',time);
            } else if (selector.indexOf('end') > -1) {
                $(selector).datepicker('setStartDate',time);
            }
            
            if ($(selector).datepicker('getDate') === null) {
                $(selector).datepicker('setDate',time);
            }
        } else {
            $(selector).datetimepicker('setStartDate',time);
        }
    }

    /*创建\编辑自动触发活动1_第一页*/
    var addAutoActivity = function($scope,tools, $modalInstance, info) {
        $scope.autoForm = info;
        $scope.title1='新建';
        if(info.activityId){
            $scope.title1='编辑';
        }
        $scope.select = {};
        //设置触发条件回显
        $scope.roleChoice=1;
        //暂时取消发送到理财经理开店成功的选项;详情参考注释的代码
        if($scope.autoForm.scene){
            $scope.roleChoice=1;$('.roleChoiceRadio1').parent().addClass('checked');$('.roleChoiceRadio2').parent().removeClass('checked');
            /*if($scope.autoForm.scene<4){
                $scope.roleChoice=1;$('.roleChoiceRadio1').parent().addClass('checked');$('.roleChoiceRadio2').parent().removeClass('checked');
            }else{
                $scope.roleChoice=2;$('.roleChoiceRadio2').parent().addClass('checked');$('.roleChoiceRadio1').parent().removeClass('checked');
            }*/
        }
        //$scope.autoForm.tmpId = $scope.autoForm.redPacketTemplateId;
        if (!!$scope.autoForm.activityEffectiveEndTime) {
            getPacket($scope.autoForm.activityEffectiveEndTime).then(function (data) {
                $scope.select.redPacket = data;
            })
        }
        var selectList = getSelectListFactory.getSelectList(['other_activity_automatic_scene','other_activity_automatic_scene_manager']);
        selectList.then(function(data){
            //判断发送类型
            if($scope.roleChoice==1){$scope.select.activityScene = data.appResData.retList[0].other_activity_automatic_scene;}
            if($scope.roleChoice==2){$scope.select.activityScene = data.appResData.retList[1].other_activity_automatic_scene_manager;}
            $('.roleChoiceRadio').on('click',function () {
                if($scope.roleChoice==1){$scope.select.activityScene = data.appResData.retList[0].other_activity_automatic_scene;}
                if($scope.roleChoice==2){$scope.select.activityScene = data.appResData.retList[1].other_activity_automatic_scene_manager;}
                delete $scope.autoForm.scene;
            })
        });

        $scope.getRedPacket = function(time){
            getPacket(time).then(function (data) {
                $scope.select.redPacket = data;
            })
        }

        $scope.setEndDate = function (selector, time) {
            setTime('.'+selector,time);
        }

        $scope.load = function() {
            var current = new Date();
            ComponentsPickers.init();
            $(".form_datetimepicker").datetimepicker({
                isRTL: Metronic.isRTL(),
                format: "yyyy-mm-dd hh:ii:ss",
                autoclose: true,
                todayBtn: true,
                pickerPosition: (Metronic.isRTL() ? "bottom-right" : "bottom-left"),
                minuteStep: 1,
                language:"zh-CN",
                startDate: current
            })
        };

        $scope.submit = function() {
            var reqUrl;

            /*输入校验*/
            if(!$scope.autoForm.scene){
                return tools.interalert("触发条件不能为空！");
            }
            if(!$scope.autoForm.activityName){
                return tools.interalert("活动名称不能为空！");
            }
            if(!$scope.autoForm.activityEffectiveStartTime || !$scope.autoForm.activityEffectiveEndTime){
                return tools.interalert("活动有效期不能为空！");
            }
            //自动触发新建和编辑
            if (!$scope.autoForm.activityId) {
                $scope.autoForm.activityMode = 4;
                reqUrl = siteVar.serverUrl + "/xinghuoOtherActivityManage/automic/create.json";
            } else {
                reqUrl = siteVar.serverUrl + "/xinghuoOtherActivityManage/automic/edit.json";
            }

            $http({
                method: "POST",
                url: reqUrl,
                data:$.param($scope.autoForm),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                    'X-Requested-With' :'XMLHttpRequest'
                }
            }).then(function (data) {
                var info = data.data;
                if(!info.success) {
                    return tools.interalert(info.msg);
                };
                //新建活动返回活动id
                if(!$scope.autoForm.activityId){
                    $scope.autoForm.activityId=data.data.data.activityId;
                }
                vm.dtInstance.rerender();
                $scope.close();
                //成功后调用下一步新红包弹窗
                $scope.close();
                $modal.open({
                    backdrop: false,
                    backdropClick: true,
                    dialogFade: false,
                    keyboard: true,
                    templateUrl : 'stepAddRed.html',
                    controller : stepAddRed,
                    //windowClass:'modal-640',
                    resolve: {
                        info: function () {
                            return $scope.autoForm
                        }
                    }
                });
            });
        };

        $scope.close = function() {
            $modalInstance.close();
        };
    };

    /*创建\编辑自动触发活动2_选择红包*/
    function stepAddRed($scope,info,tools,$modalInstance) {
        $scope.autoForm = info;
        $scope.search={};
        $scope.close = function() {
            $modalInstance.close();
        };
        $scope.search.activityId=$scope.autoForm.activityId;
        if(!$scope.search.activityId){
            return tools.interalert("缺少活动ID");
        }
        $scope.$on("getBasicInfo", function () {
            $http({
                method: "GET",
                url: siteVar.serverUrl + "/xinghuoActivityManage/getActivity.json?activityId=" + $scope.search.activityId,
                // data:$.param({activityId:search.activityId}),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                    'X-Requested-With' :'XMLHttpRequest'
                }
            }).then(function (data) {
                var info = data.data;
                if(!info.success) {
                    return alert(info.msg);
                };
                $scope.form = info.data;
            });
        });
        $scope.$on( "getList", function () {
            $http({
                method: "GET",
                url: siteVar.serverUrl + "/xinghuoActivityRedPacket/get.json?activityId=" + $scope.search.activityId,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                    'X-Requested-With' :'XMLHttpRequest'
                }
            }).success(function(data, status) {
                if(!data.success) {
                    alert(data.msg);
                    return;
                };
                $scope.list = data.data;
            }).error(function(data, status) {
                alert("获取红包信息失败！");
                return;
            });
        });
        //初始化获取信息
        $scope.$emit("getBasicInfo");
        $scope.$emit("getList");
        $scope.submitFinal=function(){
            /*
            a. 判断关联红包是否已填写，若未填写，提示“请关联红包”；
            b. 保存当前活动关联红包数据至数据库；
            c. 弹层提示层“创建活动成功！”，页面跳转至其他活动列表页；
            d. 活动状态默认为“新增”；
            e. 同时设置当前活动绑定红包“是否已关联活动”属性为“是”。
            * */
            //新建的红包没红包提交
            if($scope.list.length == 0){
                tools.interalert('请关联红包');
                return;
            }else{
                tools.interalert('创建活动成功');
                $modalInstance.close();
                vm.dtInstance.rerender();
            }
        };
        $scope.stepBefore=function(){
            $modalInstance.close();
            //$scope.autoForm = {};
            $modal.open({
                backdrop: false,
                backdropClick: true,
                dialogFade: false,
                keyboard: true,
                templateUrl : 'addAutoActivity.html',
                controller : addAutoActivity,
                //windowClass:'modal-640',
                resolve: {
                    info: function () {
                        return $scope.autoForm
                    }
                }
            });
        };

        $scope.delete = function (activityId, redTemplateId) {
            if(!window.confirm("确认删除当前红包？")){
                return;
            }
            $http({
                method: "POST",
                url: siteVar.serverUrl + "/xinghuoActivityRedPacket/delete.json",
                data:$.param({
                    activityId:activityId,
                    redTemplateId:redTemplateId
                }),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                    'X-Requested-With' :'XMLHttpRequest'
                }
            }).then(function (data) {
                var info = data.data;
                if(!info.success) {
                    return alert(info.msg);
                };
                $scope.$emit("getList");
            })
        };
        $scope.redListChoice = function () {
            $http({
                method: "POST",
                url: siteVar.serverUrl + "/xinghuoRedPacketTemplate/list.json",
                data:$.param({
                    status:1,
                    effectiveType:2,
                    effectiveEndTime: $scope.form.activityEffectiveEndTime
                }),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                    'X-Requested-With' :'XMLHttpRequest'
                }
            }).then(function (data) {
                var info = data.data;
                if(!info.success) {
                    return tools.interalert(info.msg);
                };
                $modal.open({
                    backdrop: true,
                    backdropClick: true,
                    dialogFade: false,
                    keyboard: true,
                    templateUrl: 'redListChoice.html',
                    controller: redListChoiceCtrl,
                    // windowClass:'modal-640',
                    resolve: {
                        "list":function () {
                            return info.data
                        },
                        "vm":function () {
                            return $scope
                        }
                    }
                });
            });
        };
    }

    /*创建\编辑自动触发活动3_红包列表选取*/
    var redListChoiceCtrl = function ($scope,tools, $modalInstance, list, vm) {
        var temp = [];
        $scope.info = vm.form;
        $scope.list = list;
        $scope.form = {
            activityId : vm.form.activityId
        };
        $scope.isAdd = true;
        $scope.form.activityRepeatTimeRequstList = JSON.parse(JSON.stringify(temp));
        $scope.planItem = {
            effectiveStartTime:vm.form.activityEffectiveStartTime,
            effectiveEndTime:vm.form.activityEffectiveEndTime
        };
        $scope.add = function () {
            if(!$scope.isAdd){
                $scope.isAdd = true;
                $scope.planItem = {};
            }
        };
        $scope.delete = function (index) {
            $scope.form.activityRepeatTimeRequstList.splice(index, 1);
        };
        $scope.close = function() {
            $modalInstance.close();
        };
        $scope.save = function () {
            if(!$scope.form.redTemplateId){
                return alert("请选择需要关联的红包！");
            }
            if(!$scope.form.lenderCanGetCount){
                return alert("请输入每人可得数！");
            }
            $http({
                method: "POST",
                url: siteVar.serverUrl + "/xinghuoActivityRedPacket/create.json",
                data:$scope.form,
                headers: {
                    'Content-Type': 'application/json;charset=utf-8',
                    'X-Requested-With' :'XMLHttpRequest'
                }
            }).then(function (data) {
                var info = data.data;
                if(!info.success) {
                    return alert(info.msg);
                };
                tools.interalert("关联红包成功！");
                $scope.close();
                vm.$emit("getList");
            });
        };
        var timer = $timeout(function () {
            $(".form_exact_datetime").datetimepicker({
                isRTL: Metronic.isRTL(),
                format: "yyyy-mm-dd hh:ii:ss",
                autoclose: true,
                todayBtn: true,
                pickerPosition: (Metronic.isRTL() ? "bottom-right" : "bottom-left"),
                minuteStep: 1,
                language:"zh-CN"
            });
            $timeout.cancel(timer);
        }, 0)
    };

    /*创建\编辑激活码活动*/
    var addActiveCode = function($scope,tools, $modalInstance, info) {
        $scope.activeForm = info;
        $scope.select = {};
        $scope.title1='新建';
        if(info.activityId){
            $scope.title1='编辑';
        }
        $scope.activeForm.tmpId = info.redPacketTemplateId;
        // console.log('form:',$scope.form,'select:',$scope.select);
        if (!!$scope.activeForm.activityEffectiveEndTime) {
            getPacket($scope.activeForm.activityEffectiveEndTime).then(function (data) {
                $scope.select.redPacket = data;
            })
        }
        //修改title
        $('#pageTitle2').html('编辑激活码活动');
        $scope.load = function() {
            ComponentsPickers.init();
                $(".form_datetimepicker").datetimepicker({
                isRTL: Metronic.isRTL(),
                format: "yyyy-mm-dd hh:ii:ss",
                autoclose: true,
                todayBtn: true,
                pickerPosition: (Metronic.isRTL() ? "bottom-right" : "bottom-left"),
                minuteStep: 1,
                language:"zh-CN"
            })
        };

        $scope.getRedPacket = function(time){
            getPacket(time).then(function(data){
                console.log('data',data);
                $scope.select.redPacket = data;
            })
        }

        $scope.setEndDate = function (selector, time) {
            setTime('.'+selector,time);
        }

        $scope.submit = function() {
            var reqUrl;
            var res;
            console.log($scope.activeForm);
            
            if(!$scope.activeForm.activityName){
                return alert("活动名称不能为空！");
            }
            if(!$scope.activeForm.activityEffectiveStartTime || !$scope.activeForm.activityEffectiveEndTime){
                return alert("活动有效期不能为空！");
            }
            if(!$scope.activeForm.redPacketTemplateId){
                return alert("关联红包名称不能为空！");
            }
            if(!$scope.activeForm.redPacketCodeCount){
                return alert("激活码总数不能为空！");
            }
            if($scope.activeForm.redPacketCodeCount && parseInt($scope.activeForm.redPacketCodeCount) > 2000){
                return alert("激活码总数不能超过2000个！");
            }

            if (!$scope.activeForm.activityId) {
                $scope.activeForm.activityMode = 5;
                reqUrl = siteVar.serverUrl + "/xinghuoOtherActivityManage/code/create.json";
                res = "激活码活动创建成功！";
            } else {
                reqUrl = siteVar.serverUrl + "/xinghuoOtherActivityManage/code/edit.json";
                res = "激活码活动编辑成功！";
            }
            
            $http({
                method: "POST",
                url: reqUrl,
                data: $.param($scope.activeForm),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                    'X-Requested-With' :'XMLHttpRequest'
                }
            }).then(function (data) {
                console.log(data);
                var info = data.data;
                if(!info.success) {
                    return tools.interalert(info.msg);
                };
                tools.interalert(res);
                $scope.close();
                vm.dtInstance.rerender();
            });
        };
        $scope.close = function() {
            $modalInstance.close();
        };

        $scope.cancel = function() {
            $modalInstance.close();
        };
    };

    $scope.action = {
        search: function(){
            console.log($scope.activeForm);
            vm.dtInstance.rerender();
        },
        //打开自动触发添加
        addAutoActivity: function(){
            $scope.autoForm = {};
            $modal.open({
                backdrop: false,
                backdropClick: true,
                dialogFade: false,
                keyboard: true,
                templateUrl : 'addAutoActivity.html',
                controller : addAutoActivity,
                //windowClass:'modal-640',
                resolve: {
                    info: function () {
                        return $scope.autoForm
                    }
                }
            });
        },
        //打开激活码添加
        addActiveCode: function(){
            $scope.activeForm = {};
            $modal.open({
                backdrop: false,
                backdropClick: true,
                dialogFade: false,
                keyboard: true,
                templateUrl : 'addActiveCode.html',
                controller : addActiveCode,
                windowClass:'modal-640',
                resolve: {
                    info: function () {
                        return $scope.activeForm
                    }
                }
            });
        },

        setEndDate: function (selector, time, rule) {
            setTime('.'+selector,time,rule);
        }
    }

    //点击活动名称弹窗
    var infoCtrl = function ($scope, $modalInstance, info) {
        $scope.info = info;
        //$scope.scene = ['注册成功','生日前','交易到期前'];
        $scope.close = function() {
            $modalInstance.close();
        };
    }

    function fnDrawCallback(data){
        if (!tools.interceptor(window.ajaxDataInfo)) return;
        tools.resetWidth();
        tools.createModal();
        tools.createModalProgress();
        var popUpLayer = $("#js_dialog"), popUpLayerContent = popUpLayer.find(".js_content");
        /**
         * [查看关联红包详情]
         * @param  {[type]}     [description]
         * @return {[type]}     [description]
         */
        
        //点击活动名称
        $("#dataTables").off("click").on("click", ".infoDetail", function(){
            var self = $(this);
            if(!tools.ajaxLocked(self)) return;
            var data ={
                "activityId": $(this).attr("data-activityId")
            };
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + '/xinghuoOtherActivityManage/getOtherActivity.json',
                data: data,
                success: function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    if (!!data.success) {
                        $scope.info = data.data;
                        $.ajax({
                            type:'get',
                            url:siteVar.serverUrl+'/xinghuoActivityRedPacket/get.json?activityId='+ $scope.info.activityId,
                            success:function (data) {
                                if(!data.success) {
                                    tools.interalert(data.msg);
                                    return;
                                };
                                $scope.info.listObj=data.data;
                                $modal.open({
                                    backdrop: true,
                                    backdropClick: true,
                                    dialogFade: false,
                                    keyboard: true,
                                    templateUrl: 'infoModal.html',
                                    controller: infoCtrl,
                                    windowClass:'modal-640',
                                    resolve: {
                                        "info": function () {
                                            return $scope.info;
                                        }
                                    }
                                });
                            }
                        });
                    }else{
                        alert(data.msg);
                    }
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });
        });

        //点击关联数量
        $("#dataTables tbody").on("click", ".associated", function(){
            var self = $(this), activityId = self.attr("data-activityId"), activityMode = self.attr("data-activityMode");
            $http({
                method: "GET",
                url: siteVar.serverUrl + "/xinghuoActivityRedPacket/getList.json?activityId=" + activityId,
                data:$.param({activityId: activityId}),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                    'X-Requested-With' :'XMLHttpRequest'
                }
            }).then(function (data) {
                var info = data.data;
                if(!info.success) {
                    return alert(info.msg);
                };
                info.data.forEach(function (item, index) {
                    item.createTime = tools.toJSDate(item.createTime);
                    item.effectiveEndTime = tools.toJSDate(item.effectiveEndTime);
                    item.effectiveStartTime = tools.toJSDate(item.effectiveStartTime);

                    item.redAmount = (item.redAmount === null) ? null : tools.formatNumber(item.redAmount || 0);
                    item.redCount = (item.redCount === null) ? null : tools.formatNumber(item.redCount || 0);
                    item.fullCutAmount = (item.fullCutAmount === null) ? null : tools.formatNumber(item.fullCutAmount || 0);
                    item.redUseCount = (item.redUseCount === null) ? null : tools.formatNumber(item.redUseCount || 0);
                    item.redRemainCount = (item.redRemainCount === null) ? null : tools.formatNumber(item.redRemainCount || 0);
                });

                $modal.open({
                    backdrop: true,
                    backdropClick: true,
                    dialogFade: false,
                    keyboard: true,
                    templateUrl: 'associatedModal.html',
                    controller: associatedCtrl,
                    // windowClass:'modal-640',
                    resolve: {
                        "data": function () {
                            return info.data;
                        },
                        "activityMode": function () {
                            return activityMode;
                        }
                    }
                });
            })
        });
        function associatedCtrl($scope, $modalInstance, data, activityMode) {
            $scope.data = data;
            $scope.activityMode = activityMode;
            $scope.showFlag = true;
            $scope.close = function() {
                $modalInstance.close();
            };
            $scope.showDetails = function (e, item, data) {
                data.forEach(function (i) {
                    i.showList = false;
                });
                item.showList = true;
                e.stopPropagation();
            }
            $scope.closeList = function (data) {
                if(data && data.length > 0){
                    data.forEach(function (i) {
                        i.showList = false;
                    });
                }
            }
        }


        /*编辑活动*/
        $("#dataTables tbody").on("click", ".js_huodong_edit", function(){
            var id = $(this).attr("key_id");
            var self = this;
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + "/xinghuoOtherActivityManage/getOtherActivity.json",
                data: {activityId: id},
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                    'X-Requested-With' :'XMLHttpRequest'
                },
                success: function(data){
                    tools.ajaxOpened(self);
                    if (data.success) {
                        if (data.data.activityMode === 4) {
                            $scope.autoForm = data.data;
                            $modal.open({
                                backdrop: false,
                                backdropClick: true,
                                dialogFade: false,
                                keyboard: true,
                                templateUrl : 'addAutoActivity.html',
                                controller : addAutoActivity,
                                //windowClass:'modal-640',
                                resolve:{
                                    info : function(){
                                        return $scope.autoForm;
                                    }
                                }
                            });
                        } else if(data.data.activityMode === 5){
                            $scope.activeForm = data.data;
                            $modal.open({
                                backdrop: false,
                                backdropClick: true,
                                dialogFade: false,
                                keyboard: true,
                                templateUrl : 'addActiveCode.html',
                                controller : addActiveCode,
                                windowClass:'modal-640',
                                resolve:{
                                    info : function(){
                                        return $scope.activeForm;
                                    }
                                }
                            });
                        }
                    }
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });
        });

        /**
         * [启用活动]
         * [禁用活动]
         * [下载激活码]
         * @param  {[type]}     [description]
         * @return {[type]}     [description]
         */
        $("#dataTables tbody").on("click", ".js_huodong_open", function(){
            var data ={
                "activityId": $(this).attr("key_id")
            }
            var self = this;
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + "/xinghuoOtherActivityManage/enable.json",
                data: data,
                success: function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    alert("活动启用成功！");
                    vm.dtInstance.rerender();
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });
        });

        $("#dataTables tbody").on("click", ".js_huodong_forbid", function(){
            var data ={
                "activityId": $(this).attr("key_id")
            }
            var self = this;
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + "/xinghuoOtherActivityManage/disable.json",
                data: data,
                success: function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    alert("活动禁用成功！");
                    vm.dtInstance.rerender();
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });
        });
    }
}