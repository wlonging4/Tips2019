'use strict';
function tradeSheet($scope, $modal,$location, tools, DTOptionsBuilder, DTColumnBuilder, getSelectListFactory) {
    var params = tools.queryUrl(location.href);
    var form = $("#js_form"), conditionItem = form.find(".form-group");
    $scope.form = {
        isShow: (conditionItem.length > 0) ? true : false
    };


    $scope.action = {};
    $scope.dealStatus=[];
    $scope.tradeStatus=[];
    $scope.isResetFresh=0;
    getSelectListFactory.getSelectList(['category', 'deal_status','sesametradestatus']).then(function (res) {
        $scope.categoryList = res.data[0].category;
        var dealStatusList = res.data[1].deal_status;
        var tradeStatusList=res.data[2].sesametradestatus;

        for(var i=0;i<dealStatusList.length;i++)
        {
            $scope.dealStatus[i]={
                "text":dealStatusList[i].value,
                "value":dealStatusList[i].key,
                "default":false
            }
        }
        for(var i=0;i<tradeStatusList.length;i++)
        {
            $scope.tradeStatus[i]={
                "text":tradeStatusList[i].value,
                "value":tradeStatusList[i].key,
                "default":false
            }
        }
        $('#multi_select').multiSel({
            'data':$scope.dealStatus
        });
        if(!$.isEmptyObject(params)){
            $scope.categoryList.forEach(function (item,index) {
                if(item.key==params.category){
                    item.selected=true;
                }else{
                    item.selected=false;
                }
            });
            $scope.form.userId=params.userId;
            if(params.status){
                var pStatusList=params.status.split(",");
                pStatusList.forEach(function (item,index) {
                    $("#multi_select").find(".multiSel_unit[value='"+item+"']").trigger("click");
                })
            }

        }
    });

    //解析跳转过来的页面
    if($location.url().indexOf("?") > -1){
        console.log(params);
        $scope.form.lenderId=params.lenderId;
        $scope.form.investStartTime=$scope.form.investEndTime=params.createTime.split('%')[0];
    }
    ;(function () {
        if(params.createTime){
            $scope.form.investStartTime=$scope.form.investEndTime=params.createTime.split('%')[0];
            return false;
        }
        var now = new Date(), nowDate = tools.toJSYMD(now.getTime());
        $scope.form.investStartTime = nowDate;
        $scope.form.investEndTime = nowDate;
        //因为下面查询 走的dom
        form.find("input[name='investStartTime']").val(nowDate);
        form.find("input[name='investEndTime']").val(nowDate);
    })();

    /*
 创建表格选项

 */
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax', {
        url: siteVar.serverUrl + "deal/queryDealList.json",
        type: 'POST',
        data: function (d) {
            if(!$.isEmptyObject(params)){
                var data=jQuery.extend(d, tools.getFormele({}, form));
                data.category=params.category;
                data.userId=params.userId;
                data.p_status=params.status;
                data.investStartTime=$scope.form.investStartTime;
                data.investEndTime=$scope.form.investEndTime;
                if(!$scope.isResetFresh){
                    data.lenderId=params.lenderId;
                }else{
                    delete data.lenderId;
                    $scope.isResetFresh=0;
                }
                return data;
            }
            else{
                return jQuery.extend(d, tools.getFormele({}, form));
            }
        }
    })
        .withDataProp('data')
        .withOption('createdRow', function (row, data, dataIndex) {
            angular.element(row).addClass("rows" + data.id)
        })
        .withOption('searching', false)
        .withOption('ordering', false)
        .withOption('serverSide', true)
        .withOption('processing', false)
        .withOption('scrollX', false)
        .withLanguage(tools.dataTablesLanguage)
        .withOption('fnDrawCallback', fnDrawCallback)
        .withPaginationType('simple_numbers');
    vm.dtColumns = [
        //DTColumnBuilder.newColumn('id').withTitle("<label><input type='checkbox' id='whiteListChooseAll'>全选</label>").withOption('sWidth', '60px').renderWith(function(data, type, full) {
        //    return '<div class="ui_center"><label class="checkbox-inline"><input type="checkbox" class="whiteListCheckbox" value="' + data + '"></label></div>';
        //}),
        DTColumnBuilder.newColumn('lenderName').withTitle('客户姓名').withOption('sWidth', '80px'),
        DTColumnBuilder.newColumn('accbalance').withTitle('存管余额（元）').withOption('sWidth', '70').renderWith(function (data) {
            return data?tools.formatNumber(data):'---';
        }),
        DTColumnBuilder.newColumn('productName').withTitle('产品名称').withOption('sWidth', '150px'),
        DTColumnBuilder.newColumn('amount').withTitle('认购金额（元）').withOption('sWidth', '70px'),
        DTColumnBuilder.newColumn('revenue').withTitle('收益金额（元）').withOption('sWidth', '60px'),
        DTColumnBuilder.newColumn('annualRate').withTitle('预计年化收益率').withOption('sWidth', '100px'),
        DTColumnBuilder.newColumn('statusName').withTitle('交易状态').withOption('sWidth', '60px'),
        DTColumnBuilder.newColumn('investTime').withTitle('出借/投资时间').withOption('sWidth', '140px').renderWith(function (data) {
            return toFullDate(data);
        }),
        DTColumnBuilder.newColumn('days').withTitle('出借/投资期限').withOption('sWidth', '140px'),
        DTColumnBuilder.newColumn('caEndDate').withTitle('到期日').withOption('sWidth', '70px').renderWith(function (data){
            return toFullDay(data);
        }),
        DTColumnBuilder.newColumn('category').withTitle('产品类别').withOption('sWidth', '60px').renderWith(function (data, type, full) {
            return data == 1 ? "P2P" : "类固收";
        }),
        DTColumnBuilder.newColumn('redpaperAmount').withTitle('红包金额（元）').withOption('sWidth', '100px'),
        DTColumnBuilder.newColumn('canCash').withTitle('是否支持返现').withOption('sWidth', '100px').renderWith(function (data) {
            return data ? '是' : '否';
        }),
        DTColumnBuilder.newColumn('walletAccountStatus').withTitle('是否开通星火钱包').withOption('sWidth', '120px').renderWith(function (data) {
            return data ? '是' : '否';
        }),
        DTColumnBuilder.newColumn('riskLevel').withTitle('风险评测').withOption('sWidth', '70px').renderWith(function (data, type, full) {
            return '<a href="javascript:void(0)" class="riskEvaluation" >' + data + '</a>';
        }),
        DTColumnBuilder.newColumn('userName').withTitle('理财经理姓名').withOption('sWidth', '90px'),
        DTColumnBuilder.newColumn('userMobile').withTitle('联系电话').withOption('sWidth', '80px'),
        DTColumnBuilder.newColumn('userId').withTitle('理财经理ID').withOption('sWidth', '90px').renderWith(function (data) {
            if(!data) return "";
            return '<a href="#/managerDetail.html?financialId=' + data + '" target="_blank">' + data + '</a>';
        }),
        DTColumnBuilder.newColumn('isContact').withTitle('是否联系').withOption('sWidth', '70px').renderWith(function (data, type, full) {
            return data ? '<span>是</span><a class="ifContact" data-id="' + full.dealNo + '" data-isContact="1" data-remark="' + full.contactRemark + '"><i class="fa fa-pencil"></a>' : '<span>否</span><a class="ifContact" data-id="' + full.dealNo + '" data-isContact="0" data-remark="' + full.contactRemark + '"><i class="fa fa-pencil"></a>';
        })
    ];


    $scope.action.reset = function () {
        var selectAll=$(".select_all").parents(".checked");
        selectAll.attr("class",false);
        selectAll.trigger("click");
        $('input[name="p_status"]').val("");
        $("#multi_select").find("[readonly]").val("");
        $("#multi_select").find(".multiSel_unit").prop("checked",false);
        $.uniform.update($("#multi_select").find(".multiSel_unit"));
        for (var prop in $scope.form) {
            if (prop !== 'isShow') delete $scope.form[prop];
        };
        var now = new Date(), nowDate = tools.toJSYMD(now.getTime());
        $scope.form.investStartTime = nowDate;
        $scope.form.investEndTime = nowDate;
        form.find("input[name='investStartTime']").val(nowDate);
        form.find("input[name='investEndTime']").val(nowDate);
        $scope.isResetFresh=1;
        vm.dtInstance.rerender();
    };
    $scope.action.search = function () {
        $scope.form.p_status= $('input[name="p_status"]').val();
        vm.dtInstance.rerender();
    };
    $scope.action.changeSelect=function (event) {
        if($scope.form.category==1){
            $('#multi_select').remove();
            $('.multiSelect').append('<div id="multi_select" selectstatus="" style="position:relative;"></div>');
            $('#multi_select').multiSel({
                'data':$scope.dealStatus
            });
        }
        else if($scope.form.category==2){
            $('#multi_select').remove();
            $('.multiSelect').append('<div id="multi_select" selectstatus="" style="position:relative;"></div>');
            $('#multi_select').multiSel({
                'data':$scope.tradeStatus
            });
        }
    }
    var riskEvaluationCtrl = function ($scope, tools, $modalInstance, form, select) {
        $scope.form = form || {};
        $scope.select = select || {};
        $scope.close = function () {
            $modalInstance.close();
        }
        $scope.msg=form.riskEvaluation;
    }

    function fnDrawCallback(data) {

        $(".ui_red").text(data.json.info.totalAmount);
        var msg=data.json.info.risk;
        $scope.$apply(function () {
            $scope.recordsTotal = data.json.recordsTotal;
            $scope.totalMoney = data.json.totalMoney;
        });
        var table = $("#dataTables"), tbody = table.find("tbody");
        table.off("click").on("click", ".riskEvaluation", function () {
            $scope.form.riskEvaluation = $(this).attr("data-risk");
            $modal.open({
                backdrop: true,
                backdropClick: true,
                dialogFade: false,
                keyboard: true,
                templateUrl: 'riskEvaluation.html',
                controller: function ($scope, tools, $modalInstance, form, select) {
                    $scope.form = form || {};
                    $scope.select = select || {};
                    $scope.close = function () {
                        $modalInstance.close();
                    }
                    $scope.msg=msg;
                },
                windowClass: 'modal-640',
                resolve: {
                    "form": function () {
                        return $scope.form;
                    },
                    "select": function () {
                        return $scope.select;
                    }
                }
            });
        });
        table.on("click", ".ifContact", function (event) {
            var dealNo = $(this).attr("data-id");
            var isContact = $(this).attr("data-isContact");
            var contactRemark = $(this).attr("data-remark");
            $modal.open({
                backdrop: true,
                backdropClick: true,
                dialogFade: false,
                keyboard: true,
                templateUrl: 'ifContact.html',
                controller: function ($scope, tools, $modalInstance, form, select) {
                    $scope.form = form || {};
                    $scope.select = select || {};
                    $scope.close = function () {
                        $modalInstance.close();
                    }
                    $scope.dealNo = dealNo;
                    $scope.contactRemark = contactRemark;
                    $scope.isContact = isContact;
                    $scope.submitRemark = function () {
                        var param = {
                            "dealNo": $scope.dealNo,
                            "isContact": $scope.isContact,
                            "contactRemark": $scope.contactRemark
                        }
                        console.log(param);
                        $.ajax({
                            url: siteVar.serverUrl + "deal/saveRemark.json",
                            type: "POST",
                            data: param,
                            success: function (data) {
                                if (data.success) {
                                    alert("保存成功");
                                    $scope.close();
                                    vm.dtInstance.rerender();
                                } else {
                                    alert("保存失败");
                                }
                            }
                        });
                    }
                },
                windowClass: 'modal-640',
                resolve: {
                    "form": function () {
                        return $scope.form;
                    },
                    "select": function () {
                        return $scope.select;
                    }
                }
            });
        });


    }

    function toFullDate(n) {
        if (!n) return "";
        let D = new Date(n),
            date = [
                D.getFullYear(),
                formatNum(D.getMonth() + 1),
                formatNum(D.getDate())
            ],
            time = D.toTimeString().split(" ")[0];
        return date.join("-") + " " + time;
    }
    function toFullDay(n) {
        if (!n) return "";
        let D = new Date(n),
            date = [
                D.getFullYear(),
                formatNum(D.getMonth() + 1),
                formatNum(D.getDate())
            ]
        return date.join("-");
    }

    function formatNum(num) {
        return num < 10 ? "0" + num : "" + num;
    }

}