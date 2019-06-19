$(document).ready(function(){
    //测评结果页面
    var AssessmentResult = {
        submitFlag:true,
        viewReport : function(){
            var self = this;
            $(".lookSignedPDF").on("click", function(){
                var url = $(this).attr("pdf-url");
                if(self.submitFlag){
                    self.submitFlag = false;
                    $.ajax({
                        url:url,
                        type:"GET",
                        success:function(data){
                            if(data.code == 1){
                                window.location.href = data.data;
                            }else{
                                self.toast(data.msg);
                            };
                            self.submitFlag = true;
                        },
                        error: function () {
                            self.submitFlag = true;
                        }
                    });
                };
                return false;
            })
        },
        _creatToast:function(){
            var tips = document.querySelector(".tipsBox"), body = document.querySelector("body"), html = "";
            if(!tips){
                tips = document.createElement("div");
                tips.style.cssText = "display:block;";
                tips.className = "tipsBox";
                body.appendChild(tips)
            };
            return tips;
        },
        showToast:function(){
            var self = this, toast = self._creatToast();
            toast.style.display = "block";
        },
        hideToast:function(){
            var self = this, toast = self._creatToast();
            toast.style.display = "none";
        },
        toast:function(content){
            var self = this, toast = self._creatToast();
            toast.innerHTML  = content;
            self.showToast();
            var timer = setTimeout(function(){
                self.hideToast();
                clearTimeout(timer);
            }, 2000)
        },
        init:function(){
            this.viewReport();
        }
    };
    AssessmentResult.init();
});
