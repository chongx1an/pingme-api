const customerId = __st ? __st.cid : null

if(customerId) {

    const template = location.pathname.split('/').reverse()[1]

    if(['products', 'collections'].includes(template)) {

        const handle = location.pathname.split('/').pop()

        $.getJSON(`/${template}/${handle}.json`, res => {
          $.get(`https://the-pingme-api.herokuapp.com/shopify/view/${template}/${res[template].id}?shop=${Shopify.shop}&customerId=${customerId}`)
        })

    }

}