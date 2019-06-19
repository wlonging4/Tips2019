'use strict';
function xinghuodataDealcountController($scope,tools,$location,DTOptionsBuilder, DTColumnBuilder) {
    $scope.isShow = true;
    $scope.action = {};
    $scope.form = {
        querydate : tools.toJSDate(new Date().getTime()).split(" ")[0]
    };
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder
        .newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/xinghuodata/queryDealnumTable.shtml',
            type: 'POST',
            data: $scope.form
        })
        .withDataProp('data')
        .withOption('searching',false)
        .withOption('ordering',false)
        .withOption('serverSide',true)
        .withOption('processing',false)
        .withLanguage(tools.dataTablesLanguage)
        .withOption('scrollX',false)
        .withOption('footerCallback',footerCallback)
        .withPaginationType('full_numbers');
    vm.dtColumns = [
        DTColumnBuilder.newColumn('dealsum').withTitle('当天交易笔数').withOption('sWidth','80px').renderWith(function(data,type,full){
            if(!data) return "0";
            return data;
        }),
        DTColumnBuilder.newColumn('lendernum').withTitle('人数').withOption('sWidth','110px').renderWith(function(data,type,full){
            if(!data) return "0";
            return data;
        }),
        DTColumnBuilder.newColumn('storenum').withTitle('店铺数').withOption('sWidth','110px').renderWith(function(data,type,full){
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
        reset: function(){
            for(var prop in $scope.form){
                if(prop !== 'isShow') delete $scope.form[prop];
            }
            if($scope.isShow){
                chart();
            }else{
                vm.dtInstance.rerender();
            }
        },
        changeView: function(){
            $scope.isShow = ($scope.isShow)?false:true;
            if(!$scope.isShow){
                setTimeout(function(){
                    ComponentsPickers.init();
                },200)
            }
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
        var str = '<tr role="row" class="ui_center" style="background-color: #cc0000; font-weight: 600;"><td style="border-color: #cc0000; color: #ffffff;">总数</td><td class="sorting_disabled" rowspan="1" colspan="1" style="border-color: #cc0000; color: #ffffff;">'+
            ajaxgetALL.lendernum+'</td><td class="sorting_disabled" rowspan="1" colspan="1" style="border-color: #cc0000; color: #ffffff;">'+ajaxgetALL.storenum+'</td></tr>'
        $("thead.js_add_table_head").remove();
        $("<thead>",{"class":"js_add_table_head"}).html(str).insertBefore( $("#dataTables_wrapper thead") );
    }
    function chart(){
        var opt1 = {
            title: {
                text: '按交易笔数分类理财经理数',
                textStyle: {
                    fontFamily: "Microsoft Yahei",
                    fontWeight: 100
                }
            },
            tooltip : {
                trigger: 'axis'
            },
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
                    type : 'category',
                    data : ['注册','认证','绑卡','交易','理财经理注册数','有交易理财经理','交易笔数','交易额(万)']
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
                    barWidth: "38",
                    itemStyle: {
                        normal: {
                            color: "#7cb5ec",
                            label : {
                                show: true
                            }
                        }
                    },
                    data: [5034.0,2739.0,913.0,676.0,1335.0,396.0,3775.0,35599.6591]
                }
            ]
        };
        var myChart1 = echarts.init($("#multi-chart1")[0]);
        var myChart2 = echarts.init($("#multi-chart2")[0]);
        $.ajax({
            type: "post",
            url: siteVar.serverUrl + "/xinghuodata/queryDealnumCharts.shtml",
            data: $scope.form,
            dataType: "json",
            success: function(data){
                if(!tools.interceptor(data)) return;
                if(data.success){
                    var opt2 = {};
                    $.extend(true, opt2, opt1);
                    opt1.title.text = "按交易笔数分类理财经理数";
                    opt1.yAxis[0].name = "店铺数";
                    opt1.xAxis[0].data = data.data.storeNumVtype.split(",");
                    opt1.series[0].data = tools.chartNumFormat(data.data.storeNumVnum.split(","));
                    myChart1.setOption(opt1);

                    opt2.title.text = "成功投资次数分类";
                    opt2.yAxis[0].name = "人数";
                    opt2.xAxis[0].data = data.data.lenderNumVtype.split(",");
                    opt2.series[0].data = tools.chartNumFormat(data.data.lenderNumVnum.split(","));
                    myChart2.setOption(opt2);
                }
            },
            error: function(err){
            }
        });
    }
    (function(){
        /**
         * [导出交易笔数分类]
         * @param  {[type]}   [description]
         * @param  {[type]}   [description]
         * @return {[type]}   [description]
         */
        $("body").on("click",'#js_data_dealcount_export', function(){
            tools.export(this);
        });
        $("body").on("blur",'#js_data_hour_date_notnull input', function(){
            if(!$.trim(this.value)){
                this.value = tools.toJSDate(new Date().getTime()).split(" ")[0];
            }
        });
        $("[ui-view]").append("<style>table.dataTable,table.dataTable.no-footer {width: 100% !important;}</style>");
    })();
}