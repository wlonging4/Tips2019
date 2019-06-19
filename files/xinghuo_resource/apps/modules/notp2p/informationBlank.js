'use strict';
function informationBlank($scope,tools,$location,$modal, DTOptionsBuilder, DTColumnBuilder){
    var form = $("#js-form"),conditionItem = form.find(".form-group");
    $scope.form = {
        isShow: (conditionItem.length > 6) ? true : false
    };
    var absUrl = $location.$$absUrl.split("#")[0]; //url地址
    var params = $location.$$search;
    $scope.form.sesameCode = params.sesameCode;
    $scope.form.sesameName = params.sesameName;
    $scope.form.productId = params.id;
    $scope.action = {};
    //打开默认开放类型为用户可见
    //$scope.form.openType = '0,1';
    /*
     创建表格选项
     */
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax',{
        url: siteVar.serverUrl + '/sesamematerial/getSesameMaterialByProductId.json',
        type: 'POST',
        data: function(d){
            jQuery.extend(d, $scope.form);
        }
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
        .withOption('bPaginate',false)
        .withOption('bInfo',false)
        .withLanguage(tools.dataTablesLanguage)
        .withOption('fnDrawCallback', fnDrawCallback)
        .withPaginationType('simple_numbers');
    vm.dtColumns = [
        DTColumnBuilder.newColumn('materialName').withTitle('文件名称').withOption('sWidth', '150px').renderWith(function(data,type,full){
            if(!data) return "";
            return '<a href="javascript:void(0);" class="previewDetail" data-href="/sesamematerial/viewSesameMaterial.json?materialId=' + full.materialId + '&id='+full.id+'"> '+data+' </a>';
        }),
        DTColumnBuilder.newColumn('materialTypeDesc').withTitle('文件类型').withOption('sWidth','70px'),
        DTColumnBuilder.newColumn('updatetime').withTitle('更新时间').withOption('sWidth','140px').renderWith(function(data, type, full) {
            if(!data) return "";
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('openStageDesc').withTitle('开放阶段').withOption('sWidth', '500px'),
        DTColumnBuilder.newColumn('openTypeDesc').withTitle('开放类型').withOption('sWidth', '100px'),
        DTColumnBuilder.newColumn('materialSort').withTitle('排序').withOption('sWidth', '50px'),

        DTColumnBuilder.newColumn('id').withTitle('操作').withOption('sWidth','240px').renderWith(function(data, type, full) {
            var html = '';
            html += '<a href="javascript:void(0)" data-materialSort="'+full.materialSort+'" data-productId="'+full.productId+'" data-id="'+data+'" data-flag="0" data-toggle="popover" data-placement="left" class="btn btn-warning btn-xs js-sort" style="margin: 0 5px;">排序</a>';
            html += '<a href="javascript:void(0)" data-productId="'+full.productId+'" data-id="'+data+'" data-materialName="'+full.materialName+'" data-openStage="'+full.openStage+'" data-openType="'+full.openType+'" class="btn btn-danger btn-xs js-informationOpen" style="margin: 0 5px;">资料开放设置</a>';
            html += '<a href="javascript:void(0)" data-id="'+data+'" class="btn btn-success btn-xs js-modification" style="margin: 0 5px;">修改</a>';
            if( !full.openStage){
            html += '<a href="javascript:void(0)" data-id="'+data+'" class="btn btn-primary btn-xs js-delete" style="margin: 0 5px;">删除</a>';
            }
            return html;
        })
    ];
    //资料名称---详情
    function previewModalCtrl($scope,$timeout, info,$modalInstance){
        $scope.info = info;
        //取消
        $scope.close = function() {
            $modalInstance.close();
        };
    }
    //资料开放设置
    function materialSettleCtrl($scope,tools,$timeout,$modalInstance,id,productId,materialName,openStage,openType){
        $scope.form={
            "id":id,
            "productId":productId,
            "materialName":materialName,
            "openStage":openStage,
            "openType":openType
        };
        //取消
        $scope.close = function() {
            $modalInstance.close();
        };
        $timeout(function(){
            //多选按钮
            $("#multi_select1").multiSel({
                'name':"openType",
                'data': [
                    {"text": "用户可见", "value": "0", "default": (openType.indexOf("0") > -1 ? true : false)},
                    //{"text": "用户可见", "value": "0", "default":true},
                    {"text": "所有理财师可见", "value": "1", "default": (openType.indexOf("1") > -1 ? true : false)},
                    {"text": "白名单理财师可见", "value": "2", "default": (openType.indexOf("2") > -1 ? true : false),"disabled":true}
                ]
            });
            //多选按钮
            $("#multi_select2").multiSel({
                'name':"openStage",
                'data': [
                    {"text": "概要阶段（预约前产品详情中展示）", "value": "0", "default": (openStage.indexOf("0") > -1 ? true : false)},
                    {"text": "详情阶段（预约后订单详情中展示）", "value": "1", "default": (openStage.indexOf("1") > -1 ? true : false)},
                ]
            });
        }, 0);
        //checkbox
        //$scope.openCheck1 = openStage.indexOf("0")>-1 ? true : false;
        //$scope.openCheck2 = openStage.indexOf("1")>-1 ? true : false;
        //保存
        var submitFlag = true, saveData;
        $scope.save = function(){
            saveData=tools.getFormele({},$("#js-materialForm"));
            if(!saveData.openStage){
                saveData.openStage='';
            }
            if(!saveData.openType){
                saveData.openType='';
            }
            if(submitFlag){
                submitFlag = false;
                $.ajax({
                    type: "post",
                    url: siteVar.serverUrl + "/sesamematerial/editSesameMaterialOpenInfo.json",
                    data: saveData,
                    dataType: "json",
                    success: function(data){
                        submitFlag = true;
                        if(!tools.interceptor(data)) return;
                        if(data.success){
                            $scope.close();
                            alert("修改成功！");
                            vm.dtInstance.rerender();
                        }else{
                            alert(data.msg);
                        }

                    },
                    error: function(err){
                        submitFlag = true;
                        tools.ajaxError(err);
                    }
                })
            }
        };

    };
    //项目资料管理行新增
    $scope.action.addMaterial = function(e){
        var self= e.currentTarget;
        if(!tools.ajaxLocked(self)) return;
        var openWin = window.open('about:blank');
        $.ajax({
            type: "post",
            url: siteVar.serverUrl + "/sesamematerial/addSesameMaterialPage.json",
            success: function(res){
                tools.ajaxOpened(self);
                if(res.success){
                    var targetUrl=absUrl+'#/subject-addInformation.html?sesameCode='+$scope.form.sesameCode+'&sesameName='+$scope.form.sesameName+'&productId='+$scope.form.productId;

                    //var targetUrl='/newadmin2/index.html#/subject-addInformation.html?sesameCode='+$scope.form.sesameCode+'&sesameName='+$scope.form.sesameName+'&productId='+$scope.form.productId;
                    openWin.location.href = targetUrl;
                }else{
                    alert(res.msg);
                    openWin.close();
                }
            },
            error: function(err){
                openWin.close();
                tools.ajaxOpened(self);
                tools.ajaxError403(err);
            }
        });
    }
    //表格回调函数
    function fnDrawCallback(){
        //tools.createModal();
        //排序
        var table = $("#dataTables"), tbody = table.find("tbody");
        tbody.off("click").on("click", ".js-sort", function(){
            var self = $(this),flag = self.attr("data-flag");
            $.ajax({
                type:"post",
                url:siteVar.serverUrl +"/sesamematerial/sortSesameMaterialPage.json",
                success:function(data){
                    if(data.success){
                        if(flag == 0){
                            self.popover({
                                html: true,
                                title : '调整排序',
                                content : function(){
                                    var id = $(this).attr("data-id"),productId=$(this).attr("data-productId"),materialSort=$(this).attr("data-materialSort");
                                    var html = '<div class="btn-group-vertical js-box" role="group" aria-label="...">';
                                    html +='<div class="form-group col-lg-12">'+
                                        '<input type="text" value="'+materialSort+'" data-materialSort="'+materialSort+'" data-productId="'+productId+'" data-id="'+id+'" name="materialSort" ng-model="form.materialSort" class="form-control" placeholder="请输入序号，越小越靠前" maxlength="5">'+
                                        '</div>';
                                    html += '</div>';
                                    html += '<div style="text-align:right;border-top:1px solid #ccc;padding-top:10px;margin-top:10px;"><button class="btn btn-sm btn-danger js-submit">确定更改</button> <button class="btn btn-sm js-reset">取消更改</button>';
                                    return html;
                                }
                            }).popover('show');
                            self.attr("data-flag", 1)
                        };
                        return false;
                    }else{
                        alert(data.msg)
                    }
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError403(err);
                 }
            })

        });
        $(".js-sort").on('shown.bs.popover', function(){
            var siblingPop = $(this).next(".popover");
            $(".popover").each(function(){
                if($(this).attr("id") != siblingPop.attr("id")){
                    $(this).popover('hide');
                }
            });
        });
        tbody.on("click",".popover",function(e){
            e.stopPropagation();
        });
        tbody.on("click", ".js-box button", function(){
            var btns = $(this).parent().find("button");
            btns.removeAttr("current").removeClass("btn-primary");
            $(this).attr("current", true).addClass("btn-primary");
        });
        tbody.on("click",".js-submit",function(){
            var self = $(this), tr = self.parents("tr"), tds = tr.children(), parentTd = self.parents("td");
            var popup = parentTd.find(".js-sort");
            var currentBtn = self.parents(".popover-content").find('.form-control');

            if(!(/^\d+$/).test(currentBtn.val())){
                return alert("请输入序号，越小越靠前")
            }
            var id = currentBtn.attr("data-id"),productId=currentBtn.attr("data-productId"),materialSort=currentBtn.attr("data-materialSort");
            if(currentBtn.val() == materialSort){
                alert('输入序号和当前重复了，请重新输入！');
                return
            }
            var data = {
                id : id,
                productId:productId,
                materialSort:currentBtn.val()
            };
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + "/sesamematerial/sortSesameMaterial.json",
                data: data,
                dataType: "text",
                success: function(res){
                    tools.ajaxOpened(self);
                    var res = JSON.parse(res);
                    if(res.success){
                        //tds.eq(0).find(".js_settle_checkbox").attr("data-settletype",currentBtn.attr("data-nextSettleType"));
                        tds.eq(6).html(currentBtn.val());
                        currentBtn.attr("data-flag", 0);
                        vm.dtInstance.rerender();
                        //popup.attr("data-applyStatus",currentBtn.attr("data-nextapplyStatus"));
                    }else{
                        alert(res.msg);
                    }
                    popup.popover("hide");
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });
            return false;
        });
        tbody.on("click", ".js-reset",function(){
            var self = $(this), parentTd = self.parents("td"), popup = parentTd.find(".js-sort");
            popup.popover("hide");
        });
        //资料开放设置
        $('.js-informationOpen',tbody).off('click').on('click',function(){
            var self = $(this);
            if(!tools.ajaxLocked(self)) return;

            $.ajax({
                type: "get",
                url: siteVar.serverUrl + '/sesamematerial/editSesameMaterialOpenInfoPage.json',
                dataType: "text",
                success: function(data){
                    tools.ajaxOpened(self);
                    if(typeof data == 'string'){
                        var data = JSON.parse(data);
                    }
                    if(!tools.interceptor(data)) return;
                    if(data.success){
                        $modal.open({
                            backdrop: true,
                            backdropClick: true,
                            dialogFade: false,
                            keyboard: true,
                            templateUrl : 'materialSettle.html',
                            controller : materialSettleCtrl,
                            windowClass:'modal-640',
                            resolve:{
                                "id":function(){
                                    return self.attr("data-id");
                                },
                                "productId":function(){
                                  return self.attr("data-productId");
                                },
                                "materialName":function(){
                                    return self.attr("data-materialName");
                                },
                                "openStage":function(){
                                    return self.attr("data-openStage");
                                },
                                "openType":function(){
                                    return self.attr("data-openType");
                                }
                            }
                        });
                    }else{
                        alert(data.msg)
                    }
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError403(err);
                }
            })
        });
        //修改
        $(".js-modification",tbody).off("click").on("click",function(){
            var self=$(this);
            var openWin = window.open('about:blank');
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type:"post",
                url : siteVar.serverUrl +"/sesamematerial/updateSesameMaterialPage.json",
                success:function(data){
                    tools.ajaxOpened(self);
                    if(data.success){
                        var targetUrl=absUrl+'#/subject-addInformation.html?id='+self.attr('data-id')+'&productId='+$scope.form.productId+'&flag=true';
                        openWin.location.href = targetUrl;
                    }
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError403(err);
                }
            })
        });
        //删除
        $(".js-delete",tbody).off("click").on("click",function(){
            var self = $(this),id=self.attr("data-id");
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type:"post",
                url : siteVar.serverUrl +"/sesamematerial/deleteSesameMaterialPage.json",
                success:function(data){
                    var deleteFlag = confirm("删除是不可恢复的，你确认要删除吗？");
                    tools.ajaxOpened(self);
                    if(data.success && deleteFlag){
                        $.ajax({
                            type: "post",
                            url: siteVar.serverUrl + "/sesamematerial/deleteSesameMaterial.json",
                            data: {"id":id},
                            dataType: "json",
                            success: function(data){
                                if(!tools.interceptor(data)) return;
                                if(data.success){
                                    alert("删除成功！");
                                    vm.dtInstance.rerender();
                                }else{
                                    alert(data.msg);
                                }

                            },
                            error: function(err){
                                tools.ajaxError(err);
                            }
                        })
                    }
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError403(err);
                }
            });

        });
        //预览
        $(".previewDetail",table).off("click").on("click",function(){
            var self = $(this), href = self.attr("data-href"), data, url;
            data = tools.queryUrl(href);
            url = href.split('?')[0];
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + url,
                data: data,
                dataType: "json",
                success: function(data){
                    data.data.sesameCode=$scope.form.sesameCode;
                    data.data.sesameName=$scope.form.sesameName;
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    if(data.success){
                        //var info = $.extend({}, data.data.dbDto, data.data.httpDto);
                        $modal.open({
                            backdrop: true,
                            backdropClick: true,
                            dialogFade: false,
                            keyboard: true,
                            templateUrl : 'previewTemplate.html',
                            controller : previewModalCtrl,
                            resolve:{
                                "info" : function(){
                                    return data.data;
                                }
                            }
                        });
                    }else{
                        alert(data.msg);
                    }

                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError403(err);
                }
            })
        })
    }

    $(function(){
        //多选按钮
        var multi_select=$("#multi_select");
        multi_select.multiSel({
            'name':"openType",
            'data': [
                {"text": "用户可见", "value": "0", "default": false},
                {"text": "所有理财师可见", "value": "1", "default": false,"disabled":false},
                {"text": "白名单理财师可见", "value": "2", "default": false,"disabled":true}
            ],
            callbackChange: function() {
                $scope.form.openType = $("#multi_select").find("input[name='openType']").val();
                vm.dtInstance.rerender();
            }
        });

    })
}
