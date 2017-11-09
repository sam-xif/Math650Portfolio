/*
 Trees are represented as JSON objects that can be converted into adjacency matrix form.
 Nodes with no children are assumed to be independent variables, though in the future there ma be a distinction between 'dependent' nodes and 'independent' nodes.s
 */

function createEmptyTree() {
    return {
        isRoot: true, // The is root property may not be needed
        parent: null,
        children: [],
        data: null
    }
}

function createNode(data) {
    return {
        isRoot: false,
        parent: null,
        children: [],
        data: data,
        layer: null
    }
}

function addChild(node, parent) {
    if (node.layer != null && parent.layer > node.layer) {
        return false;
    }

    parent.children.push(node);
    node.parent = parent;
    node.layer = node.parent.layer + 1;
    return true;
}

function generateAdjacencyMatrix() {

}

function getLeaves(tree, displayFunc) {
    var leaves = [];

    var nodeStack = [];
    nodeStack.push(tree);
    while (nodeStack.length > 0) {
        var node = nodeStack.pop();
        var children = node.children;

        // Process the node
        if (children.length == 0) {
            var contains = false;
            leaves.forEach(function (d) { if (d.data == node.data) contains = true; });
            if (!contains)
                leaves.push(node);
        }

        for (var i = children.length - 1; i >= 0; i--) {
            nodeStack.push(children[i]);
        }
    }
    return leaves;
}

function getPathsToLeaf(leaf, tree) {
    var leaves = getLeaves(tree);
    var paths = [];

    // Get all paths to each variable
    var nodeStack = [];
    var path = [];
    var counter = 0;
    nodeStack.push({ layer: 0, node: tree });
    while (nodeStack.length > 0) {
        var obj = nodeStack.pop();

        // This loop backtracks to the layer right before the node that was just popped off the stack
        while (path.length > 0 && path[path.length - 1].layer >= obj.layer) {
            path.pop();
        }

        path.push(obj);
        if (obj.node.data == leaf.data) {
            var pathArr = [];
            path.forEach(function (d) { pathArr.push(d.node); });
            paths.push(pathArr);
        }

        var children = obj.node.children;
        for (var i = children.length - 1; i >= 0; i--) {
            nodeStack.push({ layer: obj.layer + 1, node: children[i] });
        }
    }
    return paths;
}

// Converts a path to LaTeX
function convertPathsToDerivative(paths, partial, displayFunc) {
    var strings = [];
    if (partial) {
        paths.forEach(function (path) {
            for (var i = 0; i < path.length - 1; i++) {
                if (displayFunc(path[i].data)[1].length > 1) {
                    strings.push("\\frac{\\partial (" + displayFunc(path[i].data)[2] + ")}{\\partial " + displayFunc(path[i + 1].data)[0] + "} ");
                }
                else {
                    strings.push("\\frac{d (" + displayFunc(path[i].data)[2] + ")}{d " + displayFunc(path[i + 1].data)[0] + "} ");
                }
            }
            strings.push("+ ");
        });
    }
    else {
        // For derivatives of one variable
    }
    var string = "";
    for (var i = 0; i < strings.length - 1; i++) {
        string += strings[i];
    }
    return string;
}

function generateFullExpression(tree, displayFunc) {
    var leaves = getLeaves(tree, displayFunc);
    var paths = [];

    leaves.forEach(function (d) {
        paths.push(getPathsToLeaf(d, tree));
    });

    var numComponents = 0;
    var derivatives = [];
        paths.forEach(function (d) {
            derivatives.push(convertPathsToDerivative(d, true, displayFunc));
            derivatives.push(", ");
            numComponents++;
        });

    var string = "";
    for (var i = 0; i < derivatives.length - 1; i++) {
        string += derivatives[i];
    }

    if (numComponents > 1)
        return "\\nabla " + displayFunc(tree.data)[0] + " = \\Big \\langle " + string + " \\Big \\rangle";
    else
        return displayFunc(tree.data)[0] + "'" + " = " + string;
}

function test() {
    var root = createEmptyTree();
    root.data = "F";

    var xnode = createNode("x");
    var ynode = createNode("y");
    var snode = createNode("s");
    var tnode = createNode("t");
    var unode = createNode("u");

    xnode.children.push(snode);
    xnode.children.push(tnode);
    ynode.children.push(snode);
    ynode.children.push(tnode);

    snode.children.push(unode);

    root.children.push(xnode);
    root.children.push(ynode);

    d3.select("#derivative").html("$$" + generateFullExpression(root, function (d) { return d; }) + "$$");
}
