const customerId = __st ? __st.cid : null

const template = location.pathname.split('/').reverse()[1]

const apiUrl = 'https://the-pingme-api.herokuapp.com/shopify'

const isSpam = () => {

  // const previousTimestamp = localStorage.getItem(location.pathname)

  // return previousTimestamp && ((Date.now() - previousTimestamp) / 1000) < 5
  
  return false

}

if(customerId && !isSpam()) {

  localStorage.clear()
  localStorage.setItem(location.pathname, Date.now())

  switch (template) {

    case '':

      // View home event
      $.get(`${apiUrl}/home/view?shop=${Shopify.shop}&customerId=${customerId}`)
      
    break

    case 'products':

      const handle = location.pathname.split('/').pop()

      $.getJSON(`/products/${handle}.json`).then(res => {

        // View product event
        $.get(`${apiUrl}/products/${res.product.id}/view?shop=${Shopify.shop}&customerId=${customerId}`)

        // Add to cart event
        document.getElementsByClassName('btn product-form__cart-submit')[0].addEventListener('click', function() {
          
          $.get(`${apiUrl}/products/${res.product.id}/cart?shop=${Shopify.shop}&customerId=${customerId}`)

        })

      })

    break

    case 'collections':

      const handle = location.pathname.split('/').pop()

      // View collection event
      $.getJSON(`/${template}/${handle}.json`, res => {
        $.get(`${apiUrl}/collections/${res.collection.id}/view?shop=${Shopify.shop}&customerId=${customerId}`)
      })

    break

  }

}