'use strict';
function contentEditController($scope, $timeout, $state, $http,$modal,$sce, $q, $location, tools) {
    $scope.G=G;
    $scope.form = {
        //渠道 1app 2pc
        "channel": '1',
        //1文章，2视频
        "contentType" : '1',
        //1主推，0否
        "isRecommend" : 1,
        //1上主页，0否
        "isRecommendIndex":'0',
        //1有效
        "status":1,
        //标签
        productTagArr:['']
    };
    $scope.pageTitle = "新增内容";
    $scope.img = {};
    $scope.select={};
    var contentId = $location.$$search.contentId;
    var form = $("#editProjecForm"), contentBox = $("#summernote");

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
        result = temp.join();
        return result;
    }
    $scope.childList=[];
    var nowClassId=new Array();
    $scope.$watch("form.classId",function (newVal,oldVal) {
        //修改一级分类改变并清空二级分类数据
        delete $scope.form.childClassId;
        $scope.childList.forEach(function (val,inx) {
            if($scope.childList[inx].classId==$scope.form.classId){
                $scope.select.childClassIdList=$scope.childList[inx].list;
            }
        });
        $timeout(function () {
            $('input[type="radio"]').uniform();
        });
        //改成课堂或文章修改默认contentType
        if(newVal && newVal==14){
            //默认文章
            $scope.form.contentType=1;
        }
        if(newVal && newVal==15){
            //默认视频
            $scope.form.contentType=2;
        }
        //新建时默认内容类型为1文章
        if(!contentId){
            if(newVal && newVal!=14 && newVal!=15){
                $scope.form.contentType=1;
            }
        }
    });

    //编辑初始化
    //getClassAndChild(1,$scope.form.childClassId,$scope.form.classId);
    //新建初始化
    getClassAndChild();

    function getClassAndChild(edit,idType,idCon){
        $.ajax({
            type: "post",
            url: G.server + '/class/getListByParentId.json',
            dataType: "JSON",
            data: {parentId:'0',type:1},
            success: function(data){
                $scope.$apply(function () {
                    $scope.select.classIdList=data.data;
                    //编辑/新建
                    //默认二级读取一级第一个的结果
                    //edit?$scope.form.classId=idType:$scope.form.classId=$scope.select.classIdList[0].classId;
                    //默认二级为空,等待一级选择
                    edit?$scope.form.classId=idType:$scope.form.classId='';
                });
            },
            error: function(err){
                tools.ajaxOpened(self);
                tools.ajaxError(err);
            }
        }).then(
            function(){
                for(var i=0;i<$scope.select.classIdList.length;i++){
                    nowClassId[i]=$scope.select.classIdList[i].classId;
                    (function (i) {
                        $.ajax({
                            type: "post",
                            url: G.server + '/class/getListByParentId.json',
                            data: {parentId:nowClassId[i]},
                            dataType: "JSON",
                            success: function(data){
                                $scope.childList.push({'classId':nowClassId[i],'list':data.data});
                                $scope.$apply(function () {
                                    //读取默认第一个子类列表
                                    $scope.childList.forEach(function (val,inx) {
                                        if($scope.childList[inx].classId==$scope.form.classId){
                                            $scope.select.childClassIdList=$scope.childList[inx].list;
                                            //编辑/新建
                                            if(edit){
                                                $scope.form.childClassId='';
                                                for(var j=0;j<$scope.select.childClassIdList.length;j++){
                                                    if(idCon==$scope.select.childClassIdList[j].classId){
                                                        $scope.form.childClassId=idCon;
                                                        console.log('有这个二级分类');
                                                    }
                                                }
                                            }
                                        }
                                    });
                                });
                            },
                            error: function(err){
                                tools.ajaxOpened(self);
                                tools.ajaxError(err);
                            }
                        });
                    })(i);
                }
            }
        );
    }

    $timeout(function () {
        $('input[type="radio"]').uniform();
    });
    $(document).on("keyup", ".js_validator_int", function() {
        var str = this.value.replace(/\D/g, "");
        this.value = str;
    });

    $scope.summernote = function(content){
        contentBox.html(content).summernote({
            height: 200,
            minHeight: null,
            maxHeight: null,
            focus: true,
            callbacks:{
                onChange: function(contents, $editable) {
                    $scope.$apply(function(){
                        $scope.form.content = contents;
                    })
                },
                onPaste:function (e) {
                    var clipboardData = e.originalEvent.clipboardData;
                    if (clipboardData && clipboardData.items && clipboardData.items.length) {
                        var item = clipboardData.items.length > 1 ? clipboardData.items[1] : clipboardData.items[0];
                        if (item.kind === 'file' && item.type.indexOf('image/') !== -1) {
                            e.preventDefault();
                        }
                    }
                },
                onImageUpload: function(files, editor, $editable) {
                    var formData = new FormData();
                    for (var f in files) {
                        if (files.hasOwnProperty(f)){
                            formData.append("image", files[f]);
                            formData.append("type", 3);
                        }
                    }
                    $.ajax({
                        url : G.server + "/common/uploadImgForUrl.json",
                        type:"POST",
                        data : formData,
                        processData: false,
                        contentType: false,
                        success :function(data){
                            if(!tools.interceptor(data)) return;
                            if(data.success){
                                contentBox.summernote('editor.insertImage', data.data);
                            }
                        }
                    });
                }
            }
        });
    };
    $scope.removeSummernote = function(){
        contentBox.summernote('destroy');
        contentBox.prop('disabled', true );
        contentBox.html('');
    };

    if(contentId){
        $scope.pageTitle = "编辑内容";
        $scope.form.contentId = contentId;
        var reqData = $.param({contentId: contentId});

        /**
         * 获取具体信息
         * **/
        $http({
            method: "POST",
            url: G.server + "/content/contentInfo.json",
            data:reqData,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                'X-Requested-With' :'XMLHttpRequest'
            }
        }).success(function(data, status) {
            var data = data.data;
            $scope.form.contentId = data.contentId;
            $scope.form.title = data.title;
            $scope.form.classId = data.classId;
            $scope.form.childClassId = data.childClassId;

            //编辑初始化
            getClassAndChild(1,$scope.form.classId,$scope.form.childClassId);
            $scope.form.contentType = data.contentType;
            $scope.form.channel = data.channel;
            //渲染初始标签
            $scope.form.tag = data.tag;
            $scope.form.productTagArr=$scope.form.tag.split(',');

            $scope.form.videoUrl = data.videoUrl;
            $scope.form.videoShowTime = data.videoShowTime;
            $scope.form.viewNumber = data.viewNumber;
            $scope.form.videoImagePath = data.videoImagePath;
            $scope.form.imagePath = data.imagePath;
            $scope.form.thumbnail = data.thumbnail;
            $scope.form.isRecommend = data.isRecommend;
            $scope.form.isRecommendIndex = data.isRecommendIndex;
            $scope.form.status = data.status;
            $scope.form.simpleContent = data.simpleContent;
            $scope.form.previewUrl=data.previewUrl;

            $scope.form.content = data.content || "";
            $scope.summernote($scope.form.content);
            $timeout(function () {
                $('input[type="radio"]').uniform();
            });
        }).error(function(data, status) {
            return tools.interalert("获取信息失败，请与管理员联系。");
        });
    }else{
        $scope.summernote('');
    }

    $scope.action = {
        addListLabel:function () {
            var productTagArr = $scope.form.productTagArr;
            if(productTagArr.length < 5){
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
                maxWidth = 750;
                maxHeight = 420;
            }
            if(type === 1){
                maxWidth = 686;
                maxHeight = 384;
            }
            if(type === 2){
                maxWidth = 160;
                maxHeight = 160;
            }
            var check = createImgCheckFactory(maxWidth, maxHeight);
            check(inputDom).then(function (data) {
                var formData = new FormData();
                formData.append('image', data);
                //内容类型3
                formData.append("type", 3);
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
                            $scope.form.videoImagePath = url;
                        }
                        if(type === 1){
                            $scope.form.imagePath = url;
                        }
                        if(type === 2){
                            $scope.form.thumbnail = url;
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
                $scope.form.videoImagePath = '';
            }
            if(type === 1){
                $scope.form.imagePath = '';
            }
            if(type === 2){
                $scope.form.thumbnail = '';
            }
        },
        save:function(){
            var  url;
            if(!$scope.form.title){
                tools.interalert("请填写标题！");return;
            }
            if(!$scope.form.classId){
                tools.interalert("请选择一级分类！");return;
            }
            if(!$scope.form.childClassId){
                tools.interalert("请选择二级分类！");return;
            }
            if($scope.form.classId != 14 && $scope.form.classId != 15){
                if(!$scope.form.contentType){
                    tools.interalert("请选择内容类型！");return;
                }
            }
            if(!$scope.form.channel){
                tools.interalert("请选择渠道！");return;
            }
            $scope.form.tag = arrSum($scope.form.productTagArr);
            if(!$scope.form.tag){
                tools.interalert("请填写标签！");return;
            }
            if($scope.form.classId==15 || $scope.form.contentType==2){
                if(!$scope.form.videoUrl){
                    tools.interalert("请填写视频URL！");return;
                }
            }else{
                delete $scope.form.videoUrl;
            }
            if($scope.form.classId==15 || $scope.form.contentType==2){
                if(!$scope.form.videoShowTime){
                    tools.interalert("请填写视频时间！");return;
                }
            }else{
                delete $scope.form.videoShowTime;
            }
            if($scope.form.classId==14 || $scope.form.contentType==1){
                if(!$scope.form.viewNumber){
                    tools.interalert("请填写访问量！");return;
                }
            }else{
                delete $scope.form.viewNumber;
            }
            if(!contentId){
                url='/content/saveContent.json';
            }else{
                url='/content/updateContent.json';
            }
            if($scope.form.classId==15 || $scope.form.contentType==2){
                if(!$scope.form.videoImagePath){
                    tools.interalert("请选择视频详情图！");return;
                }
            }else{
                delete $scope.form.videoImagePath;
            }

            if(!$scope.form.imagePath){
                tools.interalert("请选择封面图片！");return;
            }
            if(!$scope.form.thumbnail){
                tools.interalert("请选择分享缩略图！");return;
            }
            if($scope.form.classId==14 || $scope.form.contentType==1){
                if(!$scope.form.isRecommend.toString()){
                    tools.interalert("请选择是否主推！");return;
                }
            }else{
                delete $scope.form.isRecommend;
            }
            if(!$scope.form.isRecommendIndex.toString()){
                tools.interalert("请选择是否上主页！");return;
            }
            if(!$scope.form.status.toString()){
                tools.interalert("请选择状态！");return;
            }
            if(!$scope.form.simpleContent){
                tools.interalert("请填写简介！");return;
            }
            if($scope.form.classId ==14 || $scope.form.contentType==1){
                if(!$scope.form.content){
                    tools.interalert("请填写内容！");return;
                }
            }else{
                delete $scope.form.content;
                $scope.summernote('');
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
                        if(!contentId){
                            tools.interalert("内容添加成功！");
                        }else{
                            tools.interalert("内容编辑成功！");
                        }
                        $state.go("contentManage");
                    }
                }
            });
        },
        cancel:function(){
            $state.go("contentManage");
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
