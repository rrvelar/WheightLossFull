
import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';

const CONTRACT_ADDRESS = "0xDe65B2b24558Ef18B923D31E9E6be966b9e3b0Bd";
const ABI = [
  "function addEntry(uint256 weight, uint256 steps, uint256 calories, string comment)",
  "function getMyEntries() view returns (tuple(uint256 weight, uint256 steps, uint256 calories, string comment, uint256 timestamp)[])"
];

export default function App() {
  const [wallet, setWallet] = useState(null);
  const [entries, setEntries] = useState([]);

  const connect = async () => {
    if (!window.ethereum) return alert("Install MetaMask");
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    setWallet(accounts[0]);

    const network = await provider.getNetwork();
    if (network.chainId !== 8453n) {
      alert("Please switch to Base Mainnet");
      return;
    }

    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
    const result = await contract.getMyEntries();
    setEntries(result);
  };

  return (
    <div>
      <h1>Weight Loss Diary</h1>
      <button onClick={connect}>Подключить MetaMask</button>
      {wallet && <p>Wallet: {wallet}</p>}
      <h2>Your Entries:</h2>
      <ul>
        {entries.map((entry, i) => (
          <li key={i}>
            Вес: {entry.weight.toString()}, Шаги: {entry.steps.toString()}, Калории: {entry.calories.toString()}, Комментарий: {entry.comment}
          </li>
        ))}
      </ul>
    </div>
  );
}
