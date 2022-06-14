import Articles from '../views/Articles';
import Article from '../views/Article';
import ArticleCategories from '../views/Article.categories';
import ContactForms from '../views/Contact.forms';
import Dashboard from '../views/Dashboard';
import Datacleaning from '../views/tools/Data.cleaning';
import Entities from '../views/Entities';
import Events from '../views/Events';
import Event from '../views/Event';
import Highlights from '../views/Highlights';
import Login from '../views/Login';
import Menu from '../views/Menu';
import Organisations from '../views/Organisations';
import Organisation from '../views/Organisation';
import People from '../views/People';
import Person from '../views/Person';
import Register from '../views/Register';
import Resources from '../views/Resources';
import Resource from '../views/Resource';
import AnnotateTool from '../views/Resource.annotate';
import Slideshow from '../views/Slideshow';
import Spatial from '../views/Spatial';
import Spatials from '../views/Spatials';
import Taxonomies from '../views/Taxonomies';
import Temporals from '../views/Temporals';
import Temporal from '../views/Temporal';
import Users from '../views/Users';
import User from '../views/User';
import Usergroups from '../views/Usergroups';
import Usergroup from '../views/Usergroup';

import ImportPlan from '../views/tools/Import.plan';
import ImportPlanRule from '../views/tools/Import.plan.rule';
import ImportPlanPreviewResults from '../views/tools/Import.plan.preview.results';
import ImportPlans from '../views/tools/Import.plans';
import ParseClassPieces from '../views/tools/Parse.classpieces';
import ParseClassPiece from '../views/tools/Parse.classpiece';
import ParseClassPieceThumbnails from '../views/tools/Parse.classpiece.thumbnails';
import ImportClassPieceToDB from '../views/tools/Import.classpiece';

import QueryBuilder from '../views/Query.builder';

