# CertiChain - Piattaforma per Certificati Digitali su Blockchain

### **Università degli Studi di Salerno**
Progetto per l'esame di **Sicurezza dei Dati**  
Docente: **Prof. Christiancarmine Esposito**  
Anno Accademico: **2024/2025**

---

## **Descrizione del Progetto**

**CertiChain** è una piattaforma decentralizzata basata su blockchain progettata per gestire certificati digitali in modo sicuro, trasparente e verificabile.  
Il progetto ha lo scopo di dimostrare l'utilizzo di tecnologie blockchain per migliorare la sicurezza e l'affidabilità nella gestione di certificati, risolvendo problemi legati alla falsificazione, verifica e revoca.

La piattaforma implementa un sistema di certificazione digitale con le seguenti funzionalità:

- **Emissione di certificati**: Gli enti certificatori possono creare certificati digitali associati a un beneficiario.
- **Revoca di certificati**: I certificati errati o invalidi possono essere revocati con una motivazione.
- **Verifica di autenticità**: Aziende e terzi possono verificare la validità e l'autenticità di un certificato tramite un identificativo unico.
- **Condivisione di certificati**: I beneficiari possono condividere i loro certificati attraverso link univoci o QR code.
- **Gestione decentralizzata**: La piattaforma utilizza la blockchain per registrare dati immutabili, garantendo trasparenza e sicurezza.

---

## **Funzionalità**

### **1. Emissione Certificati (Admin)**
- Gli amministratori (enti certificatori) possono emettere certificati a studenti o beneficiari specificando:
    - Nome dell'istituzione.
    - Nome del corso o certificazione.
    - Nome del beneficiario.
    - Data di emissione.
    - Link IPFS per memorizzare dati decentralizzati.
- Il certificato viene mintato come NFT (token ERC-721).

### **2. Revoca Certificati (Admin)**
- Gli amministratori possono revocare un certificato emesso specificando un motivo.
- I certificati revocati vengono segnati come non validi e possono essere verificati come tali.

### **3. Verifica Certificati (Verifier)**
- Chiunque può verificare un certificato inserendo il suo identificativo unico (Token ID).
- Viene restituita la validità del certificato, informazioni sull'ente certificatore, beneficiario e altri dettagli.

### **4. Visualizzazione e Condivisione Certificati (User)**
- Gli utenti possono visualizzare i certificati associati al loro wallet.
- Possono generare link condivisibili o QR code per fornire accesso rapido alle informazioni dei certificati.

---

## **Architettura del Progetto**

CertiChain utilizza una combinazione di **smart contract** su blockchain Ethereum e un'interfaccia utente moderna per fornire una piattaforma intuitiva e scalabile.

### **1. Smart Contract**
Gli smart contract principali includono:
- **AccessControlManager**: Gestisce i ruoli e i permessi (Admin e Issuer).
- **CertificateNFT**: Implementa il token ERC-721 per rappresentare i certificati come NFT.
- **CertificateRegistry**: Mantiene un registro di tutti i certificati emessi, verificabili e revocati.

### **2. Frontend**
L'interfaccia utente è sviluppata con tecnologie moderne:
- **HTML5 e CSS3**: Per il layout e il design responsivo.
- **Bootstrap 5**: Per uno stile elegante e professionale.
- **JavaScript (Vanilla)**: Per la logica dell'applicazione.
- **Ethers.js**: Per l'interazione con gli smart contract sulla blockchain.

---

## **Tecnologie Utilizzate**

### **Backend (Smart Contract)**
- **Solidity**: Per la scrittura degli smart contract.
- **OpenZeppelin**: Librerie per implementare standard ERC-721 e gestione dei ruoli.
- **Hardhat**: Framework per compilare, testare e deployare smart contract.

### **Frontend**
- **HTML5**: Struttura delle pagine web.
- **CSS3 e Bootstrap 5**: Per uno stile professionale.
- **JavaScript (Ethers.js)**: Per connettere la blockchain al frontend.
- **IPFS**: Per memorizzare dati decentralizzati e collegarli ai certificati.

### **Blockchain**
- **Ethereum (Rete di test locale HardHat)**: Piattaforma blockchain per la registrazione dei certificati e la loro verifica.

---

## **Installazione**

### **Prerequisiti**
- Node.js e npm installati.
- Metamask configurato su rete locale HardHat.
- Ambiente Hardhat per lavorare con smart contract.

### **Setup**
1. Clona il repository:
   ```bash
   git clone https://github.com/tuo-username/certichain.git
   cd certichain
   ```
2. Installa le dipendenze:
   ```bash
   npm install
   ```
3. Configura la rete blockchain:
    - Modifica il file `hardhat.config.js` con i dettagli della tua rete.
4. Deploya i contratti:
   ```bash
   npx hardhat run scripts/deploy.js --network localhost
   ```
5. Avvia il frontend:
    - Apri `index.html` in un browser con Metamask configurato.

---

## **Utilizzo**

### **1. Login con Metamask**
- Gli utenti possono accedere alla piattaforma collegando il loro wallet Ethereum tramite Metamask.

### **2. Ruoli e Pagine**
- **Admin**:
    - Emissione e revoca certificati.
- **User**:
    - Visualizzazione e condivisione dei certificati.
- **Verifier**:
    - Verifica di autenticità dei certificati.

### **3. Processo di Verifica**
- Inserisci il Token ID di un certificato nella sezione `Verifier`.
- I dettagli vengono recuperati dalla blockchain, inclusi validità, ente certificatore e motivi di revoca (se applicabili).

---

## **Contributori**
- **Matteo Ercolino**
- Progetto realizzato per l'esame di **Sicurezza dei Dati** all'Università degli Studi di Salerno.

---

## **Licenza**
Questo progetto è distribuito sotto la licenza **MIT**. Consulta il file `LICENSE` per maggiori dettagli.
