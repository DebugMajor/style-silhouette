import mongoose from "mongoose";

const outfitAnalysisSchema = new mongoose.Schema({

userId:{
type:mongoose.Schema.Types.ObjectId,
ref:"User",
required:true
},

imageUrl:{
type:String,
required:true
},

top:{
type:String
},

bottom:{
type:String
},

shoes:{
type:String
},

accessories:{
type:String
},

suggestions:{
type:[String]
},

styleScore:{
type:Number
},

createdAt:{
type:Date,
default:Date.now
}

});

export default mongoose.model("OutfitAnalysis", outfitAnalysisSchema);