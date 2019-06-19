'use strict';
function redemptionController($scope, $modal, getSelectListFactory, getProListFactory, tools, DTOptionsBuilder, DTColumnBuilder) {
    var domForm = $("#js_form"), conditionItem = domForm.find(".form-group");
    $scope.form = {
        isShow: (conditionItem.length > 6) ? true : false
    };
    $scope.select = {};
    $scope.action = {};
    /*
     获取枚举类型
     */
    var selectList = getSelectListFactory.getSelectList(['redeem_status', 'product_category', 'received_type','redeem_settlement_type']);
    selectList.then(function(data){
        $scope.select.redeem_status = data.appResData.retList[0].redeem_status;
        $scope.select.proFirstList = data.appResData.retList[1].product_category;
        $scope.select.received_type = data.appResData.retList[2].received_type;
        $scope.select.redeem_settlement_type = data.appResData.retList[3].redeem_settlement_type;
    });
    $scope.action.chooseThirdPro = function(){
        getProListFactory.getProOtherList({
            category: $scope.form.category,
            series: $scope.form.series
        }).then(function(data){
            if(!data.success) {
                alert("获取产品列表失败，请与管理员联系。"+data.msg);
                return;
            }
            $scope.select.productNameCode = data.data.nameList;
        });
        delete $scope.form.productNameCode;
    };
    /*
     创建表格选项
     */
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/xinghuodeal/tableRedemption.shtml',
            type: 'POST',
            data: function(d){
                var data = $.extend({},tools.getFormele({}, domForm),$scope.form) ;
                $.extend(d, data);
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
    vm.dtColumns = [
        DTColumnBuilder.newColumn('appRedeemId').withTitle('赎回单ID').withOption('sWidth', '260px').renderWith(function(data, type, full) {
            if(!data) return "";
            return '<a href="javascript:void(0);" class="infoDetail" data-href="/xinghuodeal/redeemDetail.shtml?appRedeemId=' + data + '">' + data + '</a>';
        }),
        DTColumnBuilder.newColumn('appOrderId').withTitle('交易单号').withOption('sWidth','180px').renderWith(function(data, type, full) {
            if(!data) return "";
            return '<a href="javascript:void(0);" class="infoDetail" data-href="/xinghuodeal/tradeinfo.shtml?appRedeemId=' + full.appRedeemId + '&no=' + data + '">' + data + '</a>';
        }),
        DTColumnBuilder.newColumn('lenderName').withTitle('出借人姓名').withOption('sWidth','90px').renderWith(function(data, type, full) {
            if(!data) return "";
            return '<a href="javascript:void(0);" class="infoDetail" data-href="/xinghuouser/userinfo.shtml?userType=consumer&id=' + full.lenderId + '">' + data + '</a>';
        }),
        DTColumnBuilder.newColumn('repayAmount').withTitle('回款结算金额').withOption('sWidth','90px'),
        DTColumnBuilder.newColumn('redeemStatusStr').withTitle('赎回状态').withOption('sWidth', '60px'),
        DTColumnBuilder.newColumn('repayDate').withTitle('到期日&期数').withOption('sWidth', '140px'),
        DTColumnBuilder.newColumn('cashTime').withTitle('变现申请时间').withOption('sWidth','140px').renderWith(function(data, type, full) {
            if(!data) return "";
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('applyTime').withTitle('赎回单生成时间').withOption('sWidth','140px').renderWith(function(data, type, full) {
            if(!data) return "";
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('successTime').withTitle('赎回成功时间').withOption('sWidth','140px').renderWith(function(data, type, full) {
            if(!data) return "";
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('appRedeemId').withTitle('<label style="font-weight: bold"><input type="checkbox" id="chooseAll">全选</label>').withOption('sWidth','60px').renderWith(function(data, type, full) {
            if(full.redeemStatus != "2") return "";
            return '<div class="col-lg-12 col-xs-12 ui_center"><label class="heckbox-inline"><input data-repayDate="'+full.repayDate+'" data-payChannel="'+ full.payChannel +'" type="checkbox" class="js_settle_checkbox" value="' + data + '"></label></div>';
        }),
        DTColumnBuilder.newColumn('isTrusteeshipStr').withTitle('是否托管').withOption('sWidth', '60px')
    ];
    $scope.action.reset = function(){
        for(var prop in $scope.form){
            if(prop !== 'isShow') delete $scope.form[prop];
        }
        vm.dtInstance.rerender();
    };
    $scope.action.search = function(){
        if($scope.form.appOrderId && (($.trim($scope.form.appOrderId)).length < 4)){
            return alert("输入的交易单号，长度不能小于4");
        };
        vm.dtInstance.rerender();
    };
    var ModalCtrl = function($scope, $modalInstance) {
        $scope.modalTitle = '修改赎回金额';
        $scope.form = {};
        $scope.showFlag = true;
        $scope.confirmInfo = function(){
            if(!$.trim($scope.form.redeemNo)){
                return alert("请输入赎回单号！");
            };
            if(!$.trim($scope.form.amount)){
                return alert("请输入实际赎回金额！");
            };
            $scope.modalTitle = '确定修改';
            $scope.showFlag = false;
        };
        $scope.ok = function() {
            var self = $("#confirmBtn");

            if(!tools.ajaxLocked(self)) return;
            $modalInstance.close();
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + "/xinghuodeal/changeRedemptionMoney.shtml",
                data: $scope.form,
                dataType: "json",
                success: function (data) {
                    tools.ajaxOpened(self);
                    if (!tools.interceptor(data)) return;
                    if (data.success) {
                        alert("修改成功");
                        return vm.dtInstance.rerender();
                    }else{
                        alert("修改失败");
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
            $scope.modalTitle = '修改赎回金额';
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
    }

    var ModalResettle = function($scope, $modalInstance) {
        var redeemNoList = [];
        $scope.modalTitle = "赎回单-重新结算";
        $scope.form = {};
        $scope.submitFlag = true;
        $scope.errorFlag = false;
        $scope.payFlag = false;
        $scope.errorInfo = "";

        $scope.sum = 0;
        $scope.amount = 0;
        $scope.result = "";


        $scope.ok = function() {
            var self = $("#reSettleSubmit");
            if(!$scope.form.redeemNo){
                return alert("请输入赎回单号")
            };
            if(!tools.ajaxLocked(self)) return;
            redeemNoList = $scope.form.redeemNo.split("\n");
            redeemNoList = unique(redeemNoList);
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + "/xinghuodeal/queryRedemptionForRePay.shtml",
                data: {
                    redeemNos : redeemNoList.toString()
                },
                dataType: "json",
                success: function (data) {
                    tools.ajaxOpened(self);
                    //if (!tools.interceptor(data)) return;
                    if (data.success) {
                        $scope.submitFlag = false;
                        $scope.errorFlag = false;
                        $scope.payFlag = true;
                        $scope.sum = data.data && data.data.toalSize || 0;
                        $scope.amount = data.data && data.data.toalMoney || 0;
                        $scope.result = ($.map(data.data.redeemList, function(item, index){
                            return item.appRedeemId + " 结算金额" + item.repayAmount
                        })).join("\n");


                        $scope.$apply();
                    }else{
                        $scope.submitFlag = false;
                        $scope.errorFlag = true;
                        $scope.payFlag = false;
                        $scope.errorInfo = data.msg;
                        $scope.$apply();
                    };
                },
                error: function (err) {
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });
        };
        $scope.pay = function(){
            var self = $("#reSettlePay");

            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + "/xinghuodeal/confirmRedemptionForRePay.shtml",
                data: {
                    redeemNos : redeemNoList.toString()
                },
                dataType: "json",
                success: function (data) {
                    tools.ajaxOpened(self);
                    if (!tools.interceptor(data)) return;
                    if (data.success) {
                        alert("重新结算成功");
                        $modalInstance.close();
                    }else{
                        alert(data.msg);
                        $modalInstance.close();
                    };
                },
                error: function (err) {
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });
        };
        $scope.close = function() {
            $modalInstance.close();
        };

        function unique(array){
            var n = [];
            for(var i = 0;i < array.length; i++){
                if(n.indexOf(array[i]) == -1) n.push(array[i]);
            }
            return n;
        }
    };
    $scope.action.resettle = function(){
        $modal.open({
            backdrop: true,
            backdropClick: true,
            dialogFade: false,
            keyboard: true,
            templateUrl : 'myModalResettle.html',
            controller : ModalResettle,
            windowClass:'modal-640'
        });
    }
    $scope.action.searchList= function(){
        tools.resetWidth();
        tools.createModal();
        tools.createModalProgress();
        var popUpLayer = $("#js_dialog"), popUpLayerContent = popUpLayer.find(".js_content");

        var data = tools.getFormele({}, $("#js_form"));
        var domList = {}, statusArr = [], typeArr = ['到期回款', '月息通收益'];

        if(data.payChannel == null) return alert('请选择“回款结算类型”。');
        if( data.payChannel == 1){
            var dateCurrent= new Date();
            var h= dateCurrent.getHours();
            if(h<15 || h<'15'){
                alert('“星火钱包”赎回，请于15:00后操作！');
                return;
            }
        }

        angular.forEach($scope.select.redeem_status, function(data, index, array){
            statusArr.push(data.value)
        });
        for(var o in data){
            if( o == 'appRedeemId'){
                domList[o] = '<div>赎回单ID为：' + data.appRedeemId + '</div>';
            };
            if( o == 'appOrderId'){
                domList[o] = '<div>交易单号为：' + data.appOrderId + '</div>';
            };
            if( o == 'lenderId'){
                domList[o] = '<div>出借人ID为：' + data.lenderId + '</div>';
            };
            if( o == 'repayAmountStart' || o == 'repayAmountEnd'){
                domList['repayAmount'] = '<div>结算金额为：' + data.repayAmountStart + '-' + data.repayAmountEnd + '</div>';
            };
            if( o == 'applyTimeStart' || o == 'applyTimeEnd'){
                domList['applyTime'] = '<div>申请时间为：' + data.applyTimeStart + '-' + data.applyTimeEnd + '</div>';
            };
            if( o == 'redeemStatus'){
                domList[o] = data.redeemStatus;
            };
            if( o == 'receivedType'){
                domList[o] = data.receivedType;
            };
            if( o == 'repayDate'){
                domList[o] = '<div>到期日为：' + data.repayDate + '</div>';
            };
        };
        if(!!domList.redeemStatus){
            domList.redeemStatus = '<div>赎回状态为：' + statusArr[domList.redeemStatus - 1] + '</div>'
        };
        if(!!domList.receivedType){
            domList.receivedType = '<div>回款类型为：' + typeArr[domList.receivedType-1] + '</div>'
        };
        var settleData = '';
        for(var o in domList){
            settleData += domList[o];
        };
        var html = '';
        html += '<div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button><h4 class="modal-title fn-ms">更新赎回单管理状态</h4></div><div class="modal-body clearfix">';
        html += settleData;
        html +='</div><div class="modal-footer"><button type="button" class="btn btn-primary fn-ms" data-dismiss="modal">取消</button><button type="button" class="btn btn-success fn-ms" id="js_jiesuan_all_retrun">确认</button></div></div>';
        popUpLayerContent.html(html);
        popUpLayer.modal("show");
        $('#js_jiesuan_all_retrun').on('click',function(){
            var self = this;

            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + "/xinghuodeal/redeemSettlement.shtml",
                data: data,
                dataType: "json",
                success: function(data){
                    tools.ajaxOpened(self);
                    //if(!tools.interceptor(data)) return;
                    //if(data.success) {
                    var callbackHtml = '<div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button><h4 class="modal-title fn-ms">更新赎回单管理状态</h4></div><div class="modal-body clearfix"><div>' + data.msg + '</div></div><div class="modal-footer"><button type="button" class="btn btn-primary fn-ms" data-dismiss="modal">确定</button></div></div>';
                    popUpLayerContent.html(callbackHtml);
                    popUpLayer.modal("show");
                    vm.dtInstance.rerender();
                    //};
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });
        });

    }
    ;(function(){
        $(document).off("change").on('change',"#js_category",function(){
            var source = $(this).find ("option:selected").attr("source");
            $scope.form.source = source;
            getProListFactory.getProOtherList({
                category: $scope.form.category,
                source : source
            }).then(function(data){
                if(!data.success) {
                    alert("获取产品列表失败，请与管理员联系。"+data.msg);
                    return;
                }
                $scope.select.series = data.data.seriesList;
            });
            delete $scope.form.series;
            delete $scope.form.productNameCode;
            $scope.select.productNameCode = [];
            return false;
        });
    })();


    function fnDrawCallback(data){
        $scope.$apply(function(){
            $scope.tableinfo = window.ajaxDataInfo.info || 0;
        });
        tools.resetWidth();
        tools.createModal();
        tools.createModalProgress();
        var popUpLayer = $("#js_dialog"), popUpLayerContent = popUpLayer.find(".js_content");

        $(".js_export").on("click", function(){
            if($scope.form.appOrderId && (($.trim($scope.form.appOrderId)).length < 4)){
                return alert("输入的交易单号，长度不能小于4");
            };
            tools.export(this);
        });

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
        $(".dataTables_scrollHeadInner").find("input[type='checkbox']").uniform();
        table.find("input[type='checkbox']").uniform();
        //全选
        var selectAll = $("#chooseAll");
        selectAll.off("change").on("change", function(){
            var self = this, selectList = table.find(".js_settle_checkbox");
            var isAlert = false;
            var dateCurrent= new Date();
            var h= dateCurrent.getHours();
            var year = dateCurrent.getFullYear(),month=dateCurrent.getMonth()+ 1>=10?dateCurrent.getMonth()+ 1:'0'+(dateCurrent.getMonth()+ 1),date=dateCurrent.getDate()>=10?dateCurrent.getDate():'0'+dateCurrent.getDate();
            var dateFull =year +'-'+month+'-'+date;
            var repayDate,payChannel;
            selectList.each(function(){
                repayDate = $(this).attr("data-repayDate");
                payChannel = $(this).attr("data-payChannel");
                if(payChannel == 1 && repayDate.substr(0,10) >= dateFull && (h<15 || h<'15')){
                    isAlert = true;
                    return;
                }else{
                    this.checked = self.checked;
                    $(this).uniform();
                }
            })
            if(isAlert){
                alert('“星火钱包”赎回，请于15:00后操作！');
            }
            return false;
        });
        //单个点击checkbox
        var checkSelect = $(".js_settle_checkbox");
        checkSelect.on('change',function(){
            var repayDate = $(this).attr("data-repayDate");
            var payChannel = $(this).attr("data-payChannel");
            var dateCurrent= new Date();
            var h= dateCurrent.getHours();
            var year = dateCurrent.getFullYear(),month=dateCurrent.getMonth()+ 1>=10?dateCurrent.getMonth()+ 1:'0'+(dateCurrent.getMonth()+ 1),date=dateCurrent.getDate()>=10?dateCurrent.getDate():'0'+dateCurrent.getDate();
            var dateFull =year +'-'+month+'-'+date;
            if(payChannel == 1 && repayDate.substr(0,10) >= dateFull && (h<15 || h<'15')){
                $(this).prop("checked", false).uniform();
                alert('“星火钱包”赎回，请于15:00后操作！');
                return;
            };
        });



        $("#js_redempt_settle_selected").off("click").on("click", function () {
            var setIds = [], checkLen, checkboxDom = table.find(".js_settle_checkbox");
            checkboxDom.each(function (i, e){
                if(e.checked){
                    setIds.push(e.value);
                };
            });
            checkLen = setIds.length;
            var difDom = '';
            if(checkLen > 0){
                difDom = '<div class="modal-body clearfix"><div>选中结算赎回单为' + checkLen + '条</div></div><div class="modal-footer"><button type="button" class="btn btn-primary fn-ms" data-dismiss="modal">取消</button><button type="button" class="btn btn-success fn-ms" id="js_jiesuan_checked_retrun">确认</button></div>';
            }else{
                difDom = '<div class="modal-body clearfix"><div>请选择需要结算的记录</div></div><div class="modal-footer"><button type="button" class="btn btn-primary fn-ms" data-dismiss="modal">确定</button></div>'
            }
            var html = '<div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button><h4 class="modal-title fn-ms">更新赎回单管理状态</h4></div>' + difDom + '</div>';
            popUpLayerContent.html(html);
            popUpLayer.modal("show");
            if(checkLen > 0){
                $("#js_jiesuan_checked_retrun").off("click").on("click",function(){
                    var self = this;
                    var data = {
                        redeemIds: setIds.join(',')
                    };
                    if(!tools.ajaxLocked(self)) return;
                    $.ajax({
                        type: "post",
                        url: siteVar.serverUrl + "/xinghuodeal/redeemSettlement.shtml",
                        data: data,
                        dataType: "json",
                        success: function(data){
                            tools.ajaxOpened(self);
                            if(!tools.interceptor(data)) return;
                            if(data.success) {
                                var callbackHtml = '<div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button><h4 class="modal-title fn-ms">更新赎回单管理状态</h4></div><div class="modal-body clearfix"><div>' + data.msg + '</div></div><div class="modal-footer"><button type="button" class="btn btn-primary fn-ms" data-dismiss="modal">确定</button></div></div>';
                                popUpLayerContent.html(callbackHtml);
                                popUpLayer.modal("show");
                                vm.dtInstance.rerender();
                            }
                        },
                        error: function(err){
                            tools.ajaxOpened(self);
                            tools.ajaxError(err);
                        }
                    });
                })

            };
            return false;

        });


        //$("#js_redempt_settleall").on("click", function () {
        //    var data = tools.getFormele({}, $("#js_form"));
        //    var domList = {}, statusArr = [], typeArr = ['到期回款', '月息通收益'];
        //
        //if(data.payChannel == null) return alert('请选择“回款结算类型”。');
        //    if( data.payChannel == 1){
        //        var dateCurrent= new Date();
        //        var h= dateCurrent.getHours();
        //        if(h<15 || h<'15'){
        //            alert('“星火钱包”赎回，请于15:00后操作！');
        //            return;
        //        }
        //    }
        //
        //    angular.forEach($scope.select.redeem_status, function(data, index, array){
        //        statusArr.push(data.value)
        //    });
        //    for(var o in data){
        //        if( o == 'appRedeemId'){
        //            domList[o] = '<div>赎回单ID为：' + data.appRedeemId + '</div>';
        //        };
        //        if( o == 'appOrderId'){
        //            domList[o] = '<div>交易单号为：' + data.appOrderId + '</div>';
        //        };
        //        if( o == 'lenderId'){
        //            domList[o] = '<div>出借人ID为：' + data.lenderId + '</div>';
        //        };
        //        if( o == 'repayAmountStart' || o == 'repayAmountEnd'){
        //            domList['repayAmount'] = '<div>结算金额为：' + data.repayAmountStart + '-' + data.repayAmountEnd + '</div>';
        //        };
        //        if( o == 'applyTimeStart' || o == 'applyTimeEnd'){
        //            domList['applyTime'] = '<div>申请时间为：' + data.applyTimeStart + '-' + data.applyTimeEnd + '</div>';
        //        };
        //        if( o == 'redeemStatus'){
        //            domList[o] = data.redeemStatus;
        //        };
        //        if( o == 'receivedType'){
        //            domList[o] = data.receivedType;
        //        };
        //        if( o == 'repayDate'){
        //            domList[o] = '<div>到期日为：' + data.repayDate + '</div>';
        //        };
        //    };
        //    if(!!domList.redeemStatus){
        //        domList.redeemStatus = '<div>赎回状态为：' + statusArr[domList.redeemStatus - 1] + '</div>'
        //    };
        //    if(!!domList.receivedType){
        //        domList.receivedType = '<div>回款类型为：' + typeArr[domList.receivedType-1] + '</div>'
        //    };
        //    var settleData = '';
        //    for(var o in domList){
        //        settleData += domList[o];
        //    };
        //    var html = '';
        //        html += '<div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button><h4 class="modal-title fn-ms">更新赎回单管理状态</h4></div><div class="modal-body clearfix">';
        //        html += settleData;
        //        html +='</div><div class="modal-footer"><button type="button" class="btn btn-primary fn-ms" data-dismiss="modal">取消</button><button type="button" class="btn btn-success fn-ms" id="js_jiesuan_all_retrun">确认</button></div></div>';
        //    popUpLayerContent.html(html);
        //    popUpLayer.modal("show");
        //    $('#js_jiesuan_all_retrun').on('click',function(){
        //        var self = this;
        //
        //        if(!tools.ajaxLocked(self)) return;
        //        $.ajax({
        //            type: "post",
        //            url: siteVar.serverUrl + "/xinghuodeal/redeemSettlement.shtml",
        //            data: data,
        //            dataType: "json",
        //            success: function(data){
        //                tools.ajaxOpened(self);
        //                //if(!tools.interceptor(data)) return;
        //                //if(data.success) {
        //                var callbackHtml = '<div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button><h4 class="modal-title fn-ms">更新赎回单管理状态</h4></div><div class="modal-body clearfix"><div>' + data.msg + '</div></div><div class="modal-footer"><button type="button" class="btn btn-primary fn-ms" data-dismiss="modal">确定</button></div></div>';
        //                popUpLayerContent.html(callbackHtml);
        //                popUpLayer.modal("show");
        //                vm.dtInstance.rerender();
        //                //};
        //            },
        //            error: function(err){
        //                tools.ajaxOpened(self);
        //                tools.ajaxError(err);
        //            }
        //        });
        //    })
        //});
    }
}
