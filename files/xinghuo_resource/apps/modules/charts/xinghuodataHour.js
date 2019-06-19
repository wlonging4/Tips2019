'use strict';
function xinghuodataHourController($scope,tools,$location,DTOptionsBuilder, DTColumnBuilder) {
    $scope.isShow = true;
    $scope.action = {};
    $scope.form = {
        querydate : tools.toJSDate(new Date().getTime()).split(" ")[0]
    };
    var urlStr = $location.url().split("?")[1];
    if(urlStr) {
        $.extend($scope.form,tools.serializeUrl(urlStr));
        if(urlStr.querydate) {
            $scope.form.querydate = urlStr.querydate;
        }
    }
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder
        .newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/xinghuodata/queryHourTable.shtml',
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
        DTColumnBuilder.newColumn('dd').withTitle('数据时间').withOption('sWidth','80px').renderWith(function(data,type,full){
            if(!data) return "0";
            return data;
        }),
        DTColumnBuilder.newColumn('dl').withTitle('所有注册用户数').withOption('sWidth','110px').renderWith(function(data,type,full){
            if(!data) return "0";
            return data;
        }),
        DTColumnBuilder.newColumn('xhzc').withTitle('星火注册用户数').withOption('sWidth','110px').renderWith(function(data,type,full){
            if(!data) return "0";
            return data;
        }),
        DTColumnBuilder.newColumn('xhrz').withTitle('星火认证用户数').withOption('sWidth','110px').renderWith(function(data,type,full){
            if(!data) return "0";
            return data;
        }),
        DTColumnBuilder.newColumn('xhbk').withTitle('星火绑定银行卡数').withOption('sWidth','120px').renderWith(function(data,type,full){
            if(!data) return "0";
            return data;
        }),
        DTColumnBuilder.newColumn('alldeal').withTitle('交易用户数（汇总）').withOption('sWidth','130px').renderWith(function(data,type,full){
            if(!data) return "0";
            return data;
        }),
        DTColumnBuilder.newColumn('xhdeal').withTitle('交易用户数（星火）').withOption('sWidth','130px').renderWith(function(data,type,full){
            if(!data) return "0";
            return data;
        }),
        DTColumnBuilder.newColumn('tmdeal').withTitle('交易用户数（投米）').withOption('sWidth','130px').renderWith(function(data,type,full){
            if(!data) return "0";
            return data;
        }),
        DTColumnBuilder.newColumn('fmamount').withTitle('交易金额（汇总）').withOption('sWidth','120px').renderWith(function(data,type,full){
            if(!data) return "0";
            return data;
        }),
        DTColumnBuilder.newColumn('fmxhamount').withTitle('交易金额（星火）').withOption('sWidth','120px').renderWith(function(data,type,full){
            if(!data) return "0";
            return data;
        }),
        DTColumnBuilder.newColumn('fmtmamount').withTitle('交易金额（投米）').withOption('sWidth','120px').renderWith(function(data,type,full){
            if(!data) return "0";
            return data;
        }),
        DTColumnBuilder.newColumn('alltimes').withTitle('交易笔数（汇总）').withOption('sWidth','120px').renderWith(function(data,type,full){
            if(!data) return "0";
            return data;
        }),
        DTColumnBuilder.newColumn('xhtimes').withTitle('交易笔数（星火）').withOption('sWidth','120px').renderWith(function(data,type,full){
            if(!data) return "0";
            return data;
        }),
        DTColumnBuilder.newColumn('tmtimes').withTitle('交易笔数（投米）').withOption('sWidth','120px').renderWith(function(data,type,full){
            if(!data) return "0";
            return data;
        })
    ];
    $scope.action = {
        search: function(){
            if($scope.isShow){
                chart();
            }else{
                vm.dtInstance.rerender();
            }
        },
        changeView: function(){
            $scope.isShow = ($scope.isShow)?false:true;
        },
        load : function(){
            ComponentsPickers.init();
            chart();
        }
    };
    function footerCallback(row, data, start, end, display){
        if(!tools.interceptor(window.ajaxDataInfo)) return;
        var ajaxgetALL = window.ajaxDataInfo.info;
        if(!ajaxgetALL) return;
        var showArr = [ajaxgetALL.dl, ajaxgetALL.xhzc, ajaxgetALL.xhrz, ajaxgetALL.xhbk, ajaxgetALL.alldeal, ajaxgetALL.xhdeal, ajaxgetALL.tmdeal, ajaxgetALL.fmamount,
            ajaxgetALL.fmxhamount, ajaxgetALL.fmtmamount, ajaxgetALL.alltimes, ajaxgetALL.xhtimes, ajaxgetALL.tmtimes];
        var str = '<tr role="row" class="ui_center" style="background-color: #cc0000; font-weight: 600;"><td style="border-color: #cc0000; color: #ffffff;">'+ajaxgetALL.dd+'</td>';
        for(var i in showArr){
            if(!showArr[i]){
                str += '<td class="sorting_disabled" rowspan="1" colspan="1" style="border-color: #cc0000; color: #ffffff;">0</td>'
            }else{
                str += '<td class="sorting_disabled" rowspan="1" colspan="1" style="border-color: #cc0000; color: #ffffff;">'+showArr[i]+'</td>';
            }
        }
        str += "</tr>";
        $("thead.js_add_table_head").remove();
        $("<thead>",{"class":"js_add_table_head"}).html(str).insertBefore( $("#dataTables_wrapper thead") );
    }
    function chart(){
        var option = {
            title: {
                text: '当天交易统计',
                textStyle: {
                    fontFamily: "Microsoft Yahei",
                    fontWeight: 100
                }
            },
            tooltip : {
                trigger: 'axis'
            },
            legend: {
                data: ["当天交易笔数", "当天交易额"]
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
                    data : ['00：00','01：00','02：00','03：00','04：00','05：00','06：00','07：00','08：00','09：00','10：00','11：00','12：00','13：00','14：00','15：00','16：00','17：00','18：00','19：00','20：00','21：00','22：00','23：00']
                }
            ],
            yAxis : [
                {
                    type:'value',
                    name:'交易额',
                    nameTextStyle: {
                        fontFamily: "Microsoft Yahei",
                        fontWeight: 100,
                        color: ""
                    }
                },
                {
                    type:'value',
                    name:'笔数',
                    nameTextStyle: {
                        fontFamily: "Microsoft Yahei",
                        fontWeight: 100,
                        color: "#ff5500"
                    }
                }
            ],
            series : [
                {
                    name: '当天交易笔数',
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
                    data: [0,0,0,0,0,0,0,0,0,3,6,6,0,0,0,0,0,0,0,0,0,0,0,0]
                },
                {
                    name: '当天交易额',
                    type: 'line',
                    itemStyle: {
                        normal: {
                            label : {
                                show: true
                            }
                        }
                    },
                    data: [0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,577.0,3908.0,1000360.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0]
                }
            ]
        };
        var myChart = echarts.init($("#multi-chart4")[0]);
        $.ajax({
            type: "post",
            url: siteVar.serverUrl + "/xinghuodata/queryHourCharts.shtml",
            data: $scope.form,
            dataType: "json",
            success: function(data){
                if(!tools.interceptor(data)) return;
                if(data.success){
                    option.xAxis[0].data = data.data.types.split(",");
                    option.series[0].data = data.data.dealNum.split(",");
                    option.series[1].data = tools.chartNumFormat(data.data.amount.split(","));
                    myChart.setOption(option);
                }
            },
            error: function(err){
            }
        });
    }
    (function(){
        /**
         * [导出小时统计]
         * @param  {[type]}   [description]
         * @param  {[type]}   [description]
         * @return {[type]}   [description]
         */
        $("body").on("click",'#js_data_hour_export', function(){
            tools.export(this);
        });
        $("body").on("blur",'#js_data_hour_date_notnull input', function(){
            if(!$.trim(this.value)){
                this.value = tools.toJSDate(new Date().getTime()).split(" ")[0];
            }
        });
    })();
}