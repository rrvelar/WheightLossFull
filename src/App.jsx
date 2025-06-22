import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

const contractAddress = "0xDe65B2b24558Ef18B923D31E9E6be966b9e3b0Bd";
const abi = [
  "function addEntry(uint16 weightKg, uint32 steps, uint16 caloriesIn, uint16 caloriesOut, string note) external",
  "function getMyEntries() view returns (tuple(uint256 timestamp, uint16 weightKg, uint32 steps, uint16 caloriesIn, uint16 caloriesOut, string note)[])"
];

function App() {
  const [wallet, setWallet] = useState("");
  const [contract, setContract] = useState(null);
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({
    weightKg: "",
    steps: "",
    caloriesIn: "",
    caloriesOut: "",
    note: "",
  });

  useEffect(() => {
    async function connect() {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        setWallet(accounts[0]);
        const contractInstance = new ethers.Contract(contractAddress, abi, signer);
        setContract(contractInstance);
        const userEntries = await contractInstance.getMyEntries();
        setEntries(userEntries);
      }
    }
    connect();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contract) return;
    await contract.addEntry(
      Number(form.weightKg),
      Number(form.steps),
      Number(form.caloriesIn),
      Number(form.caloriesOut),
      form.note
    );
    const updatedEntries = await contract.getMyEntries();
    setEntries(updatedEntries);
  };

  return (
    <div>
      <h1>Weight Loss Diary</h1>
      <p>Wallet: {wallet}</p>

      <form onSubmit={handleSubmit}>
        <input name="weightKg" placeholder="Weight (kg)" value={form.weightKg} onChange={handleChange} />
        <input name="steps" placeholder="Steps" value={form.steps} onChange={handleChange} />
        <input name="caloriesIn" placeholder="Calories In" value={form.caloriesIn} onChange={handleChange} />
        <input name="caloriesOut" placeholder="Calories Out" value={form.caloriesOut} onChange={handleChange} />
        <input name="note" placeholder="Note" value={form.note} onChange={handleChange} />
        <button type="submit">Add Entry</button>
      </form>

      <h2>Your Entries:</h2>
      <ul>
        {entries.map((entry, index) => (
          <li key={index}>
            {new Date(Number(entry.timestamp) * 1000).toLocaleString()}: {entry.weightKg}kg, {entry.steps} steps, In: {entry.caloriesIn}, Out: {entry.caloriesOut}, Note: {entry.note}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
