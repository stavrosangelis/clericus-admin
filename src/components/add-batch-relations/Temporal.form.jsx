import React, { useCallback, useEffect, useState } from 'react';
import { FormGroup, Input, Label } from 'reactstrap';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { loadRelationsTemporalValues } from '../../redux/actions';

function TemporalForm(props) {
  const { submit, clear } = props;

  const dispatch = useDispatch();

  const [searchId, setSearchId] = useState('');
  const [searchLabel, setSearchLabel] = useState('');
  const [searchStartDate, setSearchStartDate] = useState('');
  const [searchEndDate, setSearchEndDate] = useState('');

  const searchLabels = useCallback(() => {
    dispatch(
      loadRelationsTemporalValues(
        searchId,
        searchLabel,
        searchStartDate,
        searchEndDate
      )
    );
  }, [dispatch, searchId, searchLabel, searchStartDate, searchEndDate]);

  const keypress = (e) => {
    if (e.which === 13) {
      searchLabels();
    }
  };

  const clearSearchByKey = (key = null) => {
    let copyId = searchId;
    let copySearchLabel = searchLabel;
    let copySearchStartDate = searchStartDate;
    let copySearchEndDate = searchEndDate;
    if (key !== null) {
      switch (key) {
        case 'searchId':
          copyId = '';
          break;
        case 'searchLabel':
          copySearchLabel = '';
          break;
        case 'searchStartDate':
          copySearchStartDate = '';
          break;
        case 'searchEndDate':
          copySearchEndDate = '';
          break;
        default:
          break;
      }
      setSearchId(copyId);
      setSearchLabel(copySearchLabel);
      setSearchStartDate(copySearchStartDate);
      setSearchEndDate(copySearchEndDate);
      dispatch(
        loadRelationsTemporalValues(
          copyId,
          copySearchLabel,
          copySearchStartDate,
          copySearchEndDate
        )
      );
    }
  };

  const clearSearch = useCallback(() => {
    setSearchId('');
    setSearchLabel('');
    setSearchStartDate('');
    setSearchEndDate('');
    dispatch(loadRelationsTemporalValues('', '', '', ''));
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

  return (
    <div>
      <FormGroup>
        <Label>Search for Temporal</Label>
      </FormGroup>
      <div className="row">
        <div className="col-6">
          <FormGroup className="autocomplete-search">
            <Input
              type="text"
              name="searchId"
              placeholder="Search temporal id..."
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
              aria-label="clear search temporal input"
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
              placeholder="Search temporal label..."
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
              aria-label="clear search temporal input"
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
              name="searchStartDate"
              placeholder="Search temporal start date..."
              value={searchStartDate}
              onChange={(e) => setSearchStartDate(e.target.value)}
              onKeyPress={keypress}
            />
            <div
              className="close-icon"
              onClick={() => clearSearchByKey('searchStartDate')}
              onKeyDown={() => false}
              role="button"
              tabIndex={0}
              aria-label="clear search temporal input"
            >
              <i className="fa fa-times" />
            </div>
          </FormGroup>
        </div>
        <div className="col-6">
          <FormGroup className="autocomplete-search">
            <Input
              type="text"
              name="searchEndDate"
              placeholder="Search temporal end date..."
              value={searchEndDate}
              onChange={(e) => setSearchEndDate(e.target.value)}
              onKeyPress={keypress}
            />
            <div
              className="close-icon"
              onClick={() => clearSearchByKey('searchEndDate')}
              onKeyDown={() => false}
              role="button"
              tabIndex={0}
              aria-label="clear search temporal input"
            >
              <i className="fa fa-times" />
            </div>
          </FormGroup>
        </div>
      </div>
    </div>
  );
}

TemporalForm.propTypes = {
  submit: PropTypes.bool.isRequired,
  clear: PropTypes.bool.isRequired,
};
export default TemporalForm;
