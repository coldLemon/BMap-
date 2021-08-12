/**
 * 自定义marker 自定义覆盖层
 * @returns {customOverLayer}
 */
 function CustomOverLayer(options) {
  this._title = options.title;
  console.log('------------------');
  console.log('-------加载CunsLay---------');
  console.log(options);
  console.log(options.width);
  
  this._center = new BMap.Point(options.longitude, options.latitude);
  this._width = options.width || 30;
  this._height = options.height || 30;
};
CustomOverLayer.prototype = new BMap.Overlay();
/**
* 实现初始化方法  
* @param map
* @returns {___div0}
*/
CustomOverLayer.prototype.initialize = function(map){
  this._map = map;
  // 创建div元素，作为自定义覆盖物的容器
  var div = document.createElement("div");
  div.style.position = "absolute";
  div.style.width = this._width + "px";
  div.style.height = this._height + "px";
  //div.style.background = this._color;
  div.className = "isButton customLayer";
  div.setAttribute("data-oper", "layer");
  div.title = this._title;
  // 将div添加到覆盖物容器中
  this._map.getPanes().markerPane.appendChild(div);
  // 保存div实例
  this._div = div;
  // 需要将div元素作为方法的返回值，当调用该覆盖物的show、
  // hide方法，或者对覆盖物进行移除时，API都将操作此元素。
  return div;
};
CustomOverLayer.prototype.draw = function(){    
  // 根据地理坐标转换为像素坐标，并设置给容器    
  var position = this._map.pointToOverlayPixel(this._center);
  this._div.style.left = position.x - this._width / 2 + "px";    
  this._div.style.top = position.y - this._height / 2 + "px"; 
};
CustomOverLayer.prototype.show = function(){    
  if (this._div){    
      this._div.style.display = "";    
  }    
};     

CustomOverLayer.prototype.hide = function(){    
  if (this._div){    
      this._div.style.display = "none";    
  }    
};