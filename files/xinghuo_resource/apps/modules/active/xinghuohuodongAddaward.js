'use strict';
function xinghuohuodongAddawardController($scope,getSelectListFactory,tools,$location,$timeout, $window) {
    $scope.form = {
        subproductid: 'SOME',
        'fullcutamountck': 'ALL',
        'awardtype': 1,
        'bizSysRoute':0
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
    };
    $scope.activityid = urlObj.activityid;
    /*
     获取枚举类型
     */
    var selectList = getSelectListFactory.getSelectList(['activity_channel','biz_sys_route']);
    selectList.then(function(data){
        $scope.select.activitychannel = data.appResData.retList[0].activity_channel;
        //过滤业务系统来源
        var arr = [];
        var bizSysRoute = data.appResData.retList[1].biz_sys_route;
        for(var i in bizSysRoute){
            if(i != 4){
                arr.push(bizSysRoute[i]);
            }
        }
        $scope.select.bizSysRoute = arr;
        arr = [];
    });
    var awardInfo = getSelectListFactory.getHuodong(urlObj,'/xinghuopageapi/getAwardEdit.json');
    awardInfo.then(function(data){
        if(data.result == "FAILED"){
            alert(data.errMsg);
            return;
        }
        $scope.select.prizeid = data.appResData.awards;
        setProduct(data.appResData.productinfo);
        /*
         如果是编辑状态
         */
        if(urlObj.awardid){
            $scope.awardid = urlObj.awardid;
            $.extend($scope.form,data.appResData.activityaw);
            //初始化使用渠道
            var isIn = function(str,arr){
                for(var i in arr){
                    if(arr[i] == str) {
                        return true;
                    }
                }
            };
            var resetCheckBox = function(arrObj){
                var name,prop,arr;
                for(var i in arrObj){
                    prop = arrObj[i][1];
                    name = arrObj[i][0];
                    if(!!data.appResData.activityaw[prop]){
                        arr = data.appResData.activityaw[prop].split(",");
                        $("[name='"+name+"']").each(function(){
                            var str;
                            str = $(this).val();
                            if(isIn(str,arr)) {
                                $(this).trigger("click");
                            }
                        });
                    }
                }
            };

            if(data.appResData.activityaw.subproductid !== "ALL") {
                $scope.form.subproductid = "SOME";
            }
            if(data.appResData.activityaw.fullcutamount) {
                $scope.form.fullcutamountck = "";
            };
            $timeout(function(){
                resetCheckBox([['usechannelch','usechannel']]);
                $("#js_award_add_form").find("input[type='radio']").uniform();
            },100);
        }
    });
    var setProduct = function(str){
        try{
            var data = str.split("},{");
            var arr = [], result = [], temp;
            for(var i in data){
                if(i == 0){
                    arr.push(data[i]+"}");
                }else if(i<data.length-1){
                    arr.push("{"+data[i]+"}");
                }else{
                    arr.push("{"+data[i]);
                }
            }
            for(var i in arr){
                temp = arr[i].replace(/'/g, '"');
                try{
                    result.push(JSON.parse(temp));
                }catch(e){

                }
            }
            $('#multi_select').multiSel({
                'data': result,
                'name': 'subproductids'
            });
        }catch(e){
            console.log(e);
        }
    };
    $scope.action = {
        save: function(){
            if(false == tools.Validator($("#js_award_add_form [name='awardname'], #js_award_add_form [name='introducer'], #js_award_add_form [name='totalnumber']"))) return;
            if($("#js_award_add_form #js_productid_some")[0].checked && !$("#js_award_add_form [name='subproductids']").val()) return alert("请选择产品！");
            if(!$("#js_award_add_form [name='prizeid']").val()) return alert("请选择奖品！");
            var hasusechannel;
            $("#js_award_add_form [name='usechannelch']").each(function (i, e) {
                if(e.checked) return hasusechannel = true;
            });
            if(!hasusechannel) return alert("请选择使用渠道！");
            if(($scope.form.fullcutamountck == 'ALL') && !$window.confirm("使用金额不限？")){
                return false;
            };
            if($scope.form.fullcutamountck == '' && !$scope.form.fullcutamount){
                return alert("请填写满减金额！")
            }
            var self = this;
            if(!tools.ajaxLocked(self)) return;
            var data = new FormData($("#js_award_add_form")[0]);
            $.ajax({
                url : siteVar.serverUrl + "/xinghuohuodong/modifyAward.shtml",
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
                    if(data.success) return history.back(-1);
                }

            });
            //tools.ajaxForm({
            //    "ele": $("#js_award_add_form"),
            //    "action": siteVar.serverUrl + "/xinghuohuodong/modifyAward.shtml",
            //    onComplete: function(data){
            //        tools.ajaxOpened(self);
            //        if(!tools.interceptor(data)) return;
            //        if(data.success) return history.back(-1);
            //    }
            //});
        },
        load: function(){
            setTimeout(function(){
                Metronic.initComponents();
            },300)
        }
    };
    (function(){
        $("#js_award_add_form [name='awardname']").Validator({hmsg: "请填写奖项名称", regexp: /^[\s|\S]{1,256}$/, showok: false, style: {placement: "top"}, emsg: "奖项名称不能为空", rmsg: "奖项名称不合法"});
        $("#js_award_add_form [name='introducer']").Validator({IsValidate: false, hmsg: "请填写活动说明", regexp: /^[\s|\S]{0,256}$/, showok: false, style: {placement: "top"}, rmsg: "合法活动说明不合法"});
        $("#js_award_add_form [name='totalnumber']").Validator({hmsg: "请填写发放奖品总数", regexp: /^\d+$/, showok: false, style: {placement: "bottom"}, emsg: "发放奖品总数不能为空", rmsg: "发放奖品总数不合法"});
    })();
}