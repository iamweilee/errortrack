(function(name, context, definition) {
    if (typeof module != 'undefined' && module.exports) {
        module.exports = definition();
    } else if (typeof define == 'function' && define.amd) {
        define(definition);
    } else {
        context[name] = definition();
    }
})('errorTrack', this, function() {
    function addEvent(element, eventType, callback, capture) {
        element.addEventListener ? element.addEventListener(eventType, callback, capture || false) : element.attachEvent('on' + eventType, callback);
    }

    function getTreePath(element, context) {
        context = context || document.body;
        var paths = [];
        while (element && element.tagName && element !== context) {
            var id = element.getAttribute('id') || element.id;
            paths.unshift(element.tagName + (id ? '[id=' + id + ']' : ''));
            if (id) {
                break;
            }
            element = element.parentNode;
        }
        return paths.length ? paths.join('->') : '';
    }

    function extend(dest, src) {
        for (var i in src) {
            if (src.hasOwnProperty(i)) {
                dest[i] = src[i];
            }
        }
        return dest;
    }

    var clickPathList = [];
    var lastClickData;
    var config = {
        url: '',
        maxClickpathLength: 10
    };

    return {
        init: function(param) {
            extend(config, param || {});
            var me = this;
            addEvent(document.body, 'click', function(e) {
                e = e || window.event;
                var target = e.target || e.srcElement;
                if (target.nodeType !== 1) {
                    return;
                }
                lastClickData = {
                    path: getTreePath(target)
                };

                target.id && (lastClickData.id = target.id);
                target.tagName && (lastClickData.tagName = target.tagName);
                target.value && (lastClickData.value = target.value);
                var text = target.textContent || target.innerText;
                text && (lastClickData.text = text);
                target.src && (lastClickData.src = target.src);

                clickPathList.length === config.maxClickpathLength && clickPathList.shift();

                clickPathList.push(lastClickData);

                // 模拟抛错：在页面随意点击5次以上
                /*if (clickPathList.length > 5) {
                    throw new Error("注意：这是一个模拟的Error，只是用于测试前端报错跟踪的功能是否可行！");
                }*/

            }, true);

            addEvent(window, 'error', function(e) {
                // 这里把window.event放在e的前面，是因为ie在error事件里返回的e没有把具体的错误信息加入其中
                e = window.event || e;
                e.from = 'window.onerror';
                me.send(me.getErrorInfo(e));
                me.clear();
            });
        },
        clear: function() {
            clickPathList = [];
            if (lastClickData) {
                clickPathList.push(lastClickData);
                lastClickData = null;
            }
        },
        send: function(obj) {
            this.log(config.url + encodeURIComponent(JSON.stringify(obj)));
        },
        log: function(url) {
            var img = new Image();
            img.src = url;
        },
        getErrorInfo: function(e) {
            var retObj = {
                error: {
                    lineNumber: e.lineno || e.errorLine || '',
                    fileName: e.filename || e.errorUrl || '',
                    columnNumber: e.colno || e.errorCharacter || '',
                    message: e.message || e.errorMessage || '',
                    stack: e.error && e.error.stack || ''
                },
                clickpath: clickPathList,
                location: location.href,
                userAgent: navigator.userAgent,
                from: e.from || '',
                plugins: (function(){
                    var ret = [];
                    baidu.object.each(navigator.plugins, function(plugin){
                        plugin && plugin.name && ret.push(plugin.name);
                    });
                    return ret.join(",");
                })()
            };

            if (typeof config.captureExtendedInfo === 'function') {
                var extended = config.captureExtendedInfo();
                if (Object.prototype.toString.call(extended) === '[object Object]') {
                    // 这么做是防止extended覆盖原有的同名属性
                    retObj = extend(extended, retObj);
                }
            }

            return retObj;
        }
    };

});
