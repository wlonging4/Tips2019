'use strict';
function sanbiaoRedeemController($scope,getSelectListFactory,$timeout, $modal, tools,DTOptionsBuilder, DTColumnBuilder,$q){
    $scope.form = {
        isShow: ($("#js_form").find(".form-group").length>6) ? true : false
    };
    $scope.select = {};
    $scope.action = {};
    $scope.form.createTimeEnd=tools.toJSDate(Date.parse(new Date())).slice(0,10);
    $scope.form.createTimeStart=tools.toJSDate(Date.parse(new Date())-30*3600*24*1000).slice(0,10);

    /*
    * 获取枚举类型2
    * */
    var defer = $q.defer();
    $.ajax({
        url: siteVar.serverUrl+'/xinghuopageapi/getEnumValues.json',
        method: 'POST',
        data: {
            keyNames:"ScatteredLoanRedeemType,ScatteredLoanRedeemStatus",
            packageName:"com.creditease.xinghuo.service.redeem.api.enums"
        }
    }).then(function(data){
        defer.resolve(data);
        $scope.select.ScatteredLoanRedeemType = data.data.ScatteredLoanRedeemType;
        $scope.select.ScatteredLoanRedeemStatus = data.data.ScatteredLoanRedeemStatus;
        $scope.select.AccountPaytype = data.data.AccountPaytype;
    },function(error){
        defer.reject(error);
    });

    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder
        .newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/scatteredLoanRedeem/scatteredLoanList.shtml',
            type: 'POST',
            data: $scope.form
        })
        .withDataProp('data')
        .withOption('searching',false)
        //设置是否排序
        .withOption('ordering',false)
        .withOption('serverSide',true)
        .withOption('processing',false)
        .withOption('scrollX',true)
        .withLanguage(tools.dataTablesLanguage)
        .withOption('createdRow', function(row, data, dataIndex) {
            angular.element(row).addClass("test"+data.id)
        })
        .withOption('fnDrawCallback',fnDrawCallback)
        .withPaginationType('full_numbers');
    //.withOption('order', [2, 'desc']);
    vm.dtColumns = [
        DTColumnBuilder.newColumn('redeemCode').withTitle('赎回单ID').withOption('sWidth','260px').notSortable().renderWith(function (data,type,full) {
            //return '<a href="javascript:;" class="bizNoPop"  keyId="'+data+'">'+data+'</a>';
            return data;
        }),
        DTColumnBuilder.newColumn('dealId').withTitle('交易单号').withOption('sWidth','260px').notSortable().renderWith(function (data,type,full) {
            return data?'<a href="javascript:;" class="tradeInfo"  data-dealId="'+data+'">'+data+'</a>':'';
        }),
        DTColumnBuilder.newColumn('userName').withTitle('出借人姓名').withOption('sWidth','70px').notSortable().renderWith(function (data,type,full) {
            return data?'<a href="javascript:;" class="lenderInfo"  key_sys="'+full.bizSysRoute+'" keyId="'+full.userId+'">'+data+'</a>':'';
        }),
        DTColumnBuilder.newColumn('redeemAmount').withTitle('赎回金额').withOption('sWidth','90px').notSortable().renderWith(function(data,type,full){
            return tools.formatNumber(data);
        }),
        DTColumnBuilder.newColumn('createTime').withTitle('赎回单创建时间').withOption('sWidth','130px').notSortable().renderWith(function(data,type,full){
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('returnPrincipal').withTitle('回款本金').withOption('sWidth','90px').notSortable().renderWith(function(data,type,full){
            return tools.formatNumber(data);
        }),
        DTColumnBuilder.newColumn('returnInterest').withTitle('回款利息').withOption('sWidth','90px').notSortable().renderWith(function(data,type,full){
            return tools.formatNumber(data);
        }),
        DTColumnBuilder.newColumn('returnFee').withTitle('回款收费金额').withOption('sWidth','90px').notSortable().renderWith(function(data,type,full){
            return tools.formatNumber(data);
        }),
        DTColumnBuilder.newColumn('redeemTypeDesc').withTitle('回款类型').withOption('sWidth','120px').notSortable(),
        DTColumnBuilder.newColumn('redeemSuccessTime').withTitle('实际回款日').withOption('sWidth','70px').notSortable().renderWith(function(data,type,full){
            return tools.toJSYMD(data);
        }),
        DTColumnBuilder.newColumn('redeemStatusDesc').withTitle('赎回状态').withOption('sWidth','100px').notSortable()
    ];


    $scope.action = {
        reset: function(){
            for(var prop in $scope.form){
                if(prop !== 'isShow') delete $scope.form[prop];
            }
            vm.dtInstance.rerender();
        },
        search: function(){
            if(Number($scope.form.redeemAmountMin) > Number($scope.form.redeemAmountMax)){tools.interalert('赎回金额查询范围有误');return;}
            if(Date.parse($scope.form.planReturnDateEnd) < Date.parse($scope.form.planReturnDateStart)){tools.interalert('实际回款日查询范围有误');return;}
            if(Date.parse($scope.form.createTimeEnd) < Date.parse($scope.form.createTimeStart)){tools.interalert('赎回单创建时间查询范围有误');return;}
            vm.dtInstance.rerender();
        },
        export:function () {
            $modal.open({
                backdrop: true,
                backdropClick: true,
                dialogFade: false,
                keyboard: true,
                templateUrl : 'exportModal.html',
                controller : exportCtrl,
                windowClass:'modal-640'
            });
        }
    };


    function fnDrawCallback(){
        tools.createModal();
        tools.createModalProgress();
        if(!tools.interceptor(window.ajaxDataInfo)) return;
        //获取表头数据
        $scope.$apply(function(){
            $scope.tableinfo = window.ajaxDataInfo.info;
            console.log(window.ajaxDataInfo.info);
            if(window.ajaxDataInfo.info){
                $scope.info=tools.formatNumber(window.ajaxDataInfo.info||0);
            }else{
                $scope.info='--';
            }
        });

        //查看交易单详情
        $('.tradeInfo').on('click',function () {
            var data = {
                "id": $(this).attr("data-id"),
                "no": $(this).attr("data-dealId"),
                "category":$(this).attr("data-category")
            };
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + '/xinghuodeal/tradeinfo.shtml',
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

        //查看出借人详情
        $('.lenderInfo').on('click',function () {
            var data = {
                "id": $(this).attr("keyId"),
                "userType": "consumer",
                //"bizSysRoute": attr("key_sys")
            };
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + '/xinghuouser/userinfo.shtml',
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

        /**
         * [导出数据]
         * @param  {[type]}     [description]
         * @return {[type]}     [description]
         */
        $("#js_export").on("click", function(){
            //$scope.$apply();
            tools.export(this);
        });
    }
}