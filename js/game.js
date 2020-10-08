class Game {
    constructor(parentElement, size = 4) {
        this.size = size;

        this.cellSize = ((100 / this.size) - 2);

        let gameFieldElement = createAndAppend({
            className: 'game',
            parentElement
        });

        this.headerElement = createAndAppend({
            className: 'header',
            parentElement: gameFieldElement
        });

        this.scoreElement = createAndAppend({
            className: 'score',
            parentElement: this.headerElement
        });
        this.score = 0;

        this.recordElement = createAndAppend({
            className: 'record',
            parentElement: this.headerElement
        });
        this.record = 0;

        this.fieldElement = createAndAppend({
            className: 'field',
            parentElement: gameFieldElement
        });

        this.fieldSize = (window.innerHeight * 0.83 > window.innerWidth ? window.innerWidth : window.innerHeight * 0.83);
        this.fieldElement.style.width = this.fieldSize + 'px';
        this.fieldElement.style.height = this.fieldSize + 'px';
        this.headerElement.style.width = this.fieldSize + 'px';
        window.addEventListener('resize', function(e) {
            this.fieldSize = (window.innerHeight * 0.83 > window.innerWidth ? window.innerWidth : window.innerHeight * 0.83);
            this.fieldElement.style.width = this.fieldSize + 'px';
            this.fieldElement.style.height = this.fieldSize + 'px';
            this.headerElement.style.width = this.fieldSize + 'px';
        }.bind(this));

        this.footerElement = createAndAppend({
            className: 'footer',
            parentElement: gameFieldElement
        });

        this.restartElement = createAndAppend({
            className: 'restart',
            parentElement: this.footerElement,
            value: 'Restart'
        }, 'button');

        this.restartElement.addEventListener('click', this.restart.bind(this));

        this.restart();

        window.addEventListener('keyup', function(e) {
            switch (e.keyCode) {
                case 38:
                    this.moveUp();
                    break;
                case 40:
                    this.moveDown();
                    break;
                case 37:
                    this.moveLeft();
                    break;
                case 39:
                    this.moveRight();
                    break;
            }
        }.bind(this));

        onSwipe('up',    this.moveUp.bind(this));
        onSwipe('down',  this.moveDown.bind(this));
        onSwipe('left',  this.moveLeft.bind(this));
        onSwipe('right', this.moveRight.bind(this));
    }

    set score(value) {
        this._score = value;
        this.scoreElement.innerHTML = 'Score: ' + value;
    }

    get score() {
        return this._score;
    }

    set record(value) {
        this._record = value;
        this.recordElement.innerHTML = 'Record: ' + value;
    }

    get record() {
        return this._record;
    }

    addScore(value) {
        this.score += value;
    }

    spawnUnit() {
        if (this.find2048Cell()) {
            // закончить все анимации
            setTimeout(function() {
                this.win();
            }.bind(this), 300);
        }
            
        let emptyCells = this.getEmptyCells();
        if (emptyCells.length) {
            emptyCells[getRandomInt(0, emptyCells.length - 1)].spawn();
        }

        emptyCells = this.getEmptyCells();
        if (!emptyCells.length && !this.hasMove()) {
            // закончить все анимации
            setTimeout(function() {
                this.loose();
            }.bind(this), 300);
        }
    }

    find2048Cell() {
        for (let i = 0; i < this.size; i++) {
            for (let k = 0; k < this.size; k++) {
                if (this.field[i][k].value === 2048) {
                    return true;
                }
            }
        }
        return false;
    }
    
    getEmptyCells() {
        let emptyCells = [];

        for (let i = 0; i < this.field.length; i++) {
            for (let k = 0; k < this.field[i].length; k++) {
                if (!this.field[i][k].value) {
                    emptyCells.push(this.field[i][k]);
                }
            }
        }

        return emptyCells;
    }

    isLastKey(key) {
        return key === (this.size - 1);
    }

    isFirstKey(key) {
        return key === 0;
    }

    // Обходим все ячейки в противоположном направлении от нажатия клавиши
    // По направлению первую строку или столбец пропускаем
    // Для ячейки ищем следующую заяную ячейку (или последнюю)
    //	если ячейка занята и совпадает с нашей, то объединяем
    //	если ячейка занята и не совпадет, то проверяем предыдущую ячейку
    moveRight() {
        let hasMoved = false;
        for (let i = 0; i < this.size; i++) {
            for (let k = this.size - 2; k >= 0; k--) {
                hasMoved = this.move(i, k, false, true, this.isLastKey.bind(this)) || hasMoved;
            }
        }

        if (hasMoved) {
            this.spawnUnit();
        }
    }

    moveLeft() {
        let hasMoved = false;
        for (let i = 0; i < this.size; i++) {
            for (let k = 1; k < this.size; k++) {
                hasMoved = this.move(i, k, false, false, this.isFirstKey.bind(this)) || hasMoved;
            }
        }

        if (hasMoved) {
            this.spawnUnit();
        }
    }


    moveDown() {
        let hasMoved = false;
        for (let i = this.size - 2; i >= 0; i--) {
            for (let k = 0; k < this.size; k++) {
                hasMoved = this.move(i, k, true, true, this.isLastKey.bind(this)) || hasMoved;
            }
        }

        if (hasMoved) {
            this.spawnUnit();
        }
    }

    moveUp() {
        let hasMoved = false;
        for (let i = 1; i < this.size; i++) {
            for (let k = 0; k < this.size; k++) {
                hasMoved = this.move(i, k, true, false, this.isFirstKey.bind(this)) || hasMoved;
            }
        }

        if (hasMoved) {
            this.spawnUnit();
        }
    }


    move(i, k, isI, isIncrement, keyCheck) {
        let hasMoved = false;

        let inc = isIncrement ? 1 : -1;
        let currentCell = this.field[i][k];
        if (currentCell.isEmpty) {
            return hasMoved;
        }

        let nextCellKey = (isI ? i : k) + inc;
        while (nextCellKey < this.size && nextCellKey >= 0) {
            let nextCell = this.field[isI ? nextCellKey : i][isI ? k : nextCellKey];
            if (!nextCell.isEmpty || keyCheck(nextCellKey)) {
                if ((nextCell.isEmpty && keyCheck(nextCellKey))
                    || nextCell.isSameTo(currentCell)) {
                    this.field[isI ? nextCellKey : i][isI ? k: nextCellKey].merge(currentCell);
                    hasMoved = true;
                } else if (!nextCell.isEmpty && ((isI && (nextCellKey + (inc * -1) !== i)) || (!isI && (nextCellKey + (inc * -1) !== k)))) {
                    this.field[isI ? nextCellKey + (inc * -1) : i][isI ? k: nextCellKey + (inc * -1)].merge(currentCell);
                    hasMoved = true;
                }

                break;
            }
            nextCellKey += inc;
            nextCell = this.field[isI ? nextCellKey : i][isI ? k : nextCellKey];
        }

        return hasMoved;
    }

    hasMove() {
        for (let i = 0; i < this.size; i++) {
            for (let k = 0; k < this.size; k++) {
                let nextCellKey = i + 1;
                while (nextCellKey < this.size) {
                    let nextCell = this.field[nextCellKey][k];
                    if (!nextCell.isEmpty) {
                        if (nextCell.isSameTo(this.field[i][k])) {
                            return true;
                        }
                        break;
                    }
                    nextCellKey += 1;
                }
                nextCellKey = k + 1;
                while (nextCellKey < this.size) {
                    let nextCell = this.field[i][nextCellKey];
                    if (!nextCell.isEmpty) {
                        if (nextCell.isSameTo(this.field[i][k])) {
                            return true;
                        }
                        break;
                    }
                    nextCellKey += 1;
                }
            }
        }
        return false;
    }

    restart() {
        this.score = 0;
        this.field = [];
        this.fieldElement.innerHTML = '';

        for (let i = 0; i < this.size; i++) {
            this.field[i] = [];
            for (let k = 0; k < this.size; k++) {
                this.field[i][k] = new Cell(this.fieldElement, this);
            }
        }
    }

    win() {
        if (this.score > this.record) {
            this.record = this.score;
        }
        this.fieldElement.innerHTML = '<img class="finish" src="img/Game_T_Final-04.png" alt="">';
    }

    loose() {
        if (this.score > this.record) {
            this.record = this.score;
        }
        this.fieldElement.innerHTML = '<img class="finish" src="img/Game_T_fail3-01.png" alt="">';
    }
}
