const cors = require("cors")
const express = require('express')
const stripe = require("stripe")("sk_test_c6LaK2gealIYCpPaKaErewAY00e4OMi5Ec    ")
const uuid = require("uuid/v4")

const app = express()

//middlewares

app.use(express.json())
app.use(cors())


app.get('/', (req, res) => {
    res.json({ test: "test" })
})

app.post("/payment", (req, res) => {

    const { product, token } = req.body
    console.log("Product", product)
    console.log("Price", product.price)
    const idempotencyKey = uuid()

    stripe.customers.create(
        {
            email: token.email,
            source: token.id
        },
        {
            maxNetworkRetries: 2, // Retry this specific request twice before giving up
        }
    ).then(customer => {
        stripe.charges.create({ amount: product.price * 100,
             currency: 'usd', 
             customer: customer.id,
              receipt_email: token.email,
               description: product.name ,
               shipping: {
                name: token.card.name,
                address: {
                  country: token.card.address_country
                }
              }
            }, { idempotencyKey })
    }).then(result => res.status(200).json(result)).catch(err => console.log(err))
})

//listen

app.listen(8080, () => { console.log('LISTENING on Port') })
