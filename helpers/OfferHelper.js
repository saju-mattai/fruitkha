var db = require('../config/connection')
var collection = require('../config/collection')
const { ObjectID } = require('bson')
const { response } = require('../app')
var objectId = require('mongodb').ObjectId

module.exports = {

    findCategory: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).find().toArray().then((data) => {
                resolve(data)
            })
        })
    },
    InCategory: (details) => {
        return new Promise(async (resolve, reject) => {
            let existCategory = await db.get().collection(collection.CATEGORYOFFER_COLLECTION).findOne({ Category_name: details.Category_name })
            if (existCategory != null) {
                resolve(existCategory)
            } else {
                db.get().collection(collection.CATEGORYOFFER_COLLECTION).insertOne(details).then((data) => {
                    resolve(data)
                })
            }
        })
    },
    findSpecificCategory: (details) => {

        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).find({ Category: details.Category_name },).toArray().then((data) => {

                for (let i = 0; i < data.length; i++) {

                    let newPrice = Math.round(
                        Number(data[i].Price) -
                        (Number(data[i].Price) *
                            Number(details.Category_Offer)) /
                        100
                    );
                    db.get().collection(collection.PRODUCT_COLLECTION)
                        .updateOne({ _id: data[i]._id },
                            {
                                $set: {
                                    CategoryOffer: newPrice
                                }
                            })
                }
                resolve(data)


            })
        })
    },
    findProduct: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).find().toArray().then((data) => {
                resolve(data)
            })
        })

    },
    InProduct: (details) => {
        return new Promise(async (resolve, reject) => {
            let existoffer = await db.get().collection(collection.PRODUCT_OFFER_COLLECTION).findOne({
                product_name: details.product_name
            })
            if (existoffer != null) {
                resolve(existoffer)
            } else {
                db.get().collection(collection.PRODUCT_OFFER_COLLECTION).insertOne(details).then((data) => {
                    resolve(data)
                })
            }
        })
    },
    findindividualProduct: (details) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({ Name: details.product_name }).then((data) => {
                let newPrice = Math.round(
                    Number(data.Price) -
                    (Number(data.Price) *
                        Number(details.Product_Offer)) /
                    100
                );
                db.get().collection(collection.PRODUCT_COLLECTION)
                    .updateOne({ Name: details.product_name },
                        {
                            $set: {
                                ProductOffer: newPrice
                            }
                        })

                resolve(data)
            })
        })
    },
    findOfferCategory: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORYOFFER_COLLECTION).find().toArray().then((data) => {
                resolve(data)
            })
        })
    },
    findEditCategory: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORYOFFER_COLLECTION).findOne({ _id: objectId(id) }).then((data) => {
                resolve(data)
            })
        })
    },
    editCategory: (details) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORYOFFER_COLLECTION).updateOne({ _id: objectId(details.Categoryid) },
                {
                    $set: {
                        Category_name: details.Category_name,
                        Category_Offer: details.Category_Offer
                    }
                }).then(async (data) => {
                    let category = await db.get().collection(collection.PRODUCT_COLLECTION).find({ Category: details.Category_name }).toArray()
                    for (let i = 0; i < category.length; i++) {
                        let newPrice = Math.round(
                            Number(category[i].Price) -
                            (Number(category[i].Price) *
                                Number(details.Category_Offer)) /
                            100
                        );
                        db.get().collection(collection.PRODUCT_COLLECTION)
                            .update({ _id: category[i]._id },
                                {
                                    $set: {
                                        CategoryOffer: newPrice
                                    }
                                },
                                {
                                    multi: true
                                })
                    }
                    resolve(data)
                })
        })
    },
    findproductoffer: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_OFFER_COLLECTION).find().toArray().then((response) => {
                resolve(response)
               
            })
        })
    },
    findSpecificProduct: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_OFFER_COLLECTION).findOne({ _id: objectId(id) }).then((response) => {
                resolve(response)
                // console.log(response);
            })
        })
    },
    editProductoffer: (details) => {

        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_OFFER_COLLECTION).updateOne({ _id: objectId(details.Productid) },
                {
                    $set: {
                        product_name: details.Product_name,
                        Product_Offer: details.Product_Offer
                    }
                }).then(async (data) => {

                    let product = await db.get().collection(collection.PRODUCT_COLLECTION).find({ Name: details.Product_name }).toArray()

                    let newPrice = Math.round(
                        Number(product[0].Price) -
                        (Number(product[0].Price) *
                            Number(details.Product_Offer)) /
                        100
                    );

                    db.get().collection(collection.PRODUCT_COLLECTION)
                        .updateOne({ Name: details.Product_name },
                            {
                                $set: {
                                    ProductOffer: newPrice
                                }

                            })
                    resolve(data)


                })

        })

    },
    DeleteProductoffer: (proId) => {

        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_OFFER_COLLECTION).deleteOne({ _id: objectId(proId) }).then((response) => {


                resolve(response)

            })
        })

    },
    updateProductoffer: (details,) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ Name: details.Name },
                {
                    $set: {
                        ProductOffer: details.Price
                    }
                }).then((response) => {
                    resolve(response)

                })
        })
    },
    DeleteCategoryoffer: (proId) => {
        return new Promise(async (resolve, reject) => {
            let category = await db.get().collection(collection.CATEGORYOFFER_COLLECTION).findOne({ _id: objectId(proId) })

            let product = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            // console.log(product);

            // let category = await db.get().collection(collection.CATEGORYOFFER_COLLECTION).find({ _id: objectId(proId) }).toArray()
            // for(var i=0; i< category

            db.get().collection(collection.CATEGORYOFFER_COLLECTION).deleteOne({ Category_name: category.Category_name })

            for (let i = 0; i < product.length; i++) {
                if (product[i].Category === category.Category_name) {

                    db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ Name: product[i].Name },
                        {
                            $set: {
                                CategoryOffer: product[i].Price
                            }
                        })
                }
            }



        })


        // db.get().collection(collection.CATEGORYOFFER_COLLECTION).delete({_id:objectId(proId)}).then((data)=>{
        //     resolve(data)
        // })



    }


} 
