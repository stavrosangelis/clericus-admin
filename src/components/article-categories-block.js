import React from 'react';

const ArticleCategoriesItems = (props) => {

  const toggleChildren = (_id) => {
    let elem = document.getElementById("menu-item-"+_id);
    let children = elem.childNodes;
    let childrenContainer = null;
    let labelContainer = null;
    for (let i=0; i<children.length; i++) {
      let child = children[i];
      if (child.classList.contains("menu-item-children-container")) {
        childrenContainer = child;
      }
      if (child.classList.contains("menu-item-label")) {
        labelContainer = child;
      }
    }
    if (childrenContainer!==null) {
      if (labelContainer!==null) {
        let iconContainer = null;
        let iconContainerChildren = labelContainer.childNodes;
        for (let i=0; i<iconContainerChildren.length; i++) {
          let child = iconContainerChildren[i];
          if (child.classList.contains("menu-item-icon")) {
            iconContainer = child;
            break;
          }
        }
        if (iconContainer!==null) {
          let icon = iconContainer.querySelector("i.fa");
          if (childrenContainer.classList.contains("open")) {
            icon.classList.remove("fa-minus-square");
            icon.classList.add("fa-plus-square");
          }
          else {
            icon.classList.remove("fa-plus-square");
            icon.classList.add("fa-minus-square");
          }
        }
      }
      childrenContainer.classList.toggle("open");
    }
  }

  const Item = ({item, i, parents=[]}) => {
    let iconHTML = <div className="menu-item-icon no-link">
      <i className="fa fa-minus" />
    </div>;
    let children = [];
    let childrenHTML = [];
    if (item.children.length>0) {
      iconHTML = <div className="menu-item-icon" onClick={()=>toggleChildren(item._id)}>
        <i className="fa fa-minus-square" />
      </div>
      children =item.children.map((child, i)=>{
        return <Item item={child} key={i} i={i}/>;
      });
      childrenHTML = <div className={"menu-item-children-container open"}>
        <div className="menu-item-children-border"></div>
        <div className="menu-item-children-items">{children}</div>
      </div>
    }
    let block = <div className="menu-item" id={"menu-item-"+item._id}>
      <div className="menu-item-label">
        {iconHTML}
        <div className="menu-item-text" onClick={()=>props.toggle(item._id)}>{item.label}</div>
      </div>
      {childrenHTML}
    </div>;
    return block;
  }

  let menuItems = props.items.map((item,i)=> {
    return <Item item={item} key={i} i={i}/>;
  });


  return (
    <div className="menu-items-container">
      {menuItems}
    </div>
  )
}

export default ArticleCategoriesItems;
