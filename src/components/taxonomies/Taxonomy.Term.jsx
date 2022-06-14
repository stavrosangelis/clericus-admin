import React from 'react';
import PropTypes from 'prop-types';

function TaxonomyTerm(props) {
  // state

  // props
  const { item, taxonomyTerms, termModalToggle, updateTerms } = props;

  const { collapsed = false, hasChildren = false } = item;

  const filterItemChildren = () => {
    const newItems =
      taxonomyTerms.filter(
        (i) => typeof i.parentId !== 'undefined' && i.parentId !== null
      ) || [];
    const childrenIds = [];
    if (newItems.length > 0) {
      const children =
        newItems.filter((i) => i.parentId.indexOf(item._id) > -1) || [];
      const { length } = children;
      if (length > 0) {
        for (let k = 0; k < length; k += 1) {
          const c = children[k];
          childrenIds.push(c._id);
        }
      }
    }
    return childrenIds;
  };

  const toggleTermChildren = () => {
    const copy = [...taxonomyTerms];
    const itemCopy = item;
    const itemIndex = copy.indexOf(itemCopy);
    if (typeof itemCopy.collapsed === 'undefined') {
      itemCopy.collapsed = true;
    } else {
      itemCopy.collapsed = !itemCopy.collapsed;
    }
    taxonomyTerms[itemIndex] = itemCopy;
    const children = filterItemChildren(itemCopy);
    const childrenTerms = taxonomyTerms.filter(
      (i) => children.indexOf(i._id) > -1
    );
    const { length } = childrenTerms;
    for (let k = 0; k < length; k += 1) {
      const c = childrenTerms[k];
      const index = taxonomyTerms.indexOf(c);
      c.visible = !c.visible;
      taxonomyTerms[index] = c;
    }
    updateTerms(copy);
  };

  const collapseIconClass = collapsed ? ' fa-minus' : ' fa-plus';
  const collapseIcon = hasChildren ? (
    <i
      className={`fa${collapseIconClass}`}
      onClick={() => toggleTermChildren(item)}
      onKeyDown={() => false}
      role="button"
      tabIndex={0}
      aria-label="toggle term children"
    />
  ) : (
    []
  );
  const visibleClass = item.visible ? '' : 'hidden';
  let left = 0;
  const parentIds = item.parentIds || null;
  if (parentIds !== null) {
    left = 15 * parentIds.length;
  }
  const style = { marginLeft: left };

  const output = (
    <li className={`${visibleClass}`} style={style} key={item._id}>
      {collapseIcon}{' '}
      <span
        className="term-item"
        onClick={(e) => termModalToggle(item, e)}
        onKeyDown={() => false}
        role="button"
        tabIndex={0}
        aria-label="open taxonomy term modal"
      >
        {item.label}
      </span>
    </li>
  );

  return output;
}

TaxonomyTerm.propTypes = {
  item: PropTypes.object.isRequired,
  taxonomyTerms: PropTypes.array.isRequired,
  updateTerms: PropTypes.func.isRequired,
  termModalToggle: PropTypes.func.isRequired,
};
export default TaxonomyTerm;
