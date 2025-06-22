import { useEffect, useState } from "react";
import { ethers } from "ethers";

// Адрес твоего контракта в сети Base
const contractAddress = "0xDe65B2b24558Ef18B923D31E9E6be966b9e3b0Bd";

// ABI контракта (упрощённо)
const abi = [
  {
    inputs: [
      { internalType: "uint16", name: "weightKg", type: "uint16" },
      { internalType: "uint32", name: "steps", type: "uint32" },
      { internalType: "uint16", name: "caloriesIn", type: "uint16" },
      { internalType: "uint16", name: "caloriesOut", type: "uint16" },
      { internalType: "string", name: "note", type: "string" }
    ],
    name: "addEntry",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "getMyEntries",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "timestamp", type: "uint256" },
          { internalType: "uint16", name: "weightKg", type: "uint16" },
          { internalType: "uint32", name: "steps", type: "uint32" },
          { internalType: "uint16", name: "caloriesIn", type: "uint16" },
          { internalType: "uint16", name: "caloriesOut", type: "uint16" },
          { internalType: "string", name: "note", type: "string" }
        ],
        internalType: "struct WeightLossDiary.Entry[]",
        name: "",
        type: "tuple[]"
      }
    ],
    stateMutability: "view",
    type: "function"
  }
];

export default function App() {
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

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Установите MetaMask");
      return;
    }

    const chainId = await window.ethereum.request({ method: "eth_chainId" });
    if (chainId !== "0x2105") {
      alert("Пожалуйста, переключитесь на сеть Base (Chain ID 8453)");
      return;
    }

    const newProvider = new ethers.providers.Web3Provider(window.ethereum);
    const newSigner = newProvider.getSigner();
    const newAddress = await newSigner.getAddress();
    const newContract = new ethers.Contract(contractAddress, abi, newSigner);

    setProvider(newProvider);
    setSigner(newSigner);
    setAddress(newAddress);
    setContract(newContract);

    const data = await newContract.getMyEntries();
    setEntries(data);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contract) return;

    try {
      const tx = await contract.addEntry(
        parseInt(form.weightKg),
        parseInt(form.steps),
        parseInt(form.caloriesIn),
        parseInt(form.caloriesOut),
        form.note
      );
      await tx.wait();
      const updated = await contract.getMyEntries();
      setEntries(updated);
      setForm({ weightKg: "", steps: "", caloriesIn: "", caloriesOut: "", note: "" });
    } catch (err) {
      console.error("Ошибка при добавлении записи:", err);
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>Weight Loss Diary</h1>

      {!address ? (
        <button onClick={connectWallet}>Подключить MetaMask</button>
      ) : (
        <>
          <p>Кошелек: {address}</p>

          <h2>Добавить запись</h2>
          <form onSubmit={handleSubmit}>
            <div>
              Вес (кг): <input name="weightKg" value={form.weightKg} onChange={handleChange} />
            </div>
            <div>
              Шаги: <input name="steps" value={form.steps} onChange={handleChange} />
            </div>
            <div>
              Калории получено: <input name="caloriesIn" value={form.caloriesIn} onChange={handleChange} />
            </div>
            <div>
              Калории потрачено: <input name="caloriesOut" value={form.caloriesOut} onChange={handleChange} />
            </div>
            <div>
              Комментарий: <input name="note" value={form.note} onChange={handleChange} />
            </div>
            <button type="submit">Добавить</button>
          </form>

          <h2>Ваши записи</h2>
          {entries.length === 0 ? (
            <p>Записей пока нет.</p>
          ) : (
            <ul>
              {entries.map((entry, i) => (
                <li key={i}>
                  {new Date(entry.timestamp * 1000).toLocaleString()}: {entry.weightKg} кг, {entry.steps} шагов,
                  калории: +{entry.caloriesIn} / -{entry.caloriesOut}, заметка: {entry.note}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
