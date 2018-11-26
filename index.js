const fetch = require("node-fetch");
const url = "http://open.douyucdn.cn/api/RoomApi/room/309923";
const schedule = require("node-schedule");
const fs = require("fs");
let flag = true;

const j = schedule.scheduleJob("*/2 10-23 * * *", fireDate => {
  let date = new Date();
  let log = `This job was supposed to run at ${fireDate}, but actually ran at ${date}`;
  let file = `./log/${date.getFullYear()}-${date.getMonth()}-${date.getDate()}.log`;
  write(file, log);

  fetch(url)
    .then(res => res.json())
    .then(data => {
      console.log({ data });
      if (data.error === 0) {
        let obj = data.data;
        if (obj.room_status === "1") {
          flag = false;
          console.log("已开播");
        } else if (obj.room_status === "2") {
          flag = true;
          console.log("未开播");
        }
      } else {
        write(file, data);
      }
    })
    .catch(e => write(file, e.getMessage()));
});

if (!flag) {
  j.cancel();
}

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
