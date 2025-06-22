import { ethers } from "https://cdn.ethers.io/lib/ethers-6.5.2.esm.min.js";

const CONTRACT_ADDRESS = "0xDe65B2b24558Ef18B923D31E9E6be966b9e3b0Bd";
const ABI = [
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
  },
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
  }
];

const app = document.getElementById("app");
let provider, signer, contract;

async function connect() {
  if (!window.ethereum) {
    app.innerHTML = "<p>MetaMask not found</p>";
    return;
  }

  await window.ethereum.request({ method: "eth_requestAccounts" });
  provider = new ethers.BrowserProvider(window.ethereum);
  signer = await provider.getSigner();

  const network = await provider.getNetwork();
  if (network.chainId !== 8453n) {
    alert("Пожалуйста, переключитесь на сеть Base (Chain ID 8453)");
    return;
  }

  contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
  const address = await signer.getAddress();
  app.innerHTML = `<h1>Weight Loss Diary</h1>
    <p>Wallet: ${address}</p>
    <form id="entryForm">
      <input placeholder="Weight (kg)" name="weight" required />
      <input placeholder="Steps" name="steps" required />
      <input placeholder="Calories In" name="calIn" required />
      <input placeholder="Calories Out" name="calOut" required />
      <input placeholder="Note" name="note" />
      <button type="submit">Add Entry</button>
    </form>
    <h2>Your Entries:</h2>
    <ul id="entries"></ul>`;

  document.getElementById("entryForm").onsubmit = async (e) => {
    e.preventDefault();
    const { weight, steps, calIn, calOut, note } = Object.fromEntries(
      new FormData(e.target).entries()
    );
    await contract.addEntry(
      parseInt(weight),
      parseInt(steps),
      parseInt(calIn),
      parseInt(calOut),
      note
    );
    loadEntries();
  };

  loadEntries();
}

async function loadEntries() {
  const entries = await contract.getMyEntries();
  const ul = document.getElementById("entries");
  ul.innerHTML = entries
    .map(
      (e) =>
        `<li>${new Date(Number(e.timestamp) * 1000).toLocaleString()}: ${e.weightKg}kg, ${e.steps} steps, ${e.caloriesIn} in, ${e.caloriesOut} out — ${e.note}</li>`
    )
    .join("");
}

app.innerHTML = '<button id="connect">Подключить MetaMask</button>';
document.getElementById("connect").onclick = connect;