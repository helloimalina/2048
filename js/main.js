let createAndAppend = function({className, parentElement, value}, tag='div') {
    let element = document.createElement(tag);
    element.className = className;
    if (value) {
        element.innerHTML = value;
    }

    if (parentElement) {
        parentElement.appendChild(element);
    }

    return element;
}

let getRandomInt = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Touch helper
document.addEventListener('touchstart', handleTouchStart, false);
document.addEventListener('touchmove', handleTouchMove, false);

let xDown = null;
let yDown = null;

function handleTouchStart(evt) {
    xDown = evt.touches[0].clientX;
    yDown = evt.touches[0].clientY;
}

let senstivity = 25;
function handleTouchMove(evt) {
    if (! xDown || ! yDown) {
        return;
    }

    let xUp = evt.touches[0].clientX;
    let yUp = evt.touches[0].clientY;

    let xDiff = xDown - xUp;
    let yDiff = yDown - yUp;

    if (Math.abs(xDiff) < senstivity &&  Math.abs(yDiff) < senstivity) {
        return;
    }

    if (Math.abs(xDiff) > Math.abs(yDiff)) {
        if (xDiff > 0) {
            callSwipeActions('left');
        } else {
            callSwipeActions('right');
        }
    } else {
        if (yDiff > 0) {
            callSwipeActions('up');
        } else {
            callSwipeActions('down');
        }
    }

    xDown = null;
    yDown = null;
}

let swipeActions = {
    'left': [],
    'right': [],
    'up': [],
    'down': []
}
