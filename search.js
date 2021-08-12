var marks = [];
var search = {
    addEventListener: function () {
        var self = this;
        $('body').on('click', '.spread-area', function (e) {
            var oper = this.getAttribute('data-oper');
            console.log(oper);
            var click = $(this);
            if (oper == 'legend') {
                if (click.hasClass('active')) {
                    click.removeClass('active');
                } else {
                    click.addClass('active');
                }
                self.resetMarkers();
            }
        });
    },

    search: function () {
        // search.getMonitorInfo().done(search.setMarks);
        //search.addEventListener();
    },

    getMonitorInfo: function () {
        return $.ajax({
            url: window.parent.SITE_CONFIG['apiURL']+'/api/map/station',
            type: "get",
            dataType: "json",
            context: this
        });
    },

    setMarks: function (rdata) {
        var list = rdata.data;
        var self = this;
        var mark;
        $.each(list, function (i, item) {
            mark = baseMap.getMarkLayer({
                longitude: this.longitude,
                latitude: this.latitude,
                width: 30,
                height: 30,
                title: this.sectionName
            });

            var quality = 0;
            if(this.status !== 0){
                quality = this.quality;
            }

            mark._div.innerHTML = '<div class="spread-area spread-area-small" style="cursor: pointer"><span class="spread-point" style="width:12px;height:12px;"></span><div class="'+(quality>0?'spread':'')+'"></div></div>';
            mark._div.className = "customLayer spread-box lv" + (quality);
            mark._div.setAttribute('data-value', quality);

            var opts = {
                width : 256,
                height: 144,
                title : this.sectionName
            }
            var infoHtml = '<div class="site-info"><div class="line">更新时间：'+this.monitorTime+'</div>'+
            '<div class="block">水温：'+this.temp+' ℃</div>'+
            '<div class="block">pH：'+this.ph+'</div>'+
            '<div class="block">浊度：'+this.turbidity+' NTU</div>'+
            '<div class="block">氨氮：'+this.an+' mg/L</div>'+
            '<div class="block">总磷：'+this.tp+' mg/L</div>'+
            '<div class="block">总氮：'+this.tn+' mg/L</div>'+
            '<div class="block">溶解氧：'+this.doxygen+' mg/L</div>'+
            '<div class="block">电导率：'+this.conductivity+' μS/cm</div>'+
            '<div class="line">高锰酸盐指数：'+this.permanganate+' mg/L</div>'+
            '</div>';
            var infoWindow = new BMap.InfoWindow(infoHtml, opts); 
            var point = new BMap.Point(this.longitude, this.latitude);
            mark._div.addEventListener("click", function(){          
                baseMap.map.openInfoWindow(infoWindow, point);
            }); 

            marks.push(mark._div);
        });
    },

    getLevel: function (data) {
        if (isNaN(data.aqi)) {
            return 1;
        } else if (data.aqi <= 50) {
            return 1;
        } else if (data.aqi <= 100) {
            return 2;
        } else if (data.aqi <= 150) {
            return 3;
        } else if (data.aqi <= 200) {
            return 4;
        } else if (data.aqi <= 300) {
            return 5;
        } else {
            return 6;
        }
    },
    getquality(str){
        if(str === '1'){
          return 'Ⅰ';
        }else if(str === '2'){
          return 'Ⅱ';
        }else if(str === '3'){
          return 'Ⅲ';
        }else if(str === '4'){
          return 'Ⅳ';
        }else if(str === '5'){
          return 'Ⅴ';
        }else if(str === '6'){
          return '劣Ⅴ';
        }else{
          return '--';
        }
      },

    resetMarkers: function () {
        var types = $('.legend.active').map(function () {
            return this.getAttribute('data-value');
        }).toArray().join('_');
        $.each(marks, function () {
            if (types.indexOf(this.getAttribute('data-value')) >= 0) {
                this.style.display = 'block';
            } else {
                this.style.display = 'none';
            }
        })
    },
    
    removeMarks: function () {
        var mark;
        while (mark = marks.pop()) {
            baseMap.map.removeOverlay(mark);
        }
    }

};
$.when(baseMap.initialize()).then(console.log('over!'));