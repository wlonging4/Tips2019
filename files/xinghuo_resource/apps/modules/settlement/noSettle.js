'use strict';
function noSettle($scope, $modal, $stateParams, getSelectListFactory, $q, tools, DTOptionsBuilder, DTColumnBuilder) {
    var form = $("#js_form"), conditionItem = form.find(".form-group");
    //$scope.isYX = $stateParams.isYX;
    //if($scope.isYX){
    //    form.find("input[name='q_yixinstatus']").val(1)
    //};
    //$scope.groupName = '非宜信员工';
    $scope.form = {
        isShow: (conditionItem.length > 6) ? true : false
    };
    var dateFlag, yearFlag, monthFlag;//默认date
    $scope.isFlag = true;
    $scope.select = {};
    $scope.action = {};
    $scope.select.js_q_year = [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030];
    $scope.select.js_q_month = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
    $scope.date = {};
    getSelectListFactory.getSelectList(['yixinusertype','biz_sys_route']).then(function(data){
        $scope.select.q_yixinusertype = data.appResData.retList[0].yixinusertype;
        $scope.select.bizSysRoute = data.appResData.retList[1].biz_sys_route;
    });
    $scope.filerSource = function(e){
        return e.key != 4;
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
            url:  siteVar.serverUrl + '/xinghuosettle/tableNoSettle.shtml',
            type: 'POST',
            data: function(d){
                var data = tools.getFormele({}, form);
                delete data["userids"];
                jQuery.extend(d, data);
            }

        })
        .withDataProp('data')
        .withOption('createdRow', function(row, data, dataIndex) {
            angular.element(row).addClass("rows" + data.id);
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
            return '<div class="ui_center"><label class="heckbox-inline"><input type="checkbox" data-comminssion="' + full.sumunsettled + '" class="js_settle_checkbox" value="' + full.userid + '-' + (full.sumamount || 0)+'-' + (full.sumunsettled || 0) + '-' + (full.sumactivity || 0) + '-' + (full.suminsurance || 0) + '-' + (full.sumcommissionfee || 0) + '" ' + checked + '></label></div>';
        }),
        DTColumnBuilder.newColumn('userid').withTitle('理财经理ID').withOption('sWidth','100px').renderWith(function(data, type, full) {
            if(!data) return "";
            return '<a href="javascript:void(0);" class="infoDetail" data-href="/xinghuouser/userinfo.shtml?userType=director&id=' + data + '">' + data + '</a>';
        }),
        DTColumnBuilder.newColumn('realname').withTitle('理财经理姓名').withOption('sWidth','100px'),
        DTColumnBuilder.newColumn('mobile').withTitle('理财经理手机号').withOption('sWidth','120px'),
        DTColumnBuilder.newColumn('documentno').withTitle('身份证号码').withOption('sWidth', '160px'),
        DTColumnBuilder.newColumn('bankname').withTitle('银行名称').withOption('sWidth', '100px'),
        DTColumnBuilder.newColumn('cardno').withTitle('银行卡号').withOption('sWidth','160px').renderWith(function(data,type,full){
            if(!data) return "";
            return '<span class="ui_ellipsis" title="' + data + '">' + data + '</span>';
        }),
        DTColumnBuilder.newColumn('branchbankname').withTitle('支行名称').withOption('sWidth','90px'),
        DTColumnBuilder.newColumn('yixinstatus').withTitle('是否宜信员工').withOption('sWidth','90px').renderWith(function(data, type, full) {
            return (data == 1 ? "是" :"否");
        }),
        DTColumnBuilder.newColumn('sumcommissionfee').withTitle('网贷总佣金(元)').withOption('sWidth','150px').renderWith(function(data, type, full) {
            if(!data) return "";
            return '<a href="#xinghuosettle-settleinfo.html?userId=' + full.userid + '&settleStatus='+ full.status + '&commMonth=' + full.commMonth + '&settleType=' + full.settleType + '&name=' + full.realname + '" target="_blank">' + tools.formatNumber(data.toFixed(2)) + '</a>';
        }),
        DTColumnBuilder.newColumn('sesameamount').withTitle('类固收顾问费(元)').withOption('sWidth','150px').renderWith(function(data, type, full) {
            if(!data){
                return data = "";
            };
            return '<a href="#xinghuogoldrainbow-fixationProduct.html?&transTimeStart='+ $scope.date.transTimeStart +'&transTimeEnd='+ $scope.date.transTimeEnd +'&state=20,30,40,50&financialUserId='+ full.userid +'" target="_blank">' + tools.formatNumber(data.toFixed(2)) + '</a>';
        }),
        DTColumnBuilder.newColumn('sumactivity').withTitle('活动金额(元)').withOption('sWidth','90px').renderWith(function(data, type, full) {
            return tools.formatNumber(data.toFixed(2));
        }),
        DTColumnBuilder.newColumn('suminsurance').withTitle('保险佣金(元)').withOption('sWidth','90px').renderWith(function(data, type, full) {
            return '<a href="#/xinghuosettle-insuranceSettleInfo.html?userId=' + full.userid + '&commMonth=' + full.commMonth + '&settleStatus='+ full.status  + '&settleType=' + full.settleType + '&name=' + full.realname + '&suminsurance=' + data + '" target="_blank">' + tools.formatNumber(data.toFixed(2)) + '</a>';
        }),
        DTColumnBuilder.newColumn('decAmount').withTitle('增减金额(元)').withOption('sWidth','90px'),
        DTColumnBuilder.newColumn('sumunsettled').withTitle('结算总额(税前)').withOption('sWidth','130px').renderWith(function(data, type, full) {
            return tools.formatNumber(data.toFixed(2));
        }),
        DTColumnBuilder.newColumn('tax').withTitle('代扣税').withOption('sWidth','130px').renderWith(function(data, type, full) {
            return tools.formatNumber(data.toFixed(2));
        }),
        DTColumnBuilder.newColumn('sumunsettledaftertax').withTitle('结算总额(税后)').withOption('sWidth','130px').renderWith(function(data, type, full) {
            return tools.formatNumber(data.toFixed(2));
        })
    ];
    vm.dtColumns = dtColumns;
    //if($scope.isYX){
    //    $scope.groupName = '宜信员工';
    //    //vm.dtColumns.splice(8, 0,
    //    //    DTColumnBuilder.newColumn('district').withTitle('员工城市').withOption('sWidth','90px'),
    //    //    DTColumnBuilder.newColumn('department').withTitle('员工部门').withOption('sWidth','160px')
    //    //);
    //};
    $scope.action.reset = function(){
        for(var prop in $scope.form){
            if(prop !== 'isShow') delete $scope.form[prop];
        };
         $scope.date.js_q_year = yearFlag;
         $scope.date.js_q_month = monthFlag;
         $scope.form.month = dateFlag;
        vm.dtInstance.rerender();
    };
    $scope.action.search = function(){
        if(parseInt(($scope.form.month).replace(/-/,'')) > parseInt(dateFlag.replace(/-/,''))){
            return alert("选择的年月份，应当小于当前的日期！");
        };
        vm.dtInstance.rerender();
    };
    var ModalCtrl = function($scope, $modalInstance) {
        $scope.form = {};
        $scope.showFlag = true;
        $scope.confirmInfo = function(){
            if(!$.trim($scope.form.userId)){
                return alert("请输入理财师ID！");
            };
            if(!$.trim($scope.form.amount)){
                return alert("请输入增减金额！");
            };
            $scope.showFlag = false;
        };
        $scope.ok = function() {
            var self = $("#confirmBtn");
            if(!tools.ajaxLocked(self)) return;
            $modalInstance.close();
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + "/xinghuosettle/addSettledToBlockWorm.shtml",
                data: $scope.form,
                dataType: "json",
                success: function (data) {
                    tools.ajaxOpened(self);
                    //if (!tools.interceptor(data)) return;
                    if (data.result == "SUCCESS") {
                        alert("修改成功");
                        return vm.dtInstance.rerender();
                    }else{
                        alert(data.message);
                    };
                },
                error: function (err) {
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });
        };
        $scope.cancel = function() {
            $scope.showFlag = true;
        };
        $scope.close = function() {
            $modalInstance.close();
        };
    };
    $scope.action.changeAmount = function(){
        $modal.open({
            backdrop: true,
            backdropClick: true,
            dialogFade: false,
            keyboard: true,
            templateUrl : 'myModalContent.html',
            controller : ModalCtrl,
            windowClass:'modal-640'
        });
    };
    var ModalImportCtrl = function($scope, $modalInstance) {
        $scope.form = {};
        $scope.action = {};
        $scope.select = {};
        $scope.select.years = [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021];
        $scope.select.months = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
        $scope.date = {};
        $scope.importExcel = siteVar.serverUrl + "/xinghuosettle/downloadTowltTemplate.shtml";
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
        $scope.form.month = '' + $scope.date.year + '-' + $scope.date.month;

        $scope.ok = function() {
            var self = $("#importConfirmBtn"), filevalue = $(".js_upload_settle_form [name='inputfile']").val();
            if(!filevalue) return alert("请选择导入文件");
            var nameArr = filevalue.split(".");
                if(!/xls/gi.test(nameArr[nameArr.length-1])) return alert("文件必须是excel文件，后缀名为xls或者xlsx!");
            var selectDate = new Date($scope.date.year, $scope.date.month - 1), disDate = nowTime - selectDate, cDate = (nowTime.getDate())*24*60*60*1000;
            if(!(cDate < disDate)){
                return alert("选择的年月份，应当小于当前的日期！");
            };
            if(!tools.ajaxLocked(self)) return;
            $modalInstance.close();
            var data = new FormData($(".js_upload_settle_form")[0]);
            var dataType = ($(".js_upload_settle_form").attr("data-type"))
            $.ajax({
                url : siteVar.serverUrl + $(".js_upload_settle_form").attr("action"),
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
                        var str = '<div class="modal-content"><div class="modal-header"><button id="js_dialog_passport_settle_close" type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>';
                        if(dataType == "wanlitong"){
                            str += '<h4 class="modal-title fn-ms">导入万里通</h4></div><div class="modal-body" style="max-height:300px; overflow-y: auto;font-size: 14px;">';
                            str += '导入成功 <a href="javascript:void(0)" class="js_gowlt">去万里通查看</a><br />';
                            str += data.msg;
                        }else{
                            str += '<h4 class="modal-title fn-ms">导入结算</h4></div><div class="modal-body" style="max-height:300px; overflow-y: auto;font-size: 14px;">'+data.msg+'<br>'+'excel结算总笔数: '+
                                data.data.allsize+'<br>'+'待结算修改成结算中笔数: '+data.data.rightsize+'<br>'+'失败笔数:'+data.data.wrongsize+'||--->错误信息如下:'+'<br>'+data.data.wrongmsg;
                        }
                        str += '</div></div>';
                        $("#js_dialog_passport .js_content").html(str);
                        $("#js_dialog_passport").modal({backdrop: 'static', keyboard: false});
                        $(".js_gowlt").on("click",function () {
                            $("#js_dialog_passport").modal("hide");
                            window.location.href = "#/xinghuosettle-wltnoSettle.html";
                        })
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
    $scope.action.importWlt = function(){
        $modal.open({
            backdrop: true,
            backdropClick: true,
            dialogFade: false,
            keyboard: true,
            templateUrl : 'wltImport.html',
            controller : ModalImportCtrl,
            windowClass:'modal-640'
        });
    };
    (function(){
        tools.createModal();
        tools.createModalProgress();
        tools.createModalUser();
        var popUpLayer = $("#js_dialog"), popUpLayerContent = popUpLayer.find(".js_content");

        $("#js_unsettle_settle_wlt_selected").on("click", function(){
            var self = this, setIds = "", commissionFlag = false, len = 0;
            $("#dataTables .js_settle_checkbox").each(function (i, e) {
                setIds += e.checked ? e.value + "||" : "";
                if(e.checked && (parseInt($(e).attr("data-comminssion")) <= 1200)){
                    commissionFlag = true;
                };
                if(e.checked){
                    len++;
                };
            });

            if(!setIds.length) {
                return alert("请选需要结算的记录！");
            };
            if(!confirm("您已选择了" + len + "条记录，确定要进入万里通结算列表吗？")){
                return;
            };
            if(commissionFlag){
                //return alert("存在1200元及以下记录，不能走万里通结算！");
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

                        var html = [
                            '<div class="modal-content" style="width: 500px; margin: 0 auto;">',
                            '<div class="modal-header">',
                            '<h4 class="modal-title fn-ms">操作</h4>',
                            '</div>',
                            '<div class="modal-body clearfix">',
                            '<div class="col-lg-12">',
                            '操作成功！已有' + len + '条记录进入万里通未结算列表！',
                            '</div>',
                            '</div>',
                            '<div class="modal-footer">',
                            '<button type="button" class="btn btn-success fn-ms" data-dismiss="modal">留在此页</button>',
                            '<a href="#/xinghuosettle-wltnoSettle.html" class="btn btn-primary fn-ms" >查看万里通记录</a>',
                            '</div>',
                            '</div>'
                        ];
                        $("#js_dialog .js_content").html(html.join(""));
                        $("#js_dialog").modal();
                        $("#js_dialog").on('hidden.bs.modal', function () {
                            vm.dtInstance.rerender();
                        });
                    };

                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });

        });
    })();
    function fnDrawCallback(data){
        var monthInput = form.find("input[name='month']");
        if(monthInput.val() == dateFlag){
            $("#js_unsettle_changeAmount").removeClass("disabled");
        }else{
            $("#js_unsettle_changeAmount").addClass("disabled");
        };

        $scope.$apply(function(){
            $scope.sumunsettled = tools.formatNumber((data.json.info && data.json.info.sumunsettled) || 0);
        });
        //tools.createModal();
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
        $("#js_unsettle_export").on("click", function(){
            tools.export(this);
        });

        var selectAll = $("#chooseAll"), settleBtn = $("#js_unsettle_settle_selected");
        selectAll.off("change").on("change", function(){
            var self = this, selectList = table.find(".js_settle_checkbox");
            selectList.each(function (i, e) {
                this.checked = self.checked;
                $(this).uniform();
            });
            return false;
        });

        settleBtn.off("click").on("click", function(){
            var setIds = "", selectList = table.find(".js_settle_checkbox");
            selectList.each(function (i, e) {
                setIds += e.checked ? (e.value + "||") : "";
            });
            if(!setIds.length){
                return alert("请选择需要结算的记录!");
            };
            $("#userids").val(setIds.substring(0, setIds.length-2));
            var self = this, data = tools.getFormele({}, form), url = $(this).attr("data-href");
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url:siteVar.serverUrl +  url,
                data: data,
                dataType: "json",
                success: function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    if(data.success){
                        $scope.$apply(function(){
                            $scope.action.reset();
                        });
                    };
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });

        });
    }
}
