'use strict';
function addUsersController($scope,getSelectListFactory,$state,tools) {
    $scope.form = {
        documentType:1
    };
    $scope.info = {

    };
    $scope.select = {};

    
    var selectList = getSelectListFactory.getSelectList(['documenttype']);
    selectList.then(function(data){
        $scope.select.documentType  = data.appResData.retList[0].documenttype;
    });
    var cardExp = /(^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$)|(^[1-9]\d{5}\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{2}[0-9Xx]$)/;
    var isValidateMobile = function(mobile){
        var mobileExp = /^1[3|4|5|7|8|9][0-9]\d{8}$/;
        return mobileExp.test(mobile);
    }
    $scope.action = {
        checkMobile: function(){
            if(isValidateMobile($scope.form.cellphone)){
                $.ajax({
                    method: "POST",
                    url:siteVar.serverUrl + "/xinghuouser/getUserInfo.shtml",
                    data:{
                        cellphone:$scope.form.cellphone
                    },
                    success:function (data) {
                        if(!tools.interceptor(data)) return;
                        var result = data.data[0];
                        if(result.store.storename){
                            $scope.$apply(function(){
                                $scope.form.managerMobile = result.store.tel;
                                $scope.form.storeId = result.store.id;
                                $scope.form.managerId = result.store.userid;
                                $scope.info.realname = result.store.realname;
                                $scope.info.userid = result.store.userid;
                                $scope.info.storename = result.store.storename;
                            })
                        }else{
                            $scope.$apply(function(){
                                $scope.form.managerMobile = null;
                                $scope.form.storeId = null;
                                $scope.form.managerId = null;
                                $scope.info.realname = null;
                                $scope.info.userid = null;
                                $scope.info.storename = null;
                            })
                        }
                        if(result.user.realname){
                            $scope.$apply(function(){
                                $scope.form.realName = result.user.realname;
                                $scope.form.documentno = result.user.documentno;
                                $scope.form.documentType = result.user.documenttype;
                            })
                        }else{
                            $scope.$apply(function(){
                                $scope.form.realName = null;
                                $scope.form.documentno = null;
                                $scope.form.documentType = 1;
                            })
                        }
                    }
                });
            }else{
                return alert("请输入合法的手机号！");
            }
        },
        /**
         *
         * **/
        register:function () {
            var cellphone = $("#cellphone");
            if(!$scope.form.cellphone){
                return alert("请输入手机号！")
            };
            if(!isValidateMobile($scope.form.cellphone)){
                return alert("请输入合法的用户手机号！")
            };
            $.ajax({
                method: "POST",
                url:siteVar.serverUrl + "/xinghuouser/addNormalUser.shtml",
                data:{
                    cellphone:$scope.form.cellphone
                },
                success:function (data) {
                    if(data.success){
                        alert("用户注册成功！");
                        cellphone.attr("readonly", true);
                    }else{
                        alert(data.msg)
                    }
                },
                error:function () {
                    alert("录入用户信息失败，请与管理员联系。");
                    return;
                }
            });
        },
        /**
         * 绑定理财师
         * **/
        binding:function () {
            if(!$scope.form.cellphone){
                return alert("请输入手机号！")
            };
            if(!isValidateMobile($scope.form.cellphone)){
                return alert("请输入合法的用户手机号！")
            };
            if(!$scope.form.managerMobile){
                return alert("请输入理财经理手机号！")
            };
            if(!isValidateMobile($scope.form.managerMobile)){
                return alert("请输入合法的理财经理手机号！")
            };
            $.ajax({
                method: "POST",
                url:siteVar.serverUrl + "/xinghuouser/bindStore.shtml",
                data:{
                    cellphone:$scope.form.cellphone,
                    storeId:$scope.form.storeId
                },
                success:function (data) {
                    if(data.success){
                        alert("绑定理财师成功！");
                    }else{
                        alert(data.msg)
                    }
                },
                error:function () {
                    alert("录入用户信息失败，请与管理员联系。");
                    return;
                }
            });
        },
        /**
         * 提交实名信息
         * **/
        submit: function(){
            if(!$scope.form.cellphone){
                return alert("请输入手机号！")
            };
            if(!isValidateMobile($scope.form.cellphone)){
                return alert("请输入合法的用户手机号！")
            };
            if(!$scope.form.realName){
                return alert("请输入真实姓名！")
            };
            if(!$scope.form.documentType){
                return alert("请选择证件类型！")
            };
            if(!$scope.form.documentno){
                return alert("请输入证件号码！")
            };
            if(($scope.form.documentType == 1) && !cardExp.test($scope.form.documentno)){
                return alert("请输入合法身份证号！")
            };
            if(!$scope.form.storeId || !$scope.form.managerId){
                return alert("请输入有效的理财经理手机号！")
            };

            $.ajax({
                method: "POST",
                url:siteVar.serverUrl + "/xinghuouser/realName.shtml",
                data:$scope.form,
                success:function (data) {
                    if(data.success){
                        alert("实名认证成功！");
                    }else{
                        alert(data.msg)
                    }
                },
                error:function () {
                    alert("录入用户信息失败，请与管理员联系。");
                    return;
                }
            });
        },
        /**
         * 查询理财经理信息
         * **/
        searchInfo: function(){
            var target = $("#managerMobile"), value = target.val();
            if(value.length < 11){
                return;
            };
            if(!isValidateMobile(value)){
                return alert("请输入合法的理财经理手机号！")
            }
            $.ajax({
                method: "POST",
                url:siteVar.serverUrl + "/xinghuouser/getUserStoreInfo.shtml",
                data:{
                    managerMobile:value
                },
                success:function (data) {
                    if(data.success){
                        $scope.$apply(function () {
                            $scope.info = data.data;
                            $scope.form.storeId = data.data.id;
                            $scope.form.managerId = data.data.userid;
                        });
                    }else{
                        alert(data.msg);
                        $scope.$apply(function () {
                            $scope.info = {
                                realname:"",
                                userid:"",
                                storename:""
                            }
                            $scope.form.storeId = "";
                            $scope.form.managerId = "";
                        });
                    }
                },
                error:function () {
                    alert("获取理财经理信息失败，请与管理员联系。");
                    return;
                }
            });
        }
    }

}