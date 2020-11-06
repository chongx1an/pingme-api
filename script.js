const customerId = __st ? __st.cid : null
const API_URL = 'https://the-pingme-api.herokuapp.com/shopify'

const isSpam = () => {
  // const previousTimestamp = localStorage.getItem(location.pathname)
  // return previousTimestamp && ((Date.now() - previousTimestamp) / 1000) < 5
  return false
}

async function main() {

  let res

  if(location.pathname == '/search') {

    const keyword = location.search.replace('?q=', '')
    await $.get(`${API_URL}/search?shop=${Shopify.shop}&customerId=${customerId}&keyword=${keyword}`)
  
  } else if (location.pathname.startsWith('/products') || location.pathname.startsWith('/collections')) {
  
    const template = location.pathname.split('/').reverse()[1]
  
    if (template == 'products') {

      // View product event
      res = await $.getJSON(`/products/${handle}.json`)
      await $.get(`${API_URL}/products/${res.product.id}/view?shop=${Shopify.shop}&customerId=${customerId}`)

      // Add to cart event
      const addToCartButton = document.querySelector('btn product-form__cart-submit')
        
      addToCartButton.addEventListener('click', async () => {
        await $.get(`${API_URL}/products/${res.product.id}/cart?shop=${Shopify.shop}&customerId=${customerId}`)
      })
  
    } else if (template == 'collections') {

      // View collection event
      res = await $.getJSON(`/${template}/${handle}.json`)
      await $.get(`${API_URL}/collections/${res.collection.id}/view?shop=${Shopify.shop}&customerId=${customerId}`)
  
    }
  
  }

}

if(customerId && !isSpam()) {
  main()
}