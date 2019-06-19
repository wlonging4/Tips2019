'use strict';
function xinghuohuodongHuodongController($scope,getSelectListFactory,tools,DTOptionsBuilder, DTColumnBuilder) {
    $scope.form = {
        isShow: ($("#js_form").find(".form-group").length>6) ? true : false,
        awardtype: 1
    };
    $scope.select = {};
    $scope.action = {};
    /*
     获取枚举类型
     */
    var selectList = getSelectListFactory.getSelectList(['activity_object','activity_participant','activity_status','activity_participan_tway','biz_sys_route']);
    selectList.then(function(data){
        $scope.select.activityobject = data.appResData.retList[0].activity_object;
        $scope.select.participant = data.appResData.retList[1].activity_participant;
        $scope.select.status = data.appResData.retList[2].activity_status;
        $scope.select.participantway = data.appResData.retList[3].activity_participan_tway;
        //过滤业务系统来源
        var arr = [];
        var bizSysRoute = data.appResData.retList[4].biz_sys_route;
        for(var i in bizSysRoute){
            if(i != 4){
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
            url: siteVar.serverUrl + '/xinghuohuodong/tableHuodong.shtml',
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
        DTColumnBuilder.newColumn('activityobjectstr').withTitle('活动对象').withOption('sWidth','80px').renderWith(function(data,type,full){
            if(data == "") return "其他";
            return data;
        }),
        DTColumnBuilder.newColumn('activityname').withTitle('活动名称').withOption('sWidth','120px').renderWith(function(data,type,full){
            return '<a href="javascript:;" class="js_huodong_info ui_ellipsis" style="width: 120px;" key_id="'+full.activityid+'" title="'+data+'">'+data+'</a>';
        }),
        DTColumnBuilder.newColumn('activityid').withTitle('活动ID').withOption('sWidth','60px'),
        DTColumnBuilder.newColumn('starttime').withTitle('活动时间').withOption('sWidth','310px').renderWith(function(data,type,full){
            if(!data) return "";
            return tools.toJSDate(data)+"&nbsp;至&nbsp;"+tools.toJSDate(full.endtime);
        }),
        DTColumnBuilder.newColumn('introducer').withTitle('活动说明').withOption('sWidth','120px').renderWith(function(data,type,full){
            if(!data) return "";
            return '<span class="ui_ellipsis" style="width: 150px;" title="'+data+'">'+data+'</span>';
        }),
        DTColumnBuilder.newColumn('participantstr').withTitle('参与用户').withOption('sWidth','80px').renderWith(function(data,type,full){
            if(!data) return "";
            return '<span class="ui_ellipsis" style="width: 120px;" title="'+data+'">'+data+'</span>';
        }),
        DTColumnBuilder.newColumn('conditionsstr').withTitle('参与条件').withOption('sWidth','80px').renderWith(function(data,type,full){
            if(!data) return "";
            return '<span class="ui_ellipsis" style="width: 80px;" title="'+data+'">'+data+'</span>';
        }),
        DTColumnBuilder.newColumn('statusstr').withTitle('活动状态').withOption('sWidth','70px'),
        DTColumnBuilder.newColumn('status').withTitle('操作').withOption('sWidth','100px').renderWith(function(data,type,full){
            if(data == 1){
                return '<a href="javascript:;" class="btn btn-danger btn-xs js_huodong_open" key_id="'+full.activityid+'" key_status="'+data+'">禁用</a>';
            }else{
                var str = '<a href="javascript:;" class="btn btn-success btn-xs js_huodong_open" key_id="'+full.activityid+'" key_status="'+data+'">启用</a>';
                str += '&nbsp;<a href="#/xinghuohuodong-addhuodong.html?activityid=' +full.activityid+ '" class="btn btn-warning btn-xs">编辑</a>';
                return str;
            }
        }),
        DTColumnBuilder.newColumn('activityid').withTitle('奖项设置').withOption('sWidth','70px').renderWith(function(data,type,full){
            if(!data) return "";
            return '<a href="#/xinghuohuodong-huodongSetting.html?activityid='+data+'" target="_blank">设置</a>';
        })
    ];
    $scope.action = {
        reset: function(){
            for(var prop in $scope.form){
                if(prop !== 'isShow' && prop !== 'awardtype') delete $scope.form[prop];
            }
            vm.dtInstance.rerender();
        },
        search: function(){
            vm.dtInstance.rerender();
        }
    }
    function fnDrawCallback(){
        if (!tools.interceptor(window.ajaxDataInfo)) return;
        tools.resetWidth();
        tools.createModal();
        tools.createModalProgress();
        /**
         * [查看活动详情]
         * @param  {[type]}     [description]
         * @return {[type]}     [description]
         */
        $("#dataTables tbody").on("click", ".js_huodong_info", function(){
            var url = "/xinghuohuodong/huodongInfo.shtml";
            if($("#biz_sys_route").length && $("#biz_sys_route").val() == "4"){
                url = "/caierhuodong/huodongInfo.shtml";
            }
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
        /**
         * [启用/禁用活动]
         * @param  {[type]}     [description]
         * @return {[type]}     [description]
         */
        $("#dataTables tbody").on("click", ".js_huodong_open", function(){
            var data ={
                "activityid": $(this).attr("key_id"),
                "status": 1-$(this).attr("key_status")
            }
            var self = this;
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + "/xinghuohuodong/changeHuodongStatus.shtml",
                data: data,
                dataType: "json",
                success: function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    vm.dtInstance.rerender();
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });
        });
        /**
         * [活动管理]
         * @param  {[type]}   [description]
         * @param  {[type]}   [description]
         * @return {[type]}   [description]
         */
        $("#js_huodong_add").off("click");
        $("#js_huodong_add").on("click", function() {
            /**
             * [新增活动，根据参与方式，给不同的活动配置模板]
             * @author [zongzema]
             * @date [2016-09-20]
             * @description [后台开发 ]
             */
            if (!$("#js_unsettle_btns_form [name='participantway']").val()) {
                alert("请先选择新建活动的参与方式");
                return false;
            };
            var participantway = $("#js_unsettle_btns_form [name='participantway']").val();
            window.location.href = "#xinghuohuodong-addhuodong.html?participantway=" + participantway;
        });
    }
}