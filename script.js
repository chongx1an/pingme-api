const customerId = __st ? __st.cid : null

if(customerId) {

    const template = location.pathname.split('/').reverse()[1]

    if(template == 'products' || template == 'collections') {

        const baseUrl = 'https://the-pingme-api.herokuapp.com/shopify/view'
        const handle = location.pathname.split('/').pop()

        if(template == 'products') {
          
          $.getJSON(`/products/${handle}.json`, res => {
            $.get(`${baseUrl}/products/${res.product.id}?shop=${Shopify.shop}&customerId=${customerId}`)
          })
            
        } else if(template == 'collections') {
          
          $.getJSON(`/collections/${handle}.json`, res => {
            $.get(`${baseUrl}/collections/${res.collection.id}?shop=${Shopify.shop}&customerId=${customerId}`)
          })

        }

    }

}