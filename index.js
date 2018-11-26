const fetch = require("node-fetch");
const url = "http://open.douyucdn.cn/api/RoomApi/room/309923";
const schedule = require("node-schedule");
const fs = require("fs");
let flag = true;
const sendmail = require("sendmail")();

try {
  const j = schedule.scheduleJob("10 10:25-22:00 * * *", fireDate => {
    let date = new Date();
    let log = `This job was supposed to run at ${fireDate}, but actually ran at ${date}`;
    let file = `./log/${date.getFullYear}-${date.getMonth}-${date.getDate}.log`;
    fs.writeFile(
      file,
      log,
      { encoding: "utf-8", mode: 0660, flag: "a" },
      err => {
        if (err) console.error(err);
      }
    );

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.error === 0) {
          let obj = data.data;
          if (obj.room_status === "1") {
            flag = false;
            sendmail(
              {
                from: "node rebot",
                to: "liutsingluo@163.com ",
                subject: `开播提醒：${obj.room_name}`,
                html: `一键直达：<a href="https://www.douyu.com/309923" target="_blank">${
                  obj.owner_name
                }</a>`
              },
              (err, reply) => {
                console.log(err && err.stack);
                console.dir(reply);
              }
            );
          } else if (obj.room_status === "2") {
            flag = true;
          }
        } else {
          fs.writeFile(
            data,
            e.getMessage() || e.toString(),
            {
              encoding: "utf8",
              flag: "a"
            },
            err => {
              if (err) console.error(err);
            }
          );
        }
      })
      .catch(e =>
        fs.writeFile(
          file,
          e.getMessage() || e.toString(),
          {
            encoding: "utf8",
            flag: "a"
          },
          err => {
            if (err) console.error(err);
          }
        )
      );
  });

  if (!flag) {
    schedule.cancelJob(j);
  }
} catch (error) {
  console.error(error);
}
