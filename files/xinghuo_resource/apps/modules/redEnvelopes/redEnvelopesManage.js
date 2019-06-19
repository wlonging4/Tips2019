'use strict';
function redEnvelopesManage($scope,$modal,tools,DTOptionsBuilder, DTColumnBuilder) {
    var domForm = $("#js_form"), conditionItem = domForm.find(".form-group");
    $scope.form={};
    $scope.timeEff1='';
    $scope.select = {};
    $scope.action = {};
    $scope.fnSet={
        formatDateTime: function (date) {
            var y = date.getFullYear();
            var m = date.getMonth() + 1;
            m = m < 10 ? ('0' + m) : m;
            var d = date.getDate();
            d = d < 10 ? ('0' + d) : d;
            var h = date.getHours();
            h=h < 10 ? ('0' + h) : h;
            var minute = date.getMinutes();
            minute = minute < 10 ? ('0' + minute) : minute;
            var second=date.getSeconds();
            second=second < 10 ? ('0' + second) : second;
            return y + '-' + m + '-' + d+' '+h+':'+minute+':'+second;
        },
        formatStamp:function(timestamp) {
            var date = new Date(Number(timestamp)),
                Y = date.getFullYear() + '-',
                M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-',
                D = (date.getDate() < 10 ? '0'+(date.getDate()) : date.getDate()) + ' ',
                h = (date.getHours() < 10 ? '0'+(date.getHours()) : date.getHours()) + ':',
                m = (date.getMinutes() < 10 ? '0'+(date.getMinutes()) : date.getMinutes()) + ':',
                s = (date.getSeconds() < 10 ? '0'+(date.getSeconds()) : date.getSeconds());
            return Y+M+D+h+m+s;
        }
    };
    //$scope.form.createTimeBegin='2018-01-01 00:00:00';
    //$scope.form.createTimeEnd=$scope.fnSet.formatDateTime(new Date());

    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder
        .newOptions().withOption('ajax',{
            //url: siteVar.serverUrl + '/xinghuohuodong/tableRed.shtml',
            url: siteVar.serverUrl + '/xinghuoRedPacketTemplate/page.json',
            type: 'POST',
            data: $scope.form
        })
        .withDataProp('data')
        .withOption('createdRow', function(row, data, dataIndex) {
            angular.element(row).addClass("rows" + data.id)
        })
        .withOption('searching',false)
        .withOption('ordering',false)
        .withOption('serverSide',true)
        .withOption('processing',false)
        .withOption('scrollX',true)
        .withLanguage(tools.dataTablesLanguage)
        .withOption('fnDrawCallback', fnDrawCallback)
        .withOption('createdRow', function(row, data, dataIndex) {
            angular.element(row).addClass("test"+data.id)
        })
        .withPaginationType('full_numbers');

    /*定义的动态表格各列*/
    vm.dtColumns = [
        DTColumnBuilder.newColumn('redName').withTitle('<p style="text-align: center">红包名称</p>').withOption('sWidth','140px').renderWith(function(data,type,full){
            return '<a href="javascript:;" style="text-align:left" class="redDetail ui_ellipsis" data-id="'+full.id+'">'+data+'</a>';
        }),
        DTColumnBuilder.newColumn('redAmount').withTitle('<p style="text-align: center">红包金额(元)</p>').withOption('sWidth','85px').renderWith(function(data,type,full){
            return data?tools.formatNumber(data):'noData';
        }),
        DTColumnBuilder.newColumn('effectiveType').withTitle('<p style="text-align: center">有效期</p>').withOption('sWidth','300px').renderWith(function(data,type,full){
            return (data&&data===1)?$scope.fnSet.formatStamp(full.effectiveStartTime)+' 至 '+$scope.fnSet.formatStamp(full.effectiveEndTime):'进入账户后 '+full.effectiveDays+' 天内有效';
        }),
        DTColumnBuilder.newColumn('fullCutAmount').withTitle('<p style="text-align: center">使用条件</p>').withOption('sWidth','140px').renderWith(function(data,type,full){
            if(data&&Number(data)!=-1) {return "满 "+tools.formatNumber(data)+" 元可使用";}else{return "不限";}
        }),
        DTColumnBuilder.newColumn('status').withTitle('<p style="text-align: center">是否已关联活动</p>').withOption('sWidth','60px').renderWith(function (data,type,full) {
            return (data===2)?'是':'否'
        }),
        DTColumnBuilder.newColumn('').withTitle('<p style="text-align: center">已关联活动名称</p>').withOption('sWidth','145px').renderWith(function (data,type,full) {
            return "<span class='ui_ellipsis'>"+(full.status===2)?(full.activityName?full.activityName:'---'):'暂未关联任何活动'+"</span>";
        }),
        DTColumnBuilder.newColumn('createTime').withTitle('<p style="text-align: center">创建日期</p>').withOption('sWidth','145px').renderWith(function(data,type,full){
            return data?$scope.fnSet.formatStamp(data):"noData"
        }),
        DTColumnBuilder.newColumn('id').withTitle('<p style="text-align: center">操作</p>').withOption('sWidth','60px').renderWith(function(data,type,full){
            return '<div class="col-lg-12 col-xs-12 ui_center" style="text-align: center"><a href="#/redEnvelopesCreate.html?id='+data+'&" class="ui_center btn btn-primary btn-xs">编辑</a></div>';
        })
    ];

    $scope.action = {
        reset: function(){
            for(var prop in $scope.form){
                if(prop !== 'isShow') delete $scope.form[prop];
            }
            vm.dtInstance.rerender();
        },
        search: function(){
            if(Date.parse($scope.form.createTimeEnd)-Date.parse($scope.form.createTimeBegin)<0){
                tools.interalert('创建结束时间必须大于起始日期！');return
            }
            if(Date.parse($scope.form.effectiveTimeEnd)-Date.parse($scope.form.effectiveTimeBegin)<0){
                tools.interalert('有效期结束时间必须大于起始日期！');return
            }
            vm.dtInstance.rerender();
        }
    }
    //导出表格
    $("#js_export").on("click", function(){
        tools.export(this);
    });

    function fnDrawCallback(){
        if(!tools.interceptor(window.ajaxDataInfo)) return;
        tools.createModal();
        tools.createModalProgress();

        /**
         * [查看红包详情]
         * @param  {[type]}     [description]
         * @return {[type]}     [description]
         */
        $("#dataTables tbody").off('click').on("click", ".redDetail", function(){
            var data ={"id": $(this).attr("data-id")};
            var self = $(this);
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + "/xinghuoRedPacketTemplate/get.json",
                data: data,
                dataType: "json",
                success: function(data){
                    tools.ajaxOpened(self);
                    if(1) {
                        var info = $.extend({}, data.data);
                        $modal.open({
                            backdrop: true,
                            backdropClick: true,
                            dialogFade: false,
                            keyboard: true,
                            templateUrl: 'redDetailModal.html',
                            controller: redDetailModalCtrl,
                            resolve: {
                                "info": function() {
                                    return info;
                                }
                            }
                        });
                    } else {
                        alert(data.msg);
                    }
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });

        });
    }

    //详情
    function redDetailModalCtrl($scope,info,$modalInstance) {
        $scope.info=info;
        info.fnSet=function(timestamp) {
            var date = new Date(Number(timestamp)),
                Y = date.getFullYear() + '-',
                M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-',
                D = (date.getDate() < 10 ? '0'+(date.getDate()) : date.getDate()) + ' ',
                h = (date.getHours() < 10 ? '0'+(date.getHours()) : date.getHours()) + ':',
                m = (date.getMinutes() < 10 ? '0'+(date.getMinutes()) : date.getMinutes()) + ':',
                s = (date.getSeconds() < 10 ? '0'+(date.getSeconds()) : date.getSeconds());
            return Y+M+D+h+m+s;
        };
        info.redCount1=tools.formatNumber(info.redCount||0);
        info.redAmount1=tools.formatNumber(info.redAmount||0);
        info.redMoneySum1=tools.formatNumber((info.redAmount*info.redCount)||0);
        info.upperMoney1=tools.toChineseCharacters(info.redAmount*info.redCount);
        info.effectiveInfo=(info.effectiveType==2)?'进入出借人账号后 '+info.effectiveDays+' (天)内有效':info.fnSet(info.effectiveStartTime)+' ~  '+info.fnSet(info.effectiveEndTime);
        info.proListSum=(info.productList)?info.productList.length+'个':(info.applyProductFlag==2)?'不限产品':'0个';
        info.fullCutInfo=(info.fullCutAmount&&info.fullCutAmount>0)?'满 <span class="red">'+tools.formatNumber(info.fullCutAmount)+'</span> (元)可使用':'不限';
        $scope.close = function() {
            $modalInstance.close();
        };
        info.createTime=info.fnSet(info.createTime);
        info.usableAmount=tools.formatNumber(info.usableAmount||0);
        info.usableCount=tools.formatNumber(info.usableCount||0);
        info.useAmount=tools.formatNumber(info.useAmount||0);
        info.useCount=tools.formatNumber(info.useCount||0);
    }

    (function(){
        $("[ui-view]").append("<style>table.dataTable,table.dataTable.no-footer {width: 100% !important;}</style>");
    })();
}