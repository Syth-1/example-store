document.addEventListener("DOMContentLoaded", () => {
    console.log("hello world!");
    CaroselData.setRefs();

    generateStars(); 
    generateCards();

    setUpMenu(); 
    setUpCarosel(); 
    
});

// sets up menu items
// iterates thru each item in menu 
// adds a property to it. 
function setUpMenu() { 
    /* https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax#spread_in_array_literals */
    let menu = document.getElementById('menu-items');
    [...menu.children].forEach(
        function (element, index) {
            element.style.setProperty('--order', index+1);
        }
    );
}

// sets up carosel 
// sets action for when select and leaving page 
// gets each carosel items, then sets up nav items for them. 
// then sets up blob
// starts the carosel loop.  
function setUpCarosel() { 
    setUpCaroselSwipe(); 

    // going onto that page:
    CaroselData.changePageAction = {
        2 : blobPage
    }

    // leaving that page: 
    CaroselData.leavePageAction =  {
        2 : blobPageLeave
    }

    let caroselItems = [...document.getElementById('carosel-container').children];
    let caroselNavContainer = document.getElementById('carosel-paginator-container');

    caroselItems.forEach(
        function(element, index) {
            let index1 = index + 1; 

            element.id = `carosel-item-${index1}`;
            CaroselData.caroselItems.push(element);

            let item = caroselNavContainer.appendChild(
                Object.assign(
                    document.createElement('div'),
                        { 
                            className : 'carosel-page-indicator', 
                            id : `carosel-pg-${index1}`
                        }
                )
            );

            item.addEventListener('click', partial(changePageClick, index));
            item.addEventListener('touchstart', partial(changePageClick, index));
            CaroselData.caroselNavItems.push(item);
        }
    );

    setUpBlob();
    caroselAnimation(); 
}

// sets up event listeners 
// for swipe action for changing page. 
function setUpCaroselSwipe() {
    CaroselData.carosel.addEventListener('touchstart', (e) => {
        mDown(e); 
        CaroselData.carosel.addEventListener('touchmove', handleMouseDown);
    });
    
    CaroselData.carosel.addEventListener('mousedown', (e) => {
        mDown(e); 
        CaroselData.carosel.addEventListener('mousemove', handleMouseDown);
    });
    
    document.addEventListener('touchend', () => {
        if (!CaroselData.caroselSwipeActive) return;
        mUp();
        CaroselData.carosel.removeEventListener('touchmove', handleMouseDown);
    });
    
    document.addEventListener('mouseup', () => {
        if (!CaroselData.caroselSwipeActive) return;
        mUp();
        CaroselData.carosel.removeEventListener('mousemove', handleMouseDown);
    });
    
}

/* https://www.youtube.com/watch?v=kySGqoU7X-s */
// for animation blob,
// sets up listeners
// sets up if mouse in: track mouse, else out: auto animation. 
function setUpBlob() { 
    CaroselData.currentText = CaroselData.magicText.innerText

    let caroselItem = document.getElementById('carosel-item-3')

    window.addEventListener('resize', function(e) {
        CaroselData.blobSize = CaroselData.blob.offsetWidth / 2; 
    });

    caroselItem.addEventListener('mouseleave', (e) => {
        setBlobRandom();
    }); 

    caroselItem.addEventListener('mousemove', (e) => {
        /* from: https://stackoverflow.com/a/42111623 */
        clearBlobRandom(); 
        let rect = CaroselData.carosel.getBoundingClientRect();
        
        let x = e.clientX - rect.left; //x position within the element.
        let y = e.clientY - rect.top;  //y position within the element.

        [x, y] = clampBlob(x, y);

        CaroselData.blob.style.left = `${Math.round(x)}px`; 
        CaroselData.blob.style.top = `${Math.round(y)}px`; 
    });
}

