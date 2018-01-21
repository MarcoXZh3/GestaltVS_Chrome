chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.caller.mi == 'VisualTree') {
    sendResponse({msg:['Visual Tree', printTree(createTree(document.body, 'VT'), 'VT', debug)],
                  timeSpan:new Date().getTime()-request.time});
  } else if (request.caller.mi == 'GestaltMerging') {
    var visualTree = createTree(document.body, 'VT'), blockTree = createTree(visualTree, 'BT');
    var mergingResults = getMergingResults(blockTree);
    var strMRs = '';
    for (var i = 0; i < mergingResults.length; i++) {
    var mr = mergingResults[i];
    for (var j = 0; j < mr.length; j++) {
      var strMR = printTreeNode(mr[j]).trim();
      if (strMR.includes('|- '))
        strMR = strMR.substr(strMR.indexOf('|- ') + 3)
      strMRs += strMR + '\n';
      if (debug)
        console.log(strMR);
    } // for (var j = 0; j < mr.length; j++)
    strMRs += '\n';
    if (debug)
      console.log();
    } // for (var i = 0; i < mergingResults.length; i++)
    updateWebPage(mergingResults);
    sendResponse({msg:['Merging Results', strMRs], timeSpan:new Date().getTime()-request.time});
  } else if (request.caller.mi == 'BlockTree') {
    var visualTree = createTree(document.body, 'VT'), blockTree = createTree(visualTree, 'BT');
    sendResponse({msg:['Block Tree', printTree(blockTree, 'BT', debug)], timeSpan:new Date().getTime()-request.time});
  } else if (request.caller.mi == 'AnalyzePage') {
    var strMRs = '', strDT = '', strVT = '', strBT = '';
    var xmlDT = null, xmlVT = null, xmlBT = '';
    try {
      var oSerializer = new XMLSerializer();
      var domTree = createTree(document.body, 'DT')
      xmlDT = oSerializer.serializeToString(domTree);
      strDT = printTree(domTree, 'DT', debug);
      var visualTree = createTree(document.body, 'VT')
      xmlVT = oSerializer.serializeToString(visualTree);
      strVT = printTree(visualTree, 'VT', debug);
      var blockTree = createTree(visualTree, 'BT')
      xmlBT = oSerializer.serializeToString(blockTree);
      strBT = printTree(blockTree, 'BT', debug);
      var mergingResults = getMergingResults(blockTree);
      for (var i = 0; i < mergingResults.length; i++) {
        var mr = mergingResults[i];
        for (var j = 0; j < mr.length; j++) {
          var strMR = printTreeNode(mr[j]).trim();
          if (strMR.includes('|- '))
            strMR = strMR.substr(strMR.indexOf('|- ') + 3)
          strMRs += strMR + '\n';
          if (debug)
            console.log(strMR);
        } // for (var j = 0; j < mr.length; j++)
        strMRs += '\n';
      } // for (var i = 0; i < mergingResults.length; i++)
      if (update)
        updateWebPage(mergingResults);
    } catch (err) {
        strMRs = '';    strDT = '';     strVT = '';     strBT = '';
        xmlDT = null;   xmlVT = null;   xmlBT = '';
    } finally {
      sendResponse({msg:[[strMRs, strDT, strVT, strBT].join('\n\n'), xmlDT, xmlVT, xmlBT],
                    timeSpan:new Date().getTime()-request.time});
    } // try - catch (err) - finally
  } // if - else if ...
}); // chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) { ... }
