'use strict';
function xinghuoCustomController($scope,getSelectListFactory,tools,DTOptionsBuilder, DTColumnBuilder,$modal) {
    $scope.form={};
    $scope.select={};
    $scope.action={};
    $scope.form.productCodeStrs='';
    $scope.form.customStatus=0;
    $scope.customAuthWindow=1;
    $scope.sumMoney=tools.formatNumber(0);
    var submitCheckedInfo=[];
    var dateYear=new Date().getFullYear();
    var dateMonth=new Date().getMonth()+1;
    var dateDate=new Date().getDate()+1;
    $scope.form.applyTimeEnd=tools.toJSYMD(Date.parse(dateYear+'-'+dateMonth+'-'+dateDate+' '+'00:00:00'));
    $scope.form.applyTimeStart=tools.toJSYMD((Date.parse(dateYear+'-'+dateMonth+'-'+dateDate+' '+'00:00:00'))-6*3600*24*1000);

    //搜索定制期限
    $.ajax({
        type: "post",
        url: siteVar.serverUrl + "/xinghuopageapi/getAllCustomPeriodList.json",
        dataType: "json",
        success: function(data){
            tools.ajaxOpened(self);
            if(!tools.interceptor(data)) return;
            $scope.select.periodList=data.data.allCustomPeriodList;
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
    var selectList = getSelectListFactory.getSelectList(['product_custom_status']);
    selectList.then(function(data){
        $scope.select.customStatus = data.appResData.retList[0].product_custom_status;
    });

    $('.searchBtn').on('click',function () {
        //关联产品id
        $scope.form.productCodeStrs=$('#multi_select input[name="form.productCodeStrs"]').val();
        console.log($scope.form);

        if(!$scope.form.applyTimeEnd&&!$scope.form.applyTimeStart&&!$scope.form.periodList&&!$scope.form.productCodeStrs&&!$scope.form.customAmountStart&&!$scope.form.customAmountEnd&&!$scope.form.customName&&!$scope.form.managerId&&($scope.form.customStatus.toString()=='')){
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

    var vm = this;
    vm.dtInstance = {};
    //console.log($scope.form)
    vm.dtOptions = DTOptionsBuilder
        .newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/xinghuoproductcustom/tableapply.shtml',
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
        //.withOption('order', [6, 'desc']);
    vm.dtColumns = [
        DTColumnBuilder.newColumn('').withTitle('<label><input type="checkbox" class="radioAll"> 全选</label>').withOption('sWidth','50px').renderWith(function (data,type,full) {
            //WAIT_AUDIT( 0, "待审核" ), AUDIT_OK( 1, "审核通过" ),AUDIT_REFUSE( 2, "审核未通过" ), CANNLE( 3, "已取消" )
            if(!full.customStatus){
                return '<label style="text-align:center"><input type="checkbox" data-value="'+full.customInfoId+'" class="radioList"></label>'
            }else{
                return '';
            }
        }).notSortable(),
        DTColumnBuilder.newColumn('managerName').withTitle('理财经理姓名').withOption('sWidth','120px').renderWith(function(data,type,full){
            if(!data){return '--'}
            return '<a class="js_manager_name" href="javascript:;" keyid="'+full.managerId+'" style="">'+data+'</a>';
        }).notSortable(),
        DTColumnBuilder.newColumn('customName').withTitle('定制产品名称').withOption('sWidth','120px').notSortable().renderWith(function(data,type,full){
            if(!data) return "";
            return '<span class="ui_ellipsis" title="' + data + '">' + data + '</span>';
        }),
        DTColumnBuilder.newColumn('customAmount').withTitle('定制金额(元)').withOption('sWidth','90px').notSortable().renderWith(function (data,type,full) {
            return tools.formatNumber(data);
        }),
        DTColumnBuilder.newColumn('customPeriodShowName').withTitle('定制期限').withOption('sWidth','90px').notSortable(),
        DTColumnBuilder.newColumn('customAnnaulRate').withTitle('收益率').withOption('sWidth','60px').renderWith(function(data,type,full){
            return data+' %';
        }).notSortable(),
        DTColumnBuilder.newColumn('customRate').withTitle('佣金比例').withOption('sWidth','60px').renderWith(function(data,type,full){
            return data+' %';
        }).notSortable(),
        DTColumnBuilder.newColumn('lenderName').withTitle('出借人姓名').withOption('sWidth','80px').renderWith(function(data,type,full){
            if(!data) return "";
            return '<a href="javascript:;" keyid="'+full.lenderId+'" class="js_consumer_name">'+data+'</a>';
        }).notSortable(),
        DTColumnBuilder.newColumn('applyTime').withTitle('申请时间').withOption('sWidth','130px').renderWith(function(data,type,full){
            if(!data) return "---";
            return tools.toJSDate(data);
        }).notSortable(),
        DTColumnBuilder.newColumn('auditTime').withTitle('审核时间').withOption('sWidth','130px').renderWith(function(data,type,full){
            if(!data) return "---";
            return tools.toJSDate(data);
        }).notSortable(),
        DTColumnBuilder.newColumn('customStatusStr').withTitle('状态').withOption('sWidth','80px').renderWith(function (data,type,full){
            //设置是否显示和审核不通过的悬浮窗
            if(full.customStatus==2){
                return '<a href="javascript:" class="checkEnterLink" style="position:relative;display:block;font-weight:600;">'+data+'<span class="checkEnterSpan" style="display: none;position: absolute;top: 12px;left: 42px;background: #fff;border: 1px solid #333333;width: 90px;padding: 2px;overflow:' +
                    ' hidden;line-height: 18px;">'+full.auditOpinion+'</span></a>';
            }else{
                return data;
            }
        }).notSortable(),
        DTColumnBuilder.newColumn('productName').withTitle('关联基础产品').withOption('sWidth','120px').renderWith(function(data,type,full){
            if(!data){return '--'}
            return '<a href="javascript:;" categoryid="'+full.productCategory+'" keyid="'+full.productId+'" class="js_productRelate_name" style="">'+full.productName+'</a>';
        }).notSortable()
    ];

    $scope.action={
        submitAudit:function () {
            //提交审核选中信息
            if(!submitCheckedInfo.length){
                tools.interalert('请选择列表提交审核');return;
            }
            //console.log(submitCheckedInfo);
            if(submitCheckedInfo.length){
                $scope.form.ids=submitCheckedInfo.join(',');
            }
            //弹窗
            var info = $scope.form.ids;
            //console.log(info);
            $modal.open({
                backdrop: true,
                backdropClick: true,
                dialogFade: false,
                keyboard: true,
                templateUrl: 'xinghuoCustomSubmit.html',
                controller: xinghuoCustomSubmit,
                resolve: {
                    "info": function() {
                        return info;
                    }
                }
            });
        },
        exportExcel:function () {
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + "/xinghuoproductcustom/exportApply.shtml",
                data: $scope.form,
                dataType: "text",
                success: function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    var blob = base64toBlob(data.data, 'application/csv;'), downloadUrl = URL.createObjectURL(blob), a = document.createElement("a"), now = new Date();
                    a.href = downloadUrl;
                    a.download = "私人订制" + now.getFullYear() + formateNum(now.getMonth() + 1) + formateNum(now.getDate()) + formateNum(now.getHours()) + formateNum(now.getMinutes()) + formateNum(now.getSeconds()) + ".csv";
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });
        }
    };

    function fnDrawCallback(){
        if(!tools.interceptor(window.ajaxDataInfo)) return;
        tools.resetWidth();
        //获取表头数据
        $scope.$apply(function(){
            $scope.tableinfo = window.ajaxDataInfo.info;
            //console.log(window.ajaxDataInfo.info);
            if(window.ajaxDataInfo.info){
                $scope.sumMoney=tools.formatNumber(window.ajaxDataInfo.info);
            }else{
                $scope.sumMoney=0;
            }
        });

        //导出表格
        $("#js_export").on("click", function(){
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
        /**
         * [查看产品信息]
         * @param  {object}   [description]
         * @return {[type]}   [description]
         */
        $("#dataTables").on("click", ".js_productRelate_name", function(){
            var bizSysRoute = $(this).attr("key_sys") == "null" ? 0 : $(this).attr("key_sys");
            var url = "/xinghuoproduct/productinfo.shtml";
            var data = {
                //"category":8,
                "category": $(this).attr("categoryid"),
                "productid": $(this).attr("keyid")
                //"productid":"300000318212384"
            };
            //console.log('看产品信息啦~~');return;
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


        //多选框的操作
        $('#dataTables_wrapper').on("click",".radioAll",function () {
            if($(this).is(':checked')){
                //防止先点选后全选重复
                submitCheckedInfo=[];
                $('#dataTables tbody .radioList').each(function (i) {
                    $(this).attr('checked','true');
                    submitCheckedInfo.push($(this).attr('data-value'));
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
                    submitCheckedInfo.push($(this).attr('data-value'));
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

    //审核弹窗控制器
    function xinghuoCustomSubmit($scope,info,$modalInstance) {
        $scope.info=info;
        $scope.select={};
        $scope.customAuthWindow=1;
        $('.customAuthWindow').eq('0').attr('checked','true');
        //审核提交弹窗拒绝
        $.ajax({
            type: "post",
            url: siteVar.serverUrl + '/xinghuopageapi/getRefuseOpinions.json',
            dataType: "json",
            success: function(data){
                tools.ajaxOpened(self);
                if(!tools.interceptor(data)) return;
                $scope.select.refuseOpinions=data.data.refuseOpinionArray;
                $scope.customOpinions=$scope.select.refuseOpinions[0];
                //console.log($scope.select.refuseOpinions[0])
                //console.log($scope.customOpinions);
                $scope.$apply();
            },
            error:function(err){
                tools.ajaxOpened(self);
                tools.ajaxError(err);
            }
        });

        $scope.close = function() {
            $modalInstance.close();
        };
        //提交
        $scope.customAuthConfirmBtn=function () {
            if($scope.customAuthWindow==2&&(!$scope.customOpinions)){
                tools.interalert('请选择审核未通过原因');
                $modalInstance.close();
                $('.radioAll').removeProp('checked');
                submitCheckedInfo=[];
                $('.radioList').each(function (i) {
                    $(this).removeProp('checked');
                });
                return false;
            }
            var customOpinions=$scope.customOpinions;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + '/xinghuoproductcustom/doAuditProductCustom.json',
                data: {'ids':info,'auditOkOrRefuse':$scope.customAuthWindow,'auditOpinion':customOpinions},
                dataType: "json",
                success: function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    tools.interalert(data.msg);
                    $modalInstance.close();
                    //tools.interalert('okay~');
                    $modalInstance.close();
                    vm.dtInstance.rerender();
                    console.log('render1');
                    //提交完清空全选框render页面
                    $('.radioAll').removeProp('checked');
                    submitCheckedInfo=[];
                    $('.radioList').each(function (i) {
                        $(this).removeProp('checked');
                        console.log(submitCheckedInfo);
                    });
                    vm.dtInstance.rerender();
                    console.log('render2');
                    $modalInstance.close();
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });

        };
    }
}