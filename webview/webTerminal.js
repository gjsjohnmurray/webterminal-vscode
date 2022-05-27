// Script run within the webview itself.
(function () {
  // Handle messages sent from the extension to the webview
  window.addEventListener("message", (event) => {
    const message = event.data; // The json data that the extension sent
    document.querySelector('iframe').src = message.url;
  });
})();
