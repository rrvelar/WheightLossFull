import { useEffect, useState } from "react";
import { ethers } from "ethers";
import contractABI from "../abi.json";

const CONTRACT_ADDRESS = "0xDe65B2b24558Ef18B923D31E9E6be966b9e3b0Bd";

export default function Home() {
  const [walletAddress, setWalletAddress] = useState("");
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({
    weightKg: "",
    steps: "",
    caloriesIn: "",
    caloriesOut: "",
    note: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setWalletAddress(accounts[0]);
    }
  };

  const fetchEntries = async () => {
    if (!walletAddress) return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
      const data = await contract.getMyEntries();
      setEntries(data);
    } catch (err) {
      console.error("Ошибка получения данных:", err);
    }
  };

  const addEntry = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
      const tx = await contract.addEntry(
        parseInt(form.weightKg),
        parseInt(form.steps),
        parseInt(form.caloriesIn),
        parseInt(form.caloriesOut),
        form.note
      );
      await tx.wait();
      fetchEntries();
    } catch (err) {
      console.error("Ошибка добавления записи:", err);
    }
  };

  useEffect(() => {
    if (walletAddress) fetchEntries();
  }, [walletAddress]);

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Weight Loss Diary</h1>
      {walletAddress ? (
        <div>
          <p className="mb-4">Wallet: {walletAddress}</p>

          <div className="space-y-2 mb-4">
            <input name="weightKg" placeholder="Вес (кг)" className="w-full border p-2" onChange={handleChange} />
            <input name="steps" placeholder="Шаги" className="w-full border p-2" onChange={handleChange} />
            <input name="caloriesIn" placeholder="Калории (вход)" className="w-full border p-2" onChange={handleChange} />
            <input name="caloriesOut" placeholder="Калории (расход)" className="w-full border p-2" onChange={handleChange} />
            <input name="note" placeholder="Комментарий" className="w-full border p-2" onChange={handleChange} />
            <button onClick={addEntry} className="bg-blue-500 text-white px-4 py-2 rounded">Добавить запись</button>
          </div>

          <h2 className="text-2xl font-semibold mt-6 mb-2">Your Entries:</h2>
          {entries.length === 0 ? (
            <p>Нет записей</p>
          ) : (
            <div className="space-y-4">
              {entries.map((entry, idx) => (
                <div key={idx} className="border p-4 rounded">
                  <p><strong>Дата:</strong> {entry.timestamp && !isNaN(entry.timestamp) ? new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium", timeStyle: "short" }).format(new Date(Number(entry.timestamp) * 1000)) : "—"}</p>
                  <p><strong>Вес:</strong> {entry.weightKg} кг</p>
                  <p><strong>Шаги:</strong> {entry.steps}</p>
                  <p><strong>Калории (вход):</strong> {entry.caloriesIn}</p>
                  <p><strong>Калории (расход):</strong> {entry.caloriesOut}</p>
                  <p><strong>Комментарий:</strong> {entry.note}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <button onClick={connectWallet} className="bg-blue-600 text-white px-4 py-2 rounded">Подключить MetaMask</button>
      )}
    </main>
  );
}
