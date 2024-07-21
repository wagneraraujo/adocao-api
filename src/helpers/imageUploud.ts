import multer from "multer";
import path from "path";

//destination the store
const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    let folder = "";

    if (req.baseUrl.includes("users")) {
      folder = "users";
    } else if (req.baseUrl.includes("pets")) {
      folder = "pets";
    }
    cb(null, `src/public/images/${folder}`);
  },
  filename: function (req, file, cb) {
    cb(
      null,
      Date.now() +
        String(Math.floor(Math.random() * 1000)) +
        path.extname(file.originalname),
    );
  },
});

const imageUploud = multer({
  storage: imageStorage,
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(png|jpg|JPG|PNG|jpeg|JPEG)$/)) {
      return cb(new Error("Apenas imagens png ou jpg"));
    }
    cb(null, true);
  },
});

export default imageUploud;
