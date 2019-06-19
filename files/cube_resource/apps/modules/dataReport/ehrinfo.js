'use strict';
function dataReportEhrInfoController($scope,tools, DTOptionsBuilder, DTColumnBuilder) {
    $scope.report1 = {};
    $scope.report2 = {};
    $scope.form = {};
    $scope.action = {
        load : function(){
            var that = this;
            setTimeout(function(){
                Metronic.initComponents();
                ComponentsPickers.init();
                that.redraw(2);
            },100);
            this.redraw(1);
            //绑定导出
            $(document).off("click","#js_ehr_export");
            $(document).on("click","#js_ehr_export",function(){
                tools.export($(this));
            })
        },
        redraw: function(num,e){
            if(e){
                var localDom = $(e.currentTarget)
                if(!tools.ajaxLocked($(localDom))) return;
            }
            var tableName = "离职员工统计",subText;
            switch (num){
                case 1:
                    subText = "最近7天";
                    break;
                case 2:
                    subText = "最近30天";
                    break;
                default:
                    break;
            }
            var option = {
                title: {
                    text: tableName,
                    subtext: subText
                },
                tooltip: {
                    trigger: 'axis'
                },
                toolbox: {
                    show: true,
                    feature: {
                        dataZoom: {
                            yAxisIndex: 'none'
                        },
                        dataView: {readOnly: false},
                        magicType: {type: ['line', 'bar']},
                        restore: {},
                        saveAsImage: {}
                    }
                },
                xAxis:  {
                    type: 'category',
                    boundaryGap: false
                },
                yAxis: {
                    type: 'value'
                },
                legend: {
                    data:['2016/10/30','2016/10/31']
                }
            };
            if(num>1 && $("#chart1").width()>100) $("#chart"+num).css("width", $("#chart1").width());
            var myChart = echarts.init($("#chart"+num)[0]);
            $scope['report'+num].dateType = (num+2);
            $.ajax({
                url: siteVar.serverUrl+'ehrinfo/countEhrinfo.json',
                method: 'post',
                dataType: 'json',
                data: $scope['report'+num]
            }).then(function(data){
                if(!tools.interceptor(data)) return;
                if(data.success){
                    tools.ajaxOpened($(localDom));
                    var result = data.data,legend = [];
                    for(var i in result.series){
                        legend.push(result.series[i].name);
                    }
                    option.legend.data = legend;
                    option.xAxis.data = result.xAxis
                    option.series = result.series;
                    myChart.setOption(option);
                }
            });
        },
        search: function(){
            vm.dtInstance.rerender();
        },
        reset:  function(){
            for(var prop in $scope.form){
                delete $scope.form[prop];
            }
            vm.dtInstance.rerender();
        }
    };
    /*
     创建表格选项
     */
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax',{
        url: siteVar.serverUrl+'ehrinfo/queryForPage.json',
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
        .withOption('processing',true)
        .withOption('scrollX',true)
        .withLanguage(tools.dataTablesLanguage)
        .withOption('fnDrawCallback', fnDrawCallback)
        .withPaginationType('simple_numbers');
    vm.dtColumns = [
        DTColumnBuilder.newColumn('empno').withTitle('员工编号').withOption('sWidth','80px'),
        DTColumnBuilder.newColumn('empname').withTitle('员工姓名').withOption('sWidth','60px'),
        DTColumnBuilder.newColumn('birthday').withTitle('出生日期').withOption('sWidth','70px').renderWith(function(data,type,full){
            return tools.toJSYMD(data);
        }),
        DTColumnBuilder.newColumn('hiredate').withTitle('入职日期').withOption('sWidth','70px').renderWith(function(data,type,full){
            return tools.toJSYMD(data);
        }),
        DTColumnBuilder.newColumn('terminationdate').withTitle('离职日期').withOption('sWidth','70px').renderWith(function(data,type,full){
            return tools.toJSYMD(data);
        }),
        DTColumnBuilder.newColumn('job').withTitle('职位').withOption('sWidth','60px'),
        DTColumnBuilder.newColumn('joblevel').withTitle('职级').withOption('sWidth','60px'),
        DTColumnBuilder.newColumn('levelname').withTitle('等级').withOption('sWidth','60px'),
        DTColumnBuilder.newColumn('city').withTitle('工作城市').withOption('sWidth','80px'),
        DTColumnBuilder.newColumn('xinghuodept').withTitle('星火处理部门').withOption('sWidth','100px'),
        DTColumnBuilder.newColumn('dept').withTitle('部门').withOption('sWidth','150px').renderWith(function(data,type,full){
            return '<span class="ui_ellipsis" style="width: 150px" title="'+ data +'">'+ data +'</span>';
        })
    ];
    function fnDrawCallback(){
        if(!tools.interceptor(window.ajaxDataInfo)) return;
        tools.resetWidth();
    }
}