import { useState, useEffect } from "react";
import { ethers } from "ethers";

// Адрес и ABI контракта
const CONTRACT_ADDRESS = "0xDe65B2b24558Ef18B923D31E9E6be966b9e3b0Bd";
const ABI = [
  "function addEntry(uint16 weightKg, uint32 steps, uint16 caloriesIn, uint16 caloriesOut, string note) external",
  "function getMyEntries() view returns (tuple(uint256 timestamp, uint16 weightKg, uint32 steps, uint16 caloriesIn, uint16 caloriesOut, string note)[])"
];

export default function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [address, setAddress] = useState(null);
  const [entries, setEntries] = useState([]);

  const [formData, setFormData] = useState({
    weightKg: "",
    steps: "",
    caloriesIn: "",
    caloriesOut: "",
    note: ""
  });

  useEffect(() => {
    if (contract && address) {
      loadEntries();
    }
  }, [contract, address]);

  async function connectWallet() {
    if (!window.ethereum) {
      alert("Установите MetaMask");
      return;
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const { chainId } = await provider.getNetwork();
    if (chainId !== 8453) {
      alert("Пожалуйста, переключитесь на сеть Base (Chain ID 8453)");
      return;
    }

    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

    setProvider(provider);
    setSigner(signer);
    setContract(contract);
    setAddress(address);
  }

  async function loadEntries() {
    try {
      const data = await contract.getMyEntries();
      setEntries(data);
    } catch (err) {
      console.error("Ошибка загрузки записей:", err);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const { weightKg, steps, caloriesIn, caloriesOut, note } = formData;
    try {
      const tx = await contract.addEntry(
        parseInt(weightKg),
        parseInt(steps),
        parseInt(caloriesIn),
        parseInt(caloriesOut),
        note
      );
      await tx.wait();
      await loadEntries();
      setFormData({
        weightKg: "",
        steps: "",
        caloriesIn: "",
        caloriesOut: "",
        note: ""
      });
    } catch (err) {
      console.error("Ошибка отправки:", err);
    }
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Weight Loss Diary</h1>
      {!address ? (
        <button onClick={connectWallet}>Подключить MetaMask</button>
      ) : (
        <>
          <p>Wallet: {address}</p>

          <form onSubmit={handleSubmit} style={{ marginBottom: "2rem" }}>
            <input
              placeholder="Вес (кг)"
              type="number"
              value={formData.weightKg}
              onChange={(e) => setFormData({ ...formData, weightKg: e.target.value })}
              required
            />
            <input
              placeholder="Шаги"
              type="number"
              value={formData.steps}
              onChange={(e) => setFormData({ ...formData, steps: e.target.value })}
              required
            />
            <input
              placeholder="Калории потребленные"
              type="number"
              value={formData.caloriesIn}
              onChange={(e) => setFormData({ ...formData, caloriesIn: e.target.value })}
              required
            />
            <input
              placeholder="Калории потраченные"
              type="number"
              value={formData.caloriesOut}
              onChange={(e) => setFormData({ ...formData, caloriesOut: e.target.value })}
              required
            />
            <input
              placeholder="Заметка"
              type="text"
              value={formData.note}
              maxLength="200"
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            />
            <button type="submit">Добавить запись</button>
          </form>

          <h2>Your Entries:</h2>
          {entries.length === 0 && <p>Нет записей</p>}
          {entries.map((entry, index) => (
            <div key={index}>
              <p>{new Date(entry.timestamp * 1000).toLocaleString()}</p>
              <p>Вес: {entry.weightKg} кг, Шаги: {entry.steps}</p>
              <p>Калории: {entry.caloriesIn} in / {entry.caloriesOut} out</p>
              <p>Заметка: {entry.note}</p>
              <hr />
            </div>
          ))}
        </>
      )}
    </div>
  );
}
