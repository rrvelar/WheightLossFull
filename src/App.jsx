
import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';

const contractAddress = '0xDe65B2b24558Ef18B923D31E9E6be966b9e3b0Bd';
const abi = [
  "function addEntry(uint16 weightKg, uint32 steps, uint16 caloriesIn, uint16 caloriesOut, string note)",
  "function getMyEntries() view returns (tuple(uint256 timestamp, uint16 weightKg, uint32 steps, uint16 caloriesIn, uint16 caloriesOut, string note)[])"
];

export default function App() {
  const [wallet, setWallet] = useState(null);
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    if (wallet) fetchEntries();
  }, [wallet]);

  async function connectWallet() {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setWallet({ provider, signer, address });
    }
  }

  async function fetchEntries() {
    const contract = new ethers.Contract(contractAddress, abi, wallet.provider);
    const data = await contract.getMyEntries();
    setEntries(data);
  }

  return (
    <div>
      <h1>Weight Loss Diary</h1>
      {!wallet ? (
        <button onClick={connectWallet}>Подключить MetaMask</button>
      ) : (
        <>
          <p>Wallet: {wallet.address}</p>
          <h2>Your Entries:</h2>
          <ul>
            {entries.map((entry, index) => (
              <li key={index}>
                {new Date(entry.timestamp * 1000).toLocaleDateString()} – Вес: {entry.weightKg} кг, Шаги: {entry.steps}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
