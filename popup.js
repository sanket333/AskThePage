document.getElementById("askBtn").addEventListener("click", async () => {
  const question = document.getElementById("question").value;
  const answerDiv = document.getElementById("answer");
  answerDiv.textContent = "Thinking...";

  // Get stored page content
  const { lastPageContent } = await chrome.storage.local.get("lastPageContent");

  if (!lastPageContent) {
    answerDiv.textContent = "No page content available yet.";
    return;
  }

  // Call your backend/LLM API
  const response = await fetch("http://localhost:3000/api", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, page: lastPageContent }),
  });

  const data = await response.json();
  answerDiv.textContent = data.answer || "No response.";
});
