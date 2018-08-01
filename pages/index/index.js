import { drawShadowText, 
getDistance, 
getLocation, 
setVoice, 
calculateTime ,
formatedPlayTime ,
wxShowToast,
wxShowModal,
doWithGetUserInfo,
compatible
} from '../../common/general.js'; 
import ss_interface from '../../common/ss-interface.js';
import bmap from '../../libs/bmap-wx.min.js';
import { innerAudioContext } from '../../common/constan.js';
import indexImages from '../../images/index/index.js';
const app = getApp();

Page({
  data:{
    winHeight:0,
    winWidth:0,
    locatWidth:0,
    navBarHeight:0,
    slide_bottom_y:0,
    maskDisplay:'none',
    authorDisplay:'none',
    sildeAnimationData:{},
    baseRpx:0.5,
    signList:[],
    selectSignIndex:0,
    signName:'上海辰山植物园',
    desc:'',
    background_url:'',
    voice_url:'',
    current_time:'00:00',
    totalTime:'00:00',
    voiceprogressWidth:'0%',
    images: indexImages,
    playing: false,
    isAllFinished: false
  },
  isGoing:false,//是否点了立刻启程
  initPageImagesSize:function(){
    wx.getSystemInfo({
      success: function (res) {
        console.log('windowHeight', res.windowHeight);
        this.setData({
          winHeight: res.windowHeight,
          winWidth: res.windowWidth,
          locatWidth: res.windowWidth-30,
          slide_bottom_y: res.windowHeight + 700,
          baseRpx: res.windowWidth/750
        })
        let textObj = {
          id: 'location',
          text: '辰山植物园',
          pixelRatio: res.pixelRatio,
          screenHeight: res.screenHeight,
          screenWidth: res.screenWidth
        }
        // drawShadowText(textObj);
      }.bind(this)
    })
  },
  login:function(){
    
  },
  /**events */
  onLoad: function () {
    if(!wx.getSetting){
      compatible();
      return;
    }
    this.initPageImagesSize();
    this.slideAnimation = wx.createAnimation({
      transformOrigin: "50% 50%",
      duration: 500,
      timingFunction: "ease",
      delay: 0,
      success: function () {
        console.log(1232323232)
      }
    })
    
    // doWithGetUserInfo(app, (res) => {
      console.log('start getSigns')
      // getLocation(this.getSignInfo,bmap);
      // this.getSignpoints();
      // this.getUserInfo();
    // }, this)
    // var self =this;
    // if (typeof app.globalData.ssCheckLogin == "function"){
    //   app.globalData.ssCheckLogin(function (token) {
    //     this.getMissionList()
    //   })
    // }
  },
  onReady:function(){
    console.log(3333333333333333)
  },
  onShow: function(){
    getLocation(this.getSignInfo, bmap);

    if (!wx.getStorageSync('access_token')){
      console.log('未授权')
      this.setData({
        maskDisplay: 'block',
        authorDisplay: 'block',
      })
      return
    }

    this.getSignpoints();
    if (innerAudioContext.paused){
      this.setData({
        playing: false
      })
    }
  },
  onUnload: function () {
    // Do something when hide
    innerAudioContext.stop();
    // innerAudioContext.seek(0);
  },
  onHide:function(){
    this.isGoing = false;
    innerAudioContext.stop();
    // innerAudioContext.seek(0);
    this.setData({
      playing: false
    })
  },
  loadData: function (event) {
    
  },
  selectSign: function (event){
    let index = event.currentTarget.dataset.index,
      id = event.currentTarget.dataset.id,
      name = event.currentTarget.dataset.name;
    let option = {
      id:id
    }
    this.getSignInfo(option);
    this.setCurrentSign({id,name})
  },
  playVoice: function () {
    if (innerAudioContext.paused) {
      innerAudioContext.play()
      this.setData({
        playing: true
      })
    } else {
      innerAudioContext.pause()
      this.setData({
        playing: false
      })
    }
    console.log(innerAudioContext.src);
  },
  /**methods*/
  getUserInfo:function(){
    wx.request({
      url: ss_interface.getUserInfo,
      data: {
        access_token: wx.getStorageSync('access_token')
      },
      method: 'post',
      success: (res) => {
        let data = res.data.data;
        // if (res.errcode == 200){
        data.avatar && (app.globalData.userInfo.avatarUrl = data.avatar);
        data.nickname && (app.globalData.userInfo.nickName = data.nickname);
        // }
      }
    })
  },
  showOtherSighs: function () {
    this.slideAnimation.translateY(-(700 * this.data.baseRpx)).step();

    let func = () => {
      this.setData({
        sildeAnimationData: this.slideAnimation.export()
      })
    }
    this.setData({
      maskDisplay: 'block'
    }, func)
  },
  closeOtherSighs: function () {
    this.slideAnimation.translateY(700 * this.data.baseRpx).step();
    this.setData({
      maskDisplay: 'none',
      sildeAnimationData: this.slideAnimation.export()
    })
  },
  closeAuthor: function () {
    this.setData({
      maskDisplay: 'none',
      authorDisplay: 'none',
    })
  },
  bindgetuserinfo: function(res) {
    if (res.detail.errMsg != "getUserInfo:ok"){
      wxShowModal({
        content: '授权失败，请重新授权',
      })
      return
    }
    console.log(res.detail)
    app.globalData.userInfo = res.detail.userInfo;
    app.globalData.encryptedData = res.detail.encryptedData;
    app.globalData.iv = res.detail.iv;
    this.setData({
      maskDisplay: 'none',
      authorDisplay: 'none',
    })
    const self = this;
    if (!wx.getStorageSync("access_token")) {
      //发起网络请求
      wx.request({
        url: ss_interface.login,
        data: {
          code: app.globalData.code,
          encryptedData: res.detail.encryptedData,
          iv: res.detail.iv
        },
        method: 'post',
        success: r => {
          let result = r.data;
          if (result.errcode == 200) {
            let access_token = result.data.access_token;
            wx.setStorageSync('access_token', access_token);
            console.log('ss_interface.login errcode == 200')
            this.getSignpoints();
            if (innerAudioContext.paused) {
              this.setData({
                playing: false
              })
            }
            self.getMissionList()
          } else {
            console.error('ss_interface.login errcode != 200', result.errmsg)
            wxShowModal({
              content: '登录服务失败',
              code: r.data.errcode
            })
          }
        },
        fail: r => {
          console.error('登录请求失败', r);
        }
      })
    }else{
      this.getSignpoints();
      if (innerAudioContext.paused) {
        this.setData({
          playing: false
        })
      }
      self.getMissionList()
    }
  },
  setOut:function(){
    if (!wx.showLoading){
      compatible();
      return;
    }
    wx.showLoading({
      title:'加载中...'
    })
    if (!this.isGoing){
      this.isGoing = true;
      var self = this;
      let json = {
        access_token: wx.getStorageSync('access_token'),
        location_id: app.globalData.currentSign.id
      }
      wx.request({
        url: ss_interface.getMissionList,
        data: JSON.stringify(json),
        method: 'POST',
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: function (res) {
          wx.hideLoading();
          let data = res.data;
          if (data.errcode == 200) {
            let data2 = data.data;
            if (data2 !== null) {
              const completed_task_qty = data2.completed_task_qty;//已完成任务数
              if (completed_task_qty > 0) {
                wx.navigateTo({
                  url: '../noun/noun?location=' + self.data.signName
                },()=>{
                  self.isGoing = false;
                })
                
              }else{
                wx.navigateTo({
                  url: '../chooseRole/index?id=1',
                  success: () => {
                    innerAudioContext.pause();
                    self.isGoing = false;
                  }
                })
              }
            }
          } else if (data.errcode == 50002){
            wx.navigateTo({
              url: '../chooseRole/index?id=1',
              success: () => {
                innerAudioContext.pause();
                self.isGoing = false;
              }
            })
          } else {
            
            let title = "获取任务失败"
            if (data.errcode == 50003) {
              title = "暂无该景点任务"
            } else if (data.errcode == 50005){
              title = "当前用户被禁用"
            } else if (data.errcode == 50004){
              title = "	当前景点未开放"
            }
            wxShowToast({
              title: title,
              icon: "success",
              duration: 3000,
              mask: true,
              success:function(){
                self.isGoing = false;
              }
            }, data.errcode)
          }
        }
      })
    }
  },
  getSignpoints:function(){
    console.log('getSignpoints');
    wx.request({
      url: ss_interface.getSignList,
      data:{
        access_token: wx.getStorageSync('access_token')
      },
      success:(res)=>{
        console.log(22222222222)
        if (res.data.errcode == 200){
          let data = res.data.data;
          this.setData({
            signList:data
          })
        }else{
          wxShowModal({
            content: '获取景点列表失败',
            code: res.data.errcode
          })
        }
      },
      fail:(res)=>{
        wxShowModal({
          content: '请求景点接口失败',
        })
      }
    })
  },
  //获取任务列表
  getMissionList: function () {
    var self = this;
    let json = {
      access_token: wx.getStorageSync('access_token'),
      location_id: app.globalData.currentSign.id
    }
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
        wx.hideLoading();
        let data = res.data;
        if (data.errcode == 200) {
          console.log(data)

          let data2 = data.data;
          if (data2.total_task_qty == data2.completed_task_qty){
            self.setData({
              isAllFinished: true
            })
          }
        } else {
          self.setData({
            isAllFinished: false
          })
          // wxShowToast({
          //   title: "获取任务失败",
          //   icon: "success",
          //   // duration: 3000,
          //   mask: true
          // }, data.errcode)
        }
      },
      fail: function(res) {
      }
    })
  },
  getSignInfo:function(position){
    let {lat,lng,id} = position;
    let json = {
      access_token: wx.getStorageSync('access_token'),
      id:id,
      latitude:lat,
      longitude:lng
    }
    let that = this
    wx.request({
      url: ss_interface.getSignInfo,
      data:json,
      method:'post',
      success:(r)=>{
        console.log(r.data.data)
        if (r.data.errcode == 200) {
          let data = r.data.data;
          innerAudioContext.stop();
          innerAudioContext.src = data.voice_url;
          this.setVoice({
            src:data.voice_url,
            onTimeUpdate: this.onTimeUpdate,
            voiceprogressWidth:'0%'
            })
          let o = this.eachSigns(data.id);
          this.setData({
            signName:data.name,
            desc: data.description,
            background_url:data.background_image,
            voice_url: data.voice_url,
            selectSignIndex:o?o.index:0,
            totalTime: data.voice_time
          })
          this.setCurrentSign({ 
            id:data.id,
            name:data.name
          })
        }else{
          console.log('1112233',r.data);
          wxShowModal({
            content: '获取景点信息失败',
            code: r.data.errcode
          })
        }
      }
    })
  },
  setCurrentSign: function (sign){
    app.globalData.currentSign = sign
    if (!!wx.getStorageSync('access_token')){
      this.getMissionList()
    }
  },
  setVoice:function(option){
    setVoice(option);
  },
  onTimeUpdate:function(){
    console.log(innerAudioContext.currentTime,this.data.totalTime);
    var Temp = this.data.totalTime.split(':')
    var Seconds = 60 * Number(Temp[0]) + Number(Temp[1])
    var percent = Math.ceil((innerAudioContext.currentTime) / Seconds * 100)
    if (innerAudioContext.currentTime == 0 || percent>=100){
      percent = 100;
      innerAudioContext.stop();
      this.setData({
        current_time: this.data.totalTime,
        voiceprogressWidth: percent + '%',
        playing: false
      })
    }else{
      this.setData({
        current_time: formatedPlayTime(innerAudioContext.currentTime),
        voiceprogressWidth: percent + '%',
        playing: true
      })
    }
  },
  eachSigns:function(id){
    for (let i = 0, l = this.data.signList.length;i<l;i++){
      let item = this.data.signList[i];
      if(item.id == id){
        return {item,index:i};
      }
    }
  }
})