import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

const CONTRACT_ADDRESS = "0xDe65B2b24558Ef18B923D31E9E6be966b9e3b0Bd";
const ABI = [
  "function addEntry(uint16,uint32,uint16,uint16,string) external",
  "function getMyEntries() view returns ((uint256,uint16,uint32,uint16,uint16,string)[])"
];

export default function App() {
  const [account, setAccount] = useState(null);
  const [diary, setDiary] = useState([]);
  const [formData, setFormData] = useState({ weightKg: '', steps: '', caloriesIn: '', caloriesOut: '', note: '' });

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', ([newAccount]) => setAccount(newAccount));
    }
  }, []);

  const connectWallet = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    setAccount(accounts[0]);
    await fetchEntries(provider, accounts[0]);
  };

  const fetchEntries = async (provider, userAddress) => {
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
    const entries = await contract.getMyEntries();
    setDiary(entries);
  };

  const addEntry = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
    const tx = await contract.addEntry(
      parseInt(formData.weightKg),
      parseInt(formData.steps),
      parseInt(formData.caloriesIn),
      parseInt(formData.caloriesOut),
      formData.note
    );
    await tx.wait();
    setFormData({ weightKg: '', steps: '', caloriesIn: '', caloriesOut: '', note: '' });
    fetchEntries(provider, account);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 font-sans">
      <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-2xl p-6">
        <h1 className="text-3xl font-bold text-center mb-6">Weight Loss Diary</h1>

        {!account ? (
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded w-full"
            onClick={connectWallet}
          >
            Подключить MetaMask
          </button>
        ) : (
          <>
            <p className="mb-4 text-center">Wallet: <span className="font-mono text-sm">{account}</span></p>

            <div className="space-y-4">
              <input type="number" placeholder="Вес (кг)" className="input" value={formData.weightKg} onChange={(e) => setFormData({ ...formData, weightKg: e.target.value })} />
              <input type="number" placeholder="Шаги" className="input" value={formData.steps} onChange={(e) => setFormData({ ...formData, steps: e.target.value })} />
              <input type="number" placeholder="Калории (вход)" className="input" value={formData.caloriesIn} onChange={(e) => setFormData({ ...formData, caloriesIn: e.target.value })} />
              <input type="number" placeholder="Калории (расход)" className="input" value={formData.caloriesOut} onChange={(e) => setFormData({ ...formData, caloriesOut: e.target.value })} />
              <textarea placeholder="Комментарий" className="input" value={formData.note} onChange={(e) => setFormData({ ...formData, note: e.target.value })} />
              <button onClick={addEntry} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded w-full">Добавить запись</button>
            </div>

            <h2 className="text-xl font-bold mt-8 mb-4">Your Entries</h2>
            {diary.length === 0 ? (
              <p className="text-gray-500">Нет записей</p>
            ) : (
              <div className="space-y-4">
                {diary.map((entry, i) => (
                  <div key={i} className="bg-gray-100 p-4 rounded shadow">
                    <p><strong>Дата:</strong> {new Date(entry.timestamp * 1000).toLocaleString()}</p>
                    <p><strong>Вес:</strong> {entry.weightKg} кг</p>
                    <p><strong>Шаги:</strong> {entry.steps}</p>
                    <p><strong>Калории (вход):</strong> {entry.caloriesIn}</p>
                    <p><strong>Калории (расход):</strong> {entry.caloriesOut}</p>
                    <p><strong>Комментарий:</strong> {entry.note}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      <style jsx>{`
        .input {
          width: 100%;
          padding: 0.5rem;
          border-radius: 0.5rem;
          border: 1px solid #ccc;
          outline: none;
        }
        .input:focus {
          border-color: #3182ce;
          box-shadow: 0 0 0 1px #3182ce;
        }
      `}</style>
    </div>
  );
}
