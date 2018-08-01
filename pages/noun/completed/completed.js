import {
  getDistance,
  getLocation,
  setVoice,
  formatedPlayTime,
  wxShowToast,
  wxShowModal
} from '../../../common/general.js';
import ss_interface from '../../../common/ss-interface.js';
import { innerAudioContext } from '../../../common/constan.js';
import completedImages from '../../../images/noun/completed/completed.js';
import { map } from '../map/map.js';
import bmap from '../../../libs/bmap-wx.min.js';
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    playing: false,
    playTime: 0,
    formatedPlayTime: '00:00',
    totalTime: "00:00",
    task: {},
    current: 0,
    images: completedImages
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.setNavigationBarTitle({
      title: options.title//页面标题为路由参数
    })
    that.getTaskDetail(options.task_id);//获取任务详情

    let show_grade = options.show_grade === 'true' ? true : false
    if (show_grade == true) {
      const pages = getCurrentPages();
      const currPage = pages[pages.length - 1];   //当前页面
      const prevPage = pages[pages.length - 2];  //上一个页面

      //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
      prevPage.setData({
        showVerb: 1
      })
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function (e) {
    this.mapCtx = new bmap.BMapWX({
      ak: "cOtIdSUkvqLhaYrjQ1PMlpVhl4khpzM0"
    });
    this.nativeTo();
  },
  onUnload: function () {
    // Do something when hide
    innerAudioContext.stop();
    innerAudioContext.seek(0);
  },
  //5分钟获取一次当前位置，判断距离是否为30米以内
  nativeTo: function () {
    const self = this;
    if (self.data.task.deal_type == 1) {
      //处理方式 1，LBS 2，扫码
      setInterval(function () {
        const taskid = self.data.task.id;
        const name = self.data.task.name;
        const lat = Number(self.data.task.latitude);
        const lon = Number(self.data.task.longitude);
        getLocation(function (position) {
          const distance = getDistance(position.lat, position.lng, lat, lon) * 1000;
          // debugger
          // const distance =31;
          console.log("距离" + distance)
          if (distance > 30) {
            wx.redirectTo({
              url: 'not_complete/not_complete?title=' + name + '&task_id=' + taskid
            })
          }
        }, bmap, self.mapCtx)
      }, 60000)
    }
  },
  //获取任务详情
  getTaskDetail: function (taskid) {
    const self = this;
    let json = {
      access_token: wx.getStorageSync('access_token'),
      task_id: taskid
    }
    
    // let json = {
    //   access_token: 'laZBqQI6DxgRtSSgIGRJd3rt0IVbq0lU',
    //   task_id: taskid
    // }
    wx.request({
      url: ss_interface.getMission,
      data: JSON.stringify(json),
      method: 'POST',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        console.log(res)
        if (res.data.errcode == 200) {
          if (res.data.data !== null) {
            self.setData({
              totalTime: res.data.data.voice_time,
              task: res.data.data
            })
            self.setVoice({
              src: res.data.data.voice_url,
              onTimeUpdate: self.onTimeUpdate
            })
          }
        } else {
          wxShowToast({
            title: "获取任务详情失败",
            icon: "success",
            // duration: 3000,
            mask: true
          }, res.data.errcode)
        }
      }
    })
  },
  //完成任务
  gocomplete: function () {
    const self = this;
    var value = wx.getStorageSync('access_token');
    if (value && self.data.task.id) {
      var json = {
        access_token: wx.getStorageSync('access_token'),
        task_id: self.data.task.id
      }
      // debugger
      //此处请求接口
      wx.request({
        url: ss_interface.taskComplete,
        data: JSON.stringify(json),
        method: 'POST',
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: function (res) {
          if (res.data.errcode == 200) {
            if (res.data.data !== null) {
              const data = res.data.data;
              const num = data.total_task_qty - data.completed_task_qty;
              if (data.all_completed){
                wx.redirectTo({
                  url: '../noun?showVerb=1',
                })
              }else{
                //提示3s以后，回到任务列表页面当完成的任务为每个级别最后一个任务时，页面不弹提示框，直接弹出获得身份的页面。
                wxShowModal({
                  content: '棒呆了，当前任务完成！一共' + data.total_task_qty + '个任务，已经完成' + data.completed_task_qty + '个，还有' + num
                  + '个没有找到，快快去寻找一个目标吧！',
                  mask: true,
                  showCancel: false,
                  confirmText: "好"
                })
                if (data.show_grade == true) {
                  const pages = getCurrentPages();
                  const currPage = pages[pages.length - 1];   //当前页面
                  const prevPage = pages[pages.length - 2];  //上一个页面

                  //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
                  prevPage.setData({
                    showVerb: 1
                  })
                }
                setTimeout(function () {
                  wx.navigateBack({
                    delta: 1
                  })
                }, 2000)
              }
            }
          } else {
            wxShowToast({
              title: "完成任务失败",
              icon: "success",
              // duration: 3000,
              mask: true
            }, res.data.errcode)
          }
        }
      })
    }
    // else{
      // wxShowToast({
      //   title: "获取token失败",
      //   icon: "success",
      //   duration: 3000,
      //   mask: true
      // })
    // }
  },
  /**
   * 设置幻灯片当前页
   */
  changeIndicatorDots: function (event) {
    this.setData({
      current: event.detail.current
    })
  },
  setVoice: function (option) {
    setVoice(option);
  },
  playVoice: function () {
    var that = this;
    if (innerAudioContext.paused) {
      that.setData({
        playing: true
      })
      innerAudioContext.play()
    } else {
      that.setData({
        playing: false
      })
      innerAudioContext.pause()
    }
    console.log(innerAudioContext.src);
    console.log(that.data.playing);
  },
  onTimeUpdate: function () {
    var self = this;
    console.log(innerAudioContext.currentTime, self.data.totalTime);
    var Temp = self.data.totalTime.split(':')
    var Seconds = 60 * Number(Temp[0]) + Number(Temp[1])
    let percent = Math.ceil((innerAudioContext.currentTime) / Seconds * 100)
    if (innerAudioContext.currentTime == 0 || percent >= 100) {
      percent = 100;
      self.setData({
        playTime: percent,
        playing: false,
        formatedPlayTime: self.data.totalTime
      })
      innerAudioContext.stop();
    } else {
      self.setData({
        playTime: percent,
        playing: true,
        formatedPlayTime: formatedPlayTime(innerAudioContext.currentTime)
      })
    }

  }
  // //播放音频
  // audioPlay: function () {
  //   var that = this
  //   that.audioCtx.play()
  //   that.setData({
  //     playing: true
  //   })
  // },
  // //暂停音频
  // audioPause: function () {
  //   var that = this
  //   that.audioCtx.pause()
  //   that.setData({
  //     playing: false
  //   })
  // },
  // //音频结束事件
  // audioEnd: function () {
  //   var that = this
  //   that.setData({
  //     playing: false,
  //     playTime: 100,
  //     formatedPlayTime: that.data.totalTime
  //   })
  // },
  // //音频进度更新
  // audioUpdate: function (e) {
  //   var that = this
  //   const currentTime = Math.ceil(e.detail.currentTime - 1);
  //   // const duration = Math.ceil(e.detail.duration);
  //   var Temp = that.data.totalTime.split(':')
  //   var Seconds = 60 * Number(Temp[0]) + Number(Temp[1])
  //   // console.log(e);
  //   let percent = (100 * currentTime) / Seconds;
  //   that.setData({
  //     playTime: percent,
  //     formatedPlayTime: bgAudio.formatedPlayTime(currentTime)
  //   })
  // },
  // //音频出错
  // audioError: (e) => {
  //   console.log(e);
  //   wxShowToast({
  //     title: "音频播放错误",
  //     icon: "success",
  //     duration: 3000,
  //     mask: true
  //   }, "")
  // }
})