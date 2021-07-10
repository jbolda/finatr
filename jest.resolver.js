module.exports = (request, options) => {
  switch (request) {
    case 'd3-shape':
      return 'node_modules/d3-shape/dist/d3-shape.min.js';
    case 'd3-path':
      return 'node_modules/d3-path/dist/d3-path.min.js';
    case 'd3-array':
      return 'node_modules/d3-array/dist/d3-array.min.js';
    default:
      return options.defaultResolver(request, options);
  }
};
