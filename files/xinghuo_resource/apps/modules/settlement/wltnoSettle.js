'use strict';
function wltnoSettle($scope, $modal, getSelectListFactory, tools, DTOptionsBuilder, DTColumnBuilder) {
    var form = $("#js_form"), conditionItem = form.find(".form-group");
    $scope.form = {
        isShow: (conditionItem.length > 6) ? true : false,
        settleType:4
    };
    var dateFlag, yearFlag, monthFlag;
    $scope.isFlag = true;
    $scope.select = {};
    $scope.action = {};
    $scope.select.js_q_year = [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030];
    $scope.select.js_q_month = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
    $scope.date = {};
    getSelectListFactory.getSelectList(['yixinusertype','settle_type','protocol_status']).then(function(data){
        $scope.select.q_yixinusertype = data.appResData.retList[0].yixinusertype;
        $scope.select.settleType = data.appResData.retList[1].settle_type;
        $scope.select.protocol_status = data.appResData.retList[2].protocol_status;
    });
    $scope.filerType = function(e){
        return e.key != 3;
    };
    $scope.$watch('date',function(newValue,oldValue){
        $scope.form.month = '' + $scope.date.js_q_year + '-' + $scope.date.js_q_month;
        form.find("input[name='month']").val($scope.form.month)

        $scope.date.transTimeStart = $scope.form.month + '-01';
        $scope.date.transTimeEnd = $scope.form.month + '-' +new Date($scope.date.js_q_year, $scope.date.js_q_month, 0).getDate();
    }, true);

    var date = new Date();
    if(date.getMonth() == 0){
        $scope.date.js_q_year = date.getFullYear() - 1;
        $scope.date.js_q_month = 12;
    }else{
        $scope.date.js_q_year = date.getFullYear();
        $scope.date.js_q_month = date.getMonth() < 10 ? ("0" + date.getMonth()): date.getMonth();
    };
    $scope.form.month = '' + $scope.date.js_q_year + '-' + $scope.date.js_q_month;
    dateFlag = $scope.form.month;
    yearFlag = $scope.date.js_q_year;
    monthFlag = $scope.date.js_q_month;
    form.find("input[name='month']").val($scope.form.month);
    

    /*
     创建表格选项
     */
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax',{
            url:  siteVar.serverUrl + '/xinghuowltsettle/wlttableNoSettle.shtml',
            type: 'POST',
            data: function(d){
                var data = tools.getFormele({}, form);
                delete data["userids"];
                jQuery.extend(d, data);
                //jQuery.extend(d, tools.getFormele({}, form));
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
        .withLanguage(tools.dataTablesLanguage)
        .withOption('fnDrawCallback', fnDrawCallback)
        .withPaginationType('simple_numbers');
    var dtColumns = [
        DTColumnBuilder.newColumn('status').withTitle("<label><input type='checkbox' id='chooseAll'>全选</label>").withOption('sWidth', '60px').renderWith(function(data, type, full) {
            var checked = full.checked ? checked : "";
            return '<div class="ui_center"><label class="heckbox-inline"><input type="checkbox" data-settletype="' + full.settleType + '" class="js_settle_checkbox" value="' + full.userid + '-' + (full.sumamount || 0) + '-' + (full.sumunsettled || 0) + '-' + (full.sumactivity || 0) + '-' + full.settleType + '-' + (full.suminsurance || 0) + '" ' + checked + '></label></div>';
        }),
        DTColumnBuilder.newColumn('userid').withTitle('理财经理ID').withOption('sWidth','100px').renderWith(function(data, type, full) {
            if(!data) return "";
            return '<a href="javascript:void(0);" class="infoDetail" data-href="/xinghuouser/userinfo.shtml?userType=director&id=' + data + '">' + data + '</a>';
        }),
        DTColumnBuilder.newColumn('realname').withTitle('理财经理姓名').withOption('sWidth','100px'),
        DTColumnBuilder.newColumn('mobile').withTitle('理财经理手机号').withOption('sWidth','120px'),
        DTColumnBuilder.newColumn('documentno').withTitle('身份证号码').withOption('sWidth', '160px'),
        DTColumnBuilder.newColumn('bankname').withTitle('银行名称').withOption('sWidth', '100px'),
        DTColumnBuilder.newColumn('cardno').withTitle('银行卡号').withOption('sWidth','160px'),
        DTColumnBuilder.newColumn('branchbankname').withTitle('支行名称').withOption('sWidth','90px'),
        DTColumnBuilder.newColumn('yixinstatus').withTitle('是否宜信员工').withOption('sWidth','90px').renderWith(function(data, type, full) {
            return (data == 1 ? "是" :"否");
        }),
        //DTColumnBuilder.newColumn('yixinusertypestr').withTitle('类型').withOption('sWidth','90px'),
        DTColumnBuilder.newColumn('sumcommissionfee').withTitle('网贷总佣金(元)').withOption('sWidth','150px').renderWith(function(data, type, full) {
            if(!data) return "";
            return '<a href="#xinghuosettle-settleinfo.html?userId=' + full.userid + '&settleStatus='+ full.status + '&commMonth=' + full.commMonth +'&settleType='+full.settleType + '&name=' + full.realname + '" target="_blank">' + tools.formatNumber(data.toFixed(2)) + '</a>';
        }),
        DTColumnBuilder.newColumn('sesameamount').withTitle('类固收顾问费(元)').withOption('sWidth','150px').renderWith(function(data, type, full) {
            if(!data){
                return data = "";
            };
            return '<a href="#xinghuogoldrainbow-fixationProduct.html?&transTimeStart='+ $scope.date.transTimeStart +'&transTimeEnd='+ $scope.date.transTimeEnd +'&state=20,30,40,50&financialUserId='+ full.userid +'" target="_blank">' + tools.formatNumber(data.toFixed(2)) + '</a>';
        }),
        DTColumnBuilder.newColumn('sumactivity').withTitle('活动金额(元)').withOption('sWidth','90px').renderWith(function(data, type, full) {
            if(!data){
                data = 0;
            };
            return tools.formatNumber(data.toFixed(2));
        }),
        DTColumnBuilder.newColumn('suminsurance').withTitle('保险佣金(元)').withOption('sWidth','90px').renderWith(function(data, type, full) {
            return '<a href="#/xinghuosettle-insuranceSettleInfo.html?userId=' + full.userid + '&commMonth=' + full.commMonth +'&settleStatus='+ full.status + '&settleType='+full.settleType + '&name=' + full.realname + '&suminsurance=' + full.suminsurance + '" target="_blank">' + tools.formatNumber(data.toFixed(2)) + '</a>';
        }),
        DTColumnBuilder.newColumn('decAmount').withTitle('增减金额(元)').withOption('sWidth','90px'),
        DTColumnBuilder.newColumn('sumunsettled').withTitle('应结总额（扣服务费前）').withOption('sWidth','160px'),
        DTColumnBuilder.newColumn('tax').withTitle('服务费（7%）').withOption('sWidth','130px').renderWith(function(data, type, full) {
            if(!data){
                data = 0;
            };
            return tools.formatNumber(data.toFixed(2));
        }),
        DTColumnBuilder.newColumn('sumunsettledaftertax').withTitle('实结总额（扣服务费后）').withOption('sWidth','160px').renderWith(function(data, type, full) {
            if(!data){
                data = 0;
            };
            return tools.formatNumber(data.toFixed(2));
        }),
        DTColumnBuilder.newColumn('settleTypeStr').withTitle('结算方式').withOption('sWidth','130px'),
        DTColumnBuilder.newColumn('protocolStatusStr').withTitle('协议签约状态').withOption('sWidth','110px'),
        DTColumnBuilder.newColumn('protocolTime').withTitle('协议电签时间').withOption('sWidth','140px').renderWith(function (data,type,full) {
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('id').withTitle('操作').withOption('sWidth','120px').renderWith(function(data, type, full) {
            return '<a href="javascript:void(0);" data-toggle="popover" data-placement="left" data-month="'+full.commMonth+'" data-settleType="'+full.settleType+'" data-id="' + full.userid + '" class="jswlthandle" data-flag="0" style="margin: 0 5px;">更改结算方式</a></td>';
        }),
    ];
    vm.dtColumns = dtColumns;
    $scope.action.reset = function(){
        for(var prop in $scope.form){
            if(prop !== 'isShow') delete $scope.form[prop];
        };
        $scope.date.js_q_year = yearFlag;
        $scope.date.js_q_month = monthFlag;
        $scope.form.month = dateFlag;
        $scope.form.settleType = 4;
        form.find("select[name='settleType']").val(4);
        vm.dtInstance.rerender();
    };
    $scope.action.search = function(){
        if(parseInt($scope.form.month) > parseInt(dateFlag)){
            return alert("选择的年月份，应当小于当前的日期！");
        };
        vm.dtInstance.rerender();
    };

    var ModalImportCtrl = function($scope, $modalInstance, $timeout) {
        $scope.form = {};
        $scope.action = {};
        $scope.select = {};
        $scope.select.years = [];
        $scope.select.months = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
        $scope.date = {};
        $scope.$watch('date',function(newValue,oldValue){
            $scope.form.month = '' + $scope.date.year + '-' + $scope.date.month;
        }, true);

        var nowTime = new Date();
        if(nowTime.getMonth() == 0){
            $scope.date.year = nowTime.getFullYear() - 1;
            $scope.date.month = 12;
        }else{
            $scope.date.year = nowTime.getFullYear();
            $scope.date.month = nowTime.getMonth() < 10 ? ("0" + nowTime.getMonth()): nowTime.getMonth();
        };
        $scope.select.years.push($scope.date.year)
        $scope.form.month = '' + $scope.date.year + '-' + $scope.date.month;
        // $timeout(function(){
        //     $("#js_upload_settle_form").find(".year-select").each(function(){
        //         $(this).attr({
        //             "onchange": "this.selectedIndex=this.defaultIndex;",
        //             "onfocus":"this.defaultIndex=this.selectedIndex;"
        //         });
        //     });
        // }, 0);
        $scope.ok = function() {
            var self = $("#importConfirmBtn"), filevalue = $("#js_upload_settle_form [name='inputfile']").val();
            if(!filevalue) return alert("请选择导入文件");
            var nameArr = filevalue.split(".");
            if(!/xls/gi.test(nameArr[nameArr.length-1])) return alert("文件必须是excel文件，后缀名为xls或者xlsx!");
            var selectDate = new Date($scope.date.year, $scope.date.month - 1), disDate = nowTime - selectDate, cDate = (nowTime.getDate())*24*60*60*1000;
            if(!(cDate < disDate)){
                return alert("选择的年月份，应当小于当前的日期！");
            };
            if(!tools.ajaxLocked(self)) return;
            $modalInstance.close();
            var data = new FormData($("#js_upload_settle_form")[0]);
            $.ajax({
                url : siteVar.serverUrl + $("#js_upload_settle_form").attr("action"),
                type:"POST",
                data : data,
                processData: false,
                contentType: false,
                success :function(data){
                    if(typeof data == "string"){
                        data = JSON.parse(data);
                    };
                    tools.ajaxOpened(self);
                    $("#js_dialog_progress").modal("hide");
                    if(!tools.interceptor(data)) return;
                    if(data.success){
                        var str = '<div class="modal-content"><div class="modal-header"><button id="js_dialog_passport_settle_close" type="button" class="close" data-dismiss="modal" aria-label="Close">'+
                            '<span aria-hidden="true">×</span></button><h4 class="modal-title fn-ms">导入结算</h4></div><div class="modal-body" style="max-height:300px; overflow-y: auto;font-size: 14px;">'+data.msg+'<br>'+'excel结算总笔数: '+
                            data.data.allsize+'<br>'+'待结算修改成结算中笔数: '+data.data.rightsize+'<br>'+'失败笔数:'+data.data.wrongsize+'||--->错误信息如下:'+'<br>'+data.data.wrongmsg+'</div></div>';

                        $("#js_dialog_passport .js_content").html(str);
                        $("#js_dialog_passport").modal({backdrop: 'static', keyboard: false});

                    }
                }

            });
        };
        $scope.close = function() {
            $modalInstance.close();
        };
    };
    $scope.action.importSettle = function(){
        $modal.open({
            backdrop: true,
            backdropClick: true,
            dialogFade: false,
            keyboard: true,
            templateUrl : 'myModalImport.html',
            controller : ModalImportCtrl,
            windowClass:'modal-640'
        });
    }


    ;(function(){
        $("#js_dialog").modal("hide");
        //var popUpLayer = $("#js_dialog"), popUpLayerContent = popUpLayer.find(".js_content");
        tools.createModalUser();
        //$(document).off("click").on("click", "#js_upload_settle_save", function(){
        //
        //    if(!$("#js_upload_settle_form").find("[name='month']").length){
        //        $("<input>", {
        //            "type": "hidden",
        //            "name": "month"
        //        }).insertBefore($("#js_upload_settle_form [name='inputfile']"));
        //    }
        //
        //    if(!$("#js_upload_settle_form [name='inputfile']").val()) return alert("请选择导入文件");
        //    var yearInput = $("#js_modal_year"), monthInput = $("#js_modal_month"), now = new Date(),d = now.getDate(), selectY = yearInput.val(), selectM = monthInput.val();
        //    var selectDate = new Date(selectY, selectM - 1), disDate = now - selectDate, cDate = d*24*60*60*1000;
        //
        //    if(!(cDate < disDate)){
        //        return alert("选择的年月份，应当小于当前的日期！");
        //    };
        //    var nameArr = $("#js_upload_settle_form [name='inputfile']").val().split(".");
        //    if(!/xls/gi.test(nameArr[nameArr.length-1])) return alert("文件必须是excel文件，后缀名为xls或者xlsx!");
        //
        //    $("#js_upload_settle_form [name='month']").val($("#js_upload_settle_form #js_modal_year").val()+$("#js_upload_settle_form #js_modal_month").val());
        //
        //    // var data = new FormData($("#js_upload_settle_form")[0]);
        //
        //    $("#js_dialog").modal("hide");
        //
        //    $("#js_dialog_progress").modal({backdrop: 'static', keyboard: false});
        //
        //    var self = this;
        //    if(!tools.ajaxLocked(self)) return;
        //
        //    //tools.ajaxForm({
        //    //    "ele": $("#js_upload_settle_form"),
        //    //    "action": $("#js_upload_settle_form").attr("action"),
        //    //    onComplete: function(data){
        //    //        tools.ajaxOpened(self);
        //    //        $("#js_dialog_progress").modal("hide");
        //    //        if(!tools.interceptor(data)) return;
        //    //        if(data.success){
        //    //            var str = '<div class="modal-content"><div class="modal-header"><button id="js_dialog_passport_settle_close" type="button" class="close" data-dismiss="modal" aria-label="Close">'+
        //    //                '<span aria-hidden="true">×</span></button><h4 class="modal-title fn-ms">导入结算</h4></div><div class="modal-body" style="height:400px; overflow-y: scroll;">'+data.msg+'<br>'+'excel结算总笔数: '+
        //    //                data.data.allsize+'<br>'+'待结算修改成结算中笔数: '+data.data.rightsize+'<br>'+'失败笔数:'+data.data.wrongsize+'||--->错误信息如下:'+'<br>'+data.data.wrongmsg+'</div></div>';
        //    //
        //    //            $("#js_dialog_passport .js_content").html(str);
        //    //            $("#js_dialog_passport").modal({backdrop: 'static', keyboard: false});
        //    //
        //    //        }
        //    //    }
        //    //});
        //    var data = new FormData($("#js_upload_settle_form")[0]);
        //    $.ajax({
        //        url : siteVar.serverUrl + $("#js_upload_settle_form").attr("action"),
        //        type:"POST",
        //        data : data,
        //        processData: false,
        //        contentType: false,
        //        success :function(data){
        //            if(typeof data == "string"){
        //                data = JSON.parse(data);
        //            };
        //            tools.ajaxOpened(self);
        //            $("#js_dialog_progress").modal("hide");
        //            if(!tools.interceptor(data)) return;
        //            if(data.success){
        //                var str = '<div class="modal-content"><div class="modal-header"><button id="js_dialog_passport_settle_close" type="button" class="close" data-dismiss="modal" aria-label="Close">'+
        //                    '<span aria-hidden="true">×</span></button><h4 class="modal-title fn-ms">导入结算</h4></div><div class="modal-body" style="max-height:300px; overflow-y: auto;font-size: 14px;">'+data.msg+'<br>'+'excel结算总笔数: '+
        //                    data.data.allsize+'<br>'+'待结算修改成结算中笔数: '+data.data.rightsize+'<br>'+'失败笔数:'+data.data.wrongsize+'||--->错误信息如下:'+'<br>'+data.data.wrongmsg+'</div></div>';
        //
        //                $("#js_dialog_passport .js_content").html(str);
        //                $("#js_dialog_passport").modal({backdrop: 'static', keyboard: false});
        //
        //            }
        //        }
        //
        //    });
        //
        //});

        /**
         * 导入并结算
         * **/
        //$("#js_wlt_unsettle_import").on("click", function(){
            //    var self = $(this), href = self.attr("action");
            //    if(!tools.ajaxLocked(self)) return;
            //    $.ajax({
            //        type: "post",
            //        url: siteVar.serverUrl + '/xinghuowltsettle/toImportWltSettle.shtml',
            //        dataType: "text",
            //        success: function(data){
            //            tools.ajaxOpened(self);
            //            //if(!tools.interceptor(data)) return;
            //            $("#js_dialog .js_content").html(data);
            //            $("#js_dialog").modal("show");
            //
            //        },
            //        error: function(err){
            //            tools.ajaxOpened(self);
            //            tools.ajaxError(err);
            //        }
            //    });
            //});



        $("#js_wlt_unsettle_export").on("click", function(){
            tools.export(this);
        });


    })();
    function fnDrawCallback(data){
        //$scope.$apply(function(){
        //    $scope.fmsumunsettled = data.json.info.fmsumunsettled;
        //});
        tools.createModal();
        tools.createModalProgress();
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


        var selectAll = $("#chooseAll");
        selectAll.off("change").on("change", function(){
            var self = this, selectList = table.find(".js_settle_checkbox");
            selectList.each(function (i, e) {
                this.checked = self.checked;
                $(this).uniform();
            });
            return false;
        });


        /**
         * 万里通 退回
         * **/
        $("#js_wlt_unsettle_toback").off("click").on("click", function(){
            var self = this, setIds = "", settleTypeFlag = false, len = 0;
            $("#dataTables .js_settle_checkbox").each(function (i, e) {
                setIds += e.checked? e.value+"||" : "";
                if(e.checked && $(e).attr("data-settletype") == 2){
                    settleTypeFlag = true;
                };
                if(e.checked){
                    len++;
                };
            });

            if(!setIds.length) {
                return alert("请选择要转回的记录！");
            };
            if(settleTypeFlag){
                return alert("存在走万里通结算的记录不能转回普通结算单，请重新选择！");
            };
            if(!confirm("您已选择了" + len + "条记录，确定要转回普通结算吗？")){
                return;
            };


            $("#userids").val(setIds.substring(0, setIds.length-2));
            var data = tools.getFormele({}, $("#js_form"));
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + $(this).attr("action"),
                data: data,
                dataType: "json",
                success: function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    if(data.success){
                        alert("操作成功！已有" + len + "条记录转回普通结算！")
                        return vm.dtInstance.rerender();;
                    };

                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });

        });

        //批量协议导出_未结算
        $('#settleProtocol').off('click').on('click',function () {
            var self = this, setIds = "", len = 0;
            $("#dataTables .js_settle_checkbox").each(function (i, e) {
                setIds += e.checked? e.value+"||" : "";
                if(e.checked){
                    len++;
                };
            });
            if(!setIds.length) {
                return tools.interalert("请选择需要批量下载的协议！");
            };

            $("#userids").val(setIds.substring(0, setIds.length-2));
            var dataOrigin = tools.getFormele({}, $("#js_form")).userids.split('||');
            var data='';
            var dataLen=0;
            for(var i=0;i<dataOrigin.length;i++){
                dataOrigin[i]=dataOrigin[i].split('-')[0];
                data+=dataOrigin[i]+',';
                dataLen+=1;
            }
            console.log(dataLen);
            if(dataLen&&dataLen>50){
                tools.interalert('批量下载数据条目过大,请不要超过50条~');
                return false;
            }
            data=data.substring(0,data.length-1);
            window.open(siteVar.serverUrl + '/xinghuowltsettle/downloadPdf.json?'+'userIds='+data);
        });

        /**
         * 结算选中结算单
         * **/
        $("#js_wlt_unsettle_selected").off("click").on("click", function(){
            var self = this, setIds = "", settleTypeFlag = false, len = 0;
            $("#dataTables .js_settle_checkbox").each(function (i, e) {
                setIds += e.checked? e.value+"||" : "";
                if(e.checked && $(e).attr("data-settletype") != 2){
                    settleTypeFlag = true;
                };
                if(e.checked){
                    len++;
                };
            });

            if(!setIds.length) {
                return alert("请选需要结算的记录！");
            };
            if(settleTypeFlag){
                return alert("请选择万里通结算方式的记录进行结算!");
            };
            if(!confirm("是否确定？")){
                return;
            };

            $("#userids").val(setIds.substring(0, setIds.length-2));
            var data = tools.getFormele({}, $("#js_form"));
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + $(this).attr("action"),
                data: data,
                dataType: "json",
                success: function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    if(data.success){
                        return vm.dtInstance.rerender();;
                    };

                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });
        });
        /*
        * 万里通“更改结算方式”
        * */
        tbody.on("click", ".jswlthandle", function(){
            var self = $(this),flag = self.attr("data-flag");
            if(flag == 0){
                self.popover({
                    html: true,
                    title : '更改结算方式',
                    content : function(){
                        var id = $(this).attr("data-id"), type= $(this).attr("data-settleType"),month=$(this).attr("data-month"), statusObj = {
                            "0":"扣税结算(系统默认)",
                            "1":"扣税结算(用户选择)",
                            "2":"万里通结算"
                        };
                        var html = '<div class="btn-group-vertical jswlthandleBox" role="group" aria-label="...">';
                        if(type == 1){
                            for(var key in statusObj){
                                if(key ==0){
                                    html += '<button disabled type="button" class="btn btn-default" data-month="'+ month +'" data-type="'+ type +'" data-id="'+ id +'" data-nextSettleType="' + key + '">' + statusObj[key] + '</button>';
                                }else{
                                    html += '<button type="button" class="btn btn-default" data-month="'+ month +'" data-type="'+ type +'" data-id="'+ id +'" data-nextSettleType="' + key + '">' + statusObj[key] + '</button>';
                                }
                            }
                        }else{
                            for(var key in statusObj){
                                html += '<button type="button" class="btn btn-default" data-month="'+ month +'" data-type="'+ type +'" data-id="'+ id +'" data-nextSettleType="' + key + '">' + statusObj[key] + '</button>';
                            }
                        }

                        html += '</div>';
                        html += '<div style="text-align:right;border-top:1px solid #ccc;padding-top:10px;margin-top:10px;"><button class="btn btn-sm btn-danger jswlthandleSubimt">确定更改</button> <button class="btn btn-sm jswlthandleReset">取消更改</button>';
                        return html;
                    }
                }).popover('show');
                self.attr("data-flag", 1)
            };
            return false;
        });
        $(".jswlthandle").on('shown.bs.popover', function(){
            var siblingPop = $(this).next(".popover");
            $(".popover").each(function(){
                if($(this).attr("id") != siblingPop.attr("id")){
                    $(this).popover('hide');
                }
            });
        });
        $("body").on("click",function(){
            $(".popover").popover('hide');
        });
        $("#dataTables tbody").on("click",".popover",function(e){
            e.stopPropagation();
        });
        tbody.on("click", ".jswlthandleBox button", function(){
            var btns = $(this).parent().find("button");
            btns.removeAttr("current").removeClass("btn-primary");
            $(this).attr("current", true).addClass("btn-primary");
        });
        tbody.on("click",".jswlthandleSubimt",function(){
            var self = $(this), tr = self.parents("tr"), tds = tr.children(), parentTd = self.parents("td");
            var popup = parentTd.find(".jswlthandle");
            var currentBtn = self.parents(".popover-content").find('[current="true"]');
            if(currentBtn.length < 1){
                alert('请选择一个状态或取消更改');
                return ;
            };
            var id = currentBtn.attr("data-id"),month=currentBtn.attr("data-month"), type= currentBtn.attr("data-type"), status = parseInt(currentBtn.attr("data-nextSettleType"));
            var data = {
                userid : id,
                nextSettleType : status,
                settleType:type,
                month:month
            };
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + "/xinghuowltsettle/modifySettleType.shtml",
                data: data,
                dataType: "text",
                success: function(res){
                    tools.ajaxOpened(self);
                    var res = JSON.parse(res);
                    if(res.success){
                        tds.eq(0).find(".js_settle_checkbox").attr("data-settletype",currentBtn.attr("data-nextSettleType"));
                        tds.eq(17).html(currentBtn.html());
                        popup.attr("data-settletype",currentBtn.attr("data-nextSettleType"));
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
        tbody.on("click", ".jswlthandleReset",function(){
            var self = $(this), parentTd = self.parents("td"), popup = parentTd.find(".jswlthandle");
            popup.popover("hide");
        });
    }
}
