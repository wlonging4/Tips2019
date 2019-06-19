'use strict';
function structureEdit($scope, $timeout, $state, $http, $location, getSelectListFactory, tools) {
    $scope.form = {};
    $scope.select = {};
    $scope.img = {};
    $scope.action = {};
    var params = $location.$$search.params, form = $("#js_add_huodong_form");
    if(params){
        params = JSON.parse(params);
        var id = params.id;
        form.find("[name='id']").val(id);
        $scope.form.structurename = params.structurename;
        $scope.form.starttimestr = params.starttime ? tools.toJSDate(params.starttime) : '';
        $scope.form.endtimestr = params.endtime ? tools.toJSDate(params.endtime) : '';
        $scope.form.promotionurl = params.promotionurl;
        $scope.form.floatingannualrate = params.floatingannualrate;
        $scope.form.structureremark = params.structureremark;
        $scope.form.subproductcode = params.subproductcode;
        $scope.form.publishtimestr = params.publishtime ? tools.toJSDate(params.publishtime) : '';
        $scope.form.resulttext = params.resulttext;
        $scope.img.href = params.resultimage;
        $scope.img.show = params.resultimage ? true : false;
        $scope.img.name = params.resultimage ? params.resultimage.substr(params.resultimage.lastIndexOf('/') + 1) : '';
    };

    getSelectListFactory.getSelectList(['ad_source']).then(function(data){
        $scope.select.source = data.appResData.retList[0].ad_source;
    }).then(function(){
            if(params){
                $scope.$applyAsync(function(){
                    $scope.form.source = params.source || '';
                });
            };
    });
    $scope.filerSource = function(e){
        return e.key != 4;
    };

    /**
     * 保存**/
    $scope.save = function(){
        if(!$scope.form.structurename || !$scope.form.starttimestr || !$scope.form.endtimestr){
            return false;
        };
        if($scope.form.floatingannualrate && !(/^(:?(:?\d+.\d+)|(:?\d+))$/).test($scope.form.floatingannualrate)){
            return alert("浮动收益率格式不正确！");
        };
        var self = $("#saveBtn");
        if(!tools.ajaxLocked(self)) return;
        //tools.ajaxForm({
        //    "ele": form,
        //    "action": siteVar.serverUrl + "/xinghuosite/saveStructure.shtml",
        //    onComplete: function(data){
        //        tools.ajaxOpened(self);
        //        if(!tools.interceptor(data)) return;
        //        if(data.success){
        //            alert(data.msg);
        //            $state.go('xinghuosite-structure')
        //        }
        //    }
        //});
        var data = new FormData(form[0]);
        $.ajax({
            url : siteVar.serverUrl + "/xinghuosite/saveStructure.shtml",
            type:"POST",
            data : data,
            processData: false,
            contentType: false,
            success :function(data){
                if(typeof data == "string"){
                    var data = JSON.parse(data);
                };
                tools.ajaxOpened(self);
                if(!tools.interceptor(data)) return;
                if(data.success){
                    alert(data.msg);
                    $state.go('xinghuosite-structure')
                }
            }

        });

    };
}
