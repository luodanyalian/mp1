import { getDistance, 
getLocation,
setVoice,
formatedPlayTime,
 wxShowToast,
  wxShowModal } from '../../../common/general.js';
import ss_interface from '../../../common/ss-interface.js';
import { innerAudioContext } from '../../../common/constan.js';
import notImages from '../../../images/noun/not_complete/not_complete.js';
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
    // audiosrc: "",
    isRedirect: false,
    map: {},
    task: {},
    images: notImages,
    scale: 1,
    location:"",
    title:"",
    task_id:"",
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
    that.setData({
      location: options.location,
      title: options.title,
      task_id: options.task_id,
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // 使用 wx.createMapContext 获取 map 上下文
    // this.mapCtx = wx.createMapContext('myMap');
    // this.mapCtx.moveToLocation();
    this.mapCtx = new bmap.BMapWX({
      ak: "cOtIdSUkvqLhaYrjQ1PMlpVhl4khpzM0"
    });

    // this.setData({
    //   map: wx.getStorageSync("map")
    // })
    this.nativeTo();
  },
  onUnload: function () {
    var self = this;
    // Do something when hide
    innerAudioContext.stop();
    innerAudioContext.seek(0);
    self.setData({
      playing: false
    })
    if (self.data.isRedirect == false){
      wxShowModal({
        content: '你的任务还未完成，请继续努力！',
        mask: true,
        showCancel: false,
        confirmText: "好"
      })
    }
  },
  //5分钟获取一次当前位置，判断距离是否为30米以内
  nativeTo: function (){
    const self = this;
    if (self.data.task.deal_type == 1) {
      // debugger
      //处理方式 1，LBS 2，扫码
      setInterval(function(){
        const taskid = self.data.task.id;
        const name = self.data.task.name;
        const lat = Number(self.data.task.latitude);
        const lon = Number(self.data.task.longitude);
        getLocation(function (position) {
          const distance = getDistance(position.lat, position.lng, lat, lon) * 1000;
          // debugger
          // const distance =31;
          console.log("距离" + distance)
          if (distance <= 30) {
            self.setData({
              isRedirect: true
            })
            wx.redirectTo({
              url: 'completed/completed?title=' + name + '&task_id=' + taskid,
            })
          }else{
            self.setData({
              isRedirect: false
            })
          }
        }, bmap, self.mapCtx)
      },60000)
    }
  },
  //获取任务详情
  getTaskDetail: function(taskid){
    const self = this;
    let json = {
      access_token: wx.getStorageSync('access_token'),
      task_id: taskid
    }
    wx.request({
      url: ss_interface.getMission,
      data: JSON.stringify(json),
      method: 'POST',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        console.log(res)
        if (res.data.errcode == 200){
          if(res.data.data!==null){
              self.setData({
                // totalTime: res.data.data.voice_time,
                // audiosrc: res.data.data.voice_url,
                totalTime: "00:03",
                // audiosrc: "https://weidu-file.putaocdn.com/file/b686186b08f635930d11e27ffefd0d9db37addce.mp3",
                task: res.data.data
              })
              self.setVoice({
                src: "https://weidu-file.putaocdn.com/file/b686186b08f635930d11e27ffefd0d9db37addce.mp3",
                onTimeUpdate: self.onTimeUpdate
              })

              //当前任务位置
              let iconPath = "/images/map/icon_map_pin_bule@3x.png";//未完成
              if (res.data.data.is_completed == true) {
                iconPath = "/images/map/icon_map_pin_yellow@3x.png";//已完成
              }
              const markers = [];
              const obj = {
                iconPath: iconPath,
                id: res.data.data.id,
                latitude: Number(res.data.data.latitude),
                longitude: Number(res.data.data.longitude),
                width: 25,
                height: 30
              }
              markers.push(obj);
              const map =  {
                latitude: Number(res.data.data.latitude),
                longitude: Number(res.data.data.longitude),
                markers: markers
              }
              self.setData({
                map: map
              })
          }
        }else {
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
  gocomplete: function(){
    const self = this;
    wx.scanCode({
      success: (res) => {
        console.log(res)
        try {
          var value = wx.getStorageSync('access_token');
          if (value) {
            var code = res.result;
            var json = {
              access_token: wx.getStorageSync('access_token'),
              // access_token: 'laZBqQI6DxgRtSSgIGRJd3rt0IVbq0lU',
              code: code,
              task_id: self.data.task.id
            }
            //此处请求接口
            wx.request({
              url: ss_interface.taskComplete,
              data: JSON.stringify(json),
              method: 'POST',
              header: {
                'content-type': 'application/json' // 默认值
              },
              success: function (res) {
                // debugger;
                console.log(res.data)
                if (res.data.errcode == 200) {
                  if (res.data.data !== null) {
                    const data = res.data.data;
                    const num = data.total_task_qty - data.completed_task_qty;
                    if (data.all_completed) {
                          self.setData({
                            isRedirect: true
                          })
                          wx.redirectTo({
                            url: '../noun?showVerb=1',
                          })
                    } else {
                      self.setData({
                        isRedirect: true
                      })
                      wx.redirectTo({
                        url: '../completed/completed?title=' + self.data.title + '&task_id=' + self.data.task_id + '&show_grade=' + data.show_grade,
                      })
                      /*
                      self.setData({
                        isRedirect: true
                      })
                      //完成任务
                      wxShowModal({
                        content: '恭喜任务完成，快去寻找下一个任务吧！',
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
                      }, 2000)*/
                    }
                  }
                } else {
                  let content = "完成任务失败";
                  if(res.data.errcode == 50010){
                    content = "要完成的任务和二维码不匹配"
                  } else if (res.data.errcode == 50011){
                    content = "这个不是任务的二维码喔，请确认后再扫描。"
                  } else if (res.data.errcode == 50012){
                    content = "要完成的任务和二维码不匹配"
                  }
                  wxShowModal({
                    content: content,
                    mask: true,
                    showCancel: false,
                    confirmText: "好",
                    success: function(res){
                      if (res.confirm) {
                        wx.navigateBack({
                          delta: 1
                        })
                      }
                    }
                  }, res.data.errcode)
                }
              }
            })
          }
        } catch (e) {
          wxShowToast({
            title: "获取token失败",
            icon: "success",
            // duration: 3000,
            mask: true
          })
        }
      }
    })
  },
  setVoice: function (option) {
    setVoice(option);
  },
  playVoice: function () {
    var that = this;
    if (innerAudioContext.paused){
      innerAudioContext.play()
      that.setData({
        playing: true
      })
    }else{
      innerAudioContext.pause()
      that.setData({
        playing: false
      })
    }
    console.log(innerAudioContext.src);
  },
  onTimeUpdate: function () {
    var self = this;
    console.log(innerAudioContext.currentTime, self.data.totalTime);
    var Temp = self.data.totalTime.split(':')
    var Seconds = 60 * Number(Temp[0]) + Number(Temp[1])
    let percent = Math.ceil((innerAudioContext.currentTime) / Seconds * 100)
    if (innerAudioContext.currentTime == 0 || percent >= 100){
      percent = 100;
      innerAudioContext.stop();
      self.setData({
        playTime: percent,
        playing: false,
        formatedPlayTime: self.data.totalTime
      })
    }else{
      self.setData({
        playTime: percent,
        playing: true,
        formatedPlayTime: formatedPlayTime(innerAudioContext.currentTime)
      })
    }
    
  },
  //地图渲染完成事件，暂时无用
  // updated: function () {
  //   map.updated();
  // },
  //播放音频
  // audioStart: function(){
  //   var that = this
  //   if (that.data.playTime == 100) {
  //     that.audioCtx.seek(0);
  //     that.setData({
  //       playTime: 0,
  //       playing: false,
  //       formatedPlayTime: "00:00"
  //     })
  //   }
  // },
  // audioPlay: function () {
  //   var that = this
  //   that.audioStart();
  //   console.log(that.data.playing);
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
  //音频结束事件
  // audioEnd: function () {
    // var that = this
    // that.audioCtx.seek(0)
    // that.setData({
    //   playing: false,
    //   playTime: 100,
    //   formatedPlayTime: that.data.totalTime
    // })
    // console.log(that.data)
  // },
  //音频进度更新
  // audioUpdate: function (e) {
  //   var that = this
  //   that.audioStart();
  //   const currentTime = Math.ceil(e.detail.currentTime - 1);
  //   if (currentTime >=0) {
  //     // const duration = Math.ceil(e.detail.duration);
  //     var Temp = that.data.totalTime.split(':')
  //     var Seconds = 60 * Number(Temp[0]) + Number(Temp[1])
  //     // console.log(e);
  //     let percent = (100 * currentTime) / Seconds;
  //     that.setData({
  //       playTime: percent,
  //       playing: true,
  //       formatedPlayTime: bgAudio.formatedPlayTime(currentTime)
  //     })
  //   }
  //   console.log(that.data)
  // },
  //音频出错
  // audioError: (e) => {
  //   console.log(e);
  //   wxShowToast({
  //     title: "音频播放错误",
  //     icon: "success",
  //     duration: 3000,
  //     mask: true
  //   }, "")
  // },
})