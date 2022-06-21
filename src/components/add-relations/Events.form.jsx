import React, { useCallback, useEffect, useState } from 'react';
import { Button, FormGroup, Input, Label } from 'reactstrap';
import PropTypes from 'prop-types';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import { useDispatch, useSelector } from 'react-redux';
import { outputDate } from '../../helpers';
import { loadRelationsEventsValues } from '../../redux/actions';

function EventsForm(props) {
  const { submit, clear, item, toggleItem } = props;

  const dispatch = useDispatch();
  const eventTypes = useSelector((state) => state.eventTypes);

  const initEventTypeValue = { value: '', label: '--' };
  const [searchId, setSearchId] = useState('');
  const [searchItem, setSearchItem] = useState('');
  const [searchTemporal, setSearchTemporal] = useState('');
  const [searchSpatial, setSearchSpatial] = useState('');
  const [searchEventType, setSearchEventType] = useState(initEventTypeValue);

  const searchEvents = useCallback(() => {
    const searchDate =
      searchTemporal !== '' ? outputDate(searchTemporal, '-') : '';
    dispatch(
      loadRelationsEventsValues(
        searchId,
        searchDate,
        searchItem,
        searchSpatial,
        searchEventType
      )
    );
  }, [
    dispatch,
    searchId,
    searchTemporal,
    searchItem,
    searchSpatial,
    searchEventType,
  ]);

  const keypress = (e) => {
    if (e.which === 13) {
      searchEvents();
    }
  };

  const clearSearchByKey = (key = null) => {
    let copyId = searchId;
    let copySearchItem = searchItem;
    let copySearchTemporal = searchTemporal;
    let copySearchSpatial = searchSpatial;
    if (key !== null) {
      switch (key) {
        case 'searchId':
          copyId = '';
          break;
        case 'searchItem':
          copySearchItem = '';
          break;
        case 'searchTemporal':
          copySearchTemporal = '';
          break;
        case 'searchSpatial':
          copySearchSpatial = '';
          break;
        default:
          break;
      }
      setSearchId(copyId);
      setSearchItem(copySearchItem);
      setSearchTemporal(copySearchTemporal);
      setSearchSpatial(copySearchSpatial);
      dispatch(
        loadRelationsEventsValues(
          copyId,
          copySearchItem,
          copySearchTemporal,
          copySearchSpatial,
          searchEventType
        )
      );
    }
  };

  const clearSearch = useCallback(() => {
    setSearchId('');
    setSearchItem('');
    setSearchTemporal('');
    setSearchSpatial('');
    setSearchEventType('');
    dispatch(loadRelationsEventsValues('', '', '', '', ''));
  }, [dispatch]);

  useEffect(() => {
    if (submit) {
      searchEvents();
    }
  }, [submit, searchEvents]);

  useEffect(() => {
    if (clear) {
      clearSearch();
    }
  }, [clear, clearSearch]);

  const eventTypesList = (types = [], sep = '') => {
    const options = [];
    for (let i = 0; i < types.length; i += 1) {
      const eventType = types[i];
      const sepLabel = sep !== '' ? `${sep} ` : '';
      const option = {
        value: eventType._id,
        label: `${sepLabel}${eventType.label}`,
      };
      options.push(option);
      if (eventType.children.length > 0) {
        const newSep = `${sep}-`;
        const childOptions = eventTypesList(eventType.children, newSep);
        for (let k = 0; k < childOptions.length; k += 1) {
          options.push(childOptions[k]);
        }
      }
    }

    return options;
  };

  const eventTypesItems = eventTypesList(eventTypes);
  eventTypesItems.unshift(initEventTypeValue);

  let labelBlock = null;
  if (item !== null) {
    const { ref } = item;
    const { _id, label } = ref;
    labelBlock = (
      <div>
        <i>Selected event:</i>{' '}
        <Button
          type="button"
          color="info"
          size="sm"
          onClick={() => toggleItem(_id)}
        >
          {label}
        </Button>
      </div>
    );
  }
  return (
    <>
      {labelBlock}
      <FormGroup>
        <Label>Search for Event</Label>
      </FormGroup>
      <div className="row">
        <div className="col-6">
          <FormGroup className="autocomplete-search">
            <Input
              type="text"
              name="searchId"
              placeholder="Search event id..."
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              onKeyPress={keypress}
            />
            <div
              className="close-icon"
              onClick={() => clearSearchByKey('searchId')}
              onKeyDown={() => false}
              role="button"
              tabIndex={0}
              aria-label="clear search events input"
            >
              <i className="fa fa-times" />
            </div>
          </FormGroup>
        </div>
        <div className="col-6">
          <FormGroup className="autocomplete-search">
            <Input
              type="text"
              name="searchItem"
              placeholder="Search event label..."
              value={searchItem}
              onChange={(e) => setSearchItem(e.target.value)}
              onKeyPress={keypress}
            />
            <div
              className="close-icon"
              onClick={() => clearSearchByKey('searchItem')}
              onKeyDown={() => false}
              role="button"
              tabIndex={0}
              aria-label="clear search events input"
            >
              <i className="fa fa-times" />
            </div>
          </FormGroup>
        </div>
      </div>

      <div className="row">
        <div className="col-6">
          <FormGroup className="autocomplete-search">
            <DatePicker
              className="input-mask"
              placeholderText="dd-mm-yyyy"
              selected={searchTemporal}
              onChange={(val) => setSearchTemporal(val)}
              dateFormat="dd-MM-yyyy"
              showMonthDropdown
              showYearDropdown
              onKeyPress={keypress}
            />
            <div
              className="close-icon"
              onClick={() => clearSearchByKey('searchTemporal')}
              onKeyDown={() => false}
              role="button"
              tabIndex={0}
              aria-label="clear search events temporal input"
            >
              <i className="fa fa-times" />
            </div>
          </FormGroup>
        </div>
        <div className="col-6">
          <FormGroup className="autocomplete-search">
            <Input
              type="text"
              name="searchSpatial"
              placeholder="Search spatial..."
              value={searchSpatial}
              onChange={(e) => setSearchSpatial(e.target.value)}
              onKeyPress={keypress}
            />
            <div
              className="close-icon"
              onClick={() => clearSearchByKey('searchSpatial')}
              onKeyDown={() => false}
              role="textbox"
              tabIndex={0}
              aria-label="clear search spatial"
            >
              <i className="fa fa-times" />
            </div>
          </FormGroup>
        </div>
      </div>

      <div className="row">
        <div className="col-6">
          <Select
            value={searchEventType}
            onChange={(selectedOption) => setSearchEventType(selectedOption)}
            options={eventTypesItems}
          />
        </div>
      </div>
    </>
  );
}

EventsForm.defaultProps = {
  item: null,
  toggleItem: () => {},
};
EventsForm.propTypes = {
  item: PropTypes.object,
  submit: PropTypes.bool.isRequired,
  clear: PropTypes.bool.isRequired,
  toggleItem: PropTypes.func,
};
export default EventsForm;
