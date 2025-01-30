# **CertiChain - Piattaforma per Certificati Digitali su Blockchain**

### **Università degli Studi di Salerno**
📚 **Corso di Laurea in Informatica**  
📌 **Esame: Sicurezza dei Dati**  
👨‍🏫 **Docente: Prof. Christiancarmine Esposito**  
📅 **Anno Accademico: 2024/2025**

---

## **📌 Descrizione del Progetto**

**CertiChain** è una piattaforma decentralizzata per la gestione di certificati digitali basata su blockchain.  
Il progetto dimostra come la **tecnologia blockchain** possa migliorare la sicurezza, l'integrità e la verificabilità dei certificati digitali, eliminando il rischio di falsificazione e semplificando il processo di verifica.

### **🚀 Funzionalità principali**
✔️ **Emissione di certificati** → Gli enti certificatori possono creare certificati digitali per i beneficiari.  
✔️ **Revoca di certificati** → Un certificato errato o non valido può essere revocato con una motivazione.  
✔️ **Verifica dell’autenticità** → Aziende, università e terzi possono verificare i certificati inserendo un identificativo univoco.  
✔️ **Condivisione semplice** → I beneficiari possono generare link o QR code per mostrare i propri certificati.  
✔️ **Trasparenza e sicurezza** → La blockchain garantisce **immutabilità** e **accesso pubblico ai dati** senza intermediari.

---

## **🛠️ Funzionalità in dettaglio**

### **1️⃣ Emissione Certificati (Admin)**
🔹 Gli amministratori (enti certificatori) possono **mintare** certificati digitali come NFT (ERC-721).  
🔹 Ogni certificato è associato a:
- **Indirizzo del beneficiario (wallet Ethereum)**
- **Parola segreta hashata (SHA-256)** per garantire la privacy e la sicurezza
- **Collegamento IPFS** per il certificato PDF

---

### **2️⃣ Revoca Certificati (Admin)**
🔹 Un certificato può essere **revocato** dall’ente emittente per motivi specifici.  
🔹 I certificati revocati vengono **marcati come non validi** e la motivazione viene registrata sulla blockchain.

---

### **3️⃣ Verifica Certificati (Verifier - Accesso Pubblico)**
🔹 **Non è richiesto MetaMask**: chiunque può verificare un certificato senza un wallet.  
🔹 Inserendo il **Token ID** e la **parola segreta**, il verificatore può confermare la validità del certificato.  
🔹 Se il certificato è revocato, verrà mostrata la motivazione.

---

### **4️⃣ Visualizzazione e Condivisione Certificati (User)**
🔹 Gli utenti possono vedere tutti i certificati associati al loro **wallet Ethereum**.  
🔹 Possono **verificare i dettagli** inserendo la parola segreta.  
🔹 È possibile **condividere un link o QR code** per permettere ad altri di verificare il certificato.

---

## **📐 Architettura del Progetto**

CertiChain combina **smart contract Ethereum** con un **frontend moderno** per offrire un’esperienza fluida e sicura.

### **🔗 1. Smart Contract (Solidity)**
✔️ **AccessControlManager** → Gestisce i ruoli di amministratore ed emittente.  
✔️ **CertificateNFT** → Implementa lo standard **ERC-721** per i certificati.  
✔️ **CertificateRegistry** → Registra le informazioni dei certificati e ne permette la verifica/revoca.

---

### **💻 2. Frontend (Web3 + IPFS)**
✔️ **HTML5, CSS3, Bootstrap** → Per un'interfaccia responsiva e moderna.  
✔️ **Vanilla JavaScript + Ethers.js** → Per interagire con la blockchain.  
✔️ **IPFS** → Per l’archiviazione decentralizzata dei documenti PDF.

---

## **⚙️ Tecnologie Utilizzate**

| Componente      | Tecnologia 📦 |
|----------------|--------------|
| **Blockchain** | Ethereum (Hardhat) |
| **Smart Contract** | Solidity, OpenZeppelin |
| **Framework Blockchain** | Hardhat |
| **Frontend** | HTML, CSS, JavaScript, Bootstrap |
| **Web3 Integration** | Ethers.js |
| **Archiviazione Dati** | IPFS |

---

## **📥 Installazione e Setup**

### **🛠 Prerequisiti**
✅ **Node.js e npm** installati  
✅ **MetaMask** configurato con la rete locale Hardhat  
✅ **Ambiente Hardhat** per deployare gli smart contract  
✅ **IPFS installato e in esecuzione**

### **🔧 Setup del progetto**
1️⃣ **Clona il repository**
```bash
git clone https://github.com/matthew-2000/CertiChain.git
cd CertiChain
```
2️⃣ **Installa le dipendenze**
```bash
npm install
```
3️⃣ **Avvia la blockchain locale (Hardhat)**
```bash
npx hardhat node
```
4️⃣ **Compila e deploya gli smart contract**
```bash
npx hardhat compile
npx hardhat run scripts/deploy.js --network localhost
```
5️⃣ **Installa e avvia un nodo IPFS locale**
```bash
npm install -g ipfs
ipfs init
ipfs daemon
```
6️⃣ **Avvia il frontend**
```bash
npm run dev
```
- Apri il browser e accedi a `http://localhost:3000`

---

## **📌 Utilizzo della Piattaforma**

### **🔑 1. Login con MetaMask**
Gli utenti devono connettere il proprio wallet per accedere alle funzionalità.

### **👨‍💼 2. Ruoli e Pagine**
| Ruolo | Funzioni |
|----------------|----------------|
| **Admin** | Emette e revoca certificati |
| **User** | Visualizza e condivide certificati |
| **Verifier** | Verifica l’autenticità di un certificato (senza login) |

### **🔍 3. Processo di Verifica**
1️⃣ Inserisci il **Token ID** e la **parola segreta** nella sezione **Verifier**.  
2️⃣ Il sistema verifica l'autenticità e restituisce le informazioni del certificato.  
3️⃣ Se il certificato è valido, mostra l’IPFS link e i dettagli.  
4️⃣ Se è revocato, viene mostrato il motivo della revoca.

---

## **📌 Sicurezza e Vantaggi**

✅ **Immutabilità** → I dati su blockchain non possono essere alterati.  
✅ **Accessibilità globale** → Chiunque può verificare un certificato, senza bisogno di un database centrale.  
✅ **Decentralizzazione** → Nessuna autorità centrale può modificare o falsificare i certificati.  
✅ **Integrazione con IPFS** → I documenti non sono salvati on-chain, ma in un archivio decentralizzato.

---

## **👥 Contributori**

👨‍💻 **Matteo Ercolino**  
📍 **Università degli Studi di Salerno**

Progetto realizzato per l’esame di **Sicurezza dei Dati**.

---

## **📜 Licenza**
📄 Questo progetto è distribuito sotto licenza **MIT**. Consulta il file `LICENSE` per maggiori dettagli.

---

### **🚀 Contatti & Link Utili**
📧 Per info: [m.ercolino1@studenti.unisa.it](m.ercolino1@studenti.unisa.it)  
🌐 IPFS Gateway: [ipfs.io](https://ipfs.io)

---

## **🔥 Conclusione**
**CertiChain** rappresenta un'innovazione nel mondo della gestione dei certificati digitali. Grazie all'integrazione con **blockchain e IPFS**, la piattaforma garantisce **sicurezza, trasparenza e accessibilità globale**. 🚀

Se sei interessato a contribuire o migliorare il progetto, sentiti libero di **aprire una pull request** o segnalare miglioramenti nella sezione **Issues** su GitHub! 💡✨