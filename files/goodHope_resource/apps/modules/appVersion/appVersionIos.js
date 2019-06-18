'use strict';
var urlStr='';
var urlObj='';
function appVersionIosController($scope, $timeout,$modal,tools,$location) {
    $scope.dictionaryTitle=['好望角App【安卓】','好望角App【IOS】'];
    $scope.form={};
    $scope.select = {};
    $scope.action = {};
    $scope.list={};
    $scope.list.num=1;
    $scope.list.arr=[];
    $scope.form.checkDisable1=false;

    //下拉菜单查询更新类型key 15
    $.ajax({
        url : G.server + '/enums/get.json',
        type:"get",
        data : {key:15},
        success :function(data){
            tools.ajaxOpened(self);
            if(!tools.interceptor(data)) return;
            if(data.success){
                $scope.$apply(function () {
                    $scope.select.updatetypeenum=data.data;
                });
            }else{
                tools.interalert(data.msg);
            }
        }
    });

    if($location.url().indexOf("?") > -1){
        urlStr = $location.url().split("?")[1];
        urlObj = tools.serializeUrl(urlStr);
        if(!urlObj.appType){
            tools.interalert("参数非法");return;
        }

        if(urlObj.id){
            //编辑状态
            var data ={"id": urlObj.id};
            $('#t1').html('编辑APP版本');
            $('#t2').html('编辑APP版本');
            $.ajax({
                type: "post",
                url: G.server + "/appversion/getById.json",
                data:data,
                dataType : "json",
                success: function(data){
                    if(data.success){
                        $scope.$applyAsync(function () {
                            $scope.form=data.data;
                            $scope.form.versionNo2=$scope.form.preVersionNo;
                            $scope.form.rnVersionName2=$scope.form.preRnVersionName;
                            $scope.form.routeVersionName2=$scope.form.preRouteVersionName;
                            //判断是否为最新版本:0新版本不可编辑 1旧版本可编辑
                            if(!$scope.form.newStatus){
                                $scope.form.checkDisable1=true;
                            }
                            //把修改文案绑定上去
                            if($scope.form.updateDescList){
                                var listLen=$scope.form.updateDescList.length;
                            }
                            if(listLen){
                                for(var i=0;i<listLen;i++){
                                    $('#inputList input').eq(i).addClass('act').val($scope.form.updateDescList[i]);
                                }
                                $scope.list.num=listLen;
                                $scope.list.arr=$scope.form.updateDescList;
                            }else{
                                $('#inputList input').eq(0).addClass('act').val('');
                            }
                        })
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
            //新建状态
            //默认无需更新
            $scope.form.updateType=1;
            $scope.form.checkDisable1=true;
            $('#updateType').find('option').eq(0).html('无需更新');
            $.ajax({
                type: "post",
                url: G.server + "/appversion/selectNewAppVersion.json"+"?appType="+urlObj.appType,
                contentType : "application/json",
                dataType : "json",
                success: function(data){
                    if(data.success){
                        if(data.data && data.data!='null'){
                            $scope.form.versionNo2=data.data.versionNo;
                            $scope.form.rnVersionName2=data.data.rnVersionName;
                            $scope.form.routeVersionName2=data.data.routeVersionName;
                            $scope.$apply();
                        }
                    }else{
                        if(data.data){
                            tools.interalert(data.msg);
                        }
                    }
                },
                error:function (data) {
                    tools.interalert('error');
                    tools.interalert(data);
                }
            })
        }
        $scope.form.appType=urlObj.appType;
        $('#title1').html($scope.dictionaryTitle[Number(urlObj.appType)-1]);
    }else{
        tools.interalert("参数不存在");return;
    }


    //添加文案列表
    $('#inputAdd').click(function () {
        for(var i=0;i<$('#inputList input.act').length;i++){
            if(!$('#inputList input.act').eq(i).val()){
                tools.interalert('请完善文案后再添加新的一条');
                return;
            }
            $scope.list.arr[i]=$('#inputList input.act').eq(i).val();
        }
        $scope.list.num++;
        if($scope.list.num==10){$('#inputAdd').hide();}
        $('#inputList input').eq($scope.list.num-1).addClass('act');
    });
    $('#inputDelete').click(function () {
        $scope.list.num=1;
        $scope.list.arr=[];
        for(var i=0;i<$('#inputList input').length;i++){
            $('#inputList input').eq(i).removeClass('act');
            $('#inputList input').eq(i).val('');
        }
        $('#inputList input').eq(0).addClass('act');
    });

    //上传文件
    var formDataFile=null;
    $('#packageFile').change(function () {
        if(!$scope.form.versionNo){tools.interalert('请填写版本号');return}
        formDataFile=new FormData($("#appVersionIos1")[0]);
        $.ajax({
            type: "post",
            url: G.server + "/common/uploadFile.json",
            data:formDataFile,
            dataType: "json",
            processData: false,
            contentType: false,
            success: function(data){
                if(data.success){
                    $scope.form.rnFileUrl=data.data;
                    formDataFile=null;
                    $scope.$apply();
                }else{
                    tools.interalert(data.msg);
                }
            },
            error:function (data) {
                tools.interalert('error');
                tools.interalert(data);
            }
        })
    });
    $('#packageFile2').change(function () {
        if(!$scope.form.versionNo){tools.interalert('请填写版本号');return}
        formDataFile=new FormData($("#appVersionIos2")[0]);
        $.ajax({
            type: "post",
            url: G.server + "/common/uploadFile.json",
            data:formDataFile,
            dataType: "json",
            processData: false,
            contentType: false,
            success: function(data){
                if(data.success){
                    $scope.form.routeFileUrl=data.data;
                    $scope.$apply();
                }else{
                    tools.interalert(data.msg);
                }
            },
            error:function (data) {
                tools.interalert('error');
                tools.interalert(data);
            }
        })
    });


    $scope.action = {
        save: function(){
            //基础填写判断
            if(!$scope.form.versionNo){tools.interalert('请填写版本号');return}
            if(!$scope.form.updateType){tools.interalert('请填写更新类型');return}
            //生成修改文案数组
            $scope.list.arr=[];
            for(var i=0;i<$('#inputList input.act').length;i++){
                if($('#inputList input.act').eq(i).val()){
                    $scope.list.arr[i]=$('#inputList input.act').eq(i).val();
                }
            }
            $scope.form.updateDescList=$scope.list.arr;
            if(!$scope.form.updateDescList.length){tools.interalert('请填写更新文案');return}
            $scope.form2=JSON.stringify($scope.form);
            //编辑接口不用于新建
            if(urlObj.id){
                //编辑状态
                $.ajax({
                    type: "post",
                    url: G.server + "/appversion/update.json",
                    data:$scope.form2,
                    contentType : "application/json",
                    dataType : "json",
                    success: function(data){
                        if(data.success){
                            tools.interalert('编辑APP版本成功');
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
                //新建状态
                $.ajax({
                    type: "post",
                    url: G.server + "/appversion/save.json",
                    data: $scope.form2,
                    contentType : 'application/json',
                    dataType : "json",
                    success: function(data){
                        if(data.success){
                            tools.interalert('创建APP版本成功');
                            return history.back(-1);
                        }else{
                            tools.interalert(data.msg);
                        }
                    },
                    error:function (data) {
                        tools.interalert(data);
                    }
                })
            }
        }
    };
}