const gis = require("g-i-s");
const download = require("image-downloader");
const axios = require("axios");
const { deflateRaw } = require("zlib");
const exec = require("child_process").exec;

let sref = null;

function getRandomInt(max) {
  var randNum = Math.floor(Math.random() * Math.floor(max));
  return randNum;
}

function getRandomOdd(max) {
  var randNum = Math.floor(Math.random() * Math.floor(max));
  if (randNum % 2 == 0) {
    //generated number is even
    if (randNum == max) {
      randNum = randNum - 1;
    } else {
      randNum = randNum + 1;
    }
  }
  return randNum;
}

function getRandomEven(max) {
  var randNum = Math.floor(Math.random() * Math.floor(max));
  if (randNum % 2 == 1) {
    //generated number is even
    if (randNum == max) {
      randNum = randNum - 1;
    } else {
      randNum = randNum + 1;
    }
  }
  return randNum;
}

async function draw() {
  if (sref == null) {
    let sref_img2bmp = null;
    var img2bmp =
      "convert images/output.jpg -negate  -threshold 70% output.bmp";
    sref_img2bmp = exec(img2bmp);
    sref_img2bmp.on("close", (code) => {
      console.log("Finished Img to bmp");
      let sref_svg = null;
      let bmp2svg =
        "potrace --svg output.bmp -t 10 -a 3 -u 10 -P A4 --group -o vect-grib.svg";
      sref_svg = exec(bmp2svg);
      sref_svg.on("close", (code) => {
        console.log("Finished bmp to svg");
        let sref_svgo = null;
        let svgo = "svgo vect-grib.svg";
        sref_svgo = exec(svgo);
        sref_svgo.on("close", (code) => {
          console.log("Finished Svgo");
          let sref_draw = null;
          let draw = "axibot plot vect-grib.svg";
          sref_draw = exec(draw);
          sref_draw.on("close", (code) => {
            console.log("Finished drawing");
            let sref_disable_motors = null;
            let disable_motors = "axibot manual disable_motors";
            sref_disable_motors = exec(disable_motors);
            sref_disable_motors.on("close", (code) => {
              console.log("Finished disable_motor");
              let sref_penup = null;
              let penup = "axibot manual pen_up 1000";
              sref_penup = exec(penup);
              sref_penup.on("close", (code) => {
                console.log("Finished penup");
                let sref_back = null;
                let back = "axibot manual xy_move 0 0 100";
                sref_back = exec(back);
                sref_back.on("close", (code) => {
                  console.log("Finished back");
                  let sref_again = null;
                  let again = "node app.js";
                  sref_again = exec(again);
                  sref_again.on("close", (code) => {
                    console.log("again");
                    sref = null;
                    sref_img2bmp = null;
                    sref_svg = null;
                    sref_svgo = null;
                    sref_disable_motors = null;
                    sref_penup = null;
                    sref_back = null;
                    sref_again = null;
                  });
                });
              });
            });
          });
        });
      });
    });
  }
}

axios
  .get("http://127.0.0.1:8080/message")
  .then((response) => {
    var l = Object.entries(response.data).length;
    //console.log(Object.entries(response.data)[getRandomInt(l)][1].author);
    var name = Object.entries(response.data)[getRandomInt(l)][1].author;
    console.log(name);
    var opts = {
      searchTerm: name,
      queryStringAddition: "&filetype:jpg",
    };
    gis(opts, logResults);
  })
  .catch((error) => {
    console.log(error);
  });

async function logResults(error, results) {
  if (error) {
    console.log(error);
  } else {
    let imgUrl = results[getRandomInt(10)].url;
    console.log(imgUrl);
    //console.log(JSON.stringify(results, null, "  "));
    let options = {
      url: imgUrl,
      dest: "images/output.jpg",
    };
    await download
      .image(options)
      .then(({ filename }) => {
        console.log("Saved to", filename); // saved to /images/output.jpg
      })
      .catch((err) => console.error(err));
    await draw();
  }
}
