export function randomRange(min, max) {
  return ( Math.random() * (max - min) + min );
}


export function clamp(val, min, max) {
  console.log(val, min, max);
  return val < min ? min : val > max ? max : val;
}
