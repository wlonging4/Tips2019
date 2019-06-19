'use strict';
function caierDirectorController($scope,tools) {
    $.ajax({
        url: siteVar.serverUrl+'/xinghuopageapi/getMangdirector.json',
        method: 'GET'
    }).then(function(data){
        if(data.result == 'SUCCESS'){
            $scope.$apply(function(){
                $scope.userInfoSummary = data.appResData;
            });
        }
    });
    /**
     * [全站/公共导出文件]
     */
    $(".js_export").on("click", function () {
        tools.export(this);
    });
    /**
     * [财二理财经理管理/上传理财经理名录]
     * @param  {Object}        [description]
     * @param  {[type]}        [description]
     * @return {[type]}        [description]
     */
    $("#js_caier_director_upFile").on("click", function(){
        var postUrl = "/caiermanager/import.shtml";
        var self = this;
        if(!tools.ajaxLocked(self)) return;
        // tools.ajaxForm({
        //     "ele": $("#js_caier_director_upFile_form"),
        //     "action": siteVar.serverUrl + postUrl,
        //     onComplete: function(data){
        //         /**
        //          * @typedef {object} data
        //          * @property {array} data.resInfo
        //          */
        //         tools.ajaxOpened(self);
        //         $("#js_dialog_progress").modal("hide");
        //         if(!tools.interceptor(data)) return;
        //         if(data.success){
        //             alert(data.data.resInfo);
        //             return window.location.reload();
        //         }
        //     }
        // });
        var data = new FormData($("#js_caier_director_upFile_form")[0]);
        $.ajax({
            url : siteVar.serverUrl + postUrl,
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
                    alert(data.data.resInfo);
                    return window.location.reload();
                }
            }

        });
    });
    $("#js_caier_director_down_tem").on("click", function(){
        $("#js_caier_director_upFile_form").attr("action", $(this).attr("action")).submit();
    });
}
