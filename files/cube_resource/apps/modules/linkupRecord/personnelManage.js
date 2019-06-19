/**
 * Created by yanzhong1 on 2017/4/19.
 */
'use strict';
function personnelManage($scope,$modal) {
    $scope.list = [
        {
            name:"王五",
            id:"123132"
        },
        {
            name:"李四",
            id:"12465"
        },
        {
            name:"张三",
            id:"123133"
        }
    ];
    /*添加人员*/
    var staffCtrl = function($scope, $modalInstance){
        $scope.result = {};
        $scope.verifyName = function(e){
            var target = e.currentTarget,value = $(target).val();
            var reg = /^[\u4E00-\u9FA5]{2,5}(?:·[\u4E00-\u9FA5]{2,5})*$/;
            var str = reg.test(value);
            if(str){
                $(target).val(value)
            }else{
                $(target).val('')
            }

        };
        $scope.verifyMail = function(e){
            var target = e.currentTarget,value = $(target).val();
            var reg = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
            var str = reg.test(value);
            if(str){
                $(target).val(value)
            }else{
                $(target).val('')
            }
        };
        $scope.ok = function() {
            var len=0;
            for(var i in $scope.result){
                len ++;
            };
            if(len !=3){
                alert('添加人员列表有没填写的字段，请填写完整！');
                return;
            }else{
                for(var item in $scope.result){
                    if($scope.result[item] == ""){
                        if( item == 'type'){
                            alert('角色不能为空！')
                        }else if(item == 'name'){
                            alert('添加人员姓名不能为空！')
                        }else if(item == 'Email'){
                            alert('添加邮箱不能为空！')
                        }
                        return;
                    }
                }
            }

            console.log($scope.result);
        };
        $scope.close = function() {
            $modalInstance.close();
        };
    };
    $scope.action.staff = function(){
        $modal.open({
            backdrop: true,
            backdropClick:true,
            dialogFade:false,
            keyboard:true,
            templateUrl:'staffCtrl.html',
            controller:staffCtrl,
            windowClass:'modal-640'
        });
    };
    /*
     * 删除
     * */
    var personDeleteCtrl = function($scope, $modalInstance,$timeout){
        $timeout(function(){
            $scope.del=$('span[data-delete="delete"]').parents('.list-group-item').text();
            $scope.id = $('span[data-delete="delete"]').attr("data-id");
        },0);
        $scope.ok = function() {
            //delete $scope.list[$scope.id];
            $modalInstance.close();
            $('span[data-delete="delete"]').parents('.list-group-item').remove();
        };
        $scope.close = function() {
            $modalInstance.close();
        };
    };
    $scope.action.personDelete = function(){
        $modal.open({
            backdrop: true,
            backdropClick:true,
            dialogFade:false,
            keyboard:true,
            templateUrl:'personDeleteCtrl.html',
            controller:personDeleteCtrl,
            windowClass:'modal-640'
        });
    };
    $(function(){
        $(document).on('click','.js-pm-del',function(){
            $('.js-pm-del',document).removeAttr('data-delete');
            $(this).attr('data-delete','delete');
        })
    })
}