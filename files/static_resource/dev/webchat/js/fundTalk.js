var fundTalk={
	init:function(domObj){
		this.cursor=domObj;
		this.list();
	},
	listHtml:function(dataList){
		var appendhtml=[]
		dataList.map(function(item){
			appendhtml.push([
						'<li>',
				             '<a href="'+ (item.outUrl ? item.outUrl:"javascript:void(0);") +'">',
				                '<strong>'+ (item.periods?item.periods:"")+'</strong><span>'+(item.createtime?item.createtimeStr:"")+'</span>',
				                '<div class="clear"></div>',
				                '<h2>'+(item.title?item.title:'')+'</h2>',
				                '<p>主讲人：'+(item.speaker?item.speaker:'')+'</p>',
				            '</a>',
				       ' </li>'
					].join(''))
		});
		return appendhtml.join('');
		
	},
	list:function(){
		var self=this;
		$.ajax({
	        url: '/mobile/webchat/fundtalkData.shtml',
	        type: 'get',
	        async: true,
	        dataType: 'JSON',
	        cache:false,
	        success: function (result) {	
				var appendHtml=self.listHtml(result);
				self.cursor.innerHTML=appendHtml;  
	        },
	        error: function(e) {
	        	
	        }
	    })
		
	}
	
}

window.onload=function(){
	var fundTalkObj=Object.create(fundTalk);
	var domObj=document.querySelector(".menu");
	fundTalkObj.init(domObj);
}
