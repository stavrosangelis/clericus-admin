import Dashboard from "../views/dashboard";
import Resources from "../views/resources";
import Resource from "../views/resource";
import People from "../views/people";
import Person from "../views/person";
import Organisations from "../views/organisations";
import Organisation from "../views/organisation";
import Events from "../views/events";
import Event from "../views/event";
import Entities from "../views/entities";
import Taxonomies from "../views/taxonomies";
import Login from "../views/login";
import Register from "../views/register";
import Users from "../views/users";
import User from "../views/user";
import Usergroups from "../views/usergroups";
import Usergroup from "../views/usergroup";

import ParseClassPieces from '../views/tools/parse-class-pieces.js';
import {ParseClassPiece} from '../views/tools/parse-class-piece.js';
import ParseClassPieceThumbnails from '../views/tools/parse-class-piece-thumbnails.js';
import ImportClassPieceToDB from '../views/tools/import-class-piece.js';

import Graph from '../views/graph.js';
import Graph2 from '../views/graph-2.js';

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
    children: [{
      path: "/resource/:_id",
      name: "Resource",
      icon: "fa fa-circle-o",
      component: Resource,
      showMenu: false,
    }]
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
    children: [{
      path: "/event/:_id",
      name: "Event",
      icon: "fa fa-circle-o",
      component: Event,
      showMenu: false,
    }]
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
        component: Graph2,
        showMenu: true,
      },
      {
        path: "/graph-2",
        name: "Graph",
        icon: "fa fa-circle-o",
        component: Graph,
        showMenu: false,
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
