'use strict';
function editContent($scope, $timeout,$modal, $sce, $state, $http, $location, getSelectListFactory, tools, DTOptionsBuilder, DTColumnBuilder) {
    $scope.form = {
        "type" : 0,
        "consultationSubtype_" : {},
        "content" : ""
    };
    $scope.label = {
        l1:"",
        l2:""
    }
    $scope.select = {};
    $scope.img = {};
    $scope.action = {};
    $scope.pageTitle = '新建内容';
    var redirect = $location.$$search.redirect;
    var webcms = {}, form = $("#js_webcms_add_form"), contentBox = $("#summernote");
    getSelectListFactory.getSelectList(['biz_sys_route']).then(function(data){
        $scope.select.biz_sys_route = data.appResData.retList[0].biz_sys_route;
    }).then(function(){
        var id = $location.$$search.id;
        if(!id){
            $scope.form.bizSysRoute = 0;
        }
    });

    /**
     * 获取分类列表
     * **/
    $http({
        method: "POST",
        url: siteVar.serverUrl + "/xinghuopageapi/getWebcmsType.json",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
            'X-Requested-With' :'XMLHttpRequest'
        }
    }).success(function(data, status) {
        if($location.$$search.type == 8){
            $scope.select.webcmstype = (function(){
                var result = [];
                angular.forEach(data.appResData.departList, function(data, index, array){
                    if(data.key == 8){
                        result.push(data);
                    };
                });
                return result;
            })();
        }else{
            $scope.select.webcmstype = data.appResData.departList;
        }
        var id = $location.$$search.id;
        if(id){
            var reqData = $.param({id: id});
            $scope.form.id = id;
            $scope.pageTitle = '修改内容';
            /**
             * 获取具体信息
             * **/
            $http({
                method: "POST",
                url: siteVar.serverUrl + "/xinghuocontent/toeditwebcms.shtml",
                data:reqData,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                    'X-Requested-With' :'XMLHttpRequest'
                }
            }).success(function(data, status) {
                webcms = data.data.webcms;
                //console.log(webcms)
                $scope.form.title = webcms.title;
                $scope.form.type = webcms.type || '';
                $scope.typestr = webcms.typestr;
                $scope.select.newssrc = data.data.newsSrcs;
                $scope.select.products = data.data.products;
                $scope.select.subcategories = data.data.subtypes;
                $scope.select.userlevels = data.data.userlevels;
                $scope.form.createtime = webcms.createtime ? tools.toJSDate(webcms.createtime) : '';
                $scope.form.startTime = webcms.startTime ? tools.toJSDate(webcms.startTime) : '';
                $scope.form.endTime = webcms.endTime ? tools.toJSDate(webcms.endTime) : '';
                $scope.form.speaker = webcms.speaker;
                $scope.form.periods = webcms.periods;
                $scope.form.sortidx = webcms.sortidx;
                $scope.form.useOutUrl = (webcms.useOutUrl == 0) || webcms.outUrl;
                $scope.form.outUrl = webcms.outUrl;
                $scope.form.urlType = webcms.urlType;
                $scope.form.newssrc = webcms.newssrc || '';
                //$scope.newssrcArr = $scope.form.newssrc.split(",");

                $scope.form.levelid = webcms.levelid || '';
                $scope.form.desciption = webcms.desciption;
                $scope.form.intro = webcms.intro;

                $scope.form.strategyLable = webcms.strategyLable;
                var labelArr = (webcms.strategyLable || "").split(";");
                if(labelArr.length == 2){
                    $scope.label.l1 = labelArr[0];
                    $scope.label.l2 = labelArr[1];
                }else{
                    $scope.label.l1 = labelArr[0];
                };
                $scope.form.recommendIndex = webcms.recommendIndex;
                $scope.form.recommendInvestHot = webcms.recommendInvestHot;
                $scope.form.showTop = webcms.showTop;
                $scope.form.orderEndTime = webcms.orderEndTime ? tools.toJSDate(webcms.orderEndTime) : '';

                $scope.form.articleLead = webcms.articleLead;
                $scope.form.order = webcms.order;
                /**
                 * 子分类**/
                $scope.form.subcategory = webcms.subtype == null ? -1 : webcms.subtype;
                /**
                 * 二级分类**/
                $scope.form.secondaryCategory = webcms.subtype || '';

                $scope.img.uploadImgHref = webcms.bigImage;
                $scope.img.uploadImg = webcms.imgRealName;
                $scope.img.bigImage = webcms.bigImage;
                $scope.img.smallImage = webcms.smallImage;
                var status = webcms.status;
                $scope.status = function(value){
                    return status == value;
                };
                var subWebCmstypeInt = webcms.subWebCmstypeInt;
                $scope.consultation = function(value){
                    if(subWebCmstypeInt && subWebCmstypeInt.length){
                        return subWebCmstypeInt.indexOf(value) > -1;
                    };
                    return false;
                };
                $scope.form.bizSysRoute = webcms.bizSysRoute == null ? 0 : webcms.bizSysRoute;
                $scope.form.productid = webcms.productid || '';
                $scope.form.productname = webcms.productname;
                if($scope.form.productid){
                    $scope.chooseSubProduct();
                };
                if($scope.form.type == 10 || $scope.form.type == 11 || $scope.form.type == 12 || $scope.form.type == 47){
                    var reqData = $.param({type: $scope.form.type});
                    $http({
                        method: "POST",
                        url: siteVar.serverUrl + "/xinghuocontent/subWebcmsTypeSelector.shtml",
                        data:reqData,
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                            'X-Requested-With' :'XMLHttpRequest'
                        }
                    }).success(function(data, status) {
                        $scope.select.secondaryCategories = data.data.subWebcmstypelist;
                    }).error(function(data, status) {
                        alert("获取产品列表失败，请与管理员联系。");
                        return;
                    });
                };
                $scope.form.content = webcms.content;
                $timeout(function(){
                    $("input[type=checkbox], input[type=radio]").uniform();
                    if(!$scope.form.useOutUrl){
                        $scope.summernote($scope.form.content);
                    };
                    $(".form_exact_datetime").datetimepicker({
                        isRTL: Metronic.isRTL(),
                        format: "yyyy-mm-dd hh:ii",
                        autoclose: true,
                        todayBtn: true,
                        pickerPosition: (Metronic.isRTL() ? "bottom-right" : "bottom-left"),
                        minuteStep: 1,
                        language:"zh-CN"
                    }).on("changeDate", function (ev) {
                        $(ev.target).find("input").attr("flag", true);
                    }).on("hide", function(ev){
                        if( $(ev.target).find("input").attr("flag") == "true"){
                            var t = $(ev.target).find("input").val();
                            $(ev.target).find("input").val(t + ":00");
                        }
                    });
                    $scope.$watch("form.endTime", function(newValue, oldValue){
                        if(newValue){
                            var temp = (new Date(newValue)).getTime() - 1000*60;
                            $("#startTime").datetimepicker('setEndDate', new Date(temp));
                        }

                    });
                    $scope.$watch("form.startTime", function(newValue, oldValue){
                        if(newValue){
                            var temp = (new Date(newValue)).getTime() + 1000*60;
                            $("#endTime").datetimepicker('setStartDate',  new Date(temp));
                        }

                    });

                }, 0);

            }).error(function(data, status) {
                alert("获取信息失败，请与管理员联系。");
                return;
            });
        }else{
            $scope.form.id = '';
            $http({
                method: "POST",
                url: siteVar.serverUrl + "/xinghuocontent/toaddwebcms.shtml",
                data:reqData,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                    'X-Requested-With' :'XMLHttpRequest'
                }
            }).success(function(data, status) {
                $scope.form.type = 1;
                $scope.select.newssrc = data.data.newsSrcs;
                $scope.form.newssrc = "2";
                $scope.newssrcArr = [];
                $scope.select.products = data.data.products;
                $scope.select.subcategories = data.data.subtypes;
                $scope.select.userlevels = data.data.userlevels;


                $scope.img.uploadImg = false;
                $scope.img.bigImage = false;
                $scope.img.smallImage = false;
                var status = 0;
                $scope.status = function(value){
                    return status == value;
                };
                $scope.consultation = function(value){
                    return false;
                };
                if($scope.form.productid){
                    $scope.chooseSubProduct();
                };
                $timeout(function(){
                    $("input[type=checkbox], input[type=radio]").uniform();
                    if(!$scope.form.useOutUrl){
                        $scope.summernote('');
                    };
                }, 0);

            }).error(function(data, status) {
                alert("获取信息失败，请与管理员联系。");
                return;
            });
        }
    }).error(function(data, status) {
        alert("获取分类列表失败，请与管理员联系。");
        return;
    });


    $scope.filerSource = function(e){
        if($location.$$search.type == 8){
            return e.key == 1;
        }else {
            return e.key != 4;
        }
    };
    $scope.title = '';

    $scope.cancel = function(){
        if(redirect){
            $state.go(redirect);
        }else{
            $state.go("xinghuocontent-content");
        }
    };
    $scope.chooseType = function(){
        var typeDom = $("#js_webcms_product_selector");
        $scope.form.type = typeDom.val();
        var type = $scope.form.type;
        if(type == 10 || type == 11 || type == 12 || type == 47){
            var reqData = $.param({type: $scope.form.type});
            $http({
                method: "POST",
                url: siteVar.serverUrl + "/xinghuocontent/subWebcmsTypeSelector.shtml",
                data:reqData,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                    'X-Requested-With' :'XMLHttpRequest'
                }
            }).success(function(data, status) {
                $scope.select.secondaryCategories = data.data.subWebcmstypelist;
                $scope.form.secondaryCategory = ""
            }).error(function(data, status) {
                alert("获取产品列表失败，请与管理员联系。");
                return;
            });
        };
        /**
         * 子分类**/
        $scope.form.subcategory =  -1;
        if(type < 7 || type == 8){
            $scope.resetOutUrl();
            $scope.summernote('');
        }else{
            if(!$scope.form.useOutUrl){
                $scope.summernote('')
            };
        };
        /**
         * 渠道
         * **/
        if((type == 1) || (6 < type && type < 13) || (type == 22) || (type == 47)){
            $scope.form.newssrc = 1;
        }
        $timeout(function(){
            $("input[type=checkbox], input[type=radio]").uniform();
            $(".form_exact_datetime").datetimepicker({
                isRTL: Metronic.isRTL(),
                format: "yyyy-mm-dd hh:ii",
                autoclose: true,
                todayBtn: true,
                pickerPosition: (Metronic.isRTL() ? "bottom-right" : "bottom-left"),
                minuteStep: 1,
                language:"zh-CN"
            }).on("changeDate", function (ev) {
                $(ev.target).find("input").attr("flag", true);
            }).on("hide", function(ev){
                if( $(ev.target).find("input").attr("flag") == "true"){
                    var t = $(ev.target).find("input").val();
                    $(ev.target).find("input").val(t + ":00");
                }
            });
            $scope.$watch("form.endTime", function(newValue, oldValue){
                if(newValue){
                    var temp = (new Date(newValue)).getTime() - 1000*60;
                    $("#startTime").datetimepicker('setEndDate', new Date(temp));
                }

            });
            $scope.$watch("form.startTime", function(newValue, oldValue){
                if(newValue){
                    var temp = (new Date(newValue)).getTime() + 1000*60;
                    $("#endTime").datetimepicker('setStartDate',  new Date(temp));
                }

            });
        }, 0);

    };
    $scope.chooseSubProduct = function(){
        var id = $scope.form.productid;
        if(id){
            $http({
                method: "POST",
                url: siteVar.serverUrl + "/xinghuoproduct/subprducts/" + id + ".shtml",
                data:{},
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                    'X-Requested-With' :'XMLHttpRequest'
                }
            }).success(function(data, status) {
                $scope.select.subProduct = data.data;
                $scope.form.subproductid = webcms.subproductid || '';
                $scope.form.subproductname = webcms.subproductname;
            }).error(function(data, status) {
                alert("获取产品列表失败，请与管理员联系。");
                return;
            });
        }
    };

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
    /**
     * 使用外部URL
     * **/
    $scope.useOutUrl = function(){
        $scope.form.urlType = 1;
        $scope.showSummernote();
        $timeout(function(){
            $("input[type=radio]").uniform();
        }, 0);
    }

    /**
     * 文本编辑器相关 和 是否使用外链URL**/
    $scope.showSummernote = function(){
        if(!$scope.form.useOutUrl){
            $scope.summernote('');
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
                        $scope.form.content = contents;
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
        $scope.form.useOutUrl = false;
        $scope.form.outUrl = '';
        form.find("input[name='useOutUrl']").prop("checked", false).uniform();
    };
    function previewModalCtrl($scope, content, $modalInstance, $sce){
        $scope.content = $sce.trustAsHtml(content);
        $scope.close = function() {
            $modalInstance.close();
        };
    }
    $scope.preview = function(){
        var content = $scope.form.content;
        if(content.length == 0){
            return alert("请填写内容！")
        }
        $modal.open({
            backdrop: true,
            backdropClick: true,
            dialogFade: false,
            keyboard: true,
            templateUrl : 'previewModal.html',
            controller : previewModalCtrl,
            windowClass:'modal-640',
            resolve:{
                "content" : function(){
                    return content;
                }
            }
        });
    };


    /**
     * 保存**/
    $scope.save = function(){
        var type = $scope.form.type, url = '/xinghuocontent/modifyWebcms.shtml';
        if(!$scope.form.title){
            return alert("请填写标题！");
        };
        if(type == 10){
            if(!$scope.form.secondaryCategory){
                return alert("请填选择二级分类！");
            };
            if(!$scope.form.newssrc){
                return alert("请选择渠道！");
            };
            if(!$scope.form.articleLead){
                return alert("请填写导语！");
            }
        };


        if(type == 4 && !$scope.form.desciption){
            return alert("请填写别称");
        };
        if((type == 10 || type == 11) && !$scope.img.smallImage && !$scope.form.smallImageFile){
            return alert("请上传小图");
        };
        /**
         * 当分类为产品资讯时，必须选择产品**/
        if( type == 3 && !$scope.form.productid){
            return alert("请选择产品！");
        };
        /**
         * 当分类为帮助中心时，必须选择子分类、必须输入排序**/
        if(type == 6){
            if( $scope.form.subcategory <=-1){
                return alert("请选择子分类！");
            }
            if(!$scope.form.sortidx){
                return alert("请填写序列号！");
            }
        }
        if(type == 7){
            url = '/xinghuocontent/addXinghuoHuodong.shtml';
            if(!$scope.img.uploadImg){
                if(!$scope.form.uploadImg){
                    return alert("请选择上传图片!");
                }else if(!(/\.(jpg|jpeg|png|bmp)$/).test($scope.form.uploadImg.name)){
                    return alert("您上传的图片格式不对!");
                };
            };
            //if(!$scope.form.startTime || !$scope.form.endTime){
            //    return alert("请填写活动时间！");
            //};
            if(!$scope.form.orderEndTime){
                return alert("请填写预约截止时间！")
            }
            if(!$scope.form.intro){
                return alert("请填写活动简介")
            }
        };
        if(type == 47){
            url = '/xinghuocontent/addXinghuoHuodong.shtml';
            if(!$scope.form.secondaryCategory){
                return alert("请填选择二级分类！");
            };
            if(!$scope.form.newssrc){
                return alert("请选择渠道！");
            };
            if(!$scope.img.uploadImg){
                if(!$scope.form.uploadImg){
                    return alert("请选择上传图片!");
                }else if(!(/\.(jpg|jpeg|png|bmp)$/).test($scope.form.uploadImg.name)){
                    return alert("您上传的图片格式不对!");
                };
            };
            //if(!$scope.form.startTime || !$scope.form.endTime){
            //    return alert("请填写活动时间！");
            //};
            if(!$scope.form.orderEndTime){
                return alert("请填写预约截止时间！");
            }
            if(!$scope.form.intro){
                return alert("请填写活动简介")
            }

        };
        if(!!$scope.form.id){
            form.find("input[name='id']").val($scope.form.id);
        };
        //标签
        if(type == 47 || type == 10){
            var label = $scope.label;
            if(label.l1 && !label.l2){
                form.find("input[name='strategyLable']").val(label.l1);
            }else if(!label.l1 && label.l2){
                form.find("input[name='strategyLable']").val(label.l2);
            }else if(label.l1 && label.l2){
                form.find("input[name='strategyLable']").val(label.l1 + ";" + label.l2);
            }else{
                form.find("input[name='strategyLable']").val("");
            }
        }
        if(type != 22){

            if((type == 7) || (8 < type && type < 13) || (type == 47)){
                if($scope.form.useOutUrl && !$scope.form.outUrl){
                    return alert("请填写外部URL！");
                };
                if($scope.form.useOutUrl && !$scope.form.outUrl.match(/((http|ftp|https):\/\/)?[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:/~\+#]*[\w\-\@?^=%&amp;/~\+#])?/g)){
                    return alert("请填写正确格式的外部URL！")
                };
                if(!$scope.form.useOutUrl && contentBox.summernote('isEmpty')){
                    return alert("内容不能为空");
                };
            }else{
                if(contentBox.summernote('isEmpty')){
                    return alert("内容不能为空");
                };
            };
            /**
             * 表单提交时 赋值**/
            //if(!$scope.form.useOutUrl){
            //    form.find("input[name='content']").val(contentBox.summernote('code'));
            //    $scope.form.content = contentBox.summernote('code');
            //};
        };
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
                $("#js_dialog_progress").modal("hide");
                if(!tools.interceptor(data)) return;
                if(data.success){
                    alert("内容添加成功！");
                    if(redirect){
                        $state.go(redirect);
                    }else{
                        $state.go("xinghuocontent-content");
                    }
                }
            }

        });

    };
}
