var container;
var paging;
var notifierScrollDown;

var total;
var index = 0;
const dyToStart = 35;
var offset = {x: 0, y: 0};
var animating = false;
var canSwipe = true;
var rangerThumb = null;
var rangerProgress = null;
var pagesForRanger = null;
var thumbOffset = 0;


function firstTouch(e){
    return e.changedTouches ? e.changedTouches[0] : e;
}

function animate(e){
    offset.y = firstTouch(e).clientY;
    offset.x = firstTouch(e).clientX;

    container.classList.toggle("animating", !(animating = true));
}

function drag(e){
    e.preventDefault();

    var newOffset = {
        y: Math.round(firstTouch(e).clientY - offset.y),
        x: Math.round(firstTouch(e).clientX - offset.x)
    };

    if(canSwipe){
        if(animating){
            container.style.setProperty("--offset", newOffset.y + "px");
        }
    }else{
        if(rangerThumb){
            var ranger = rangerThumb.parentNode;
            rangerProgress = ranger.getElementsByClassName("custom-input-range-ranger-progress")[0];
            var rangerW = ranger.clientWidth;
            var newThumbOffset = (newOffset.x / rangerW * 100 + thumbOffset);
            
            setRangerValue(newThumbOffset, rangerThumb, rangerProgress);

            offset.y = firstTouch(e).clientY;   // prevent from changing page when thumbing

            var pagesId = ranger.parentNode.getAttribute("pages-id");
            pagesForRanger = document.getElementById(pagesId);
            applyRangerPaging(rangerThumb, rangerProgress);
        }
    }
}

function move(e){
    if(animating && canSwipe){
        var dy = firstTouch(e).clientY - offset.y;
        var sign = Math.sign(dy);
        if(Math.abs(dy) > dyToStart){
            if( (index > 0 || sign < 0) && (index < (total-1) || sign > 0) ) {
                paging.children[index].classList.remove("page-indicator-active");
                container.style.setProperty("--index", index -= sign);
                paging.children[index].classList.add("page-indicator-active");
            }

            notifierScrollDown.style.opacity    = index == 0 ? 1.0 : 0.0;
            notifierScrollDown.style.bottom     = index == 0 ? "0" : "-10vh";
        }
        container.style.setProperty("--offset", "0px");
        
        offset.y = 0;
    }
    applyRangerPaging(rangerThumb, rangerProgress, true);
    enableSwipe();
    if(animating){
        container.classList.toggle("animating", !(animating = false));
    }
}

function disableSwipe(){
    canSwipe = false;
}

function enableSwipe(){
    canSwipe = true;
}

function selectThumb(){
    disableSwipe();

    rangerThumb = this;

    thumbOffset = getRangerThumbPosition(rangerThumb);
}

function getRangerThumbPosition(e){
    var v = e.style.left;
    if(v == ""){
        return 0;
    }

    return parseFloat(v);
}

function deselectThumb(){
    applyRangerPaging(rangerThumb, rangerProgress, true);

    rangerThumb = null;

    enableSwipe();
}

function setRangerValue(v, thumb, progress){
    if(v > 100 || v < 0){
        v = (v >= 0 ? "100%" : "0%");
    }else{
        v += "%";
    }

    if(thumb){
        thumb.style.left = v;
    }
    if(progress){
        progress.style.width = v;
    }
}

function applyRangerPaging(thumb, progress, force = false){
    if(thumb && progress){
        var labels = thumb.parentNode.parentNode.getElementsByClassName("custom-input-range-labels")[0];

        var c = labels.children.length-1;
        var pos = getRangerThumbPosition(thumb);
        if(c > 0){
            var step = 100.0 / c;
            for(var i = 0; i < c; i++){
                var leftV = i*step;
                var rightV = (i+1)*step;
                if(leftV < pos && pos <= rightV){
                    var deltaL = Math.abs(pos - leftV);
                    var deltaR = Math.abs(rightV - pos);

                    var page = (deltaL > deltaR ? i+1 : i)
                    var val = (deltaL > deltaR ? rightV : leftV);
                    if(pagesForRanger){
                        pagesForRanger.style.setProperty("--current", page);
                    }

                    if(force){
                        setRangerValue(val, thumb, progress);
                    }
                    return;
                }
            }
        }
    }
}

function moveThumb(e){
    
}

window.onload = function(){
    container = document.getElementsByClassName("container")[0];
    paging = document.getElementsByClassName("paging")[0];
    notifierScrollDown = document.getElementById("notifier-scroll-down");
    total = container.children.length;
    var once = true;
    for(var i = 1; i <= total; i++){
        var indicator = document.createElement("li");
        indicator.className = "page-indicator";
        if(once){
            once = false;
            indicator.className += " page-indicator-active";
        }
        indicator.innerHTML = "К слайду №" + i;
        paging.appendChild(indicator);
    }

    for(var i = 0; i < container.children.length; i++){
        var section = container.children[i];
        section.style.setProperty("--s-index", i);
    }

    container.style.setProperty("--total", total);
    container.addEventListener("mousedown", animate, false);
    container.addEventListener("touchstart", animate, false);
    container.addEventListener("mousemove", drag, false);
    container.addEventListener("touchmove", drag, false);
    container.addEventListener("mouseup", move, false);
    container.addEventListener("touchend", move, false);

    var rangers = document.getElementsByClassName("custom-input-range-ranger");
    for(var i = 0; i < rangers.length; i++){
        var ranger = rangers[i];
        //ranger.addEventListener("mouseover", disableSwipe, false);
        //ranger.addEventListener("mouseout", disableSwipe, false);
        ranger.addEventListener("touchend", enableSwipe, false);
        //ranger.addEventListener("mousemove", drag, false);
        //ranger.addEventListener("touchmove", drag, false);

        var thumb = ranger.getElementsByClassName("custom-input-range-ranger-thumb")[0];
        thumb.addEventListener("mousedown", selectThumb, false);
        thumb.addEventListener("touchstart", selectThumb, false);
        //thumb.addEventListener("mouseout", deselectThumb, false);
        thumb.addEventListener("mouseup", deselectThumb, false);
        thumb.addEventListener("touchend", deselectThumb, false);
    }

    var pages = document.getElementsByClassName("section-pages");
    for(var i = 0; i < pages.length; i++){
        var e = pages[i];
        e.style.setProperty("--total-pages", e.children.length);
    }
}