const bgAudio = {
  audioPlay: function (dom) {
    dom.audioCtx.play()
    dom.setData({
      playing: true
    })
  },
  formatedPlayTime: function(time) {
    if (typeof time !== 'number' || time < 0) {
      return time
    }

    // var hour = parseInt(time / 3600)
    // time = time % 3600
    var minute = parseInt(time / 60)
    time = time % 60
    var second = time

    return ([minute, second]).map(function (n) {
      n = n.toString()
      return n[1] ? n : '0' + n
    }).join(':')
  },
  audioPause: function (dom) {
    dom.audioCtx.pause()
    dom.setData({
      playing: false
    })
  },
  audioEnd: function (dom) {
    dom.setData({
      playing: false,
      playTime: 100,
      formatedPlayTime: dom.data.totalTime
    })
  },
  audioUpdate: function (dom, e) {
    const currentTime = Math.ceil(e.detail.currentTime - 1);
    const duration = Math.ceil(e.detail.duration);
    let percent = (100 * currentTime) / duration;
    dom.setData({
      playTime: percent,
      formatedPlayTime: bgAudio.formatedPlayTime(currentTime)
    })
  },
  audioError: (e) => {
    console.log(e.detail);
  },
  audioStart: function (dom) {
    dom.audioCtx.seek(0);
    dom.setData({
      playing: false,
      playTime: 100,
      formatedPlayTime: dom.data.totalTime
    })
  }
}
export default bgAudio;