// Script run within the webview itself.
(function () {
  const iframe = document.querySelector('iframe');
  const showText = document.getElementById("showText");
  const placeholder = document.getElementById("placeholder");

  let token = "am9obm06am9obm0="; //johnm:johnm hardcoded - TODO - fix this

  const loadIframe = (url) => {

    // Send an XHR request first so we can supply an Authorization header
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.withCredentials = true;
    xhr.onreadystatechange = handler;
    xhr.setRequestHeader('Authorization', 'Basic ' + token);
    xhr.send();

    // If we get a good response, this will have planted the session cookie that all subsequent requests need to supply.
    // So now make the iframe go to the launch endpoint.
    function handler() {
      if (this.readyState === this.DONE) {
        if (this.status === 200) {
          //showText.innerText = "Got a good XHR response";
          placeholder.style.display = "none";
          iframe.src = url;
        } else {
          //showText.innerText += " - XHR auth request failed: status = " + this.status;
        }
      }
    }

  }
  // Handle messages sent from the extension to the webview
  window.addEventListener("message", (event) => {
    const message = event.data; // The json data that the extension sent

    loadIframe(message.url);
});

  // This attempt to get focus into the WebTerminal doesn't seem to be working
  function fnLoad() {
    document.querySelector('iframe').focus();
  }

  document.body.addEventListener("load", fnLoad);

})();
