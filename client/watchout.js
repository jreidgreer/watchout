var gameOptions = {
  enemies: d3.range(50),
  r: 20,
  width: 960,
  height: 500,
  newX: function() {
    return Math.max(gameOptions.r, Math.random() * (gameOptions.width - gameOptions.r));
  },
  newY: function() {
    return Math.max(gameOptions.r, Math.random() * (gameOptions.height - gameOptions.r));
  }
};


var svg = d3.select('.board').append('svg')
  .attr('width', gameOptions.width)
  .attr('height', gameOptions.height);



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
  
  enemy.enter().append('circle')
    .attr('cx', function(d) { return gameOptions.newX(); })
    .attr('cy', function(d) { return gameOptions.newY(); })
    .attr('r', gameOptions.r)
    .attr('fill', 'blue')
    .attr('class', 'enemy');

  player.enter().append('circle')
    .attr('cx', function(d) { return gameOptions.newX(); })
    .attr('cy', function(d) { return gameOptions.newY(); })
    .attr('r', gameOptions.r)
    .attr('fill', 'green');

  var playerDrag = d3.behavior.drag()
      .on('dragstart', dragstarted)
      .on('drag', dragged)
      .on('dragend', dragended);

  player.call(playerDrag);

  // ENTER + UPDATE
  // enemy.enemy(function(d) { return d; });

  var force = d3.layout.force()
    //.gravity(0.05)
    //.charge(function(d, i) { return i ? 0 : -2000; })
    .nodes(enemy)
    .size([gameOptions.width, gameOptions.height]); // ??? this could be effed up


  force.on('tick', function(e) {
    var q = d3.geom.quadtree(nodes),
      i = 0,
      n = nodes.length;

    while (++i < n) {
      q.visit(collide(nodes[i]));
    }  // is this nodes or enemy
  });

//  TODO: THERE IS A HOISTING ISSUE HERE< MOVE THIS
  var collide = function(enemy) {
    var r = gameOptions.radius,  // + ??? this used to add 16, we don't know why
      nx1 = enemy.x - r,
      nx2 = enemy.x + r,
      ny1 = enemy.y - r,
      ny2 = enemy.y + r;

    return function(quad, x1, y1, x2, y2) {
      // WTF is Quad???
      if (quad.point && (quad.point !== enemy)) {
        var x = enemy.x - quad.point.x,
          y = enemy.y - quad.point.y,
          // This is the distance between the center of the enemy and the player
          l = Math.sqrt(x * x + y * y),
          // This is the sum of the radii of the enemy and the player
          r = enemy.radius + quad.point.radius;

        // If the distance between them is less than their radii put together, a collision happens
        if (l < r) {
          //TODO: This is where we update our scoreboard 
          // l = (l - r) / l * .5;
          // enemy.x -= x *= l;
          // enemy.y -= y *= l;
          // quad.point.x += x;
          // quad.point.y += y;
        }
      }
      return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
    };
  };

  // EXIT
  enemy.exit().remove();
};

var move = function() {
  svg.selectAll('.enemy')
    .transition()
    .attr('cx', function(d) { return gameOptions.newX(); })
    .attr('cy', function(d) { return gameOptions.newY(); })
    .duration(1000);
};

update(gameOptions.enemies);
setInterval(function() {
  move();
}, 1000);