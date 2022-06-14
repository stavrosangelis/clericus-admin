import React from 'react';

import { jsonStringToObject } from './index';

const parseMetadataItems = (metaItems = null) => {
  const items = [];
  if (metaItems !== null) {
    Object.keys(metaItems).forEach((metaKey) => {
      const value = metaItems[metaKey];
      let newRow = [];
      if (typeof value !== 'object') {
        newRow = (
          <div key={metaKey} className="technical-metadata">
            <b>{metaKey}</b> : {value}
          </div>
        );
      } else if (metaKey !== 'data' && metaKey !== 'XPKeywords') {
        const newRows = (
          <div className="list-items">{parseMetadataItems(value)}</div>
        );
        newRow = (
          <div key={metaKey}>
            <div className="metadata-title">{metaKey}</div>
            {newRows}
          </div>
        );
      } else {
        newRow = (
          <div key={metaKey} className="technical-metadata">
            <b>{metaKey}</b> : {value.join(' ')}
          </div>
        );
      }
      items.push(newRow);
    });
  }
  return items;
};

const parseMetadata = (metadata = null) => {
  if (metadata === null) {
    return false;
  }
  const metadataOutput = [];
  let i = 0;
  Object.keys(metadata).forEach((key) => {
    let metaItems = metadata[key];
    if (typeof metaItems === 'string') {
      metaItems = jsonStringToObject(metaItems);
    }
    let metadataOutputItems = [];
    if (metaItems !== null && typeof metaItems.length === 'undefined') {
      metadataOutputItems = parseMetadataItems(metaItems);
    } else if (metaItems !== null) {
      const newItems = this.parseMetadata(metaItems[0]);
      metadataOutputItems.push(newItems);
    }
    metadataOutputItems = (
      <div className="list-items">{metadataOutputItems}</div>
    );
    const metaRow = (
      <div key={i}>
        <div className="metadata-title">{key}</div>
        {metadataOutputItems}
      </div>
    );
    metadataOutput.push(metaRow);
    i += 1;
  });
  return metadataOutput;
};

export default parseMetadata;
