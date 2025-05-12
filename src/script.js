const msg = "Hello, Linter!"
function printMessage(){
    console.log(msg)
}
printMessage();

if(true) {
    console.log("This should not happen")
}

var unusedVariable;

function unusedFunction() {
  return "I'm not used anywhere!";
}
