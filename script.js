$(function() {  
    const maxCheatLength = 8

    var getRandomInt = function(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    var levels = (function() {
        var createLevel = function(code, name, difficult, shadowColor, imgPath, btnPath, achFile, musicFile, cheat) {
            var level = {};
            level.code = code;
            level.name = name;
            level.difficult = difficult;
            level.shadowColor = shadowColor;
            level.imgPath = imgPath;
            level.btnPath = btnPath;
            level.achFile = achFile;
            level.musicFile = musicFile;
            level.cheat = cheat.substring(0, maxCheatLength).toUpperCase();
            level.isComplete = false;
			
			level.complete = function() {
				if(this.isComplete)
					return;
				
				this.isComplete = true;
                $('#achivment-audio')[0].play();
                var achivmentSelectorId = '#achivment' + this.code;
                $('div.achivment.show').each(function() {
                    var currentTop = $(this).offset().top;
                    $(this).offset({top: currentTop - 62});
                });
                $(achivmentSelectorId).removeClass('show');
                $(achivmentSelectorId).addClass('show');
			}

            return level;
        }

        return [
            createLevel('Miku', 'Мику', 3, 'rgb(84, 216, 166)', 'img/miku.jpg', 'img/mi.png', 'img/miku_ach.png', 'music/miku.mp3', 'AEZAKMI'),
            createLevel('Lena', 'Лена', 3, 'rgb(48, 24, 101)', 'img/lena.jpg', 'img/ln.png', 'img/lena_ach.png', 'music/lena.mp3', 'BAGUVIX'),
            createLevel('Alice', 'Алиса', 4, 'rgb(223, 82, 33)', 'img/alice.jpg', 'img/al.png', 'img/alice_ach.png', 'music/alice.mp3', 'YECGAA'),
            createLevel('Slavya', 'Славя', 4, 'rgb(254, 193, 97)', 'img/slavya.jpg', 'img/sl.png', 'img/slavya_ach.png', 'music/slavya.mp3', 'RIPAZHA'),
            createLevel('Ulyana', 'Ульяна', 5, 'rgb(186, 44, 43)', 'img/ulyana.jpg', 'img/ul.png', 'img/ulyana_ach.png', 'music/ulyana.mp3', 'JUMPJET')
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
                    if(cell.number !== index) {
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
				if(targetCellIndex < 0 || targetCellIndex >= difficult*difficult)
					return;
				
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
			
			model.move = function(keyCode) {
				switch(keyCode) {
					case 37:
						this.swap(model.emptyCellIndex + 1);
						break;
						
					case 38:
						this.swap(model.emptyCellIndex + difficult);
						break;
						
					case 39:
						this.swap(model.emptyCellIndex - 1);
						break;
						
					case 40:
						this.swap(model.emptyCellIndex - difficult);
						break;
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
                    .addClass('cell' + (model.isSwapAvalible(index) && !isWin ? ' active' : ''))
                    .addClass('cell' + (cell.isEmpty && !isWin ? ' empty' : ''))
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

            if(isWin) {
                level.complete();

                $('div.cell').css('border', 'none');
            }
        }

        v.clean = function() {
            var spotty = $('div.spotty');
            spotty.empty();
            spotty.css('box-shadow', 'none');
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
                $('#background-music').attr('src', p.file);
                $('#background-music')[0].currentTime = p.currentTime;

                var promise = $('#background-music')[0].play();
        
                if (promise !== undefined) {
                    promise.then(_ => {
                        // Autoplay started
                        $('#audio-control').off('click');
                        $('#audio-control').one('click', player.stop);
                        $('#audio-control').removeClass('inactive').addClass('active');
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
            p.currentTime = $('#background-music')[0].currentTime;
            $('#background-music')[0].pause();

            $('#audio-control').off('click');
            $('#audio-control').one('click', player.play);
            $('#audio-control').removeClass('active').addClass('inactive');
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

    var currentLevel;
	var model;

    $('#restart-game').click(function() {
        restartGame();
    });

    $('#audio-control').one('click', player.play);
	
	var showTip = function() {
		$('#tip').addClass('active');
	}
	var hideTip = function() {
        $('#tip').removeClass('active');
    }

    /**
     * Обработчик для кнопки рестарта
     * Перезапускат уровень
     */
    $('#restart').click(function() {
        restartLevel(currentLevel, true);
    })

    /**
     * Обработчика наведения для подсказки.
     * При наведении на "кнопку" вопроса div-подсказка постепенно становится видимым
     * Если увести мышь - постепенно скрывается
     */
    $('#question').hover(showTip, hideTip);

    /**
     * Обработчик для кнопки "собрать"
     * Если уровень завершен, то пересоздает модель по текущему уровню, но не перемешивает
     */
    $('#collect').click(function() {
        if(currentLevel && currentLevel.isComplete)
            restartLevel(currentLevel, false);
    })

    /**
     * Если уровень не задан, то ничего не происходит
     * Меняет заголовок страницы
     * Пробует сменить музыкальную композицию
     * Пересоздает модель, перемешивает (если уровень не пройден), отображает
     * @param {Уровень для отображения} level 
     */
    var changeLevel = function(level) {
        if(level === undefined)
            return;

        currentLevel = level;
        
        $(document).attr('title', level.name)

        player.change(level.musicFile);

        restartLevel(level, !level.isComplete);
    }
    
    var restartLevel = function(level, needMix) {
        if(level === undefined)
            return;

        if(needMix === undefined)
            needMix = !level.isComplete;

        $('#collect').toggle(level.isComplete);

        model = modlelFactory.createModel(level.difficult);
        if(needMix)
            model.mix();
        view.create(model, level);
    }

    var restartGame = function() {
        showMainMenu();

        levels.forEach(function(level) {
            level.isComplete = false;
        })

        createAchivment();  
    }

    var showMainMenu = function() {
        currentLevel = undefined;
        player.change(undefined);
        view.clean();

        $(document).attr('title', 'Бесконечное лето - Пятнашки');

        $('#collect').hide();

        $('#tip').css('background-image', 'none')
                .css('box-shadow', 'none');

        createButtons();
        createOnClickForButtons();
    }

    var createButtons = function() {
        $('.levelBtn').remove();

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
        });
    }

    var createAchivment = function() {
        $('.achivment').remove();

        levels.forEach(function(level) {
            var $achivment = $('<div />')
            .attr('id', 'achivment' + level.code)
            .css('background-image', 'url(' + level.achFile + ')')
            .addClass('achivment');
            
            $('body').append($achivment);
        });
    }

    /**
     * Навешиваем обработчик нажатия на все кнопки уровней.
     * 
     * В обработчике устанавливаем текущий уровень,
     * если новый уровень равен текущему, то ничего не произойдет.
     * 
     * Обновляем div-подсказку
     */
    var createOnClickForButtons = function() {
        $('div.levelBtn').click(function() {
            var levelIndex = parseInt($(this).attr('level-index'));

            if(currentLevel === levels[levelIndex])
                return;
            
            changeLevel(levels[levelIndex]);

            /**
             * Допольнительная обработка mouseleave для кнопок нужна.
             * Ниже написано, что на активной кнопке не убираем тень (отключена mouseleave),
             * а это значит, что этот обработчик нужно каждый раз возвращать,
             * иначе кнопки остаются посвеченными.
             * Сначала отключаем ВСЕМ mouseleave (иначе обработчики накапливаются)
             */
            $('div.levelBtn').removeClass('active').css('box-shadow', 'none')
                .off('mouseleave')
                .on('mouseleave', function() {
                    $(this).css('box-shadow', 'none');
                });
                
            /**
             * Кнопке активного уровня включаем тень и увеличение размера
             * Убираем mouseleave. Кнопка должна оставаться большой.
             */
            $(this).addClass('active').css('box-shadow', '0 0 6px 6px ' + currentLevel.shadowColor)
                .off('mouseleave');

            $('#tip').css('background-image', 'url(' + currentLevel.imgPath + ')')
                .css('box-shadow', '0 0 6px 6px ' + currentLevel.shadowColor);
        });
    }
    
    var inputString = '';
	$(document).keyup(function(e) {
		if(e.keyCode >= 49 && e.keyCode <= 57) {
            $('.levelBtn[level-index=' + (e.keyCode - 49) + ']').trigger('click');
            return;
        }

		if(e.keyCode >= 97 && e.keyCode <= 105) {
            $('.levelBtn[level-index=' + (e.keyCode - 97) + ']').trigger('click');
            return;
        }
            
        if(e.keyCode >= 37 && e.keyCode <= 40) {
            if(currentLevel === undefined || model === undefined)
			    return;		
		
            model.move(e.keyCode);
            view.create(model, currentLevel);
            return;
        }
        
        inputString += '' + String.fromCharCode(e.keyCode);
		while(inputString.length > maxCheatLength)
            inputString = inputString.substr(1);

        levels.forEach(function(level) {
            if(inputString.includes(level.cheat)) {
                inputString = '';
                if(!level.isComplete) {
                    level.complete();
                    if(level === currentLevel)
                        restartLevel(currentLevel);
                }
            }
        });
		
		switch(e.keyCode) {
			case 72: //H - help
				hideTip();
                break;
            case 27: //Esc
				showMainMenu();
                break;
            case 82: //R - restart current level
				restartLevel(currentLevel, true);
                break;
            case 80: //P - play / pause music
                $('#audio-control').trigger('click');
                break;
            case 67: //C - complete level, if possible
                $('#collect').trigger('click');
                break;
		}
    })
	
	$(document).keydown(function(e) {
		switch(e.keyCode) {
			case 72: //H - help
				showTip();
				break;
		}
	})

    restartGame();
});