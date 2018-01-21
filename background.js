var startBatchCrawling = false;
var idx = 0, finished = 0;

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.status == "complete" && startBatchCrawling) {
    chrome.tabs.sendMessage(tabId, {caller:{mi:'AnalyzePage', tab:tabId}, time:new Date().getTime()},
                            function(response) {
      setTimeout(function(){
        if (!response || !response.msg[0] || !response.msg[1] || !response.msg[2] || !response.msg[3]) {
          chrome.tabs.remove(tabId);
          console.log((++finished) + "/" + URLS.length + " - " + tab.url);
          if (idx++ < URLS.length)
            chrome.tabs.create({url:URLS[idx], active:false});
          return ;
        } // if (!response.msg[0] || !response.msg[1] || !response.msg[2] || !response.msg[3])

        var filename = tab.url.replace(/\\/g, '%5C').replace(/\//g, '%2F').replace(/\:/g, '%3A')
                              .replace(/\*/g, '%2A').replace(/\?/g, '%3F').replace(/\"/g, '%22')
                              .replace(/\</g, '%3C').replace(/\>/g, '%3E').replace(/\|/g, '%7C');
        // 1: Download the merging results
        chrome.downloads.download({url:'data:text/html,' + response.msg[0].replace(/\n/g, '<br/>'),
                                   filename:filename+".txt", conflictAction:"overwrite"}, function (downloadId0) {
          // 2: Download the DT xml
          chrome.downloads.download({url:'data:text/html,' + response.msg[1], filename:filename+"-DT.txt",
                                     conflictAction:"overwrite"}, function (downloadId1) {
            // 2: Download the VT xml
            chrome.downloads.download({url:'data:text/html,' + response.msg[2], filename:filename+"-VT.txt",
                                       conflictAction:"overwrite"}, function (downloadId2) {
              // 3: Download the BT xml
              chrome.downloads.download({url:'data:text/html,' + response.msg[3], filename:filename+"-BT.txt",
                                         conflictAction:"overwrite"}, function (downloadId3) {
                /*/ 4: take screenshot
                chrome.windows.getCurrent({}, function(window) {
                  chrome.tabs.captureVisibleTab(window.id, {format: 'png'}, function(dataURI) {
                    // 5: close this tab and go next
                    chrome.tabs.remove(tabId);
                    console.log((++finished) + "/" + URLS.length + " - " + response.timeSpan + "ms");
                    if (idx++ < URLS.length)
                      chrome.tabs.create({url:URLS[idx], active:true});
                  }); // chrome.tabs.captureVisibleTab(window.id, {format: 'png'}, function(dataURI) { ... });
                }); // chrome.windows.getCurrent({}, function(window) { .. });*/
                chrome.tabs.remove(tabId);
                console.log((++finished) + "/" + URLS.length + " - " + response.timeSpan + "ms");
                if (idx++ < URLS.length)
                  chrome.tabs.create({url:URLS[idx], active:false});
              }); // chrome.downloads.download( ... );  // download the BT xml
            }); // chrome.downloads.download( ... );  // download the VT xml
          }); // chrome.downloads.download( ... );  // download the DT xml
        }); // chrome.downloads.download( ... );  // download the merging results
      }, 2000); // setTimeout(function(){...}, 2000);
    }); // chrome.tabs.sendMessage(tabId, {...}, function(response) { ... });
  } // if (changeInfo.status == "complete")
}); // chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) { ... });

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.msg == "startBatchCrawling") {
    for (idx = 0; idx < GROUP_SIZE && idx < URLS.length; idx++)
      chrome.tabs.create({url:URLS[idx], active:false});
    startBatchCrawling = true;
  } // if (request.msg == "startBatchCrawling")
}); // chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) { ... });
