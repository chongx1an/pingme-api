const customerId = __st ? __st.cid : null

if(customerId) {

  const template = location.pathname.split('/').reverse()[1]

  const baseUrl = 'https://the-pingme-api.herokuapp.com/shopify'

  if(template == 'products') {

    const handle = location.pathname.split('/').pop()

    $.getJSON(`/products/${handle}.json`).then(res => {

      // View product event
      $.get(`${baseUrl}/products/${res.product.id}/view?shop=${Shopify.shop}&customerId=${customerId}`)

      // Add to cart event
      document.getElementsByClassName('btn product-form__cart-submit')[0].addEventListener('click', function() {
        
        $.get(`${baseUrl}/products/${res.product.id}/cart?shop=${Shopify.shop}&customerId=${customerId}`)

      })

    })

  } else if(template == 'collections') {

    const handle = location.pathname.split('/').pop()

    // View collection event
    $.getJSON(`/${template}/${handle}.json`, res => {
      $.get(`${baseUrl}/collections/${res.collection.id}/view?shop=${Shopify.shop}&customerId=${customerId}`)
    })

  }

}