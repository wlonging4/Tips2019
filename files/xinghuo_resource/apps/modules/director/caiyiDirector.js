'use strict';
function caiyiDirectorController($scope,getProListFactory,getSelectListFactory,tools,DTOptionsBuilder, DTColumnBuilder) {
    $scope.form = {
        isShow: ($("#js_form").find(".form-group").length>6) ? true : false,
        bizSysRoute: 1
    };
    $scope.select = {};
    $scope.action = {};
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
    var selectList = getSelectListFactory.getSelectList(['documenttype','yixinstatus','yixintype','yixinusertype']);
    selectList.then(function(data){
        $scope.select.documenttype = data.appResData.retList[0].documenttype;
        $scope.select.yixinstatus = data.appResData.retList[1].yixinstatus;
        $scope.select.yixintype = data.appResData.retList[2].yixintype;
        $scope.select.yixinusertype = data.appResData.retList[3].yixinusertype;
    });
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
            return '<a href="#/caiyideal-trade.html?lenderid='+data+'" target="_blank">本人交易</a>&nbsp;/'
                +'&nbsp;<a href="#/caiyideal-trade.html?userid='+data+'" target="_blank">店铺明细</a>';
        }).notSortable(),
        DTColumnBuilder.newColumn('custCount').withTitle('交易客户数').withOption('sWidth','80px').notSortable(),
        DTColumnBuilder.newColumn('validCustCount').withTitle('成功交易客户数').withOption('sWidth','100px').notSortable(),
        DTColumnBuilder.newColumn('yixinstatusstr').withTitle('宜信员工').withOption('sWidth','80px').renderWith(function(data,type,full){
            if(!data) return '<a href="javascript:;" class="js_director_checkEmp" key="'+full.id+'" style="color: #cc0000; font-weight: 600;">验证异常</a>';
            if(!full.yixintypestr) return '<a href="javascript:;" class="js_director_checkEmp" key="'+full.id+'">'+data+'</a>';
            return '<a href="javascript:;" class="js_director_checkEmp" key="'+full.id+'">'+data+'-'+full.yixintypestr+'</a>';
        }).notSortable(),
        DTColumnBuilder.newColumn('yixinusertypestr').withTitle('类型').withOption('sWidth','50px').notSortable(),
        DTColumnBuilder.newColumn('levelname').withTitle('级别').withOption('sWidth','140px').notSortable(),
        DTColumnBuilder.newColumn('department').withTitle('部门').withOption('sWidth','120px').renderWith(function(data,type,full){
            if(!data) return "";
            return '<span class="ui_ellipsis" style="width: 120px;" title="'+data+'">'+data+'</span>';
        }).notSortable()
    ];
    $scope.action = {
        reset: function(){
            for(var prop in $scope.form){
                if(prop !== 'isShow') delete $scope.form[prop];
            }
            vm.dtInstance.rerender();
        },
        search: function(){
            vm.dtInstance.rerender();
        }
    }
    function fnDrawCallback(){
        if(!tools.interceptor(window.ajaxDataInfo)) return;
        tools.resetWidth();
        tools.createModal();
        tools.createModalProgress();

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
    }
}