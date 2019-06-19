/**
 * Created by yanzhong1 on 2017/11/7.
 * 会员等级介绍页
 */
$(document).ready(function(){
    var toDate ={
            toJSDate :function(s){
                var self = this;
                if(!s) return "";
                var D = new Date(s);
                var date = [D.getFullYear(), self.twoNum(D.getMonth()+1), self.twoNum(D.getDate())];
                return date.join("-");
            },
            twoNum: function (str) {
                var num = parseInt(str);
                return num<10? "0"+num : ""+num;
            },
        };
    var search = {
        parameter : window.location.search,
        pathname  : window.location.pathname,
        queryUrl : function(){
            var result = {}, arr, str, key, key_arr, len;
            if(this.parameter.indexOf('?') != -1){
                arr = this.parameter.split('?');
                str = arr[1];
                arr = str.split('&');
                len = arr.length;
                if(len > 0){
                    for(var i = 0;i < len; i++){
                        key = arr[i];
                        key_arr = key.split('=');
                        result[key_arr[0]] = key_arr[1];
                    };
                };
            };
            return result;
        }
    };
    var toastFun = {
        _creatToast:function(){
            var tips = document.querySelector(".tipsBox"), body = document.querySelector("body"), html = "";
            if(!tips){
                tips = document.createElement("div");
                tips.style.cssText = "display:block;";
                tips.className = "tipsBox";
                body.appendChild(tips)
            };
            return tips;
        },
        showToast:function(){
            var self = this, toast = self._creatToast();
            toast.style.display = "block";
        },
        hideToast:function(){
            var self = this, toast = self._creatToast();
            toast.style.display = "none";
        },
        toast:function(content){
            var self = this, toast = self._creatToast();
            toast.innerHTML  = content;
            self.showToast();
            var timer = setTimeout(function(){
                self.hideToast();
                clearTimeout(timer);
            }, 2000)
        },
    };
    var gradeQ3 = {
        submitFlag:true,
        viewReport : function(){
            var self = this;
            if(self.submitFlag){
                self.submitFlag = false;
                $.ajax({
                    url:'/mobile/managerstarlevel/getUserManagerStarLeverList.json',
                    type:"POST",
                    data:search.queryUrl(),
                    success:function(data){
                        if(data.success){
                            $("#js-Number").html(data.data[0].starNum==null?'<span style="font-size:18px;position: relative;top: -2px;">不足100</span>':data.data[0].starNum);
                            $("#js-Name").html(data.data[0].starLevel==null?'银星理财师':data.data[0].starLevel);
                            //性标榜记录
                            var str = '',arrNum=[],arrLevel=[];
                            if(data.data.length == 0){
                                str = '<tr><td colspan="4">暂无历史数据</td></tr>'
                            }else{
                                for(var i in data.data){
                                    arrNum.push(data.data[i].starNum==null?'不足100':data.data[i].starNum);
                                    arrLevel.push(data.data[i].starLevel==null?'银星级':data.data[i].starLevel);
                                    str +='<tr>' +
                                        '<td>'+data.data[i].activityName+'</td>' +
                                        '<td>'+arrNum[i]+'</td>' +
                                        '<td>'+arrLevel[i]+'</td>' +
                                        '<td>'+toDate.toJSDate(data.data[i].updateTime)+'</td>' +
                                        '</tr>'
                                }
                            }

                            $('#js-table').append(str);
                        }else{
                            toastFun.toast(data.msg);
                        };
                        self.submitFlag = true;
                    },
                    error: function () {
                        self.submitFlag = true;
                    }
                });
            };
        },
        init : function(){
            this.viewReport();
            //查看历史记录
            $("#js-check").on("click",function(){
                var arr = search.pathname.split('/');
                var len = arr.length;
                var url = search.pathname.split('/',len-1).join('/');
                window.location = url+ '/gradeQ3List.html'+search.parameter;
            })
        }
    };
    gradeQ3.init();

});