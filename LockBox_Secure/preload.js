const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    checkUserExists: () => ipcRenderer.invoke('check-user-exists'),
    signup: (pass) => ipcRenderer.invoke('signup', pass),
    login: (pass) => ipcRenderer.invoke('login', pass),
    resetVault: () => ipcRenderer.invoke('reset-vault'),

    savePassword: (data) => ipcRenderer.invoke('save-password', data),
    getPasswords: () => ipcRenderer.invoke('get-passwords'),
    deletePassword: (id) => ipcRenderer.invoke('delete-password', id),
    copyPassword: (cipher) => ipcRenderer.invoke('copy-password', cipher),
    checkBreach: (pass) => ipcRenderer.invoke('check-breach', pass)
});