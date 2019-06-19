'use strict';
function ftpCycle($scope,$http, tools ) {
    const MAXNUM = 12;
    $scope.form = {};
    $scope.select = {};
    $http.get(siteVar.serverUrl + 'ftpCycle/queryYear.json').success(function(data){
        if(!tools.interceptor(data)) return;
        $scope.select.years = data.data;
    });
    $scope.action = {
        editIndex:-1,
        editErrorIndex:-1,
        editIndexFlag:true,
        editOldData:{},
        add: function(){
            var that = this;
            if(!$scope.form.year){
                if(!$scope.form.otherYear || !$scope.form.startMonth || !$scope.form.endMonth){
                    $scope.errortips = "请选择和输入完整后再添加新的行";
                    return;
                };
            }else{
                if(!$scope.form.startMonth || !$scope.form.endMonth){
                    $scope.errortips = "请选择和输入完整后再添加新的行";
                    return;
                };
            };
            if($scope.form.otherYear){
                $scope.form.year = $scope.form.otherYear;
                delete $scope.form.otherYear;
            };
            $.ajax({
                url: siteVar.serverUrl+"ftpCycle/addFtpCycle.json",
                data: $scope.form,
                method: 'post',
            }).success(function(data){
                if(!tools.interceptor(data)) return;
                if(data.success){
                    alert("保存成功");
                    that.search();
                    that.resetForm();
                }else{
                    alert(data.msg)
                }
            })
        },
        showMonth:function(){
            if($scope.form.otherYear){
                this.setStartMonth($scope.form.otherYear);
            };
        },
        search: function(){
                delete $scope.form.startMonth;
                delete $scope.form.endMonth;
                this.hideEdit();
                $.ajax({
                    url: siteVar.serverUrl+'ftpCycle/queryFtpCycleByYear.json',
                    method: 'get',
                    data: {year:$scope.form.year}
                }).then(function(data){
                    if(!tools.interceptor(data)) return;
                    $scope.$apply(function(){
                        $scope.ftplist = data.data;
                        $scope.action.setStartMonth($scope.form.year);
                    })
                });
        },
        showEdit:function(index, e){
            if(this.editIndexFlag){
                this.editIndex = index;
                this.editOldData = $.extend({},$scope.ftplist[index]);
                this.editIndexFlag = false;
            };
        },
        hideEdit:function(index, e){
            this.editIndex = -1;
            this.editOldData = {};
            this.editIndexFlag = true;
        },
        saveEdit: function(index,e){
            var that = this, currentData = $scope.ftplist[index];
            if(currentData['startMonth'] > currentData['endMonth']){
                $scope.editErrortips = "起始月份要小于等于截止月份！";
                this.editErrorIndex = index;
                return;
            }else{
                $scope.editErrortips = "";
                this.editErrorIndex = -1;
            };
            if(currentData.id){
                var localDom = $(e.currentTarget)
                if(!tools.ajaxLocked($(localDom))) return;
                $.ajax({
                    url: siteVar.serverUrl + "ftpCycle/update.json",
                    data: {
                        id: currentData.id,
                        startMonth:currentData.startMonth,
                        endMonth:currentData.endMonth,
                        year:currentData.year
                    },
                    method: 'post',
                    success:function(data){

                    }
                }).success(function(data){
                    tools.ajaxOpened(localDom);
                    data.callback = function(){
                        $scope.$apply(function(){
                            $scope.ftplist[index] = $.extend({},that.editOldData);
                            that.hideEdit(index,e);
                        })
                    };
                    if(!tools.interceptor(data)) return;
                    $scope.$apply(function(){
                        tools.ajaxOpened($(localDom));
                        that.hideEdit(index,e);
                        that.resetForm();
                    })
                }).error(function(data){
                    tools.ajaxOpened(localDom);
                    $scope.ftplist[index] = $.extend({},that.editOldData);
                    that.hideEdit(index,e);
                });
            }else{
                that.hideEdit(index,e);
                this.resetForm();
            }
        },
        checkVal:function(index, key){
            var currentData = $scope.ftplist[index];
            if(key == 'startMonth'){
                currentData[key] = parseInt(currentData[key].toString().replace(/[^\d]/g,'')) > currentData['endMonth'] ? currentData['endMonth'] : parseInt(currentData[key]);
            }else if(key == 'endMonth'){
                if(currentData[key].toString().replace(/[^\d]/g,'') > 12){
                    currentData[key] = 12;
                }else{
                    currentData[key] = parseInt(currentData[key]);
                }
            }

        },
        resetForm : function(){
            for(var prop in $scope.form){
                if(prop !== 'year')  delete $scope.form[prop];
            }
        },
        removeError : function(){
            $scope.errortips = "";
        },
        setStartMonth : function(year){
            this.removeError();
            delete $scope.form.startMonth;
            delete $scope.form.endMonth;
            var temp = [], del = [];
            if(year){
                for(var i = 0;i < MAXNUM; i++){
                    temp.push(i + 1);
                };
                for(var key in $scope.ftplist){
                    var item = $scope.ftplist[key];
                    if(item.year == year){
                        var startMonth = item.startMonth, endMonth = item.endMonth,len = endMonth - startMonth + 1;
                        if(len > 0){
                            for(var j = 0; j < len; j++){
                                del.push(startMonth);
                                startMonth++
                            };
                        }else{
                            del.push(startMonth)
                        };
                        del.sort(function(a, b){
                            return a - b;
                        });
                        for(var m = 0; m < del.length; m++){
                            var index = temp.indexOf(del[m]);
                            if(index > -1){
                                temp.splice(index, 1);
                            }
                        };
                    }else{
                        continue;
                    };
                };
            };
            $scope.select.startMonth = temp.length > 0 ? temp : null;
        },
        setEndMonth : function(){
            this.removeError();
            delete $scope.form.endMonth;
            if($scope.select.startMonth && ($scope.select.startMonth.length > 0) && $scope.form.startMonth){
                var temp = $.extend([], $scope.select.startMonth), len = temp.length, startMonth = parseInt($scope.form.startMonth), result = [];
                for(var i = 0; i < len; i++){
                    if(temp.indexOf(startMonth) > -1){
                        result.push(startMonth);
                        startMonth++;
                    }else{
                        break;
                    };
                };
                $scope.select.endMonth = result.length > 0 ? result : null;
            }else{
                $scope.select.endMonth = null;
            }
        },
        init: function(){
            this.search();
        }
    };
    $scope.action.init();
}
