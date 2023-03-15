const Web3 = require('web3');
const tokenABI = require('./tokenABI.json'); // Replace with the ABI for your token contract
const priceFeedABI = require('./priceFeedABI.json'); // Replace with the ABI for the Chainlink Price Feed Contract
const uniswapRouterABI = require('./UniswapRouterABI.json'); // load the ABI from a local file
const uniswapFactoryABI = require('./uniswapFactoryABI.json');
const uniswapV2PairABI = require('./uniswapV2PairABI.json');

// Initialize web3 provider
const web3 = new Web3('https://mainnet.infura.io/v3/b6bf7d3508c941499b10025c0776eaf8'); // Replace with your Infura project ID

// Set the contract address and token symbol
const tokenAddress = '0x1E8Cc81Cdf99C060c3CA646394402b5249B3D3a0'; // Replace with the contract address of your token
const tokenSymbol = 'VB'; // Replace with the symbol of your token

// Set the contract address for the ETH/USD Price Feed Contract
const priceFeedContractAddress = '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419';

// Set the Uniswap router contract address
const uniswapRouterAddress = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'; 

// Set the Uniswap router contract address
const uniswapFactoryAddress = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f'; 

// Create a new instance of the Uniswap router contract
const uniswapRouterContract = new web3.eth.Contract(uniswapRouterABI, uniswapRouterAddress);

// Create a new instance of the Uniswap router contract
const uniswapFactoryContract = new web3.eth.Contract(uniswapFactoryABI, uniswapFactoryAddress);

// Create a new instance of the token contract
const tokenContract = new web3.eth.Contract(tokenABI, tokenAddress);

// Create a new instance of the Chainlink Price Feed Contract
const priceFeedContract = new web3.eth.Contract(priceFeedABI, priceFeedContractAddress);

const getTokenPrice = async () => {

  console.log(`Token Address ${tokenAddress}`);

  const wethAddress = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'; // WETH addres
  const wethSymbol = 'WETH';
  const pairAddress = await uniswapFactoryContract.methods.getPair(wethAddress, tokenAddress).call();
  
  console.log(`LP Address ${pairAddress}`);
  const pairContract = new web3.eth.Contract(uniswapV2PairABI, pairAddress);
  const token0 = await pairContract.methods.token0().call();
  const token1 = await pairContract.methods.token1().call();
  const reserves = await pairContract.methods.getReserves().call();
  
  let price,weth,token;

  if (token0 === wethAddress ){

    weth = reserves[0]; // WETH reserve
    token = reserves[1]; // token reserve
    price = weth / token;
    console.log(`${wethSymbol} : ${weth}`);
    console.log(`${tokenSymbol} : ${token}`);
    console.log(`${wethSymbol}/${tokenSymbol} ${price}`);

  } else {

    weth = reserves[1]; // WETH reserve
    token = reserves[0]; // token reserve
    price = weth / token;
    console.log(`${wethSymbol} : ${weth}`);
    console.log(`${tokenSymbol} : ${token}`);
    console.log(`${tokenSymbol}/${wethSymbol} ${price}`);

  }

  const ethPrice = await getEthPrice();

  return price * (ethPrice / 10000000000);

}

// Retrieve the current ETH price in USD from the Chainlink Price Feed Contract
const getEthPrice = async () => {
  const priceFeedData = await priceFeedContract.methods.latestRoundData().call();
  const ethPrice = web3.utils.fromWei(priceFeedData.answer, 'ether');
  return parseFloat(ethPrice * 10000000000).toFixed(2);
}


// Create an empty set to store the token holders
const tokenHolders = new Set();

// Fetch all Transfer events for the token contract
tokenContract.getPastEvents('Transfer', {
  fromBlock: 0,
  toBlock: 'latest'
}, (err, events) => {
  if (err) {
    console.error(err);
    return;
  }

  // Loop through each Transfer event and add the sender and recipient to the token holders set
  for (let i = 0; i < events.length; i++) {
    const sender = events[i].returnValues.from;
    const recipient = events[i].returnValues.to;

    if (sender !== '0x0000000000000000000000000000000000000000') {
      tokenHolders.add(sender.toLowerCase());
    }

    if (recipient !== '0x0000000000000000000000000000000000000000') {
      tokenHolders.add(recipient.toLowerCase());
    }
  }

  // Loop through the token holders set and print their address and balance

  let holderCount = 0;

  tokenHolders.forEach(async (address) => {
    const balance = await tokenContract.methods.balanceOf(address).call();

    if (balance > 0) {

      holderCount++;
      // Print the token holder's address and balance
      //console.log(`Holder: ${holderCount} Address: ${address}, Balance: ${balance} ${tokenSymbol}`);

    }

  });

});

// Call the getEthPrice function and print the result to the console
getEthPrice().then((ethPrice) => {
  console.log(`ETH price in USD: $${ethPrice}`);
}).catch((err) => {
  console.error(err);
});

getTokenPrice().then((ethPrice) => {
  console.log(`Token price in USD: $${ethPrice + 0.018248 }`);
}).catch((err) => {
  console.error(err);
})