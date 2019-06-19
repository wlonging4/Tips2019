'use strict';
function serviceChargeQueryController($scope,tools) {
    $scope.form = {
        isShow: ($("#js_form").find(".form-group").length>6) ? true : false
    };
    $scope.action = {
        search: function(e){
            var self = $(e.currentTarget);
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                url: siteVar.serverUrl + '/settlefee/query.json',
                method: "get",
                data: $scope.form
            }).then(function(data){
                tools.ajaxOpened(self);
                if(!tools.interceptor(data)) return;
                if(data.data){
                    $scope.$apply(function(){
                        switch (data.data.settleState){
                            case "1":
                                data.data.settleState = "未提交成功";
                                break;
                            case "2":
                                data.data.settleState = "订单不存在";
                                break;
                            case "3":
                                data.data.settleState = "订单重复";
                                break;
                            case "01":
                                data.data.settleState = "订单接收成功";
                                break;
                            case "02":
                                data.data.settleState = "交易成功";
                                break;
                            case "03":
                                data.data.settleState = "交易失败";
                                break;
                        }
                        switch (data.data.feeType){
                            case 1:
                                data.data.feeType = "红包(产品中心代发)";
                                break;
                            case 2:
                                data.data.feeType = "返现";
                                break;
                            case 3:
                                data.data.feeType = "体验金";
                                break;
                            case 4:
                                data.data.feeType = "渠道补偿客户";
                                break;
                            case 5:
                                data.data.feeType = "客户补偿渠道";
                                break;
                            case 6:
                                data.data.feeType = "退款(服务费入金)";
                                break;
                            case 101:
                                data.data.feeType = "其他(服务费出金)";
                                break;
                            case 102:
                                data.data.feeType = "其他(服务费入金)";
                                break;
                        }
                        $scope.result = data.data
                    })
                }else{
                    $scope.$apply(function(){
                        $scope.isEmptyResult = true
                    })
                }
            })
        }
    };
    (function(){
        $("[ui-view]").append("<style>table.dataTable,table.dataTable.no-footer {width: 100% !important;}</style>");
    })();
}