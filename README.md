errortrack
==========
前端报错跟踪器

使用UMD定义errortrack, 可作为AMD的模块使用, 也可直接使用.

###How to use?
--------
1. 采用AMD定义模块使用范例:  

        define(function(require){
          ...
          require('errorTrack').init({
            // 配置错误发送的地址
            url : '/api/tools/femonitor/error?content=',
            /**
             * 定义需要捕获的额外信息
             * @return {Object}
             */
            captureExtendedInfo: function(){...} 
          });
          ...
        });

2. 未采用AMD定义模块使用范例:  

        window.errorTrack.init({
          // 配置错误发送的地址
          url : '/api/tools/femonitor/error?content=',
          /**
           * 定义需要捕获的额外信息
           * @return {Object}
           */
          captureExtendedInfo: function(){...} 
        });
