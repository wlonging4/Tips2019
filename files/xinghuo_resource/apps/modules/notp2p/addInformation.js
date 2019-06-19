'use strict';
function addInformation($scope, $timeout,  $location, tools,getSelectListFactory) {
    var form = $("#js_form"), contentBox = $("#summernote"),checkBox=$('#useUrl',form);

    $scope.form={},$scope.select={};
    $scope.id=$location.$$search.id;
    $scope.form.productId=$location.$$search.productId;
    $scope.flag=$location.$$search.flag;
    $scope.form.sesameCode=$location.$$search.sesameCode;
    $scope.form.sesameName=$location.$$search.sesameName;
    //枚举
    getSelectListFactory.getselectp2p('MaterialType').then(function(data){
        $scope.select.fileType = data.data.MaterialType;
    });
    /**
     * 文本编辑器相关 和 是否使用外链URL**/
    $scope.showSummernote = function(content){
        $scope.form.useUrl = $scope.form.useUrl?true:false;
        if(!$scope.form.useUrl){
            if(!content){
                $scope.summernote('');
            }else{
                $scope.summernote(content);
            }

        }else{
            $scope.removeSummernote();
        };
    };
    $scope.summernote = function(content){
        contentBox.html(content).summernote({
            height: 200,
            minHeight: null,
            maxHeight: null,
            focus: true,
            callbacks:{
                onChange: function(contents, $editable) {
                    $scope.$apply(function(){
                        $scope.form.materialContent = contents;
                    })
                }
            }
        });
    };
    $scope.removeSummernote = function(){
        contentBox.summernote('destroy');
        contentBox.prop('disabled', true );
        contentBox.html('');
    };
    $scope.resetOutUrl = function(){
        $scope.form.useUrl = false;
        $scope.form.materialUrl = '';
        checkBox.prop("checked", false).uniform();
        checkBox.parent().removeClass('checked');
    };
    /*修改-调用数据*/
    if($scope.flag){
        $.ajax({
            type: "post",
            url: siteVar.serverUrl + "/sesamematerial/toUpdateSesameMaterial.json",
            data: {"id":$scope.id},
            dataType: "json",
            success: function(data){
                if(!tools.interceptor(data)) return;
                if(data.success){
                    $timeout(function(){
                        $scope.form=data.data;
                        $scope.materialSort = data.data.materialSort;
                        if(!data.data.useUrl){
                            $scope.summernote(data.data.materialContent);
                            data.data.useUrl=false;
                        }else{
                            checkBox.parent().addClass('checked');
                            checkBox.prop("checked", true).uniform();
                            data.data.useUrl=true;
                        }

                    },0);
                }else{
                    alert(data.msg);
                }

            },
            error: function(err){
                $scope.form=data.data;
                tools.ajaxError(err);
            }
        })
    }else{
        $scope.showSummernote();
    }




    //取消
    $scope.cancel = function(){
        window.location='#subject-informationBlank.html?id='+$scope.form.productId+'&sesameCode='+$scope.form.sesameCode+'&sesameName='+$scope.form.sesameName
    };

    //保存
    $scope.save = function(e){
        var self= e.currentTarget,submitData=tools.getFormele({},form);
        if(!submitData.materialName){
            alert("文件名称不能为空！");
            return false;
        }
        if(!submitData.materialType){
            alert("文件类型不能为空！");
            return false;
        }
        if(!(/^\d+$/).test(submitData.materialSort)){
            return alert("请输入序号，越小越靠前")
        }
        $scope.form.useUrl=$scope.form.useUrl?1:0;
        if(!tools.ajaxLocked(self)) return;
        $.ajax({
            type: "post",
            url: siteVar.serverUrl + "/sesamematerial/addSesameMaterial.json",
            data:$scope.form,
            success: function(data){
                tools.ajaxOpened(self);
                if(data.success){
                    $scope.cancel();
                }else{
                    alert(data.msg);
                }
            },
            error: function(err){
                tools.ajaxOpened(self);
                tools.ajaxError(err);
            }
        });

    }
}

