// Same as src frontend; backend is part1 API
document.addEventListener('DOMContentLoaded', () => {
  fetch('/api/coffees')
    .then(response => response.json())
    .then(data => {
      const container = document.getElementById('coffees-container');
      data.forEach(coffee => {
        const coffeeDiv = document.createElement('div');
        coffeeDiv.classList.add('coffee-item');
        coffeeDiv.innerHTML = `
          <h3>${coffee.name}</h3>
          <p>Price: $${coffee.price.toFixed(2)}</p>
          <button class="purchase-button" data-coffee-name="${coffee.name}" data-coffee-id="${coffee.id}">Purchase</button>
        `;
        container.appendChild(coffeeDiv);
      });
      document.querySelectorAll('.purchase-button').forEach(btn => btn.addEventListener('click', handlePurchase));
    })
    .catch(err => console.error('Error fetching coffees:', err));
});

function handlePurchase(event) {
  const coffeeName = event.target.getAttribute('data-coffee-name');
  const coffeeId = event.target.getAttribute('data-coffee-id');
  const customerName = prompt('Please enter your name:');
  if (!customerName || !customerName.trim()) { alert('Name is required to complete the purchase.'); return; }
  window.currentOrder = {
    customerName: customerName.trim(), coffeeName, coffeeId,
    customizations: { creams: 1, milk: 0, sugars: 1, sweeteners: 0, whippedCream: false }
  };
  resetCustomizationModal();
  openCustomizationModal();
}

function openCustomizationModal() {
  document.getElementById('customization-modal').style.display = 'block';
  document.getElementById('selected-coffee-name').textContent = window.currentOrder.coffeeName;
  setDefaultCustomizations();
}

function setDefaultCustomizations() {
  const ctn = document.getElementById('customization-modal');
  const defaults = { creams: 1, milk: 0, sugars: 1, sweeteners: 0, whippedCream: false };
  for (const [k, v] of Object.entries(defaults)) {
    const group = ctn.querySelector(`.button-group[data-customization="${k}"]`);
    const buttons = group.querySelectorAll('.customize-button');
    buttons.forEach(b => {
      const val = k === 'whippedCream' ? (b.getAttribute('data-value') === 'true') : parseInt(b.getAttribute('data-value'));
      if (val === v) { b.classList.add('active'); window.currentOrder.customizations[k] = val; } else { b.classList.remove('active'); }
      b.removeEventListener('click', handleCustomizationClick); b.addEventListener('click', handleCustomizationClick);
    });
  }
}

function handleCustomizationClick(event) {
  const button = event.target; const group = button.parentElement; const type = group.getAttribute('data-customization');
  group.querySelectorAll('.customize-button').forEach(btn => btn.classList.remove('active'));
  button.classList.add('active');
  window.currentOrder.customizations[type] = (type === 'whippedCream') ? (button.getAttribute('data-value') === 'true') : parseInt(button.getAttribute('data-value'));
}

function resetCustomizationModal() { document.querySelectorAll('#customization-modal .customize-button').forEach(b => b.classList.remove('active')); }
function closeModal(m) { m.style.display = 'none'; }

document.getElementById('customization-form').addEventListener('submit', function(e) {
  e.preventDefault();
  for (const k of ['creams','milk','sugars','sweeteners','whippedCream']) if (window.currentOrder.customizations[k] === undefined) { alert('Please select a value for all customization options.'); return; }
  fetch('/api/coffees/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(window.currentOrder) })
    .then(r => r.ok ? r.json() : Promise.reject('Failed'))
    .then(data => { closeModal(document.getElementById('customization-modal')); openPurchaseModal(data?.message || `Your ${window.currentOrder.coffeeName} is ready.`); })
    .catch(err => { console.error(err); alert('There was an error processing your order. Please try again.'); });
});

function openPurchaseModal(message) {
  document.getElementById('user-name').textContent = window.currentOrder.customerName;
  document.getElementById('coffee-message').textContent = message;
  const img = document.getElementById('coffee-image'); img.src = getCoffeeImage(window.currentOrder.coffeeId); img.alt = `${window.currentOrder.coffeeName} Image`;
  displayCustomizations();
  document.getElementById('purchase-modal').style.display = 'block';
}

function displayCustomizations() {
  const ul = document.getElementById('customizations-list'); ul.innerHTML = '';
  const c = window.currentOrder.customizations; [
    `Creams: ${c.creams}`,
    `Milks: ${c.milk}`,
    `Sugars: ${c.sugars}`,
    `Sweeteners: ${c.sweeteners}`,
    `Whipped Cream: ${c.whippedCream ? 'Yes' : 'No'}`
  ].forEach(t => { const li = document.createElement('li'); li.textContent = t; ul.appendChild(li); });
}

function getCoffeeImage(id) { const m = { '1': '/images/espresso.webp','2': '/images/latte.webp','3': '/images/cappuccino.webp','4': '/images/americano.webp' }; return m[id] || '/images/coffee-default.webp'; }

document.querySelectorAll('.close-button').forEach(b => b.addEventListener('click', e => closeModal(e.target.closest('.modal'))));
window.addEventListener('click', e => { const p = document.getElementById('purchase-modal'); const c = document.getElementById('customization-modal'); if (e.target == p) closeModal(p); if (e.target == c) closeModal(c); });

