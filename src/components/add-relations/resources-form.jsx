import React, { useCallback, useEffect, useState } from 'react';
import { FormGroup, Input, Label } from 'reactstrap';
import PropTypes from 'prop-types';
import Select from 'react-select';
import { useDispatch, useSelector } from 'react-redux';
import { loadRelationsResourcesValues } from '../../redux/actions';

const ResourcesForm = (props) => {
  const { submit, clear } = props;

  const dispatch = useDispatch();
  const resourcesTypes = useSelector((state) => state.resourcesTypes);

  const initTypeValue = { value: '', label: '--' };
  const [searchId, setSearchId] = useState('');
  const [searchLabel, setSearchLabel] = useState('');
  const [searchType, setSearchType] = useState(initTypeValue);

  const searchResources = useCallback(() => {
    dispatch(loadRelationsResourcesValues(searchId, searchLabel, searchType));
  }, [dispatch, searchId, searchLabel, searchType]);

  const keypress = (e) => {
    if (e.which === 13) {
      searchResources();
    }
  };

  const clearSearchByKey = (key = null) => {
    let copyId = searchId;
    let copySearchLabel = searchLabel;
    let copySearchType = searchType;
    if (key !== null) {
      switch (key) {
        case 'searchId':
          copyId = '';
          break;
        case 'searchLabel':
          copySearchLabel = '';
          break;
        case 'searchType':
          copySearchType = '';
          break;
        default:
          break;
      }
      setSearchId(copyId);
      setSearchLabel(copySearchLabel);
      setSearchType(copySearchType);
      dispatch(
        loadRelationsResourcesValues(copyId, copySearchLabel, copySearchType)
      );
    }
  };

  const clearSearch = useCallback(() => {
    setSearchId('');
    setSearchLabel('');
    setSearchType('');
    dispatch(loadRelationsResourcesValues('', '', ''));
  }, [dispatch]);

  useEffect(() => {
    if (submit) {
      searchResources();
    }
  }, [submit, searchResources]);

  useEffect(() => {
    if (clear) {
      clearSearch();
    }
  }, [clear, clearSearch]);

  const resourcesTypesList = (types = [], sep = '') => {
    const options = [];
    for (let i = 0; i < types.length; i += 1) {
      const resourceType = types[i];
      const sepLabel = sep !== '' ? `${sep} ` : '';
      const option = {
        value: resourceType._id,
        label: `${sepLabel}${resourceType.label}`,
      };
      options.push(option);
      if (
        typeof resourceType.children !== 'undefined' &&
        resourceType.children.length > 0
      ) {
        const newSep = `${sep}-`;
        const childOptions = resourcesTypesList(resourceType.children, newSep);
        for (let k = 0; k < childOptions.length; k += 1) {
          options.push(childOptions[k]);
        }
      }
    }

    return options;
  };

  const resourceTypesItems = resourcesTypesList(resourcesTypes);
  resourceTypesItems.unshift(initTypeValue);

  return (
    <div>
      <FormGroup>
        <Label>Search for Resource</Label>
      </FormGroup>
      <div className="row">
        <div className="col-6">
          <FormGroup className="autocomplete-search">
            <Input
              type="text"
              name="searchId"
              placeholder="Search resource id..."
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
              aria-label="clear search resources input"
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
              placeholder="Search resource label..."
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
              aria-label="clear search resources input"
            >
              <i className="fa fa-times" />
            </div>
          </FormGroup>
        </div>
      </div>

      <div className="row">
        <div className="col-6">
          <Select
            value={searchType}
            onChange={(selectedOption) => setSearchType(selectedOption)}
            options={resourceTypesItems}
          />
        </div>
      </div>
    </div>
  );
};

ResourcesForm.propTypes = {
  submit: PropTypes.bool.isRequired,
  clear: PropTypes.bool.isRequired,
};
export default ResourcesForm;
