'use strict';
function couponAddController($scope, tools, $location, $timeout, $http, $state, EnumeratorCollection) {
    $scope.form = {
        status:1,
        type:1
    };
    $scope.select = {};

    /**
     * 枚举
     * **/
    EnumeratorCollection.getSelectList('CouponTypeEnum').then(function (data) {
        $scope.select = data.data;

        //回显信息
        var search = $location.$$search;
        if(search.detail){
            var detail = JSON.parse(decodeURIComponent(search.detail));
            detail.effectiveStartTime = tools.toJSDate(detail.effectiveStartTime);
            detail.effectiveEndTime = tools.toJSDate(detail.effectiveEndTime);
            $scope.form = detail;
            if(detail.effectiveStartTime){
                $scope.$applyAsync(function () {
                    $scope.action.setStartTime();
                });
            }
            if(detail.effectiveEndTime){
                $scope.$applyAsync(function () {
                    $scope.action.setEndTime();
                })
            }
            $scope.form.status = String($scope.form.status);
            if($scope.form.pointCaption){
                $scope.showPointCaption = true;
            }else{
                $scope.showPointCaption = false;
            }
        }

        $scope.$applyAsync(function () {
            $("input[type=checkbox],input[type=radio]").uniform();
        });
    });


    $scope.action = {
        setStartTime:function () {
            var v = $(".startTime").val(), newDate = new Date(v);
            newDate = newDate.getTime() + 60*1000;
            newDate = tools.toJSDate(newDate);
            $('.endTime').datetimepicker('setStartDate', newDate);

        },
        setEndTime:function () {
            var v = $('.endTime').val(), newDate = new Date(v);
            newDate = newDate.getTime() - 60*1000;
            newDate = tools.toJSDate(newDate);
            $('.startTime').datetimepicker('setEndDate', newDate);
        },
        save:function () {
            var form = JSON.parse(JSON.stringify($scope.form));
            if(form.pointCaption){
                form.pointCaption = '最高';
            }else{
                form.pointCaption = '';
            }
            if(!form.name){
                return alert("请输入优惠券名称！")
            }
            if(!form.scope){
                return alert("请输入适用范围！")
            }
            if(!form.type){
                return alert("请选择优惠券类型！")
            }
            if(!form.amountCaption){
                return alert("请输入优惠金额！")
            }

            if(!form.effectiveTimeCaption){
                return alert("请输入有效期！")
            }
            if(!form.effectiveStartTime){
                return alert("请输入活动开始时间！")
            }
            if(!form.effectiveEndTime){
                return alert("请输入活动结束时间！")
            }
            if(new Date(form.effectiveStartTime) - new Date(form.effectiveEndTime) >= 0){
                return alert("活动结束时间要大于活动开始时间！")
            }
            if(form.createTime){
                delete form.createTime
            }
            if(form.updateTime){
                delete form.updateTime
            }
            if(!form.status){
                return alert("请选择状态！")
            }
            $http({
                method: "POST",
                url: G.server + "/coupon/saveCoupon.json",
                data:$.param(form),
            }).then(function (data) {
                var info = data.data;
                if(!info.success) {
                    return alert(info.msg);
                };
               alert("保存成功！");
               $state.go('couponList')
            });
        }
    };

}
