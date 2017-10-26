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
        data: data
    }
}

function addChild(node, parent) {
    parent.children.push(node);
    node.parent = parent;
}

function generateAdjacencyMatrix() {

}

function getLeaves(tree) {
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
    console.log(path);
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

function convertPathToDerivative(path) {

}

function test() {
    var root = createEmptyTree();
    root.data = "F";
    
    var xnode = createNode("x");
    var ynode = createNode("y");
    var snode = createNode("s");
    var tnode = createNode("t");

    xnode.children.push(snode);
    xnode.children.push(tnode);
    ynode.children.push(snode);
    ynode.children.push(tnode);

    root.children.push(xnode);
    root.children.push(ynode);

    console.log(root);

    var leaves = getLeaves(root);
    console.log(getPathsToLeaf(leaves[1], root));
}

test();

/*
if (obj.node.data == leaf.data) {
    var counter_tmp = 0;
    var cleanedPath = [];
    for (var i = 0; i < path.length; i++) {
        if (counter_tmp == path[i].layer) {
            cleanedPath.push(path[i]);
            counter_tmp++;
        }
        else {
            var oldNode = cleanedPath.pop();
            counter_tmp = oldNode.layer;
            if (oldNode.layer == path[i].layer) {
                cleanedPath.push(path[i]);
                counter_tmp++;
            }
        }
    }
    paths.push(cleanedPath);
    for (var i = 0; i < path.length; i++) {
        if (path[i].layer > )
        path.splice(, 1);
    }

    path = [];
    counter_tmp = 0;
}
*/