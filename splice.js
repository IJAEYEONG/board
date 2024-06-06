// let some = '/edit.css'
// let test = some.split(`/`)
// console.log(test[1])

let arr = [`/edit.css`, '/style.css']

arr.forEach((ele)=>{
  let result = ele.split('/')[1]

  console.log(result)
})