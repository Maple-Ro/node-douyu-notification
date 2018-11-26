const fetch = require("node-fetch");
const url = "http://open.douyucdn.cn/api/RoomApi/room/309923";
const schedule = require("node-schedule");
const fs = require("fs");
const redis = require("redis"),
  client = redis.createClient();

// if you'd like to select database 3, instead of 0 (default), call
// client.select(3, function() { /* ... */ });

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
            //提醒一次
            console.log("已开播");
            console.log("发送邮件"); //回调设置 flag=false
            client.set("live_flag", false);
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
