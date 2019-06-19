'use strict';
function editScreen($scope, $http, $location, $timeout, $q, tools, $window, $state) {
    $scope.select = {
        communication:{
            "0":"电话",
            "1":"邮件",
            "2":"微信",
            "3":"QQ",
            "4":"视频",
            "5":"面谈",
            "6":"其他（请备注）"
        },
        impression:{
            "0":"需要理财师对接",
            "1":"客户忙需要时间另约",
            "2":"发资料先了解",
            "3":"宜信同事",
            "4":"不需要",
            "5":"客户已有绑定理财师",
            "6":"贷款需求",
            "7":"小额投资",
            "8":"无人接听",
            "9":"交流障碍",
            "10":"无法取得联系，放弃",
            "11":"空号",
            "12":"挂断/网络繁忙",
            "13":"财富管理同行",
            "14":"信贷同行"
        },
        access:{
            "0":"网络广告",
            "1":"影视植入",
            "2":"电视广播广告",
            "3":"户外广告",
            "4":"实体店面",
            "5":"报刊杂志",
            "6":"朋友推荐",
            "7":"贷款渠道",
            "8":"三方应用市场",
            "9":"其他（请备注）"
        }
    };
    $scope.info = {
        "clueId":"",
        "userName":"",
        "userMobile":"",
        "certificationTime":"",
        "channel":"",
        "district":"",
        "city":"",
        "clueType":"",
        "appointProd":"",
        "appointTime":"",
        "orderStatus":"",
        "loginStatus":"",

        "screenCommuDetail":{
            "firstScreenFirstRemind":"",
            "firstScreenSecondRemind":"",
            "firstScreenThirdRemind":""
        }
    };
    $scope.form = {
        "firstScreenUser":"",
        "isTrans":0,
        "screenCommuDetail":{
            "firstScreenFirstDate":"",
            "firstScreenFirstBegintime":"",
            "firstScreenFirstEndtime":"",
            "firstScreenFirstWay":"",
            "firstScreenFirstLab":"",
            "firstScreenFirstRemind":"",
            "firstScreenFirstChannel":"",
            "firstScreenFirstNote":"",

            "firstScreenSecondDate":"",
            "firstScreenSecondBegintime":"",
            "firstScreenSecondEndtime":"",
            "firstScreenSecondWay":"",
            "firstScreenSecondLab":"",
            "firstScreenSecondRemind":"",
            "firstScreenSecondChannel":"",
            "firstScreenSecondNote":"",

            "firstScreenThirdDate":"",
            "firstScreenThirdBegintime":"",
            "firstScreenThirdEndtime":"",
            "firstScreenThirdWay":"",
            "firstScreenThirdLab":"",
            "firstScreenThirdRemind":"",
            "firstScreenThirdChannel":"",
            "firstScreenThirdNote":"",


            "firstScreenFilterResLab":"",
            "firstScreenContact":"",
            "firstScreenWechat":"",
            "firstScreenChannel":"",
            "firstScreenNote":"",

            firstScreenIsRead: 1
        }

    };

    /**
     * 已离职的理财师
     * **/

    $scope.financialShow = true;

    /**
     * 是否能保存
     * **/
    $scope.isableSave = "btn btn-success btn-md";
    /**
     * 获取用户基本信息
     * **/
    var search = $location.$$search;
    if(search.clueId){


        $q.all([$http({
            method: "GET",
            url: siteVar.serverUrl + "customerClue/queryCustomerClueByClueId.json?clueId=" + search.clueId,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
            }
        }), $http({
            method: "GET",
            url: siteVar.serverUrl + "customerClue/loadUserByRole.json?type=customer-clue-financial",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
            }
        })]).then(function(dataArr){

            $scope.info = $.extend(true,$scope.info, dataArr[0].data.data);
            $scope.form = $.extend($scope.form, dataArr[0].data.data);

            if(!dataArr[0].data.success){
                alert(dataArr[0].data.msg);
            };
            if(!dataArr[1].data.success){
                alert(dataArr[1].data.msg);
            };

            if($scope.form.isTrans == 1){
                $scope.isableSave = "btn btn-md disabled";
            };
            if(dataArr[1].data.data && dataArr[1].data.data.list && dataArr[1].data.data.list.length > 0){
                $scope.select.financials = dataArr[1].data.data.list;
                 var len = dataArr[1].data.data.list.length;
                for(var i = 0; i < len; i++){
                    var item = dataArr[1].data.data.list[i];
                    if(!$scope.form.financial){
                        $scope.financialShow = false;
                        break;
                    }else{
                        if(item.realname == $scope.form.financial){
                            $scope.financialShow = false;
                            break;
                        }
                    }
                };

            };
            $timeout(function(){
                if($scope.form.screenCommuDetail.firstScreenContact && $scope.form.screenCommuDetail.firstScreenContact.length > 0){
                    var firstScreenContact = $scope.form.screenCommuDetail.firstScreenContact;

                    var multiSelect = $("#multi_select"), checkboxs = multiSelect.find("[type='checkbox']"), textInput = multiSelect.find("[type='text']"), len = checkboxs.length, num = 0;
                    for(var i = 0; i < len; i++){
                        var checkboxVal = checkboxs.eq(i).val(), checkHtml = $scope.select.communication[checkboxVal];
                        if(firstScreenContact.indexOf(checkHtml) > -1){
                            checkboxs.eq(i).prop("checked", true).uniform();
                            num ++;
                        };
                    };
                    if(num == len-1){
                        checkboxs.eq(0).prop("checked", true).uniform();
                    };
                    textInput.val(firstScreenContact);
                };
                var screenForm = $("#screenForm"), transferForm = $("#transferForm");
                screenForm.find("input[type='radio']").uniform();
                transferForm.find("input[type='radio']").uniform();

            }, 0);

        });

        //沟通标签为无人接听

        $scope.$watch('form.screenCommuDetail.firstScreenFirstLab', function(newValue, oldValue){
            if(newValue == "无人接听" && !$scope.form.screenCommuDetail.firstScreenFirstRemind){
                var now = (new Date()).getTime();
                $scope.form.screenCommuDetail.firstScreenFirstRemind = tools.toJSDate(now + 2*60*60*1000);
            }
        });
        $scope.$watch('form.screenCommuDetail.firstScreenSecondLab', function(newValue, oldValue){
            if(newValue == "无人接听" && !$scope.form.screenCommuDetail.firstScreenSecondRemind){
                var now = (new Date()).getTime();
                if($scope.form.screenCommuDetail.firstScreenFirstLab == "无人接听"){
                    $scope.form.screenCommuDetail.firstScreenSecondRemind = tools.toJSDate(now + 24*60*60*1000);
                }else{
                    $scope.form.screenCommuDetail.firstScreenSecondRemind = tools.toJSDate(now + 2*60*60*1000);
                };
            };
        });
        $scope.$watch('form.screenCommuDetail.firstScreenThirdLab', function(newValue, oldValue){
            if(newValue == "无人接听" && !$scope.form.screenCommuDetail.firstScreenThirdLab){
                var now = (new Date()).getTime();
                if($scope.form.screenCommuDetail.firstScreenSecondLab == "无人接听"){
                    $scope.form.screenCommuDetail.firstScreenThirdRemind = tools.toJSDate(now + 24*60*60*1000);
                }else{
                    $scope.form.screenCommuDetail.firstScreenThirdRemind = tools.toJSDate(now + 2*60*60*1000);
                };
            };
        });


    };


    $scope.action = {
        flag:true,
        transferFlag:true,
        "saveScreen":function(){
            var self = this, multiSelect = $("#multi_select"), textInput = multiSelect.find("[type='text']"), screenForm = $("#screenForm"), firstScreenWechat = screenForm.find("input[name='screenCommuDetail.firstScreenWechat']:checked");
            $scope.form.screenCommuDetail.firstScreenContact = textInput.val();
            $scope.form.screenCommuDetail.firstScreenWechat = firstScreenWechat.val();
            $scope.form.screenCommuDetail.firstScreenClueId = search.clueId;

            var infoData = $scope.info.screenCommuDetail, formData = $scope.form.screenCommuDetail;

            if((infoData.firstScreenFirstRemind != formData.firstScreenFirstRemind) || (infoData.firstScreenSecondRemind != formData.firstScreenSecondRemind) || (infoData.firstScreenThirdRemind != formData.firstScreenThirdRemind)){
                $scope.form.screenCommuDetail.firstScreenIsRead = 0;
            }else{
                $scope.form.screenCommuDetail.firstScreenIsRead = 1;
            };
            if(self.flag){
                self.flag == false;
                $http({
                    method: "POST",
                    url: siteVar.serverUrl + "customerClue/updateScreenCommuDetail.json",
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
                    },
                    data:$.param($scope.form.screenCommuDetail)
                }).success(function(data, status) {

                    alert(data.msg)

                    self.flag == true;
                }).error(function(data, status) {
                    self.flag == true;
                    alert("修改线索客户基本信息失败，请与管理员联系。");
                    return;
                });
            }

            return false;
        },
        "transfer":function(){
            var self = this,
                multiSelect = $("#multi_select"),
                textInput = multiSelect.find("[type='text']"),
                screenForm = $("#screenForm"),
                firstScreenWechat = screenForm.find("input[name='screenCommuDetail.firstScreenWechat']"),
                transferForm = $("#transferForm"),
                financial = transferForm.find("input[type='radio']:checked");
            if(!$window.confirm("转交理财师后不能修改初筛沟通记录，是否确定转交？")){
                financial.prop("checked", false).uniform();
                return ;
            };
            if(!$scope.form.screenCommuDetail.firstScreenFilterResLab || !textInput.val() || !firstScreenWechat.val()){
                return alert("请完善初筛沟通结果！");
            };
            if(self.transferFlag){
                $http({
                    method: "POST",
                    url: siteVar.serverUrl + "customerClue/updateCustomerClue.json",
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
                    },
                    data:$.param({
                        financial:financial.attr("userName"),
                        financialId:financial.val(),
                        clueId:search.clueId
                    })
                }).success(function(data, status) {

                    alert(data.msg);
                    $state.go("linkupRecord-adminClientRecord");
                    self.transferFlag == true;
                }).error(function(data, status) {
                    self.transferFlag == true;
                    alert("转交理财师失败，请与管理员联系。");
                    return;
                });
            }

        }
    };
}
