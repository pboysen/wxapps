export {Graph} from "./graph"

let JSON = require("./json2")
let store = require("./store")

export function getParams() {
  let params = {}
  if (location.search) {
    location.search.slice(1).split('&').forEach(part => {
      let pair = part.split('=')
      pair[0] = decodeURIComponent(pair[0])
      pair[1] = decodeURIComponent(pair[1])
      params[pair[0]] = (pair[1] !== 'undefined') ? pair[1] : true
    })
  }
  return params
}

export function getStore() {
    if (!store.enabled) {
        alert('Local storage is not supported by your browser. Please disable "Private Mode", or upgrade to a modern browser.')
        return
    }
    return store
}