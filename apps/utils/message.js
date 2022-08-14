var answer = null
var origin = null

export function getSettings() {
  return new Promise(resolve => {
    window.addEventListener("message", e => {
      if (e.source != window.parent ) return
      var msg = e.data
      if (msg.cmd == "setInfo") {
        answer = msg.answer
        console.log(msg)
        origin = msg.origin
        resolve(msg.settings)
      }
    }, { once: true })
  })
}

export function getAnswer() {
  return answer
}

export function setAnswer(value) {
  answer = value
  console.log(answer)
  window.parent.postMessage({ cmd: "setAnswer", answer: answer }, origin)
}

export function setComplete(valid, target) {
  target.postMessage({ cmd: "setValidity", validity: valid }, origin)
}
