'use strict';
function serviceChargeCreateController($scope, tools,$state) {
    $scope.form = {
        feeType: "5",
        idCardType: "1"
    };
    $scope.select = {};
    $scope.action = {};
    $scope.action = {
        save: function(){
            if(false == tools.Validator($("#js_create_red_modify [name='idCardNo'], #js_create_red_modify [name='amount'],#js_create_red_modify [name='appOrderId']"))) return;
            var data = tools.getFormele({}, $("#js_create_red_modify"));
            var self = this;
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + "/settlefee/create.json",
                data: data,
                dataType: "json",
                success: function(data){
                    tools.ajaxOpened(self);
                    $state.go("serviceCharge-manage");
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });
        }
    };
    (function(){
        $("#js_create_red_modify [name='idCardNo']").Validator({hmsg: "请填写证件号码", showok: false, style: {placement: "top"}, emsg: "证件号码不能为空"});
        $("#js_create_red_modify [name='amount']").Validator({hmsg: "请填写金额", regexp: /^(([1-9]+\d*)|([1-9]+\d*\.\d{1,2}))$/, showok: false, style: {placement: "top"}, emsg: "金额不能为空", rmsg: "金额不合法"});
        $("#js_create_red_modify [name='appOrderId']").Validator({hmsg: "请填写交易单号", showok: false, style: {placement: "top"}, emsg: "交易单号不能为空"});
    })();
}