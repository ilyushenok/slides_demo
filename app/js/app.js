var container;
var paging;
var notifierScrollDown;

var total;
var index = 0;
var offset = 0;
var animating = false;
const dyToStart = 35;

function firstTouch(e){
    return e.changedTouches ? e.changedTouches[0] : e;
}

function animate(e){
    offset = firstTouch(e).clientY;
    container.classList.toggle("animating", !(animating = true));
}

function drag(e){
    e.preventDefault();

    if(animating){
        var newOffset = Math.round(firstTouch(e).clientY - offset);
        container.style.setProperty("--offset", newOffset + "px");
    }
}

function move(e){
    if(animating){
        var dy = firstTouch(e).clientY - offset;
        var sign = Math.sign(dy);
        if(Math.abs(dy) > dyToStart){
            if( (index > 0 || sign < 0) && (index < (total-1) || sign > 0) ) {
                paging.children[index].classList.remove("page-indicator-active");
                container.style.setProperty("--index", index -= sign);
                paging.children[index].classList.add("page-indicator-active");
            }

            notifierScrollDown.style.opacity = index == 0 ? 1.0 : 0.0;
        }
        container.style.setProperty("--offset", "0px");
        container.classList.toggle("animating", !(animating = false));
        offset = 0;
    }
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
}