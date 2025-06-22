
import { useEffect, useState } from "react";
import { ethers } from "ethers";

// Адрес и ABI твоего контракта
const contractAddress = "0xDe65B2b24558Ef18B923D31E9E6be966b9e3b0Bd";
const abi = [
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

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [address, setAddress] = useState(null);
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({
    weightKg: "",
    steps: "",
    caloriesIn: "",
    caloriesOut: "",
    note: ""
  });

  async function connectWallet() {
    if (!window.ethereum) {
      alert("Установите MetaMask");
      return;
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    const network = await provider.getNetwork();

    if (network.chainId !== 8453) {
      alert("Пожалуйста, переключитесь на сеть Base (Chain ID 8453)");
      return;
    }

    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);

    setProvider(provider);
    setSigner(signer);
    setContract(contract);
    setAddress(accounts[0]);

    const entries = await contract.getMyEntries();
    setEntries(entries);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const tx = await contract.addEntry(
      Number(form.weightKg),
      Number(form.steps),
      Number(form.caloriesIn),
      Number(form.caloriesOut),
      form.note
    );
    await tx.wait();
    const updatedEntries = await contract.getMyEntries();
    setEntries(updatedEntries);
    setForm({ weightKg: "", steps: "", caloriesIn: "", caloriesOut: "", note: "" });
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Weight Loss Diary</h1>
      {!address ? (
        <button onClick={connectWallet}>Подключить MetaMask</button>
      ) : (
        <>
          <p><strong>Wallet:</strong> {address}</p>

          <h2>Добавить запись</h2>
          <form onSubmit={handleSubmit}>
            <input placeholder="Вес (кг)" value={form.weightKg} onChange={e => setForm({ ...form, weightKg: e.target.value })} required />
            <input placeholder="Шаги" value={form.steps} onChange={e => setForm({ ...form, steps: e.target.value })} required />
            <input placeholder="Калории полученные" value={form.caloriesIn} onChange={e => setForm({ ...form, caloriesIn: e.target.value })} required />
            <input placeholder="Калории потраченные" value={form.caloriesOut} onChange={e => setForm({ ...form, caloriesOut: e.target.value })} required />
            <input placeholder="Заметка" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} />
            <button type="submit">Сохранить</button>
          </form>

          <h2>Ваши записи</h2>
          {entries.length === 0 ? <p>Нет записей.</p> : (
            <ul>
              {entries.map((entry, index) => (
                <li key={index}>
                  {new Date(entry.timestamp * 1000).toLocaleDateString()} — Вес: {entry.weightKg} кг, Шаги: {entry.steps}, Калории: +{entry.caloriesIn}/-{entry.caloriesOut}, Заметка: {entry.note}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

export default App;
