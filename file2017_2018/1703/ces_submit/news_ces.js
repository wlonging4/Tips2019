/**
 * Created by zol on 2017/3/16.
 */
$(function () {
    var a = $(".upload-route"), A = $(".upload-button"), v = $("#file-path"), r = $("#file-topic"), g = $("#select-file"), h = $("#img-msg");
    var E = {
        btnObj: $("#select-img"),
        flash_url: "http://uppic.fd.zol-img.com.cn/swfupload.swf",
        module: "common",
        btnWidth: 80,
        btnHeight: 80,
        single: 1,
        fileSizeLimit: "20 MB",
        fileQueueError: function (F, H, G) {
            if (H == "-110") {
                alert("\u56fe\u7247\u8d85\u51fa20M,\u8bf7\u8c03\u6574\u540e\u4e0a\u4f20")
            }
            if (H == "-130") {
                alert("\u56fe\u7247\u683c\u5f0f\u4e0d\u6b63\u786e,\u8bf7\u8c03\u6574\u540e\u4e0a\u4f20")
            }
        },
        callback: function (G) {
            if (!G) {
                alert("\u56fe\u7247\u4e0d\u7b26\u5408\u8981\u6c42")
            }
            if (G.width < 1920) {
                alert("\u8bf7\u4e0a\u4f20\u63d0\u540d\u4ea7\u54c1\u7684\u7167\u7247\uff0c\u5efa\u8bae\u5c3a\u5bf8\u4e0d\u5c0f\u4e8e1920x1080\nPhoto of the nominated product, larger than 1920x1080");
                return false
            }
            if (G.height < 1080) {
                alert("\u8bf7\u4e0a\u4f20\u63d0\u540d\u4ea7\u54c1\u7684\u7167\u7247\uff0c\u5efa\u8bae\u5c3a\u5bf8\u4e0d\u5c0f\u4e8e1920x1080\nPhoto of the nominated product, larger than 1920x1080");
                return false
            }
            C($("#img-msg"), 1);
            $("#upload-img").html("");
            $("#upload-img-box").hide();
            var H = "http://up.fd.zol-img.com.cn/" + G.filename;
            var F = "<span class='upload-pic'><img src='" + H + "' width='80' height='80'><span class='icon'></span></span>";
            $("#show_img_box").show();
            $("#show_img").html(F);
            $("#img-msg").attr("rel", G.filename)
        }
    };
    $("#select-img").uploadInput(E);
    $("#show_img").on("click",'.icon', function () {
        $("#img-msg").attr("rel", "");
        var G = "<span id='select-img'></span>";
        $("#upload-img").html(G);
        $("#show_img").html("");
        $("#upload-img-box").show();
        var F = {
            btnObj: $("#select-img"),
            flash_url: "http://uppic.fd.zol-img.com.cn/swfupload.swf",
            module: "common",
            btnWidth: 80,
            btnHeight: 80,
            single: 1,
            fileSizeLimit: "20 MB",
            fileQueueError: function (H, J, I) {
                if (J == "-110") {
                    alert("\u6587\u4ef6\u8d85\u51fa20M,\u8bf7\u8c03\u6574\u540e\u4e0a\u4f20")
                }
                if (J == "-130") {
                    alert("\u6587\u4ef6\u683c\u5f0f\u4e0d\u6b63\u786e,\u8bf7\u8c03\u6574\u540e\u4e0a\u4f20")
                }
            },
            callback: function (I) {
                if (!I) {
                    alert("\u56fe\u7247\u4e0d\u7b26\u5408\u8981\u6c42")
                }
                if (I.width < 1920) {
                    alert("\u8bf7\u4e0a\u4f20\u63d0\u540d\u4ea7\u54c1\u7684\u7167\u7247\uff0c\u5efa\u8bae\u5c3a\u5bf8\u4e0d\u5c0f\u4e8e1920x1080\nPhoto of the nominated product, larger than 1920x1080");
                    return false
                }
                if (I.height < 1080) {
                    alert("\u8bf7\u4e0a\u4f20\u63d0\u540d\u4ea7\u54c1\u7684\u7167\u7247\uff0c\u5efa\u8bae\u5c3a\u5bf8\u4e0d\u5c0f\u4e8e1920x1080\nPhoto of the nominated product, larger than 1920x1080");
                    return false
                }
                C($("#img-msg"), 1);
                $("#upload-img").html("");
                $("#upload-img-box").hide();
                var J = "http://up.fd.zol-img.com.cn/" + I.filename;
                var H = "<span class='upload-pic'><img src='" + J + "' width='80' height='80'><span class='icon'></span></span>";
                $("#show_img_box").show();
                $("#show_img").html(H);
                $("#img-msg").attr("rel", I.filename)
            }
        };
        $("#select-img").uploadInput(F)
    });
    $("#chinese-btn").on("click", function () {
        $(this).addClass("now");
        $("#english-btn").removeClass("now");
        $("#chinese-page").show();
        $("#english-page").hide()
    });
    $("#english-btn").on("click", function () {
        $(this).addClass("now");
        $("#chinese-btn").removeClass("now");
        $("#english-page").show();
        $("#chinese-page").hide()
    });
    $("#Instruction-btn").on("click", function () {
        $(this).addClass("now");
        $("#Submit-btn").removeClass("now");
        $("#Instruction-page").show();
        $("#submit-page").hide()
    });
    $("#Submit-btn").on("click", function () {
        $(this).addClass("now");
        $("#Instruction-btn").removeClass("now");
        $("#submit-page").show();
        $("#Instruction-page").hide()
    });
    $("#chinese-submit,#english-submit,#head-submit").on("click", function () {
        $("#Submit-btn").addClass("now");
        $("#Instruction-btn").removeClass("now");
        $("#submit-page").show();
        $("#Instruction-page").hide();
        $(window).scrollTop("0")
    });
    $("#money-type").change(function () {
        if ($(this).val() == "null") {
            $("#money").attr("disabled", true)
        } else {
            $("#money").attr("disabled", false)
        }
    });
    $("#Description").focus(function () {
        $(this).siblings("p").hide()
    });
    $("#Description").blur(function () {
        if ($(this).val() == "") {
            $(this).siblings("p").show()
        }
    });
    $(".fixed-nav-items").on("click", "a", function () {
        $(this).parent().addClass("current").siblings().removeClass()
    });
    $(window).on("scroll", function () {
        if ($(window).scrollTop() > 378) {
            $("#logo").css({position: "fixed", top: "0"})
        } else {
            $("#logo").css({position: "absolute", top: "378px"})
        }
        if ($(window).scrollTop() < 659) {
            d(1)
        }
        if ($(window).scrollTop() > 659 && $(window).scrollTop() < 820) {
            d(2)
        }
        if ($(window).scrollTop() > 820 && $(window).scrollTop() < 1378) {
            d(3)
        }
        if ($(window).scrollTop() > 1378 && $(window).scrollTop() < 1787) {
            d(4)
        }
        if ($(window).scrollTop() > 1787 && $(window).scrollTop() < 2128) {
            d(5)
        }
        if ($(window).scrollTop() > 2128) {
            d(6)
        }
    });
    function d(F) {
        $("#change-nav-" + F).addClass("current").siblings().removeClass();
        $("#english-nav-" + F).addClass("current").siblings().removeClass()
    }

    var B = '<span class="wrong"></span>', m = '<span class="ture"></span>', l = '<em class="error-tip">\u4fe1\u606f\u6709\u8bef\uff0c\u8bf7\u91cd\u65b0\u586b\u5199/Information is incorrect, please re-fill</em>', w = $("#Booth-Number"), n = $("#Brand"), p = $("#Product-Name"), s = $("#img-msg"), c = $("#Description"), z = $("#year"), y = $("#month"), i = $("#money"), o = $("#money-type"), D = $("#file-path"), q = $("#Corporate-name"), b = $("#Name"), f = $("#phone"), x = $("#Email"), t = $("#more-checked"), j = $(".publishStatus");
    $("#submit-all").on("click", function () {
        var G = true;
        if (w.val() == "" || ischinese($(this).val()) > 50) {
            k(w);
            G = false
        }
        if (n.val() == "" || ischinese($(this).val()) > 50) {
            k(n);
            G = false
        }
        if (p.val() == "" || ischinese($(this).val()) > 50) {
            k(p);
            G = false
        }
        if (c.val() == "" || ischinese($(this).val()) > 500) {
            k(c);
            G = false
        }
        if (q.val() == "" || ischinese($(this).val()) > 50) {
            k(q);
            G = false
        }
        if (b.val() == "" || ischinese($(this).val()) > 50) {
            k(b);
            G = false
        }
        if (f.val() == "" || ischinese($(this).val()) > 50) {
            k(f);
            G = false
        }
        if (x.val() == "" || ischinese($(this).val()) > 50) {
            k(x);
            G = false
        }
        if (D.attr("rel") == "") {
            k(D);
            G = false
        }
        if (s.attr("rel") == "") {
            k(s);
            G = false
        }
        if (!e()) {
            k(t);
            G = false
        }
        if (!u()) {
            k($(".radio-box"));
            G = false
        }
        if (!G) {
            $("#submit-top").show();
            return false
        }
        var F = {
            BoothNumber: w.val(),
            Brand: n.val(),
            ProductName: p.val(),
            imgMsg: s.attr("rel"),
            Description: c.val(),
            year: z.val(),
            month: y.val(),
            money: i.val(),
            moneyType: o.val(),
            filePath: D.attr("rel"),
            CorporateName: q.val(),
            Name: b.val(),
            phone: f.val(),
            Email: x.val(),
            moreChecked: e(),
            publishStatus: u()
        };
        $.ajax({
            type: "post",
            url: "http://dynamic.zol.com.cn/channel/set_submit_info.php?time=" + (new Date()).valueOf(),
            data: F,
            dataType: "jsonp",
            error: function () {
                alert("\u7cfb\u7edf\u7e41\u5fd9\u8bf7\u7a0d\u540e\u518d\u8bd5")
            },
            success: function (H) {
                if (H.result == 1) {
                    alert("\u4f60\u5df2\u63d0\u4ea4\u6210\u529f")
                } else {
                    alert("\u7cfb\u7edf\u7e41\u5fd9\u8bf7\u7a0d\u540e\u518d\u8bd5")
                }
            }
        })
    });
    w.blur(function () {
        if ($(this).val() != "") {
            if (ischinese($(this).val()) > 50) {
                alert("\u5c55\u4f4d\u53f7\u4e0d\u5f97\u8d85\u8fc725\u4e2a\u5b57");
                k($(this));
                return
            }
            C($(this))
        }
    });
    n.blur(function () {
        if ($(this).val() != "") {
            if (ischinese($(this).val()) > 50) {
                alert("\u5382\u5546\u540d/\u54c1\u724c\u4e0d\u5f97\u8d85\u8fc725\u4e2a\u5b57");
                k($(this));
                return
            }
            C($(this))
        }
    });
    p.blur(function () {
        if ($(this).val() != "") {
            if (ischinese($(this).val()) > 50) {
                alert("\u4ea7\u54c1\u540d\u79f0\u4e0d\u5f97\u8d85\u8fc725\u4e2a\u5b57");
                k($(this));
                return
            }
            C($(this))
        }
    });
    c.blur(function () {
        if ($(this).val() != "") {
            if (ischinese($(this).val()) > 500) {
                alert("\u4ea7\u54c1\u8bf4\u660e\u4e0d\u5f97\u8d85\u8fc7250\u4e2a\u5b57");
                k($(this));
                return
            }
            C($(this))
        }
    });
    q.blur(function () {
        if ($(this).val() != "") {
            if (ischinese($(this).val()) > 50) {
                alert("\u516c\u53f8\u540d\u79f0\u4e0d\u5f97\u8d85\u8fc725\u4e2a\u5b57");
                k($(this));
                return
            }
            C($(this))
        }
    });
    b.blur(function () {
        if ($(this).val() != "") {
            if (ischinese($(this).val()) > 50) {
                alert("\u59d3\u540d\u4e0d\u5f97\u8d85\u8fc725\u4e2a\u5b57");
                k($(this));
                return
            }
            C($(this))
        }
    });
    f.blur(function () {
        if ($(this).val() != "") {
            if (ischinese($(this).val()) > 50) {
                alert("\u8054\u7cfb\u7535\u8bdd\u4e0d\u5f97\u8d85\u8fc725\u4e2a\u5b57");
                k($(this));
                return
            }
            C($(this))
        }
    });
    x.blur(function () {
        if ($(this).val() != "") {
            if (ischinese($(this).val()) > 50) {
                alert("\u90ae\u7bb1\u4e0d\u5f97\u8d85\u8fc725\u4e2a\u5b57");
                k($(this));
                return
            }
            C($(this))
        }
    });
    t.on("click", "input", function () {
        if (e()) {
            C($("#more-checked"), 1)
        }
    });
    $(".radio-box").on("click", "input", function () {
        if (u()) {
            C($(".radio-box"), 1)
        }
    });
    function k(F) {
        if (F.siblings(".wrong").size() < 1) {
            $("#" + F.attr("id")).after(l).after(B);
            F.css({border: "1px solid red"}).siblings(".ture").remove();
            return false
        }
    }

    function C(G, F) {
        if (G.siblings(".ture").size() < 1) {
            if (F) {
                G.siblings(".wrong,em").remove();
                G.css({border: "0px"})
            } else {
                $("#" + G.attr("id")).after(m);
                G.siblings(".wrong,em").remove();
                G.css({border: "1px solid #ccc"})
            }
        }
    }

    function e() {
        var F;
        $("#more-checked input").each(function () {
            if ($(this).attr("checked") == "checked") {
                F = $(this).attr("rel")
            }
        });
        return F
    }

    function u() {
        var F;
        if ($("#published1").attr("checked") == "checked") {
            F = $("#published1").attr("rel")
        } else {
            if ($("#published2").attr("checked") == "checked") {
                F = $("#published2").attr("rel")
            } else {
                F = ""
            }
        }
        return F
    }
});
function nbFileName(a) {
    if (a) {
        $("#file-path").attr("rel", a);
        allRemoveWrongMsg($("#file-path"))
    }
}
function allRemoveWrongMsg(b, a) {
    if (b.siblings(".ture").size() < 1) {
        if (a) {
            b.siblings(".wrong,em").remove();
            b.css({border: "0px"})
        } else {
            $("#" + b.attr("id")).after('<span class="ture"></span>');
            b.siblings(".wrong,em").remove();
            b.css({border: "1px solid #ccc"})
        }
    }
}
function errorFileName(a) {
    if (a == "error") {
        allFormSubmitStatus($("#file-path"))
    }
}
function allFormSubmitStatus(a) {
    if (a.siblings(".wrong").size() < 1) {
        $("#" + a.attr("id")).after('<em class="error-tip">\u4fe1\u606f\u6709\u8bef\uff0c\u8bf7\u91cd\u65b0\u586b\u5199/Information is incorrect, please re-fill</em>').after('<span class="wrong"></span>');
        a.css({border: "1px solid red"}).siblings(".ture").remove();
        return false
    }
}
function ischinese(b) {
    count = 0;
    if (!b) {
        return count
    }
    for (var a = 0; a < b.length; a++) {
        if (b.charCodeAt(a) >= 10000 || b == "%u2dc0") {
            count = count + 2
        } else {
            count = count + 1
        }
    }
    return count
};