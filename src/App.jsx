import { useEffect, useState } from "react";
import { ethers } from "ethers";

const CONTRACT_ADDRESS = "0xDe65B2b24558Ef18B923D31E9E6be966b9e3b0Bd";
const CONTRACT_ABI = [
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

export default function App() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({
    weightKg: "",
    steps: "",
    caloriesIn: "",
    caloriesOut: "",
    note: ""
  });

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      window.ethereum.on("accountsChanged", () => window.location.reload());
      window.ethereum.on("chainChanged", () => window.location.reload());
    }
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) return alert("MetaMask не найден");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const chainId = await provider.getNetwork();
    if (chainId.chainId !== 8453) {
      alert("Пожалуйста, переключитесь на сеть Base (Chain ID 8453)");
      return;
    }
    const accounts = await provider.send("eth_requestAccounts", []);
    setAccount(accounts[0]);

    const signer = provider.getSigner();
    const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    setContract(contractInstance);

    const userEntries = await contractInstance.getMyEntries();
    setEntries(userEntries);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const tx = await contract.addEntry(
        parseInt(form.weightKg),
        parseInt(form.steps),
        parseInt(form.caloriesIn),
        parseInt(form.caloriesOut),
        form.note
      );
      await tx.wait();
      const updatedEntries = await contract.getMyEntries();
      setEntries(updatedEntries);
    } catch (err) {
      console.error(err);
      alert("Ошибка при добавлении записи");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Weight Loss Diary</h1>
      {!account ? (
        <button onClick={connectWallet}>Подключить MetaMask</button>
      ) : (
        <>
          <p>Wallet: {account}</p>

          <form onSubmit={handleSubmit} style={{ marginBottom: 30 }}>
            <input name="weightKg" type="number" placeholder="Вес (кг)" value={form.weightKg} onChange={handleChange} required />
            <input name="steps" type="number" placeholder="Шаги" value={form.steps} onChange={handleChange} required />
            <input name="caloriesIn" type="number" placeholder="Калорий потреблено" value={form.caloriesIn} onChange={handleChange} required />
            <input name="caloriesOut" type="number" placeholder="Калорий сожжено" value={form.caloriesOut} onChange={handleChange} required />
            <input name="note" type="text" placeholder="Комментарий" value={form.note} onChange={handleChange} required />
            <button type="submit">Добавить запись</button>
          </form>

          <h2>Ваши записи:</h2>
          {entries.map((entry, index) => (
            <div key={index} style={{ marginBottom: 10 }}>
              <div>Дата: {new Date(entry.timestamp * 1000).toLocaleString()}</div>
              <div>Вес: {entry.weightKg} кг</div>
              <div>Шаги: {entry.steps}</div>
              <div>Калорий In: {entry.caloriesIn}, Out: {entry.caloriesOut}</div>
              <div>Заметка: {entry.note}</div>
              <hr />
            </div>
          ))}
        </>
      )}
    </div>
  );
}