import React, { useCallback, useEffect, useState } from 'react';
import { Button, FormGroup, Input, Label } from 'reactstrap';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { loadRelationsSpatialValues } from '../../redux/actions';

function SpatialForm(props) {
  const { submit, clear, item, toggleItem } = props;

  const dispatch = useDispatch();

  const [searchId, setSearchId] = useState('');
  const [searchLabel, setSearchLabel] = useState('');
  const [searchCountry, setSearchCountry] = useState('');
  const [searchType, setSearchType] = useState('');

  const searchLabels = useCallback(() => {
    dispatch(
      loadRelationsSpatialValues(
        searchId,
        searchLabel,
        searchCountry,
        searchType
      )
    );
  }, [dispatch, searchId, searchLabel, searchCountry, searchType]);

  const keypress = (e) => {
    if (e.which === 13) {
      searchLabels();
    }
  };

  const clearSearchByKey = (key = null) => {
    let copyId = searchId;
    let copySearchLabel = searchLabel;
    let copySearchCountry = searchCountry;
    let copySearchType = searchType;
    if (key !== null) {
      switch (key) {
        case 'searchId':
          copyId = '';
          break;
        case 'searchLabel':
          copySearchLabel = '';
          break;
        case 'searchCountry':
          copySearchCountry = '';
          break;
        case 'searchType':
          copySearchType = '';
          break;
        default:
          break;
      }
      setSearchId(copyId);
      setSearchLabel(copySearchLabel);
      setSearchCountry(copySearchCountry);
      setSearchType(copySearchType);
      dispatch(
        loadRelationsSpatialValues(
          copyId,
          copySearchLabel,
          copySearchCountry,
          searchType
        )
      );
    }
  };

  const clearSearch = useCallback(() => {
    setSearchId('');
    setSearchLabel('');
    setSearchCountry('');
    setSearchType('');
    dispatch(loadRelationsSpatialValues('', '', '', ''));
  }, [dispatch]);

  useEffect(() => {
    if (submit) {
      searchLabels();
    }
  }, [submit, searchLabels]);

  useEffect(() => {
    if (clear) {
      clearSearch();
    }
  }, [clear, clearSearch]);

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
        <Label>Search for Spatial</Label>
      </FormGroup>
      <div className="row">
        <div className="col-6">
          <FormGroup className="autocomplete-search">
            <Input
              type="text"
              name="searchId"
              placeholder="Search spatial id..."
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
              aria-label="clear search spatial input"
            >
              <i className="fa fa-times" />
            </div>
          </FormGroup>
        </div>
        <div className="col-6">
          <FormGroup className="autocomplete-search">
            <Input
              type="text"
              name="searchLabel"
              placeholder="Search spatial label..."
              value={searchLabel}
              onChange={(e) => setSearchLabel(e.target.value)}
              onKeyPress={keypress}
            />
            <div
              className="close-icon"
              onClick={() => clearSearchByKey('searchLabel')}
              onKeyDown={() => false}
              role="button"
              tabIndex={0}
              aria-label="clear search spatial input"
            >
              <i className="fa fa-times" />
            </div>
          </FormGroup>
        </div>
      </div>

      <div className="row">
        <div className="col-6">
          <FormGroup className="autocomplete-search">
            <Input
              type="text"
              name="searchCountry"
              placeholder="Search spatial country..."
              value={searchCountry}
              onChange={(e) => setSearchCountry(e.target.value)}
              onKeyPress={keypress}
            />
            <div
              className="close-icon"
              onClick={() => clearSearchByKey('searchCountry')}
              onKeyDown={() => false}
              role="button"
              tabIndex={0}
              aria-label="clear search spatial input"
            >
              <i className="fa fa-times" />
            </div>
          </FormGroup>
        </div>
        <div className="col-6">
          <FormGroup className="autocomplete-search">
            <Input
              type="text"
              name="searchType"
              placeholder="Search spatial type..."
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              onKeyPress={keypress}
            />
            <div
              className="close-icon"
              onClick={() => clearSearchByKey('searchType')}
              onKeyDown={() => false}
              role="button"
              tabIndex={0}
              aria-label="clear search spatial input"
            >
              <i className="fa fa-times" />
            </div>
          </FormGroup>
        </div>
      </div>
    </>
  );
}
SpatialForm.defaultProps = {
  item: null,
  toggleItem: () => {},
};
SpatialForm.propTypes = {
  item: PropTypes.object,
  submit: PropTypes.bool.isRequired,
  clear: PropTypes.bool.isRequired,
  toggleItem: PropTypes.func,
};
export default SpatialForm;
