'use strict';
function managerRec($scope, $modal, $timeout, tools, $location, DTOptionsBuilder, DTColumnBuilder) {
    var domForm = $("#js_form"), conditionItem = domForm.find(".form-group");
    $scope.form = {
        isShow: (conditionItem.length > 6) ? true : false

    };
    $scope.select = {};
    $scope.action = {};
    $scope.importData = {};
    $scope.flag = 0;//0为查询，1为导入
    tools.createModal();
    tools.createModalProgress();
    var popUpLayer = $("#js_dialog"), popUpLayerContent = popUpLayer.find(".js_content");
    var template = '<div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button><h4 class="modal-title fn-ms">提示信息</h4></div><div class="modal-body clearfix">{{info}}</div><div class="modal-footer"><button type="button" class="btn btn-primary fn-ms" data-dismiss="modal">确认</button></div></div>';
    var params = $location.$$search;
    if(params.id){
        $scope.form.managerUserid = params.id;
        $timeout(function(){
            angular.element('#search-btn').triggerHandler('click');
        }, 0);
    };
    /*
     创建表格选项
     */
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('data',[])
        .withOption('createdRow', function(row, data, dataIndex) {
            angular.element(row).addClass("rows" + data.id)
        })
        .withOption('searching',false)
        .withOption('ordering',false)
        //.withOption('serverSide',true)
        .withOption('processing',false)
        .withOption('scrollX',false)
        .withLanguage(tools.dataTablesLanguage)
        .withOption('fnDrawCallback', fnDrawCallback)
        .withPaginationType('simple_numbers');
    vm.dtColumns = [
        DTColumnBuilder.newColumn('id').withTitle("<div class='col-lg-12 col-xs-12 ui_center'><label class='checkbox-inline'><input type='checkbox' class='allChoose'>全选</label></div>").withOption('sWidth', '100px').renderWith(function(data, type, full) {
            if(!data) return "";
            return '<div class="col-lg-12 col-xs-12 ui_center"><label class="heckbox-inline"><input type="checkbox" data-flag="1" class="managerRecCheckbox" value="' + full.id + '"></label></div>';
        }),
        DTColumnBuilder.newColumn('lenderid').withTitle('用户ID').withOption('sWidth','100px'),
        DTColumnBuilder.newColumn('lenderRealname').withTitle('姓名').withOption('sWidth','90px'),
        DTColumnBuilder.newColumn('lenderMobile').withTitle('手机号').withOption('sWidth','100px'),
        DTColumnBuilder.newColumn('lenderDocumentNo').withTitle('证件号').withOption('sWidth', '160px'),
        DTColumnBuilder.newColumn('managerRealname').withTitle('理财经理姓名').withOption('sWidth', '90px').renderWith(function(data, type, full) {
            if(!data) return "";
            return '<a href="javascript:;" class="infoDetail" data-href="/xinghuouser/userinfo.shtml?userType=director&id=' + full.managerUserid + '">' + data + '</a>';
        }),
        DTColumnBuilder.newColumn('managerMobile').withTitle('理财经理手机号').withOption('sWidth','120px'),
        DTColumnBuilder.newColumn('managerStorename').withTitle('店铺名称').withOption('sWidth','90px'),
        DTColumnBuilder.newColumn('processtime').withTitle('绑定时间').withOption('sWidth','160px').renderWith(function(data, type, full) {
            if(!data) return "";
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('id').withTitle('操作').withOption('sWidth','120px').renderWith(function(data, type, full) {
            return '<div class="col-lg-12 col-xs-12 ui_center"><a href="javascript:;" class="btn btn-success btn-xs js_managerRec_update" data-id="' + data + '">更换</a></div>';
        })
    ];
    $scope.action.reset = function(){
        for(var prop in $scope.form){
            if(prop !== 'isShow') delete $scope.form[prop];
        }
        vm.dtInstance.rerender();
    };
    $scope.action.search = function(){
        if($scope.form.lenderid || $scope.form.lenderMobile || $scope.form.lenderRealname || $scope.form.managerUserid || $scope.form.managerMobile || $scope.form.managerRealname){
            vm.dtOptions.withOption('ajax',{
                    url: siteVar.serverUrl + '/xinghuosite/tablemanagerRec.shtml',
                    type: 'POST',
                    data: function(d){
                        var data = tools.getFormele({}, domForm);
                        $.extend(d, data);
                    }

                })
                .withDataProp('data')
                .withOption('serverSide',true);
            $scope.flag = 0;
        };
    };

    $scope.action.import = function(){
        var importBtn = $("#js_rec_import"), fileInput = importBtn.siblings("[name='inputfile']"), form = fileInput.parents("form"), url = form.attr("action");
        if(!fileInput.val()){
            return alert("请选择导入文件");
        };
        // tools.ajaxForm({
        //     "ele": form,
        //     "action": siteVar.serverUrl + url,
        //     onComplete: function(data){
        //         tools.ajaxOpened(self);
        //         if(!data.success){
        //             popUpLayerContent.html(template.replace(/\{{2}info\}{2}/g, data.info));
        //             popUpLayer.modal("show");
        //         };
        //         if(data.data.length > 0){
        //             $scope.importData = data.data;
        //             renderData(data.data);
        //             $scope.flag = 1;
        //         };
        //     }
        // });
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
                if(!data.success){
                    popUpLayerContent.html(template.replace(/\{{2}info\}{2}/g, data.info));
                    popUpLayer.modal("show");
                };
                if(data.data.length > 0){
                    $scope.importData = data.data;
                    renderData(data.data);
                    $scope.flag = 1;
                };
            }

        });
    };
    var ModalCtrl = function($scope, $modalInstance, flag, ids, indexData, search) {
        var reSearch = search;
        $scope.form = {};
        $scope.action = {};
        $scope.flag = flag;
        $scope.init = function(){
            var formDom = $("#js_managerRec_update_form"), idsInput = formDom.find("[name='ids']"), indexInput = formDom.find("[name='index']"), mobileInput = $("#js_managerRec_update_mobile"), userIdInput = $("#js_managerRec_update_userId"), realNameInput = $("#js_managerRec_update_realName"), storeNameInput = $("#js_managerRec_update_storeName");
            idsInput.val(ids);
            if(flag == 1){
                indexInput.val(JSON.stringify(indexData));
            }else{
                indexInput.val(null);
            };
            mobileInput.Validator({hmsg: "请填写手机号码", regexp: "phone", showok: false, style: {placement: "top"}, emsg: "手机号码不能为空", rmsg: "请输入合法手机号码", fn: function (v, tag) {
                var self = mobileInput;
                if(!tools.ajaxLocked(self)) return true;

                $.ajax({
                    type: "post",
                    url: siteVar.serverUrl + "/xinghuosite/queryManagerinfo.shtml",
                    data: {"mobile": v},
                    dataType: "json",
                    success: function(data){
                        tools.ajaxOpened(self);
                        if(!tools.interceptor(data)) return;
                        if(data.success){
                            userIdInput.val(data.data.id);
                            realNameInput.val(data.data.realname);
                            storeNameInput.val(data.data.storename);
                        }

                    },
                    error: function(err){
                        tools.ajaxOpened(self);
                        tools.ajaxError(err);
                    }
                });
                return true

            }});
        };
        $scope.ok = function() {
            var formDom = $("#js_managerRec_update_form"), userIdInput = $("#js_managerRec_update_userId");
            if(!userIdInput.val()) return;
            var data = tools.getFormele({}, formDom);
            var self = $("#confirmBtn");
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + "/xinghuosite/changeManager.shtml",
                data: data,
                dataType: "json",
                success: function(data){
                    $modalInstance.close();
                    tools.ajaxOpened(self);
                    if(flag == 1){
                        if(!data.success){
                            popUpLayerContent.css({"width": 700}).html(template.replace(/\{{2}info\}{2}/g, data.info));
                            popUpLayer.modal("show");
                        };
                        if(data.data.length > 0){
                            var indexArr = data.data;
                            indexArr = indexArr.sort(function(a,b){
                                return a < b ? 1 : -1;
                            });;
                            $.each(indexArr, function(index, item){
                                vm.dtInstance.dataTable.fnDeleteRow(item);
                            });
                        };
                    }else{
                        if(!data.success){
                            popUpLayerContent.css({"width": 700}).html(template.replace(/\{{2}info\}{2}/g, data.info));
                            popUpLayer.modal("show");
                        };
                        reSearch();
                    };
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });
        };
        $scope.cancel = function() {
            $modalInstance.close();
        };
    };
    $scope.action.replace = function(e){
        var currentDom = $(e.currentTarget), table = $("#dataTables"), tbody = table.find("tbody"), checkboxs = tbody.find("[type='checkbox']"), indexData = {};
        if(currentDom.hasClass("js_managerRec_update")){
            var ids = currentDom.attr("data-id");
            if(!ids) return;
            var tr = currentDom.parents("tr"), checkedInput = tr.find("input[type='checkbox']");
        }else{
            var checkedInput = checkboxs.filter(function(){
                return $(this).prop("checked");
            });
            var ids = checkedInput.map(function(){
                return $(this).val();
            });
            ids = Array.prototype.join.call(ids);
            if(ids.length == 0) return alert("请选勾选需要修改的用户");
        };
        checkedInput.each(function(){
            var index = checkboxs.index(this), value = $(this).val();
            indexData[value] = index;
        });

        $modal.open({
            backdrop: true,
            backdropClick: true,
            dialogFade: false,
            keyboard: true,
            templateUrl : 'myModalContent.html',
            controller : ModalCtrl,
            windowClass:'modal-640',
            resolve:{
                "ids" : function(){
                    return ids;
                },
                "indexData" : function(){
                    return indexData;
                },
                "flag" : function(){
                    return $scope.flag;
                },
                "search" : function(){
                    return $scope.action.search
                }
            }
        });
    };

    function renderData(dataList){
        $scope.$apply(function(){
            vm.dtOptions = DTOptionsBuilder.newOptions()
                .withOption('data',dataList)
                .withOption('createdRow', function(row, data, dataIndex) {
                    angular.element(row).addClass("rows" + data.id)
                })
                .withOption('searching',false)
                .withOption('ordering',false)
                .withOption('processing',false)
                .withOption('scrollX',true)
                .withLanguage(tools.dataTablesLanguage)
                .withOption('fnDrawCallback', fnDrawCallback)
                .withPaginationType('simple_numbers');
        });
    };

    function fnDrawCallback(){


        $("#js_rec_download").on("click", function(){
            tools.export(this);
        });

        var table = $("#dataTables"), tbody = table.find("tbody");
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

        $(".dataTables_scrollHeadInner").find("input[type='checkbox']").uniform();
        table.find("input[type='checkbox']").uniform();

        var selectAll = $(".allChoose");
        selectAll.off("change").on("change", function(){
            var self = this, selectList = table.find(".managerRecCheckbox");
            selectList.each(function (i, e) {
                this.checked = self.checked;
                $(this).uniform();
            });
            return false;
        });

        $(".js_managerRec_update").off("click").on("click", function(e){
            $scope.action.replace(e);
        });
    }
}
