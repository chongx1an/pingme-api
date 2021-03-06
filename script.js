console.log('loaded')
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

    // const keyword = location.search.replace('?q=', '')

    // // Extract search results
    // let links = Array.from(document.querySelectorAll('a'))
    // .map(node => node.getAttribute('href'))
    // .filter(link => link.includes('/products/'))
    // .map(link => `${link.split('?')[0]}.js`)

    // // Search product event if results less than 5
    // if(links.length < 5) {
    //   const products = await Promise.all(links.map(link => $.getJSON(link)))
    //   const productIds = products.map(product => product.id)
    //   await $.get(`${API_URL}/search?shop=${Shopify.shop}&customerId=${customerId}&keyword=${keyword}&productIds=${productIds.join(',')}`)
    // }
  
  } else if (location.pathname.startsWith('/products') || location.pathname.startsWith('/collections')) {
  
    const template = location.pathname.split('/').reverse()[1]
    const handle = location.pathname.split('/').pop()
  
    if (template == 'products') {

      // View product event
      res = await $.getJSON(`/products/${handle}.json`)
      await $.get(`${API_URL}/products/${res.product.id}/view?shop=${Shopify.shop}&customerId=${customerId}`)

      // Add to cart event
      const addToCartButton = document.querySelector('.btn.product-form__cart-submit')
        
      addToCartButton.addEventListener('click', async function() {
        await $.get(`${API_URL}/products/${res.product.id}/cart?shop=${Shopify.shop}&customerId=${customerId}`)
      })
  
    } else if (template == 'collections') {

      // // View collection event
      // res = await $.getJSON(`/${template}/${handle}.json`)
      // await $.get(`${API_URL}/collections/${res.collection.id}/view?shop=${Shopify.shop}&customerId=${customerId}`)
  
    }
  
  }

}

if(customerId && !isSpam()) {
  main()
}