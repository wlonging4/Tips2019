'use strict';
function sanbiaoManageController($scope,getSelectListFactory,$timeout, $modal, tools,DTOptionsBuilder, DTColumnBuilder,$q){
    $scope.form = {
        isShow: ($("#js_form").find(".form-group").length>6) ? true : false
    };
    $scope.select = {};
    $scope.action = {};
    $scope.form.updateTimeEnd=tools.toJSDate(Date.parse(new Date()));
    $scope.form.updateTimeStart=tools.toJSDate(Date.parse(new Date())-3*3600*24*1000);

    /*
    * 获取枚举类型2
    * */

    $.ajax({
        url: siteVar.serverUrl+'/xinghuopageapi/getEnumValues.json',
        method: 'POST',
        data: {
            keyNames:"ScatteredLoanStatus",
            packageName:"com.creditease.xinghuo.service.product.api.enums"
        }
    }).then(function(data){
        if(data.success){
            $scope.$apply(function () {
                $scope.select.ScatteredLoanStatus = data.data.ScatteredLoanStatus;
            })
        }
    },function(error){

    });

    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder
        .newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/scatteredLoan/scatteredLoanList.shtml',
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
        DTColumnBuilder.newColumn('loanCode').withTitle('借款合同编号').withOption('sWidth','160px').notSortable().renderWith(function (data,type,full) {
            //return '<a href="javascript:;" class="bizNoPop"  keyId="'+data+'">'+data+'</a>';
            return data;
        }),
        DTColumnBuilder.newColumn('borrowerName').withTitle('借款人姓名').withOption('sWidth','70px').notSortable().renderWith(function (data,type,full) {
            return data;
        }),
        DTColumnBuilder.newColumn('loanExpire').withTitle('借款期限').withOption('sWidth','90px').notSortable().renderWith(function (data,type,full) {
            return data+'期';
        }),
        DTColumnBuilder.newColumn('loanRatio').withTitle('借款利率').withOption('sWidth','90px').notSortable().renderWith(function (data,type,full) {
            return data+'%';
        }),
        DTColumnBuilder.newColumn('loanAmount').withTitle('借款金额').withOption('sWidth','90px').notSortable().renderWith(function (data,type,full) {
            return tools.formatNumber(data);
        }),
        DTColumnBuilder.newColumn('purchasedAmount').withTitle('已认购金额').withOption('sWidth','90px').notSortable().renderWith(function (data,type,full) {
            return tools.formatNumber(data);
        }),
        DTColumnBuilder.newColumn('id').withTitle('剩余可认购金额').withOption('sWidth','120px').notSortable().renderWith(function(data,type,full){
            return tools.formatNumber(Number(full.loanAmount) - Number(full.purchasedAmount));
        }),
        DTColumnBuilder.newColumn('loanPurpose').withTitle('借款用途').withOption('sWidth','90px').notSortable(),
        DTColumnBuilder.newColumn('loanStatusDesc').withTitle('标的状态').withOption('sWidth','90px').notSortable(),
        DTColumnBuilder.newColumn('createTime').withTitle('标的创建时间').withOption('sWidth','130px').notSortable().renderWith(function(data,type,full){
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('updateTime').withTitle('标的更新时间').withOption('sWidth','130px').notSortable().renderWith(function(data,type,full){
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('id').withTitle('投资金额上下限').withOption('sWidth','100px').notSortable().renderWith(function (data,type,full) {
            return tools.formatNumber(full.minAmount) + ' ~ ' + tools.formatNumber(full.maxAmount);
        }),
        DTColumnBuilder.newColumn('productId').withTitle('产品编号').withOption('sWidth','140px').notSortable(),
        DTColumnBuilder.newColumn('quota').withTitle('标的可购买最大额度').withOption('sWidth','140px').renderWith(function (data,type,full) {
            return tools.formatNumber(data);
        }).notSortable(),
        DTColumnBuilder.newColumn('borrowerIdType').withTitle('借款人证件类型').withOption('sWidth','120px').notSortable()
    ];

    $scope.action = {
        reset: function(){
            for(var prop in $scope.form){
                if(prop !== 'isShow') delete $scope.form[prop];
            }
            vm.dtInstance.rerender();
        },
        search: function(){
            if(Number($scope.form.loanExpireStart) > Number($scope.form.loanExpireEnd)){tools.interalert('借款期限查询范围有误');return;}
            if(Number($scope.form.loanRatioStart) > Number($scope.form.loanRatioEnd)){tools.interalert('借款利率查询范围有误');return;}
            if(Number($scope.form.loanAmountStart) > Number($scope.form.loanAmountEnd)){tools.interalert('借款金额查询范围有误');return;}
            if(Date.parse($scope.form.createTimeEnd) < Date.parse($scope.form.createTimeStart)){tools.interalert('创建时间查询范围有误');return;}
            if(Date.parse($scope.form.updateTimeEnd) < Date.parse($scope.form.updateTimeStart)){tools.interalert('更新时间查询范围有误');return;}
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
        //if(!tools.interceptor(window.ajaxDataInfo)) return;

        /**
         * [散标标的同步]
         * @param  {[type]}     [description]
         * @return {[type]}     [description]
         */
        $("#js_synchronize").on("click", function(){
            var url = siteVar.serverUrl + '/scatteredLoan/synLoanList.shtml', self = $(this);
            if(!tools.ajaxLocked("#js_synchronize")) return false;
            $.ajax({url: url,
                method: 'post'
            }).then(function(data){
                tools.ajaxOpened("#js_synchronize");
                if(data.success){
                    alert(data.msg);
                }
            })
        });

        /**
         * [导出数据]
         * @param  {[type]}     [description]
         * @return {[type]}     [description]
         */
        $("#js_consumer_export").on("click", function(){
            $scope.form.subtypes = $("#js_form").find("input[name='p_status']").val();
            $scope.$apply();
            tools.export(this);
        });
    }
}
