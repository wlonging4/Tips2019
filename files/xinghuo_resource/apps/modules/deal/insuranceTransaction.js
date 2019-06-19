'use strict';
function insuranceTransaction($scope,getSelectListFactory,getProListFactory,tools,DTOptionsBuilder, DTColumnBuilder) {
    var form = $("#js_form"), conditionItem = form.find(".form-group");
    $scope.form = {
        isShow: (conditionItem.length > 6) ? true : false
    };
    $scope.select = {};
    $scope.action = {};
    /*
    获取枚举类型
     */
    getSelectListFactory.getSelectList(['insurancepolicystatus', 'isintelligent']).then(function(data){
        //$scope.select.insurancepolicystatus = data.appResData.retList[0].insurancepolicystatus;
        var insurancepolicystatus = data.appResData.retList[0].insurancepolicystatus, result = [];
        angular.forEach(insurancepolicystatus, function(data, index, array){
            var obj = {
                "default": false
            };
            obj.text = data.value;
            obj.value = data.key;
            result.push(obj);
        });
        $('#multi_select').multiSel({
            'data': result,
            'name': "PolicyState"
        });
        $scope.select.isIntelligent = data.appResData.retList[1].isintelligent;
    });



    /*
    创建表格选项
     */
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/xinghuoinsurance/tableInsurancePolicy.shtml',
            type: 'POST',
            data: function(d){
                jQuery.extend(d, tools.getFormele({}, form));
            }
        })
        .withDataProp('data')
        .withOption('createdRow', function(row, data, dataIndex) {
            angular.element(row).addClass("rows"+data.id)
        })
        .withOption('searching',false)
        .withOption('ordering',false)
        .withOption('serverSide',true)
        .withOption('scrollX',true)
        .withOption('processing',false)
        .withLanguage(tools.dataTablesLanguage)
        .withOption('fnDrawCallback',fnDrawCallback)
        .withPaginationType('simple_numbers');
    vm.dtColumns = [
        DTColumnBuilder.newColumn('sid').withTitle('订单号').withOption('sWidth','60px'),
        DTColumnBuilder.newColumn('policyNumber').withTitle('保单号').withOption('sWidth','180px'),
        DTColumnBuilder.newColumn('ownerName').withTitle('用户姓名').withOption('sWidth','90px').renderWith(function(data, type, full) {
            if(!data) return "";
            return '<a href="javascript:void(0);" class="infoDetail" data-href="/xinghuouser/userinfo.shtml?userType=consumer&id=' + full.chanelUserId + '&bizSysRoute=' + (full.bizSysRoute || 0) + '">' + data + '</a>';
        }),
        DTColumnBuilder.newColumn('insbranchName').withTitle('保险公司名称').withOption('sWidth','120px').renderWith(function(data, type, full) {
            return '<span class="ui_ellipsis" title="' + data + '">' + data + '</span>';
        }),
        DTColumnBuilder.newColumn('baseCvrgName').withTitle('保险名称').withOption('sWidth','100px').renderWith(function(data, type, full) {
            return '<span class="ui_ellipsis" title="' + data + '">' + data + '</span>';
        }),
        DTColumnBuilder.newColumn('prem').withTitle('保费（元）').withOption('sWidth','80px').renderWith(function(data, type, full) {
            if(!data) return "";
            return (data).toFixed(2);
        }),
        DTColumnBuilder.newColumn('payDue').withTitle('缴费期限').withOption('sWidth','60px'),
        DTColumnBuilder.newColumn('times').withTitle('年度缴次').withOption('sWidth','60px'),
        DTColumnBuilder.newColumn('policyState').withTitle('保单状态').withOption('sWidth','60px'),
        DTColumnBuilder.newColumn('validateDate').withTitle('保单受理日期').withOption('sWidth','90px').renderWith(function(data, type, full) {
            if(!data) return "";
            return data;
        }),
        DTColumnBuilder.newColumn('holdData').withTitle('保单生效日期').withOption('sWidth','90px').renderWith(function(data, type, full) {
            if(!data) return "";
            return data;
        }),
        DTColumnBuilder.newColumn('modifyTime').withTitle('保单更新时间').withOption('sWidth','140px').renderWith(function(data, type, full) {
            if(!data) return "";
            return data;
        }),
        DTColumnBuilder.newColumn('isIntelligentDesc').withTitle('业务来源').withOption('sWidth','90px'),
        DTColumnBuilder.newColumn('lenderName').withTitle('理财经理姓名').withOption('sWidth','90px').renderWith(function(data, type, full) {
            if(!data) return "";
            return '<a href="javascript:void(0);" class="infoDetail" data-href="/xinghuouser/userinfo.shtml?userType=director&id=' + full.userid + '">' + data + '</a>';
        }),
        DTColumnBuilder.newColumn('storeCode').withTitle('店铺ID').withOption('sWidth','90px').renderWith(function(data, type, full) {
            if(!data) return "";
            if(!full.storeUrl) return '<span>' + data + '</span>';
            return '<a href="' + full.storeUrl + '" target="_blank">' + data + '</a>'
        })
    ];
    $scope.action.reset = function(){
        for(var prop in $scope.form){
            if(prop !== 'isShow') delete $scope.form[prop];
        };
        var cashStatus = $("#multi_select");
        cashStatus.find("[name='PolicyState']").val('')
            .prev().val('').end().end().find("[type='checkbox']").prop("checked", false).uniform();

        vm.dtInstance.rerender();
    };
    $scope.action.search = function(){
        vm.dtInstance.rerender();
    };
    function fnDrawCallback(data){

        $scope.$apply(function(){
            $scope.tableinfo = data.json.info;
        });

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
    };
    ;(function(){
        //$(".form_exact_datetime").datetimepicker({
        //    isRTL: Metronic.isRTL(),
        //    format: "yyyy-mm-dd hh:mm:ss",
        //    autoclose: true,
        //    todayBtn: true,
        //    pickerPosition: (Metronic.isRTL() ? "bottom-right" : "bottom-left"),
        //    minuteStep: 1,
        //    minView:0,
        //    language:"zh-CN"
        //});
        $("#js_insuranceTransaction_export").on("click", function(){
            tools.export(this);
        });
        $("#js_insuranceTransaction_refresh").on("click", function(){
            var self = this, data = tools.getFormele({}, form);
            if(!$scope.form.SID){
                if(!$scope.form.modifyTimeStart || !$scope.form.modifyTimeEnd){
                    return alert("保单更新开始时间和结束时间不能为空！");
                };
            };
            if(!confirm("确实要同步订单状态吗，这可能花费的时间较长!")) return false;
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
    })();

}
