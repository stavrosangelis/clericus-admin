import React, {Component} from 'react';
import {Input, FormGroup} from 'reactstrap';
import * as d3 from "d3";

var canvas, ctx, nodes, links, sizeRatio, width, height, edgesType, edgesLabels, transform={k:1,x:0,y:0};

const calcNodeSize = (size, sizeRatio) => {
  // min: 1.7 max: 5
  let newSize = parseFloat(sizeRatio,10)*parseInt(size,10);
  if (newSize<1.7) {
    newSize = 1.7;
  }
  return newSize*15;
}

const zoomedEnd = async() => {
  if (d3.event!==null && d3.event.transform!==null) {
    transform = d3.event.transform;
  }
  let scale = transform.k;
  ctx.save();
  ctx.clearRect(0,0,width,height);
  ctx.translate(transform.x, transform.y);
  ctx.scale(scale, scale);
  drawLines(transform);
  drawNodes(transform);
  ctx.restore();
}

const zoom_handler = d3.zoom()
  .scaleExtent([0.1, 8])
  .on("zoom",zoomedEnd);

const drawNodes = (coords) => {
  let nodesCount = d3.select("#nodes-count");
  if (nodesCount.html()==="") {
    nodesCount.html(nodes.length);
  }
  let lx = coords.x;
  let ty = coords.y;
  let scale = coords.k;
  let sizes = nodes.map(n=>n.size);
  let maxSize = Math.max(...sizes);
  sizeRatio = 3/maxSize;
  for (let i=0; i<nodes.length; i++) {
    let d = nodes[i];
    d.visible = false;
    d.radius = calcNodeSize(d.size, sizeRatio);
    let radius = d.radius;
    let x = d.x;
    let y = d.y;
    let newX = lx+(x*scale);
    let newY = ty+(y*scale);
    if (newX>0 && newX<width && newY>0 && newY<height) {
      d.visible = true;
      let labelRows = d.label.split(" ").filter(i=>i!=="");
      ctx.beginPath();
      // circle
      if (typeof d.selected!=="undefined" && d.selected) {
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#33729f";
        radius+=5;
      }
      else if (typeof d.associated!=="undefined" && d.associated) {
        ctx.lineWidth = 3;
        ctx.strokeStyle = d.strokeColor;
      }
      else {
        ctx.lineWidth = 0.5;
        ctx.strokeStyle = d.strokeColor;
      }
      ctx.arc(x, y, radius, 0, 2 * Math.PI, true);
      ctx.fillStyle = d.color;
      ctx.fill();
      ctx.stroke();
      let textX = x;
      let textY = y;
      let length = labelRows.length;
      if (length>2) {
        textY -= 6 ;
      }
      for (let t=0; t<labelRows.length; t++) {
        let label = labelRows[t];
        ctx.fillStyle = "#333333";
        ctx.font = "9px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "Top";
        ctx.fillText(label, textX, textY)
        textY+=10;
      }

      ctx.closePath();
    }
  }
}

