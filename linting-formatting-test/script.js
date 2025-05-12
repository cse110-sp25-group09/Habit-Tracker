function clickFunction(){alert('Button Clicked!');}var x=5;var y=10;var z=x+y;console.log(z);


//code with no semicolons adapted from https://javascript.info/coding-style
function pow(x, n) {
  let result = 1
  //              <--
  for (let i = 0; i < n; i++) {
result *= x
  }
  //              <--
     return result;
}

pow (3, 2)