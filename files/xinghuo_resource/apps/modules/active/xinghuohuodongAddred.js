'use strict';
function xinghuohuodongAddred($scope,getSelectListFactory, $timeout,tools,$location) {
    $scope.form = {
        status:1
    };
    $scope.select = {};
    $scope.action = {};
    /*
     获取枚举类型
     */
    if($location.url().indexOf("?") > -1){
        var urlStr = $location.url().split("?")[1];
        var urlObj = tools.serializeUrl(urlStr);
        if(!urlObj.prizeid){
            alert("参数非法");
            return history.back(-1);
        };
        $scope.form.prizeid = urlObj.prizeid;
        var selectList = getSelectListFactory.getHuodong(urlObj,"/xinghuopageapi/getHongbaoPrize.json");
        selectList.then(function(data){
            if(data.result == "SUCCESS"){
                var result = data.appResData;
                $.extend($scope.form,result);
                $scope.form.starttime = tools.toJSYMD(result.starttime);
                $scope.form.endtime = tools.toJSYMD(result.endtime);
            }else{
                return history.back(-1);
            }
        });
    }
    $scope.action = {
        save: function(){
            if(false == tools.Validator($("#js_create_red_modify [name='prizename'], #js_create_red_modify [name='prizeamount'], #js_create_red_modify [name='starttime'], #js_create_red_modify [name='endtime'], #js_create_red_modify [name='introducer']"))) return;
            if($scope.form.prizeid){
                $("input[name='prizeid']").val($scope.form.prizeid);
            };
            var data = tools.getFormele({}, $("#js_create_red_modify"));
            var self = this;
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + "/xinghuohuodong/modifyRedcreate.shtml",
                data: data,
                dataType: "json",
                success: function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    if(data.success) return history.back(-1);
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });
        }
    };
    $timeout(function(){
        $("#js_create_red_modify").find("input[type='radio']").uniform();
    }, 0);
    (function(){

        $("body").on("click","#js_add_or_edit_body",function(){
            tools.Validator($("#js_create_red_modify [name='starttime'], #js_create_red_modify [name='endtime']"));
        });
        $("#js_create_red_modify [name='prizename']").Validator({hmsg: "请填写红包名称", regexp: /^[\s|\S]{1,256}$/, showok: false, style: {placement: "top"}, emsg: "红包名称不能为空", rmsg: "红包名称不合法"});
        $("#js_create_red_modify [name='prizeamount']").Validator({hmsg: "请填写金 额", regexp: /^\d+$/, showok: false, style: {placement: "top"}, emsg: "金额不能为空", rmsg: "金 额不合法"});
        $("#js_create_red_modify [name='starttime']").Validator({hmsg: "请选择起始时间", regexp: /^\d{4}\-\d{2}\-\d{2}$/, showok: false, style: {placement: "top"}, emsg: "起始时间不能为空", rmsg: "起始时间不合法"});
        $("#js_create_red_modify [name='endtime']").Validator({hmsg: "请选择结束时间", regexp: /^\d{4}\-\d{2}\-\d{2}$/, showok: false, style: {placement: "top"}, emsg: "结束时间不能为空", rmsg: "结束时间不合法"});
        $("#js_create_red_modify [name='introducer']").Validator({IsValidate: false, hmsg: "请填写活动说明", regexp: /^[\s|\S]{0,256}$/, showok: false, style: {placement: "bottom"}, rmsg: "合法活动说明不合法"});
    })();
}