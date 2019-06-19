'use strict';
function directorRecommendController($scope,tools,$location,DTOptionsBuilder, DTColumnBuilder) {
    $scope.form = {};
    var urlStr = $location.url().split("?")[1], params = $location.$$search;
    if(urlStr) {
        $.extend($scope.form,tools.serializeUrl(urlStr));
        $scope.formShow = true;
        $scope.tableShow = true;
    };
    $scope.batchId = params.batchId;
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder
        .newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/xinghuouser/tableDirectorRecommend.shtml',
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
        .withOption('createdRow', function(row, data, dataIndex) {
            angular.element(row).addClass("test"+data.id)
        })
        .withOption('fnDrawCallback',fnDrawCallback)
        .withPaginationType('full_numbers');
    vm.dtColumns = [
        DTColumnBuilder.newColumn('sort').withTitle('排序').withOption('sWidth','40px'),
        DTColumnBuilder.newColumn('userId').withTitle('理财经理ID').withOption('sWidth','100px').renderWith(function(data,type,full){
            if(!data) return "";
            return '<a href="javascript:;" class="js_see_info" key="'+data+'">'+data+'</a>';
        }).notSortable(),
        DTColumnBuilder.newColumn('realName').withTitle('理财经理姓名').withOption('sWidth','120px'),
        DTColumnBuilder.newColumn('mobile').withTitle('理财经理手机号').withOption('sWidth','120px'),
        DTColumnBuilder.newColumn('storeName').withTitle('店铺名称').withOption('sWidth','140px').renderWith(function(data,type,full){
            if(!data) return "";
            return '<span class="ui_ellipsis" style="width: 140px;" title="'+data+'">'+data+'</span>';
        }),
        DTColumnBuilder.newColumn('storePhoto').withTitle('店主头像').withOption('sWidth','100px').renderWith(function(data,type,full){
            if(!data) return "";
            return '<a href="'+data+'" target="_blank">预览</a>';
        }),
        DTColumnBuilder.newColumn('customerCount').withTitle('客户数').withOption('sWidth','80px'),
        DTColumnBuilder.newColumn('saleAmount').withTitle('销售总额').withOption('sWidth','100px'),
        DTColumnBuilder.newColumn('totalProfit').withTitle('客户累计收益').withOption('sWidth','120px'),
        DTColumnBuilder.newColumn('id').withTitle('操作').withOption('sWidth','80px').renderWith(function(data,type,full){
            if(!data) return "";
            return '<div class="col-lg-12 col-xs-12 ui_center"><a href="javascript:;" key_id="'+data+'" class="btn btn-danger btn-xs js_directorRecommend_delete">删除</a></div>';
        })
    ];
    $scope.action = {
        search: function(){
            vm.dtInstance.rerender();
        }
    }
    function fnDrawCallback(){
        if(!tools.interceptor(window.ajaxDataInfo)) return;
        $("#dataTables tbody").off("click");
        $("#dataTables tbody").on("click", ".js_directorRecommend_delete", function () {
            var data = {
                "id": $(this).attr("key_id"),
            };
            if(!confirm("你确定要删除该条信息么！")) return false;
            var self = this;
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + "/xinghuouser/deleteRecommendDirector.shtml",
                data: data,
                dataType: "json",
                success: function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    if(data.success){
                        console.log(data.msg);
                        vm.dtInstance.rerender();
                    }
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });

        });

        $("#dataTables tbody").on("click", ".js_see_info", function(){
            var bizSysRoute = $(this).attr("key_sys") == "null" ? 0 : $(this).attr("key_sys");
            var data = {
                "id": $(this).attr("key"),
                "userType": "director",
                "bizSysRoute": bizSysRoute
            };
            var self = this;
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + "/xinghuouser/userinfo.shtml",
                data: data,
                dataType: "text",
                success: function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    $("#js_dialog .js_content").html(data);
                    $("#js_dialog").modal("show");
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });
        });
    }
    (function(){
        tools.createModal();
        $("[ui-view]").append("<style>table.dataTable,table.dataTable.no-footer {width: 100% !important;}</style>");
        $("#js_directorRecommend_import").on("click", function () {
            var postUrl = "/xinghuouser/recommendImportCheck.shtml";
            if(!$("#js_file").val()) return alert("请选择导入文件");
            var nameArr = $("#js_file").val().split(".");
            if(!/xls/gi.test(nameArr[nameArr.length-1])) return alert("文件必须是excel文件，后缀名为xls或者xlsx!");
            var self = this;
            if(!tools.ajaxLocked(self)) return;
            $("#js_dialog_progress").modal({backdrop: 'static', keyboard: false});
            // tools.ajaxForm({
            //     "ele": $("#js_directorRecommend_import_form"),
            //     "action": siteVar.serverUrl + postUrl,
            //     onComplete: function(data){
            //         tools.ajaxOpened(self);
            //         $("#js_dialog_progress").modal("hide");
            //         if(!tools.interceptor(data)) return;
            //         if(data.success){
            //             console.log(data.msg);
            //             vm.dtInstance.rerender();
            //         }
            //     }
            // });
            var data = new FormData($("#js_directorRecommend_import_form")[0]);
            $.ajax({
                url : siteVar.serverUrl + postUrl,
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
                        console.log(data.msg);
                        vm.dtInstance.rerender();
                    }
                }

            });

        });

        $("#js_directorRecommend_down").on("click", function () {
            $("#js_directorRecommend_import_form").attr("action", siteVar.serverUrl + $(this).attr("action")).submit();
        });

        $("#js_directorRecommend_add").on("click", function () {
            var self = this;
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + "/xinghuouser/toSaveOneRecommendDirector.shtml",
                data: {},
                dataType: "json",
                success: function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    if(data.success){
                        var showHtml = ['<div class="modal-content"><div class="modal-header">',
                            '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>',
                            '<h4 class="modal-title fn-ms">理财师_添加推荐</h4></div><div class="modal-body clearfix">',
                            '<form role="form" class="form-horizontal" id="js_directorRecommend_add_form">',
                            '<input type="hidden" name="id" value="17">',
                            '<div class="form-group col-lg-12">',
                            '<label for="inputEmail3" class="col-sm-3 control-label">理财经理ID:</label>',
                            '<div class="col-sm-9">',
                            '<input type="text" class="form-control" id="js_directorRecommend_add_id" placeholder="请输入理财经理ID">',
                            '</div>',
                            '</div>',
                            '<div class="form-group col-lg-12">',
                            '<label for="inputEmail3" class="col-sm-3 control-label">排序:</label>',
                            '<div class="col-sm-9">',
                            '<input type="text" class="form-control" id="js_directorRecommend_add_sort" placeholder="请输入排序">',
                            '</div>',
                            '</div>',
                            '</form></div>',
                            '<div class="modal-footer"><button type="button" class="btn btn-primary fn-ms" data-dismiss="modal">取消</button>',
                            '<button type="button" class="btn btn-success fn-ms" id="js_directorRecommend_add_save">确认</button></div></div>'].join("");

                        $("#js_dialog").removeClass("ui_modal_long").find(".js_content").css({"width": 600,'padding-top':'20%'}).html(showHtml);
                        $("#js_dialog").modal({backdrop: 'static', keyboard: false});

                        $("#js_directorRecommend_add_id").Validator({hmsg: "请输入理财经理ID", regexp: /^\d{12}$/, showok: false, style: {placement: "top"}, emsg: "理财经理ID不能为空", rmsg: "请输入合法理财经理ID"});
                        $("#js_directorRecommend_add_sort").Validator({hmsg: "请输入排序", regexp: /^\d{1,3}$/, showok: false, style: {placement: "top"}, emsg: "排序不能为空", rmsg: "排序不能超过3位数字"});

                    }

                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });

        });
        $("#js_dialog").on("click", "#js_directorRecommend_add_save", function () {
            if(tools.Validator($("#js_dialog #js_directorRecommend_add_sort, #js_dialog #js_directorRecommend_add_id")) === false) return false;
            var data = tools.getFormele({}, $("#js_directorRecommend_import_form"), {sort: $("#js_directorRecommend_add_sort").val(), userId: $("#js_directorRecommend_add_id").val()});
            if(urlStr){
                data.batchId = tools.serializeUrl(urlStr).batchId;
            }else{
                var now = new Date();
                var dateStr = now.getFullYear();
                dateStr += (now.getMonth()>9)?(now.getMonth()+1):("0"+(now.getMonth()+1));
                dateStr += now.getDate();
                dateStr += now.getHours();
                dateStr += now.getMinutes() ;
                dateStr += now.getSeconds();
                data.batchId = "XZ"+ dateStr + (parseInt(Math.random() * 1000000)+100000);
            }
            $scope.form.batchId = data.batchId;
            var self = this;
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + "/xinghuouser/saveOneRecommendDirector.shtml",
                data: data,
                dataType: "json",
                success: function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    if(data.success){
                        $("#js_dialog").modal("hide");
                        alert(data.msg);
                        $scope.$apply(function(){
                            $scope.tableShow = true;
                        });
                        vm.dtInstance.rerender();
                    }
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });

        });
    })();
}