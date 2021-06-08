import React, { Component } from 'react';
import {
  Spinner,
  Card,
  CardTitle,
  CardBody,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Collapse,
} from 'reactstrap';
import { Map, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import _ from 'lodash';
import PropTypes from 'prop-types';
import RelatedEntitiesBlock from './related-entities-block';
import markerIconPath from '../assets/leaflet/images/marker-icon.png';

export default class ViewSpatial extends Component {
  constructor(props) {
    super(props);

    const { item } = this.props;
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
    if (item !== null) {
      if (typeof item.label !== 'undefined' && item.label !== null) {
        label = item.label;
      }
      if (
        typeof item.streetAddress !== 'undefined' &&
        item.streetAddress !== null
      ) {
        streetAddress = item.streetAddress;
      }
      if (typeof item.locality !== 'undefined' && item.locality !== null) {
        locality = item.locality;
      }
      if (typeof item.region !== 'undefined' && item.region !== null) {
        region = item.region;
      }
      if (typeof item.postalCode !== 'undefined' && item.postalCode !== null) {
        postalCode = item.postalCode;
      }
      if (typeof item.country !== 'undefined' && item.country !== null) {
        country = item.country;
      }
      if (typeof item.latitude !== 'undefined' && item.latitude !== null) {
        latitude = item.latitude;
      }
      if (typeof item.longitude !== 'undefined' && item.longitude !== null) {
        longitude = item.longitude;
      }
      if (
        typeof item.locationType !== 'undefined' &&
        item.locationType !== null
      ) {
        locationType = item.locationType;
      }
      if (typeof item.note !== 'undefined' && item.note !== null) {
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
      form: {
        label,
        streetAddress,
        locality,
        region,
        postalCode,
        country,
        latitude,
        longitude,
        locationType,
        note,
      },
    };
    this.formSubmit = this.formSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.select2Change = this.select2Change.bind(this);
    this.toggleCollapse = this.toggleCollapse.bind(this);

    // map
    this.collapseToggle = this.collapseToggle.bind(this);
    this.setMapLoad = this.setMapLoad.bind(this);
    this.mapSearch = this.mapSearch.bind(this);
    this.selectGeoname = this.selectGeoname.bind(this);
    this.importGeonamesValues = this.importGeonamesValues.bind(this);
    this.clearSearch = this.clearSearch.bind(this);
    this.updateSearch = this.updateSearch.bind(this);
    this.geoSearch = _.debounce(this.geoSearch.bind(this), 1000);
    this.reverseGeoSearch = this.reverseGeoSearch.bind(this);
    this.toggleMapSearchInputVisible = this.toggleMapSearchInputVisible.bind(
      this
    );
    this.updateMarkerPosition = this.updateMarkerPosition.bind(this);
    this.zoomEnd = this.zoomEnd.bind(this);

    this.markerRef = React.createRef();
    this.mapRef = React.createRef();
  }

  componentDidUpdate(prevProps) {
    const { item } = this.props;
    const { mapSearchVisible, mapLoad } = this.state;
    if (prevProps.item !== item) {
      this.setFormValues();
    }
    if (mapSearchVisible && !mapLoad) {
      this.setMapLoad();
    }
  }

  handleChange(e) {
    const { target } = e;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const { name } = target;
    const { form } = this.state;
    form[name] = value;
    this.setState({
      form,
    });
  }

  setFormValues() {
    const { item } = this.props;
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
    if (item !== null) {
      if (typeof item.label !== 'undefined' && item.label !== null) {
        label = item.label;
      }
      if (
        typeof item.streetAddress !== 'undefined' &&
        item.streetAddress !== null
      ) {
        streetAddress = item.streetAddress;
      }
      if (typeof item.locality !== 'undefined' && item.locality !== null) {
        locality = item.locality;
      }
      if (typeof item.region !== 'undefined' && item.region !== null) {
        region = item.region;
      }
      if (typeof item.postalCode !== 'undefined' && item.postalCode !== null) {
        postalCode = item.postalCode;
      }
      if (typeof item.country !== 'undefined' && item.country !== null) {
        country = item.country;
      }
      if (typeof item.latitude !== 'undefined' && item.latitude !== null) {
        latitude = item.latitude;
      }
      if (typeof item.longitude !== 'undefined' && item.longitude !== null) {
        longitude = item.longitude;
      }
      if (
        typeof item.locationType !== 'undefined' &&
        item.locationType !== null
      ) {
        locationType = item.locationType;
      }
      if (typeof item.note !== 'undefined' && item.note !== null) {
        note = item.note;
      }
    }

    this.setState({
      form: {
        label,
        streetAddress,
        locality,
        region,
        postalCode,
        country,
        latitude,
        longitude,
        locationType,
        note,
      },
    });
  }

  setMapLoad() {
    this.setState({ mapLoad: true });
  }

  formSubmit(e) {
    const { update } = this.props;
    const { form } = this.state;
    e.preventDefault();
    update(form);
  }

  select2Change(selectedOption, element = null) {
    if (element === null) {
      return false;
    }
    const { form } = this.state;
    form[element] = selectedOption;
    this.setState({
      form,
    });
    return false;
  }

  toggleCollapse(name) {
    const { [name]: value } = this.state;
    this.setState({
      [name]: !value,
    });
  }

  mapSearch(e) {
    const { target } = e;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const { name } = target;
    if (value === '') {
      this.setState({
        [name]: value,
      });
      return false;
    }
    this.setState(
      {
        [name]: value,
        mapLoading: true,
      },
      async () => {
        const params = `?q=${value}&username=${process.env.REACT_APP_GEONAMES_USER}&type=json`;
        const url = new URL(`http://api.map.org/search${params}`);
        const responseData = await fetch(url)
          .then((response) => response.json())
          .then((response) => response);

        const resultsBlockItems = responseData.map.map((item) => {
          let nname = '';
          let adminName1 = '';
          let countryName = '';
          let code = '';
          if (item.name !== '') {
            nname = item.name;
          }
          if (
            (typeof item.adminName1 !== 'undefined' &&
              item.adminName1 !== '') ||
            (typeof item.countryName !== 'undefined' && item.countryName !== '')
          ) {
            nname += ', ';
          }
          if (
            typeof item.adminName1 !== 'undefined' &&
            item.adminName1 !== ''
          ) {
            adminName1 = item.adminName1;
            if (
              typeof item.countryName !== 'undefined' &&
              item.countryName !== ''
            ) {
              adminName1 += ', ';
            }
          }
          if (
            typeof item.countryName !== 'undefined' &&
            item.countryName !== ''
          ) {
            countryName = item.countryName;
          }
          if (typeof item.fcodeName !== 'undefined' && item.fcodeName !== '') {
            code = `[${item.fcodeName}]`;
          }
          const blockItem = (
            <div
              className="map-item"
              key={item.geonameId}
              item={item}
              onClick={() => this.selectGeoname(item)}
              onKeyDown={() => false}
              role="button"
              tabIndex={0}
              aria-label="open item"
            >
              {nname}
              {adminName1}
              {countryName} <div className="geoname-item-code">{code}</div>
            </div>
          );

          return blockItem;
        });
        const mapQueryResultsBlock = (
          <div className="map-results-block">
            <div className="map-results-head">
              <span>Total</span>: {responseData.totalResultsCount}
            </div>
            <div className="map-results-body">{resultsBlockItems}</div>
          </div>
        );
        this.setState({
          mapQueryResultsBlock,
          mapLoading: false,
        });
      }
    );
    return false;
  }

  selectGeoname(item) {
    this.setState({
      selectedLocation: item,
      mapQueryTerm: item.display_name,
      popupLabel: item.display_name,
      mapQueryResultsBlock: [],
      lat: item.lat,
      lng: item.lon,
    });
  }

  importGeonamesValues() {
    const { selectedLocation } = this.state;
    if (selectedLocation === null) {
      return false;
    }

    let label = '';
    let streetAddress = '';
    let locality = '';
    let region = '';
    let postalCode = '';
    let country = '';
    let latitude = '';
    let longitude = '';
    let locationType = '';

    if (typeof selectedLocation.display_name !== 'undefined') {
      label = selectedLocation.display_name;
    }
    if (typeof selectedLocation.address !== 'undefined') {
      if (typeof selectedLocation.address.road !== 'undefined') {
        streetAddress = selectedLocation.address.road;
      }
      if (typeof selectedLocation.address.locality !== 'undefined') {
        locality = selectedLocation.address.locality;
      }
      if (typeof selectedLocation.address.region !== 'undefined') {
        region = selectedLocation.address.region;
      }
      if (typeof selectedLocation.address.postcode !== 'undefined') {
        postalCode = selectedLocation.address.postcode;
      }
      if (typeof selectedLocation.address.country !== 'undefined') {
        country = selectedLocation.address.country;
      }
    }
    if (typeof selectedLocation.lat !== 'undefined') {
      latitude = selectedLocation.lat;
    }
    if (typeof selectedLocation.lon !== 'undefined') {
      longitude = selectedLocation.lon;
    }
    if (typeof selectedLocation.type !== 'undefined') {
      locationType = selectedLocation.type;
    }

    if (
      typeof selectedLocation.address !== 'undefined' &&
      (typeof selectedLocation.address.region === 'undefined' ||
        selectedLocation.address.region === '') &&
      selectedLocation.address.county !== ''
    ) {
      region = selectedLocation.address.county;
    }

    const update = {
      form: {
        label,
        streetAddress,
        locality,
        region,
        postalCode,
        country,
        latitude,
        longitude,
        locationType,
        rawData: selectedLocation,
      },
    };
    this.setState(update);
    return false;
  }

  clearSearch() {
    this.setState({
      mapLoading: false,
      mapQueryTerm: '',
      mapQueryResultsBlock: [],
      selectedLocation: null,
    });
  }

  updateSearch(e) {
    const { target } = e;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const { name } = target;
    let mapLoading = false;
    if (value !== '' && value.length > 1) {
      mapLoading = true;
    }
    this.setState({
      [name]: value,
      mapLoading,
    });
    this.geoSearch();
  }

  async geoSearch() {
    const { mapLoading, mapQueryTerm } = this.state;
    if (mapLoading) {
      const params = `?q=${mapQueryTerm}&format=json&addressdetails=1`;
      const url = new URL(
        `https://nominatim.openstreetmap.org/search${params}`
      );
      const responseData = await fetch(url)
        .then((response) => response.json())
        .then((results) => results);
      let i = 0;
      const resultsBlockItems = responseData.map((item) => {
        const name = item.display_name;
        const blockItem = (
          <div
            className="map-item"
            key={i}
            onClick={() => this.selectGeoname(item)}
            onKeyDown={() => false}
            role="button"
            tabIndex={0}
            aria-label="select geoname"
          >
            {name}
          </div>
        );
        i += 1;
        return blockItem;
      });
      const mapQueryResultsBlock = (
        <div className="map-results-block">
          <div className="map-results-body">{resultsBlockItems}</div>
        </div>
      );
      this.setState({
        mapQueryResultsBlock,
        mapLoading: false,
      });
    }
  }

  async reverseGeoSearch() {
    const { lat, lng } = this.state;
    const params = `?lat=${lat}&lon=${lng}&format=json`;
    const url = new URL(`https://nominatim.openstreetmap.org/reverse${params}`);
    const responseData = await fetch(url)
      .then((response) => response.json())
      .then((result) => result);
    this.setState({
      popupLabel: responseData.display_name,
      selectedLocation: responseData,
    });
  }

  toggleMapSearchInputVisible() {
    const { mapSearchInputVisible } = this.state;
    this.setState({
      mapSearchInputVisible: !mapSearchInputVisible,
    });
  }

  updateMarkerPosition() {
    const marker = this.markerRef.current;
    const coords = marker.leafletElement.getLatLng();
    if (marker != null) {
      this.setState(
        {
          lat: coords.lat,
          lng: coords.lng,
        },
        () => {
          this.reverseGeoSearch();
        }
      );
    }
  }

  zoomEnd() {
    const map = this.mapRef.current;
    const { zoom } = map.viewport;

    this.setState({
      zoom,
    });
  }

  collapseToggle() {
    const { mapSearchVisible } = this.state;
    this.setState({
      mapSearchVisible: !mapSearchVisible,
    });
  }

  render() {
    const {
      mapLoading,
      lat,
      lng,
      mapSearchInputVisible,
      mapLoad,
      zoom,
      popupLabel,
      mapQueryTerm,
      mapQueryResultsBlock,
      detailsOpen,
      mapSearchVisible,
      form,
    } = this.state;
    const {
      errorVisible,
      errorText,
      updateBtn,
      delete: deleteFn,
      deleteBtn,
      item,
      reload,
    } = this.props;
    let mapLoadingSpinner = [];
    if (mapLoading) {
      mapLoadingSpinner = (
        <Spinner size="sm" color="secondary" className="map-loading-spinner" />
      );
    }
    const position = [lat, lng];
    const mapSearchInputVisibleClass = mapSearchInputVisible
      ? ' visible'
      : ' invisible';
    const markerIcon = new L.Icon({
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
    if (mapLoad) {
      leafletMap = (
        <div className="map-container">
          <Map
            center={position}
            zoom={zoom}
            ref={this.mapRef}
            scrollWheelZoom={false}
            onZoomEnd={this.zoomEnd}
          >
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker
              position={position}
              icon={markerIcon}
              draggable
              onDragend={this.updateMarkerPosition}
              ref={this.markerRef}
            >
              <Popup>
                <h4>{popupLabel}</h4>
                <b>Coordinates: </b>
                <br />
                <b>lat: </b>
                {lat}, <b>lon: </b>
                {lng}
              </Popup>
            </Marker>

            <div className="map-search-container">
              <div
                className="map-search-icon"
                onClick={() => this.toggleMapSearchInputVisible()}
                onKeyDown={() => false}
                role="button"
                tabIndex={0}
                aria-label="toggle map search"
              >
                <i className="fa fa-search" />
              </div>
              <div className={`map-search-input${mapSearchInputVisibleClass}`}>
                <Input
                  type="text"
                  name="mapQueryTerm"
                  placeholder="Search map..."
                  value={mapQueryTerm}
                  onChange={this.updateSearch}
                />
                {mapLoadingSpinner}
                {mapQueryResultsBlock}
              </div>
            </div>
          </Map>
        </div>
      );
    }

    const detailsOpenActive = detailsOpen ? '' : ' active';
    const errorContainerClass = errorVisible ? '' : ' hidden';
    const errorContainer = (
      <div className={`error-container${errorContainerClass}`}>{errorText}</div>
    );

    return (
      <div>
        <div className="row">
          <div className="col">
            <div style={{ marginBottom: '15px' }}>
              <Button
                type="button"
                outline
                color="secondary"
                size="sm"
                onClick={() => this.collapseToggle()}
              >
                <i className="fa fa-search" /> Search map
              </Button>
            </div>
            <Collapse isOpen={mapSearchVisible}>
              {leafletMap}
              <div className="text-right" style={{ paddingBottom: '15px' }}>
                <Button
                  className="pull-left"
                  type="button"
                  outline
                  color="secondary"
                  size="sm"
                  onClick={() => this.clearSearch()}
                >
                  <i className="fa fa-times" /> Clear search
                </Button>
                <Button
                  type="button"
                  outline
                  color="info"
                  size="sm"
                  onClick={() => this.importGeonamesValues()}
                >
                  Import values
                </Button>
              </div>
            </Collapse>
          </div>
        </div>
        <div className="row">
          <div className="col-xs-12 col-sm-6">
            <div className="item-details">
              <Card>
                <CardBody>
                  <CardTitle onClick={() => this.toggleCollapse('detailsOpen')}>
                    Details{' '}
                    <Button
                      type="button"
                      className="pull-right"
                      color="secondary"
                      outline
                      size="xs"
                    >
                      <i
                        className={`collapse-toggle fa fa-angle-left${detailsOpenActive}`}
                      />
                    </Button>
                  </CardTitle>
                  {errorContainer}
                  <Collapse isOpen={detailsOpen}>
                    <Form onSubmit={this.formSubmit}>
                      <FormGroup>
                        <Label>Label</Label>
                        <Input
                          type="text"
                          name="label"
                          placeholder="Label..."
                          value={form.label}
                          onChange={this.handleChange}
                        />
                      </FormGroup>

                      <FormGroup>
                        <Label>Street address</Label>
                        <Input
                          type="text"
                          name="streetAddress"
                          placeholder="Street address..."
                          value={form.streetAddress}
                          onChange={this.handleChange}
                        />
                      </FormGroup>

                      <FormGroup>
                        <Label>Locality</Label>
                        <Input
                          type="text"
                          name="locality"
                          placeholder="Locality..."
                          value={form.locality}
                          onChange={this.handleChange}
                        />
                      </FormGroup>

                      <FormGroup>
                        <Label>Region</Label>
                        <Input
                          type="text"
                          name="region"
                          placeholder="Region..."
                          value={form.region}
                          onChange={this.handleChange}
                        />
                      </FormGroup>

                      <FormGroup>
                        <Label>Postal Code</Label>
                        <Input
                          type="text"
                          name="postalCode"
                          placeholder="Postal Code..."
                          value={form.postalCode}
                          onChange={this.handleChange}
                        />
                      </FormGroup>

                      <FormGroup>
                        <Label>Country</Label>
                        <Input
                          type="text"
                          name="country"
                          placeholder="Country..."
                          value={form.country}
                          onChange={this.handleChange}
                        />
                      </FormGroup>

                      <FormGroup>
                        <Label>Coordinates</Label>
                      </FormGroup>
                      <div className="row">
                        <div className="col-xs-12 col-sm-6">
                          <FormGroup>
                            <Label>Latitude</Label>
                            <Input
                              type="text"
                              name="latitude"
                              placeholder="Latitude..."
                              value={form.latitude}
                              onChange={this.handleChange}
                            />
                          </FormGroup>
                        </div>
                        <div className="col-xs-12 col-sm-6">
                          <FormGroup>
                            <Label>Longitude</Label>
                            <Input
                              type="text"
                              name="longitude"
                              placeholder="Longitude..."
                              value={form.longitude}
                              onChange={this.handleChange}
                            />
                          </FormGroup>
                        </div>
                      </div>

                      <FormGroup>
                        <Label>Location Type</Label>
                        <Input
                          type="text"
                          name="locationType"
                          placeholder="Location Type..."
                          value={form.locationType}
                          onChange={this.handleChange}
                        />
                      </FormGroup>

                      <FormGroup>
                        <Label>Note</Label>
                        <Input
                          type="textarea"
                          name="note"
                          placeholder="Note..."
                          value={form.note}
                          onChange={this.handleChange}
                        />
                      </FormGroup>

                      <div className="text-right" style={{ marginTop: '15px' }}>
                        <Button
                          color="info"
                          outline
                          size="sm"
                          onClick={(e) => this.formSubmit(e)}
                        >
                          {updateBtn}
                        </Button>
                        <Button
                          color="danger"
                          outline
                          size="sm"
                          onClick={() => deleteFn()}
                          className="pull-left"
                        >
                          {deleteBtn}
                        </Button>
                      </div>
                    </Form>
                  </Collapse>
                </CardBody>
              </Card>
            </div>
          </div>
          <div className="col-xs-12 col-sm-6">
            <div className="item-details">
              <RelatedEntitiesBlock
                item={item}
                itemType="Spatial"
                reload={reload}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

ViewSpatial.defaultProps = {
  item: null,
  update: () => {},
  errorVisible: false,
  errorText: [],
  updateBtn: null,
  delete: () => {},
  deleteBtn: null,
  reload: () => {},
};
ViewSpatial.propTypes = {
  item: PropTypes.object,
  update: PropTypes.func,
  errorVisible: PropTypes.bool,
  errorText: PropTypes.array,
  updateBtn: PropTypes.object,
  delete: PropTypes.func,
  deleteBtn: PropTypes.object,
  reload: PropTypes.func,
};
