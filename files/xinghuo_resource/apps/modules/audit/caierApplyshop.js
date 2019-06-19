'use strict';
function caierApplyshopController($scope,getSelectListFactory,tools,DTOptionsBuilder, DTColumnBuilder) {
    $scope.form = {
        isShow: ($("#js_form").find(".form-group").length>6) ? true : false,
        audittype: 0,
        auditstatus: 0
    };
    $scope.select = {};
    $scope.action = {};
    /*
     获取枚举类型
     */
    var selectList = getSelectListFactory.getSelectList(['documenttype','auditstatus']);
    selectList.then(function(data){
        $scope.select.documenttype = data.appResData.retList[0].documenttype;
        $scope.select.auditstatus = data.appResData.retList[1].auditstatus;
    });
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder
        .newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/caieraudit/tableAudit.shtml',
            type: 'POST',
            data: function(d){
                d.orderColumn = 'applytime';
                d.orderType = 'desc';
                jQuery.extend(d,$scope.form);
                try{
                    var order_index = vm.dtInstance.DataTable.context[0].aaSorting[0][0];
                    d.orderColumn = vm.dtInstance.DataTable.context[0].aoColumns[order_index]['mData'];
                    d.orderType = vm.dtInstance.DataTable.context[0].aaSorting[0][1];
                }catch(e){
                    //console.log(e)
                }
            }
        })
        .withDataProp('data')
        .withOption('searching',false)
        .withOption('ordering',true)
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
        DTColumnBuilder.newColumn('userid').withTitle('理财经理ID').withOption('sWidth','60px').renderWith(function(data,type,full){
            if(full.promoteflag && full.promoteflag == "1" && $scope.form.audittype==0){
                return '<span>'+data+'</span>'
            }
            return '<a href="javascript:;" class="js_director_audit" key="'+full.id+'">'+data+'</a>';
        }).notSortable(),
        DTColumnBuilder.newColumn('realname').withTitle('姓名').withOption('sWidth','60px').notSortable(),
        DTColumnBuilder.newColumn('mobile').withTitle('手机号').withOption('sWidth','90px').notSortable(),
        DTColumnBuilder.newColumn('yixinno').withTitle('理财经理员工编号').withOption('sWidth','120px').notSortable(),
        DTColumnBuilder.newColumn('cai2org').withTitle('营业部门').withOption('sWidth','90px').renderWith(function(data,type,full){
            if(!data) return "";
            return '<span class="ui_ellipsis" style="width: 140px;" title="'+data+'">'+data+'</span>';
        }).notSortable(),
        DTColumnBuilder.newColumn('audittypestr').withTitle('审核类型').withOption('sWidth','80px').notSortable(),
        DTColumnBuilder.newColumn('applytime').withTitle('申请时间').withOption('sWidth','140px').renderWith(function(data,type,full){
            if(!data) return "";
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('audittime').withTitle('审核时间').withOption('sWidth','140px').renderWith(function(data,type,full){
            if(!data) return "---";
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('auditorname').withTitle('审核人').withOption('sWidth','60px').notSortable(),
        DTColumnBuilder.newColumn('auditsrcstr').withTitle('审核来源').withOption('sWidth','80px').notSortable(),
        DTColumnBuilder.newColumn('auditstatusstr').withTitle('状态').withOption('sWidth','60px').notSortable(),
        DTColumnBuilder.newColumn('userid').withTitle('操作').withOption('sWidth','80px').renderWith(function(data,type,full){
            if(!full.auditstatus){
                if(full.promoteflag && full.promoteflag == "1" && $scope.form.audittype==0){
                    return "";
                }else{
                    return '<a href="javascript:;" class="js_director_audit" key="'+full.id+'">审核</a>';
                }
            }else{
                return "";
            }
        }).notSortable()
    ];
    $scope.action = {
        reset: function(){
            for(var prop in $scope.form){
                if(prop !== 'isShow' && prop !== 'audittype' && prop !== 'auditstatus') delete $scope.form[prop];
            }
            vm.dtInstance.rerender();
        },
        search: function(){
            vm.dtInstance.rerender();
        }
    }
    function fnDrawCallback(){
        tools.resetWidth();
        $("#dataTables tbody").off("click");
        $("#js_dialog").off("click");
        tools.createModal();
        $("#dataTables tbody").on("click", ".js_director_audit", function(){

            var url = "/caieraudit/showAudit.shtml";
            var data = {
                "id": $(this).attr("key")
            }
            var self = this;
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + url,
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
            })
        });

        $("#js_dialog").on("click", "#js_audit_success", function(){
            var url =  "/caieraudit/audit.shtml";
            var data = tools.getFormele({}, $("#js_audit_form_modal"));
            $.extend(true, data, {"auditstatus": 1});
            data.auditopinion = $.trim(data.auditopinion);
            $("#js_dialog").modal("hide");
            var self = this;
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + url,
                data: data,
                dataType: "json",
                success: function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    vm.dtInstance.rerender();
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });
        });

        $("#js_dialog").on("click", "#js_audit_fail", function(){
            var url = "/caieraudit/audit.shtml";
            var data = tools.getFormele({}, $("#js_audit_form_modal"));
            $.extend(true, data, {"auditstatus": 2});
            $("#js_dialog").modal("hide");
            var self = this;
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + url,
                data: data,
                dataType: "json",
                success: function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    vm.dtInstance.rerender();
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });
        });
    }
}
