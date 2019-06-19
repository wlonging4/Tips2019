import "../css/staffProtocolApp.less";
import $ from "jquery";
import {Tools,G} from "COMMON/js/common";

/*let loginData = {
    "appReqData": {
        "productId": 300000287299197
    },
    "appVersion": "3.0.1",
    "appid": "8aead9a64cc04916014cc049169d0000",
    "deviceIdentifier": "finance_c10d9599-1c6d-492b-8ef7-32dad950cd10",
    "orgCode": "3636346132616633316162613461363338623463",
    "orgId": "h7kuLlAS4mXevdJDxYOOYA==",
    "sign": "D49DC13E51E12CA7C4112743C1298D7F",
    //"token": "7b2797cbb55ac43161e4f1bafba61eed:1",
    "token": "5389bf1c030380d0e9085f25f83ca078:1",
    "version": "2.0.0"
};*/

Tools.getUserInfo().then(function (data) {
    return Tools.AJAX({
        url: G.base + "/protocol/getStaffProtocol.json",
        type:"post",
        data:{
            token:data.token
            //token:loginData.token
        }
    })
}).then(function (res) {
    if(res.code!=1){
        Tools.toast('数据请求有误！请重试！');return;
    }
    //判断有无协议ID
    if(!res.data.staffProtocol){
        return;
    }
    $('.xieyi_box').removeClass('hide');
    let data=res.data;
    $('#id').html(data.userId);
    $('#realName').html(data.realName);
    $('#documentNo').html(data.documentNo);
    $('#mobile').html(data.mobile);
    $('#email').html(data.email);
    $('#realName2').html(data.realName);
    $('#bankName').html(data.bankName);
    $('#cardNo').html(data.cardNo);
});
