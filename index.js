const Web3 = require('web3');
const tokenABI = require('./ABI/tokenABI.json'); // Replace with the ABI for your token contract
const priceFeedABI = require('./ABI/priceFeedABI.json'); // Replace with the ABI for the Chainlink Price Feed Contract
const uniswapRouterABI = require('./ABI/UniswapRouterABI.json'); // load the ABI from a local file
const uniswapFactoryABI = require('./ABI/uniswapFactoryABI.json');
const uniswapV2PairABI = require('./ABI/uniswapV2PairABI.json');
const { ERC20Token } = require('./classes/ERC20Token');
const { Card } = require('./classes/Card');

let latestBlock;

let tokenData = {
  firstBlock: "",
  ethUSD: "",
  contract: "",
  symbol: "",
  name: "",
  supply: "",
  pair: {
    address: "",
    token0: {
      name: "",
      address: "",
      supply: ""
    },
    token1: {
      name: "",
      address: "",
      supply: ""
    }
  },
  priceUSD: "",
  totalLiquidity: "",
  holders: [],
  holderTotal: ""
};

// Initialize web3 provider
const web3 = new Web3('https://mainnet.infura.io/v3/b6bf7d3508c941499b10025c0776eaf8'); // Replace with your Infura project ID

// Set the contract address and token symbol
//const tokenAddress = '0x1E8Cc81Cdf99C060c3CA646394402b5249B3D3a0'; // Replace with the contract address of your token
const tokenSymbol = 'VB'; // Replace with the symbol of your token

const wethAddress = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'; // WETH addres
const wethSymbol = 'WETH';

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
//const tokenContract = new web3.eth.Contract(tokenABI, tokenAddress);

// Create a new instance of the Chainlink Price Feed Contract
const priceFeedContract = new web3.eth.Contract(priceFeedABI, priceFeedContractAddress);

//Get latest block on the chain
const getLatestBlock = async () => {

  web3.eth.getBlockNumber()
  .then((blockNumber) => {
    //console.log(`Latest block number on mainnet: ${blockNumber}`);
    latestBlock = blockNumber;
  })
  .catch((error) => {
    console.error(error);
  });

}

// Get the Token Symbol
const getTokenSymbol = async ( ca ) => {

  const tokenContract = new web3.eth.Contract(tokenABI, ca);
  return await tokenContract.methods.symbol().call();

}

// Get the Toekn Name
const getTokenName = async ( ca ) => {

  const tokenContract = new web3.eth.Contract(tokenABI, ca);
  return await tokenContract.methods.name().call();

}

// Get the Token Supply
const getTokenSupply = async ( ca ) => {

  const tokenContract = new web3.eth.Contract(tokenABI, ca);
  return await tokenContract.methods.totalSupply().call();

}

// Get the Token Liquidity Pair
const getTokenPair = async ( ca ) => {

  return await uniswapFactoryContract.methods.getPair(wethAddress, ca).call();

}

// Get the Token Liquidity pair details
const getTokenPairDetail = async ( ca ) => {

  const wethAddress = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'; // WETH addres
  const wethSymbol = 'WETH';

  let price,weth,token;

  const pairAddress = await uniswapFactoryContract.methods.getPair(wethAddress, ca).call();
  const pairContract = new web3.eth.Contract(uniswapV2PairABI, pairAddress);
  const token0 = await pairContract.methods.token0().call();
  const token1 = await pairContract.methods.token1().call();
  const reserves = await pairContract.methods.getReserves().call();
  
  if ( token0 === wethAddress ){

    tokenData.pair.token0.name = wethSymbol;
    tokenData.pair.token0.address = wethAddress;
    tokenData.pair.token0.supply = reserves[0];
    tokenData.pair.token1.name = tokenData.symbol;
    tokenData.pair.token1.address = tokenData.contract;
    tokenData.pair.token1.supply = reserves[1];
    weth = reserves[0]; // WETH reserve
    token = reserves[1]; // token reserve
    //price = weth / token;

  } else {

    tokenData.pair.token0.name = tokenData.symbol;
    tokenData.pair.token0.address = tokenData.contract;
    tokenData.pair.token0.supply = reserves[0];
    tokenData.pair.token1.name = wethSymbol;
    tokenData.pair.token1.address = wethAddress;
    tokenData.pair.token1.supply = reserves[1];
    weth = reserves[1]; // WETH reserve
    token = reserves[0]; // token reserve
    //price = weth / token;

  }

}

const getTokenTotalLiquidity = async ( ca ) => {
  
  let tokenPriceUSD;

  const pairAddress = await uniswapFactoryContract.methods.getPair(wethAddress, ca).call();
  const pairContract = new web3.eth.Contract(uniswapV2PairABI, pairAddress);
  const reserves = await pairContract.methods.getReserves().call();
  const totalLiquidity = ( reserves[0] * tokenData.priceUSD) / (reserves[1] * tokenData.priceUSD );
  return totalLiquidity

}

