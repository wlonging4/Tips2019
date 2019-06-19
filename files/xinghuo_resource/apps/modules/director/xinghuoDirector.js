'use strict';
function xinghuoDirectorController($scope,getProListFactory,getSelectListFactory,tools,DTOptionsBuilder, DTColumnBuilder) {
    $scope.form = {
        isShow: ($("#js_form").find(".form-group").length>6) ? true : false
    };
    $scope.select = {};
    $scope.action = {};
    //勾选id列表
    var submitCheckedInfo=[];
    /*
     获取理财经理类别
     */
    var getUserLevel = getProListFactory.getUserLevel();
    getUserLevel.then(function(data){
        $scope.select.levelid = data.appResData.levellist;
    });
    /*
     获取枚举类型
     */
    var selectList = getSelectListFactory.getSelectList(['documenttype','yixinstatus','yixintype','yixinusertype','biz_sys_route', 'auditmethod', 'protocol_status','idphotoauditstatus']);
    selectList.then(function(data){
        var arr = [];
        $scope.select.documenttype = data.appResData.retList[0].documenttype;
        $scope.select.yixinstatus = data.appResData.retList[1].yixinstatus;
        $scope.select.yixintype = data.appResData.retList[2].yixintype;
        $scope.select.yixinusertype = data.appResData.retList[3].yixinusertype;
        $scope.select.idphotoauditstatus = data.appResData.retList[7].idphotoauditstatus;
        //过滤业务系统来源
        var biz_sys_route = data.appResData.retList[4].biz_sys_route;
        for(var i in biz_sys_route){
            if(i != 3 && i != 4){
                arr.push(biz_sys_route[i]);
            }
        }
        $scope.select.biz_sys_route = arr;
        arr = [];
        $scope.select.auditmethod = data.appResData.retList[5].auditmethod;
        $scope.select.protocol_status = data.appResData.retList[6].protocol_status;
    });
    $scope.select.buyType={
        "10":"独立个人",
        "20":"推荐人团队",
        "30":"推荐人个人",
        "40":"合伙人团队"
    };
    /*生成表格*/
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder
        .newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/xinghuouser/tableDirector.shtml',
            type: 'POST',
            data: function(d){
                jQuery.extend(d,{
                    "orderColumn" : d.columns[d.order[0]["column"]]["data"],
                    "orderType" : d.order[0]["dir"]
                },$scope.form);
            }
        })
        .withDataProp('data')
        .withOption('searching',false)
        .withOption('ordering',true)
        .withOption('serverSide',true)
        .withOption('processing',false)
        .withOption('scrollX',true)
        .withLanguage(tools.dataTablesLanguage)
        .withOption('createdRow', function(row, data, dataIndex) {
            angular.element(row).addClass("test"+data.id)
        })
        .withOption('fnDrawCallback',fnDrawCallback)
        .withPaginationType('full_numbers')
        .withOption('order', [3, 'desc']);
    vm.dtColumns = [
        DTColumnBuilder.newColumn('').withTitle('<label><input type="checkbox" class="radioAll"> 全选</label>').withOption('sWidth','50px').renderWith(function (data,type,full) {
            if(full.id){
                return '<label style="text-align:center"><input type="checkbox" data-value="'+full.id+'" class="radioList"></label>'
            }else{
                return '';
            }
        }).notSortable(),
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
        DTColumnBuilder.newColumn('yixinstatusstr').withTitle('宜信员工').withOption('sWidth','100px').renderWith(function(data,type,full){
            if(!data) return '<a href="javascript:;" class="js_director_checkEmp" key="'+full.id+'" style="color: #cc0000; font-weight: 600;">验证异常</a>';
            if(!full.yixintypestr) return '<a href="javascript:;" class="js_director_checkEmp" key="'+full.id+'">'+data+'</a>';
            return '<a href="javascript:;" class="js_director_checkEmp" key="'+full.id+'">'+data+'-'+full.yixintypestr+'</a>';
        }).notSortable(),
        DTColumnBuilder.newColumn('yixinno').withTitle('员工编号').withOption('sWidth','100px').renderWith(function(data,type,full){
            return full.yixinstatus === 1 ? data:"";
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
        }).notSortable(),
        DTColumnBuilder.newColumn('signScoreChannelStatusStr').withTitle('积分通道协议状态').withOption('sWidth','140px').notSortable(),
        DTColumnBuilder.newColumn('failReason').withTitle('签约失败原因').withOption('sWidth','140px').notSortable(),
        DTColumnBuilder.newColumn('signTime').withTitle('协议签约时间').withOption('sWidth','150px').renderWith(function(data,type,full){
            if(!data) return '';
            return tools.toJSDate(data);
        }).notSortable(),
        DTColumnBuilder.newColumn('managerIdPhotoAuditResDto.auditstatusstr').withTitle('证件照片状态').withOption('sWidth','130px').notSortable(),
        DTColumnBuilder.newColumn('managerIdPhotoAuditResDto').withTitle('证件照片提交时间').withOption('sWidth','130px').renderWith(function(data,type,full){
            if(!data.applytime){return ''}else{return tools.toJSDate(data.applytime)};
        }).notSortable(),
        DTColumnBuilder.newColumn('id').withTitle('操作').withOption('sWidth','80px').renderWith(function(data,type,full){
            return full.signScoreChannelStatus == 1 ? '<a href="javascript:void(0);" class="btn btn-danger btn-xs protocol" data-id="' + data + '">补签协议</a>': "";
        }).notSortable()
    ];
    $scope.action = {
        reset: function(){
            for(var prop in $scope.form){
                if(prop !== 'isShow') delete $scope.form[prop];
            }
            //刷新列表勾选选项清除内容
            submitCheckedInfo=[];
            vm.dtInstance.rerender();
        },
        search: function(){
            //刷新列表勾选选项清除内容
            submitCheckedInfo=[];
            vm.dtInstance.rerender();
        }
    };
    function fnDrawCallback(){
        if(!tools.interceptor(window.ajaxDataInfo)) return;
        tools.resetWidth();
        tools.createModal();
        tools.createModalProgress();
        console.log(submitCheckedInfo);

        /**
         * [查看理财经理信息]
         * @param  {object}   [description]
         * @return {[type]}   [description]
         */
        $("#dataTables tbody").on("click", ".js_see_info", function(){
            var data = {
                "id": $(this).attr("key"),
                "userType": "director",
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
        /**
         * [验证理财经理是否是宜信员工]
         * @param  {object}   [description]
         * @return {[type]}   [description]
         */
        $("#dataTables tbody").on("click", ".js_director_checkEmp", function(){
            $("#js_dialog_progress").modal({backdrop: 'static', keyboard: false});
            var self = this;
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + "/xinghuouser/checkEmp/"+$(this).attr("key")+".shtml",
                data: {},
                dataType: "json",
                success: function(data){
                    tools.ajaxOpened(self);
                    $("#js_dialog_progress").modal("hide");
                    if(!tools.interceptor(data)) return;
                    if(data.success){
                        alert(data.msg);
                        $(".js_search").trigger("click");
                    }
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    $("#js_dialog_progress").modal("hide");
                    tools.ajaxError(err);
                }
            });
        });

        /**
         * [理财经理录入]
         * @param  {String}  [description]
         * @param  {[type]}  [description]
         * @return {[type]}  [description]
         */
        $(".js_edit_add").on("click", function(){
            var self = this;
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + $(this).attr("action"),
                data: {},
                dataType: "json",
                success: function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    if(data.success){
                        $(".js_add_hide").stop().hide();
                        $("#js_addDirector_form [name='cellphone']").Validator({hmsg: "请输入手机号码", regexp: "phone", showok: false, style: {placement: "top"}, emsg: "手机号码不能为空", rmsg: "请输入合法手机号码"});
                        $("#js_addDirector_form [name='realName']").Validator({hmsg: "请输入真实姓名", regexp: "chinname", showok: false, style: {placement: "top"}, emsg: "真实姓名不能为空", rmsg: "请输入合法真实姓名"});
                        $("#js_addDirector_form [name='documentno']").Validator({hmsg: "请输入身份证号码", regexp: "identity", showok: false, style: {placement: "top"}, emsg: "身份证号码不能为空", rmsg: "请输入合法身份证号码"});
                        $("#js_addDirector_form [name='shopName']").Validator({hmsg: "请输入店铺名称", regexp: "nickname", showok: false, style: {placement: "top"}, emsg: "店铺名称不能为空", rmsg: "请输入合法店铺名称"});
                        $("#js_addDirector_form [name='shopCode']").Validator({hmsg: "请输入店铺URL", regexp: /^[A-Za-z0-9]{1,18}$/, showok: false, style: {placement: "top"}, emsg: "店铺URL不能为空", rmsg: "请输入合法店铺URL"});
                        $("#js_addDirector_form [name='qq']").Validator({IsValidate: false, hmsg: "请输入QQ号码", regexp: "QQ", showok: false, style: {placement: "bottom"} , rmsg: "请输入合法QQ号码"});
                        $("#js_addDirector_form [name='introduction']").Validator({IsValidate: false, hmsg: "请输入个人简介", regexp: /^[\s|\S]{0,256}$/, showok: false, style: {placement: "bottom"} , rmsg: "请输入合法个人简介"});
                        $(".js_add_show").stop().show();
                    }
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });
        });
        $(".js_add_cancel").on("click", function(){
            window.location.reload();
        });
        /**
         * [理财经理录入保存]
         * @param  {[type]}   [description]
         * @return {[type]}   [description]
         */
        $("#js_addDirector_save").on("click", function(){
            if(false === tools.Validator($("#js_addDirector_form [name='cellphone'], #js_addDirector_form [name='realName'], #js_addDirector_form [name='documentno'], #js_addDirector_form [name='shopName'], "+
                    "#js_addDirector_form [name='shopCode'], #js_addDirector_form [name='qq'], #js_addDirector_form [name='introduction']"))) return;
            if(!$("#js_addDirector_form [name='levelid']").val()) return alert("请选择理财经理级别！");
            var data = tools.getFormele({}, $("#js_addDirector_form"));
            var self = this;
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + $("#js_addDirector_form").attr("action"),
                data: data,
                dataType: "json",
                success: function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    if(data.success){
                        alert(data.msg);
                        window.location.reload();
                    }
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });
        });
        /**
         * [理财经理导出]
         * @param  {[type]}   [description]
         * @return {[type]}   [description]
         */
        $("#js_director_export").on("click", function(){
            tools.export(this);
        });
        $("#js_director_certificate_export").on("click", function(){
            tools.export(this);
        });

        $("#dataTables tbody").on("click", ".protocol", function(){
            var self = this, id = $(this).attr("data-id");
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + "/xinghuouser/makeUpProtocol.shtml",
                data: {
                    userId:id
                },
                dataType: "json",
                success: function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    if(data.success){
                        alert(data.msg);
                        $scope.action.search();
                    }
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });
        });

        //批量下载照片全选和提交
        //多选框的操作
        $('#dataTables_wrapper').on("click",".radioAll",function () {
            if($(this).is(':checked')){
                //防止先点选后全选重复
                submitCheckedInfo=[];
                $('#dataTables tbody .radioList').each(function (i) {
                    $(this).attr('checked','true');
                    submitCheckedInfo.push($(this).attr('data-value'));
                });
            }else{
                $('#dataTables tbody .radioList').each(function (i) {
                    $(this).removeProp('checked');
                    submitCheckedInfo.splice($(this).index(),1);
                });
            }
        });
        $('#dataTables tbody .radioList').on('click',function () {
            submitCheckedInfo=[];
            $('#dataTables tbody .radioList').each(function (i) {
                if($(this).is(':checked')){
                    submitCheckedInfo.push($(this).attr('data-value'));
                }
            });
        });
        $('.dataTables_paginate').on('click','.paginate_button',function () {
            $('.radioAll').removeProp('checked');
            //换页之后清空全选列表
            submitCheckedInfo=[];
            $('.radioList').each(function (i) {
                $(this).removeProp('checked');
            })
        });

        //照片批量下载
        $('#photosDownload').off('click').on('click',function () {
            if(!submitCheckedInfo.length){
                tools.interalert('请勾选要下载的记录');return;
            }
            console.log(submitCheckedInfo);
            if(submitCheckedInfo.length&&submitCheckedInfo.length>50){
                tools.interalert('批量下载照片条目过大,请不要超过50条！');
                return false;
            }
            if(submitCheckedInfo.length){
                $scope.form.ids=submitCheckedInfo.join(',');
            }
            window.open(siteVar.serverUrl + '/xinghuouser/downloadIdPhoto.shtml?'+'userIds='+$scope.form.ids);
        });

    }
}