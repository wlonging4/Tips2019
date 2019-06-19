'use strict';
function walletAccount($scope, $modal, tools, DTOptionsBuilder, DTColumnBuilder) {
    var domForm = $("#js_form"), conditionItem = domForm.find(".form-group");
    $scope.form = {
        isShow: (conditionItem.length > 6) ? true : false
    };
    $scope.select = {};
    $scope.action = {};
    /*
     *表格
     */
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax',{
        url: siteVar.serverUrl + '/xinghuowallet/tableOpenAccount.shtml',
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
        .withPaginationType('simple_numbers');
    vm.dtColumns = [
        DTColumnBuilder.newColumn('userName').withTitle('用户姓名').withOption('sWidth','80px').renderWith(function(data,type,full){
            if(!data) return "";
            return '<a href="javascript:void(0);" data-href="/xinghuowallet/openAccountDetail.shtml?userid='+full.userid+'" class="js-walletDetail">'+data+'</a>';
        }),
        DTColumnBuilder.newColumn('total').withTitle('钱包持有额(元）').withOption('sWidth','140px').renderWith(function(data, type, full) {
            if(!data) return 0;
            return tools.formatNumber(data);
        }),
        DTColumnBuilder.newColumn('totalincome').withTitle('累计收益').withOption('sWidth','140px').renderWith(function(data, type, full) {
            if(!data) return 0;
            return tools.formatNumber(data);
        }),
        DTColumnBuilder.newColumn('accountstatus').withTitle('开户状态').withOption('sWidth', '90px').renderWith(function(data, type, full) {
            return data == 1 ? '开户成功' : '开户失败';
        }),
        DTColumnBuilder.newColumn('createtime').withTitle('开户时间').withOption('sWidth', '150px').renderWith(function(data, type, full) {
            if(!data) return "";
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('terminalName').withTitle('开户渠道').withOption('sWidth','100px'),
        DTColumnBuilder.newColumn('id').withTitle('查看明细').withOption('sWidth','100px').renderWith(function(data,type,full){
            if(!data) return "";
            return '<a href="#/wallet-detail.html?userid='+full.userid+'"> 查看 </a>';
        })
    ];
    //重置
    $scope.action.reset = function(){
        for(var prop in $scope.form){
            if(prop !== 'isShow') delete $scope.form[prop];
        }
        vm.dtInstance.rerender();
    };
    //查询
    $scope.action.search = function(){
        vm.dtInstance.rerender();
    };
    //开户详情
    function walletAccountCtrl($scope,tools, info,$modalInstance){
        $scope.info = info;
        $scope.info.createtime=tools.toJSDate(info.createtime);
        $scope.info.overduetime=tools.toJSDate(info.overduetime);
        $scope.info.risktime=tools.toJSDate(info.risktime);
        $scope.info.mobileNum =info.mobileNum ? info.mobileNum.substr(0,3)+"****"+info.mobileNum.substr(7,4):'';
        var len=info.accountNo?info.accountNo.length:0;
        var xing='';
        for(var i= 0;i<len-8;i++){
            xing=xing+'*'
        }
        $scope.info.accountNo = info.accountNo?info.accountNo.substr(0,4)+xing+info.accountNo.substr(len-4):"";
        //取消
        $scope.close = function() {
            $modalInstance.close();
        };
    }

    function fnDrawCallback(data){
        if(!tools.interceptor(window.ajaxDataInfo)) return;
        //导出
        $(".js_export").on("click", function(){
            tools.export(this);
        });
        //钱包持有份额
        $scope.$apply(function(){
            $scope.firstSumTotal = tools.formatNumber((data.json.info && data.json.info.firstSumTotal) || 0);
            $scope.secondSumTotal = tools.formatNumber((data.json.info && data.json.info.secondSumTotal) || 0)
        });
        /*开户详情*/
        var table = $("#dataTables"), tbody = table.find("tbody");
        $('.js-walletDetail',tbody).off('click').on('click',function(){
            var self = $(this), href = self.attr("data-href"), data, url;
            data = tools.queryUrl(href);
            url = href.split('?')[0];
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + url,
                data: data,
                dataType: "json",
                success: function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    if(data.success){
                        $modal.open({
                            backdrop: true,
                            backdropClick: true,
                            dialogFade: false,
                            keyboard: true,
                            templateUrl : 'walletAccountTemplate.html',
                            controller : walletAccountCtrl,
                            resolve:{
                                "info" : function(){
                                    return data.data;
                                }
                            }
                        });
                    }else{
                        alert(data.msg);
                    }

                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            })
        });


    }
}
