function lazyLoad(){
    let lazy =
        document.getElementsByClassName('lazy');

    for(let i=0; i<lazy.length; i++){
        if(isInViewport(lazy[i])){
            lazy[i].src =
                lazy[i].getAttribute('data-src');
        }
    }
}

function registerListener(event, func) {
    if (window.addEventListener) {
        window.addEventListener(event, func)
    } else {
        window.attachEvent('on' + event, func)
    }
}

function isInViewport(el){
    let rect = el.getBoundingClientRect();

    return (
        rect.bottom >= 0 &&
        rect.right >= 0 &&

        rect.top <= (
            window.innerHeight ||
            document.documentElement.clientHeight) &&

        rect.left <= (
            window.innerWidth ||
            document.documentElement.clientWidth)
    );
}

registerListener('load', lazyLoad);
registerListener('scroll', lazyLoad);