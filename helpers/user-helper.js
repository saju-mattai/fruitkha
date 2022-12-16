var db = require('../config/connection')
var bcrypt = require('bcrypt')
const collection = require('../config/collection')
const { response } = require('../app')
const { ObjectId } = require('mongodb')

let details, mail, phone


module.exports = {
    doSignup: ((userdata) => {
        return new Promise(async (resolve, reject) => {
            userdata.loginstatus = true
            userdata.Password = await bcrypt.hash(userdata.Password, 10)
            db.get().collection(collection.USER_COLLECTION).insertOne(userdata).then((response) => {
                resolve(response)
            })
        })
    }),
    doLogin: ((userdata) => {
        return new Promise(async (resolve, reject) => {
            // let loginstatus=false
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ Email: userdata.Email })
            if (user) {
                bcrypt.compare(userdata.Password, user.Password).then((status) => {
                    if (status) {
                        console.log('login sucusess');
                        response.user = user
                        response.status = true
                        resolve(response)
                    } else {
                        console.log('login failed');
                        resolve({ status: false })
                    }
                })
            } else {
                console.log('login failed');
                resolve({ status: false })
            }
        })
    }),
    registredUser: (data) => {
        return new Promise(async (resolve, reject) => {
            details = true
            let phone = await db.get().collection(collection.USER_COLLECTION).findOne({ Mobile: data.Mobile })
            if (phone) {
                details = true
                resolve(details)
            } else {
                details = false
                resolve(details)

            }
        })
    },
    validMail: (data) => {
        return new Promise(async (resolve, reject) => {
            mail = true
            let existemail = await db.get().collection(collection.USER_COLLECTION).findOne({ Email: data.Email })
            console.log(existemail);
            if (existemail) {
                mail = true
                resolve(mail)
            } else {
                mail = false
                resolve(mail)
            }
        })
    },
    validMobile: (data) => {
        return new Promise(async (resolve, reject) => {
            phone = true
            let mobile = await db.get().collection(collection.USER_COLLECTION).findOne({ Mobile: data.Mobile })
            if (mobile) {
                phone = true
                resolve(phone)
            } else {
                phone = false
                resolve(phone)
            }

        })
    },
    AddToCart: (proId, UserId) => {
        let proObj = {
            item: ObjectId(proId),
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectId(UserId) })
            if (userCart) {
                let proExist = userCart.Products.findIndex(product => product.item == proId)
                if (proExist != -1) {
                    db.get().collection(collection.CART_COLLECTION)
                        .updateOne({ user: ObjectId(UserId), 'Products.item': ObjectId(proId) },
                            {
                                $inc: { 'Products.$.quantity': 1 }
                            }
                        ).then(() => {
                            resolve()
                        })
                } else {
                    db.get().collection(collection.CART_COLLECTION)
                        .updateOne({ user: ObjectId(UserId) },
                            {
                                $push: { Products: proObj }
                            }).then((response) => {
                                resolve()
                            })
                }
            } else {
                let CartObj = {
                    user: ObjectId(UserId),
                    Products: [proObj]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(CartObj).then((response) => {
                    resolve()
                })
            }
        })
    },

    GetCartProducts: (UserId) => {
        return new Promise(async (resolve, reject) => {
            let CartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
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
                }

            ]).toArray()

            resolve(CartItems)
        })
    },
    changeProductQuantity: (details) => {

        details.count = parseInt(details.count)
        return new Promise(async (resolve, reject) => {




            db.get().collection(collection.CART_COLLECTION)
                .updateOne({ _id: ObjectId(details.cart), 'Products.item': ObjectId(details.product) },
                    {
                        $inc: { 'Products.$.quantity': details.count }
                    }
                ).then(() => {
                    resolve()
                })




        })

    },
    findUser: (UserId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).findOne({ _id: ObjectId(UserId) }).then((response) => {
                resolve(response)

            })
        })
    },
    changePassword: (details, UserId) => {
        console.log(details);
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: ObjectId(UserId) })
            let userstatus
            if (user) {
                bcrypt.compare(details.oldpassword, user.Password).then(async (status) => {
                    if (status) {
                        details.newpassword = await bcrypt.hash(details.newpassword, 10)
                        db.get().collection(collection.USER_COLLECTION).updateOne({ _id: ObjectId(UserId) }, {
                            $set: {
                                Password: details.newpassword
                            }
                        }).then((response) => {
                            userstatus = true
                            resolve(userstatus)
                        })
                    } else {
                        userstatus = false
                        resolve(userstatus)
                    }
                })
            }
        })


    },
    findwallet: (UserId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.WALLET_COLLECTION).findOne({ user: ObjectId(UserId) }).then((data) => {
                resolve(data)
            })
        })
    }


}

