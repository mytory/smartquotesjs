/**
 * 원본에 안형우가 \w, \W를 수정한 것.
 * \w는 [A-Za-z0-9_], \W는 [^A-Za-z0-9_]이다. 그래서 한글과 결합된 것을 처리하지 못한다.
 * 한글을 추가로 처리하도록 수정했다.
 * \w는 [A-Za-z0-9_가-힣ㄱ-ㅎ]로 변경했고
 * \W는 [^A-Za-z0-9_가-힣ㄱ-ㅎ]로 변경했다.
 */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.smartquotes = factory();
  }
}(this, function() {

  // The smartquotes function should just delegate to the other functions
  function smartquotes(context) {
    if (typeof document !== 'undefined' && typeof context === 'undefined') {
      var run = function() { smartquotes.element(document.body); };
      // if called without arguments, run on the entire body after the document has loaded
      if (document.readyState !== 'loading') {
        // we're already ready
        run();
      } else if (document.addEventListener) {
        document.addEventListener("DOMContentLoaded", run, false);
      } else {
        var readyStateCheckInterval = setInterval(function() {
          if (document.readyState !== 'loading') {
            clearInterval(readyStateCheckInterval);
            run();
          }
        }, 10);
      }
    } else if (typeof context === 'string') {
      return smartquotes.string(context);
    } else {
      return smartquotes.element(context);
    }
  }

  smartquotes.string = function(str) {
    return str
      .replace(/(\.|다)"/g,'$1”')                          // 단어 끝 "
      .replace(/(\.|다)'/g,'$1’')                          // 단어 끝 "
      .replace(/([^A-Za-z0-9_가-힣ㄱ-ㅎ]|^)"([A-Za-z0-9_가-힣ㄱ-ㅎ])/g, '$1“$2') // 맨앞 "
      .replace(/([^A-Za-z0-9_가-힣ㄱ-ㅎ]|^)'([A-Za-z0-9_가-힣ㄱ-ㅎ])/g, '$1‘$2') // 맨앞 '
      .replace(/(“[^"]*)"([^"]*$|[^“"]*“)/g, '$1”$2')              // 맨끝 "
      .replace(/(“[^']*)"([^']*$|[^‘']*‘)/g, '$1’$2')              // 맨끝 "
      .replace(/([^"”])"/g,'$1”')                          // 단어 끝 "
      .replace(/([^'’])'/g,'$1’')                          // 단어 끝 "
      ;
  };

  smartquotes.element = function(root) {
    var TEXT_NODE = typeof Element !== 'undefined' && Element.TEXT_NODE || 3;

    handleElement(root);

    function handleElement(el) {
      if (['CODE', 'PRE', 'SCRIPT', 'STYLE'].indexOf(el.nodeName.toUpperCase()) !== -1) {
        return;
      }

      var i, node;
      var childNodes = el.childNodes;
      var textNodes = [];
      var text = '';

      // compile all text first so we handle working around child nodes
      for (i = 0; i < childNodes.length; i++) {
        node = childNodes[i];

        if (node.nodeType === TEXT_NODE || node.nodeName === '#text') {
          textNodes.push([node, text.length]);
          text += node.nodeValue || node.value;
        } else if (node.childNodes && node.childNodes.length) {
          text += handleElement(node);
        }

      }
      text = smartquotes.string(text);
      for (i in textNodes) {
        var nodeInfo = textNodes[i];
        if (nodeInfo[0].nodeValue) {
          nodeInfo[0].nodeValue = text.substr(nodeInfo[1], nodeInfo[0].nodeValue.length);
        } else if (nodeInfo[0].value) {
          nodeInfo[0].value = text.substr(nodeInfo[1], nodeInfo[0].value.length);
        }
      }
      return text;
    }

    return root;
  };

  return smartquotes;
}));
