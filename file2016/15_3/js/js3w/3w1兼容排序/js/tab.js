var oTab=document.getElementById("tab");
var tHead=oTab.tHead;
var tBody=oTab.tBodies[0];
var oThs=tHead.getElementsByTagName("th");
//1、数据绑定:循环dataAry,然后把对应的标签分别的添加到我们的页面中
var initData=function(){
    if(!dataAry){
        return;
    }
    var frg=document.createDocumentFragment();
    for(var i=0;i<dataAry.length;i++){
        //初始化默认的数据值
        var curItem=dataAry[i];
        curItem.name=curItem.name||"--";
        curItem.age=curItem.age||"--";
        curItem.score=curItem.score||"--";
        curItem.sex=curItem.sex===0?"女":"男";
        //创建行和列并且添加到页面中
        var oTr=document.createElement("tr");
        for(var key in curItem){
            var oTd=document.createElement("td");
            oTd.innerHTML=curItem[key];
            oTr.appendChild(oTd);
        }
        frg.appendChild(oTr);
    }
   tBody.appendChild(frg);
};
initData();
//2、隔行变色
var changeBg= function () {
    var oRows=tBody.rows;
    for(var i=0;i<oRows.length;i++){
        oRows[i].className=i%2===1?"bg":null;
    }
};
changeBg();
//3、表格排序
var sortList= function (index) {
    //index:告诉我当前是哪一列排序,就把当前列的索引传递给我
    var ary=utils.listToArray(tBody.rows);
        ary.sort(function (a,b) {
            var cur= a.cells[index].innerHTML;
            var next= b.cells[index].innerHTML;
            var curNum=parseFloat(cur);
            var nextNum=parseFloat(next);
            return isNaN(curNum)||isNaN(nextNum)?cur.localeCompare(next): curNum-nextNum;
        });
    //设置属性sort来完成点击切换
        if(this.sort==="asc"){
            ary.reverse();
            this.sort="desc";
        }else{
            this.sort="asc";
        }
    //把已经存储的排序方式清掉,这样的话,下一次点击其他的列还是从升序开始;
        for(var i=0;i<oThs.length;i++){
            if(index===i){
                continue;
            }
            oThs[i].sort=null;
        }
    //添加排序号的元素到tbody上
        var frg=document.createDocumentFragment();
        for(i=0;i<ary.length;i++){
            frg.appendChild(ary[i]);
        }
        tBody.appendChild(frg);
        changeBg();
    };
//4、点击执行:给所有具有class="cursor"样式的列绑定点击事件
for(var i=0;i<oThs.length;i++){
    var oTh=oThs[i];
    if(oTh.className==="cursor"){
        oTh.index=i;
        oTh.onclick= function () {
            sortList.call(this,this.index);
        }
    }
}










