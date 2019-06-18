'use strict';
function productEditController($scope, $q, $compile, $http, tools, DTOptionsBuilder, DTColumnBuilder, $location, $modal) {
    $scope.G = G;
    $scope.form = {
        isShow: $("#js_form").find(".form-group").length > 6,
        classId:'',
        productTagArr:[''],//首页标签Array
        contentProductTagArr:[''],//详情页标签Array
        propertyList:[],
        propertyList1:[],//首页属性列表
        propertyList2:[],//详情页属性列表
        thumbnail:'',//分享缩略图
        imgUrl:'',//标题图片Array 只有一项
        contentImgUrlArr:[],//详情图片Array
        articleArr:1,
        videoArr:2
    };
    $scope.select = {};
    /**
     * 初始化属性数组
     * **/

    $scope.form.propertyList1.length = 4;
    $scope.form.propertyList2.length = 8;




    /**
     * tab target代表当前tab
     * 通过控制dis属性的布尔值 来控制是否可点击
     * init 点击tab 初始化一些ui, 执行一次就行，下次tab切换就不用执行了
     */
    $scope.tab = {
        target:'basicInfo',//当前tab
        preTab:'',
        saveBasicInfo:false,//是否保存了基本信息，只有保存了才能点击其他tab
        disCharacter:true,
        disApartment:true,
        disEnvironment:true,
        disSalesData:true,
        disRelatedResources:true,
        callback:{
            character:function () {
                    var summernote = createSummernoteFactory('characterSummernote', 1);
                    $scope.action.getInfo(1).then(function (data) {
                        $scope.form.characterSummernote = data.productContent;
                        summernote(data.productContent)
                    })
            },
            apartment:function () {
                var summernote = createSummernoteFactory('apartmentSummernote', 1);
                $scope.action.getInfo(2).then(function (data) {
                    $scope.form.apartmentSummernote = data.productContent;
                    summernote(data.productContent)
                })
            },
            environment:function () {
                var summernote = createSummernoteFactory('environmentSummernote', 1);
                $scope.action.getInfo(3).then(function (data) {
                    $scope.form.environmentSummernote = data.productContent;
                    summernote(data.productContent)
                })
            },
            salesData:function () {
                var summernote = createSummernoteFactory('salesDataSummernote', 1);
                $scope.action.getInfo(4).then(function (data) {
                    $scope.form.salesDataSummernote = data.productContent;
                    summernote(data.productContent)
                })
            },
            relatedResources:(
                function () {
                    var flag = true;
                    return function () {
                        if(flag){
                            flag = false;
                            $http({
                                method: "POST",
                                url: G.server + "/class/getListByParentId.json",
                                data:$.param({
                                    parentId:0,
                                    type:1
                                }),
                            }).then(function (data) {
                                var info = data.data;
                                if(!info.success) {
                                    return alert(info.msg);
                                };
                                addAttr($scope, angular.element("#dataTables"), "datatable", true);

                                $scope.select.classIdArr2 = info.data;
                            });

                            $scope.action.selectClassId(10)
                        }
                    }
                }
            )()
        },
        leaveFn:function (target) {
            // var defer = $q.defer(), promise = defer.promise;
            if(target === 'basicInfo'){
                $scope.action.saveBasicInfo(true);
            }
            if(target === 'character'){
                $scope.action.saveInfo($scope.form.characterSummernote, 1, true)
            }
            if(target === 'apartment'){
                $scope.action.saveInfo($scope.form.apartmentSummernote, 2, true)
            }
            if(target === 'environment'){
                $scope.action.saveInfo($scope.form.environmentSummernote, 3, true)
            }
            if(target === 'salesData'){
                $scope.action.saveInfo($scope.form.salesDataSummernote, 4, true)
            }
            if(target === 'relatedResources'){
                 $scope.action.saveResources(true)
            }
            // return promise;

        }

    };


    /**
     * 获取产品详细
     * **/
    var search = $location.$$search;
    if(search.productId){
        $http({
            method: "POST",
            url: G.server + "/product/getById.json",
            data:$.param({
                productId:search.productId
            }),
        }).then(function (data) {
            var info = data.data;
            if(!info.success) {
                alert(info.msg);
            };
            return info.data;
        }).then(function (res) {
            if(!res || !res.classId){
                return null;
            }
            return $http({
                method: "POST",
                url: G.server + "/class/getListByParentId.json",
                data:$.param({
                    parentId:res.classId
                }),
            }).then(function (data) {
                var info = data.data;
                if(!info.success) {
                    alert(info.msg);
                };
                $scope.select.childClassIdArr = info.data;
                return res;
            });
        }).then(function (data) {
            $.extend($scope.form, data)

            $scope.form.showPosition = String($scope.form.showPosition ? $scope.form.showPosition : 0);

            $scope.form.contentProductTagArr = $scope.form.contentProductTags ? $scope.form.contentProductTags :[''];
            $scope.form.propertyList1 = $scope.form.propertyList.filter(function (item) {
                return item.propertityType == 1;
            });
            $scope.form.propertyList2 = $scope.form.propertyList.filter(function (item) {
                return item.propertityType == 2;
            });
            $scope.form.propertyList1.length = 4;
            $scope.form.propertyList2.length = 8;
            $scope.form.contentImgUrlArr = $scope.form.contentImgUrls ? $scope.form.contentImgUrls:[];

            $scope.form.articleArr = $scope.form.relationArticles ? $scope.form.relationArticles : [];
            $scope.form.videoArr = $scope.form.relationVideos ? $scope.form.relationVideos : [];


            disabledTab($scope.form.classId);
        });
    }

    /**
     * 获取分类信息
     * **/

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
        $scope.select.classIdArr = info.data;
    });



    $scope.action = {
        tab:function (e) {
            var target = e.target, $target = $(target), Li = $target.parent();
            if(target.nodeName === "A" && !Li.hasClass('disabled')){
                var t = $target.attr("data-target"), $TAB = $scope.tab;
                $TAB.preTab = $TAB.target;
                $TAB.target = t;
                $TAB.callback[t] && $TAB.callback[t]();
                if($TAB.preTab !== $TAB.target){
                    $TAB.leaveFn($TAB.preTab)
                }
            }

        },
        changeClassId:function (id) {
            if($scope.form.productId){
                disabledTab(id)
            }
            /**
             * 查询二级分类
             * **/
            if(id){
                $http({
                    method: "POST",
                    url: G.server + "/class/getListByParentId.json",
                    data:$.param({
                        parentId:id
                    }),
                }).then(function (data) {
                    var info = data.data;
                    if(!info.success) {
                        return alert(info.msg);
                    };
                    $scope.select.childClassIdArr = info.data;
                });
            }else{
                $scope.select.childClassIdArr = [];
            }
            $scope.form.childClassId = "";
        },
        selectClassId:function (id) {
            if(id){
                $http({
                    method: "POST",
                    url: G.server + "/class/getListByParentId.json",
                    data:$.param({
                        parentId:id
                    }),
                }).then(function (data) {
                    var info = data.data;
                    if(!info.success) {
                        return alert(info.msg);
                    };
                    $scope.select.childClassIdRescourceArr = info.data;
                });
            }else{
                $scope.select.childClassIdRescourceArr = [];
            }
            $scope.relatedResourcesForm.childClassId = "";
        },
        addListLabel:function () {
            var productTagArr = $scope.form.productTagArr;
            if(productTagArr.length < 3){
                productTagArr.push('');
            }
        },
        addDetailLabel:function () {
            var contentProductTagArr = $scope.form.contentProductTagArr;
            if(contentProductTagArr.length < 5){
                contentProductTagArr.push('');
            }
        },
        /**
         * 选择属性
         * 参数 type : 1 首页属性，2 列表属性
         * 参数 data ：当前输入框的 数据
         * 参数 index : 数组index
         * **/
        selectProperty:function (type, data, index) {
            var modalInstance = $modal.open({
                backdrop: true,
                backdropClick: true,
                dialogFade: false,
                keyboard: true,
                templateUrl : 'propertyModal.html',
                controller : propertyCtl,
                windowClass:'modal-640',
                resolve:{
                    data: function () {
                        return !!data ? JSON.parse(JSON.stringify(data)) : {};
                    },
                    propertityType:function () {
                        return type
                    }
                }
            });
            modalInstance.result.then(function (data) {
                if(data){
                    if(type === 1){
                        $scope.form.propertyList1[index] = data;
                    }
                    if(type === 2){
                        $scope.form.propertyList2[index] = data;
                    }

                }
            })
        },
        deleteLabel:function (type, index) {
            if(type === 1){
                $scope.form.propertyList1[index] = ""
            }
            if(type === 2){
                $scope.form.propertyList2[index] = ""
            }
        },
        /**
         * 上传标题图片
         * 参数 type ：0 所旅途1 标题图片 2 详情图片
         * **/
        uploadImg:function (inputDom, type) {
            var maxWidth = 0, maxHeight = 0;
            if(type === 0){
                maxWidth = 160;
                maxHeight = 160;
            }
            if(type === 1){
                maxWidth = 686;
                maxHeight = 296;
            }
            if(type === 2){
                maxWidth = 750;
                maxHeight = 560;
            }
            var check = createImgCheckFactory(maxWidth, maxHeight);

            //检验成功就上传，失败就弹窗提示
            check(inputDom).then(function (data) {
                var formData = new FormData();
                formData.append('image', data);
                formData.append('type', 1);
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
                            $scope.form.thumbnail = url;
                        }
                        if(type === 1){
                            $scope.form.imgUrl = url;
                        }
                        if(type === 2){
                            $scope.form.contentImgUrlArr.push(url);
                            if($scope.form.contentImgUrlArr.length > 6){
                                $scope.form.contentImgUrlArr.shift();
                            }
                        }
                        $scope.$apply();
                    },
                    error:function(data){

                    }
                });
            }, function (data) {

                alert(data);
            });



        },
        deleteImg:function (type, index) {
            if(type === 0){
                $scope.form.thumbnail = '';
            }
            if(type === 1){
                $scope.form.imgUrl = '';
            }
            if(type === 2){
                $scope.form.contentImgUrlArr.splice(index, 1);
            }
        },
        saveBasicInfo:function (disAlert) {
            var form = JSON.parse(JSON.stringify($scope.form));
            if(!form.productName){
                return alert("请输入产品名称！");
            }
            if(!form.classId){
                return alert("请选择一级分类！");
            }
            if(!form.childClassId){
                return alert("请选择二级分类！");
            }

            if(!form.showPosition){
                return alert("请选择是否首页展示！");
            }
            if(form.showPosition === '1' && !form.priority){
                return alert("输入首页展示顺序！");
            }
            form.productTag = arrSum(form.productTagArr);
            if(!form.productTag){
                return alert("请输入首页标签！");
            }
            form.contentProductTag = arrSum(form.contentProductTagArr);
            if(!form.contentProductTag){
                return alert("请输入详情标签！");
            }
            var temp1 = form.propertyList1.filter(function (item) {
                return !!item;
            });
            if(temp1.length === 0 ){
                return alert("请输入首页属性！");
            }
            if(temp1.length < 4 ){
                return alert("请输入4个首页属性！");
            }
            var temp2 = form.propertyList2.filter(function (item) {
                return !!item;
            });
            if(temp2.length === 0){
                return alert("请输入详情页属性！");
            }
            form.propertyList = form.propertyList1.concat(form.propertyList2);
            form.propertyList = form.propertyList.filter(function (item) {
                return !!item;
            });

            if(!form.thumbnail){
                return alert("请上传分享缩略图！");
            }
            if(!form.imgUrl){
                return alert("请上传标题图片！");
            }
            if(form.contentImgUrlArr.length === 0){
                return alert("请上传详情图片！");
            }
            form.contentImgUrl = form.contentImgUrlArr.join();

            if(!form.simpleContent){
                return alert("请输入分享简介！");
            }
            var url = '/product/save.json';
            if($scope.form.productId){
                url = '/product/update.json'
            }
            $http({
                method: "POST",
                url: G.server + url,
                data:form,
                headers:{
                    "Content-Type":'application/json;'
                }
            }).then(function (data) {
                var info = data.data;
                if(!info.success) {
                    return alert(info.msg);
                };
                if(info.data){
                    $scope.form.productId = info.data;
                }
                if(!disAlert){
                    alert("基本信息保存成功！");
                    if(info.data){
                        location.hash = '#/productEdit?productId=' + info.data;
                    }
                }
                disabledTab($scope.form.classId)
            });



        },
        //获取项目亮点等信息
        getInfo:function (contentType) {
            var defer = $q.defer(), promise = defer.promise, data = {
                productId:$scope.form.productId,
                contentType:contentType
            };
            $http({
                method: "POST",
                url: G.server + "/product/selectProductContent.json",
                data:$.param(data)
            }).then(function (data) {
                var info = data.data;
                if(!info.success) {
                    return alert(info.msg);
                };
                defer.resolve(info.data);
            });
            return promise
        },
        //保存项目亮点等信息
        saveInfo:function (content, type, disAlert) {
            var data = {
                productId:$scope.form.productId,
                contentType:type,
                productContent:content
            };
            $http({
                method: "POST",
                url: G.server + "/product/saveUpdateProductContent.json",
                data:$.param(data)
            }).then(function (data) {
                var info = data.data;
                if(!info.success) {
                    return alert(info.msg);
                };
                if(!disAlert){
                    alert('保存成功！');
                }
            });
        },
        /**
         * 删除选择的关联资源
         **/
        deleteResources:function (id,type) {
            var deleteFn = createDeleteArrOfObj('contentId');

            if(type === 1){
                deleteFn($scope.form.articleArr, id);
            }
            if(type === 2){
                deleteFn($scope.form.videoArr, id);
            }
        },
        /**
         * 保存关联资源
         * **/
        saveResources:function (disAlert) {
            // if($scope.form.articleArr.length === 0 && $scope.form.videoArr.length === 0){
            //
            //     return alert("请选择需要关联的资源！");
            // }
            var relationArticle = $scope.form.articleArr.map(function (item) {
                return item.contentId
            }).join(), relationVideo = $scope.form.videoArr.map(function (item) {
                return item.contentId
            }).join(), data = {
                productId:$scope.form.productId,
                relationArticle:relationArticle,
                relationVideo:relationVideo
            };
            $http({
                method: "POST",
                url: G.server + "/product/updateResource.json",
                data:$.param(data)
            }).then(function (data) {
                var info = data.data;
                if(!info.success) {
                    return alert(info.msg);
                };
                if(!disAlert){
                    alert('保存成功！')
                }
            });
        }
    };
    /**
     * 属性弹窗 Controller
     * **/
    function propertyCtl($scope, $modalInstance, data, propertityType) {

        $scope.form = data;
        $scope.form.propertityType = propertityType;
        $scope.close = function() {
            $modalInstance.close();
        };
        $scope.add = function () {
            if(!$scope.form.propertityName){
                return alert("请输入属性名！")
            }
            if(!$scope.form.propertityValue){
                return alert("请输入属性值！")
            }
            $modalInstance.close($scope.form)
        }
    }
    /**
     * angular 添加指令属性函数
     * **/
    function addAttr(scope, el, attrName, attrValue) {
        el.replaceWith($compile(el.clone().attr(attrName, attrValue))(scope));
    }
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
        var summernoteInstance = null;
        return function (content) {
            var contentBox = $("#" + id);
            if(summernoteInstance){
                contentBox.summernote('destroy')
            }
            summernoteInstance = contentBox.html(content || '').summernote({
                    height: 200,
                    minHeight: null,
                    maxHeight: null,
                    focus: true,
                    callbacks: {
                        onChange: function (contents, $editable) {
                            $scope.$apply(function () {
                                $scope.form[id] = contents;
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

    /**
     * 关联资源的表格
     * **/

    //关联资源查询数据
    $scope.relatedResourcesForm = {
        classId:10,
        status:1
    };
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax',{
        url: G.server + '/content/contentList.json',
        type: 'POST',
        data: $scope.relatedResourcesForm
    })
        .withDataProp('data')
        .withOption('createdRow', function(row, data, dataIndex) {
            angular.element(row).addClass("rows" + data.id)
        })
        .withOption('searching',false)
        .withOption('ordering',false)
        .withOption('serverSide',true)
        .withOption('processing',false)
        .withOption('scrollX',true)
        .withLanguage(tools.dataTablesLanguage)
        .withOption('fnDrawCallback', fnDrawCallback)
        .withPaginationType('simple_numbers');
    vm.dtColumns = [
        DTColumnBuilder.newColumn('contentId').withTitle('').withOption('sWidth','20px').renderWith(function(data, type, full) {
            return "<input class='selectResource' type='checkbox' value='" + data + "' data-name='" + full.title + "' data-type='" + full.contentType + "'>";
        }),
        DTColumnBuilder.newColumn('title').withTitle('标题').withOption('sWidth','120px'),
        DTColumnBuilder.newColumn('className').withTitle('一级分类').withOption('sWidth','100px'),
        DTColumnBuilder.newColumn('childClassName').withTitle('二级分类').withOption('sWidth','80px'),
        DTColumnBuilder.newColumn('contentTypeStr').withTitle('内容类型').withOption('sWidth','80px')
    ];
    $scope.action.search = function(){
        for(var prop in $scope.relatedResourcesForm){
            if(!$scope.relatedResourcesForm[prop]) delete $scope.relatedResourcesForm[prop];
        }
        var keysArr = Object.keys($scope.relatedResourcesForm);
        if(keysArr.length === 1 && keysArr[0] === 'status'){
            return tools.interalert('查询条件不能为空!')
        }
        vm.dtInstance.rerender();
    };

    function fnDrawCallback() {
        $("#dataTables").find("input[type='checkbox']").uniform();
        var table = $("#dataTables");
        table.off("change").on("change", ".selectResource", function () {
            if($(this).prop("checked")){
                var name = $(this).attr("data-name"),
                    type = $(this).attr("data-type"),
                    v = $(this).val(),
                    temp = {
                        contentId:v,
                        title:name
                    };
                var isExist = createIsExistArrOfObj('contentId');
                if(type == 1){
                    if(isExist($scope.form.articleArr, v)){
                        return alert("该资源已经添加！");
                    }
                    $scope.form.articleArr.push(temp);
                }
                if(type == 2 ){
                    if(isExist($scope.form.videoArr, v)){
                        return alert("该资源已经添加！");
                    }
                    $scope.form.videoArr.push(temp);
                }
                $scope.$apply();
            }
        })
    }


    /**
     * 切换分类 tab的 可点击
     * **/
    function disabledTab(id) {
        //移民 11 房产 10  财税 13 基金12
        var tab = $scope.tab;
        id = Number(id);
        if(id === 10 || id === 11){
            tab.disCharacter = tab.disApartment = tab.disEnvironment = tab.disSalesData = false;
        };
        if(id === 12 || id === 13){
            tab.disCharacter = false;
            tab.disApartment = tab.disEnvironment = tab.disSalesData = true;
        }
        tab.disRelatedResources = false;
    }
    /**
     * 成员是obj的数组，删除数组中某一项方法
     * **/
    function createDeleteArrOfObj(property) {
        return function (arr, value) {
            if(Object.prototype.toString.call(arr) !== '[object Array]'){
                return;
            }
            var len = arr.length;
            for(var i = len - 1; i > -1; i--){
                var item = arr[i], v = item[property];
                if(v == value){
                    arr.splice(i, 1);
                }
            }
            return arr;
        }
    }

    /**
     * 成员是obj的数组,某属性值，在数组中存在
     * **/
    function createIsExistArrOfObj(property) {
        return function (arr, value) {
            if(Object.prototype.toString.call(arr) !== '[object Array]'){
                return false;
            }
            var flag = false, len = arr.length;
            for(var i = 0; i < len; i++){
                var item = arr[i], v = item[property];
                if(v == value){
                   flag = true;
                   break;
                }
            }
            return flag;
        }
    }

    /**
     * 数组累加
     * **/
    function arrSum(arr) {
        var result = '', temp = null;
        temp = arr.filter(function (item) {
            return !!item;
        });
        result = temp.join();
        return result;
    }
}
