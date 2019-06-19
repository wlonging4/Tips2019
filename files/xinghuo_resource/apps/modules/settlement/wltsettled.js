'use strict';
function wltsettled($scope, $stateParams, getSelectListFactory, tools, DTOptionsBuilder, DTColumnBuilder) {
    var form = $("#js_form"), conditionItem = form.find(".form-group");
    $scope.groupName = '非宜信员工结算（已结算）';
    $scope.form = {
        isShow: (conditionItem.length > 6) ? true : false,
        status:3
    };
    var dateFlag, yearFlag, monthFlag;
    $scope.isFlag = true;
    $scope.select = {};
    $scope.action = {};
    $scope.select.js_q_year = [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030];
    $scope.select.js_q_month = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
    $scope.date = {};

    getSelectListFactory.getSelectList(['yixinusertype', 'biz_sys_route', 'month_settle_status', 'settlement_status','protocol_status']).then(function(data){
        $scope.select.q_yixinusertype = data.appResData.retList[0].yixinusertype;
        $scope.select.bizSysRoute = data.appResData.retList[1].biz_sys_route;

        $scope.select.status = data.appResData.retList[3].settlement_status;
        $scope.select.protocol_status = data.appResData.retList[4].protocol_status;

    });
    $scope.filerStatus = function(e){
        return e.key != 0 && e.key != 3;
    };
    $scope.filerSource = function(e){
        return e.key != 4;
    };
    $scope.$watch('date',function(newValue,oldValue){
        $scope.form.month = '' + $scope.date.js_q_year + '-' + $scope.date.js_q_month;
        form.find("input[name='month']").val($scope.form.month);

        $scope.date.lastMonth = parseInt($scope.date.js_q_month)<11 ? ("0" + parseInt($scope.date.js_q_month-1)) : parseInt($scope.date.js_q_month)-1;
        $scope.date.transTimeStart = $scope.date.js_q_year + '-' + $scope.date.lastMonth + '-01';
        $scope.date.transTimeEnd = $scope.date.js_q_year + '-' + $scope.date.lastMonth + '-' +new Date($scope.date.js_q_year, $scope.date.lastMonth, 0).getDate();
    }, true);

    var date = new Date();
    $scope.date.js_q_year = date.getFullYear();
    $scope.date.js_q_month = date.getMonth() < 9 ? ("0" + parseInt(date.getMonth() + 1)): date.getMonth() + 1;

    //if(date.getMonth() == 0){
    //    $scope.date.js_q_year = date.getFullYear() - 1;
    //    $scope.date.js_q_month = 12;
    //}else{
    //    $scope.date.js_q_year = date.getFullYear();
    //    $scope.date.js_q_month = date.getMonth() < 10 ? ("0" + date.getMonth()): date.getMonth();
    //};
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
            url: siteVar.serverUrl + '/xinghuowltsettle/wlttableSettle.shtml',
            type: 'POST',
            data: function(d){
                var data = tools.getFormele({}, form);
                delete data["ids"];
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
            if(data == 2) return "";
            return '<div class="ui_center"><label class="checkbox-inline"><input type="checkbox" class="js_settle_checkbox" value="' + full.userid + '"></label></div>';
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
        DTColumnBuilder.newColumn('yixinusertypestr').withTitle('类型').withOption('sWidth','90px'),
        DTColumnBuilder.newColumn('sumcommissionfee').withTitle('网贷总佣金(元)').withOption('sWidth','150px').renderWith(function(data, type, full) {
            if(!data) return "";
            return '<a href="#xinghuosettle-settleinfo.html?userId=' + full.userid + '&settleStatus='+full.status + '&commMonth=' + full.commMonth +'&settleType='+full.settleType+'&settleNo='+full.settleNo+ '&name=' + full.realname + '" target="_blank">' + tools.formatNumber(data.toFixed(2)) + '</a>';
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
            return '<a href="#/xinghuosettle-insuranceSettleInfo.html?userId=' + full.userid + '&commMonth=' +full.commMonth + '&settleStatus='+full.status +'&settleType='+full.settleType + '&settleNo='+full.settleNo + '&name=' + full.realname + '&suminsurance=' + full.suminsurance + '" target="_blank">' + tools.formatNumber(data.toFixed(2)) + '</a>';
        }),
        DTColumnBuilder.newColumn('decAmount').withTitle('增减金额(元)').withOption('sWidth','90px').renderWith(function(data,type,full){
            if(!data){
                data = 0;
            };
            return tools.formatNumber(data.toFixed(2));
        }),
        DTColumnBuilder.newColumn('sumunsettled').withTitle('应结总额（扣服务费前）').withOption('sWidth','130px').renderWith(function(data, type, full) {
            if(!data){
                data = 0;
            };
            return tools.formatNumber(data.toFixed(2));
        }),
        DTColumnBuilder.newColumn('tax').withTitle('服务费（7%）').withOption('sWidth','130px').renderWith(function(data, type, full) {
            if(!data){
                data = 0;
            };
            return tools.formatNumber(data.toFixed(2));
        }),
        DTColumnBuilder.newColumn('sumunsettledaftertax').withTitle('实结总额（扣服务费后）').withOption('sWidth','130px').renderWith(function(data, type, full) {
            if(!data){
                data = 0;
            };
            return tools.formatNumber(data.toFixed(2));
        }),
        DTColumnBuilder.newColumn('settlementdate').withTitle('付款时间').withOption('sWidth','160px').renderWith(function(data, type, full) {
            return tools.toJSDate(data);
        }),
        /*DTColumnBuilder.newColumn('protocolStatusStr').withTitle('协议签约状态').withOption('sWidth','110px'),
        DTColumnBuilder.newColumn('protocolTime').withTitle('协议电签时间').withOption('sWidth','140px').renderWith(function (data,type,full) {
            return tools.toJSDate(data);
        }),*/
        DTColumnBuilder.newColumn('statusname').withTitle('结算状态').withOption('sWidth','130px')
    ];
    vm.dtColumns = dtColumns;
    $scope.action.reset = function(){
        for(var prop in $scope.form){
            if(prop !== 'isShow') delete $scope.form[prop];
        };
        $scope.date.js_q_year = yearFlag;
        $scope.date.js_q_month = monthFlag;
        $scope.form.month = dateFlag;
        $scope.form.status=3;
        vm.dtInstance.rerender();
    };
    $scope.action.search = function(){
        //if(parseInt($scope.form.month) > parseInt(dateFlag)){
        //    return alert("选择的年月份，应当小于当前的日期！");
        //};
        vm.dtInstance.rerender();
    };

    //批量协议导出_已结算
    $('#settleProtocol').off('click').on('click',function () {
        var self = this, setIds = "", len = 0;
        $("#dataTables .js_settle_checkbox").each(function (i, e) {
            setIds += e.checked? e.value+',': "";
            if(e.checked){
                len++;
            };
        });
        if(!setIds.length) {
            return tools.interalert("请选择需要批量下载的协议！");
        };
        var dataOrigin = setIds;
        var data='';
        var dataLen=0;
        var dataArr=dataOrigin.split(',');
        var dataLen=dataArr.length-1;
        if(dataLen&&dataLen>50){
            tools.interalert('批量下载数据条目过大,请不要超过50条~');
            return false;
        }
        data=dataOrigin.substring(0,dataOrigin.length-1);
        window.open(siteVar.serverUrl + '/xinghuowltsettle/downloadPdf.json?'+'userIds='+data);
    });

    function fnDrawCallback(data){

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
                url:siteVar.serverUrl + url,
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
        $("#js_settled_export").on("click", function(){
            tools.export(this);
        });

        var selectAll = $("#chooseAll"), settleBtn = $("#js_settled_settle_selected"), settleAll = $("#js_settled_settleall"), ids = $("#js_ids");
        selectAll.off("change").on("change", function(){
            var self = this, selectList = table.find(".js_settle_checkbox");
            selectList.each(function (i, e) {
                this.checked = self.checked;
                $(this).uniform();
            });
            return false;
        });
        settleAll.off("click").on("click", function(){
            if(!confirm("您确定结算所有结算单")) return false;
            ids.val("");
            var self = this, data = tools.getFormele({}, form), url = $(this).attr("action");
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url:siteVar.serverUrl + url,
                data: data,
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
        settleBtn.off("click").on("click", function(){
            var setIds = "", selectList = table.find(".js_settle_checkbox");
            selectList.each(function (i, e) {
                setIds += e.checked ? (e.value + ",") : "";
            });
            if(!setIds.length){
                return alert("请选择需要结算的记录!");
            };
            $("#js_ids").val(setIds.substring(0, setIds.length-1));
            var self = this, data = tools.getFormele({}, form), url = $(this).attr("action");
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
                        vm.dtInstance.rerender();
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
