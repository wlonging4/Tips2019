'use strict';
function productController($scope, tools, DTOptionsBuilder, DTColumnBuilder, $http, $location, $modal,$q, EnumeratorCollection) {
    $scope.form = {
        createTimeBegin: tools.toJSYMD(new Date().getTime() - 60*60*24*1000*30),
        createTimeEnd:tools.toJSYMD(new Date().getTime())
    };

    $scope.select = {};

    EnumeratorCollection.getSelectList("ProductStatusEnum").then(function (data) {
        $scope.select.ProductStatusEnum = data.data.ProductStatusEnum;
    })
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
    $scope.selectClass = function () {
        if($scope.form.classId){
            $http({
                method: "POST",
                url: G.server + "/class/getListByParentId.json",
                data:$.param({
                    parentId:$scope.form.classId
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
    };

    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder
        .newOptions().withOption('ajax',{
            url: G.server + '/product/productInfoList.json',
            type: 'POST',
            data: $scope.form
        })
        .withDataProp('data')
        .withOption('searching',false)
        .withOption('ordering',false)
        .withOption('serverSide',true)
        .withOption('processing',false)
        .withOption('scrollX',true)
        .withLanguage(tools.dataTablesLanguage)
        .withOption('fnDrawCallback',fnDrawCallback)
        .withPaginationType('simple_numbers');
    vm.dtColumns = [
        DTColumnBuilder.newColumn('productId').withTitle('产品ID').withOption('sWidth','40px'),
        DTColumnBuilder.newColumn('productName').withTitle('产品名称').withOption('sWidth','80px').renderWith(function(data, type, full) {
            return '<a class="detailInfo" data-id="' + full.productId + '" href="javascript:void(0)">' + data + '</a>';
        }),
        DTColumnBuilder.newColumn('className').withTitle('一级分类').withOption('sWidth','60px'),
        DTColumnBuilder.newColumn('childClassName').withTitle('二级分类').withOption('sWidth','80px'),
        DTColumnBuilder.newColumn('productTag').withTitle('标签').withOption('sWidth','80px'),
        DTColumnBuilder.newColumn('productStatusStr').withTitle('状态').withOption('sWidth','60px').renderWith(function(data, type, full) {
            return '<span class="status">' + data + '</span>';
        }),
        DTColumnBuilder.newColumn('upTime').withTitle('上架时间').withOption('sWidth','140px').renderWith(function(data, type, full) {
            return '<span class="upTime">' + (full.productStatus == 1 ?  tools.toJSDate(data) : '') + '</span>';
        }),
        DTColumnBuilder.newColumn('productId').withTitle('操作').withOption('sWidth','140px').renderWith(function(data, type, full) {
            var str = full.productStatus === 1 ? '下架' : '上架';
            return '<a href="javascript:void(0)" class="btn btn-sm btn-danger handle" data-id="' + data + '" data-status="' + full.productStatus + '">' + str + '</a><a href="#/productEdit?productId=' + data + '"  class="btn btn-sm btn-primary">编辑</a><a title="点击【F12+手机图标】  进行预览~" href="' + full.previewUrl + '" target="_blank" class="btn btn-info btn-sm preview">预览</a>';
        })
    ];
    $scope.reset = function(){
        for(var prop in $scope.form){
            delete $scope.form[prop];
        }
        $scope.form.createTimeBegin = tools.toJSYMD(new Date().getTime() - 60*60*24*1000*30);
        $scope.form.createTimeEnd = tools.toJSYMD(new Date().getTime());
        vm.dtInstance.rerender();
    };
    $scope.search = function(){
        for(var prop in $scope.form){
            if(!$scope.form[prop]) delete $scope.form[prop];
        }
        var keysArr = Object.keys($scope.form);
        if(keysArr.length === 0){
            return tools.interalert('查询条件不能为空!')
        }
        vm.dtInstance.rerender();
    };



    function fnDrawCallback(){
        var table = $("#dataTables");
        table.off("click").on("click", ".detailInfo", function () {
            var productId = $(this).attr("data-id");
            $http({
                method: "POST",
                url: G.server + "/product/getById.json",
                data:$.param({
                    productId:productId
                }),
            }).then(function (data) {

                var info = data.data;
                if(!info.success) {
                    return alert(info.msg);
                };
                $modal.open({
                    backdrop: true,
                    backdropClick: true,
                    dialogFade: false,
                    keyboard: true,
                    templateUrl : 'detailModal.html',
                    controller : detailCtrl,
                    resolve:{
                        info:function () {
                            return info.data
                        }
                    }
                });
            });
        });

        table.on("click", ".handle", function () {
            var self = $(this),
                tr = self.parents('tr'),
                id = self.attr("data-id"),
                status = self.attr("data-status");

            $.ajax({
                url:G.server + "/product/putwayProduct.json",
                method:"POST",
                data:{
                    productId:id,
                    productStatus:status === '0'? '1':'0'
                },
                dataType:"json",
                success:function (res) {
                    if(!res.success){
                        alert(res.msg);
                    }
                    if(res.data){
                        tr.find(".upTime").html(tools.toJSDate(res.data))
                    }else{
                        tr.find(".upTime").html('')

                    }
                    var newStatusStr = status === '0'? '上架':'下架',
                        newTxt = status === '0'? '下架':'上架',
                        newStatus = status === '0'? '1':'0';
                    tr.find(".status").html(newStatusStr);
                    self.html(newTxt).attr("data-status", newStatus);
                }
            })

        });
        // table.on("click", ".preview", function () {
        //     var url = $(this).attr("data-url"),
        //         left = ($('body').width() - 414)/2;
        //     var previewWindow = window.open(url, '_blank', 'width=414px,height=736px,left=' + left);
        //     previewWindow.focus();
        //
        //
        //
        // });


    }
    function detailCtrl($scope, $modalInstance, info) {
        $scope.info = info;
        $scope.G = G;
        $scope.info.contentProductTagArr = $scope.info.contentProductTags ? $scope.info.contentProductTags :[];
        $scope.info.propertyList1 = $scope.info.propertyList.filter(function (item) {
            return item.propertityType == 1;
        });
        $scope.info.propertyList2 = $scope.info.propertyList.filter(function (item) {
            return item.propertityType == 2;
        });
        $scope.info.contentImgUrlArr = $scope.info.contentImgUrls ? $scope.info.contentImgUrls:[];

        $scope.info.articleArr = $scope.info.relationArticles ? $scope.info.relationArticles : [];
        $scope.info.videoArr = $scope.info.relationVideos ? $scope.info.relationVideos : [];
        console.log($scope.info.videoArr)
        console.log($scope.info.relationVideos)


        $scope.getInfo = function (contentType) {
            var defer = $q.defer(), promise = defer.promise, data = {
                productId:$scope.info.productId,
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
        };

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
                    var self = this;
                    $scope.getInfo(1).then(function (data) {
                        self.info.character = data.productContent || '暂无';
                    })
                },
                apartment:function () {
                    var self = this;
                    $scope.getInfo(2).then(function (data) {
                        self.info.apartment = data.productContent || '暂无';
                    })
                },
                environment:function () {
                    var self = this;
                    $scope.getInfo(3).then(function (data) {
                        self.info.environment = data.productContent || '暂无';
                    })
                },
                salesData:function () {
                    var self = this;
                    $scope.getInfo(4).then(function (data) {
                        self.info.salesData = data.productContent || '暂无';
                    })
                }
            }

        };
        $scope.tabAction = function (e) {
            var target = e.target, $target = $(target), Li = $target.parent();
            if(target.nodeName === "A" && !Li.hasClass('disabled')){
                var t = $target.attr("data-target"), $TAB = $scope.tab;
                $TAB.target = t;
                $TAB.callback[t] && $TAB.callback[t].apply($scope);
            }

        };
        disabledTab($scope.info.classId);
        $scope.close = function() {
            $modalInstance.close();
        };
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
    }
}
