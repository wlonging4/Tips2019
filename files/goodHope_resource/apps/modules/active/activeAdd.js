'use strict';
function activeAddController($scope, tools, $q, $location, $http, EnumeratorCollection, $state) {
    $scope.G = G;
    $scope.form = {
        classId:17,
        status:1,
        isRecommend:1,
        tagArr:['']
    };
    $scope.select = {};

    //产品分类
    $http({
        method: "POST",
        url: G.server + "/class/getListByParentId.json",
        data:$.param({
            parentId:0,
            type:0
        }),
    }).then(function (data) {
        var info = data.data;
        if(!info.success) {
            return alert(info.msg);
        };
        $scope.select.activityProductClassId = info.data;
    });
    //活动区域
    $.ajax({
        url : G.server + '/enums/get.json',
        type:"get",
        data : {key:16},
        success :function(data){
            tools.ajaxOpened(self);
            if(!tools.interceptor(data)) return;
            if(data.success){
                $scope.$apply(function () {
                    $scope.select.activityAreasId=data.data;
                });
            }else{
                tools.interalert(data.msg);
            }
        }
    });
    //是否线上活动
    $.ajax({
        url : G.server + '/enums/get.json',
        type:"get",
        data : {key:17},
        success :function(data){
            tools.ajaxOpened(self);
            if(!tools.interceptor(data)) return;
            if(data.success){
                $scope.$apply(function () {
                    $scope.select.onlineType=data.data;
                });
            }else{
                tools.interalert(data.msg);
            }
        }
    });

    var promiseList = [$http({
        method: "POST",
        url: G.server + "/class/childClassList.json",
        data:$.param({
            parentId:17
        }),
    })];

    var search = $location.$$search;
    if(search.activityId){
        promiseList.push($http({
            method: "POST",
            url: G.server + "/activity/activityDetail.json",
            data:$.param({
                activityId:search.activityId
            }),
        }))
    }
    $q.all(promiseList).then(function (res) {
        var res0 = res[0]['data'];
        $scope.select.childClassIdArr = res0.data;

        if(search.activityId){
            var res1 = res[1]['data'];
            if(!res1.success) {
                return alert(res1.msg);
            };
            var detail = res1.data;
            detail.activityStartTime = tools.toJSDate(detail.activityStartTime);
            detail.activityEndTime = tools.toJSDate(detail.activityEndTime);

            if(detail.activityStartTime){
                $scope.$applyAsync(function () {
                    $scope.action.setStartTime();
                });
            }
            if(detail.activityEndTime){
                $scope.$applyAsync(function () {
                    $scope.action.setEndTime();
                })
            }
            $.extend($scope.form, detail);
            $scope.form.isRecommend = String($scope.form.isRecommend);
            $scope.form.tagArr = $scope.form.tag.split(",");
        }


        var summernote = createSummernoteFactory("summernote", 5);
        summernote($scope.form.content);

        $scope.$applyAsync(function () {
            $("input[type=checkbox],input[type=radio]").uniform();
        });

    });




    $scope.action = {
        /**
         * 上传标题图片
         * 参数 type ：1 缩略图片 2 详情图片
         * **/
        uploadImg:function (inputDom, type) {
            var maxWidth = 0, maxHeight = 0;
            if(type === 1){
                maxWidth = 280;
                maxHeight = 160;
            }
            if(type === 2){
                maxWidth = 686;
                maxHeight = 392;
            }
            var check = createImgCheckFactory(maxWidth, maxHeight);
            var flag = true;
            //检验成功就上传，失败就弹窗提示

            check(inputDom).then(function (data) {
                var formData = new FormData();
                formData.append('image', data);
                formData.append('type', 5);
                $.ajax({
                    url: G.server + '/common/uploadImage.json',
                    type:"POST",
                    cache:false,
                    data:formData,
                    processData:false,
                    contentType:false,
                    success:function(data){
                        flag = true;
                        var url = data.data;
                        if(type === 1){
                            $scope.form.smallPath = url;
                        }
                        if(type === 2){
                            $scope.form.detailPath = url;
                        }
                        $scope.$apply();
                    },
                    error:function(data){
                        flag = true;
                    }
                });
            }, function (data) {
                alert(data);
            });

        },
        deleteImg:function (index, type) {
            if(type === 1){
                $scope.form.smallPath = '';
            }
            if(type === 2){
                $scope.form.detailPath = '';
            }
        },
        addTagArr:function () {
            var tagArr = $scope.form.tagArr;
            if(tagArr.length < 3){
                tagArr.push('');
            }
        },
        setStartTime:function () {
            var v = $(".startTime").val(), newDate = new Date(v);
            newDate = newDate.getTime() + 60*1000;
            newDate = tools.toJSDate(newDate);
            $('.endTime').datetimepicker('setStartDate', newDate);

        },
        setEndTime:function () {
            var v = $('.endTime').val(), newDate = new Date(v);
            newDate = newDate.getTime() - 60*1000;
            newDate = tools.toJSDate(newDate);
            $('.startTime').datetimepicker('setEndDate', newDate);
        },
        save: function () {
            var submitData = JSON.parse(JSON.stringify($scope.form));
            if(!submitData.childClassId){
                return alert('请选择活动分类！');
            }
            if(!submitData.activityName){
                return alert('请输入活动名称！');
            }
            if(!submitData.smallPath){
                return alert('请上传缩略图片！');
            }
            if(!submitData.detailPath){
                return alert('请上传详情图片！');
            }
            if(!submitData.activityStartTime){
                return alert('请选择活动开始时间！');
            }
            if(!submitData.activityEndTime){
                return alert('请选择活动结束时间！');
            }
            submitData.tagArr = submitData.tagArr.filter(function (item) {
                return !!item;
            });
            if(submitData.tagArr.length === 0){
                return alert('请输入活动标签！');
            }
            if(!submitData.address){
                return alert('请输入活动地点！');
            }

            if(!submitData.activityProductClassId){
                return alert('请选择产品分类！');
            }
            if(!submitData.activityAreasId){
                return alert('请选择活动区域！');
            }
            if(!submitData.onlineType.toString()){
                return alert('请选择是否线上活动！');
            }

            if(!submitData.isRecommend){
                return alert('请选择是否主推活动！');
            }
            if(!submitData.simpleContent){
                return alert('请输入分享活动描述！');
            }
            if(!submitData.content){
                return alert('请输入活动内容！');
            }

            submitData.tag = submitData.tagArr.join();

            var url = "/activity/publish.json";
            if(search.activityId){
                url = "/activity/update.json";
            }
            $http({
                method: "POST",
                url: G.server + url,
                data:$.param(submitData),
            }).then(function (data) {
                var info = data.data;
                if(!info.success) {
                    return alert(info.msg);
                };
                alert("保存成功！");
                $state.go('activeList');
            });

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


    //初始化 summernote工厂函数
    function createSummernoteFactory(id, uploadType) {
        var flag = true;
        return function (content) {
            if (flag) {
                flag = false;
                var contentBox = $("#" + id);
                return contentBox.html(content || '').summernote({
                    height: 200,
                    minHeight: null,
                    maxHeight: null,
                    focus: true,
                    callbacks: {
                        onChange: function (contents, $editable) {
                            $scope.$apply(function () {
                                $scope.form.content = contents;
                            })
                        },
                        onPaste: function (e) {
                            var clipboardData = e.originalEvent.clipboardData;
                            if (clipboardData && clipboardData.items && clipboardData.items.length) {
                                var item = clipboardData.items.length > 1 ? clipboardData.items[1] : clipboardData.items[0];
                                if (item.kind === 'file' && item.type.indexOf('image/') !== -1) {
                                    e.preventDefault();
                                }
                            }
                        },
                        onImageUpload: function (files, editor, $editable) {
                            var formData = new FormData();
                            formData.append('type', uploadType);
                            for (var f in files) {
                                if (files.hasOwnProperty(f)) {
                                    formData.append("image", files[f]);
                                }
                            }
                            $.ajax({
                                url: G.server + "/common/uploadImgForUrl.json",
                                type: "POST",
                                data: formData,
                                processData: false,
                                contentType: false,
                                success: function (data) {
                                    if (!tools.interceptor(data)) return;
                                    if (data.success) {
                                        contentBox.summernote('editor.insertImage', data.data);
                                    }
                                }
                            });
                        }
                    }
                });
            }


        }
    }
}
