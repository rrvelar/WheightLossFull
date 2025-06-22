
document.addEventListener('DOMContentLoaded', () => {
  const walletSpan = document.getElementById('wallet');
  const form = document.getElementById('entry-form');
  const entryList = document.getElementById('entry-list');

  async function connectWallet() {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      walletSpan.textContent = '🔗 ' + accounts[0];
    } else {
      walletSpan.textContent = '🛑 MetaMask не найден';
    }
  }

  walletSpan.addEventListener('click', connectWallet);

  form.addEventListener('submit', e => {
    e.preventDefault();
    const entry = document.createElement('div');
    entry.className = 'entry-card';
    entry.innerHTML = `
      <strong>📅 ${new Date().toLocaleDateString()}</strong><br/>
      Вес: ${form.weight.value} кг<br/>
      Шаги: ${form.steps.value}<br/>
      Калории (вход): ${form.calIn.value}<br/>
      Калории (расход): ${form.calOut.value}<br/>
      Комментарий: ${form.comment.value}
    `;
    entryList.appendChild(entry);
    form.reset();
  });
});
