import React, {Component} from 'react';
import {
  Card, CardBody,
  CardTitle
} from 'reactstrap';
import { Link } from "react-router-dom";

import axios from 'axios';
import {APIPath} from '../static/constants';

import NetworkGraph from '../components/d3/network';

class GraphView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: null,
      loading: true,
      width: 600,
      height: 598,
      eventsLoad: true,
      organisationsLoad: true,
      peopleLoad: true,
      resourcesLoad: true,
      reloadGraph: false,
      detailsCardVisible: false,
      detailsCardTitle: [],
      detailsCardContent: [],
      collapsible: false,
    }

    this.load = this.load.bind(this);
    this.updateCanvasSize = this.updateCanvasSize.bind(this);
    this.toggleGraphData = this.toggleGraphData.bind(this);
    this.toggleDetailsCard = this.toggleDetailsCard.bind(this);
    this.clickNode = this.clickNode.bind(this);
    this.clickLink = this.clickLink.bind(this);
  }

  load() {
    let context = this;
    let params = {
      events: this.state.eventsLoad,
      organisations: this.state.organisationsLoad,
      people: this.state.peopleLoad,
      resources: this.state.resourcesLoad,
    }
    axios({
      method: 'get',
      url: APIPath+'graph',
      crossDomain: true,
      params: params
    })
	  .then(function (response) {
      let responseData = response.data.data;
      context.setState({
        loading: false,
        data: responseData
      });
	  })
	  .catch(function (error) {
      console.log(error);
	  });
  }

  updateCanvasSize() {
    if (this.state.data!==null) {
      let contentContainer = document.getElementById('content-container');
      let container = document.getElementById('graph-container');
      let width = container.offsetWidth-2;
      let windowHeight = window.innerHeight - 60;
      if (windowHeight>630) {
        container.style.height = (contentContainer.offsetHeight-30)+"px";
      }
      else {
        container.style.height = "400px";
      }
      let height = container.offsetHeight-2;
      console.log(height);
      this.setState({
        width: width,
        height: height,
      })
    }

  }

  toggleGraphData(type) {
    this.setState({
      [type]:!this.state[type],
      reloadGraph: true,
      data: null,
      loading: true,
    })
  }

  clickNode(nodeId) {
    let nodes = this.state.data.nodes;
    let node = nodes.find(item=>item.id===nodeId);
    let id = nodeId.replace(node.type+"_", "");
    let detailsCardTitle = <h4>Entity details</h4>
    let detailsCardContent = <div>
      <Link href={"/"+node.type+"/"+id} to={"/"+node.type+"/"+id}><b>{node.label}</b> [{node.type}]</Link>
    </div>
    this.setState({
      detailsCardTitle: detailsCardTitle,
      detailsCardContent: detailsCardContent,
    });
    this.toggleDetailsCard(true);
  };

  clickLink(source, target) {
    let nodes = this.state.data.nodes;
    let srcNode = nodes.find(item=>item.id===source);
    let targetNode = nodes.find(item=>item.id===target);
    let srcId = source.replace(srcNode.type+"_", "");
    let targetId = target.replace(targetNode.type+"_", "");
    let detailsCardTitle = <h4>Entities relation</h4>

    let links = this.state.data.links;
    let link = links.find(item => {
      if (item.source===source && item.target===target) {
        return item;
      }
      else {return false}
    });
    let srcContent = <div>
      <Link href={"/"+srcNode.type+"/"+srcId} to={"/"+srcNode.type+"/"+srcId}>
      <b>{srcNode.label}</b> [{srcNode.type}]</Link>
    </div>

    let targetContent = <div>
      <Link href={"/"+targetNode.type+"/"+targetId} to={"/"+targetNode.type+"/"+targetId}>
        <b>{targetNode.label}</b> [{targetNode.type}]</Link>
    </div>

    let linkContent = <div><i>{link.label}</i></div>

    let detailsCardContent = <div className="flexbox">
      {srcContent}
      {linkContent}
      {targetContent}
    </div>
    this.setState({
      detailsCardTitle: detailsCardTitle,
      detailsCardContent: detailsCardContent,
    });
    this.toggleDetailsCard(true);
  };

  toggleDetailsCard(value=null) {
    if (value===null) {
      value = !this.state.detailsCardVisible;
    }
    this.setState({
      detailsCardVisible: value
    })
  }

  componentDidMount() {
    this.load();
    this.updateCanvasSize();
    window.addEventListener('resize', this.updateCanvasSize);
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.reloadGraph) {
      this.load();
      this.setState({
        reloadGraph: false
      })
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateCanvasSize);
  }

  render() {
    let eventsClass = "",organisationsClass="",peopleClass="",resourcesClass="";
    if (this.state.eventsLoad) {
      eventsClass = " active";
    }
    if (this.state.organisationsLoad) {
      organisationsClass = " active";
    }
    if (this.state.peopleLoad) {
      peopleClass = " active";
    }
    if (this.state.resourcesLoad) {
      resourcesClass = " active";
    }
    let legend = <div className="graph-legend">
      <div className={eventsClass} onClick={()=> this.toggleGraphData("eventsLoad")}>
        <div className="icon circle"></div> Event</div>
      <div className={organisationsClass} onClick={()=> this.toggleGraphData("organisationsLoad")}>
        <div className="icon diamond"></div> Organisation</div>
      <div className={peopleClass} onClick={()=> this.toggleGraphData("peopleLoad")}>
        <div className="icon wye"></div> Person</div>
      <div className={resourcesClass} onClick={()=> this.toggleGraphData("resourcesLoad")}>
        <div className="icon square"></div> Resource</div>
    </div>
    let detailsCardVisibleClass = " hidden";
    if (this.state.detailsCardVisible) {
      detailsCardVisibleClass = "";
    }
    let detailsCard =  <Card className={"graph-details-card"+detailsCardVisibleClass}>
      <CardBody>
        <div className="graph-details-card-close" onClick={()=>this.toggleDetailsCard()}>
          <i className="fa fa-times" />
        </div>
        <CardTitle>{this.state.detailsCardTitle}</CardTitle>
        {this.state.detailsCardContent}
      </CardBody>
    </Card>
    return (
      <div className="graph-container" id="graph-container">
        <NetworkGraph
          data={this.state.data}
          width={this.state.width}
          height={this.state.height}
          clickNode={this.clickNode}
          clickLink={this.clickLink}
          />
        {legend}
        {detailsCard}
      </div>
    )
  }


}

export default GraphView;
