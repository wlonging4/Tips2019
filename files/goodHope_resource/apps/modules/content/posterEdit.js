'use strict';
function posterEditController($scope, $timeout, $state, $http, $q, $location, tools) {
    $scope.G=G;
    $scope.form = {
        "status" : 1,
        //默认全为海报类型
        classId:41,
        contentImgUrlArr:[]
    };
    $scope.pageTitle = "新增海报";
    $scope.img = {};
    //封面图片列表
    $scope.select={};
    $timeout(function () {
        $('input[type="radio"]').uniform();
    });

    $scope.childList=[];
    var nowClassId=new Array();

    //获取海报的二级分类
    //查询二级分类
    $.ajax({
        url : G.server + '/class/getListByParentId.json',
        type:"POST",
        data : {parentId:'41'},
        success :function(data){
            tools.ajaxOpened(self);
            if(!tools.interceptor(data)) return;
            if(data.success){
                $scope.$applyAsync(function () {
                    $scope.select.childClassId=data.data;
                });
            }
        }
    });

    var posterId = $location.$$search.posterId;
    var form = $("#editProjecForm");

    if(posterId){
        $scope.pageTitle = "编辑海报";
        $scope.form.posterId = posterId;
        var reqData = $.param({posterId: posterId});

        /**
         * 获取具体信息
         * **/
        $http({
            method: "POST",
            url: G.server + "/poster/posterInfo.json",
            data:reqData,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                'X-Requested-With' :'XMLHttpRequest'
            }
        }).success(function(data, status) {
            var data = data.data;
            $scope.form.title = data.title;
            //$scope.form.classId = data.classId;
            $scope.form.childClassId = data.childClassId;
            $scope.form.status = data.status;
            $scope.form.introduction = data.introduction;
            $timeout(function () {
                $('input[type="radio"]').uniform();
            });
            //缩略图
            $scope.form.thumbnail = data.thumbnail;
            //封面图
            $scope.form.imagePath = data.imagePath;
            if($scope.form.imagePath){
                $scope.form.contentImgUrlArr=$scope.form.imagePath.split(',');
            }
        }).error(function(data, status) {
            return tools.interalert("获取信息失败，请与管理员联系。");
        });
    }

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

    $scope.action = {
        //图片上传
        /**
         * 上传标题图片
         * 参数 type ：0 缩略图 2 封面图片
         * **/
        uploadImg:function (inputDom, type) {
            var maxWidth = 0, maxHeight = 0;
            if(type === 0){
                maxWidth = 160;
                maxHeight = 160;
            }

            if(type === 2){
                maxWidth = 750;
                maxHeight = 1380;
            }
            var check = createImgCheckFactory(maxWidth, maxHeight);
            check(inputDom).then(function (data) {
                var formData = new FormData();
                formData.append('image', data);
                //海报类型4
                formData.append("type", 4);
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
                            $scope.form.thumbnail = url;
                        }

                        if(type === 2){
                            //好望角42能传8张 推荐43只能传1张
                            if($scope.form.contentImgUrlArr.length>7){
                                tools.interalert('封面图片最多可上传8张！');return;
                            }
                            if($scope.form.childClassId==43 && $scope.form.contentImgUrlArr.length>0){
                                tools.interalert('当分类为推荐时,只能添加1张封面图！');return;
                            }
                            $scope.form.contentImgUrlArr.push(url);
                        }
                        $scope.$apply();
                    },
                    error:function(data){

                    }
                });
            }, function (data) {
                alert(data);
            });
        },
        deleteImg:function (type, index) {
            if(type === 0){
                $scope.form.thumbnail = '';
            }

            if(type === 2){
                $scope.form.contentImgUrlArr.splice(index, 1);
            }
        },

        save:function(){
            var url;
            posterId ? url='/poster/updatePoster.json':url='/poster/savePoster.json';
            if(!$scope.form.title){
                tools.interalert("请填写标题！");return;
            }
            if(!$scope.form.classId){
                tools.interalert("请选择分类！");return;
            }
            if(!$scope.form.childClassId){
                tools.interalert("请选择分类！");return;
            }
            //判断新建是否有图片,编辑是否有原图片地址
            if(!$scope.form.thumbnail){
                tools.interalert("请添加缩略图片！");return;
            }
            //判断新建是否有图片,编辑是否有原图片地址
            if(!posterId){
                if(!$scope.form.contentImgUrlArr.length){
                    tools.interalert("请添加封面图片！");return;
                }
            }else{
                if(!$scope.form.contentImgUrlArr.length){
                    tools.interalert("请添加封面图片！");return;
                }
            }
            if($scope.form.childClassId==43 && $scope.form.contentImgUrlArr.length>1){
                tools.interalert('当分类为推荐时,只能添加1张封面图！');return;
            }
            $scope.form.imagePath='';
            for(var t=0;t<$scope.form.contentImgUrlArr.length;t++){
                $scope.form.imagePath+=$scope.form.contentImgUrlArr[t]+',';
            }
            $scope.form.imagePath=$scope.form.imagePath.slice(0,-1);
            //好望角之音必填简介
            if($scope.form.childClassId==42 && !$scope.form.introduction){
                tools.interalert("请填写简介！");return;
            }
            if(!$scope.form.status.toString()){
                tools.interalert("请选择状态！");return;
            }
            //var data = new FormData(form[0]);
            $.ajax({
                url : G.server + url,
                type:"POST",
                data :$scope.form,
                success :function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    if(data.success){
                        if(!posterId){
                            tools.interalert("海报添加成功！");
                        }else{
                            tools.interalert("海报编辑成功！");
                        }
                        $state.go("posterManage");
                    }
                }
            });
        },
        cancel:function(){
            $state.go("posterManage");
        }
    };
}
