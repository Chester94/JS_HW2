var getRandomInt = function(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

var levels = (function() {
    var createLevel = function(name, difficult, shadowColor, imgPath, musicFile) {
        var level = {};
        level.name = name;
        level.difficult = difficult;
        level.shadowColor = shadowColor;
        level.imgPath = imgPath;
        level.musicFile = musicFile;

        return level;
    }

    return [
        createLevel('Lena', 3, 'rgb(48, 24, 101)', 'img/lena.jpg', 'music/lena.mp3'),
        createLevel('Miku', 4, 'rgb(80, 155, 188)', 'img/miku.jpg', 'music/miku.mp3')
    ];
})();

var modlelFactory = (function() {
    var mf = {};

    mf.createModel = function(difficult) {
        var model = [];
        for(var i = 0; i < difficult * difficult; i++) {
            model[i] = {
                number: i,
                isActive: true,
                row: Math.floor(i / difficult),
                column: i % difficult
            }
        }
        model[difficult * difficult - 1].isActive = false;

        model.isWin = function() {
            var isWin = true;

            this.forEach(function(cell, index, array) {
                if(index > 0 && cell.number <= array[index - 1].number) {
                    isWin = false;
                    return false;
                }
            })

            return isWin;
        }

        model.swap = function(targetCellNumber) {
            if(!this.isSwapAvalible(targetCellNumber))
                return;

            var targetCellIndex = findCellIndexByNumber(targetCellNumber);
            var emptyCellIndex = findEmptyCellIndex();
            
            var tmpCell = model[emptyCellIndex];
            model[emptyCellIndex] = model[targetCellIndex];
            model[targetCellIndex] = tmpCell;
        }

        model.isSwapAvalible = function(targetCellNumber) {
            var targetCellIndex = findCellIndexByNumber(targetCellNumber);
            var emptyCellIndex = findEmptyCellIndex();

            return (targetCellIndex === emptyCellIndex + 1) || 
                    (targetCellIndex === emptyCellIndex - 1) || 
                    (targetCellIndex === emptyCellIndex + difficult) || 
                    (targetCellIndex === emptyCellIndex - difficult)
        }

        model.mix = function() {
            for(var i = 0; i < 1000; i++) {
                this.swap(getRandomInt(0, difficult*difficult));
            }
        }

        var findCellIndexByNumber = function(cellNumber) {
            return model.findIndex(function(cell) {
                return cell.number === cellNumber;
            })
        }

        var findEmptyCellIndex = function() {
            return model.findIndex(function(cell) {
                return cell.isActive === false;
            })
        }

        return model;
    }

    return mf;
})();

var viewFactory = (function() {
    vf = {};
    const imageSize = 600;

    vf.createView = function() {
        var view = {};

        view.create = function(model, level) {
            var pxByCell = imageSize / level.difficult;

            var spotty = $('div.spotty');
            spotty.empty();
            var newDivLine;

            model.forEach(function(cell, index) {
                if(!(index % level.difficult)) {
                    newDivLine = $('<div />')
                    spotty.append(newDivLine);
                }

                var newCell = $('<div />')
                    .width(pxByCell)
                    .height(pxByCell)
                    .attr('data-number', cell.number)
                    .addClass('cell ' + (cell.isActive && !model.isWin() ? 'active' : 'inactive'))
                    .css('background-image', (cell.isActive || model.isWin() ? 'url(' + level.imgPath + ')' : 'none'))
                    .css('background-position', -pxByCell * cell.column + 'px ' + -pxByCell * cell.row + 'px');
                
                newDivLine.append(newCell);
            })

            $('div.cell.active').hover(function() {
                $(this).css('box-shadow', '0 0 6px 6px ' + level.shadowColor)
            }, function() {
                $(this).css('box-shadow', 'none')
            })

            $('div.cell.active').click(function() {
                var targetCellNumber = parseInt($(this).attr('data-number'));

                if(model.isSwapAvalible(targetCellNumber)) {
                    model.swap(targetCellNumber);
                    view.create(model, level);
                }
            })
        }

        return view;
    }

    return vf;
})();

var player = (function() {
    var p = {};

    p.play = function(file) {
        var playMusic = function() {
            var promise = $('audio').attr('src', file)[0].play();
    
            if (promise !== undefined) {
                promise.then(_ => {
                    // Autoplay started
                }).catch(error => {
                    // Autoplay was prevented.
                    $('body').one('mouseover', playMusic);
                });
            }
        }

        playMusic();
    }

    p.stop = function(file, e) {
        $('audio')[0].pause();
        $('audio').attr('currentTime', 0);
    }

    return p;
})();

var level = levels[1];

$(document).attr('title', level.name)

player.play(level.musicFile);

var model = modlelFactory.createModel(level.difficult);
model.mix();

var view = viewFactory.createView();
view.create(model, level);