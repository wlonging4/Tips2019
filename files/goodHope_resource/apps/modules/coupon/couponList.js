'use strict';
function couponListController($scope, tools, DTOptionsBuilder, DTColumnBuilder, $location) {
    $scope.form = {
        startTime: tools.toJSYMD(new Date().getTime() - 60*60*24*1000*30),
        endTime:tools.toJSYMD(new Date().getTime())
    };
    //存放一些常量


    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder
        .newOptions().withOption('ajax',{
            url: G.server + '/coupon/getCouponList.json',
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
        DTColumnBuilder.newColumn('couponId').withTitle('优惠券ID').withOption('sWidth','120px'),
        DTColumnBuilder.newColumn('name').withTitle('优惠券名称').withOption('sWidth','80px'),
        DTColumnBuilder.newColumn('scope').withTitle('适用范围').withOption('sWidth','120px'),
        DTColumnBuilder.newColumn('amountCaption').withTitle('优惠金额').withOption('sWidth','120px'),
        DTColumnBuilder.newColumn('effectiveStartTime').withTitle('生效日期').withOption('sWidth','140px').renderWith(function(data, type, full) {
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('effectiveEndTime').withTitle('截止日期').withOption('sWidth','140px').renderWith(function(data, type, full) {
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('simpleCaption').withTitle('优惠提示').withOption('sWidth','80px'),
        DTColumnBuilder.newColumn('typeStr').withTitle('券类型').withOption('sWidth','80px'),
        DTColumnBuilder.newColumn('statusStr').withTitle('状态').withOption('sWidth','80px').renderWith(function(data, type, full) {
            return data ? '<span class="status">' + data + '</span>' : '';
        }),
        DTColumnBuilder.newColumn('couponId').withTitle('操作').withOption('sWidth','80px').renderWith(function(data, type, full) {
            var str = full.status === 0 ? '启用':'禁用';
            return '<a class="handle" data-id="' + data + '" data-status="' + full.status + '">' + str + '</a> <a href="#/couponAdd?detail=' + encodeURIComponent(JSON.stringify(full)) + '">编辑</a>';
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
            var self = $(this),
                tr = self.parents('tr'),
                id = self.attr("data-id"),
                status = self.attr("data-status");


            $.ajax({
                url:G.server + "/coupon/modifyCoupon.json",
                method:"POST",
                data:{
                    couponId:id,
                    status:status === '0'? '1':'0'
                },
                dataType:"json",
                success:function (res) {
                    if(!res.success){
                        alert(res.msg);
                    }

                    var newStatusStr = status === '0'? '上架':'下架',
                        newTxt = status === '0'? '禁用':'启用',
                        newStatus = status === '0'? '1':'0';
                    tr.find(".status").html(newStatusStr);
                    self.html(newTxt).attr("data-status", newStatus);
                }
            })

        });



    }
}
