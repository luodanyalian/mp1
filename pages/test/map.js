// map.js 
var markers = [
  {
    iconPath: "../../../../images/icon_map_pin_bule@3x.png",
    id: 0,
    latitude: 31.07662,
    longitude: 121.18407,
    width: 25,
    height: 30
  }
];
Page({
  data: {
    markers: markers,
    circles: [{
      latitude: 31.230010,
      longitude: 121.472000,
      // color: '#0000ff33',
      fillColor: '#0000ff66',
      radius: 100
    }]
  },
  onReady: function (e) {
    // 使用 wx.createMapContext 获取 map 上下文
    this.mapCtx = wx.createMapContext('myMap');
    // wx.chooseLocation({
    //   success: function (res) {
    //     console.log(res)
    //   }
    // })
    this.compelted();

  },
  compelted: function () {
    markers.push({
      iconPath: "../../../../images/icon_map_pin_yellow@3x.png",
      id: 0,
      latitude: 31.07652,
      longitude: 121.18317,
      width: 25,
      height: 30
    })
    this.setData({
      markers: markers
    })
  },
  getCenterLocation: function () {
    this.mapCtx.getCenterLocation({
      success: function (res) {
        console.log(res.longitude)
        console.log(res.latitude)
      }
    })
  },
  moveToLocation: function () {
    this.mapCtx.moveToLocation()
  },
  translateMarker: function () {
    this.mapCtx.translateMarker({
      markerId: 0,
      autoRotate: true,
      duration: 1000,
      destination: {
        latitude: 31.230416,
        longitude: 121.4,
      },
      animationEnd() {
        console.log('animation end')
      }
    })
  },
  includePoints: function () {
    this.mapCtx.includePoints({
      padding: [10],
      points: [{
        latitude: 23.10229,
        longitude: 113.3345211,
      }, {
        latitude: 23.00229,
        longitude: 113.3345211,
      }]
    })
  },
  updated: function(){
    console.log('111')
  }
})