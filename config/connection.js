var mongoClient=require('mongodb').MongoClient
const state={
    db:null
}

module.exports.connect=function(done){
    const url='mongodb+srv://saju:9061928072@fruitkha.xe7r9y7.mongodb.net/?retryWrites=true&w=majority'
    const dbname='ecommerce'

    mongoClient.connect(url,(err,data)=>{
        if(err )  return done(err)
        state.db=data.db(dbname)
        done()
    })
    
}
module.exports.get=function(){
    return state.db
}