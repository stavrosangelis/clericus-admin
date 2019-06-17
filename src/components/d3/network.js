import React, {Component} from 'react';
import * as d3 from "d3";

class NetworkGraph extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: []
    }

    this.drawGraph = this.drawGraph.bind(this);
    this.chart = this.chart.bind(this);
    this.calcNodeSize = this.calcNodeSize.bind(this);
    this.drag = this.drag.bind(this);
    this.dragstarted = this.dragstarted.bind(this);
    this.dragged = this.dragged.bind(this);
    this.dragended = this.dragended.bind(this);
    this.zoomed = this.zoomed.bind(this);
    this.fade = this.fade.bind(this);
  }

  drawGraph() {
    let data = this.props.data;
    let width = this.props.width;
    let height = this.props.height;

    if (data===null) {
      return false;
    }
    let chart = this.chart(data,width,height);
    document.getElementById("network-graph").innerHTML = "";
    document.getElementById("network-graph").append(chart);
  }

  chart(data,width,height) {
    const context = this;
    const links = data.links.map(d => Object.create(d));
    const nodes = data.nodes.map(d => Object.create(d));
    let sizes = [];
    for (let i=0; i<nodes.length; i++) {
      sizes.push(parseInt(nodes[i].count,10));
    }
    let maxSize = Math.max(...sizes);
    let sizeRatio = 20/maxSize;

    const simulation = d3.forceSimulation(nodes)
        .force("link",
          d3.forceLink(links)
            .id(d => d.id)
            .strength(1)
            .distance(120)
          )
        .force("charge", d3.forceManyBody().strength(-75))
        .force("center", d3.forceCenter(width/2, height/2))
        .force("x", d3.forceX())
        .force("y", d3.forceY());

    const svg = d3.create("svg")
        .attr("viewBox", [0, 0, width, height]);

    const g = svg.append("g")
        .attr("class", "zoom-container");

    const link = g.append("g")
        .selectAll("line")
        .data(links)
        .enter().append("line")
        //.attr("stroke-width", d => Math.sqrt(d.value))
        .attr("stroke-width", 1)
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.5)
        .attr("class", "network-line")
        .on("click", d=>{
          context.props.clickLink(d.source.id, d.target.id);
        });

    const node = g.selectAll("circle")
      .data(nodes)
      .enter().append("g")
      .call(this.drag(simulation))
      .attr("class", "network-node")
      .on("click", d=>{
        context.props.clickNode(d.id)
      })
      .on("mouseover", function(d) {
      	context.fade(0.1,d);
      })
      .on("mouseout", function(d) {
      	context.fade(1,d);
      });

      node.append("circle")
        .attr("stroke", d=>d.color)
        .attr("stroke-width", 1.5)
        .attr("r", d=>this.calcNodeSize(d.count, sizeRatio))
        .attr("fill", d=>d.color)
        .attr("class", "network-circle");

      node.append("text")
          .attr("class", "node-text")
          .attr("dx", 12)
          .attr("dy", ".35em")
          .text(d => d.label);

    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      node
        .attr("transform", d=> "translate(" + d.x  + "," + d.y + ")")
    });

    const zoom_handler = d3.zoom()
      .on("zoom", this.zoomed);
    zoom_handler(svg);

    return svg.node();
  }

  fade(opacity, node) {
    let nodes = this.props.data.nodes;
    let links = this.props.data.links;
    let graphNodes = document.getElementsByClassName("network-node");
    let graphLinks = document.getElementsByClassName("network-line");
    let siblings = [];
    let siblingNodesIndexes = [];
    let linesIndexes = [];
    siblings.push(node.id);
    siblingNodesIndexes.push(node.index);

    links.filter(link=>{
      if (link.source===node.id||link.target===node.id) {
        if (siblings.indexOf(link.source)===-1) {
          let siblingNode = nodes.find(node=>node.id===link.source);
          siblingNodesIndexes.push(nodes.indexOf(siblingNode));
          siblings.push(link.source);
          linesIndexes.push(links.indexOf(link));
        }
        if (siblings.indexOf(link.target)===-1) {
          let siblingNode = nodes.find(node=>node.id===link.target);
          siblingNodesIndexes.push(nodes.indexOf(siblingNode));
          siblings.push(link.target);
          linesIndexes.push(links.indexOf(link));
        }
        return link;
      }
      else return null;
    });

    for (let i=0;i<graphNodes.length; i++) {
      let graphNode = graphNodes[i];
      if (siblingNodesIndexes.indexOf(i)===-1) {
        graphNode.style.opacity = opacity;
      }
    }

    for (let j=0;j<graphLinks.length; j++) {
      let graphLink = graphLinks[j];
      if (linesIndexes.indexOf(j)===-1) {
        graphLink.style.opacity = opacity;
      }
    }

  }

  calcNodeSize(size, sizeRatio) {
    // min: 1 max: 20
    let newSize = parseFloat(sizeRatio,10)*parseInt(size,10);
    if (newSize<2) {
      newSize = 2;
    }
    return newSize;
  }

  drag(simulation) {
    return d3.drag()
        .on("start", (d)=> this.dragstarted(d,simulation))
        .on("drag", (d)=> this.dragged(d,simulation))
        .on("end", (d)=> this.dragended(d,simulation));
  }

  dragstarted(d,simulation) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  dragged(d,simulation) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  dragended(d,simulation) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  zoomed() {
    let g = document.getElementsByClassName("zoom-container")[0];
    g.setAttribute("transform", d3.event.transform);
  }




  componentDidMount() {
    if (this.props.data!==null) {
      this.drawGraph();
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.data!==null && prevProps.data!==this.props.data) {
      this.drawGraph();
    }
  }

  render() {
    return (
      <div id="network-graph"></div>
    )
  }
}

export default NetworkGraph;
