// mainscript.js: Contains the main functions and code

// ***** VARIABLES AND CONSTANTS *****

/* This Regex verifies that the input in a text box is a valid function.
 * It checks if either a single letter was entered (for an independent variable) or if something of this format was entered:
 *     f(x,y,...)=...
 */
var funcRE = /^([a-zA-Z])\(((?:[a-zA-Z](?:,(?:[a-zA-Z],)*[a-zA-Z])?))\)\s*=\s*(.+)\s*$|^\s*([a-zA-Z])\s*$/;

var functionSet = [];
var valuesNaught = 0;

var functionTree = [];

var dragObj = null;
var lineSrc = null;
var line = null;
var lines = [];
var defaultRadius = 40;

var adjacencyMatrix = [];

const width = 750,
      height = 400,
      margin = {
          top: 10,
          bottom: 100,
          left: 100,
          right: 10,
      };

var svg = d3.select("#container").append("svg")
    //.attr("width", width)
    //.attr("height", height)
    //.style("margin", "0 auto")
    //.style("display", "block")
    //.style("overflow", "visible")
    .on("mouseup", function (d) {
        if (line != null) {
            var coordinates = [0, 0];
            coordinates = d3.mouse(this);
            var x = coordinates[0];
            var y = coordinates[1];

            var minDistance = null;
            var target = null;
            var c = circles.selectAll("g")
              .each(function (d) {
                  var elem = d3.select(this);
                  if (!elem.node().isEqualNode(lineSrc.node())) {
                      var distance = Math.sqrt(Math.pow(x - elem.attr("ix"), 2) + Math.pow(y - elem.attr("iy"), 2));
                      if (minDistance == null || distance < minDistance) {
                          minDistance = distance;
                          target = elem;
                      }
                  }
                  else {
                  }
              });

            if (minDistance == null) line.remove();

            // If line is not targetted or target and source are already connected, remove
            if (/*hasParent || */target == null || minDistance > defaultRadius) {
                line.remove();
            }
            else {
                var srcDatum = lineSrc.datum();
                var targetDatum = target.datum();
                var result = addChild(targetDatum, srcDatum);
                if (!result) {
                    line.remove();
                    return;
                }

                lineSrc.datum(srcDatum);
                target.datum(targetDatum);

                var x1 = lineSrc.attr("ix");
                var y1 = lineSrc.attr("iy");
                var x2 = target.attr("ix");
                var y2 = target.attr("iy");
                var points = getLinePoints(x1, y1, x2, y2, defaultRadius);

                line.select("line").attr("x1", points[0]).attr("y1", points[1]).attr("x2", points[2]).attr("y2", points[3]);
                line.select(".arrowhead").attr("points", getArrowPoints(points[0], points[1], points[2], points[3]));

                lines.push({
                    "line": line,
                    "source": lineSrc,
                    "target": target
                });

                updateDerivative();
            }
        }

        dragObj = null;
        line = null;
        lineSrc = null;
    })
      .on("mousemove", function (d) {
          var coordinates = [0, 0];
          coordinates = d3.mouse(this);
          var x = coordinates[0];
          var y = coordinates[1];

          if (dragObj == null && line == null)
              return;
          else if (dragObj != null) {
              dragObj.attr("transform", "translate(" + x + "," + y + ")")
                  .attr("ix", x)
                  .attr("iy", y);

              for (var i = 0; i < lines.length; i++) {

                  if (dragObj.node().isEqualNode(lines[i].source.node())
                      || dragObj.node().isEqualNode(lines[i].target.node())) {
                      var x1 = lines[i].source.attr("ix");
                      var y1 = lines[i].source.attr("iy");
                      var x2 = lines[i].target.attr("ix");
                      var y2 = lines[i].target.attr("iy");
                      var points = getLinePoints(x1, y1, x2, y2, defaultRadius);

                      lines[i].line.select("line").attr("x1", points[0]).attr("y1", points[1]).attr("x2", points[2]).attr("y2", points[3]);
                      lines[i].line.select(".arrowhead").attr("points", getArrowPoints(points[0], points[1], points[2], points[3]));
                  }
              }
          }
          else if (line != null) {
              var x1 = lineSrc.attr("ix");
              var y1 = lineSrc.attr("iy");
              var points = getLinePoints(x1, y1, x, y, defaultRadius);

              line.select("line").attr("x1", points[0]).attr("y1", points[1]).attr("x2", x).attr("y2", y);
              line.select(".arrowhead")
                .attr("points", getArrowPoints(points[0], points[1], x, y));
          }
      })
    .on("contextmenu", function (d) {
        d3.event.preventDefault();
    });

