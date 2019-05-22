angular.module('citymobi.directives', [])
    .directive("ngTouchstart", function () {
        return {
            controller: ["$scope", "$element", function ($scope, $element) {

                $element.bind("touchstart", onTouchStart);
                function onTouchStart(event) {
                    var method = $element.attr("ng-touchstart");
                    $scope.$event = event;
                    $scope.$apply(method);
                }

            }]
        }
    })
    .directive('ngInput', [function () {
    return {
        restrict: 'A',
        require: '?ngModel',
        link: function(scope, element, attrs) {
                element.on('input',oninput);
                scope.$on('$destroy',function(){//销毁的时候取消事件监听
                    element.off('input',oninput);
                });
                function oninput(event){
                    scope.$evalAsync(attrs['ngInput'],{$event:event,$value:this.value});
                }
            }
        }
    }])
    .directive("ngTouchmove", function () {
        return {
            controller: ["$scope", "$element", function ($scope, $element) {

                $element.bind("touchstart", onTouchStart);
                function onTouchStart(event) {
                    event.preventDefault();
                    $element.bind("touchmove", onTouchMove);
                    $element.bind("touchend", onTouchEnd);
                }
                function onTouchMove(event) {
                    var method = $element.attr("ng-touchmove");
                    $scope.$event = event;
                    $scope.$apply(method);
                }
                function onTouchEnd(event) {
                    event.preventDefault();
                    $element.unbind("touchmove", onTouchMove);
                    $element.unbind("touchend", onTouchEnd);
                }

            }]
        }
    })
    .directive("ngTouchend", function () {
        return {
            controller: ["$scope", "$element", function ($scope, $element) {

                $element.bind("touchend", onTouchEnd);
                function onTouchEnd(event) {
                    var method = $element.attr("ng-touchend");
                    $scope.$event = event;
                    $scope.$apply(method);
                }

            }]
        }
    })
  .directive("inputClear",
  function() {
    return {
      restrict: "C",
      link: function(scope, element) {
        element.bind("click",
          function(event) {
            for (var inputs = element.parent().find("input"), i = 0, len = inputs.length; len > i; i++)
              if (inputs[i].type.match(/password|text|number|tel/)) {
                var input = inputs[i];
                break
              }
            input.value = "";
            try {
              angular.element(input).triggerHandler("input")
            } catch (e) {}
          })
      }
    }
  })
  .directive("imageError", function() {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        var errorSrc = attrs.errorSrc ? attrs.errorSrc : 'img/fail.png';
        var img_el = element[0];

        img_el.addEventListener('load', imgLoadEvent, false);
        img_el.addEventListener('error', imgErrorEvent, false);

        function imgLoadEvent() {
          img_el.removeEventListener('load', imgLoadEvent);
          img_el.removeEventListener('error', imgErrorEvent);
        }

        function imgErrorEvent() {
          img_el.src = errorSrc;
        }
      }
    }
  })
  .directive('hideTabBar', function($timeout) {
    var style = angular.element('<style>').html(
      '.has-tabs.no-tabs:not(.has-tabs-top) { bottom: 0; }\n' +
      '.no-tabs.has-tabs-top { top: 44px; }');
    document.body.appendChild(style[0]);
    return {
      restrict: 'A',
      compile: function(element, attr) {
        var tabBar = document.querySelector('.tab-nav');
        return function($scope, $element, $attr) {
          $scope.$on('$ionicView.beforeEnter', function() {
            $timeout(function(){
              var scroll = $element[0].querySelector('.scroll-content');
              tabBar.classList.add('slide-away');
              scroll && scroll.classList && scroll.classList.add('no-tabs');
            },0)
          })
        }
      }
    };
  })



  .directive('showTabBar', function($timeout) {
    var style = angular.element('<style>').html(
      '.has-tabs.no-tabs:not(.has-tabs-top) { bottom: 0; }\n' +
      '.no-tabs.has-tabs-top { top: 44px; }');
    document.body.appendChild(style[0]);
    return {
      restrict: 'A',
      compile: function(element, attr) {
        var tabBar = document.querySelector('.tab-nav');
        return function($scope, $element, $attr) {
          $scope.$on('$ionicView.beforeEnter', function() {
            $timeout(function() {
              var scroll = $element[0].querySelector('.scroll-content');
              tabBar.classList.remove('slide-away');
              scroll && scroll.classList && scroll.classList.remove('no-tabs');

            },0)
          })
          $scope.$on('$ionicView.afterEnter', function() {
            $timeout(function() {

              $('.restore_height').removeClass('restore_height');
              $('.tabsCopyTitleBar').remove();
            },0)
          })

        }
      }
    };
  })

  .directive('horizontalScrollFix', function() {

    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        element.children().on('mousedown touchstart', function(event) {
          event.preventDefault = function() {};
        });
      }
    }

  })

  .directive('parallaxCanvas', ['$compile', '$document', function($compile, $document) {
    return {
      restrict: 'E',
      templateUrl:local_resource+ 'js/directives/parallaxCanvas.html',
      transclude: true,
      replace: false,
      scope: {},
      link: function(scope, element, attr) {
        document.getElementsByClassName('loginInput')[0].addEventListener('touchstart',function(ev){
          ev.preventDefault();
        },false);

        document.getElementsByClassName('loginInput')[1].addEventListener('touchstart',function(ev){
          ev.preventDefault();
        },false);

        // 坐标配置项
        var OldPageY,
          PageY,
          positionPageY = {
            num: 0,
            scale: 1
          },
          OldPositionPageY = {
            num: 0,
            scale: 1
          };


        // 高度配置项
        var barHeight = 44; //默认数值
        var screenHeight = 0;

        // 测试白屏问题
        if(document.getElementsByTagName('ion-view')[0].offsetHeight == 0){
          console.log('白屏问题');
        }


        if(window.W_ScreenHeight){
          screenHeight = window.W_ScreenHeight;
        }else{
          window.W_ScreenHeight = screenHeight = document.getElementsByTagName('ion-view')[0].offsetHeight;
        }

        
        var screenWidth = 0;
        if(window.W_ScreenWidth){
      screenWidth = window.W_ScreenWidth;
        }else{
          window.W_ScreenWidth = screenWidth = window.screen.availWidth;
        }


        var ParallaxBlockHeight = (attr.isbar == 'false') ? screenHeight : screenHeight - barHeight;
        // 缓速配置项
        var delayScope = 0.4;
        var delaySpeed = 3;

        //  Request Animation Id
        var AnimationId = null;

        // Parallax Header Height REM
        var ParallaxHeaderHeightREM = 6.2;
        var ParallaxHeaderHeightPX = lib.flexible.rem2px(ParallaxHeaderHeightREM);

        // Parallax Personae Width Height REM
        var ParallaxPersonaeSizeREM = 2.6;
        var ParallaxPersonaeSizePX = lib.flexible.rem2px(2.6);


        // ParallaxBlock
        var ParallaxBlock = element[0].getElementsByClassName('parallax-block')[0];
        var parallaxHeader = element[0].getElementsByClassName('parallax-header')[0];
        var parallaxContent = element[0].getElementsByClassName('parallax-content')[0];
        var parallaxHCPos = lib.flexible.px2rem(screenHeight) - 6.2; // 6.2 is 原始设计图计算得出 header height / (设计图宽度 / 10)
        parallaxHeader.style.webkitTransform = 'translate3d(' + 0 + 'px, ' + (-parallaxHCPos) + 'rem, ' + 0 + 'px)';
        parallaxContent.style.webkitTransform = 'translate3d(' + 0 + 'px, ' + (-parallaxHCPos) + 'rem, ' + 0 + 'px)';

        ParallaxBlock.style.width = screenWidth + 'px';

        //ParallaxBlock.style.height = ParallaxBlockHeight + 'px';
        ParallaxBlock.style.height = ParallaxHeaderHeightPX + parallaxContent.offsetHeight + 'px';
        parallaxHeader.style.height = ParallaxBlockHeight + 'px';

        //ParallaxBlock.style.overflow = 'hidden';



        // Parallax Canvas
        var Canvas = document.getElementById('parallax-canvas'),
          ctx = (Canvas && Canvas.getContext) ? Canvas.getContext('2d') : null,
          ImgObj = {
            personae: {
              // src: 'img/register/img_login_logo@2x.png',
              src: local_resource+'img/register/img_login_logo@2x'+(angular.isDefined(window.localStorage._vip_bu)&&window.localStorage._vip_bu!=null&&window.localStorage._vip_bu!=''?window.localStorage._vip_bu:'')+'.svg',
              element: null,
              attr: null
            }
          },
          Img = document.createElement('img'),
          ImgNewHeight,
          backgroundHeight,
          personaeWidth;

        Canvas.width = screenWidth;
        Canvas.height = ParallaxBlockHeight;

        LoadAllImages(ImgObj, function() {
          if (ctx) {
            ctx.save();

            ctx.translate(screenWidth / 2, ParallaxBlockHeight - ParallaxHeaderHeightPX / 2);

            var ParallaxPersonaeScaleSize = ParallaxPersonaeSizePX * positionPageY.scale;
            ctx.drawImage(ImgObj.personae.element, -(ParallaxPersonaeScaleSize / 2), -(ParallaxPersonaeScaleSize / 2), ParallaxPersonaeScaleSize, ParallaxPersonaeScaleSize);

          }
        });



        // ParallaxBlock Add Touch Event
        ParallaxBlock.addEventListener('touchstart', touchstart, false);

        //touch switch
        var isTouch = true;

        // Event Function
        function touchstart(e) {
          if (!(e.target.tagName == 'INPUT')) {
            e.preventDefault();
          }
          if (isTouch) {
            isTouch = false;

            //ParallaxBlock.style.overflow = 'initial';
            OldPageY = e.pageY || e.touches[0].pageY;

            // Canvas Loop Start
            ParallaxCanvasLoop();

            ParallaxBlock.addEventListener('touchmove', touchmove, false);
            ParallaxBlock.addEventListener('touchend', touchend, false);
          }

        }


        function touchmove(e) {
          PageY = e.pageY || e.touches[0].pageY;


          if (PageY != OldPageY) {
            if (positionPageY.num >= 0) {
              if ((positionPageY.num < (ParallaxBlockHeight * delayScope)) && ((positionPageY.num + (PageY - OldPageY)) > (ParallaxBlockHeight * delayScope))) {
                var xjz = (positionPageY.num + (PageY - OldPageY)) - (ParallaxBlockHeight * delayScope);
                PageY = PageY - xjz + 1;
              }

              if ((ParallaxBlockHeight * delayScope) < positionPageY.num) {

                positionPageY.num += 0.3;
                positionPageY.num = parseFloat(positionPageY.num.toFixed(2))
              } else {
                positionPageY.num += (PageY - OldPageY);
              }

              if (positionPageY.num < 0) positionPageY.num = 0;
              setParallaxBlockTransitionDuration(0);
              setParallaxBlockTranslate3d(0, positionPageY.num, 0);

              positionPageY.scale = (positionPageY.num / ParallaxBlockHeight + 1).toFixed(2);
            }

            OldPageY = PageY;
          }
        }

        function touchend(e) {
          if (!(e.target.tagName == 'INPUT')) {
            e.preventDefault();
          }

          new TweenMax(positionPageY, 0.3, {
            num: 0,
            scale: 1,
            onComplete: function() {
              //ParallaxBlock.style.overflow = 'hidden';
              isTouch = true;
              cancelAnimationFrame(AnimationId);
            }
          });

          setParallaxBlockTransitionDuration(300);
          setParallaxBlockTranslate3d(0, 0, 0);

          ParallaxBlock.removeEventListener('touchmove', touchmove);
          ParallaxBlock.removeEventListener('touchend', touchend);
        }


        // Transform Change Function

        function setParallaxBlockTranslate3d(x, y, z) {
          ParallaxBlock.style.webkitTransform = 'translate3d(' + x + 'px, ' + y + 'px, ' + z + 'px)';
        }

        function setParallaxBlockTransitionDuration(ms) {
          ParallaxBlock.style.webkitTransitionDuration = ms + 'ms';
        }

        // equalRatio
        function equalRatioHeight(nw, ow, oh) {
          return parseInt(nw / ow * oh)
        }

        function equalRatioWidth(nh, oh, ow) {
          return parseInt(nh / oh * ow)
        }

        // Load All Images
        function LoadAllImages(ImagesObj, callback) {
          var len = 0,
            isLoadEnd = function() {
              if (len === 0) callback();
            },
            imgLoad = function(imgName) {

              return function(e) {
                ImagesObj[imgName].attr = e.target;
                --len;
                isLoadEnd();
              }

            };

          angular.forEach(ImagesObj, function(item, itemName) {
            ++len;
            var img = document.createElement('img');
            img.addEventListener('load', imgLoad(itemName), false);
            img.src = item.src;
            ImagesObj[itemName].element = img;
          });


        }

        // Parallax Canvas Loop

        function ParallaxCanvasLoop() {

          ctx.restore();
          ctx.clearRect(0, 0, screenWidth, ParallaxBlockHeight);
          //重新保存初始配置
          ctx.save();
          //定位中心点
          ctx.translate(screenWidth / 2, (ParallaxBlockHeight - (ParallaxHeaderHeightPX + positionPageY.num) / 2));
          var ParallaxPersonaeScaleSize = (ParallaxPersonaeSizePX * positionPageY.scale);
          ctx.drawImage(ImgObj.personae.element, -(ParallaxPersonaeScaleSize / 2), -(ParallaxPersonaeScaleSize / 2), ParallaxPersonaeScaleSize, ParallaxPersonaeScaleSize);

          AnimationId = requestAnimationFrame(ParallaxCanvasLoop)

        }

      }
    }
  }])
  .directive('clearValueBox', ['$compile', '$document', function($compile, $document) {
    return {
      restrict: 'A',
      replace: true,
      scope: true,
      controller: ['$scope', function($scope) {
        this.clearValue = function() {
          $scope.$broadcast('clear-value');
        }

        this.btnHandle = function(handel) {
          $scope.$broadcast('btn-handle', handel);
        }
      }],
      link: function(scope, element, attr) {

      }
    }
  }])
  .directive('clearValueInput', ['$compile', '$document','$timeout', function($compile, $document, $timeout) {
    return {
      restrict: 'A',
      replace: true,
      require: '^clearValueBox',
      scope: {
        ngModel: '='
      },
      link: function(scope, element, attr, clearValueBox) {

        var clearState = false;
        var clearNewState = false;

        scope.clearValue = function() {

          if (attr.ngModel) {
            scope.ngModel = '';
            scope.$apply();
          } else {
            angular.element(element).val('');
          }
          $timeout(function(){
            $(element).focus();
          },400);
          
        }

        scope.$on('clear-value', function(d, data) {
          scope.clearValue();
        });

        element.on('focus', function(ev) {
          (ev.target.value.length >= 1) ? clearNewState = true: angular.noop;
          clearValueControl();
        });

        element.on('blur', function(ev) {
          clearNewState = false;
          clearValueControl();
        });

        element.on('input', function(ev) {
          (ev.target.value.length >= 1) ? clearNewState = true: clearNewState = false;
          clearValueControl();
        });

        function clearValueControl() {

          clearState = clearNewState;

          if (clearState) {
            //显示按钮
            clearValueBox.btnHandle(true);
          } else {
            //隐藏按钮
            clearValueBox.btnHandle(false);
          }
        }
      }
    }
  }])
  .directive('clearValueBtn', ['$compile', '$document', function($compile, $document) {
    return {
      restrict: 'A',
      replace: true,
      require: '^clearValueBox',
      link: function(scope, element, attr, clearValueBox) {
        element[0].className += ' ion-android-cancel';
        element[0].style.display = 'none';
        element[0].style.fontSize = '20px';
        element[0].style.marginRight = '2px';
        element[0].style.color = '#cccccc';

        scope.btnHandel = function(data) {
          element[0].style.display = (data) ? 'block' : 'none';
        }

        scope.$on('btn-handle', function(d, data) {
          scope.btnHandel(data);
        });

        element[0].addEventListener('touchstart', function(ev) {
          element[0].style.display = 'none';
          clearValueBox.clearValue();
        }, false)
      }
    }
  }])


  .directive('ionParallaxContent', ['$ionicScrollDelegate', '$location', '$timeout', function($ionicScrollDelegate, $location, $timeout) {
    return {
      restrict: 'E',
      templateUrl: local_resource+'js/directives/ionParallaxContent.html',
      transclude: true,
      replace: true,
      scope: false,
      controller: function($scope) {
        // 初始化swiper索引为0
        $scope.activeIndex = 0;
        // swiper 配置
        $scope.options = {
          initialSlide: 0,
          slidesPerView: 1,
          paginationClickable: true,
          spaceBetween: 0,
          loop: true,
          centeredSlides: true,
          autoplay: 5000,
          autoplayDisableOnInteraction: false
        };
      },
      link: function(scope, element, attr) {

        // console.log(scope.options);

        //初始化swiper数据
        scope.swiper = JSON.parse(attr.swiperData);

        var isSetFunc = false;

        scope.data = {
        };

        scope.$watch('data.slider',function(){
          if(scope.data.slider && !isSetFunc){
            isSetFunc = true;


            scope.data.slider.on('SlideChangeStart', function(swiper) {
              $timeout(function() {
                scope.activeIndex = swiper.slides[swiper.activeIndex].getAttribute('data-swiper-slide-index');
                // console.log(swiper.slides[swiper.activeIndex].getAttribute('data-swiper-slide-index'));
                // console.log(scope.activeIndex);
              }, 0);

            });
          }
        });



        var oldTop = 0;
        var ionSlidesBox = $('#ionSlidesBox');
        var ionSlidesBoxHeight = ionSlidesBox.height();
        var swiperWrapper = ionSlidesBox.find('.swiper-container');
        var fixedIonSlidesBox = $('.fixedIonSlidesBox');
        var oldScaleVal = 0;
        var isAutoPlay = true;


        scope.$on('$ionicView.afterEnter', function(){
          //进入之后
          if (!isAutoPlay) {
            isAutoPlay = true;
            scope.data.slider && scope.data.slider.startAutoplay();
          }
        });



        scope.$on('$ionicView.beforeLeave', function(){
          //离开之前

          if (isAutoPlay) {
            isAutoPlay = false;
            scope.data.slider && scope.data.slider.stopAutoplay();
          }
        });


        scope.ParallaxScroll = function() {

          var newTop = $ionicScrollDelegate.getScrollPosition().top;

          if (newTop < 0) {
            var setScaleVal = (Math.abs(newTop) / ionSlidesBoxHeight + 1).toFixed(3);
            // console.log(setScaleVal);
            if (setScaleVal != oldScaleVal) {

              fixedIonSlidesBox.css({
                '-webkit-Transform': 'scale(' + setScaleVal + ',' + setScaleVal + ')',
                'display': 'block'
              });

              if (isAutoPlay) {
                isAutoPlay = false;

                swiperWrapper.css({
                  'opacity': 0
                });

                scope.data.slider && scope.data.slider.stopAutoplay();
              }

              oldScaleVal = setScaleVal;
            }

          } else if (newTop >= 0) {
            if (!isAutoPlay) {
              isAutoPlay = true;

              swiperWrapper.css({
                'opacity': 1
              });
              fixedIonSlidesBox.css({
                '-webkit-Transform': 'scale(1,1)',
                'display': 'none'
              });

              scope.data.slider && scope.data.slider.startAutoplay();
            }
          }

          oldTop = newTop;
        };

      }
    }
  }])
  .directive('adDial', ['$location', '$timeout', function($location, $timeout) {

    return {
      restrict: 'E',
      template: '<div class="ad-dial"></div>',
      replace: true,
      scope: {
        addata: "="
      },
      controller: function($scope) {
        
      },
      link: function(scope, element, attr) {

        scope.seekResultsAngle = function(sa,ta,ra){
            return sa + (ta * ra)
        };

        scope.loadImage = function(src,callback){
            var beauty = new Image();
            
            beauty.src = local_resource+src;
            if(beauty.complete){
           
               callback(beauty);
            }else{
               beauty.onload = function(){
       
                 callback(beauty);
               };
               beauty.onerror = function(){
                 console.error('图片加载失败：' + src);
               };
            };
        };

        var 
          canvas_size = $(element[0]).width(),
          lineWidth = parseInt(lib.flexible.rem2px(0.18)),
          desTextYPos = parseInt(lib.flexible.rem2px(3.5)),
          desTextSize = (parseInt(lib.flexible.rem2px(0.34)) <= 10)?11:parseInt(lib.flexible.rem2px(0.34)),
          mainTextYPos = parseInt(lib.flexible.rem2px(2.2)),
          iconSize = parseInt(lib.flexible.rem2px(1.6)),
          clearRectTop = parseInt(lib.flexible.rem2px(0.8)),
          clearRectLeft = parseInt(lib.flexible.rem2px(1.06)),
          clearRectSize = parseInt(lib.flexible.rem2px(1.93)),
          canvas_radius = (canvas_size - lineWidth)/2,
          startAngle = 135*Math.PI/180,
          endAngle = startAngle+4.7,
          totalAngle = 4.7,
          speedFlag = null;

        //speedFlag防止更新太快

        scope.canvas = $("<canvas width='"+canvas_size+"' height='"+canvas_size+"'></canvas>")
        $(element).prepend(scope.canvas);
        scope.ctx = scope.canvas[0].getContext("2d");

        scope.$watch('addata.staff_num_config', function(newValue, oldValue) {

          
            if (newValue == undefined){

                scope.addata.staff_num_config = {
                  staff_size : oldValue.staff_size,
                  input_staff_size : oldValue.input_staff_size
                }

              return
            }

            speedFlag = false;
           
            //清屏
          

            scope.ctx.clearRect(0,0,canvas_size,canvas_size);


            

            // 背景线条
            scope.ctx.beginPath();
            scope.ctx.lineWidth = lineWidth;
            scope.ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
            scope.ctx.lineCap="round";
            scope.ctx.arc(canvas_size/2,canvas_size/2,canvas_radius,startAngle,endAngle,false);
            scope.ctx.stroke();

            // 计算比率
            var 
                ratio = (scope.addata.staff_num_config.staff_size == 0)?0:scope.addata.staff_num_config.input_staff_size / scope.addata.staff_num_config.staff_size,
                prospectAngle = scope.seekResultsAngle(startAngle,totalAngle,ratio);
            //console.log("ratio：" + ratio);
            // if(ratio){
                // 前景线条动态
              // scope.ctx.beginPath();
              // scope.ctx.lineWidth = lineWidth;
              // scope.ctx.strokeStyle = "rgba(255, 255, 255, 1)";
              // scope.ctx.lineCap="round";
              // scope.ctx.arc(canvas_size/2,canvas_size/2,canvas_radius,startAngle,prospectAngle,false);
              // scope.ctx.stroke();
            // }
            
            if(ratio == 1){
          
              //有员工并且录入满
              scope.ctx.font= desTextSize + "px Arial";
              scope.ctx.fillStyle = "rgba(191,255,255, 1)";
              scope.ctx.textAlign="center";
              scope.ctx.fillText("全部录入模板",canvas_size/2,desTextYPos);

              scope.ctx.font="30px Arial";
              scope.ctx.fillStyle = "rgba(255,255,255, 1)";
              scope.ctx.textAlign="center";
              scope.ctx.fillText(scope.addata.staff_num_config.input_staff_size+"/"+scope.addata.staff_num_config.staff_size,canvas_size/2,mainTextYPos);

             

              
            }else if(ratio == 0){
              
              //没有员工录入 有员工 活在是 没员工
              if(scope.addata.staff_num_config.staff_size){
                  scope.ctx.font= desTextSize + "px Arial";
                  scope.ctx.fillStyle = "rgba(191,255,255, 1)";
                  scope.ctx.textAlign="center";
                  scope.ctx.fillText("暂无录入模板",canvas_size/2,desTextYPos);

                  scope.ctx.font="30px Arial";
                  scope.ctx.fillStyle = "rgba(255,255,255, 1)";
                  scope.ctx.textAlign="center";
                  scope.ctx.fillText(scope.addata.staff_num_config.input_staff_size+"/"+scope.addata.staff_num_config.staff_size,canvas_size/2,mainTextYPos);

               


              }else{
                  scope.ctx.font= desTextSize + "px Arial";
                  scope.ctx.fillStyle = "rgba(191,255,255, 1)";
                  scope.ctx.textAlign="center";
                  scope.ctx.fillText("暂无员工",canvas_size/2,desTextYPos);

                  speedFlag = 1;

                  scope.loadImage('img/zwlr.png',function(imgObj){
                    (speedFlag == 1) && scope.ctx.drawImage(imgObj, canvas_size / 2 - iconSize / 2, canvas_size / 2 - iconSize / 1.6, iconSize, iconSize);
                  });
              }
              
            }else{
              //有员工录入没有满
              scope.ctx.font= desTextSize + "px Arial";
              scope.ctx.fillStyle = "rgba(191,255,255, 1)";
              scope.ctx.textAlign="center";
              scope.ctx.fillText("已录入模版人数",canvas_size/2,desTextYPos);

              scope.ctx.font="30px Arial";
              scope.ctx.fillStyle = "rgba(255,255,255, 1)";
              scope.ctx.textAlign="center";
              scope.ctx.fillText(scope.addata.staff_num_config.input_staff_size+"/"+scope.addata.staff_num_config.staff_size,canvas_size/2,mainTextYPos);

            }

        },true);


        // scope.$watch('addata.staff_num_config', function(newValue, oldValue) {

          
        //     if (newValue == undefined){
              

        //         scope.addata.staff_num_config = {
        //           staff_size : oldValue.staff_size,
        //           input_staff_size : oldValue.input_staff_size
        //         }

        //       return
        //     }

        //     speedFlag = false;
           
        //     //清屏
          

        //     scope.ctx.clearRect(0,0,canvas_size,canvas_size);


            

        //     // 背景线条
        //     scope.ctx.beginPath();
        //     scope.ctx.lineWidth = lineWidth;
        //     scope.ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
        //     scope.ctx.lineCap="round";
        //     scope.ctx.arc(canvas_size/2,canvas_size/2,canvas_radius,startAngle,endAngle,false);
        //     scope.ctx.stroke();

        //     // 计算比率
        //     var 
        //         ratio = (scope.addata.staff_num_config.staff_size == 0)?0:scope.addata.staff_num_config.input_staff_size / scope.addata.staff_num_config.staff_size,
        //         prospectAngle = scope.seekResultsAngle(startAngle,totalAngle,ratio);

        //     if(ratio){
        //         // 前景线条动态
        //       scope.ctx.beginPath();
        //       scope.ctx.lineWidth = lineWidth;
        //       scope.ctx.strokeStyle = "rgba(255, 255, 255, 1)";
        //       scope.ctx.lineCap="round";
        //       scope.ctx.arc(canvas_size/2,canvas_size/2,canvas_radius,startAngle,prospectAngle,false);
        //       scope.ctx.stroke();
        //     }
            
        //     if(ratio == 1){
          
        //       //有员工并且录入满
        //       scope.ctx.font= desTextSize + "px Arial";
        //       scope.ctx.fillStyle = "rgba(191,255,255, 1)";
        //       scope.ctx.textAlign="center";
        //       scope.ctx.fillText("全部录入模版",canvas_size/2,desTextYPos);

        //       speedFlag = 0;

        //       scope.loadImage('img/qblr.png',function(imgObj){
        //         (speedFlag == 0) && scope.ctx.drawImage(imgObj, canvas_size / 2 - iconSize / 2, canvas_size / 2 - iconSize / 1.6, iconSize, iconSize);
        //       });
        //     }else if(ratio == 0){
              
        //       //没有员工录入
        //       scope.ctx.font= desTextSize + "px Arial";
        //       scope.ctx.fillStyle = "rgba(191,255,255, 1)";
        //       scope.ctx.textAlign="center";
        //       scope.ctx.fillText("暂无录入模版",canvas_size/2,desTextYPos);

        //       speedFlag = 1;

        //       scope.loadImage('img/zwlr.png',function(imgObj){
        //         (speedFlag == 1) && scope.ctx.drawImage(imgObj, canvas_size / 2 - iconSize / 2, canvas_size / 2 - iconSize / 1.6, iconSize, iconSize);
        //       });
        //     }else{
        //       //有员工录入没有满
        //       scope.ctx.font= desTextSize + "px Arial";
        //       scope.ctx.fillStyle = "rgba(191,255,255, 1)";
        //       scope.ctx.textAlign="center";
        //       scope.ctx.fillText("已录模版人数",canvas_size/2,desTextYPos);

        //       scope.ctx.font="30px Arial";
        //       scope.ctx.fillStyle = "rgba(255,255,255, 1)";
        //       scope.ctx.textAlign="center";
        //       scope.ctx.fillText(scope.addata.staff_num_config.input_staff_size+"/"+scope.addata.staff_num_config.staff_size,canvas_size/2,mainTextYPos);

        //     }

        // },true);
        


      }
    }
  }])

  .directive('ionParallaxContentLogin', ['$ionicScrollDelegate', '$location', '$timeout', function($ionicScrollDelegate, $location, $timeout) {
    return {
      restrict: 'E',
      templateUrl: local_resource+'js/directives/ionParallaxContentLogin.html',
      transclude: true,
      replace: true,
      scope: false,
      controller: function($scope) {
        // 初始化swiper索引为0
        $scope.activeIndex = 0;
        // swiper 配置
        $scope.options = {
          initialSlide: 0,
          slidesPerView: 1,
          paginationClickable: true,
          spaceBetween: 0,
          loop: true,
          centeredSlides: true,
          autoplay: 3000,
          autoplayDisableOnInteraction: false
        };
      },
      link: function(scope, element, attr) {

        // console.log(scope.options);

        //初始化swiper数据
        scope.swiper = JSON.parse(attr.swiperData);

        var isSetFunc = false;

        scope.data = {
        };

        scope.$watch('data.slider',function(){
          if(scope.data.slider && !isSetFunc){
            isSetFunc = true;


            scope.data.slider.on('SlideChangeStart', function(swiper) {
              $timeout(function() {
                scope.activeIndex = swiper.slides[swiper.activeIndex].getAttribute('data-swiper-slide-index');
                // console.log(swiper.slides[swiper.activeIndex].getAttribute('data-swiper-slide-index'));
                // console.log(scope.activeIndex);
              }, 0);

            });
          }
        });



        var oldTop = 0;
        var ionSlidesBox = $('#ionSlidesBox');
        var ionSlidesBoxHeight = ionSlidesBox.height();
        var swiperWrapper = ionSlidesBox.find('.swiper-container');
        var fixedIonSlidesBox = $('.fixedIonSlidesBox');
        var oldScaleVal = 0;
        var isAutoPlay = true;


        scope.$on('$ionicView.afterEnter', function(){
          //进入之后
          if (!isAutoPlay) {
            isAutoPlay = true;
            scope.data.slider && scope.data.slider.startAutoplay();
          }
        });



        scope.$on('$ionicView.beforeLeave', function(){
          //离开之前

          if (isAutoPlay) {
            isAutoPlay = false;
            scope.data.slider && scope.data.slider.stopAutoplay();
          }
        });


        scope.ParallaxScroll = function() {
				return;
          var newTop = $ionicScrollDelegate.getScrollPosition().top;

          if (newTop < 0) {
            var setScaleVal = (Math.abs(newTop) / ionSlidesBoxHeight + 1).toFixed(4);

            if (setScaleVal != oldScaleVal) {

              fixedIonSlidesBox.css({
                '-webkit-Transform': 'scale(' + setScaleVal + ',' + setScaleVal + ')',
                'display': 'block'
              });

              if (isAutoPlay) {
                isAutoPlay = false;

                swiperWrapper.css({
                  'opacity': 0
                });

                scope.data.slider && scope.data.slider.stopAutoplay();
              }

              oldScaleVal = setScaleVal;
            }

          } else if (newTop >= 0) {
            if (!isAutoPlay) {
              isAutoPlay = true;

              swiperWrapper.css({
                'opacity': 1
              });
              fixedIonSlidesBox.css({
                '-webkit-Transform': 'scale(1,1)',
                'display': 'none'
              });

              scope.data.slider && scope.data.slider.startAutoplay();
            }
          }

          oldTop = newTop;
        };

      }
    }
  }])

  .directive('parallaxToogleToView',['$timeout','$ionicHistory',function($timeout, $ionicHistory) {

    return {
      restrict: 'A',
      compile: function(element, attr) {

        var ionNavBar = $('ion-nav-bar');
        var isAfter = null;

        var ionNavBarHeight = (ionic.Platform.platform() == 'ios')?'64':'44';

        return function($scope, $element, $attr) {
          $scope.$on('$ionicView.beforeEnter', function() {


            //进入之前
            // console.log($ionicHistory.currentView())
            // console.log($('ion-view[nav-view="active"]'));


            if($('ion-view[nav-view="active"]').length == 0){
              //直接刷新首页的情况
                console.log('直接刷新首页的情况');
            }else{
              //if(window.parallaxViewObj[$('ion-view[nav-view="active"]').attr("state")]){

              if(window.parallaxViewObj[$('ion-view[nav-view="active"]').attr("title")] || window.parallaxViewObj[$('ion-view[nav-view="active"] ion-content[ng-controller]').attr("title")]){


                var imitateBarStr = (ionic.Platform.platform() == 'ios')?
                '<div class="imitateBar" style="position: absolute;top: 0;left: 0; right: 0; height: '+ionNavBarHeight+'px; background: #53afff; background-image: linear-gradient(0deg,#ddd,#ddd 50%,transparent 50%); background-position: bottom; background-size: 100% 1px; background-repeat: no-repeat;"><div style="width: auto; height: 44px; margin-left:10px; margin-right: 10px; margin-top: 20px; line-height: 44px; position: relative; text-align: center;text-overflow: ellipsis;white-space: nowrap;font-size: 17px;font-weight: 500; color: white"><button class="button back-button buttons button-clear button-light button-icon ion-ios-arrow-left header-item" style="position: absolute;top: 1px; left: -4px;font-size: 24px"><span class="back-text" style="transform: translate3d(0px, 0px, 0px);font-size: 24px"></span></button>'+$('ion-nav-bar div[nav-bar="active"] div.title').text()+'</div></div>'
                  :
                '<div class="imitateBar" style="position: absolute;top: 0;left: 0; right: 0; height: '+ionNavBarHeight+'px; background: #53afff; background-image: linear-gradient(0deg,#ddd,#ddd 50%,transparent 50%); background-position: bottom; background-size: 100% 1px; background-repeat: no-repeat;"><div style="width: auto; height: 44px;  margin-left:10px; margin-right: 10px; line-height: 44px; position: relative; text-align: center;text-overflow: ellipsis;white-space: nowrap;font-size: 19px;font-weight: 500; color: white"><button class="button back-button buttons button-clear button-light button-icon ion-ios-arrow-left header-item" style="position: absolute;top: 1px; left: -4px;font-size: 24px"><span class="back-text" style="transform: translate3d(0px, 0px, 0px);font-size: 24px"></span></button>'+$('ion-nav-bar div[nav-bar="active"] div.title').text()+'</div></div>';

                $('ion-view[nav-view="active"]').append(imitateBarStr);
                $('ion-view[nav-view="active"]').find('ion-content').css('top',ionNavBarHeight+'px');
                $('ion-nav-bar').css('display','none');

                //保存进入之后要修改的ion-view
                isAfter = window.parallaxViewObj[$('ion-view[nav-view="active"]').attr("title")].controllerName;

                if(!isAfter){
                  isAfter = window.parallaxViewObj[$('ion-view[nav-view="active"] ion-content[ng-controller]').attr("title")].controllerName;
                }

              }else{
                  // if($('ion-view[ng-controller="userHomeCtrl"] ion-content')){
                  //     $('ion-nav-bar').css('display','none');
                  //     $('ion-view[ng-controller="userHomeCtrl"] ion-content').css('top',0);
                  // }
              }
            }


          });

          $scope.$on('$ionicView.afterEnter', function(){
            //进入之后
            // debugger;
            if(isAfter){
              // console.log($ionicHistory.currentView())
              // console.log($('ion-view[nav-view="active"]'));

              $('ion-nav-bar').css('display','');

              var view = $('ion-view[ng-controller="'+ isAfter +'"]');
              view.find('ion-content').css('top','');
              $('.imitateBar').remove();


              isAfter = null;
            }else{
                $('ion-nav-bar').css('display','');
                $('ion-view[ng-controller="userHomeCtrl"] ion-content').css('top','');
            }

          })



          $scope.$on('$ionicView.beforeLeave', function(){
            //离开之前

            // console.log($ionicHistory.currentView())
            // console.log($('ion-view[nav-view="active"]'));

              // debugger;
            if(window.parallaxViewObj[$ionicHistory.currentView().title]){

              $('ion-nav-bar').css('display','none');

              $('ion-content[on-scroll]').css('top','0');

              var view = $('ion-view[ng-controller="'+ window.parallaxViewObj[$ionicHistory.currentView().title].controllerName +'"]');
              var isView = true;
              if(view.length == 0){
                view = $('ion-content[ng-controller="'+ window.parallaxViewObj[$ionicHistory.currentView().title].controllerName +'"]');
                isView = false;
              }
              var imitateBarStr = (ionic.Platform.platform() == 'ios')?
              '<div class="imitateBar" style="position: absolute;top: 0;left: 0; right: 0; height: '+(ionNavBarHeight)+'px; background: #53afff; background: #53afff; background-image: linear-gradient(0deg,#ddd,#ddd 50%,transparent 50%); background-position: bottom; background-size: 100% 1px; background-repeat: no-repeat;"><div style="width: auto; height: 44px;  margin-left:10px; margin-right: 10px; margin-top: 20px; line-height: 44px; position: relative; text-align: center;text-overflow: ellipsis;white-space: nowrap;font-size: 17px;font-weight: 500; color: white"><button class="button back-button buttons button-clear button-light button-icon ion-ios-arrow-left header-item" style="position: absolute;top: 1px; left: -4px;font-size: 24px"><span class="back-text" style="transform: translate3d(0px, 0px, 0px);font-size: 24px"></span></button>'+$ionicHistory.currentView().title+'</div></div>'
                :
              '<div class="imitateBar" style="position: absolute;top: 0;left: 0; right: 0; height: '+(ionNavBarHeight)+'px; background: #53afff; background: #53afff; background-image: linear-gradient(0deg,#ddd,#ddd 50%,transparent 50%); background-position: bottom; background-size: 100% 1px; background-repeat: no-repeat;"><div style="width: auto; height: 44px;  margin-left:10px; margin-right: 10px; line-height: 44px; position: relative; text-align: center;text-overflow: ellipsis;white-space: nowrap;font-size: 19px;font-weight: 500; color: white"><button class="button back-button buttons button-clear button-light button-icon ion-ios-arrow-left header-item" style="position: absolute;top: 1px; left: -4px;font-size: 24px"><span class="back-text" style="transform: translate3d(0px, 0px, 0px);font-size: 24px"></span></button>'+$ionicHistory.currentView().title+'</div></div>';
              if(isView){
                view.append(imitateBarStr);
              }else{
                view.parent('ion-view').append(imitateBarStr);
              }




            }
          })


          $scope.$on('$ionicView.afterLeave', function(){
            //离开之后

            // console.log($ionicHistory.currentView())
            // console.log($('ion-view[nav-view="active"]'));

            if(window.parallaxViewObj[$ionicHistory.currentView().title]){
              $('ion-nav-bar').css('display','');

              //重置首页可以设置top高度，防止意外，其实可以不用
              $('ion-content[on-scroll]').css('top','');

              var view = $('ion-view[ng-controller="'+ window.parallaxViewObj[$ionicHistory.currentView().title].controllerName +'"]');

              if(view.length == 0){
                view = $('ion-content[ng-controller="'+ window.parallaxViewObj[$ionicHistory.currentView().title].controllerName +'"]').parent('ion-view');

              }

              $('.imitateBar').remove();
            }


          })


        }
      }
    };
  }])

 .directive('parallaxToogleToViewCommon',['$timeout','$ionicHistory',function($timeout, $ionicHistory) {

    return {
      restrict: 'A',
      compile: function(element, attr) {

        var ionNavBar = $('ion-nav-bar');
        var isAfter = null;

        var ionNavBarHeight = (ionic.Platform.platform() == 'ios')?'64':'44';

        return function($scope, $element, $attr) {
          $scope.$on('$ionicView.beforeEnter', function() {

           

            //进入之前
            if($('ion-view[nav-view="active"]').length == 0){
              //直接刷新首页的情况
                console.log('直接刷新首页的情况');
            }else{


              if(window.parallaxViewObj[$('ion-nav-view[nav-view="active"] ion-view[nav-view="active"]').attr("title")] || window.parallaxViewObj[$('ion-nav-view[nav-view="active"] ion-view[nav-view="active"] ion-content[ng-controller]').attr("title")]){

/*
                var imitateBarStr = (ionic.Platform.platform() == 'ios')?
                '<div class="imitateBar" style="position: absolute;top: 0;left: 0; right: 0; height: '+ionNavBarHeight+'px; background: #53afff; background-image: linear-gradient(0deg,#ddd,#ddd 50%,transparent 50%); background-position: bottom; background-size: 100% 1px; background-repeat: no-repeat;"><div style="width: auto; height: 44px; margin-left:10px; margin-right: 10px; margin-top: 20px; line-height: 44px; position: relative; text-align: center;text-overflow: ellipsis;white-space: nowrap;font-size: 17px;font-weight: 500; color: white"><button class="button back-button buttons button-clear button-light button-icon header-item" style="position: absolute;top: 1px; left: -4px;font-size: 24px"><span class="back-text" style="transform: translate3d(0px, 0px, 0px);font-size: 24px"></span></button>'+$('ion-nav-bar div[nav-bar="active"] div.title').text()+'</div></div>'
                  :
                '<div class="imitateBar" style="position: absolute;top: 0;left: 0; right: 0; height: '+ionNavBarHeight+'px; background: #53afff; background-image: linear-gradient(0deg,#ddd,#ddd 50%,transparent 50%); background-position: bottom; background-size: 100% 1px; background-repeat: no-repeat;"><div style="width: auto; height: 44px;  margin-left:10px; margin-right: 10px; line-height: 44px; position: relative; text-align: center;text-overflow: ellipsis;white-space: nowrap;font-size: 19px;font-weight: 500; color: white"><button class="button back-button buttons button-clear button-light button-icon header-item" style="position: absolute;top: 1px; left: -4px;font-size: 24px"><span class="back-text" style="transform: translate3d(0px, 0px, 0px);font-size: 24px"></span></button>'+$('ion-nav-bar div[nav-bar="active"] div.title').text()+'</div></div>';

                $('ion-nav-view[nav-view="active"] ion-view[nav-view="active"]').append(imitateBarStr);
                $('ion-nav-view[nav-view="active"] ion-view[nav-view="active"]').find('ion-content').css('top',ionNavBarHeight+'px');
                $('ion-nav-bar').css('display','none');
*/

			  var imitateBarStr = $('div[nav-bar="active"]').clone().addClass('imitateBar');
  				imitateBarStr.find('span').css("opacity", "1");
  				imitateBarStr.find('button').css("opacity", "1");
				imitateBarStr.find('div').css("opacity", "1");
				imitateBarStr.find('.title.title-center.header-item').css("transform","translate3d(0px, 0px, 0px)");
				imitateBarStr.find('.title.title-center.header-item').css("-webkit-transform","translate3d(0px, 0px, 0px)");


				$('ion-nav-view[nav-view="active"] ion-view[nav-view="active"]').append(imitateBarStr[0]);
                $('ion-nav-view[nav-view="active"] ion-view[nav-view="active"]').find('ion-content').css('top',ionNavBarHeight+'px');
                $('ion-nav-bar').css('display','none');


                //保存进入之后要修改的ion-view
                isAfter = window.parallaxViewObj[$('ion-nav-view[nav-view="active"] ion-view[nav-view="active"]').attr("title")].controllerName;

                if(!isAfter){
                  isAfter = window.parallaxViewObj[$('ion-nav-view[nav-view="active"] ion-view[nav-view="active"] ion-content[ng-controller]').attr("title")].controllerName;
                }

              }else if($('ion-view[nav-view="active"]').attr("title") == "找回密码"){
                  // debugger;
                  var imitateBarStr = $('div[nav-bar="active"]').clone().addClass('imitateBar');
                  imitateBarStr.find('span').css("opacity", "1");
                  imitateBarStr.find('button').css("opacity", "1");
                  imitateBarStr.find('div').css("opacity", "1");
                  imitateBarStr.find('.title.title-center.header-item').css("transform","translate3d(0px, 0px, 0px)");
                  imitateBarStr.find('.title.title-center.header-item').css("-webkit-transform","translate3d(0px, 0px, 0px)");


                  $('ion-view[title="找回密码"]').append(imitateBarStr[0]);
                  $('ion-view[title="找回密码"]').find('ion-content').css('top',ionNavBarHeight+'px');
                  $('ion-nav-bar').css('display','none');


                  //保存进入之后要修改的ion-view
                  isAfter = window.parallaxViewObj["找回密码"].controllerName;


              }else{

/*
					var imitateBarStr = (ionic.Platform.platform() == 'ios')?
					'<div class="imitateBar" style="position: absolute;top: 0;left: 0; right: 0; height: '+ionNavBarHeight+'px; background: #53afff; background-image: linear-gradient(0deg,#ddd,#ddd 50%,transparent 50%); background-position: bottom; background-size: 100% 1px; background-repeat: no-repeat;"><div style="width: auto; height: 44px; margin-left:10px; margin-right: 10px; margin-top: 20px; line-height: 44px; position: relative; text-align: center;text-overflow: ellipsis;white-space: nowrap;font-size: 17px;font-weight: 500; color: white"><button class="button back-button buttons button-clear button-light button-icon header-item" style="position: absolute;top: 1px; left: -4px;font-size: 24px"><span class="back-text" style="transform: translate3d(0px, 0px, 0px);font-size: 24px"></span></button>'+$('ion-nav-bar div[nav-bar="active"] div.title').text()+'</div></div>'
					  :
					'<div class="imitateBar" style="position: absolute;top: 0;left: 0; right: 0; height: '+ionNavBarHeight+'px; background: #53afff; background-image: linear-gradient(0deg,#ddd,#ddd 50%,transparent 50%); background-position: bottom; background-size: 100% 1px; background-repeat: no-repeat;"><div style="width: auto; height: 44px;  margin-left:10px; margin-right: 10px; line-height: 44px; position: relative; text-align: center;text-overflow: ellipsis;white-space: nowrap;font-size: 19px;font-weight: 500; color: white"><button class="button back-button buttons button-clear button-light button-icon header-item" style="position: absolute;top: 1px; left: -4px;font-size: 24px"><span class="back-text" style="transform: translate3d(0px, 0px, 0px);font-size: 24px"></span></button>'+$('ion-nav-bar div[nav-bar="active"] div.title').text()+'</div></div>';
	*/



			  var imitateBarStr = $('div[nav-bar="active"]').clone().addClass('imitateBar');
  				imitateBarStr.find('span').css("opacity", "1");
  				imitateBarStr.find('button').css("opacity", "1");
				imitateBarStr.find('div').css("opacity", "1");
				imitateBarStr.find('.title.title-center.header-item').css("transform","translate3d(0px, 0px, 0px)");
				imitateBarStr.find('.title.title-center.header-item').css("-webkit-transform","translate3d(0px, 0px, 0px)");



					$('ion-nav-view[nav-view="active"] ion-view[nav-view="active"]').append(imitateBarStr[0]);
					$('ion-nav-view[nav-view="active"] ion-view[nav-view="active"]').find('ion-content').css('top',ionNavBarHeight+'px');
					$('ion-nav-bar').css('display','none');



              }
            }


          });

          $scope.$on('$ionicView.afterEnter', function(){
				console.log('afterEnter');
            //进入之后
            // debugger;
            if(isAfter){
              // console.log($ionicHistory.currentView())
              // console.log($('ion-view[nav-view="active"]'));

              $('ion-nav-bar').css('display','');

              var view = $('ion-view[ng-controller="'+ isAfter +'"]');
              view.find('ion-content').css('top','');
              $('.imitateBar').remove();


              isAfter = null;
            }else{
                $('ion-nav-bar').css('display','');
                $('ion-view[ng-controller="userHomeCtrl"] ion-content').css('top','');
            }

          })

          $scope.$on('$ionicView.beforeLeave', function(){
			console.log('beforeLeave');
            //离开之前

              // debugger;
            if(window.parallaxViewObj[$ionicHistory.currentView().title]){

              $('ion-nav-bar').css('display','none');

              if($('ion-content[on-scroll]').length){
                  $('ion-content[on-scroll]').css('top','0');
              }else{

                  $('ion-content[overflow-scroll]').css('top','0');
              }



              var view = $('ion-view[ng-controller="'+ window.parallaxViewObj[$ionicHistory.currentView().title].controllerName +'"]');
              var isView = true;
              if(view.length == 0){
                view = $('ion-content[ng-controller="'+ window.parallaxViewObj[$ionicHistory.currentView().title].controllerName +'"]');
                isView = false;
              }

			  /*

              var imitateBarStr = (ionic.Platform.platform() == 'ios')?
              '<div class="imitateBar" style="position: absolute;top: 0;left: 0; right: 0; height: '+(ionNavBarHeight)+'px; background: #53afff; background: #53afff; background-image: linear-gradient(0deg,#ddd,#ddd 50%,transparent 50%); background-position: bottom; background-size: 100% 1px; background-repeat: no-repeat;"><div style="width: auto; height: 44px;  margin-left:10px; margin-right: 10px; margin-top: 20px; line-height: 44px; position: relative; text-align: center;text-overflow: ellipsis;white-space: nowrap;font-size: 17px;font-weight: 500; color: white"><button class="button back-button buttons button-clear button-light button-icon  header-item" style="position: absolute;top: 1px; left: -4px;font-size: 24px"><span class="back-text" style="transform: translate3d(0px, 0px, 0px);font-size: 24px"></span></button>'+$ionicHistory.currentView().title+'</div></div>'
                :
              '<div class="imitateBar" style="position: absolute;top: 0;left: 0; right: 0; height: '+(ionNavBarHeight)+'px; background: #53afff; background: #53afff; background-image: linear-gradient(0deg,#ddd,#ddd 50%,transparent 50%); background-position: bottom; background-size: 100% 1px; background-repeat: no-repeat;"><div style="width: auto; height: 44px;  margin-left:10px; margin-right: 10px; line-height: 44px; position: relative; text-align: center;text-overflow: ellipsis;white-space: nowrap;font-size: 19px;font-weight: 500; color: white"><button class="button back-button buttons button-clear button-light button-icon header-item" style="position: absolute;top: 1px; left: -4px;font-size: 24px"><span class="back-text" style="transform: translate3d(0px, 0px, 0px);font-size: 24px"></span></button>'+$ionicHistory.currentView().title+'</div></div>';

			  */
			  var imitateBarStr = $('div[nav-bar="stage"]').clone().addClass('imitateBar');
  				imitateBarStr.find('span').css("opacity", "1");
  				imitateBarStr.find('button').css("opacity", "1");
				imitateBarStr.find('div').css("opacity", "1");
				imitateBarStr.find('.title.title-center.header-item').css("transform","translate3d(0px, 0px, 0px)");
				imitateBarStr.find('.title.title-center.header-item').css("-webkit-transform","translate3d(0px, 0px, 0px)");


              if(isView){
                view.append(imitateBarStr[0]);
              }else{
                view.parent('ion-view').append(imitateBarStr[0]);
              }
            }
          })


          $scope.$on('$ionicView.afterLeave', function(){
				console.log('afterLeave');
            //离开之后

            // console.log($ionicHistory.currentView())
            // console.log($('ion-view[nav-view="active"]'));

            if(window.parallaxViewObj[$ionicHistory.currentView().title]){
              $('ion-nav-bar').css('display','');

              //重置首页可以设置top高度，防止意外，其实可以不用
              $('ion-content[on-scroll]').css('top','');

              var view = $('ion-view[ng-controller="'+ window.parallaxViewObj[$ionicHistory.currentView().title].controllerName +'"]');

              if(view.length == 0){
                view = $('ion-content[ng-controller="'+ window.parallaxViewObj[$ionicHistory.currentView().title].controllerName +'"]').parent('ion-view');

              }

              $('.imitateBar').remove();
            }


          })


        }
      }
    };
  }])


