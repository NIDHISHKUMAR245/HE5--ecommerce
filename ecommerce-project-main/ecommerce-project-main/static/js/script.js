// ===== Mobile Menu Toggle =====
function toggleMenu() {
  var menu = document.getElementById("navMenu");
  if (menu) {
    menu.classList.toggle("show");
  }
}

// ===== Toast Notification =====
function showToast(message) {
  var existing = document.querySelector(".toast");
  if (existing) existing.remove();

  var toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(function () {
    toast.remove();
  }, 2600);
}

// ===== Cart Badge Update =====
function updateCartBadge() {
  var items = JSON.parse(localStorage.getItem("cart")) || [];
  var badges = document.querySelectorAll("#cartBadge");
  badges.forEach(function (badge) {
    badge.textContent = items.length > 0 ? items.length : "";
  });
}

// ===== Product Data =====
var productData = {
  'Aloe Vera Gel': { img: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=120&h=120&fit=crop', info: 'Hydrating gel with 99% aloe vera' },
  'Turmeric Cream': { img: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=120&h=120&fit=crop', info: 'Brightening cream with curcumin' },
  'Rose Water Toner': { img: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=120&h=120&fit=crop', info: 'Steam-distilled pore minimizer' },
  'Vitamin C Serum': { img: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=120&h=120&fit=crop', info: '15% L-Ascorbic Acid brightening serum' },
  'Coconut Oil Serum': { img: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=120&h=120&fit=crop', info: 'Cold-pressed virgin coconut oil' },
  'Niacinamide Serum': { img: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=120&h=120&fit=crop', info: 'Vitamin B3 pore minimizer' },
  'Gentle Face Wash': { img: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=120&h=120&fit=crop', info: 'Mild cleanser for all skin types' },
  'Charcoal Face Wash': { img: 'https://images.unsplash.com/photo-1631730486572-226d1f595b68?w=120&h=120&fit=crop', info: 'Deep pore cleansing charcoal formula' },
  'Honey Lip Balm': { img: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=120&h=120&fit=crop', info: 'Organic honey moisturizing lip care' },
  'SPF 50 Sunscreen': { img: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=120&h=120&fit=crop', info: 'Broad spectrum UV protection' },
  'Retinol Night Cream': { img: 'https://images.unsplash.com/photo-1570194065650-d99fb4a38691?w=120&h=120&fit=crop', info: 'Anti-aging overnight repair cream' },
  'Under Eye Cream': { img: 'https://images.unsplash.com/photo-1556228841-a3d3c5a1f2d3?w=120&h=120&fit=crop', info: 'Reduces dark circles & puffiness' }
};
var defaultProduct = { img: 'https://picsum.photos/seed/product/120/120', info: 'Premium organic skincare' };

// ===== Add to Cart =====
function addToCart(name, price) {
  var cart = JSON.parse(localStorage.getItem("cart")) || [];
  var data = productData[name] || defaultProduct;
  cart.push({ name: name, price: price, img: data.img, info: data.info });
  localStorage.setItem("cart", JSON.stringify(cart));
  showToast(name + " added to cart!");
  updateCartBadge();
}

// ===== Remove from Cart =====
function removeFromCart(name, price) {
  var cart = JSON.parse(localStorage.getItem('cart')) || [];
  // Remove ALL instances of this product
  cart = cart.filter(function(it) { return !(it.name === name && it.price === price); });
  localStorage.setItem('cart', JSON.stringify(cart));
  loadCart();
  updateCartBadge();
  setupCartItemClicks();
}

// ===== Clear Cart =====
function clearCart() {
  localStorage.removeItem("cart");
  loadCart();
  updateCartBadge();
  showToast("Cart cleared!");
}

// ===== Checkout =====
var pendingBuyItems = null;

function checkout() {
  var cart = JSON.parse(localStorage.getItem('cart')) || [];
  if (cart.length === 0) return;
  pendingBuyItems = cart;
  openCheckoutForm(cart);
}

function openCheckoutForm(items) {
  var summary = document.getElementById('checkoutSummary');
  if (!summary) return;
  summary.innerHTML = '';
  var total = 0;
  var grouped = {};
  items.forEach(function(it) {
    var key = it.name + '|' + it.price;
    if (!grouped[key]) grouped[key] = { name: it.name, price: it.price, qty: 0 };
    grouped[key].qty++;
    total += it.price;
  });
  Object.keys(grouped).forEach(function(key) {
    var g = grouped[key];
    var div = document.createElement('div');
    div.className = 'checkout-item';
    div.innerHTML = '<span>' + g.name + ' &times; ' + g.qty + '</span><span>\u20B9' + (g.price * g.qty) + '</span>';
    summary.appendChild(div);
  });
  var totalDiv = document.createElement('div');
  totalDiv.className = 'checkout-item';
  totalDiv.innerHTML = '<span>Total</span><span>\u20B9' + total + '</span>';
  summary.appendChild(totalDiv);

  var form = document.getElementById('checkoutForm');
  if (form) form.reset();
  document.getElementById('checkoutModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCheckoutModal(e) {
  if (e.target === document.getElementById('checkoutModal')) closeCheckoutDirect();
}
function closeCheckoutDirect() {
  document.getElementById('checkoutModal').classList.remove('active');
  document.body.style.overflow = '';
}

function submitOrder(e) {
  e.preventDefault();
  var name = document.getElementById('buyerName').value.trim();
  var phone = document.getElementById('buyerPhone').value.trim();
  var email = document.getElementById('buyerEmail') ? document.getElementById('buyerEmail').value.trim() : "";
  var address = document.getElementById('buyerAddress') ? document.getElementById('buyerAddress').value.trim() : "";
  var city = document.getElementById('buyerCity') ? document.getElementById('buyerCity').value.trim() : "";
  var pincode = document.getElementById('buyerPincode') ? document.getElementById('buyerPincode').value.trim() : "";
  var payment = document.getElementById('buyerPayment').value;
  if (!name || !phone || !payment) return;

  // Generate order details
  var orderId = 'GN-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase();
  var trackingId = 'TRK' + Math.random().toString(36).substr(2, 10).toUpperCase();
  var deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 5 + Math.floor(Math.random() * 3));
  var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  var deliveryStr = deliveryDate.toLocaleDateString('en-IN', options);

  var total = 0;
  var items = [];
  
  if (pendingBuyItems) {
    var grouped = {};
    pendingBuyItems.forEach(function(it) {
      if (grouped[it.name]) {
        grouped[it.name].qty += 1;
      } else {
        grouped[it.name] = { name: it.name, price: it.price, qty: 1 };
      }
      total += it.price;
    });
    
    Object.keys(grouped).forEach(function(k) {
      items.push(grouped[k]);
    });
  }

  var orderData = {
    order_id: orderId,
    tracking_id: trackingId,
    buyer_name: name,
    buyer_phone: phone,
    buyer_email: email,
    buyer_address: address,
    buyer_city: city,
    buyer_pincode: pincode,
    payment_method: payment,
    total_amount: total,
    items: items
  };

  fetch('/api/order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(orderData)
  })
  .then(function(res) { return res.json(); })
  .then(function(data) {
    if (data.success) {
      // Remove purchased items from cart
      if (pendingBuyItems) {
        var cart = JSON.parse(localStorage.getItem('cart')) || [];
        pendingBuyItems.forEach(function(bought) {
          for (var i = 0; i < cart.length; i++) {
            if (cart[i].name === bought.name && cart[i].price === bought.price) {
              cart.splice(i, 1);
              break;
            }
          }
        });
        localStorage.setItem('cart', JSON.stringify(cart));
        pendingBuyItems = null;
      }

      closeCheckoutDirect();

      // Show confirmation
      document.getElementById('confirmOrderId').textContent = orderId;
      document.getElementById('confirmTrackingId').textContent = trackingId;
      document.getElementById('confirmDeliveryDate').textContent = deliveryStr;
      document.getElementById('confirmPayment').textContent = payment;
      document.getElementById('confirmTotal').textContent = '\u20B9' + total;
      document.getElementById('orderConfirmModal').classList.add('active');
      document.body.style.overflow = 'hidden';

      loadCart();
      updateCartBadge();
      setupCartItemClicks();
    } else {
      showToast("Error processing order: " + data.message, "danger");
    }
  })
  .catch(function(err) {
    console.error(err);
    showToast("Could not place order. Please check your connection.", "danger");
  });
}

function closeConfirmation() {
  document.getElementById('orderConfirmModal').classList.remove('active');
  document.body.style.overflow = '';
}

// ===== Load Cart Page =====
function loadCart() {
  var items = JSON.parse(localStorage.getItem("cart")) || [];
  var cartList = document.getElementById("cartItems");
  var cartEmpty = document.getElementById("cartEmpty");
  var cartContainer = document.getElementById("cartContainer");
  var cartTotal = document.getElementById("cartTotal");

  if (!cartList) return;

  cartList.innerHTML = "";
  var total = 0;

  if (items.length === 0) {
    if (cartEmpty) cartEmpty.style.display = "block";
    if (cartContainer) cartContainer.style.display = "none";
    return;
  }

  if (cartEmpty) cartEmpty.style.display = "none";
  if (cartContainer) cartContainer.style.display = "block";

  // Group items by name + price
  var grouped = [];
  var seen = {};
  items.forEach(function(item) {
    var key = item.name + '|' + item.price;
    if (!seen[key]) {
      seen[key] = { name: item.name, price: item.price, img: item.img, info: item.info, qty: 0 };
      grouped.push(seen[key]);
    }
    seen[key].qty++;
  });

  grouped.forEach(function (group) {
    var li = document.createElement("li");
    li.setAttribute('data-name', group.name);
    li.setAttribute('data-price', group.price);

    var imgSrc = group.img || (productData[group.name] || defaultProduct).img;
    var desc = group.info || (productData[group.name] || defaultProduct).info;

    var img = document.createElement("img");
    img.className = "cart-item-img";
    img.src = imgSrc;
    img.alt = group.name;
    img.onerror = function() { this.src = 'https://picsum.photos/seed/' + encodeURIComponent(group.name) + '/120/120'; };

    var details = document.createElement("div");
    details.className = "cart-item-details";

    var nameEl = document.createElement("span");
    nameEl.className = "item-name";
    nameEl.textContent = group.name;

    var infoEl = document.createElement("span");
    infoEl.className = "item-desc";
    infoEl.textContent = desc;

    details.appendChild(nameEl);
    details.appendChild(infoEl);

    if (group.qty > 1) {
      var qtyBadge = document.createElement("span");
      qtyBadge.className = "item-qty-badge";
      qtyBadge.textContent = "\u00D7 " + group.qty;
      details.appendChild(qtyBadge);
    }

    var price = document.createElement("span");
    price.className = "item-price";
    price.textContent = "\u20B9" + (group.price * group.qty);

    var removeBtn = document.createElement("button");
    removeBtn.className = "remove-btn";
    removeBtn.textContent = "\u2715";
    removeBtn.title = "Remove item";
    removeBtn.onclick = (function(n, p) {
      return function() { removeFromCart(n, p); };
    })(group.name, group.price);

    li.appendChild(img);
    li.appendChild(details);
    li.appendChild(price);
    li.appendChild(removeBtn);
    cartList.appendChild(li);

    total += group.price * group.qty;
  });

  if (cartTotal) cartTotal.textContent = total;
}

// ===== Contact Form Validation =====
function validateForm(event) {
  event.preventDefault();

  var name = document.getElementById("name");
  var email = document.getElementById("email");
  var phone = document.getElementById("phone");
  var subject = document.getElementById("subject");
  var message = document.getElementById("message");
  var terms = document.getElementById("terms");
  var attachment = document.getElementById("attachment");

  var nameError = document.getElementById("nameError");
  var emailError = document.getElementById("emailError");
  var phoneError = document.getElementById("phoneError");
  var subjectError = document.getElementById("subjectError");
  var messageError = document.getElementById("messageError");
  var termsError = document.getElementById("termsError");
  var fileError = document.getElementById("fileError");
  var successMsg = document.getElementById("successMsg");

  var valid = true;

  // Reset all errors and styles
  var errors = [nameError, emailError, phoneError, subjectError, messageError, termsError, fileError];
  errors.forEach(function(el) { if (el) el.textContent = ""; });

  var fields = [name, email, phone, subject, message];
  fields.forEach(function(el) {
    if (el) { el.classList.remove("input-error"); el.classList.remove("input-valid"); }
  });

  if (successMsg) successMsg.style.display = "none";

  // Name validation
  if (name.value.trim().length < 2) {
    nameError.textContent = "Name must be at least 2 characters.";
    name.classList.add("input-error");
    valid = false;
  } else {
    name.classList.add("input-valid");
  }

  // Email validation
  var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email.value.trim())) {
    emailError.textContent = "Please enter a valid email address.";
    email.classList.add("input-error");
    valid = false;
  } else {
    email.classList.add("input-valid");
  }

  // Phone validation (optional but if filled, must be valid)
  if (phone.value.trim() !== "") {
    var phonePattern = /^[+]?[\d\s\-()]{7,15}$/;
    if (!phonePattern.test(phone.value.trim())) {
      phoneError.textContent = "Please enter a valid phone number.";
      phone.classList.add("input-error");
      valid = false;
    } else {
      phone.classList.add("input-valid");
    }
  }

  // Subject validation
  if (!subject.value) {
    subjectError.textContent = "Please select a subject.";
    subject.classList.add("input-error");
    valid = false;
  } else {
    subject.classList.add("input-valid");
  }

  // Message validation
  if (message.value.trim().length < 10) {
    messageError.textContent = "Message must be at least 10 characters.";
    message.classList.add("input-error");
    valid = false;
  } else {
    message.classList.add("input-valid");
  }

  // File size validation (max 5MB)
  if (attachment && attachment.files.length > 0) {
    var fileSize = attachment.files[0].size;
    if (fileSize > 5 * 1024 * 1024) {
      fileError.textContent = "File size must be under 5MB.";
      valid = false;
    }
  }

  // Terms checkbox validation
  if (terms && !terms.checked) {
    termsError.textContent = "You must agree to the Terms & Conditions.";
    valid = false;
  }

  if (valid) {
    var genderVal = document.querySelector('input[name="gender"]:checked') ? document.querySelector('input[name="gender"]:checked').value : "";
    var newsletterChecked = document.getElementById("newsletter") ? document.getElementById("newsletter").checked : false;
    var ordernum = document.getElementById("ordernum") ? document.getElementById("ordernum").value.trim() : "";

    var contactData = {
      name: name.value.trim(),
      email: email.value.trim(),
      phone: phone.value.trim(),
      gender: genderVal,
      subject: subject.value,
      order_number: ordernum,
      message: message.value.trim(),
      newsletter: newsletterChecked
    };

    fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(contactData)
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (data.success) {
        if (successMsg) successMsg.style.display = "block";
        showToast("Message sent successfully!");
        
        // Reset form after short delay
        setTimeout(function() {
          var contactForm = document.getElementById("contactForm");
          if (contactForm) contactForm.reset();
          fields.forEach(function(el) {
            if (el) el.classList.remove("input-valid");
          });
          if (successMsg) successMsg.style.display = "none";
        }, 3000);
      } else {
        showToast("Error: " + data.message, "danger");
      }
    })
    .catch(function(err) {
      console.error(err);
      showToast("Could not send message. Please try again.", "danger");
    });
  } else {
    // Scroll to first error
    var firstError = document.querySelector(".input-error");
    if (firstError) firstError.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return false;
}

// ===== Reset Form =====
function resetForm() {
  var form = document.getElementById("contactForm");
  if (form) {
    form.reset();
    // Clear all error messages
    var errors = form.querySelectorAll(".error-msg");
    errors.forEach(function(el) { el.textContent = ""; });
    // Clear validation styles
    var inputs = form.querySelectorAll("input, select, textarea");
    inputs.forEach(function(el) {
      el.classList.remove("input-error");
      el.classList.remove("input-valid");
    });
    var successMsg = document.getElementById("successMsg");
    if (successMsg) successMsg.style.display = "none";
    showToast("Form has been reset.");
  }
}

// ===== Real-time Validation on Blur =====
function setupLiveValidation() {
  var name = document.getElementById("name");
  var email = document.getElementById("email");
  var phone = document.getElementById("phone");
  var message = document.getElementById("message");

  if (name) {
    name.addEventListener("blur", function() {
      var err = document.getElementById("nameError");
      if (this.value.trim().length > 0 && this.value.trim().length < 2) {
        err.textContent = "Name must be at least 2 characters.";
        this.classList.add("input-error"); this.classList.remove("input-valid");
      } else if (this.value.trim().length >= 2) {
        err.textContent = "";
        this.classList.remove("input-error"); this.classList.add("input-valid");
      } else {
        err.textContent = ""; this.classList.remove("input-error"); this.classList.remove("input-valid");
      }
    });
  }

  if (email) {
    email.addEventListener("blur", function() {
      var err = document.getElementById("emailError");
      var pat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (this.value.trim() !== "" && !pat.test(this.value.trim())) {
        err.textContent = "Please enter a valid email address.";
        this.classList.add("input-error"); this.classList.remove("input-valid");
      } else if (pat.test(this.value.trim())) {
        err.textContent = "";
        this.classList.remove("input-error"); this.classList.add("input-valid");
      } else {
        err.textContent = ""; this.classList.remove("input-error"); this.classList.remove("input-valid");
      }
    });
  }

  if (phone) {
    phone.addEventListener("blur", function() {
      var err = document.getElementById("phoneError");
      var pat = /^[+]?[\d\s\-()]{7,15}$/;
      if (this.value.trim() !== "" && !pat.test(this.value.trim())) {
        err.textContent = "Please enter a valid phone number.";
        this.classList.add("input-error"); this.classList.remove("input-valid");
      } else if (this.value.trim() !== "") {
        err.textContent = "";
        this.classList.remove("input-error"); this.classList.add("input-valid");
      } else {
        err.textContent = ""; this.classList.remove("input-error"); this.classList.remove("input-valid");
      }
    });
  }

  if (message) {
    message.addEventListener("blur", function() {
      var err = document.getElementById("messageError");
      if (this.value.trim().length > 0 && this.value.trim().length < 10) {
        err.textContent = "Message must be at least 10 characters.";
        this.classList.add("input-error"); this.classList.remove("input-valid");
      } else if (this.value.trim().length >= 10) {
        err.textContent = "";
        this.classList.remove("input-error"); this.classList.add("input-valid");
      } else {
        err.textContent = ""; this.classList.remove("input-error"); this.classList.remove("input-valid");
      }
    });
  }
}

// ===== Image Fallback Handler =====
function setupImageFallbacks() {
  var images = document.querySelectorAll('.product-card img');
  images.forEach(function(img, index) {
    img.onerror = function() {
      this.onerror = null;
      this.src = 'https://picsum.photos/seed/product' + index + '/200/200';
    };
  });
  // Category circle image fallbacks
  var catImages = document.querySelectorAll('.category-img img');
  catImages.forEach(function(img, index) {
    img.onerror = function() {
      this.onerror = null;
      this.src = 'https://picsum.photos/seed/cat' + index + '/200/200';
    };
  });
}

// ===== Product Filter =====
function filterProducts(category) {
  var cards = document.querySelectorAll('.product-card');
  var buttons = document.querySelectorAll('.filter-btn');

  buttons.forEach(function(btn) {
    btn.classList.remove('active');
    if (btn.textContent.toLowerCase().includes(category) || (category === 'all' && btn.textContent === 'All')) {
      btn.classList.add('active');
    }
  });

  cards.forEach(function(card) {
    if (category === 'all' || card.getAttribute('data-category') === category) {
      card.style.display = '';
    } else {
      card.style.display = 'none';
    }
  });
}

// ===== Product Preview Data =====
var previewData = {
  'Neem Face Pack': { cat: 'Face Care', desc: 'Deep cleansing neem formula that purifies pores, fights acne, and gives a fresh matte finish.', tags: ['Anti-Acne', 'Purifying', 'Matte Finish'] },
  'Herbal Soap': { cat: 'Bath & Soap', desc: 'Handcrafted with lavender and chamomile extracts for a soothing, chemical-free cleanse.', tags: ['Handcrafted', 'Chemical-Free', 'Soothing'] },
  'Turmeric Cream': { cat: 'Face Care', desc: 'Curcumin-rich face cream that brightens skin, fades dark spots, and evens out skin tone.', tags: ['Brightening', 'Anti-Blemish', 'All Skin Types'] },
  'Coconut Oil Serum': { cat: 'Hair Care', desc: 'Cold-pressed virgin coconut oil serum that nourishes hair, prevents frizz, and adds shine.', tags: ['Deep Nourish', 'Anti-Frizz', 'Natural Shine'] },
  'Charcoal Face Wash': { cat: 'Face Care', desc: 'Activated charcoal deep pore cleanser that removes toxins, oil, and impurities.', tags: ['Deep Cleanse', 'Oil Control', 'Detox'] },
  'Honey Lip Balm': { cat: 'Lip Care', desc: 'Organic honey and beeswax lip balm that moisturizes, heals cracked lips, and adds soft shine.', tags: ['Moisturizing', 'Healing', 'Natural'] },
  'Vitamin C Serum': { cat: 'Face Care', desc: '15% L-Ascorbic Acid serum that brightens skin, fades dark spots, and boosts collagen production.', tags: ['Brightening', 'Anti-Aging', 'Collagen Boost'] },
  'Rose Water Toner': { cat: 'Face Care', desc: 'Steam-distilled Damascus rose toner that balances pH, minimizes pores, and calms redness.', tags: ['Pore Minimizer', 'pH Balance', 'Calming'] },
  'Gentle Face Wash': { cat: 'Face Care', desc: 'Mild gel cleanser suitable for all skin types. Removes dirt without stripping natural moisture.', tags: ['Gentle', 'All Skin Types', 'Hydrating'] },
  'Aloe Vera Gel': { cat: 'Body Care', desc: '99% pure aloe vera gel that hydrates, soothes sunburns, and repairs damaged skin naturally.', tags: ['Hydrating', 'Sunburn Relief', 'Healing'] },
  'Shea Butter Lotion': { cat: 'Body Care', desc: 'Rich shea butter body lotion that deeply moisturizes and leaves skin soft for 24 hours.', tags: ['Deep Moisture', '24hr Hydration', 'Soft Skin'] },
  'Argan Hair Oil': { cat: 'Hair Care', desc: 'Moroccan argan oil that repairs damaged hair, reduces split ends, and adds intense shine.', tags: ['Repair', 'Split End Care', 'Shine'] },
  'Clay Face Mask': { cat: 'Face Care', desc: 'Bentonite clay mask that draws out impurities, tightens pores, and detoxifies skin.', tags: ['Detox', 'Pore Tightening', 'Deep Clean'] },
  'Lavender Bath Salt': { cat: 'Bath & Soap', desc: 'Himalayan lavender bath salt that relaxes muscles, reduces stress, and softens skin.', tags: ['Relaxing', 'Stress Relief', 'Mineral Rich'] },
  'Body Butter Cream': { cat: 'Body Care', desc: 'Ultra-rich body butter with cocoa and shea that nourishes extremely dry skin all day.', tags: ['Ultra-Rich', 'Dry Skin', 'All Day'] },
  'Retinol Night Cream': { cat: 'Face Care', desc: 'Advanced retinol formula that boosts cell turnover, reduces wrinkles, and firms skin overnight.', tags: ['Anti-Wrinkle', 'Firming', 'Night Repair'] },
  'SPF 50 Sunscreen': { cat: 'Face Care', desc: 'Broad spectrum SPF 50 sunscreen with no white cast. Lightweight, non-greasy daily protection.', tags: ['SPF 50', 'No White Cast', 'Lightweight'] },
  'Under Eye Cream': { cat: 'Eye Care', desc: 'Caffeine and peptide eye cream that reduces dark circles, puffiness, and fine lines.', tags: ['Dark Circles', 'De-Puffing', 'Anti-Wrinkle'] },
  'Berry Lip Tint': { cat: 'Lip Care', desc: 'Natural berry-extracted lip tint that adds a subtle color while moisturizing lips.', tags: ['Natural Color', 'Moisturizing', 'Long-Lasting'] },
  'Keratin Hair Mask': { cat: 'Hair Care', desc: 'Professional keratin mask that strengthens, repairs damaged hair, and reduces breakage.', tags: ['Strengthening', 'Damage Repair', 'Keratin'] },
  'Oatmeal Bath Bomb': { cat: 'Bath & Soap', desc: 'Soothing oatmeal bath bomb with essential oils for a relaxing, skin-nourishing bath.', tags: ['Soothing', 'Essential Oils', 'Skin Nourish'] },
  'Hyaluronic Acid Gel': { cat: 'Face Care', desc: 'Lightweight hyaluronic acid hydrating gel that plumps skin and locks in moisture all day.', tags: ['Plumping', 'Lightweight', 'Intense Hydration'] },
  'Jasmine Body Oil': { cat: 'Body Care', desc: 'Luxurious jasmine-infused body oil that nourishes skin and leaves a subtle floral fragrance.', tags: ['Luxury', 'Floral', 'Nourishing'] },
  'Mens Beard Oil': { cat: "Men's Care", desc: 'Argan and jojoba beard oil that softens facial hair, reduces itchiness, and promotes growth.', tags: ['Softening', 'Growth', 'Anti-Itch'] },
  'Green Tea Cleanser': { cat: 'Face Care', desc: 'Antioxidant-rich green tea cleanser that detoxifies, refreshes, and protects against pollution.', tags: ['Antioxidant', 'Detox', 'Anti-Pollution'] },
  'Biotin Hair Serum': { cat: 'Hair Care', desc: 'Biotin-enriched serum that strengthens hair roots, reduces fall, and promotes thicker hair.', tags: ['Hair Growth', 'Anti-Fall', 'Thickening'] },
  'Cocoa Body Scrub': { cat: 'Body Care', desc: 'Exfoliating cocoa body scrub that removes dead skin cells and reveals smooth, glowing skin.', tags: ['Exfoliating', 'Smoothing', 'Glow'] },
  'Eucalyptus Shower Gel': { cat: 'Bath & Soap', desc: 'Refreshing eucalyptus shower gel that energizes, cleanses, and leaves skin feeling cool.', tags: ['Energizing', 'Refreshing', 'Cool Effect'] },
  'Saffron Glow Cream': { cat: 'Face Care', desc: 'Premium saffron cream that gives a natural golden glow, reduces pigmentation, and nourishes.', tags: ['Premium', 'Golden Glow', 'Anti-Pigment'] },
  'Mango Lip Butter': { cat: 'Lip Care', desc: 'Tropical mango lip butter that deeply conditions, heals dryness, and adds a natural sheen.', tags: ['Tropical', 'Deep Condition', 'Natural Sheen'] },
  'Dark Circle Serum': { cat: 'Eye Care', desc: 'Vitamin K and caffeine serum that targets dark circles, reduces puffiness around eyes.', tags: ['Vitamin K', 'Caffeine', 'Eye Repair'] },
  'Mens Face Scrub': { cat: "Men's Care", desc: 'Walnut shell scrub designed for men that exfoliates, unclogs pores, and refreshes skin.', tags: ['Exfoliating', 'Deep Pore', 'Refreshing'] },
  'Anti-Dandruff Shampoo': { cat: 'Hair Care', desc: 'Tea tree and zinc pyrithione shampoo that fights dandruff, soothes scalp, and adds volume.', tags: ['Anti-Dandruff', 'Scalp Care', 'Volume'] },
  'Almond Massage Oil': { cat: 'Body Care', desc: 'Sweet almond oil rich in Vitamin E for relaxing body massage and deep skin nourishment.', tags: ['Vitamin E', 'Massage', 'Deep Nourish'] },
  'Papaya Face Scrub': { cat: 'Face Care', desc: 'Papain enzyme scrub that gently exfoliates, brightens complexion, and smooths texture.', tags: ['Enzyme', 'Brightening', 'Smooth Texture'] },
  'Rose Petal Soap': { cat: 'Bath & Soap', desc: 'Handmade rose petal soap with natural glycerin for a gentle, fragrant cleansing experience.', tags: ['Handmade', 'Fragrant', 'Gentle'] },
  'Niacinamide Serum': { cat: 'Face Care', desc: '10% Niacinamide (Vitamin B3) serum that minimizes pores, evens tone, and repairs skin barrier.', tags: ['Pore Minimizer', 'Barrier Repair', 'Even Tone'] },
  'Onion Hair Oil': { cat: 'Hair Care', desc: 'Red onion extract oil that boosts hair growth, prevents fall, and nourishes from root to tip.', tags: ['Hair Growth', 'Anti-Fall', 'Root Nourish'] },
  'Vitamin E Body Lotion': { cat: 'Body Care', desc: 'Vitamin E enriched lotion that heals dry skin, improves texture, and provides lasting moisture.', tags: ['Vitamin E', 'Healing', 'Long-Lasting'] },
  'Mens Charcoal Peel Off': { cat: "Men's Care", desc: 'Activated charcoal peel-off mask for men that removes blackheads and deep-cleans pores.', tags: ['Peel-Off', 'Blackhead Removal', 'Deep Clean'] },
  'Coconut Lip Scrub': { cat: 'Lip Care', desc: 'Coconut and sugar lip scrub that gently exfoliates, removing dead skin for soft, smooth lips.', tags: ['Exfoliating', 'Softening', 'Natural'] },
  'AHA BHA Exfoliant': { cat: 'Face Care', desc: 'Chemical exfoliant with AHA and BHA acids that unclogs pores, smooths texture, and brightens.', tags: ['Chemical Exfoliant', 'Pore Unclog', 'Smooth'] },
  'Caffeine Eye Gel': { cat: 'Eye Care', desc: 'Cooling caffeine gel that instantly de-puffs under-eyes, reduces dark circles, and energizes.', tags: ['Instant De-Puff', 'Cooling', 'Energizing'] },
  'Charcoal Detox Soap': { cat: 'Bath & Soap', desc: 'Activated charcoal soap that draws out toxins, excess oil, and impurities from skin.', tags: ['Detox', 'Oil Control', 'Purifying'] },
  'Tea Tree Shampoo': { cat: 'Hair Care', desc: 'Tea tree oil shampoo that cleanses scalp, fights dandruff, and leaves hair feeling fresh.', tags: ['Tea Tree', 'Anti-Dandruff', 'Fresh'] },
  'Sandalwood Body Mist': { cat: 'Body Care', desc: 'Natural sandalwood body mist that hydrates skin and leaves a long-lasting woody fragrance.', tags: ['Woody Scent', 'Hydrating', 'Long-Lasting'] },
  'Salicylic Acid Gel': { cat: 'Face Care', desc: '2% Salicylic acid gel that treats acne, unclogs pores, and prevents future breakouts.', tags: ['Acne Treatment', 'Pore Unclog', 'Prevention'] },
  'Mens After Shave Balm': { cat: "Men's Care", desc: 'Cooling aloe after-shave balm that soothes razor burn, hydrates, and prevents irritation.', tags: ['Cooling', 'Soothing', 'Anti-Irritation'] },
  'SPF Lip Shield': { cat: 'Lip Care', desc: 'SPF 30 lip balm that protects lips from sun damage while keeping them soft and moisturized.', tags: ['SPF 30', 'UV Protection', 'Moisturizing'] },
  'Hibiscus Hair Conditioner': { cat: 'Hair Care', desc: 'Hibiscus flower conditioner that strengthens hair, adds volume, and prevents premature graying.', tags: ['Strengthening', 'Volume', 'Anti-Gray'] },
  'Cucumber Body Gel': { cat: 'Body Care', desc: 'Cooling cucumber body gel that hydrates, refreshes skin, and soothes irritation in summer.', tags: ['Cooling', 'Summer Care', 'Soothing'] },
  'Mens Hair Wax': { cat: "Men's Care", desc: 'Matte finish hair wax for men with strong hold, natural ingredients, and no flaking.', tags: ['Matte Finish', 'Strong Hold', 'No Flake'] },
  'Glycolic Acid Toner': { cat: 'Face Care', desc: '5% Glycolic acid toner that gently exfoliates, refines pores, and boosts skin radiance.', tags: ['Glycolic Acid', 'Pore Refine', 'Radiance'] },
  'Peptide Eye Cream': { cat: 'Eye Care', desc: 'Peptide-rich eye cream that firms delicate under-eye skin, reduces wrinkles and crow\'s feet.', tags: ['Peptides', 'Firming', 'Anti-Wrinkle'] },
  'Milk and Honey Soap': { cat: 'Bath & Soap', desc: 'Creamy milk and honey soap that nourishes, softens skin, and provides a luxurious lather.', tags: ['Nourishing', 'Soft Skin', 'Luxury Lather'] }
};

var currentModalProduct = {};
var modalQty = 1;

function openPreview(card) {
  var name = card.querySelector('h3').textContent;
  var priceText = card.querySelector('.price').textContent;
  var price = parseInt(priceText.replace(/[^\d]/g, ''));
  var imgSrc = card.querySelector('img').src.replace('w=200&h=200', 'w=500&h=500');
  var data = previewData[name] || { cat: 'Skincare', desc: 'Premium organic skincare product by GlowNature.', tags: ['Organic', 'Natural', 'Cruelty-Free'] };

  currentModalProduct = { name: name, price: price, img: imgSrc };
  modalQty = 1;

  document.getElementById('modalImg').src = imgSrc;
  document.getElementById('modalName').textContent = name;
  document.getElementById('modalCategory').textContent = data.cat;
  document.getElementById('modalDesc').textContent = data.desc;
  document.getElementById('modalPrice').textContent = '\u20B9' + price;
  document.getElementById('modalQty').textContent = '1';

  var featuresEl = document.getElementById('modalFeatures');
  featuresEl.innerHTML = '';
  data.tags.forEach(function(tag) {
    var span = document.createElement('span');
    span.textContent = tag;
    featuresEl.appendChild(span);
  });

  document.getElementById('productModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal(e) {
  if (e.target === document.getElementById('productModal')) {
    closeModalDirect();
  }
}
function closeModalDirect() {
  document.getElementById('productModal').classList.remove('active');
  document.body.style.overflow = '';
}

function changeQty(delta) {
  modalQty = Math.max(1, modalQty + delta);
  document.getElementById('modalQty').textContent = modalQty;
}

function addModalToCart() {
  for (var i = 0; i < modalQty; i++) {
    addToCart(currentModalProduct.name, currentModalProduct.price);
  }
  closeModalDirect();
}

function buyNow() {
  var name = currentModalProduct.name;
  var price = currentModalProduct.price;
  var data = productData[name] || defaultProduct;
  var items = [];
  for (var i = 0; i < modalQty; i++) {
    items.push({ name: name, price: price, img: currentModalProduct.img, info: data.info });
  }
  pendingBuyItems = items;
  closeModalDirect();
  openCheckoutForm(items);
}

// ===== Setup Product Card Clicks =====
function setupProductClicks() {
  var cards = document.querySelectorAll('.product-card');
  cards.forEach(function(card) {
    card.addEventListener('click', function(e) {
      if (e.target.tagName === 'BUTTON') return;
      openPreview(card);
    });
  });
}

// ===== Cart Preview Modal =====
var cartModalProduct = {};
var cartModalQty = 1;
var cartModalIndex = -1;

function openCartPreview(li) {
  var name = li.getAttribute('data-name');
  var price = parseInt(li.getAttribute('data-price'));
  var items = JSON.parse(localStorage.getItem('cart')) || [];
  var imgSrc = '';
  var desc = '';
  var count = 0;
  items.forEach(function(it) {
    if (it.name === name && it.price === price) {
      count++;
      if (!imgSrc) imgSrc = it.img || (productData[name] || defaultProduct).img;
      if (!desc) desc = it.info || (productData[name] || defaultProduct).info;
    }
  });
  var data = previewData[name] || { cat: 'Skincare', desc: desc || 'Premium organic skincare product by GlowNature.', tags: ['Organic', 'Natural', 'Cruelty-Free'] };

  cartModalProduct = { name: name, price: price, img: imgSrc };
  cartModalQty = count;
  cartModalIndex = 0;

  var bigImg = imgSrc.replace('w=120&h=120', 'w=500&h=500').replace('w=200&h=200', 'w=500&h=500');
  document.getElementById('cartModalImg').src = bigImg;
  document.getElementById('cartModalName').textContent = name;
  document.getElementById('cartModalCategory').textContent = data.cat;
  document.getElementById('cartModalDesc').textContent = data.desc;
  document.getElementById('cartModalUnitPrice').textContent = '\u20B9' + price;
  document.getElementById('cartModalQty').textContent = cartModalQty;
  document.getElementById('cartModalTotal').textContent = '\u20B9' + (price * cartModalQty);

  var featuresEl = document.getElementById('cartModalFeatures');
  featuresEl.innerHTML = '';
  data.tags.forEach(function(tag) {
    var span = document.createElement('span');
    span.textContent = tag;
    featuresEl.appendChild(span);
  });

  document.getElementById('cartPreviewModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCartModal(e) {
  if (e.target === document.getElementById('cartPreviewModal')) {
    closeCartModalDirect();
  }
}
function closeCartModalDirect() {
  document.getElementById('cartPreviewModal').classList.remove('active');
  document.body.style.overflow = '';
}

function changeCartQty(delta) {
  cartModalQty = Math.max(1, cartModalQty + delta);
  document.getElementById('cartModalQty').textContent = cartModalQty;
  document.getElementById('cartModalTotal').textContent = '\u20B9' + (cartModalProduct.price * cartModalQty);
}

function updateCartFromModal() {
  var items = JSON.parse(localStorage.getItem('cart')) || [];
  var name = cartModalProduct.name;
  var price = cartModalProduct.price;
  // Remove all instances of this product
  items = items.filter(function(it) { return !(it.name === name && it.price === price); });
  // Add back the desired quantity
  var data = productData[name] || defaultProduct;
  for (var i = 0; i < cartModalQty; i++) {
    items.push({ name: name, price: price, img: cartModalProduct.img, info: data.info });
  }
  localStorage.setItem('cart', JSON.stringify(items));
  showToast(name + ' updated to ' + cartModalQty + ' in cart');
  updateCartBadge();
  loadCart();
  setupCartItemClicks();
  closeCartModalDirect();
}

function buyFromCartModal() {
  // Update cart first, then open checkout for this product
  var name = cartModalProduct.name;
  var price = cartModalProduct.price;
  var items = [];
  var data = productData[name] || defaultProduct;
  for (var i = 0; i < cartModalQty; i++) {
    items.push({ name: name, price: price, img: cartModalProduct.img, info: data.info });
  }
  pendingBuyItems = items;
  closeCartModalDirect();
  openCheckoutForm(items);
}

function setupCartItemClicks() {
  var cartList = document.getElementById('cartItems');
  if (!cartList) return;
  var lis = cartList.querySelectorAll('li');
  lis.forEach(function(li) {
    li.addEventListener('click', function(e) {
      if (e.target.tagName === 'BUTTON') return;
      openCartPreview(li);
    });
  });
}

// ===== Reviews Train =====
function initReviewSlider() {
  var train = document.getElementById('reviewsTrain');
  if (!train) return;
  // Clone all cards and append to create infinite seamless loop
  var cards = train.innerHTML;
  train.innerHTML = cards + cards;
}

// ===== Offer Banner Slideshow =====
var offerSlides = [
  {
    img: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop',
    tag: 'LIMITED OFFER',
    title: 'FREE Face Mask',
    sub: 'on orders above <strong>₹999</strong>'
  },
  {
    img: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&h=400&fit=crop',
    tag: 'FLAT 30% OFF',
    title: 'Rose Water Toner',
    sub: 'was <s>₹349</s> now <strong>₹249</strong>'
  },
  {
    img: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop',
    tag: 'BESTSELLER',
    title: 'Vitamin C Serum',
    sub: 'Buy 1 Get 1 at <strong>₹499</strong>'
  },
  {
    img: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400&h=400&fit=crop',
    tag: 'NEW ARRIVAL',
    title: 'Aloe Vera Gel',
    sub: 'special launch price <strong>₹149</strong>'
  },
  {
    img: 'https://images.unsplash.com/photo-1600428877878-1a0fd85beda8?w=400&h=400&fit=crop',
    tag: 'COMBO DEAL',
    title: 'Skincare Essentials Kit',
    sub: '3 products for just <strong>₹799</strong>'
  }
];

var currentOffer = 0;
var offerTimer = null;

function initOfferSlider() {
  var dotsContainer = document.getElementById('offerDots');
  if (!dotsContainer) return;
  for (var i = 0; i < offerSlides.length; i++) {
    var dot = document.createElement('button');
    dot.className = 'offer-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', 'Offer ' + (i + 1));
    dot.dataset.index = i;
    dot.addEventListener('click', function() {
      goToOffer(parseInt(this.dataset.index));
    });
    dotsContainer.appendChild(dot);
  }
  var enableAutoSlide = false;
  if (enableAutoSlide) {
    offerTimer = setInterval(nextOffer, 4000);
  }
}

function nextOffer() {
  goToOffer((currentOffer + 1) % offerSlides.length);
}

function goToOffer(index) {
  var img = document.getElementById('offerSlideImg');
  var tag = document.getElementById('offerSlideTag');
  var title = document.getElementById('offerSlideTitle');
  var sub = document.getElementById('offerSlideSub');
  var dots = document.querySelectorAll('.offer-dot');
  if (!img) return;

  // Fade out
  img.classList.add('offer-fade');
  var textEl = img.closest('.offer-banner-inner').querySelector('.offer-text');
  if (textEl) textEl.classList.add('offer-fade');

  setTimeout(function() {
    var slide = offerSlides[index];
    img.src = slide.img;
    img.alt = slide.title;
    tag.textContent = slide.tag;
    title.innerHTML = slide.title;
    sub.innerHTML = slide.sub;
    currentOffer = index;

    // Update dots
    dots.forEach(function(d, i) {
      d.classList.toggle('active', i === index);
    });

    // Fade in
    img.classList.remove('offer-fade');
    if (textEl) textEl.classList.remove('offer-fade');
  }, 500);

  // Reset timer
  clearInterval(offerTimer);
  var enableAutoSlide = false;
  if (enableAutoSlide) {
    offerTimer = setInterval(nextOffer, 4000);
  }
}

// ===== 3D Interactive Effects =====
function init3DEffects() {
  // ---- 3D Tilt on product / feature / blog cards ----
  var enableTilt = false; // Disabled to prevent shaking/jittering animation on hover
  var tiltCards = document.querySelectorAll('.product-card, .feature-card, .blog-card');
  tiltCards.forEach(function(card) {
    if (enableTilt) {
      card.addEventListener('mousemove', function(e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var centerX = rect.width / 2;
        var centerY = rect.height / 2;
        var rotateX = ((y - centerY) / centerY) * -12;
        var rotateY = ((x - centerX) / centerX) * 12;
        card.style.transform = 'perspective(800px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateZ(15px)';
      });
      card.addEventListener('mouseleave', function() {
        card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateZ(0)';
      });
    }
  });

  // ---- Hero parallax ----
  var hero = document.querySelector('.hero');
  var heroShapes = document.querySelector('.hero-shapes');
  var heroImg = document.querySelector('.hero-img');
  var heroContent = document.querySelector('.hero-content');

  var enableHeroParallax = false;
  if (hero && heroShapes && enableHeroParallax) {
    hero.addEventListener('mousemove', function(e) {
      var rect = hero.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width - 0.5;
      var y = (e.clientY - rect.top) / rect.height - 0.5;
      heroShapes.style.transform = 'translate3d(' + (x * 40) + 'px, ' + (y * 25) + 'px, 0)';
      if (heroImg) heroImg.style.transform = 'translate3d(' + (x * -20) + 'px, ' + (y * -15) + 'px, 0) rotateY(' + (x * 5) + 'deg)';
      if (heroContent) heroContent.style.transform = 'translate3d(' + (x * 10) + 'px, ' + (y * 8) + 'px, 0)';
    });
    hero.addEventListener('mouseleave', function() {
      heroShapes.style.transform = 'translate3d(0, 0, 0)';
      if (heroImg) heroImg.style.transform = 'translate3d(0, 0, 0)';
      if (heroContent) heroContent.style.transform = 'translate3d(0, 0, 0)';
    });
  }

  // ---- Category tilt ----
  var enableCategoryTilt = false; // Disabled to prevent shaking/jittering animation on hover
  document.querySelectorAll('.category-item').forEach(function(item) {
    if (enableCategoryTilt) {
      item.addEventListener('mousemove', function(e) {
        var rect = item.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        item.style.transform = 'perspective(600px) rotateX(' + (y * -15) + 'deg) rotateY(' + (x * 15) + 'deg) translateZ(12px)';
      });
      item.addEventListener('mouseleave', function() {
        item.style.transform = 'perspective(600px) rotateX(0) rotateY(0) translateZ(0)';
      });
    }
  });

  // ---- Scroll entrance ----
  var animateEls = document.querySelectorAll('.product-card, .feature-card, .blog-card, .review-card, .category-item');
  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(en) {
      if (en.isIntersecting) { en.target.classList.add('visible-3d'); obs.unobserve(en.target); }
    });
  }, { threshold: 0.15 });
  animateEls.forEach(function(el) { el.classList.add('hidden-3d'); obs.observe(el); });

  // =======================================
  // CUSTOM 3D CURSOR GLOW + RING
  // =======================================
  var enableCustomCursor = false; // Disabled by user request
  var cursorGlow = document.getElementById('cursorGlow');
  var cursorRing = document.getElementById('cursorRing');
  var mouseX = 0, mouseY = 0;
  var ringX = 0, ringY = 0;

  if (enableCustomCursor && cursorGlow && cursorRing) {
    document.addEventListener('mousemove', function(e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorGlow.style.left = mouseX + 'px';
      cursorGlow.style.top = mouseY + 'px';
      cursorGlow.classList.add('active');
      cursorRing.classList.add('active');
    });

    // Smooth ring follow
    function animateRing() {
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      cursorRing.style.left = ringX + 'px';
      cursorRing.style.top = ringY + 'px';
      requestAnimationFrame(animateRing);
    }
    animateRing();

    // Ring changes on interactive elements
    document.querySelectorAll('a, button, .product-card, .feature-card').forEach(function(el) {
      el.addEventListener('mouseenter', function() {
        if (el.tagName === 'BUTTON' || el.classList.contains('btn') || el.classList.contains('home-ad-btn')) {
          cursorRing.classList.add('hover-btn');
          cursorGlow.classList.add('hover-card');
        } else if (el.tagName === 'A') {
          cursorRing.classList.add('hover-link');
        } else {
          cursorGlow.classList.add('hover-card');
        }
      });
      el.addEventListener('mouseleave', function() {
        cursorRing.classList.remove('hover-link', 'hover-btn');
        cursorGlow.classList.remove('hover-card');
      });
    });
  }

  // =======================================
  // MOUSE TRAIL (SPARKLE DOTS)
  // =======================================
  var enableMouseTrail = false; // Disabled by user request
  var trailDots = [];
  var trailCount = 12;
  var trailContainer = document.getElementById('mouseTrail');

  if (enableMouseTrail && trailContainer) {
    for (var i = 0; i < trailCount; i++) {
      var dot = document.createElement('div');
      dot.className = 'trail-dot';
      dot.style.opacity = (1 - i / trailCount) * 0.5;
      dot.style.width = (6 - i * 0.3) + 'px';
      dot.style.height = (6 - i * 0.3) + 'px';
      document.body.appendChild(dot);
      trailDots.push({ el: dot, x: 0, y: 0 });
    }

    var trailMX = 0, trailMY = 0;
    document.addEventListener('mousemove', function(e) {
      trailMX = e.clientX;
      trailMY = e.clientY;
    });

    function animateTrail() {
      var prevX = trailMX, prevY = trailMY;
      for (var i = 0; i < trailDots.length; i++) {
        var d = trailDots[i];
        d.x += (prevX - d.x) * (0.3 - i * 0.015);
        d.y += (prevY - d.y) * (0.3 - i * 0.015);
        d.el.style.left = d.x + 'px';
        d.el.style.top = d.y + 'px';
        prevX = d.x;
        prevY = d.y;
      }
      requestAnimationFrame(animateTrail);
    }
    animateTrail();
  }

  // =======================================
  // 3D CLICK RIPPLE
  // =======================================
  document.addEventListener('click', function(e) {
    var ripple = document.createElement('div');
    ripple.className = 'click-ripple';
    ripple.style.left = e.clientX + 'px';
    ripple.style.top = e.clientY + 'px';
    document.body.appendChild(ripple);
    setTimeout(function() { ripple.remove(); }, 900);
  });

  // =======================================
  // MAGNETIC BUTTONS (3D pull toward cursor)
  // =======================================
  var enableMagneticButtons = false; // Disabled to prevent shaking/jittering on hover
  document.querySelectorAll('.btn, .home-ad-btn, .offer-btn, .btn-shop, .product-card button').forEach(function(btn) {
    if (enableMagneticButtons) {
      btn.addEventListener('mousemove', function(e) {
        var rect = btn.getBoundingClientRect();
        var bx = e.clientX - rect.left - rect.width / 2;
        var by = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = 'translate3d(' + (bx * 0.3) + 'px, ' + (by * 0.3) + 'px, 8px) scale(1.05)';
      });
      btn.addEventListener('mouseleave', function() {
        btn.style.transform = 'translate3d(0, 0, 0) scale(1)';
      });
    }
  });

  // =======================================
  // BUTTON GLOW FOLLOW (inner shine follows cursor)
  // =======================================
  document.querySelectorAll('.btn, .home-ad-btn, .offer-btn, .btn-shop').forEach(function(btn) {
    btn.addEventListener('mousemove', function(e) {
      var rect = btn.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      btn.style.setProperty('--glow-x', x + 'px');
      btn.style.setProperty('--glow-y', y + 'px');
    });
  });

  // =======================================
  // 3D FLOATING PARTICLE BACKGROUND
  // =======================================
  var enableParticles = false;
  var canvas = enableParticles ? document.getElementById('particlesBg') : null;
  if (canvas) {
    var ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    var particles = [];
    var particleCount = 50;

    for (var p = 0; p < particleCount; p++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * 300,
        size: Math.random() * 2.5 + 0.5,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        speedZ: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.3 + 0.05
      });
    }

    var pMouseX = canvas.width / 2;
    var pMouseY = canvas.height / 2;

    document.addEventListener('mousemove', function(e) {
      pMouseX = e.clientX;
      pMouseY = e.clientY;
    });

    function drawParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (var i = 0; i < particles.length; i++) {
        var pt = particles[i];
        pt.x += pt.speedX;
        pt.y += pt.speedY;
        pt.z += pt.speedZ;

        // Mouse influence
        var dx = pMouseX - pt.x;
        var dy = pMouseY - pt.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200) {
          pt.x -= dx * 0.003;
          pt.y -= dy * 0.003;
        }

        // Wrap
        if (pt.x < 0) pt.x = canvas.width;
        if (pt.x > canvas.width) pt.x = 0;
        if (pt.y < 0) pt.y = canvas.height;
        if (pt.y > canvas.height) pt.y = 0;
        if (pt.z < 0) pt.z = 300;
        if (pt.z > 300) pt.z = 0;

        var scale = (300 - pt.z) / 300;
        var drawSize = pt.size * scale + 0.5;
        var opacity = pt.opacity * scale;

        ctx.beginPath();
        ctx.arc(pt.x, pt.y, drawSize, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(26, 60, 26, ' + opacity + ')';
        ctx.fill();

        // Draw connections
        for (var j = i + 1; j < particles.length; j++) {
          var pt2 = particles[j];
          var lineDist = Math.sqrt(Math.pow(pt.x - pt2.x, 2) + Math.pow(pt.y - pt2.y, 2));
          if (lineDist < 120) {
            ctx.beginPath();
            ctx.moveTo(pt.x, pt.y);
            ctx.lineTo(pt2.x, pt2.y);
            ctx.strokeStyle = 'rgba(26, 60, 26, ' + (0.04 * (1 - lineDist / 120)) + ')';
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(drawParticles);
    }
    drawParticles();

    window.addEventListener('resize', function() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
  }

  // =======================================
  // SECTION SPOTLIGHT (follows mouse on sections)
  // =======================================
  document.querySelectorAll('.featured, .features-section, .categories-section').forEach(function(sec) {
    sec.classList.add('spotlight-section');
    sec.addEventListener('mousemove', function(e) {
      var rect = sec.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      sec.style.setProperty('--spot-x', x + 'px');
      sec.style.setProperty('--spot-y', y + 'px');
    });
  });

  // =======================================
  // PARALLAX SCROLL DEPTH (multi-layer)
  // =======================================
  var lastScroll = 0;
  var enableScrollParallax = false;
  window.addEventListener('scroll', function() {
    if (!enableScrollParallax) return;
    var scrollY = window.pageYOffset;
    var shapes = document.querySelector('.hero-shapes');
    var heroOv = document.querySelector('.hero-overlay');

    if (shapes) {
      shapes.style.transform = 'translate3d(0, ' + (scrollY * 0.15) + 'px, 0)';
    }
    if (heroOv) {
      heroOv.style.transform = 'translate3d(0, ' + (scrollY * 0.08) + 'px, 0) scale(' + (1 + scrollY * 0.0002) + ')';
    }

    // Parallax on ad banner
    var adBg = document.querySelector('.home-ad-bg');
    if (adBg) {
      var adRect = adBg.parentElement.getBoundingClientRect();
      if (adRect.top < window.innerHeight && adRect.bottom > 0) {
        var progress = (window.innerHeight - adRect.top) / (window.innerHeight + adRect.height);
        adBg.style.transform = 'translate3d(0, ' + ((progress - 0.5) * 60) + 'px, 0) scale(1.08)';
      }
    }
    lastScroll = scrollY;
  });
}

// ===== Initialize on Page Load =====
loadCart();
updateCartBadge();
setupImageFallbacks();
setupLiveValidation();
setupProductClicks();
setupCartItemClicks();
initReviewSlider();
initOfferSlider();
init3DEffects();
setupUserProfileDropdown();

// ===== User Profile Dropdown & Modal Logic =====
function setupUserProfileDropdown() {
  var menuBtn = document.getElementById('userMenuBtn');
  var dropdownMenu = document.getElementById('userDropdownMenu');
  var profileBtn = document.getElementById('profileBtn');

  if (menuBtn && dropdownMenu) {
    // Toggle dropdown on click
    menuBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      dropdownMenu.classList.toggle('show');
    });

    // Close dropdown on click outside
    document.addEventListener('click', function() {
      dropdownMenu.classList.remove('show');
    });

    // Prevent closing when clicking inside the menu
    dropdownMenu.addEventListener('click', function(e) {
      e.stopPropagation();
    });
  }

  if (profileBtn && menuBtn) {
    profileBtn.addEventListener('click', function() {
      // Hide the dropdown
      if (dropdownMenu) dropdownMenu.classList.remove('show');

      // Get profile details from button attributes
      var username = menuBtn.getAttribute('data-username') || 'N/A';
      var email = menuBtn.getAttribute('data-email') || 'N/A';
      var joined = menuBtn.getAttribute('data-joined') || 'N/A';

      // Create modal if not already present
      var modal = document.getElementById('profileDetailsModal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'profileDetailsModal';
        modal.className = 'profile-modal';
        modal.innerHTML = 
          '<div class="profile-card">' +
            '<div class="profile-avatar">' + username.charAt(0).toUpperCase() + '</div>' +
            '<h3>User Profile</h3>' +
            '<div class="profile-detail-item">' +
              '<span class="profile-label">Username</span>' +
              '<span class="profile-value">' + username + '</span>' +
            '</div>' +
            '<div class="profile-detail-item">' +
              '<span class="profile-label">Email</span>' +
              '<span class="profile-value">' + email + '</span>' +
            '</div>' +
            '<div class="profile-detail-item">' +
              '<span class="profile-label">Member Since</span>' +
              '<span class="profile-value">' + joined + '</span>' +
            '</div>' +
            '<button type="button" class="profile-close-btn" id="closeProfileBtn">Close</button>' +
          '</div>';
        document.body.appendChild(modal);

        // Bind close button event listener
        var closeBtn = modal.querySelector('#closeProfileBtn');
        closeBtn.addEventListener('click', function() {
          modal.classList.remove('open');
        });

        // Close on background click
        modal.addEventListener('click', function(e) {
          if (e.target === modal) {
            modal.classList.remove('open');
          }
        });
      }

      // Show modal
      modal.classList.add('open');
    });
  }
}
