'use strict';
var ifLimitConfirm=0;
function redEnvelopesCreate($scope,getSelectListFactory, $timeout,$modal,tools,$location) {
    //关联状态下生成的列表随便编辑修改
    function listHandle(initList,dataList,idExist){
        if(!idExist){
            initList.forEach(function (k,i) {
                initList[i].checked='false';
                initList[i].onlyRead='false';
                initList[i].show=1;
            });
        }else{
            if(dataList&&dataList.length){
                for(var m=0;m<initList.length;m++){
                    initList[m].checked='false';
                    initList[m].onlyRead='false';
                    for(var n=0;n<dataList.length;n++){
                        if(initList[m].productId==dataList[n].productId){
                            initList[m].checked='true';
                            initList[m].onlyRead='false';
                        }
                    }
                    initList[m].show=1;
                }
            }else{
                initList.forEach(function (k,i) {
                    initList[i].checked='false';
                    initList[i].onlyRead='false';
                    initList[i].show=1;
                });
            }
        }
        return initList;
    }
    //关联状态下生成的列表只能编辑加 不能编辑减少
    function listHandle2(initList,dataList,idExist){
        if(!idExist){
            initList.forEach(function (k,i) {
                initList[i].checked='false';
                initList[i].onlyRead='false';
                initList[i].show=1;
            });
        }else{
            if(dataList&&dataList.length){
                for(var m=0;m<initList.length;m++){
                    initList[m].checked='false';
                    initList[m].onlyRead='false';
                    for(var n=0;n<dataList.length;n++){
                        if(initList[m].productId==dataList[n].productId){
                            initList[m].checked='true';
                            initList[m].onlyRead='true';
                        }
                    }
                    initList[m].show=1;
                }
            }
        }
        return initList;
    }

    $scope.form={};
    $scope.form = {
        //effectiveType==1代表时间区间
        effectiveType:1,
        //applyProductFlag==2表示不限产品
        applyProductFlag:1
    };
    //默认使用条件选择金额
    $scope.fullCutOrNot=1;

    $scope.checkedAll=false;
    var arrName=[];
    var arrId=[];
    var arrCode=[];
    var $all = $("#multiAll");
    //编辑状态读取数据到ipt上显示
    function init() {
        //console.log($scope.initProList);
        for(var key in $scope.initProList){
            if($scope.initProList[key].checked=='true'){
                arrName.push($scope.initProList[key].productName);
                arrId.push($scope.initProList[key].productId);
                arrCode.push($scope.initProList[key].productCode);
                /*if(arg1){
                    $scope.initProList[k]
                }*/
            }
            $('#multiIpt').val(arrName.join(","));
            $('#multiIpthId').val(arrId.join(","));
            $('#multiIpthCode').val(arrCode.join(","));
        }
    }


    //指定产品选择
    //勾选选项
    $scope.result = [];
    $("#multiContent").off('change', '.multiLabel').on('change', '.multiLabel', function (event) {
        var LabelCode = $(this).find('.multiSel_unit').attr('data-code');
        arrName=[];
        arrId=[];
        arrCode=[];
        $('#multiIpt').val('');
        $('#multiIpthId').val('');
        $('#multiIpthCode').val('');
        for(var key in $scope.jsonDataOrigin1){
            if($scope.jsonDataOrigin1[key].productCode==LabelCode){
                if($scope.jsonDataOrigin1[key].checked=='true'){
                    $scope.jsonDataOrigin1[key].checked='false';
                }
                else{$scope.jsonDataOrigin1[key].checked='true'}
                $scope.$apply();
            }
            if($scope.jsonDataOrigin1[key].checked=='true'){
                arrName.push($scope.jsonDataOrigin1[key].productName);
                arrId.push($scope.jsonDataOrigin1[key].productId);
                arrCode.push($scope.jsonDataOrigin1[key].productCode);
            }
        }
        $('#multiIpt').val(arrName.join(","));
        $('#multiIpthId').val(arrId.join(","));
        $('#multiIpthCode').val(arrCode.join(","));
        return false;
    });

    //全选选项
    $all.off('click').on('click',function () {
        arrName=[];
        arrId=[];
        arrCode=[];
        $('#multiIpt').val('');
        $('#multiIpthId').val('');
        $('#multiIpthCode').val('');
        if(!$scope.checkedAll){
            $(this).find('span').addClass('checked');
            $scope.checkedAll=true;
            for(var key in $scope.jsonDataOrigin1){
                $scope.jsonDataOrigin1[key].checked='true';
                arrName.push($scope.jsonDataOrigin1[key].productName);
                arrId.push($scope.jsonDataOrigin1[key].productId);
                arrCode.push($scope.jsonDataOrigin1[key].productCode);
            }
        }else{
            $(this).find('span').removeClass('checked');
            $scope.checkedAll=false;
            for(var key in $scope.jsonDataOrigin1){
                $scope.jsonDataOrigin1[key].checked='false';
                arrName=[];
                arrId=[];
                arrCode=[];
            }
        }
        $('#multiIpt').val(arrName.join(","));
        $('#multiIpthId').val(arrId.join(","));
        $('#multiIpthCode').val(arrCode.join(","));
        $scope.$apply();
        return false;
    });
    //搜索选项
    $('#multiSearchBtn').on('click',function () {
        for(var key in $scope.jsonDataOrigin1){
            $scope.jsonDataOrigin1[key].show=1;
        }
        var nowInput=$.trim($('#multiSearch').val());
        if(!nowInput){
            for(var key in $scope.jsonDataOrigin1){
                $scope.jsonDataOrigin1[key].show=1;
            }
            $scope.$apply();
            tools.interalert('请输入检索内容');
            return;
        }
        for(var h=0;h<$scope.jsonDataOrigin1.length;h++){
            if($scope.jsonDataOrigin1[h].productName.search(nowInput)<=-1){
                $scope.jsonDataOrigin1[h].show=0;
            }
        }
        $scope.$apply();
    });

    $('#multiBox').addClass('hidden');
    $('#multi_select').on('click','#multiIpt',function () {
        $('#multiBox').removeClass('hidden');
    });
    $('#multi_select').on('click','#multiConfirm',function () {
        $('#multiBox').addClass('hidden');
    });

    $scope.select = {};
    $scope.action = {};
    $scope.fnSet={
        formatStamp:function(timestamp) {
            if(!timestamp){return ''}
            var date = new Date(Number(timestamp)),
                Y = date.getFullYear() + '-',
                M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-',
                D = (date.getDate() < 10 ? '0'+(date.getDate()) : date.getDate()) + ' ',
                h = (date.getHours() < 10 ? '0'+(date.getHours()) : date.getHours()) + ':',
                m = (date.getMinutes() < 10 ? '0'+(date.getMinutes()) : date.getMinutes()) + ':',
                s = (date.getSeconds() < 10 ? '0'+(date.getSeconds()) : date.getSeconds());
                return Y+M+D+h+m+s;
        }
    };
    //金额绑定
    $scope.$watch('form.redAmount',  function(newValue, oldValue) {
        if($scope.form.redCount){
            $scope.upperMoney=tools.toChineseCharacters($scope.form.redAmount*$scope.form.redCount);
        }else{
            $scope.upperMoney='零';
        }
    });
    $scope.$watch('form.redCount',  function(newValue, oldValue) {
        if($scope.form.redAmount){
            $scope.upperMoney=tools.toChineseCharacters($scope.form.redAmount*$scope.form.redCount);
        }else{
            $scope.upperMoney='零';
        }
    });
    $scope.$watch('form.fullCutAmount',function(newValue,oldValue){
        if($scope.form.fullCutAmount){
            $scope.upperMoney2=tools.toChineseCharacters($scope.form.fullCutAmount);
        }else{
            $scope.upperMoney2='零';
        }
    });


    //1.获取产品列表
    $.ajax({
        type: "post",
        url: siteVar.serverUrl + "/xinghuoproduct/getProductList.json",
        data: '',
        dataType: "json",
        success: function(data){
            if(data.success){
                $scope.jsonDataOrigin1=data.data;
                //2.1编辑内容
                if($location.url().indexOf("?") > -1){
                    var urlStr = $location.url().split("?")[1];
                    var urlObj = tools.serializeUrl(urlStr);
                    if(!urlObj.id){
                        alert("参数非法");
                    }
                    $scope.form.id = urlObj.id;
                    //修改标题名称
                    $('#pageTitle').html('编辑红包');
                    //修改列表内容
                    $.ajax({
                        type: "post",
                        url: siteVar.serverUrl + "/xinghuoRedPacketTemplate/get.json",
                        data: {'id':$scope.form.id},
                        dataType: "json",
                        success: function(data){
                            console.log(data);
                            if(data.success){
                                tools.ajaxOpened(self);
                                if(!tools.interceptor(data)) return;
                                $scope.form = data.data;
                                //console.log($scope.form);
                                $scope.$apply(function () {
                                    //选择产品=1 不限产品=2
                                    if($scope.form.applyProductFlag==1){
                                        $('.proFlagRadio2').parent().addClass('checked');$('.proFlagRadio1').parent().removeClass('checked');
                                    }else{
                                        $('.proFlagRadio1').parent().addClass('checked');$('.proFlagRadio2').parent().removeClass('checked');
                                    }
                                    //区间段时间=1;时间长度=2
                                    if($scope.form.effectiveType==1){
                                        $('.timeFlagRadio1').parent().addClass('checked');$('.timeFlagRadio2').parent().removeClass('checked');
                                    }else{
                                        $('.timeFlagRadio2').parent().addClass('checked');$('.timeFlagRadio1').parent().removeClass('checked');
                                    }
                                    //限额活动=1 不限活动=2
                                    Number($scope.form.fullCutAmount)>0?$scope.fullCutOrNot=1:$scope.fullCutOrNot=2;
                                    !$scope.form.fullCutAmount?$scope.form.fullCutAmount='':$scope.form.fullCutAmount;
                                    if($scope.fullCutOrNot==1){
                                        $('.cutFlagRadio1').parent().addClass('checked');$('.cutFlagRadio2').parent().removeClass('checked');
                                    }else{
                                        $('.cutFlagRadio2').parent().addClass('checked');$('.cutFlagRadio1').parent().removeClass('checked');
                                    }
                                    //$scope.form.applyProductFlag==1?$scope.form.applyProductFlag=1:$scope.form.applyProductFlag=2;
                                    //if($scope.form.effectiveType==2){$scope.form.effectiveStartTime=$scope.form.effectiveEndTime=''}
                                    $scope.form.effectiveStartTime=$scope.fnSet.formatStamp($scope.form.effectiveStartTime);                                        $scope.form.effectiveEndTime=$scope.fnSet.formatStamp($scope.form.effectiveEndTime);

                                    //生成修改前列表
                                    //红包已关联活动(status=2)变为只读
                                    if($scope.form.status==2){
                                        $scope.form.statusAct=true;
                                        $scope.initProList=listHandle2($scope.jsonDataOrigin1,$scope.form.productList,$scope.form.id);
                                        //关联活动的时间选择右侧小按钮完全不可点
                                        $('.input-group-btn').off('click').on('click',function (e) {
                                            if($(this).attr("data-disable")){
                                                e.stopPropagation();
                                                return false;
                                            }
                                        });
                                    }else{
                                        $scope.initProList=listHandle($scope.jsonDataOrigin1,$scope.form.productList,$scope.form.id);
                                    }
                                    init();
                                });
                            }
                        },
                        error: function(err){
                            tools.ajaxOpened(self);
                            tools.ajaxError(err);
                        }
                    });
                }
                //2.2新建内容
                else{
                    $scope.$watch('form.effectiveType',  function(newValue, oldValue) {
                        if($scope.form.effectiveType==1){
                            delete $scope.form.effectiveDays;
                        }else{
                            delete $scope.form.effectiveStartTime;
                            delete $scope.form.effectiveEndTime;
                        }
                    });
                    $scope.initProList=listHandle($scope.jsonDataOrigin1);
                    //默认选择产品
                    $scope.form.applyProductFlag=1;
                    $scope.$apply();
                    //console.log($scope.initProList);
                    init();
                }
            }
        },
        error: function(err){
            tools.ajaxOpened(self);
            tools.ajaxError(err);
        }
    });

    $scope.action = {
        save: function(){
            //基础填写判断
            if(!$scope.form.redName){tools.interalert('请填写红包名称');return}
            if(!$scope.form.redAmount){tools.interalert('请填写单个红包金额');return}
            /*else{
                var regTest1=/^([1-9]\d*|0)(\.\d{1,2})?$/;
                if(!regTest1.test($scope.form.redAmount)){tools.interalert('单个红包金额格式错误');return}
            }*/
            if(!$scope.form.redCount){tools.interalert('请填写红包总数量');return}
            if(!$scope.form.effectiveType){tools.interalert('请选择红包有效期');return}
            if($scope.form.effectiveType){
                if($scope.form.effectiveType==1){
                    if(!$scope.form.effectiveStartTime){tools.interalert('请填写有效期开始时间');return}
                    if(!$scope.form.effectiveEndTime){tools.interalert('请填写有效期结束时间');return}
                    if(Date.parse($scope.form.effectiveEndTime)-Date.parse($scope.form.effectiveStartTime)<0){
                        tools.interalert('活动截至日期必须大于起始日期！');return
                    }
                    delete $scope.form.effectiveDays;
                }else{
                    if(!$scope.form.effectiveDays){tools.interalert('请填写自动触发天数');return}
                    if(Number($scope.form.effectiveDays)>100){tools.interalert('请正确填写自动触发天数');$scope.form.effectiveDays='';return}
                    delete $scope.form.effectiveStartTime;
                    delete $scope.form.effectiveEndTime;
                }
            }
            if($scope.form.applyProductFlag==1&&!($('input[name="productListName"]').val().length)){
                tools.interalert('指定产品不可为空');return;
            }
            if($scope.fullCutOrNot==1){
                if(!(Number($scope.form.fullCutAmount))||Number($scope.form.fullCutAmount)==-1){tools.interalert('请填写使用条件');return;}
            }
            if($scope.fullCutOrNot==2){
                if(!ifLimitConfirm){
                    $modal.open({
                        backdrop: true,
                        backdropClick: true,
                        dialogFade: false,
                        keyboard: true,
                        windowClass:'modal-640',
                        templateUrl: 'confirmNoLimit.html',
                        controller: confirmNoLimit,
                        resolve: {}
                    });
                    return;
                }
                //不限制使用范围
                delete $scope.form.fullCutAmount;
            }
            //搜索内容
            if($('input[name="productListName"]').val().length>0){
                $scope.productListName = $('input[name="productListName"]').val().split(',');
                $scope.productListId = $('input[name="productListId"]').val().split(',');
                $scope.productListCode = $('input[name="productListCode"]').val().split(',');
                var proListArr=function () {
                    $scope.form.productList=[];
                    for(var u=0;u<$scope.productListName.length;u++){
                        $scope.form.productList[u]={};
                        $scope.form.productList[u].productName=$scope.productListName[u];
                        $scope.form.productList[u].productId=$scope.productListId[u];
                        $scope.form.productList[u].productCode=$scope.productListCode[u];
                    }
                    return $scope.form.productList;
                };
                $scope.form.productList=proListArr();
            }
            //console.log($scope.form.applyProductFlag);
            if($scope.form.applyProductFlag==1&&!$scope.form.productList){
                tools.interalert('请选择产品列表内容')
            }
            //JSON字符串化
            $scope.form2=JSON.stringify($scope.form);
            //console.log($scope.form2);
            //编辑接口不用于新建
            if($location.url().indexOf("?id") > -1){
                $.ajax({
                    type: "post",
                    url: siteVar.serverUrl + "/xinghuoRedPacketTemplate/edit.json",
                    data: $scope.form2,
                    contentType : "application/json",
                    dataType : "json",
                    success: function(data){
                        if(data.success){
                            tools.interalert('编辑成功');
                            ifLimitConfirm=0;
                            return history.back(-1);
                        }else{
                            tools.interalert(data.msg);
                            //页面报错完不回跳
                            //return history.back(-1);
                        }
                    },
                    error:function (data) {
                        alert('error');
                        alert(data);
                    }
                })
            }else{
                //console.log($scope.form);
                $.ajax({
                    type: "post",
                    url: siteVar.serverUrl + "/xinghuoRedPacketTemplate/create.json",
                    data: $scope.form2,
                    contentType : "application/json",
                    dataType : "json",
                    success: function(data){
                        if(data.success){
                            tools.interalert('新建成功');
                            ifLimitConfirm=0;
                            return history.back(-1);
                        }else{
                            tools.interalert(data.msg);
                            //页面报错完不回跳
                            //return history.back(-1);
                        }
                    },
                    error:function (data) {
                        //alert('error');
                        alert(data);
                    }
                })
            }
        }
    };
    //确认使用条件不限
    function confirmNoLimit($scope,$modalInstance) {
        //$scope.info=info;
        $scope.close = function() {
            $modalInstance.close();
        };
        $scope.ok=function () {
            ifLimitConfirm=1;
            $modalInstance.close();
        }
    }
    $timeout(function(){
        //$("#redCreate").find("input[type='radio']").uniform();
    }, 0);
}