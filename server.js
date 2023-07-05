const PORT = process.env.PORT ?? 8000;
//chọn cổng để truy cập nếu k tồn tại thì truy cập cổng 8000
const express = require("express");
/// như import packe bth
const pool = require("./db.js");
const bodyParser = require("body-parser");
const fs = require("fs");
const axios = require("axios");
const passport = require("passport");
const GitHubStrategy = require("passport-github").Strategy;

// Sử dụng body-parser

const app = express();
const cors = require("cors");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// sau đó sẽ lưu xuống app để chúng ta có thể sử dụng nó <+> có thể sd những phương thức và thuộc tính
app.use(
  cors({
    credentials: true,
  })
);
const GITHUB_CLIENT_ID = "07b1df458f6122b9fc3f";
const GITHUB_CLIENT_SECRET = "389d02bb79374302cc77c5e2adeab40df38d90e9";
const CALLBACK_URL = "https://example.com/callback";

passport.use(
  new GitHubStrategy(
    {
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      callbackURL: CALLBACK_URL,
    },
    function (accessToken, refreshToken, profile, done) {
      // Xử lý thông tin người dùng từ GitHub
      // Lưu trữ thông tin người dùng vào session hoặc thực hiện xử lý khác
      return done(null, profile);
    }
  )
);
passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

app.use(passport.initialize());
app.use(passport.session());
app.get("/auth/github", passport.authenticate("github"));
app.post(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  async function (req, res) {
    const { hostTest, user, pass, DB } = req.user;
    const envContent = `DBHOST=${hostTest}\nDBUSER=${user}\nDBPASSWORD=${pass}\nDATABASE=${DB}`;

    try {
      const response = await axios.get(
        "https://api.github.com/repos/hieuvm68/nodejs-postgresql/contents/.env"
      );
      const fileInfo = response.data;
      const currentSha = fileInfo.sha;

      const putResponse = await axios.put(
        "https://api.github.com/repos/hieuvm68/nodejs-postgresql/contents/.env",
        {
          message: "Update .env file",
          content: Buffer.from(envContent).toString("base64"),
          sha: currentSha,
        },
        {
          headers: {
            Authorization: `Bearer ${req.user.accessToken}`, // Sử dụng access token từ GitHub
            "Content-Type": "application/json",
          },
        }
      );

      console.log("File .env updated successfully:", putResponse.data);
      res.send("Đã cập nhật tệp .env thành công");
    } catch (error) {
      console.error("Error updating .env file:", error.response.data);
      res.status(500).send(error.response.data);
    }
  }
);

app.get("/", (req, res) => {
  res.send("Hello server");
}); //root
//sau đây sẽ viết code để có đc tất cả những việc cần làm
//----
//async để không chạy đồng bộ
//khóa await đợi chạy xong ms chạy cái kia
// console.log("POOL", pool);

app.get("/todos", async (req, res) => {
  try {
    const todos = await pool.query(`SELECT * FROM loaidvdangkykham`);
    //sau khi phan hồi nó sẽ lưu vô todoss,
    // console.log("xxxxxxxxxxxxxx", res.json(todos.rows));
    res.json(todos.rows);
  } catch (err) {
    console.error(err);
  }
});
// app.post("/editenv", async (req, res) => {
//   const { hostTest, user, pass, DB } = req.body;
//   // Tạo nội dung cho tệp .env
//   const envContent = `DBHOST=${hostTest}\nDBUSER=${user}\nDBPASSWORD=${pass}\nDATABASE=${DB}`;
//   console.log(envContent);
//   fs.writeFileSync(".env", envContent);
//   //ghi đè file
//   try {
//     const response = await axios.get(
//       "https://api.github.com/repos/hieuvm68/nodejs-postgresql/contents/.env"
//     );
//     const fileInfo = response.data;
//     const currentSha = fileInfo.sha;
//     // console.log(currentSha);

//     const putResponse = await axios.put(
//       "https://api.github.com/repos/hieuvm68/nodejs-postgresql/contents/.env",
//       {
//         message: "Update .env file",
//         content: Buffer.from(envContent).toString("base64"),
//         sha: currentSha,
//       },
//       {
//         headers: {
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     console.log("File .env updated successfully:", putResponse.data);
//     res.send("Đã cập nhật tệp .env thành công");
//   } catch (error) {
//     console.error("Error updating .env file:", error.response.data);
//     res.status(500).send(error.response.data);
//   }
// });

app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
});
// có thể sử dụng để lắng nghe 1 trong những j họ nghe với express sau đó đặt 1 fc -> chỉ để log ra ns server đang chạy port ....
