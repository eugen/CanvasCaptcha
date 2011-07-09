var drawCaptcha = (function() { 
    function rnd(mul) { 
	return (Math.random() * 2 - 1) * 0.1 * (mul === undefined ? 1 : mul);
    };
    function drawGlyph(ctx, glyph) {
	var outline = glyph.outline;
	if(!outline) { 
	    outline = glyph.outline = glyph.o.split(' ').map(function(e) { 
		var i = parseInt(e);
		return isNaN(i) ? e : i;
	    });
	}
	ctx.save();
	for (var i = 0; i < outline.length; ) {
	    ctx.transform(1 + rnd(0.05), rnd(0.05), rnd(0.05), 1 + rnd(0.2), rnd(100), rnd(100));
	    ctx.rotate(rnd(0.1));

	    ctx.save();

	    // keep this disabled
	    /*
	    //per-curve non-accumulative transform
	    ctx.transform(
	    1 + rnd(0.2), // scale x
	    rnd(0.01), // shear x
	    rnd(0.01), // shear y
	    1 + rnd(0.4), // scale y
	    rnd(200), //translate x
	    rnd(200)); // translate y

	    // simpler to express rotation here
	    ctx.rotate(Math.PI * rnd(0.2));
	    */

	    var action = outline[i++];

	    switch(action) {
	    case 'm':
		ctx.moveTo(outline[i++], outline[i++]);
		break;
	    case 'l':
		ctx.lineTo(outline[i++], outline[i++]);
		break;
	    case 'q':
		var cpx = outline[i++];
		var cpy = outline[i++];
		ctx.quadraticCurveTo(outline[i++], outline[i++], cpx, cpy);
		break;
	    case 'b':
		var x = outline[i++];
		var y = outline[i++];
		ctx.bezierCurveTo(outline[i++], outline[i++], outline[i++], outline[i++], x, y);
		break;
	    }

	    ctx.restore();
	}
	ctx.restore();
    };

    function drawWord(font, ctx, x, word) { 
	ctx.translate(x, 0);
	for(var i = 0; i < word.length; i++) {
	    var c = word[i];
	    
	    //large-ish per-word accumulative transform
	    ctx.transform(1-rnd(), rnd(1), rnd(), 1 + rnd(2), rnd(1), rnd());

	    ctx.beginPath();
	    var glyph = font.glyphs[c];
	    drawGlyph(ctx, glyph);
	    // overlap the letters quite a bit
	    ctx.translate(glyph.ha * 0.8 - 45, 0);
	    // without strokes, some edges dissapear when confronted with the extreme
	    ctx.stroke();
	    ctx.fill();
	}
    };

    return function _drawCaptcha(options) {
	var o = {
	    context: /*Canvas context*/null,
	    font: null,
	    style: "navy",
	    bgStyle: null,
	    text: "captcha"
	};
	for(var k in options) { 
	    o[k] = options[k];
	}

	var ctx = o.context;
	ctx.save();
	ctx.clearRect(0, 0, 1000, 1000);
	if(o.bgStyle) {
	    ctx.fillStyle = o.bgStyle;
	    ctx.fillRect(0, 0, 1000, 1000);
	}
	ctx.fillStyle = o.style;
	ctx.scale(0.04, -0.04);
	var x = 100;
	ctx.translate(0, -2100);
	o.text.split(' ').forEach(function(word) { 
	    drawWord(o.font, ctx, x, word);
	    x += 400;
	});
	ctx.restore();
    }

})();

/* if Running under node, initialize stuff */
if(typeof require != 'undefined') {
    var gentilis = require("./fonts/gentilis.js");
    var optimer = require("./fonts/optimer.js");
    var helvetiker = require("./fonts/helvetiker.js");
    var Canvas = require('canvas');
    var redis = require('redis');
    var fs = require('fs');
    
    var words = fs.readFileSync("/usr/share/dict/words", "utf8").split("\n");
    // filter only words that are all lowercase and of a certain length
    words = words.filter(function(w) { return /^[a-z]{7,10}$/.test(w); });
    console.log("Found " + words.length + " appropriate words");
    var letters="abcdefghijklmnopqrstuvwxyz";
    
    var rndInt = function(max) { 
	return Math.floor(Math.random() * max);
    }

    exports.createCaptcha = function() {
	var canvas = new Canvas(250, 150);
	var ctx = canvas.getContext('2d');
	// get a random word
	var word = words[rndInt(words.length)];
	// add/remove random letters to it
	if(Math.random() > 0.8) {
	    var pos = rndInt(word.length);
	    word = word.substring(0, pos) + letters[rndInt(letters.length)] + word.substring(pos);
	}
	if(Math.random() < 0.3) {
	    var pos = rndInt(word.length);
	    word = word.substring(0, pos - 1) + word.substring(pos);
	}

	drawCaptcha({
	    context: ctx, 
	    font: gentilis.font, 
	    style: 'black',
//	    bgStyle: '#FDFEFF',
	    text: word
	});

	return {
	    url: canvas.toDataURL(),
	    word: word
	};
    }
}