'use strict';
function xinghuohuodongAddhuodongController($scope,getSelectListFactory,tools,$location) {
    $scope.form = {
        awardtype: 1
    };
    $scope.select = {};
    $scope.action = {condition:false,edit:false};//condition活动对象是否是理财经理，edit状态是否可编辑
    if($location.url().indexOf("?") <0){
        alert("缺少参数");
        return ;
    }
    var urlStr = $location.url().split("?")[1];
    var urlObj = tools.serializeUrl(urlStr);
    if(urlObj.participantway){
        $scope.participantway = urlObj.participantway;
        switch (urlObj.participantway) {
            case "0":
                $scope.addNormal = false;
                $scope.isShow = true;
                $scope.form.activityobject = 0;
                $scope.participantwaystr = "正常参与活动";
                break;
            case "1":
                $scope.addNormal = true;
                $scope.form.activityobject = 2;
                $scope.participantwaystr = "生成编码激活";
                break;
            case "2":
                $scope.addNormal = true;
                $scope.isShow = true;
                $scope.form.activityobject = 2;
                $scope.participantwaystr = "理财经理申请";
                break;
            case "3":
                $scope.addNormal = true;
                $scope.form.activityobject = 2;
                $scope.participantwaystr = "直接领用红包";
                break;
        }
    };
    /*
     获取枚举类型
     */
    var selectList = getSelectListFactory.getSelectList(['activity_object','activity_participant','activity_channel','biz_sys_route']);
    selectList.then(function(data){
        $scope.select.activityobject = data.appResData.retList[0].activity_object;
        $scope.select.participant = data.appResData.retList[1].activity_participant;
        $scope.select.activitychannel = data.appResData.retList[2].activity_channel;
        //过滤业务系统来源
        var arr = [];
        var bizSysRoute = data.appResData.retList[3].biz_sys_route;
        for(var i in bizSysRoute){
            if(i != 4){
                arr.push(bizSysRoute[i]);
            }
        }
        $scope.select.bizSysRoute = arr;
        arr = [];
        $scope.form.status = 0 ;
        console.log(urlObj.activityid)
        if(urlObj.activityid) {
            $("[name='activityid']").prop("disabled",false).val(urlObj.activityid);
            $scope.action.edit = true;
            var activeInfo = getSelectListFactory.getHuodong(urlObj,'/xinghuopageapi/getHuoDongInfo.json');
            activeInfo.then(function(data){
                if(data.result == "SUCCESS"){
                    var activeResult = data.appResData;
                    $.extend($scope.form, activeResult.activity);
                    if($scope.form.bizSysRoute !==0 && !$scope.form.bizSysRoute){
                        delete $scope.form.bizSysRoute;
                    }
                    $scope.action.activityobject();
                    $scope.participantwaystr = activeResult.activity.participantwaystr;
                    $scope.participantway = activeResult.activity.participantway;
                    switch (activeResult.activity.participantway) {
                        case 0:
                            $scope.addNormal = false;
                            $scope.isShow = true;
                            break;
                        case 1:
                            $scope.addNormal = true;
                            break;
                        case 2:
                            $scope.addNormal = true;
                            $scope.isShow = true;
                            break;
                        case 3:
                            $scope.addNormal = true;
                            break;
                    }
                    $scope.form.starttimestr = tools.toJSDate(activeResult.activity.starttime);
                    $scope.form.endtimestr = tools.toJSDate(activeResult.activity.endtime);
                    //初始化活动渠道、参与用户
                    var isIn = function(str,arr){
                        for(var i in arr){
                            if(str == 'SUCC_DEAL_COUNT_COMPARE' || str == 'SINGLE_DEAL_AMOUNT_COMPARE'){
                                if(arr[i].indexOf(str) > -1) {
                                    return true;
                                }
                            }else{
                                if(arr[i] == str) {
                                    return true;
                                }
                            }
                        }
                    };
                    var resetCheckBox = function(arrObj){
                        var name,prop,arr;
                        for(var i in arrObj){
                            prop = arrObj[i][1];
                            name = arrObj[i][0];
                            if(!!activeResult.activity[prop]){
                                arr = activeResult.activity[prop].split(",");
                                $("[name='"+name+"']").each(function(){
                                    var str;
                                    if(name == 'conditionsch'){
                                        str = $(this).val().split("-")[0];
                                    }else{
                                        str = $(this).val();
                                    }
                                    if(isIn(str,arr)) {
                                        $(this).trigger("click");
                                        //setTimeout(function(){
                                        //    $(this).trigger("click");
                                        //},300)
                                    }
                                });
                            }
                        }
                    };
                    setTimeout(function(){
                        resetCheckBox([['activitychannelch','activitychannel'],['participantch','participant'],['conditionsch','conditions']]);
                    },100);
                    if(activeResult.activity.conditions && activeResult.activity.conditions.indexOf("SUCC_DEAL_COUNT_COMPARE")>-1){
                        var temp = activeResult.activity.conditions.split("SUCC_DEAL_COUNT_COMPARE")[1].split("-");
                        $scope.form.SUCC_DEAL_COUNT_COMPARE_SIGN = temp[1];
                        $scope.form.SUCC_DEAL_COUNT_COMPARE_NUM = temp[2].split(",")[0];
                    }
                    if(activeResult.activity.conditions && activeResult.activity.conditions.indexOf("SINGLE_DEAL_AMOUNT_COMPARE")>-1){
                        var temp = activeResult.activity.conditions.split("SINGLE_DEAL_AMOUNT_COMPARE")[1].split("-");
                        $scope.form.SINGLE_DEAL_AMOUNT_COMPARE_NUM = temp[1];
                    }
                    if(activeResult.activity.times){
                        if(activeResult.activity.times.indexOf("PERDAY")>-1){
                            $scope.form.times = activeResult.activity.times.split("-")[0];
                            $scope.form.PERDAY_NUM = activeResult.activity.times.split("-")[1];
                        }else if(activeResult.activity.times.indexOf("PERIOD")>-1){
                            $scope.form.times = activeResult.activity.times.split("-")[0];
                            $scope.form.PERIOD_NUM = activeResult.activity.times.split("-")[1];
                        }else {
                            $scope.form.times = "ALL";
                        }
                        $("[name='times']").each(function(){
                            if($(this).val() == $scope.form.times){
                                var that = $(this);
                                setTimeout(function(){
                                    that.trigger("click");
                                },100);
                            }
                        })
                    }
                    //设置指定产品
                    var subproductid = activeResult.activity.subproductid;
                    if(subproductid && subproductid.length>0){
                        $scope.select.productinfo = activeResult.productinfo;
                        setTimeout(function(){
                            setProduct(data.appResData.productinfo);
                        },300);
                    }else{
                        var prolist = getSelectListFactory.getHuodong({"participantway":0},'/xinghuopageapi/getHuoDongInfo.json');
                        prolist.then(function(data){
                            if(data.result == "SUCCESS"){
                                $scope.select.productinfo = data.appResData.productinfo;
                                setTimeout(function(){
                                    setProduct(data.appResData.productinfo);
                                },300)
                            }
                        });
                    }
                }else{
                    alert(data.errMsg);
                    setTimeout(function(){
                        window.history.back(-1);
                    },100);
                }
            })
        }else{
            $scope.form.times = "ALL";
            getSelectListFactory.getHuodong({"participantway":0},'/xinghuopageapi/getHuoDongInfo.json').then(function(data){
                if(data.result == "SUCCESS"){
                    $scope.select.productinfo = data.appResData.productinfo;
                    setTimeout(function(){
                        setProduct(data.appResData.productinfo);
                    },300)
                }
            });
        }
    });
    var setProduct = function(str){
        try{
            var data = str.split("},{");
            //var data =  $('#multi_select').attr("productinfo").split("},{");
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
        activityobject: function(){
            if($scope.form.activityobject == 1){
                $scope.action.condition = true;
            }else{
                $scope.action.condition = false;
            }
        },
        save: function(){
            if(false === tools.Validator($("#js_add_huodong_form [name='activityname'], #js_add_huodong_form [name='starttimestr'], #js_add_huodong_form [name='endtimestr'], #js_add_huodong_form [name='introducer']"))) return;
            var partType = $scope.participantway, hasParter, conditionsch;
            if(partType == 0){
                /**
                 * [正常参与活动->验证]
                 * @type {String}
                 */

                $("#js_add_huodong_form [name='participantch']").each(function (i, e) {
                    if(e.checked) return hasParter = true;
                });
                if(!hasParter) return alert("请选择参与用户！");
                $("#js_add_huodong_form [name='conditionsch']").each(function (i, e) {
                    if(e.checked) return conditionsch = true;
                });
                if(!conditionsch) return alert("请选择参与条件！");
                if( $("#js_add_huodong_form #js_valid_product")[0].checked && !$("#js_add_huodong_form #multi_select [name='subproductids']").val() ) return alert("请选择产品！");
                if( $("#js_add_huodong_form #js_valid_deal_count")[0].checked && !$("#js_add_huodong_form [name='SUCC_DEAL_COUNT_COMPARE_SIGN']").val() ) return alert("请选择成功交易笔数范围！");
                if( $("#js_add_huodong_form #js_valid_deal_count")[0].checked && !$("#js_add_huodong_form [name='SUCC_DEAL_COUNT_COMPARE_NUM']").val() ) return alert("交易笔数不能为空！");
                if( $("#js_add_huodong_form #js_valid_deal_amount")[0].checked && !$("#js_add_huodong_form [name='SINGLE_DEAL_AMOUNT_COMPARE_NUM']").val() ) return alert("单笔交易金额不能为空！");
                if( $("#js_add_huodong_form #js_valid_perday")[0].checked && !$("#js_add_huodong_form [name='PERDAY_NUM']").val() ) return alert("每个ID天数不能为空！");
                if( $("#js_add_huodong_form #js_valid_period")[0].checked && !$("#js_add_huodong_form [name='PERIOD_NUM']").val() ) return alert("活动期间次数不能为空！");

            }else if(partType == 1 || partType == 3){
                /**
                 * [生成编码激活、直接领用红包->验证]
                 * @type {String}
                 */
            }else if(partType == 2){
                /**
                 * [理财经理申请->验证]
                 * @type {String}
                 */
                $("#js_add_huodong_form [name='participantch']").each(function (i, e) {
                    if(e.checked) return hasParter = true;
                });
                if(!hasParter) return alert("请选择参与用户！");
                $("#js_add_huodong_form [name='conditionsch']").each(function (i, e) {
                    if(e.checked) return conditionsch = true;
                });
                if(!conditionsch) return alert("请选择参与条件！");
                if( $("#js_add_huodong_form #js_valid_perday")[0].checked && !$("#js_add_huodong_form [name='PERDAY_NUM']").val() ) return alert("每个ID天数不能为空！");
                if( $("#js_add_huodong_form #js_valid_period")[0].checked && !$("#js_add_huodong_form [name='PERIOD_NUM']").val() ) return alert("活动期间次数不能为空！");
            }
            $("#js_dialog_progress").modal({backdrop: 'static', keyboard: false});
            //tools.ajaxForm({
            //    "ele": $("#js_add_huodong_form"),
            //    "action": "/xinghuohuodong/modifyHuodong.shtml",
            //    onComplete: function(data){
            //        tools.ajaxOpened(self);
            //        $("#js_dialog_progress").modal("hide");
            //        if(!tools.interceptor(data)) return;
            //        if(data.success) return window.location.href = "#/xinghuohuodong-huodong.html";
            //    }
            //});
            var data = new FormData($("#js_add_huodong_form")[0]);
            $.ajax({
                url : siteVar.serverUrl + "/xinghuohuodong/modifyHuodong.shtml",
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
                    if(data.success) return window.location.href = "#/xinghuohuodong-huodong.html";
                }

            });
        },
        load: function(){
            ComponentsPickers.init();
            setTimeout(function(){
                Metronic.initComponents();
            },300)
        }
    };
    (function(){
        $("body").on("click","#js_add_or_edit_body",function(){
            tools.Validator($("#js_add_huodong_form [name='starttimestr'], #js_add_huodong_form [name='endtimestr']"));
        });
        //validator
        $("#js_add_huodong_form [name='activityname']").Validator({hmsg: "请填写活动名称", regexp: /^[\s|\S]{0,256}$/, showok: false, style: {placement: "top"}, emsg: "活动名称不能为空", rmsg: "请输入合法活动名称"});
        $("#js_add_huodong_form [name='starttimestr']").Validator({hmsg: "请选择起始时间", regexp: /^\d{4}\-\d{2}\-\d{2}\s\d{2}\:\d{2}\:\d{2}$/, showok: false, style: {placement: "top"}, emsg: "起始时间不能为空", rmsg: "起始时间不合法"});
        $("#js_add_huodong_form [name='endtimestr']").Validator({hmsg: "请选择结束时间", regexp: /^\d{4}\-\d{2}\-\d{2}\s\d{2}\:\d{2}\:\d{2}$/, showok: false, style: {placement: "top"}, emsg: "结束时间不能为空", rmsg: "结束时间不合法", fn: function (v, tag) {
            var val1 = $("#js_add_huodong_form [name='starttimestr']").val().replace(/-/g, "/");
            var val2 = v.replace(/-/g, "/");
            return ((Date.parse(val1) - Date.parse(val2))<0);
        }, fnmsg: "活动截至日期必须大于起始日期！"});
        $("#js_add_huodong_form [name='introducer']").Validator({IsValidate: false,hmsg: "请填写活动说明", regexp: /^[\s|\S]{0,256}$/, showok: false, style: {placement: "top"}, rmsg: "合法活动说明不合法"});


        $("#js_add_huodong_form [name='SUCC_DEAL_COUNT_COMPARE_NUM']").Validator({IsValidate: false,hmsg: "请填写成功交易笔数", regexp: /^\d+$/, showok: false, style: {placement: "top"}, rmsg: "成功交易笔数不合法"});
        $("#js_add_huodong_form [name='SINGLE_DEAL_AMOUNT_COMPARE_NUM']").Validator({IsValidate: false,hmsg: "请填写单笔交易金额", regexp: /^\d+$/, showok: false, style: {placement: "top"}, rmsg: "单笔交易金额不合法"});

        $("#js_add_huodong_form [name='PERDAY_NUM']").Validator({IsValidate: false,hmsg: "请填写每个ID天数", regexp: /^\d+$/, showok: false, style: {placement: "top"}, rmsg: "每个ID天数不合法"});
        $("#js_add_huodong_form [name='PERIOD_NUM']").Validator({IsValidate: false,hmsg: "请填写活动期间次数", regexp: /^\d+$/, showok: false, style: {placement: "top"}, rmsg: "活动期间次数不合法"});

    })();
}