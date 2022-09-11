//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const _=require("lodash");
const app = express();

const mongoose=require("mongoose");

mongoose.connect('mongodb+srv://prabhat-admin:MPrabhat%401234@cluster0.zi8uqcw.mongodb.net/todolistDB',{useNewUrlParser:true},{useUnifiedTopology: true});

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const itemsSchema= new mongoose.Schema({
   name: String
});

const Item=mongoose.model("Item",itemsSchema);
// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

const item1= new Item({
  name: "Welcome to your todolist!"
});
const item2= new Item({
  name: "Hit the +button to add a new item."
});
const item3= new Item({
   name: "<-- Hit this to delete an item."
});

const defaultItems=[item1,item2,item3];

const listSchema={
   name: String,
   items: [itemsSchema]
};

const List=mongoose.model("List",listSchema);

app.get("/", function(req, res) {

  Item.find({},function(err,foundItems){

        if(foundItems.length===0){
          Item.insertMany(defaultItems,function(err){
              if(err){
                console.log(err);
              }
              else{
                console.log("Successfully saved default items to database ");
              }
          });
          res.redirect("/");
        }
         else{
           // console.log(foundItems);
           res.render("list", {listTitle: "Today", newListItems: foundItems});
         }

  });



});



app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName= req.body.list;
  const item= new Item({
    name: itemName
  });

  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
  if(listName==="Today"){
    item.save();
    res.redirect("/");
  }
  else{
     List.findOne({name:listName},function(err,foundList){
         foundList.items.push(item);
         foundList.save();
         res.redirect("/"+listName);
     });
  }

});


app.post("/delete",function(req,res){
   //console.log(req.body);
   //console.log(req.body.checkbox);
   const checkedItemId=req.body.checkbox;
   const listName=req.body.listName;
   if(listName==="Today"){
     Item.findByIdAndRemove(checkedItemId,function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("Successfully deleted checked item");
        }

     });
       res.redirect("/");
   }
   else{
       List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemId}}},function(err,foundList){
          if(!err){
            res.redirect("/"+listName);
          }
          else{
            console.log(err);
          }
       });
   }

});


// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

// **below has been done by express routing parameter
app.get("/:customListName",function(req,res){
       const customListName=_.capitalize(req.params.customListName);
       //console.log(req.params.customListName);

       List.findOne({name:customListName },function(err,foundList){
               if(!err){
                  if(!foundList){
                     //create a new listT
                     const list=new List({
                        name: customListName,
                        items: defaultItems
                     });
                     list.save();
                     res.redirect("/"+customListName);
                  }
                  else{
                    //Show an existing list
                     res.render("list",{listTitle: foundList.name, newListItems: foundList.items});
                  }
                }

       });

});


app.get("/about", function(req, res){
  res.render("about");
});
let port = process.env.PORT;
if (port == null || port == "") {
 port = 3000;
}
// app.listen(port);
app.listen(port, function() {
  console.log("Server started successfully");
});
