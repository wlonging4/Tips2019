'use strict';
var submitCheckedInfo=[];
function xinghuoproductCustomController($scope,getSelectListFactory,tools,DTOptionsBuilder, DTColumnBuilder,$modal) {
    $scope.form={};
    $scope.select={};
    //$scope.form.upStatus=0;
    $scope.sumMoney=tools.formatNumber(0);
    $scope.sumMoney2=tools.formatNumber(0);
    //$scope.customAuthWindow=1;
    var dateYear=new Date().getFullYear();
    var dateMonth=new Date().getMonth()+1;
    var dateDate=new Date().getDate()+1;
    $scope.form.upTimeEnd=tools.toJSYMD(Date.parse(dateYear+'-'+dateMonth+'-'+dateDate+' '+'00:00:00'));
    $scope.form.upTimeStart=tools.toJSYMD((Date.parse(dateYear+'-'+dateMonth+'-'+dateDate+' '+'00:00:00'))-3*3600*24*1000);

    //搜索定制期限
    $.ajax({
        type: "post",
        url: siteVar.serverUrl + "/xinghuopageapi/getAllCustomPeriodList.json",
        dataType: "json",
        success: function(data){
            tools.ajaxOpened(self);
            if(!tools.interceptor(data)) return;
            $scope.select.periodList=data.data.allCustomPeriodList;
            //console.log(data.data.allCustomPeriodList);
            $scope.$apply();
        },
        error: function(err){
            tools.ajaxOpened(self);
            tools.ajaxError(err);
        }
    });

    //获取关联产品
    $.ajax({
        type: "post",
        url: siteVar.serverUrl + '/xinghuopageapi/getAllProductForCustom.json',
        dataType: "json",
        success: function(data){
            tools.ajaxOpened(self);
            if(!tools.interceptor(data)) return;
            var customCodeData=data.data.allProductForCustom;
            var codeDataArr=[];
            for(var key in customCodeData){
                codeDataArr[key]={
                    "text":customCodeData[key].productName+'('+tools.toJSYMD(customCodeData[key].beginTime)+')',
                    "value":customCodeData[key].productCode,
                    "default":false
                }
            }
            $('.prior_type_select').multiSel({
                'data': codeDataArr,
                "name" : "form.productCodeStrs"
            });
        },
        error:function(err){
            tools.ajaxOpened(self);
            tools.ajaxError(err);
        }
    });

    /*
     获取枚举类型
     */
    var selectList = getSelectListFactory.getSelectList(['product_custom_up_status','product_custom_deal_status']);
    selectList.then(function(data){
        $scope.select.upStatus = data.appResData.retList[0].product_custom_up_status;
        $scope.select.customDealStatus = data.appResData.retList[1].product_custom_deal_status;
    });

    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder
        .newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/xinghuoproductcustom/tableproductcustom.shtml',
            type: 'POST',
            data: $scope.form
        })
        .withDataProp('data')
        .withOption('searching',false)
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
    vm.dtColumns = [
        DTColumnBuilder.newColumn('').withTitle('<label><input type="checkbox" class="radioAll"> 全选</label>').withOption('sWidth','50px').renderWith(function (data,type,full) {
            //upStatus ( 0, "上架" ), DOWN( 1, "下架" );
            //customDealStatus PAYING( 0, "待付款" ), PAID( 1, "已付款" ), CANNLE( 6, "已取消" ),NOT_EXIST(99,"无关联交易单");
            //上架产品待付款->禁止下架操作
            //下架产品已付款->禁止上架操作
            if(/*full.upStatusStr=='上架'*/full.upStatus.toString()=='0'){
                if(/*full.customDealStatusStr=='待付款'*/full.customDealStatus.toString()=='0'){
                    //上架产品待付款
                    return '<label style="text-align:center"><input type="checkbox" data-status="up" data-status2="payNot" data-value="'+full.customInfoId+'" class="radioList"></label>';
                }else{
                    //上架产品其他
                    return '<label style="text-align:center"><input type="checkbox" data-status="up" data-status2="payYes" data-value="'+full.customInfoId+'" class="radioList"></label>';
                }
            }
            if(/*full.upStatusStr=='下架'*/full.upStatus.toString()==1){
                if(/*full.customDealStatusStr=='已付款'*/full.customDealStatus==1){
                    //下架产品已付款不显示勾选框
                    /*return '<label style="text-align:center"><input type="checkbox" data-status="down" data-status2="payYes" data-value="'+full.customInfoId+'" class="radioList"></label>';*/
                    return '';
                }else{
                    //下架产品其他
                    return '<label style="text-align:center"><input type="checkbox" data-status="down" data-status2="payNot" data-value="'+full.customInfoId+'" class="radioList"></label>';
                }
            }
        }).notSortable(),
        DTColumnBuilder.newColumn('managerName').withTitle('理财经理姓名').withOption('sWidth','90px').renderWith(function(data,type,full){
            if(!data){return '--'}
            return '<a class="js_manager_name" href="javascript:;" keyid="'+full.managerId+'" style="">'+data+'</a>';
        }).notSortable(),
        DTColumnBuilder.newColumn('customName').withTitle('定制产品名称').withOption('sWidth','120px').notSortable().renderWith(function(data,type,full){
            return '<a href="javascript:;" keyId="'+full.customInfoId+'" class="js_productRelate_name" style="font-weight:600;">'+data+'</a>';
        }),
        DTColumnBuilder.newColumn('customAmount').withTitle('定制金额(元)').withOption('sWidth','90px').notSortable().renderWith(function (data,type,full) {
            return tools.formatNumber(data);
        }),
        DTColumnBuilder.newColumn('customPeriodShowName').withTitle('定制期限').withOption('sWidth','70px').notSortable(),
        DTColumnBuilder.newColumn('customAnnaulRate').withTitle('收益率').withOption('sWidth','60px').renderWith(function(data,type,full){
            return data+' %';
        }).notSortable(),
        DTColumnBuilder.newColumn('customRate').withTitle('佣金比例').withOption('sWidth','60px').renderWith(function(data,type,full){
            return data+' %';
        }).notSortable(),
        DTColumnBuilder.newColumn('lenderName').withTitle('出借人姓名').withOption('sWidth','100px').renderWith(function(data,type,full){
            if(!data) return "";
            return '<a href="javascript:;" keyid="'+full.lenderId+'" class="js_consumer_name">'+data+'</a>';
        }).notSortable(),
        DTColumnBuilder.newColumn('upTime').withTitle('上架时间').withOption('sWidth','140px').renderWith(function(data,type,full){
            if(!data) return "---";
            return tools.toJSDate(data);
        }).notSortable(),
        DTColumnBuilder.newColumn('upStatusStr').withTitle('产品状态').withOption('sWidth','60px').renderWith(function (data,type,full){
            return data||'---';
        }).notSortable(),
        DTColumnBuilder.newColumn('customDealNo').withTitle('关联交易单单号').withOption('sWidth','160').renderWith(function(data,type,full){
            return data || '---';
        }).notSortable(),
        DTColumnBuilder.newColumn('customDealStatusStr').withTitle('关联交易单状态').withOption('sWidth','100').renderWith(function(data,type,full){
            return data || '---';
        }).notSortable(),
    ];

    $scope.action={
        submitProductOn:function () {
            //提交审核选中信息
            if(!submitCheckedInfo.length){
                tools.interalert('请选择列表提交申请');return;
            }
            //弹窗
            var info =submitCheckedInfo;
            $modal.open({
                backdrop: true,
                backdropClick: true,
                dialogFade: false,
                keyboard: true,
                templateUrl: 'xinghuoproductCustomSubmitOn.html',
                controller: xinghuoproductCustomSubmitOn,
                resolve: {
                    "info": function() {
                        return info;
                    }
                }
            });
        },
        submitProductDown:function () {
            //提交审核选中信息
            if(!submitCheckedInfo.length){
                tools.interalert('请选择列表提交申请');return;
            }
            //console.log(submitCheckedInfo);
            //弹窗
            var info =submitCheckedInfo;
            $modal.open({
                backdrop: true,
                backdropClick: true,
                dialogFade: false,
                keyboard: true,
                templateUrl: 'xinghuoproductCustomSubmitDown.html',
                controller: xinghuoproductCustomSubmitDown,
                resolve: {
                    "info": function() {
                        return info;
                    }
                }
            });
        },
    };

    $('.searchBtn').on('click',function () {
        //关联产品id
        $scope.form.productCodeStrs=$('#multi_select input[name="form.productCodeStrs"]').val();
        console.log($scope.form);
        //console.log($scope.form.upStatus)
        //console.log(!$scope.form.upStatus)
        if(!$scope.form.upTimeEnd&&!$scope.form.upTimeStart&&!$scope.form.periodList&&!$scope.form.productCodeStrs&&!$scope.form.customAmountStart&&!$scope.form.customAmountEnd&&!$scope.form.customName&&!$scope.form.managerId&&(typeof($scope.form.upStatus)=='undefined'||$scope.form.upStatus.toString()=='')&&(typeof($scope.form.customDealStatus)=='undefined'||$scope.form.customDealStatus.toString()=='')){
            tools.interalert('请填写搜索条件进行查询');
            return false;
        }
        //如已选中定制期限
        if($scope.form.periodList){
            $scope.form.periodList2=$scope.form.periodList.split(',');
            $scope.form.periodKey=$scope.form.periodList2[0];
            $scope.form.customPeriod=$scope.form.periodList2[1];
            $scope.form.customPeriodUnit=$scope.form.periodList2[2];
        }else{
            delete $scope.form.periodKey;
            delete $scope.form.customPeriod;
            delete $scope.form.customPeriodUnit;
        }

        submitCheckedInfo=[];
        vm.dtInstance.rerender();
        console.log('render');
        $scope.form.periodList2='';
    });

    function fnDrawCallback(){
        if(!tools.interceptor(window.ajaxDataInfo)) return;
        tools.resetWidth();
        //获取表头数据
        $scope.$apply(function(){
            $scope.tableinfo = window.ajaxDataInfo.info;
            //console.log(window.ajaxDataInfo.info);
            if(window.ajaxDataInfo.info){
                $scope.sumMoney=tools.formatNumber(window.ajaxDataInfo.info.allCustomAmount)||0;
                $scope.sumMoney2=tools.formatNumber(window.ajaxDataInfo.info.allCustomAmountPaid)||0;
            }else{
                $scope.sumMoney=0;
                $scope.sumMoney2=0;
            }
        });

        //导出表格
        $("#js_export").on("click", function(){
            //console.log($scope);
            tools.export(this);
        });

        /**
         * [查看理财经理信息]
         * @param  {object}   [description]
         * @return {[type]}   [description]
         */
        $("#dataTables").on("click",".js_manager_name", function(){
            var data = {
                "id": $(this).attr("keyid"),
                //"id":121009677201,
                "userType": "director",
                //"bizSysRoute": $("#biz_sys_route").val()
            };
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

        /**
         * [查看用户信息]
         * @param  {object}   [description]
         * @return {[type]}   [description]
         */
        $("#dataTables").on("click", ".js_consumer_name", function(){
            var bizSysRoute = $(this).attr("key_sys") == "null" ? 0 : $(this).attr("key_sys");
            var url = "/xinghuouser/userinfo.shtml";
            var data = {
                "id": $(this).attr("keyid"),
                //"id":"121019757259",
                "userType": "consumer",
                //"bizSysRoute": bizSysRoute
            };
            //console.log('看用户信息啦~~');return;
            var self = this;
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + url,
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


        /*显示未审核通过原因*/
        $('#dataTables tbody').on('mouseenter','.checkEnterLink',function () {
            $(this).find('.checkEnterSpan').show();
        });
        $('#dataTables tbody').on('mouseleave','.checkEnterLink',function () {
            $(this).find('.checkEnterSpan').hide();
        });

        $("#dataTables tbody").off("click");
        $("#js_dialog").off("click");
        tools.createModal();

        //产看产品详情
        $('#dataTables_wrapper').off('click').on('click','.js_productRelate_name',function () {
            var customInfoId=$(this).attr("keyId");
            var self = this;
            if(!tools.ajaxLocked(self)) return;
            //请求后台调用数据再弹窗绑定
            $.ajax({
                type: "post",
                url: siteVar.serverUrl +"/xinghuoproductcustom/getMangerProductCustomDetail.json",
                data: {'customInfoId':customInfoId},
                dataType: "json",
                success: function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    //请求之后弹窗
                    $modal.open({
                        backdrop: true,
                        backdropClick: true,
                        dialogFade: false,
                        keyboard: true,
                        templateUrl: 'productDetail.html',
                        controller: 'productDetailCtrl',
                        resolve: {
                            "info": function() {
                                return data.data;
                            }
                        }
                    })
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });
        });

        //选择
        $('#dataTables_wrapper').on("click",".radioAll",function () {
            if($(this).is(':checked')){
                //防止先点选后全选重复
                submitCheckedInfo=[];
                $('#dataTables tbody .radioList').each(function (i) {
                    $(this).attr('checked','true');
                    submitCheckedInfo.push({'id':$(this).attr('data-value'),'status':$(this).attr('data-status'),'status2':$(this).attr('data-status2')});
                });
            }else{
                $('#dataTables tbody .radioList').each(function (i) {
                    $(this).removeProp('checked');
                    submitCheckedInfo.splice($(this).index(),1);
                });
            }
            //console.log(submitCheckedInfo);
        });
        $('#dataTables tbody .radioList').on('click',function () {
            submitCheckedInfo=[];
            $('#dataTables tbody .radioList').each(function (i) {
                if($(this).is(':checked')){
                    submitCheckedInfo.push({'id':$(this).attr('data-value'),'status':$(this).attr('data-status'),'status2':$(this).attr('data-status2')});
                }
            });
            //console.log(submitCheckedInfo);
        });
        $('.dataTables_paginate').on('click','.paginate_button',function () {
            $('.radioAll').removeProp('checked');
            //换页之后清空全选列表
            submitCheckedInfo=[];
            $('.radioList').each(function (i) {
                $(this).removeProp('checked');
                //console.log(submitCheckedInfo);
            })
        })
    }

    //弹窗上架
    function xinghuoproductCustomSubmitOn($scope,info,tools,$modalInstance) {
        $scope.info=info;
        //console.log(info);
        var str='';
        $scope.close = function() {
            $modalInstance.close();
            str='';
            submitCheckedInfo=[];
            $('.radioAll').removeProp('checked');
            submitCheckedInfo=[];
            $('.radioList').each(function (i) {
                $(this).removeProp('checked');
            })
        };
        for(var i=0;i<info.length;i++){
            //已下架非已付款 都可以上架操作
            if(info[i].status=='down'&&info[i].status2=='payNot'){
                str+=info[i].id+',';
            }
        }
        str=str.substr(0, str.length - 1);
        //console.log(str);
        $scope.customProductConfirmBtnOn=function () {
            submitCheckedInfo=[];
            if(!str){
                tools.interalert('无符合条件的操作项');
                //清数据
                str='';
                submitCheckedInfo=[];
                $('.radioAll').removeProp('checked');
                submitCheckedInfo=[];
                $('.radioList').each(function (i) {
                    $(this).removeProp('checked');
                });
                $modalInstance.close();
                return false;
            }
            var self = this;
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl +"/xinghuoproductcustom/doUpOrDown.json",
                data: {'ids':str,'upOrDown':0},
                dataType: "json",
                success: function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    tools.interalert(data.msg);
                    //清数据
                    str='';
                    submitCheckedInfo=[];
                    $('.radioAll').removeProp('checked');
                    submitCheckedInfo=[];
                    $('.radioList').each(function (i) {
                        $(this).removeProp('checked');
                    });
                    $modalInstance.close();
                    vm.dtInstance.rerender();
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });
        };
    }
//弹窗下架
    function xinghuoproductCustomSubmitDown($scope,tools,info,$modalInstance) {
        $scope.info=info;
        //console.log(info);
        var str='';
        $scope.close = function() {
            $modalInstance.close();
            str='';
            submitCheckedInfo=[];
            $('.radioAll').removeProp('checked');
            submitCheckedInfo=[];
            $('.radioList').each(function (i) {
                $(this).removeProp('checked');
            })
        };
        for(var i=0;i<info.length;i++){
            //已上架非待付款 都可以上架操作
            if(info[i].status=='up'&&info[i].status2=='payYes'){
                str+=info[i].id+',';
            }
        }
        str=str.substr(0, str.length - 1);
        //console.log(str);
        $scope.customProductConfirmBtnDown=function () {
            submitCheckedInfo=[];
            if(!str){
                tools.interalert('无符合条件的操作项');
                //清数据
                str='';
                submitCheckedInfo=[];
                $('.radioAll').removeProp('checked');
                submitCheckedInfo=[];
                $('.radioList').each(function (i) {
                    $(this).removeProp('checked');
                });
                $modalInstance.close();
                return false;
            }
            var self = this;
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl +"/xinghuoproductcustom/doUpOrDown.json",
                data: {'ids':str,'upOrDown':1},
                dataType: "json",
                success: function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    tools.interalert(data.msg);
                    //清数据
                    str='';
                    submitCheckedInfo=[];
                    $('.radioAll').removeProp('checked');
                    submitCheckedInfo=[];
                    $('.radioList').each(function (i) {
                        $(this).removeProp('checked');
                    });
                    $modalInstance.close();
                    vm.dtInstance.rerender();
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });
        };
    }
}



//弹窗详情controller
function productDetailCtrl($scope,$modalInstance,info,tools) {
    info.upTime=tools.toJSDate(info.upTime);
    info.downTime=tools.toJSDate(info.downTime);
    $scope.info=info;
    $scope.close = function() {
        $modalInstance.close();
    };
    //console.log(info);
}
