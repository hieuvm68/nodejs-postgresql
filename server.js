const PORT = process.env.PORT ?? 8000;
//chọn cổng để truy cập nếu k tồn tại thì truy cập cổng 8000
const express = require("express");
/// như import packe bth
const pool = require("./db.js");
const bodyParser = require("body-parser");
const fs = require("fs");
const axios = require("axios");

// Sử dụng body-parser

const app = express();
const cors = require("cors");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// sau đó sẽ lưu xuống app để chúng ta có thể sử dụng nó <+> có thể sd những phương thức và thuộc tính
app.use(
  cors({
    // origin: "https://nodejs-postgresql-vzu7.onrender.com/",
    credentials: true,
  })
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
app.post("/editenv", async (req, res) => {
  const { hostTest, user, pass, DB } = req.body;

  // Tạo nội dung cho tệp .env
  const envContent = `DBHOST=${hostTest}\nDBUSER=${user}\nDBPASSWORD=${pass}\nDATABASE=${DB}`;
  console.log(envContent);

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
          Authorization: "Bearer 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",
          "Content-Type": "application/json",
        },
      }
    );

    console.log("File .env updated successfully:", putResponse.data);
    res.send("Đã cập nhật tệp .env thành công");
  } catch (error) {
    console.error("Error updating .env file:", error.response.data);
    res.status(500).send("Lỗi khi cập nhật tệp .env");
  }
});
// app.post("/editenv", async (req, res) => {
//   const { hostTest, user, pass, DB } = req.body;

//   // Tạo nội dung cho tệp .env
//   const envContent = `DBHOST=${hostTest}\nDBUSER=${user}\nDBPASSWORD=${pass}\nDATABASE=${DB}`;
//   console.log(envContent);
//   // Ghi nội dung vào tệp .env
//   fs.writeFileSync(".env", envContent);

//   try {
//     // Lấy "sha" hiện tại của tệp .env từ GitHub API
//     const response = await fetch(
//       "https://api.github.com/repos/hieuvm68/nodejs-postgresql/contents/.env"
//     );
//     console.log("helf");
//     const fileInfo = await response.json();
//     const currentSha = fileInfo.sha;

//     // Gửi yêu cầu PUT đến GitHub API để cập nhật file .env
//     const putResponse = await fetch(
//       "https://api.github.com/repos/hieuvm68/nodejs-postgresql/contents/.env",
//       {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: "Bearer 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",
//         },
//         body: JSON.stringify({
//           message: "Update .env file",
//           content: Buffer.from(envContent).toString("base64"),
//           sha: currentSha,
//         }),
//       }
//     );

//     const data = await putResponse.json();
//     console.log("File .env updated successfully:", data);
//     res.send("Đã cập nhật tệp .env thành công");
//   } catch (error) {
//     console.error("Error updating .env file:", error);
//     res.status(500).send("Lỗi khi cập nhật tệp .env");
//   }
// });

app.post("/numbers", async (req, res) => {
  try {
    const { jsonData } = req.body;

    const existingNumber = await pool.query(
      `SELECT * FROM sothutudoikham WHERE id_loaidangkidv = $1`,
      [jsonData]
    );

    let newNumber = 0;
    if (existingNumber.rows.length > 0) {
      const currentNumber = existingNumber.rows[0].sothutu;
      newNumber = currentNumber + 1;
    } else {
      newNumber = 1;
    }

    const insertQueryText =
      "INSERT INTO sothutudoikham (id_loaidangkidv, sothutu) VALUES ($1, $2)";
    await pool.query(insertQueryText, [jsonData, newNumber]);

    res.status(200).json({ success: true, number: newNumber });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Something went wrong" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
});
// có thể sử dụng để lắng nghe 1 trong những j họ nghe với express sau đó đặt 1 fc -> chỉ để log ra ns server đang chạy port ....
