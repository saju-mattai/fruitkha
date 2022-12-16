var db = require('../config/connection')
var collection = require('../config/collection')
const { ObjectId } = require('mongodb')
const { response } = require('../app')
const Razorpay = require('razorpay')
const { resolve } = require('path')
const { log } = require('console')
const moment = require('moment')
var instance = new Razorpay({
    key_id: 'rzp_test_at5j0lXKS9Vnjv',
    key_secret: 'fPGeFI3LOE1gYQmK5QiSgKvR'

})


module.exports = {
    CancelOrder: (data) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CART_COLLECTION)
                .updateOne({ _id: ObjectId(data.cart) },
                    {
                        $pull: { Products: { item: ObjectId(data.product) } }
                    }).then((response) => {
                        resolve({ CancelOrder: true })
                    })
        })
    },
    getTotalAmount: (UserId) => {
        return new Promise(async (resolve, reject) => {
            let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: ObjectId(UserId) }
                },
                {
                    $unwind: '$Products'
                },
                {
                    $project: {
                        item: '$Products.item',
                        quantity: '$Products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'Cart'
                    }
                },

                {
                    $project: {
                        item: 1, quantity: 1, Cart: { $arrayElemAt: ['$Cart', 0] }
                    }
                },
                // {
                //     $group: {
                //         _id: null,
                //         total: { $sum: { $multiply: [{ '$toInt': '$quantity' }, { '$toInt': '$Cart.Price' }] } }
                //     }
                // }


            ]).toArray()

            let amount = 0


            for (let i = 0; i < total.length; i++) {

                if (total[i].Cart.ProductOffer == total[i].Cart.Price && total[i].Cart.CategoryOffer == total[i].Cart.Price) {
                    amount = parseInt(amount) + ((parseInt(total[i].quantity) * parseInt(total[i].Cart.Price)))

                } else if
                    (total[i].Cart.CategoryOffer == total[i].Cart.Price) {
                    amount = parseInt(amount) + ((parseInt(total[i].quantity) * parseInt(total[i].Cart.ProductOffer)))

                } else if (total[i].Cart.ProductOffer > total[i].Cart.CategoryOffer) {
                    amount = parseInt(amount) + ((parseInt(total[i].quantity) * parseInt(total[i].Cart.CategoryOffer)))

                } else if (total[i].Cart.ProductOffer < total[i].Cart.CategoryOffer) {
                    amount = parseInt(amount) + ((parseInt(total[i].quantity) * parseInt(total[i].Cart.ProductOffer)))

                } else if (total[i].Cart.CategoryOffer == null || total[i].Cart.CategoryOffer == 0) {
                    amount = parseInt(amount) + ((parseInt(total[i].quantity) * parseInt(total[i].Cart.ProductOffer)))

                }
            }
            resolve(amount)
        })
    },
    placeOrder: (order, products, total, newcoupon, userId, wallet) => {
        return new Promise(async (resolve, reject) => {
            let totalAmount = {
                total: total
            }
            let status = order['paymentMethod'] === 'COD' || 'wallet' ? 'placed' : 'pending'
            for (let i = 0; i < products.length; i++) {
                products[i].status = status
            }
            let orderObj = {
                delivaryDetails: {
                    name: order.Name,
                    email: order.Email,
                    mobile: order.Phone,
                    address: order.Address,
                    pincode: order.Pin
                },
                userId: ObjectId(userId),
                paymentMethod: order['paymentMethod'],
                products: products,
                quantity: 1,
                totalAmount: [totalAmount],
                status: status,
                date: moment().format('L')
            }

            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then(async (response) => {
                let cart = await db.get().collection(collection.CART_COLLECTION).find({ user: ObjectId(userId) }).toArray()
                cart = cart[0].Products;
                for (i = 0; i < cart.length; i++) {
                    let quantity = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: ObjectId(cart[i].item) })
                    let newquantity = parseInt(quantity.Quatity) - cart[i].quantity;
                    db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: ObjectId(cart[i].item) }, { $set: { Quatity: newquantity } })
                }
                db.get().collection(collection.CART_COLLECTION).deleteOne({ user: ObjectId(userId) })



                if (newcoupon != null) {

                    let user = {
                        user: ObjectId(userId)
                    }

                    db.get().collection(collection.COUPON_COLLECTION).updateOne({ CouponCode: newcoupon.CouponCode },
                        {
                            $set: {
                                user: [user]
                            }
                        }).then((data) => {
                            resolve(data)

                        })
                }
                if (wallet.amount < total) {

                } else {
                    if (order['paymentMethod'] == 'wallet') {
                        db.get().collection(collection.WALLET_COLLECTION).updateOne({ user: ObjectId(userId) },
                            {

                                $inc: { amount: -total }
                            })
                    }
                }
                resolve(response)
            })
        })
    },



    getProductList: (userId) => {

        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: {
                        user: ObjectId(userId)
                    },

                },
                {
                    $unwind: '$Products'
                },
                {
                    $project: {
                        item: '$Products.item',
                        quantity: '$Products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: "products"
                    }
                },
                {
                    $unwind: '$products'
                },
                // {
                //     $project:{
                //         'products':1
                //     }
                // }
            ]).toArray()
            resolve(cart)
        })

    },

    findOrder: (userId) => {

        return new Promise(async (resolve, reject) => {
            let order = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        userId: ObjectId(userId)
                    }
                },
                {
                    $unwind: '$products'
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'products.products._id',
                        foreignField: '_id',
                        as: "result"
                    }
                },
                {

                    $unwind: '$result'
                }



            ]).toArray()

            resolve(order)
        })

    },
    getProductName: (userId) => {
        return new Promise(async (resolve, reject) => {

            let details = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: {
                        user: ObjectId(userId)
                    }
                },
                {
                    $unwind: '$Products'
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'Products.item',
                        foreignField: '_id',
                        as: 'products'
                    }
                },
                {
                    $unwind: '$products'
                },

            ]).toArray()

            resolve(details)
        })

    },
    //want order details for admin
    orderlist: () => {
        return new Promise(async (resolve, reject) => {
            let result = await db.get().collection(collection.ORDER_COLLECTION).find().sort({ _id: -1 }).toArray()
            resolve(result)
        })
    },
    orderlistuser: (userId) => {
        return new Promise(async (resolve, reject) => {
            let result = await db.get().collection(collection.ORDER_COLLECTION).find({ userId: ObjectId(userId) }).sort({ _id: -1 }).toArray()
            resolve(result)
        })
    },
    //getSingleProductList
    getSingleProductList: (proId) => {
        return new Promise(async (resolve, reject) => {
            let res = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        _id: ObjectId(proId)
                    }
                },
                // {
                //     $project:{
                //         'products':1
                //     }
                // },
                {
                    $unwind: '$products'
                }
            ]).toArray()
            // let res = await db.get().collection(collection.ORDER_COLLECTION).find({_id:ObjectId(proId)}).toArray()

            resolve(res)


        })
    },
    // OrderCancel
    OrderStatus: (order, status, userId, orderdetails) => {

        return new Promise(async (resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: ObjectId(order.orderid), 'products.item': ObjectId(order.id) }, {
                $set: {
                    'products.$.status': status
                }
            }).then(async (data) => {

                let orders = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                    {
                        $match:
                        {
                            _id: ObjectId(order.orderid)
                        }
                    },
                    {
                        $unwind: '$products'
                    },
                    {
                        $match:
                        {
                            'products.item': ObjectId(order.id)
                        }
                    }
                ]).toArray()





                let quantity = orders[0].products.quantity

                db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: ObjectId(orders[0].products.item) }, { $inc: { Quatity: quantity } })
                let method = await db.get().collection(collection.ORDER_COLLECTION).findOne({ _id: ObjectId(order.orderid), 'products.item': ObjectId(order.id) })

                if (method.paymentMethod != 'COD') {

                    if (status == 'cancelled' || status == 'return') {

                        let total = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: ObjectId(order.id) })


                        let amount = 0

                        if (total.ProductOffer == total.Price && total.CategoryOffer == total.Price) {
                            amount = parseInt(total.Price)

                        } else if
                            (total.CategoryOffer == total.Price) {
                            amount = parseInt(total.Price)

                        } else if (total.ProductOffer > total.CategoryOffer) {
                            amount = parseInt(total.CategoryOffer)

                        } else if (total.ProductOffer < total.CategoryOffer) {
                            amount = parseInt(total.CategoryOffer)

                        } else if (total.CategoryOffer == null || total.CategoryOffer == 0) {
                            amount = parseInt(total.ProductOffer)
                        }
                        let user = await db.get().collection(collection.WALLET_COLLECTION).findOne({ user: ObjectId(userId) })
                        amount = parseInt(amount) * parseInt(quantity)
                        if (user == null) {
                            console.log(amount);
                            let wallet = {
                                user: ObjectId(userId),
                                amount: parseInt(amount)
                            }
                            db.get().collection(collection.WALLET_COLLECTION).insertOne(wallet).then((data) => {

                            })

                        } else {
                            db.get().collection(collection.WALLET_COLLECTION).updateOne({ user: ObjectId(userId) },
                                {
                                    $inc: { amount: amount }
                                })
                        }
                    }
                } else {
                    if (status == 'return') {
                        let total = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: ObjectId(order.id) })


                        let amount = 0

                        if (total.ProductOffer == total.Price && total.CategoryOffer == total.Price) {
                            amount = parseInt(total.Price)

                        } else if
                            (total.CategoryOffer == total.Price) {
                            amount = parseInt(total.Price)

                        } else if (total.ProductOffer > total.CategoryOffer) {
                            amount = parseInt(total.CategoryOffer)

                        } else if (total.ProductOffer < total.CategoryOffer) {
                            amount = parseInt(total.CategoryOffer)

                        } else if (total.CategoryOffer == null || total.CategoryOffer == 0) {
                            amount = parseInt(total.ProductOffer)
                        }
                        let user = await db.get().collection(collection.WALLET_COLLECTION).findOne({ user: ObjectId(userId) })
                        amount = parseInt(amount) * parseInt(quantity)
                        if (user == null) {
                            console.log(amount);
                            let wallet = {
                                user: ObjectId(userId),
                                amount: parseInt(amount)
                            }
                            db.get().collection(collection.WALLET_COLLECTION).insertOne(wallet).then((data) => {

                            })

                        } else {
                            db.get().collection(collection.WALLET_COLLECTION).updateOne({ user: ObjectId(userId) },
                                {
                                    $inc: { amount: amount }
                                })
                        }
                    }
                }
            })
            resolve({ status: true })
            //     let cart = await db.get().collection(collection.CART_COLLECTION).find({user:ObjectId(userId)}).toArray()

            //     cart = cart[0].Products;
            //     for(i=0;i<cart.length;i++){
            //         let quantity = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:ObjectId(cart[i].item)})
            //         let newquantity = parseInt(quantity.Quatity)-cart[i].quantity;

            // db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:ObjectId(cart[i].item)},{$set:{Quatity:newquantity}})
            //     }

        })
    },
    InAddress: (userId, details) => {
        return new Promise((resolve, reject) => {
            let AddressDetails = {
                name: details.Name,
                email: details.Email,
                Address: details.Address,
                Pin: details.Pin,
                Phone: details.Phone,
                userId: ObjectId(userId),
            }
            db.get().collection(collection.ADDRESS_COLLECTION).insertOne(AddressDetails).then((response) => {
                resolve(response)

            })
        })
    },
    // getAddress:(userId)=>{
    //    return new Promise((resolve, reject) => {
    //     db.get().collection(collection.ADDRESS_COLLECTION).findOne({userId:ObjectId(userId)}).then((response)=>{

    //     resolve(response)
    //     })
    //    })
    // }
    finduser: (addressId, userId) => {

        return new Promise((resolve, reject) => {
            db.get().collection(collection.ADDRESS_COLLECTION).aggregate([
                {
                    $match: {
                        userId: ObjectId(userId)
                    }
                },
                {
                    $unwind: '$Address'
                },
                {
                    $match:
                    {
                        'Address.id': ObjectId(addressId)
                    }
                }

            ]).toArray().then((response) => {

                resolve(response)

            })


        })

        // },
        // validUser:(user)=>{
        //     return new Promise((resolve, reject) => {
        //         db.get().collection(collection.USER_COLLECTION).findOne({})
        //     })
    },
    findAddress: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ADDRESS_COLLECTION).findOne({ userId: ObjectId(userId) }).then((response) => {
                resolve(response)
            })
        })
    },
    generateRazorpay: (orderId, total) => {
        return new Promise((resolve, reject) => {
            var options = {
                amount: parseFloat(total) * 100,  // amount in the smallest currency unit
                currency: "INR",
                receipt: '' + orderId.insertedId
            };
            instance.orders.create(options, function (err, order) {
                if (err) {
                    console.log(err);
                } else {
                    resolve(order)

                }
            });
        })
    },
    verifyPayment: (details) => {
        return new Promise((resolve, reject) => {
            const crypto = require('crypto')
            let hmac = crypto.createHmac('sha256', 'fPGeFI3LOE1gYQmK5QiSgKvR')
            hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]']);
            hmac = hmac.digest('hex')
            if (hmac == details['payment[razorpay_signature]']) {
                resolve()
            } else {
                reject()
            }
        })
    },
    changePaymentStatus: (orderId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION)
                .updateOne({ _id: ObjectId(orderId) },
                    {
                        $set: {
                            status: 'placed'
                        }
                    }).then(() => {
                        resolve()
                    })
        })
    },
    shippedOrder: (orderId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION)
                .updateOne({ _id: ObjectId(orderId) },
                    {
                        $set: {
                            status: 'Shipped'
                        }
                    }).then((response))
            resolve({ shipped: true })

        })
    },
    shippedOrder: (orderId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION)
                .updateOne({ _id: ObjectId(orderId) },
                    {
                        $set: {
                            status: 'Shipped'
                        }
                    }).then((response))
            resolve({ shipped: true })

        })
    },
    // DeliverderOrder: (orderId) => {
    //     return new Promise((resolve, reject) => {
    //         db.get().collection(collection.ORDER_COLLECTION)
    //             .updateOne({ _id: ObjectId(orderId) },
    //                 {
    //                     $set: {
    //                         status: 'Delivered'
    //                     }
    //                 }).then((response))
    //         resolve()

    //     })
    // },
    findPaymentMethodCod: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).find({ paymentMethod: 'COD' }).count().then((data) => {
                resolve(data)
            })
        })
    },
    findPaymentMethodPaypal: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).find({ paymentMethod: 'Paypal' }).count().then((data) => {
                resolve(data)
            })
        })
    },
    findPaymentMethodRazorpay: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).find({ paymentMethod: 'Razorpay' }).count().then((data) => {
                resolve(data)
            })
        })
    },
    NonActiveUser: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).find({ loginstatus: false }).count().then((data) => {
                resolve(data)

            })
        })
    },
    ActiveUser: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).find({ loginstatus: true }).count().then((data) => {
                resolve(data)
            })
        })
    },
    getAllorder: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).find().sort({ _id: -1 }).toArray().then((data) => {
                resolve(data)
            })
        })
    },
    OrderDate: (date) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).find({ date: { $gte: date } }).sort({ _id: -1 }).toArray().then((data) => {
                resolve(data)


            })


        })
    },
    getAllorderCount: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).find().count().then((data) => {
                resolve(data)


            })
        })
    },
    Deliverdorderdetails: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).find({ 'products.status': 'Delivered' }).toArray().then((data) => {

                let totalAmount = 0
                for (var i = 0; i < data.length; i++) {
                    totalAmount = totalAmount + parseInt(data[i].totalAmount[0].total)
                }
                resolve(totalAmount)

            })
        })
    },
    allUserCount: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).find().count().then((data) => {
                resolve(data)
            })
        })
    },
    getallproduct: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:ObjectId(userId)}).then((data) => {
                resolve(data)
                
            })
        })
    },
    // reduceTotalAmount:()=>{

    // }
    // getOgPrice: (userId) => {
    //     return new Promise(async(resolve, reject) => {
    //      let ogprice=await db.get().collection(collection.CART_COLLECTION).aggregate([
    //             {
    //                 $match:{user:ObjectId(userId)}
    //             },
    //             {
    //                 $lookup:{
    //                     from:
    //                 }
    //             }


    //         ]).toArray()
    //         resolve(ogprice)
    //        
    //     })
    // }

}
