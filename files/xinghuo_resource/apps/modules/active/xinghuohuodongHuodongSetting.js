'use strict';
function xinghuohuodongSettingController($scope,tools,$location,getSelectListFactory) {
    $scope.form = {

    };
    $scope.select = {};
    $scope.action = {};
    if($location.url().indexOf("?") <0){
        alert("缺少参数");
        return ;
    }
    var urlStr = $location.url().split("?")[1];
    var urlObj = tools.serializeUrl(urlStr);
    if(!urlObj.activityid){
        alert("参数非法");
        return;
    }
    $scope.activityid = urlObj.activityid;
    var activeInfo = getSelectListFactory.getHuodong(urlObj,'/xinghuopageapi/getAwardSetInfo.json');
    activeInfo.then(function(data){
        if(data.result == "SUCCESS"){
            var activeResult = data.appResData.pagelist[0];
            if(!data.appResData.activity.award){
                $scope.addnew = true;
                return;
            }
            if(data.appResData.activity.participantway == 1) {
                $scope.isShow = true;
            }
            $scope.activityname = activeResult.activityname;
            $scope.awardname = activeResult.awardname;
            $scope.awardid = activeResult.awardid;
            $scope.prizename = activeResult.prizename;
            $scope.introducer = activeResult.introducer;
            switch (activeResult.awardtype){
                case 1:
                    $scope.awardtype = "红包";
                    break;
            }
        }else{
            alert(data.errMsg);
        }
    })

    $scope.action = {

    };
    (function(){
        /**
         * [生成红包]
         * @param  {[type]}   [description]
         * @param  {[type]}   [description]
         * @return {[type]}   [description]
         */
        $(document).on("click","#js_red_create_btn", function(){
            tools.createModalProgress();
            var data = {
                "activityid": $(this).attr("key_id")
            }
            $("#js_dialog_progress").modal({backdrop: 'static', keyboard: false});
            var self = this;
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + $(this).attr("action"),
                data: data,
                dataType: "json",
                success: function(data){
                    tools.ajaxOpened(self);
                    $("#js_dialog_progress").modal("hide");
                    if(!tools.interceptor(data)) return;
                    if(data.success){
                        return alert(data.msg);
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
         * [导出红包]
         * @param  {[type]}   [description]
         * @param  {[type]}   [description]
         * @return {[type]}   [description]
         */
        $(document).on("click", "#js_red_export_btn",function(){
            var action = $("#js_red_export_form").attr("action");
            console.log(action.indexOf(siteVar.serverUrl));
            if(action.indexOf(siteVar.serverUrl) < 0){
                action = siteVar.serverUrl + action;
                $("#js_red_export_form").attr("action", action).submit();
            }else{
                $("#js_red_export_form").submit()
            };

        });
        /**
         * [查看奖项详情]
         * @param  {[type]}   [description]
         * @param  {[type]}   [description]
         * @return {[type]}   [description]
         */
        $("body").on("click", ".js_award_look", function(){
            tools.createModal();
            var url = "/xinghuohuodong/awardinfo.shtml";
            var data = {
                "awardid": $(this).attr("key_awardid"),
                "activityid": $(this).attr("key_activityid")
            };
            var self = this;
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + url,
                data: data,
                dataType: "text",
                success: function (data) {
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    $("#js_dialog .js_content").html(data);
                    $("#js_dialog").modal("show");
                },
                error: function (err) {
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });
        });
    })();
}