
import React, { useState, useEffect } from "react";
import { BrowserProvider, Contract } from "ethers";

// ABI из твоего контракта
const contractABI = [
  {
    "inputs": [],
    "name": "getMyEntries",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
          { "internalType": "uint16", "name": "weightKg", "type": "uint16" },
          { "internalType": "uint32", "name": "steps", "type": "uint32" },
          { "internalType": "uint16", "name": "caloriesIn", "type": "uint16" },
          { "internalType": "uint16", "name": "caloriesOut", "type": "uint16" },
          { "internalType": "string", "name": "note", "type": "string" }
        ],
        "internalType": "struct WeightLossDiary.Entry[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint16", "name": "weightKg", "type": "uint16" },
      { "internalType": "uint32", "name": "steps", "type": "uint32" },
      { "internalType": "uint16", "name": "caloriesIn", "type": "uint16" },
      { "internalType": "uint16", "name": "caloriesOut", "type": "uint16" },
      { "internalType": "string", "name": "note", "type": "string" }
    ],
    "name": "addEntry",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const contractAddress = "0xDe65B2b24558Ef18B923D31E9E6be966b9e3b0Bd";
const BASE_CHAIN_ID = 8453;

export default function App() {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [entries, setEntries] = useState([]);

  const connectWallet = async () => {
    if (!window.ethereum) return alert("MetaMask not found");

    const provider = new BrowserProvider(window.ethereum);
    const network = await provider.getNetwork();
    if (Number(network.chainId) !== BASE_CHAIN_ID) {
      alert("Пожалуйста, переключитесь на сеть Base (Chain ID 8453)");
      return;
    }

    const accounts = await provider.send("eth_requestAccounts", []);
    setProvider(provider);
    setAccount(accounts[0]);
  };

  useEffect(() => {
    const fetchEntries = async () => {
      if (!provider || !account) return;

      const signer = await provider.getSigner();
      const contract = new Contract(contractAddress, contractABI, signer);
      const userEntries = await contract.getMyEntries();
      setEntries(userEntries);
    };

    fetchEntries();
  }, [provider, account]);

  return (
    <div>
      <h1>Weight Loss Diary</h1>
      {!account ? (
        <button onClick={connectWallet}>Подключить MetaMask</button>
      ) : (
        <>
          <p>Wallet: {account}</p>
          <h2>Your Entries:</h2>
          <ul>
            {entries.map((e, idx) => (
              <li key={idx}>
                {new Date(Number(e.timestamp) * 1000).toLocaleDateString()} - Вес: {e.weightKg} кг, Шаги: {e.steps}, Калории: {e.caloriesIn} / {e.caloriesOut}, Заметка: {e.note}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
