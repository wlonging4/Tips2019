'use strict';
function applyController($scope,getSelectListFactory,tools,DTOptionsBuilder, DTColumnBuilder) {
    $scope.form = {
        isShow: ($("#js_form").find(".form-group").length>6) ? true : false
    };
    $scope.select = {};
    $scope.action = {};
    /*
     获取枚举类型
     */
    var selectList = getSelectListFactory.getSelectList(['hwjapplystatus']);
    selectList.then(function(data){
        $scope.select.applyStatusForQuery = data.appResData.retList[0].hwjapplystatus;
    });
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder
        .newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/xinghuogoodhope/tableApply.shtml',
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
        DTColumnBuilder.newColumn('id').withTitle('ID').withOption('sWidth','40px'),
        DTColumnBuilder.newColumn('subjectCode').withTitle('项目编号').withOption('sWidth','80px'),
        DTColumnBuilder.newColumn('applyCode').withTitle('申请单号').withOption('sWidth','140px').renderWith(function(data,type,full){
            return '<a href="javascript:;" class="js_see_applyinfo" key="' +full.id+ '">'+data+'</a>';
        }),
        DTColumnBuilder.newColumn('subjectName').withTitle('项目名称').withOption('sWidth','140px'),
        DTColumnBuilder.newColumn('applyName').withTitle('申请人姓名').withOption('sWidth','80px'),
        DTColumnBuilder.newColumn('applyMobile').withTitle('申请人电话').withOption('sWidth','100px'),
        DTColumnBuilder.newColumn('country').withTitle('意向国家').withOption('sWidth','100px'),
        DTColumnBuilder.newColumn('managerName').withTitle('理财经理').withOption('sWidth','60px').renderWith(function(data,type,full){
            return '<a href="javascript:;" class="js_see_info" key="'+full.managerid+'">'+data+'</a>';
        }),
        DTColumnBuilder.newColumn('applyStatusName').withTitle('申请单状态').withOption('sWidth','140px').renderWith(function(data,type,full){
            return data+'&nbsp;<a href="javascript:;" class="js-subject-edit-msg-btn" data-placement="bottom" key='+ full.id +'>编辑</a>';
        }),
        DTColumnBuilder.newColumn('applytime').withTitle('申请时间').withOption('sWidth','160px').renderWith(function(data,type,full){
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('id').withTitle('操作').withOption('sWidth','140px').renderWith(function(data,type,full){
            if(full.applyStatusValue==5 || full.applyStatusValue==6){
                return '--'
            }else{
                return '<a href="javascript:;"  data-placement="left" applyId='+data+' data-flag="0" class="js_modify_applystatus_btn" key="'+data+'" data-toggle="popover">更改状态</a>&nbsp;&nbsp;<a href="javascript:;" data-placement="left" data-flag="0" class="js_modify_program_btn" key="'+data+'" data-toggle="popover">更改项目</a>';
            }
        }),
    ];
    $scope.action = {
        reset: function(){
            for(var prop in $scope.form){
                if(prop !== 'isShow') delete $scope.form[prop];
            }
            vm.dtInstance.rerender();
        },
        search: function(){
            vm.dtInstance.rerender();
        }
    }
    function fnDrawCallback(){
        if(!tools.interceptor(window.ajaxDataInfo)) return;
        tools.createModal();
        tools.createModalProgress();
        /**
         * [查看申请信息详情]
         * @param  {object}   [description]
         * @return {[type]}   [description]
         */
        $("#dataTables tbody").on("click", ".js_see_applyinfo", function(){
            var data = {
                "applyId": $(this).attr("key")
            };
            var self = this;
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + "/xinghuogoodhope/applyInfo.shtml",
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
        /**
         * [查看理财经理信息]
         * @param  {object}   [description]
         * @return {[type]}   [description]
         */
        $("#dataTables tbody").on("click", ".js_see_info", function(){
            var data = {
                "id": $(this).attr("key"),
                "userType": "director",
                "bizSysRoute": $("#biz_sys_route").val()
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
        /**
         * 更改状态
         */
        $("#dataTables tbody").on("click",'.js_modify_applystatus_btn',function(e){
            var that = $(this), flag = $(this).attr("data-flag");
            if(flag == 0){
                $.ajax({
                    type: "get",
                    url: siteVar.serverUrl + "/xinghuogoodhope/applyStatus.shtml",
                    dataType: "json",
                    success: function(res){
                        if(res.success){
                            that.popover({
                                html: true,
                                title : '状态更改',
                                content : function(){
                                    var data = $(this).attr("applyId");
                                    var _applyStatus = tools.objOrderByKey(res.data);
                                    var strpop = '<div class="btn-group-vertical js_modify_applystatus" role="group" aria-label="...">';
                                    for(var key in _applyStatus){
                                        strpop += '<button type="button" class="btn btn-default" applyId="'+ data +'" status="'+ key +'">'+ _applyStatus[key] +'</button>';
                                    }
                                    strpop += '</div>';
                                    strpop += '<div style="text-align:right;border-top:1px solid #ccc;padding-top:10px;margin-top:10px;"><button class="btn btn-sm btn-danger js-modify-applyStatus">确定更改</button> <button class="btn btn-sm js-cancel-pop">取消更改</button>';
                                    return strpop;
                                }
                            }).popover('show');
                            that.attr("data-flag", 1);
                        }else{
                            alert(res.msg);
                        }
                    }
                });
            }
            e.stopPropagation();
        });
        $(".js_modify_applystatus_btn, .js_modify_program_btn").on('shown.bs.popover', function(){
            var siblingPop = $(this).next(".popover");
            $(".popover").each(function(){
                if($(this).attr("id") != siblingPop.attr("id")){
                    $(this).popover('hide');
                }
            });
        });
        $("#dataTables tbody").on("click",".js_modify_applystatus button",function(){
            $(this).parent().find("button").removeAttr("current").removeClass("btn-primary");
            $(this).attr("current",true).addClass("btn-primary");
        });
        $("#dataTables tbody").on("click",".js-modify-applyStatus",function(){
            var theBtn = $(this).parent().prev().find('[current=true]');
            if(theBtn.length<1){
                alert('请选择一个状态或取消更改');
                return ;
            }
            var data = {
                applyId : theBtn.attr("applyId"),
                status : parseInt(theBtn.attr("status"))
            }
            if(data.status == 6){
                var makeSure = confirm("确认终止吗？");
                if(!makeSure){
                    $('.js_modify_applystatus_btn').popover("hide");
                    return ;
                }
            }
            var self = this;
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + "/xinghuogoodhope/changeApplyStatus.shtml",
                data: data,
                dataType: "text",
                success: function(res){
                    var res = JSON.parse(res);
                    if(res.success){
                        var ele = $(self).parent().parent().parent().parent()
                        var s = '&nbsp;<a href="javascript:;" class="js-subject-edit-msg-btn" data-placement="bottom" key='+ theBtn.attr('applyId') +'>编辑</a>';
                        ele.prev().prev().html(theBtn.html()+s);
                        if(theBtn.attr('status')==5 || theBtn.attr('status')==6) {
                            ele.html('--');
                        }

                    }else{
                        alert(res.msg);
                    }
                    $('.js_modify_applystatus_btn').popover("hide");
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });
        });
        $("#dataTables tbody").on("click",".js-cancel-pop",function(){
            $('.js_modify_applystatus_btn').popover("hide");
        });
        /**
         * 更改项目
         */
        $("#dataTables tbody").on("click",'.js_modify_program_btn',function(e){
            var that = $(this), flag = $(this).attr("data-flag");
            if(flag == 0){
                $.ajax({
                    type: "get",
                    url: siteVar.serverUrl + "/xinghuogoodhope/applySubject.shtml",
                    dataType: "json",
                    success: function(res){
                        if(res.success){
                            that.popover({
                                html: true,
                                title : '项目更改',
                                content : function(){
                                    var data = $(this).attr("key");
                                    var programList = tools.objOrderByKey(res.data);
                                    var strpop = '<div class="btn-group-vertical js_modify_applystatus" role="group" aria-label="...">';
                                    for(var key in programList){
                                        strpop += '<button type="button" class="btn btn-default" applyId="'+ data +'" programId="'+ key +'">'+ programList[key] +'</button>';
                                    }
                                    strpop += '</div>';
                                    strpop += '<div style="text-align:right;border-top:1px solid #ccc;padding-top:10px;margin-top:10px;"><button class="btn btn-sm btn-danger js-modify-subject">确定更改</button> <button class="btn btn-sm js-cancel-subject-pop">取消更改</button>';
                                    return strpop;
                                }
                            }).popover('show');
                            that.attr("data-flag", 1);
                        }else{
                            alert(res.msg);
                        }
                    }
                });
            }
            e.stopPropagation();
        });
        $("#dataTables tbody").on("click",".js-modify-subject",function(){
            var theBtn = $(this).parent().prev().find('[current=true]');
            if(theBtn.length<1){
                alert('请选择一个项目或取消更改');
                return ;
            }
            var formdata = {
                applyId : theBtn.attr("applyId"),
                subjectId : parseInt(theBtn.attr("programId"))
            }
            var self = this;
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + "/xinghuogoodhope/changeApplySubject.shtml",
                data: formdata,
                dataType: "text",
                success: function(res){
                    var res = JSON.parse(res);
                    if(res.success){
                        var result = res.data;
                        var s = '&nbsp;<a href="javascript:;" class="js-subject-edit-msg-btn" data-placement="bottom" key='+ theBtn.attr('applyId') +'>编辑</a>';
                        var tr = $(self).parent().parent().parent().parent().parent();
                        var td = tr.find("td");
                        var td1 = result.subjectCode,
                            td3 = result.subjectName,
                            td6 = result.country,
                            td8 = result.applyStatusName;
                        td.eq(1).html(td1);
                        td.eq(3).html(td3);
                        td.eq(6).html(td6);
                        td.eq(8).html(td8+s);
                    }else{
                        alert(res.msg);
                    }
                    $('.js_modify_program_btn').popover("hide");
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });
        });
        $("#dataTables tbody").on("click",".js-cancel-subject-pop",function(){
            $('.js_modify_program_btn').popover("hide");
        });
        $("body").on("click",function(){
            $(".popover").popover('hide');
        })
        $("#dataTables tbody").on("click",".popover",function(e){
            e.stopPropagation();
        });


        /**
         * [好望角申请导出]
         * @param  {[type]}   [description]
         * @return {[type]}   [description]
         */
        $("#js_apply_export").on("click", function(){
            tools.export(this);
        });

        /**
         * 好望角编辑内容
         */
        $("#dataTables tbody").on("click",'.js-subject-edit-msg-btn',function(e){
            var that = $(this);
            $.ajax({
                type: 'get',
                url: siteVar.serverUrl + '/xinghuogoodhope/toSaveRemark.shtml',
                success: function(data){
                    if(data.success){
                        that.popover({
                            html: true,
                            title: '添加备注',
                            content : '<div><textarea key='+ that.attr('key') +'></textarea></div><div style="text-align:right;border-top:1px solid #ccc;padding-top:10px;margin-top:10px;"><button class="btn btn-sm btn-danger js-modify-subject-bz">确定添加</button> <button class="btn btn-sm js-cancel-subject-bz-pop">取消添加</button>'
                        }).popover('show');
                    }else{
                        alert(data.msg);
                    }
                }
            });
        });
        $("#dataTables tbody").on("click",".js-modify-subject-bz",function(){
            var theBtn = $(this).parent().prev().find('textarea');
            var data = {
                applyId : theBtn.attr("key"),
                remark : theBtn.val()
            };
            var self = this;
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + "/xinghuogoodhope/saveRemark.shtml",
                data: data,
                dataType: "text",
                success: function(data){
                    alert("备注添加成功");
                    $('.js-subject-edit-msg-btn').popover('destroy');
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });
        });
        $("#dataTables tbody").on("click",".js-cancel-subject-bz-pop",function(){
            $('.js-subject-edit-msg-btn').popover("hide");
        });


    }
    (function(){
        //$("[ui-view]").append("<style>table.dataTable,table.dataTable.no-footer {width: 100% !important;}</style>");
        $("#js_apply_export").on("click", function(){
            tools.export(this);
        });
    })();
}
