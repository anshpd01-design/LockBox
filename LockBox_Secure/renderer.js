const addBtn = document.getElementById('addBtn');
const modal = document.getElementById('modal');
const closeBtn = document.getElementById('closeBtn');
const addForm = document.getElementById('addForm');
const list = document.getElementById('passwordList');
const searchInput = document.getElementById('searchInput');

const vaultView = document.getElementById('vaultView');
const settingsView = document.getElementById('settingsView');
const navVault = document.querySelector('.nav-item:nth-child(1)');
const navSettings = document.querySelector('.nav-item:nth-child(2)');

const passInput = document.getElementById('password');
const checkBtn = document.getElementById('checkBtn');
const breachStatus = document.getElementById('breachStatus');
let currentBreachCount = 0;

const authOverlay = document.getElementById('authOverlay');
const authTitle = document.getElementById('authTitle');
const authSub = document.getElementById('authSub');
const masterPassInput = document.getElementById('masterPassInput');
const authBtn = document.getElementById('authBtn');
const authError = document.getElementById('authError');

window.onload = async () => {
    modal.style.display = "none";
    
    const userExists = await window.api.checkUserExists();
    
    if (userExists) {
        authTitle.innerText = "Welcome Back";
        authSub.innerText = "Enter your Master Password to unlock.";
        authBtn.innerText = "Unlock Vault";
        
        setTimeout(() => masterPassInput.focus(), 100);

        authBtn.onclick = async () => {
            const success = await window.api.login(masterPassInput.value);
            if (success) {
                authOverlay.style.display = "none";
                loadPasswords();
            } else {
                authError.style.display = "block";
                authError.innerText = "Incorrect Password";
            }
        };
    } else {
        authTitle.innerText = "Setup Vault";
        authSub.innerText = "Create a Master Password. Don't lose this!";
        authBtn.innerText = "Create Vault";

        setTimeout(() => masterPassInput.focus(), 100);

        authBtn.onclick = async () => {
            if(masterPassInput.value.length < 4) {
                authError.style.display = "block";
                authError.innerText = "Password is too short";
                return;
            }
            await window.api.signup(masterPassInput.value);
            authOverlay.style.display = "none";
            loadPasswords();
        };
    }
};

navVault.onclick = () => {
    vaultView.style.display = "block";
    settingsView.style.display = "none";
    navVault.classList.add('active');
    navSettings.classList.remove('active');
};

navSettings.onclick = () => {
    vaultView.style.display = "none";
    settingsView.style.display = "block";
    navVault.classList.remove('active');
    navSettings.classList.add('active');
};

document.getElementById('resetBtn').onclick = async () => {
    if(confirm("ARE YOU SURE? This will delete all passwords permanently and cannot be undone.")) {
        await window.api.resetVault();
    }
};

addBtn.onclick = () => {
    modal.style.display = "flex";
    addForm.reset();
    breachStatus.innerText = "";
    currentBreachCount = 0;
};
closeBtn.onclick = () => modal.style.display = "none";
window.onclick = (e) => { if(e.target == modal) modal.style.display = "none"; };

checkBtn.onclick = async () => {
    const pass = passInput.value;
    if(!pass) return;

    checkBtn.innerText = "Checking...";
    breachStatus.style.color = "#a0a0a0";
    breachStatus.innerText = "Contacting Database...";

    const count = await window.api.checkBreach(pass);
    currentBreachCount = count;

    checkBtn.innerText = "Check Security";
    
    if (count === -1) {
        breachStatus.innerText = "⚠️ Offline.";
        breachStatus.style.color = "#e0e0e0";
    } else if (count > 0) {
        breachStatus.innerHTML = `<i class="fas fa-exclamation-triangle"></i> DANGER: Found in <b>${count}</b> breaches!`;
        breachStatus.style.color = "#cf6679";
    } else {
        breachStatus.innerHTML = `<i class="fas fa-check-circle"></i> Safe.`;
        breachStatus.style.color = "#03dac6";
    }
};

addForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const site = document.getElementById('siteName').value;
    const user = document.getElementById('username').value;
    const pass = passInput.value;

    if(currentBreachCount === 0 && pass) {
        const count = await window.api.checkBreach(pass);
        if(count > 0) currentBreachCount = count;
    }

    await window.api.savePassword({ 
        site, 
        user, 
        pass,
        breachCount: currentBreachCount 
    });

    modal.style.display = "none";
    loadPasswords();
});

async function loadPasswords() {
    try {
        const passwords = await window.api.getPasswords();
        const term = searchInput.value.toLowerCase();
        list.innerHTML = '';

        passwords.forEach(p => {
            if(p.site.toLowerCase().includes(term)) {
                const card = document.createElement('div');
                card.className = 'card';
                
                let badge = `<span class="tag safe"><i class="fas fa-shield-alt"></i> Secure</span>`;
                if(p.breachCount > 0) {
                    badge = `<span class="tag leaked"><i class="fas fa-radiation"></i> Leaked ${p.breachCount} times</span>`;
                }

                card.innerHTML = `
                    <div class="card-header">
                        <h3>${p.site}</h3>
                        <i class="fas fa-trash delete-icon"></i>
                    </div>
                    <div class="card-user">
                        <i class="fas fa-user-circle"></i> ${p.user}
                    </div>
                    <div style="margin-bottom:15px;">${badge}</div>
                    <button class="copy-btn">
                        <i class="fas fa-copy"></i> Copy Password
                    </button>
                `;

                const delBtn = card.querySelector('.delete-icon');
                delBtn.onclick = async () => {
                    if(confirm("Delete this entry?")) {
                        await window.api.deletePassword(p.id);
                        loadPasswords(); 
                    }
                };

                const copyBtn = card.querySelector('.copy-btn');
                copyBtn.onclick = async () => {
                    await window.api.copyPassword(p.pass);
                    const originalHTML = copyBtn.innerHTML;
                    copyBtn.innerHTML = `<i class="fas fa-check"></i> Copied!`;
                    copyBtn.style.color = "#03dac6";
                    setTimeout(() => {
                        copyBtn.innerHTML = originalHTML;
                        copyBtn.style.color = "";
                    }, 1500);
                };

                list.appendChild(card);
            }
        });
    } catch (error) {
        console.error("Error loading passwords:", error);
    }
}

searchInput.addEventListener('keyup', loadPasswords);