// Yesify - WebSocket Interception Engine
// Based on wsHook architecture for state machine extraction
var wsHook = {};

(function() {
  var before = wsHook.before = function(data, url) {
    return Promise.resolve(data);
  };
  var after = wsHook.after = function(e, url) {
    return e;
  };
  wsHook.resetHooks = function() {
    wsHook.before = before;
    wsHook.after = after;
  };

  var _WS = window.WebSocket;
  window.WebSocket = function(url, protocols) {
    var WSObject;
    this.url = url;
    this.protocols = protocols;
    if (!this.protocols) {
      WSObject = new _WS(url);
    } else {
      WSObject = new _WS(url, protocols);
    }

    var _send = WSObject.send;
    wsHook._send = WSObject.send = function(data) {
      new wsHook.before(data, WSObject.url).then(function(newData) {
        if (newData != null) {
          _send.apply(WSObject, [newData]);
        }
      }).catch(function(e) {
        console.error("[Yesify] WS send hook error:", e);
        _send.apply(WSObject, [data]);
      });
    };

    var onmessageFunction;
    WSObject.__defineSetter__('onmessage', function(func) {
      onmessageFunction = wsHook.onMessage = func;
    });

    WSObject.addEventListener('message', function(event) {
      if (!onmessageFunction) {
        return;
      }
      wsHook.after(new MutableMessageEvent(event), this.url).then(function(modifiedEvent) {
        if (modifiedEvent != null) {
          onmessageFunction.apply(this, [modifiedEvent]);
        }
      }).catch(function(e) {
        console.error("[Yesify] WS message hook error:", e);
        onmessageFunction.apply(this, [event]);
      });
    });

    return WSObject;
  };
})();

function MutableMessageEvent(o) {
  this.bubbles = o.bubbles || false;
  this.cancelBubble = o.cancelBubble || false;
  this.cancelable = o.cancelable || false;
  this.currentTarget = o.currentTarget || null;
  this.data = o.data || null;
  this.defaultPrevented = o.defaultPrevented || false;
  this.eventPhase = o.eventPhase || 0;
  this.lastEventId = o.lastEventId || "";
  this.origin = o.origin || "";
  this.path = o.path || [];
  this.ports = o.ports || [];
  this.returnValue = o.returnValue || true;
  this.source = o.source || null;
  this.srcElement = o.srcElement || null;
  this.target = o.target || null;
  this.timeStamp = o.timeStamp || null;
  this.type = o.type || "message";
  this.__proto__ = o.__proto__ || MessageEvent.__proto__;
}
