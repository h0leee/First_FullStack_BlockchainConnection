import { ethers } from "./ethers-5.6.esm.min.js";
import { abi, contractAddress } from "./constants.js";
const connectButton = document.getElementById("connectButton");
const fundButton = document.getElementById("fundButton");
const getBalanceButton = document.getElementById("getBalance");
const withdrawButton = document.getElementById("withdrawButton");
connectButton.onclick = connect;
fundButton.onclick = fund;
getBalanceButton.onclick = getbalance;
withdrawButton.onclick = withdraw;

async function connect() {
  // com async smp q damos refresh n pergunta s queremos conectar metamask pq temos de chamar a função connect
  if (typeof window.ethereum !== "undefined") {
    try {
      await ethereum.request({ method: "eth_requestAccounts" });
    } catch (error) {
      console.log(error);
    }
    connectButton.innerHTML = "Connected";
    const accounts = await ethereum.request({ method: "eth_accounts" });
    console.log(accounts);
  } else {
    connectButton.innerHTML = "Please install MetaMask";
  }
}

async function fund() {
  const ethAmount = document.getElementById("ethAmount").value;
  console.log(`Funding with ${ethAmount} ETH...`);
  if (typeof window.ethereum !== "undefined") {
    //WHAT IS NEEDED
    //provider(connection to the blockchain), signer(wallet, someone with gas), contract(ABI, Address)
    const provider = new ethers.providers.Web3Provider(window.ethereum); // esta linha olha para a metamask e é do tipo: 'Ah!! Encontrei o URL dentro de metamask! Isso vai ser oq vamos usar como provider'
    // A Provider is an abstraction of a connection to the Ethereum network, providing a concise, consistent interface to standard Ethereum node functionality.
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const TransactionResponse = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      });
      await listenForTransactionMine(TransactionResponse, provider);
      console.log("Done!");
    } catch (error) {
      // if error, this piece of code executes
      console.log(error);
    }
  }
}

// não é async propositadamente
// we need to create a listener for the blockchain, mas ele tem de esperar que a transação acabe
// provider.once só executa qnd o primeiro parâmetro acontecer, daí que não preciso de await
// se não houvesse promise o output da linha 40 seria colocado na consola primeiro do que a linha 57 porque aquilo é um listener, continua a correr, mas vai checkando periodicamente se já foi triggered mesmo depois de executar

function listenForTransactionMine(TransactionResponse, provider) {
  console.log(`Mining ${TransactionResponse.hash}...`);
  return new Promise((resolve, reject) => {
    provider.once(TransactionResponse.hash, (TransactionReceipt) => {
      console.log(
        `Completed with ${TransactionReceipt.confirmations} confirmations!`
      );
      resolve();
    });
  });
}

async function getbalance() {
  if (typeof window.ethereum != "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balance = await provider.getBalance(contractAddress);
    console.log(ethers.utils.formatEther(balance));
  }
}

async function withdraw() {
  if (typeof window.ethereum != "undefined") {
    console.log("Withdrawing...");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const TransactionResponse = await contract.withdraw();
      await listenForTransactionMine(TransactionResponse, provider);
      console.log('Funds withdrawed successfully!')
    } catch (error) {
      console.log(error);
    }
  }
}
