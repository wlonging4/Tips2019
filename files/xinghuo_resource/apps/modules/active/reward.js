'use strict';
function reward($scope, $modal, $http, $location, getSelectListFactory, tools, DTOptionsBuilder, DTColumnBuilder) {
    var domForm = $("#js_form"), conditionItem = domForm.find(".form-group");
    $scope.form = {
        isShow: (conditionItem.length > 6) ? true : false
    };
    $scope.select = {};
    $scope.select.js_q_year = [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030];
    $scope.select.js_q_month = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
    $scope.select.code = [{
        key:"RT001",
        value:"理财师邀请",
        type:[{key:"RR001",value:"证书通过"},{key:"RR002",value:"10万销售额"},{key:"RR003",value:"50万销售额"},{key:"RR004",value:"100万销售额"}]
    },{
        key:"RT002",
        value:"投米RA投资奖励",
        type:[{key:"RR005",value:"投米RA首次投资奖励"},{key:"RR006",value:"投米RA投资月持仓奖励"}]
    },{
        key:"RT003",
        value:"类固收奖励佣金",
        type:[{key:"RR007",value:"月累计销售额"}]
    }];
    $scope.select.type = [];
    $scope.action = {};
    $scope.action.codeFilter = function(code){
        console.log(code);
        switch(code) {
            case "RT001":
                $scope.select.type = $scope.select.code[0].type;
                break;
            case "RT002":
                $scope.select.type = $scope.select.code[1].type;
                break;
            case "RT003":
                $scope.select.type = $scope.select.code[2].type;
                break;
            default:
                $scope.select.type = [];
                break;
        }

    };
    $scope.action.setDate = function(year,month){
        $scope.form.month = year + '-' +month;
        $('input[name="month"]').val($scope.form.month);
    };
    var params = $location.$$search;
    if(params.userId){
        $scope.form.userId = params.userId;
    };
    if(params.invitedUserId){
        $scope.form.invitedUserId = params.invitedUserId;
    };
    /*
     获取枚举类型
     */
    getSelectListFactory.getSelectList(['issoldout']).then(function(data){
        $scope.select.issoldout = data.appResData.retList[0].issoldout;
    });

    // $http({
    //     method: "POST",
    //     url: siteVar.serverUrl + "/xinghuoinviteuser/importActivityReward.shtml",
    //     headers: {
    //         'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
    //         'X-Requested-With' :'XMLHttpRequest'
    //     }
    // }).success(function(data, status) {
    //     if(data.result != "SUCCESS") {
    //         alert("获取状态失败，请与管理员联系。" + data.msg);
    //         return;
    //     };
    //     $scope.select.itmInvitedRewardRuleId = data.appResData.departList;
    // }).error(function(data, status) {
    //     alert("获取状态失败，请与管理员联系。");
    //     return;
    // });
    /*
     创建表格选项
     */
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/xinghuoinviteuser/rewardtable.shtml',
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
        DTColumnBuilder.newColumn('userId').withTitle('理财经理ID').withOption('sWidth', '100px').renderWith(function(data,type,full){
            return '<a href="javascript:;" class="js_see_info" key="'+data+'" type="director" key_sys="'+full.bizSysRoute+'">'+data+'</a>';
        }),
        DTColumnBuilder.newColumn('source').withTitle('活动来源_活动条件').withOption('sWidth','150px'),
        DTColumnBuilder.newColumn('amount').withTitle('奖励金额(元)').withOption('sWidth','80px'),
        DTColumnBuilder.newColumn('month').withTitle('计提月份').withOption('sWidth','80px').renderWith(function(data, type, full) {
            if(!data) return "";
            return data.substring(0,4)+'-'+data.substring(4);
        }),
        DTColumnBuilder.newColumn('lenderId').withTitle('用户ID').withOption('sWidth', '100px').renderWith(function(data, type, full){
            if(!data) return "";
            return '<a href="javascript:;" class="js_see_info" key="'+data+'" type="consumer" key_sys="'+full.bizSysRoute+'">'+data+'</a>';
        }),
        DTColumnBuilder.newColumn('remark').withTitle('备注').withOption('sWidth', '120px').renderWith(function(data, type, full){
            if(!data) return "";
            return '<a onclick="return false;" href="javascrip:void(0);" data-toggle="popover" data-content="'+ data +'" data-placement="left" data-flag=0 class="rewardListRemark">查看备注</a>';
        }),
        
        DTColumnBuilder.newColumn('rewardTime').withTitle('奖励时间').withOption('sWidth', '150px').renderWith(function(data, type, full){
            if(!data) return "";
            return tools.toJSDate(data);
        })
    ];

    $scope.action.reset = function(){
        for(var prop in $scope.form){
            if(prop !== 'isShow') delete $scope.form[prop];
        }
        $scope.date.js_q_month = '';
        $scope.date.js_q_year = '';
        $('input[name="month"]').val('');
        vm.dtInstance.rerender();
    };
    $scope.action.search = function(){
        vm.dtInstance.rerender();
    };

    var ModalImportCtrl = function($scope, $modalInstance) {
        $scope.form = {};
        $scope.action = {};
        var prevMonthMonth=new Date().getMonth()?new Date().getMonth():12;
        var prevMonthYear=prevMonthMonth==12?new Date().getFullYear()-1:new Date().getFullYear();
        $scope.amountSettleMonth=prevMonthYear+'-'+(prevMonthMonth>9?prevMonthMonth:'0'+prevMonthMonth);
        $scope.importExcel = siteVar.serverUrl + "/xinghuoinviteuser/exportActivityReward.shtml";
        $scope.ok = function() {
            var self = $("#importConfirmBtn"), filevalue = $(".js_upload_reward_form [name='inputfile']").val();
            if(!filevalue) return alert("请选择导入文件");
            if (!$scope.form.maxAmount){
                return alert("请输入奖励佣金最高额");
            } else if(! /^\d+$/.test($scope.form.maxAmount)){
                return alert("奖励佣金最高额为正整数");
            }
            var nameArr = filevalue.split(".");
                if(!/xls/gi.test(nameArr[nameArr.length-1])) return alert("文件必须是excel文件，后缀名为xls或者xlsx!");
            
            if(!tools.ajaxLocked(self)) return;
            $modalInstance.close();
            var data = new FormData($(".js_upload_reward_form")[0]);
            $.ajax({
                url : siteVar.serverUrl + "/xinghuoinviteuser/importActivityReward.shtml",
                type:"POST",
                data : data,
                dataType: "json",
                processData: false,
                contentType: false,
                success :function(data){
                    tools.ajaxOpened(self);
                    $("#js_dialog_progress").modal("hide");
                    if(!tools.interceptor(data)) return;
                    console.log(data);
                    if(data.success){
                        console.log("success");
                        if (!!data.data.wrongmsg) {
                            var str = '<div class="modal-content"><div class="modal-header"><button id="js_dialog_passport_settle_close" type="button" class="close" data-dismiss="modal" aria-label="Close">'+
                            '<span aria-hidden="true">×</span></button><h4 class="modal-title fn-ms">导入奖励佣金失败</h4></div><div class="modal-body" style="max-height:300px; overflow-y: auto;font-size: 14px;"><br>' + '校验失败: '+
                            data.data.errorSize+'条<br><br>' + data.data.wrongmsg +'</div></div>';
                        } else{
                            var str = '<div class="modal-content"><div class="modal-header"><button id="js_dialog_passport_settle_close" type="button" class="close" data-dismiss="modal" aria-label="Close">'+
                            '<span aria-hidden="true">×</span></button><h4 class="modal-title fn-ms">导入奖励佣金成功</h4></div><div class="modal-body" style="max-height:300px; overflow-y: auto;font-size: 14px;"><br>' + '导入总条数: '+
                            data.data.totalSize+'条；<br>' + '修改数据: ' + data.data.updateSize+'条；<br>' + '新增数据:'+data.data.insertSize + '条；</div></div>';
                        }
                        $("#js_dialog_passport .js_content").html(str);
                        $("#js_dialog_passport").modal({backdrop: 'static', keyboard: false});
                        
                    }else {
                       alert(data.msg);
                    }
                }

            });
        };
        $scope.close = function() {
            $modalInstance.close();
        };
    };

    $scope.action.importRw = function(){
        $modal.open({
            backdrop: true,
            backdropClick: true,
            dialogFade: false,
            keyboard: true,
            templateUrl : 'rwImport.html',
            controller : ModalImportCtrl,
            windowClass:'modal-640'
        });
    };

    function fnDrawCallback(){
        if(!tools.interceptor(window.ajaxDataInfo)) return;
        $(".js_export").on("click", function(){
            tools.export(this);
        });

        /**
         * [查看理财经理/用户信息]
         * @param  {object}   [description]
         * @return {[type]}   [description]
         */
        $("#dataTables tbody").on("click", ".js_see_info", function(){
            var data = {
                "id": $(this).attr("key"),
                "userType": $(this).attr("type"),
                "bizSysRoute": $("#biz_sys_route").val()
            };
            var self = this;
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + "/xinghuouser/userinfo.shtml",
                data: data,
                dataType: "text",
                success: function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    $("#js_dialog .js_content").html(data);
                    $("#js_dialog").modal("show");
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });
        });

        $("#dataTables tbody").on("mouseover", ".rewardListRemark", function(){
            var self = $(this), content = self.attr("data-content"), flag = parseInt(self.attr("data-flag"));
            if(flag == 0) {
                self.popover({
                    html: true,
                    title: '备注详情',
                    content: function (content) {
                        return content;
                    }
                }).popover('show');
                self.attr("data-flag", 1);
            };
            return false;
        });

        $("#dataTables tbody").on("mouseleave", ".rewardListRemark", function(){
            $(this).attr("data-flag", 0).popover('hide');
        });

    };
    (function(){
        tools.createModal();
        tools.createModalProgress();
        tools.createModalUser();
        var popUpLayer = $("#js_dialog"), popUpLayerContent = popUpLayer.find(".js_content");
    })();
    
}
