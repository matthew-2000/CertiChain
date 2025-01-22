const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const contractABI = [
    {
        "inputs": [{ "internalType": "string", "name": "_message", "type": "string" }],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [],
        "name": "getMessage",
        "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "string", "name": "_newMessage", "type": "string" }],
        "name": "setMessage",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

if (typeof ethers === "undefined") {
    console.error("Ethers.js non è stato caricato correttamente.");
} else {
    console.log("Ethers.js caricato con successo.");
}

async function connectMetaMask() {
    if (typeof window.ethereum !== 'undefined' && typeof ethers !== 'undefined') {
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });

            // Creazione del provider compatibile con ethers v6
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();

            // Recupero dell'indirizzo dell'account corretto per ethers v6
            const address = await signer.getAddress();
            console.log("Account connesso:", address);

            return new ethers.Contract(contractAddress, contractABI, signer);
        } catch (error) {
            console.error("Errore durante la connessione a MetaMask:", error.message || error);
        }
    } else {
        alert("MetaMask o ethers.js non disponibili. Assicurati di averli installati correttamente.");
    }
}

async function getMessage() {
    const contract = await connectMetaMask();
    const message = await contract.getMessage();
    document.getElementById("message").innerText = message;
}

async function setMessage() {
    const contract = await connectMetaMask();
    const newMessage = document.getElementById("messageInput").value;
    await contract.setMessage(newMessage);
}
