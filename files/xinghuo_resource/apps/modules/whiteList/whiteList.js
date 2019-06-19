'use strict';
function whiteList($scope, $window, $modal, getSelectListFactory, tools, DTOptionsBuilder, DTColumnBuilder) {
    var form = $("#js_form"), conditionItem = form.find(".form-group");
    $scope.form = {
        isShow: (conditionItem.length > 0) ? true : false
    };
    $scope.action = {};

    //getSelectListFactory.getSelectList(['yixinusertype','biz_sys_route']).then(function(data){
    //    $scope.select.q_yixinusertype = data.appResData.retList[0].yixinusertype;
    //    $scope.select.bizSysRoute = data.appResData.retList[1].biz_sys_route;
    //});

    $scope.select={
        "buyType":{
            "10":"独立个人",
            "20":"推荐人团队",
            "30":"推荐人个人",
            "40":"合伙人团队"
        }
    };





    /*
     创建表格选项
     */
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax',{
            url:  siteVar.serverUrl + '/mt/queryManageLeader.shtml',
            type: 'POST',
            data: function(d){
                jQuery.extend(d, tools.getFormele({}, form));
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
        .withOption('scrollX',false)
        .withLanguage(tools.dataTablesLanguage)
        .withOption('fnDrawCallback', fnDrawCallback)
        .withPaginationType('simple_numbers');
    vm.dtColumns = [
        //DTColumnBuilder.newColumn('id').withTitle("<label><input type='checkbox' id='whiteListChooseAll'>全选</label>").withOption('sWidth', '60px').renderWith(function(data, type, full) {
        //    return '<div class="ui_center"><label class="checkbox-inline"><input type="checkbox" class="whiteListCheckbox" value="' + data + '"></label></div>';
        //}),
        DTColumnBuilder.newColumn('id').withTitle('团队长ID').withOption('sWidth','100px').renderWith(function(data, type, full) {
            if(!data) return "";
            return '<a href="javascript:void(0);" class="infoDetail" data-href="/xinghuouser/userinfo.shtml?userType=director&id=' + data + '">' + data + '</a>';
        }),
        DTColumnBuilder.newColumn('realname').withTitle('团队长姓名').withOption('sWidth','80px'),
        DTColumnBuilder.newColumn('mobile').withTitle('团队长手机号').withOption('sWidth','100px'),
        DTColumnBuilder.newColumn('consumerNum').withTitle('客户数').withOption('sWidth', '60px').renderWith(function(data, type, full) {
            if(!data) return "";
            return '<a href="#/xinghuosite-managerRec.html?id=' + full.id + '">' + data + '</a>';
        }),
        DTColumnBuilder.newColumn('yixinstatusstr').withTitle('是否为宜信员工').withOption('sWidth','120px').renderWith(function(data, type, full) {
            if(!data) return "";
            var detail = "";
            if(full.yixintypestr && full.yixintypestr.length > 0) {
                    detail = "，" + full.yixintypestr;
            };
            return data + detail;
        }),
        DTColumnBuilder.newColumn('createTimeStr').withTitle('注册时间').withOption('sWidth','130px'),
        DTColumnBuilder.newColumn('businessType').withTitle('业务类型').withOption('sWidth','80px').renderWith(function(data,type,full){
            var str='';
            switch (data){
                case 10:
                    str="独立个人";
                    break;
                case 20:
                    str="推荐人团队";
                    break;
                case 30:
                    str="推荐人个人";
                    break;
                case 40:
                    str="合伙人团队";
                    break;
                default :
                    str="";
            }
            return str;
        }),
        DTColumnBuilder.newColumn('memberNum').withTitle('团队成员数<br/><span style="font-size: 12px;font-weight: 100;">(以开店成功为准)</span>').withOption('sWidth','100px'),
        DTColumnBuilder.newColumn('teamDateStr').withTitle('导入时间').withOption('sWidth','130px'),
        DTColumnBuilder.newColumn('teamleaderStatus').withTitle('启禁用状态').withOption('sWidth','80px').renderWith(function(data,type,full){
            return data?"启用":"禁用";
        }),
        DTColumnBuilder.newColumn('id').withTitle('操作').withOption('sWidth','100px').renderWith(function(data,type,full){
            return '<a href="javascript:;" data-name="'+full.realname+'" data-id="'+full.id+'" data-teamStatus="'+full.teamleaderStatus+'" class="btn btn-danger btn-xs js-white-forbidden">禁用</a><a href="javascript:;" data-name="'+full.realname+'" data-id="'+full.id+'" data-teamStatus="'+full.teamleaderStatus+'" class="btn btn-success btn-xs js-white-startUsing">启用</a> '
        })
    ];


    $scope.action.reset = function(){
        for(var prop in $scope.form){
            if(prop !== 'isShow') delete $scope.form[prop];
        };

        vm.dtInstance.rerender();
    };
    $scope.action.search = function(){
        vm.dtInstance.rerender();
    };
    var ModalCtrl = function($scope, $modalInstance) {
        tools.createModalUser();
        $scope.form = {};
        /*导入模板下载*/
        $scope.dowmloadTemplate = function(e){
            var This = $(e.currentTarget);
            tools.export(This);
        }
        /*导入确认按钮*/
        $scope.ok = function() {
            var self = $("#confirmBtn");
            if(!tools.ajaxLocked(self)) return;
            $modalInstance.close();
            var data = new FormData($("#importWhiteListForm")[0]);
            $.ajax({
                url : siteVar.serverUrl + "/mt/importManageLeader.shtml",
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
                        var errorMsg = "", str;
                        if(data.data && data.data.wrongsize > 0){
                            errorMsg += '--->错误信息如下:' + '<br>' + data.data.wrongmsg;
                        };
                        str = '<div class="modal-content"><div class="modal-header"><button id="js_dialog_passport_settle_close" type="button" class="close" data-dismiss="modal" aria-label="Close">'+
                            '<span aria-hidden="true">×</span></button><h4 class="modal-title fn-ms">导入白名单</h4></div><div class="modal-body" style="max-height:300px; overflow-y: auto;font-size: 14px;">' + data.msg + '<br>' + 'excel导入总笔数: '+
                            data.data.allsize+'<br>' + '导入成功笔数: ' + data.data.rightsize+'<br>' + '失败笔数:'+data.data.wrongsize + errorMsg + '</div></div>';

                        $("#js_dialog_passport .js_content").html(str);
                        $("#js_dialog_passport").modal({backdrop: 'static', keyboard: false});

                        vm.dtInstance.rerender();
                    }

                }

            });
        };
        $scope.close = function() {
            $modalInstance.close();
        };
    };
    $scope.action.import = function(){
        $.ajax({
            type: "post",
            url:siteVar.serverUrl +  '/mt/checkImport.shtml',
            success: function(data){
                if(!tools.interceptor(data)) return;
                $modal.open({
                    backdrop: true,
                    backdropClick: true,
                    dialogFade: false,
                    keyboard: true,
                    templateUrl : 'myModalContent.html',
                    controller : ModalCtrl,
                    windowClass:'modal-640'
                });
            },
            error: function(err){
                tools.ajaxOpened(self);
                tools.ajaxError(err);
            }
        })

    }



    function fnDrawCallback(data){
        $scope.$apply(function(){
            $scope.recordsTotal = data.json.recordsTotal;
        });
        tools.createModal();
        tools.createModalUser();
        //tools.createModalProgress();
        var popUpLayer = $("#js_dialog"), popUpLayerContent = popUpLayer.find(".js_content");
        var table = $("#dataTables"), tbody = table.find("tbody");
        table.off("click").on("click", ".infoDetail", function(){
            var self = $(this), href = self.attr("data-href"), data, url;
            data = tools.queryUrl(href);
            url = href.split('?')[0];
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url:siteVar.serverUrl +  url,
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
        $(".dataTables_scrollHeadInner").find("input[type='checkbox']").uniform();
        table.find("input[type='checkbox']").uniform();


        $("#js_whiteList_export").on("click", function(){
            tools.export(this);
        });
        $("#js_whiteList_download").on("click", function(){
            tools.export(this);
        });



        var selectAll = $("#whiteListChooseAll"), deleteBtn = $("#js_whiteList_delete");
        selectAll.off("change").on("change", function(){
            var self = this, selectList = table.find(".whiteListCheckbox");
            selectList.each(function (i, e) {
                this.checked = self.checked;
                $(this).uniform();
            });
            return false;
        });

        deleteBtn.off("click").on("click", function(){
            var ids = "", selectList = table.find(".whiteListCheckbox");
            selectList.each(function (i, e) {
                ids += e.checked ? (e.value + "&") : "";
            });
            if(!ids.length){
                return alert("请选择需要删除的记录!");
            };
            var self = this, url = $(this).attr("data-href");
            if(!$window.confirm("确认删除？")){
                return false;
            };
            if(!tools.ajaxLocked(self)) return;

            $.ajax({
                type: "post",
                url:siteVar.serverUrl +  url,
                data: {
                    ids : ids.substring(0, ids.length - 1)
                },
                dataType: "json",
                success: function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    if(data.success){
                        vm.dtInstance.rerender();
                    };
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });

        });
        /*操作（启用、禁用）*/
        $('.js-white-forbidden',tbody).off().on("click",function(){
            var self = $(this), tr = self.parents("tr"), tds = tr.children(), parentTd = self.parents("td");
            var id=self.attr("data-id"),status=self.attr("data-teamStatus"),name=self.attr("data-name");
            if(status == "0"){
                var str = '<div class="modal-content"><div class="modal-header"><button id="js_dialog_passport_settle_close" type="button" class="close" data-dismiss="modal" aria-label="Close">'+
                    '<span aria-hidden="true">×</span></button><h4 class="modal-title fn-ms">温馨提示</h4></div><div class="modal-body" style="max-height:300px; overflow-y: auto;font-size: 14px;">' +
                    name+'已被禁用团队长相关功能'+ '</div></div>';

                $("#js_dialog_passport .js_content").html(str);
                $("#js_dialog_passport").modal({backdrop: 'static', keyboard: false});
                return;
            }
            var ajaxData={
                id:id,
                teamleaderStatus:0
            };
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type:"post",
                url:siteVar.serverUrl+"/mt/updateTeamleaderStatus.shtml",
                data:ajaxData,
                success:function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    if(data.success){
                        self.attr("data-teamStatus",0);
                        self.siblings('a').attr("data-teamStatus",0);
                        tds.eq(9).html(self.html());
                        var str = '<div class="modal-content"><div class="modal-header"><button id="js_dialog_passport_settle_close" type="button" class="close" data-dismiss="modal" aria-label="Close">'+
                            '<span aria-hidden="true">×</span></button><h4 class="modal-title fn-ms">温馨提示</h4></div><div class="modal-body" style="max-height:300px; overflow-y: auto;font-size: 14px;">' +
                            '修改启禁用状态成功'+ '</div></div>';

                        $("#js_dialog_passport .js_content").html(str);
                        $("#js_dialog_passport").modal({backdrop: 'static', keyboard: false});
                    }else{
                        alert(res.msg);
                    }
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });
            return false;
        });
        $('.js-white-startUsing',tbody).off().on("click",function(){
            var self = $(this), tr = self.parents("tr"), tds = tr.children(), parentTd = self.parents("td");
            var id=self.attr("data-id"),status=self.attr("data-teamStatus"),name=self.attr("data-name");
            if(status == "1"){
                var str = '<div class="modal-content"><div class="modal-header"><button id="js_dialog_passport_settle_close" type="button" class="close" data-dismiss="modal" aria-label="Close">'+
                    '<span aria-hidden="true">×</span></button><h4 class="modal-title fn-ms">温馨提示</h4></div><div class="modal-body" style="max-height:300px; overflow-y: auto;font-size: 14px;">' +
                    name+'已启用团队长相关功能'+ '</div></div>';

                $("#js_dialog_passport .js_content").html(str);
                $("#js_dialog_passport").modal({backdrop: 'static', keyboard: false});
                return;
            }
            var ajaxData={
                id:id,
                teamleaderStatus:1
            };
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type:"post",
                url:siteVar.serverUrl+"/mt/updateTeamleaderStatus.shtml",
                data:ajaxData,
                success:function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    if(data.success){
                        self.attr("data-teamStatus",1);
                        self.siblings('a').attr("data-teamStatus",1);
                        tds.eq(9).html(self.html());
                        var str = '<div class="modal-content"><div class="modal-header"><button id="js_dialog_passport_settle_close" type="button" class="close" data-dismiss="modal" aria-label="Close">'+
                            '<span aria-hidden="true">×</span></button><h4 class="modal-title fn-ms">温馨提示</h4></div><div class="modal-body" style="max-height:300px; overflow-y: auto;font-size: 14px;">' +
                            '修改启禁用状态成功'+ '</div></div>';

                        $("#js_dialog_passport .js_content").html(str);
                        $("#js_dialog_passport").modal({backdrop: 'static', keyboard: false});
                    }else{
                        alert(res.msg);
                    }
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });
            return false;
        });
    }
}