.directive('systemSettingToViewCommon',['$timeout','$ionicHistory',function($timeout, $ionicHistory) {

    return {
      restrict: 'A',
      compile: function(element, attr) {

        var ionNavBar = $('ion-nav-bar');
        var isAfter = null;

        var ionNavBarHeight = (ionic.Platform.platform() == 'ios')?'64':'44';

        return function($scope, $element, $attr) {
          $scope.$on('$ionicView.beforeEnter', function() {
          
            //进入之前
            if($('ion-view[nav-view="active"]').length == 0){
              //直接刷新首页的情况
             
            }else{

                var _title = $('ion-nav-view[nav-view="active"] ion-view[nav-view="active"]').attr("title");

                if(!_title){
                  _title = $('ion-nav-view[nav-view="active"] ion-view[nav-view="active"]').attr("ng-controller");
                }
              
              if({
                "系统设置" : 1,
                "门禁管理" : 1,
                "协同办公" : 1,
                "essMyTravelingCtrl" : 1,
                "essMyApprovalTravelingCtrl" : 1,
                "homeMessageContentCtrl" : 1,
                "homeMessageDetailCtrl" : 1
              }[_title]){
                // if(_title == "系统设置" || _title == "门禁管理" || _title == "协同办公"){
/*
                var imitateBarStr = (ionic.Platform.platform() == 'ios')?
                '<div class="imitateBar" style="position: absolute;top: 0;left: 0; right: 0; height: '+ionNavBarHeight+'px; background: #53afff; background-image: linear-gradient(0deg,#ddd,#ddd 50%,transparent 50%); background-position: bottom; background-size: 100% 1px; background-repeat: no-repeat;"><div style="width: auto; height: 44px; margin-left:10px; margin-right: 10px; margin-top: 20px; line-height: 44px; position: relative; text-align: center;text-overflow: ellipsis;white-space: nowrap;font-size: 17px;font-weight: 500; color: white"><button class="button back-button buttons button-clear button-light button-icon header-item" style="position: absolute;top: 1px; left: -4px;font-size: 24px"><span class="back-text" style="transform: translate3d(0px, 0px, 0px);font-size: 24px"></span></button>'+$('ion-nav-bar div[nav-bar="active"] div.title').text()+'</div></div>'
                  :
                '<div class="imitateBar" style="position: absolute;top: 0;left: 0; right: 0; height: '+ionNavBarHeight+'px; background: #53afff; background-image: linear-gradient(0deg,#ddd,#ddd 50%,transparent 50%); background-position: bottom; background-size: 100% 1px; background-repeat: no-repeat;"><div style="width: auto; height: 44px;  margin-left:10px; margin-right: 10px; line-height: 44px; position: relative; text-align: center;text-overflow: ellipsis;white-space: nowrap;font-size: 19px;font-weight: 500; color: white"><button class="button back-button buttons button-clear button-light button-icon header-item" style="position: absolute;top: 1px; left: -4px;font-size: 24px"><span class="back-text" style="transform: translate3d(0px, 0px, 0px);font-size: 24px"></span></button>'+$('ion-nav-bar div[nav-bar="active"] div.title').text()+'</div></div>';

                $('ion-nav-view[nav-view="active"] ion-view[nav-view="active"]').append(imitateBarStr);
                $('ion-nav-view[nav-view="active"] ion-view[nav-view="active"]').find('ion-content').css('top',ionNavBarHeight+'px');
                $('ion-nav-bar').css('display','none');
*/

        var imitateBarStr = $('div[nav-bar="active"]').clone().addClass('imitateBar');
          imitateBarStr.find('span').css("opacity", "1");
          imitateBarStr.find('button').css("opacity", "1");
        imitateBarStr.find('div').css("opacity", "1");
        imitateBarStr.find('.title.title-center.header-item').css("transform","translate3d(0px, 0px, 0px)");
        imitateBarStr.find('.title.title-center.header-item').css("-webkit-transform","translate3d(0px, 0px, 0px)");


        $('ion-nav-view[nav-view="active"] ion-view[nav-view="active"]').append(imitateBarStr[0]);
                $('ion-nav-view[nav-view="active"] ion-view[nav-view="active"]').find('ion-content').css('top',ionNavBarHeight+'px');
                $('ion-nav-bar').css('display','none');
                var __title = $('ion-nav-view[nav-view="active"] ion-view[nav-view="active"]').attr("title");
                if(!__title){
                  
                  __title = $('ion-nav-view[nav-view="active"] ion-view[nav-view="active"]').attr("ng-controller");
                }

                //保存进入之后要修改的ion-view

                isAfter = window.parallaxViewObj[__title].controllerName;

                if(!isAfter){
                  isAfter = window.parallaxViewObj[$('ion-nav-view[nav-view="active"] ion-view[nav-view="active"] ion-content[ng-controller]').attr("title")].controllerName;
                }

              }
            }


          });

          $scope.$on('$ionicView.afterEnter', function(){
           
            //进入之后
            // debugger;
            if(isAfter){
              // console.log($ionicHistory.currentView())
              // console.log($('ion-view[nav-view="active"]'));

              $('ion-nav-bar').css('display','');

              var view = $('ion-view[ng-controller="'+ isAfter +'"]');
              view.find('ion-content').css('top','');
              $('.imitateBar').remove();


              isAfter = null;
            }else{
                $('ion-nav-bar').css('display','');
                $('ion-view[ng-controller="userHomeCtrl"] ion-content').css('top','');
            }

          })

          $scope.$on('$ionicView.beforeLeave', function(){
            
            //离开之前

              // debugger;
            if(window.parallaxViewObj[$ionicHistory.currentView().title]){

              $('ion-nav-bar').css('display','none');

              if($('ion-content[on-scroll]').length){
                  $('ion-content[on-scroll]').css('top','0');
              }else{

                  $('ion-content[overflow-scroll]').css('top','0');
              }



              var view = $('ion-view[ng-controller="'+ window.parallaxViewObj[$ionicHistory.currentView().title].controllerName +'"]');
              var isView = true;
              if(view.length == 0){
                view = $('ion-content[ng-controller="'+ window.parallaxViewObj[$ionicHistory.currentView().title].controllerName +'"]');
                isView = false;
              }

        /*

              var imitateBarStr = (ionic.Platform.platform() == 'ios')?
              '<div class="imitateBar" style="position: absolute;top: 0;left: 0; right: 0; height: '+(ionNavBarHeight)+'px; background: #53afff; background: #53afff; background-image: linear-gradient(0deg,#ddd,#ddd 50%,transparent 50%); background-position: bottom; background-size: 100% 1px; background-repeat: no-repeat;"><div style="width: auto; height: 44px;  margin-left:10px; margin-right: 10px; margin-top: 20px; line-height: 44px; position: relative; text-align: center;text-overflow: ellipsis;white-space: nowrap;font-size: 17px;font-weight: 500; color: white"><button class="button back-button buttons button-clear button-light button-icon  header-item" style="position: absolute;top: 1px; left: -4px;font-size: 24px"><span class="back-text" style="transform: translate3d(0px, 0px, 0px);font-size: 24px"></span></button>'+$ionicHistory.currentView().title+'</div></div>'
                :
              '<div class="imitateBar" style="position: absolute;top: 0;left: 0; right: 0; height: '+(ionNavBarHeight)+'px; background: #53afff; background: #53afff; background-image: linear-gradient(0deg,#ddd,#ddd 50%,transparent 50%); background-position: bottom; background-size: 100% 1px; background-repeat: no-repeat;"><div style="width: auto; height: 44px;  margin-left:10px; margin-right: 10px; line-height: 44px; position: relative; text-align: center;text-overflow: ellipsis;white-space: nowrap;font-size: 19px;font-weight: 500; color: white"><button class="button back-button buttons button-clear button-light button-icon header-item" style="position: absolute;top: 1px; left: -4px;font-size: 24px"><span class="back-text" style="transform: translate3d(0px, 0px, 0px);font-size: 24px"></span></button>'+$ionicHistory.currentView().title+'</div></div>';

        */
        var imitateBarStr = $('div[nav-bar="stage"]').clone().addClass('imitateBar');
          imitateBarStr.find('span').css("opacity", "1");
          imitateBarStr.find('button').css("opacity", "1");
        imitateBarStr.find('div').css("opacity", "1");
        imitateBarStr.find('.title.title-center.header-item').css("transform","translate3d(0px, 0px, 0px)");
        imitateBarStr.find('.title.title-center.header-item').css("-webkit-transform","translate3d(0px, 0px, 0px)");


              if(isView){
                view.append(imitateBarStr[0]);
              }else{
                view.parent('ion-view').append(imitateBarStr[0]);
              }
            }
          })


          $scope.$on('$ionicView.afterLeave', function(){
            
            //离开之后

            // console.log($ionicHistory.currentView())
            // console.log($('ion-view[nav-view="active"]'));

            if(window.parallaxViewObj[$ionicHistory.currentView().title]){
              $('ion-nav-bar').css('display','');

              //重置首页可以设置top高度，防止意外，其实可以不用
              $('ion-content[on-scroll]').css('top','');

              var view = $('ion-view[ng-controller="'+ window.parallaxViewObj[$ionicHistory.currentView().title].controllerName +'"]');

              if(view.length == 0){
                view = $('ion-content[ng-controller="'+ window.parallaxViewObj[$ionicHistory.currentView().title].controllerName +'"]').parent('ion-view');

              }

              $('.imitateBar').remove();
            }


          })


        }
      }
    };
  }])