// ensures blob is restricted to view. 
// bottom is restricted to ensure undesirable scroll behaviour does not occur. 
function clampBlob(x, y) { 
    CaroselData.blobSize = CaroselData.blob.offsetWidth / 2; 
    return [
        clamp(CaroselData.blobSize, x, CaroselData.carosel.offsetWidth - CaroselData.blobSize),
        clamp(CaroselData.blobSize, y, CaroselData.carosel.offsetHeight - CaroselData.blobSize * 1.75)
    ];
}

// when we land on blob page: 
// sets blob to middle. 
// enables a blur overlay 
// on firefox an overlay as child div does not work! 
// have to use hacky work around as a result.  
function blobPage() {
    CaroselData.blurOver.style.opacity = "1";
    CaroselData.blob.style.left = `50%`; 
    CaroselData.blob.style.top = `50%`; 
    setBlobRandom();
    CaroselData.magicStop = false; 
    if (CaroselData.magicStopped) {
        startMagic();
    }
}

// when leaving blob page: 
// remove blur over
// we stop animation from running. 
function blobPageLeave() { 
    CaroselData.blurOver.style.opacity = "0";
    clearBlobRandom(); 
    CaroselData.magicStop = true; 
}

function setBlobRandom() { 
    clearBlobRandom(); 
    if (CaroselData.page != 2) return; 

    CaroselData.blobRandomMove = setInterval(() => {
        let [x, y] = clampBlob(
            getRandomInt(CaroselData.carosel.offsetWidth),
            getRandomInt(CaroselData.carosel.offsetHeight)
        ); 

        CaroselData.blob.style.left = `${Math.round(x)}px`; 
        CaroselData.blob.style.top = `${Math.round(y)}px`; 

    }, 2500); 
}

// stops auto movement if playing. 
function clearBlobRandom() { 
    if (CaroselData.blobRandomMove) { 
        clearInterval(CaroselData.blobRandomMove); 
    }
}

// auto changes page for carosel. 
async function caroselAnimation() { 
    changePage(0)
    
    let timeout = 10; 
    while (true) { 
        await sleep(timeout); 
        if (time() < CaroselData.caroselTimer) {
            continue; 
        } 

        CaroselData.caroselNavItems[CaroselData.page].style.backgroundColor = null;

        let page = 0; 
        if (CaroselData.page != CaroselData.caroselNavItems.length-1) { 
            page = CaroselData.page + 1; 
        }

        changePage(page); 
    }
}

// called when changing page. 
// calls before and after, 
// also sets css property for page in focus. 
function changePage(pg) {
    CaroselData.caroselNavItems[CaroselData.page].style.backgroundColor = null;
    CaroselData.caroselItems[CaroselData.page].dataset.focus = false; 
    CaroselData.leavePageAction[CaroselData.page]?.(); 

    CaroselData.page = pg;

    CaroselData.caroselNavItems[CaroselData.page].style.backgroundColor = 'aqua';
    CaroselData.caroselContaner.style.transform = `translateX(-${CaroselData.page * 110}%)`

    if (CaroselData.caroselFocus) {
        clearTimeout(CaroselData.caroselFocus);                                                                                                              
        CaroselData.caroselFocus = null; 
    } // ensures we dont have double focused item! 

    CaroselData.caroselFocus = setTimeout(
        function() {
            CaroselData.caroselItems[CaroselData.page].dataset.focus = true; 
            CaroselData.caroselFocus = null;
            CaroselData.changePageAction[CaroselData.page]?.(); 
        }, 500
    );
}

// if user input to change page: 
// if same page - dont change, but extend next page auto change. 
function changePageClick(pg) {
    CaroselData.caroselTimer = time() + 30; 
    if (pg == CaroselData.page) return; 
    changePage(pg);
}

/* https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/now */
    async function sleep(seconds) {
        return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
    }

const clamp = (min, num, max) => Math.min(Math.max(num, min), max);

/* https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random */
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

// gets current time. 
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

// helped with generator: https://codepen.io/MatthaisUK/pen/oNMXvLG
function create(tag = "div", options = {}, children = []) {
    let node = Object.assign(document.createElement(tag), options);
    if (children.length) node.append(...children);
    return node;
}

