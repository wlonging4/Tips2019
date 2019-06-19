'use strict';
function editProject($scope, $timeout, $state, $http, $location, getSelectListFactory, tools, DTOptionsBuilder, DTColumnBuilder, $modal,$q) {
    $scope.form={};
    $scope.form = {
        salesId:'',
        logPermission:''
    };
    $scope.contentTitle = "销支人员录入";
    $scope.img = {};
    $scope.select={};
    var form=$('#editSales');
    var supportId = $location.$$search.supportId;
    //获取销支人员角色
    getSelectListFactory.getSelectList(['support_auth']).then(function (res) {
        $scope.select.logPermission = res.data[0].support_auth;
    });
    $scope.interalert=function (data) {
        $("#js_dialog_permission .js_content").html('<span class="ui_red">'+data+'</span>');
        $("#js_dialog_permission").modal("show");
        $("#js_dialog_permission .modal-dialog").css("top","-200px");
    };

    if(supportId){
        $scope.contentTitle = "销支人员信息编辑";
        $scope.form.supportId = supportId;
        var reqData = {
            'supportId': supportId
        };

        /**
         * 获取具体信息
         * **/
        $.ajax({
            url: siteVar.serverUrl + "support/getSupportById.json",
            data:{supportId: supportId},
            type:'POST',
            success:function (res) {
                var data = res.data;
                $scope.$apply(function () {
                    $scope.form.supportId = data.supportId;
                    $scope.form.supportMobile = data.supportMobile;
                    $scope.form.supportName = data.supportName;
                    $scope.form.supportWechat = data.supportWechat;
                    $scope.form.logPermission = data.logPermission;
                    $scope.form.supportEmail = data.supportEmail;

                    $scope.img.supportWechatQrcode = data.supportWechatQrcode;
                    $scope.img.supportHead = data.supportHead;
                    if($scope.img.supportWechatQrcode){$('.confirmImg1').show();}
                    if($scope.img.supportHead){$('.confirmImg2').show();}
                })
            },
            error:function () {
                $scope.interalert("获取信息失败，请与管理员联系！");
                history.back(-1);return;
            }
        })
    }

    $timeout(function(){
        form.find("input[type='radio']").uniform();
    }, 0);

    $scope.checkSize = function(obj){
        var self = obj, file = self.files[0];

        if(file.size > 120*1024){
            self.value = '';
            if(!supportId){
                $(obj).parent().siblings('.confirmImg').hide()
            }else{
                $(obj).parent().siblings('.confirmImg').find('img').attr('src',$(obj).hasClass('inputImg1')?$scope.img.supportWechatQrcode:$scope.img.supportHead);
            }
            return $scope.interalert("图片不合法，请重新上传！");
        }
        if(file.type != 'image/png' && file.type != 'image/jpg' && file.type != 'image/jpeg'){
            self.value = '';
            if(!supportId){
                $(obj).parent().siblings('.confirmImg').hide()
            }else{
                $(obj).parent().siblings('.confirmImg').find('img').attr('src',$(obj).hasClass('inputImg1')?$scope.img.supportWechatQrcode:$scope.img.supportHead);
            }
            return $scope.interalert("图片不合法，请重新上传！");
        }
        var reader = new FileReader();
        reader.onload = function(event) {
            var img = new Image();
            img.src = event.target.result;
            img.onload=function () {
                if(this.width!=300 || this.height!=300){
                    self.value = '';
                    if(!supportId){
                        $(obj).parent().siblings('.confirmImg').hide()
                    }else{
                        $(obj).parent().siblings('.confirmImg').find('img').attr('src',$(obj).hasClass('inputImg1')?$scope.img.supportWechatQrcode:$scope.img.supportHead);
                    }
                    return $scope.interalert("图片不合法，请重新上传！");
                }
                $(obj).parent().siblings('.confirmImg').find('img').attr('src',this.src);
                $(obj).parent().siblings('.confirmImg').show();
            };
        };
        reader.readAsDataURL(file);
    };

    $scope.action = {
        save:function(){
            if(!supportId){
                var  url = 'support/saveSupport.json';
            }else{
                var  url = 'support/updateSupport.json';
            }

            if(!$scope.form.supportName){
                $scope.interalert("请填写销支姓名！");return;
            }
            if(!$scope.form.supportMobile){
                $scope.interalert("请输入手机号！");return;
            }else{
                if(!(/^1[3,4,5,6,7,8,9]{1}[0-9]{9}$/.test($scope.form.supportMobile))){
                    $scope.interalert("请输入合法的手机号！");return;
                }
            }
            if(!$scope.form.logPermission){
                $scope.interalert("请选择销支角色！");return;
            }
            if(!$scope.form.supportWechat){
                $scope.interalert("请填写微信号！");return;
            }

            //判断新建是否有图片,编辑是否有原图片地址
            if(!supportId){
                 console.log($scope.form.qrcode)
                if(!$scope.form.qrcode){
                    $scope.interalert("请上传微信二维码图片！");return;
                }
                if(!$scope.form.head){
                    $scope.interalert("请上传头像图片！");return;
                }
            }else{
                if(!$scope.form.qrcode && !$scope.img.supportWechatQrcode){
                    $scope.interalert("请上传微信二维码图片！");return;
                }
                if(!$scope.form.head && !$scope.img.supportHead){
                    $scope.interalert("请上传头像图片！");return;
                }
            }

            if(!$scope.form.supportEmail){
                $scope.interalert("请填写邮箱！");return;
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
                        if(!supportId){
                            $scope.interalert("销支人员信息添加成功！");
                        }else{
                            $scope.interalert("销支人员信息编辑成功！");
                        }
                        $state.go("salesManage");
                    }
                }
            });
        },
        cancel:function(){
            history.back(-1);
        }
    };
}