const getTokenPrice = async ( ca ) => {

  const wethAddress = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'; // WETH addres
  const wethSymbol = 'WETH';
  const pairAddress = await uniswapFactoryContract.methods.getPair(wethAddress, ca).call();

  const pairContract = new web3.eth.Contract(uniswapV2PairABI, pairAddress);
  //const liquidityBalance = await pairContract.methods.balanceOf(pairAddress).call();
  const token0 = await pairContract.methods.token0().call();
  const token1 = await pairContract.methods.token1().call();
  const reserves = await pairContract.methods.getReserves().call();
  
  //console.log(`!!! LP Balance : ${liquidityBalance}`);

  let price,weth,token;

  if (token0 === wethAddress ){

    weth = reserves[0]; // WETH reserve
    token = reserves[1]; // token reserve
    price = weth / token;

  } else {

    weth = reserves[1]; // WETH reserve
    token = reserves[0]; // token reserve
    price = weth / token;

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


const getHolders = async (ca) => {

  console.log(`Please wait looking for blocks with transactions for contract ${ca}`);

  const tokenContract = new web3.eth.Contract(tokenABI, ca);

  let holderInfo = [];

  // Create an empty set to store the token holders
  const tokenHolders = new Set();

  let startBlock = 0;

  for( var block = 0; block < latestBlock; block += 10000){

    if ( block > 10000){

      startBlock = block - 10000;

    }

    if ( (latestBlock - block) < 10000 ) {

      block = latestBlock;

    }

    if ( block > latestBlock ) {

      block = latestBlock;

    }

    await tokenContract.getPastEvents('Transfer', { fromBlock: startBlock, toBlock: block }, (err, events) => {
      
      if (err) {
      
        console.error(err);
        return false;
      
      }

      // Loop through each Transfer event and add the sender and recipient to the token holders set
      for (let i = 0; i < events.length; i++) {

        const sender = events[i].returnValues.from;
        const recipient = events[i].returnValues.to;

        if (sender !== '0x0000000000000000000000000000000000000000') {
          tokenHolders.add(sender.toLowerCase());
          //console.log(`sender: ${sender.toLowerCase()}`);
        }

        if (recipient !== '0x0000000000000000000000000000000000000000') {
          tokenHolders.add(recipient.toLowerCase());
          //console.log(`recipient: ${recipient.toLowerCase()}`);
        }

      }

    });

  }

   // Loop through the token holders set and print their address and balance
  tokenHolders.forEach( async (address) => {

    const balance = await tokenContract.methods.balanceOf(address).call();

    if (balance > 0) {

      //console.log(`Adding ${address} with a balance of ${balance}`);
      // Print the token holder's address and balance
      //console.log(`Holder: ${holderCount} Address: ${address}, Balance: ${balance} ${tokenSymbol}`);

      var object = {
        address: address,
        balance: balance
      }

      holderInfo.push(object);
      tokenData.holders = holderInfo;
      tokenData.holderTotal = holderInfo.length;

    }

  });

  // Fetch all Transfer events for the token contract

  return true;

}

const getTokenUsingContract = async ( ca ) => {

  await getLatestBlock();

  tokenData.contract = ca;

  await getTokenSymbol( ca ).then( res => {

    tokenData.symbol = res;

  }).catch(err => {

    console.log(err);

  });

  await getTokenName( ca ).then( res => {

    tokenData.name = res;

  }).catch(err => {

    console.log(err);

  });

  await getTokenSupply( ca ).then( res => {

    tokenData.supply = res;

  }).catch(err => {

    console.log(err);

  });

  await getTokenSymbol( ca ).then( res => {

    tokenData.symbol = res;

  }).catch(err => {

    console.log(err);

  });

  await getTokenPair( ca ).then( res => {

    tokenData.pair.address = res;

  }).catch(err => {

    console.log(err);

  });

  await getTokenPairDetail( ca );

  await getTokenPrice( ca ).then( priceUSD => {

    tokenData.priceUSD = priceUSD;

  }).catch ( err => {

    console.error(err);

  });

  await getTokenTotalLiquidity( ca ).then( res => {

    tokenData.totalLiquidity = res / 10000000000;

  }).catch(err => {

    console.log(err);

  });

  await getHolders( ca ).then( res => {

    //console.log(res);

  }).catch(err => {

    console.log(err);

  });

  // Call the getEthPrice function and print the result to the console
  await getEthPrice().then((ethPrice) => {

    tokenData.ethUSD = ethPrice;
    //console.log(`ETH price in USD: $${ethPrice}`);

  }).catch((err) => {

    console.error(err);

  });

  return tokenData;

}

// getTokenUsingContract( '0x1E8Cc81Cdf99C060c3CA646394402b5249B3D3a0' ).then( res => {

//   console.log(JSON.stringify(tokenData));
//   //console.log(`token data sampled successfully`);

// }).catch(err => {

//   console.log(err);

// });

// getTokenUsingContract( '0x24b20da7a2fa0d1d5afcd693e1c8afff20507efd' ).then( res => {

//   console.log(res);
//   //console.log(`token data sampled successfully`);

// }).catch(err => {

//   console.log(err);

// });

//const token = new ERC20Token('0x1E8Cc81Cdf99C060c3CA646394402b5249B3D3a0');
//const token = new ERC20Token('0xdadb4ae5b5d3099dd1f586f990b845f2404a1c4c');
//token.Poll();

//console.log(`token name : ${token.name}`);
Card("card");
