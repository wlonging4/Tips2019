'use strict';
function dataReportDealAnalyzeController($scope,tools,$window) {
    $scope.report1 = {productName:'全部'};
    $scope.report2 = {productName:'全部'};
    $scope.report3 = {productName:'全部'};
    $scope.report4 = {productName:'全部'};
    $scope.reportWeek = {};
    $scope.reportMonth = {};
    $scope.select = {
        months: [1,2,3,4,5,6,7,8,9,10,11,12]
    };
    $scope.action = {
        load : function(){
            $.ajax({
                url: siteVar.serverUrl+'countDeal/querySubproductNames.json',
                method: 'post',
                dataType: 'json'
            }).then(function(data){
                if(!tools.interceptor(data)) return;
                if(data.success){
                    $scope.$apply(function(){
                        $scope.select.reportType1 = data.data.today;
                        $scope.select.reportType2 = data.data.yesterday;
                        $scope.select.reportType3 = data.data.sevenDay;
                        $scope.select.reportType4 = data.data.thirtyDay;
                        setTimeout(function(){
                            Metronic.initComponents();
                        },200);
                    })
                }else{
                    alert(data.msg);
                }
            });
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
            },200);
            this.redraw(1);
        },
        showWeek: function(){
            var that = this;
            delete $scope.select.weeks;
            delete $scope.reportWeek.week;
            if(!$scope.reportWeek.year) return;
            $.ajax({
                url: siteVar.serverUrl+'calendarWeek/weekList.json',
                method: 'post',
                dataType: 'json',
                data: {year: $scope.reportWeek.year}
            }).then(function(data){
                if(!tools.interceptor(data)) return;
                $scope.$apply(function(){
                    $scope.select.weeks = that.formatWeek(data.data);
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
            if(!$scope['report'+num].productName) {
                alert("请选择产品");
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
            tableName = $scope['report'+num].productName;
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
                url: siteVar.serverUrl+'countDeal/countDeal.json',
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
        reportMonth: function(){
            if(!$scope.reportMonth.year){
                alert("请选择年份再导出");
                return false;
            }
            if(!$scope.reportMonth.month){
                alert("请选择月份再导出");
                return false;
            }
            var myDate = new Date();
            if($scope.reportMonth.year == myDate.getFullYear() && $scope.reportMonth.month >= (myDate.getMonth()+1)){
                alert("请选择小于"+myDate.getFullYear()+(myDate.getMonth()+1)+"的月份");
                return false;
            }
            var sendMonth = ($scope.reportMonth.month<10)?("0"+$scope.reportMonth.month):$scope.reportMonth.month;
            $window.open(siteVar.serverUrl+'down/excel.shtml?name=MonthReport&param='+($scope.reportMonth.year+"-"+sendMonth).replace("-",""));
        },
        reportWeekDetail: function(){
            if(!$scope.reportWeek.year){
                alert("请选择年份再导出");
                return false;
            }
            if(!$scope.reportWeek.week){
                alert("请选择周再导出");
                return false;
            }
            $window.open(siteVar.serverUrl+'down/excel.shtml?name=WeekReport&param='+($scope.reportWeek.year+"-"+$scope.reportWeek.week).replace("-",""));
        },
        reportWeekAll: function(){
            if(!$scope.reportWeek.year){
                alert("请选择年份再导出");
                return false;
            }
            if(!$scope.reportWeek.week){
                alert("请选择周再导出");
                return false;
            }
            $window.open(siteVar.serverUrl+'down/excel.shtml?name=WeekStatisticsReport&param='+($scope.reportWeek.year+"-"+$scope.reportWeek.week).replace("-",""));
        },
        reportTable : function(e){
            if(!$scope.reportWeek.year){
                alert("请选择年份再查询");
                return false;
            }
            if(!$scope.reportWeek.week){
                alert("请选择周再查询");
                return false;
            }
            if($scope.reportWeek.type !=="0" && $scope.reportWeek.type !=="1" ){
                alert("请选择按名称还是按期限查询");
                return false;
            };
            var localDom = $(e.currentTarget)
            if(!tools.ajaxLocked($(localDom))) return;
            $scope.noResult = false;
            if($scope.reportWeek.type =="1"){
                $scope.withName = true;
            }else{
                $scope.withName = false;
            }
            $.ajax({
                url: siteVar.serverUrl+'countDeal/xhweekReport.json',
                method: 'post',
                dataType: 'json',
                data: $scope.reportWeek
            }).then(function(data){
                if(!tools.interceptor(data)) return;
                if(data.success){
                    tools.ajaxOpened($(localDom));
                    if(data.data.length == 0){
                        $scope.$apply(function(){
                            $scope.noResult = true;
                            $scope.reportTables = [];
                        });
                        return;
                    }else{
                        $scope.$apply(function(){
                            $scope.reportTables = data.data;
                            $scope.noResult = false;
                        })
                    }
                }
            });
        }
    };
}