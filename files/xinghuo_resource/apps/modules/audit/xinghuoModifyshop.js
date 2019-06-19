'use strict';
function xinghuoModifyshopController($scope,getSelectListFactory,tools,DTOptionsBuilder, DTColumnBuilder) {
    $scope.form = {
        isShow: ($("#js_form").find(".form-group").length>6) ? true : false,
        auditstatus: 0,
        audittype: -1
    };
    $scope.select = {};
    $scope.action = {};
    /*
     获取枚举类型
     */
    var selectList = getSelectListFactory.getSelectList(['documenttype','auditstatus','yixinstatus','auditsrc','biz_sys_route','audittype']);
    selectList.then(function(data){
        $scope.select.documenttype = data.appResData.retList[0].documenttype;
        $scope.select.auditstatus = data.appResData.retList[1].auditstatus;
        $scope.select.yixinstatus = data.appResData.retList[2].yixinstatus;
        $scope.select.auditsrc = data.appResData.retList[3].auditsrc;
        //过滤业务系统来源
        var arr = [];
        var biz_sys_route = data.appResData.retList[4].biz_sys_route;
        for(var i in biz_sys_route){
            if(i != 3 && i != 4){
                arr.push(biz_sys_route[i]);
            }
        }
        $scope.select.bizSysRoute = arr;
        arr = [];
        var audittype = data.appResData.retList[5].audittype;
        for(var i in audittype){
            if(i >0 ){
                arr.push(audittype[i]);
            }
        }
        $scope.select.audittype = arr;
        arr = [];

        //$scope.select.audittype = ([{"key":"-1","value":"请选择"}]).concat($scope.select.audittype)
        //console.log($scope.select.audittype)
    });
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder
        .newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/xinghuoaudit/tableAudit.shtml',
            type: 'POST',
            data: function(d){
                jQuery.extend(d,{
                    "orderColumn" : d.columns[d.order[0]["column"]]["data"],
                    "orderType" : d.order[0]["dir"]
                },$scope.form);
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
        .withPaginationType('full_numbers')
        .withOption('order', [6, 'desc']);
    vm.dtColumns = [
        DTColumnBuilder.newColumn('userid').withTitle('理财经理ID').withOption('sWidth','100px').renderWith(function(data,type,full){
            if(full.promoteflag && full.promoteflag == "1" && $scope.form.audittype==0){
                return '<span>'+data+'</span>'
            }
            return '<a href="javascript:;" class="js_director_audit" key="'+full.id+'">'+data+'</a>';
        }).notSortable(),
        DTColumnBuilder.newColumn('realname').withTitle('姓名').withOption('sWidth','60px').notSortable().renderWith(function(data,type,full){
            if(!data) return "";
            return '<span class="ui_ellipsis" title="' + data + '">' + data + '</span>';
        }),
        DTColumnBuilder.newColumn('mobile').withTitle('手机号').withOption('sWidth','90px').notSortable(),
        DTColumnBuilder.newColumn('applylevelname').withTitle('理财经理级别').withOption('sWidth','130px').notSortable(),
        DTColumnBuilder.newColumn('yixinstatusstr').withTitle('是否宜信员工').withOption('sWidth','90px').renderWith(function(data,type,full){
            if(full.promoteflag && full.promoteflag == "1" && $scope.form.audittype==0){
                return '<a href="javascript:;" class="js_director_audit" key="'+full.id+'">否-有交易</a>'
            }else{
                if(!data) return '<a href="javascript:;" class="js_director_checkEmp" key="'+full.userid+'" key2="'+full.id+'" style="color: #cc0000; font-weight: 600;">验证异常</a>';
                if(data =="否" ) return '<span style="color:#cc0000; font-weight: 600;">'+data+'</span>';
                return data;
            }
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
        DTColumnBuilder.newColumn('userid').withTitle('操作').withOption('sWidth','36px').renderWith(function(data,type,full){
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
                //if(prop !== 'isShow') delete $scope.form[prop];
                if(prop !== 'isShow' && prop !== 'audittype') delete $scope.form[prop];
            }
            $scope.form.auditstatus = 0;
            $scope.form.audittype = -1;
            vm.dtInstance.rerender();
        },
        search: function(){
            vm.dtInstance.rerender();
        }
    }
    function fnDrawCallback(){
        $("#js_form").find("select[name='audittype']").children().eq(0).val(-1);
        if(!tools.interceptor(window.ajaxDataInfo)) return;
        $("#dataTables tbody").off("click");
        $("#js_dialog").off("click");
        tools.createModal();
        $("#dataTables tbody").on("click", ".js_director_audit", function(){
            var url = "/xinghuoaudit/showAudit.shtml";
            var data = {
                "id": $(this).attr("key")
            };
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
                    $("#js_dialog .js_content").find("input[type='checkbox']").uniform();
                    $("#js_dialog").modal("show");
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            })
        });
        $("#js_dialog").on("click", "#js_audit_success", function(){

            var url = "/xinghuoaudit/audit.shtml";

            var data = tools.getFormele({}, $("#js_audit_form_modal"));
            var noPassReason = data.noPassReason;

            if(noPassReason){
                delete data.noPassReason;
            };
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

            var url = "/xinghuoaudit/audit.shtml";

            var data = tools.getFormele({}, $("#js_audit_form_modal"));
            var noPassReason = data.noPassReason;
            if(!noPassReason){
                return tools.interalert("退回原因必选！");
            }else if(noPassReason.length == 1){
                data.noPassReason = parseInt(noPassReason[0]);
            }else{
                data.noPassReason = 0;
            }
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

        $("#dataTables tbody").on("click", ".js_director_checkEmp", function(){
            var self = this;
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + "/xinghuouser/checkEmp/" + $(this).attr("key")+".shtml",
                data: {},
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
    }
}
