import Dashboard from "../views/dashboard";
import Resources from "../views/resources";
import Resource from "../views/resource";

import ParseClassPieces from '../views/tools/parse-class-pieces.js';
import {ParseClassPiece} from '../views/tools/parse-class-piece.js';
import ParseClassPieceThumbnails from '../views/tools/parse-class-piece-thumbnails.js';
import ImportClassPieceToDB from '../views/tools/import-class-piece.js';

var indexRoutes = [
  {
    path: "/",
    name: "Home",
    icon: "pe-7s-home",
    component: Dashboard,
    showMenu: true,
    children: []
  },
  {
    path: "/resources",
    name: "Resources",
    icon: "pe-7s-photo",
    component: Resources,
    showMenu: true,
    children: [{
      path: "/resource/:_id",
      name: "Resource",
      icon: "fa fa-circle-o",
      component: Resource,
      showMenu: false,
    }]
  },
  {
    path: "#",
    name: "Tools",
    icon: "pe-7s-tools",
    component: Dashboard,
    showMenu: true,
    children: [
      {
        path: "/parse-class-pieces",
        name: "Parse Class Pieces",
        icon: "fa fa-circle-o",
        component: ParseClassPieces,
        showMenu: true,
      },
      {
        path: "/parse-class-piece/:fileName",
        name: "Parse Class Piece",
        icon: "fa fa-circle-o",
        component: ParseClassPiece,
        showMenu: false,
      },
      {
        path: "/parse-class-piece-thumbnails/:fileName",
        name: "Parse Class Piece Thumbnails",
        icon: "fa fa-circle-o",
        component: ParseClassPieceThumbnails,
        showMenu: false,
      },
      {
        path: "/import-class-piece-to-db/:fileName",
        name: "Import data to database",
        icon: "fa fa-circle-o",
        component: ImportClassPieceToDB,
        showMenu: false,
      },
    ]
  }
];
export default indexRoutes;