const drawLines = (coords) => {
  let coordsX = coords.x;
  let coordsY = coords.y;
  let scale = coords.k;
  if (edgesType==="simple") {
    let compare = [];
    let newLinks = [];
    for (let i=0; i<links.length; i++) {
      let item = links[i];
      let nodes = `${item.source.index},${item.target.index}`;
      if(compare.indexOf(nodes)===-1) {
        compare.push(nodes);
        newLinks.push(item);
      }
    }
    links = newLinks;
  }
  let linksCount = d3.select("#links-count");
  if (linksCount.html()==="") {
    linksCount.html(links.length);
  }
  let pairs = [];
  for (let i=0; i<links.length; i++) {
    let d = links[i];
    let sx = d.source.x;
    let sy = d.source.y;
    let tx = d.target.x;
    let ty = d.target.y;

    let inverse=false;
    let pair = `${d.source.index},${d.target.index}`;
    let inversePair = `${d.target.index},${d.source.index}`;
    if (pairs.indexOf(pair)>-1 || pairs.indexOf(inversePair)>-1) {
      inverse=true;
    }
    else {
      pairs.push(pair);
      pairs.push(inversePair);
    }
    //fix source direction
    if (inverse) {
      let origin = links.find(l=>l.source.index===d.source.index && l.target.index===d.target.index && l.index!==d.index);
      if (typeof origin==="undefined") {
        origin = links.find(l=>l.source.index===d.target.index && l.target.index===d.source.index && l.index!==d.index);
      }
      if (typeof origin!=="undefined") {
        if (sx!==origin.source.x && sy!==origin.source.y) {
          sx = origin.source.x;
          sy = origin.source.y;
          tx = origin.target.x;
          ty = origin.target.y;
        }
      }
    }

    let newX = coordsX+(sx*scale);
    let newY = coordsY+(sy*scale);
    if (newX>0 && newX<width && newY>0 && newY<height) {
      if (edgesType==="simple" && !inverse) {
        ctx.beginPath();
        ctx.moveTo(d.source.x, d.source.y);
        ctx.lineTo(d.target.x, d.target.y);
        if (typeof d.associated!=="undefined" && d.associated) {
          ctx.lineWidth = 2;
          ctx.strokeStyle = "#33729f";
        }
        else {
          ctx.lineWidth = 1;
          ctx.strokeStyle = "#999";
        }
        if (edgesLabels==="visible") {
          let sx = d.source.x, sy = d.source.y;
          let tx = d.target.x, ty = d.target.y;
          let lineWidth = 0;
          let lineHeight = 0;
          let textX = 0;
          let textY = 0;
          let smallX,smallY;
          if (sx>tx) {
            smallX = tx;
            lineWidth = sx-tx;
          }
          else {
            smallX = sx;
            lineWidth = tx-sx;
          }
          textX = smallX+(lineWidth/2);
          if (sy>ty) {
            smallY = ty;
            lineHeight = sy-ty;
          }
          else {
            smallY = sy;
            lineHeight = ty-sy;
          }
          textY= smallY+(lineHeight/2);
          ctx.fillStyle = "#666";
          ctx.font = "9px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(d.label, textX, textY);
        }
        ctx.stroke();
        ctx.closePath();
      }
      if (edgesType==="double") {
        let mx = 0;
        let my = 0;
        let middlePointX = 0;
        let middlePointY = 0;
        let tension = 50;
        if (sx<=tx) {
          middlePointX = (tx-sx)/2;
        }
        else {
          middlePointX = (sx-tx)/2;
        }
        if (sy<=ty) {
          middlePointY = (ty-sy)/2;
        }
        else {
          middlePointY = (sy-ty)/2;
        }
        if (middlePointX<tension) middlePointX = tension
        if (middlePointY<tension) middlePointY = tension;
        if (inverse) {
          if (sx<=tx && sy<=ty) {
            mx = sx+(middlePointX/2);
            my = ty-(middlePointY/2);
          }
          if (sx>tx && sy<ty) {
            mx = sx-(middlePointX/2);
            my = ty-(middlePointY/2);
          }
          if (sx>tx && sy>ty) {
            mx = tx+(middlePointX/2);
            my = sy-(middlePointY/2);
          }
          if (sx<tx && sy>ty) {
          mx = sx+(middlePointX/2);
          my = ty+(middlePointY/2);
        }
        }
        else {
          if (sx<=tx && sy<=ty) {
            mx = tx-(middlePointX/2);
            my = sy+(middlePointY/2);
          }
          if (sx>tx && sy<ty) {
            mx = tx+(middlePointX/2);
            my = sy+(middlePointY/2);
          }
          if (sx>tx && sy>ty) {
            mx = sx-(middlePointX/2);
            my = ty+(middlePointY/2);
          }
          if (sx<tx && sy>ty) {
            mx = tx-(middlePointX/2);
            my = sy-(middlePointY/2);
          }
        }

        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.quadraticCurveTo(mx, my, tx, ty);
        if (typeof d.associated!=="undefined" && d.associated) {
          ctx.lineWidth = 3;
          if (inverse) ctx.strokeStyle = "#36af50"
          else ctx.strokeStyle = "#33729f";
        }
        else {
          ctx.lineWidth = 1;
          ctx.strokeStyle = "#999";
        }
        if (edgesLabels==="visible") {
          let textColor = "#666";
          let fontStyle = "9px sans-serif";
          if (typeof d.associated!=="undefined" && d.associated) {
            if (inverse) {
              textColor = "#36af50";
            }
            else {
              textColor= "#33729f";
            }
            fontStyle = "bold 9px sans-serif";
          }
          ctx.fillStyle = textColor;
          ctx.font = fontStyle;
          ctx.textAlign = "center";
          ctx.fillText(d.label, mx, my);
        }
        ctx.stroke();
        ctx.closePath();
      }
    }
  }
}

