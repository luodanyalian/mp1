import ss_interface from '../../common/ss-interface.js';
import {
  doWithGetUserInfo,
  wxShowToast,
  wxShowModal
} from '../../common/general.js'; 
import indexImages from '../../images/chooseRole/index.js';

const app = getApp();

Page({
  data:{
    needFixTop:false,
    winHeight: 0,
    winWidth: 0,
    navBarHeight: 0,
    userAvatar:'',
    userName:'',
    images: indexImages,
    blocks_cars:[],
    blocks_data:[],
    name_arr: [{ name: '可可', id: 'KEKE' }, { name: '布布', id: 'BUBU' }, { name: '鲁鲁',id:'LULU'}],
    role_images:[
      { className: 'keke', sel_src: indexImages.keke_sel_src, nor_src: indexImages.keke_nor_src},
      { className: 'bubu', sel_src: indexImages.bubu_sel_src, nor_src: indexImages.bubu_nor_src },
      { className: 'lulu', sel_src: indexImages.lulu_sel_src, nor_src: indexImages.lulu_nor_src }
    ],
    sel_role_index:1,
    sel_block_index:0,
    sel_cars_img:'',
    cars_scroll_left:0,
  },
  canIUse: wx.canIUse('button.open-type.getUserInfo'),
  hasGetUserInfo:false,//防止onload和onshow获取2次
  /**events */
  onLoad: function () {
    
    this.initPageImagesSize();
    this.getVehicles();
    // doWithGetUserInfo(app,(res)=>{
    //   if(res){
    //     console.log('has res',res.userInfo)
    //   }else{
    //     console.log('there is no res',app.globalData.userInfo);
    //   }
    // },this)
    this.getUserInfo();
    this.hasGetUserInfo = true
    this.setVehicle();
  },
  onShow: function () {
    //再看看，处理可能有些不太好
    if (!this.hasGetUserInfo){
      this.getUserInfo();
    }
    this.hasGetUserInfo = false;
  },
  scrollHandle: function (event){
    let scrollLeft = event.detail.scrollLeft;
    this.setData({
      cars_scroll_left:scrollLeft
    })
  },
  scrollLeft:function(){
    let cars_scroll_left = this.data.cars_scroll_left -90;
    this.setData({
      cars_scroll_left: cars_scroll_left <= 0 ? 0 : cars_scroll_left
    })
  },
  scrollRight: function () {
    let cars_scroll_left = this.data.cars_scroll_left +90;
    let maxLeft = this.data.blocks_data.length * 170*this.data.rpx2px - 585*this.data.rpx2px; //总长度 - 框的宽度
    // console.log(this.data.rpx2px);
    this.setData({
      cars_scroll_left: cars_scroll_left >= maxLeft ? maxLeft : cars_scroll_left
    })
  },
  changeRole: function (event) {
    let roleIndex = event.currentTarget.dataset.roleIndex;
    let roleId = event.currentTarget.dataset.roleId;
    let arr = [...this.data.role_images];
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].className == 'bubu') {
        arr[i].className = arr[roleIndex].className;
        arr[roleIndex].className = 'bubu';
      }
    }

    this.setData({
      role_images: arr,
      sel_role_index: roleIndex,
      blocks_data: this.data.blocks_cars[roleId],
      sel_block_index: 0
    }, () => {
      this.setVehicle(true);
    })
  },
  selectBlock: function (event){
    let blockIndex = event.currentTarget.dataset.blockIndex;
    let carImg = event.currentTarget.dataset.carImg;
    this.setData({
      sel_block_index: blockIndex,
      sel_cars_img: carImg
    })
  },
  back:function(){
    wx.navigateBack();
  },
  updateUserInfo:function(){
    wx.navigateTo({
      url: '../changeName/index'
    })
  },
  startSeeking:function(){
    wx.navigateTo({
      url: '../noun/noun'
    })
  },
  /**methods */
  getUserInfo:function(){
    wx.request({
      url: ss_interface.getUserInfo,
      data:{
        access_token: wx.getStorageSync('access_token')
      },
      method:'post',
      success:(res)=>{
        
        let data = res.data.data;
        let avatar = '';
        let nickname = '';
        // if (res.errcode == 200){
        if (data && data.avatar){
          avatar = data.avatar;
          app.globalData.userInfo.avatarUrl = avatar;
        }else{
          avatar = app.globalData.userInfo.avatarUrl;
        }
        if (data && data.nickname){
          nickname = data.nickname;
          app.globalData.userInfo.nickName = nickname;
        } else {
          nickname = app.globalData.userInfo.nickName;
        }
        console.log('userAvatar',avatar);
        this.setData({
          userAvatar: avatar,
          userName: nickname
        })
        // }
      }
    })
  },
  getVehicles:function(){
    let access_token = wx.getStorageSync('access_token');
    let json = {
      access_token: access_token
    }
    wx.request({
      url: ss_interface.getVehicles,
      data:json,
      method:'post',
      success:(res)=>{
        let data = res.data.data;
        console.log(data)
        this.setData({
          blocks_cars:data,
          blocks_data:data['BUBU']
        })
      }
    })
  },
  setVehicle: function (showToast){
    let json = {
      access_token: wx.getStorageSync('access_token'),
      location_id: app.globalData.currentSign.id,
      role: this.data.sel_role_index
    }
    wx.request({
      url: ss_interface.setVehicle,
      data: json,
      success: (r) => {
        if (r.data.errcode == 200) {
          if (showToast){
            // wxShowToast({
            //   title: '选择成功',
            //   icon: 'success',
            //   mask:true,
            //   code: r.data.errcode
            // })
          }
        } else {
          wxShowToast({
            title: '选择失败',
            icon: 'success',
            mask: true,
            code: r.data.errcode
          })
        }
      }
    })
  },
  initPageImagesSize: function () {
    wx.getSystemInfo({
      success: function (res) {
        let options = {
          winHeight: res.windowHeight,
          winWidth: res.windowWidth,
          rpx2px: res.windowWidth / 750
        }
        if (res.windowHeight < 520){
          options.needFixTop = true;
        }
        this.setData(options);
      }.bind(this)
    })
  }
})