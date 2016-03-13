
// Stores data for each game
var gameData = {
  enemies: d3.range(3),
  r: 15,
  width: 960,
  height: 500,
  newX: function() {
    return Math.max(gameData.r, Math.random() * (gameData.width - gameData.r));
  },
  newY: function() {
    return Math.max(gameData.r, Math.random() * (gameData.height - gameData.r));
  },
  cooldown: false,
  hscore: 0,
  cscore: 0,
  numCol: 0
};


//***********************************************************************

var move = function() {
  svg.selectAll('.enemy')
    .transition()
    .attr('cx', function(d) { return gameData.newX(); })
    .attr('cy', function(d) { return gameData.newY(); })
    .duration(1000);
};
var updateScore = function() {
  var hscore = d3.select('#hscore').text(gameData.hscore);
  var cscore = d3.select('#cscore').text(gameData.cscore);
  var numCol = d3.select('#numCol').text(gameData.numCol);
};

var svg = d3.select('.board').append('svg')
  .attr('width', gameData.width)
  .attr('height', gameData.height);

var pattern = d3.select('svg').append('defs')
    .append('pattern')
      .attr('id', 'shuriken')
      .attr('x', 0)
      .attr('y', 0)
      .attr('height', '30px')
      .attr('width', '30px')
      .append('image')
        .attr('x', '0')
        .attr('y', '0')
        .attr('width', '30px')
        .attr('height', '30px')
        .attr('xlink:href', 'shuriken.png');

var gameOver = function() {
  svg.classed({'gameOver': true});
  setTimeout(function() {
    svg.classed({'gameOver': false});
  }, 100);
};

//***********************************************************************

var update = function(data) {
  var dragstarted = function(d) {
    d3.event.sourceEvent.stopPropagation();
    d3.select(this).classed('dragging', true);
  };

  var dragged = function(d) {
    d3.select(this).attr('cx', d3.event.x).attr('cy', d3.event.y);
  };

  var dragended = function(d) {
    d3.select(this).classed('dragging', false);
  };

  var enemy = svg.selectAll('enemy')
    .data(data);
  // ENTER

  var player = svg.selectAll('player')
    .data(['player']);
  
  var force = d3.layout.force().start();
  
  enemy.enter().append('circle')
    .attr('cx', function(d) { return gameData.newX(); })
    .attr('cy', function(d) { return gameData.newY(); })
    .attr('r', gameData.r)
    .attr('fill', 'url(#shuriken)')
    .attr('class', 'enemy');

  player.enter().append('circle')
    .attr('cx', function(d) { return gameData.newX(); })
    .attr('cy', function(d) { return gameData.newY(); })
    .attr('r', gameData.r)
    .attr('fill', 'green');

  var playerDrag = d3.behavior.drag()
      .on('dragstart', dragstarted)
      .on('drag', dragged)
      .on('dragend', dragended);

  player.call(playerDrag);


  // ENTER + UPDATE
  // enemy.enemy(function(d) { return d; });
//  TODO: THERE IS A HOISTING ISSUE HERE< MOVE THIS
  var collide = function() {
    var enemyX = parseInt(d3.select(this).attr('cx'));
    var enemyY = parseInt(d3.select(this).attr('cy'));

    // convert playerData to board coordinates
    var playerX = parseInt(player.attr('cx'));
    var playerY = parseInt(player.attr('cy'));

    // Determine if the difference of the coordinates is less than the desired range
    var xDiff = Math.abs(enemyX - playerX);
    var yDiff = Math.abs(enemyY - playerY);
    var collision = Math.sqrt( (xDiff * xDiff) + (yDiff * yDiff) ) <= gameData.r * 2;

    // if the enemy is within the x and y difference ranges, increase collision count
    if (collision && !gameData.cooldown) {
      gameData.numCol++;
      gameData.cscore > gameData.hscore ? gameData.hscore = gameData.cscore : false;
      gameData.cscore = 0;
      gameOver();

      gameData.cooldown = true;
      setTimeout(function() {
        gameData.cooldown = false;
      }, 500);
    } else {
      
    }
    updateScore();
    
  };


  force.on('tick', function(e) {
    // call collide on each enemy to find out if player & enemy collided
    enemy.each(collide);
    force.alpha(.1);
  });

  // EXIT
  //enemy.exit().remove();
};

update(gameData.enemies);
setInterval(function() {
  move();
}, 1000);
setInterval(function() {
  gameData.cscore += 1;
}, 1000);






