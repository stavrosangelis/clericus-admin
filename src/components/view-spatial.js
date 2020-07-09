import React, { Component } from 'react';
import {
  Spinner,
  Card, CardTitle, CardBody,
  Button,
  Form, FormGroup, Label, Input,
  Collapse,
} from 'reactstrap';
import {
  loadRelatedEvents,
  loadRelatedOrganisations,
} from '../helpers/helpers';
import axios from 'axios';
import { Map, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const APIPath = process.env.REACT_APP_APIPATH;

export default class ViewSpatial extends Component {
  constructor(props) {
    super(props);

    let item = this.props.item;
    let label = '';
    let streetAddress = '';
    let locality = '';
    let region = '';
    let postalCode = '';
    let country = '';
    let latitude = '';
    let longitude = '';
    let locationType = '';
    let note = '';
    if (item!==null) {
      if (typeof item.label!=="undefined" && item.label!==null) {
        label = item.label;
      }
      if (typeof item.streetAddress!=="undefined" && item.streetAddress!==null) {
        streetAddress = item.streetAddress;
      }
      if (typeof item.locality!=="undefined" && item.locality!==null) {
        locality = item.locality;
      }
      if (typeof item.region!=="undefined" && item.region!==null) {
        region = item.region;
      }
      if (typeof item.postalCode!=="undefined" && item.postalCode!==null) {
        postalCode = item.postalCode;
      }
      if (typeof item.country!=="undefined" && item.country!==null) {
        country = item.country;
      }
      if (typeof item.latitude!=="undefined" && item.latitude!==null) {
        latitude = item.latitude;
      }
      if (typeof item.longitude!=="undefined" && item.longitude!==null) {
        longitude = item.longitude;
      }
      if (typeof item.locationType!=="undefined" && item.locationType!==null) {
        locationType = item.locationType;
      }
      if (typeof item.note!=="undefined" && item.note!==null) {
        note = item.note;
      }
    }
    this.state = {
      mapLoading: false,
      mapSearchVisible: false,
      mapQueryTerm: '',
      mapQueryResultsBlock: [],
      selectedLocation: null,
      // map default values
      popupLabel: 'Dublin, County Dublin, Leinster, Ireland',
      lat: 53.3497645,
      lng: -6.2602732,
      zoom: 8,
      mapSearchInputVisible: false,
      mapLoad: false,

      detailsOpen: true,
      eventsOpen: false,
      organisationsOpen: false,

      form: {
        label: label,
        streetAddress: streetAddress,
        locality: locality,
        region: region,
        postalCode: postalCode,
        country: country,
        latitude: latitude,
        longitude: longitude,
        locationType: locationType,
        note: note,
      }
    }
    this.formSubmit = this.formSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.select2Change = this.select2Change.bind(this);
    this.toggleCollapse = this.toggleCollapse.bind(this);
    this.deleteRef = this.deleteRef.bind(this);

    // map
    this.collapseToggle = this.collapseToggle.bind(this);
    this.mapSearch = this.mapSearch.bind(this);
    this.selectGeoname = this.selectGeoname.bind(this);
    this.importGeonamesValues = this.importGeonamesValues.bind(this);
    this.clearSearch = this.clearSearch.bind(this);
    this.geoSearch = this.geoSearch.bind(this);
    this.reverseGeoSearch = this.reverseGeoSearch.bind(this);
    this.toggleMapSearchInputVisible = this.toggleMapSearchInputVisible.bind(this);
    this.updateMarkerPosition = this.updateMarkerPosition.bind(this);
    this.zoomEnd = this.zoomEnd.bind(this);

    this.markerRef = React.createRef();
    this.mapRef = React.createRef();
  }

  setFormValues() {
    let item = this.props.item;
    let label = '';
    let streetAddress = '';
    let locality = '';
    let region = '';
    let postalCode = '';
    let country = '';
    let latitude = '';
    let longitude = '';
    let locationType = '';
    let note = '';
    if (item!==null) {
      if (typeof item.label!=="undefined" && item.label!==null) {
        label = item.label;
      }
      if (typeof item.streetAddress!=="undefined" && item.streetAddress!==null) {
        streetAddress = item.streetAddress;
      }
      if (typeof item.locality!=="undefined" && item.locality!==null) {
        locality = item.locality;
      }
      if (typeof item.region!=="undefined" && item.region!==null) {
        region = item.region;
      }
      if (typeof item.postalCode!=="undefined" && item.postalCode!==null) {
        postalCode = item.postalCode;
      }
      if (typeof item.country!=="undefined" && item.country!==null) {
        country = item.country;
      }
      if (typeof item.latitude!=="undefined" && item.latitude!==null) {
        latitude = item.latitude;
      }
      if (typeof item.longitude!=="undefined" && item.longitude!==null) {
        longitude = item.longitude;
      }
      if (typeof item.locationType!=="undefined" && item.locationType!==null) {
        locationType = item.locationType;
      }
      if (typeof item.note!=="undefined" && item.note!==null) {
        note = item.note;
      }
    }

    this.setState({
      form: {
        label: label,
        streetAddress: streetAddress,
        locality: locality,
        region: region,
        postalCode: postalCode,
        country: country,
        latitude: latitude,
        longitude: longitude,
        locationType: locationType,
        note: note,
      }
    })
  }

  formSubmit(e) {
    e.preventDefault();
    this.props.update(this.state.form);
  }

  handleChange(e){
    let target = e.target;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    let name = target.name;
    let form = this.state.form;
    form[name] = value;
    this.setState({
      form:form
    });
  }

  select2Change(selectedOption, element=null) {
    if (element===null) {
      return false;
    }
    let form = this.state.form;
    form[element] = selectedOption;
    this.setState({
      form: form
    });
  }

  toggleCollapse(name) {
    let value = true;
    if (this.state[name]==="undefined" || this.state[name]) {
      value = false
    }
    this.setState({
      [name]: value
    });
  }

  async deleteRef(ref, refTerm, model) {
    let params = {
      items: [
        {_id: this.props.item._id, type: "Spatial"},
        {_id: ref, type: model}
      ],
      taxonomyTermLabel: refTerm,
    }
    await axios({
      method: 'delete',
      url: APIPath+'reference',
      crossDomain: true,
      data: params
    })
	  .then(function(response) {
      return true;
	  })
	  .catch(function (error) {
	  });
    this.props.reload();
  }

  mapSearch(e) {
    let target = e.target;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    let name = target.name;
    if (value==="") {
      this.setState({
        [name]: value
      });
      return false;
    }
    this.setState({
      [name]: value,
      mapLoading: true
    }, async()=> {
      let params = "?q="+value+"&username="+process.env.REACT_APP_GEONAMES_USER+"&type=json";
      let url = new URL("http://api.map.org/search"+params);
      let responseData = await fetch(url)
      .then(response=>response.json())
      .then(response=> {
        return response;
      });

      let resultsBlockItems = responseData.map.map(item=>{
        let name = '', adminName1 = '', countryName = '', code='';
        if (item.name!=='') {
          name = item.name;
        }
        if (
          (typeof item.adminName1!=="undefined" && item.adminName1!=="") ||
          (typeof item.countryName!=="undefined" && item.countryName!=="")) {
          name+=", ";
        }
        if (typeof item.adminName1!=="undefined" && item.adminName1!=='') {
          adminName1 = item.adminName1;
          if (typeof item.countryName!=="undefined" && item.countryName!=="") {
            adminName1+=", ";
          }
        }
        if (typeof item.countryName!=="undefined" && item.countryName!=='') {
          countryName = item.countryName;
        }
        if (typeof item.fcodeName!=="undefined" && item.fcodeName!=="") {
          code = "["+item.fcodeName+"]";
        }
        let blockItem = <div
          className="map-item"
          key={item.geonameId}
          item={item}
          onClick={()=>this.selectGeoname(item)}
          >{name}{adminName1}{countryName} <div className="geoname-item-code">{code}</div></div>

        return blockItem;
      });
      let mapQueryResultsBlock = <div className="map-results-block">
        <div className="map-results-head"><span>Total</span>: {responseData.totalResultsCount}</div>
        <div className="map-results-body">{resultsBlockItems}</div>
      </div>
      this.setState({
        mapQueryResultsBlock: mapQueryResultsBlock,
        mapLoading: false,
      });

    });

  }

  selectGeoname(item) {
    this.setState({
      selectedLocation: item,
      mapQueryTerm: item.display_name,
      popupLabel: item.display_name,
      mapQueryResultsBlock: [],
      lat: item.lat,
      lng: item.lon,
    })
  }

  importGeonamesValues() {
    if (this.state.selectedLocation===null) {
      return false;
    }
    let selectedLocation = this.state.selectedLocation;

    let label = '',
    streetAddress = '',
    locality = '',
    region = '',
    postalCode = '',
    country = '',
    latitude = '',
    longitude = '',
    locationType = '';

    if (typeof selectedLocation.display_name!=="undefined") {
      label = selectedLocation.display_name;
    }
    if (typeof selectedLocation.address) {
      if (typeof selectedLocation.address.road!=="undefined") {
        streetAddress = selectedLocation.address.road;
      }
      if (typeof selectedLocation.address.locality!=="undefined") {
        locality = selectedLocation.address.locality;
      }
      if (typeof selectedLocation.address.region!=="undefined") {
        region = selectedLocation.address.region;
      }
      if (typeof selectedLocation.address.postcode!=="undefined") {
        postalCode = selectedLocation.address.postcode;
      }
      if (typeof selectedLocation.address.country!=="undefined") {
        country = selectedLocation.address.country;
      }
    }
    if (typeof selectedLocation.lat!=="undefined") {
      latitude = selectedLocation.lat;
    }
    if (typeof selectedLocation.lon!=="undefined") {
      longitude = selectedLocation.lon;
    }
    if (typeof selectedLocation.type!=="undefined") {
      locationType = selectedLocation.type;
    }

    if ((typeof selectedLocation.address.region==="undefined" || selectedLocation.address.region==="") && selectedLocation.address.county!=="") {
      region = selectedLocation.address.county;
    }

    let update = {
      form: {
        label: label,
        streetAddress: streetAddress,
        locality: locality,
        region: region,
        postalCode: postalCode,
        country: country,
        latitude: latitude,
        longitude: longitude,
        locationType: locationType,
        rawData: selectedLocation,
      }

    }
    this.setState(update)
  }

  clearSearch() {
    this.setState({
      mapLoading: false,
      mapQueryTerm: '',
      mapQueryResultsBlock: [],
      selectedLocation: null,
    });
  }

  geoSearch(e) {
    let target = e.target;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    let name = target.name;
    if (value==="") {
      this.setState({
        [name]: value
      });
      return false;
    }
    this.setState({
      [name]: value,
      mapLoading: true
    }, async()=> {
      let params = "?q="+value+"&format=json&addressdetails=1";
      let url = new URL("https://nominatim.openstreetmap.org/search"+params);
      let responseData = await fetch(url)
      .then(response=>response.json())
      .then(results=> {
        return results;
      });

      let i=0;
      let resultsBlockItems = responseData.map(item=>{
        let name = item.display_name;
        let blockItem = <div
          className="map-item"
          key={i}
          onClick={()=>this.selectGeoname(item)}
          >{name}</div>
        i++;
        return blockItem;
      });
      let mapQueryResultsBlock = <div className="map-results-block">
        <div className="map-results-body">{resultsBlockItems}</div>
      </div>
      this.setState({
        mapQueryResultsBlock: mapQueryResultsBlock,
        mapLoading: false,
      });
    });

  }

  async reverseGeoSearch() {
    let params = "?lat="+this.state.lat+"&lon="+this.state.lng+"&format=json";
    let url = new URL("https://nominatim.openstreetmap.org/reverse"+params);
    let responseData = await fetch(url)
    .then(response=>response.json())
    .then(result=> {
      return result;
    });
    this.setState({
      popupLabel: responseData.display_name,
      selectedLocation: responseData,
    });
  }

  toggleMapSearchInputVisible() {
    this.setState({
      mapSearchInputVisible: !this.state.mapSearchInputVisible
    })
  }

  updateMarkerPosition() {
    let marker = this.markerRef.current;
    let coords = marker.leafletElement.getLatLng();
    if (marker != null) {
      this.setState({
        lat: coords.lat,
        lng: coords.lng,
      }, ()=> {
        this.reverseGeoSearch();
      })
    }
  }

  zoomEnd() {
    let map  =this.mapRef.current;
    let zoom = map.viewport.zoom;

    this.setState({
      zoom: zoom
    })
  }

  collapseToggle() {
    this.setState({
      mapSearchVisible: !this.state.mapSearchVisible
    }, ()=> {
      if (this.state.mapSearchVisible && !this.state.mapLoad) {
        let context = this;
        setTimeout(()=> {
          context.setState({mapLoad:true})
        },50);
      }
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.item!==this.props.item) {
      this.setFormValues();
    }
  }

  render() {
    let mapLoadingSpinner = [];
    if (this.state.mapLoading) {
      mapLoadingSpinner = <Spinner size="sm" color="secondary" className="map-loading-spinner"/>
    }
    let position = [this.state.lat, this.state.lng];

    let mapSearchInputVisibleClass = ' invisible';
    if (this.state.mapSearchInputVisible) {
      mapSearchInputVisibleClass = ' visible';
    }
    let markerIconPath = './assets/leaflet/images/marker-icon.png';
    let markerIcon = new L.Icon({
      iconUrl: markerIconPath,
      iconRetinaUrl: markerIconPath,
      iconAnchor: null,
      popupAnchor: [0, -20],
      shadowUrl: null,
      shadowSize: null,
      shadowAnchor: null,
      iconSize: new L.Point(27, 43),
      className: 'leaflet-default-icon-path custom-marker',
    });
    let leafletMap = [];
    if (this.state.mapLoad) {
      leafletMap = <div className="map-container">
        <Map
          center={position}
          zoom={this.state.zoom}
          ref={this.mapRef}
          onZoomEnd={this.zoomEnd}>
          <TileLayer
            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker
            position={position}
            icon={markerIcon}
            draggable={true}
            onDragend={this.updateMarkerPosition}
            ref={this.markerRef}
            >
            <Popup>
              <h4>{this.state.popupLabel}</h4>
              <b>Coordinates: </b><br/>
              <b>lat: </b>{this.state.lat}, <b>lon: </b>{this.state.lng}
            </Popup>
          </Marker>

          <div className="map-search-container">
            <div className="map-search-icon" onClick={()=>this.toggleMapSearchInputVisible()}>
              <i className="fa fa-search" />
            </div>
            <div className={"map-search-input"+mapSearchInputVisibleClass}>
              <Input type="text" name="mapQueryTerm" placeholder="Search map..." value={this.state.mapQueryTerm} onChange={this.geoSearch} />
              {mapLoadingSpinner}
              {this.state.mapQueryResultsBlock}
            </div>
          </div>
        </Map>

      </div>
    }

    let detailsOpenActive = " active";
    if (!this.state.detailsOpen) {
      detailsOpenActive = "";
    }
    let eventsOpenActive = " active";
    if (!this.state.eventsOpen) {
      eventsOpenActive = "";
    }
    let organisationsOpenActive = " active";
    if (!this.state.organisationsOpen) {
      organisationsOpenActive = "";
    }
    let relatedEvents = loadRelatedEvents(this.props.item, this.deleteRef);
    let relatedOrganisations = loadRelatedOrganisations(this.props.item, this.deleteRef);

    let relatedEventsCard = " hidden";
    if (relatedEvents.length>0) {
      relatedEventsCard = "";
    }
    let relatedOrganisationsCard = " hidden";
    if (relatedOrganisations.length>0) {
      relatedOrganisationsCard = "";
    }
    let errorContainerClass = " hidden";
    if (this.props.errorVisible) {
      errorContainerClass = "";
    }
    let errorContainer = <div className={"error-container"+errorContainerClass}>{this.props.errorText}</div>

    return (
      <div>
        <div className="row">
          <div className="col">
            <div style={{marginBottom: '15px'}}>
              <Button type="button" outline color="secondary" size="sm" onClick={()=>this.collapseToggle()}><i className="fa fa-search" /> Search map</Button>
            </div>
            <Collapse isOpen={this.state.mapSearchVisible}>
              {leafletMap}
              <div className="text-right" style={{paddingBottom: "15px"}}>
                <Button className="pull-left" type="button" outline color="secondary" size="sm" onClick={()=>this.clearSearch()}><i className="fa fa-times" /> Clear search</Button>
                <Button type="button" outline color="info" size="sm" onClick={()=>this.importGeonamesValues()}>Import values</Button>
              </div>
            </Collapse>
          </div>
        </div>
        <div className="row">
          <div className="col-xs-12 col-sm-6">
            <div className="item-details">
              <Card>
                <CardBody>
                  <CardTitle onClick={this.toggleCollapse.bind(this, 'detailsOpen')}>Details <Button type="button" className="pull-right" color="secondary" outline size="xs"><i className={"collapse-toggle fa fa-angle-left"+detailsOpenActive} /></Button></CardTitle>
                  {errorContainer}
                  <Collapse isOpen={this.state.detailsOpen}>
                    <Form onSubmit={this.formSubmit}>

                      <FormGroup>
                        <Label>Label</Label>
                        <Input type="text" name="label" placeholder="Label..." value={this.state.form.label} onChange={this.handleChange}/>
                      </FormGroup>

                      <FormGroup>
                        <Label>Street address</Label>
                        <Input type="text" name="streetAddress" placeholder="Street address..." value={this.state.form.streetAddress} onChange={this.handleChange}/>
                      </FormGroup>

                      <FormGroup>
                        <Label>Locality</Label>
                        <Input type="text" name="locality" placeholder="Locality..." value={this.state.form.locality} onChange={this.handleChange}/>
                      </FormGroup>

                      <FormGroup>
                        <Label>Region</Label>
                        <Input type="text" name="region" placeholder="Region..." value={this.state.form.region} onChange={this.handleChange}/>
                      </FormGroup>

                      <FormGroup>
                        <Label>Postal Code</Label>
                        <Input type="text" name="postalCode" placeholder="Postal Code..." value={this.state.form.postalCode} onChange={this.handleChange}/>
                      </FormGroup>

                      <FormGroup>
                        <Label>Country</Label>
                        <Input type="text" name="country" placeholder="Country..." value={this.state.form.country} onChange={this.handleChange}/>
                      </FormGroup>

                      <FormGroup>
                        <Label>Coordinates</Label>
                      </FormGroup>
                      <div className="row">
                        <div className="col-xs-12 col-sm-6">
                          <FormGroup>
                            <Label>Latitude</Label>
                            <Input type="text" name="latitude" placeholder="Latitude..." value={this.state.form.latitude} onChange={this.handleChange}/>
                          </FormGroup>
                        </div>
                        <div className="col-xs-12 col-sm-6">
                          <FormGroup>
                            <Label>Longitude</Label>
                            <Input type="text" name="longitude" placeholder="Longitude..." value={this.state.form.longitude} onChange={this.handleChange}/>
                          </FormGroup>
                        </div>
                      </div>

                      <FormGroup>
                        <Label>Location Type</Label>
                        <Input type="text" name="locationType" placeholder="Location Type..." value={this.state.form.locationType} onChange={this.handleChange}/>
                      </FormGroup>

                      <FormGroup>
                        <Label>Note</Label>
                        <Input type="textarea" name="note" placeholder="Note..." value={this.state.form.note} onChange={this.handleChange}/>
                      </FormGroup>

                      <div className="text-right" style={{marginTop: "15px"}}>
                        <Button color="info" outline size="sm" onClick={(e)=>this.formSubmit(e)}>{this.props.updateBtn}</Button>
                        <Button color="danger" outline  size="sm" onClick={()=>this.props.delete()} className="pull-left">{this.props.deleteBtn}</Button>
                      </div>
                    </Form>
                  </Collapse>
                </CardBody>
              </Card>
            </div>
          </div>
          <div className="col-xs-12 col-sm-6">
            <div className="item-details">

              <Card className={relatedEventsCard}>
                <CardBody>
                  <CardTitle onClick={this.toggleCollapse.bind(this, 'eventsOpen')}>Related events (<span className="related-num">{relatedEvents.length}</span>) <Button type="button" className="pull-right" color="secondary" outline size="xs"><i className={"collapse-toggle fa fa-angle-left"+eventsOpenActive} /></Button></CardTitle>
                  <Collapse isOpen={this.state.eventsOpen}>
                    {relatedEvents}
                  </Collapse>
                </CardBody>
              </Card>

              <Card className={relatedOrganisationsCard}>
                <CardBody>
                  <CardTitle onClick={this.toggleCollapse.bind(this, 'organisationsOpen')}>Related Organisations (<span className="related-num">{relatedOrganisations.length}</span>) <Button type="button" className="pull-right" color="secondary" outline size="xs"><i className={"collapse-toggle fa fa-angle-left"+organisationsOpenActive} /></Button></CardTitle>
                  <Collapse isOpen={this.state.organisationsOpen}>
                    {relatedOrganisations}
                  </Collapse>
                </CardBody>
              </Card>

            </div>
          </div>
        </div>
      </div>
    )
  }
}
