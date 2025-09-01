window.addEventListener("load", () => {
  const pageText = document.body.innerText || '';
  chrome.runtime.sendMessage({ type: "PAGE_CONTENT", payload: pageText });
});
