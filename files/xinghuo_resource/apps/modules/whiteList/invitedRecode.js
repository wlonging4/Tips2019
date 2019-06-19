'use strict';
function invitedRecode($scope, getSelectListFactory, tools,$modal, DTOptionsBuilder, DTColumnBuilder) {
    var form = $("#js_form"), conditionItem = form.find(".form-group");

    $scope.form = {
        isShow: (conditionItem.length > 6) ? true : false
    };
    $scope.select = {};
    $scope.action = {};

    getSelectListFactory.getSelectList(['managermemberstatus']).then(function(data){
        $scope.select.memberstatus = data.appResData.retList[0].managermemberstatus;
    });
    $scope.select.buyType={
        "10":"独立个人",
        "20":"推荐人团队",
        "30":"推荐人个人",
        "40":"合伙人团队"
    };


    /*
     创建表格选项
     */
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax',{
            url:  siteVar.serverUrl + '/mt/queryManageMembers.shtml',
            type: 'POST',
            data: function(d){
                jQuery.extend(d, tools.getFormele({}, form));
            }

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
        DTColumnBuilder.newColumn('userId').withTitle('团队员ID').withOption('sWidth','100px').renderWith(function(data, type, full) {
            if(!data) return "";
            return '<a href="javascript:void(0);" class="infoDetail" data-href="/xinghuouser/userinfo.shtml?userType=director&id=' + data + '">' + data + '</a>';
        }),
        DTColumnBuilder.newColumn('realname').withTitle('团队员姓名').withOption('sWidth','70px'),
        DTColumnBuilder.newColumn('mobile').withTitle('团队员手机号').withOption('sWidth','100px'),
        DTColumnBuilder.newColumn('businessType').withTitle('业务类型').withOption('sWidth','70px').renderWith(function(data,type,full){
            var str='';
            switch (data){
                case 10:
                    str="独立个人";
                    break;
                case 20:
                    str="推荐人团队";
                    break;
                case 30:
                    str="推荐人个人";
                    break;
                case 40:
                    str="合伙人团队";
                    break;
                default :
                    str="——";
            }
            return str;
        }),
        DTColumnBuilder.newColumn('memberstatusStr').withTitle('团队员邀请状态').withOption('sWidth', '100px'),
        DTColumnBuilder.newColumn('cardNoStr').withTitle('银行卡状态').withOption('sWidth', '100px'),
        DTColumnBuilder.newColumn('createTimeStr').withTitle('注册时间').withOption('sWidth','130px'),
        DTColumnBuilder.newColumn('lenderNum').withTitle('交易客户数').withOption('sWidth','80px'),
        DTColumnBuilder.newColumn('yixinstatusStr').withTitle('是否为宜信员工').withOption('sWidth','100px'),
        DTColumnBuilder.newColumn('leaderUserId').withTitle('团队长ID').withOption('sWidth','110px').renderWith(function(data, type, full) {
            if(!data) return "";
            return '<a href="javascript:void(0);" class="infoDetail" data-href="/xinghuouser/userinfo.shtml?userType=director&id=' + data + '">' + data + '</a>';
        }),
        DTColumnBuilder.newColumn('leaderRealName').withTitle('团队长姓名').withOption('sWidth','80px'),
        DTColumnBuilder.newColumn('leaderMobile').withTitle('团队长手机号').withOption('sWidth','100px'),
        //DTColumnBuilder.newColumn('inviteway').withTitle('来源').withOption('sWidth','90px')
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
    var typeInit = {
        "10":"独立个人",
        "20":"推荐人团队",
        "30":"推荐人个人",
        "40":"合伙人团队"
    };
    /*变更业务类型*/
    var invitedTypeCtrl = function($scope,$modalInstance,tools){
        $scope.userData={};
        //$scope.fmError=false;
        //$scope.fmList = false;
        //$scope.teamError = false;
        //$scope.teamList = false;
        $scope.buyType={
            "10":"独立个人",
            "20":"推荐人团队",
            "30":"推荐人个人",
            "40":"合伙人团队"
        };
        //验证理财经理Id
        $scope.fmVerityId = function(e){
            var self = e.currentTarget,data= self.value;
            $scope.fmError=false;
            $scope.fmList = false;
            if(!data) return;
            if(!tools.ajaxLocked(self)) return;
            setTimeout(function(){
                $.ajax({
                    type: "post",
                    url:siteVar.serverUrl + "/mt/queryManageMember.shtml",
                    data:"userId="+data,
                    success: function(data){
                        tools.ajaxOpened(self);
                        if(!tools.interceptor(data)) return;
                        if(data.success){
                            $scope.info=data.data;
                            switch (parseInt($scope.info.businessType)){
                                case 10:
                                    $scope.info.businessType="独立个人";
                                    break;
                                case 20:
                                    $scope.info.businessType="推荐人团队";
                                    break;
                                case 30:
                                    $scope.info.businessType="推荐人个人";
                                    break;
                                case 40:
                                    $scope.info.businessType="合伙人团队";
                                    break;
                                default :
                                    $scope.info.businessType="——";
                            }
                            $scope.$apply(function(){
                                $scope.fmList = true;
                            })
                        }else{
                            $scope.fmError=true;
                        }
                    },
                    error: function(err){
                        tools.ajaxOpened(self);
                        tools.ajaxError(err);
                    }
                })
            },300)
        };
        //验证团队长id
        $scope.teamVerityId = function(e){
            var self = e.currentTarget,data= self.value;
            $scope.teamError = false;
            $scope.teamList = false;
            if(!data) return;
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url:siteVar.serverUrl + "/mt/queryManageMember.shtml",
                data: "userId="+data,
                success: function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    if(data.success){
                        $scope.teamSubmit=data.data.businessType;
                        $scope.team=data.data;

                        switch (parseInt($scope.team.businessType)){
                            case 10:
                                $scope.team.businessType="独立个人";
                                break;
                            case 20:
                                $scope.team.businessType="推荐人团队";
                                break;
                            case 30:
                                $scope.team.businessType="推荐人个人";
                                break;
                            case 40:
                                $scope.team.businessType="合伙人团队";
                                break;
                            default :
                                $scope.team.businessType="——";
                        }
                        if(!$scope.team.teamLeader) $scope.teamError=true;
                        $scope.teamList = true;
                    }else{
                        $scope.teamError=true;
                    }
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            })
        };
        //新业务类型(是否显示团队长id)
        $scope.typeChang = function(){
            $('#typeUndefine').hide();
            if($scope.userData.businessType=='' || $scope.userData.businessType == 10 || (!!$scope.info && $scope.info.teamLeader === '1')){
                $('#teamline').hide();
                $('#teamBox').hide();
                $scope.teamList=false;
                $scope.userData.leaderUserId='';
            }else{
                $('#teamline').show();
                $('#teamBox').show();

            }
        }
        //提交
        $scope.submitForm = function(){
            if($scope.userData.businessType !=10){
                if($scope.teamList && $scope.userData.businessType != $scope.teamSubmit){
                    $("#typeUndefine").text("新业务类型需与团队长的业务类型一致").show();
                    return;
                }
                if(!$scope.userData.userId){
                    $("#fmUndefine").removeClass('ng-hide');
                    $("#fmUndefine").parent('.form-group').addClass('has-error');
                    return;
                };
                if(!$scope.userData.businessType){
                    $("#typeUndefine").text("新业务类型不能为空！").show();
                    return;
                };
                if(!$scope.info.teamLeader && !$scope.userData.leaderUserId){
                    $("#teamUndefine").removeClass('ng-hide');
                    $("#teamUndefine").parent('.form-group').addClass('has-error');
                    return;
                };
            }
            if($scope.team && !$scope.team.teamLeader){
                $("#teamUndefine").text("该ID对应的理财师不是团队长，请重新输入！").show();
                return;
            }
            if($scope.info.teamLeader){
                var confirmStr=confirm("该理财经理团队的所有成员的业务类型都将变为"+typeInit[$scope.userData.businessType]+"，确定更改？");
                if(!confirmStr) return;
            }
            $.ajax({
                type: "post",
                url:siteVar.serverUrl + "/mt/updateBusinessType.shtml",
                data: $scope.userData,
                success: function(data){
                    if(!tools.interceptor(data)) return;
                    if(data.success){
                        $modalInstance.close();
                        window.location.reload();
                    }else{
                        alert(data.msg);
                    }
                },
                error: function(err){
                    tools.ajaxError(err);
                }
            });
            //$scope.close();
        }
        //关闭
        $scope.close = function(){
            $modalInstance.close();
        }

    };
    $scope.action.changeInvitedType = function(){
        $modal.open({
            backdrop: true,
            backdropClick:true,
            dialogFade:false,
            keyboard:true,
            templateUrl:'changeInvitedType.html',
            controller:invitedTypeCtrl,
            windowClass:'modal-640',
            //resolve:{
            //    "list": function(){
            //        return data.data;
            //    }
            //}
        });
    }


    function fnDrawCallback(data){
        tools.createModal();
        //tools.createModalProgress();
        var popUpLayer = $("#js_dialog"), popUpLayerContent = popUpLayer.find(".js_content");
        var table = $("#dataTables"), tbody = table.find("tbody");
        table.off("click").on("click", ".infoDetail", function(){
            var self = $(this), href = self.attr("data-href"), data, url;
            data = tools.queryUrl(href);
            url = href.split('?')[0];
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url:siteVar.serverUrl +  url,
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
        //导出
        $('#js-invited-export').off().on('click',function(){
            tools.export(this);
        })

    }
}
