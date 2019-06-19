'use strict';
function editAd($scope, $timeout, $state, $http, $location, getSelectListFactory, tools, DTOptionsBuilder, DTColumnBuilder) {
    $scope.form = {
        status: true,
        urlType:1,
        platformType:1,
        loginStatus:1
    };
    $scope.select = {};
    $scope.img = {};
    $scope.action = {};
    var id = $location.$$search.id, form = $("#js_upload_add_form");

    getSelectListFactory.getSelectList(['lay_out', 'ad_source', 'biz_sys_route', 'platform_type', 'login_status']).then(function(data){
        $scope.select.layout = data.appResData.retList[0].lay_out;
        $scope.select.source = data.appResData.retList[1].ad_source;
        $scope.select.bizSysRoute = data.appResData.retList[2].biz_sys_route;
        $scope.select.platformType = data.appResData.retList[3].platform_type;
        $scope.select.loginStatus = data.appResData.retList[4].login_status;
    }).then(function(){
        if(id){
            $scope.form.id = id;
            form.find("input[name='id']").val(id);
            var reqData = $.param({id: id});
            $http({
                method: "POST",
                url: siteVar.serverUrl + "/xinghuocontent/toeditAd.shtml",
                data:reqData,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                    'X-Requested-With' :'XMLHttpRequest'
                }
            }).success(function(data, status) {
                var info = data.data.itmAd;
                $scope.form.photo = info.photo;
                $scope.img.name = info.photo;
                $scope.img.href = data.data.adPath + '/' + info.photo;
                $scope.form.layout = info.layout;
                $scope.form.source = info.source;
                $scope.form.bizSysRoute = info.bizSysRoute;
                $scope.form.startdate = info.startdate ? tools.toJSYMD(info.startdate) : '';
                $scope.form.enddate = info.enddate ? tools.toJSYMD(info.enddate) : '';
                $scope.form.adname = info.adname;
                $scope.form.adseo = info.adseo;
                $scope.form.url = info.url;
                $scope.form.urlType = info.urlType;
                $scope.form.priority = info.priority;
                $scope.form.status = (info.status == 0);
                $scope.form.platformType = info.platformType;
                $scope.form.loginStatus = info.loginStatus;
                $scope.form.otherRelate = info.otherRelate;
                $timeout(function(){
                    $("input[type=radio]").uniform();
                }, 0);
            }).error(function(data, status) {
                alert("获取广告信息失败，请与管理员联系。");
                return;
            });
        }else{
            $scope.form.layout = 0;
            $scope.form.source = 1;
            $scope.form.bizSysRoute = 0;
            $timeout(function(){
                $("input[type=radio]").uniform();
            }, 0);
        };

    });
    $scope.changeSource = function () {
        $timeout(function(){
            $("input[type=radio]").uniform();
        }, 0);
    };
    $scope.filerSource = function(e){
        return e.key != 4;
    };
    $scope.status = function(key){
        return $scope.form.status == key;
    };
    ;(function(){
        $("#js_upload_add_form [name='adname']").Validator({hmsg: "请填写广告名称", regexp: /^[\s|\S]{0,256}$/, showok: false, style: {placement: "top"}, emsg: "广告名称不能为空", rmsg: "请输入合法广告名称"});
        $("#js_upload_add_form [name='adseo']").Validator({IsValidate: false, hmsg: "请输入广告SEO", regexp: /^[\s|\S]{0,256}$/, showok: false, style: {placement: "bottom"} , rmsg: "请输入合法广告SEO"});
        $("#js_upload_add_form [name='url']").Validator({hmsg: "请填写广告URL", regexp: /^[\s|\S]{0,256}$/, showok: false, style: {placement: "top"}, emsg: "广告URL不能为空", rmsg: "请输入合法广告URL"});
        $("#js_upload_add_form [name='priority']").Validator({hmsg: "请填写显示顺序", regexp: /^\d{1,3}$/, showok: false, style: {placement: "top"}, emsg: "显示顺序不能为空", rmsg: "请输入合法显示顺序"});
        $("#js_upload_add_form [name='startdate']").Validator({hmsg: "请选择起始时间", regexp: /^\d{4}\-\d{2}\-\d{2}$/, showok: false, style: {placement: "top"}, emsg: "起始时间不能为空", rmsg: "起始时间不合法"});
        $("#js_upload_add_form [name='enddate']").Validator({hmsg: "请选择结束时间", regexp: /^\d{4}\-\d{2}\-\d{2}$/, showok: false, style: {placement: "top"}, emsg: "结束时间不能为空", rmsg: "结束时间不合法", fn: function (v, tag) {
            var val1 = $("#js_upload_add_form [name='startdate']").val().replace(/-/g, "/");
            var val2 = v.replace(/-/g, "/");
            return ((Date.parse(val1) - Date.parse(val2))<0);
        }, fnmsg: "活动结束时间必须大于起始时间！"});
    })();
    /**
     * 保存**/
    $scope.save = function(){
        var saveBtn = $("#saveBtn"), form = $("#js_upload_add_form");
        //if(!$scope.form.adname || !$scope.form.adseo || !$scope.form.url || !$scope.form.priority || !$scope.form.startdate || !$scope.form.enddate){
        //    return false;
        //};
        if(false === tools.Validator($("#js_upload_add_form [name='adname'], #js_upload_add_form [name='adseo'], #js_upload_add_form [name='url'], #js_upload_add_form [name='priority'], #js_upload_add_form [name='startdate'], #js_upload_add_form [name='enddate']"))) return false;
        if(!$scope.img.name){
            if(!$scope.form.adphoto){
                return alert("请选择上传图片!");
            }else if(!(/\.(jpg|jpeg|png|bmp)$/).test($scope.form.adphoto.name)){
                return alert("您上传的图片格式不对!");
            };
        };
        if(!tools.ajaxLocked(saveBtn)) return;

        //tools.ajaxForm({
        //    "ele": form,
        //    "action": siteVar.serverUrl + "/xinghuocontent/uploadAd.shtml",
        //    onComplete: function(data){
        //        tools.ajaxOpened(saveBtn);
        //        $("#js_dialog_progress").modal("hide");
        //        if(!tools.interceptor(data)) return;
        //        if(data.success){
        //            alert("广告保存成功！");
        //            $state.go("xinghuocontent-ad");
        //        }
        //    },
        //    onStart: function () {
        //        //console.log(tools.getFormele({},form))
        //    }
        //});
        var data = new FormData(form[0]);
        $.ajax({
            url : siteVar.serverUrl + "/xinghuocontent/uploadAd.shtml",
            type:"POST",
            data : data,
            processData: false,
            contentType: false,
            success :function(data){
                tools.ajaxOpened(saveBtn);
                if(typeof data == "string"){
                    var data = JSON.parse(data);
                };
                $("#js_dialog_progress").modal("hide");
                if(!tools.interceptor(data)) return;
                if(data.success){
                    alert("广告保存成功！");
                    $state.go("xinghuocontent-ad");
                }else{
                    alert(data.msg)
                }
            }

        });

    };
}