var circles = svg.append("g");
var linesg = svg.append("g");

// ***** FUNCTIONS *****
function createTable(n) {
    for (var i = 0; i < n; i++) {
        var temp1 = document.createElement('tr');
        var temp3 = document.createElement('td');
        var temp5 = document.createElement('input');
        temp5.type = 'text';
        temp5.placeholder = 'f(x,y,...)=...';

        temp3.className = 'fun';
        temp3.id = 'fun' + i;

        temp3.appendChild(temp5);
        temp1.appendChild(temp3);

        document.getElementById('inputtable').getElementsByTagName("tbody")[0].appendChild(temp1);
    }
}

function addEventToFun() {
    var funSet = document.getElementsByClassName('fun');
    for (var i = 0; i < funSet.length; i++) {
        funSet[i].addEventListener('keyup', function () {
            var val = d3.select(this).attr('id').substring(3);
            if (!functionSet[val]) {
                logText(('fun' + val), ('var' + val), true, val, false);
                createFunction();
            }

            var text = logText(('fun' + val), ('var' + val), false, val, false);
            if (!text) {
                d3.select(this).style("background-color", "#ff7777");
            }
            else {
                d3.select(this).style("background-color", "#4ef442");
                updateTextOfFunction(text, val);
                updateDerivative();
            }
        })
    }
}

function updateTextOfFunction(text, val) {
    functionSet[val].data[0] = text;
    circles.selectAll('g')
      .data(functionSet)
      .select("text")
      .text(function (d) {
          return d.data[0];
      });
}

// Logs data. Sets up 2 different points for each data point
// Adds parent and children to Datum when
function logText(id1, id2, doPush, index, varBoolean) {
    var text = document.getElementById(id1).children[0].value;

    if (text === "Type a Function") {
        return null;
    }
    if (doPush) {
        var datum = [];
        datum.push(text)
        datum.push(index)
        var node = createNode(datum);
        functionSet.push(node)
    }

    // Validate the variable string
    var valid = funcRE.test(text);
    if (!valid) {
        return valid;
    }

    return (text)
}

function updateDerivative() {
    // Every time logText succeeds, update everything
    var root = null;
    var validTree = true;
    functionSet.forEach(function (d) {
        if (d.parent == null) {
            if (root == null) {
                root = d;
            }
            else {
                // Display error message that there is more than one root
                validTree = false;
            }
        }
    });
    if (validTree) {
        d3.select("#derivative").html("$$" + generateFullExpression(root, function (d) {
            var match = funcRE.exec(d[0]);
            if (match[1] == null) {
                return [match[0], match[0], match[0]];
            }
            else {
                return [match[1], match[2].split(','), match[3]];
            }
        }) + "$$");
    }

    MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
}

