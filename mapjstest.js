var baseMap = {
  //返回容器的
  getMarkLayer: function (options) {
    var layer = new CustomOverLayer(options);
    this.map.addOverlay(layer);
    return layer;
  },
  extend: function (target, source) {
    for (name in source) {
      if (source[name]) {
        target[name] = source[name];
      }
    }
    return target;
  },

  drawBoundry: function () {
    var deferred = $.Deferred();
    var bdary = new BMap.Boundary();
    var map = this.map;
    var polygons = [];
    var count = 0;
    //        var cities = ['西安', '商洛', '安康','榆林','汉中','延安','渭南',
    //                          '咸阳','宝鸡','铜川'];
    //        for (var i = 0; i < cities.length; i++) {
    //            bdary.get(cities[i], function(rs){
    //                count++;
    //                addLayer(rs);
    //            });
    //        }
    bdary.get("四川", function (rs) {
      count++;
      addLayer(rs);
      deferred.resolve();
    });
    function addLayer(rs) {
      var count = rs.boundaries.length; //行政区域的点有多少个
      for (var i = 0; i < count; i++) {
        var ply = new BMap.Polygon(rs.boundaries[i], {
          strokeWeight: 1, //设置多边形边线线粗
          strokeOpacity: 1, //设置多边形边线透明度0-1
          StrokeStyle: "solid", //设置多边形边线样式为实线或虚线，取值 solid 或 dashed
          strokeColor: "#fff", //设置多边形边线颜色
          fillColor: "#fff", //设置多边形填充颜色
          fillOpacity: 0.1, //设置多边形填充颜色透明度0-1  注：标红的地放你们可以去掉看一下效果，自己体验一下
          enableClicking: false,
        }); //建立多边形覆盖物
        map.addOverlay(ply); //添加覆盖物
        polygons.push(ply);
        loaded();
        //addPolygonEvents();
        //map.setViewport(ply.getPath());    //调整视野
      }
      function loaded() {
        if (polygons.length == 10) {
          console.log("boundry loaded");
          deferred.resolve();
        }
      }
    }
    return deferred;
  },

  draw: function (i, points) {
    var ply = new BMap.Polyline(points, {
      strokeWeight: 1, //设置多边形边线线粗
      strokeOpacity: 1, //设置多边形边线透明度0-1
      StrokeStyle: "solid", //设置多边形边线样式为实线或虚线，取值 solid 或 dashed
      strokeColor: "#ff0000", //设置多边形边线颜色
      fillColor: i == 0 ? "#ff0000" : "#000000", //设置多边形填充颜色
      fillOpacity: 0.1, //设置多边形填充颜色透明度0-1  注：标红的地放你们可以去掉看一下效果，自己体验一下
      enableClicking: false,
    });
    this.map.addOverlay(ply); //添加覆盖物
  },
  drawPolygon: function (data) {
    var self = this;
    $.each(data.geometry.coordinates, function (j) {
      var points = [];
      $.each(this, function (i, item) {
        points.push(new BMap.Point(item[0], item[1]));
      });
      self.fillLine(points, !!j);
    });
  },
  drawMultiLine: function (data) {
    var self = this;
    var points = $.each(data.geometry.coordinates, function (i, item) {
      var points = [];
      $.each(this, function () {
        points.push(new BMap.Point(this[0], this[1]));
      });
      self.drawLine(points);
    });
  },
  fillLine: function (points, isInner) {
    var ply = new BMap.Polygon(points, {
      strokeWeight: 2, //设置线粗
      strokeOpacity: 1, //设置线透明度0-1
      fillColor: isInner ? "#000000" : "#3B9CFF", //设置多边形填充颜色
      fillOpacity: 1,
      StrokeStyle: "solid", //设置为实线或虚线，取值 solid 或 dashed
      strokeColor: "#3B9CFF", //设置线颜色
      enableClicking: false,
    });
    this.map.addOverlay(ply);
  },
  drawLine: function (points) {
    var ply = new BMap.Polyline(points, {
      strokeWeight: 2, //设置线粗
      strokeOpacity: 1, //设置线透明度0-1
      StrokeStyle: "solid", //设置为实线或虚线，取值 solid 或 dashed
      strokeColor: "#3B9CFF", //设置线颜色
      enableClicking: false,
    });
    this.map.addOverlay(ply);
  },

  drawPolyline: function (data) {
    var points = $.map(data.geometry.coordinates, function (item) {
      return new BMap.Point(item[0], item[1]);
    });
    this.drawLine(points);
  },

  drawRivers: function () {
    var deferred = $.Deferred();
    var self = this;
    new Promise((rso) => {

    $.getJSON("./rivalgeo.json", (rdata) => {
      $.each(rdata.features, function () {
        if (this.geometry.type === "MultiLineString") {
          self.drawMultiLine(this);
          return;
        }
        self.drawPolyline(this);
      });
    });
    rso();
  }).then((_) => {
    $.getJSON("./sx-geo.json", (rdata) => {
      $.each(rdata.features, function () {
        self.drawPolygon(this);
      });
      setTimeout(function () {
        deferred.resolve();
      }, 1000);
    });
  });



    return deferred;
  },
  /**
   * 百度地图不支持某些样式，为了实现，只能强行加上去
   */
  setSpecialStyle: function () {
    var wrapper = document.getElementById("map").firstChild;
    //找到需要加样式的这个容器。已知特征：1.是图片的爷爷节点  2.zIndex是1
    var container;
    var i;
    for (i = 0; i < wrapper.childNodes.length; i++) {
      container = wrapper.childNodes[i];
      if (container.style.zIndex == "1") {
        break;
      }
    }
    container.style.filter =
      "saturate(0%) hue-rotate(100deg) contrast(240%) brightness(60%)";
    container.style.transition = "0s";
    container.style.opacity = "0.6";
  },

  defaults: {
    longitude: 104.085983,
    latitude: 30.583008,
    zoomLevel: 7,
  },

  map: null,

  initialize: function () {
    var params = this.defaults;
    var map = new BMap.Map("map", {
      mapType: BMAP_SATELLITE_MAP,
    });
    this.map = map;
    var point = new BMap.Point(params.longitude, params.latitude); // 创建点坐标
    map.centerAndZoom(point, params.zoomLevel);
    map.enableScrollWheelZoom();
    map.disableDoubleClickZoom();
    map.setDefaultCursor("default");
    this.setSpecialStyle();
    //map.setMapStyle({style: "midnight"});
    map.addControl(new BMap.NavigationControl());
    return $.when(this.drawBoundry(), this.drawRivers());
  },

  resite: function () {
    var map = this.map;
    var params = this.defaults;
    var point = new BMap.Point(params.longitude, params.latitude);
    map.centerAndZoom(point, params.zoomLevel);
  },

  changeTabs: function () {
    setTimeout(() => {
      this.resite();
    }, 100);
  },
};
