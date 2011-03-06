function rnd(mul) { 
    return (Math.random() * 2 - 1) * 0.1 * (mul === undefined ? 1 : mul);
};
function drawGlyph(ctx, glyph) {
    var outline = glyph.o.split(' ');
    ctx.save();
    for (var i = 0; i < outline.length; ) {
	//per-glyph transform
	ctx.transform(1 + rnd(0.05), rnd(0.05), rnd(0.05), 1 + rnd(0.2), rnd(100), rnd(100));

	ctx.save();

	//per-curve transform
	ctx.transform(
	    1 + rnd(0.2), // scale x
	    rnd(0.01), // shear x
	    rnd(0.01), // shear y
	    1 + rnd(0.4), // scale y
	    rnd(200), //translate x
	    rnd(200)); // translate y

	// simpler to express rotation here
	ctx.rotate(Math.PI * rnd(0.2));

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

function drawWord(ctx, y, word) { 
    ctx.save();
    ctx.translate(100, -y);
    for(var i = 0; i < word.length; i++) {
	var c = word[i];
	ctx.transform(1-rnd(), rnd(1), rnd(), 1 + rnd(2), rnd(1), rnd());
	ctx.beginPath();
	var glyph = font.glyphs[c];
	drawGlyph(ctx, glyph);
	// overlap the letters a bit
	ctx.translate(glyph.ha * 0.8 - 45, 0);
	ctx.fill();
    }
    ctx.restore();
};

$(function() { 
    var canvas = $('#glyphs')[0];
    var ctx = canvas.getContext('2d');

    ctx.scale(0.03, -0.03);

    var y = 0
    "caprtcha absoelutely bestwest recognaise onlaine yajhoo hasspiwit invincible".split(' ').forEach(function(word) { 
	drawWord(ctx, y+=2500, word);
    });
});