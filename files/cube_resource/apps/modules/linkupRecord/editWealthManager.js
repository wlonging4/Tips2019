'use strict';
function editWealthManager($scope, $http, $location, $timeout, $state) {

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
            "0":"合格潜客",
            "1":"发资料先了解",
            "2":"客户忙需要花时间另约",
            "3":"宜信同事",
            "4":"不需要",
            "5":"贷款需求",
            "6":"财富管理同行",
            "7":"信贷同行",
            "8":"小额投资",
            "9":"无人接听",
            "10":"挂断/网络繁忙"
        },
        impressionResult:{
            "0":"合格潜客",
            "1":"疑似合格潜客",
            "2":"放弃（同行）",
            "3":"放弃（小额投资）",
            "4":"其他（请备注）"
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
        "firstScreenChannel":"",
        "firstScreenUser":"",
        "firstScreenTime":"",



        "screenCommuDetail":{
            "firstScreenFilterResLab":"",
            "firstScreenContact":"",
            "firstScreenWechat":"",
            "firstScreenWechatDesc":"",
            "firstScreenChannel":"",
            "firstScreenNote":""
        },
        "secondDistributionTime":"",
        "finanCommuDetail":{
            "secondScreenFirstRemind":"",
            "secondScreenSecondRemind":"",
            "secondScreenThirdRemind":""
        }
    };
    $scope.form = {



        "finanCommuDetail":{

            "secondScreenFirstDate":"",
            "secondScreenFirstBegintime":"",
            "secondScreenFirstEndtime":"",
            "secondScreenFirstWay":"",
            "secondScreenFirstLab":"",
            "secondScreenFirstRemind":"",
            "secondScreenFirstNote":"",

            "secondScreenSecondDate":"",
            "secondScreenSecondBegintime":"",
            "secondScreenSecondEndtime":"",
            "secondScreenSecondWay":"",
            "secondScreenSecondLab":"",
            "secondScreenSecondRemind":"",
            "secondScreenSecondNote":"",

            "secondScreenThirdDate":"",
            "secondScreenThirdBegintime":"",
            "secondScreenThirdEndtime":"",
            "secondScreenThirdWay":"",
            "secondScreenThirdLab":"",
            "secondScreenThirdRemind":"",
            "secondScreenThirdNote":"",

            "secondScreenFilterResLab":"",
            "secondScreenContact":"",
            "secondScreenWechat":"",
            "secondScreenNote":"",



            secondScreenIsRead:1
        }
    };

    /**
     * 获取用户基本信息
     * **/
    var search = $location.$$search;
    if(search.clueId){
        $http({
            method: "GET",
            url: siteVar.serverUrl + "customerClue/queryCustomerClueByClueId.json?clueId=" + search.clueId,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
            }
        }).success(function(data, status) {
            if(data.data){
                $scope.info = $.extend(true, $scope.info, data.data);
                $scope.form = $.extend($scope.form, data.data);
                $timeout(function(){

                    if($scope.form.finanCommuDetail.secondScreenContact && $scope.form.finanCommuDetail.secondScreenContact.length > 0){
                        var secondScreenContact = data.data.finanCommuDetail.secondScreenContact;
                        var multiSelect = $("#multi_select"), checkboxs = multiSelect.find("[type='checkbox']"), textInput = multiSelect.find("[type='text']"), len = checkboxs.length, num = 0;
                        for(var i = 0; i < len; i++){
                            var checkboxVal = checkboxs.eq(i).val(), checkHtml = $scope.select.communication[checkboxVal];
                            if(secondScreenContact.indexOf(checkHtml) > -1){
                                checkboxs.eq(i).prop("checked", true).uniform();
                                num ++;
                            };
                        };
                        if(num == len-1){
                            checkboxs.eq(0).prop("checked", true).uniform();
                        };
                        textInput.val(secondScreenContact);
                    };
                    var screenForm = $("#screenForm");
                    screenForm.find("input[type='radio']");
                    $("input[type='radio']").uniform();


                }, 0);
            };
        }).error(function(data, status) {
            alert("获取线索客户基本信息失败，请与管理员联系。");
            return;
        });

        //沟通标签为无人接听

        $scope.$watch('form.finanCommuDetail.secondScreenFirstLab', function(newValue, oldValue){
            if(newValue == "无人接听" && !$scope.form.finanCommuDetail.secondScreenFirstRemind){
                var now = (new Date()).getTime();
                $scope.form.finanCommuDetail.secondScreenFirstRemind = tools.toJSDate(now + 2*60*60*1000);
            }
        });
        $scope.$watch('form.finanCommuDetail.secondScreenSecondLab', function(newValue, oldValue){
            if(newValue == "无人接听" && !$scope.form.finanCommuDetail.secondScreenSecondRemind){
                var now = (new Date()).getTime();
                if($scope.form.finanCommuDetail.secondScreenFirstRemind == "无人接听"){
                    $scope.form.finanCommuDetail.secondScreenSecondRemind = tools.toJSDate(now + 24*60*60*1000);
                }else{
                    $scope.form.finanCommuDetail.secondScreenSecondRemind = tools.toJSDate(now + 2*60*60*1000);
                };
            };
        });
        $scope.$watch('form.finanCommuDetail.secondScreenThirdLab', function(newValue, oldValue){
            if(newValue == "无人接听" && !$scope.form.finanCommuDetail.firstScreenThirdLab){
                var now = (new Date()).getTime();
                if($scope.form.finanCommuDetail.secondScreenSecondLab == "无人接听"){
                    $scope.form.finanCommuDetail.secondScreenThirdRemind = tools.toJSDate(now + 24*60*60*1000);
                }else{
                    $scope.form.finanCommuDetail.secondScreenThirdRemind = tools.toJSDate(now + 2*60*60*1000);
                };
            };
        });

    };



    $scope.action = {
        flag:true,
        "save":function(){
            var self = this, multiSelect = $("#multi_select"), textInput = multiSelect.find("[type='text']"), screenForm = $("#screenForm"), secondScreenWechat = screenForm.find("input[name='finanCommuDetail.secondScreenWechat']:checked");
            $scope.form.finanCommuDetail.secondScreenContact = textInput.val();
            $scope.form.finanCommuDetail.secondScreenWechat = secondScreenWechat.val();
            $scope.form.finanCommuDetail.secondScreenClueId = search.clueId;
            var infoData = $scope.info.finanCommuDetail, formData = $scope.form.finanCommuDetail;
            if((infoData.secondScreenFirstRemind != formData.secondScreenFirstRemind) || (infoData.secondScreenSecondRemind != formData.secondScreenSecondRemind) || (infoData.secondScreenThirdRemind != formData.secondScreenThirdRemind)){
                $scope.form.finanCommuDetail.secondScreenIsRead = 0;
            }else{
                $scope.form.finanCommuDetail.secondScreenIsRead = 1;
            };
            if(self){
                self.flag == false;
                $http({
                    method: "POST",
                    url: siteVar.serverUrl + "customerClue/updateFinanCommuDetail.json",
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
                    },
                    data:$.param($scope.form.finanCommuDetail)
                }).success(function(data, status) {

                    alert(data.msg);

                    self.flag == true;
                    $state.go("linkupRecord-adminClientRecord");
                }).error(function(data, status) {
                    self.flag == true;
                    alert("修改线索客户基本信息失败，请与管理员联系。");
                    return;
                });
            }

            return false;
        },
        "cancel":function(){
            $state.go("linkupRecord-adminClientRecord");
        }
    };


}
