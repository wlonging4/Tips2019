/**
 * Created by Administrator on 2015/12/14.
 */
//通过ajax把相关数据进行请求,获取所有内容 total->数据总数
//计算一共要显示的条数 totalPage=total/pageNum；
//默认把所有数据的第一页数据展示在外面页面中
//给实现分页的按钮绑定事件,根据当前显示页数把内容区域数据替换
//首先通过ajax获取到数据实现事件委托
var list=document.getElementById('list');
var page=document.getElementById('page');
var pageList=document.getElementById("pageList");

//1.首先通过ajax把我们的数据获取到
var total=0,totalPage=0,pageNum=10,curPage=1;
list.style.height=pageNum*30+'px';
utils.ajax("data.txt", function (data) {
    total=data.length;
    totalPage=Math.ceil(total/pageNum);

    bindData(curPage,data);
    bindPage();
    //4.利用事件委托完成我们的分页切换
    page.onclick=function(e){
        e=e||window.event;
        var tar= e.target|| e.srcElement;
        if(tar.tagName.toLocaleLowerCase()==="li"){
            //点击的是分页的页码
            var page=Number(tar.innerHTML);
            curPage=page;
        }else if(tar.id==="first"){
            curPage=1;
        }else if(tar.id==="last"){
            curPage=totalPage;
        }else if(tar.id==="prev"){
            if(curPage===1){
                return;
            }
            curPage--;
        }else if(tar.id==="next"){
            if(curPage===totalPage){
                return;
            }
            curPage++;
        }else if(tar.id==="search"){
            return;
        }
        bindData(curPage,data);
        changeBg();
    };

    //6.给文本绑定keyup事件,如果按下的是enter键 来实现切换
    var search=document.getElementById("search");
    search.onkeyup= function (e) {
        e=e||window.event;
        if(e.keyCode===13){
            var val=this.value.replace(/(^ +| +$)/g,'');
            if(/^(\d|([1-9]\d+))$/.test(val)){
                if(val<1||val>totalPage){
                    this.value=totalPage;
                    val=totalPage;
                }
                curPage=val;
                bindData(curPage,data);
                changeBg();
            }else{
                this.value="";
                this.focus();
            }
        }
    }
});


//2.动态绑定我们分页的页码
function bindPage(){
    var str='';
    for(var i=1;i<=totalPage;i++){
        var c=i===curPage?'select':null;
        str+='<li class="'+c+'">'+i+'</li>';
    }
    pageList.innerHTML=str;
}


//3.实现主要内容的绑定
//第一页 索引0~9
//第二页 索引10~19
//第三页 索引20~29
//第n页 索引[(n-1)*pageNum]~[n*pageNum-1]
function bindData(page,data) {
    var sIndex = (page - 1) * pageNum, eIndex = page * pageNum - 1;
    var str = '';
    for (var i = sIndex; i <= eIndex; i++) {
        var cur = data[i];
        if (cur) {
            var c = i % 2 === 1 ? "even" : null;
            str += '<li class="' + c + '" num="' + cur["num"] + '">';
            for (var key in cur) {
                var val = key === "sex" ? (cur[key] === 1 ? '男' : '女') : cur[key];
                str += '<span>' + val + '</span>'
            }
            str += '</li>';
        }
    }
    list.innerHTML = str;

//给每一个li绑定点击事件
    var oLis = list.getElementsByTagName('li');
    for (var k = 0; k < oLis.length; k++) {
        oLis[k].onclick = function () {
            window.location.href = 'detail.html?num=' + this.getAttribute('num');
        }
    }
//window.location.href=xxx;在本窗口打开跳转到指定的页面
//var url=window.location.href;获取本页面的url地址
//window.open("地址");在新的窗口跳转新的页面

//实现分页选中样式切换
    function changeBg() {
        var oLis = pageList.getElementsByTagName("li");
        for (var i = 0; i < oLis.length; i++) {
            oLis.className = i === curPage - 1 ? 'select' : null;
            bindData(page, data);
        }
    }
}

//5.实现分页选中样式切换
function changeBg(){
    var oLis=pageList.getElementsByTagName('li');
    for(var i=0;i<oLis.length;i++){
        oLis[i].className=i===(curPage-1)?'select':null;
    }
}