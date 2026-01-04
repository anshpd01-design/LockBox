Here is a professional README.md file for your project. You can copy this text, save it as a file named README.md (no extension like .txt), and put it in your project folder.

This covers everything from installation to using the extension.
LockBox: Secure Password Manager

LockBox is a secure, offline-first password manager built with Electron. It features local AES-256 encryption, a companion Chrome Extension for autofill, and integrated security checks to detect breached passwords.
🚀 Features

    AES-256 Encryption: Passwords are encrypted locally using a Master Password.

    Zero-Knowledge Architecture: Your Master Password is never stored; it exists only in RAM while the app is running.

    Chrome Autofill: Automatically fills credentials on websites via the companion extension.

    Breach Detection: Checks passwords against the "Have I Been Pwned" database (SHA-1 anonymity).

    Dark Mode UI: sleek, modern interface.

🛠️ Prerequisites

Before running the code, ensure you have Node.js installed on your computer.

    Download Node.js

📥 Installation & Setup
1. Clone or Download

Download this project folder to your computer.
2. Install Dependencies

Open your terminal (Command Prompt/PowerShell) in the project folder and run:
Bash

npm install

3. Run the App (Developer Mode)

To start the application locally:
Bash

npm start

📦 How to Build the Installer (.exe)

To create a standalone LockBox Setup.exe file that you can share with others:

    Run the build command:
    Bash

    npm run dist

    Wait for the process to finish.

    Go to the newly created dist folder.

    You will find LockBox Setup 1.0.0.exe. Double-click this to install the app.

🧩 Installing the Chrome Extension

The extension allows LockBox to autofill passwords in your browser.

    Keep LockBox Running: The Desktop App must be open for the extension to work (it acts as the secure server).

    Open Google Chrome and go to: chrome://extensions

    Toggle Developer mode in the top-right corner.

    Click the Load unpacked button (top-left).

    Select the lockbox-extension folder inside your project directory.

    The LockBox Autofill extension is now installed! 📌 Pin it to your toolbar for easy access.

📖 User Guide
1. First Time Setup

    Open LockBox.

    You will be asked to create a Master Password.

    Important: Do not forget this password! Since it is not stored anywhere, there is no way to recover your data if you lose it.

2. Adding a Password

    Click + Add Password.

    Enter the Website (e.g., netflix), Username, and Password.

    Click Check Security to see if the password has appeared in data leaks.

    Click Encrypt & Save.

3. Using Autofill

    Ensure LockBox is running and you are logged in.

    Go to a website you have saved (e.g., www.netflix.com).

    The extension will detect the site and automatically fill in your username and password.

4. Resetting the Vault

If you forget your Master Password or encounter decryption errors:

    Go to Settings.

    Click Reset Vault & Logout.

    Warning: This permanently deletes all saved passwords and allows you to create a fresh vault.

⚠️ Troubleshooting

"Connection Failed" / Extension not working:

    Make sure the LockBox Desktop App is running. The extension connects to localhost:5000, which is hosted by the app.

"Decryption Failed":

    This happens if you changed your Master Password logic or code. Go to Settings and click Reset Vault to clear old, incompatible data.

🛡️ Security Note for Developers

This project uses crypto-js for AES encryption. The Master Password is used to derive the encryption key and is stored in a runtime variable (runtimeKey). It is never written to config.json or disk, ensuring that if the computer is powered off, the key is lost and data remains encrypted.

Built for MCA Minor Project.
