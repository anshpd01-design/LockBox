chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "fetchPassword") {
        const domain = message.domain;
        console.log(`[Background] Fetching for: ${domain}`);

        fetch(`http://localhost:5000/autofill?domain=${domain}`)
            .then(response => response.json())
            .then(data => {
                sendResponse({ success: true, data: data });
            })
            .catch(error => {
                console.error("[Background] Fetch Error:", error);
                sendResponse({ success: false, error: error.message });
            });

        return true; 
    }
});