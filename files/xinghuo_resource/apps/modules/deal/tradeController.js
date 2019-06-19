'use strict';
function tradeController($scope,getSelectListFactory, $timeout,getProListFactory,tools,$location,DTOptionsBuilder, DTColumnBuilder) {
    $scope.form = {
        isShow: ($("#js_form").find(".form-group").length>6) ? true : false
    };
    var urlStr = $location.url().split("?")[1];
    if(urlStr) {
        $.extend($scope.form,tools.serializeUrl(urlStr));
    };
    var search = $location.$$search;
    $scope.select = {};
    $scope.action = {
        cancelTrade: function () {
            var p_status = $('input[name="p_status"]').val();
            if(p_status !== "0" && p_status !== "9" && p_status !== "0,9"){
               return tools.interalert("请筛选待取消交易单！")
            }else{
                var confirm = window.confirm("确认取消列表“待取消”交易单?");
                if(confirm){
                    var sendData = $.extend({p_status: p_status},$scope.form);
                    $.ajax({
                        url: siteVar.serverUrl + "/xinghuodeal/cancelWaitCancelDeal.shtml",
                        method: "post",
                        data: sendData
                    }).then(function (data) {
                        if(!tools.interceptor(data)) return;
                        tools.interalert(data.msg);
                    })
                }
            }
        }
    };
    var timeStartFlag, timeEndFlag;
    ;(function(){
        var today = new Date();
        $scope.form.p_startcreatetime = tools.toJSYMD(today.getTime() - 3 * 24 * 60 * 60 * 1000);
        $scope.form.p_endcreatetime = tools.toJSYMD(today.getTime());
        timeStartFlag = $scope.form.p_startcreatetime;
        timeEndFlag = $scope.form.p_endcreatetime;
    })();
    /*
    获取枚举类型
     */
    var selectList = getSelectListFactory.getSelectList(['paytype','end_status','redeem_status','sale_terminal','biz_sys_route','product_category','fundtypeenum', 'protocol_status']);
    selectList.then(function(data){
        var arr = [];
        $scope.select.paytype = data.appResData.retList[0].paytype;
        //过滤退出状态
        var end_status = data.appResData.retList[1].end_status;
        for(var i in end_status){
            if(i>0){
                arr.push(end_status[i]);
            }
        }
        $scope.select.end_status = arr;
        arr = [];

        $scope.select.redeem_status = data.appResData.retList[2].redeem_status;
        $scope.select.sale_terminal = data.appResData.retList[3].sale_terminal;
        //过滤业务系统来源
        var biz_sys_route = data.appResData.retList[4].biz_sys_route;
        for(var i in biz_sys_route){
            if(i != 3 && i != 4){
                arr.push(biz_sys_route[i]);
            }
        }
        $scope.select.biz_sys_route = arr;
        arr = [];
        $scope.select.proFirstList = data.appResData.retList[5].product_category;
        $scope.select.fundType = data.appResData.retList[6].fundtypeenum;
        $scope.select.protocolStatus = data.appResData.retList[7].protocol_status;
    });
    //获取产品一级列表
    //var proFirstList = getProListFactory.getProFirstList({});
    //proFirstList.then(function(data){
    //    $scope.select.proFirstList = data.appResData.proList;
    //});

    if(!!search.selectstatus){
        $timeout(function(){
            var len = search.selectstatus.length, checkboxs = $("#js_form").find("[type='checkbox']"), flag = true;
            for(var i = 0; i < len; i++){
                if(search.selectstatus.charAt(i) == 1){
                    checkboxs.eq(i + 1).prop("checked", true).uniform();
                }else{
                    checkboxs.eq(i + 1).prop("checked", false).uniform();
                    flag = false;
                }
            };
            if(flag){
                checkboxs.eq(0).prop("checked", true).uniform();
            };
            checkboxs.eq(1).trigger("change");

        }, 0);
    }
    /*
    产品联动
     */
    $scope.action.chooseThirdPro = function(){
        //获取产品三级列表
        var proList = getProListFactory.getProOtherList({
            category: $scope.form.category,
            series: $scope.form.series
        });
        proList.then(function(data){
            if(!data.success) {
                alert("获取产品列表失败，请与管理员联系。"+data.msg);
                return;
            }
            $scope.select.productNameCode = data.data.nameList;
        });
        delete $scope.form.productNameCode;
    };
    /*
    获取理财经理类别
     */
    var getUserLevel = getProListFactory.getUserLevel();
    getUserLevel.then(function(data){
       $scope.select.managerLevelid = data.appResData.levellist;
    });
    /*
    创建表格选项
     */
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/xinghuodeal/tableTrade.shtml',
            type: 'POST',
            data: function(d){
                jQuery.extend(d,$scope.form);
                if($('input[name="p_status"]').val().length>0){
                    d.p_status = $('input[name="p_status"]').val();
                }
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
    var default_dtColumns = [
        DTColumnBuilder.newColumn('no').withTitle('交易单号').withOption('sWidth','220px').renderWith(function(data, type, full) {
            return '<a href="javascript:;" class="js_trade_info" type="tradeinfo" key="'+full.id+'" key2="'+full.no+'" data-category="' + full.category + '" action="/xinghuodeal/tradeinfo.shtml">'+data+'</a>';
        }),
        DTColumnBuilder.newColumn('lendername').withTitle('出借人').withOption('sWidth','60px').renderWith(function(data, type, full) {
            return '<a href="javascript:;" class="js_trade_info" type="userinfo" key="'+full.lenderid+'" action="/xinghuouser/userinfo.shtml" key_sys="'+full.bizSysRoute+'">'+data+'</a>';
        }),
        DTColumnBuilder.newColumn('subproductname').withTitle('产品名称').withOption('sWidth','150px').renderWith(function(data, type, full) {
            return '<a href="javascript:;" class="js_trade_info ui_ellipsis" style="width: 150px;" type="goodsinfo" data-category="' + full.category + '" title="'+data+'" key="'+full.subproductid+'" action="/xinghuoproduct/productinfo.shtml">'+data+'</a>';
        }),
        DTColumnBuilder.newColumn('amount').withTitle('认购金额(元)').withOption('sWidth','90px'),
        DTColumnBuilder.newColumn('statusstr').withTitle('交易状态').withOption('sWidth','60px'),
        DTColumnBuilder.newColumn('createtime').withTitle('下单时间').withOption('sWidth','140px').renderWith(function(data, type, full) {
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('redPaperAmout').withTitle('红包金额(元)').withOption('sWidth','90px').renderWith(function(data, type, full) {
            if(!full.redPaperAmout) return "0";
            return full.redPaperAmout;
        }),
        DTColumnBuilder.newColumn('saleTerminal').withTitle('认购渠道').withOption('sWidth','90px').renderWith(function(data, type, full) {
            if(data == null) return "";
            var arr = ["PC", "WAP", "iPhone App", "Android App"];
            return arr[data];
        }),
        DTColumnBuilder.newColumn('userid').withTitle('理财经理姓名').withOption('sWidth','90px').renderWith(function(data, type, full) {
            return '<a href="javascript:;" class="js_trade_info" type="directorinfo" key="'+data+'" action="/xinghuouser/userinfo.shtml" key_sys="'+full.bizSysRoute+'">'+full.userName+'</a>';
        }),
        DTColumnBuilder.newColumn('storecode').withTitle('店铺ID').withOption('sWidth','100px').renderWith(function(data, type, full) {
            if(!data) return "";
            if(!full.storeUrl) return '<span>'+data+'</span>';
            return '<a href="'+full.storeUrl+'" target="_blank">'+data+'</a>'
        }),
        DTColumnBuilder.newColumn('protocolStatus').withTitle('操作').withOption('sWidth','100px').renderWith(function(data, type, full) {
            var result = (data == 1 ? '<a href="javascript:void(0);" class="btn btn-danger btn-xs patchProtocol" data-href="/esign/resetProcotolSign.shtml?dealNo=' + full.no + '">补签协议</a>' : '');
            return result;
        })
    ];
    vm.dtColumns = $.extend([],default_dtColumns);
    $scope.action.reset = function(){
        $('input[name="p_status"]').val("");
        $("#multi_select").find("[readonly]").val("");
        $("#multi_select").find(".multiSel_unit").prop("checked",false);
        $.uniform.update($("#multi_select").find(".multiSel_unit"));
        for(var prop in $scope.form){
            if(prop !== 'isShow') delete $scope.form[prop];
        }
        vm.dtColumns = $.extend([],default_dtColumns);
        var len = 0, p_status = $("#js_form").find("input[name='p_status']");
        for(var item in $scope.form){
            var key = $scope.form[item];
            if(item != 'isShow' && key){
                len++;
            };
        };
        if(len > 0 || (p_status.val() && p_status.val().length > 0)){
            vm.dtInstance.rerender();
        }else{
            $scope.form.p_startcreatetime = timeStartFlag;
            $scope.form.p_endcreatetime = timeEndFlag;
            alert("请选择查询条件！");
        };
    };
    $scope.action.search = function(){
        if($scope.form.bizSysRoute == 3){
            vm.dtColumns.splice(
                8,
                1,
                DTColumnBuilder.newColumn('storename').withTitle('店铺名称').withOption('sWidth','170px').renderWith(function(data, type, full) {
                    if(!data) return "";
                    return '<span class="ui_ellipsis" style="width:100px;" title="'+data+'">'+data+'</span>'
                })
            );
        }else if($scope.form.bizSysRoute==4){
            vm.dtColumns = [
                DTColumnBuilder.newColumn('no').withTitle('交易单号').withOption('sWidth','100px').renderWith(function(data, type, full) {
                    return '<a href="javascript:;" class="js_trade_info" type="tradeinfo" data-category="' + full.category + '" key="'+full.id+'" key2="'+full.no+'" action="/xinghuodeal/tradeinfo.shtml">'+data+'</a>';
                }),
                DTColumnBuilder.newColumn('lendername').withTitle('出借人').withOption('sWidth','100px').renderWith(function(data, type, full) {
                    return '<a href="javascript:;" class="js_trade_info" type="userinfo" key="'+full.lenderid+'" action="/xinghuouser/userinfo.shtml" key_sys="'+full.bizSysRoute+'">'+data+'</a>';
                }),
                DTColumnBuilder.newColumn('lenderid').withTitle('出借人ID').withOption('sWidth','100px'),
                DTColumnBuilder.newColumn('subproductname').withTitle('产品名称').withOption('sWidth','170px').renderWith(function(data, type, full) {
                    return '<a href="javascript:;" class="js_trade_info ui_ellipsis" style="width: 170px;" type="goodsinfo" data-category="' + full.category + '" title="'+data+'" key="'+full.subproductid+'" action="/xinghuoproduct/productinfo.shtml">'+data+'</a>';
                }),
                DTColumnBuilder.newColumn('amount').withTitle('交易金额（元）').withOption('sWidth','100px'),
                DTColumnBuilder.newColumn('fmrevenue').withTitle('收益金额（元）').withOption('sWidth','100px'),
                DTColumnBuilder.newColumn('days').withTitle('投资天数').withOption('sWidth','100px'),
                DTColumnBuilder.newColumn('enddate').withTitle('产品到期日').withOption('sWidth','150px').renderWith(function(data, type, full) {
                    return tools.toJSDate(data);
                }),
                DTColumnBuilder.newColumn('createtime').withTitle('下单时间').withOption('sWidth','150px').renderWith(function(data, type, full) {
                    return tools.toJSDate(data);
                }),
                DTColumnBuilder.newColumn('paytime').withTitle('付款时间').withOption('sWidth','150px').renderWith(function(data, type, full) {
                    return tools.toJSDate(data);
                }),
                DTColumnBuilder.newColumn('confirmedtime').withTitle('认购时间').withOption('sWidth','150px').renderWith(function(data, type, full) {
                    return tools.toJSDate(data);
                }),
                DTColumnBuilder.newColumn('userName').withTitle('理财经理姓名').withOption('sWidth','100px').renderWith(function(data, type, full) {
                    return '<a href="javascript:;" class="js_trade_info" type="directorinfo" key="'+full.userid+'" action="/xinghuouser/userinfo.shtml" key_sys="'+full.bizSysRoute+'">'+full.userName+'</a>';
                }),
                DTColumnBuilder.newColumn('userid').withTitle('理财经理ID').withOption('sWidth','100px'),
                DTColumnBuilder.newColumn('storecode').withTitle('店铺ID').withOption('sWidth','100px').renderWith(function(data, type, full) {
                    if(!data) return "";
                    if(!full.storeUrl) return '<span>'+data+'</span>';
                    return '<a href="'+full.storeUrl+'" target="_blank">'+data+'</a>'
                }),
                DTColumnBuilder.newColumn('statusstr').withTitle('交易状态').withOption('sWidth','100px'),
                DTColumnBuilder.newColumn('endstatusstr').withTitle('退出状态').withOption('sWidth','100px'),
                DTColumnBuilder.newColumn('enpNo').withTitle('理财经理员工号').withOption('sWidth','100px'),
                DTColumnBuilder.newColumn('departmentName').withTitle('所属营业部（简称）').withOption('sWidth','150px'),
                DTColumnBuilder.newColumn('protocolStatus').withTitle('操作').withOption('sWidth','100px').renderWith(function(data, type, full) {
                    var result = (data == 1 ? '<a href="javascript:void(0);" class="btn btn-danger btn-xs patchProtocol" data-href="/esign/resetProcotolSign.shtml?dealNo=' + full.no + '">补签协议</a>' : '');
                    return result;
                })
            ]
        }else{
            vm.dtColumns = $.extend([],default_dtColumns);
        };
        var len = 0, p_status = $("#js_form").find("input[name='p_status']");
        for(var item in $scope.form){
            var key = $scope.form[item];
            if(item != 'isShow' && key){
                len++;
            };
        };
        if(len > 0 || (p_status.val() && p_status.val().length > 0)){
            vm.dtInstance.rerender();
        }else{
            alert("请选择查询条件！");
        };
    };

    $scope.$watch("form.source", function(newValue, oldValue){
        var sourceInput = $("#js_form").find('input[name="source"]');
        sourceInput.val(newValue);
    });

    function fnDrawCallback(){
        if(!tools.interceptor(window.ajaxDataInfo)) return;
        //tools.resetWidth();
        /*
        刷新统计数据
         */
        $scope.$apply(function(){
            $scope.tableinfo = window.ajaxDataInfo.info || {totalTradeAmount:0, totalFeeAmount:0};
        });

        /*
        绑定事件
         */
        $("#dataTables tbody").off("click");
        tools.createModal();
        tools.createModalProgress();
        $("#dataTables tbody").on("click", ".js_trade_info", function(){
            var bizSysRoute = $(this).attr("key_sys") == "null" ? 0 : $(this).attr("key_sys"), data;
            if( $(this).attr("type") == "tradeinfo" ){
                // 交易详情
                data = {
                    "id": $(this).attr("key"),
                    "no": $(this).attr("key2"),
                    "category":$(this).attr("data-category")
                }
            }else if( $(this).attr("type") == "userinfo" ){
                // 用户详情
                data = {
                    "id": $(this).attr("key"),
                    "userType": "consumer",
                    "bizSysRoute": bizSysRoute
                }
            }else if( $(this).attr("type") == "goodsinfo" ){
                // 产品详情
                data = {
                    "productid": $(this).attr("key"),
                    "category": $(this).attr("data-category")
                }
            }else if( $(this).attr("type") == "directorinfo" ){
                // 理财经理详情
                data = {
                    "id": $(this).attr("key"),
                    "userType": "director",
                    "bizSysRoute": bizSysRoute
                }
            }
            var self = this;
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + $(this).attr("action"),
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

        var table = $("#dataTables"), tbody = table.find("tbody");
        table.on("click", ".patchProtocol", function(){
            var self = $(this), href = self.attr("data-href"), data, url;
            data = tools.queryUrl(href);
            url = href.split('?')[0];
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url:siteVar.serverUrl + url,
                data: data,
                success: function(data){
                    tools.ajaxOpened(self);
                    // if(!tools.interceptor(data)) return;
                    if(data.success){
                        alert("提交补签成功！");
                        // vm.dtInstance.rerender();
                    }else{
                        alert(data.msg)
                    }
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            })
        });
    };

    (function(){
        /*
        * 产品联动
        * */
        $(document).on('change',"#js_category",function(){
            var source = ($(this).find ("option:selected").attr("source"));
            $scope.form.source = source;
            //获取产品二级列表
            var proList = getProListFactory.getProOtherList({
                category: $scope.form.category,
                source: source
            });
            proList.then(function(data){
                if(!data.success) {
                    alert("获取产品列表失败，请与管理员联系。"+data.msg);
                    return;
                }
                $scope.select.series = data.data.seriesList;
            });
            delete $scope.form.series;
            delete $scope.form.productNameCode;
            delete $scope.select.productNameCode;
        });
        /**
         * [交易单导出]
         * @param  {[type]}   [description]
         * @return {[type]}   [description]
         */
        $(document).off("click","#js_trade_export");
        $(document).on("click","#js_trade_export", function(){
            var len = 0, p_status = $("#js_form").find("input[name='p_status']");
            var url = $(this).attr("action"), self = this;
            for(var item in $scope.form){
                var key = $scope.form[item];
                if(item != 'isShow' && key){
                    len++;
                };
            };
            if(len > 0 || (p_status.val() && p_status.val().length > 0)){
                var data = tools.getFormele({}, $("#js_form"));
                $.ajax({
                    type:"post",
                    url:siteVar.serverUrl + url,
                    data:data,
                    success:function (data) {
                        if(data.success){
                            var blob = base64toBlob(data.data, 'application/csv;'), downloadUrl = URL.createObjectURL(blob), a = document.createElement("a"), now = new Date();
                            a.href = downloadUrl;
                            a.download = "交易单" + now.getFullYear() + formateNum(now.getMonth() + 1) + formateNum(now.getDate()) + formateNum(now.getHours()) + formateNum(now.getMinutes()) + formateNum(now.getSeconds()) + ".csv";
                            document.body.appendChild(a);
                            a.click();
                            a.remove();
                        }else{
                            return alert("交易单笔数超过10万条，请重新筛选导出条件或联系技术处理！");
                        }
                    }
                })
            }else{
                alert("请选择查询条件！");
            };

        });
        function formateNum(num) {
            return num < 10 ? "0" + num : num + "";
        }
        function base64toBlob(base64Data, contentType) {
            contentType = contentType || '';
            var sliceSize = 1024;
            var byteCharacters = atob(base64Data);
            var bytesLength = byteCharacters.length;
            var slicesCount = Math.ceil(bytesLength / sliceSize);
            var byteArrays = new Array(slicesCount);

            for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
                var begin = sliceIndex * sliceSize;
                var end = Math.min(begin + sliceSize, bytesLength);

                var bytes = new Array(end - begin);
                for (var offset = begin, i = 0 ; offset < end; ++i, ++offset) {
                    bytes[i] = byteCharacters[offset].charCodeAt(0);
                }
                byteArrays[sliceIndex] = new Uint8Array(bytes);
            }
            return new Blob(byteArrays, { type: contentType });
        }

        $(document).off("click","#js_trade_syn_status");
        $(document).on("click","#js_trade_syn_status", function(){
            var dealno = $("#js_form [name='no']").val();
            var p_startcreatetime = $("#js_form [name='p_startcreatetime']").val();
            var p_endcreatetime = $("#js_form [name='p_endcreatetime']").val();
            if(!dealno){
                if(!p_startcreatetime || !p_endcreatetime){
                    return alert("开始下单时间和结束下单时间不能为空！");
                }
            }
            if(p_startcreatetime && p_endcreatetime){
                if(p_startcreatetime > p_endcreatetime){
                    return alert("查询条件中开始下单时间必须小于结束下单时间！");
                }
            }
            if(!confirm("确实要同步订单状态吗，这可能花费的时间较长!")) return false;
            var data = tools.getFormele({}, $("#js_form"));
            $("#js_dialog_progress").modal({backdrop: 'static', keyboard: false});
            var self = this;
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + $(this).attr("action"),
                data: data,
                dataType: "json",
                success: function(data){
                    tools.ajaxOpened(self);
                    $("#js_dialog_progress").modal("hide");
                    if(!tools.interceptor(data)) return;
                    if(data.success){
                        alert(data.msg);
                        vm.dtInstance.rerender();
                    }
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    $("#js_dialog_progress").modal("hide");
                    tools.ajaxError(err);
                }
            });

        });
    })();
}
