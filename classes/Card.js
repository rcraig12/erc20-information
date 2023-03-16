const { createCanvas } = require("canvas");
const fs = require("fs");

module.exports.Card = async ( name ) => {

  const wrapText = function(ctx, text, x, y, maxWidth, lineHeight) {
    // First, start by splitting all of our text into words, but splitting it into an array split by spaces
    let words = text.split(' ');
    let line = ''; // This will store the text of the current line
    let testLine = ''; // This will store the text when we add a word, to test if it's too long
    let lineArray = []; // This is an array of lines, which the function will return

    // Lets iterate over each word
    for(var n = 0; n < words.length; n++) {
        // Create a test line, and measure it..
        testLine += `${words[n]} `;
        let metrics = ctx.measureText(testLine);
        let testWidth = metrics.width;
        // If the width of this test line is more than the max width
        if (testWidth > maxWidth && n > 0) {
            // Then the line is finished, push the current line into "lineArray"
            lineArray.push([line, x, y]);
            // Increase the line height, so a new line is started
            y += lineHeight;
            // Update line and test line to use this word as the first word on the next line
            line = `${words[n]} `;
            testLine = `${words[n]} `;
        }
        else {
            // If the test line is still less than the max width, then add the word to the current line
            line += `${words[n]} `;
        }
        // If we never reach the full max width, then there is only one line.. so push it into the lineArray so we return something
        if(n === words.length - 1) {
            lineArray.push([line, x, y]);
        }
    }
    // Return the line array
    return lineArray;
  }

  const backgroundColor = '#1d1d1d';
  const fontColorA = '#82d2e9';
  const fontColorB = '#5ca4ee';

  const cardPost = {
    title: "#VITALIKBOY LOYALTY REWARDS",
    contractTitle: "ETHEREUM CONTRACT",
    contractAddress: "0x1E8Cc81Cdf99C060c3CA646394402b5249B3D3a0",
    instructions: "AT EACH NEW HIGHER FLOOR, A REVIEW OF WALLETS WILL BE DONE THAT WILL SHOW WHAT WALLETS HAVE HELD SINCE THE PREVIOUS FLOOR.",
    floor1: "100K LIVE RAFFLE (TWO WINNERS DRAWN)",
    floor2: "200K LIVE RAFFLE (TWO WINNERS DRAWN)",
    floor3: "500K LIVE RAFFLE (TWO WINNERS DRAWN)",
    floor4: "750K LIVE RAFFLE (TWO WINNERS DRAWN)",
    floor5: "1M LIVE RAFFLE (TWO WINNERS DRAWN)",
    footer: "WE AS A COMMUNITY VALUE OUR LOYAL HOLDERS AND LOOK FORWARD TO SHARING SOME OF THE WEALTH WITH OUR COMMITED COMMUNITY.",
    social1: "@VITALIK_BOY",
    social2: "T.ME/VITALIKBOY",
    social3: "VITALIKBOY.COM"
  }
  

  // let image = new Jimp(960, 1280, '#161616', (err, image) => {
  //   if (err) throw err
  // })

  // let textImage = new Jimp(960, 1280, '#ffffff00', (err, image) => {
  //   if (err) throw err
  // })

  // let text = await jimpFONT.CreateFont("Anybody", 80, 30, "../fonts/Anybody/Anybody-VariableFont_wdth,wght.ttf", 20, "#FFFFFF"); //Text, width, height, path, size, HexaColor
  
  // let message = 'Hello!'
  // let x = 10
  // let y = 10
  
  // Jimp.loadFont(path.join(__dirname, `../fonts/Anybody/Anybody-VariableFont_wdth,wght.ttf`))
  //   .then(font => {
  //     textImage.print(font, x, y, message)
  //     textImage.color([{ apply: 'xor', params: [fontColorA] }]);
  //     image.blit(textImage, 0, 0);
  //     image.composite(text,0,0);
  //     return image
  //   }).then(image => {
  //     let file = `./images/${name}.${image.getExtension()}`
  //     return image.write(file) // save

  //   })
  
  // Dimensions for the image
  const width = 980;
  const height = 1280;

  // Instantiate the canvas object
  const canvas = createCanvas(width, height);
  const context = canvas.getContext("2d");

  // Fill the rectangle with purple
  context.fillStyle = backgroundColor;
  context.fillRect(0, 0, width, height);

  context.font = "bold 36pt 'PT Sans'";
  context.textAlign = "center";
  context.fillStyle = fontColorA;
  // 600 is the x value (the center of the image)
  // 170 is the y (the top of the line of text)
  context.fillText(cardPost.title, 490, 70);

  context.font = "24pt 'PT Sans'";
  context.fillStyle = fontColorB;
  context.fillText(cardPost.contractTitle, 490, 130);
  context.fillText(cardPost.contractAddress, 490, 180);
  
  context.fillStyle = fontColorA;

  const wrappedText = wrapText( context, cardPost.instructions, 490, 300, 900, 48);
  wrappedText.forEach(function(item) {
    context.fillText(item[0], item[1], item[2]); 
  });

  context.fillText(cardPost.floor1, 490, 500);
  context.fillText(cardPost.floor2, 490, 580);
  context.fillText(cardPost.floor3, 490, 660);
  context.fillText(cardPost.floor4, 490, 740);
  context.fillText(cardPost.floor5, 490, 820);


  // Write the image to file
  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync(`./images/${name}.png`, buffer);

} 
