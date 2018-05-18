(function() {
    const imageSize = 600;
    const boardSideLength = 4;
    const lastCellNumber = boardSideLength * boardSideLength - 1;
    // const imgPath = 'img/lena.jpg';
    // const shadowColor = 'rgb(48, 24, 101)';
    // const musicFile = 'music/lena.mp3';
    const imgPath = 'img/miku.jpg';
    const shadowColor = 'rgb(80, 155, 188)';
    const musicFile = 'music/miku.mp3'
	
	var playMusic = function() {
		var promise = $('audio').attr('src', musicFile)[0].play();

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

    var container = $('div.spotty');
    var pxByCell = imageSize / boardSideLength;

    for(var i = 0; i < boardSideLength; i++) {
        var newDivLine = $('<div />');
        container.append(newDivLine);
		
		var pseudoDiv = $('<div />').width(0).height(0);
		newDivLine.append(pseudoDiv);

        for(var j = 0; j < boardSideLength; j++) {
            var newCell = $('<div />')
                .addClass('cell active')
                .attr('data-number', boardSideLength * i + j)
                .css('background-position', -pxByCell * j + 'px ' + -pxByCell * i + 'px');
                
            newDivLine.append(newCell);
        }
    }

    $('div.cell.active')
        .width(pxByCell)
        .height(pxByCell)
        .css('background-image', 'url(' + imgPath + ')');

    $('div[data-number="' + lastCellNumber + '"]')
        .css('background-image', 'none')
        .removeClass('active');

    $('div.cell.active').hover(function() {
        $(this).css('box-shadow', '0 0 6px 6px ' + shadowColor)
    }, function() {
        $(this).css('box-shadow', 'none')
    })

    $('div.cell.active').click(function() {
       
        //var freeCellIndex = $('div.cell').index($('div.cell[data-number=15]'));
        switchCell($(this), $('div.cell[data-number=' + lastCellNumber + ']'));
        
		if(checkForWin()) {
			$('div[data-number="' + lastCellNumber + '"]')
				.css('background-image', 'url(' + imgPath + ')');

			$('div.cell.active')
				.unbind('mouseenter mouseleave click')
				.css('box-shadow', 'none');

			$('div.cell.active').removeClass('active');
		}
    })

    var switchCell = function(firstCell, secondCell) {
        /*var isFirstInsertAfter = secondCell.prev().length !== 0;
        var suppotElementForFirst = isFirstInsertAfter ? secondCell.prev() : secondCell.next();

        var isSecondInsertAfter = firstCell.prev().length !== 0;
        var suppotElementForSecond = isSecondInsertAfter ? firstCell.prev() : firstCell.next();

        if(isFirstInsertAfter) {
            firstCell.insertAfter(suppotElementForFirst);
        }
        else {
            firstCell.insertBefore(suppotElementForFirst);
        }

        if(isSecondInsertAfter) {
            secondCell.insertAfter(suppotElementForSecond);
        }
        else {
            secondCell.insertBefore(suppotElementForSecond);
        }*/
		var suppotElementForFirst = secondCell.prev();
		var suppotElementForSecond = firstCell.prev();
		
		firstCell.insertAfter(suppotElementForFirst);
		secondCell.insertAfter(suppotElementForSecond);
    }

    var checkForWin = function() {
        var isWin = true;
        /*$('div.cell').toArray().forEach(function(element, index, array) {
            if(index !== 0) {
                var currentNumber = parseInt($(element).attr('data-number'));
                var prevNumber = parseInt($(array[index - 1]).attr('data-number'));

                if(prevNumber >= currentNumber)
                    isWin = false;
            }
        })*/

        var cells = $('div.cell');
        cells.each(function(index) {
            if(index > 0) {
                var currentNumber = parseInt($(this).attr('data-number'));
                var prevNumber = parseInt(cells.eq(index-1).attr('data-number'));

                if(prevNumber >= currentNumber) {
                    isWin = false;
                    return false;
                }
            }
        });
		
		return isWin;
    }
})();