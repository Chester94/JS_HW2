$(function() {  
    var getRandomInt = function(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    var levels = (function() {
        var createLevel = function(name, difficult, shadowColor, imgPath, btnPath, musicFile) {
            var level = {};
            level.name = name;
            level.difficult = difficult;
            level.shadowColor = shadowColor;
            level.imgPath = imgPath;
            level.btnPath = btnPath;
            level.musicFile = musicFile;

            return level;
        }

        return [
            createLevel('Lena', 3, 'rgb(48, 24, 101)', 'img/lena.jpg', 'img/ln.png', 'music/lena.mp3'),
            createLevel('Alice', 4, 'rgb(223, 82, 33)', 'img/alice.jpg', 'img/al.png', 'music/alice.mp3'),
            createLevel('Miku', 4, 'rgb(84, 216, 166)', 'img/miku.jpg', 'img/mi.png', 'music/miku.mp3')
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
                for(var i = 0; i < 20; i++) {
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

    var view = (function() {
        const imageSize = 600;
        var v = {};

        v.create = function(model, level) {
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

            spotty.css('box-shadow', model.isWin() ? '0 0 6px 6px ' + level.shadowColor : 'none');

            $('div.cell.active').hover(function() {
                $(this).css('box-shadow', '0 0 6px 6px ' + level.shadowColor)
            }, function() {
                $(this).css('box-shadow', 'none')
            })

            $('div.cell.active').click(function() {
                var targetCellNumber = parseInt($(this).attr('data-number'));

                if(model.isSwapAvalible(targetCellNumber)) {
                    model.swap(targetCellNumber);
                    v.create(model, level);
                }
            })
        }

        return v;
    })();

    var player = (function() {
        const defaultFile = 'music/default.mp3';
        var p = {};

        p.file = defaultFile;
        p.isMusicPlay = false;

        p.play = function() {
            var playMusic = function() {
                $('audio')[0].pause();
                $('audio').attr('currentTime', 0);

                var promise = $('audio').attr('src', p.file)[0].play();
        
                if (promise !== undefined) {
                    promise.then(_ => {
                        // Autoplay started
                        $('#audioControl').off('click');
                        $('#audioControl').one('click', player.stop);
                        $('#audioControl').removeClass('inactive').addClass('active');
                        p.isMusicPlay = true;
                    }).catch(error => {
                        // Autoplay was prevented.
                        $('body').one('mouseover', playMusic);
                    });
                }
            }

            playMusic();
        }

        p.stop = function() {
            $('audio')[0].pause();
            $('audio').attr('currentTime', 0);

            $('#audioControl').off('click');
            $('#audioControl').one('click', player.play);
            $('#audioControl').removeClass('active').addClass('inactive');
            p.isMusicPlay = false;
        }

        p.change = function(newFile) {
            if(newFile === undefined)
                newFile = defaultFile;

            if(p.file === newFile)
                return;

            p.file = newFile;

            if(p.isMusicPlay) {
                p.play();
            }
        }

        return p;
    })();

    $(document).attr('title', 'EverlastingSummer Spotty');
    $('#audioControl').one('click', player.play);

    var currentLevel;

    var divLevels = $('div.levels');
    levels.forEach(function(level, index) {
        var btn = $('<div />')
                    .addClass('btn levelBtn')
                    .css('background-image', 'url(' + level.btnPath + ')')
                    .attr('level-index', index);

        divLevels.append(btn);
    });

    $('div.levelBtn').click(function() {
        var levelIndex = parseInt($(this).attr('level-index'));
        currentLevel = levels[levelIndex];

        restart(currentLevel);
    });

    $('#restart').click(function() {
        restart(currentLevel);
    })

    var restart = function(level) {
        if(level === undefined)
            return;
        
        $(document).attr('title', level.name)

        player.change(level.musicFile);

        var model = modlelFactory.createModel(level.difficult);
        model.mix();
        view.create(model, level);
    }
});