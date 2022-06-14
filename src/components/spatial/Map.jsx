import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import axios from 'axios';
import { Button, Input, Spinner } from 'reactstrap';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { debounce } from 'lodash';
import PropTypes from 'prop-types';

import markerIconPath from '../../assets/leaflet/images/marker-icon.png';
import '../../assets/scss/map.search.scss';

const { REACT_APP_GEONAMES_USER: username } = process.env;
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

export default function Map(props) {
  // props
  const { item, updateMap } = props;
  // state
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState([53.3497645, -6.2602732]);
  const [popupLabel, setPopupLabel] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResultsOutput, setSearchResultsOutput] = useState([]);

  const markerRef = useRef(null);
  const searchRef = useRef(null);

  const toggleMap = () => {
    setVisible(!visible);
  };
  const toggleSearch = () => {
    setSearchVisible(!searchVisible);
  };

  useEffect(() => {
    if (item !== null) {
      const { latitude = '', longitude = '' } = item;
      if (latitude !== '' && longitude !== '') {
        setPosition([latitude, longitude]);
      }
    }
  }, [item]);

  console.log(selectedLocation);

  const handleSearch = useCallback(
    (e) => {
      const { value } = e.target;
      if (value.length > 1 && !searching) {
        setSearching(true);
      }
      setSearchTerm(value);
    },
    [searching]
  );

  const debounceSearch = useMemo(
    () => debounce(handleSearch, 1000),
    [handleSearch]
  );

  useEffect(() => {
    let unmounted = false;
    const controller = new AbortController();
    if (searchTerm.length > 1) {
      const submitSearch = async () => {
        const params = {
          q: searchTerm,
          username,
          format: 'json',
          addressdetails: 1,
        };
        const responseData = await axios({
          method: 'get',
          url: 'https://nominatim.openstreetmap.org/search',
          crossDomain: true,
          params,
          signal: controller.signal,
        })
          .then((response) => response.data)
          .catch((error) => {
            console.log(error);
            return { data: null };
          });
        if (!unmounted) {
          setSearching(false);
          setSearchResultsOutput(responseData);
        }
      };
      submitSearch();
    } else if (searching) {
      setSearching(false);
    }
    return () => {
      unmounted = true;
      controller.abort();
    };
  }, [searchTerm, searching]);

  useEffect(() => {
    if (searchRef.current !== null) {
      L.DomEvent.disableClickPropagation(searchRef.current);
    }
  });

  const reverseGeoSearch = async () => {
    const [lat, lon] = position;
    console.log(lat, lon);
    const params = {
      lat,
      lon,
      format: 'json',
      addressdetails: 1,
    };
    const responseData = await axios({
      method: 'get',
      url: 'https://nominatim.openstreetmap.org/reverse',
      crossDomain: true,
      params,
    })
      .then((response) => {
        const { data: rData = null } = response;
        return rData;
      })
      .catch((error) => {
        console.log(error);
        return { data: null };
      });
    console.log(responseData);
    const { display_name: label = '' } = responseData;
    setPopupLabel(label);
    setSelectedLocation(responseData);
  };

  const updateMarkerPosition = () => {
    const marker = markerRef.current;
    const coords = marker._latlng;
    if (marker != null) {
      const { lat, lng } = coords;
      setPosition([lat, lng]);
      reverseGeoSearch();
    }
  };

  const selectGeoname = (s) => {
    const { display_name: displayName, lat, lon } = s;
    setSelectedLocation(s);
    setPopupLabel(displayName);
    setSearchResultsOutput([]);
    setPosition([lat, lon]);
    setSearchVisible(false);
  };

  const clearSearch = () => {
    setSearchResultsOutput([]);
    setSearchTerm('');
    setSelectedLocation(null);
  };

  const importGeonamesValues = () => {
    if (selectedLocation !== null) {
      const {
        display_name: label = '',
        address = null,
        lat = '',
        lon = '',
        type = '',
      } = selectedLocation;
      let streetAddress = '';
      let locality = '';
      let region = '';
      let postalCode = '';
      let country = '';
      let latitude = '';
      let longitude = '';
      let locationType = '';

      if (address !== null) {
        const {
          road = '',
          locality: aLocality = '',
          region: aRegion = '',
          postcode = '',
          country: aCountry = '',
          county = '',
        } = address;
        if (road !== '') {
          streetAddress = road;
        }
        if (aLocality !== '') {
          locality = aLocality;
        }
        if (aRegion !== '') {
          region = aRegion;
        }
        if (road !== '') {
          streetAddress = road;
        }
        if (postcode !== '') {
          postalCode = postcode;
        }
        if (aCountry !== '') {
          country = aCountry;
        }
        if (region === '' && county !== '') {
          region = county;
        }
      }
      if (lat !== '') {
        latitude = lat;
      }
      if (lon !== '') {
        longitude = lon;
      }
      if (type !== '') {
        locationType = type;
      }

      const update = {
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
      };
      updateMap(update);
    }
  };

  const [lat, lng] = position;

  let searchResults = null;
  if (searching) {
    searchResults = (
      <Spinner size="sm" color="secondary" className="map-loading-spinner" />
    );
  } else if (searchResultsOutput.length > 0) {
    searchResults = (
      <div className="map-results-block">
        <div className="map-results-body">
          {searchResultsOutput.map((s) => {
            const { place_id: placeId, display_name: displayName } = s;
            return (
              <div
                className="map-item"
                key={placeId}
                item={s}
                onClick={() => selectGeoname(s)}
                onKeyDown={() => false}
                role="button"
                tabIndex={0}
                aria-label="open item"
              >
                {displayName}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const searchInput = searchVisible ? (
    <div className="map-search-input">
      <Input
        type="text"
        name="mapQueryTerm"
        placeholder="Search map..."
        onChange={debounceSearch}
      />
      {searchResults}
    </div>
  ) : null;

  const mapOutput = visible ? (
    <div className="map-container">
      <MapContainer center={position} zoom={8} scrollWheelZoom={false}>
        <TileLayer
          attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker
          position={position}
          icon={markerIcon}
          draggable
          eventHandlers={{
            dragend: () => updateMarkerPosition(),
          }}
          ref={markerRef}
          bubblingMouseEvents={false}
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

        <div className="map-search-container" ref={searchRef}>
          <div
            className="map-search-icon"
            onClick={() => toggleSearch()}
            onKeyDown={() => false}
            role="button"
            tabIndex={0}
            aria-label="toggle map search"
          >
            <i className="fa fa-search" />
          </div>
          {searchInput}
        </div>
      </MapContainer>
    </div>
  ) : null;

  return (
    <>
      <div className="text-end">
        <Button
          type="button"
          outline
          color="secondary"
          size="sm"
          onClick={() => toggleMap()}
          style={{ marginBottom: '5px' }}
        >
          <i className="fa fa-search" /> Search map
        </Button>
      </div>
      {mapOutput}
      <div className="text-end" style={{ paddingBottom: '15px' }}>
        <Button
          className="pull-left"
          type="button"
          outline
          color="secondary"
          size="sm"
          onClick={() => clearSearch()}
        >
          <i className="fa fa-times" /> Clear search
        </Button>
        <Button
          type="button"
          outline
          color="info"
          size="sm"
          onClick={() => importGeonamesValues()}
        >
          Import values
        </Button>
      </div>
    </>
  );
}

Map.defaultProps = {
  item: null,
  updateMap: () => {},
};
Map.propTypes = {
  item: PropTypes.object,
  updateMap: PropTypes.func,
};
