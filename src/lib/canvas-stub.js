module.exports = {
  createCanvas: function createCanvas(width, height) {
    return {
      width,
      height,
      getContext: function getContext() {
        return null;
      },
    };
  },
};


