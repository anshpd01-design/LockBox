const { app, BrowserWindow, ipcMain, clipboard } = require('electron');
const path = require('path');
const Store = require('electron-store');
const CryptoJS = require("crypto-js");
const https = require('https'); 
const express = require('express');
const cors = require('cors');

let runtimeKey = null; 

const store = new Store();
let mainWindow;

const server = express();
server.use(cors());

server.get('/autofill', (req, res) => {
    if (!runtimeKey) {
        return res.json({ success: false, error: "Vault Locked" });
    }

    const domain = req.query.domain.toLowerCase();
    console.log(`[Server] Extension asked for: ${domain}`);

    const passwords = store.get('passwords') || [];
    
    const entry = passwords.find(p => {
        const site = p.site.toLowerCase();
        return site.includes(domain) || domain.includes(site);
    });

    if (entry) {
        try {
            const bytes = CryptoJS.AES.decrypt(entry.pass, runtimeKey);
            const originalPass = bytes.toString(CryptoJS.enc.Utf8);
            
            if (!originalPass) throw new Error("Decryption failed");

            res.json({ success: true, username: entry.user, password: originalPass });
        } catch (e) {
            console.log("[Server] Decryption Error - Key Mismatch");
            res.json({ success: false, error: "Decryption Failed" });
        }
    } else {
        res.json({ success: false });
    }
});

server.listen(5000, () => {
    console.log("LockBox Server Ready on http://localhost:5000");
});

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1050,
        height: 750,
        backgroundColor: '#121212',
        icon: path.join(__dirname, 'icon.png'), 
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        },
        autoHideMenuBar: true
    });
    mainWindow.loadFile('index.html');
}

app.whenReady().then(createWindow);

ipcMain.handle('check-user-exists', () => {
    return store.has('masterHash');
});

ipcMain.handle('signup', (event, password) => {
    const hash = CryptoJS.SHA256(password).toString();
    store.set('masterHash', hash);
    runtimeKey = password;
    return true;
});

ipcMain.handle('login', (event, password) => {
    const storedHash = store.get('masterHash');
    const inputHash = CryptoJS.SHA256(password).toString();
    if (storedHash === inputHash) {
        runtimeKey = password;
        return true;
    }
    return false;
});

ipcMain.handle('save-password', async (event, data) => {
    if (!runtimeKey) return false;
    try {
        const encryptedPass = CryptoJS.AES.encrypt(data.pass, runtimeKey).toString();
        const newEntry = {
            id: Date.now(),
            site: data.site,
            user: data.user,
            pass: encryptedPass,
            breachCount: data.breachCount || 0
        };
        let passwords = store.get('passwords') || [];
        passwords.push(newEntry);
        store.set('passwords', passwords);
        return true;
    } catch (e) { return false; }
});

ipcMain.handle('get-passwords', async () => {
    if (!runtimeKey) return [];
    return store.get('passwords') || [];
});

ipcMain.handle('delete-password', async (event, id) => {
    let passwords = store.get('passwords') || [];
    passwords = passwords.filter(p => p.id !== id);
    store.set('passwords', passwords);
    return true;
});

ipcMain.handle('copy-password', async (event, cipherText) => {
    if (!runtimeKey) return false;
    try {
        const bytes = CryptoJS.AES.decrypt(cipherText, runtimeKey);
        const originalText = bytes.toString(CryptoJS.enc.Utf8);
        clipboard.writeText(originalText);
        return true;
    } catch (e) { return false; }
});

ipcMain.handle('reset-vault', () => {
    store.clear();
    runtimeKey = null;
    app.relaunch();
    app.exit();
    return true;
});

ipcMain.handle('check-breach', async (event, plainPassword) => {
    return new Promise((resolve) => {
        const sha1 = CryptoJS.SHA1(plainPassword).toString(CryptoJS.enc.Hex).toUpperCase();
        const prefix = sha1.substring(0, 5);
        const suffix = sha1.substring(5);
        const url = `https://api.pwnedpasswords.com/range/${prefix}`;

        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const match = data.split('\r\n').find(line => line.startsWith(suffix));
                if (match) {
                    const count = match.split(':')[1];
                    resolve(parseInt(count));
                } else {
                    resolve(0);
                }
            });
        }).on('error', () => resolve(-1));
    });
});