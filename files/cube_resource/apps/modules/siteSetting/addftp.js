'use strict';
function addftpController($scope,$http, tools ) {
    const MAXNUM = 48;
    $scope.form = {
        cycleId:""
    };
    $scope.select = {};
    $http.get(siteVar.serverUrl+'ftpCycle/queryAllFtpCycle.json').success(function(data){
        if(!tools.interceptor(data)) return;
        $scope.select.years = data.data;
    });
    $scope.action = {
        add: function(){
            if(!$scope.form.startMonth || !$scope.form.endMonth || !$scope.form.value){
                $scope.errortips = "请选择和输入完整后再添加新的行";
                return;
            }
            if(isNaN($scope.form.value)){
                $scope.errortips = "值必须为数字";
                return;
            }
            $scope.ftplist.push(tools.extend($scope.form,{cycleId: $scope.form.cycleId}));
            this.resetForm();
            this.setStartMonth();
        },
        search: function(){
            if($scope.form.cycleId){
                delete $scope.form.startMonth;
                delete $scope.form.endMonth;
                angular.forEach($scope.select.years, function(item, index, arr){
                    if(item.id == $scope.form.cycleId){
                        $scope.form.year = item.year;
                    };
                });
                $.ajax({
                    url: siteVar.serverUrl+'ftp/queryForPage.json',
                    method: 'get',
                    data: {
                        year:$scope.form.year,
                        cycleId: $scope.form.cycleId
                    }
                }).then(function(data){
                    if(!tools.interceptor(data)) return;
                    $scope.$apply(function(){
                        $scope.ftplist = data.data;
                        $scope.action.setStartMonth();
                    });
                });

            }
        },
        save: function(){
            var data = tools.extend($scope.ftplist,[]),reqData=[],that = this;
            for(var i in data){
                data[i].year = $scope.form.year,
                delete data[i]['$$hashKey'];
            }
            data.map(function(i){
                if(!i.id){
                    reqData.push(i);
                }
            })
            if(reqData.length<1) return;
            $.ajax({
                url: siteVar.serverUrl+"ftp/addFtps.json",
                data: {ftps: JSON.stringify(reqData)},
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
        del: function(index,e){
            var that = this;
            if($scope.ftplist[index].id){
                var localDom = $(e.currentTarget)
                if(!tools.ajaxLocked($(localDom))) return;
                $.ajax({
                    url: siteVar.serverUrl+"ftp/delete.json",
                    data: {id: $scope.ftplist[index].id},
                    method: 'post',
                }).success(function(data){
                    if(!tools.interceptor(data)) return;
                    $scope.$apply(function(){
                        tools.ajaxOpened($(localDom));
                        $scope.ftplist.splice(index,1);
                        that.resetForm();
                        that.setStartMonth();
                    })
                })
            }else{
                $scope.ftplist.splice(index,1);
                this.resetForm();
                this.setStartMonth();
            }
        },
        resetForm : function(){
            for(var prop in $scope.form){
                if(prop !== 'year' && prop !== 'cycleId')  delete $scope.form[prop];
            }
        },
        removeError : function(){
            $scope.errortips = "";
        },
        setStartMonth : function(){
            this.removeError();
            var result = [];
            var check = function(num){
                var r = false;
                for(var m in $scope.ftplist){
                    if($scope.ftplist[m].endMonth == -1){
                        if(num >= $scope.ftplist[m].startMonth){
                            r = true;
                            break;
                        }
                    }else{
                        if($scope.ftplist[m].startMonth==(MAXNUM+1) || (num >= $scope.ftplist[m].startMonth && num <= $scope.ftplist[m].endMonth)){
                            r = true;
                            break;
                        }
                    }
                }
                return r;
            };
            for(var i=1;i<(MAXNUM+2);i++){
                if(check(i)) continue;
                result.push(i);
            }
            $scope.select.startMonth = result;
        },
        setEndMonth : function(){
            this.removeError();
            delete $scope.form.endMonth;
            if($scope.form.startMonth == (MAXNUM+1)) {
                $scope.select.endMonth = [{name:9999,value:-1}];
                return false;
            }
            var start = [],startArr = [],arr=[],startResult;
            for(var m in $scope.ftplist){
                start.push($scope.ftplist[m].startMonth);
            }
            start.map(function(m){
                if(parseInt(m)>=$scope.form.startMonth){
                    startArr.push(m);
                }
            });
            var startResult = Math.min.apply(Math,startArr);
            var temp = tools.extend($scope.select.startMonth,[]);
            if(startResult > 0){
                temp.map(function(i){
                    if(i < startResult && i >= $scope.form.startMonth){
                        arr.push({name:i,value:i});
                    }
                })
            }else{
                temp.map(function(i){
                    if(i >= $scope.form.startMonth && i <= MAXNUM){
                        arr.push({name:i,value:i});
                    }
                })
            }
            $scope.select.endMonth = arr;
        }
    };
}
