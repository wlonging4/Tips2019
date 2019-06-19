'use strict';
function caiyiTradeControllerr($scope,getSelectListFactory,getProListFactory,tools,$location,DTOptionsBuilder, DTColumnBuilder) {
    $scope.form = {
        isShow: ($("#js_form").find(".form-group").length>6) ? true : false,
        bizSysRoute: 1
    };
    var urlStr = $location.url().split("?")[1];
    if(urlStr) {
        $.extend($scope.form,tools.serializeUrl(urlStr));
    }
    $scope.select = {};
    $scope.action = {};
    /*
    获取枚举类型
     */
    var selectList = getSelectListFactory.getSelectList(['paytype','end_status','redeem_status','sale_terminal','product_category']);
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
        $scope.select.proFirstList = data.appResData.retList[4].product_category;
    });
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
            url:  siteVar.serverUrl + '/xinghuodeal/tableTrade.shtml',
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
        .withOption('processing',false)
        .withOption('scrollX',true)
        .withLanguage(tools.dataTablesLanguage)
        .withOption('fnDrawCallback',fnDrawCallback)
        .withPaginationType('simple_numbers');
    vm.dtColumns = [
        DTColumnBuilder.newColumn('no').withTitle('交易单号').withOption('sWidth','130px').renderWith(function(data, type, full) {
            return '<a href="javascript:;" class="js_trade_info" type="tradeinfo" key="'+full.id+'" key2="'+full.no+'" action="/xinghuodeal/tradeinfo.shtml">'+data+'</a>';
        }),
        DTColumnBuilder.newColumn('lendername').withTitle('出借人').withOption('sWidth','60px').renderWith(function(data, type, full) {
            return '<a href="javascript:;" class="js_trade_info" type="userinfo" key="'+full.lenderid+'" action="/xinghuouser/userinfo.shtml" key_sys="'+full.bizSysRoute+'">'+data+'</a>';
        }),
        DTColumnBuilder.newColumn('subproductname').withTitle('产品名称').withOption('sWidth','150px').renderWith(function(data, type, full) {
            return '<a href="javascript:;" class="js_trade_info ui_ellipsis" style="width: 150px;" type="goodsinfo" title="'+data+'" data-category="' + full.category + '" key="'+full.subproductid+'" action="/xinghuoproduct/productinfo.shtml">'+data+'</a>';
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
        DTColumnBuilder.newColumn('saleTerminal').withTitle('认购渠道').withOption('sWidth','80px').renderWith(function(data, type, full) {
            if(data == null) return "";
            var arr = ["PC", "WAP", "iPhone App", "Android App"];
            return arr[data];
        }),
        DTColumnBuilder.newColumn('userid').withTitle('理财经理姓名').withOption('sWidth','90px').renderWith(function(data, type, full) {
            return '<a href="javascript:;" class="js_trade_info" type="directorinfo" key="'+data+'" action="/xinghuouser/userinfo.shtml" key_sys="'+full.bizSysRoute+'">'+full.userName+'</a>';
        }),
        DTColumnBuilder.newColumn('storecode').withTitle('店铺ID').withOption('sWidth','80px').renderWith(function(data, type, full) {
            if(!data) return "";
            if(!full.storeUrl) return '<span>'+data+'</span>';
            return '<a href="'+full.storeUrl+'" target="_blank">'+data+'</a>'
        })
    ];
    $scope.action.reset = function(){
        $('input[name="p_status"]').val("");
        $("#multi_select").find("[readonly]").val("");
        $("#multi_select").find(".multiSel_unit").prop("checked",false);
        $.uniform.update($("#multi_select").find(".multiSel_unit"));
        for(var prop in $scope.form){
            if(prop !== 'isShow' && prop !== 'bizSysRoute' ) delete $scope.form[prop];
        }
        vm.dtInstance.rerender();
    };
    $scope.action.search = function(){
        vm.dtInstance.rerender();
    };
    function fnDrawCallback(){
        if(!tools.interceptor(window.ajaxDataInfo)) return;
        tools.resetWidth();
        /*
        刷新统计数据
         */
        $scope.$apply(function(){
            $scope.tableinfo = window.ajaxDataInfo.info;
        })
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
                    "no": $(this).attr("key2")
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
    }
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
            tools.export(this);
        });
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
