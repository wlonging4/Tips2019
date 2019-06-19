'use strict';
function xinghuouserRankController($scope,tools,DTOptionsBuilder, DTColumnBuilder) {
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder
        .newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/xinghuouser/tableRank.shtml',
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
        DTColumnBuilder.newColumn('id').withTitle('编号').withOption('sWidth','140px'),
        DTColumnBuilder.newColumn('levelname').withTitle('级别名称').withOption('sWidth','auto'),
        DTColumnBuilder.newColumn('creatorname').withTitle('管理员').withOption('sWidth','180px'),
        DTColumnBuilder.newColumn('createtime').withTitle('添加时间').withOption('sWidth','180px').renderWith(function(data,type,full){
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn(null).withTitle('操作').withOption('sWidth','90px').renderWith(function(data,type,full){
            return  '<a href="javascript:;" class="btn btn-success btn-xs js_add">修改</a>';
        })
    ];
    function fnDrawCallback(){
        if(!tools.interceptor(window.ajaxDataInfo)) return;
        $("#js_add, #dataTables tbody, #js_dialog").off("click");

        $("#js_add").on("click", function(){
            $("#js_rank_form").attr({"type": "add"});
            $("#js_rank_form #levelname").val("");
            $("#js_rank_form #levelname").Validator({hmsg: "请输入级别名称", regexp: /^[\s|\S]{1,100}$/, showok: false, style: {placement: "top"}, emsg: "级别名称不能为空", rmsg: "请输入合法级别名称"});
            $("#js_dialog").modal({backdrop: 'static', keyboard: false});
        });
        $("#dataTables tbody").on("click", ".js_add", function(){
            $("#js_rank_form").attr({"type": "edit"});
            var id = $(this).parents("tr").find("td").eq(0).html();
            var levelname = $(this).parents("tr").find("td").eq(1).html();
            $("#js_rank_form #levelname").val(levelname);
            $("#js_rank_form #levelname").Validator({hmsg: "请输入级别名称", regexp: /^[\s|\S]{1,100}$/, showok: false, style: {placement: "top"}, emsg: "级别名称不能为空", rmsg: "请输入合法级别名称"});
            $("#js_rank_form #levelname").attr("idnum", id);
            $("#js_dialog").modal({backdrop: 'static', keyboard: false});
        });
        $("#js_dialog").on("click", "#js_rank_save", function(){
            if(false == tools.Validator($("#js_rank_form #levelname"))) return;
            var data = {
                "levelname": $.trim( $("#js_rank_form #levelname").val() )
            }
            if($("#js_rank_form").attr("type") == "edit"){
                $.extend(true, data, {"id": $("#js_rank_form #levelname").attr("idnum")});
            }
            var self = this;
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + $("#js_rank_form").attr("action"),
                data: data,
                dataType: "json",
                success: function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    $("#js_dialog").modal("hide");
                    vm.dtInstance.rerender();
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            })
        });

    }
}