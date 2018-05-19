$(function() {  
    var getRandomInt = function(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    var levels = (function() {
        var createLevel = function(code, name, difficult, shadowColor, imgPath, btnPath, achFile, musicFile) {
            var level = {};
            level.code = code;
            level.name = name;
            level.difficult = difficult;
            level.shadowColor = shadowColor;
            level.imgPath = imgPath;
            level.btnPath = btnPath;
            level.achFile = achFile;
            level.musicFile = musicFile;
            level.isComplete = false;

            return level;
        }

        return [
            createLevel('Miku', 'Мику', 3, 'rgb(84, 216, 166)', 'img/miku.jpg', 'img/mi.png', 'img/miku_ach.png', 'music/miku.mp3'),
            createLevel('Lena', 'Лена', 3, 'rgb(48, 24, 101)', 'img/lena.jpg', 'img/ln.png', 'img/lena_ach.png', 'music/lena.mp3'),
            createLevel('Alice', 'Алиса', 4, 'rgb(223, 82, 33)', 'img/alice.jpg', 'img/al.png', 'img/alice_ach.png', 'music/alice.mp3'),
            createLevel('Slavya', 'Славя', 4, 'rgb(254, 193, 97)', 'img/slavya.jpg', 'img/sl.png', 'img/slavya_ach.png', 'music/slavya.mp3'),
            createLevel('Ulyana', 'Ульяна', 5, 'rgb(186, 44, 43)', 'img/ulyana.jpg', 'img/ul.png', 'img/ulyana_ach.png', 'music/ulyana.mp3')
        ];
    })();

    var modlelFactory = (function() {
        var mf = {};

        mf.createModel = function(difficult) {
            var model = [];
            for(var i = 0; i < difficult * difficult; i++) {
                model[i] = {
                    number: i,
                    isEmpty: false,
                    row: Math.floor(i / difficult),
                    column: i % difficult
                }
            }
            model.emptyCellIndex = difficult * difficult - 1;
            model[model.emptyCellIndex].isEmpty = true;

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

            model.swap = function(targetCellIndex) {
                if(!this.isSwapAvalible(targetCellIndex))
                    return;
                
                var tmpCell = model[model.emptyCellIndex];
                model[model.emptyCellIndex] = model[targetCellIndex];
                model[targetCellIndex] = tmpCell;

                model.emptyCellIndex = targetCellIndex;
            }

            model.isSwapAvalible = function(targetCellIndex) {
                var targetCellRow = Math.floor(targetCellIndex / difficult);
                var targetCellColumn = targetCellIndex % difficult;

                var emptyCellRow = Math.floor(model.emptyCellIndex / difficult);
                var emptyCellColumn = model.emptyCellIndex % difficult;

                return (targetCellRow + 1 === emptyCellRow && targetCellColumn === emptyCellColumn) ||
                    (targetCellRow - 1 === emptyCellRow && targetCellColumn === emptyCellColumn) ||
                    (targetCellRow === emptyCellRow && targetCellColumn + 1 === emptyCellColumn) ||
                    (targetCellRow === emptyCellRow && targetCellColumn - 1 === emptyCellColumn);
            }

            model.mix = function() {
                for(var i = 0; i < 1000; i++) {
                    this.swap(getRandomInt(0, difficult*difficult));
                }
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
            var isWin = model.isWin();

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
                    .attr('data-number', index)
                    .addClass('cell ' + (model.isSwapAvalible(index) && !isWin ? 'active' : 'inactive'))
                    .css('background-image', (!cell.isEmpty || isWin ? 'url(' + level.imgPath + ')' : 'none'))
                    .css('background-position', -pxByCell * cell.column + 'px ' + -pxByCell * cell.row + 'px');
                
                newDivLine.append(newCell);
            })

            spotty.css('box-shadow', isWin ? '0 0 6px 6px ' + level.shadowColor : 'none');

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

            if(isWin && !level.isComplete) {
                level.isComplete = true;
                $('#achivmentAudio')[0].play();
                var achivmentSelectorId = '#achivment' + level.code;
                $('div.achivment.show').each(function() {
                    var currentTop = $(this).offset().top;
                    $(this).offset({top: currentTop - 62});
                });
                $(achivmentSelectorId).removeClass('show');
                $(achivmentSelectorId).addClass('show');
            }
        }

        return v;
    })();

    var player = (function() {
        const defaultFile = 'music/default.mp3';
        var p = {};

        p.file = defaultFile;
        p.currentTime = 0;
        p.isMusicPlay = false;

        p.play = function() {
            var playMusic = function() {
                $('#backgroundMusic').attr('src', p.file);
                $('#backgroundMusic')[0].currentTime = p.currentTime;

                var promise = $('#backgroundMusic')[0].play();
        
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
            p.currentTime = $('#backgroundMusic')[0].currentTime;
            $('#backgroundMusic')[0].pause();

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
            p.currentTime = 0;

            if(p.isMusicPlay) {
                p.play();
            }
        }

        return p;
    })();

    $(document).attr('title', 'Бесконечное лето - Пятнашки');
    $('#audioControl').one('click', player.play);

    var currentLevel;

    var $divLevels = $('div.levels');
    levels.forEach(function(level, index) {
        var $btn = $('<div />')
                    .addClass('btn levelBtn')
                    .css('background-image', 'url(' + level.btnPath + ')')
                    .attr('level-index', index);

        $btn.hover(function() {
            $(this).css('box-shadow', '0 0 6px 6px ' + level.shadowColor)
        }, function() {
            $(this).css('box-shadow', 'none')
        })

        $divLevels.append($btn);

        var $achivment = $('<div />')
                            .attr('id', 'achivment' + level.code)
                            .css('background-image', 'url(' + level.achFile + ')')
                            .addClass('achivment');
        $('body').append($achivment);
    });

    $('div.levelBtn').click(function() {
        var levelIndex = parseInt($(this).attr('level-index'));

        if(currentLevel === levels[levelIndex])
            return;
        
        currentLevel = levels[levelIndex];

        $('div.levelBtn').removeClass('active').css('box-shadow', 'none')
            .on('mouseleave', function() {
                $(this).css('box-shadow', 'none')
            });
            
        $(this).addClass('active').css('box-shadow', '0 0 6px 6px ' + currentLevel.shadowColor)
            .off('mouseleave');

        $('#tip').css('background-image', 'url(' + currentLevel.imgPath + ')')
            .css('box-shadow', '0 0 6px 6px ' + currentLevel.shadowColor);

        restart(currentLevel);
    });

    $('#question').off('mouseenter mouseleave');
        $('#question').hover(function() {
            $('#tip').fadeTo(300, 1);
        }, function() {
            $('#tip').fadeTo(500, 0);
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