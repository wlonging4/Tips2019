'use strict';
function report($scope, $http, tools) {
    var formDom = $("#js_caier_report_forms_form");
    $scope.form = {};
    $scope.select = {};
    $http({
        method: "POST",
        url: siteVar.serverUrl + "/xinghuopageapi/getCarErReport.json"
    }).success(function(data, status) {
        if(data.result != 'SUCCESS') {
            alert("获取报表信息失败，请与管理员联系。" + data.msg);
            return;
        };
        var res = data.appResData;
        $scope.updateTime = res.lastUpdate;
        $scope.count = res.count;
        $scope.form.hour = res.hourSelect;
        $scope.form.minute = res.minuteSelect;
        $scope.select.hour = res.hourList;
        $scope.select.minute = res.minuteList;

    }).error(function(data, status) {
        alert("获取报表信息失败，请与管理员联系。");
        return;
    });

    $scope.upload = function(){
        var url = "/caierreport/updateEmail.shtml", upload = $("#js_caier_report_forms_upFile");
        if(!tools.ajaxLocked(upload)) return;
        // tools.ajaxForm({
        //     "ele": formDom,
        //     "action": siteVar.serverUrl + url,
        //     onComplete: function(data){
        //         tools.ajaxOpened(upload);
        //         $("#js_dialog_progress").modal("hide");
        //         if(!tools.interceptor(data)) return;
        //         if(data.success){
        //             alert(data.data.resInfo);
        //             return window.location.reload();
        //         }
        //     }
        // });
        var data = new FormData(formDom[0]);
        $.ajax({
            url : siteVar.serverUrl + url,
            type:"POST",
            data : data,
            processData: false,
            contentType: false,
            success :function(data){
                if(typeof data == "string"){
                    var data = JSON.parse(data);
                };
                tools.ajaxOpened(upload);
                $("#js_dialog_progress").modal("hide");
                if(!tools.interceptor(data)) return;
                if(data.success){
                    alert(data.data.resInfo);
                    return window.location.reload();
                }
            }

        });
    };
    $scope.downloadTemplate = function(){
        var downloadBtn = $("#js_report_forms_down_tem"), url = downloadBtn.attr("data-href"), previousUrl = formDom.attr("action")
        formDom.attr("action", url).submit();
        formDom.attr({"action": previousUrl});
    };
    $scope.setTime = function(){
        var setBtn = $("#js_caier_report_forms_site");
        var data = {
            hour: $scope.form.hour,
            minute: $scope.form.minute
        };
        if(!tools.ajaxLocked(setBtn)) return;

        $.ajax({
            type: "post",
            url: siteVar.serverUrl + "/caierreport/updateEmailTime.shtml",
            data: data,
            dataType: "json",
            success: function(data){
                tools.ajaxOpened(setBtn);
                if(!tools.interceptor(data)) return;
                if(data.success){
                    alert(data.msg);
                    return window.location.reload();
                }

            },
            error: function(err){
                tools.ajaxOpened(setBtn);
                tools.ajaxError(err);
            }
        });
    };
    $scope.export = function(e){
        var currentDom = $(e.currentTarget), url = currentDom.attr("data-href"), previousUrl = formDom.attr("action");
        formDom.attr({"action": siteVar.serverUrl + url}).submit();
        formDom.attr({"action": previousUrl, "method": ""});
    };

    ;(function(){
        $(".js_export").on("click", function () {
            tools.export(this);
        });
    })();


}
