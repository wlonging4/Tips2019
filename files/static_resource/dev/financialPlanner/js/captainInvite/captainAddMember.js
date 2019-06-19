var captainAddMember={
	validator:function(){
		var validators = new InputValidators();
		validators.importStategies(validationStrategies);
		
		var nameInput=document.querySelector(".nameInput");
		var nameInputVal=nameInput.value;
		var phoneInput=document.querySelector(".phoneInput");
		var phoneInputVal=phoneInput.value;
		
		
		
		validators.addValidator("isPhoneNum",phoneInput,"手机号码格式不正确",phoneInputVal);
		validators.addValidator("isNoEmpty",phoneInput,"手机号码不能为空",phoneInputVal);
		validators.addValidator("isNoEmpty",nameInput,"成员姓名不能为空",nameInputVal);
		
		
		
		return validators.check();
	},
	saveBtnClick:function(){
		var self=this;
		self.validator()
		if(!self.validator()){
			return;
		}
		var nameInput=document.querySelector(".nameInput");
		var nameInputVal=nameInput.value;
		var phoneInput=document.querySelector(".phoneInput");
		var phoneInputVal=phoneInput.value;
		var postData={"token":token,"membername":nameInputVal,"membermobile":phoneInputVal};
		Loading.show();
		$.ajax({
	        url: '/managerteam/api/add.json',
	        type: 'post',
	        async: true,
	        dataType: 'JSON',
	        data:postData,
	        cache:false, 
	        success: function (result) {
	        	Loading.hide();
	            if (result.code== "1"){
	            	Tips.show("添加成功");
	            	setTimeout(function(){
						share(phoneInputVal);
					},1900);
	            }else{
	            	Tips.show(result.msg);
	            }
	        },
	        error: function(e) {
	        	Loading.hide();
	        	Tips.show(e);
	        }
	    })
		
		
	},
	getQueryString:function(name){
	    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"); 
	    var r = window.location.search.substr(1).match(reg); 
	    if (r != null) return unescape(r[2]); 
	    return null; 
	} 
}

window.onload=function(){
	setWebTitle("添加团队成员"); 
	setNoAppBtn();
	
	
	appUserId=captainAddMember.getQueryString("userid");
	appPhoneNumber=captainAddMember.getQueryString("phoneNumber");
	token=captainAddMember.getQueryString("token");
	Loading.init();
	Tips.init();

	var saveBtn =document.querySelector(".saveShare");
	
	saveBtn.addEventListener("click",function(){
		captainAddMember.saveBtnClick();
	})
}