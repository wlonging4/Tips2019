'use strict';
function walletDetail($scope,$modal,$location,tools, DTOptionsBuilder, DTColumnBuilder) {
    var domForm = $("#js_form"), conditionItem = domForm.find(".form-group");
    $scope.form = {
        isShow: (conditionItem.length > 6) ? true : false
    };
    $scope.select = {};
    $scope.action = {};
    var params = $location.$$search;
    $scope.form.userid=params.userid;

    /*
     *表格
     */
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax',{
        url: siteVar.serverUrl + '/xinghuowallet/tableWalletManager.shtml',
        type: 'POST',
        data:function(d) {
            jQuery.extend(d, $scope.form);
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
        .withOption('scrollX',false)
        .withLanguage(tools.dataTablesLanguage)
        .withOption('fnDrawCallback', fnDrawCallback)
        .withPaginationType('simple_numbers');
    vm.dtColumns = [
        DTColumnBuilder.newColumn('no').withTitle('编号').withOption('sWidth', '280px').renderWith(function(data,type,full){
            var str='';
            if(full.optype == 1){
                str='<a href="javascript:void(0);" data-href="/xinghuowallet/walletManagerDetail.shtml?id='+full.id+'&optype='+full.optype+'" class="js-walletDetailInto">'+data+'</a>';
            }else{
                str='<a href="javascript:void(0);" data-href="/xinghuowallet/walletManagerDetail.shtml?id='+full.id+'&optype='+full.optype+'" class="js-walletDetailOut">'+data+'</a>';
            }
            return str;
        }),
        DTColumnBuilder.newColumn('userName').withTitle('用户姓名').withOption('sWidth','100px').renderWith(function(data,type,full){
            if(!data) return "";
            return '<a href="javascript:void(0);" class="infoDetail" data-href="/xinghuouser/userinfo.shtml?userType=director&id=' + full.userid + '">' + data + '</a>';
        }),
        DTColumnBuilder.newColumn('amount').withTitle('转入/转出金额(元)').withOption('sWidth','150px').renderWith(function(data, type, full) {
            if(!data) return "";
            return tools.formatNumber(data);
        }),
        DTColumnBuilder.newColumn('optypeString').withTitle('明细类型').withOption('sWidth','100px'),
        DTColumnBuilder.newColumn('subtypeString').withTitle('转入/转出类型').withOption('sWidth', '150px').renderWith(function(data, type, full) {
            return full.no.indexOf("XHFX") > -1 ? "私募返现" : data;
        }),
        DTColumnBuilder.newColumn('submitTime').withTitle('转入/转出时间').withOption('sWidth', '150px').renderWith(function(data, type, full) {
            if(!data) return "";
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('terminal').withTitle('渠道').withOption('sWidth','60px').renderWith(function(data,type,full){
            var str='';
            var data1 = parseInt(data);
            switch (data1){
                case 0:
                    str='pc';
                    break;
                case 1:
                    str='wap';
                    break;
                case 2:
                    str='app';
                    break;
                default :
                    str='';
                    break;

            }
            return str;
        }),
        DTColumnBuilder.newColumn('opstatus').withTitle('状态').withOption('sWidth','60px').renderWith(function(data,type,full){
            var str='';
            var data1 = parseInt(data);
            switch (data1){
                case 1:
                    str='失败';
                    break;
                case 2:
                    str='处理中';
                    break;
                case 3:
                    str='转入成功';
                    break;
                case 4:
                    str='转出成功';
                    break;
                case 5:
                    str='出借成功';
                    break;
                case 6:
                    str='赎回成功';
                    break;
                case 7:
                    str='退款成功';
                    break;
                default :
                    str='';
                    break;

            }
            return str;
        }),
        DTColumnBuilder.newColumn('optime').withTitle('完成时间').withOption('sWidth', '150px').renderWith(function(data, type, full) {
            if(!data) return "";
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('opstatus').withTitle('备注').withOption('sWidth','100px').renderWith(function(data,type,full){
            var str='';
            var data1 = parseInt(data);
            switch (data1){
                case 1:
                    str = full.respDescription;
                    break;
                default :
                    str = '';
                    break;

            }
            return str;
        })
    ];
    //重置
    $scope.action.reset = function(){
        for(var prop in $scope.form){
            if(prop !== 'isShow') delete $scope.form[prop];
        }
        vm.dtInstance.rerender();
    };
    //查询
    $scope.action.search = function(){
        vm.dtInstance.rerender();
    };
    //转入详情
    function walletIntoCtrl($scope, info,$modalInstance){
        $scope.info = info;
        $scope.info.optime=tools.toJSDate(info.optime);
        $scope.info.amount=tools.formatNumber(info.amount);
        $scope.info.mobilenum =info.mobilenum ? info.mobilenum.substr(0,3)+"****"+info.mobilenum.substr(7,4):'';
        var len=info.cardno?info.cardno.length:0;
        var xing='';
        for(var i= 0;i<len-8;i++){
            xing=xing+'*'
        }
        $scope.info.cardno = info.cardno?info.cardno.substr(0,4)+xing+info.cardno.substr(len-4):"";
        var terminal=parseInt(info.terminal);
        switch (terminal){
            case 0:
                $scope.info.terminal='pc';
                break;
            case 1:
                $scope.info.terminal='wap';
                break;
            case 2:
                $scope.info.terminal='app';
                break;
            default :
                $scope.info.terminal='';
                break;
        }
        var opstatus = parseInt(info.opstatus);
        switch (opstatus){
            case 1:
                $scope.info.opstatus='失败';
                break;
            case 2:
                $scope.info.opstatus='处理中';
                break;
            case 3:
                $scope.info.opstatus='转入成功';
                break;
            case 4:
                $scope.info.opstatus='转出成功';
                break;
            case 5:
                $scope.info.opstatus='出借成功';
                break;
            case 6:
                $scope.info.opstatus='赎回成功';
                break;
            case 7:
                $scope.info.opstatus='退款成功';
                break;
            default :
                $scope.info.opstatus='';
                break;
        }

        //取消
        $scope.close = function() {
            $modalInstance.close();
        };
    }
    //转出详情
    function walletOutCtrl($scope,tools, info,$modalInstance){
        $scope.info = info;
        $scope.info.optime=tools.toJSDate(info.optime);
        $scope.info.amount=tools.formatNumber(info.amount);
        var len=info.cardno?info.cardno.length:0;
        var xing='';
        for(var i= 0;i<len-8;i++){
            xing=xing+'*'
        }
        $scope.info.cardno = info.cardno?info.cardno.substr(0,4)+xing+info.cardno.substr(len-4):"";
        var terminal=parseInt(info.terminal);
        switch (terminal){
            case 0:
                $scope.info.terminal='pc';
                break;
            case 1:
                $scope.info.terminal='wap';
                break;
            case 2:
                $scope.info.terminal='app';
                break;
            default :
                $scope.info.terminal='';
                break;
        }
        var opstatus = parseInt(info.opstatus);
        switch (opstatus){
            case 1:
                $scope.info.opstatus='失败';
                break;
            case 2:
                $scope.info.opstatus='处理中';
                break;
            case 3:
                $scope.info.opstatus='转入成功';
                break;
            case 4:
                $scope.info.opstatus='转出成功';
                break;
            case 5:
                $scope.info.opstatus='出借成功';
                break;
            case 6:
                $scope.info.opstatus='赎回成功';
                break;
            case 7:
                $scope.info.opstatus='退款成功';
                break;
            default :
                $scope.info.opstatus='';
                break;
        }
        //取消
        $scope.close = function() {
            $modalInstance.close();
        };
    }
    function fnDrawCallback(data){
        tools.createModal();
        if(!tools.interceptor(window.ajaxDataInfo)) return;
        //导出
        $(".js_export").on("click", function(){
            tools.export(this);
        });
        //钱包持有份额
        $scope.$apply(function(){
            $scope.firstSumTotal = tools.formatNumber((data.json.info && data.json.info.firstSumTotal) || 0);
            $scope.secondSumTotal = tools.formatNumber((data.json.info && data.json.info.secondSumTotal) || 0)
        });
        var popUpLayer = $("#js_dialog"), popUpLayerContent = popUpLayer.find(".js_content");
        var table = $("#dataTables"), tbody = table.find("tbody");
        /*转入详情*/
        $('.js-walletDetailInto',tbody).off('click').on('click',function(){
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
                        $modal.open({
                            backdrop: true,
                            backdropClick: true,
                            dialogFade: false,
                            keyboard: true,
                            templateUrl : 'walletDetailInto.html',
                            controller : walletIntoCtrl,
                            resolve:{
                                "info" : function(){
                                    return data.data;
                                }
                            }
                        });
                    }else{
                        alert(data.msg);
                    }

                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            })
        });
        /*转出详情*/
        $('.js-walletDetailOut',tbody).off('click').on('click',function(){
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
                        $modal.open({
                            backdrop: true,
                            backdropClick: true,
                            dialogFade: false,
                            keyboard: true,
                            templateUrl : 'walletDetailOut.html',
                            controller : walletOutCtrl,
                            resolve:{
                                "info" : function(){
                                    return data.data;
                                }
                            }
                        });
                    }else{
                        alert(data.msg);
                    }

                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            })
        });
        //用户详情
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

    }
    $(function(){
        //联动
        $(".js-optype").change(function(){
            var val=$(this).val();
            var intoStr='<option value="">请选择</option><option value="5">银行卡转入</option><option value="1">产品赎回</option><option value="6">产品退款</option><option value="3">钱包收益</option>'
            var outStr='<option value="">请选择</option><option value="4">转出到银行卡</option><option value="2">产品出借</option>';

            if(val ==1){
                $(".js-subtypeTitle").html("转入类型");
                $(".js-subtype").html(intoStr)
                $('#js-view').show();
                delete $scope.form.subtype

            }else if(val == 2){
                $(".js-subtypeTitle").html("转出类型");
                $(".js-subtype").html(outStr)
                $('#js-view').show();
                delete $scope.form.subtype
            }else if(val == ''){
                $('#js-view').hide();
                $(".js-subtype").html('');
                delete $scope.form.subtype
            }
        })
    })
}
