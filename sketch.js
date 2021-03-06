let sketch = (p5) => {
  let state = {
    circSize: 20,
    layerTrans: 100,
    sampleGap: 16,
    squiggleDamp: 0.5,
    showSquiggles: true,
    showCircles: true,
    continuous: true,
    mouseAng: 0,
    resample: function () {
      console.log("resample");
      buildPixelsArray();
    },
    loadFile: function () {
      document.querySelector('input[type="file"]').click();
    },
    clearImg: function () {
      p5.clear();
    },
    generate: function () {
      doImage();
    }
  };
  let gui = new dat.GUI();
  gui.add(state, "loadFile").name("Load Image");
  gui.add(state, "clearImg").name("Clear");
  gui.add(state, "showCircles").name("show circles");
  gui.add(state, "circSize").min(0).max(100).step(1);
  gui.add(state, "showSquiggles").name("show squiggles");
  gui
    .add(state, "squiggleDamp")
    .min(0)
    .max(1)
    .step(0.1)
    .name("squiggle factor");
  gui.add(state, "layerTrans").min(0).max(255).step(1).name("transparency");
  gui.add(state, "generate").name("Generate Layer");
  gui.add(state, "continuous").name("Continuous");
  let resampleFolder = gui.addFolder("Resample");
  resampleFolder.add(state, "sampleGap").min(1).max(128).step(1);
  resampleFolder.add(state, "resample");

  gui.useLocalStorage = true;
  gui.remember(state);

  let img;
  let imgArr = [];

  function loadFromURL(url) {}

  p5.setup = () => {
    p5.angleMode(p5.DEGREES);
    p5.createFileInput(handleFile).style("visibility", "hidden");
    p5.background(34);
    // let myURL = "https://source.unsplash.com/random /600x900";
    let myURL =
      "https://images.unsplash.com/photo-1600683845590-df2e8bc74689?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mzl8fGNvbG9yZnVsJTIwYW5pbWFsc3xlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60";
    img = p5.loadImage(myURL, (img) => {
      p5.print("img loaded");
      buildPixelsArray();
    });
  };

  p5.doubleClicked = () => {
    state.continuous = !state.continuous;
  };

  p5.draw = () => {
    if (state.continuous) {
      doImage();
    }
    // if (p5.keyIsDown(65)) {
    //   state.circSize-=1
    // }
    // if (p5.keyIsDown(68)) {
    //   state.circSize+=1
    // }
    // if (p5.frameCount % 60 === 0) {
    //   gui.updateDisplay()
    // }
  };

  p5.keyTyped = () => {
    console.log("keyCode: ", p5.keyCode);
    // console.log("key: ",p5.key);
    if (p5.keyCode === 32) {
      state.continuous = !state.continuous;
    }
    if (p5.keyCode === 67) {
      p5.clear();
    }
    if (p5.keyCode === 65) {
      state.circSize -= 1;
    }
    if (p5.keyCode === 68) {
      state.circSize += 1;
    }
    if (p5.keyCode === 81) {
      state.layerTrans -= 1;
    }
    if (p5.keyCode === 69) {
      state.layerTrans += 1;
    }
    if (p5.keyCode === 71) {
      doImage();
    }

    gui.updateDisplay();
  };

  const handleFile = (file) => {
    img = p5.createImg(file.data, "loaded file", (img) => {
      img.hide();
      buildPixelsArray();
    });
  };

  const buildPixelsArray = () => {
    imgArr = [];
    p5.print("sampleGap:", state.sampleGap);
    let myGap = state.sampleGap;
    p5.print("myGap:", myGap);
    cnv = p5.createCanvas(img.width, img.height);
    let newCanvasX = (p5.windowWidth - img.width) / 2;
    let newCanvasY = (p5.windowHeight - img.height) / 2;
    cnv.position(newCanvasX, newCanvasY);
    cnv.style("border", "4px solid black");
    p5.image(img, 0, 0, img.width, img.height);

    p5.loadPixels();

    for (let col = 0; col < img.width; col += myGap) {
      for (let row = 0; row < img.height; row += myGap) {
        let posX = col;
        let posY = row;
        myLoc = (col + row * img.width) * 4;
        c1 = [
          p5.pixels[myLoc],
          p5.pixels[myLoc + 1],
          p5.pixels[myLoc + 2],
          p5.pixels[myLoc + 3]
        ];
        imgArr.push({ color: c1, x: col, y: row });
      }
    }
  };

  const doImage = () => {
    // console.log("doImage");
    let extraX =
      p5.dist(p5.mouseX, p5.mouseY, img.width / 2, img.height / 2) *
      state.squiggleDamp;

    p5.noFill();

    for (let i = 0; i < imgArr.length; i++) {
      let c = imgArr[i].color;
      let posx = imgArr[i].x;
      let posy = imgArr[i].y;
      p5.push();
      let cc = p5.color(c);
      cc.setAlpha(state.layerTrans);
      p5.stroke(cc);
      if (state.showCircles) {
        p5.strokeWeight(p5.random(state.circSize));
        p5.point(posx, posy);
      }

      p5.translate(posx, posy);
      if (state.showSquiggles) {
        p5.strokeWeight(p5.random(p5.max(img.width, img.height) / 200));
        p5.rotate(state.mouseAng);
        p5.curve(
          posx,
          posy,
          p5.sin(posx) * p5.random(extraX),
          p5.cos(posy) * p5.random(extraX),
          0,
          0,
          p5.cos(posy) * p5.random(extraX),
          p5.sin(posx) * p5.random(extraX)
        );
      }
      p5.pop();
      state.mouseAng = p5.atan2(
        p5.mouseY - img.height / 2,
        p5.mouseX - img.width / 2
      );
    }
  };
};
new p5(sketch, "main");
