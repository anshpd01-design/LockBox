const domain = window.location.hostname;

chrome.runtime.sendMessage({ action: "fetchPassword", domain: domain }, (response) => {
    if (response && response.success && response.data.success) {
        console.log("[LockBox] Credentials received.");
        const { username, password } = response.data;
        fillLoginForm(username, password);
    } else {
        console.log("[LockBox] No credentials found or connection failed.");
    }
});

function fillLoginForm(username, password) {
    const inputs = document.querySelectorAll('input');
    
    inputs.forEach(input => {
        const type = input.type.toLowerCase();
        const name = input.name.toLowerCase();
        const id = input.id.toLowerCase();

        if (type === 'password') {
            input.value = password;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            input.style.border = "2px solid #bb86fc"; 
        }

        if ((type === 'text' || type === 'email') && 
            (name.includes('user') || name.includes('email') || name.includes('login') || 
             id.includes('user') || id.includes('email') || id.includes('login'))) {
            
            if (input.value === "") {
                input.value = username;
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.dispatchEvent(new Event('change', { bubbles: true }));
                input.style.border = "2px solid #bb86fc";
            }
        }
    });
}