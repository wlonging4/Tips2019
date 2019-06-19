'use strict';
function recordInfo($scope, $http, $location) {


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
        "secondDistributionTime":"",




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
            "firstScreenNote":""
        },




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
            "secondScreenNote":""
        }


    }
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
                //'X-Requested-With' :'XMLHttpRequest'
            }
        }).success(function(data, status) {
            if(data.data){
                $scope.info = angular.extend($scope.info, data.data);
            };
        }).error(function(data, status) {
            alert("获取线索客户基本信息失败，请与管理员联系。");
            return;
        });
    }




}
