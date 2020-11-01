const customerId = __st ? __st.cid : null

if(customerId) {

    if(location.pathname.includes('/products/')) {
      
      const handle = location.pathname.split('/').pop()
      
      fetch(`/products/${handle}.json`)
      .then(res => res.json())
      .then(res => fetch(`https://the-pingme-api.herokuapp.com/shopify/view/products/${res.product.id}?customerId=${customerId}`))
        
    } else if(location.pathname.includes('/collections/')) {
      
      const handle = location.pathname.split('/').pop()
      console.log(handle)

      fetch(`/collections/${handle}.json`)
      .then(res => res.json())
      .then(res => fetch(`https://the-pingme-api.herokuapp.com/shopify/view/collections/${res.collection.id}?customerId=${customerId}`))

    }

}