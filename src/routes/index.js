import Articles from "../views/articles";
import Article from "../views/article";
import ArticleCategories from "../views/article-categories";
import Dashboard from "../views/dashboard";
import Entities from "../views/entities";
import Events from "../views/events";
import Event from "../views/event";
import Highlights from "../views/highlights";
import Login from "../views/login";
import Menu from "../views/menu";
import Organisations from "../views/organisations";
import Organisation from "../views/organisation";
import People from "../views/people";
import Person from "../views/person";
import Register from "../views/register";
import Resources from "../views/resources";
import Resource from "../views/resource";
import AnnotateTool from "../views/resource-annotate";
import Slideshow from "../views/slideshow";
import Spatial from "../views/spatial";
import Spatials from "../views/spatials";
import Taxonomies from "../views/taxonomies";
import Temporals from "../views/temporals";
import Temporal from "../views/temporal";
import Users from "../views/users";
import User from "../views/user";
import Usergroups from "../views/usergroups";
import Usergroup from "../views/usergroup";

import ParseClassPieces from '../views/tools/parse-class-pieces.js';
import {ParseClassPiece} from '../views/tools/parse-class-piece.js';
import ParseClassPieceThumbnails from '../views/tools/parse-class-piece-thumbnails.js';
import ImportClassPieceToDB from '../views/tools/import-class-piece.js';
import DocumentOCR from '../views/tools/document-ocr.js';

import Graph from '../views/graph.js';
//import Graph2 from '../views/graph-2.js';

var indexRoutes = [
  {
    path: "/login",
    name: "Login",
    icon: "pe-7s-home",
    component: Login,
    showMenu: false,
    children: []
  },
  {
    path: "/register",
    name: "Register",
    icon: "pe-7s-home",
    component: Register,
    showMenu: false,
    children: []
  },
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
    children: [
      {
        path: "/resource/:_id",
        name: "Resource",
        icon: "fa fa-circle-o",
        component: Resource,
        showMenu: false,
      },
      {
        path: "/resource-annotate/:_id",
        name: "Resource Annotate",
        icon: "fa fa-circle-o",
        component: AnnotateTool,
        showMenu: false,
      }
    ]
  },
  {
    path: "/people",
    name: "People",
    icon: "pe-7s-users",
    component: People,
    showMenu: true,
    children: [{
      path: "/person/:_id",
      name: "Person",
      icon: "fa fa-circle-o",
      component: Person,
      showMenu: false,
    }]
  },
  {
    path: "/organisations",
    name: "Organisations",
    icon: "pe-7s-culture",
    component: Organisations,
    showMenu: true,
    children: [{
      path: "/organisation/:_id",
      name: "Organisation",
      icon: "fa fa-circle-o",
      component: Organisation,
      showMenu: false,
    }]
  },
  {
    path: "/events",
    name: "Events",
    icon: "pe-7s-date",
    component: Events,
    showMenu: true,
    children: [
      {
        path: "/event/:_id",
        name: "Event",
        icon: "fa fa-circle-o",
        component: Event,
        showMenu: false,
      },
    ]
  },
  {
    path: "/temporals",
    name: "Temporal",
    icon: "pe-7s-clock",
    component: Temporals,
    showMenu: true,
    children: [
      {
        path: "/temporal/:_id",
        name: "Temporal",
        icon: "fa fa-circle-o",
        component: Temporal,
        showMenu: false,
      },
    ]
  },
  {
    path: "/spatials",
    name: "Spatial",
    icon: "pe-7s-map",
    component: Spatials,
    showMenu: true,
    children: [
      {
        path: "/spatial/:_id",
        name: "Spatial",
        icon: "fa fa-circle-o",
        component: Spatial,
        showMenu: false,
      },
    ]
  },
  {
    path: "#",
    name: "Model",
    icon: "pe-7s-share",
    component: null,
    showMenu: true,
    children: [
      {
        path: "/entities",
        name: "Entities",
        icon: "fa fa-circle-o",
        component: Entities,
        showMenu: true,
      },
      {
        path: "/taxonomies",
        name: "Taxonomies",
        icon: "fa fa-circle-o",
        component: Taxonomies,
        showMenu: true,
      }
    ]
  },

  {
    path: "#",
    name: "Content",
    icon: "pe-7s-file",
    component: null,
    showMenu: true,
    children: [
      {
        path: "/menu",
        name: "Menu",
        icon: "fa fa-circle-o",
        component: Menu,
        showMenu: true,
      },
      {
        path: "/articles",
        name: "Articles",
        icon: "fa fa-circle-o",
        component: Articles,
        showMenu: true,
        children: [
          {
            path: "/article/:_id",
            name: "Article",
            icon: "",
            component: Article,
            showMenu: false
          }
        ]
      },
      {
        path: "/article-categories",
        name: "Article Categories",
        icon: "fa fa-circle-o",
        component: ArticleCategories,
        showMenu: true,
      },
      {
        path: "/slideshow",
        name: "Slideshow",
        icon: "fa fa-circle-o",
        component: Slideshow,
        showMenu: true,
      },
      {
        path: "/highlights",
        name: "Highlights",
        icon: "fa fa-circle-o",
        component: Highlights,
        showMenu: true,
      },
    ]
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
      },{
        path: "/graph",
        name: "Network graph",
        icon: "fa fa-circle-o",
        component: Graph,
        showMenu: true,
      },{
        path: "/ocr-document",
        name: "OCR Document",
        icon: "fa fa-circle-o",
        component: DocumentOCR,
        showMenu: true,
      },

    ]
  },
  {
    path: "#",
    name: "Users",
    icon: "pe-7s-user",
    component: null,
    showMenu: true,
    children: [
      {
        path: "/users",
        name: "Users",
        icon: "fa fa-circle-o",
        component: Users,
        showMenu: true,
        children: [{
          path: "/user/:_id",
          name: "User",
          icon: "fa fa-circle-o",
          component: User,
          showMenu: false,
        }]
      },
      {
        path: "/user-groups",
        name: "User groups",
        icon: "fa fa-circle-o",
        component: Usergroups,
        showMenu: true,
        children: [{
          path: "/user-group/:_id",
          name: "Usergroup",
          icon: "fa fa-circle-o",
          component: Usergroup,
          showMenu: false,
        }]
      }
    ]
  },
];
export default indexRoutes;
