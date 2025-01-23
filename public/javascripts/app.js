async function connectMetaMask() {
    if (window.ethereum) {
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const address = await signer.getAddress();

            // Salvataggio dell'indirizzo utente
            localStorage.setItem('userAddress', address);
            document.getElementById('userAddress').innerText = `Connesso: ${address}`;
            console.log("Utente connesso:", address);
        } catch (error) {
            console.error("Errore durante la connessione:", error);
        }
    } else {
        alert("MetaMask non rilevato. Installa MetaMask per proseguire.");
    }
}

document.getElementById('connectBtn').addEventListener('click', connectMetaMask);