import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import abi from "./abi.json";

const contractAddress = "0xDe65B2b24558Ef18B923D31E9E6be966b9e3b0Bd";

function App() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({
    weight: "",
    steps: "",
    caloriesIn: "",
    caloriesOut: "",
    comment: "",
  });

  useEffect(() => {
    async function init() {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        const contract = new ethers.Contract(contractAddress, abi, signer);
        setAccount(address);
        setContract(contract);
        const entries = await contract.getMyEntries();
        setEntries(entries);
      }
    }
    init();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!contract) return;
    await contract.addEntry(
      BigInt(form.weight),
      BigInt(form.steps),
      BigInt(form.caloriesIn),
      BigInt(form.caloriesOut),
      form.comment
    );
    const updated = await contract.getMyEntries();
    setEntries(updated);
  };

  return (
    <div style={{ fontFamily: "Arial", padding: "20px" }}>
      <h1>Weight Loss Diary</h1>
      <p><strong>Wallet:</strong> {account}</p>
      <div style={{ marginBottom: "10px" }}>
        <input name="weight" placeholder="Вес (кг)" onChange={handleChange} /><br />
        <input name="steps" placeholder="Шаги" onChange={handleChange} /><br />
        <input name="caloriesIn" placeholder="Калории (вход)" onChange={handleChange} /><br />
        <input name="caloriesOut" placeholder="Калории (расход)" onChange={handleChange} /><br />
        <input name="comment" placeholder="Комментарий" onChange={handleChange} /><br />
        <button onClick={handleSubmit}>Добавить запись</button>
      </div>
      <h2>Ваши записи:</h2>
      {entries.map((e, i) => (
        <div key={i} style={{ border: "1px solid #ddd", marginBottom: "10px", padding: "10px" }}>
          <p><strong>Дата:</strong> {new Date(Number(e.timestamp) * 1000).toLocaleString()}</p>
          <p><strong>Вес:</strong> {e.weight.toString()} кг</p>
          <p><strong>Шаги:</strong> {e.steps.toString()}</p>
          <p><strong>Калории (вход):</strong> {e.caloriesIn.toString()}</p>
          <p><strong>Калории (расход):</strong> {e.caloriesOut.toString()}</p>
          <p><strong>Комментарий:</strong> {e.comment}</p>
        </div>
      ))}
    </div>
  );
}

export default App;
