var info = {
  origin: "",
  answer: null,
  settings: "",
}

window.onmessage = e => {
  var msg = e.data
  if (e.source != window.parent ) return
  if (msg.cmd == "setInfo")
    info = msg
}

export function getAnswer() {
  return info.answer;
}

export function setAnswer(answer) {
  info.answer = answer
  window.parent.postMessage({ cmd: "setAnswer", answer: answer }, info.origin)
}

export function getSettings() {
  return info.settings;
}

export function setComplete(valid) {
  window.parent.postMessage({ cmd: "setValidity", validity: valid }, info.origin)
}
