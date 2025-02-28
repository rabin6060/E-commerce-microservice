
export type Product = {
    _id:string,
    userId:string,
    title:string,
    desc:string,
    categories:[string],
    imageUrls:[string],
    isAvaiable:boolean,
    price:number,
    totalStock:number,
    createdAt:Date,
    updatedAt:Date
}