// NS obj creation: https://stackoverflow.com/a/16489845
function createSVG(tag = 'svg', options={}, children=[]) {
    const nameSpace = "http://www.w3.org/2000/svg";
    let node = Object.assign(document.createElementNS(nameSpace, tag));

    for(var key in options) { // get error if using regular method, 
        node.setAttribute(key, options[key]); // ..cannot asign to read only property. 
    }

    if (children.length) node.append(...children);
    return node;
}

/* from: https://stackoverflow.com/a/61732450 */
// gets mouse pos or touch pos. 
function getMousePos(e) {
    if (e.type == 'touchstart' || e.type == 'touchmove' || e.type == 'touchend' || e.type == 'touchcancel') {
        const evt = (typeof e.originalEvent === 'undefined') ? e : e.originalEvent;
        const touch = evt.touches[0] || evt.changedTouches[0];
        var x = touch.pageX;
        var y = touch.pageY;
    } else if (e.type == 'mousedown' || e.type == 'mouseup' || e.type == 'mousemove' || e.type == 'mouseover' || e.type == 'mouseout' || e.type == 'mouseenter' || e.type == 'mouseleave') {
        var x = e.clientX;
        var y = e.clientY;
    }

    return [x, y];
}

// when mouse is down on carosel
// for swipe animation. 
function mDown(e) {
    e.preventDefault()
    CaroselData.caroselSwipeActive = true;
    CaroselData.caroselSwipeWidth = CaroselData.carosel.offsetWidth / 4;
    CaroselData.caroselSwipeStart = getMousePos(e)[0];
}

// once mouse is up again, 
// change page if required. 
function mUp() { 
    if (CaroselData.caroselSwipeState == CaroselData.Direction.Left) {
        if (CaroselData.page == 0) { 
            changePageClick(CaroselData.caroselNavItems.length - 1);
        } else { 
            changePageClick(CaroselData.page - 1);
        }
    } else if (CaroselData.caroselSwipeState == CaroselData.Direction.Right) {
        if (CaroselData.page == CaroselData.caroselNavItems.length - 1) {
            changePageClick(0); 
        } else { 
            changePageClick(CaroselData.page + 1); 
        }
    }

    resetSwipeState(); 
}

// reset swipe states. 
function resetSwipeState() {
    if (CaroselData.caroselSwipeState == CaroselData.Direction.Left) {
        CaroselData.caroselLeftIndicator.dataset.left = false;
    } else if (CaroselData.caroselSwipeState == CaroselData.Direction.Right) {
        CaroselData.caroselRightIndicator.dataset.right = false;
    }
    CaroselData.caroselSwipeState = CaroselData.Direction.None;
}

// handles all mouse drag events. 
function handleMouseDown(event) {
    let mp = getMousePos(event)[0];

    if (mp - CaroselData.caroselSwipeStart > CaroselData.caroselSwipeWidth) {
        if (CaroselData.caroselSwipeState != CaroselData.Direction.Left) {
            resetSwipeState(); /* reset everything before we set new state */ 
            CaroselData.caroselSwipeState = CaroselData.Direction.Left;
            CaroselData.caroselLeftIndicator.dataset.left = "true";
        }
    } else if (CaroselData.caroselSwipeStart - mp > CaroselData.caroselSwipeWidth) {
        if (CaroselData.caroselSwipeState != CaroselData.Direction.Right) {
            resetSwipeState();
            CaroselData.caroselSwipeState = CaroselData.Direction.Right;
            CaroselData.caroselRightIndicator.dataset.right = "true";
        }
    } else {
        resetSwipeState();
    }
}


