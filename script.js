// Storing frequently used elements
const peopleList = document.querySelector('aside.people')
const productList = document.querySelector('section.product-list')
const modal = document.querySelector('dialog')

// Close modal on click backdrop
modal.addEventListener("click", (e) => {
  const rect = modal.getBoundingClientRect();
  if (
    e.clientY < rect.top ||
    e.clientY > rect.bottom ||
    e.clientX < rect.left ||
    e.clientX > rect.right
  ) {
    modal.close();
  }
});

// Set modal to add person mode
function personModal() {
  modal.innerHTML = `
    <h2>Adicionar Pessoa</h2>
    <label for="name">Nome</label>
    <input type="text" id="name" autocomplete="off" />
    <section class="buttons">
    <button onclick="addPerson()">Salvar</button>
      <button onclick="closeModal()">Cancelar</button>
    </section>
  `
  modal.showModal()
}

// Set modal to add product mode
function productModal() {
  modal.innerHTML = `
    <h2>Adicionar Produto</h2>
    <label for="name">Nome</label>
    <input type="text" id="name" autocomplete="off" />
    <label for="price">Preço</label>
    <input type="number" id="price" autocomplete="off" />
    <section class="buttons">
    <button onclick="addProduct()">Salvar</button>
      <button onclick="closeModal()">Cancelar</button>
    </section>
  `
  modal.showModal()
}

// Set modal to add paying mode
function payingModal(e) {
  let product = e.target.parentElement.previousElementSibling.firstChild.textContent
  let people = [...document.querySelectorAll('aside.people article')].map(article => article.textContent)
  let payers = [...e.target.parentElement.querySelectorAll('span')].map(span => span.dataset.name)
  modal.innerHTML = `
    <h2>Adicionar Pagante</h2>
    <select onchange="addPaying('${product}')">
      <option value=""></option>
      ${people.map(person => {
          if(payers.includes(person)) return
          return `<option value=${person}>${person}</option>`
        })
      })}
    </select>
    <section class="buttons">
      <button onclick="closeModal()">Cancelar</button>
    </section>
  `
  modal.showModal()
}

function closeModal() {
  modal.close()
}

function addPerson() {
  let name = document.querySelector('input#name').value.trim().replace(' ', '')
  if(!name) return
  let article = document.createElement('article')  
  article.addEventListener('click', delPerson)
  let checkbox = document.createElement('input')
  checkbox.setAttribute('type', 'checkbox')
  checkbox.addEventListener('change', updateTotal)
  article.append(name)
  article.append(checkbox)

  peopleList.insertBefore(article, document.querySelector('.addPerson'))

  tippy(`input[type="checkbox"]`, {
    content: `<strong>Taxa de serviço (10%)</strong>`,
    allowHTML: true,
    arrow: true,
    theme: 'gesser',
  }); 

  updateTotal()
  closeModal()
}

function delPerson(e) {
  // Check if user clicking on thrash can
  if(e.clientX < 200) return
  peopleList.removeChild(e.target)

  // Remove person from all products
  document.querySelectorAll('span').forEach(span => {
    if(span.dataset.name == e.target.textContent) {
      span.parentElement.removeChild(span)
    }
  })

  updateTotal()
}

function addProduct() {
  let name = document.querySelector('input#name').value.trim()
  if(!name) return
  let price = document.querySelector('input#price').value.trim()
  if(!price) return
  // Build entire product
  let article = document.createElement('article')
  let header = document.createElement('section')
  header.classList.add('header')
  article.append(header)
  let strong = document.createElement('strong')
  strong.append(name)
  header.append(strong)
  let span = document.createElement('span')
  span.append(price)
  header.append(span)
  let delButton = document.createElement('button')
  let delIcon = document.createTextNode('🗑')
  delButton.append(delIcon)
  delButton.classList.add('btn', 'delProduct')
  delButton.addEventListener('click', delProduct)
  header.append(delButton)
  let paying = document.createElement('section')
  paying.classList.add('paying')
  let addPayingButton = document.createElement('button')
  addPayingButton.classList.add('btn')
  addPayingButton.addEventListener('click', payingModal)
  let addIcon = document.createTextNode('+')
  addPayingButton.append(addIcon)
  paying.append(addPayingButton)
  article.append(paying)
  
  // Insert product before "+" button
  productList.insertBefore(article, document.querySelector('.addProduct'))
  closeModal()
}

function delProduct(e) {
  e.target.parentElement.parentElement.parentElement.removeChild(e.target.parentElement.parentElement)

  updateTotal()
}

// Add a person to a product
function addPaying(product) {
  let payingName = document.querySelector('select').value
  if(!payingName) return
  let span = document.createElement('span')
  span.dataset.name = payingName
  span.append(document.createTextNode(payingName.toUpperCase().charAt(0)))
  span.addEventListener('click', delPaying)
  
  // Insert the person to all products that match product name received from payingModal function
  document.querySelectorAll('strong').forEach(productName => {
    if(productName.textContent == product) {
      productName.parentElement.nextElementSibling.insertBefore(span, productName.parentElement.nextElementSibling.lastChild)
    }
  })

  // Add tooltip to person at product
  tippy(`span[data-name="${payingName}"]`, {
    content: `<strong>${payingName}</strong>`,
    allowHTML: true,
    arrow: true,
    theme: 'gesser',
  });

  updateTotal()
  closeModal()
}

function delPaying(e) {
  e.target.parentElement.removeChild(e.target)

  updateTotal()
}

// Build each person total using auxiliar function calculateBill
function updateTotal() {
  let h1 = document.createElement('h1')
  let total = document.createTextNode('Total')
  h1.append(total)
  document.querySelector('.total').replaceChildren(h1)
  document.querySelectorAll('.people > article').forEach(people => {
    let article = document.createElement('article')
    let name = document.createTextNode(people.innerText)
    let span = document.createElement('span')

    let price = document.createTextNode(`R$${calculateBill(people.innerText).toFixed(2)}`)
    article.append(name)
    span.append(price)
    article.append(span)
    document.querySelector('.total').append(article)
  })
}

// Calculate how much each person gonna pay by inspecting which product each one is a payer, dividing the product price by number of payers and adding it to person total
function calculateBill(name) {
  let total = 0
  document.querySelectorAll('section.product-list > article > .paying > span').forEach(paying => {
    if(paying.dataset.name.toUpperCase() == name.toUpperCase()) {
      let productPrice = paying.parentElement.parentElement.firstChild.querySelector('span').textContent
      let payingNumber = paying.parentElement.childElementCount - 1
      total += productPrice / payingNumber
    }
  })

  let person = [...document.querySelectorAll('aside.people article')].find(person => person.textContent == name)
  if(person.lastChild.checked) {
    return total * 1.10
  } else {
    return total
  }
}

updateTotal()