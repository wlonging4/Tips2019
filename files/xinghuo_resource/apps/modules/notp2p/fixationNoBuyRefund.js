'use strict';
function fixationNoBuyRefund($scope, tools,$modal, DTOptionsBuilder, DTColumnBuilder){
    var domForm = $("#js_form"), conditionItem = domForm.find(".form-group");
    $scope.form = {
        isShow: (conditionItem.length > 1) ? true : false
    };
    $scope.select = {};
    $scope.action = {};
    $scope.refundStatus = {
        "-1":"审核中",
        "0":"审核成功",
        "1":"审核拒绝",
        "2":"已取消",
        "3":"退款失败",
        "4":"退款成功",
        "5":"退票"
    }
    /*
     创建表格选项
     */
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax',{
        url: siteVar.serverUrl + '/sesamerefund/tableSesameFlowRefund.shtml',
        type: 'POST',
        data: $scope.form
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
        DTColumnBuilder.newColumn('refundNo').withTitle('退款申请单号').withOption('sWidth', '300px').renderWith(function(data,type,full){
            if(!data) return "";
            return '<a href="javascript:;" data-href="/sesamerefund/viewSesameFlowRefund.json?id='+full.id+'&refundNo='+data+'" class="js-refund">'+data+'</a>';
        }),
        DTColumnBuilder.newColumn('userName').withTitle('用户姓名').withOption('sWidth', '80px'),

        DTColumnBuilder.newColumn('documentNo').withTitle('身份证号').withOption('sWidth','150px'),
        DTColumnBuilder.newColumn('refundAmt').withTitle('退款金额').withOption('sWidth','90px').renderWith(function(data,type,full){
            if(!data) return "";
            return tools.formatNumber(data);
        }),
        DTColumnBuilder.newColumn('currency').withTitle('币种').withOption('sWidth','80px').renderWith(function(data,type,full){
            return "人民币";
        }),
        DTColumnBuilder.newColumn('bankCardno').withTitle('打款银行账号').withOption('sWidth', '160px'),
        DTColumnBuilder.newColumn('cardno').withTitle('募集账号').withOption('sWidth', '160px'),
        DTColumnBuilder.newColumn('applyTime').withTitle('申请日期').withOption('sWidth', '160px').renderWith(function(data,type,full){
            if(!data) return "";
            return data.substr(0,4)+"-"+data.substr(4,2)+"-"+data.substr(6,2);
        }),
        DTColumnBuilder.newColumn('refundStatus').withTitle('退款状态').withOption('sWidth', '120px').renderWith(function(data,type,full){
            var str="";
            switch (parseInt(data)){
                case -1:
                    str="审核中";
                    break;
                case 0:
                    str="审核成功";
                    break;
                case 1:
                    str="审核拒绝";
                    break;
                case 2:
                    str="已取消";
                    break;
                case 3:
                    str="退款失败";
                    break;
                case 4:
                    str="退款成功";
                    break;
                case 5:
                    str="退票";
                    break;
                default :
                    str="";
                    break;
            }
            return str;
        })
    ];
    $scope.action.reset = function(){
        for(var prop in $scope.form){
            if(prop !== 'isShow') delete $scope.form[prop];
        };
        vm.dtInstance.rerender();
    };
    $scope.action.search = function(){
        vm.dtInstance.rerender();
    };
    $scope.action.export = function(event){
        var self = event.currentTarget;
        var url="/sesamerefund/exportSesameFlowRefundPage.json";

        $.when($.ajax({url:siteVar.serverUrl +url})).then(function(data){
            if(data.success){
                tools.export(self);
            }
        }).fail(function(err){
            tools.ajaxOpened(self);
            tools.ajaxError(err);
            return false;
        });

    };
    var refundDetailModal = function($scope, info,$modalInstance){
        $scope.info = info;
        $scope.info.transtime = !info?"":tools.toJSDate(info.transtime);
        $scope.info.transAmt = info.transAmt==null?"":tools.formatNumber(info.transAmt);
        $scope.info.refundAmt = info.refundAmt==null?"":tools.formatNumber(info.refundAmt);

        $scope.info.applyTime =info.applyTime==null?"": info.applyTime.substr(0,4)+"-"+info.applyTime.substr(4,2)+"-"+info.applyTime.substr(6,2);
        $scope.info.applySubmittime =info.applySubmittime==null?"": info.applySubmittime.substr(0,4)+"-"+info.applySubmittime.substr(4,2)+"-"+info.applySubmittime.substr(6,2)+" "+info.applySubmittime.substr(8,2)+":"+info.applySubmittime.substr(10,2)+":"+info.applySubmittime.substr(12,2);
        $scope.info.completeTime =info.completeTime==null?"": info.completeTime.substr(0,4)+"-"+info.completeTime.substr(4,2)+"-"+info.completeTime.substr(6,2)+" "+info.completeTime.substr(8,2)+":"+info.completeTime.substr(10,2)+":"+info.completeTime.substr(12,2);
        $scope.info.auditTime =info.auditTime==null?"": info.auditTime.substr(0,4)+"-"+info.auditTime.substr(4,2)+"-"+info.auditTime.substr(6,2)+" "+info.auditTime.substr(8,2)+":"+info.auditTime.substr(10,2)+":"+info.auditTime.substr(12,2);

        switch ( parseInt(info.refundReason) ){
            case 1:
                $scope.info.refundReasonDes = "主动退款";
                break;
            case 2:
                $scope.info.refundReasonDes = "超募退款";
                break;
            case 3:
                $scope.info.refundReasonDes = "违规退款";
                break;
            case 4:
                $scope.info.refundReasonDes = "其他";
                break;
            case 5:
                $scope.info.refundReasonDes = "冷凝期退款";
                break;
            case 6:
                $scope.info.refundReasonDes = "募集失败";
                break;
            case 7:
                $scope.info.refundReasonDes = "超额退款";
                break;
            case 8:
                $scope.info.refundReasonDes = "认购费优惠";
                break;
        }
        switch (parseInt(info.refundStatus)){
            case -1:
                $scope.info.refundStatusType="审核中";
                break;
            case 0:
                $scope.info.refundStatusType="审核成功";
                break;
            case 1:
                $scope.info.refundStatusType="审核拒绝";
                break;
            case 2:
                $scope.info.refundStatusType="已取消";
                break;
            case 3:
                $scope.info.refundStatusType="退款失败";
                break;
            case 4:
                $scope.info.refundStatusType="退款成功";
                break;
            case 5:
                $scope.info.refundStatusType="退票";
                break;
            default :
                $scope.info.refundStatusType="";
                break;
        }
        //取消
        $scope.close = function() {
            $modalInstance.close();
        };
    };
    function fnDrawCallback(){
        if(!tools.interceptor(window.ajaxDataInfo)) return;

        var table = $("#dataTables"), tbody = table.find("tbody");
        /*退款申请单号  详情*/
        table.off("click").on("click",".js-refund",function(){
            var self = $(this), href = self.attr("data-href"), data, url;
            data = tools.queryUrl(href);
            url = href.split('?')[0];
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url:siteVar.serverUrl +  url,
                data: data,
                success: function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    $modal.open({
                        backdrop: true,
                        backdropClick: true,
                        dialogFade: false,
                        keyboard: true,
                        templateUrl : 'refundDetailModal.html',
                        controller : refundDetailModal,
                        //windowClass:'modal-640',
                        resolve:{
                            "info" : function(){
                                return data.data;
                            }
                        }
                    });
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            })

        });
    }
}
