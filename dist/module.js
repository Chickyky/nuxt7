'use strict';

var upath = require('upath');
var defu = require('defu');

function resolveRuntimePath(...args) {
  return upath.resolve(__dirname, "runtime", ...args);
}

const templates = [
  // Framework 7
  "framework7/routes.js",
  "framework7/components.js",
  "framework7/styles.less",
  "framework7/custom.less",
  // Nuxt
  "App.js",
  "components/nuxt.js",
  "layouts/default.vue",
  "router.js"
];

const config = {
  components: [
    // Appbar
    "appbar",
    // Modals
    "dialog",
    "popup",
    "login-screen",
    "popover",
    "actions",
    "sheet",
    "toast",
    // Loaders
    "preloader",
    "progressbar",
    // List Components
    "sortable",
    "swipeout",
    "accordion",
    "contacts-list",
    "virtual-list",
    "list-index",
    // Timeline
    "timeline",
    // Tabs
    "tabs",
    // Panel
    "panel",
    // Card
    "card",
    // Chip
    "chip",
    // Form Components
    "form",
    "input",
    "checkbox",
    "radio",
    "toggle",
    "range",
    "stepper",
    "smart-select",
    // Grid
    "grid",
    // Pickers
    "calendar",
    "picker",
    // Page Components
    "infinite-scroll",
    "pull-to-refresh",
    "lazy",
    // Data table
    "data-table",
    // FAB
    "fab",
    // Searchbar
    "searchbar",
    // Messages
    "messages",
    "messagebar",
    // Swiper
    "swiper",
    // Photo Browser
    "photo-browser",
    // Notifications
    "notification",
    // Autocomplete
    "autocomplete",
    // Tooltip
    "tooltip",
    // Gauge
    "gauge",
    // Skeleton
    "skeleton",
    // Menu
    "menu",
    // Color Picker
    "color-picker",
    // Tree View
    "treeview",
    // WYSIWYG Editor
    "text-editor",
    // Elevation
    "elevation",
    // Typography
    "typography",
    // VI Video Ads
    "vi"
  ],
  themes: [
    "ios",
    "md",
    "aurora"
  ],
  themeColor: "#007aff",
  colors: {
    red: "#ff3b30",
    green: "#4cd964",
    blue: "#2196f3",
    pink: "#ff2d55",
    yellow: "#ffcc00",
    orange: "#ff9500",
    purple: "#9c27b0",
    deeppurple: "#673ab7",
    lightblue: "#5ac8fa",
    teal: "#009688",
    lime: "#cddc39",
    deeporange: "#ff6b22",
    gray: "#8e8e93",
    white: "#ffffff",
    black: "#000000"
  }
};

const { themeColor, colors, themes, components } = config;
const defaults = {
  app: {
    theme: "auto"
  },
  main: {
    main: true,
    pushState: true
  },
  invertNav: true,
  disableContextMenu: true,
  disableSelect: true,
  rtl: false,
  themeColor,
  themes,
  lightTheme: true,
  darkTheme: true,
  colors,
  components,
  css: true,
  customCSS: true,
  f7Icons: true,
  mdIcons: true,
  mode: "history",
  routes: {}
};

function getOptions(_options) {
  const options = defu({ ...this.options.framework7, ..._options }, defaults);
  if (options.mode === "history") {
    options.main.pushStateSeparator = "";
  }
  if (options.disableContextMenu) {
    if (!options.app.touch) {
      options.app.touch = {};
    }
    options.app.touch.disableContextMenu = true;
  }
  options._components = normalizeComponents(options.components);
  if (options.f7Icons) {
    options.f7IconsSrc = upath.normalize(require.resolve("framework7-icons/css/framework7-icons.css"));
  }
  if (options.mdIcons) {
    options.mdIconsSrc = resolveRuntimePath("fonts/material-icons.css");
  }
  return options;
}
function normalizeComponents(components) {
  return components.map((name) => ({
    name,
    js: `framework7/components/${name}/${name}.js`,
    less: `~framework7/components/${name}/${name}.less`
  }));
}

var nuxt7 = (function nuxt7(options) {
  this.nuxt.hook("build:before", () => {
    prepareBuild.call(this, options);
  });
});
function prepareBuild(_options) {
  const options = getOptions.call(this, _options);
  this.options.mode = "spa";
  this.options.render.ssr = false;
  this.options.build.ssr = false;
  this.extendBuild((config) => {
    const MAX_SIZE = 2 * 1024 * 1024;
    Object.assign(config.performance, {
      maxEntrypointSize: MAX_SIZE,
      maxAssetSize: MAX_SIZE
    });
  });
  this.options.build.transpile.push(
    /framework7[\\/](?!less)(?!components\/swiper\/swiper-src\/less)/,
    "framework7-vue",
    "template7",
    "dom7"
  );
  if (options.themeColor) {
    if (!this.options.manifest) {
      this.options.manifest = {};
    }
    this.options.manifest.theme_color = options.themeColor;
  }
  const { cacheGroups } = this.options.build.optimization.splitChunks;
  cacheGroups.framework7 = {
    test: /node_modules[\\/](framework7|framework7-vue|dom7|template7|ssr-window|path-to-regexp)[\\/]/,
    chunks: "all",
    priority: 10,
    name: "framework7"
  };
  this.addPlugin({
    src: resolveRuntimePath("framework7/plugin.js"),
    fileName: "framework7/plugin.js",
    options
  });
  for (const template of templates) {
    this.addTemplate({
      src: resolveRuntimePath(template),
      fileName: template,
      options
    });
  }
  if (!this.options.meta) {
    this.options.meta = {};
  }
  if (this.options.meta.nativeUI === void 0) {
    this.options.meta.nativeUI = true;
  }
}

module.exports = nuxt7;
