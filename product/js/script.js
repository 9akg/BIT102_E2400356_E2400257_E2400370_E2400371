document.addEventListener("DOMContentLoaded", () => {
  // =====================
  // Product Preview Functionality
  // =====================
  const products = document.querySelectorAll('.product');
  const previewContainer = document.querySelector('.products-preview');
  const previews = previewContainer.querySelectorAll('.preview');

  products.forEach(product => {
    product.addEventListener('click', (e) => {
      // Don't trigger preview when clicking on inner buttons
      if (e.target.closest('.buy') || e.target.closest('.cart')) return;
      const target = product.getAttribute('data-name');
      previewContainer.style.display = 'flex';
      previews.forEach(preview => {
        if (preview.getAttribute('data-target') === target) {
          preview.classList.add('active');
        }
      });
    });
  });

  previews.forEach(preview => {
    const closeIcon = preview.querySelector('.fa-times');
    if (closeIcon) {
      closeIcon.addEventListener('click', () => {
        preview.classList.remove("active");
        previewContainer.style.display = 'none';
      });
    }
  });

  // =====================
  // Cart Functionality
  // =====================
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  const cartCount = document.querySelector('.cart-count');
  const cartIcon = document.querySelector('.cart-icon');
  const cartPanel = document.querySelector('.cart-panel');
  const cartItemsContainer = document.querySelector('.cart-items');
  const cartTotal = document.querySelector('.cart-total span');

  // Event listener for cart close button
  const closeCartBtn = document.querySelector('.close-cart');
  if (closeCartBtn) {
    closeCartBtn.addEventListener('click', () => {
      cartPanel.classList.remove('active');
    });
  }

  // "Add to Cart" button handler (inside preview)
  document.querySelectorAll('.preview .cart').forEach(button => {
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      const preview = e.target.closest('.preview');
      if (!preview) return;
      const productNameElem = preview.querySelector('h3');
      const productPriceElem = preview.querySelector('.price');
      if (!productNameElem || !productPriceElem) return;
      const productData = {
        id: preview.getAttribute('data-target'),
        name: productNameElem.textContent.trim(),
        // Ensure price is stored as a number
        price: parseFloat(productPriceElem.textContent.replace('$','').trim()),
        image: preview.querySelector('img').src,
        quantity: 1
      };
      addToCart(productData);
      preview.classList.remove("active");
      previewContainer.style.display = 'none';
      alert(`${productData.name} added to cart!`);
    });
  });

  // "Buy Now" button handler (inside preview)
  document.querySelectorAll('.preview .buy').forEach(button => {
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      const preview = e.target.closest('.preview');
      if (!preview) return;
      const productData = {
        id: preview.getAttribute('data-target'),
        name: preview.querySelector('h3').textContent.trim(),
        price: parseFloat(preview.querySelector('.price').textContent.replace('$','').trim()),
        image: preview.querySelector('img').src,
        quantity: 1
      };
      // Save the single product as an "order" for direct purchase
      localStorage.setItem("order", JSON.stringify(productData));
      // Redirect to payment page with type=buy (adjust URL as needed)
      window.location.href = 'payment.html?type=buy';
    });
  });

  // Cart icon click: show the cart panel and render its content
  if (cartIcon) {
    cartIcon.addEventListener('click', () => {
      if (cartPanel) {
        cartPanel.classList.add('active');
        renderCart();
      }
    });
  }

  // Function to add a product to the cart array
  function addToCart(product) {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      existing.quantity++;
    } else {
      cart.push(product);
    }
    updateCart();
  }

  // Update cart display and localStorage
  function updateCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalCount;
    renderCart();
  }

  // Render cart items and total amount
  function renderCart() {
    if (cartItemsContainer) {
      cartItemsContainer.innerHTML = '';
      let total = 0;
      cart.forEach((item, index) => {
        total += item.price * item.quantity;
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
          <img src="${item.image}" alt="${item.name}">
          <div class="cart-item-info">
            <h4>${item.name}</h4>
            <p>$${item.price.toFixed(2)} x ${item.quantity}</p>
          </div>
          <div class="cart-item-controls">
            <button class="decrease" data-index="${index}">-</button>
            <button class="increase" data-index="${index}">+</button>
          </div>
        `;
        cartItemsContainer.appendChild(cartItem);
      });
      cartTotal.textContent = total.toFixed(2);
    }
  }

  // Increase/Decrease buttons for cart items
  if (cartItemsContainer) {
    cartItemsContainer.addEventListener('click', (e) => {
      if (!e.target.matches('.increase, .decrease')) return;
      const index = parseInt(e.target.getAttribute('data-index'), 10);
      if (isNaN(index)) return;
      if (e.target.classList.contains('increase')) {
        cart[index].quantity++;
      } else if (e.target.classList.contains('decrease')) {
        cart[index].quantity = Math.max(1, cart[index].quantity - 1);
      }
      updateCart();
    });
  }

  // Clear cart button functionality
  const clearCartBtn = document.querySelector('.clear-cart');
  if (clearCartBtn) {
    clearCartBtn.addEventListener('click', () => {
      cart = [];
      updateCart();
    });
  }

  updateCart();

  // Checkout button for cart checkout
  const checkoutBtn = document.querySelector('.checkout');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
      }
      localStorage.setItem('cart', JSON.stringify(cart));
      window.location.href = 'payment.html?type=cart';
    });
  }
});
