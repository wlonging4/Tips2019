'use strict';
function xinghuodataAllController($scope,tools,DTOptionsBuilder, DTColumnBuilder) {
    $scope.form = {};
    $scope.isShow = true;
    $scope.action = {};
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder
        .newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/xinghuodata/queryTotalTable.shtml',
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
        DTColumnBuilder.newColumn('bm').withTitle('分类').withOption('sWidth','160px').renderWith(function(data,type,full){
            if(!data) return "0";
            return data;
        }),
        DTColumnBuilder.newColumn('fmje').withTitle('总交易额(元)').withOption('sWidth','200px').renderWith(function(data,type,full){
            if(!data) return "0";
            return data;
        }),
        DTColumnBuilder.newColumn('lendersum').withTitle('客户总数').withOption('sWidth','160px').renderWith(function(data,type,full){
            if(!data) return "0";
            return data;
        }),
        DTColumnBuilder.newColumn('undealstore').withTitle('无交易理财经理数').withOption('sWidth','200px').renderWith(function(data,type,full){
            if(!data) return "0";
            return data;
        }),
        DTColumnBuilder.newColumn('dealstore').withTitle('有交易理财经理数').withOption('sWidth','120px').renderWith(function(data,type,full){
            if(!data) return "0";
            return data;
        }),
        DTColumnBuilder.newColumn('dealsum').withTitle('交易笔数').withOption('sWidth','80px').renderWith(function(data,type,full){
            if(!data) return "0";
            return data;
        }),
        DTColumnBuilder.newColumn('fmavgstore').withTitle('有交易理财经理平均交易额(元)').withOption('sWidth','210px').renderWith(function(data,type,full){
            if(!data) return "0";
            return data;
        }),
        DTColumnBuilder.newColumn('fmavedeal').withTitle('每单平均交易额(元)').withOption('sWidth','140px').renderWith(function(data,type,full){
            if(!data) return "0";
            return data;
        }),
        DTColumnBuilder.newColumn('avglender').withTitle('有交易理财经理平均客户数').withOption('sWidth','180px').renderWith(function(data,type,full){
            if(!data) return "0";
            return data;
        })
    ];
    $scope.action = {
        search: function(){
            $scope.form.p_departmentname = $scope.form.p_department;
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
        var showArr = [ajaxgetALL.fmje, ajaxgetALL.lendersum, ajaxgetALL.undealstore, ajaxgetALL.dealstore, ajaxgetALL.dealsum, ajaxgetALL.fmavgstore, ajaxgetALL.fmavedeal, ajaxgetALL.avglender];
        var str = '<tr role="row" class="ui_center" style="background-color: #cc0000; font-weight: 600;"><td style="border-color: #cc0000; color: #ffffff;">'+ajaxgetALL.bm+'</td>';
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
                text: '总量实时统计',
                textStyle: {
                    fontFamily: "Microsoft Yahei",
                    fontWeight: 100
                }
            },
            tooltip: { trigger: 'axis'},
            legend: {
                data:[]
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
                    type : 'category'
                }
            ],
            yAxis : [
                {
                    type : 'value'
                }
            ],
            series : [
                {
                    name: '数量',
                    type:'bar',
                    barWidth: "80",
                    itemStyle: {
                        normal: {
                            color: "#7cb5ec",
                            label : {
                                show: true
                            }
                        }
                    },
                    lable: {
                        normal: {
                            show: true,
                            position: 'top'
                        }
                    }
                }
            ]
        };
        var myChart1 = echarts.init($("#multi-chart1")[0]);
        $.ajax({
            type: "post",
            url: siteVar.serverUrl + "/xinghuodata/queryTotalCharts.shtml",
            data: tools.getFormele({}, $("#js_form")),
            dataType: "json",
            success: function(data){
                if(!tools.interceptor(data)) return;
                if(data.success){
                    option.xAxis[0].data = data.data['types'].split(",");
                    option.series[0].data = data.data.nums.split(",");
                    myChart1.setOption(option);
                }
            },
            error: function(err){
            }
        });
    }
    (function(){
        /**
         * [导出汇总统计]
         * @param  {[type]}   [description]
         * @param  {[type]}   [description]
         * @return {[type]}   [description]
         */
        $("body").on("click",'#js_data_all_export', function(){
            tools.export(this);
        });
    })();
}