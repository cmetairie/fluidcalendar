'use strict';

var vue = require('vue');

var script = {
  name: 'FluidCalendar',
};

function render(_ctx, _cache, $props, $setup, $data, $options) {
  return (vue.openBlock(), vue.createElementBlock("div", null, "Fluid Calendar"))
}

script.render = render;
script.__file = "src/components/FluidCalendar.vue";

var components = { FluidCalendar: script };

const plugin = {
  install(Vue) {
    for (const prop in components) {
      if (components.hasOwnProperty(prop)) {
        const component = components[prop];
        Vue.component(component.name, component);
      }
    }
  },
};

module.exports = plugin;