function createFunction(x, y) {
    var xinitial = x === undefined ? width / 2 : x;
    var yinitial = y === undefined ? height / 8 : y;

    var group = circles.selectAll("g")
      .data(functionSet)
      .enter()
      .append("g")
      .attr("transform", "translate(" + xinitial + "," + yinitial + ")")
      .attr("ix", xinitial)
      .attr("iy", yinitial)
      .on("mousedown", function (d) {
          if (d3.event.button == 0) {
              line = null;
              dragObj = d3.select(this);
          }
          else {
              // Make sure dragObj is null
              dragObj = null;

              var elem = d3.select(this);

              // add line drawing mechanic
              var coordinates = [0, 0];
              coordinates = d3.mouse(this);
              var x = coordinates[0];
              var y = coordinates[1];

              var points = getLinePoints(elem.attr("ix"), elem.attr("iy"), x, y, defaultRadius);

              line = linesg.append("g");

              line.append("line")
                  .attr("x1", points[0])
                  .attr("y1", points[1])
                  .attr("x2", x)
                  .attr("y2", y)
                  .attr("stroke-width", 2)
                  .attr("stroke", "black");

              var triangle = line.append("polygon")
                  .classed("arrowhead", true)
                 .attr("points", getArrowPoints(points[0], points[1], x, y))
                 .attr("fill", "black");
              //.classed("line-draggable", true);
              lineSrc = elem;
          }
      });
    group.append("circle")
      .style('fill', "#e0e0e0")
      .attr('r', defaultRadius)
      .attr("cx", 0)
      .attr("cy", 0)
      .attr('id', function (d, i) { return 'p' + d.data[2] })
    group.append("text")
      .attr("x", 0)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .text(function (d) {
          console.log(d);
          return d.data[0];
      });
}

function loadFunctions() {
    d3.json("functions.json", function (error, data) {
        var trees = data.map(convertJsonToTree);
        console.log(trees);

        d3.select("#functionscontainer tbody").selectAll("tr")
            .data(trees)
            .enter()
            .append("tr")
            .classed("data", true)
            .append("td")
            .html(function (d) { return d.data; })
            .on("click", function (d, i) {
                // Code for when a function is clicked

                var xinitial = 200;
                var yinitial = 200;

                (function recursiveDisplay(node, index, offsetX, offsetY) {
                    var layerOffset = 100;
                    var childOffset = 100;

                    console.log(node.data);
                    document.getElementById("fun" + index).children[0].value = node.data;
                    logText(("fun" + index), ('var' + index), true, index, false);
                    console.log(functionSet);
                    createFunction(offsetX, offsetY);

                    node.children.forEach(function (c, i) {
                        var layerDiff = c.layer - node.layer;
                        
                        var newXoffset = offsetX + (i * childOffset);
                        var newYoffset = offsetY + (layerDiff * layerOffset);
                        index++;
                        recursiveDisplay(c, index, newXoffset, newYoffset);
                        
                        var src = circles.selectAll("g")
                            .filter(function (d, i) { return i === index - 1; })

                        var dest = circles.selectAll("g")
                            .filter(function (d, i) { return i === index; })

                        var points = getLinePoints(src.attr("ix"), src.attr("iy"), dest.attr("ix"), dest.attr("iy"), defaultRadius);

                        // Add connecting line
                        var tmpline = linesg.append("g");

                        tmpline.append("line")
                            .attr("x1", points[0])
                            .attr("y1", points[1])
                            .attr("x2", points[2])
                            .attr("y2", points[3])
                            .attr("stroke-width", 2)
                            .attr("stroke", "black");

                        var triangle = tmpline.append("polygon")
                            .classed("arrowhead", true)
                           .attr("points", getArrowPoints(points[0], points[1], points[2], points[3]))
                           .attr("fill", "black");

                        lines.push({
                            "line": tmpline,
                            "source": src,
                            "target": dest
                        });
                    });
                })(d, 0, xinitial, yinitial);
            });
    });
}

// ***** ADD EVENT LISTENERS *****
document.getElementById('clr').addEventListener('click', function () {
    circles.selectAll('g').remove();
    linesg.selectAll('g').remove();
    lines = [];
    functionSet = [];
    var functions = document.getElementsByClassName('fun');
    for (var i = 0; i < functions.length; i++) {
        functions[i].children[0].value = '';
    }

    d3.selectAll(".fun").style("background-color", "white");

})

// ***** SET UP TABLES AND EVENTS *****
createTable(12);
loadFunctions();
addEventToFun();
