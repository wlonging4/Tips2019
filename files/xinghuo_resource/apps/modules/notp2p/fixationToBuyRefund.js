'use strict';
function fixationToBuyRefund($scope,tools,$modal, DTOptionsBuilder, DTColumnBuilder){
    var domForm = $("#js_form"), conditionItem = domForm.find(".form-group");
    $scope.form = {
        isShow: (conditionItem.length > 1) ? true : false
    };
    //$scope.select = {};
    $scope.action = {};
    /*
     创建表格选项
     */
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax',{
        url: siteVar.serverUrl + '/sesamerefund/tableSesameRefund.shtml',
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
            return '<a href="javascript:;" data-href="/sesamerefund/viewSesameRefund.json?id='+full.id+'&refundApplyId='+data+'" class="js-refund">'+data+'</a>';
        }),
        DTColumnBuilder.newColumn('applyid').withTitle('原交易订单号').withOption('sWidth','300px').renderWith(function(data,type,full){
            if(!data) return "";
            return '<a href="javascript:;" data-href="/sesametrade/viewSesameTrade.json?applyid='+data+'&id='+full.tradeId+'" class="js-order">'+data+'</a>'
        }),
        DTColumnBuilder.newColumn('contractno').withTitle('协议编号').withOption('sWidth','250px'),
        DTColumnBuilder.newColumn('productName').withTitle('项目名称').withOption('sWidth','250px').renderWith(function(data, type, full) {
            if(!data) return "";
            return '<a data-href="/sesameproduct/viewSesameProduct.json?productId='+full.productId+'" href="javascript:;" class="js-project">'+data+'</a>'
        }),
        DTColumnBuilder.newColumn('userName').withTitle('用户姓名').withOption('sWidth', '100px'),
        DTColumnBuilder.newColumn('userPhone').withTitle('用户手机号').withOption('sWidth', '160px'),
        DTColumnBuilder.newColumn('financialUserName').withTitle('理财经理姓名').withOption('sWidth', '100px').renderWith(function(data,type,full){
            if(!data) return "";
            return '<a href="javascript:;" class="financialDetail" key="'+full.financialUserId+'">'+data+'</a>';
        }),
        DTColumnBuilder.newColumn('transAmt').withTitle('到账金额').withOption('sWidth', '160px').renderWith(function(data,type,full){
            if(data==null) return "";
            return tools.formatNumber(data);
        }),
        DTColumnBuilder.newColumn('refundAmt').withTitle('退款金额').withOption('sWidth', '160px').renderWith(function(data,type,full){
            if(!data) return "";
            return tools.formatNumber(data);
        }),
        DTColumnBuilder.newColumn('currency').withTitle('币种').withOption('sWidth', '160px').renderWith(function(data,type,full){
            if(data ==null) return "";
            return parseInt(data) == 0 ? "人民币":"美元";
        }),
        DTColumnBuilder.newColumn('refundType').withTitle('退款类型').withOption('sWidth', '160px').renderWith(function(data,type,full){
            var str="";
            switch (parseInt(data)){
                case 1:
                    str="认购费";
                    break;
                case 2:
                    str="合同退款";
                    break;
                case 3:
                    str="超额退款";
                    break;
                default :
                    str="";
                    break;
            }
            return str;
        }),

        DTColumnBuilder.newColumn('applyTime').withTitle('退款申请日期').withOption('sWidth', '160px').renderWith(function(data,type,full){
            if(!data) return "";
            //return data.substr(0,4)+"-"+data.substr(4,2)+"-"+data.substr(6,2)+" "+data.substr(8,2)+":"+data.substr(10,2)+":"+data.substr(12,2);
            return data.substr(0,4)+"-"+data.substr(4,2)+"-"+data.substr(6,2);
        }),
        DTColumnBuilder.newColumn('completeTime').withTitle('退款完成时间').withOption('sWidth', '160px').renderWith(function(data,type,full){
            if(!data) return "";
            return data.substr(0,4)+"-"+data.substr(4,2)+"-"+data.substr(6,2)+" "+data.substr(8,2)+":"+data.substr(10,2)+":"+data.substr(12,2);
        }),
        DTColumnBuilder.newColumn('refundStatus').withTitle('退款状态').withOption('sWidth', '160px').renderWith(function(data,type,full){
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
        var url="/sesamerefund/exportSesameRefundPage.json";

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
    /*交易单号详情*/
    var infoDetailModalCtrl=function($scope, tools, info,$modalInstance){
        $scope.action={};
        $scope.info = info;
        $scope.info.contractAmt =info.contractAmt==null?"": tools.formatNumber(info.contractAmt);
        $scope.info.payAmt = info.payAmt==null?"":tools.formatNumber(info.payAmt);
        $scope.info.buyAmt = info.buyAmt==null?"": tools.formatNumber(info.buyAmt);
        $scope.info.netAmt = info.netAmt==null?"":tools.formatNumber(info.netAmt);
        $scope.info.transAmt = info.transAmt==null ? "" : tools.formatNumber(info.transAmt);
        $scope.info.confirmAmount = info.confirmAmount==null ? "" : tools.formatNumber(info.confirmAmount);
        $scope.info.redeemAmount = info.redeemAmount==null ? "" : tools.formatNumber(info.redeemAmount);
        $scope.info.cmpletedEarnings = info.cmpletedEarnings==null?"":tools.formatNumber(info.cmpletedEarnings);
        $scope.info.netValue = info.netValue==null?"":tools.formatNumber(info.netValue);
        $scope.info.subscribeSuccessDate = !info.subscribeSuccessDate?"":info.subscribeSuccessDate.substr(0,4)+"-"+info.subscribeSuccessDate.substr(4,2)+"-"+info.subscribeSuccessDate.substr(6,2)+" "+info.subscribeSuccessDate.substr(8,2)+":"+info.subscribeSuccessDate.substr(10,2)+":"+info.subscribeSuccessDate.substr(12,2);
        $scope.info.valueDate = !info.valueDate?"":info.valueDate.substr(0,4)+"-"+info.valueDate.substr(4,2)+"-"+info.valueDate.substr(6,2)+" "+info.valueDate.substr(8,2)+":"+info.valueDate.substr(10,2)+":"+info.valueDate.substr(12,2);
        $scope.info.contractSignDate =info.contractSignDate==null?"": info.contractSignDate.substr(0,4)+"-"+info.contractSignDate.substr(4,2)+"-"+info.contractSignDate.substr(6,2)+" "+info.contractSignDate.substr(8,2)+":"+info.contractSignDate.substr(10,2)+":"+info.contractSignDate.substr(12,2);
        //银行卡
        var h=info.bankCardno==null?"":$scope.info.bankCardno.length,str='';
        for(var i=0; i<h-8; i++){
            str+='*'
        }
        $scope.info.bankCardno = info.bankCardno==null?"":$scope.info.bankCardno.substr(0,4)+str+$scope.info.bankCardno.substr(h-4,4);
        //手机号
        var phoneH =info.userPhone==null?0: $scope.info.userPhone.length, phoneStr='';
        for(var j=0; j<phoneH-7; j++){
            phoneStr +='*';
        }
        $scope.info.userPhone = info.userPhone==null?"": $scope.info.userPhone.substr(0,3) + phoneStr + $scope.info.userPhone.substr(7);
        $scope.info.financialUserPhone = info.financialUserPhone==null?"":$scope.info.financialUserPhone.substr(0,3)+phoneStr+$scope.info.financialUserPhone.substr(7);
        //取消
        $scope.close = function() {
            $modalInstance.close();
        };
        //查看协议
        $scope.action.dealFile = function(event){
            var self=event.currentTarget;
            $.when($.ajax({url:siteVar.serverUrl +"/sesametrade/lookSignedPDFPage.json"})).then(function(data){
                if(data.success){
                    if( !tools.ajaxLocked(self) ) return;
                    $.ajax({
                        type: "post",
                        url:siteVar.serverUrl + '/sesametrade/lookSignedPDF.json',
                        data: {appreqid:info.appreqid},
                        success: function(data){
                            tools.ajaxOpened(self);
                            if(!tools.interceptor(data)) return;
                            if(data.success){
                                var openWin = window.open('about:blank');
                                openWin.location.href = data.data;
                            }
                        },
                        error: function(err){
                            tools.ajaxOpened(self);
                            tools.ajaxError(err);
                            return false;
                        }
                    })
                }

            }).fail(function(err){
                tools.ajaxOpened(self);
                tools.ajaxError(err);
                return false;
            });

        }
    };
    //项目详情
    function projectDetailModal($scope, info, $modalInstance){
        $scope.info = info;
        info.minSubscribeAmt = tools.formatNumber(info.minSubscribeAmt);
        info.incSubscribeAmt = tools.formatNumber(info.incSubscribeAmt);
        info.planRaiseAmt = tools.formatNumber(info.planRaiseAmt);
        //info.adviserRate = (new Number(info.adviserRate)).mul(100)
        $scope.close = function() {
            $modalInstance.close();
        };

    };
    /*退款申请单号  详情*/
    var refundDetailModal = function($scope, info,$modalInstance,$q){
        $scope.info = info;
        $scope.info.transtime = !info?"":tools.toJSDate(info.transtime);
        $scope.info.transAmt = info.transAmt==null?"":tools.formatNumber(info.transAmt.toFixed(2));
        $scope.info.refundAmt = info.refundAmt==null?"":tools.formatNumber(info.refundAmt.toFixed(2));

        $scope.info.subfeeDisamt = info.subfeeDisamt==null?"":tools.formatNumber(info.subfeeDisamt.toFixed(2));
        $scope.info.subfee = info.subfee==null?"":tools.formatNumber(info.subfee.toFixed(2));
        $scope.info.buyAmt = info.buyAmt==null?"":tools.formatNumber(info.buyAmt.toFixed(2));
        $scope.info.netAmt = info.netAmt==null?"":tools.formatNumber(info.netAmt.toFixed(2));
        $scope.info.contractAmt = info.contractAmt==null?"":tools.formatNumber(info.contractAmt.toFixed(2));
        $scope.info.payAmt = info.payAmt==null?"":tools.formatNumber(info.payAmt.toFixed(2));
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
        /*交易订单号 详情*/
        table.on("click",".js-order",function(){
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
                    if( data.success){
                        $modal.open({
                            backdrop: true,
                            backdropClick: true,
                            dialogFade: false,
                            keyboard: true,
                            templateUrl : 'infoDetailModal.html',
                            controller : infoDetailModalCtrl,
                            //windowClass:'modal-640',
                            resolve:{
                                "info" : function(){
                                    return data.data;
                                }
                            }
                        });
                    }

                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            })

        });
        //项目编号---查看详情
        table.on("click",".js-project",function(){
            var self = $(this), href = self.attr("data-href"), data, url;
            data = tools.queryUrl(href);
            url = href.split('?')[0];

            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + url,
                data: data,
                dataType: "json",
                success: function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    if(data.success){
                        var info = $.extend({}, data.data.dbDto, data.data.httpDto);
                        //console.log( data.dbDto)
                        $modal.open({
                            backdrop: true,
                            backdropClick: true,
                            dialogFade: false,
                            keyboard: true,
                            templateUrl : 'projectDetailModal.html',
                            controller : projectDetailModal,
                            resolve:{
                                "info" : function(){
                                    return info;
                                }
                            }
                        });
                    }else{
                        alert(data.msg);
                    }

                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError403(err);
                }
            })
        });

        /**
         * [查看理财经理信息]
         * @param  {object}   [description]
         * @return {[type]}   [description]
         */
        tools.resetWidth();
        tools.createModal();
        tools.createModalProgress();
        table.on("click", ".financialDetail", function(){
            var data = {
                "id": $(this).attr("key"),
                "userType": "director",
                "bizSysRoute": $("#biz_sys_route").val()
            };
            //console.log($(this));
            //console.log($(this).attr("data-key"));
            //console.log(this.attr("data-key"));
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
    }
}
