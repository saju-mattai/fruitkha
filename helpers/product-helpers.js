var db = require('../config/connection')
var collection = require('../config/collection')
const { ObjectID } = require('bson')
var objectId = require('mongodb').ObjectId
module.exports = {
    addProduct: (product, callback) => {

        db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product).then((data) => {
            callback(data.insertedId)

        })

    }, getAllProduct: () => {
        // let mysort = { name: -1 };  
        return new Promise((resolve, reject) => {
            let product = db.get().collection(collection.PRODUCT_COLLECTION).find().sort({ _id: -1 }).toArray()
            resolve(product)
        })
    },
    deleteProduct: (proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({ _id: ObjectID(proId) }).then((response) => {
                resolve(response)
            })
        })
    },
    GetProductDetails: (proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(proId) }).then((product) => {
                resolve(product)
            })
        })
    },
    updateProduct: (proId, proDetais) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(proId) },
                {
                    $set: {
                        Name: proDetais.Name,
                        Category: proDetais.Category,
                        Price: parseInt(proDetais.Price),
                        Offer: parseInt(proDetais.Offer),
                        Description: proDetais.Description,
                        Quatity: parseInt(proDetais.Quatity),
                        Image1: proDetais.Image1,
                        Image2: proDetais.Image2,
                        Image3: proDetais.Image3,
                    }
                }).then((response) => {
                    resolve()
                })
        })
    },
    addbanner: (banner) => {
        return new Promise(async (resolve, reject) => {
            let existbanner = await db.get().collection(collection.banner)
            .findOne({ Name: { $regex: '.*'+banner.Name +'.*', $options: 'i' } })
           
            if (existbanner == null) {
                db.get().collection(collection.banner).insertOne(banner).then((data) => {
                })

            }else{
                resolve(existbanner)
            }
        })



    },
    findBanner: () => {
        return new Promise(async (resolve, reject) => {
            let banner = await db.get().collection(collection.banner).find().sort({ _id: -1 }).toArray()


            resolve(banner)
        })

    },
    deleteBanner: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.banner).deleteOne({ _id: ObjectID(id) }).then((data) => {
                console.log(data);
            })
        })
    }


}