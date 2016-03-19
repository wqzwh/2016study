//搭建插件框架
//框架中最好传入window，undefined，document
//window等系统变量在插件内部就有了一个局部的引用，可以提高访问速度，会有些许性能的提升
;(function($,window,document,undefined){

    var Carrousel;
    Carrousel = function (elm) {
        //通过attr能够获取到节点里面的配置参数
        //console.log(elm.attr('data-setting'));

        //如果节点属性没有配置或者节点配置的属性不全，那么需要调用自己默认的配置参数
        var self = this;

        //保存单个对象
        this.elm = elm;
        this.wrapUl = elm.find('ul.wrap_ul');
        this.ggLeft = elm.find('div.gg_left');
        this.ggRight = elm.find('div.gg_right');
        this.picLiItems = elm.find('li.li_item');
        this.firstPicLi = this.picLiItems.first();
        this.lastPicLi = this.picLiItems.last();

        this.flage = true;

        //asa
        this.setting = {
            "width": 1000,            //幻灯片宽度
            "height": 270,            //幻灯片高度
            "firstPicWidth": 640,     //第一张图片宽
            "firstPicHeight": 270,    //第一张图片高度
            "scale": 0.9,			 //比例大小
            "speed": 500,              //切换速度
            "verticalAlign": "middle", //中间模式 top bottom
            'autoPlay': true,		  //是否自动播放
            'delay': 1000
        };

        //  配置参数扩展 extend
        //  第一个值是默认参数，第二个值是用户自定义的参数(需要先转化成json对象才能传入)
        $.extend(this.setting, this.getSetting());
        //console.log(this.setting);

        self.setSetingValue();
        self.setPicUlLiItems();

        //绑定切换图片事件
        this.ggRight.click(function () {
            if (self.flage) {
                self.flage = false;
                self.carrouselRight('left');
            }


        });

        this.ggLeft.click(function () {
            if (self.flage) {
                self.flage = false;
                self.carrouselRight('right');
            }
            ;


        });

        //是否开启自动播放
        if (self.setting.autoPlay) {
            //如果存在就执行自动播放的函数
            self.autoPlay();
            self.elm.hover(function () {
                clearInterval(self.timer);
            }, function () {
                self.autoPlay();
            });
        }

    };

	Carrousel.prototype={

		//自动播放的函数
		autoPlay:function(){
			var self=this;
			self.timer=setInterval(function(){
				self.ggLeft.click();
			}, this.setting.delay);

		},

		//向右向右旋转的函数方法
		carrouselRight:function(dir){

			var _self=this;
			var zIndexArr=[];

			if(dir==='left'){

				this.picLiItems.each(function(){

					var self=$(this);
					var prev=self.prev().get(0)?self.prev():_self.lastPicLi;
					var width=prev.width();
					var height=prev.height();
					var zIndex=prev.css('zIndex');
					var top=prev.css('top');
					var opacity=prev.css('opacity');
					var left=prev.css('left');
					zIndexArr.push(zIndex);
					self.animate({
						width:width,
						height:height,
						//zIndex:zIndex,
						top:top,
						opacity:opacity,
						left:left
					}, _self.setting.speed,function(){
						_self.flage=true;
					});
				});
				this.picLiItems.each(function(i){
					$(this).css('zIndex',zIndexArr[i]);
				});


			}else if(dir==='right'){

				this.picLiItems.each(function(){

					var self=$(this);
					var next=self.next().get(0)?self.next():_self.firstPicLi;
					var width=next.width();
					var height=next.height();
					var zIndex=next.css('zIndex');
					var top=next.css('top');
					var opacity=next.css('opacity');
					var left=next.css('left');
					zIndexArr.push(zIndex);
					self.animate({
						width:width,
						height:height,
						zIndex:zIndex,
						top:top,
						opacity:opacity,
						left:left
					}, _self.setting.speed,function(){
						_self.flage=true;
					});
				});
				this.picLiItems.each(function(i){
					$(this).css('zIndex',zIndexArr[i]);
				});

			}
		},

		//设置排列对齐的方法
		setVerticalAlign:function(height){
			var self=this;
			var verticalAlign=self.setting.verticalAlign;
			var top=0;

			if(verticalAlign==='middle'){
				top=(self.setting.height-height)/2;
			}else if(verticalAlign==='top'){
				top=0;
			}else if(verticalAlign==='bottom'){
				top=self.setting.height-height;
			}else{
				top=0;
			}
			return top;
		},

		//设置剩余图片的位置关系
		setPicUlLiItems:function(){
			var self=this;
			//保存除去第一张图片剩下的图片
			//slice(1) 表示除去第一个剩下所有的元素
			var slcieItems=this.picLiItems.slice(1);
			var sliceSize=slcieItems.size()/2;
			var rightItems=slcieItems.slice(0,sliceSize);
			var level=Math.floor(this.picLiItems.size()/2);
			var leftItems=slcieItems.slice(sliceSize);
			//console.log(leftItems);

			//右边第一张图片的高宽
			var rw=this.setting.firstPicWidth;
			var rh=this.setting.firstPicHeight;
			var gap=((this.setting.width-rw)/2)/level;

			//计算第一张图片距左边的宽度
			var firstOffsetLeft=(self.setting.width-self.setting.firstPicWidth)/2;

			//设置右边图片的高宽top透明度等等
			rightItems.each(function(i){
				//console.log(i);
				level--;
				rw=rw*self.setting.scale;
				rh=rh*self.setting.scale;
				$(this).css({
					zIndex:level,
					width:rw,
					height:rh,
					opacity:1/(++i),
					left:firstOffsetLeft+self.setting.firstPicWidth+(gap*i)-rw,
					top:self.setVerticalAlign(rh)
				});

			});

			//设置左边的位置关系

			//左边第一张图片的高宽
			var lw=rightItems.last().width();
			var lh=rightItems.last().height();
			var oloop=Math.floor(this.picLiItems.size()/2);

			leftItems.each(function(i){

				$(this).css({
					zIndex:i,
					width:lw,
					height:lh,
					opacity:1/oloop,
					left:i*gap,
					top:self.setVerticalAlign(lh)
				});

				oloop--;
				lw=lw/self.setting.scale;
				lh=lh/self.setting.scale;

			});
		},

		//设置配置参数值去控制页面的高宽
		setSetingValue:function(){
			var self=this;
			self.elm.css({
				width:this.setting.width,
				height:this.setting.height
			});

			self.wrapUl.css({
				width:this.setting.width,
				height:this.setting.height
			});

			//计算按钮高宽值
			var btnW=(this.setting.width-this.setting.firstPicWidth)/2;
			var btnH=this.setting.height;
			self.ggLeft.css({
				width:btnW,
				height:btnH,
				zIndex:Math.ceil(this.picLiItems.size()/2)
			});
			self.ggRight.css({
				width:btnW,
				height:btnH,
				zIndex:Math.ceil(this.picLiItems.size()/2)
			});

			self.firstPicLi.css({
				width:this.setting.firstPicWidth,
				height:this.setting.firstPicHeight,
				left:btnW,
				zIndex:Math.floor(this.picLiItems.size()/2),
				top:0
			});
		},
		//获取人工配置参数
		getSetting:function(){
			//this->Carrousel.prototype->var Carrousel
			var self=this;
			var setting=self.elm.attr('data-setting');
			//转化成json对象
			if(setting&&setting!=''){
				return $.parseJSON(setting);
			}else{
				return {};
			}
		}

		

	};

	Carrousel.init=function(elms){
			//初始化的时候把new的工作做了
			//传进来的是一个集合
			//this->Carrousel.init->Carrousel.prototype->var Carrousel 所以输出的是 dom节点对象
			//$(this)变成jquery对象
			//console.log($(this));
			var self=this;
			
			elms.each(function(){
				new self($(this));
			});
		};


	window.Carrousel=Carrousel;

})(jQuery,window,document);