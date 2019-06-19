'use strict';
function editOpenClass($scope,getSelectListFactory, $timeout,$modal,tools,$location,$q) {
    $scope.form={};
    $scope.img={};
    $scope.count={
        teacherInfoNum:0,
        classInfoNum:0
    };
    var form = $("#js_openClassEdit");
    $scope.form = {
        //0 :无效 不置顶 不推荐;1 :有效 置顶 推荐
        //默认:推荐 不指定 有效 课程类型1:页面
        recommend:1,
        playUrlType:1,
        isTop:0,
        status:1
    };

    $scope.select = {};
    $scope.action = {};
    //获取课程状态
    var defer = $q.defer();
    $.ajax({
        url: siteVar.serverUrl+'/xinghuopageapi/getEnumValues.json',
        method: 'POST',
        data: {
            keyNames:"ClassTypeEnum,PlayUrlTypeEnum",
            packageName:"com.creditease.xinghuo.service.openclass.api.enums"
        }
    }).then(function(data){
        defer.resolve(data);
        $timeout(function () {
            $scope.select.classType = data.data.ClassTypeEnum;
            $scope.select.playUrlType = data.data.PlayUrlTypeEnum;
        },0);
    },function(error){
        defer.reject(error);
    });

    //检验图片尺寸
    $scope.checkSize = function(obj){
        var self = obj, file = self.files[0];
        /*if(file.size > 150*1024){
            self.value = '';
            return tools.interalert(" 图片文件过大，图片文件控制150KB以内");
        }*/
        var reader = new FileReader();
        reader.onload = function(event) {
            var img = new Image();
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    };
    //编辑框数字动态变化
    $('#classInfo').on('keyup',function () {
        var val=$(this).val().split('').length;$timeout(function () {$scope.count.classInfoNum=val;},0);
    });
    $('#teacherInfo').on('keyup',function () {
        var val=$(this).val().split('').length;$timeout(function () {$scope.count.teacherInfoNum=val;},0);
    });

    //2.1编辑内容
    if($location.url().indexOf("?") > -1){
        var urlStr = $location.url().split("?")[1];
        var urlObj = tools.serializeUrl(urlStr);
        if(!urlObj.classId){
            tools.interalert("参数非法");
        }
        $scope.form.classId = urlObj.classId;
        //修改标题名称
        $('#pageTitle').html('修改公开课');
        //修改列表内容
        $.ajax({
            type: "post",
            url: siteVar.serverUrl + "/openclass/getOpenClassById.shtml",
            data: {'classId':$scope.form.classId},
            //dataType: "json",
            success: function(data){
                console.log(data);
                if(data.success){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    $scope.form = data.data;
                    $scope.img.adUrl=$scope.form.adUrl;$scope.img.teacherHead=$scope.form.teacherHead;
                    $scope.$apply(function () {
                        //0 :无效 不置顶 不推荐;1 :有效 置顶 推荐
                        //默认:推荐 不指定 有效 课程类型1:页面
                       /* if($scope.form.applyProductFlag==1){
                            $('.proFlagRadio2').parent().addClass('checked');$('.proFlagRadio1').parent().removeClass('checked');
                        }else{
                            $('.proFlagRadio1').parent().addClass('checked');$('.proFlagRadio2').parent().removeClass('checked');
                        }*/
                        $timeout(function(){
                            $("#js_openClassEdit").find("input[type='radio']").uniform();
                        }, 0);
                        //编辑框初始化自动计算
                        var val=$scope.form.classInfo.split('').length;$timeout(function () {$scope.count.classInfoNum=val;},0);
                        var val2=$scope.form.teacherInfo.split('').length;$timeout(function () {$scope.count.teacherInfoNum=val2;},0);
                    });
                }
            },
            error: function(err){
                tools.ajaxOpened(self);
                tools.ajaxError(err);
            }
        });
    }

    $scope.action = {
        save: function(){
            //基础填写判断
            if(!$scope.form.title){tools.interalert('主标题不能为空！');return}
            if(!$scope.form.subTitle){tools.interalert('副标题不能为空！');return}
            if($location.url().indexOf("?classId") <= -1){
                if(!$scope.form.adFile){tools.interalert('广告图不能为空！');return}
            }else{
                if(!$scope.form.adUrl&&!$scope.form.adFile){tools.interalert('广告图不能为空！');return}
            }
            if(!$scope.form.teacher){tools.interalert('讲师不能为空！');return}
            if($location.url().indexOf("?classId") <= -1){
                if(!$scope.form.headFile){tools.interalert('讲师头像不能为空！');return}
            }else{
                if(!$scope.form.teacherHead&&!$scope.form.headFile){tools.interalert('讲师头像不能为空！');return}
            }
            if(!$scope.form.teacherInfo){tools.interalert('讲师介绍不能为空！');return}
            if(!$scope.form.classInfo){tools.interalert('课程简介不能为空！');return}
            if(!$scope.form.startTime){tools.interalert('开讲时间不能为空！');return}
            if(!$scope.form.duration){tools.interalert('课件时长不能为空！');return}
            /*if(!$scope.form.playPassword){tools.interalert('播放密码不能为空！');return}*/
            if(!$scope.form.playUrl){tools.interalert('播放URL不能为空！');return}
            if(!$scope.form.classType){tools.interalert('课程状态不能为空！');return}


            var data = new FormData(form[0]);
            //编辑接口不用于新建
            if($location.url().indexOf("?classId") > -1){
                $.ajax({
                    type: "post",
                    url: siteVar.serverUrl + "/openclass/updateOpenClass.shtml",
                    //data: $scope.form,
                    data: data,
                    /*contentType : "application/json",
                    dataType : "json",*/
                    processData: false,
                    contentType: false,
                    success: function(data){
                        if(data.success){
                            tools.interalert('修改公开课成功！');
                            return history.back(-1);
                        }else{
                            tools.interalert(data.msg);
                            //页面报错完不回跳
                            //return history.back(-1);
                        }
                    },
                    error:function (data) {
                        alert('error');
                        alert(data);
                    }
                })
            }else{
                console.log($scope.form);
                $.ajax({
                    type: "POST",
                    url: siteVar.serverUrl + "/openclass/saveOpenClass.shtml",
                    //data: $scope.form,
                    data: data,
                    //contentType : "application/json",
                    //dataType : "JSON",
                    processData: false,
                    contentType: false,
                    success: function(data){
                        if(data.success){
                            tools.interalert('新建公开课成功！');
                            return history.back(-1);
                        }else{
                            tools.interalert(data.msg);
                            //页面报错完不回跳
                            //return history.back(-1);
                        }
                    },
                    error:function (data) {
                        //alert('error');
                        alert(data);
                    }
                })
            }
        }
    };
}