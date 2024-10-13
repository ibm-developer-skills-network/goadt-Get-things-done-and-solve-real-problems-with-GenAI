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

      // Add event listeners to all Purchase buttons
      const purchaseButtons = document.querySelectorAll('.purchase-button');
      purchaseButtons.forEach(button => {
        button.addEventListener('click', handlePurchase);
      });
    })
    .catch(error => {
      console.error('Error fetching coffees:', error);
    });
});

// Function to handle Purchase button click
function handlePurchase(event) {
  const button = event.target;
  const coffeeName = button.getAttribute('data-coffee-name');
  const coffeeId = button.getAttribute('data-coffee-id');

  // Prompt the user for their name
  const customerName = prompt('Please enter your name:');

  if (customerName && customerName.trim() !== '') {
    // Store user name and coffee details in a global variable
    window.currentOrder = {
      customerName: customerName.trim(),
      coffeeName: coffeeName,
      coffeeId: coffeeId,
      customizations: {
        creams: 1,        // Default: 1 cream
        milk: 0,          // Default: 0 milk
        sugars: 1,        // Default: 1 sugar
        sweeteners: 0,    // Default: 0 sweeteners
        whippedCream: false // Default: No whipped cream
      }
    };

    // Reset any previous customization selections
    resetCustomizationModal();

    // Open the customization modal
    openCustomizationModal();
  } else {
    alert('Name is required to complete the purchase.');
  }
}

// Function to open the customization modal
function openCustomizationModal() {
  const customizationModal = document.getElementById('customization-modal');
  customizationModal.style.display = 'block';

  // Update the modal title with the selected coffee name
  const selectedCoffeeNameSpan = document.getElementById('selected-coffee-name');
  selectedCoffeeNameSpan.textContent = window.currentOrder.coffeeName;

  // Set default customization selections
  setDefaultCustomizations();
}

// Function to set default customization selections
function setDefaultCustomizations() {
  const customizationModal = document.getElementById('customization-modal');

  // Define default values
  const defaults = {
    creams: 1,
    milk: 0,
    sugars: 1,
    sweeteners: 0,
    whippedCream: false
  };

  // Iterate over each customization type and set the default active button
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

  // Remove any existing event listeners to prevent duplicates
  const buttonGroups = customizationModal.querySelectorAll('.button-group');
  buttonGroups.forEach(group => {
    const customizationType = group.getAttribute('data-customization');
    const buttons = group.querySelectorAll('.customize-button');

    buttons.forEach(button => {
      // Remove existing click listeners
      button.removeEventListener('click', handleCustomizationClick);
      // Add click listener
      button.addEventListener('click', handleCustomizationClick);
    });
  });
}

// Handler for customization button clicks
function handleCustomizationClick(event) {
  const button = event.target;
  const value = button.getAttribute('data-value');
  const buttonGroup = button.parentElement;
  const customizationType = buttonGroup.getAttribute('data-customization');

  // Remove active class from all buttons in the group
  const buttons = buttonGroup.querySelectorAll('.customize-button');
  buttons.forEach(btn => btn.classList.remove('active'));

  // Add active class to the clicked button
  button.classList.add('active');

  // Update the current order with the selected value
  if (customizationType === 'whippedCream') {
    window.currentOrder.customizations[customizationType] = value === 'true';
  } else {
    window.currentOrder.customizations[customizationType] = parseInt(value);
  }
}

// Function to reset customization modal selections
function resetCustomizationModal() {
  const customizationModal = document.getElementById('customization-modal');
  const buttons = customizationModal.querySelectorAll('.customize-button');
  buttons.forEach(button => {
    button.classList.remove('active');
  });
}

// Function to close any modal
function closeModal(modal) {
  modal.style.display = 'none';
}

// Handle customization form submission
document.getElementById('customization-form').addEventListener('submit', function(event) {
  event.preventDefault();

  // Validate that all customization options have been selected
  const requiredCustomizations = ['creams', 'milk', 'sugars', 'sweeteners', 'whippedCream'];
  let allSelected = true;

  requiredCustomizations.forEach(customization => {
    if (window.currentOrder.customizations[customization] === undefined) {
      allSelected = false;
    }
  });

  if (!allSelected) {
    alert('Please select a value for all customization options.');
    return;
  }

  // Send the order data to the backend
  sendOrderToBackend(window.currentOrder)
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Failed to process the order.');
      }
    })
    .then(data => {
      console.log('Order processed successfully:', data);
      // Close the customization modal
      const customizationModal = document.getElementById('customization-modal');
      closeModal(customizationModal);

      // const message = `Your ${window.currentOrder.coffeeName} is ready.`
      const message = data.message;

      // Open the purchase confirmation modal
      openPurchaseModal(message);
    })
    .catch(error => {
      console.error('Error processing order:', error);
      alert('There was an error processing your order. Please try again.');
    });
});

// Function to open the purchase confirmation modal
function openPurchaseModal(message) {
  const purchaseModal = document.getElementById('purchase-modal');

  // Set user name and coffee name in the modal
  document.getElementById('user-name').textContent = window.currentOrder.customerName;
  document.getElementById('coffee-message').textContent = message;
  

  // Set the local image based on the coffee type
  const coffeeImage = document.getElementById('coffee-image');
  coffeeImage.src = getCoffeeImage(window.currentOrder.coffeeId);
  coffeeImage.alt = `${window.currentOrder.coffeeName} Image`;

  // Display the customizations
  displayCustomizations();

  // Display the modal
  purchaseModal.style.display = 'block';
}

// Function to display customizations in the confirmation modal
function displayCustomizations() {
  const customizationsList = document.getElementById('customizations-list');
  customizationsList.innerHTML = ''; // Clear previous entries

  const customizations = window.currentOrder.customizations;
  const customizationEntries = [
    `Creams: ${customizations.creams}`,
    `Milks: ${customizations.milk}`,
    `Sugars: ${customizations.sugars}`,
    `Sweeteners: ${customizations.sweeteners}`,
    `Whipped Cream: ${customizations.whippedCream ? 'Yes' : 'No'}`
  ];

  customizationEntries.forEach(entry => {
    const li = document.createElement('li');
    li.textContent = entry;
    customizationsList.appendChild(li);
  });
}

// Function to send order data to the backend
function sendOrderToBackend(orderData) {
  return fetch('/api/coffees/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(orderData)
  });
}

// Function to get coffee image URL based on coffee ID
function getCoffeeImage(coffeeId) {
  // Map coffee IDs to local image filenames
  const images = {
    '1': '/images/espresso.webp',
    '2': '/images/latte.webp',
    '3': '/images/cappuccino.webp',
    '4': '/images/americano.webp'
  };
  return images[coffeeId] || '/images/coffee-default.webp';
}

// Close modal when the close button is clicked
document.querySelectorAll('.close-button').forEach(button => {
  button.addEventListener('click', function(event) {
    const modal = event.target.closest('.modal');
    closeModal(modal);
  });
});

// Close modal when clicking outside the modal content
window.addEventListener('click', function(event) {
  const purchaseModal = document.getElementById('purchase-modal');
  const customizationModal = document.getElementById('customization-modal');
  if (event.target == purchaseModal) {
    closeModal(purchaseModal);
  }
  if (event.target == customizationModal) {
    closeModal(customizationModal);
  }
});