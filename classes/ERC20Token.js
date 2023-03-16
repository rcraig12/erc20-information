const Web3 = require('web3');

// Standard ERC20 ABI for all compatible contracts
const tokenABI = require('../ABI/tokenABI.json');

module.exports.ERC20Token = class ERC20Token {

  #contractAddress;
  #contract;
  #web3;

  name;
  symbol;
  totalSupply;
  decimals;

  constructor( contractAddress ){
    this.#contractAddress = contractAddress;
    this.type = 'ERC20Token';
    this.#web3 = new Web3('https://mainnet.infura.io/v3/b6bf7d3508c941499b10025c0776eaf8');
    this.#contract = new this.#web3.eth.Contract( tokenABI, contractAddress );
  }

  Poll = async () => {

    this.name = await this.#contract.methods.name().call();
    this.symbol = await this.#contract.methods.symbol().call();
    this.totalSupply = await this.#contract.methods.totalSupply().call();
    this.decimals = await this.#contract.methods.decimals().call();
    //const owner = await this.#contract.methods.owner().call();

  }

  get name () {
    return ERC20Token.name;
  }

  get symbol(){
    return ERC20Token.symbol;
  }

  get totalSupply(){
    return ERC20Token.totalSupply;
  }

  get decimals(){
    return ERC20Token.decimals;
  }
  
}
