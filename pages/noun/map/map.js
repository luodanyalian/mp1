export const map = {
  compelted: function (id,lat,lon) {
    var point = {
      iconPath: "/images/map/icon_map_pin_yellow@3x.png",
      id: id,
      latitude: lat,
      longitude: lon,
      width: 25,
      height: 30
    }
    return point;
  },
  getCenterLocation: function (mapCtx) {
      mapCtx.getCenterLocation({
        success: function (res) {
          console.log(res.longitude)
          console.log(res.latitude)
        }
      })
  },
  moveToLocation: function (mapCtx) {
      mapCtx.moveToLocation()
  },
  translateMarker: function (mapCtx) {
      mapCtx.translateMarker({
        markerId: 0,
        autoRotate: true,
        duration: 1000,
        destination: {
          latitude: Number(31.230416),
          longitude: Number(121.4),
        },
        animationEnd() {
          console.log('animation end')
        }
      })
    },
  includePoints: function (mapCtx) {
     mapCtx.includePoints({
        padding: [10],
        points: [{
          latitude: Number(23.10229),
          longitude: Number(113.3345211),
        }, {
          latitude: Number(23.00229),
          longitude: Number(113.3345211),
        }]
      })
    },
    updated: function () {
      // console.log('111')
    }
}
