'use strict';
function directorRecommendBatchController($scope,tools,DTOptionsBuilder, DTColumnBuilder) {
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder
        .newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/xinghuouser/tableDirectorRecommendBatch.shtml',
            type: 'POST'
        })
        .withDataProp('data')
        .withOption('searching',false)
        .withOption('ordering',false)
        .withOption('serverSide',true)
        .withOption('processing',false)
        .withOption('scrollX',false)
        .withLanguage(tools.dataTablesLanguage)
        .withOption('createdRow', function(row, data, dataIndex) {
            angular.element(row).addClass("test"+data.id)
        })
        .withOption('fnDrawCallback',fnDrawCallback)
        .withPaginationType('full_numbers');
    vm.dtColumns = [
        DTColumnBuilder.newColumn('createTime').withTitle('发布时间').withOption('sWidth','200px').renderWith(function(data,type,full){
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('batchName').withTitle('推荐备注').withOption('sWidth','160px').renderWith(function(data,type,full){
            if(!data) {
                return '<div class="ui_center"><a href="javascript:;" class="btn btn-success btn-xs js_directorRecommendBatch_remark" key_id="'+full.id+'">新增备注</a></div>';
            }
            return '<a href="javascript:;" class="js_directorRecommendBatch_remark ui_ellipsis" style="width: 160px;" key_data="'+data+'" key_id="'+full.id+'" title="'+data+'">'+data+'</a>';
        }),
        DTColumnBuilder.newColumn('id').withTitle('推荐名单').withOption('sWidth','160px').renderWith(function(data,type,full){
            if(!data) return "";
            return '<div class="ui_center"><a href="#/directorRecommend.html?batchId='+data+'" class="btn btn-success btn-xs">查看</a></div>';
        }),
        DTColumnBuilder.newColumn('statusStr').withTitle('状态').withOption('sWidth','170px').renderWith(function(data,type,full){
            if(full.status == "2"){
                return '<div class="ui_center"><a href="javascript:;" key_id="'+full.id+'" class="btn btn-primary btn-xs js_directorRecommendBatch_start">'+data+'</a></div>';
            }
            return '<div class="ui_center"><span>'+data+'</span></div>';
        }),
        DTColumnBuilder.newColumn('id').withTitle('操作').withOption('sWidth','auto').renderWith(function(data,type,full){
            if(!data) return "";
            return '<div class="ui_center"><a href="#/directorRecommend.html?batchId='+data+'" class="btn btn-danger btn-xs">修改</a></div>';
        })
    ];
    function fnDrawCallback(){
        if(!tools.interceptor(window.ajaxDataInfo)) return;
        tools.createModal();
        $("#dataTables tbody").off("click");
        $("#dataTables tbody").on("click", ".js_directorRecommendBatch_start", function () {
            if(!$(this).attr("key_id") || $(this).attr("key_id") == "null" || $(this).attr("key_id") == "undefined") return;
            var data = {
                "id": $(this).attr("key_id"),
            };
            var self = this;
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + "/xinghuouser/enableRecommend.shtml",
                data: data,
                dataType: "json",
                success: function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    if(data.success){
                        alert(data.msg);
                        vm.dtInstance.rerender();
                    }
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });
        });
        $("#dataTables tbody").on("click", ".js_directorRecommendBatch_remark", function () {
            if(!$(this).attr("key_id") || $(this).attr("key_id") == "null" || $(this).attr("key_id") == "undefined") return;
            var keyId = $(this).attr("key_id");
            var keyData = $(this).attr("key_data") ? $(this).attr("key_data") : "";
            var self = this;
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + "/xinghuouser/toSaveOrUpdateRemark.shtml",
                data: {},
                dataType: "json",
                success: function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    if(data.success){
                        var showHtml = ['<div class="modal-content"><div class="modal-header">',
                            '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>',
                            '<h4 class="modal-title fn-ms">备注</h4></div><div class="modal-body clearfix">',
                            '<form role="form" class="form-horizontal" id="js_directorRecommendBatch_remark_form">',
                            '<input type="hidden" name="id" value="17">',
                            '<div class="form-group col-lg-12">',
                            '<label for="inputEmail3" class="col-sm-2 control-label">备注:</label>',
                            '<div class="col-sm-10">',
                            '<input name="" value="'+keyData+'" type="text" class="form-control" id="js_directorRecommendBatch_remark_value" placeholder="请输入备注" data-original-title="" title="">',
                            '</div>',
                            '</div>',
                            '</form></div>',
                            '<div class="modal-footer"><button type="button" class="btn btn-primary fn-ms" data-dismiss="modal">取消</button>',
                            '<button type="button" class="btn btn-success fn-ms" key_id="'+keyId+'" id="js_directorRecommendBatch_remark_sure">确认</button></div></div>'].join("");
                        $("#js_dialog").removeClass("ui_modal_long").find(".js_content").css({"width": 560}).html(showHtml);
                        $("#js_dialog").modal({backdrop: 'static', keyboard: false});
                    }
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });
        });
        $("#js_dialog").on("click", "#js_directorRecommendBatch_remark_sure", function () {
            if(!$(this).attr("key_id") || $(this).attr("key_id") == "null" || $(this).attr("key_id") == "undefined") return;
            var data = {
                "batchId": $(this).attr("key_id"),
                "batchName": $("#js_directorRecommendBatch_remark_form #js_directorRecommendBatch_remark_value").val()
            };
            var self = this;
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + "/xinghuouser/saveOrUpdateRemark.shtml",
                data: data,
                dataType: "json",
                success: function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    if(data.success){
                        $("#js_dialog").modal("hide");
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
    }
}