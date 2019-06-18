'use strict';
function adEditController($scope,$timeout, $state, $http, $location, tools) {
    $scope.G=G;
    $scope.form = {
        //有效1；无效0
        status:1,
        //1页面，2视频，3图片，4文件
        linkUrlType:1,
        //首页1
        layout:1,
        //1APP，2PC
        channel:1
    };
    $scope.select = {};
    $scope.action = {};

    $timeout(function () {
        $('input[type="radio"]').uniform();
    });

    $scope.pageTitle = "好望角-新增广告";
    $scope.img = {};
    var bannerId = $location.$$search.bannerId;
    var form = $("#editProjecForm");

    if(bannerId){
        $scope.pageTitle = "好望角-编辑广告";
        var reqData = $.param({bannerId: bannerId});
        $scope.form.bannerId = bannerId;

        /**
         * 获取具体信息
         * **/
        $http({
            method: "POST",
            url: G.server + "/banner/bannerInfo.json",
            data:reqData,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                'X-Requested-With' :'XMLHttpRequest'
            }
        }).success(function(data, status) {
            var data = data.data;
            $scope.form.name = data.name;
            $scope.img.imagePath = data.imagePath;
            $scope.form.layout = data.layout;
            $scope.form.channel = data.channel;
            $scope.form.startTime = data.startTime;
            $scope.form.endTime = data.endTime;
            $scope.form.linkUrl = data.linkUrl;
            $scope.form.linkUrlType = data.linkUrlType;
            $scope.form.priority = data.priority;
            $scope.form.status = data.status;
            $timeout(function () {
                $('input[type="radio"]').uniform();
            });
        }).error(function(data, status) {
            return tools.interalert("获取信息失败，请与管理员联系!");
        });
    }

    $scope.action = {
        save:function(){
            var url;
            if(!bannerId){
                url ='/banner/saveBanner.json';
            }else{
                url ='/banner/updateBanner.json';
            }

            if(!$scope.form.name){tools.interalert("请填写广告名称！");return;}
            //判断新建是否有图片,编辑是否有原图片地址
            if(!bannerId){
                if(!$scope.form.image){
                    tools.interalert("请选择图片！");return;
                }
            }else{
                if(!$scope.img.imagePath){
                    tools.interalert("请选择图片！");return;
                }
            }
            if(!$scope.form.layout){tools.interalert("请选择版位！");return;}
            if(!$scope.form.channel){tools.interalert("请选择渠道！");return;}
            if(!$scope.form.startTime){tools.interalert("请填写生效时间！");return;}
            if(!$scope.form.endTime){tools.interalert("请填写截止时间！");return;}
            if(Date.parse($scope.form.startTime) >= Date.parse($scope.form.endTime)){
                tools.interalert("截止时间不得小于生效时间！");return;
            }
            //状态+url类型不用判断,新建有默认值
            if(!$scope.form.priority){tools.interalert("请填写显示顺序！");return;}

            var data = new FormData(form[0]);
            $.ajax({
                url : G.server + url,
                type:"POST",
                data : data,
                processData: false,
                contentType: false,
                success :function(data){
                    if(typeof data == "string"){
                        var data = JSON.parse(data);
                    }
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    if(data.success){
                        if(!bannerId){
                            tools.interalert("新增广告成功！");
                        }else{
                            tools.interalert("编辑广告成功！");
                        }
                        $state.go("adManage");
                    }
                }
            });
        },
        cancel:function(){
            $state.go("adManage");
        }
    };

    $(document).on("keyup", ".js_validator_int", function() {
        var str = this.value.replace(/\D/g, "");
        this.value = str;
    });

    $scope.checkSize = function(obj){
        var self = obj, file = self.files[0];
        if(file.size > 750*320){
            //self.value = '';
            //return tools.interalert(" 图片文件过大，请控制750*320以内！");
        }

        var reader = new FileReader();
        reader.onload = function(event) {
            var img = new Image();
            img.src = event.target.result;
            img.onload=function () {
                if(img.width>750){
                    self.value = '';
                    return tools.interalert('图片高度不能大于750像素!')
                }
                if(img.height>320){
                    self.value = '';
                    return tools.interalert('图片高度不能大于320像素!')
                }
            }
        };
        reader.readAsDataURL(file);
    };
}
