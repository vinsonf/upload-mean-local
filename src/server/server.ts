import express from "express";
import cors from "cors";
import crypto from "crypto";
import path from "path";
import { PostModel } from "./schemas/post.schema.js";
import { UserModel } from "./schemas/user.schema.js";
import mongoose from "mongoose";
import multer from "multer";
import { GridFsStorage } from "multer-gridfs-storage";
import { GridFSBucket } from "mongodb";
import fs from "fs";

const __dirname = path.resolve();
const filePath = path.join(__dirname, "uploads");

const app = express();
const PORT = 3501;
let gfs: GridFSBucket;
const mongoURI = "mongodb://localhost:27017/test-fs";
mongoose
  .connect(mongoURI)
  .then(() => {
    console.log("Connected to DB Successfully");
    gfs = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: "uploads",
    });
  })
  .catch((err) => console.log("Failed to Connect to DB", err));

// Storage
var storage = multer.diskStorage({
  // Setting directory on disk to save uploaded files
  destination: function (req, file, cb) {
    cb(null, filePath);
  },
  // Setting name of file saved
  filename: function (req, file, cb) {
    const counter = fs.readdirSync(filePath).length+1 // gives back an array
    // cb(null, counter + "." + fileExtension(file.originalname));
    cb(null, counter + "." + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
});

app.use(cors());
app.use(express.json());

app.get("/", function (req, res) {
  res.json({ message: "test" });
});

app.post("/upload", upload.single("file"), (req, res) => {
  // res.json({file : req.file})
  res.redirect("/");
});

app.get("/files", (req, res) => {
  console.log('get files');
  const files = fs.readdirSync(filePath);
  console.log(fs.readdirSync(filePath));
  // gfs.find().toArray((err, files) => {
  //   // check if files
  //   if (!files || files.length === 0) {
  //     return res.status(404).json({
  //       err: "no files exist"
  //     });
  //   }

  //   return res.json(files);
  // });
  return res.json(files);
});

app.get("/image/:filename", (req, res) => {
  // console.log('id', req.params.id)
  console.log('get image')
  console.log(req.params.filename);
  gfs
    .find({
      filename: req.params.filename
    })
    .toArray((err, files) => {
      console.log(files);
      if (!files || files.length === 0) {
        return res.status(404).json({
          err: "no files exist"
        });
      }
      gfs.openDownloadStreamByName(req.params.filename).pipe(res);
    });
});

app.post("/files/del/:id", (req, res) => {
  gfs.delete(new mongoose.Types.ObjectId(req.params.id), (err, data) => {
    if (err) return res.status(404).json({ err: err.message });
    res.redirect("/");
  });
});

app.get("/posts", function (req, res) {
  PostModel.find()
    .then((data) => res.json({ data }))
    .catch((err) => {
      res.status(501);
      res.json({ errors: err });
    });
});

app.get("/users", function (req, res) {
  UserModel.find()
    .then((data) => res.json({ data }))
    .catch((err) => {
      res.status(501);
      res.json({ errors: err });
    });
});
app.post("/create-user", function (req, res) {
  const { name, email, username } = req.body;
  const user = new UserModel({
    name,
    username,
    email,
  });
  user
    .save()
    .then((data) => {
      res.json({ data });
    })
    .catch((err) => {
      res.status(501);
      res.json({ errors: err });
    });
});

app.post("/create-post", function (req, res) {
  const { title, body } = req.body;
  const post = new PostModel({
    title,
    body,
  });
  post
    .save()
    .then((data) => {
      res.json({ data });
    })
    .catch((err) => {
      res.status(501);
      res.json({ errors: err });
    });
});

app.delete("/delete-user/:id", function (req, res) {
  const _id = req.params.id;
  UserModel.findByIdAndDelete(_id).then((data) => {
    console.log(data);
    res.json({ data });
  });
});

app.put("/update-user/:id", function (req, res) {
  console.log("Update user");
  UserModel.findByIdAndUpdate(
    req.params.id,
    {
      $set: { name: req.body.name, email: req.body.email },
    },
    {
      new: true,
    },
    function (err, updateUser) {
      if (err) {
        res.send("Error updating user");
      } else {
        res.json(updateUser);
      }
    }
  );
});

app.listen(PORT, function () {
  console.log(`starting at localhost http://localhost:${PORT}`);
});
