export function ringCoord(max,value) {
  return (max+value%max)%max;
}

export function distance(modX, modY, fromX, fromY, toX, toY) {
  //check boundaries
  if(fromX>=modX||fromX<0||fromY>=modY||fromY<0||toX>=modX||toX<0||toY>=modY||toY<0){
    return Infinity;
  }
  // the difference between the distance of each point to the origin
  const distanceX = Math.abs(Math.min(fromX,modX-fromX) - Math.min(toX,modX-toX));
  const distanceY = Math.abs(Math.min(fromY,modY-fromY) - Math.min(toY,modY-toY));
  return Math.max(distanceX,distanceY);
}