const indexRoutes = [
  {
    path: '/login',
    name: 'Login',
    icon: 'pe-7s-home',
    component: Login,
    showMenu: false,
    children: [],
  },
  {
    path: '/register',
    name: 'Register',
    icon: 'pe-7s-home',
    component: Register,
    showMenu: false,
    children: [],
  },
  {
    path: '/',
    name: 'Home',
    icon: 'pe-7s-home',
    component: Dashboard,
    showMenu: true,
    children: [],
  },
  {
    path: '/resources',
    name: 'Resources',
    icon: 'pe-7s-photo',
    component: Resources,
    showMenu: true,
    children: [
      {
        path: '/resource/:_id',
        name: 'Resource',
        icon: 'fa fa-circle-o',
        component: Resource,
        showMenu: false,
      },
      {
        path: '/resource-annotate/:_id',
        name: 'Resource Annotate',
        icon: 'fa fa-circle-o',
        component: AnnotateTool,
        showMenu: false,
      },
    ],
  },
  {
    path: '/people',
    name: 'People',
    icon: 'pe-7s-users',
    component: People,
    showMenu: true,
    children: [
      {
        path: '/person/:_id',
        name: 'Person',
        icon: 'fa fa-circle-o',
        component: Person,
        showMenu: false,
      },
    ],
  },
  {
    path: '/organisations',
    name: 'Organisations',
    icon: 'pe-7s-culture',
    component: Organisations,
    showMenu: true,
    children: [
      {
        path: '/organisation/:_id',
        name: 'Organisation',
        icon: 'fa fa-circle-o',
        component: Organisation,
        showMenu: false,
      },
    ],
  },
  {
    path: '/events',
    name: 'Events',
    icon: 'pe-7s-date',
    component: Events,
    showMenu: true,
    children: [
      {
        path: '/event/:_id',
        name: 'Event',
        icon: 'fa fa-circle-o',
        component: Event,
        showMenu: false,
      },
    ],
  },
  {
    path: '/temporals',
    name: 'Temporal',
    icon: 'pe-7s-clock',
    component: Temporals,
    showMenu: true,
    children: [
      {
        path: '/temporal/:_id',
        name: 'Temporal',
        icon: 'fa fa-circle-o',
        component: Temporal,
        showMenu: false,
      },
    ],
  },
  {
    path: '/spatials',
    name: 'Spatial',
    icon: 'pe-7s-map',
    component: Spatials,
    showMenu: true,
    children: [
      {
        path: '/spatial/:_id',
        name: 'Spatial',
        icon: 'fa fa-circle-o',
        component: Spatial,
        showMenu: false,
      },
    ],
  },
  {
    path: '#',
    name: 'Model',
    icon: 'pe-7s-share',
    component: null,
    showMenu: true,
    children: [
      {
        path: '/entities',
        name: 'Entities',
        icon: 'fa fa-circle-o',
        component: Entities,
        showMenu: true,
      },
      {
        path: '/taxonomies',
        name: 'Taxonomies',
        icon: 'fa fa-circle-o',
        component: Taxonomies,
        showMenu: true,
      },
    ],
  },

  {
    path: '#',
    name: 'Content',
    icon: 'pe-7s-file',
    component: null,
    showMenu: true,
    children: [
      {
        path: '/menu',
        name: 'Menu',
        icon: 'fa fa-circle-o',
        component: Menu,
        showMenu: true,
      },
      {
        path: '/articles',
        name: 'Articles',
        icon: 'fa fa-circle-o',
        component: Articles,
        showMenu: true,
        children: [
          {
            path: '/article/:_id',
            name: 'Article',
            icon: '',
            component: Article,
            showMenu: false,
          },
        ],
      },
      {
        path: '/article-categories',
        name: 'Article Categories',
        icon: 'fa fa-circle-o',
        component: ArticleCategories,
        showMenu: true,
      },
      {
        path: '/slideshow',
        name: 'Slideshow',
        icon: 'fa fa-circle-o',
        component: Slideshow,
        showMenu: true,
      },
      {
        path: '/highlights',
        name: 'Highlights',
        icon: 'fa fa-circle-o',
        component: Highlights,
        showMenu: true,
      },
    ],
  },
  {
    path: '#',
    name: 'Tools',
    icon: 'pe-7s-tools',
    component: Dashboard,
    showMenu: true,
    children: [
      {
        path: '/parse-class-pieces',
        name: 'Parse Class Pieces',
        icon: 'fa fa-circle-o',
        component: ParseClassPieces,
        showMenu: true,
      },
      {
        path: '/parse-class-piece/:fileName',
        name: 'Parse Class Piece',
        icon: 'fa fa-circle-o',
        component: ParseClassPiece,
        showMenu: false,
      },
      {
        path: '/parse-class-piece-thumbnails/:fileName',
        name: 'Parse Class Piece Thumbnails',
        icon: 'fa fa-circle-o',
        component: ParseClassPieceThumbnails,
        showMenu: false,
      },
      {
        path: '/import-class-piece-to-db/:fileName',
        name: 'Import data to database',
        icon: 'fa fa-circle-o',
        component: ImportClassPieceToDB,
        showMenu: false,
      },
      {
        path: '/query-builder',
        name: 'Query builder',
        icon: 'fa fa-circle-o',
        component: QueryBuilder,
        showMenu: true,
      },
      {
        path: '/import-plans',
        name: 'Import Data Plans',
        icon: 'fa fa-circle-o',
        component: ImportPlans,
        showMenu: true,
        children: [
          {
            path: '/import-plan/:_id',
            name: 'Import plan',
            icon: '',
            component: ImportPlan,
            showMenu: false,
          },
          {
            path: '/data-cleaning/:importPlanId/:_id',
            name: 'Data cleaning',
            icon: '',
            component: Datacleaning,
            showMenu: false,
          },
          {
            path: '/import-plan-rule-entity/:importPlanId/:_id',
            name: 'Import plan rule',
            icon: '',
            component: ImportPlanRule,
            showMenu: false,
          },
          {
            path: '/import-plan-results-preview/:_id',
            name: 'Import plan results preview',
            icon: '',
            component: ImportPlanPreviewResults,
            showMenu: false,
          },
        ],
      },

      /* {
        path: '/ocr-document',
        name: 'OCR Document',
        icon: 'fa fa-circle-o',
        component: DocumentOCR,
        showMenu: true,
      }, */
    ],
  },
  {
    path: '#',
    name: 'Users',
    icon: 'pe-7s-user',
    component: null,
    showMenu: true,
    children: [
      {
        path: '/users',
        name: 'Users',
        icon: 'fa fa-circle-o',
        component: Users,
        showMenu: true,
        children: [
          {
            path: '/user/:_id',
            name: 'User',
            icon: 'fa fa-circle-o',
            component: User,
            showMenu: false,
          },
        ],
      },
      {
        path: '/user-groups',
        name: 'User groups',
        icon: 'fa fa-circle-o',
        component: Usergroups,
        showMenu: true,
        children: [
          {
            path: '/user-group/:_id',
            name: 'Usergroup',
            icon: 'fa fa-circle-o',
            component: Usergroup,
            showMenu: false,
          },
        ],
      },
    ],
  },
  /* {
    path: '/settings',
    name: 'Settings',
    icon: 'pe-7s-settings',
    component: Settings,
    showMenu: true,
    children:[]
  }, */
  {
    path: '/contact-forms',
    name: 'Contact forms',
    icon: 'pe-7s-mail',
    component: ContactForms,
    showMenu: true,
    children: [],
  },
];
export default indexRoutes;
