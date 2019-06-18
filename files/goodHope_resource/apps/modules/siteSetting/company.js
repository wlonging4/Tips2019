'use strict';
function companyController($scope,$timeout, $rootScope, $stateParams, $modal, tools, DTOptionsBuilder, DTColumnBuilder) {
    $scope.form = {};
    $scope.select = {};
    $scope.action = {};
    tools.createModal();
    tools.createModalProgress();
    $scope.action.search = function(){
        vm.dtInstance.rerender();
    };
    $scope.action.reset = function(){
        for(var prop in $scope.form){
            delete $scope.form[prop];
        }
        vm.dtInstance.rerender();
    };


    /*
     创建表格选项
     */
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax',{
            url: G.server+ 'company',
            type: 'GET',
            data: $scope.form
        })
        .withDataProp('data')
        .withOption('createdRow', function(row, data, dataIndex) {
            angular.element(row).addClass("rows" + data.ID)
        })
        .withOption('searching',false)
        .withOption('ordering',false)
        .withOption('serverSide',true)
        .withOption('processing',true)
        .withOption('scrollX',true)
        .withLanguage(tools.dataTablesLanguage)
        .withOption('fnDrawCallback', fnDrawCallback)
        .withPaginationType('simple_numbers');
    vm.dtColumns = [
        DTColumnBuilder.newColumn('id').withTitle('理财经理ID').withOption('sWidth','100px').renderWith(function(data,type,full){
            return '<a href="javascript:;" class="js_see_info" key="'+data+'">'+data+'</a>';
        }).notSortable(),
        DTColumnBuilder.newColumn('realname').withTitle('理财经理姓名').withOption('sWidth','90px').notSortable(),
        DTColumnBuilder.newColumn('mobile').withTitle('手机号').withOption('sWidth','90px').notSortable(),
        DTColumnBuilder.newColumn('audittime').withTitle('审核时间').withOption('sWidth','140px').renderWith(function(data,type,full){
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('storecode').withTitle('店铺ID').withOption('sWidth','100px').renderWith(function(data,type,full){
            if(!data) return "";
            if(!full.storeUrl) return '<span>'+data+'</span>';
            return '<a href="'+full.storeUrl+'" target="_blank">'+data+'</a>';
        }).notSortable(),
        DTColumnBuilder.newColumn('storename').withTitle('店铺名称').withOption('sWidth','120px').renderWith(function(data,type,full){
            if(!data) return "";
            return '<span class="ui_ellipsis" style="width: 130px;" title="'+data+'">'+data+'</span>';
        }).notSortable(),
        DTColumnBuilder.newColumn('id').withTitle('查看交易').withOption('sWidth','150px').renderWith(function(data,type,full){
            if($("#biz_sys_route").val() == "1"){
                // 财一
                return '<a href="#/caiyideal-trade.html?lenderid='+data+'" target="_blank">本人交易</a>&nbsp;/'
                    +'&nbsp;<a href="#/caiyideal-trade.html?userid='+data+'" target="_blank">店铺明细</a>';
            }else if($("#biz_sys_route").val() == "3"){
                // 4s店
                return '<a href="#/qichedeal-trade.html?lenderid='+data+'" target="_blank">本人交易</a>&nbsp;/'
                    +'&nbsp;<a href="#/qichedeal-trade.html?userid='+data+'" target="_blank">店铺明细</a>';
            }else{
                return '<a href="#/xinghuodeal-trade.html?lenderid='+data+'" target="_blank">本人交易</a>&nbsp;/'
                    +'&nbsp;<a href="#/xinghuodeal-trade.html?userid='+data+'" target="_blank">店铺明细</a>';
            }
        }).notSortable(),
        //DTColumnBuilder.newColumn('custCount').withTitle('交易客户数').withOption('sWidth','80px').notSortable(),
        DTColumnBuilder.newColumn('validCustCount').withTitle('成功交易客户数').withOption('sWidth','100px').notSortable(),
        DTColumnBuilder.newColumn('yixinstatusstr').withTitle('宜信员工').withOption('sWidth','60px').renderWith(function(data,type,full){
            if(!data) return '<a href="javascript:;" class="js_director_checkEmp" key="'+full.id+'" style="color: #cc0000; font-weight: 600;">验证异常</a>';
            if(!full.yixintypestr) return '<a href="javascript:;" class="js_director_checkEmp" key="'+full.id+'">'+data+'</a>';
            return '<a href="javascript:;" class="js_director_checkEmp" key="'+full.id+'">'+data+'-'+full.yixintypestr+'</a>';
        }).notSortable(),
        DTColumnBuilder.newColumn('businessType').withTitle('业务类型').withOption('sWidth','80px').renderWith(function(data,type,full){
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
                    str="";
            }
            return str;
        }).notSortable(),
        DTColumnBuilder.newColumn('jobLevel').withTitle('职级').withOption('sWidth','60px').notSortable(),
        DTColumnBuilder.newColumn('levelname').withTitle('级别').withOption('sWidth','186px').notSortable(),
        DTColumnBuilder.newColumn('department').withTitle('部门').withOption('sWidth','120px').renderWith(function(data,type,full){
            if(!data) return "";
            return '<span class="ui_ellipsis" style="width: 120px" title="'+data+'">'+data+'</span>';
        }).notSortable(),
        DTColumnBuilder.newColumn('auditmethod').withTitle('认证方式').withOption('sWidth','120px').renderWith(function(data,type,full){
            return data || '';
        }).notSortable(),
        DTColumnBuilder.newColumn('redpacketSendSelection').withTitle('自主发放红包当前结果').withOption('sWidth','140px').renderWith(function(data,type,full){
            return data === 0 ? "否" : "是";
        }).notSortable(),
        DTColumnBuilder.newColumn('redpacketSendUpdatetime').withTitle('自主发放红包更新时间').withOption('sWidth','140px').renderWith(function(data,type,full){
            if(!data) return "";
            return tools.toJSDate(data);
        }).notSortable(),
        DTColumnBuilder.newColumn('redpacketSendEffection').withTitle('自主发放红包生效结果').withOption('sWidth','140px').renderWith(function(data,type,full){
            return data === 0 ? "否" : "是";
        }).notSortable()
    ];
    var ModalCtrl = function($scope, $modalInstance, $state, form,$timeout) {
        var date = new Date();
        var nowyear = date.getFullYear();
        date.setFullYear(date.getFullYear() + 1);
        date = date.toLocaleDateString();
        var dateArr = date.split("/");
        dateArr[1] = (parseInt(dateArr[1])<10)?("0"+dateArr[1].toString()):dateArr[1];
        dateArr[2] = (parseInt(dateArr[2])<10)?("0"+dateArr[2].toString()):dateArr[2];
        date = dateArr.join("-");
        $scope.form = { STATE : "0" ,ENDDATE: date ,YEAR:nowyear};
        if(form.id){
            $scope.title = "编辑会员";
            $.ajax({
                url: '/user/detail',
                data: {ID:form.id},
                method: "post"
            }).then(function(data){
                if(!tools.interceptor(data)) return;
                $scope.$apply(function(){
                    data.data.ENDDATE = tools.toJSYMD(data.data.ENDDATE);
                    $scope.form = data.data;
                });
            })
        }else{
            $scope.title = "新增会员";
        }
        $timeout(function(){
            $("#addForm").find('input[type="radio"]').uniform();
        },0);
        $scope.ok = function() {
            var self = $("#confirmBtn"),
                formDom = $("#js_modify_params_form"),
                idDom = formDom.find("[name='ID']"),
                username = formDom.find("[name='USERNAME']"),
                userid = formDom.find("[name='USERID']"),
                email = formDom.find("[name='EMAIL']"),
                year = formDom.find("[name='YEAR']"),
                enddate = formDom.find("[name='ENDDATE']"),
                connectname = formDom.find("[name='CONNECTNAME']"),
                mobile = formDom.find("[name='MOBILE']");
             if(!tools.Validator(username) || !tools.Validator(userid) || !tools.Validator(email) || !tools.Validator(year) || !tools.Validator(enddate) || !tools.Validator(connectname) || !tools.Validator(mobile)){
                return false;
            };
            idDom.val(form.id);
            var data = tools.getFormele({}, formDom);
            if(!tools.ajaxLocked(self)) return;
            $modalInstance.close();
            $.ajax({
                type: "post",
                url: G.server + "suc",
                data: data,
                dataType: "json",
                success: function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    if(data.success){
                        alert("操作成功");
                        $modalInstance.close();
                        vm.dtInstance.rerender();
                    };
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });
        };
        $scope.cancel = function() {
            $modalInstance.close();
        };
    };
    $scope.action.build = function(e){
        var currentDom = $(e.currentTarget), data = currentDom.attr("data-id");
        data = data ? {"id":data} : {};
        $modal.open({
            backdrop: true,
            backdropClick: true,
            dialogFade: false,
            keyboard: true,
            templateUrl : 'myModalContent.html',
            controller : ModalCtrl,
            resolve:{
                "form": function(){
                    return data;
                }
            }
        });
    };
    function fnDrawCallback(){
        if(!tools.interceptor(window.ajaxDataInfo)) return;
        var table = $("#dataTables");
//        编辑
        table.off("click", ".js_params_edit");
        table.on("click", ".js_params_edit", function(e){
            $scope.action.build(e);
        });
//        重设密码
        table.off("click", ".js_params_resetPassword");
        table.on("click", ".js_params_resetPassword", function(){
            var result = window.confirm("真的要重设密码吗？");
            if(result){
                var self = $(this);
                if(!tools.ajaxLocked(self)) return;
                $.ajax({
                    url: '/user/resetPassword',
                    data: {ID: $(this).attr("data-id")},
                    method: "post"
                }).then(function(data){
                        tools.ajaxOpened(self);
                        if(!tools.interceptor(data)) return;
                        if(data.success){
                            alert("重设密码成功");
                            location.reload();
                        };
                    })
            }
        });
//        删除
        table.off("click", ".js_params_del");
        table.on("click", ".js_params_del", function(){
            var result = window.confirm("真的要删除吗？");
            if(result){
                var self = $(this);
                if(!tools.ajaxLocked(self)) return;
                $.ajax({
                    url: '/user/del',
                    data: {ID: $(this).attr("data-id")},
                    method: "post"
                }).then(function(data){
                    if(!tools.interceptor(data)) return;
                    if(data.success){
                        tools.ajaxOpened(self);
                        alert("删除成功");
                        location.reload();
                    };
                })
            }
        });
        tools.resetWidth();
    }
}
