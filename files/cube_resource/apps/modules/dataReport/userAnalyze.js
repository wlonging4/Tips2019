'use strict';
function dataReportUserAnalyzeController($scope,tools) {
    $scope.report1 = {countType:1};
    $scope.report2 = {countType:1};
    $scope.report3 = {countType:1};
    $scope.report4 = {countType:1};
    $scope.week1 = {};
    $scope.week2 = {};
    $scope.select = {};
    $scope.select1 = {};
    $scope.select2 = {};
    $scope.action = {
        load : function(){
            $.ajax({
                url: siteVar.serverUrl+'calendarWeek/year.json',
                method: 'get',
                dataType: 'json'
            }).then(function(data){
                if(!tools.interceptor(data)) return;
                $scope.$apply(function(){
                    $scope.select.years = data.data;
                })
            });
            var that = this;
            setTimeout(function(){
                Metronic.initComponents();
                that.redraw(2);
                that.redraw(3);
                that.redraw(4);
            },100);
            this.redraw(1);
        },
        showWeek1: function(){
            var that = this;
            delete $scope.select1.weeks;
            delete $scope.week1.week;
            if(!$scope.week1.year) return;
            $.ajax({
                url: siteVar.serverUrl+'calendarWeek/weekList.json',
                method: 'post',
                dataType: 'json',
                data: {year: $scope.week1.year}
            }).then(function(data){
                if(!tools.interceptor(data)) return;
                $scope.$apply(function(){
                    $scope.select1.weeks = that.formatWeek(data.data);
                });
            });
        },
        showWeek2: function(){
            var that = this;
            delete $scope.select2.weeks;
            delete $scope.week2.week;
            if(!$scope.week2.year) return;
            $.ajax({
                url: siteVar.serverUrl+'calendarWeek/weekList.json',
                method: 'post',
                dataType: 'json',
                data: {year: $scope.week2.year}
            }).then(function(data){
                if(!tools.interceptor(data)) return;
                $scope.$apply(function(){
                    $scope.select2.weeks = that.formatWeek(data.data);
                });
            });
        },
        formatWeek: function(obj){
            var formatWeeks = [];
            for(var i in obj){
                var str = "第" + obj[i].weekNo + "周" + tools.toJSMD(obj[i].starTime) +"-"+ tools.toJSMD(obj[i].endTime);
                formatWeeks.push( {
                    "name": str,
                    "value": obj[i].weekNo
                } );
            }
            return tools.extend(formatWeeks,[]);
        },
        redraw: function(num,e){
            if(!$scope['report'+num].countType) {
                alert("请选择类型");
                return;
            }
            if(e){
                var localDom = $(e.currentTarget)
                if(!tools.ajaxLocked($(localDom))) return;
            }
            var tableName,subText;
            switch (num){
                case 1:
                    subText = "昨天";
                    break;
                case 2:
                    subText = "前天";
                    break;
                case 3:
                    subText = "最近7天";
                    break;
                case 4:
                    subText = "最近30天";
                    break;
                default:
                    break;
            }
            switch (parseInt($scope['report'+num].countType)){
                case 1:
                    tableName = "新增注册";
                    break;
                case 2:
                    tableName = "新增交易用户";
                    break;
                case 3:
                    tableName = "新增理财师";
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
            $scope['report'+num].dateType = num;
            if(!$scope['report'+num].beforeDay){
                delete $scope['report'+num].beforeDay;
            }
            if(!$scope['report'+num].beforeWeek){
                delete $scope['report'+num].beforeWeek;
            }
            $.ajax({
                url: siteVar.serverUrl+'countUser/countUser.json',
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
        report1 : function(e){
            if(!$scope.week1.year){
                alert("请选择年份再查询");
                return false;
            }
            if(!$scope.week1.week){
                alert("请选择周再查询");
                return false;
            }
            var localDom = $(e.currentTarget)
            if(!tools.ajaxLocked($(localDom))) return;
            $.ajax({
                url: siteVar.serverUrl+'salesReport/queryReport.json',
                method: 'post',
                dataType: 'json',
                data: $scope.week1
            }).then(function(data){
                if(!tools.interceptor(data)) return;
                if(data.success){
                    tools.ajaxOpened($(localDom));
                    if(data.data.length == 0){
                        $scope.$apply(function(){
                            $scope.noResult1 = true;
                        });
                        return;
                    }else{
                        $scope.$apply(function(){
                            $scope.reportTables1 = data.data;
                            $scope.noResult1 = false;
                        })
                    }
                }
            });
        },
        report2 : function(e){
            if(!$scope.week2.year){
                alert("请选择年份再查询");
                return false;
            }
            if(!$scope.week2.week){
                alert("请选择周再查询");
                return false;
            }
            var localDom = $(e.currentTarget)
            if(!tools.ajaxLocked($(localDom))) return;
            $.ajax({
                url: siteVar.serverUrl+'lenderAnalysis/getAnalysis.json',
                method: 'post',
                dataType: 'json',
                data: $scope.week2
            }).then(function(data){
                if(!tools.interceptor(data)) return;
                if(data.success){
                    tools.ajaxOpened($(localDom));
                    if(data.data.length == 0){
                        $scope.$apply(function(){
                            $scope.noResult2 = true;
                        });
                        return;
                    }else{
                        $scope.$apply(function(){
                            $scope.reportTables2 = data.data;
                            $scope.noResult2 = false;
                        })
                    }
                }
            });
        }
    };
}