function generateStars() {
    function createStar(index) {
        const path = "M512 255.1c0 11.34-7.406 20.86-18.44 23.64l-171.3 42.78l-42.78 171.1C276.7 504.6 267.2 512 255.9 512s-20.84-7.406-23.62-18.44l-42.66-171.2L18.47 279.6C7.406 276.8 0 267.3 0 255.1c0-11.34 7.406-20.83 18.44-23.61l171.2-42.78l42.78-171.1C235.2 7.406 244.7 0 256 0s20.84 7.406 23.62 18.44l42.78 171.2l171.2 42.78C504.6 235.2 512 244.6 512 255.1z"

        return create( "div", { className: "magic-star", id: `star${index}` }, 
            [
                createSVG( "svg", { viewBox: "0 0 512 512" },
                    [
                        createSVG( "path", { d: path } )
                    ]
                )
            ]
        )
    }
    
    let magicTxt = document.getElementById('magik-text'); 
    for (let i = 0; i < 3; i++) {
        magicTxt.insertBefore(
            createStar(i+1), CaroselData.magicText
        )
    }
}


// animates the text effect (single cycle)
// promise allows this function to be awaited till finish. 
async function rollText(charAmount) {
    let iteration = 0;

    return new Promise((resolve) => {
        let interval = setInterval(() => {
            CaroselData.magicText.innerText = CaroselData.currentText.split('').map((letter, index) => {
                if (index < charAmount) {
                    iteration += 1 / CaroselData.rollAmount * 2;
                    return CaroselData.currentText[index];
                }
                return CaroselData.letters[Math.floor(Math.random() * 26)];

            }).join('');

            if (iteration >= charAmount) {
                clearInterval(interval);
                resolve();
            }
            iteration += 1 / CaroselData.rollAmount;
        }, 30);
    });
}

// starts magic effect with text. 
async function startMagic() {
    CaroselData.magicStopped = false; 

    while (!CaroselData.magicStop) {

        for (let i = CaroselData.currentText.length - 1; i > -1; i--) {
            await rollText(i);
        }

        let addText = false;
        if (CaroselData.currentText.length < CaroselData.newText.length) {
            addText = true;
        }

        while (CaroselData.currentText.length != CaroselData.newText.length) {
            if (addText) {
                CaroselData.currentText += " ";
            } else {
                CaroselData.currentText = CaroselData.currentText.substring(0, CaroselData.currentText.length - 1);
            }

            for (let i = 0; i < CaroselData.rollAmount; i++) {
                await rollText(0);
            }
        }

        CaroselData.currentText = CaroselData.newText;
        for (let i = 0; i < CaroselData.currentText.length + 1; i++) {
            await rollText(i);
        }

        CaroselData.item += 1;
        if (CaroselData.item == CaroselData.textValues.length) CaroselData.item = 0;
        CaroselData.newText = CaroselData.textValues[CaroselData.item];

        generateGradient();
        addEffect();

        if (!CaroselData.magicStop) {
            await sleep(7);
        }

        removeEffect();
        await sleep(0.5);
    }

    CaroselData.magicStopped = true;
}

// get random int using min max. 
const getRndInt = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

// wraps val around 0 - 360. 
/* https://stackoverflow.com/a/43780476 */
function wrap(angle) {
    angle = Math.round(angle);
    return angle - 360 * Math.floor(angle * (1 / 360))
}

// allows setting root var for colors. 
const setVariables = vars => Object.entries(vars).forEach(v => document.documentElement.style.setProperty(v[0], v[1]));

// generates a gradient. 
function generateGradient() {
    let color1 = getRndInt(0, 720);
    if (color1 > 360) color1 /= 2 // less green prominent (why does green have such big spectrum ;-;)
    let c1s = getRndInt(50, 75);

    // replace max to: 
    // Math.sqrt(color1) 
    // for most tame mode. 
    let color2 = wrap(color1 -  getRndInt(color1 * 0.1, Math.sqrt(color1) * 1.8 ));
    let c2s = getRndInt(50, 75); 
    
    let color3 = wrap(color1 + Math.min(50, color1 / 4)); 
    let c3s = getRndInt(30, 100);
    let c3l = getRndInt(50, 75);

    let colors = {
        '--color1': `hsl(${color1}, ${c1s}%, ${100 - c1s}%)`,
        '--color2': `hsl(${color2}, ${c2s}%, ${100 - c2s}%)`,
        '--color3': `hsl(${color3}, ${c3s}%, ${c3l}%)`
    }

    setVariables(colors);
}

