var init = null
var answer = null
var valid = false
var origin = null

export function getSettings() {
  return new Promise(resolve => {
    window.addEventListener("message", e => {
      var msg = e.data
      if (e.source != window.parent ) return
      if (msg.cmd == "setInfo") {
        answer = msg.answer || init
        origin = msg.origin
        resolve(msg.settings)
      }
    }, { once: true })
  })
}

export function initAnswer(value) {
  init = value
  saveAnswer(value)
}

export function getAnswer() {
  return answer
}

export function setValid(value) {
  valid = value
  saveAnswer(answer)
}

export function saveAnswer(value) {
  answer = value
  var ans = { answer: value, valid: valid }
  window.parent.postMessage({ cmd: "setAnswer", answer: ans }, origin)
}
