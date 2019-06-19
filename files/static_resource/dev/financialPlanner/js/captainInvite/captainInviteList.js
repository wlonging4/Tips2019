var captainInviteList={
	statuClickBtn:function(){
		var self=this;
		var item=arguments[0]
		var memberstatus=item.memberstatus; //用户状态
		var cardbank=item.cardbank;	//绑定银行卡状态
		var code=item.code?item.code:"";	//邀请code
		var docvalidated=item.docvalidated?item.docvalidated:"";	//是否实名
		var cardbankNum=item.cardbank?"1":"0";
		var docvalidatedNum=docvalidated?"1":"";
		statuClickBtn={
			"10":'<span onclick="share('+item.membermobile+');">邀请</span>',
			"20":'<span class="js_statu"  data-statu="statu1" onclick="dialogShowBox(\'statu1\');">请使用入驻码：'+code+'开通</span>',
			"201":'<span class="js_statu"  data-statu="statu2" onclick="dialogShowBox(\'statu2\');" >请使用入驻码：'+code+'开通</span>',
			"30":'<span class="js_statu" data-statu="statu3"  onclick="dialogShowBox(\'statu3\');">未绑定银行卡</span>',
			"31":'<span class="js_statu" data-statu="statu4" onclick="dialogShowBox(\'statu4\');" >已绑定银行卡</span>',
			"40":'<span class="js_del" data-memberid="'+item.id+'" onclick="delMemberFn('+ item.id+');" >删除</span>',
		}
		var statu=memberstatus+cardbankNum+docvalidatedNum+"";
		/*statu 团员状态+是否绑定银行卡+docvalidated*/
		var btnHtml=statuClickBtn[statu];
	
		return btnHtml;
	},
	phoneAsterisk:function(phoneNum){
		 var phoneStr = phoneNum.substr(0, 3) + '****' + phoneNum.substr(7);  
		 return phoneStr;
	},
	listHtml:function(data){
		var self=this;
		var memberstatusObj={"1":"已经邀请未注册","2":"已注册，未开通工作室","3":"已开通工作室","4":"已加入其他团队"};
		var dataHtmlArray=[];
		data.forEach(function(dataItem){
			var item=dataItem
			var itemHtml=[
				'<div class="item memberid'+item.id+'">',
				'		<div class="itemCon">',
				'			<div class="imgBox">',
				'				<img src="'+(item.avatar?item.avatar:"../../financialPlanner/images/captainInvite/defaultHeadPortrait.png")+'" alt="头像">',/*images/defaultHeadPortrait.png*/
				'			</div>',
				'		</div>',
				'		<div class="itemCon">',
				'			<div class="nickName">'+item.membername+'</div>',
				'			<div class="phoneNum">'+self.phoneAsterisk(item.membermobile)+'</div>',
				'		</div>',
				'		<div class="itemCon">',
				'			<div class="inviteStatus">'+memberstatusObj[item.memberstatus]+'</div>',
				'			<div class="inviteAction">'+self.statuClickBtn(item)+'</div>',
				'		</div>',
						
				'	</div>'
			].join('');
			dataHtmlArray.push(itemHtml);
			
		})
		
		return dataHtmlArray.join('');
	},
	listLoad:function(){
		var self=this;
		var header=document.querySelector(".header");
		var container=document.querySelector(".inviteList");
		Loading.show();
		$.ajax({
	        url: '/managerteam/api/list.json?token='+token,
	        type: 'get',
	        async: true,
	        dataType: 'JSON',
	        cache:false, 
	        success: function (result) {
	        	Loading.hide();
	            if (result.code== "1"){
	            	var headerHtml=self.captainInfoHtml(result.data);
	            	header.innerHTML=headerHtml;
	               	var appendHtml=self.listHtml(result.data.list);
	              	container.innerHTML=appendHtml;
	              	loadAfter();/*绑定点击弹窗*/
	            }else{
	            	/*Tips.show(result.msg);*/
	            }
	        },
	        error: function(e) {
	        	Loading.hide();
	        	/*Tips.show(e);*/
	        }
	    })
		
		
	},
	delMember:function(memberid){
		var self=this;
		var container=document.querySelector(".inviteList");
		Loading.show();
		$.ajax({
	        url: '/managerteam/api/delete.json',
	        type: 'post',
	        data:{"id":memberid},
	        async: true,
	        dataType: 'JSON',
	        cache:false, 
	        success: function (result) {
	        	Loading.hide();
	            if (result.code== "1"){
	            	$(".memberid"+memberid).remove();
	            }else{
	            	/*Tips.show(result.msg);*/
	            }
	        },
	        error: function(e) {
	        	Loading.hide();
	        	/*Tips.show(e);*/
	        }
	    })
	},
	captainInfoHtml:function(data){
		realnameStr=data.realname;
		setCookie("realnameStr",realnameStr);
		nicknameStr=data.nickname?data.nickname:"";
		setCookie("nicknameStr",nicknameStr);
		var dataHtml=[
				'<div class="headPortrait">',
				'	<div class="imgBox">',
				'		<img src="'+(data.avatar?data.avatar:"../../financialPlanner/images/captainInvite/defaultHeadPortrait.png")+'" alt="头像">',
				'	</div>',
				'	<div class="nickName">'+data.realname+'</div>',
				'</div>',
				'<div class="captainInfo">',
				'	<div class="tit">团队成员 </div>',
				'	<div class="cList">',
				'		<ul>',
				'			<li><label>已邀请：</label><div class="numBox"><span class="num">'+(data.membercount?data.membercount:"0")+'</span>&nbsp;人</div></li>',
				'			<li><label>已开通：</label><div class="numBox"><span class="num">'+(data.hasopenstore?data.hasopenstore:"0")+'</span>&nbsp;人</div></li>',
				'		</ul>',
				'	</div>',
				'</div>'
			
		].join('');
			
		return dataHtml;
	},
	init:function(){
		var self=this;
		self.listLoad();
	}
}
var statu1Dialog,statu2Dialog,statu3Dialog,statu4Dialog;
var dialogDom=document.querySelector(".dialogBox");
function dialogShowBox(action){
	var actionObj=eval(action+"Dialog");
	actionObj.show();
}
function delMemberFn(memberid){
	captainInviteList.delMember(memberid);
}
function loadAfter(){
	statu1Dialog=new Dialog({"dialogBox":dialogDom,"statuClass":"statu1"});
	statu2Dialog=new Dialog({"dialogBox":dialogDom,"statuClass":"statu2"});
	statu3Dialog=new Dialog({"dialogBox":dialogDom,"statuClass":"statu3"});
	statu4Dialog=new Dialog({"dialogBox":dialogDom,"statuClass":"statu4"});
}

function captainAddMemberLink(){
	var captainAddMemberBtn=document.querySelector(".captainAddMember")
	var linkStr="captainAddMember.html?userid="+appUserId+"&phoneNumber="+appPhoneNumber+"&token="+token;
	captainAddMemberBtn.setAttribute("href",linkStr);
}
function getUerCallBack(){
	onloadNum= parseInt(getCookie('onloadNum'))+1;
	setCookie('onloadNum',onloadNum);
	
	
	captainAddMemberLink()
	captainInviteList.init();
}
window.onload=function(){
	setWebTitle("邀请团队成员"); //app标题
	setAppBtn();
	getUserInfo(getUerCallBack);
	
	
	Tips.init();
	Loading.init();
	if(token!=="" && token!==undefined  && token!==null && onloadNum!=0){
	 	getUerCallBack();
	}
}


