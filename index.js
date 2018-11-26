const fetch = require("node-fetch");
const url = "http://open.douyucdn.cn/api/RoomApi/room/309923";
const schedule = require("node-schedule");
const fs = require("fs");
const nodemailer = require("nodemailer");
const redis = require("redis"),
  client = redis.createClient();

client.on("error", err => console.error("Error " + err));
client.set("live_flag", true, redis.print);

const j = schedule.scheduleJob("*/20 10-23 * * *", fireDate => {
  let date = new Date();
  let log = `计划运行时间：${fireDate.toLocaleTimeString()}, 实际运行时间: ${date.toLocaleTimeString()}`;
  let file = `./log/${date.getFullYear()}-${date.getMonth()}-${date.getDate()}.log`;
  write(file, log);

  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (data.error === 0) {
        let obj = data.data;
        if (obj.room_status === "1") {
          if (client.get("live_flag")) {
            nodemailer.createTestAccount((err, account) => {
              let transporter = nodemailer.createTransport({
                host: "smtp.163.com",
                port: 465,
                secure: true,
                auth: {
                  user: "liutsingluo@163.com",
                  pass: "a1019656789"
                }
              });
              let mailOptions = {
                from: "liutsingluo@163.com",
                to: "liutsingluo@163.com",
                subject: `${obj.room_name}`,
                html: `一键直达：<a href="//www.douyu.com/309923" target="_blank">${
                  obj.owner_name
                }</a>`
              };
              transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                  write(file, error);
                  write(file, info);
                }
                client.set("live_flag", false);
              });
            });
          }
        } else if (obj.room_status === "2") {
          client.set("live_flag", true);
        }
      } else {
        write(file, data);
      }
    })
    .catch(e => write(file, e.getMessage()));
});

const write = (file, data) => {
  fs.writeFile(
    file,
    `${data}\r\n`,
    {
      mode: 0660,
      encoding: "utf8",
      flag: "a"
    },
    err => {
      if (err) console.error(err);
    }
  );
};
