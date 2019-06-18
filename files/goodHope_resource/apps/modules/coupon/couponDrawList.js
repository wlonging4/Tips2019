'use strict';
function couponDrawListController($scope, tools, DTOptionsBuilder, DTColumnBuilder, $location, $modal, $http, EnumeratorCollection) {
    $scope.form = {
        startTime: tools.toJSYMD(new Date().getTime() - 60*60*24*1000*30),
        endTime:tools.toJSYMD(new Date().getTime())
    };
    $scope.select = {};

    /**
     * 枚举
     * **/
    EnumeratorCollection.getSelectList('CouponUsedStatusEnum').then(function (data) {
        $scope.select = data.data;
    });


    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder
        .newOptions().withOption('ajax',{
            url: G.server + '/coupon/getUserCouponList.json',
            type: 'POST',
            data: $scope.form
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
        DTColumnBuilder.newColumn('couponId').withTitle('优惠券ID').withOption('sWidth','80px'),
        DTColumnBuilder.newColumn('name').withTitle('优惠券名称').withOption('sWidth','80px'),
        DTColumnBuilder.newColumn('scope').withTitle('适用范围').withOption('sWidth','120px'),
        DTColumnBuilder.newColumn('amountCaption').withTitle('优惠金额').withOption('sWidth','100px'),
        DTColumnBuilder.newColumn('realName').withTitle('领取合伙人').withOption('sWidth','100px'),
        DTColumnBuilder.newColumn('createTime').withTitle('领取日期').withOption('sWidth','140px').renderWith(function(data, type, full) {
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('updateTime').withTitle('使用时间').withOption('sWidth','140px').renderWith(function(data, type, full) {
            return '<span class="upTime">' + (full.status == 1 ? tools.toJSDate(data) : '') + '</span>';
        }),
        DTColumnBuilder.newColumn('typeStr').withTitle('券类型').withOption('sWidth','80px'),
        DTColumnBuilder.newColumn('statusStr').withTitle('状态').withOption('sWidth','80px').renderWith(function(data, type, full) {
            return '<span class="status">' + data + '</span>';
        }),
        DTColumnBuilder.newColumn('userCouponId').withTitle('操作').withOption('sWidth','80px').renderWith(function(data, type, full) {
            return '<a class="handle" data-userCouponId="' + data + '" data-status="' + full.status + '">状态变更</a>';
        })
    ];
    $scope.reset = function(){
        for(var prop in $scope.form){
            delete $scope.form[prop];
        }
        $scope.form.startTime = tools.toJSYMD(new Date().getTime() - 60*60*24*1000*30);
        $scope.form.endTime = tools.toJSYMD(new Date().getTime());
        vm.dtInstance.rerender();
    };
    $scope.search = function(){
        for(var prop in $scope.form){
            if(!$scope.form[prop]) delete $scope.form[prop];
        }
        var keysArr = Object.keys($scope.form);
        if(keysArr.length === 0){
            return tools.interalert('查询条件不能为空!')
        }
        vm.dtInstance.rerender();
    };
    function fnDrawCallback(){
        var table = $("#dataTables");

        table.off("click").on("click", ".handle", function () {
            var self= $(this),
                tr = self.parents('tr'),
                userCouponId = $(this).attr("data-userCouponId"),
                status = $(this).attr("data-status"),
                modalInstance = $modal.open({
                backdrop: true,
                backdropClick: true,
                dialogFade: false,
                keyboard: true,
                templateUrl : 'statusContent.html',
                controller : statusCtrl,
                windowClass:'modal-640',
                resolve:{
                    select:function () {
                        return $scope.select
                    },
                    info:function () {
                        return {
                            userCouponId:userCouponId,
                            status:status
                        }
                    }
                }
            });
            modalInstance.result.then(function (data) {
                if(data && data.status){
                    var status = data.status, len = $scope.select.CouponUsedStatusEnum.length, txt = '';
                    for(var i = 0; i < len; i++){
                        var item = $scope.select.CouponUsedStatusEnum[i];
                        if(item.key == status){
                            txt = item.value;
                            break;
                        }
                    }
                    var upTimeTxt = data.upTime ? tools.toJSDate(data.upTime) :"";
                    tr.find(".status").html(txt);
                    tr.find(".upTime").html(upTimeTxt);
                    self.attr("data-status", status)

                }
            })

        });

    }

    function statusCtrl($scope, $modalInstance, select, info, $http) {
        $scope.form = info;
        $scope.select = select;
        $scope.change = function () {
            $http({
                method: "POST",
                url: G.server + "/coupon/modifyUserCoupon.json",
                data:$.param($scope.form)
            }).then(function (data) {
                var detail = data.data;
                if(detail.code === '0') {
                    return alert(detail.msg);
                };
                $scope.form.upTime = detail.data;
                $modalInstance.close($scope.form);
            });
        };
        $scope.close = function() {
            $modalInstance.close();
        };
    }

}
