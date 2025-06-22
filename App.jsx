import { useState, useEffect } from "react";
import { BrowserProvider } from "ethers";
import { ethers } from "ethers";
import abi from "./abi.json";

const contractAddress = "0xDe65B2b24558Ef18B923D31E9E6be966b9e3b0Bd";

function App() {
  const [provider, setProvider] = useState(null);
  const [address, setAddress] = useState(null);
  const [contract, setContract] = useState(null);
  const [entries, setEntries] = useState([]);

  const connectWallet = async () => {
    if (window.ethereum) {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      setProvider(provider);
      setAddress(userAddress);
      const c = new ethers.Contract(contractAddress, abi, signer);
      setContract(c);
    } else {
      alert("Please install MetaMask");
    }
  };

  useEffect(() => {
    const fetchEntries = async () => {
      if (contract && address) {
        try {
          const data = await contract.getMyEntries();
          setEntries(data);
        } catch (err) {
          console.error("Error fetching entries", err);
        }
      }
    };
    fetchEntries();
  }, [contract, address]);

  return (
    <div>
      <h1>Weight Loss Diary</h1>
      {!address ? (
        <button onClick={connectWallet}>Подключить MetaMask</button>
      ) : (
        <div>
          <p>Wallet: {address}</p>
          <h2>Your Entries:</h2>
          <ul>
            {entries.map((entry, index) => (
              <li key={index}>
                {new Date(Number(entry.timestamp) * 1000).toLocaleString()} —{" "}
                {entry.weightKg} kg, {entry.steps} steps
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;