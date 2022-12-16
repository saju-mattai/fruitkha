var db = require('../config/connection')
var collection = require('../config/collection')
const { ObjectId } = require('mongodb')

module.exports={
    getProductDetails:()=>{
    return new Promise((resolve, reject) => {
     let  product= db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
     resolve(product)
    })
},
singleProductView:(proId)=>{
    return new Promise((resolve, reject) => {
        db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:ObjectId(proId)}).then((response)=>{
            resolve(response)
        })
    })

}
}