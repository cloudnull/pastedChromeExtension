function makeXhrPostRequest(pastedContent) {
  return new Promise(
    resolve => {
      let xhr = new XMLHttpRequest();
      xhr.open('POST', 'https://pasted.tech/api/pastes', true);
      xhr.setRequestHeader('Content-Type', 'application/json')
      xhr.onload = function() {
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
}

postPasted = function(word) {
  var pastedContent = word.selectionText;
  makeXhrPostRequest(pastedContent).then(data => {
    var pastedUrl = data.replace(/\.[^/.]+$/, "")
    chrome.tabs.create({url: pastedUrl});
  })
};

chrome.contextMenus.create({
  title: "Post content to pasted.tech",
  contexts:["selection"],
  onclick: postPasted
});
