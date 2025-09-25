// Copied directly so frontend remains unchanged
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

      const purchaseButtons = document.querySelectorAll('.purchase-button');
      purchaseButtons.forEach(button => {
        button.addEventListener('click', handlePurchase);
      });
    })
    .catch(error => {
      console.error('Error fetching coffees:', error);
    });
});

function handlePurchase(event) {
  const button = event.target;
  const coffeeName = button.getAttribute('data-coffee-name');
  const coffeeId = button.getAttribute('data-coffee-id');

  const customerName = prompt('Please enter your name:');

  if (customerName && customerName.trim() !== '') {
    window.currentOrder = {
      customerName: customerName.trim(),
      coffeeName: coffeeName,
      coffeeId: coffeeId,
      customizations: {
        creams: 1,
        milk: 0,
        sugars: 1,
        sweeteners: 0,
        whippedCream: false
      }
    };

    resetCustomizationModal();
    openCustomizationModal();
  } else {
    alert('Name is required to complete the purchase.');
  }
}

function openCustomizationModal() {
  const customizationModal = document.getElementById('customization-modal');
  customizationModal.style.display = 'block';
  const selectedCoffeeNameSpan = document.getElementById('selected-coffee-name');
  selectedCoffeeNameSpan.textContent = window.currentOrder.coffeeName;
  setDefaultCustomizations();
}

function setDefaultCustomizations() {
  const customizationModal = document.getElementById('customization-modal');
  const defaults = { creams: 1, milk: 0, sugars: 1, sweeteners: 0, whippedCream: false };
  for (const [customization, defaultValue] of Object.entries(defaults)) {
    if (customization === 'whippedCream') {
      const buttonGroup = customizationModal.querySelector(`.button-group[data-customization="${customization}"]`);
      const buttons = buttonGroup.querySelectorAll('.customize-button');
      buttons.forEach(button => {
        const value = button.getAttribute('data-value') === 'true';
        if (value === defaultValue) {
          button.classList.add('active');
          window.currentOrder.customizations[customization] = value;
        } else {
          button.classList.remove('active');
        }
      });
    } else {
      const buttonGroup = customizationModal.querySelector(`.button-group[data-customization="${customization}"]`);
      const buttons = buttonGroup.querySelectorAll('.customize-button');
      buttons.forEach(button => {
        const value = parseInt(button.getAttribute('data-value'));
        if (value === defaultValue) {
          button.classList.add('active');
          window.currentOrder.customizations[customization] = value;
        } else {
          button.classList.remove('active');
        }
      });
    }
  }

  const buttonGroups = customizationModal.querySelectorAll('.button-group');
  buttonGroups.forEach(group => {
    const buttons = group.querySelectorAll('.customize-button');
    buttons.forEach(button => {
      button.removeEventListener('click', handleCustomizationClick);
      button.addEventListener('click', handleCustomizationClick);
    });
  });
}

function handleCustomizationClick(event) {
  const button = event.target;
  const value = button.getAttribute('data-value');
  const buttonGroup = button.parentElement;
  const customizationType = buttonGroup.getAttribute('data-customization');
  const buttons = buttonGroup.querySelectorAll('.customize-button');
  buttons.forEach(btn => btn.classList.remove('active'));
  button.classList.add('active');
  if (customizationType === 'whippedCream') {
    window.currentOrder.customizations[customizationType] = value === 'true';
  } else {
    window.currentOrder.customizations[customizationType] = parseInt(value);
  }
}

function resetCustomizationModal() {
  const customizationModal = document.getElementById('customization-modal');
  const buttons = customizationModal.querySelectorAll('.customize-button');
  buttons.forEach(button => { button.classList.remove('active'); });
}

function closeModal(modal) { modal.style.display = 'none'; }

document.getElementById('customization-form').addEventListener('submit', function(event) {
  event.preventDefault();
  const requiredCustomizations = ['creams', 'milk', 'sugars', 'sweeteners', 'whippedCream'];
  for (const c of requiredCustomizations) {
    if (window.currentOrder.customizations[c] === undefined) {
      alert('Please select a value for all customization options.');
      return;
    }
  }
  sendOrderToBackend(window.currentOrder)
    .then(response => response.ok ? response.json() : Promise.reject('Failed'))
    .then(data => {
      const customizationModal = document.getElementById('customization-modal');
      closeModal(customizationModal);
      const message = data?.message || `Your ${window.currentOrder.coffeeName} is ready.`
      openPurchaseModal(message);
    })
    .catch(error => {
      console.error('Error processing order:', error);
      alert('There was an error processing your order. Please try again.');
    });
});

function openPurchaseModal(message) {
  const purchaseModal = document.getElementById('purchase-modal');
  document.getElementById('user-name').textContent = window.currentOrder.customerName;
  document.getElementById('coffee-message').textContent = message;
  const coffeeImage = document.getElementById('coffee-image');
  coffeeImage.src = getCoffeeImage(window.currentOrder.coffeeId);
  coffeeImage.alt = `${window.currentOrder.coffeeName} Image`;
  displayCustomizations();
  purchaseModal.style.display = 'block';
}

function displayCustomizations() {
  const customizationsList = document.getElementById('customizations-list');
  customizationsList.innerHTML = '';
  const customizations = window.currentOrder.customizations;
  const entries = [
    `Creams: ${customizations.creams}`,
    `Milks: ${customizations.milk}`,
    `Sugars: ${customizations.sugars}`,
    `Sweeteners: ${customizations.sweeteners}`,
    `Whipped Cream: ${customizations.whippedCream ? 'Yes' : 'No'}`
  ];
  entries.forEach(e => {
    const li = document.createElement('li');
    li.textContent = e;
    customizationsList.appendChild(li);
  });
}

function sendOrderToBackend(orderData) {
  return fetch('/api/coffees/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData)
  });
}

function getCoffeeImage(coffeeId) {
  const images = {
    '1': '/images/espresso.webp',
    '2': '/images/latte.webp',
    '3': '/images/cappuccino.webp',
    '4': '/images/americano.webp'
  };
  return images[coffeeId] || '/images/coffee-default.webp';
}

document.querySelectorAll('.close-button').forEach(button => {
  button.addEventListener('click', function(event) {
    const modal = event.target.closest('.modal');
    closeModal(modal);
  });
});

window.addEventListener('click', function(event) {
  const purchaseModal = document.getElementById('purchase-modal');
  const customizationModal = document.getElementById('customization-modal');
  if (event.target == purchaseModal) closeModal(purchaseModal);
  if (event.target == customizationModal) closeModal(customizationModal);
});

