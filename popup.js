var menuItems = [
  {id:'VisualTree',       key:'Ctrl + Alt + V',   separator:false},          // 1
  {id:'GestaltMerging',   key:'Ctrl + Alt + A',   separator:false},          // 2
  {id:'BlockTree',        key:'Ctrl + Alt + B',   separator:true},           // 3
  {id:'AnalyzePage',      key:'Ctrl + Alt + P',   separator:false},          // 4
  {id:'BatchCrawling',    key:'Ctrl + Alt + R',   separator:false},          // 5
]; // var menuItems = [ ... ];

document.addEventListener('DOMContentLoaded', function() {
  // Setup CSS properties
  var style = document.createElement('style');
  style.innerText = 'body {background-color: #EEE; width: 300px; margin: 4px; padding: 0px;}' +
    'li {cursor: default; list-style-type: none; padding: 2px;}' +
    'li:hover {background-color: #CCC;}' +
    'img {max-width: 100%; vertical-align: middle; margin-right: 5px;}' +
    'hr {margin: 0px; padding: 0px; height: 1px; border: 0px; border-top: 1px dotted #CCC;}' +
    'hr.mi-sept {border-top: 1px solid #CCC;}' +
    'span.keys {float: right;}';
  document.head.appendChild(style);

  // Setup menu items
  menuItems.map(function(mi) {
    var li = document.createElement('li');
    li.id = 'li-' + mi.id.toLowerCase();
    document.body.appendChild(li);

    // Menu item interface
    var img = document.createElement('img');
    img.id = 'img-' + mi.id.toLowerCase();
    img.src = chrome.i18n.getMessage(mi.id + '_img');
    li.appendChild(img);
    var span = document.createElement('span');
    span.id = 'span-' + mi.id.toLowerCase();
    span.innerText = chrome.i18n.getMessage(mi.id + '_mi');
    li.appendChild(span);
    span = document.createElement('span');
    span.className = 'keys';
    span.innerText = mi.key;
    li.appendChild(span);
    var hr = document.createElement('hr');
    hr.className = mi.separator ? 'mi-sept' : ''
    document.body.appendChild(hr);

    // Menu item event handler
    li.onclick = (mi.id == 'BatchCrawling') ?
    function() {                                        // Handler of the 'BatchCrawling'
      chrome.runtime.sendMessage({msg: "startBatchCrawling"});
      window.close();
    } : // li.onclick = (mi.id == 'BatchCrawling') ? function() {...} : function() {...};
    function() {                                        // Handler of the rest menu items
      chrome.tabs.query({active:true, currentWindow:true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id,
                              {caller:{mi:mi.id, tab:tabs[0].id}, time:new Date().getTime()},
                              function(response) {
          if (mi.id == 'AnalyzePage') {
            if (!response.msg[0] || !response.msg[1] || !response.msg[2] || !response.msg[3]) {
              window.close();
              return ;
            } // if (!response.msg[0] || !response.msg[1] || !response.msg[2] || !response.msg[3])
            var filename = tabs[0].url.replace(/\\/g, '%5C').replace(/\//g, '%2F').replace(/\:/g, '%3A')
                                      .replace(/\*/g, '%2A').replace(/\?/g, '%3F').replace(/\"/g, '%22')
                                      .replace(/\</g, '%3C').replace(/\>/g, '%3E').replace(/\|/g, '%7C');
            // 1: Download the merging results
            chrome.downloads.download({url:'data:text/html,' + response.msg[0].replace(/\n/g, '<br/>'),
                                       filename:filename+".txt", conflictAction:"overwrite"}, function (downloadId0) {
              // 2: Download the DT xml
              chrome.downloads.download({url:'data:text/html,' + response.msg[1], filename:filename+"-DT.xml",
                                         conflictAction:"overwrite"}, function (downloadId1) {
                // 2: Download the VT xml
                chrome.downloads.download({url:'data:text/html,' + response.msg[2], filename:filename+"-VT.xml",
                                           conflictAction:"overwrite"}, function (downloadId2) {
                  // 3: Download the BT xml
                  chrome.downloads.download({url:'data:text/html,' + response.msg[3], filename:filename+"-BT.xml",
                                             conflictAction:"overwrite"}, function (downloadId3) {
                    console.log(response.timeSpan + "ms - " + tabs[0].url);
                    window.close();
                    /*/ TODO: 4: take screenshot of full pages
                    chrome.windows.getCurrent({}, function(window) {
                      chrome.tabs.captureVisibleTab(window.id, {format: 'png'}, function(dataURI) {
                        chrome.tabs.create({url:dataURI, active:false});
                      }); // chrome.tabs.captureVisibleTab(window.id, {format: 'png'}, function(dataURI) { ... });
                    }); // chrome.windows.getCurrent({}, function(window) { .. });*/
                  }); // chrome.downloads.download( ... );  // download the BT xml
                }); // chrome.downloads.download( ... );  // download the VT xml
              }); // chrome.downloads.download( ... );  // download the DT xml
            }); // chrome.downloads.download( ... );  // download the merging results
          } else {
            chrome.windows.create({url: 'data:text/html, <head><title>' +
                                        chrome.i18n.getMessage('extName') + ' - ' + response.msg[0] +
                                        '</title></head><body><code style="overflow:auto;white-space:nowrap;">' +
                                        response.msg[1].replace(/\n/g, '<br/>') + '</code></body>',
                                   width: 800, height: 450, type: 'panel'}); // chrome.windows.create({...});
            window.close();
          } // else - if (mi.id == 'AnalyzePage') {
        }); // chrome.tabs.sendMessage(tabs[i].id, ...);
      }); // chrome.tabs.query(queryInfo, function(tabs) { ... });
    }; // // li.onclick = (mi.id == 'BatchCrawling') ? function() {...} : function() {...};

  }); // menuItems.map(function(mi) { ... });
}); // document.addEventListener('DOMContentLoaded', function() { ... });
