'use strict';
function dataAddHWJController($scope, $timeout, $state, $http, $location, getSelectListFactory, tools, DTOptionsBuilder, DTColumnBuilder) {
    $scope.form={};
    $scope.form2={};
    var form = $("#editProjecForm"), contentBox = $("#summernote");
    var reqUrl='',timer;
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
                            console.log(data);
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
    if($location.url().indexOf("?") > -1){
        var urlStr = $location.url().split("?")[1];
        var urlObj = tools.serializeUrl(urlStr);
        if(!urlObj.id){
            //新建
            $scope.summernote('');
            //渲染默认数据
            $scope.form2.code=urlObj.code;
            $scope.form2.name=urlObj.name;
            $scope.form.fileType=urlObj.fileType;
            $scope.form.subjectId=urlObj.subjectId;
            $scope.form.fileType==1?$scope.form2.fileTypeStr='相关文件':$scope.form2.fileTypeStr='未知文件';
        }else{
            //编辑
            //$scope.summernote('');
            $scope.form.id=urlObj.id;
            $scope.form.subjectId=urlObj.subjectId;
            $('#t1').html('编辑');$('#t2').html('编辑');
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + "/goodHopeSubjectData/selectById.shtml",
                data: {'id':$scope.form.id},
                dataType: "json",
                success: function(data){
                    if(data.success){
                        //渲染回显页面
                        var infos=data.data;
                        $scope.$apply(function () {
                            $scope.form2.code=urlObj.code;
                            $scope.form2.name=urlObj.name;
                            $scope.form2.fileTypeStr=infos.fileTypeStr;
                            $scope.form.fileName=infos.fileName;
                            $scope.form.sort=infos.sort;
                            $scope.form.content = infos.content || "";
                            $scope.summernote($scope.form.content);
                        })
                    }else{
                        tools.interalert(data.msg);
                    }
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });
        }
    }else{
        tools.interalert("参数不存在");return;
    }

    //限制输入多个0
    $(document).on("keyup", ".js_validator_int", function() {
        var str = this.value.replace(/^0+\d*/g, "0");
        this.value = str;
    });

    $scope.action = {
        save:function(){
            if(!$scope.form.fileName){
                return tools.interalert("请填写文件名称");
            }
            if(!$scope.form.sort){
                return tools.interalert("请填写序号");
            }
            if(!$scope.form.content){
                return tools.interalert("请填写内容");
            }
            if(!urlObj.id){
                reqUrl=siteVar.serverUrl + "/goodHopeSubjectData/save.shtml";
            }else{
                reqUrl=siteVar.serverUrl + "/goodHopeSubjectData/update.shtml";
            }
            $.ajax({
                type: "post",
                url: reqUrl,
                data: $scope.form,
                dataType: 'json',
                success: function(data){
                    if(data.success){
                        history.back(-1);
                    }else{
                        if(data.msg=='请求成功'){
                            history.back(-1);
                        }else{
                            tools.interalert(data.msg);
                        }
                    }
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });
        },
        cancel:function(){
            //$state.go("xinghuogoodhope-subject");
        }
    };
}
