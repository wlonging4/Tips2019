'use strict';
function xinhuoContentController($scope, $http, getSelectListFactory, tools, DTOptionsBuilder, DTColumnBuilder) {
    $scope.form = {};
    $scope.select = {};
    $scope.action = {};
    $scope.cmstype = 0;
    $scope.flag = false;
    var selectList = getSelectListFactory.getSelectList(['biz_sys_route']);
    selectList.then(function(data){
        $scope.select.biz_sys_route = data.appResData.retList[0].biz_sys_route;

    });
    $http({
        method: "POST",
        url: siteVar.serverUrl + "/xinghuopageapi/getWebcmsType.json",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
            'X-Requested-With' :'XMLHttpRequest'
        }
    }).success(function(data, status) {
        $scope.select.webcmstype = data.appResData.departList;
    }).error(function(data, status) {
        //alert("获取分类列表失败，请与管理员联系。");
        return;
    });


    $scope.filerSource = function(e){
        return e.key != 4;
    };
    $scope.selectType = function(){
        var typeDom = $("#js_query_cmstype");
        $scope.cmstype = typeDom.val();

        if($scope.cmstype == 10 || $scope.cmstype == 11 || $scope.cmstype == 12){
            var reqData = $.param({type: $scope.cmstype});
            $http({
                method: "POST",
                url: siteVar.serverUrl + "/xinghuocontent/subWebcmsTypeSelector.shtml",
                data:reqData,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                    'X-Requested-With' :'XMLHttpRequest'
                }
            }).success(function(data, status) {
                var subWebcmstypelist = data.data.subWebcmstypelist;
                $scope.select.subtype = subWebcmstypelist;
            }).error(function(data, status) {
                alert("获取产品列表失败，请与管理员联系。");
                return;
            });
        }
    };
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/xinghuocontent/tableContent.shtml',
            type: 'POST',
            data: function(d){
                jQuery.extend(d,{
                   "orderColumn" : d.columns[d.order[0]["column"]]["data"],
                    "orderType" : d.order[0]["dir"]
                }, tools.getFormele({},$("#js_form")));
            }
        })
        .withDataProp('data')
        .withOption('createdRow', function(row, data, dataIndex) {
            angular.element(row).addClass("rows" + data.id)
        })
        .withOption('searching',false)
        .withOption('ordering',true)
        .withOption('serverSide',true)
        .withOption('processing',false)
        .withOption('scrollX',false)
        .withLanguage(tools.dataTablesLanguage)
        .withOption('fnDrawCallback', fnDrawCallback)
        .withPaginationType('simple_numbers')
        .withOption('order', [4, 'desc']);
    vm.dtColumns = [
        DTColumnBuilder.newColumn('id').withTitle('ID').withOption('sWidth','40px').notSortable(),
        DTColumnBuilder.newColumn('title').withTitle('标题').withOption('sWidth','120px').renderWith(function(data,type,full){
            return '<a href="javascript:;" data-href="/xinghuocontent/webcmsInfo.shtml?id=' + full.id + '" class="infoDetail ui_ellipsis" title="' + data + '">' + data + '</a>';
        }).notSortable(),
        DTColumnBuilder.newColumn('levelname').withTitle('理财经理').withOption('sWidth','120px').renderWith(function(data,type,full){
            if(!data) return "全部";
            return data;
        }).notSortable(),
        DTColumnBuilder.newColumn('typestr').withTitle('分类').withOption('sWidth','80px').notSortable(),
        DTColumnBuilder.newColumn('createtime').withTitle('发布时间').withOption('sWidth','140px').renderWith(function(data, type, full) {
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('status').withTitle('状态').withOption('sWidth','60px').renderWith(function(data, type, full) {
            return full.statusstr;
        }),
        DTColumnBuilder.newColumn('id').withTitle('操作').withOption('sWidth','80px').renderWith(function(data, type, full) {
            return '<div class="ui_center"><a href="#/xinghuocontent-editContent.html?id=' + data + '" class="btn btn-success btn-xs">修改</a>' + '<a href="javascript:;" data-href="/xinghuocontent/deletewebcms.shtml?id=' + data + '" class="btn btn-danger btn-xs js_content_delete">删除 </a></div>';
        }).notSortable()
    ];


    $scope.action.search = function(){
        if($scope.cmstype == 1){
            if(!$scope.flag){
                vm.dtColumns.splice(6, 0 , DTColumnBuilder.newColumn('newssrc').withTitle('来源').withOption('sWidth','120px').renderWith(function(data, type, full) {
                    if(!data) return "";
                    var arr = ["全部", "PC", "理财经理APP", "客户APP", "WAP"];
                    return arr[data];
                }).notSortable());
            }else{
                vm.dtInstance.rerender();
            };
            $scope.flag = true;
        }else{
            if($scope.flag){
                vm.dtColumns.splice(6, 1);
                $scope.flag = false;
            }else{
                vm.dtInstance.rerender();
            }
        };
    };

    ;(function(){
        $("#js_cms_category").multiSel({
            'data': [
                {"text": "店铺资讯", "value": "1", "default": false},
                {"text": "首页_公告", "value": "2", "default": false},
                {"text": "首页_星火资讯", "value": "4", "default": false},
                {"text": "首页_理财小知识", "value": "8", "default": false}
            ],
            "name": "consultationSubtype_"
        });
    })();
    function fnDrawCallback(){
        var table = $("#dataTables"), tbody = table.find("tbody");
        tools.createModal();
        tools.createModalProgress();
        var popUpLayer = $("#js_dialog"), popUpLayerContent = popUpLayer.find(".js_content");
        table.off("click").on("click", ".infoDetail", function(){
            var self = $(this), href = self.attr("data-href"), data, url;
            data = tools.queryUrl(href);
            url = href.split('?')[0];
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + url,
                data: data,
                dataType: "text",
                success: function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    popUpLayerContent.html(data);
                    popUpLayer.modal("show");
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            })
        });
        tbody.on("click", ".js_content_delete", function(){
            var self = $(this), href = self.attr("data-href"), data, url;
            data = tools.queryUrl(href);
            url = href.split('?')[0];
            if(!confirm("你确定要删除该资源！")) return false;
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + url,
                data: data,
                dataType: "json",
                success: function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    if(data.success){
                        return vm.dtInstance.rerender();
                    };
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });

        });
    }
}
