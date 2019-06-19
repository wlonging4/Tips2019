'use strict';
function newChangeBank($scope,$http, $timeout,$state, tools, $location, getSelectListFactory) {
    $scope.form = {};
    $scope.select = {};

    $scope.searchInfo = function () {
        if(!$scope.tradeApplyNo){
            return alert("请输入查询的交易订单号！");
        }
        $http({
            method: "POST",
            url: siteVar.serverUrl + "/sesameCardChange/viewtradeUserMsg.json",
            data:$.param({
                tradeApplyNo : $scope.tradeApplyNo
            }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                'X-Requested-With' :'XMLHttpRequest'
            }
        }).success(function(data, status) {
            if(!data.success) {
                alert(data.msg);
                return;
            };
            $scope.info = data.data;

        }).error(function(data, status) {
            alert("获取开户信息失败，请与管理员联系。");
            return;
        });
    };
    /**
     * 获取银行列表
     * **/
    $http({
        method: "POST",
        url: siteVar.serverUrl + "/sesamerefund/getPayBankList.json",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
            'X-Requested-With' :'XMLHttpRequest'
        }
    }).success(function(data, status) {
        if(!data.success) {
            alert("获取银行列表失败，请与管理员联系。" + data.msg);
            return;
        };
        $scope.select.banks = data.data;
        $scope.$watch("form.bankCode", function(newValue,oldValue){
            if(newValue && newValue != ""){
                angular.forEach($scope.select.banks, function(data, index, array){
                    if(data.bankCodeEx == newValue){
                        $scope.form.bankName = data.bankName;
                    }
                });
            }
        }, true);
    }).error(function(data, status) {
        alert("获取银行列表失败，请与管理员联系。");
        return;
    });

    /**
     * 省市三级联动
     * **/
    $http({
        method: "POST",
        url: siteVar.serverUrl + "/sesamerefund/getAllProvinceCode.json",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
            'X-Requested-With' :'XMLHttpRequest'
        }
    }).success(function(data, status) {
        if(!data.success) {
            alert("获取开户省信息失败，请与管理员联系。" + data.msg);
            return;
        };
        $scope.select.province = data.data.data;
    }).error(function(data, status) {
        alert("获取开户省信息失败，请与管理员联系。");
        return;
    });
    $scope.selectProvince = function (code) {
        angular.forEach($scope.select.province, function(data, index, array){
            if(data.code == code){
                $scope.form.provinceName = data.name;
            }
        });
        if(code === ""){
            $scope.form.provinceName = "";
            $scope.form.cityCode = "";
            $scope.select.city = [];
            return;
        };

        $http({
            method: "POST",
            url: siteVar.serverUrl + "/sesamerefund/getProvinceCode.json",
            data:$.param({
                provinceCode : code
            }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                'X-Requested-With' :'XMLHttpRequest'
            }
        }).success(function(data, status) {
            if(!data.success) {
                alert("获取开户市信息失败，请与管理员联系。" + data.msg);
                return;
            };
            $scope.form.cityCode = "";
            $scope.select.city = data.data.data[0].cityList;

        }).error(function(data, status) {
            alert("获取开户市信息失败，请与管理员联系。");
            return;
        });
    };
    $scope.selectCity = function (code) {
        angular.forEach($scope.select.city, function(data, index, array){
            if(data.code == code){
                $scope.form.cityName = data.name;
            }
            if(code === ""){
                $scope.form.cityName = "";
            };
        });
    };

    /**
     * 查找支行
     * **/
    $scope.searchBranch = function () {
        if(!$scope.form.bankName){
            return alert("请选择银行名称！");
        }
        if(!$scope.form.branchName){
            return alert("请填写支行名称！");
        }
        if(!$scope.form.provinceCode){
            return alert("请选择开户所在省！");
        }
        if(!$scope.form.cityCode){
            return alert("请选择开户所在市！");
        }
        $http({
            method: "POST",
            url: siteVar.serverUrl + "/sesamerefund/getBank.json",
            data:$.param({
                bankName : $scope.form.bankName,
                bankCode : $scope.form.bankCode,
                branchName : $scope.form.branchName,
                provinceCode : $scope.form.provinceCode,
                provinceName : $scope.form.provinceName,
                cityCode : $scope.form.cityCode,
                cityName : $scope.form.cityName
            }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                'X-Requested-With' :'XMLHttpRequest'
            }
        }).success(function(data, status) {
            if(!data.success) {
                alert("获取开户支行信息失败，请与管理员联系。" + data.msg);
                return;
            };
            $scope.select.branchs = data.data;
            $("#branchDown").show();
        }).error(function(data, status) {
            alert("获取开户支行信息失败，请与管理员联系。");
            return;
        });
    };
    $scope.selectBranch = function (name, unionCode) {
        $scope.form.branchName = name;
        $scope.form.unionCode = unionCode;
        $("#branchDown").hide();
    }

    /**
     * 提交 保存
     * **/
    $scope.save = function () {
        var saveBtn = $("#saveBtn"), data = new FormData($("#changeBankForm")[0]);
        if(!$scope.form.bankName){
            return alert("请选择银行名称！");
        }
        if(!$scope.form.cardNo){
            return alert("请输入银行卡号！");
        }
        if($scope.form.cardNo != $scope.form.cardNo2){
            return alert("两次输入的银行卡号不一样！");
        }
        if(!$scope.form.provinceCode){
            return alert("请选择开户所在省！");
        }
        if(!$scope.form.cityCode){
            return alert("请选择开户所在市！");
        }
        if(!$scope.form.branchName){
            return alert("请输入支行名称！");
        }
        if(!$scope.form.changeApplyReason){
            return alert("请输入变更原因！");
        }
        if(!$scope.form.applyTime){
            return alert("请选择申请时间！");
        }
        if(!$scope.form.userCertificatesFile){
            return alert("请上传用户证明！");
        }
        if(!$scope.form.changeProtocolFile){
            return alert("请上传变更协议！");
        }
        if(!$scope.form.bankCardCertifyFile){
            return alert("请上传银行卡复印件或开户行证明！");
        }
        // if(!tools.ajaxLocked(saveBtn)) return;
        $.ajax({
            url : siteVar.serverUrl + "/sesameCardChange/addCardChangeApply.json ",
            type:"POST",
            data : data,
            processData: false,
            contentType: false,
            success :function(data){
                if(typeof data == "string"){
                    var data = JSON.parse(data);
                };
                if(!tools.interceptor(data)) return;
                if(data.success){
                    alert("银行卡变更申请提交成功！");
                    $state.go("sesame-changeBank");
                }else{
                    alert(data.msg)
                }
            }

        });
    }







}
