var info = null

window.onmessage = e => {
  if (e.source != window.parent ) return
  var msg = e.data
  if (msg.cmd == "setInfo")
    info = msg
}

export function appReady() {
  new Promise(resolve => {
    const timer = setInterval(() => {
      if (info != null) {
        clearInterval(timer)
        resolve(true)
      }
    }, 1000)
  })
}

export function getAnswer() {
  return info.answer
}

export function setAnswer(answer) {
  info.answer = answer
  window.parent.postMessage({ cmd: "setAnswer", answer: answer }, info.origin)
}

export function getSettings() {
  return info.settings
}

export function setComplete(valid, target) {
  target.postMessage({ cmd: "setValidity", validity: valid }, info.origin)
}
