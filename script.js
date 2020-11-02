const { base } = require("./models/team")

const customerId = __st ? __st.cid : null

if(customerId) {

  const enterTime = new Date()

  const baseUrl = 'https://the-pingme-api.herokuapp.com/shopify'

  const template = location.pathname.split('/').reverse()[1]

  window.onbeforeunload = function() {

    const leaveTime = new Date()

    const duration = (leaveTime - enterTime) / 1000
    
    if(template == 'products' || template == 'collections') {

      const handle = location.pathname.split('/').pop()

      if(template == 'products') {
        
        $.getJSON(`/products/${handle}.json`, res => {
          $.get(`${baseUrl}/view/products/${res.product.id}?shop=${Shopify.shop}&customerId=${customerId}&duration=${duration}`)
        })
          
      } else if(template == 'collections') {
        
        $.getJSON(`/collections/${handle}.json`, res => {
          $.get(`${baseUrl}/view/collections/${res.collection.id}?shop=${Shopify.shop}&customerId=${customerId}&duration=${duration}`)
        })

      }

    }

  }

}