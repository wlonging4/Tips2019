'use strict';
function xinghuohuodongRedController($scope,getSelectListFactory,tools,DTOptionsBuilder, DTColumnBuilder) {
    $scope.form = {
        isShow: ($("#js_form").find(".form-group").length>6) ? true : false,
        status:2
    };
    $scope.select = {};
    $scope.action = {};
    var timeStartFlag, timeEndFlag;
    var today = new Date();
    $scope.form.p_startownedtime = tools.toJSYMD(today.getTime() - 30* 24 * 60 * 60 * 1000);
    $scope.form.p_endownedtime = tools.toJSYMD(today.getTime());
    timeStartFlag = $scope.form.p_startownedtime;
    timeEndFlag = $scope.form.p_endownedtime;

    /*
     获取枚举类型
     */
    var selectList = getSelectListFactory.getSelectList(['prize_owned_status','biz_sys_route']);
    selectList.then(function(data){
        $scope.select.status = data.appResData.retList[0].prize_owned_status;
        //过滤业务系统来源
        var arr = [];
        var bizSysRoute = data.appResData.retList[1].biz_sys_route;
        for(var i in bizSysRoute){
            if(i != 3 && i != 4){
                arr.push(bizSysRoute[i]);
            }
        }
        $scope.select.bizSysRoute = arr;
        arr = [];
    });
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder
        .newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/xinghuohuodong/tableRed.shtml',
            type: 'POST',
            data: $scope.form
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
        DTColumnBuilder.newColumn('userid').withTitle('用户ID').withOption('sWidth','100px'),
        DTColumnBuilder.newColumn('code').withTitle('红包编码').withOption('sWidth','120px'),
        DTColumnBuilder.newColumn('prizename').withTitle('红包名称').withOption('sWidth','130px').renderWith(function(data,type,full){
            return '<a href="javascript:;" class="js_redCreate_info ui_ellipsis" key_id="'+full.prizeid+'">'+data+'</a>';
        }),
        DTColumnBuilder.newColumn('mobile').withTitle('手机号').withOption('sWidth','80px'),
        DTColumnBuilder.newColumn('ownedamount').withTitle('面额（元）').withOption('sWidth','80px'),
        DTColumnBuilder.newColumn('endtime').withTitle('有效期至').withOption('sWidth','100px').renderWith(function(data,type,full){
            return tools.toJSDate(data).split(" ")[0];
        }),
        DTColumnBuilder.newColumn('statusstr').withTitle('状态').withOption('sWidth','70px'),
        DTColumnBuilder.newColumn('ownedtime').withTitle('获得时间').withOption('sWidth','140px').renderWith(function(data,type,full){
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('activityname').withTitle('来源').withOption('sWidth','100px').renderWith(function(data,type,full){
            return '<a href="javascript:;" class="js_huodong_info" key_id="'+full.activityid+'">'+data+'</a>';
        })
    ];
    $scope.action = {
        reset: function(){
            for(var prop in $scope.form){
                if(prop !== 'isShow') delete $scope.form[prop];
            }
            $scope.form.status = 2;
             $scope.form.p_startownedtime = timeStartFlag;
             $scope.form.p_endownedtime = timeEndFlag;
            vm.dtInstance.rerender();
        },
        search: function(){
            if($scope.form.status == "" || !$scope.form.p_startownedtime || !$scope.form.p_endownedtime){
                return alert("提示请选择红包状态和创建时间！");
            }
            vm.dtInstance.rerender();
        }
    }
    function fnDrawCallback(){
        if (!tools.interceptor(window.ajaxDataInfo)) return;
        tools.createModal();
        tools.createModalProgress();
        /**
         * [查看红包详情]
         * @param  {[type]}     [description]
         * @return {[type]}     [description]
         */
        $("#dataTables tbody").on("click", ".js_redCreate_info", function(){
            var data ={
                "prizeid": $(this).attr("key_id")
            }
            var self = this;
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + "/xinghuohuodong/redcreateInfo.shtml",
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
         * [查看活动详情]
         * @param  {[type]}     [description]
         * @return {[type]}     [description]
         */
        $("#dataTables tbody").on("click", ".js_huodong_info", function(){
            var url = "/xinghuohuodong/huodongInfo.shtml";
            var data ={
                "activityid": $(this).attr("key_id")
            }
            var self = this;
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + url,
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
    }
    (function(){
        $("[ui-view]").append("<style>table.dataTable,table.dataTable.no-footer {width: 100% !important;}</style>");
        /**
         * [导入红包]
         * @param  {[type]}   [description]
         * @param  {[type]}   [description]
         * @return {[type]}   [description]
         */
        $("#js_red_import").on("click", function(){
            var self = this;
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + $(this).attr("action"),
                data: {},
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
        $(document).on("click", "#js_reds_import_save", function(){
            if(!$("#js_reds_import_form [name='inputfile']").val()) return alert("请选择导入文件");
            var nameArr = $("#js_reds_import_form [name='inputfile']").val().split(".");
            if(!/xls/gi.test(nameArr[nameArr.length-1])) return alert("文件必须是excel文件，后缀名为xls或者xlsx!");
            if(!$("#js_reds_import_form [name='activityid']").val()) return alert("请选择对应的活动！");
            $("#js_dialog").modal("hide");
            $("#js_dialog_progress").modal({backdrop: 'static', keyboard: false});
            var self = this;
            if(!tools.ajaxLocked(self)) return;
            //tools.ajaxForm({
            //    "ele": $("#js_reds_import_form"),
            //    "action": siteVar.serverUrl + $("#js_reds_import_form").attr("action"),
            //    onComplete: function(data){
            //        tools.ajaxOpened(self);
            //        $("#js_dialog_progress").modal("hide");
            //        if(!tools.interceptor(data)) return;
            //        if(data.success){
            //            vm.dtInstance.rerender();
            //        }
            //    }
            //});

            var data = new FormData($("#js_reds_import_form")[0]);
            $.ajax({
                url : siteVar.serverUrl + $("#js_reds_import_form").attr("action"),
                type:"POST",
                data : data,
                processData: false,
                contentType: false,
                success :function(data){
                    if(typeof data == "string"){
                        var data = JSON.parse(data);
                    };
                    tools.ajaxOpened(self);
                    $("#js_dialog_progress").modal("hide");
                    if(!tools.interceptor(data)) return;
                    if(data.success){
                        vm.dtInstance.rerender();
                    }
                }

            });

        });
        /**
         * [下载红包模板]
         * @param  {[type]}   [description]
         * @param  {[type]}   [description]
         * @return {[type]}   [description]
         */
        $("#js_red_template_download").on("click", function(){
            $("#js_reds_btns_form").attr("action", siteVar.serverUrl + $(this).attr("action")).submit();
        });
        /**
         * [导出红包]
         * @param  {[type]}   [description]
         * @param  {[type]}   [description]
         * @return {[type]}   [description]
         */
        $("#js_red_export").on("click", function(){
            tools.export(this);
        });
    })();
}