export function ringCoord(max,value) {
  return (max+value%max)%max;
}
