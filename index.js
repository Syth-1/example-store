document.addEventListener("DOMContentLoaded", function() {

    console.log("hello world!");
    Data.set_refs();
    setUpMenu(); 
    setUpCarosel(); 
});

function setUpMenu() { 
    /* https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax#spread_in_array_literals */
    let menu = document.getElementById('menu-items');
    [...menu.children].forEach(
        function (element, index) {
            element.style.setProperty('--order', index+1);
        }
    );
}

function setUpCarosel() { 
    let caroselItems = [...document.getElementById('carosel-container').children];
    let caroselNavContainer = document.getElementById('carosel-paginator-container');

    caroselItems.forEach(
        function(element, index) {
            let index1 = index + 1; 
            // used twice, no point doing twice!

            element.id = `carosel-item-${index1}`;
            Data.caroselItems.push(element);

            let item = caroselNavContainer.appendChild(
                Object.assign(
                    document.createElement('div'),
                        { 
                            className : 'carosel-indicator', 
                            id : `carosel-pg-${index1}`
                        }
                )
            );

            item.addEventListener('click', partial(changePageClick, index));
            Data.caroselNavItems.push(item);
        }
    ); 

    caroselAnimation(); 
}


async function caroselAnimation() { 
    changePage(0)
    
    let timeout = 10; 
    while (true) { 
        await sleep(timeout); 
        console.log("go!")
        if (time() < Data.caroselTimer) {
            continue; 
        } 

        Data.caroselNavItems[Data.page].style.backgroundColor = null;


        let page = 0; 
        if (Data.page != Data.caroselNavItems.length-1) { 
            page = Data.page + 1; 
        }

        changePage(page); 
    }
}

function changePage(pg) {
    Data.caroselNavItems[Data.page].style.backgroundColor = null;
    Data.caroselItems[Data.page].dataset.focus = false; 
    Data.page = pg;

    Data.caroselNavItems[Data.page].style.backgroundColor = 'aqua';
    Data.caroselContaner.style.transform = `translateX(-${Data.page * 110}%)`

    if (Data.caroselFocus) {
        clearTimeout(Data.caroselFocus);                                                                                                              
        Data.caroselFocus = null; 
    } // ensures we dont have double focused item! 

    Data.caroselFocus = setTimeout(
        function() {
            Data.caroselItems[Data.page].dataset.focus = true; 
            Data.caroselFocus = null;
        }, 500
    );
}

function changePageClick(pg) {
    Data.caroselTimer = time() + 30; 
    changePage(pg);
}

/* https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/now */
async function sleep(seconds) {
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

function time() {
    return Date.now() / 1000; 
}

/* https://stackoverflow.com/a/321527 */
function partial(func) {
    var args = Array.prototype.slice.call(arguments, 1);
    return function() {
      var allArguments = args.concat(Array.prototype.slice.call(arguments));
      return func.apply(this, allArguments);
    };
}

class Data { 
    static nav_bar; 
    static menu_btn; 

    static carosel; 
    static caroselContaner; 
    static caroselItems = []
    static caroselNavItems = []
    static caroselTimer; 
    static caroselFocus = null; 
    static page = 0

    static set_refs() { 
        // Data.nav_bar = document.getElementById("")
        Data.carosel = document.getElementById('carosel');
        Data.caroselContaner = document.getElementById('carosel-container'); 

    }

}