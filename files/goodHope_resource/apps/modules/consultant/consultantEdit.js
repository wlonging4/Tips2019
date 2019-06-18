'use strict';
function consultantEditController($scope,$timeout, $state, $http, $location,$q, tools) {
    $scope.G=G;
    $scope.form = {
        //标签
        productTagArr:['']
    };
    $scope.select = {};
    $scope.form.status='1';
    $scope.action = {};

    $scope.pageTitle = "新增顾问";
    $scope.img = {};
    var advisorId = $location.$$search.advisorId;
    var form = $("#editProjecForm");
    $timeout(function () {
        $('input[type="radio"]').uniform();
    });
    /**
     * 标签格式化
     * **/
    function arrSum(arr) {
        var result = '', temp = null;
        if(arr.length){
            temp = arr.filter(function (item) {
                return !!item;
            });
        }else{
            tools.interalert('请添加标签!')
        }
        result = temp.join(',');
        return result;
    }

    $(document).on("keyup", ".js_validator_int", function() {
        var str = this.value.replace(/\D/g, "");
        this.value = str;
    });

    if(advisorId){
        $scope.pageTitle = "编辑顾问";
        $scope.form.advisorId = advisorId;
        var reqData = $.param({advisorId: advisorId});

        /**
         * 获取具体信息
         * **/
        $http({
            method: "POST",
            url: G.server + "/advisor/getAdvisorDetail.json",
            data:reqData,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                'X-Requested-With' :'XMLHttpRequest'
            }
        }).success(function(data, status) {
            var tagArr=[];
            var data = data.data;

            $scope.$applyAsync(function () {
                $scope.form.advisorId = data.advisorId;
                $scope.form.advisorName = data.advisorName;
                $scope.form.address = data.address;
                $scope.form.mobile = data.mobile;
                $scope.form.workYears = data.workYears;
                //渲染初始标签
                $scope.form.tag = data.tag;
                $scope.form.productTagArr=$scope.form.tag.split(',');

                $scope.form.headportrait = data.headportrait;
                $scope.form.status = data.status.toString();
                $scope.form.remark = data.remark || "";

                $timeout(function () {
                    $('input[type="radio"]').uniform();
                });
            });
        }).error(function(data, status) {
            return tools.interalert("获取信息失败，请与管理员联系。");
        });
    }

    $scope.action = {
        addListLabel:function () {
            var productTagArr = $scope.form.productTagArr;
            if(productTagArr.length < 2){
                productTagArr.push('');
            }
        },
        /**
         * 上传标题图片
         * 参数 type ：0 视频详情图 1 封面图片 2 分享缩略图
         * **/
        uploadImg:function (inputDom, type) {
            var maxWidth = 0, maxHeight = 0;
            if(type === 0){
                maxWidth = 160;
                maxHeight = 160;
            }
            var check = createImgCheckFactory(maxWidth, maxHeight);
            check(inputDom).then(function (data) {
                var formData = new FormData();
                formData.append('image', data);
                //顾问类型6
                formData.append("type", 6);
                $.ajax({
                    url: G.server + '/common/uploadImage.json',
                    type:"POST",
                    cache:false,
                    data:formData,
                    processData:false,
                    contentType:false,
                    success:function(data){
                        var url = data.data;
                        if(type === 0){
                            $scope.form.headportrait = url;
                        }
                        $scope.$apply();
                    },
                    error:function(data){

                    }
                });
            }, function (data) {
                tools.interalert(data);
            });
        },
        deleteImg:function (type, index) {
            if(type === 0){
                $scope.form.headportrait = '';
            }
        },
        save:function(){
            var  url;
            if(!$scope.form.advisorName){
                tools.interalert("请填写顾问姓名！");return;
            }
            if(!$scope.form.mobile){
                tools.interalert("请填写手机号！");return;
            }else{
                if(!(/^1[3,4,5,6,7,8,9]{1}[0-9]{9}$/.test($scope.form.mobile))){
                    tools.interalert("请输入合法的手机号！");return;
                }
            }
            if(!$scope.form.address){
                tools.interalert("请填写地区！");return;
            }
            if(!$scope.form.workYears){
                tools.interalert("请填写从业年限！");return;
            }
            //判断新建是否有图片,编辑是否有原图片地址
            if(!advisorId){
                url='/advisor/saveAdvisor.json';
            }else{
                url='/advisor/modifyAdvisor.json';
            }
            if(!$scope.form.headportrait){
                tools.interalert("请选择头像！");return;
            }
            $scope.form.tag = arrSum($scope.form.productTagArr);
            if(!$scope.form.tag){
                tools.interalert("请填写标签！");return;
            }
            if(!$scope.form.status){
                tools.interalert("请选择状态！");return;
            }
            if(!$scope.form.remark){
                tools.interalert("请填写简介！");return;
            }
            //var data = new FormData(form[0]);
            $.ajax({
                url : G.server + url,
                type:"POST",
                data : JSON.parse(JSON.stringify($scope.form)),
                success :function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    if(data.success){
                        if(!advisorId){
                            tools.interalert("添加顾问成功！");
                        }else{
                            tools.interalert("编辑顾问成功！");
                        }
                        $state.go("consultantManage");
                    }
                }
            });
        },
        cancel:function(){
            $state.go("consultantManage");
        }
    };
    /**
     * 检验图片的工厂函数
     * **/
    function createImgCheckFactory(width, height) {
        return function (obj) {
            var file = obj.files[0], deferred = $q.defer(), promise = deferred.promise, reader = new FileReader();
            if(file){
                reader.readAsDataURL(file);
                reader.onload = function(event) {
                    var img = new Image();
                    img.src = event.target.result;
                    img.onload = function () {
                        if(img.width > width){
                            return deferred.reject("图片宽度大于" + width + "！");
                        };
                        if(img.height > height){
                            return deferred.reject("图片高度大于" + height + "！");
                        }
                        return deferred.resolve(file)

                    }
                };

            }

            return promise;
        }
    }
}
