/**
 * Created by zol on 2016/8/15.
 */
/*‘ÿ»Îloading*/
window.addEventListener('load', function() {
    //wrapper.style.visibility = "visible";
    document.querySelector('.loading').classList.remove('loading-visible');
});
function addLoadEvent(func) {
    var oldonload = window.onload;
    if (typeof window.onload != 'function') {
        window.onload = func;
    } else {
        window.onload = function() {
            oldonload();
            func();
        }
    }
}

