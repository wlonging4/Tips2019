'use strict';
function xinghuodataMonthController($scope,tools,DTOptionsBuilder, DTColumnBuilder) {
    $scope.isShow = true;
    $scope.action = {};
    $scope.form = {queryType:"yyyy-mm"};
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder
        .newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/xinghuodata/queryMonthTable.shtml',
            type: 'POST',
            data: $scope.form
        })
        .withDataProp('data')
        .withOption('searching',false)
        .withOption('ordering',false)
        .withOption('serverSide',true)
        .withOption('processing',false)
        .withLanguage(tools.dataTablesLanguage)
        .withOption('scrollX',true)
        .withOption('footerCallback',footerCallback)
        .withPaginationType('full_numbers');
    vm.dtColumns = [
        DTColumnBuilder.newColumn('dd').withTitle('数据日期').withOption('sWidth','80px').renderWith(function(data,type,full){
            if(!data) return "";
            return '<a href="#/xinghuodata-day.html?queryMonth='+data+'">'+data+'</a>'
        }),
        DTColumnBuilder.newColumn('allCount').withTitle('新增店铺数(总数)').withOption('sWidth','140px').renderWith(function(data,type,full){
            if(!data) return "0";
            return data;
        }),
        DTColumnBuilder.newColumn('fmallSum').withTitle('交易额(元)（总计）').withOption('sWidth','130px').renderWith(function(data,type,full){
            if(!data) return "0";
            return data;
        }),
        DTColumnBuilder.newColumn('dealSum').withTitle('交易笔数(总计)').withOption('sWidth','120px').renderWith(function(data,type,full){
            if(!data) return "0";
            return data;
        }),
        DTColumnBuilder.newColumn('fmavgdealNum').withTitle('每笔交易均值(元)').withOption('sWidth','140px').renderWith(function(data,type,full){
            if(!data) return "0";
            return data;
        }),
        DTColumnBuilder.newColumn('fmavgstoreNum').withTitle('每店交易均值(元)').withOption('sWidth','140px').renderWith(function(data,type,full){
            if(!data) return "0";
            return data;
        }),
        DTColumnBuilder.newColumn('fmavglenderCount').withTitle('每人交易均值(元)').withOption('sWidth','130px').renderWith(function(data,type,full){
            if(!data) return "0";
            return data;
        }),
        DTColumnBuilder.newColumn('xhzc').withTitle('星火注册用户').withOption('sWidth','120px').renderWith(function(data,type,full){
            if(!data) return "0";
            return data;
        }),
        DTColumnBuilder.newColumn('allzc').withTitle('所有注册用户').withOption('sWidth','120px').renderWith(function(data,type,full){
            if(!data) return "0";
            return data;
        }),
        DTColumnBuilder.newColumn('smrz').withTitle('实名认证用户数').withOption('sWidth','120px').renderWith(function(data,type,full){
            if(!data) return "0";
            return data;
        }),
        DTColumnBuilder.newColumn('bk').withTitle('绑定银行卡用户数').withOption('sWidth','120px').renderWith(function(data,type,full){
            if(!data) return "0";
            return data;
        }),
        DTColumnBuilder.newColumn('lenderCount').withTitle('交易人数').withOption('sWidth','80px').renderWith(function(data,type,full){
            if(!data) return "0";
            return data;
        })
    ];
    $scope.action = {
        search: function(){
            vm.dtInstance.rerender();
        },
        changeView: function(){
            $scope.isShow = ($scope.isShow)?false:true;
        },
        load : function(){
            chart();
        }
    };
    function footerCallback(row, data, start, end, display){
        if(!tools.interceptor(window.ajaxDataInfo)) return;
        var ajaxgetALL = window.ajaxDataInfo.info;
        if(!ajaxgetALL) return;
        var showArr = [ajaxgetALL.allCount, ajaxgetALL.fmallSum, ajaxgetALL.dealSum, null, null, null,
            ajaxgetALL.xhzc, ajaxgetALL.allzc, ajaxgetALL.smrz, ajaxgetALL.bk, ajaxgetALL.lenderCount];
        var str = '<tr role="row" class="ui_center" style="background-color: #cc0000; font-weight: 600;"><td style="border-color: #cc0000; color: #ffffff;">'+ajaxgetALL.dd+'</td>';
        for(var i in showArr){
            if(!showArr[i]){
                str += '<td class="sorting_disabled" rowspan="1" colspan="1" style="border-color: #cc0000; color: #ffffff;"></td>'
            }else{
                str += '<td class="sorting_disabled" rowspan="1" colspan="1" style="border-color: #cc0000; color: #ffffff;">'+showArr[i]+'</td>';
            }
        }
        str += "</tr>";
        $("thead.js_add_table_head").remove();
        $("<thead>",{"class":"js_add_table_head"}).html(str).insertBefore( $("#dataTables_wrapper thead") );
    }
    function chart(){
        var option1 = {
            title: {
                text: '总计',
                textStyle: {
                    fontFamily: "Microsoft Yahei",
                    fontWeight: 100
                }
            },
            tooltip : {
                trigger: 'axis'
            },
            legend: {
                data: ["总笔数", "总金额"]
            },
            toolbox: {
                show : true,
                feature : {
                    restore : {show: true},
                    saveAsImage : {show: true}
                }
            },
            calculable : true,
            xAxis : [
                {
                    type : 'category',
                    data : ['2014-07','2014-08','2014-09','2014-10','2014-11','2014-12','2015-01','2015-02','2015-03','2015-04','2015-05','2015-06']
                }
            ],
            yAxis : [
                {
                    type:'value',
                    name:'总金额',
                    nameTextStyle: {
                        fontFamily: "Microsoft Yahei",
                        fontWeight: 100,
                        color: ""
                    }
                },
                {
                    type:'value',
                    name:'总笔数',
                    nameTextStyle: {
                        fontFamily: "Microsoft Yahei",
                        fontWeight: 100,
                        color: "#ff5500"
                    }
                }
            ],
            series : [
                {
                    name: '总笔数',
                    type:'bar',
                    yAxisIndex: 1,
                    barWidth: "28",
                    itemStyle: {
                        normal: {
                            label : {
                                color: "#ff5500",
                                show: true
                            }
                        }
                    },
                    data: [0,324,481,352,271,107,271,48,296,459,581,589]
                },
                {
                    name: '总金额',
                    type: 'line',
                    itemStyle: {
                        normal: {
                            label : {
                                show: true
                            }
                        }
                    },
                    data: [0.0,140928.0,1859474.0,233303.0,259958.0,72504.0,1.6301159E7,29702.0,2757780.0,1.06387841E8,1.34026019E8,9.3930209E7]
                }
            ]
        };
        var option2 = {
            title: {
                text: '逐月趋势数据统计',
                textStyle: {
                    fontFamily: "Microsoft Yahei",
                    fontWeight: 100
                }
            },
            tooltip : {
                trigger: 'axis'
            },
            legend: {
                selected: {
                    "有交易店铺数": false,
                    "认证数": false,
                    "绑卡数": false
                },
                data:["注册数", "交易人数", "店铺数", "认证数", "绑卡数", "有交易店铺数"]
            },
            toolbox: {
                show : true,
                feature : {
                    restore : {show: true},
                    saveAsImage : {show: true}
                }
            },
            calculable : true,
            xAxis : [
                {
                    type : 'category',
                    data : ['2014-07','2014-08','2014-09','2014-10','2014-11','2014-12','2015-01','2015-02','2015-03','2015-04','2015-05','2015-06']
                }
            ],
            yAxis : [
                {
                    type : 'value',
                    min: 0
                }
            ],
            series : [
                {
                    name: '注册数',
                    type:'line',
                    itemStyle: {
                        normal: {
                            label : {
                                show: true
                            }
                        }
                    },
                    data: [0,198,182,135,245,106,472,209,534,962,1100,893]

                },
                {
                    name: '交易人数',
                    type:'line',
                    itemStyle: {
                        normal: {
                            label : {
                                show: true
                            }
                        }
                    },
                    data: [0,64,54,67,77,27,79,20,75,124,132,120]

                },
                {
                    name: '店铺数',
                    type:'line',
                    itemStyle: {
                        normal: {
                            label : {
                                show: true
                            }
                        }
                    },
                    data: [0,24,76,35,28,18,158,50,201,263,386,381]

                },
                {
                    name: '认证数',
                    type:'line',
                    itemStyle: {
                        normal: {
                            label : {
                                show: true
                            }
                        }
                    },
                    data: [1,71,108,110,135,73,308,104,230,256,569,460]

                },
                {
                    name: '绑卡数',
                    type:'line',
                    itemStyle: {
                        normal: {
                            label : {
                                show: true
                            }
                        }
                    },
                    data: [0,2,2,3,10,36,91,38,136,154,259,180]

                },
                {
                    name: '有交易店铺数',
                    type:'line',
                    itemStyle: {
                        normal: {
                            label : {
                                show: true
                            }
                        }
                    },
                    data: [0,16,40,51,53,26,63,16,65,83,101,106]
                }

            ]
        };
        var myChart2 = echarts.init($("#multi-chart2")[0]);
        var myChart3 = echarts.init($("#multi-chart3")[0]);
        $.ajax({
            type: "post",
            url: siteVar.serverUrl + "/xinghuodata/queryMonthCharts.shtml",
            data: {},
            dataType: "json",
            success: function(data){
                if(!tools.interceptor(data)) return;
                if(data.success){
                    option1.xAxis[0].data = data.data.types.split(",");
                    option1.series[0].data = data.data.dealNum.split(",");
                    option1.series[1].data = data.data.amount.split(",");

                    option2.xAxis[0].data = data.data.types.split(",");
                    option2.series[0].data = data.data.registers.split(",");
                    option2.series[1].data = data.data.lenders.split(",");
                    option2.series[2].data = data.data.allstores.split(",");
                    option2.series[3].data = data.data.realnames.split(",");
                    option2.series[4].data = data.data.bindcards.split(",");
                    option2.series[5].data = data.data.hasDealStores.split(",");

                    myChart2.setOption(option1);
                    myChart3.setOption(option2);
                }
            },
            error: function(err){
            }
        });
    }
    (function(){
        /**
         * [导出月统计]
         * @param  {[type]}   [description]
         * @param  {[type]}   [description]
         * @return {[type]}   [description]
         */
        $("body").on("click",'#js_data_month_export', function(){
            tools.export(this);
        });
    })();
}