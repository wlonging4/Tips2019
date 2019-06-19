'use strict';
function editinvitecode($scope, $http, $state, $location, tools) {
    var formDom = $("#js_invitedcode_add_form"), nameInput = formDom.find("[name='name']");

    $scope.form = {

    };
    $scope.select = {};
    $scope.showCancel = false;
    var data = $location.$$search.data, showCancel = $location.$$search.showCancel;
    if(data){
        $scope.pageTitle = "修改邀请码";
        data = JSON.parse(data);
        $scope.form.id = data.id;
        $scope.form.name = data.name;
        $scope.form.numbers = data.numbers;
        $scope.form.startDate = data.startDate ? tools.toJSYMD(data.startDate) : '';
        $scope.form.endDate = data.endDate ? tools.toJSYMD(data.endDate) : '';
        $scope.form.description = data.description || '';
        nameInput.attr("readonly", "readonly");
    }else{
        $scope.pageTitle = "创建邀请码";
        $scope.form.id = "";
        $scope.form.name = "";
        $scope.form.numbers = "";
        $scope.form.startDate = "";
        $scope.form.endDate = "";
        $scope.form.description = "";
        nameInput.removeAttr("readonly");


    };
    if(showCancel){
        $scope.showCancel = true;
    };




    ;(function(){
        if(data){
            $("#inviteStartDate").removeClass("date").removeAttr("data-provide");
            var startDate = tools.toJSYMD(data.endDate);
            var dataArr = startDate.split("-");dataArr[1] -= 1;
            $('#invitEndDate').datepicker({
                format: 'yyyy-mm-dd',
                pickTime: false,
                startDate: new Date(Date.UTC.apply(Date, dataArr)),
                language:"zh-CN"
            });
        }else{
            $('.date').datepicker({
                rtl: Metronic.isRTL(),
                orientation: "left",
                autoclose: true,
                language:"zh-CN"
            });
        };
        var nameInput = formDom.find("[name='name']"), numberInput = formDom.find("[name='numbers']"), startDateInput = formDom.find("[name='startDate']"), endDateInput = formDom.find("[name='endDate']")
        nameInput.Validator({hmsg: "请输入邀请码名称", showok: false, style: {placement: "top"}, emsg: "邀请码名称不能为空", fn: function (v, tag) {
            return v.length < 50
        }, fnmsg:"名称长度小于50"});
        numberInput.Validator({hmsg: "请输入邀请码数量", showok: false,regexp: /^[1-9]\d*$/, rmsg:"数量必为正整数", style: {placement: "top"}, emsg: "邀请码数量不能为空",fn: function (v, tag) {
            return v.toString().length < 5
        }, fnmsg:"输入数字超过最大值，请重新输入"});
        startDateInput.Validator({hmsg: "请输入有效期起始时间", showok: false, style: {placement: "top"}, emsg: "有效期起始时间不能为空",fn: function (v, tag) {
            if(endDateInput.val()){
                return new Date(v.replace(/-/g, "/")) - new Date(endDateInput.val().replace(/-/g, "/")) < 0;
            }else{
                return true;
            }
        }, fnmsg:"开始时间应小于结束时间"});
        endDateInput.Validator({hmsg: "请输入有效期结束时间", showok: false, style: {placement: "top"}, emsg: "有效期结束时间不能为空",fn: function (v, tag) {

            if(startDateInput.val()){
                return new Date(startDateInput.val().replace(/-/g, "/")) - new Date(v.replace(/-/g, "/")) < 0;
            }else{
                return true;
            }
        }, fnmsg:"结束时间应大于开始时间"});
    })();



    //$http({
    //    method: "POST",
    //    url: siteVar.serverUrl + "/xinghuopageapi/getWebcmsType.json",
    //    headers: {
    //        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
    //        'X-Requested-With' :'XMLHttpRequest'
    //    }
    //}).success(function(data, status) {
    //
    //}).error(function(data, status) {
    //    alert("获取分类列表失败，请与管理员联系。");
    //    return;
    //});













    /**
     * 保存**/
    $scope.save = function() {
        var self = $("js_code_save"), data;
        data = tools.getFormele({}, formDom);

        if(!tools.Validator(formDom.find("[name='name'], [name='numbers'], [name='startDate'], [name='endDate']"))){
            return false;
        };


        if(!tools.ajaxLocked(self)) return;
        $.ajax({
            type: "post",
            url: siteVar.serverUrl + "/xinghuoinvitecode/saveinvitecode.shtml",
            data: data,
            dataType: "json",
            success: function(data){
                tools.ajaxOpened(self);
                //$state.go("xinghuoinvitecode-inviteindex");
                if(!data.success){
                    return alert(data.msg)
                };
                return window.location.href = "#/xinghuoinvitecode-inviteindex.html"
            },
            error: function(err){
                tools.ajaxOpened(self);
                tools.ajaxError(err);
            }
        });


    }
}
