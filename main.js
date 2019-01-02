makeXhrPostRequest = function (pastedContent) {
  return new Promise(
    resolve => {
      let xhr = new XMLHttpRequest();
      xhr.open('POST', 'https://pasted.tech/api/pastes', true);
      xhr.setRequestHeader('Content-Type', 'application/json')
      xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
          return resolve(xhr.response);
        }
      }
      xhr.send(
        JSON.stringify(
          {
            "content": pastedContent
          }
        )
      )
    }
  )
};

runPastedPost = function (pastedContent) {
  makeXhrPostRequest(pastedContent).then(data => {
    // Add the raw URL to the paste buffer
    var copyTextArea = document.createElement('textarea');
    copyTextArea.style.position = 'fixed';
    copyTextArea.style.opacity = 0;
    copyTextArea.value = data;
    document.body.appendChild(copyTextArea);
    copyTextArea.select();
    document.execCommand('Copy');
    document.body.removeChild(copyTextArea);

    // Notify user content has been copied
    var notificationVar = {
      type: 'basic',
      iconUrl: 'assets/pencil.png',
      title: 'Pasted URL Copied',
      message: data
    };
    chrome.notifications.create('pastedNotification', notificationVar);

    // Open new paste in a browser tab
    var pastedUrl = data.replace(/\.[^/.]+$/, "");
    chrome.tabs.create({ url: pastedUrl, active: false, index: 0 });
  })
}

postPasted = function (word) {
  chrome.tabs.getSelected(null, function (tab) {
    chrome.tabs.executeScript(tab.id, { code: "window.getSelection().toString();" }, function (selection) {
      if (chrome.runtime.lastError) {
        console.log(
          'Error executing "window.getSelection", Error Message: ' + '"' + chrome.runtime.lastError.message + '"'
        );
        runPastedPost(word.selectionText);
      } else {
        runPastedPost(selection[0]);
      };
    });
  });
};

// Set up context menu at install time.
chrome.runtime.onInstalled.addListener(function () {
  var context = ["selection"];
  var title = "Post content to pasted.tech";
  var id = chrome.contextMenus.create(
    {
      "title": title,
      "contexts": context,
      "id": "context" + context[0]
    }
  );
  return id;
});

chrome.contextMenus.onClicked.addListener(postPasted);
