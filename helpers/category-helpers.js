var db = require('../config/connection')
const collection = require('../config/collection')
var objectId = require('mongodb').ObjectId
const { ObjectID } = require('bson')
let response
module.exports = {
    AddCategory: (category) => {
        
        return new Promise(async (resolve, reject) => {
            let categoryExists = await db.get().collection(collection.CATEGORY_COLLECTION)
                .findOne({Category : {$regex: '.*'+category.Category+'.*', $options: 'i' }})
               
            if (!categoryExists) {
                db.get().collection(collection.CATEGORY_COLLECTION).insertOne(category).then((data) => {
                    resolve(data)
                })
            }

        })
    },
    getCategory: () => {
        return new Promise((resolve, reject) => {
            let category = db.get().collection(collection.CATEGORY_COLLECTION).find().sort({ _id: -1 }).toArray()
            resolve(category)
        })

    },
    deleteCategory: (proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).deleteOne({ _id: ObjectID(proId) }).then((response) => {
                resolve(response)
            })
        })
    },
    getCategoryDetails: (proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).findOne({ _id: objectId(proId) }).then((product) => {
                resolve(product)
            })
        })
    },
    updateCategory: (proId, CatogaryDetails) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).updateOne({ _id: objectId(proId) },
                {
                    $set: {
                        Category: CatogaryDetails.Category
                    }

                }).then((response) => {
                    resolve()
                })
        })
    },
    // existCategory: (data) => {
    //     return new Promise(async(resolve, reject) => {
    //         response=true
    //         let exist = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({ Category: data.Category })
    //         console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
    //         console.log(exist);
    //         if (exist) {
    //             response = true
    //             resolve(response)
    //         } else {
    //             response=false
    //             resolve(response)
    //         }

    //     })
    // }

}