class NetworkGraph extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      chart: [],
      optionsVisible: false,
      edgesType: "simple",
      edgesLabels: "visible",
      d: null,
      associatedNodes: [],
      associatedLinks: []
    }

    this.drawGraph = this.drawGraph.bind(this);
    this.updateDimensions = this.updateDimensions.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.toggleOptions = this.toggleOptions.bind(this);
    this.clickNode = this.clickNode.bind(this);
    this.selectedNodes = this.selectedNodes.bind(this);
    this.clearAssociated = this.clearAssociated.bind(this);
  }

  drawGraph() {
    let data = this.props.data;
    if (data===null) {
      return false;
    }
    width = this.props.width;
    height = this.props.height;
    edgesType = this.state.edgesType;
    edgesLabels = this.state.edgesLabels;

    let container = d3.select("#network-graph");
    container.html("");

    canvas = container
      .append("canvas")
      .attr("id", "visualisation-canvas")
			.attr('width', width)
			.attr('height', height);

    ctx = canvas.node().getContext('2d');

    nodes = data.nodes.map(d => Object.create(d));
    links = data.links.map(d => Object.create(d));;

    let strength = -400;
    const simulation = d3.forceSimulation(nodes)
      .force("link",
      d3.forceLink(links)
          .id(d => d.id)
          .strength(1)
          .distance(200)
        )
      .force("charge", d3.forceManyBody().strength(strength))
      .force("center", d3.forceCenter(width/2, height/2))
      .force('collide', d3.forceCollide(60))
      .stop();

    // control ticks aka performance trick
    const iterations = 100;
    var threshold = 0.001;
    simulation.restart();
    for (var i = iterations; i > 0; --i) {
      simulation.tick();
      if(simulation.alpha() < threshold) {
        break;
      }
    }
    simulation.stop();

    d3.select("#graph-zoom-in")
    .on("click", function() {
      zoom_handler.scaleBy(canvas, 1.25);
    });
    d3.select("#graph-zoom-out")
    .on("click", function() {
      zoom_handler.scaleBy(canvas, 0.75);
    });
    d3.select("#graph-pan-up")
    .on("click", function() {
      let currentTransform = d3.zoomTransform(canvas);
      let newX = currentTransform.x;
      let newY = currentTransform.y - 50;
      zoom_handler.translateBy(canvas, newX, newY);
    });
    d3.select("#graph-pan-right")
    .on("click", function() {
      let currentTransform = d3.zoomTransform(canvas);
      let newX = currentTransform.x + 50;
      let newY = currentTransform.y;
      zoom_handler.translateBy(canvas, newX, newY);
    });
    d3.select("#graph-pan-down")
    .on("click", function() {
      let currentTransform = d3.zoomTransform(canvas);
      let newX = currentTransform.x;
      let newY = currentTransform.y + 50;
      zoom_handler.translateBy(canvas, newX, newY);
    });
    d3.select("#graph-pan-left")
    .on("click", function() {
      let currentTransform = d3.zoomTransform(canvas);
      let newX = currentTransform.x - 50;
      let newY = currentTransform.y;
      zoom_handler.translateBy(canvas, newX, newY);
    });

    zoom_handler(d3.select(ctx.canvas));
    this.updateDimensions();
  }

  async updateDimensions() {
    let newWidth = this.props.width;
    let newHeight = this.props.height;
    width = newWidth;
    height = newHeight;
    if (ctx.canvas!==null) {
      ctx.save();
      canvas.attr("height", newHeight);
      canvas.attr("width", newWidth);
      ctx.clearRect(0,0,newWidth,newHeight);
      ctx.translate(0,0);
      ctx.scale(1, 1);
      drawLines(transform);
      drawNodes(transform);
      ctx.restore();
    }
    zoomedEnd();
  }

  handleChange(e) {
    let target = e.target;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    let name = target.name;
    this.setState({
      [name]: value
    }, ()=>{
      this.drawGraph();
    })
  }

  toggleOptions() {
    this.setState({
      optionsVisible: !this.state.optionsVisible
    })
  }

  clickNode(e) {
    if (e.target.getAttribute("id")!=="visualisation-canvas") {
      return false;
    }
    let visibleNodes = nodes.filter(n=>n.visible);
    let transformX = transform.x;
    let transformY = transform.y;
    let scale = transform.k;
    let x = e.offsetX/scale;
    let y = e.offsetY/scale;
    // locate node
    let clickedNodes = [];
    for (let i=0; i<visibleNodes.length; i++) {
      let d = visibleNodes[i];
      let dx = d.x;
      let dy = d.y;
      let radius = d.radius;
      let lx = dx-radius+transformX/scale;
      let rx = dx+radius+transformX/scale;
      let ty = dy-radius+transformY/scale;
      let by = dy+radius+transformY/scale;

      if (x>=lx && x<=rx && y>=ty && y<=by) {
        clickedNodes.push(d);
      }
    }
    clickedNodes.sort((a,b)=>{
      let keyA=a.index;
      let keyB=b.index;
      if (keyA>keyB) return -1;
      if (keyA<keyB) return 1;
      return 0;
    });
    let clickedNode = null;
    if (clickedNodes.length>0) {
      clickedNode = clickedNodes[0];
    }
    else {
      return false;
    }
    clickedNode.selected=true;
    this.props.clickNode(clickedNode.id);
    if (this.state.d!==null) {
      let prevNode = nodes.find(n=>n===this.state.d);
      if (typeof prevNode!=="undefined") {
        delete prevNode.selected;
      }
    }
    this.setState({d:clickedNode});
  }

  selectedNodes() {
    let d = this.state.d;
    this.clearAssociated();

    // 3. get associated links
    let incomingLinks = links.filter(l=>l.source.id===d.id);
    let outgoingLinks = links.filter(l=>l.target.id===d.id);
    incomingLinks = incomingLinks.map(l=>l.refId);
    outgoingLinks = outgoingLinks.map(l=>l.refId);

    let associatedLinks = incomingLinks.concat(outgoingLinks.filter(i => incomingLinks.indexOf(i)===-1));
    let mergedAssociatedLinks = associatedLinks.concat(this.props.relatedLinks.filter(i => associatedLinks.indexOf(i)===-1));
    if (mergedAssociatedLinks.length>0) {
      mergedAssociatedLinks = Array.from(new Set(mergedAssociatedLinks));
    }

    // 3.3 associate new links
    let associatedNodeIds = [];
    mergedAssociatedLinks.forEach(l=>{
      let link = links.find(i=>i.refId===l);
      link.associated=true;
    });
    let mergedNodesIds = [...associatedNodeIds,...this.props.relatedNodes];
    // 4. get associated nodes
    let associatedNodes = nodes.filter(n=>mergedNodesIds.indexOf(n.id)>-1);

    // 4.3 associate new nodes
    associatedNodes.forEach(n=>{
      n.associated=true;
    });
    this.setState({
      associatedNodes: associatedNodes,
      associatedLinks: mergedAssociatedLinks,
    });

    let scale = transform.k;
    ctx.save();
    ctx.clearRect(0,0,width,height);
    ctx.translate(transform.x, transform.y);
    ctx.scale(scale, scale);
    drawLines(transform);
    drawNodes(transform);
    ctx.restore();
  }

  clearAssociated() {
    let associatedNodes = this.state.associatedNodes;
    for (let n=0;n<associatedNodes.length; n++) {
      let item = associatedNodes[n];
      item.associated = false;
      delete item.associated;
    }
    let associatedLinks = this.state.associatedLinks;
    for (let l=0;l<associatedLinks.length; l++) {
      let item = associatedLinks[l];
      let link = links.find(i=>i.refId===item);
      link.associated = false;
      delete link.associated;
    }
    this.setState({
      associatedNodes: [],
      associatedLinks: [],
    })
  }

  componentDidMount() {
    let props = this.props;
    if (props.data!==null) {
      this.drawGraph();
    }
    document.addEventListener('click', this.clickNode);
  }

  componentDidUpdate(prevProps) {
    let props = this.props;
    if (props.data!==null && prevProps.data!==props.data) {
      this.drawGraph();
    }

    if (props.relatedNodes.length>0 && prevProps.relatedNodes!==props.relatedNodes) {
      this.selectedNodes();
    }
    if (props.clearAssociated) {
      this.clearAssociated();
    }
    if (
      (prevProps.width>0 && prevProps.width!==props.width)
      || (prevProps.height>0 && prevProps.height!==props.height)) {
      this.updateDimensions();
    }
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.clickNode);
  }

  render() {
    let zoomPanel = <div className="zoom-panel">
          <div
            id="graph-zoom-in"
            className="zoom-action">
            <i className="fa fa-plus" />
          </div>
          <div
            id="graph-zoom-out"
            className="zoom-action">
            <i className="fa fa-minus" />
          </div>
      </div>

    let panPanel = <div className="pan-container">
      <div className="pan-action up" id="graph-pan-up">
        <i className="fa fa-chevron-up" />
      </div>

      <div className="pan-action right" id="graph-pan-right">
        <i className="fa fa-chevron-right" />
      </div>

      <div className="pan-action down" id="graph-pan-down">
        <i className="fa fa-chevron-down" />
      </div>

      <div className="pan-action left" id="graph-pan-left">
        <i className="fa fa-chevron-left" />
      </div>
    </div>

    let edgesType0=true, edgesType1=false,edgesLabels0=true, edgesLabels1=false;
    if (this.state.edgesType==="double") {
      edgesType0=false;
      edgesType1=true;
    }
    if (this.state.edgesLabels==="visible") {
      edgesLabels0=false;
      edgesLabels1=true;
    }

    let optionsVisibleClass = "";
    if (this.state.optionsVisible) {
      optionsVisibleClass = " visible";
    }

    let optionsPanel = <div className="options-container">
      <div className="options-trigger" onClick={()=>this.toggleOptions()}>
        <i className="fa fa-cog" />
      </div>
      <div className={"options-panel"+optionsVisibleClass}>
        <div className="options-panel-body">
          <div className="option">
            <label>Edges type</label>
            <FormGroup>
              <label>
                <Input type="radio" name="edgesType" value="simple" onChange={this.handleChange} checked={edgesType0}/> Simple edges
              </label>
            </FormGroup>
            <FormGroup>
              <label>
                <Input type="radio" name="edgesType" value="double" onChange={this.handleChange} checked={edgesType1}/> Two-directional edges*
              </label>
            </FormGroup>
          </div>
          <div className="option">
            <label>Edges labels</label>
            <FormGroup>
              <label>
                <Input type="radio" name="edgesLabels" value="hidden" onChange={this.handleChange} checked={edgesLabels0}/> Hidden
              </label>
            </FormGroup>
            <FormGroup>
              <label>
                <Input type="radio" name="edgesLabels" value="visible" onChange={this.handleChange} checked={edgesLabels1}/> Visible*
              </label>
            </FormGroup>
            <div className="info">*May affect performance</div>
          </div>
        </div>
      </div>
    </div>

    return (
      <div>
        <div>
          Nodes: <span id="nodes-count"></span> | Links: <span id="links-count"></span>
        </div>
        <div id="network-graph"></div>
        <div className="graph-actions">
          {panPanel}
          {zoomPanel}
          {optionsPanel}
        </div>
      </div>
    )
  }
}

export default NetworkGraph;
