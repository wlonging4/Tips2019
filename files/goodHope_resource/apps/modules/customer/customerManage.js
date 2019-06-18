'use strict';
function customerManageController($scope,tools,DTOptionsBuilder, DTColumnBuilder,$location,$modal) {
    $scope.form = {
        isShow: ($("#js_form").find(".form-group").length>6) ? true : false
    };
    $scope.G=G;
    $scope.select = {};
    $scope.form.createTimeEnd=tools.toJSDate(Date.parse(new Date())).slice(0,10);
    $scope.form.createTimeBegin=tools.toJSDate(Date.parse(new Date())-30*3600*24*1000).slice(0,10);

    //下拉菜单查询签单状态
    $.ajax({
        url : G.server + '/enums/get.json',
        type:"get",
        data : {key:5},
        success :function(data){
            tools.ajaxOpened(self);
            if(!tools.interceptor(data)) return;
            if(data.success){
                $scope.$apply(function () {
                    $scope.select.signedContract=data.data;
                });

            }else{
                tools.interalert(data.msg);
            }
        }
    });

    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder
        .newOptions().withOption('ajax',{
            url: G.server + '/customer/selectPageCustomerList.json',
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
        DTColumnBuilder.newColumn('customerName').withTitle('客户姓名').withOption('sWidth','120px').renderWith(function (data,type,full) {
            return '<a href="javascript:;" data-id="'+full.customerId+'" class="titleDetail">'+data+'</a>'
        }),
        DTColumnBuilder.newColumn('mobile').withTitle('手机号').withOption('sWidth','90px'),
        DTColumnBuilder.newColumn('birthday').withTitle('出生日期').withOption('sWidth','90px').renderWith(function(data, type, full) {
            return tools.toJSYMD(data);
        }),
        DTColumnBuilder.newColumn('investmentAmountDesc').withTitle('可投金额').withOption('sWidth','120px').renderWith(function(data,type,full){
            return data;
        }),
        DTColumnBuilder.newColumn('purposeProjectName').withTitle('意向项目').withOption('sWidth','120px').renderWith(function (data,type,full) {
            return data;
        }),
        DTColumnBuilder.newColumn('isHasOverseaBankAccountDesc').withTitle('是否有美元账户').withOption('sWidth','100px'),
        DTColumnBuilder.newColumn('userId').withTitle('合伙人ID').withOption('sWidth','100px'),
        DTColumnBuilder.newColumn('signedContractDesc').withTitle('签单情况').withOption('sWidth','80px'),
        DTColumnBuilder.newColumn('posterId').withTitle('设置').withOption('sWidth','80px').renderWith(function(data,type,full){
            return '<a href="javascript:;" style="line-height: 1.1" data-customerId="'+full.customerId+'" data-signedContract="'+full.signedContract+'" class="btn btn-sm btn-primary propertyModify" >属性设置</a>';
        })
    ];
    $scope.reset = function(){
        for(var prop in $scope.form){
            delete $scope.form[prop];
        }
        vm.dtInstance.rerender();
    };
    $scope.search = function(){
        if(!$scope.form.customerName&&!$scope.form.mobile&&!$scope.form.createTimeBegin&&!$scope.form.createTimeEnd&&!$scope.form.signedContract){return tools.interalert('查询条件不能为空!')}
        vm.dtInstance.rerender();
    };
    function fnDrawCallback(data){
        if(!tools.interceptor(window.ajaxDataInfo)) return;
        tools.resetWidth();

        //客户详情
        $('.titleDetail').on('click',function () {
            var nowId=$(this).attr('data-id');
            $.ajax({
                url : G.server + '/customer/selectCustomerAmDetail.json',
                type:"get",
                data : {customerId:nowId},
                success :function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    if(data.success){
                        $modal.open({
                            backdrop: true,
                            backdropClick: true,
                            dialogFade: false,
                            keyboard: true,
                            templateUrl : 'customerDetailCtrl.html',
                            controller : customerDetailCtrl,
                            windowClass:'modal-640',
                            resolve: {
                                "info": function() {
                                    return data.data;
                                },
                                "G":function () {
                                   return $scope.G;
                                }
                            }
                        });
                    }else{
                        tools.interalert(data.msg);
                    }
                }
            });
        });

        //关联客户详情弹窗
        function customerDetailCtrl($scope,G,info,$modalInstance) {
            $scope.form={};
            $scope.G=G;
            info.birthday=tools.toJSYMD(info.birthday);
            info.createTime=tools.toJSDate(info.createTime);
            $scope.form=info;
            $scope.close = function() {
                $modalInstance.close();
            };
        }

        //签单属性修改
        $('.propertyModify').on('click',function () {
            var customerId=$(this).attr('data-customerId');
            var signedContract=$(this).attr('data-signedContract');
            var data={
                'customerId':customerId,
                'signedContract':signedContract
            };
            $modal.open({
                backdrop: true,
                backdropClick: true,
                dialogFade: false,
                keyboard: true,
                templateUrl : 'propertyModifyCtrl.html',
                controller : propertyModifyCtrl,
                windowClass:'modal-640',
                resolve: {
                    "info": function() {
                        return data;
                    },
                    "select":function () {
                        return $scope.select.signedContract;
                    }
                }
            });
        });

        //签单属性修改弹窗
        function propertyModifyCtrl($scope,info,select,tools,$modalInstance) {
            $scope.form={};
            $scope.select={};
            $scope.form=info;
            $scope.select.signedContract=select;
            $scope.update = function() {
                if(!$scope.form.customerId){return tools.interalert('缺少客户ID！')}
                if(!$scope.form.signedContract||$scope.form.signedContract=='null'){return tools.interalert('请选择签单状态！')}
                $.ajax({
                    url : G.server + '/customer/updateCustomerSignConStatus.json',
                    type:"POST",
                    data:$scope.form,
                    success :function(data){
                        tools.ajaxOpened(self);
                        if(!tools.interceptor(data)) return;
                        if(data.success){
                            tools.interalert('修改签单状态成功！');
                            vm.dtInstance.rerender();
                            $modalInstance.close();
                        }else{
                            tools.interalert(data.msg);
                        }
                    }
                });
            };
            $scope.close = function() {
                $modalInstance.close();
            };
        }

        /**
         * [导出数据]
         * @param  {[type]}     [description]
         * @return {[type]}     [description]
         */
        $("#js_export").on("click", function(){
            tools.export(this);
        });
    }
}
