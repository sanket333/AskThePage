let latestPageText = "";
console.log("Background script initialized");
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log("Message received:", msg.type, msg.payload);

  if (msg.type === "PAGE_CONTENT") {
    latestPageText = msg.payload;
    console.log("Latest page text received:", latestPageText);
  } else if (msg.type === "ASK_QUESTION") {
    const answer = `Mock: I read ${latestPageText.length} characters. You asked: "${msg.payload}."`;
    sendResponse({ answer });
    return true;
  }
});
