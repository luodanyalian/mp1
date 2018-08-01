//index.js
//获取应用实例
import { getDistance, getLocation, wxShowToast, wxShowModal } from '../../common/general.js';
import ss_interface from '../../common/ss-interface.js';
import nounImages from '../../images/noun/noun.js';
import headImages from '../../images/noun/head/head.js';
import {map} from './map/map.js';
import bmap from '../../libs/bmap-wx.min.js';
const app = getApp()

Page({
  data: {
    showVerb: 0,
    showMap:false,
    num: 0,
    head: {},
    map: {},
    missionList: null,
    // istoday: true,
    images: nounImages,
    toverb: "",
    location:"",
    scale: 1,
  },
  onLoad: function (options) {
    const self = this;
    let ss =true;
    // if (options.istoday){
    //   if (options.istoday == 'false'){
    //     ss = false;
    //   } else if (options.istoday == 'true'){
    //     ss = true;
    //   }
    // }
    self.setData({
      showVerb: options.showVerb || 0,
      // istoday: ss
      location: options.location
    })
    console.log(app.globalData.userInfo);
    if (app.globalData.userInfo ==null) {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo;
        }
      })
    }
    // debugger
    self.setData({
      head: {
        username: app.globalData.userInfo.nickName,
        avatarUrl: app.globalData.userInfo.avatarUrl,
        images: headImages
      }
    })
    //无网络时做提示no net  
    // wx.onNetworkStatusChange(function (res) {
    //   console.log(res)
    //   if (res.networkType == "none") {
    //     wx.showModal({
    //       content: '网络好像不太好，换个姿势试试看~~',
    //       mask: true,
    //       showCancel: false,
    //       confirmText: "好"
    //     })
    //   }
    // })
  },
  onReady: function (e) {
    const self = this;
    // 使用 wx.createMapContext 获取 map 上下文
    // self.mapCtx = wx.createMapContext('myMap');
    // self.mapCtx.moveToLocation();

    //百度地图
    /* 获取定位地理位置 */
    // 新建bmap对象   
    self.mapCtx = new bmap.BMapWX({
      ak: "cOtIdSUkvqLhaYrjQ1PMlpVhl4khpzM0"
    });
    // self.mapCtx.moveToLocation();

  },
  onShow: function(){
    this.getMissionList();//获取任务列表
  },
  //获取任务列表
  getMissionList: function () {
    var self = this;
    console.log(app.globalData.currentSign.id);
    let json = {
      access_token: wx.getStorageSync('access_token'),
      location_id: app.globalData.currentSign.id
    }
    // let json = {
    //   access_token: 'laZBqQI6DxgRtSSgIGRJd3rt0IVbq0lU',
    //   location_id: 1
    // }
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    wx.request({
      url: ss_interface.getMissionList,
      data: JSON.stringify(json),
      method: 'POST',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        // debugger
        wx.hideLoading();
        let data = res.data;
        if (data.errcode == 200) {
          let data2 = data.data;
          console.log(data2)
          if (data2 !== null) {
            const markers = [];
            data2.tasks.forEach(function (value, index) {
              let iconPath = "/images/map/icon_map_pin_bule@3x.png";//未完成
              if (value.status == 1) {
                iconPath = "/images/map/icon_map_pin_yellow@3x.png";//已完成
              }
              const obj = {
                iconPath: iconPath,
                id: value.id,
                latitude: Number(value.latitude),
                longitude: Number(value.longitude),
                width: 25,
                height: 30
              }
              markers.push(obj);
            });
            self.setData({
              map: {
                latitude: Number(data2.latitude),
                longitude: Number(data2.longitude),
                markers: markers
              },
              missionList: data2,
              head: {
                username: app.globalData.userInfo.nickName,
                avatarUrl: app.globalData.userInfo.avatarUrl,
                completed: data2.completed_task_qty,
                total: data2.total_task_qty,
                num: data2.next_grade_qty,
                //nounicon 等级 1, 铁 2, 铜 3, 银 4, 金
                nounicon: data2.grade,
                images: headImages
              }
            })
            
            wx.setStorageSync('map', self.data.map);
            // if (data2.completed_task_qty >= data2.total_task_qty) {
            //   self.setData({
            //     istoday: false
            //   })
            // }
          }
        } else {
          wxShowToast({
            title: "获取任务失败",
            icon: "success",
            // duration: 3000,
            mask: true
          }, data.errcode)
        }
      }
    })
  },
  openMap: function () {
    console.log("打开地图页面");
    var self = this;
    if (self.data.missionList){
      const total_task_qty = self.data.missionList.total_task_qty;//总任务数
      if (total_task_qty > 0) {
        this.setData({
          showMap: true
        })
      } else {
        wxShowToast({
          title: "该景点暂无任务",
          icon: "success",
          // duration: 3000,
          mask: true
        })
      }
    }
  },
  hidemap: function () {
    console.log("收起地图");
    this.setData({
      showMap: false
    })
  },
  // lower: function(){
  //   var _this = this;
  //   _this.setData({
  //     num: _this.data.num++
  //   })
  //   console.log("第" + _this.data.num++ + "页");
  // },
  // updated: function () {
  //   map.updated();
  // },
  //激活任务
  gojihuo: function () {
    var self = this;
    wx.showModal({
      content: '请找到“旅行成长册”中的激活码，扫描成功即可激活。',
      confirmText: "激活",
      success: function (res) {
        if (res.confirm) {
          wx.scanCode({
            success: (res) => {
              console.log(res)
              try {
                var value = wx.getStorageSync('access_token');
                if (value) {
                  var code = res.result;
                  var json = {
                    access_token: wx.getStorageSync('access_token'),
                    code: code,
                    location_id: app.globalData.currentSign.id
                  }
                  wx.request({
                    url: ss_interface.activeTask,
                    data: JSON.stringify(json),
                    method: 'POST',
                    header: {
                      'content-type': 'application/json' // 默认值
                    },
                    success: function (res) {
                      // debugger
                      if (res.data.errcode == 200){
                        wx.showModal({
                          content: '寻宝路线已成功开启，速度去寻找宝藏吧~~',
                          mask: true,
                          showCancel: false,
                          confirmText: "好"
                        })
                      }else{
                          wx.showModal({
                            content: '激活码已经被使用啦，换一个激活码试试咯~',
                            mask: true,
                            showCancel: false,
                            confirmText: "好"
                          })
                      }
                      setTimeout(function () {
                        wx.redirectTo({
                          url: 'noun'
                        })
                      }, 2000)
                    }
                  })
                }
              } catch (e) {
                wx.showToast({
                  title: "获取access_token失败",
                  // duration: 3000
                })
              }
            }
          })
        } else if (res.cancel) {
          // console.log('用户点击取消')
        }
      }
    })
  },
  //做任务
  gocomplete: function (event) {
    var self = this;
    wx.showLoading({
      title: "加载中...",
      mask: true
    })
    const taskid = event.currentTarget.dataset.taskid;
    const name = event.currentTarget.dataset.name;
    const lat = Number(event.currentTarget.dataset.latitude);
    const lon = Number(event.currentTarget.dataset.longitude);
    //处理方式 1，LBS 2，扫码
    if (self.data.missionList.deal_type == 1) {
      getLocation(function (position) {
        const distance = getDistance(position.lat, position.lng, lat, lon) * 1000;
        // debugger
        // const distance =31;
        console.log("距离" + distance)
        if (distance > 30) {
          wx.navigateTo({
            url: 'not_complete/not_complete?title=' + name + '&task_id=' + taskid + '&location=' + this.data.location
          })
        } else {
          wx.navigateTo({
            url: 'completed/completed?title=' + name + '&task_id=' + taskid,
          })
        }
      }, bmap, self.mapCtx)
    } else {
      wx.navigateTo({
        url: 'not_complete/not_complete?title=' + name + '&task_id=' + taskid + '&location=' + this.data.location
      })
    }
    wx.hideLoading();
  },
  today: function () {
    var self = this;
    // self.getMissionList();//获取任务列表
    const completed_task_qty = self.data.missionList.completed_task_qty;//已完成任务数
    const total_task_qty = self.data.missionList.total_task_qty;//总任务数
    if (completed_task_qty == 0 ){
      wxShowToast({
        title: "没有完成任务哦",
        icon: "success",
        // duration: 3000,
        mask: true
      })
    }else if (completed_task_qty < total_task_qty) {
      self.setData({
        showVerb: 1
      })
    }
  },
  //未完成页面扫码模式
  scancode: function () {
    wx.navigateTo({
      url: 'not_complete/not_complete?title=' + name,
    })
  },
  hideVerb: function(){
    var self = this;
    self.setData({
      showVerb: 0
    })
    
    // wx.redirectTo({
    //   url: 'noun?istoday=' + self.data.istoday,
    // })
  },
  //休息
  relx: function () {
    var self = this;
    wx.navigateTo({
      url: '../index/index',
    })
  },
  //领取奖励
  goverb: function() {
    const token = wx.getStorageSync('access_token');
    const location_id = app.globalData.currentSign.id;
    this.setData({
      toverb: 'https://h5.putao.com/ptpark/invitation/invitation3.html?access_token=' + token + '&location_id=' + location_id
    })
  }
})