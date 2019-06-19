import "../css/riskInfo.less";
import $ from 'jquery'
import {Tools, G} from "COMMON/js/common";


/**
 * -------------------------------------------test----------------开发
 * **/
//
// let loginData = {"token":"2d8834f1e1e95f3814596d9d23060fb1","sign":"27E81689FE9F04300E458EFB01451BE7","appid":"8aead9a64cc04c8b014cc04c8b1e0000"}
//
// function test() {
//     return Tools.AJAX({
//         url: G.base + "/capp/customer/riskList.ason",
//         type:"post",
//         data:{
//             data:JSON.stringify(loginData)
//         }
//     })
// }


/**
 * ---------------------------------------test   end  end  end
 *
 * **/

let wrapperDom = $("#wrapper"),
    RISKINFO = {
        getData:function (lenderId) {
            return Tools.AJAXTOKEN({
                url:G.base + "/capp/customer/riskList.ason",
                type:"post",
                data:{
                    lenderId:lenderId
                }
            });
        },
        renderHtml:function (data) {
            let html = '';
            if(data && data.riskList){
                html = data.riskList.map((item)=>`<dl class="clearfix">
            <dt>${item.riskName}</dt>
            <dd class="${item.riskStatus == 1 ? `active`:''}">${item.ratingLevelStatus}</dd>
        </dl>`).join('');
            }
            return html
        },
        init:function () {
            let params = Tools.queryUrl(location.href),
                lenderId = params.lenderId,
                self = this;
            if(!lenderId){
                return Tools.toast("缺少参数lenderId")
            }
            this.getData(lenderId).then(function (data) {
                if(data.code == "0"){
                    return Tools.toast(data.msg)
                }
               
                let info = data.data,
                    html = self.renderHtml(info);
                var rishTitle=info.lenderName+"-风险测评信息";
                wrapperDom.html(html);
                Tools.setTitle(rishTitle);
            })
        }
    };
RISKINFO.init();