// trigger animation. 
const animate = star => {
    star.style.setProperty("--star-left", `${getRndInt(-10, 100)}%`);
    star.style.setProperty("--star-top", `${getRndInt(-40, 80)}%`);

    star.style.animation = "none";
    star.offsetHeight;
    star.style.animation = "";
}


let timeouts = [],
    intervals = [];

const magic = document.querySelector(".magic");

// adds star effect
function addEffect() {
    CaroselData.magicText.dataset.content = CaroselData.currentText;
    CaroselData.magicText.dataset.active = true;

    let index = 1;

    for (const star of document.getElementsByClassName("magic-star")) {
        timeouts.push(setTimeout(() => {
            animate(star);

            intervals.push(setInterval(() => animate(star), 1000));
        }, index++ * 300));
    };
}

// removes star effect 
function removeEffect() {
    CaroselData.magicText.dataset.active = false;

    for (const t of timeouts) clearTimeout(t);
    for (const i of intervals) clearInterval(i);

    timeouts = [];
    intervals = [];
}

function generateCards() {
    function generateCard(index, res, imgType, price) { 
        return create( "div", {className: 'container'}, 
            [
                create("div", {className: 'img-container'}, [
                    create('img', {
                        className: 'showcase-img',
                        src: `https://source.unsplash.com/${res}x${res}/?${imgType}`
                    })
                ]), 
                create("div", {className: 'card-info'}, [
                    create("h2", {innerText: `Art Collection ${index}`}), 
                    create("h4", {innerText: 'Price: '}, [
                        create("span", {className: 'price-tag', innerText: price})
                    ]),
                    create("button", {innerText: 'Buy'})
                ])
            ]
        )
    }

    const imgTheme = [
        'space', 
        'sunset', 
        'abstract', 
        'random', 
        'vivid'
    ];

    const resolution = [
        500, 250
    ];

    let productBox = document.getElementById('products-flex');

    resolution.forEach((res, index1) => {
        imgTheme.forEach((theme, index2) => {
            productBox.append(
                generateCard(
                    (index1 * 5) + index2 + 1, // get index we are on
                    res, theme, 
                    `£${getRndInt(2, 50)}.00` // generate random price
                )
            )
        })
    })

}


/*
class holds data to be accessed thru out functions 
*/

class CaroselData { 
    static carosel; 
    static caroselContaner; 
    static caroselItems = []
    static caroselNavItems = []
    static caroselTimer; 
    static caroselFocus = null; 
    static page = 0

    static leavePageAction = {}; 
    static changePageAction = {}; 

    static caroselLeftIndicator; 
    static caroselRightIndicator; 

    static Direction = {
        Left: 0, 
        Right: 1, 
        None: 2
    }
    
    static caroselSwipeActive = false;
    static caroselSwipeWidth;
    static caroselSwipeStart;
    static caroselSwipeState = CaroselData.Direction.None;

    static blob; 
    static blobSize = 0; 
    static blobrect; 
    static blurOver; 
    static blobRandomMove; 

    static magicText; 
    static magicStop = false;
    static magicStopped = true;

    static letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

    static textValues = [
        'AMAZING',
        'BREATHTAKING',
        'AWESOME',
        'FIRE'
    ]

    static rollAmount = 10;

    static item = 0;
    static newText = CaroselData.textValues[CaroselData.item];
    static currentText;

    static setRefs() { 
        CaroselData.carosel = document.getElementById('carosel');
        CaroselData.caroselContaner = document.getElementById('carosel-container'); 

        CaroselData.caroselLeftIndicator = document.getElementById('carosel-left-indicator'); 
        CaroselData.caroselRightIndicator = document.getElementById('carosel-right-indicator'); 

        CaroselData.blob = document.getElementById('blob');
        CaroselData.blurOver = document.getElementById('blur-over')
        CaroselData.magicText = document.getElementById('rolling-text');
    }
}