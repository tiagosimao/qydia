if (typeof exports !== 'undefined') {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      ringCoord: ringCoord
    };
  }
}

function ringCoord(max,value) {
  return (max+value%max)%max;
}
