import { Binding, Diagram, GraphObject, Margin, Placeholder, Node, Panel, Adornment, Shape, TextBlock, TreeLayout, TreeModel, Spot, Link } from 'gojs'
import 'gojs/extensions/Figures'
import 'gojs/extensions/DrawCommandHandler'

const theme = {
    "Y": "#00CCBF",
    "N": "#FF5F5D",
}
const $ = GraphObject.make

const myDiagram = $(Diagram, 'app',
    {
        "commandHandler.copiesTree": true,
        "commandHandler.copiesParentKey": true,
        "commandHandler.deletesTree": true,
        "draggingTool.dragsTree": true,
        "undoManager.isEnabled": true,
        layout: new TreeLayout({ angle: 90, layerSpacing: 80, nodeSpacing: 100 })
    }
)

myDiagram.nodeTemplate = $(Node,
    'Vertical',
    { selectionObjectName: "TEXT" },
    $(TextBlock,
        {
            name: 'TEXT',
            editable: true
        },
        new Binding("text", "text").makeTwoWay(),
        new Binding("scale", "scale").makeTwoWay(),
        new Binding("font", "font").makeTwoWay(),
    )
)

myDiagram.nodeTemplate.selectionAdornmentTemplate = $(Adornment, "Spot",
    $(Panel, "Auto",
        $(Shape, { fill: null, stroke: "dodgerblue", strokeWidth: 3 }),
        $(Placeholder, { margin: new Margin(4, 4, 0, 4) })
    ),
    $("Button",
        {
            alignment: Spot.Right,
            alignmentFocus: Spot.Left,
            click: addNodeAndLink
        },
        $(TextBlock, "+",
            { font: "bold 8pt sans-serif" })
    )
);

myDiagram.linkTemplate =
    $(Link,
        {
            routing: Link.Normal,
            curve: Link.JumpGap
        },
        $(Shape,
            {
                strokeWidth: 1,
            },
            new Binding("stroke", "linkText", function (a) {
                return theme[a]
            })
        ),
        $(Shape,
            {
                strokeWidth: 1,
                toArrow: "Standard",
            },
            new Binding("fill", "linkText", function (a) {
                return theme[a]
            }),
            new Binding("stroke", "linkText", function (a) {
                return theme[a]
            }),
        ),
        $(TextBlock,
            {
                editable: true,
                background: 'white',
                margin: new Margin(8, 8, 8, 8)
            },
            new Binding("text", "linkText").makeTwoWay(),
        )
    );


function addNodeAndLink(e, obj) {
    [
        { text: 'Node', linkText: 'Y' },
        { text: 'Node', linkText: 'N' }
    ].forEach(item => addNode(e, obj, item))
}

function addNode(e, obj, defData = {}) {
    const adorn = obj.part;
    const diagram = adorn.diagram;

    diagram.startTransaction("Add Node");
    const oldnode = adorn.adornedPart;
    const olddata = oldnode.data;

    const newdata = { text: "idea", linkText: 'Y', parent: olddata.key, ...defData };
    diagram.model.addNodeData(newdata);
    diagram.commitTransaction("Add Node");

    const newnode = diagram.findNodeForData(newdata);
    if (newnode !== null) diagram.scrollToRect(newnode.actualBounds);
}

myDiagram.model = new TreeModel([
    { key: '1', text: "Root Node" },
])

// When the blob is complete, make an anchor tag for it and use the tag to initiate a download
// Works in Chrome, Firefox, Safari, Edge, IE11
function myCallback(blob) {
    var url = window.URL.createObjectURL(blob);
    var filename = `${Date.now()}.png`;

    var a = document.createElement("a");
    a.style = "display: none";
    a.href = url;
    a.download = filename;

    // IE 11
    if (window.navigator.msSaveBlob !== undefined) {
        window.navigator.msSaveBlob(blob, filename);
        return;
    }

    document.body.appendChild(a);
    requestAnimationFrame(() => {
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    });
}

function makeBlob() {
    var blob = myDiagram.makeImageData({ background: "white", returnType: "blob", callback: myCallback });
}

document.querySelector('.download').addEventListener('click', makeBlob)