/*!
 * vueLoader.js v1.0.0
 * (c) 2014-2018 wen bei
 * Released under the MIT License.
 */
(function(root, factory) {
  if (typeof exports === "object") {
    module.exports = factory();
  } else if (typeof define === "function" && define.amd) {
    define(factory);
  } else {
    root.vueload = factory();
  }
})(this, function() {
  var scopeIndex = 100000000;
  //让bind函数支持IE8
  if (!Function.prototype.bind) {
    Function.prototype.bind = function(oThis) {
      if (typeof this !== "function") {
        throw new TypeError(
          "Function.prototype.bind - what is trying to be bound is not callable"
        );
      }
      var aArgs = Array.prototype.slice.call(arguments, 1),
        fToBind = this,
        fNOP = function() {},
        fBound = function() {
          return fToBind.apply(
            this instanceof fNOP && oThis ? this : oThis,
            aArgs.concat(Array.prototype.slice.call(arguments))
          );
        };
      fNOP.prototype = this.prototype;
      fBound.prototype = new fNOP();
      return fBound;
    };
  }
  
  //定义VueLoad的load方法
  vueload = function(url, name) {
    //解析vue的url
    var component = vueload.parseURL(url);
    //返回一个promise
    return vueload.load(component.url, name || component.name);
  };

  vueload.endWith = function(str, char) {
    var reg = new RegExp(char + "$");
    return reg.test(str);
  };
  vueload.load = function(url, name) {
    return function() {
      return new this.component(name, this)
        .load(url)
        .then(function(component) {
          return component.compile();
        })
        .then(function(component) {
          var exports =
            component._script !== null
              ? component._script.module.exports
              : {};
          if (component._template !== null)
            exports.template = component._template.getContent();
          if (exports.name === undefined)
            if (component.name !== undefined) exports.name = component.name;
          exports._baseURI = component.baseURI;
          return exports;
        });
    }.bind(this);
  };
  vueload.require = function(moduleName) {
    return window[moduleName];
  };
  vueload.extend = function(dst, src) {
    for (var property in src) {
      dst[property] = src[property];
    }
    return dst;
  };
  vueload.ajax = function(option) {
    return new Promise(
      function(resolve, reject) {
        _option = this.extend(
          {
            method: "GET",
            contentType: "text/xml; charset=UTF-8",
            timeout: 0,
            url: "",
            async: true,
            data: null
          },
          option
        );
        try {
          var xhr = getXMLHttpRequest();
          if (_option.timeout > 0) xhr.timeout = _option.timeout;
          var params = [];
          for (var key in _option.data) {
            params.push(key + "=" + _option.data[key]);
          }
          var postData = params.join("&");
          if (_option.method.toUpperCase() === "POST") {
            xhr.open(_option.method, _option.url, _option.async);
            xhr.setRequestHeader("Content-Type", _option.contentType);
            xhr.send(postData);
          } else if (_option.method.toUpperCase() === "GET") {
            xhr.open(
              _option.method,
              _option.url + (postData ? "?" + postData : ""),
              _option.async
            );
            xhr.send(null);
          }
        } catch (error) {
          reject(xhr, error);
        }
        xhr.onreadystatechange = function() {
          if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              try {
                resolve(xhr);
              } catch (error) {
                reject(xhr, error);
              }
            }
            else reject(xhr, null);
          }
        };
      }.bind(this)
    );
    function getXMLHttpRequest() {
      var xhr = false;
      if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
        if (xhr.overrideMimeType) {
          xhr.overrideMimeType("text/xml");
        }
      } else if (window.ActiveXObject) {
        try {
          xhr = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (e) {
          try {
            xhr = new ActiceXObject("Microsoft.XMLHTTP");
          } catch (e) {
            xhr = false;
          }
        }
      }
      return xhr;
    }
  };
  /**
   * @method
   * @param {url} vue文件路径
   * 例：
   *  ./demo/my.component/ => ./demo/my.component/index.vue
   *  ./demo/my.component => ./demo/my.component.vue
   *  ./demo/my.component.vue => ./demo/my.component.vue
   * @desc 解析vue文件路径
   */
  vueload.parseURL = function(url) {
    var urls, params, path, name;
    //分隔参数
    urls = url.split("?");
    //获取path
    path = urls[0];
    if (urls.length == 2) params = urls[1];
    //处理path
    name = path.substring(path.lastIndexOf("/") + 1, path.length);
    //如果name不存在则
    if (!name) {
      name = path.substring(0, path.length - 1);
      name = name.substring(name.lastIndexOf("/") + 1, name.length);
      path = path + "index.vue";
    } else {
      if (this.endWith(name.toLowerCase(), ".vue"))
        name = name.substring(0, name.lastIndexOf("."));
      else path = path + ".vue";
    }
    return { name: name, url: path + (params ? "?" + params : "") };
  };
  vueload.resolveURL = function(baseURL, url) {
    if (url.substr(0, 2) === "./" || url.substr(0, 3) === "../") {
      return baseURL + url;
    }
    return url;
  };
  vueload.register = function(Vue, url) {
    var component = this.parseURL(url);
    Vue.component(component.name, this.load(component.url));
  };
  vueload.install = function(Vue) {
    Vue.mixin({
      beforeCreate: function() {
        var components = this.$options.components;
        for (var componentName in components) {
          if (
            typeof components[componentName] === "string" &&
            components[componentName].substr(0, 4) === "url:"
          ) {
            var comp = vueload.parseURL(components[componentName].substr(4));
            var componentURL = "_baseURI" in this.$options ? this.resolveURL(this.$options._baseURI, comp.url) : comp.url;
            if (isNaN(componentName))
              components[componentName] = vueload.load(
                componentURL,
                componentName
              );
            else
              components[componentName] = Vue.component(
                comp.name,
                vueload.load(componentURL, comp.name)
              );
          }
        }
      }
    });
  };
  //component组件
  vueload.component = function(name, vueload) {
    this.name = name;
    this.vueload = vueload;
    this._template = null;
    this._script = null;
    this._styles = [];
    this._scopeId = "";
    this.style = function(component, element) {
      this.component = component;
      this.element = element;
      this.withBase = function(callback) {
        var tmpBaseElt;
        if (this.component.baseURI) {
          // firefox and chrome need the <base> to be set while inserting or modifying <style> in a document.
          tmpBaseElt = document.createElement("base");
          tmpBaseElt.href = this.component.baseURI;
          var headElt = this.component.getHead();
          headElt.insertBefore(tmpBaseElt, headElt.firstChild);
        }
        callback.call(this);
        if (tmpBaseElt) this.component.getHead().removeChild(tmpBaseElt);
      };

      this.scopeStyles = function(styleElt, scopeName) {
        function process() {
          var sheet = styleElt.sheet;
          var rules = sheet.cssRules;
          for (var i = 0; i < rules.length; ++i) {
            var rule = rules[i];
            if (rule.type !== 1) continue;
            var scopedSelectors = [];
            rule.selectorText.split(/\s*,\s*/).forEach(function(sel) {
              scopedSelectors.push(scopeName + " " + sel);
              var segments = sel.match(/([^ :]+)(.+)?/);
              scopedSelectors.push(
                segments[1] + scopeName + (segments[2] || "")
              );
            });
            var scopedRule =
              scopedSelectors.join(",") +
              rule.cssText.substr(rule.selectorText.length);
            sheet.deleteRule(i);
            sheet.insertRule(scopedRule, i);
          }
        }
        try {
          // firefox may fail sheet.cssRules with InvalidAccessError
          process();
        } catch (ex) {
          if (
            ex instanceof DOMException &&
            ex.code === DOMException.INVALID_ACCESS_ERR
          ) {
            styleElt.sheet.disabled = true;
            styleElt.addEventListener("load", function onStyleLoaded() {
              styleElt.removeEventListener("load", onStyleLoaded);
              // firefox need this timeout otherwise we have to use document.importNode(style, true)
              setTimeout(function() {
                process();
                styleElt.sheet.disabled = false;
              });
            });
            return;
          }
          throw ex;
        }
      };

      this.compile = function() {
        var hasTemplate = this.component._template !== null;
        var scoped = this.element.hasAttribute("scoped");
        if (scoped) {
          // no template, no scopable style needed
          if (!hasTemplate) return;
          // firefox does not tolerate this attribute
          this.element.removeAttribute("scoped");
        }
        this.withBase(function() {
          this.component.getHead().appendChild(this.element);
        });
        if (scoped)
          this.scopeStyles(
            this.element,
            "[" + this.component.getScopeId() + "]"
          );
        return Promise.resolve();
      };
      this.getContent = function() {
        return this.element.textContent;
      };
      this.setContent = function(content) {
        this.withBase(function() {
          this.element.textContent = content;
        });
      };
    };
    this.template = function(component, element) {
      this.component = component;
      this.element = element;
      this.content =  this.component.responseText.match(/<template>([\s\S]*?)<\/template>/)[1];
      this.getContent = function() {
        return this.content;
      };
      this.setContent = function(content) {
        this.content = content;
      };
      this.addScopeId = function (scopeId) {
        var i = 0, start = 0, tagStart = false, rootTagName = "";
        while (i < this.content.length) {
          if (this.content[i] != "<" && tagStart == false) {
            i++;
            continue;
          }
          else {
            tagStart = true;
            if (tagStart) {
              if (this.content[i] != ' ' && this.content[i] != '\n' && this.content[i] != '\r')
                rootTagName = rootTagName + this.content[i];
              else {
                start = i;
                tagStart = false;
                break;
              }
            }
            i++;
          }
        }
        this.content = rootTagName + " " + scopeId + this.content.substring(start);
      };
      this.compile = function () {
        return Promise.resolve();
      };
    };
    this.script = function(component, element) {
      this.component = component;
      this.element = element;
      this.module = { exports: {} };
      this.getContent = function() {
        return this.element.textContent;
      };
      this.setContent = function(content) {
        this.element.textContent = content;
      };
      this.compile = function() {
        var childModuleRequire = function(childURL) {
          return this.component.vueload.require(
            this.component.vueload.resolveURL(
              this.component.baseURI,
              childURL
            )
          );
        }.bind(this);
        var childLoader = function(childURL, childName) {
          return this.component.vueload(
            this.component.vueload.resolveURL(
              this.component.baseURI,
              childURL
            ),
            childName
          );
        }.bind(this);
        try {
          Function(
            "exports",
            "require",
            "vueload",
            "module",
            this.getContent()
          ).call(
            this.module.exports,
            this.module.exports,
            childModuleRequire,
            childLoader,
            this.module
          );
        } catch (ex) {
          if (!("lineNumber" in ex)) {
            return Promise.reject(ex);
          }
          var vueFileData = this.component.responseText.replace(/\r?\n/g,"\n");
          var lineNumber = vueFileData.substr(0, vueFileData.indexOf(script)).split("\n").length + ex.lineNumber - 1;
          throw new ex.constructor(ex.message, url, lineNumber);
        }
        return Promise.resolve(this.module.exports);
      };
    };
    this.getHead = function() {
      return document.head || document.getElementsByTagName("head")[0];
    };
    this.getScopeId = function() {
      if (this._scopeId === "") {
        this._scopeId = "data-v-" + (scopeIndex++).toString(36);
        this._template.addScopeId(this._scopeId);
      }
      return this._scopeId;
    };
    this.load = function(url) {
      return this.vueload
        .ajax({ url: url })
        .then(
          function(xhr) {
            this.responseText = xhr.responseText;
            this.baseURI = url.substr(0, url.lastIndexOf("/") + 1);
            var doc = document.implementation.createHTMLDocument("");
            doc.body.innerHTML = (this.baseURI ? '<base href="' + this.baseURI + '">' : "") + this.responseText;
            for (var node = doc.body.firstChild; node; node = node.nextSibling) 
            {
              switch (node.nodeName.toUpperCase()) {
                case "TEMPLATE":
                  this._template = new this.template(this, node);
                  break;
                case "SCRIPT":
                  this._script = new this.script(this, node);
                  break;
                case "STYLE":
                  this._styles.push(new this.style(this, node));
                  break;
              }
            }
            return this;
          }.bind(this)
        ).catch(
          function(error) {
            console.error("[vueload error]: " + error.message + error.stack);
            return this;
          }.bind(this)
        );
    };
    this.compile = function() {
      return Promise.all(
        Array.prototype.concat(
          this._script && this._script.compile(),
          this._styles.map(function(_style) {
            return _style.compile();
          }),
          this._template && this._template.compile()
        )
      ).then(
        function() {
          return this;
        }.bind(this)
      );
    };
  };
  return vueload;
});
