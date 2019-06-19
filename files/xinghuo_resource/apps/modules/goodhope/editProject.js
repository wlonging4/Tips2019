'use strict';
function editProject($scope, $timeout, $state, $http, $location, getSelectListFactory, tools, DTOptionsBuilder, DTColumnBuilder) {
    $scope.form = {
        "content" : "",
        "saleStatus" : 0,
        "subjectId":""
    };
    $scope.pageTitle = "新增项目";
    $scope.contentTitle = "新增内容";
    $scope.img = {};
    $scope.select={};
    $scope.countryList=[];
    var nowTypeId=new Array();
    var subjectId = $location.$$search.subjectId;
    var form = $("#editProjecForm"), contentBox = $("#summernote");
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
                            formData.append("imageFiles", files[f]);
                        }
                    }
                    $.ajax({
                        url : siteVar.serverUrl + "/xinghuogoodhope/uploadGoodHopeImg.shtml",
                        type:"POST",
                        data : formData,
                        processData: false,
                        contentType: false,
                        success :function(data){
                            if(!tools.interceptor(data)) return;
                            if(data.success){
                                for(var key in data.data){
                                    contentBox.summernote('editor.insertImage', data.data[key].uri);
                                }
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

    $scope.$watch("form.proTypeId",function (oldval,newval) {
        //修改新的类型国家列表改变并清空国家数据
        delete $scope.form.countryId;
        $scope.countryList.forEach(function (val,inx) {
            if($scope.countryList[inx].typeId==$scope.form.proTypeId){
                $scope.select.good_hope_country=$scope.countryList[inx].list;
            }
        });
    });
    function getTypeAndCountry(edit,idType,idCon){
        $.ajax({
            type: "post",
            url: siteVar.serverUrl + "/xinghuogoodhope/categoryList.shtml",
            dataType: "JSON",
            success: function(data){
                $scope.$apply(function () {
                    $scope.select.good_hope_pro_type=data.data;
                    //编辑/新建
                    edit?$scope.form.proTypeId=idType:$scope.form.proTypeId=$scope.select.good_hope_pro_type[0].id;
                });
            },
            error: function(err){
                tools.ajaxOpened(self);
                tools.ajaxError(err);
            }
        }).then(
            function(){
                for(var i=0;i<$scope.select.good_hope_pro_type.length;i++){
                    nowTypeId[i]=$scope.select.good_hope_pro_type[i].id;
                    (function (i) {
                        $.ajax({
                            type: "post",
                            url: siteVar.serverUrl + "/xinghuogoodhope/subCategoryList.shtml",
                            data: {'id':nowTypeId[i]},
                            dataType: "JSON",
                            success: function(data){
                                $scope.countryList.push({'typeId':nowTypeId[i],'list':data.data});
                                $scope.$apply(function () {
                                    //读取默认第一个类型的国家列表
                                    $scope.countryList.forEach(function (val,inx) {
                                        if($scope.countryList[inx].typeId==$scope.form.proTypeId){
                                            $scope.select.good_hope_country=$scope.countryList[inx].list;
                                            //编辑/新建
                                            if(edit){
                                                $scope.form.countryId='';
                                                for(var j=0;j<$scope.select.good_hope_country.length;j++){
                                                    if(idCon==$scope.select.good_hope_country[j].id){
                                                        $scope.form.countryId=idCon;
                                                        console.log('有这个国家');
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

    getSelectListFactory.getSelectList(['webcmsrc']).then(function(data){
        $scope.select = {
            webcmsrc : data.appResData.retList[0].webcmsrc
        };
        getTypeAndCountry();
    });

    if(subjectId){
        $scope.pageTitle = "修改项目";
        $scope.contentTitle = "修改内容";
        $scope.form.subjectId = subjectId;
        var reqData = $.param({subjectId: subjectId});

        /**
         * 获取具体信息
         * **/
        $http({
            method: "POST",
            url: siteVar.serverUrl + "/xinghuogoodhope/goodHopeSubjectInfo.shtml",
            data:reqData,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                'X-Requested-With' :'XMLHttpRequest'
            }
        }).success(function(data, status) {
            var data = data.data;
            $scope.form.subjectId = data.id;
            $scope.form.subtitle = data.subtitle;
            $scope.form.saleStatus = data.saleStatus;
            if(data.saleStatus==2){
                $('.statusRadio2').parent().addClass('checked');$('.statusRadio1').parent().removeClass('checked');
            }else{
                $('.statusRadio1').parent().addClass('checked');$('.statusRadio2').parent().removeClass('checked');
            }
            $scope.form.subdesc = data.subdesc;
            $scope.form.content = data.content || "";
            $scope.summernote($scope.form.content);
            $scope.img.uploadImgHref = data.subimage;
            //获取类型和国家信息
            $scope.form.proTypeId = data.proTypeId;
            $scope.form.countryId = data.countryId;
            getTypeAndCountry(1,$scope.form.proTypeId,$scope.form.countryId);
            $timeout(function(){
                $scope.form.channel = (data.channel || data.channel === 0) ? data.channel : "";
            }, 0)
        }).error(function(data, status) {
            alert("获取信息失败，请与管理员联系。");
            return;
        });
    }else{
        $scope.summernote('');
    };

    $timeout(function(){
        form.find("input[type='radio']").uniform();
    }, 0);

    $scope.checkSize = function(obj){
        var self = obj, file = self.files[0];
        if(file.size > 150*1024){
            self.value = '';
            return alert(" 图片文件过大，图片文件控制150KB以内");
        };
        var reader = new FileReader();
        reader.onload = function(event) {
            var img = new Image();
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    };

    $scope.action = {
        save:function(){
            var  url = '/xinghuogoodhope/saveSubject.shtml';
            if(!$scope.form.subtitle){
                tools.interalert("请填写标题！");return;
            }
            if(!$scope.form.proTypeId){
                tools.interalert("请选择分类！");return;
            }
            if(!$scope.form.countryId){
                tools.interalert("请选择国家！");return;
            }
            if(!$scope.form.channel){
                //新建时该属性为undefined或者选择pc渠道值为0时
                if($scope.form.channel==undefined||$scope.form.channel.toString()!='0'){
                    tools.interalert("请选择渠道！");return;
                }
            }
            //判断新建是否有图片,编辑是否有原图片地址
            if(!subjectId){
                if(!$scope.form.subimageFile){
                    tools.interalert("请选择图片！");return;
                }
            }else{
                if(!$scope.img.uploadImgHref){
                    tools.interalert("请选择图片！");return;
                }
            }
            //状态不用判断,新建有默认值
            if(!$scope.form.subdesc){
                tools.interalert("请填写简介！");return;
            }
            if(!$scope.form.content){
                tools.interalert("请填写内容！");return;
            }
            var data = new FormData(form[0]);
            $.ajax({
                url : siteVar.serverUrl + url,
                type:"POST",
                data : data,
                processData: false,
                contentType: false,
                success :function(data){
                    if(typeof data == "string"){
                        var data = JSON.parse(data);
                    };
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    if(data.success){
                        if(!subjectId){
                            tools.interalert("项目添加成功！");
                        }else{
                            tools.interalert("项目编辑成功！");
                        }
                        $state.go("xinghuogoodhope-subject");
                    }
                }
            });
        },
        cancel:function(){
            $state.go("xinghuogoodhope-subject");
        }
    };
}
