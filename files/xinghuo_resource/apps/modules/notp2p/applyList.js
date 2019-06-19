/**
 * Created by yanzhong1 on 2017/7/4.
 */
'use strict';
function applyList($scope,tools,getSelectListFactory,$modal,$location, DTOptionsBuilder, DTColumnBuilder){
    var form = $("#js_form"),conditionItem = form.find(".form-group");

    $scope.form = {
        isShow: (conditionItem.length > 6) ? true : false,
        productType:1
    };
    $scope.select = {};
    $scope.action = {};
    $scope.select.applystatus = [
        {"key":0,"value":"待受理"},
        {"key":1,"value":"待激活"},
        {"key":2,"value":"待签约"},
        {"key":5,"value":"已取消"},
        {"key":6,"value":"已删除"}
    ];
    //枚举
    getSelectListFactory.getselectp2p('SesameTypeEnum,ApplyStatus,CancleType').then(function(data){
        $scope.select.sesametypeenum = data.data.SesameTypeEnum;
        //$scope.select.applystatus = data.data.ApplyStatus;
        $scope.select.cancletype = data.data.CancleType;
    });

    /*
     创建表格选项
     */
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax',{
        url: siteVar.serverUrl + '/sesameapply/tableSesameApply.shtml',
        type: 'POST',
        data: $scope.form,
    })
        .withDataProp('data')
        .withOption('createdRow', function(row, data, dataIndex) {
            angular.element(row).addClass("rows" + data.id)
        })
        .withOption('searching',false)
        .withOption('ordering',false)
        .withOption('serverSide',true)
        .withOption('processing',false)
        .withOption('scrollX',true)
        .withLanguage(tools.dataTablesLanguage)
        .withOption('fnDrawCallback', fnDrawCallback)
        .withPaginationType('simple_numbers');
    vm.dtColumns = [
        DTColumnBuilder.newColumn('applyId').withTitle('预约订单号').withOption('sWidth', '280px').renderWith(function(data,type,full){
            if(!data) return "";
            return '<a href="javascript:void(0);" class="applyDetail" data-href="/sesameapply/viewSesameApply.json?applyId='+data+'&id='+full.id+'">'+data+'</a>'
        }),
        DTColumnBuilder.newColumn('productCode').withTitle('项目编号').withOption('sWidth','180px'),
        DTColumnBuilder.newColumn('productName').withTitle('项目名称').withOption('sWidth','250px').renderWith(function(data, type, full) {
            if(!data) return "";
            return '<a href="javascript:void(0);" class="infoDetail" data-href="/sesameproduct/viewSesameProduct.json?productId=' + full.productId + '">' + data + '</a>';
        }),
        DTColumnBuilder.newColumn('userName').withTitle('用户姓名').withOption('sWidth','60px'),
        DTColumnBuilder.newColumn('userPhone').withTitle('用户手机号').withOption('sWidth', '100px'),
        DTColumnBuilder.newColumn('applyTimeFormat').withTitle('预约时间').withOption('sWidth', '150px'),
        DTColumnBuilder.newColumn('applyStatusDesc').withTitle('状态').withOption('sWidth', '50px'),
        DTColumnBuilder.newColumn('financialUserName').withTitle('理财经理姓名').withOption('sWidth','100px').renderWith(function(data,type,full){
            if(!data) return "";
            return '<a href="javascript:;" class="financialDetail" key="'+full.financialUserId+'">'+data+'</a>';
        }),
        DTColumnBuilder.newColumn('id').withTitle('操作').withOption('sWidth','50px').renderWith(function(data, type, full) {
            var html = '';
            html += '<a href="javascript:void(0);" data-productType="'+full.productType+'" data-applyStatus="'+full.applyStatus+'" data-id="'+full.id+'" data-flag="0" data-toggle="popover" data-placement="left" class="btn btn-primary btn-xs js-changeStatus" style="margin: 0 5px;">更改状态</a>';
            return html;
        })
    ];

    Number.prototype.mul = function (arg){
        var m=0,s1=this.toString(),s2=arg.toString();
        try{m+=s1.split(".")[1].length}catch(e){}
        try{m+=s2.split(".")[1].length}catch(e){}
        return Number(s1.replace(".",""))*Number(s2.replace(".",""))/Math.pow(10,m)
    };
    //查询
    $scope.action.search=function(){
        vm.dtInstance.rerender();
    }
    //重置
    $scope.action.reset = function(){
        for(var prop in $scope.form){
            if(prop !== 'isShow') delete $scope.form[prop];
        };
        vm.dtInstance.rerender();
    };
    //项目详情
    function infoDetailModalCtrl($scope, info, $modalInstance){
        $scope.info = info;
        info.minSubscribeAmt = tools.formatNumber(info.minSubscribeAmt);
        info.incSubscribeAmt = tools.formatNumber(info.incSubscribeAmt);
        info.planRaiseAmt = tools.formatNumber(info.planRaiseAmt);
        //info.adviserRate = (new Number(info.adviserRate)).mul(100)
        $scope.close = function() {
            $modalInstance.close();
        };
    }
    //预约订单号
    function applyListModalCtrl($scope, info,$modalInstance){
        $scope.info = info;
       // console.log($scope.info);
        //取消
        $scope.close = function() {
            $modalInstance.close();
        };
    }
    //表格回调函数
    function fnDrawCallback(){
        //导出
        $("#exportBtn").off('click').on('click',function(){
            var self = $(this);
            $.when($.ajax({type:"POST",url:siteVar.serverUrl +"/sesameapply/exportSesameApplyPage.json"})).then(function(data){
                if(data.success){
                    tools.export(self);
                }
            }).fail(function(){
                alert("用户没有权限！");
                return;
            });

        });
        //更改状态
        var table = $("#dataTables"), tbody = table.find("tbody");
        tbody.off("click").on("click", ".js-changeStatus", function(){
            var self = $(this),flag = self.attr("data-flag"),productType=self.attr("data-productType");
            //console.log(flag);
            $.ajax({
                type:"post",
                url:siteVar.serverUrl +"/sesameapply/updateSesameApplyPage.json",
                success:function(data){
                    if(data.success){
                        if(flag == 0){
                            self.popover({
                                html: true,
                                title : '更改状态',
                                content : function(){
                                    var id = $(this).attr("data-id"), applyStatus= $(this).attr("data-applyStatus"),statusObj={};
                                    if(productType==1){
                                        statusObj = {
                                            "1":"待激活",
                                            "2":"待签约",
                                            "5":"已取消"
                                        }
                                    }else{
                                        statusObj = {
                                            "1":"待激活",
                                            "2":"待签约",
                                            "3":"认购成功",
                                            "4":"已结束",
                                            "5":"已取消"
                                        }
                                    }
                                    var html = '<div class="btn-group-vertical js-box" role="group" aria-label="...">';

                                    for(var key in statusObj){
                                        html += '<button type="button" class="btn btn-default" data-applyStatus="'+ applyStatus +'" data-id="'+ id +'" data-nextapplyStatus="' + key + '">' + statusObj[key] + '</button>';
                                    }


                                    html += '</div>';
                                    html += '<div style="text-align:right;border-top:1px solid #ccc;padding-top:10px;margin-top:10px;"><button class="btn btn-sm btn-danger js-submit">确定更改</button> <button class="btn btn-sm js-reset">取消更改</button>';
                                    return html;
                                }
                            }).popover('show');
                            self.attr("data-flag", 1)
                        };
                        return false;
                    }else{
                        alert(data.msg)
                    }
                }
            })
        });
        $(".js-changeStatus").on('shown.bs.popover', function(){
            var siblingPop = $(this).next(".popover");
            $(".popover").each(function(){
                if($(this).attr("id") != siblingPop.attr("id")){
                    $(this).popover('hide');
                }
            });
        });
        $("#dataTables tbody").on("click",".popover",function(e){
            e.stopPropagation();
        });
        tbody.on("click", ".js-box button", function(){
            var btns = $(this).parent().find("button");
            btns.removeAttr("current").removeClass("btn-primary");
            $(this).attr("current", true).addClass("btn-primary");
        });
        tbody.on("click",".js-submit",function(){
            var self = $(this), tr = self.parents("tr"), tds = tr.children(), parentTd = self.parents("td");
            var popup = parentTd.find(".js-changeStatus");
            var currentBtn = self.parents(".popover-content").find('[current="true"]');
            if(currentBtn.length < 1){
                alert('请选择一个状态或取消更改');
                return ;
            };
            var id = currentBtn.attr("data-id"),applyStatus= currentBtn.attr("data-applyStatus"), status = parseInt(currentBtn.attr("data-nextapplyStatus"));
            var data = {
                id : id,
                applyStatus:status
            };
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + "/sesameapply/updateSesameApply.json",
                data: data,
                dataType: "text",
                success: function(res){
                    tools.ajaxOpened(self);
                    var res = JSON.parse(res);
                    if(res.success){
                        //tds.eq(0).find(".js_settle_checkbox").attr("data-settletype",currentBtn.attr("data-nextSettleType"));
                        tds.eq(6).html(currentBtn.html());
                        currentBtn.attr("data-flag", 0);
                        popup.attr("data-applyStatus",currentBtn.attr("data-nextapplyStatus"));
                    }else{
                        alert(res.msg);
                    }
                    popup.popover("hide");
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });
            return false;
        });
        tbody.on("click", ".js-reset",function(){
            var self = $(this), parentTd = self.parents("td"), popup = parentTd.find(".js-changeStatus");
            popup.popover("hide");
        });
        //项目名称--详情点击事件
        tbody.on("click", ".infoDetail", function(){
            var self = $(this), href = self.attr("data-href"), data, url;
            data = tools.queryUrl(href);
            url = href.split('?')[0];
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + url,
                data: data,
                dataType: "json",
                success: function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    if(data.success){
                        var info = $.extend({}, data.data.dbDto, data.data.httpDto);

                        //console.log( data.dbDto);
                        $modal.open({
                            backdrop: true,
                            backdropClick: true,
                            dialogFade: false,
                            keyboard: true,
                            templateUrl : 'infoDetailModal.html',
                            controller : infoDetailModalCtrl,
                            resolve:{
                                "info" : function(){
                                    return info;
                                }
                            }
                        });
                    }else{
                        alert(data.msg);
                    }

                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            })
        });
        //预约订单号--详情点击事件
        tbody.on("click",".applyDetail",function(){
            var self = $(this), href = self.attr("data-href"), data, url;
            data = tools.queryUrl(href);
            url = href.split('?')[0];
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + url,
                data: data,
                dataType: "json",
                success: function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    if(data.success){
                        //var info = $.extend({}, data.data.dbDto, data.data.httpDto);
                        $modal.open({
                            backdrop: true,
                            backdropClick: true,
                            dialogFade: false,
                            keyboard: true,
                            templateUrl : 'applyListTemplate.html',
                            controller : applyListModalCtrl,
                            resolve:{
                                "info" : function(){
                                    return data.data;
                                }
                            }
                        });
                    }else{
                        alert(data.msg);
                    }

                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            })
        });
        /**
         * [查看理财经理信息]
         * @param  {object}   [description]
         * @return {[type]}   [description]
         */
        if(!tools.interceptor(window.ajaxDataInfo)) return;
        tools.resetWidth();
        tools.createModal();
        tools.createModalProgress();
        table.on("click", ".financialDetail", function(){
            var data = {
                "id": $(this).attr("key"),
                "userType": "director",
                "bizSysRoute": $("#biz_sys_route").val()
            };
            var self = this;
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + "/xinghuouser/userinfo.shtml",
                data: data,
                dataType: "text",
                success: function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    $("#js_dialog .js_content").html(data);
                    $("#js_dialog").modal("show");
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });
        });
    }
    $(function(){
        var applyList =[
            {"key":"","value":"请选择"},
            {"key":0,"value":"待受理"},
            {"key":1,"value":"待激活"},
            {"key":2,"value":"待签约"},
            {"key":5,"value":"已取消"},
            {"key":6,"value":"已删除"}
        ];
        var applyListAll =  [
            {"key":"","value":"请选择"},
            {"key":0,"value":"待受理"},
            {"key":1,"value":"待激活"},
            {"key":2,"value":"待签约"},
            {"key":3,"value":"认购成功"},
            {"key":4,"value":"已结束"},
            {"key":5,"value":"已取消"},
            {"key":6,"value":"已删除"}
        ];

        $("#productType").change(function(){
            var self = $(this).val(),str="";
            if( self ==1 || self == '1'){
                for(var item in applyList){
                    str +='<option value="'+applyList[item].key+'">'+applyList[item].value+'</option>';
                }
            }else{
                for(var item in applyListAll){
                    str +='<option value="'+applyListAll[item].key+'">'+applyListAll[item].value+'</option>';
                }
            }
            $("#applyStatus").html(str);
        });


        //时间插件
        ComponentsPickers.init();
    })
}