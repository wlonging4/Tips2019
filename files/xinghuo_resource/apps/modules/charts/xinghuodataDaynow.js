'use strict';
function xinghuodataHourController($scope,tools) {
    $scope.action = {
        load : function(){
            chart();
        }
    };
    function chart(){
        var option = {
            title: {
                text: '当天实时数量',
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
                    "七日内平均": false
                },
                data: ["当天数量", "上周同期", "七日内平均"]
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
                    data : ['注册','认证','绑卡','交易人数','有交易理财经理','交易笔数','交易额','理财经理注册']
                }
            ],
            yAxis : [
                {
                    type : 'value'
                }
            ],
            series : [
                {
                    name: '当天数量',
                    type:'bar',
                    barWidth: "18",
                    itemStyle: {
                        normal: {
                            label : {
                                show: true
                            }
                        }
                    },
                    data: [5034.0,2739.0,913.0,676.0,1335.0,396.0,3775.0,35599.6591]
                },
                {
                    name: '上周同期',
                    type:'bar',
                    barWidth: "18",
                    itemStyle: {
                        normal: {
                            label : {
                                show: true
                            }
                        }
                    },
                    data: [5034.0,2739.0,913.0,676.0,1335.0,396.0,3775.0,35599.6591]
                },
                {
                    name: '七日内平均',
                    type:'bar',
                    barWidth: "18",
                    itemStyle: {
                        normal: {
                            label : {
                                show: true
                            }
                        }
                    },
                    data: [5034.0,2739.0,913.0,676.0,1335.0,396.0,3775.0,35599.6591]
                }
            ]
        };
        var myChart = echarts.init($("#multi-chart9")[0]);
        $.ajax({
            type: "post",
            url: siteVar.serverUrl + "/xinghuodata/queryDayNowCharts.shtml",
            data: {},
            dataType: "json",
            success: function(data){
                if(!tools.interceptor(data)) return;
                if(data.success){
                    option.xAxis[0].data = data.data.types.split(",");
                    option.series[0].data = tools.chartNumFormat(data.data.todays.split(","));
                    option.series[1].data = tools.chartNumFormat(data.data.preWeekToday.split(","));
                    option.series[2].data = data.data.sevendaysAvg.split(",");
                    myChart.setOption(option);
                }
            },
            error: function(err){
            }
        });
    }
}