.directive("ngLoadIndexImage", ['$timeout', function () {
    return {
      restrict: "A",
      link : function (scope, element, attrs) {

        $(element).attr("src",local_resource + "img/loading.png");

        var img = $('<img />');

        var loadFunc = function (ev) {

          $(element).attr("src",$(ev.target).attr("src"));
          scope.$parent.imgLoading(attrs.ngLoadIndex,ev);
          img.off('load',loadFunc);
        }

        img.on('load',loadFunc);

        img.attr("src",attrs.ngLoadSrc);


      }
    }
  }])
.directive("updateImagesVertical", ['$timeout', 'zoomSlider', '$ionicActionSheet', function($timeout, zoomSlider, $ionicActionSheet) {
    return {
      restrict: "E",
      replace: true,
      scope: {
        data: '=',
        actionType: '=',
      },
      template: "<div class='update-image-container'>"+
                "<div class='update-image-content'>"+
                "<div ng-repeat='imgItem in imagesListArr track by $index' class='update-image-item' on-tap='zoomSlider.show({data:imagesListArr, index:$index})' on-hold='holdHandle($event,imgItem)'><img ng-show='delArr.indexOf(imgItem)>=0' on-tap='deleteImage($event,imgItem)' class='update-image-item_del_img' src='" + local_resource + "img/del.png' /><img class='update-image-item_img' ng-src='{{imgItem}}'></div>"+
                "<div class='update-image-item' ng-show='imagesListArr.length < 20 && !browsemode' class='select_images' on-tap='select_images()'><img class='update-image-item_img' src='" + local_resource + "img/addimg.png' ></div>"+
                "</div>"+
                "</div>",
      link : function (scope, element, attrs) {
        scope.imagesListArr = [];
        scope.delArr = [];

        scope.zoomSlider = zoomSlider;

		    scope.browsemode = false;

        if(attrs.browsemode && attrs.browsemode == 'true'){
            scope.browsemode = true;
        }

        scope.$watch('data',function(n,o){
            selectImagesCallback(scope.data);
        })

        /* modify by kevin at 2018-05-17 begin */ 
        //打开相机
        scope.takePhoto = function(){
          try {
            if(scope.data.split(",").length<=9){
              $timeout(function () {
                  navigator.camera.getPicture(function(uri) {
                      if(uri!=""&&uri!=null&&typeof(uri)!='undefined'){
                          modifyScopeData(uri);
                      }
                  }, function() {
                      //alert('cancel or failure');
                  }, {
                      allowEdit: false,
                      destinationType: Camera.DestinationType.FILE_URI,
                      quality: 100,
                      targetHeight: 800,
                      targetWidth: 800,
                      correctOrientation: true
                  });
              },250)
            }
            } catch (e) {
              //alert(e.message);
            }
        }

        //打开相册
        scope.takePicture = function(){
          try {
            var imagesLength = 0;
            if(scope.data.length > 0&&scope.data!=""){
              imagesLength = scope.data.split(',').length;
            }
            $timeout(function () {
              var ft = new FileTransfer();
              ft.getAssetImage(imagesLength, function(msg) {
                if (msg != null && typeof(msg) != 'undefined' && msg != "") {
                    $(element).find('li.img-item').removeClass('img-item');
                    modifyScopeData(msg);
                }
              })
            },250);
          } catch (e) {
            //alert(e.message);
          }
        }

        scope.select_images = function() {
          if(!scope.actionType || scope.actionType == 0){
            var hideSheet = $ionicActionSheet.show({
              buttons: [
                {
                  text: '拍照'
                }, {
                  text: '从手机相册选择'
                }
              ],
              titleText: '选择上传图片方式',
              cancelText: '取消',
              cancel: function() {
                // add cancel code..
              },
              buttonClicked: function(index) {
                if (index == 0) {
                  scope.takePhoto();
                  return true;
                } else if (index == 1) {
                  scope.takePicture();
                  return true;
                }
  
                return true;
              }
            });
          }else if(scope.actionType == 1){
            scope.takePhoto();
          }else if(scope.actionType == 2){
            scope.takePicture();
          }
        };

        scope.deleteImage = function(ev, imgItem) {
          var index = scope.imagesListArr.indexOf(imgItem);
          if(index>=0){
            scope.imagesListArr.splice(index, 1);
          }
        };


        scope.holdHandle = function(ev,imgItem) {
          var index = scope.delArr.indexOf(imgItem);
          if(index>=0){
            scope.delArr.splice(index, 1);
          }else{
            scope.delArr.push(imgItem);
          }
        };

        /* modify by kevin at 2018-05-17 end */

        



        function modifyScopeData(str) {
            $timeout(function() {
            if (str[str.length - 1] == ',') {
                str = str.substring(0, str.length)
            }
            var newArrayList = null;
            if(str!=""){
                newArrayList = str.split(",");
            }else{
                newArrayList = [];
                return;
            }

            var _new_data_str = "";
            for(var i = 0,len = newArrayList.length;i<len;i++){
                _new_data_str = _new_data_str + ","+newArrayList[i]+'?dt='+new Date().getTime();
            }
            if(scope.data==""||scope.data.length==0){
                scope.data = str;
            }else{
                scope.data = scope.data + _new_data_str;
            }
            }, 0);
        }

        function selectImagesCallback(str) {
          $timeout(function() {
            if(str!=""&&typeof(str)!='undefined'){
                scope.imagesListArr = str.split(",");
            }else{
                scope.imagesListArr = [];
            }
          }, 0);
        }
      }
    }
  }])


  .directive("updateImages", ['$timeout', 'zoomSlider', '$ionicActionSheet', function($timeout, zoomSlider, $ionicActionSheet) {
    return {
      restrict: "E",
      replace: true,
      scope: {
        data: '=',
        actionType: '=',
        hideadd: '@',
        customdelicon: '@',
        customaddicon: '@',  
        customsize: '@' // 示例 "数量,宽度,右边距" 右边距px单位
      },
      template: "<div class='fufu-update-images fufu-update-img4'>" +
      "<style ng-if='customsizedata' type='text/css'>.fufu-update-images ul li{width: {{customsizedata.itemWidth}}px;height: {{customsizedata.itemWidth}}px;margin-right: {{customsizedata.d[2]}}px;margin-bottom: {{customsizedata.d[2]}}px!important;} .fufu-update-images ul li:nth-child(4) {margin-right: 10px; } .fufu-update-images ul li:nth-child(8) {margin-right: 10px; } .fufu-update-images ul li:nth-child({{customsizedata.d[0]}}n){margin-right:0!important;}</style>" +
      "<ul>" +
      "<li ng-repeat='imgItem in imagesListArr' ><i on-tap='deleteImage($event,$index)'><img ng-src='{{customicon.del}}' /></i>" +
      "<div on-tap='zoomSlider.show({data:imagesListArr, index:$index})' on-hold='holdHandle($event)'><img ng-style='imgListStyle[$index]' ng-load-index-image ng-load-index='{{$index}}' ng-load-src='{{imgItem}}'></div>" +
      "</li>" +
      "<li ng-show='imagesListArr.length < 9 && !browsemode' ng-hide='hideadd==\"true\"' class='select_images' on-tap='select_images()'><img ng-src='{{customicon.add}}' ></li>" +
      "</ul>" +
      "</div>",
      link: function(scope, element, attrs) {

        scope.customicon = {
          "del" : "",
          "add" : ""
        }

        if(scope.customsize){
          scope.customsizedata = {
            d: scope.customsize.split(',')
          }

          scope.customsizedata.itemWidth = parseInt((scope.customsizedata.d[1] - (scope.customsizedata.d[0] - 1) * scope.customsizedata.d[2])/scope.customsizedata.d[0]);
      
        }
      
        if(scope.customdelicon == undefined || scope.customdelicon == ''){
          scope.customicon.del = local_resource + 'img/del.png';
        }else{
          scope.customicon.del = local_resource + scope.customdelicon;
        }

        if(scope.customaddicon == undefined || scope.customaddicon == ''){
          scope.customicon.add = local_resource + 'img/addimg.png';
        }else{
          scope.customicon.add = local_resource + scope.customaddicon;
        }
        
        scope.imagesListArr = [];

        scope.zoomSlider = zoomSlider;

        scope.imgListStyle = [];

    scope.browsemode = false;

        if(attrs.browsemode && attrs.browsemode == 'true'){
            scope.browsemode = true;
        }

        scope.$watch('data',function(n,o){

            selectImagesCallback(scope.data);

        })


        if(scope.customsize){
          var imgBoxSize = scope.customsizedata.itemWidth;
        }else{
          var imgBoxSize = $(element).find('li').width();
        }
        
       
        scope.imgLoading = function (index, imgObj) {

          $timeout(function () {

            var currentImgStyle = {};
         
            if(imgObj.target.width > imgObj.target.height){
              var zoomRatio = imgBoxSize / imgObj.target.height,
                imgWidth = imgObj.target.width * zoomRatio,
                imgLeft = (imgWidth - imgBoxSize) / 2;

              currentImgStyle.width = imgWidth + 'px';
              currentImgStyle.height = imgBoxSize + 'px';
              currentImgStyle.top = '0px';
              currentImgStyle.left = '-'+imgLeft+'px';

            }else if(imgObj.target.width < imgObj.target.height){

              var zoomRatio = imgBoxSize / imgObj.target.width,
                imgHeight = imgObj.target.height * zoomRatio,
                imgTop = (imgHeight - imgBoxSize) / 2;

              currentImgStyle.width = imgBoxSize + 'px';
              currentImgStyle.height = imgHeight + 'px';
              currentImgStyle.top = '-'+imgTop+'px';
              currentImgStyle.left = '0px';

            }else{
              //宽高一样
              currentImgStyle.width = imgBoxSize + 'px';
              currentImgStyle.height = imgBoxSize + 'px';
              currentImgStyle.top = '0px';
              currentImgStyle.left = '0px';
            }
            scope.imgListStyle[index] = currentImgStyle;
          },0)
        }

        scope.select_images = function() {


          var hideSheet = $ionicActionSheet.show({
            buttons: [

              {
                text: '拍照'
              }, {
                text: '从手机相册选择'
              }
            ],
            titleText: '选择上传图片方式',
            cancelText: '取消',
            cancel: function() {
              // add cancel code..
            },
            buttonClicked: function(index) {

              if (index == 0) {

                try {
          if(scope.data.split(",").length<=9){
                        $timeout(function () {
                            navigator.camera.getPicture(function(uri) {

                                if(uri!=""&&uri!=null&&typeof(uri)!='undefined'){
                                    modifyScopeData(uri);
                                }
                            }, function() {
                                //alert('cancel or failure');
                            }, {
                                allowEdit: false,
                                destinationType: Camera.DestinationType.FILE_URI,
                                quality: 100,
                                targetHeight: 800,
                                targetWidth: 800,
                                correctOrientation: true
                            });
                        },250)
          }
                } catch (e) {
                  //alert(e.message);
                }

                return true;
              } else if (index == 1) {
                try {
                  var imagesLength = 0;

                  if(scope.data.length > 0&&scope.data!=""){
                    imagesLength = scope.data.split(',').length;
                  }
                    $timeout(function () {
                        var ft = new FileTransfer();
                        ft.getAssetImage(imagesLength, function(msg) {

                            if (msg != null && typeof(msg) != 'undefined' && msg != "") {
                                $(element).find('li.img-item').removeClass('img-item');
                                modifyScopeData(msg);
                            }
                        })
                    },250);

                } catch (e) {
                  //alert(e.message);
                }
                return true;
              }

              return true;
            }
          });
        };

        scope.deleteImage = function(ev,index) {
           if(scope.browsemode){
                return;
            }

          $timeout(function() {
              // $(ev.target).parents('.fufu-update-images li[class!="select_images disable-user-behavior"]');
            // $('.fufu-update-images li[class!="select_images disable-user-behavior"]').eq(index).css('display','none');
              $(ev.target).parents('.fufu-update-images li[class!="select_images disable-user-behavior"]').eq(index).css('display','none');
            scope.imagesListArr.splice(index, 1);
            scope.imgListStyle.splice(index,1);
            scope.data = scope.imagesListArr.join(',');
          }, 0);
        };


        scope.holdHandle = function(ev) {

      if(scope.browsemode){
                return;
            }

          if (ev.target.tagName == 'IMG') {
            if($(ev.target.parentNode.parentNode).hasClass('active')){
              // $(ev.target.parentNode.parentNode).removeClass('img-item');
              $(ev.target.parentNode.parentNode).removeClass('active');
            }else{
              // $(ev.target.parentNode.parentNode).addClass('img-item');
              $(ev.target.parentNode.parentNode).addClass('active');
            }

          }
        };



        function modifyScopeData(str) {
            $timeout(function() {
            if (str[str.length - 1] == ',') {
                str = str.substring(0, str.length)
            }
            var newArrayList = null;
            if(str!=""){
                newArrayList = str.split(",");
            }else{
                newArrayList = [];
                return;
            }

            var _new_data_str = "";
            for(var i = 0,len = newArrayList.length;i<len;i++){
                _new_data_str = _new_data_str + ","+newArrayList[i]+'?dt='+new Date().getTime();
            }
            if(scope.data==""||scope.data.length==0){
                scope.data = str;
            }else{
                scope.data = scope.data + _new_data_str;
            }
            }, 0);
        }

        function selectImagesCallback(str) {

          $(element).find('li').removeClass('active');

          $timeout(function() {

            if(str!=""&&typeof(str)!='undefined'){
                scope.imagesListArr = str.split(",");
            }else{
                scope.imagesListArr = [];
            }


            $(element).removeClass("fufu-update-img4");
            $(element).removeClass("fufu-update-img8");
            $(element).removeClass("fufu-update-img9");

            if (scope.imagesListArr.length <= 3) {
              $(element).addClass("fufu-update-img4");
            } else if (scope.imagesListArr.length > 3 && scope.imagesListArr.length < 8) {
              $(element).addClass("fufu-update-img8");
            } else if (scope.imagesListArr.length == 8) {
              $(element).addClass("fufu-update-img9");
            } else {
              new Error('Image number is wrong');
            }

          }, 0);
        }

      }
    }
  }])
  .directive('parallaxTabsToogleToView',['$timeout','$ionicHistory',function($timeout, $ionicHistory) {

    return {
      restrict: 'A',
      compile: function(element, attr) {


        return function($scope, $element, $attr) {
          var cur_tab_str = '首页',
            go_to_tab_str = '首页';

          $(element).find('a').on('click',function (ev) {

            var current_go_to_tab = $(this).find('span').text();


            $('ion-nav-view [title="'+current_go_to_tab+'"]');

            if(cur_tab_str != current_go_to_tab){

              if(current_go_to_tab == go_to_tab_str){
                //其他tabs页面到达首页
                // debugger;
                $('ion-nav-bar').css('display','none');
                $('ion-view[ng-controller="userHomeCtrl"] ion-content').css('top',0);
              }

              if(cur_tab_str == go_to_tab_str){

                $('ion-nav-bar').css('display','');
                $('ion-view[ng-controller="userHomeCtrl"] ion-content').css('top','');
                //首页到达其他tabs页面
                var copyEl = $('div[nav-bar="cached"] ion-header-bar').clone().css({
                  'position': 'absolute',
                  'top': '0',
                  'left' : '0'
                }).addClass('tabsCopyTitleBar');
                copyEl.find('div[class="title title-center header-item"]').css('opacity',1).text('');

                if(current_go_to_tab == '考勤' || current_go_to_tab == '我的'){

                  // var copyEl = $('div[nav-bar="cached"] ion-header-bar').clone().css({
                  //     'position': 'absolute',
                  //     'top': '0',
                  //     'left' : '0'
                  // }).addClass('tabsCopyTitleBar');
                  // copyEl.find('div[class="title title-center header-item"]').css('opacity',1).text('');
                  // copyEl.find('div[class="title title-center header-item"]').css('opacity',1).text(current_go_to_tab);
                  $('ion-nav-view[title="'+current_go_to_tab+'"]').addClass('restore_height').append(copyEl);

                  // $timeout(function () {
                  //
                  //     $('ion-nav-view[title="'+current_go_to_tab+'"]').removeClass('restore_height').find('.tabsCopyTitleBar').remove();
                  // },200);
                  // debugger;
                }else if(current_go_to_tab == '消息' || current_go_to_tab == '签到'){
                  // var copyEl = $('div[nav-bar="cached"] ion-header-bar').clone().css({
                  //     'position': 'absolute',
                  //     'top': '0',
                  //     'left' : '0'
                  // }).addClass('tabsCopyTitleBar');
                  // copyEl.find('div[class="title title-center header-item"]').css('opacity',1).text('');
                  // copyEl.find('div[class="title title-center header-item"]').css('opacity',1).text((current_go_to_tab == '签到')?'':current_go_to_tab);
                  $('ion-nav-view[title="'+current_go_to_tab+'"]').append(copyEl);
                  // debugger;
                  // $timeout(function () {
                  //     $('ion-nav-view[title="'+current_go_to_tab+'"]').find('.tabsCopyTitleBar').remove();
                  // },200);
                }else{
                  //消息
                  // copyEl.find('div[class="title title-center header-item"]').css('opacity',1).text('消息');
                  $('ion-nav-view[title="'+current_go_to_tab+'"]').append(copyEl);
                  // $timeout(function () {
                  //     $('ion-nav-view[title="消息"]').find('.tabsCopyTitleBar').remove();
                  // },200);

                }

              }

              cur_tab_str = current_go_to_tab;
            }


          })

        }
      }
    };
  }])


  .filter('mobile_tree_filter', ['$timeout',function ($timeout) {
    return function (array, filterStr,calsSelectNumFunc) {

      if(filterStr == ''){
        for(var i = 0,len = array.length;i<len;i++){
          array[i].is_show = true;
          array[i].is_show_children = true;
          if(array[i].children && array[i].children.length){
            for(var ii = 0,lens = array[i].children.length;ii<lens;ii++){

              array[i].children[ii].is_show = true;

            }
          }

        }


        return array;
      }else{



        var children_is_show = false;

        for(var i = 0,len = array.length;i<len;i++){
          //如果TEXT 检索到过滤条件
          if(array[i].text.indexOf(filterStr) > -1){
            array[i].is_show = true;
          }else{
            array[i].is_show = false;
          }

          if(array[i].children && array[i].children.length){

            for(var ii = 0,lens = array[i].children.length;ii<lens;ii++){
              if(array[i].children[ii].text.indexOf(filterStr) > -1){
                array[i].children[ii].is_show = true;

                children_is_show = true;
              }else{
                array[i].children[ii].is_show = false;
              }
            }
          }

          if(children_is_show){
            array[i].is_show_children = true;
            if(!array[i].is_show){
              array[i].is_show = true;
            }
          }else{
            array[i].is_show_children = false;
          }


          children_is_show = false;

        }

        return array;
      }
    }
  }])

  .directive('mobileTreeBox', ['$timeout', function($timeout) {
    return {
      restrict: 'A',
      replace: true,
      scope: true,
      controller: ['$scope', function($scope) {

        this.allSelect = function () {
          $scope.$broadcast("all-select-tree");
        };

        this.allNotSelect = function () {
           $scope.$broadcast("all-not-select-tree");
        };

        this.filter = function (filterData) {
          $scope.$broadcast("filter-tree", {filterStr:filterData});
        };

        this.upTotal = function (total) {

          $scope.$broadcast("update-total-num", { totalNum: total});
        };


      }],
      link: function(scope, element, attr) {

      }
    }
  }])

  .directive('mobileTreeSelectTotal', ['$timeout', function($timeout) {
    return {
      restrict: 'E',
      replace: true,
      template: '<span ng-bind="totalNum"></span>',
      require: '^mobileTreeBox',
      controller: ['$scope', function($scope) {


      }],
      link: function(scope, element, attr, mobileTreeBox) {

        scope.totalNum = scope.$parent.$parent.selectedTotal;

        scope.$on('update-total-num', function(d, data) {
          scope.totalNum = data.totalNum;
        });
      }
    }
  }])

  .directive('mobileTree', ['$timeout', function($timeout) {

    return {
      restrict: 'E',
      replace: true,
      template: '<ul class="mobile_tree_list_box"><li class="mobile_top_level_tree" ng-repeat="item in data | mobile_tree_filter:treeFilterStr:calsSelectNum" ng-show="item.is_show">' +
      '<div class="item item-checkbox checkbox-calm">' +
      '<label class="checkbox"><input type="checkbox" ng-model="item.is_checked" ng-checked="item.is_checked" ng-change="selectOption(item.is_checked)"/></label>' +
      '</div>' +
      '<div><img class="mobile_tree_mark" src="http://120.24.153.50/fufu_ak/www/img/section_icon.png"></div>' +
      '<div class="mobile_top_level_text" ng-bind="item.text"></div>' +
      '<div class="float-right toggle_arrow" on-tap="item.is_expand = !item.is_expand" ng-show="item.is_show_children" ng-if="item.children && item.children.length">' +
      '<img ng-src="{{item.is_expand?'+"'http://120.24.153.50/fufu_ak/www/img/section_arrow_bottom.png':'http://120.24.153.50/fufu_ak/www/img/next_arrow.png'"+'}}" >' +
      '</div>' +
      '<ul class="mobile_tree_list_box" ng-if="item.children && item.children.length" ng-show="item.is_expand && item.is_show_children">' +
      '<li class="mobile_second_level_tree" ng-repeat="childrenItem in item.children" ng-show="childrenItem.is_show">' +
      '<div class="item item-checkbox checkbox-calm">' +
      '<label class="checkbox"><input type="checkbox" ng-model="childrenItem.is_checked" ng-checked="childrenItem.is_checked" ng-change="selectOption(childrenItem.is_checked,childrenItem)"/></label>' +
      '</div>' +
      '<div><img class="mobile_tree_mark" src="http://120.24.153.50/fufu_ak/www/img/sub-sector_icon.png"></div>' +
      '<div class="mobile_second_level_text" ng-bind="childrenItem.text"></div></li>' +
      '</ul>' +
      '</li></ul>',
      require: '^mobileTreeBox',
      controller: ['$scope', function($scope) {

        $scope.$on('all-select-tree', function(d, data) {
          if($scope.treeFilterStr){
            $timeout(function () {
              for(var i = 0,len = $scope.data.length;i<len;i++){
                if($scope.data[i].is_show){
                  if(!$scope.data[i].is_checked){
                    $scope.data[i].is_checked = true;
                    $scope.selectTotal += 1;
                  }
                }
                if($scope.data[i].children && $scope.data[i].children.length){
                  for(var ii = 0,lens = $scope.data[i].children.length;ii<lens;ii++){
                    if($scope.data[i].children[ii].is_show){
                      if(!$scope.data[i].children[ii].is_checked){
                        $scope.data[i].children[ii].is_checked = true;
                        $scope.selectTotal += 1;
                      }
                    }
                  }
                }
              }

              $scope.mobileTreeBox.upTotal($scope.selectTotal);
            },0);
          }else{
            $timeout(function () {
              $scope.data = angular.copy($scope.$parent.$parent.allSelectTreeData);
              $scope.selectTotal = $scope.$parent.$parent.treeTotalNum;
              $scope.mobileTreeBox.upTotal($scope.selectTotal);
            },0);
          }
        });

          $scope.$on('all-not-select-tree', function(d, data) {
              if($scope.treeFilterStr){
                  $timeout(function () {
                      for(var i = 0,len = $scope.data.length;i<len;i++){
                          if($scope.data[i].is_show){
                              if($scope.data[i].is_checked){
                                  $scope.data[i].is_checked = false;
                                  $scope.selectTotal -= 1;
                              }
                          }
                          if($scope.data[i].children && $scope.data[i].children.length){
                              for(var ii = 0,lens = $scope.data[i].children.length;ii<lens;ii++){
                                  if($scope.data[i].children[ii].is_show){
                                      if($scope.data[i].children[ii].is_checked){
                                          $scope.data[i].children[ii].is_checked = false;
                                          $scope.selectTotal -= 1;
                                      }
                                  }
                              }
                          }
                      }

                      $scope.mobileTreeBox.upTotal($scope.selectTotal);
                  },0);
              }else{
                  $timeout(function () {
                      $scope.data = angular.copy($scope.$parent.$parent.emptySelect);
                      $scope.selectTotal = 0;
                      $scope.mobileTreeBox.upTotal($scope.selectTotal);
                  },0);
              }
          })

        $scope.$on('filter-tree', function(d, data) {

          $scope.treeFilterStr =  data.filterStr;
          $timeout(function () {
            $scope.$parent.$parent.$parent.resizeIonContent();
          },0);
        });

      }],
      link: function(scope, element, attr, mobileTreeBox) {

        scope.singleMode = (attr.mode == 'single')?true:false;



        scope.data = scope.$parent.$parent.treeData;

        scope.selectTotal = scope.$parent.$parent.selectedTotal;

        scope.mobileTreeBox = mobileTreeBox;

        scope.treeFilterStr = '';

        scope.clearTreeFilterStr = function () {
          $timeout(function () {
            scope.treeFilterStr = '';
          },0);
        };

        scope.clearCheck = function () {
          $timeout(function () {
            for(var i = 0,len = scope.data.length;i<len;i++){
              if(scope.data[i].is_checked){
                scope.data[i].is_checked = false;
              }
              if(scope.data[i].children && scope.data[i].children.length){
                for(var ii = 0,lens = scope.data[i].children.length;ii<lens;ii++){
                  if(scope.data[i].children[ii].is_show){
                    if(scope.data[i].children[ii].is_checked){
                      scope.data[i].children[ii].is_checked = false;
                    }
                  }
                }
              }
            }

          },0);
        };


        scope.selectOption = function (state) {
          // console.log(scope);
          if(scope.singleMode){

            scope.$parent.$parent.$parent.closeModal();
            //console.log('clearCheck');
            scope.clearCheck();
          }else{
            (state)?scope.selectTotal+=1:scope.selectTotal-=1;
            mobileTreeBox.upTotal(scope.selectTotal);
          }

        };

      }
    }
  }])

  .directive('allSelectTree', ['$timeout', function($timeout) {
    return {
      restrict: 'A',
      replace: true,
      require: '^mobileTreeBox',
      controller: ['$scope', function($scope) {

      }],
      link: function(scope, element, attr, mobileTreeBox) {

        $(element).on('click',function () {

            mobileTreeBox.allSelect();

        })
      }
    }
  }])

    .directive('allNotSelectTree', ['$timeout', function($timeout) {
        return {
            restrict: 'A',
            replace: true,
            require: '^mobileTreeBox',
            controller: ['$scope', function($scope) {

            }],
            link: function(scope, element, attr, mobileTreeBox) {
                $(element).on('click',function (){
                    mobileTreeBox.allNotSelect();
                })
            }
        }
    }])

  .directive('mobileSearch', ['$timeout', function($timeout) {
    return {
      restrict: 'E',
      replace: true,
      template: '<input type="text" ng-model="searchFilter" ng-change="filter()" style="width: 90%; height: 28px; margin-left: 18px;">',
      require: '^mobileTreeBox',
      controller: ['$scope', function($scope) {

      }],
      link: function(scope, element, attr, mobileTreeBox) {
        scope.searchFilter = '';

        scope.clearSearchStr = function () {
          scope.searchFilter = '';
        };

        scope.filter = function () {
          mobileTreeBox.filter(scope.searchFilter);
        }
      }
    }
  }])
  .directive("headNotify", function($timeout) {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        var 
            stackArray = [],
            ctStackArray = [],
            baseZindex = 50,
            system = (ionic.Platform.isIOS())?"ios":"android";

        scope.$on('headNotify', function(d,data) {  

           sendNotify(data)
        });

        scope.$on('headNotifyDestroy', function(d,data) {  

           destroyCtNotify()
        });

      function sendNotify(data){
        
        switch(data.type){
            case 'error':
              var notifyEl = $("<div class='head-notify head-notify-"+system+" head-notify-"+data.type+" slideInDown animated'><div><img src='img/connect_fail.png'/><p class='hyphenate text' lang='en'>"+data.text+"</p></div></div>");
              baseZindex += 1;
              notifyEl.css("zIndex",baseZindex);
              stackArray.push(notifyEl);
              $(element[0]).prepend(stackArray[stackArray.length-1]);
              destroyNotify(stackArray.length-1,data.time);
              break;
            case 'success':
              var notifyEl = $("<div class='head-notify head-notify-"+system+" head-notify-"+data.type+" slideInDown animated'><div><img src='img/connect_success.png'/><p class='hyphenate text' lang='en'>"+data.text+"</p></div></div>");
              baseZindex += 1;
              notifyEl.css("zIndex",baseZindex);
              stackArray.push(notifyEl);
              $(element[0]).prepend(stackArray[stackArray.length-1]);
              destroyNotify(stackArray.length-1,data.time);
              break;
            case 'continue':
              var notifyEl = $("<div class='head-notify head-notify-"+system+" head-notify-"+data.type+" slideInDown animated'><div><img src='img/connect_continue.png'/><p class='hyphenate text' lang='en'>"+data.text+"</p></div></div>");
              baseZindex += 1;
              notifyEl.css("zIndex",baseZindex);
              ctStackArray.push(notifyEl);
              $(element[0]).prepend(ctStackArray[ctStackArray.length-1]);
              break;
            default:
              console.log('Not is type:'+ data.type);
          }

      }

      function destroyCtNotify(){
          
          while (ctStackArray.length > 0){
      
            ctStackArray[ctStackArray.length - 1].removeClass("slideInDown").addClass("slideOutUp");
            ctStackArray[ctStackArray.length - 1].remove();
            ctStackArray.pop();
            
          }
          
      }

      function destroyNotify(i,time){
          $timeout(function(){

            stackArray[i].removeClass("slideInDown").addClass("slideOutUp");
            $timeout(function(){
              stackArray[i].remove();

            },500);
        },time)
      }

      

      }
    }
  })

.directive('errSrc', function() {
  return {
    link: function(scope, element, attrs) {
      element.bind('error', function() {
        if (attrs.src != attrs.errSrc) {
          attrs.$set('src', attrs.errSrc);
        }
      });
    }
  }
})


