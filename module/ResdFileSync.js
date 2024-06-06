const fs = require('fs')
function ResdFileSync(a){

  let sum = fs.readFileSync(a)
  return sum
}
module.exports={ResdFileSync}